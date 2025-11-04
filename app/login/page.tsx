"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

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

      // If user doesn't have an avatar, redirect to profile setup
      if (!user.avatar) {
        router.push("/profile");
      } else {
        router.push("/friends");
      }
    } catch (err: any) {
      setError(err.message || "Login failed");
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, #1a1d23 0%, #2F3136 50%, #202225 100%)",
      }}
    >
      {/* Animated background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#5B65F5] opacity-10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#5B65F5] opacity-10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-[#7289DA] opacity-5 rounded-full blur-3xl"></div>
      </div>

      {/* Form container */}
      <div className="relative w-full max-w-md z-10 fade-in">
        {/* Card with enhanced styling */}
        <div className="bg-[#36393F] rounded-xl shadow-2xl p-6 border border-[#40444B] backdrop-blur-sm">
          {/* Header */}
          <div className="text-center mb-6 slide-in">
            <div className="inline-block p-3 bg-[#5B65F5] rounded-full mb-3 shadow-lg">
              <span className="text-2xl">💬</span>
            </div>
            <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">
              Welcome Back
            </h1>
            <p className="text-[#B0BEC5] text-base">
              Access your WebChat community
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-4 p-3 bg-[#F04747] bg-opacity-20 border border-[#F04747] rounded-lg slide-in-up">
              <p className="text-[#FF6B6B] text-sm font-medium">⚠️ {error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email field */}
            <div className="scale-in">
              <label
                htmlFor="email"
                className="block text-sm font-bold text-[#DCDDDE] mb-2"
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
                className="w-full px-4 py-2.5 bg-[#40444B] border border-[#202225] text-[#DCDDDE] rounded-lg focus:outline-none focus:border-[#5B65F5] focus:ring-2 focus:ring-[#5B65F5] focus:ring-opacity-50 transition placeholder-[#72767D] text-sm"
              />
            </div>

            {/* Password field */}
            <div className="scale-in">
              <label
                htmlFor="password"
                className="block text-sm font-bold text-[#DCDDDE] mb-2"
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
                  className="w-full px-4 py-2.5 bg-[#40444B] border border-[#202225] text-[#DCDDDE] rounded-lg focus:outline-none focus:border-[#5B65F5] focus:ring-2 focus:ring-[#5B65F5] focus:ring-opacity-50 transition placeholder-[#72767D] text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#72767D] hover:text-[#5B65F5] transition text-xs font-semibold"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-[#5B65F5] text-white font-bold rounded-lg hover:bg-[#4752C4] transition disabled:opacity-50 disabled:cursor-not-allowed mt-6 text-base shadow-lg hover:shadow-xl transform hover:scale-105 smooth"
            >
              {isLoading ? "🔄 Logging in..." : "Login"}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className="flex-1 h-px bg-[#202225]"></div>
            <div className="px-3 text-[#72767D] text-xs font-bold uppercase tracking-wider">
              Or
            </div>
            <div className="flex-1 h-px bg-[#202225]"></div>
          </div>

          {/* Signup link */}
          <p className="text-center text-[#B0BEC5] text-sm">
            Don't have an account?{" "}
            <Link
              href="/signup"
              className="text-[#5B65F5] hover:text-[#7289DA] font-bold transition hover:underline"
            >
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
