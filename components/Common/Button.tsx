"use client";

/**
 * Button Component - Reusable animated button
 *
 * Features:
 * - Multiple variants (primary, secondary, danger, ghost)
 * - Size variants (sm, md, lg)
 * - Icon support
 * - Loading state
 * - Framer Motion animations
 */

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: LucideIcon;
  iconPosition?: "left" | "right";
  loading?: boolean;
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: "bg-blue-600 hover:bg-blue-700 text-white",
  secondary: "bg-slate-700 hover:bg-slate-600 text-white",
  danger: "bg-red-600 hover:bg-red-700 text-white",
  ghost: "bg-transparent hover:bg-slate-800 text-slate-300 hover:text-white",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-base",
  lg: "px-6 py-3 text-lg",
};

export default function Button({
  variant = "primary",
  size = "md",
  icon: Icon,
  iconPosition = "left",
  loading = false,
  fullWidth = false,
  children,
  className = "",
  disabled,
  onClick,
  ...props
}: ButtonProps) {
  const baseStyles =
    "rounded-lg font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed";
  const widthStyle = fullWidth ? "w-full" : "";

  return (
    <motion.button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyle} ${className}`}
      whileHover={{ scale: disabled || loading ? 1 : 1.05 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.95 }}
      disabled={disabled || loading}
      onClick={onClick}
    >
      {loading ? (
        <>
          <motion.div
            className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          Loading...
        </>
      ) : (
        <>
          {Icon && iconPosition === "left" && <Icon className="w-4 h-4" />}
          {children}
          {Icon && iconPosition === "right" && <Icon className="w-4 h-4" />}
        </>
      )}
    </motion.button>
  );
}
