"use client";

import { motion } from "framer-motion";
import clsx from "clsx";
import Image from "next/image";

type StatCardProps = {
  type: "appointments" | "pending" | "cancelled";
  count: number;
  label: string;
  icon: string;
};

export const StatCard = ({ count = 0, label, icon, type }: StatCardProps) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={clsx("stat-card glassmorphism glassmorphism-hover", {
        "bg-appointments/80": type === "appointments",
        "bg-pending/80": type === "pending",
        "bg-cancelled/80": type === "cancelled",
      })}
    >
      <div className="flex items-center gap-4">
        <Image
          src={icon || "/assets/icons/appointments.svg"}
          height={32}
          width={32}
          alt={label}
          className="size-8 w-fit"
        />
        <h2 className="text-32-bold text-dark-700">{count}</h2>
      </div>

      <p className="text-14-regular">{label}</p>
    </motion.div>
  );
};
