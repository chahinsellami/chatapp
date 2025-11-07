"use client";

/**
 * NavigationBar Component - Top navigation bar for authenticated pages
 *
 * Features:
 * - WebChat branding
 * - User search functionality
 * - Navigation buttons (Settings, Messages, Logout)
 * - Sticky positioning
 * - Professional black theme
 */

import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { User, MessageCircle, LogOut, Search, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useState, useRef, useEffect } from "react";

interface NavigationBarProps {
  currentPage?: "profile" | "settings" | "messenger";
}

interface SearchUser {
  id: string;
  username: string;
  avatar?: string;
  status: string;
}

export default function NavigationBar({ currentPage }: NavigationBarProps) {
  const router = useRouter();
  const { logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [searching, setSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Search for users
  const handleSearch = async (query: string) => {
    setSearchQuery(query);

    if (query.trim().length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    try {
      setSearching(true);
      const token = localStorage.getItem("auth_token");
      const res = await fetch(
        `/api/users/search?q=${encodeURIComponent(query)}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.ok) {
        const data = await res.json();
        setSearchResults(data.users || []);
        setShowResults(true);
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setSearching(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const viewProfile = (userId: string) => {
    router.push(`/profile/${userId}`);
    setShowResults(false);
    setSearchQuery("");
  };

  return (
    <div className="bg-neutral-950 border-b border-neutral-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center gap-4">
        <h1 className="text-xl font-bold text-white">WebChat</h1>

        {/* Search Bar */}
        <div className="flex-1 max-w-md relative" ref={searchRef}>
          <motion.div
            className="relative"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <Search className="w-5 h-5 text-neutral-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={() => searchQuery.length >= 2 && setShowResults(true)}
              placeholder="Search for people..."
              className="w-full pl-12 pr-12 py-3 bg-neutral-900/80 backdrop-blur-sm border border-neutral-700 rounded-xl text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-lg hover:bg-neutral-900"
            />
            <AnimatePresence>
              {searchQuery && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => {
                    setSearchQuery("");
                    setSearchResults([]);
                    setShowResults(false);
                  }}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Search Results Dropdown */}
          <AnimatePresence>
            {showResults && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute top-full mt-3 w-full bg-neutral-900/95 backdrop-blur-xl border border-neutral-700 rounded-xl shadow-2xl max-h-[400px] overflow-hidden"
              >
                {searching ? (
                  <div className="p-6 text-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-3"
                    />
                    <p className="text-neutral-400 text-sm font-medium">
                      Searching...
                    </p>
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="overflow-y-auto max-h-[400px] custom-scrollbar">
                    <div className="p-2 border-b border-neutral-800">
                      <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide px-3 py-2">
                        {searchResults.length}{" "}
                        {searchResults.length === 1 ? "result" : "results"}{" "}
                        found
                      </p>
                    </div>
                    <div className="py-2">
                      {searchResults.map((user, index) => (
                        <motion.button
                          key={user.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          onClick={() => viewProfile(user.id)}
                          className="w-full px-4 py-3 hover:bg-neutral-800/70 flex items-center gap-4 transition-all duration-200 group"
                          whileHover={{ x: 4 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="relative">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center flex-shrink-0 shadow-lg group-hover:shadow-blue-500/50 transition-shadow">
                              {user.avatar?.startsWith("/avatars/") ? (
                                <img
                                  src={user.avatar}
                                  alt={user.username}
                                  className="w-full h-full rounded-full object-cover"
                                />
                              ) : (
                                <span className="text-white text-lg font-bold">
                                  {user.avatar ||
                                    user.username[0].toUpperCase()}
                                </span>
                              )}
                            </div>
                            {/* Online status indicator */}
                            <div
                              className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-neutral-900 ${
                                user.status === "online"
                                  ? "bg-green-500"
                                  : "bg-gray-500"
                              }`}
                            />
                          </div>
                          <div className="flex-1 text-left min-w-0">
                            <p className="text-white font-semibold text-base truncate group-hover:text-blue-400 transition-colors">
                              {user.username}
                            </p>
                            <p className="text-neutral-400 text-sm capitalize flex items-center gap-2">
                              <span
                                className={`w-2 h-2 rounded-full ${
                                  user.status === "online"
                                    ? "bg-green-500"
                                    : "bg-gray-500"
                                }`}
                              />
                              {user.status}
                            </p>
                          </div>
                          <motion.div
                            initial={{ opacity: 0 }}
                            whileHover={{ opacity: 1 }}
                            className="text-neutral-500 group-hover:text-blue-400 transition-colors"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                          </motion.div>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <div className="w-16 h-16 rounded-full bg-neutral-800 flex items-center justify-center mx-auto mb-3">
                      <Search className="w-8 h-8 text-neutral-600" />
                    </div>
                    <p className="text-neutral-400 text-sm font-medium mb-1">
                      No users found
                    </p>
                    <p className="text-neutral-500 text-xs">
                      Try searching with a different name
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex gap-3">
          <motion.button
            onClick={() => router.push("/settings")}
            className={`px-4 py-2 ${
              currentPage === "settings"
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-neutral-800 hover:bg-neutral-700"
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
                : "bg-neutral-800 hover:bg-neutral-700"
            } text-white rounded-lg font-medium flex items-center gap-2`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <MessageCircle className="w-4 h-4" />
            Messages
          </motion.button>

          <motion.button
            onClick={handleLogout}
            className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg font-medium flex items-center gap-2"
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
