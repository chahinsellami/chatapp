"use client";

/**
 * Home Page - Root landing page of the application
 * 
 * This page acts as the entry point and router for the application.
 * It automatically redirects users based on their authentication status:
 * - Authenticated users → redirected to /profile page
 * - Unauthenticated users → redirected to /login page
 * 
 * Features:
 * - Automatic authentication check on page load
 * - Loading state while checking authentication
 * - Seamless redirection based on user status
 */

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

/**
 * Home Component
 * Main entry point that handles authentication-based routing
 */
export default function Home() {
  // Next.js router for programmatic navigation
  const router = useRouter();
  
  // Get current user and loading state from authentication context
  const { user, isLoading } = useAuth();

  /**
   * Effect: Handle automatic redirection based on authentication status
   * Runs whenever user, isLoading, or router changes
   */
  useEffect(() => {
    // Wait for authentication check to complete
    if (!isLoading) {
      if (user) {
        // User is authenticated → go to profile page
        router.push("/profile");
      } else {
        // User is not authenticated → go to login page
        router.push("/login");
      }
    }
  }, [user, isLoading, router]);

  /**
   * Loading UI - Displayed while checking authentication status
   * Shows a centered spinner with loading text
   */
  return (
    <div className="min-h-screen bg-[#36393F] flex items-center justify-center">
      <div className="text-center">
        {/* Animated loading spinner with purple accent color */}
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#5B65F5] mx-auto mb-4"></div>
        
        {/* Loading text */}
        <p className="text-[#DCDDDE]">Loading...</p>
      </div>
    </div>
  );
}
