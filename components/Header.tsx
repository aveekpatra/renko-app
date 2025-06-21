"use client";

import React, { useState, useEffect } from "react";
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
  CalendarDays,
} from "lucide-react";
import { useTheme } from "./AppLayout";
import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery, useMutation, useAction } from "convex/react";
import { useConvexAuth } from "convex/react";
import { api } from "@/convex/_generated/api";

interface HeaderProps {
  onCreateTask?: () => void;
  className?: string;
}

export default function Header({ onCreateTask, className = "" }: HeaderProps) {
  const { isDarkMode } = useTheme();
  const { isAuthenticated } = useConvexAuth();
  const { signOut } = useAuthActions();
  const pathname = usePathname();
  const [searchTerm, setSearchTerm] = useState("");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [calendarMessage, setCalendarMessage] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  // Removed showDiagnostic state - no longer needed

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

  // UNIFIED OAUTH APPROACH - Get calendar status from unified system
  const calendarStatus = useQuery(
    api.googleCalendarMutations.getCalendarStatus,
    isAuthenticated ? {} : "skip",
  );

  // Calendar diagnostic removed - no longer needed with new implementation

  // Calendar management functions
  const syncCalendar = useAction(api.googleCalendar.syncCalendarEvents);
  const disconnectCalendar = useMutation(
    api.googleCalendarMutations.disconnectCalendar,
  );

  // Check for calendar connection status in URL (for unified approach)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    if (params.get("calendar_connected") === "true") {
      const email = params.get("calendar_email");
      setCalendarMessage({
        type: "success",
        message: `Calendar connected successfully${email ? ` (${email})` : ""}!`,
      });

      // Clean up URL
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete("calendar_connected");
      newUrl.searchParams.delete("calendar_email");
      window.history.replaceState({}, "", newUrl.toString());

      // Auto-dismiss after 5 seconds
      setTimeout(() => setCalendarMessage(null), 5000);
    }

    if (params.get("calendar_error")) {
      const error = params.get("calendar_error");
      const details = params.get("calendar_error_details");
      setCalendarMessage({
        type: "error",
        message: `Calendar connection failed: ${error}${details ? ` (${details})` : ""}`,
      });

      // Clean up URL
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete("calendar_error");
      newUrl.searchParams.delete("calendar_error_details");
      window.history.replaceState({}, "", newUrl.toString());

      // Auto-dismiss after 10 seconds
      setTimeout(() => setCalendarMessage(null), 10000);
    }
  }, []);

  const handleCalendarConnect = () => {
    if (!isAuthenticated) return;

    // Redirect to calendar settings page for connection
    window.location.href = "/debug-oauth";
  };

  const handleCalendarSync = async () => {
    if (!isAuthenticated) return;

    try {
      console.log("🔄 Syncing calendar events...");
      console.log("📊 Calendar status before sync:", calendarStatus);
      console.log("🔐 Is authenticated:", isAuthenticated);

      const result = await syncCalendar({});
      console.log("✅ Calendar sync result:", result);

      setCalendarMessage({
        type: result.success ? "success" : "error",
        message: result.message,
      });

      // Auto-dismiss after 5 seconds
      setTimeout(() => setCalendarMessage(null), 5000);
    } catch (error) {
      console.error("❌ Calendar sync error:", error);
      console.error("❌ Error details:", {
        name: error instanceof Error ? error.name : "Unknown",
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      setCalendarMessage({
        type: "error",
        message: "Failed to sync calendar events. Please try again.",
      });
    }
  };

  const handleCalendarDisconnect = async () => {
    if (!isAuthenticated) return;

    try {
      console.log("🔄 Disconnecting calendar...");

      const result = await disconnectCalendar();
      console.log("✅ Calendar disconnect result:", result);

      setCalendarMessage({
        type: result.success ? "success" : "error",
        message: result.message,
      });

      // Auto-dismiss after 5 seconds
      setTimeout(() => setCalendarMessage(null), 5000);
    } catch (error) {
      console.error("❌ Calendar disconnect error:", error);
      setCalendarMessage({
        type: "error",
        message: "Failed to disconnect calendar. Please try again.",
      });
    }
  };

  return (
    <>
      {/* Calendar Status Message */}
      {calendarMessage && (
        <div
          className={`px-4 py-2 text-sm text-center ${
            calendarMessage.type === "success"
              ? "bg-green-50 text-green-700 border-b border-green-200"
              : "bg-red-50 text-red-700 border-b border-red-200"
          }`}
        >
          {calendarMessage.message}
          <button
            onClick={() => setCalendarMessage(null)}
            className="ml-2 text-xs underline"
          >
            Dismiss
          </button>
        </div>
      )}

      <header
        className={`sticky top-0 z-50 ${themeClasses.header} ${className}`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
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

            {/* Right Section - Minimal Actions */}
            <div className="flex items-center space-x-1">
              {/* Google Calendar Connect Button */}
              <div className="flex items-center space-x-2">
                {calendarStatus?.connected ? (
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={handleCalendarSync}
                      className="inline-flex items-center space-x-1 rounded-md bg-green-100 px-2 py-1 text-xs text-green-800 hover:bg-green-200 transition-colors"
                      title={`Connected: ${calendarStatus.email || "Google Calendar"}`}
                    >
                      <CalendarDays className="h-3 w-3" />
                      <span>Sync</span>
                    </button>
                    <button
                      onClick={handleCalendarDisconnect}
                      className="inline-flex items-center rounded-md bg-red-100 px-2 py-1 text-xs text-red-800 hover:bg-red-200 transition-colors"
                      title="Disconnect calendar"
                    >
                      <span>×</span>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleCalendarConnect}
                    className="inline-flex items-center space-x-1 rounded-md bg-blue-100 px-2 py-1 text-xs text-blue-800 hover:bg-blue-200 transition-colors"
                  >
                    <CalendarDays className="h-3 w-3" />
                    <span>Connect Calendar</span>
                  </button>
                )}
              </div>

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

      {/* Calendar diagnostic panel removed - using new implementation */}
    </>
  );
}
