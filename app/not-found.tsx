"use client";

import React from "react";
import Link from "next/link";
import { Home, ArrowLeft } from "lucide-react";
import { useTheme } from "@/components/AppLayout";

export default function NotFound() {
  const { isDarkMode } = useTheme();

  const themeClasses = {
    page: isDarkMode
      ? "bg-gradient-to-br from-gray-950 via-gray-900 to-purple-950/30 min-h-screen"
      : "bg-gradient-to-br from-gray-50 via-white to-purple-50/50 min-h-screen",
    text: {
      primary: isDarkMode ? "text-gray-100" : "text-gray-900",
      secondary: isDarkMode ? "text-gray-300" : "text-gray-700",
      tertiary: isDarkMode ? "text-gray-400" : "text-gray-600",
    },
    card: isDarkMode
      ? "bg-gray-900/60 backdrop-blur-xl border border-gray-800/60 shadow-2xl shadow-black/25"
      : "bg-white/80 backdrop-blur-xl border border-gray-200/60 shadow-2xl shadow-gray-900/15",
  };

  return (
    <div
      className={`${themeClasses.page} flex items-center justify-center relative overflow-hidden`}
    >
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className={`absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-20 blur-3xl ${
            isDarkMode ? "bg-purple-600" : "bg-purple-400"
          }`}
        />
        <div
          className={`absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full opacity-20 blur-3xl ${
            isDarkMode ? "bg-indigo-600" : "bg-indigo-400"
          }`}
        />
        <div
          className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-10 blur-3xl ${
            isDarkMode ? "bg-pink-600" : "bg-pink-400"
          }`}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
        {/* Large 404 Text with Gradient */}
        <div className="mb-8">
          <h1 className="text-[6rem] md:text-[8rem] lg:text-[10rem] font-black leading-none bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 bg-clip-text text-transparent animate-pulse select-none mb-6">
            404
          </h1>
          <div className="relative">
            <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 bg-clip-text text-transparent">
              Page Not Found
            </h2>
          </div>
        </div>

        {/* Description */}
        <div
          className={`mb-12 max-w-2xl mx-auto ${themeClasses.card} p-8 rounded-2xl`}
        >
          <p
            className={`text-xl md:text-2xl mb-6 ${themeClasses.text.secondary} leading-relaxed`}
          >
            Oops! It looks like this page has wandered off into the digital
            void.
          </p>
          <p
            className={`text-lg ${themeClasses.text.tertiary} leading-relaxed`}
          >
            The page you&apos;re looking for might have been moved, deleted, or
            you may have mistyped the URL.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/"
            className={`group flex items-center space-x-3 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
              isDarkMode
                ? "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-500/25"
                : "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-500/25"
            }`}
          >
            <Home className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span>Go Home</span>
          </Link>

          <button
            onClick={() => window.history.back()}
            className={`group flex items-center space-x-3 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:scale-105 border-2 ${
              isDarkMode
                ? "border-gray-700 hover:border-gray-600 text-gray-300 hover:text-gray-100 hover:bg-gray-800/50"
                : "border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-900 hover:bg-gray-100/50"
            }`}
          >
            <ArrowLeft className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span>Go Back</span>
          </button>
        </div>

        {/* Decorative Element */}
        <div className="mt-16">
          <div
            className={`inline-block p-8 rounded-2xl ${
              isDarkMode ? "bg-purple-900/20" : "bg-purple-100/30"
            } backdrop-blur-sm border ${
              isDarkMode ? "border-purple-800/30" : "border-purple-200/50"
            }`}
          >
            <div className="text-center">
              <div
                className={`text-2xl font-semibold ${
                  isDarkMode ? "text-purple-300" : "text-purple-700"
                }`}
              >
                Renko
              </div>
              <div
                className={`text-sm ${
                  isDarkMode ? "text-purple-400" : "text-purple-600"
                } mt-1`}
              >
                Task Management
              </div>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-12">
          <p className={`text-xs ${themeClasses.text.tertiary}`}>
            Error Code: 404 • Page Not Found
          </p>
        </div>
      </div>

      {/* Animated Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-10 left-10 w-1 h-1 bg-purple-500 rounded-full animate-ping" />
        <div className="absolute top-20 right-20 w-1 h-1 bg-indigo-500 rounded-full animate-ping delay-300" />
        <div className="absolute bottom-20 left-20 w-1 h-1 bg-pink-500 rounded-full animate-ping delay-700" />
        <div className="absolute bottom-10 right-10 w-1 h-1 bg-purple-500 rounded-full animate-ping delay-1000" />
      </div>
    </div>
  );
}
