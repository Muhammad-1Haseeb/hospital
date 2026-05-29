"use client";

import { ColumnDef } from "@tanstack/react-table";
import Image from "next/image";

import { formatDateTime } from "@/lib/utils";
import { Appointment, Doctor } from "@/types/appwrite.types";

import { AppointmentDeleteModal } from "../AppointmentDeleteModal";
import { AppointmentModal } from "../AppointmentModal";
import { StatusBadge } from "../StatusBadge";

export const columns: ColumnDef<Appointment>[] = [
  {
    header: "#",
    cell: ({ row }) => {
      return <p className="text-14-medium ">{row.index + 1}</p>;
    },
  },
  {
    accessorKey: "patient",
    header: "Patient",
    cell: ({ row }) => {
      const appointment = row.original;
      return <p className="text-14-medium ">{appointment.patient.name}</p>;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const appointment = row.original;
      return (
        <div className="min-w-[115px]">
          <StatusBadge status={appointment.status} />
        </div>
      );
    },
  },
  {
    accessorKey: "schedule",
    header: "Appointment",
    cell: ({ row }) => {
      const appointment = row.original;
      return (
        <p className="text-14-regular min-w-[100px]">
          {formatDateTime(appointment.schedule).dateTime}
        </p>
      );
    },
  },
  {
    accessorKey: "primaryPhysician",
    header: "Doctor",
    cell: ({ row, table }) => {
      const appointment = row.original;
      const doctors = (table.options.meta as any)?.doctors as Doctor[];

      const doctor = doctors?.find(
        (doc) => doc.name === appointment.primaryPhysician
      );

      return (
        <div className="flex items-center gap-3">
          <Image
            src={doctor?.imageUrl || "/assets/images/dr-green.png"}
            alt="doctor"
            width={100}
            height={100}
            className="size-8 rounded-full"
          />
          <p className="whitespace-nowrap">
            {appointment.primaryPhysician.startsWith("Dr.") 
              ? appointment.primaryPhysician 
              : `Dr. ${appointment.primaryPhysician}`}
          </p>
        </div>
      );
    },
  },
  {
    id: "actions",
    header: () => <div className="pl-4">Actions</div>,
    cell: ({ row, table }) => {
      const appointment = row.original;
      const doctors = (table.options.meta as any)?.doctors as Doctor[];

      return (
        <div className="flex items-center gap-1">
          <AppointmentModal
            patientId={appointment.patient.$id}
            userId={appointment.userId}
            appointment={appointment}
            type="schedule"
            title="Schedule Appointment"
            description="Please confirm the following details to schedule."
            doctors={doctors}
          />
          <AppointmentModal
            patientId={appointment.patient.$id}
            userId={appointment.userId}
            appointment={appointment}
            type="cancel"
            title="Cancel Appointment"
            description="Are you sure you want to cancel your appointment?"
            doctors={doctors}
          />
          <AppointmentDeleteModal appointmentId={appointment.$id} />
        </div>
      );
    },
  },
];
