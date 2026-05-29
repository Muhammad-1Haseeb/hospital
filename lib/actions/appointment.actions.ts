"use server";

import * as Sentry from "@sentry/nextjs";
import { revalidatePath } from "next/cache";
import { ID, Query } from "node-appwrite";

import { APPOINTMENT_STATUS } from "@/constants";
import { ActionResult } from "@/types/actions.types";
import {
  CreateAppointmentParams,
  UpdateAppointmentParams,
} from "@/types/appointment.types";
import { Appointment } from "@/types/appwrite.types";

import {
  APPOINTMENT_COLLECTION_ID,
  DATABASE_ID,
  PATIENT_COLLECTION_ID,
  databases,
  users,
} from "../appwrite.config";
import { siteConfig } from "../siteConfig";
import { formatDateTime, parseStringify } from "../utils";

import { getDoctors } from "./doctor.actions";
import { sendEmailNotification } from "./email.actions";

//  CREATE APPOINTMENT
export const createAppointment = async (
  appointment: CreateAppointmentParams
): Promise<ActionResult<Appointment>> => {
  try {
    const newAppointment = await databases.createDocument(
      DATABASE_ID!,
      APPOINTMENT_COLLECTION_ID!,
      ID.unique(),
      appointment
    );

    revalidatePath("/admin");
    revalidatePath("/admin/staff");

    // NEW: SEND INITIAL EMAIL
    const emailMessage = `Your appointment has been successfully created with Dr. ${appointment.primaryPhysician} for ${formatDateTime(appointment.schedule, "UTC").dateTime}. You will receive a separate confirmation email once your appointment is reviewed and scheduled by our medical staff. Thank you for choosing ${siteConfig.name}.`;
    
    await sendNotification(appointment.userId, emailMessage);

    // Activity Logging
    Sentry.addBreadcrumb({
      category: "appointment",
      message: `New appointment created for user ${appointment.userId}`,
      level: "info",
    });

    return { success: true, data: parseStringify(newAppointment) };
  } catch (error) {
    console.error("An error occurred while creating a new appointment:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create appointment",
    };
  }
};

//  GET RECENT APPOINTMENTS (Scalable Native Queries)
export const getRecentAppointmentList = async ({
  limit = 10,
  offset = 0,
  search = "",
  status = "",
}: {
  limit?: number;
  offset?: number;
  search?: string;
  status?: string;
} = {}) => {
  try {
    const queries = [Query.orderDesc("$createdAt")];

    if (status) queries.push(Query.equal("status", [status]));

    if (search) {
      try {
        const normalizedSearch = search.toLowerCase().trim();
        const patientsResponse = await databases.listDocuments(
          DATABASE_ID!,
          PATIENT_COLLECTION_ID!,
          [Query.search("name", normalizedSearch), Query.limit(50)]
        );

        if (patientsResponse.documents.length > 0) {
          const foundPatientIds = patientsResponse.documents.map((p) => p.$id);
          queries.push(Query.equal("patient", foundPatientIds));
        } else {
          const allDocs = await getDoctors();
          const matchedDoctorNames = allDocs
            .filter((doc: any) =>
              doc.name.toLowerCase().includes(normalizedSearch)
            )
            .map((doc: any) => doc.name);

          if (matchedDoctorNames.length > 0) {
            queries.push(Query.equal("primaryPhysician", matchedDoctorNames));
          }
        }
      } catch (searchError: any) {
        console.warn("Search error:", searchError.message);
      }
    }

    const appointments = await databases.listDocuments(
      DATABASE_ID!,
      APPOINTMENT_COLLECTION_ID!,
      [...queries, Query.limit(limit), Query.offset(offset)]
    );

    const [scheduled, pending, cancelled] = await Promise.all([
      databases.listDocuments(DATABASE_ID!, APPOINTMENT_COLLECTION_ID!, [
        Query.equal("status", [APPOINTMENT_STATUS.SCHEDULE]),
        Query.limit(1),
      ]),
      databases.listDocuments(DATABASE_ID!, APPOINTMENT_COLLECTION_ID!, [
        Query.equal("status", [APPOINTMENT_STATUS.PENDING]),
        Query.limit(1),
      ]),
      databases.listDocuments(DATABASE_ID!, APPOINTMENT_COLLECTION_ID!, [
        Query.equal("status", [APPOINTMENT_STATUS.CANCELLED]),
        Query.limit(1),
      ]),
    ]);

    const data = {
      totalCount: appointments.total,
      scheduledCount: scheduled.total,
      pendingCount: pending.total,
      cancelledCount: cancelled.total,
      documents: appointments.documents,
    };

    return parseStringify(data);
  } catch (error) {
    console.error("Critical error in getRecentAppointmentList:", error);
    return {
      totalCount: 0,
      scheduledCount: 0,
      pendingCount: 0,
      cancelledCount: 0,
      documents: [],
    };
  }
};

//  SEND NOTIFICATION
export const sendNotification = async (userId: string, content: string) => {
  try {
    // Get user's email first
    const user = await users.get(userId);
    const email = user.email;

    if (!email) throw new Error("User email not found");

    await sendEmailNotification(email, content);
    console.log("Email notification sent successfully to:", email);
  } catch (error) {
    console.error("An error occurred while sending email notification:", error);
  }
};

//  UPDATE APPOINTMENT
export const updateAppointment = async ({
  appointmentId,
  userId,
  timeZone,
  appointment,
  type,
  doctorAccountMsg, // NEW: Doctor's custom message
}: UpdateAppointmentParams): Promise<ActionResult<Appointment>> => {
  try {
    const updatedAppointment = (await databases.updateDocument(
      DATABASE_ID!,
      APPOINTMENT_COLLECTION_ID!,
      appointmentId,
      {
        ...appointment,
        doctorAccountMsg, // Save the message
      }
    )) as Appointment;

    if (!updatedAppointment) {
      return { success: false, error: "Appointment not found" };
    }

    const emailMessage = `Greetings from ${siteConfig.name},

${
      type === APPOINTMENT_STATUS.SCHEDULE
        ? `We are pleased to inform you that your appointment with Dr. ${updatedAppointment.primaryPhysician} has been CONFIRMED for ${
            formatDateTime(updatedAppointment.schedule!, timeZone).dateTime
          }.`
        : `We regret to inform you that your appointment scheduled for ${
            formatDateTime(updatedAppointment.schedule!, timeZone).dateTime
          } has been CANCELLED. 

Reason for cancellation: ${updatedAppointment.cancellationReason || "Not specified"}`
    }

${
  doctorAccountMsg
    ? `\nMessage from Dr. ${updatedAppointment.primaryPhysician}: \n"${doctorAccountMsg}"\n`
    : ""
}

You can view your appointment history and current status anytime in the "My Appointments" section of our website.

Thank you for choosing ${siteConfig.name}.`;

    // Activity Logging
    Sentry.addBreadcrumb({
      category: "appointment",
      message: `Appointment ${appointmentId} updated to ${appointment.status} by admin`,
      level: "info",
    });

    // Attempt to send Notification
    try {
      await sendNotification(userId, emailMessage);
    } catch (notificationError: any) {
      console.error("Notification failed:", notificationError);
      // Check for Resend verification error
      if (notificationError?.message?.includes("testing emails")) {
        console.warn("Resend restriction: Can only send to verified owner email.");
      }
    }

    revalidatePath("/admin");
    return { success: true, data: parseStringify(updatedAppointment) };
  } catch (error) {
    console.error("An error occurred while updating an appointment:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to update appointment",
    };
  }
};

// GET APPOINTMENT
export const getAppointment = async (appointmentId: string) => {
  try {
    const appointment = await databases.getDocument(
      DATABASE_ID!,
      APPOINTMENT_COLLECTION_ID!,
      appointmentId
    );

    return parseStringify(appointment);
  } catch (error) {
    console.error(
      "An error occurred while retrieving the existing patient:",
      error
    );
  }
};

// GET MY APPOINTMENTS
export const getMyAppointments = async (userId: string) => {
  try {
    const appointments = await databases.listDocuments(
      DATABASE_ID!,
      APPOINTMENT_COLLECTION_ID!,
      [
        Query.equal("userId", [userId]),
        Query.orderDesc("$createdAt"),
      ]
    );

    return parseStringify(appointments.documents);
  } catch (error) {
    console.error(
      "An error occurred while retrieving your appointments:",
      error
    );
    return null;
  }
};
// DELETE APPOINTMENT
export const deleteAppointment = async (appointmentId: string): Promise<ActionResult<any>> => {
  try {
    await databases.deleteDocument(
      DATABASE_ID!,
      APPOINTMENT_COLLECTION_ID!,
      appointmentId
    );

    revalidatePath("/admin");
    return { success: true, data: null };
  } catch (error) {
    console.error("An error occurred while deleting the appointment:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete appointment",
    };
  }
};

// DELETE ALL APPOINTMENTS (Cleanup)
export const deleteAllAppointments = async (): Promise<ActionResult<any>> => {
  try {
    const appointments = await databases.listDocuments(
      DATABASE_ID!,
      APPOINTMENT_COLLECTION_ID!,
      [Query.limit(100)] // Batch delete for safety
    );

    const deletePromises = appointments.documents.map((app) =>
      databases.deleteDocument(DATABASE_ID!, APPOINTMENT_COLLECTION_ID!, app.$id)
    );

    await Promise.all(deletePromises);

    revalidatePath("/admin");
    return { success: true, data: null };
  } catch (error) {
    console.error("An error occurred while deleting all appointments:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to clean up appointments",
    };
  }
};

// GET DOCTOR APPOINTMENTS
export const getDoctorAppointments = async (doctorId: string) => {
  try {
    const appointments = await databases.listDocuments(
      DATABASE_ID!,
      APPOINTMENT_COLLECTION_ID!,
      [
        Query.equal("doctorId", [doctorId]),
        Query.orderDesc("$createdAt"),
      ]
    );

    return parseStringify(appointments.documents);
  } catch (error) {
    console.error("An error occurred while retrieving doctor appointments:", error);
    return null;
  }
};

// GET DOCTOR STATS (High Performance + Bridge Logic)
export const getDoctorStats = async (doctorId: string, doctorName?: string) => {
  try {
    // 1. Try Native ID Linkage (New System)
    const [total, scheduled, pending, cancelled] = await Promise.all([
      databases.listDocuments(DATABASE_ID!, APPOINTMENT_COLLECTION_ID!, [Query.equal("doctorId", [doctorId]), Query.limit(1)]),
      databases.listDocuments(DATABASE_ID!, APPOINTMENT_COLLECTION_ID!, [Query.equal("doctorId", [doctorId]), Query.equal("status", [APPOINTMENT_STATUS.SCHEDULE]), Query.limit(1)]),
      databases.listDocuments(DATABASE_ID!, APPOINTMENT_COLLECTION_ID!, [Query.equal("doctorId", [doctorId]), Query.equal("status", [APPOINTMENT_STATUS.PENDING]), Query.limit(1)]),
      databases.listDocuments(DATABASE_ID!, APPOINTMENT_COLLECTION_ID!, [Query.equal("doctorId", [doctorId]), Query.equal("status", [APPOINTMENT_STATUS.CANCELLED]), Query.limit(1)]),
    ]);

    // 2. If modern ID linkage shows 0, fallback to legacy Name matching
    if (total.total === 0 && doctorName) {
      console.log(`Stats fallback triggered for Dr. ${doctorName}`);
      const [fTotal, fScheduled, fPending, fCancelled] = await Promise.all([
        databases.listDocuments(DATABASE_ID!, APPOINTMENT_COLLECTION_ID!, [Query.equal("primaryPhysician", [doctorName]), Query.limit(1)]),
        databases.listDocuments(DATABASE_ID!, APPOINTMENT_COLLECTION_ID!, [Query.equal("primaryPhysician", [doctorName]), Query.equal("status", [APPOINTMENT_STATUS.SCHEDULE]), Query.limit(1)]),
        databases.listDocuments(DATABASE_ID!, APPOINTMENT_COLLECTION_ID!, [Query.equal("primaryPhysician", [doctorName]), Query.equal("status", [APPOINTMENT_STATUS.PENDING]), Query.limit(1)]),
        databases.listDocuments(DATABASE_ID!, APPOINTMENT_COLLECTION_ID!, [Query.equal("primaryPhysician", [doctorName]), Query.equal("status", [APPOINTMENT_STATUS.CANCELLED]), Query.limit(1)]),
      ]);
      return {
        total: fTotal.total,
        scheduled: fScheduled.total,
        pending: fPending.total,
        cancelled: fCancelled.total,
      };
    }

    return {
      total: total.total,
      scheduled: scheduled.total,
      pending: pending.total,
      cancelled: cancelled.total,
    };
  } catch (error) {
    console.error("Error retrieving doctor stats:", error);
    return { total: 0, scheduled: 0, pending: 0, cancelled: 0 };
  }
};
