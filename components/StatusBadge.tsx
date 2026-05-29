"use client";

import { motion } from "framer-motion";
import clsx from "clsx";
import Image from "next/image";

import { APPOINTMENT_STATUS, StatusIcon } from "@/constants";

export const StatusBadge = ({ status }: { status: Status }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05 }}
      className={clsx("status-badge", {
        "bg-green-600/20 border border-green-500/30": status === APPOINTMENT_STATUS.SCHEDULE,
        "bg-blue-600/20 border border-blue-500/30": status === APPOINTMENT_STATUS.PENDING,
        "bg-red-600/20 border border-red-500/30": status === APPOINTMENT_STATUS.CANCELLED,
      })}
    >
      <Image
        src={StatusIcon[status]}
        alt={status}
        width={24}
        height={24}
        className="h-fit w-3"
      />
      <p
        className={clsx("text-12-semibold capitalize", {
          "text-green-500": status === APPOINTMENT_STATUS.SCHEDULE,
          "text-blue-500": status === APPOINTMENT_STATUS.PENDING,
          "text-red-500": status === APPOINTMENT_STATUS.CANCELLED,
        })}
      >
        {status === APPOINTMENT_STATUS.SCHEDULE ? "scheduled" : status}
      </p>
    </motion.div>
  );
};
