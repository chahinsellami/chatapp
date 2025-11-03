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
      await login(email, password);
      router.push("/channels");
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
      <div className="relative w-full max-w-2xl z-10 fade-in">
        {/* Card with enhanced styling */}
        <div className="bg-[#36393F] rounded-2xl shadow-2xl p-12 border border-[#40444B] backdrop-blur-sm">
          {/* Header */}
          <div className="text-center mb-12 slide-in">
            <div className="inline-block p-5 bg-[#5B65F5] rounded-full mb-6 shadow-lg">
              <span className="text-4xl">💬</span>
            </div>
            <h1 className="text-6xl font-bold text-white mb-4 tracking-tight">
              Welcome Back
            </h1>
            <p className="text-[#B0BEC5] text-xl">
              Access your WebChat community
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-8 p-5 bg-[#F04747] bg-opacity-20 border border-[#F04747] rounded-xl slide-in-up">
              <p className="text-[#FF6B6B] text-base font-medium">⚠️ {error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Email field */}
            <div className="scale-in">
              <label
                htmlFor="email"
                className="block text-base font-bold text-[#DCDDDE] mb-4"
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
                className="w-full px-6 py-4 bg-[#40444B] border-2 border-[#202225] text-[#DCDDDE] rounded-xl focus:outline-none focus:border-[#5B65F5] focus:ring-4 focus:ring-[#5B65F5] focus:ring-opacity-30 transition placeholder-[#72767D] text-lg"
              />
            </div>

            {/* Password field */}
            <div className="scale-in">
              <label
                htmlFor="password"
                className="block text-base font-bold text-[#DCDDDE] mb-4"
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
                  className="w-full px-6 py-4 bg-[#40444B] border-2 border-[#202225] text-[#DCDDDE] rounded-xl focus:outline-none focus:border-[#5B65F5] focus:ring-4 focus:ring-[#5B65F5] focus:ring-opacity-30 transition placeholder-[#72767D] text-lg"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-6 top-1/2 -translate-y-1/2 text-[#72767D] hover:text-[#5B65F5] transition text-base font-semibold"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-5 bg-[#5B65F5] text-white font-bold rounded-xl hover:bg-[#4752C4] transition disabled:opacity-50 disabled:cursor-not-allowed mt-10 text-xl shadow-2xl hover:shadow-[#5B65F5]/50 transform hover:scale-105 smooth"
            >
              {isLoading ? "🔄 Logging in..." : "Login"}
            </button>
          </form>

          {/* Divider */}
          <div className="my-10 flex items-center">
            <div className="flex-1 h-px bg-[#202225]"></div>
            <div className="px-6 text-[#72767D] text-sm font-bold uppercase tracking-wider">
              Or
            </div>
            <div className="flex-1 h-px bg-[#202225]"></div>
          </div>

          {/* Signup link */}
          <p className="text-center text-[#B0BEC5] text-lg">
            Don't have an account?{" "}
            <Link
              href="/signup"
              className="text-[#5B65F5] hover:text-[#7289DA] font-bold transition hover:underline"
            >
              Create one
            </Link>
          </p>
        </div>

        {/* Demo credentials */}
        <div className="mt-10 p-8 bg-[#2F3136] rounded-2xl border border-[#40444B] text-center relative z-10 scale-in shadow-xl">
          <p className="text-[#72767D] text-base mb-5 font-semibold">
            ✨ Demo Account:
          </p>
          <div className="space-y-3">
            <p className="text-[#DCDDDE] text-base">
              <span className="text-[#5B65F5] font-bold">Email:</span>{" "}
              <code className="bg-[#36393F] px-4 py-2 rounded-lg text-[#7289DA] text-base">
                demo@example.com
              </code>
            </p>
            <p className="text-[#DCDDDE] text-base">
              <span className="text-[#5B65F5] font-bold">Password:</span>{" "}
              <code className="bg-[#36393F] px-4 py-2 rounded-lg text-[#7289DA] text-base">
                Demo1234
              </code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
