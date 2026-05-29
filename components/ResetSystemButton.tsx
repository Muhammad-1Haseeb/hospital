"use client";

import { RefreshCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

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
import { deleteAllPatients } from "@/lib/actions/patient.actions";

export const ResetSystemButton = () => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const onReset = async () => {
    setIsLoading(true);
    try {
      // 1. Delete all appointments first
      await deleteAllAppointments();
      // 2. Delete all patients and their files
      const result = await deleteAllPatients();
      
      if (result.success) {
        alert("System Reset Complete: All patients, appointments, and files have been purged.");
        router.refresh();
      } else {
        alert("Partial Reset: Some data could not be removed.");
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred during system reset.");
    }
    setIsLoading(false);
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" className="text-red-500 hover:text-red-600 border-red-500/50 hover:bg-red-500/10">
          <RefreshCcw className="mr-2" size={18} />
          Reset Entire System
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="shad-dialog border-red-500/20">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-red-500">Atomic Reset: Delete All Data?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently remove **ALL** patient profiles, identification files, and appointment records. This is only recommended for development cleanup.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="shad-secondary-btn border-none">Keep Everything</AlertDialogCancel>
          <AlertDialogAction
            onClick={onReset}
            className="bg-red-500 text-dark-700 hover:bg-red-600 border-none"
            disabled={isLoading}
          >
            {isLoading ? "Purging All Data..." : "Yes, Purge All"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
