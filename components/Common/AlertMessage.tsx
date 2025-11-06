"use client";

/**
 * AlertMessage Component - Reusable alert/notification messages
 *
 * Features:
 * - Success and error variants
 * - Auto-dismiss animation
 * - Icon support
 */

import { motion } from "framer-motion";
import { CheckCircle, AlertCircle } from "lucide-react";

interface AlertMessageProps {
  type: "success" | "error";
  message: string;
}

export default function AlertMessage({ type, message }: AlertMessageProps) {
  const isSuccess = type === "success";

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className={`mb-6 p-4 ${
        isSuccess
          ? "bg-green-500/20 border-green-500/50"
          : "bg-red-500/20 border-red-500/50"
      } border rounded-lg flex items-center gap-3`}
    >
      {isSuccess ? (
        <CheckCircle className="w-5 h-5 text-green-400" />
      ) : (
        <AlertCircle className="w-5 h-5 text-red-400" />
      )}
      <p
        className={`${
          isSuccess ? "text-green-300" : "text-red-300"
        } font-medium`}
      >
        {message}
      </p>
    </motion.div>
  );
}
