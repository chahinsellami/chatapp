"use client";

/**
 * EmptyState Component - Reusable empty state display
 *
 * Features:
 * - Custom icon
 * - Title and description
 * - Optional action button
 * - Centered layout with animations
 */

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import Button from "./Button";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
  };
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-6 text-center"
    >
      <div className="w-20 h-20 rounded-full bg-slate-800/50 flex items-center justify-center mb-6">
        <Icon className="w-10 h-10 text-slate-500" />
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-slate-400 mb-6 max-w-md">{description}</p>
      {action && (
        <Button variant="primary" icon={action.icon} onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </motion.div>
  );
}
