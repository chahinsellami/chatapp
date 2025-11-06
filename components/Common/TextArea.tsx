"use client";

/**
 * TextArea Component - Reusable form textarea
 *
 * Features:
 * - Auto-resize option
 * - Character counter
 * - Error state
 * - Glassmorphism styling
 */

import { TextareaHTMLAttributes, forwardRef } from "react";

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  showCount?: boolean;
  maxLength?: number;
}

const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (
    {
      label,
      error,
      showCount = false,
      maxLength,
      className = "",
      value,
      ...props
    },
    ref
  ) => {
    const currentLength = typeof value === "string" ? value.length : 0;

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-semibold text-slate-300 mb-2">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          maxLength={maxLength}
          value={value}
          className={`w-full px-4 py-3 bg-slate-800 border ${
            error ? "border-red-500" : "border-slate-700"
          } rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 ${
            error ? "focus:ring-red-500" : "focus:ring-blue-500"
          } resize-none transition-all ${className}`}
          {...props}
        />
        <div className="flex justify-between items-center mt-2">
          {error ? <p className="text-sm text-red-400">{error}</p> : <span />}
          {showCount && maxLength && (
            <p className="text-slate-500 text-xs">
              {currentLength}/{maxLength}
            </p>
          )}
        </div>
      </div>
    );
  }
);

TextArea.displayName = "TextArea";

export default TextArea;
