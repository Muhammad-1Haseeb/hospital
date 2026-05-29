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
import { deleteAllAppointments } from "@/lib/actions/appointment.actions";

export const ClearAllAppointmentsButton = () => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const onClearAll = async () => {
    setIsLoading(true);
    try {
      const result = await deleteAllAppointments();
      if (result.success) {
        router.refresh();
      } else {
        alert("Failed to clear appointments");
      }
    } catch (error) {
      console.error(error);
    }
    setIsLoading(false);
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" className="text-red-500 hover:text-red-600 border-red-500/20 hover:bg-red-500/10">
          <Trash2 className="mr-2" size={18} />
          Clear All Appointments
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="shad-dialog border-red-500/20">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-red-500">Warning: Critical Action</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete **ALL** appointments in the system. This action is intended for cleaning up test data and cannot be reversed.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="shad-secondary-btn border-none">Keep Data</AlertDialogCancel>
          <AlertDialogAction
            onClick={onClearAll}
            className="bg-red-500 text-dark-700 hover:bg-red-600 border-none"
            disabled={isLoading}
          >
            {isLoading ? "Purging..." : "Yes, Purge Everything"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
