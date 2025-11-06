"use client";

/**
 * NavigationBar Component - Top navigation bar for authenticated pages
 *
 * Features:
 * - WebChat branding
 * - Navigation buttons (Settings, Messages, Logout)
 * - Sticky positioning
 * - Glassmorphism design
 */

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { User, MessageCircle, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface NavigationBarProps {
  currentPage?: "profile" | "settings" | "messenger";
}

export default function NavigationBar({ currentPage }: NavigationBarProps) {
  const router = useRouter();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-md border-b border-slate-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
        <h1 className="text-xl font-bold text-white">WebChat</h1>
        <div className="flex gap-3">
          <motion.button
            onClick={() => router.push("/settings")}
            className={`px-4 py-2 ${
              currentPage === "settings"
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-slate-700 hover:bg-slate-600"
            } text-white rounded-lg font-medium flex items-center gap-2`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <User className="w-4 h-4" />
            Settings
          </motion.button>

          <motion.button
            onClick={() => router.push("/messenger")}
            className={`px-4 py-2 ${
              currentPage === "messenger"
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-blue-600 hover:bg-blue-700"
            } text-white rounded-lg font-medium flex items-center gap-2`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <MessageCircle className="w-4 h-4" />
            Messages
          </motion.button>

          <motion.button
            onClick={handleLogout}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <LogOut className="w-4 h-4" />
            Logout
          </motion.button>
        </div>
      </div>
    </div>
  );
}
