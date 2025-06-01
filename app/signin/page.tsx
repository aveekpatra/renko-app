"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function SignInPage() {
  const { signIn } = useAuthActions();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Abstract Background */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden m-2 rounded-2xl">
        <div className="absolute inset-0">
          <Image
            src="/abstract-bg.png"
            alt="Abstract background"
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Overlay Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
          <div>
            <div className="text-sm font-medium tracking-wider uppercase opacity-80 mb-8">
              A WISE QUOTE
            </div>
          </div>

          <div className="space-y-6">
            <h1 className="text-5xl font-bold leading-tight">
              Get
              <br />
              Everything
              <br />
              You Want
            </h1>
            <p className="text-lg opacity-90 max-w-md leading-relaxed">
              You can get everything you want if you work hard, trust the
              process, and stick to the plan.
            </p>
          </div>

          <div className="opacity-60">
            <div className="text-sm">Renko</div>
          </div>
        </div>
      </div>

      {/* Right Side - Sign In Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          {/* Header */}
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <div className="w-6 h-6 bg-white rounded-md"></div>
              </div>
              <span className="ml-3 text-xl font-bold text-gray-900">
                Renko
              </span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome Back
            </h2>
            <p className="text-gray-600">
              Enter your email and password to access your account
            </p>
          </div>

          {/* Sign In Form */}
          <form
            className="space-y-6"
            onSubmit={(event) => {
              event.preventDefault();
              const formData = new FormData(event.currentTarget);
              formData.set("flow", "signIn");
              void signIn("password", formData);
            }}
          >
            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 placeholder-gray-400 text-gray-900 bg-white"
                placeholder="Enter your email"
              />
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 placeholder-gray-400 text-gray-900 bg-white"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                />
                <span className="ml-2 text-sm text-gray-600">Remember me</span>
              </label>
              <button
                type="button"
                className="text-sm text-purple-600 hover:text-purple-700 font-medium transition-colors"
              >
                Forgot Password
              </button>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-200 transform hover:-translate-y-0.5 shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/30"
            >
              Sign In
            </button>

            {/* Google Sign In */}
            <button
              type="button"
              onClick={() => void signIn("google")}
              className="w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 rounded-xl font-semibold hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span>Sign In with Google</span>
            </button>
          </form>

          {/* Sign Up Link */}
          <div className="text-center">
            <span className="text-gray-600">Don&apos;t have an account? </span>
            <Link
              href="/signup"
              className="text-purple-600 hover:text-purple-700 font-semibold transition-colors"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
