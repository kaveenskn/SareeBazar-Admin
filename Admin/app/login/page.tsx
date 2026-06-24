"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import AuthImageSlider from "../components/AuthImageSlider";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/backend/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Invalid credentials");
      }

      // Store basic user data / token
      localStorage.setItem("admin_token", data.accessToken);
      localStorage.setItem("admin_user", JSON.stringify(data.user));

      // Redirect to dashboard
      router.push("/");
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4 sm:p-8 font-sans">
      <div className="w-full max-w-[1000px] flex flex-col lg:flex-row rounded-[24px] bg-white shadow-2xl overflow-hidden min-h-[650px]">
        
        {/* Left Side: Image Slider Equivalent (Inset card style) */}
        <div className="hidden lg:block w-1/2 p-3">
          <div className="w-full h-full relative rounded-[20px] overflow-hidden bg-[#a1005b]">
            <AuthImageSlider />
          </div>
        </div>

        {/* Right Side: Form Container */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 py-10 sm:px-12 xl:px-16">
          <div className="w-full max-w-[440px] mx-auto space-y-8">
            <div>
              <h2 className="text-[32px] font-semibold text-gray-900 tracking-tight mb-2 font-serif">
                Welcome back
              </h2>
              <p className="text-[15px] text-gray-500">
                Sign in to your Admin Dashboard
              </p>
            </div>

            <form className="space-y-4" onSubmit={handleLogin}>
              {error && (
                <div className="bg-red-50 text-red-500 text-[14px] p-3 rounded-xl border border-red-100">
                  {error}
                </div>
              )}
              
              <div>
                <label htmlFor="email" className="sr-only">Email</label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-xl border-0 bg-gray-100/80 px-4 py-4 text-[15px] text-gray-900 placeholder:text-gray-500 focus:bg-white focus:ring-2 focus:ring-inset focus:ring-[#a1005b] transition-all outline-none"
                  placeholder="Email address"
                />
              </div>

              <div>
                <label htmlFor="password" className="sr-only">Password</label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full rounded-xl border-0 bg-gray-100/80 px-4 py-4 pr-12 text-[15px] text-gray-900 placeholder:text-gray-500 focus:bg-white focus:ring-2 focus:ring-inset focus:ring-[#a1005b] transition-all outline-none"
                    placeholder="Password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-gray-600 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="text-center pt-1 pb-1">
                <a href="#" className="text-[14px] font-medium text-[#a1005b] hover:text-[#800048] underline-offset-4 hover:underline decoration-[#a1005b]/30 transition-all">
                  Forgot password?
                </a>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full justify-center rounded-xl bg-[#a1005b] px-4 py-4 text-[15px] font-semibold text-white hover:bg-[#800048] shadow-lg shadow-[#a1005b]/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? 'Signing in...' : 'Sign in'}
                </button>
              </div>
              
              <div className="pt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="bg-white px-4 text-gray-500 text-[13px]">Admin Access Only</span>
                  </div>
                </div>
              </div>
              

            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
