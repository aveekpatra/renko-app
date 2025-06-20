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
  CheckCircle,
} from "lucide-react";
import { useTheme } from "./AppLayout";
import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

interface HeaderProps {
  onCreateTask?: () => void;
  className?: string;
}

// Simple Calendar Status Component for Header
function CalendarStatusIndicator() {
  const { isDarkMode } = useTheme();
  const calendarStatus = useQuery(api.googleCalendar.getCalendarStatus);
  const [isClient, setIsClient] = useState(false);

  // Ensure this only runs on client side
  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const themeClasses = {
    text: {
      tertiary: isDarkMode ? "text-gray-400" : "text-gray-600",
    },
  };

  // Show loading state during SSR and initial hydration
  if (!isClient || calendarStatus === undefined) {
    return (
      <div className="flex items-center space-x-2 px-3 py-1.5">
        <div className="w-3 h-3 rounded-full bg-gray-400 animate-pulse"></div>
        <span className={`text-xs font-medium ${themeClasses.text.tertiary}`}>
          Loading...
        </span>
      </div>
    );
  }

  // Show connection status
  if (calendarStatus.hasConnections) {
    return (
      <div className="flex items-center space-x-2 px-3 py-1.5">
        <CheckCircle className="w-3 h-3 text-green-500" />
        <span
          className={`text-xs font-medium text-green-${isDarkMode ? "400" : "600"}`}
        >
          {calendarStatus.activeConnections} Calendar
          {calendarStatus.activeConnections !== 1 ? "s" : ""}
        </span>
      </div>
    );
  }

  // No connections
  return (
    <div className="flex items-center space-x-2 px-3 py-1.5">
      <Calendar className="w-3 h-3 text-gray-400" />
      <span className={`text-xs font-medium ${themeClasses.text.tertiary}`}>
        No Calendars
      </span>
    </div>
  );
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
    <header className={`sticky top-0 z-50 ${themeClasses.header} ${className}`}>
      <div className="px-4 py-2">
        <div className="flex items-center justify-between">
          {/* Left Section - Minimal Page Title */}
          <div className="flex items-center space-x-2">
            <div className={`${themeClasses.text.secondary}`}>
              {getPageIcon()}
            </div>
            <h1 className={`text-md font-medium ${themeClasses.text.primary}`}>
              {getPageTitle()}
            </h1>
          </div>

          {/* Center Section - Search */}
          <div className="flex-1 max-w-md mx-6">
            <div className="relative">
              <Search
                className={`absolute left-2.5 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 ${themeClasses.text.tertiary}`}
              />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-9 pr-3 py-1.5 rounded-md border backdrop-blur-md transition-all duration-200 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500/30 ${themeClasses.search}`}
              />
              <kbd
                className={`absolute right-2.5 top-1/2 transform -translate-y-1/2 px-1.5 py-0.5 text-xs rounded border ${
                  isDarkMode
                    ? "bg-gray-700 border-gray-600 text-gray-400"
                    : "bg-gray-100 border-gray-300 text-gray-500"
                }`}
              >
                ⌘K
              </kbd>
            </div>
          </div>

          {/* Right Section - Minimal Actions */}
          <div className="flex items-center space-x-1">
            {/* Google Account + Calendar Status */}
            <CalendarStatusIndicator />

            {/* Options Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className={`p-1.5 rounded-md transition-all duration-200 ${themeClasses.button}`}
              >
                <User className="w-4 h-4" />
              </button>

              {/* Options Dropdown */}
              {showUserMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowUserMenu(false)}
                  />
                  <div
                    className={`absolute right-0 mt-2 w-52 rounded-lg border backdrop-blur-xl z-20 ${themeClasses.dropdown}`}
                  >
                    <div className="py-2">
                      {onCreateTask && (
                        <button
                          onClick={() => {
                            onCreateTask();
                            setShowUserMenu(false);
                          }}
                          className={`w-full text-left px-4 py-2 text-sm flex items-center space-x-2 transition-colors ${
                            isDarkMode
                              ? "text-gray-300 hover:bg-gray-700/50 hover:text-gray-100"
                              : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                          }`}
                        >
                          <Plus className="w-4 h-4" />
                          <span>New Task</span>
                        </button>
                      )}
                      <button
                        className={`w-full text-left px-4 py-2 text-sm flex items-center space-x-2 transition-colors ${
                          isDarkMode
                            ? "text-gray-300 hover:bg-gray-700/50 hover:text-gray-100"
                            : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                        }`}
                      >
                        <Settings className="w-4 h-4" />
                        <span>Settings</span>
                      </button>
                      <button
                        className={`w-full text-left px-4 py-2 text-sm flex items-center space-x-2 transition-colors ${
                          isDarkMode
                            ? "text-gray-300 hover:bg-gray-700/50 hover:text-gray-100"
                            : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                        }`}
                      >
                        <Bell className="w-4 h-4" />
                        <span>Notifications</span>
                      </button>
                      <div
                        className={`border-t my-2 ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}
                      />
                      <button
                        onClick={async () => {
                          await signOut();
                          setShowUserMenu(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm flex items-center space-x-2 transition-colors ${
                          isDarkMode
                            ? "text-red-400 hover:bg-gray-700/50 hover:text-red-300"
                            : "text-red-600 hover:bg-gray-50 hover:text-red-700"
                        }`}
                      >
                        <User className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
