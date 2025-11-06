"use client";

/**
 * StatusSelector Component - Reusable status selection grid
 *
 * Features:
 * - Visual status options
 * - Active state styling
 * - Click animations
 * - Customizable options
 */

import { motion } from "framer-motion";

export interface StatusOption {
  value: string;
  label: string;
  icon: string;
  color: string;
}

interface StatusSelectorProps {
  options: StatusOption[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
}

export default function StatusSelector({
  options,
  value,
  onChange,
  label,
}: StatusSelectorProps) {
  return (
    <div>
      {label && (
        <label className="block text-sm font-semibold text-slate-300 mb-4">
          {label}
        </label>
      )}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {options.map((option) => (
          <motion.button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={`p-4 rounded-xl border transition-all ${
              value === option.value
                ? "border-blue-500 bg-blue-500/20"
                : "border-transparent hover:bg-slate-700/50"
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="text-2xl mb-2">{option.icon}</div>
            <p
              className={`text-sm font-medium ${
                value === option.value ? "text-white" : "text-slate-400"
              }`}
            >
              {option.label}
            </p>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
