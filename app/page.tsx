"use client";

import React, { useState } from "react";
import { Plus, Bell } from "lucide-react";

// Component imports
import Sidebar from "../components/Sidebar";
import TimeBasedKanban from "../components/TimeBasedKanban";
import ProjectStatusKanban from "../components/ProjectStatusKanban";
import CalendarWidget from "../components/CalendarWidget";
import QuickTasks from "../components/QuickTasks";

export default function Home() {
  const [sidebarWidth, setSidebarWidth] = useState(280);
  const [isResizing, setIsResizing] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isCollapsed) {
      setIsResizing(true);
      e.preventDefault();
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing || isCollapsed) return;
    const newWidth = e.clientX;
    if (newWidth >= 200 && newWidth <= 400) {
      setSidebarWidth(newWidth);
    }
  };

  const handleMouseUp = () => {
    setIsResizing(false);
  };

  React.useEffect(() => {
    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isResizing]);

  // Theme classes
  const themeClasses = {
    container: isDarkMode
      ? "h-screen bg-gradient-to-br from-gray-900 to-slate-900 flex overflow-hidden"
      : "h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex overflow-hidden",
  };

  return (
    <div className={themeClasses.container}>
      {/* Sidebar */}
      <Sidebar
        sidebarWidth={sidebarWidth}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        handleMouseDown={handleMouseDown}
      />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          {/* Top Bar */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2
                className={`text-3xl font-bold mb-2 ${isDarkMode ? "text-gray-100" : "text-gray-900"}`}
              >
                Good morning, Alex!
              </h2>
              <p
                className={`font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
              >
                Here&apos;s what&apos;s happening with your personal projects
                today.
              </p>
            </div>
            <div className="flex items-center space-x-4">
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
      </main>
    </div>
  );
}
