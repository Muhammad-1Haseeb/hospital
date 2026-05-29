"use client";

import { motion, AnimatePresence } from "framer-motion";

export const ProgressBar = ({ isLoading }: { isLoading: boolean }) => {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          exit={{ opacity: 0 }}
          transition={{ duration: 15, ease: "easeOut" }} // Slow long progress
          className="fixed top-0 left-0 z-[9999] h-1 bg-green-500 shadow-[0_0_10px_#24AE7C]"
        />
      )}
    </AnimatePresence>
  );
};
