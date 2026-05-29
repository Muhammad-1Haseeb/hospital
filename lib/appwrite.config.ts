import * as sdk from "node-appwrite";

export const {
  NEXT_PUBLIC_ENDPOINT: ENDPOINT,
  PROJECT_ID,
  API_KEY,
  DATABASE_ID,
  PATIENT_COLLECTION_ID,
  DOCTOR_COLLECTION_ID,
  APPOINTMENT_COLLECTION_ID,
  NEXT_PUBLIC_BUCKET_ID: BUCKET_ID,
} = process.env;

const client = new sdk.Client();

// Production Debugging
if (!ENDPOINT || !PROJECT_ID || !API_KEY) {
  console.error("💥 MISSING APPWRITE ENV VARS:", { 
    endpoint: !!ENDPOINT, 
    project: !!PROJECT_ID, 
    key: !!API_KEY 
  });
}

client.setEndpoint(ENDPOINT!).setProject(PROJECT_ID!).setKey(API_KEY!);

export const databases = new sdk.Databases(client);
export const users = new sdk.Users(client);
export const messaging = new sdk.Messaging(client);
export const storage = new sdk.Storage(client);
export const account = new sdk.Account(client);

// Helper to get current user in Server Actions
// Note: This requires a session to be set on the client. 
// For this guide, we provide the hook as requested.
export const getCurrentUser = async () => {
  try {
    const user = await account.get();
    return user;
  } catch (error) {
    console.log("No active session found");
    return null;
  }
};
