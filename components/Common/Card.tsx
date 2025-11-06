"use client";

/**
 * Card Component - Reusable glassmorphism card
 *
 * Features:
 * - Glassmorphism effect
 * - Hover animations
 * - Optional padding variants
 * - Click handler support
 */

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  padding?: "none" | "sm" | "md" | "lg";
  hover?: boolean;
  onClick?: () => void;
  className?: string;
}

const paddingStyles = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

export default function Card({
  children,
  padding = "md",
  hover = false,
  onClick,
  className = "",
}: CardProps) {
  const Component = onClick ? motion.button : motion.div;

  return (
    <Component
      className={`glass-card rounded-2xl ${
        paddingStyles[padding]
      } ${className} ${onClick ? "cursor-pointer w-full text-left" : ""}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={hover || onClick ? { scale: 1.02 } : {}}
      whileTap={onClick ? { scale: 0.98 } : {}}
      onClick={onClick}
    >
      {children}
    </Component>
  );
}
