"use client";

import clsx from "clsx";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";

import { APPOINTMENT_STATUS } from "@/constants";

export const StatusFilter = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const currentStatus = searchParams.get("status") || "";
  const [isPending, startTransition] = useTransition();
  const [pendingStatus, setPendingStatus] = useState<string | null>(null);

  const setStatus = (status: string) => {
    setPendingStatus(status);
    startTransition(() => {
      const params = new URLSearchParams(searchParams);
      if (status) {
        params.set("status", status);
      } else {
        params.delete("status");
      }
      params.set("page", "1");
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    });
  };

  const statuses = [
    { label: "All", value: "" },
    { label: "Pending", value: APPOINTMENT_STATUS.PENDING },
    { label: "Scheduled", value: APPOINTMENT_STATUS.SCHEDULE },
    { label: "Cancelled", value: APPOINTMENT_STATUS.CANCELLED },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2">
      {statuses.map((s) => (
        <button
          key={s.value}
          disabled={isPending}
          onClick={() => setStatus(s.value)}
          className={clsx(
            "px-4 py-2 text-14-medium rounded-full transition-all border relative overflow-hidden",
            currentStatus === s.value
              ? "bg-green-500 text-dark-700 border-green-500 shadow-lg shadow-green-500/20"
              : "bg-dark-400 text-dark-700 border-dark-500 hover:text-dark-700 hover:border-dark-600",
            isPending && pendingStatus === s.value && "opacity-70 cursor-not-allowed"
          )}
        >
          <span className={clsx(
            "flex items-center gap-2",
            isPending && pendingStatus === s.value && "animate-pulse"
          )}>
            {s.label}
          </span>
        </button>
      ))}
    </div>
  );
};
