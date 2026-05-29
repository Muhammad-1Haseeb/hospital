"use client";

import { RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { restorePatient } from "@/lib/actions/patient.actions";

export const RestoreButton = ({ patientId }: { patientId: string }) => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const onRestore = async () => {
    setIsLoading(true);
    try {
      const result = await restorePatient(patientId);
      if (result.success) {
        router.refresh();
      } else {
        alert("Failed to restore patient");
      }
    } catch (error) {
      console.error(error);
    }
    setIsLoading(false);
  };

  return (
    <Button
      variant="ghost"
      className="text-green-500 hover:text-green-600 gap-2"
      onClick={onRestore}
      disabled={isLoading}
    >
      <RotateCcw size={16} />
      {isLoading ? "Restoring..." : "Restore"}
    </Button>
  );
};
