"use client";

/**
 * Badge Component - Reusable badge/label
 *
 * Features:
 * - Multiple variants
 * - Size options
 * - Icon support
 * - Dot indicator option
 */

import { LucideIcon } from "lucide-react";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info";
  size?: "sm" | "md" | "lg";
  icon?: LucideIcon;
  dot?: boolean;
  className?: string;
}

const variantStyles = {
  default: "bg-slate-700 text-slate-200",
  success: "bg-green-500/20 text-green-300 border border-green-500/50",
  warning: "bg-yellow-500/20 text-yellow-300 border border-yellow-500/50",
  danger: "bg-red-500/20 text-red-300 border border-red-500/50",
  info: "bg-blue-500/20 text-blue-300 border border-blue-500/50",
};

const sizeStyles = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-3 py-1 text-sm",
  lg: "px-4 py-1.5 text-base",
};

const dotColors = {
  default: "bg-slate-400",
  success: "bg-green-400",
  warning: "bg-yellow-400",
  danger: "bg-red-400",
  info: "bg-blue-400",
};

export default function Badge({
  children,
  variant = "default",
  size = "md",
  icon: Icon,
  dot = false,
  className = "",
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]}`} />
      )}
      {Icon && <Icon className="w-3.5 h-3.5" />}
      {children}
    </span>
  );
}
