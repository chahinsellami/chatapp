"use client";

/**
 * Avatar Component - Reusable avatar display
 *
 * Features:
 * - Multiple sizes
 * - Emoji or image support
 * - Status indicator
 * - Fallback to user icon
 * - Click handler support
 */

import { User } from "lucide-react";

interface AvatarProps {
  src?: string | null;
  emoji?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  status?: {
    color: string;
    position?: "bottom-right" | "top-right";
  };
  onClick?: () => void;
  className?: string;
}

const sizeStyles = {
  xs: "w-8 h-8 text-xl",
  sm: "w-10 h-10 text-2xl",
  md: "w-12 h-12 text-3xl",
  lg: "w-16 h-16 text-4xl",
  xl: "w-20 h-20 text-5xl",
  "2xl": "w-44 h-44 text-7xl",
};

const statusSizes = {
  xs: "w-2 h-2",
  sm: "w-2.5 h-2.5",
  md: "w-3 h-3",
  lg: "w-4 h-4",
  xl: "w-5 h-5",
  "2xl": "w-9 h-9",
};

const statusPositions = {
  "bottom-right": "bottom-0 right-0",
  "top-right": "top-0 right-0",
};

export default function Avatar({
  src,
  emoji,
  size = "md",
  status,
  onClick,
  className = "",
}: AvatarProps) {
  return (
    <div
      className={`relative ${onClick ? "cursor-pointer" : ""} ${className}`}
      onClick={onClick}
    >
      <div
        className={`${sizeStyles[size]} rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 overflow-hidden shadow-lg flex items-center justify-center`}
      >
        {src ? (
          <img src={src} alt="Avatar" className="w-full h-full object-cover" />
        ) : emoji ? (
          <span>{emoji}</span>
        ) : (
          <User className="w-1/2 h-1/2 text-white" />
        )}
      </div>

      {status && (
        <div
          className={`absolute ${
            statusPositions[status.position || "bottom-right"]
          } ${statusSizes[size]} rounded-full shadow-lg`}
          style={{ backgroundColor: status.color }}
        />
      )}
    </div>
  );
}
