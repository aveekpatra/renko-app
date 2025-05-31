"use client";

import React from "react";
import { Plus, Bell } from "lucide-react";
import { useTheme } from "@/components/AppLayout";
import { useAuthActions } from "@convex-dev/auth/react";
import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";

// Component imports
import TimeBasedKanban from "../components/TimeBasedKanban";
import ProjectStatusKanban from "../components/ProjectStatusKanban";
import CalendarWidget from "../components/CalendarWidget";
import QuickTasks from "../components/QuickTasks";

function AuthenticatedContent() {
  const { isDarkMode } = useTheme();
  const { signOut } = useAuthActions();

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <div className="p-8">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2
            className={`text-3xl font-bold mb-2 ${isDarkMode ? "text-gray-100" : "text-gray-900"}`}
          >
            Good morning, Jimmy!
          </h2>
          <p
            className={`font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
          >
            Here&apos;s what&apos;s happening with your personal projects today.
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors"
          >
            Sign Out
          </button>
          <button
            className={`p-3 backdrop-blur-md rounded-xl shadow-lg transition-all duration-300 border hover:-translate-y-0.5 ${
              isDarkMode
                ? "bg-gray-800/80 border-gray-700/60 hover:bg-gray-800/90 shadow-black/20 hover:shadow-black/30"
                : "bg-white/80 border-white/60 hover:bg-white/90 shadow-gray-900/10 hover:shadow-gray-900/15"
            }`}
          >
            <Bell
              className={`w-5 h-5 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
            />
          </button>
          <button className="flex items-center space-x-2 px-5 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 transform hover:-translate-y-0.5 font-semibold">
            <Plus className="w-4 h-4" />
            <span>New Project</span>
          </button>
        </div>
      </div>

      {/* Calendar Widget */}
      <CalendarWidget isDarkMode={isDarkMode} />

      <div className="space-y-8">
        {/* Time-Based Kanban Board */}
        <TimeBasedKanban isDarkMode={isDarkMode} />

        {/* Project Status Kanban Board */}
        <ProjectStatusKanban isDarkMode={isDarkMode} />

        {/* Quick Tasks */}
        <QuickTasks isDarkMode={isDarkMode} />
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <>
      <AuthLoading>
        <div className="flex items-center justify-center h-screen">
          <div className="text-lg">Loading...</div>
        </div>
      </AuthLoading>

      <Authenticated>
        <AuthenticatedContent />
      </Authenticated>

      <Unauthenticated>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Welcome</h1>
            <p className="text-gray-600 mb-4">Please sign in to continue</p>
            <a
              href="/signin"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md transition-colors"
            >
              Sign In
            </a>
          </div>
        </div>
      </Unauthenticated>
    </>
  );
}
