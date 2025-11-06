"use client";

/**
 * ImageUpload Component - Reusable image upload with preview
 *
 * Features:
 * - Image preview
 * - Remove button
 * - File validation
 * - Drag and drop (future)
 * - Upload progress (future)
 */

import { motion } from "framer-motion";
import { Upload, X } from "lucide-react";

interface ImageUploadProps {
  label?: string;
  preview?: string | null;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove?: () => void;
  accept?: string;
  id: string;
  placeholder?: string;
}

export default function ImageUpload({
  label,
  preview,
  onUpload,
  onRemove,
  accept = "image/*",
  id,
  placeholder = "No image uploaded",
}: ImageUploadProps) {
  return (
    <div>
      {label && (
        <label className="block text-sm font-semibold text-slate-300 mb-3">
          {label}
        </label>
      )}
      <div className="relative h-48 rounded-xl overflow-hidden bg-slate-800 flex items-center justify-center border border-slate-700">
        {preview ? (
          <>
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-cover"
            />
            {onRemove && (
              <motion.button
                onClick={onRemove}
                className="absolute top-2 right-2 p-2 bg-red-500/80 hover:bg-red-500 rounded-full"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="w-4 h-4 text-white" />
              </motion.button>
            )}
          </>
        ) : (
          <div className="text-center text-slate-600">
            <Upload className="w-12 h-12 mx-auto mb-2" />
            <p className="text-sm">{placeholder}</p>
          </div>
        )}
      </div>
      <input
        type="file"
        accept={accept}
        onChange={onUpload}
        className="hidden"
        id={id}
      />
    </div>
  );
}
