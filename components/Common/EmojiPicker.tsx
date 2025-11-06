"use client";

/**
 * EmojiPicker Component - Reusable emoji selection grid
 *
 * Features:
 * - Scrollable emoji grid
 * - Active state
 * - Search/filter support (future)
 * - Click animations
 */

import { motion } from "framer-motion";

interface EmojiPickerProps {
  emojis: string[];
  value: string;
  onChange: (emoji: string) => void;
  label?: string;
  columns?: number;
}

export default function EmojiPicker({
  emojis,
  value,
  onChange,
  label,
  columns = 12,
}: EmojiPickerProps) {
  const gridCols =
    {
      8: "grid-cols-8",
      10: "grid-cols-10",
      12: "grid-cols-12",
      16: "grid-cols-16",
    }[columns] || "grid-cols-12";

  return (
    <div>
      {label && (
        <label className="block text-sm font-semibold text-slate-300 mb-4">
          {label}
        </label>
      )}
      <div
        className={`grid ${gridCols} sm:grid-cols-12 md:grid-cols-16 gap-2 p-4 rounded-xl bg-slate-800/50 border border-slate-700 max-h-64 overflow-y-auto`}
      >
        {emojis.map((emoji) => (
          <motion.button
            key={emoji}
            onClick={() => onChange(emoji)}
            className={`p-3 text-2xl rounded-xl transition-all ${
              value === emoji
                ? "ring-2 ring-blue-500 bg-blue-500/20"
                : "hover:bg-slate-700"
            }`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            {emoji}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
