"use client";

/**
 * Input Component - Reusable form input
 *
 * Features:
 * - Text, email, password types
 * - Icon support
 * - Error state
 * - Character counter
 * - Glassmorphism styling
 */

import { InputHTMLAttributes, forwardRef } from "react";
import { LucideIcon } from "lucide-react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: LucideIcon;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon: Icon, className = "", ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-semibold text-slate-300 mb-2">
            {label}
          </label>
        )}
        <div className="relative">
          {Icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <Icon className="w-5 h-5" />
            </div>
          )}
          <input
            ref={ref}
            className={`w-full ${
              Icon ? "pl-10" : "pl-4"
            } pr-4 py-3 bg-slate-800 border ${
              error ? "border-red-500" : "border-slate-700"
            } rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 ${
              error ? "focus:ring-red-500" : "focus:ring-blue-500"
            } transition-all ${className}`}
            {...props}
          />
        </div>
        {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
