"use server";

import { ID, InputFile, Query } from "node-appwrite";

import { ActionResult } from "@/types/actions.types";

import {
  BUCKET_ID,
  DATABASE_ID,
  DOCTOR_COLLECTION_ID,
  ENDPOINT,
  PROJECT_ID,
  databases,
  storage,
} from "../appwrite.config";
import { parseStringify } from "../utils";

// GET THE ACTIVE MEDICAL STAFF
export const getDoctors = async () => {
  try {
    const doctors = await databases.listDocuments(
      DATABASE_ID!,
      DOCTOR_COLLECTION_ID!,
      [Query.equal("isActive", [true]), Query.orderAsc("name"), Query.limit(100)]
    );

    return parseStringify(doctors.documents);
  } catch (error) {
    console.error("Staff retrieval failed:", error);
    return [];
  }
};

// CREATE DOCTOR
export const createDoctor = async (formData: FormData): Promise<ActionResult<any>> => {
  try {
    const file = formData.get("image") as File;
    const name = formData.get("name") as string;
    const specialization = formData.get("specialization") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const experienceYears = Number(formData.get("experienceYears"));
    const about = formData.get("about") as string;

    let fileId;
    let imageUrl;

    if (file) {
      const inputFile = InputFile.fromBlob(file, file.name);
      const uploadedFile = await storage.createFile(BUCKET_ID!, ID.unique(), inputFile);
      fileId = uploadedFile.$id;
      imageUrl = `${ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${fileId}/view??project=${PROJECT_ID}`;
    }

    const newDoctor = await databases.createDocument(
      DATABASE_ID!,
      DOCTOR_COLLECTION_ID!,
      ID.unique(),
      {
        name,
        specialization,
        experienceYears,
        about,
        email,
        phone,
        imageUrl,
        imageBucketFileId: fileId,
        isActive: true,
      }
    );

    return { success: true, data: parseStringify(newDoctor) };
  } catch (error) {
    console.error("An error occurred while creating a doctor:", error);
    return { success: false, error: "Failed to hire doctor" };
  }
};

// UPDATE DOCTOR
export const updateDoctor = async (doctorId: string, formData: FormData): Promise<ActionResult<any>> => {
  try {
    const file = formData.get("image") as File;
    const name = formData.get("name") as string;
    const specialization = formData.get("specialization") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const experienceYears = Number(formData.get("experienceYears"));
    const about = formData.get("about") as string;
    const isActive = formData.get("isActive") === "true";

    const updateData: any = { 
      name, 
      specialization, 
      experienceYears, 
      about, 
      email, 
      phone, 
      isActive 
    };

    if (file && typeof file !== 'string') {
      const inputFile = InputFile.fromBlob(file, file.name);
      const uploadedFile = await storage.createFile(BUCKET_ID!, ID.unique(), inputFile);
      updateData.imageBucketFileId = uploadedFile.$id;
      updateData.imageUrl = `${ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${uploadedFile.$id}/view??project=${PROJECT_ID}`;
    }

    const updatedDoctor = await databases.updateDocument(
      DATABASE_ID!,
      DOCTOR_COLLECTION_ID!,
      doctorId,
      updateData
    );

    return { success: true, data: parseStringify(updatedDoctor) };
  } catch (error) {
    console.error("An error occurred while updating the doctor:", error);
    return { success: false, error: "Failed to update doctor profile" };
  }
};

// DELETE DOCTOR (Hard Delete)
export const deleteDoctor = async (doctorId: string): Promise<ActionResult<any>> => {
  try {
    const doctor = await databases.getDocument(DATABASE_ID!, DOCTOR_COLLECTION_ID!, doctorId);
    
    if ((doctor as any).imageBucketFileId) {
       await storage.deleteFile(BUCKET_ID!, (doctor as any).imageBucketFileId);
    }

    await databases.deleteDocument(DATABASE_ID!, DOCTOR_COLLECTION_ID!, doctorId);

    return { success: true, data: null };
  } catch (error) {
    console.error("An error occurred while deleting the doctor:", error);
    return { success: false, error: "Failed to delete doctor" };
  }
};
// GET DOCTOR BY ID
export const getDoctorById = async (doctorId: string) => {
  try {
    const doctor = await databases.getDocument(
      DATABASE_ID!,
      DOCTOR_COLLECTION_ID!,
      doctorId
    );

    return parseStringify(doctor);
  } catch (error) {
    console.error("An error occurred while retrieving the doctor details:", error);
    return null;
  }
};
