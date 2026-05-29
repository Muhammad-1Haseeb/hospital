import { Client, Databases, Account } from "appwrite";

export const client = new Client();

const endpoint = process.env.NEXT_PUBLIC_ENDPOINT!;
const projectId = process.env.NEXT_PUBLIC_PROJECT_ID!;

client
  .setEndpoint(endpoint)
  .setProject(projectId);

export const databases = new Databases(client);
export const account = new Account(client);

export const APPOINTMENT_COLLECTION_ID = process.env.NEXT_PUBLIC_APPOINTMENT_COLLECTION_ID!;
export const DATABASE_ID = process.env.NEXT_PUBLIC_DATABASE_ID!;
