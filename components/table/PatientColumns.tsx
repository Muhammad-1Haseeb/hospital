"use client";

import { ColumnDef } from "@tanstack/react-table";
import Image from "next/image";

import { formatDateTime } from "@/lib/utils";
import { Appointment, Doctor } from "@/types/appwrite.types";

import { StatusBadge } from "../StatusBadge";

export const patientColumns: ColumnDef<Appointment>[] = [
  {
    header: "#",
    cell: ({ row }) => {
      return <p className="text-14-medium ">{row.index + 1}</p>;
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
    accessorKey: "primaryPhysician",
    header: "Doctor",
    cell: ({ row, table }) => {
      const appointment = row.original;
      const doctors = (table.options.meta as any)?.doctors as Doctor[];
      const doctor = doctors?.find(
        (doc) => doc.name === appointment.primaryPhysician
      );

      const displayName = appointment.primaryPhysician.startsWith("Dr.") 
        ? appointment.primaryPhysician 
        : `Dr. ${appointment.primaryPhysician}`;

      return (
        <div className="flex items-center gap-3">
          <Image
            src={doctor?.imageUrl || "/assets/images/dr-green.png"}
            alt="doctor"
            width={100}
            height={100}
            className="size-8 rounded-full"
          />
          <p className="whitespace-nowrap">{displayName}</p>
        </div>
      );
    },
  },
  {
    accessorKey: "reason",
    header: "Reason",
    cell: ({ row }) => {
      return <p className="text-14-medium ">{row.original.reason}</p>;
    },
  },
];
