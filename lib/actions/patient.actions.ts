"use server";

import * as Sentry from "@sentry/nextjs";
import { ID, InputFile, Query } from "node-appwrite";

import { ActionResult } from "@/types/actions.types";
import {
  CreateUserParams,
  RegisterUserParams,
  User,
} from "@/types/patient.types";

import {
  APPOINTMENT_COLLECTION_ID,
  BUCKET_ID,
  DATABASE_ID,
  ENDPOINT,
  PATIENT_COLLECTION_ID,
  PROJECT_ID,
  databases,
  storage,
  users,
} from "../appwrite.config";
import { siteConfig } from "../siteConfig";
import { parseStringify } from "../utils";

import { sendEmailNotification } from "./email.actions";

// CREATE APPWRITE USER
export const createUser = async (user: CreateUserParams): Promise<ActionResult<User>> => {
  try {
    const newuser = await users.create(
      ID.unique(),
      user.email,
      user.phone,
      undefined,
      user.name
    );

    return { success: true, data: parseStringify(newuser) };
  } catch (error: any) {
    if (error && error?.code === 409) {
      const existingUserByEmail = await users.list([
        Query.equal("email", [user.email]),
      ]);

      let existingUser = existingUserByEmail.total > 0 ? existingUserByEmail.users[0] : null;

      if (!existingUser) {
        const existingUserByPhone = await users.list([
          Query.equal("phone", [user.phone]),
        ]);
        existingUser = existingUserByPhone.total > 0 ? existingUserByPhone.users[0] : null;
      }

      if (existingUser) {
        // We found an existing user by email or phone. 
        // We attempt to update their name/email to the latest info, but we don't let it crash the app.
        
        try {
          if (existingUser.email !== user.email) {
            await users.updateEmail(existingUser.$id, user.email);
          }
        } catch (e) {
          console.warn("Could not update user email during recovery (likely conflict):", e);
        }

        try {
          await users.updateName(existingUser.$id, user.name);
        } catch (e) {
          console.warn("Could not update user name during recovery:", e);
        }

        // We NO LONGER update the patient record here to prevent overwriting history.
        // The registration page will handle creating a new patient profile if needed.

        // Always return the user ID so the flow can continue to /register or /new-appointment
        return { success: true, data: parseStringify(existingUser) };
      }
    }
    console.error("An error occurred while creating a new user:", error);
    return { success: false, error: error.message || "Failed to create user account" };
  }
};

// GET USER
export const getUser = async (userId: string) => {
  try {
    const user = await users.get(userId);
    return parseStringify(user);
  } catch (error) {
    console.error("An error occurred while retrieving the user details:", error);
    return null;
  }
};

// REGISTER PATIENT
export const registerPatient = async (
  patient: any,
  identificationDocument?: FormData
): Promise<ActionResult<any>> => {
  try {
    let file;
    if (identificationDocument) {
      const inputFile = InputFile.fromBlob(
        identificationDocument?.get("blobFile") as Blob,
        identificationDocument?.get("fileName") as string
      );

      file = await storage.createFile(BUCKET_ID!, ID.unique(), inputFile);
    }

    // Filter out doctorId if it's sent from the form but not in the schema
    const { doctorId: _, ...patientData } = patient as any;

    console.log("📝 Creating patient document in Appwrite...");
    const newPatient = await databases.createDocument(
      DATABASE_ID!,
      PATIENT_COLLECTION_ID!,
      ID.unique(),
      {
        identificationDocumentId: file?.$id ? file.$id : null,
        identificationDocumentUrl: file?.$id
          ? `${ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${file.$id}/view?project=${PROJECT_ID}`
          : null,
        ...patientData,
      }
    );

    // Non-blocking Activity Logging
    try {
        Sentry.addBreadcrumb({
          category: "auth",
          message: `New patient registered: ${patient.name} (User: ${patient.userId})`,
          level: "info",
        });
    } catch (sentryError) {
        console.warn("Sentry logging skipped due to connection issues.");
    }

    // NEW: SEND WELCOME NOTIFICATION (Non-blocking fallback)
    try {
        const emailMessage = `Welcome to ${siteConfig.name}, ${patient.name}! Your patient profile has been successfully registered. You can now request healthcare appointments through our portal. If you have any questions, feel free to contact us.`;
        const user = await users.get(patient.userId);
        if (user.email) {
            await sendEmailNotification(user.email, emailMessage);
        }
    } catch (notifError) {
        console.warn("Welcome notification failed, but registration succeeded.");
    }

    return { success: true, data: parseStringify(newPatient) };
  } catch (error: any) {
    console.error("💥 registerPatient CRITICAL ERROR:", error.message, error.code);
    return { success: false, error: error.message || "Failed to register patient record" };
  }
};

// GET PATIENT
export const getPatient = async (userId: string, name?: string) => {
  try {
    const queries = [Query.equal("userId", [userId]), Query.orderDesc("$createdAt")];

    const patients = await databases.listDocuments(
      DATABASE_ID!,
      PATIENT_COLLECTION_ID!,
      queries
    );

    if (!patients.documents.length) return null;

    let patient = patients.documents[0];

    // Priority 1: If name is provided, try to find a match among this user's profiles
    if (name) {
      const match = patients.documents.find(
        (p) => (p as any).name.toLowerCase() === name.toLowerCase()
      );
      if (match) patient = match;
    }

    return parseStringify(patient);
  } catch (error) {
    console.error("An error occurred while retrieving the patient details:", error);
    return null;
  }
};

// DELETE PATIENT (Soft Delete)
export const deletePatient = async (patientId: string): Promise<ActionResult<any>> => {
  try {
    const updatedPatient = await databases.updateDocument(
      DATABASE_ID!,
      PATIENT_COLLECTION_ID!,
      patientId,
      {
        isDeleted: true,
        deletedAt: new Date().toISOString(),
      }
    );

    Sentry.addBreadcrumb({
      category: "admin",
      message: `Patient deleted: ${patientId}`,
      level: "info",
    });

    return { success: true, data: parseStringify(updatedPatient) };
  } catch (error) {
    console.error("An error occurred while deleting the patient:", error);
    return { success: false, error: "Failed to delete patient" };
  }
};

// RESTORE PATIENT
export const restorePatient = async (patientId: string): Promise<ActionResult<any>> => {
  try {
    const restoredPatient = await databases.updateDocument(
      DATABASE_ID!,
      PATIENT_COLLECTION_ID!,
      patientId,
      {
        isDeleted: false,
        deletedAt: null,
      }
    );

    return { success: true, data: parseStringify(restoredPatient) };
  } catch (error) {
    console.error("An error occurred while restoring the patient:", error);
    return { success: false, error: "Failed to restore patient" };
  }
};

// GET DELETED PATIENTS (Bin)
export const getDeletedPatients = async () => {
  try {
    const patients = await databases.listDocuments(
      DATABASE_ID!,
      PATIENT_COLLECTION_ID!,
      [Query.equal("isDeleted", [true]), Query.orderDesc("deletedAt")]
    );

    // Complement with last appointment status
    const patientsWithStatus = await Promise.all(
      patients.documents.map(async (patient) => {
        const appointments = await databases.listDocuments(
          DATABASE_ID!,
          APPOINTMENT_COLLECTION_ID!,
          [
            Query.equal("userId", [(patient as any).userId]),
            Query.orderDesc("$createdAt"),
            Query.limit(1),
          ]
        );
        const lastAppointment = appointments.documents[0];
        return {
          ...patient,
          lastStatus: lastAppointment ? (lastAppointment as any).status : "N/A",
        };
      })
    );

    return parseStringify(patientsWithStatus);
  } catch (error) {
    console.error("An error occurred while retrieving the deleted patients:", error);
    return null;
  }
};
// UPDATE PATIENT
export const updatePatient = async (
  patientId: string,
  patient: any,
  identificationDocument?: FormData
): Promise<ActionResult<any>> => {
  try {
    let file;
    if (identificationDocument) {
      const inputFile = InputFile.fromBlob(
        identificationDocument?.get("blobFile") as Blob,
        identificationDocument?.get("fileName") as string
      );

      file = await storage.createFile(BUCKET_ID!, ID.unique(), inputFile);
    }

    // Filter out doctorId if it's sent from the form but not in the schema
    const { doctorId: _, ...patientData } = patient as any;

    const updatedData = {
      ...patientData,
      ...(file && {
        identificationDocumentId: file?.$id ? file.$id : null,
        identificationDocumentUrl: file?.$id
          ? `${ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${file.$id}/view?project=${PROJECT_ID}`
          : null,
      }),
    };

    const updatedPatient = await databases.updateDocument(
      DATABASE_ID!,
      PATIENT_COLLECTION_ID!,
      patientId,
      updatedData
    );

    return { success: true, data: parseStringify(updatedPatient) };
  } catch (error) {
    console.error("An error occurred while updating the patient:", error);
    return { success: false, error: "Failed to update patient record" };
  }
};
// HARD DELETE PATIENT (Permanent)
export const hardDeletePatient = async (patientId: string): Promise<ActionResult<any>> => {
  try {
    // 1. Get patient to find document ID
    const patient = (await databases.getDocument(
      DATABASE_ID!,
      PATIENT_COLLECTION_ID!,
      patientId
    )) as any;
    
    // 2. Delete from Storage if exists
    if (patient.identificationDocumentId) {
      try {
        await storage.deleteFile(BUCKET_ID!, patient.identificationDocumentId);
      } catch (storageError) {
        console.warn("Storage file delete failed (may not exist):", storageError);
      }
    }

    // 3. Delete from Database
    await databases.deleteDocument(DATABASE_ID!, PATIENT_COLLECTION_ID!, patientId);

    return { success: true, data: null };
  } catch (error) {
    console.error("An error occurred while hard-deleting the patient:", error);
    return { success: false, error: "Failed to permanently delete patient" };
  }
};

// DELETE ALL PATIENTS (Cleanup)
export const deleteAllPatients = async (): Promise<ActionResult<any>> => {
  try {
    const patients = await databases.listDocuments(
      DATABASE_ID!,
      PATIENT_COLLECTION_ID!,
      [Query.limit(100)]
    );

    const deletePromises = patients.documents.map(async (p) => {
        // We use hardDelete for each to ensure storage is cleaned
        return hardDeletePatient(p.$id);
    });

    await Promise.all(deletePromises);

    return { success: true, data: null };
  } catch (error) {
    console.error("An error occurred while deleting all patients:", error);
    return { success: false, error: "Failed to clean up patients" };
  }
};
