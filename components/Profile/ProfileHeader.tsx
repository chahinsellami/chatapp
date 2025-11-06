"use client";

/**
 * ProfileHeader Component - Facebook-style profile header
 *
 * Features:
 * - Cover photo with edit button
 * - Profile picture with status indicator
 * - Username and bio display
 * - Responsive design
 */

import { motion } from "framer-motion";
import { User, Upload } from "lucide-react";

interface ProfileHeaderProps {
  coverImage: string | null;
  customImage: string | null;
  avatar: string;
  username: string;
  bio: string;
  status: string;
  statusColor: string;
  onCoverImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function ProfileHeader({
  coverImage,
  customImage,
  avatar,
  username,
  bio,
  status,
  statusColor,
  onCoverImageChange,
}: ProfileHeaderProps) {
  return (
    <div className="w-full">
      {/* Cover Photo Section */}
      <div className="relative">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative w-full h-[350px] bg-gradient-to-br from-slate-700 via-slate-600 to-slate-700 overflow-hidden"
        >
          {coverImage ? (
            <img
              src={coverImage}
              alt="Cover"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center text-slate-400">
                <Upload className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">No cover photo</p>
              </div>
            </div>
          )}
        </motion.div>

        {/* Profile Picture and Info Section */}
        <div className="max-w-6xl mx-auto px-6">
          <div className="relative">
            {/* Profile Picture and Name - Facebook style */}
            <div className="flex items-end justify-start gap-8 pb-8 border-b border-slate-700">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative -mt-16 -ml-2 md:-ml-6"
              >
                <div className="w-44 h-44 md:w-44 md:h-44 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 overflow-hidden shadow-2xl">
                  {customImage ? (
                    <img
                      src={customImage}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : avatar && !avatar.startsWith("http") ? (
                    <div className="w-full h-full flex items-center justify-center text-7xl">
                      {avatar}
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-20 h-20 text-white" />
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Name and Bio with Status - aligned to the bottom of the avatar */}
              <div className="flex flex-col justify-end pb-6">
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight">
                    {username}
                  </h1>
                  {/* Status Indicator next to name */}
                  <div
                    className="w-4 h-4 rounded-full shadow-lg"
                    style={{
                      backgroundColor: statusColor,
                    }}
                    title={status}
                  />
                </div>
                {bio && <p className="text-slate-300 text-sm mt-1">"{bio}"</p>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
