"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
 
import { SelectItem } from "@/components/ui/select";
import { APPOINTMENT_STATUS } from "@/constants";
import {
  createAppointment,
  updateAppointment,
} from "@/lib/actions/appointment.actions";
import { getAppointmentSchema } from "@/lib/validation";
import { Appointment, Doctor } from "@/types/appwrite.types";

import "react-datepicker/dist/react-datepicker.css";

import CustomFormField, { FormFieldType } from "../CustomFormField";
import SubmitButton from "../SubmitButton";
import { Form } from "../ui/form";

import { ProgressBar } from "../ProgressBar";

export const AppointmentForm = ({
  userId,
  patientId,
  type = "create",
  appointment,
  setOpen,
  doctors,
}: {
  userId: string;
  patientId: string;
  type: "create" | "schedule" | "cancel";
  appointment?: Appointment;
  setOpen?: Dispatch<SetStateAction<boolean>>;
  doctors: Doctor[];
}) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const AppointmentFormValidation = getAppointmentSchema(type);

  const form = useForm<z.infer<typeof AppointmentFormValidation>>({
    resolver: zodResolver(AppointmentFormValidation),
    defaultValues: {
      primaryPhysician: appointment ? appointment?.primaryPhysician : "",
      doctorId: appointment ? appointment?.doctorId : "",
      schedule: appointment
        ? new Date(appointment?.schedule!)
        : new Date(Date.now()),
      reason: appointment ? appointment.reason : "",
      note: appointment?.note || "",
      cancellationReason: appointment?.cancellationReason || "",
      doctorAccountMsg: appointment?.doctorAccountMsg || "",
    },
  });

  const onSubmit = async (
    values: z.infer<typeof AppointmentFormValidation>
  ) => {
    setIsLoading(true);

    let status;
    switch (type) {
      case "schedule":
        status = APPOINTMENT_STATUS.SCHEDULE;
        break;
      case "cancel": {
        status = APPOINTMENT_STATUS.CANCELLED;
        // UX Polish: Add confirmation for cancellation
        const confirmed = window.confirm(
          "Are you sure you want to cancel this appointment?"
        );
        if (!confirmed) {
          setIsLoading(false);
          return;
        }
        break;
      }
      default:
        status = APPOINTMENT_STATUS.PENDING;
    }

    try {
      if (type === "create") {
        if (!patientId) {
            alert("Error: Patient record not found. Please complete your registration first.");
            setIsLoading(false);
            return;
        }

        // Find the selected doctor name for primaryPhysician
        const selectedDoctor = doctors.find(doc => doc.$id === values.doctorId);
        const physicianName = selectedDoctor ? selectedDoctor.name : values.primaryPhysician;

        const appointment = {
          userId,
          patient: patientId,
          primaryPhysician: physicianName || "",
          doctorId: values.doctorId,
          schedule: new Date(values.schedule),
          reason: values.reason!,
          status: status as Status,
          note: values.note,
        };

        const result = await createAppointment(appointment);

        if (result.success) {
          form.reset();
          router.push(
            `/patients/${userId}/new-appointment/success?appointmentId=${result.data.$id}`
          );
        }
      } else {
        const selectedDoctor = doctors.find(doc => doc.$id === values.doctorId);
        const physicianName = selectedDoctor ? selectedDoctor.name : (appointment?.primaryPhysician || "");

        const appointmentToUpdate = {
          userId,
          appointmentId: appointment?.$id!,
          appointment: {
            primaryPhysician: physicianName,
            doctorId: values.doctorId,
            schedule: new Date(values.schedule),
            status: status as Status,
            cancellationReason: values.cancellationReason,
          },
          type,
          doctorAccountMsg: values.doctorAccountMsg,
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        };

        const result = await updateAppointment(appointmentToUpdate);

        if (result.success) {
          setOpen && setOpen(false);
          form.reset();
        } else {
            alert(result.error || "Failed to update appointment");
        }
      }
    } catch (error: any) {
      console.log(error);
      alert(error.message || "An unexpected error occurred");
    }
    setIsLoading(false);
  };

  let buttonLabel;
  switch (type) {
    case "cancel":
      buttonLabel = "Cancel Appointment";
      break;
    case "schedule":
      buttonLabel = "Schedule Appointment";
      break;
    default:
      buttonLabel = "Submit Appointment";
  }

  return (
    <Form {...form}>
      <ProgressBar isLoading={isLoading} />
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 space-y-6">
        {type === "create" && (
          <section className="mb-12 space-y-4">
            <h1 className="header">New Appointment</h1>
            <p className="text-dark-700">
              Request a new appointment in 10 seconds.
            </p>
          </section>
        )}

        {type !== "cancel" && (
          <>
            <CustomFormField
              fieldType={FormFieldType.SELECT}
              control={form.control}
              name="doctorId" // Changed from primaryPhysician to doctorId
              label="Doctor"
              placeholder="Select a doctor"
            >
              {doctors.map((doctor, i) => (
                <SelectItem 
                  key={doctor.$id + i} 
                  value={doctor.$id} // Value is now the ID
                >
                  <div className="flex cursor-pointer items-center gap-2">
                    <Image
                      src={doctor.imageUrl || "/assets/images/dr-green.png"}
                      width={32}
                      height={32}
                      alt="doctor"
                      className="rounded-full border border-dark-500"
                    />
                    <p>{doctor.name}</p>
                  </div>
                </SelectItem>
              ))}
            </CustomFormField>

            <CustomFormField
              fieldType={FormFieldType.DATE_PICKER}
              control={form.control}
              name="schedule"
              label="Expected appointment date"
              showTimeSelect
              dateFormat="MM/dd/yyyy  -  h:mm aa"
            />

            <div
              className={`flex flex-col gap-6  ${type === "create" && "xl:flex-row"}`}
            >
              <CustomFormField
                fieldType={FormFieldType.TEXTAREA}
                control={form.control}
                name="reason"
                label="Appointment reason"
                placeholder="Annual montly check-up"
                disabled={type === "schedule"}
              />

              <CustomFormField
                fieldType={FormFieldType.TEXTAREA}
                control={form.control}
                name="note"
                label="Comments/notes"
                placeholder="Prefer afternoon appointments, if possible"
                disabled={type === "schedule"}
              />
            </div>
          </>
        )}

        {type === "cancel" && (
          <CustomFormField
            fieldType={FormFieldType.TEXTAREA}
            control={form.control}
            name="cancellationReason"
            label="Reason for cancellation"
            placeholder="Urgent meeting came up"
          />
        )}

        {type !== "create" && (
          <CustomFormField
            fieldType={FormFieldType.TEXTAREA}
            control={form.control}
            name="doctorAccountMsg"
            label="Message to Patient (Optional)"
            placeholder="e.g. Please bring your previous reports."
          />
        )}

        <SubmitButton
          isLoading={isLoading}
          className={`${type === "cancel" ? "shad-danger-btn" : "shad-primary-btn"} w-full`}
        >
          {buttonLabel}
        </SubmitButton>
      </form>
    </Form>
  );
};
