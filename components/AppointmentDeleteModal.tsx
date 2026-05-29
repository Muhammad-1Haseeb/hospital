"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { deleteAppointment } from "@/lib/actions/appointment.actions";

export const AppointmentDeleteModal = ({ appointmentId }: { appointmentId: string }) => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const onDelete = async () => {
    setIsLoading(true);
    try {
      const result = await deleteAppointment(appointmentId);
      if (result.success) {
        router.refresh();
      } else {
        alert("Failed to delete appointment");
      }
    } catch (error) {
      console.error(error);
    }
    setIsLoading(false);
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" className="text-red-500 hover:text-red-600 p-2 ml-2">
          <Trash2 size={18} />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="shad-dialog">
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Appointment?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the appointment from the system.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="shad-secondary-btn border-none">Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onDelete}
            className="bg-red-500 text-dark-700 hover:bg-red-600 border-none"
            disabled={isLoading}
          >
            {isLoading ? "Deleting..." : "Confirm Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
