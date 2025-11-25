"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { Eye, EyeOff, MessageCircle, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const user = await login(email, password);

      // Redirect to profile page after successful login
      router.push("/profile");
    } catch (err: any) {
      setError(err.message || "Login failed");
    }
  };

  return (
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-5 bg-blue-600"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        <motion.div
          className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full opacity-5 bg-blue-700"
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 w-80 h-80 rounded-full opacity-3 bg-blue-800"
          style={{
            transform: "translate(-50%, -50%)",
          }}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.03, 0.05, 0.03],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Main form container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative w-full max-w-md z-10"
      >
        {/* Glass card with enhanced styling */}
        <div className="glass-card p-8 relative overflow-hidden">
          {/* Header section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-center mb-8 relative z-10"
          >
            <motion.div
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 bg-blue-600"
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <MessageCircle className="w-8 h-8 text-white" />
            </motion.div>

            <motion.h1
              className="text-4xl font-bold mb-3 tracking-tight"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <span className="gradient-text">Welcome Back</span>
            </motion.h1>

            <motion.p
              className="text-neutral-400 text-base leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              Access your WebChat community
            </motion.p>
          </motion.div>

          {/* Error message with animation */}
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="mb-6 p-4 rounded-xl border backdrop-blur-sm"
              style={{
                background: "rgba(220, 38, 38, 0.1)",
                borderColor: "rgba(220, 38, 38, 0.2)",
              }}
            >
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <p className="text-red-300 text-sm font-medium">{error}</p>
              </div>
            </motion.div>
          )}

          {/* Form with staggered animations */}
          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            {/* Email field */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
            >
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-neutral-300 mb-3"
              >
                📧 Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="modern-input w-full focus-ring"
              />
            </motion.div>

            {/* Password field */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.0, duration: 0.5 }}
            >
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-neutral-300 mb-3"
              >
                🔒 Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="modern-input w-full pr-12 focus-ring"
                />
                <motion.button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-white/10 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 text-neutral-400" />
                  ) : (
                    <Eye className="w-4 h-4 text-neutral-400" />
                  )}
                </motion.button>
              </div>
            </motion.div>

            {/* Submit button */}
            <motion.button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 px-6 rounded-xl font-bold text-white text-base bg-blue-600 hover:bg-blue-700 transition-colors relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.5 }}
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {isLoading ? (
                  <>
                    <motion.div
                      className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <MessageCircle className="w-5 h-5" />
                    <span>Continue to WebChat</span>
                  </>
                )}
              </span>
            </motion.button>
          </form>

          {/* Divider */}
          <motion.div
            className="my-8 flex items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4, duration: 0.5 }}
          >
            <div className="flex-1 h-px bg-neutral-700"></div>
            <div className="px-4 text-neutral-500 text-xs font-semibold uppercase tracking-wider">
              Or
            </div>
            <div className="flex-1 h-px bg-neutral-700"></div>
          </motion.div>

          {/* Signup link */}
          <motion.p
            className="text-center text-neutral-400 text-sm relative z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.6, duration: 0.5 }}
          >
            Don't have an account?{" "}
            <Link
              href="/signup"
              className="font-semibold transition-all duration-300 hover:text-blue-400 relative group"
            >
              <span className="relative z-10">Create one</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-400 group-hover:w-full transition-all duration-300"></span>
            </Link>
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
}
