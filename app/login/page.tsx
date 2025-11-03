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
      className="min-h-screen flex items-center justify-center p-4 relative"
      style={{
        background: 'linear-gradient(to bottom right, #36393F, #2F3136, #202225)'
      }}
    >
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#5B65F5] opacity-5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#5B65F5] opacity-5 rounded-full blur-3xl"></div>
      </div>

      {/* Form container */}
      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="bg-[#36393F] rounded-lg shadow-2xl p-8 border border-[#202225]">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Welcome Back</h1>
            <p className="text-[#72767D]">Login to your WebChat account</p>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-6 p-4 bg-[#F04747] bg-opacity-20 border border-[#F04747] rounded-lg">
              <p className="text-[#F04747] text-sm">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-[#DCDDDE] mb-2"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-4 py-3 bg-[#40444B] border border-[#202225] text-[#DCDDDE] rounded-lg focus:outline-none focus:border-[#5B65F5] transition placeholder-[#72767D]"
              />
            </div>

            {/* Password field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-[#DCDDDE] mb-2"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-3 bg-[#40444B] border border-[#202225] text-[#DCDDDE] rounded-lg focus:outline-none focus:border-[#5B65F5] transition placeholder-[#72767D]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#72767D] hover:text-[#DCDDDE] transition"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-[#5B65F5] text-white font-semibold rounded-lg hover:bg-[#4752C4] transition disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              {isLoading ? "Logging in..." : "Login"}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className="flex-1 h-px bg-[#202225]"></div>
            <div className="px-3 text-[#72767D] text-sm">OR</div>
            <div className="flex-1 h-px bg-[#202225]"></div>
          </div>

          {/* Signup link */}
          <p className="text-center text-[#DCDDDE]">
            Don't have an account?{" "}
            <Link
              href="/signup"
              className="text-[#5B65F5] hover:underline font-semibold"
            >
              Create one
            </Link>
          </p>
        </div>

        {/* Demo credentials */}
        <div className="mt-8 p-4 bg-[#36393F] rounded-lg border border-[#202225] text-center">
          <p className="text-[#72767D] text-sm mb-2">Want to try it out?</p>
          <p className="text-[#DCDDDE] text-xs mb-3">
            Email:{" "}
            <code className="bg-[#2F3136] px-2 py-1 rounded">
              demo@example.com
            </code>
          </p>
          <p className="text-[#DCDDDE] text-xs">
            Password:{" "}
            <code className="bg-[#2F3136] px-2 py-1 rounded">Demo1234</code>
          </p>
        </div>
      </div>
    </div>
  );
}
