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
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 flex justify-between items-center gap-2 sm:gap-4">
        <h1 className="text-lg sm:text-xl font-bold text-white whitespace-nowrap">
          WebChat
        </h1>

        {/* Search Bar */}
        <div className="flex-1 max-w-md relative" ref={searchRef}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={() => searchQuery.length >= 2 && setShowResults(true)}
              placeholder="Search users..."
              className="w-full pl-10 pr-10 py-2 text-sm sm:text-base bg-neutral-900 border border-neutral-800 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSearchResults([]);
                  setShowResults(false);
                }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Search Results Dropdown */}
          <AnimatePresence>
            {showResults && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full mt-2 w-full bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl max-h-[70vh] overflow-y-auto custom-scrollbar"
              >
                {searching ? (
                  <div className="p-4 text-center text-neutral-400">
                    <div className="inline-block w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-2"></div>
                    <p className="text-sm">Searching...</p>
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="py-2">
                    {searchResults.map((user) => (
                      <motion.button
                        key={user.id}
                        onClick={() => viewProfile(user.id)}
                        className="w-full px-4 py-3 hover:bg-neutral-800 flex items-center gap-3 transition-colors"
                        whileHover={{ x: 4 }}
                      >
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center flex-shrink-0 shadow-lg overflow-hidden">
                          {user.avatar &&
                          (user.avatar.startsWith("http") ||
                            user.avatar.startsWith("/")) ? (
                            <img
                              src={user.avatar}
                              alt={user.username}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-white font-bold text-sm sm:text-base">
                              {user.avatar || user.username[0].toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 text-left min-w-0">
                          <p className="text-white font-semibold text-sm sm:text-base truncate">
                            {user.username}
                          </p>
                          <p className="text-neutral-400 text-xs sm:text-sm capitalize truncate">
                            {user.status}
                          </p>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center">
                    <div className="text-neutral-600 mb-2">
                      <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    </div>
                    <p className="text-neutral-400 text-sm">No users found</p>
                    <p className="text-neutral-500 text-xs mt-1">
                      Try a different search term
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex gap-1 sm:gap-3">
          <motion.button
            onClick={() => router.push("/settings")}
            className={`px-2 sm:px-4 py-2 ${
              currentPage === "settings"
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-neutral-800 hover:bg-neutral-700"
            } text-white rounded-lg font-medium flex items-center gap-2 text-sm sm:text-base transition-colors`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <User className="w-4 h-4" />
            <span className="hidden sm:inline">Settings</span>
          </motion.button>

          <motion.button
            onClick={() => router.push("/messenger")}
            className={`px-2 sm:px-4 py-2 ${
              currentPage === "messenger"
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-neutral-800 hover:bg-neutral-700"
            } text-white rounded-lg font-medium flex items-center gap-2 text-sm sm:text-base transition-colors`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <MessageCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Messages</span>
          </motion.button>

          <motion.button
            onClick={handleLogout}
            className="px-2 sm:px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg font-medium flex items-center gap-2 text-sm sm:text-base transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </motion.button>
        </div>
      </div>
    </div>
  );
}
