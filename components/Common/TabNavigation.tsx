"use client";

/**
 * TabNavigation Component - Reusable tab navigation
 *
 * Features:
 * - Multiple tabs with icons
 * - Active state styling
 * - Smooth animations
 */

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

export interface Tab {
  id: string;
  label: string;
  icon?: LucideIcon;
}

interface TabNavigationProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export default function TabNavigation({
  tabs,
  activeTab,
  onTabChange,
}: TabNavigationProps) {
  return (
    <div className="flex gap-2 mt-2">
      {tabs.map((tab) => (
        <motion.button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`px-4 py-2 font-semibold rounded-lg transition-all flex items-center gap-2 ${
            activeTab === tab.id
              ? "bg-blue-600 text-white"
              : "text-slate-400 hover:bg-slate-800 hover:text-white"
          }`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {tab.icon && <tab.icon className="w-4 h-4" />}
          {tab.label}
        </motion.button>
      ))}
    </div>
  );
}
