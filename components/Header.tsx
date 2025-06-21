"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import {
  Search,
  Plus,
  Bell,
  Settings,
  User,
  Calendar,
  BarChart3,
  Zap,
} from "lucide-react";
import { useTheme } from "./AppLayout";
import { useAuthActions } from "@convex-dev/auth/react";

interface HeaderProps {
  onCreateTask?: () => void;
  className?: string;
}

export default function Header({ onCreateTask, className = "" }: HeaderProps) {
  const { isDarkMode } = useTheme();
  const { signOut } = useAuthActions();
  const pathname = usePathname();
  const [searchTerm, setSearchTerm] = useState("");
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Get page title based on current route
  const getPageTitle = () => {
    switch (pathname) {
      case "/":
        return "Inbox";
      case "/boards":
        return "Projects";
      case "/calendar":
        return "Calendar";
      default:
        if (pathname.startsWith("/boards/")) {
          return "Project Board";
        }
        return "Renko";
    }
  };

  const getPageIcon = () => {
    switch (pathname) {
      case "/":
        return <Zap className="w-5 h-5" />;
      case "/boards":
        return <BarChart3 className="w-5 h-5" />;
      case "/calendar":
        return <Calendar className="w-5 h-5" />;
      default:
        return <Zap className="w-5 h-5" />;
    }
  };

  const themeClasses = {
    header: isDarkMode
      ? "bg-gray-900/95 backdrop-blur-xl border-b border-gray-700/60"
      : "bg-white/95 backdrop-blur-xl border-b border-gray-200/60",
    text: {
      primary: isDarkMode ? "text-gray-100" : "text-gray-900",
      secondary: isDarkMode ? "text-gray-300" : "text-gray-700",
      tertiary: isDarkMode ? "text-gray-400" : "text-gray-600",
    },
    search: isDarkMode
      ? "bg-gray-800/70 border-gray-700/60 text-gray-100 placeholder-gray-400 focus:border-purple-500/50"
      : "bg-gray-50/80 border-gray-200/60 text-gray-800 placeholder-gray-500 focus:border-purple-400/50",
    button: isDarkMode
      ? "hover:bg-gray-700/50 text-gray-400 hover:text-gray-300"
      : "hover:bg-gray-100/60 text-gray-600 hover:text-gray-800",
    dropdown: isDarkMode
      ? "bg-gray-800 border-gray-700/60 shadow-2xl shadow-black/30"
      : "bg-white border-gray-200/60 shadow-2xl shadow-gray-900/10",
  };

  return (
    <>
      <header
        className={`sticky top-0 z-50 ${themeClasses.header} ${className}`}
      >
        <div className="mx-auto px-4 sm:px-6 lg:px-4">
          <div className="flex h-14 items-center justify-between">
            {/* Left Section - Page Title */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                {getPageIcon()}
                <h1
                  className={`text-lg font-semibold ${themeClasses.text.primary}`}
                >
                  {getPageTitle()}
                </h1>
              </div>
            </div>

            {/* Center Section - Search */}
            <div className="flex-1 max-w-lg mx-4">
              <div className="relative">
                <Search
                  className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${themeClasses.text.tertiary}`}
                />
                <input
                  type="text"
                  placeholder="Search tasks, projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 text-sm rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 ${themeClasses.search}`}
                />
                <kbd
                  className={`absolute right-3 top-1/2 transform -translate-y-1/2 px-1.5 py-0.5 text-xs rounded border ${isDarkMode ? "bg-gray-700 border-gray-600 text-gray-400" : "bg-gray-100 border-gray-300 text-gray-500"}`}
                >
                  ⌘K
                </kbd>
              </div>
            </div>

            {/* Right Section - Actions */}
            <div className="flex items-center space-x-1">
              {/* Create Task Button */}
              {onCreateTask && (
                <button
                  onClick={onCreateTask}
                  className={`p-1.5 rounded-md transition-all duration-200 ${themeClasses.button}`}
                  title="Create new task"
                >
                  <Plus className="w-4 h-4" />
                </button>
              )}

              {/* Notifications */}
              <button
                className={`p-1.5 rounded-md transition-all duration-200 ${themeClasses.button}`}
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
              </button>

              {/* Settings */}
              <button
                className={`p-1.5 rounded-md transition-all duration-200 ${themeClasses.button}`}
                title="Settings"
              >
                <Settings className="w-4 h-4" />
              </button>

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className={`p-1.5 rounded-md transition-all duration-200 ${themeClasses.button}`}
                  title="User menu"
                >
                  <User className="w-4 h-4" />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 top-full mt-1 w-48 py-1 rounded-lg border backdrop-blur-xl z-50">
                    <div
                      className={`${themeClasses.dropdown}`}
                      onClick={() => setShowUserMenu(false)}
                    >
                      <div className="px-3 py-2 border-b border-gray-200/20">
                        <p
                          className={`text-sm font-medium ${themeClasses.text.primary}`}
                        >
                          Account
                        </p>
                        <p className={`text-xs ${themeClasses.text.tertiary}`}>
                          Manage your account
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          signOut();
                          setShowUserMenu(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-sm transition-colors hover:bg-gray-100/10 ${themeClasses.text.secondary}`}
                      >
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
