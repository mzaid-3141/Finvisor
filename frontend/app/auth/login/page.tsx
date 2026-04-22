"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TrendingUp, Eye, EyeOff } from "lucide-react";
import { login as apiLogin } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await apiLogin(email, password);
      await login(data.access_token);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0f1c] grid-pattern flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <TrendingUp size={28} className="text-amber-400" />
            </div>
            <span className="text-4xl font-bold text-[#f1f5f9] tracking-tight">
              Finvisor
            </span>
          </div>
          <p className="text-sm text-[#64748b]">Smart Portfolio Management</p>
        </div>

        {/* Card */}
        <div className="bg-[#0d1526] border border-[#1e2d47] rounded-2xl shadow-2xl p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-[#f1f5f9] mb-1">
              Welcome back
            </h1>
            <p className="text-sm text-[#64748b]">
              Sign in to your Finvisor account
            </p>
          </div>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Email address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[#f1f5f9]">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="w-full bg-[#111827] border border-[#1e2d47] rounded-lg px-3 py-2.5 pr-10 text-sm text-[#f1f5f9] placeholder-[#64748b] outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748b] hover:text-[#f1f5f9] transition-colors duration-200"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              className="w-full mt-2"
            >
              Sign in
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-[#64748b]">
            Don&apos;t have an account?{" "}
            <Link
              href="/auth/signup"
              className="text-blue-400 hover:text-blue-300 font-medium transition-colors duration-200"
            >
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
