
"use client";
import Image from "next/image";

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
      <div className="relative h-48 rounded-xl overflow-hidden bg-slate-800/50 flex items-center justify-center border border-slate-700/50">
        {preview ? (
          <>
            <Image
              src={preview}
              alt="Preview"
              className="w-full h-full object-cover"
              width={192}
              height={192}
            />
            {onRemove && (
              <motion.button
                onClick={onRemove}
                type="button"
                className="absolute top-2 right-2 p-2 bg-red-500/80 hover:bg-red-500 rounded-full"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="w-4 h-4 text-white" />
              </motion.button>
            )}
          </>
        ) : (
          <label
            htmlFor={id}
            className="cursor-pointer text-center p-8 w-full h-full flex flex-col items-center justify-center hover:bg-slate-700/30 transition-colors"
          >
            <Upload className="w-12 h-12 mx-auto mb-2 text-blue-400" />
            <p className="text-sm text-slate-400">{placeholder}</p>
            <p className="text-xs text-slate-500 mt-2">Click to upload</p>
          </label>
        )}
      </div>
      <input
        type="file"
        accept={accept}
        onChange={onUpload}
        className="hidden"
        id={id}
      />
      {!preview && (
        <motion.button
          onClick={() => document.getElementById(id)?.click()}
          type="button"
          className="w-full mt-3 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Upload className="w-4 h-4" />
          Upload Image
        </motion.button>
      )}
    </div>
  );
}
