"use client";

import React from "react";
import { useTheme } from "@/components/AppLayout";

export default function ProjectsPage() {
  const { isDarkMode } = useTheme();

  return (
    <div className="p-8">
      <div>
        <h2
          className={`text-3xl font-bold mb-2 ${isDarkMode ? "text-gray-100" : "text-gray-900"}`}
        >
          Projects
        </h2>
        <p
          className={`font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
        >
          Manage your project portfolio and high-level planning.
        </p>
      </div>

      <div className="mt-8">
        <div
          className={`p-8 rounded-xl backdrop-blur-md border shadow-lg ${
            isDarkMode
              ? "bg-gray-800/80 border-gray-700/60 shadow-black/20"
              : "bg-white/80 border-white/60 shadow-gray-900/10"
          }`}
        >
          <p
            className={`text-lg ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
          >
            Project management features coming soon...
          </p>
          <p
            className={`text-sm mt-2 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
          >
            This will be different from Boards - focused on high-level project
            planning, milestones, and portfolio management.
          </p>
        </div>
      </div>
    </div>
  );
}
