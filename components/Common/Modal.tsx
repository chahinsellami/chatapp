"use client";

/**
 * Modal Component - Reusable modal dialog
 *
 * Features:
 * - Backdrop with blur
 * - Animation entrance/exit
 * - Close on backdrop click
 * - ESC key support
 * - Custom header and footer
 */

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { ReactNode, useEffect } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}

const sizeStyles = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
};

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = "md",
}: ModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={`glass-card rounded-2xl shadow-2xl ${sizeStyles[size]} w-full pointer-events-auto`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              {title && (
                <div className="flex items-center justify-between p-6 border-b border-slate-700">
                  <h2 className="text-2xl font-bold text-white">{title}</h2>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-slate-400" />
                  </button>
                </div>
              )}

              {/* Body */}
              <div className="p-6">{children}</div>

              {/* Footer */}
              {footer && (
                <div className="p-6 border-t border-slate-700">{footer}</div>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
