import { APPOINTMENT_STATUS } from "@/constants";

import { Appointment } from "./appwrite.types";


export type Status = (typeof APPOINTMENT_STATUS)[keyof typeof APPOINTMENT_STATUS];

export type CreateAppointmentParams = {
  userId: string;
  patient: string;
  primaryPhysician: string;
  reason: string;
  schedule: Date;
  status: Status;
  note: string | undefined;
};

export type UpdateAppointmentParams = {
  appointmentId: string;
  userId: string;
  timeZone: string;
  appointment: Partial<Appointment>;
  type: string;
  doctorAccountMsg?: string;
};
