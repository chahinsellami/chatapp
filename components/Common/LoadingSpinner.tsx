"use client";

/**
 * LoadingSpinner Component - Reusable loading state
 *
 * Features:
 * - Animated spinner
 * - Custom loading message
 * - Centered layout
 */

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface LoadingSpinnerProps {
  icon?: LucideIcon;
  message?: string;
}

export default function LoadingSpinner({
  icon: Icon,
  message = "Loading...",
}: LoadingSpinnerProps) {
  return (
    <div className="min-h-screen flex items-center justify-center floating-particles bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <motion.div
        className="text-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <motion.div
          className="w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center shadow-2xl"
          style={{
            background: "linear-gradient(135deg, #3b82f6, #6366f1)",
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          {Icon && <Icon className="w-10 h-10 text-white" />}
        </motion.div>
        <motion.p
          className="text-white text-xl font-semibold"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          {message}
        </motion.p>
      </motion.div>
    </div>
  );
}
