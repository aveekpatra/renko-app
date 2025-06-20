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
  CheckCircle,
  CalendarDays,
  LogOut,
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
  const [showDiagnostic, setShowDiagnostic] = useState(false);

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

  // Get calendar status
  const calendarStatus = useQuery(
    api.googleCalendar.getCalendarStatus,
    isAuthenticated ? {} : "skip",
  );

  // Debug OAuth configuration
  const oauthConfig = useQuery(
    api.googleCalendar.debugOAuthConfig,
    isAuthenticated ? {} : "skip",
  );

  // Google Cloud Console diagnostic
  const googleCloudDiagnostic = useQuery(
    api.googleCalendar.diagnoseGoogleCloudSetup,
    isAuthenticated ? {} : "skip",
  );

  // Generate calendar OAuth URL
  const generateCalendarUrl = useMutation(
    api.googleCalendar.generateCalendarOAuthUrl,
  );

  // Sync calendar events
  const syncCalendar = useAction(api.googleCalendar.syncCalendarEvents);

  // Disconnect calendar
  const disconnectCalendar = useMutation(api.googleCalendar.disconnectCalendar);

  // Check for calendar connection status in URL
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

  const handleCalendarConnect = async () => {
    if (!isAuthenticated) return;

    // Check OAuth configuration first
    if (!oauthConfig?.hasClientId || !oauthConfig?.hasClientSecret) {
      console.error("❌ OAuth not properly configured");
      console.log("OAuth Config:", oauthConfig);
      setCalendarMessage({
        type: "error",
        message:
          "Google Calendar OAuth is not configured. Please check environment variables.",
      });
      setShowDiagnostic(true);
      return;
    }

    try {
      console.log("🔄 Generating calendar OAuth URL...");
      console.log("OAuth Config:", oauthConfig);

      const oauthUrl = await generateCalendarUrl();
      console.log("📍 Generated OAuth URL:", oauthUrl);

      // Extract and log the redirect URI for debugging
      const urlObj = new URL(oauthUrl);
      const redirectUri = urlObj.searchParams.get("redirect_uri");
      const clientId = urlObj.searchParams.get("client_id");
      const scopes = urlObj.searchParams.get("scope");

      console.log("🔧 OAuth URL Details:");
      console.log("   Client ID:", clientId);
      console.log("   Redirect URI:", redirectUri);
      console.log("   Scopes:", scopes);
      console.log("   Full URL:", oauthUrl);

      // Validate redirect URI
      const expectedRedirectUri = oauthConfig.redirectUri;
      if (redirectUri !== expectedRedirectUri) {
        console.error("❌ REDIRECT URI MISMATCH!");
        console.error("   Expected:", expectedRedirectUri);
        console.error("   Got:", redirectUri);
        setCalendarMessage({
          type: "error",
          message: `Redirect URI mismatch. Expected: ${expectedRedirectUri}, Got: ${redirectUri}`,
        });
        return;
      }

      console.log("✅ OAuth configuration validated. Redirecting to Google...");

      // Redirect to Google OAuth
      window.location.href = oauthUrl;
    } catch (error) {
      console.error("❌ Error generating OAuth URL:", error);
      setCalendarMessage({
        type: "error",
        message: `Failed to generate OAuth URL: ${error instanceof Error ? error.message : "Unknown error"}`,
      });
    }
  };

  const handleCalendarSync = async () => {
    if (!calendarStatus?.hasConnection) return;

    try {
      const result = await syncCalendar();
      setCalendarMessage({
        type: result.success ? "success" : "error",
        message: result.message,
      });

      // Auto-dismiss success messages
      if (result.success) {
        setTimeout(() => setCalendarMessage(null), 3000);
      }
    } catch {
      setCalendarMessage({
        type: "error",
        message: "Failed to sync calendar. Please try again.",
      });
    }
  };

  const handleCalendarDisconnect = async () => {
    if (!calendarStatus?.hasConnection) return;

    try {
      await disconnectCalendar();
      setCalendarMessage({
        type: "success",
        message: "Calendar disconnected successfully.",
      });
      setTimeout(() => setCalendarMessage(null), 3000);
    } catch {
      setCalendarMessage({
        type: "error",
        message: "Failed to disconnect calendar. Please try again.",
      });
    }
  };

  return (
    <>
      <header
        className={`sticky top-0 z-50 ${themeClasses.header} ${className}`}
      >
        {/* Calendar connection message */}
        {calendarMessage && (
          <div
            className={`w-full px-4 py-2 text-sm text-center ${
              calendarMessage.type === "success"
                ? "bg-green-100 text-green-800 border-b border-green-200"
                : "bg-red-100 text-red-800 border-b border-red-200"
            }`}
          >
            {calendarMessage.message}
            <button
              onClick={() => setCalendarMessage(null)}
              className="ml-2 text-xs underline hover:no-underline"
            >
              Dismiss
            </button>
            {calendarMessage.type === "error" && (
              <button
                onClick={() => setShowDiagnostic(!showDiagnostic)}
                className="ml-2 text-xs underline hover:no-underline"
              >
                {showDiagnostic ? "Hide Setup Guide" : "Show Setup Guide"}
              </button>
            )}
          </div>
        )}
        <div className="px-4 py-2">
          <div className="flex items-center justify-between">
            {/* Left Section - Minimal Page Title */}
            <div className="flex items-center space-x-2">
              <div className={`${themeClasses.text.secondary}`}>
                {getPageIcon()}
              </div>
              <h1
                className={`text-md font-medium ${themeClasses.text.primary}`}
              >
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
              {/* Google Calendar Connect Button */}
              <div className="flex items-center space-x-2">
                {calendarStatus?.hasConnection ? (
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

      {/* Diagnostic Panel */}
      {showDiagnostic && googleCloudDiagnostic && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-red-800">
              🚨 Google Cloud Console Configuration Required
            </h3>
            <button
              onClick={() => setShowDiagnostic(false)}
              className="text-red-600 hover:text-red-800"
            >
              ✕
            </button>
          </div>

          {/* Critical Issues */}
          <div className="mb-4">
            <h4 className="font-semibold text-red-700 mb-2">
              Critical Issues:
            </h4>
            <ul className="list-disc list-inside space-y-1">
              {googleCloudDiagnostic.criticalIssues.map((issue, index) => (
                <li key={index} className="text-red-600 text-sm">
                  {issue}
                </li>
              ))}
            </ul>
          </div>

          {/* Immediate Actions */}
          <div className="mb-4">
            <h4 className="font-semibold text-red-700 mb-2">
              Immediate Actions:
            </h4>
            <ol className="list-decimal list-inside space-y-1">
              {googleCloudDiagnostic.immediateActions.map((action, index) => (
                <li key={index} className="text-red-600 text-sm">
                  {action}
                </li>
              ))}
            </ol>
          </div>

          {/* Redirect URI */}
          <div className="bg-white p-3 rounded border border-red-200">
            <p className="text-sm font-semibold text-red-800 mb-1">
              Your exact redirect URI:
            </p>
            <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono text-gray-800 break-all">
              {googleCloudDiagnostic.redirectUri}
            </code>
            <p className="text-xs text-red-600 mt-1">
              Copy this EXACTLY into Google Cloud Console
            </p>
          </div>

          <div className="mt-4 flex space-x-3">
            <a
              href="https://console.cloud.google.com/apis/credentials"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
            >
              Open Google Cloud Console
            </a>
            <a
              href="/debug-oauth"
              className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
            >
              Full Debug Guide
            </a>
          </div>
        </div>
      )}
    </>
  );
}

function SignOutButton() {
  return (
    <button className="flex w-full items-center space-x-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent">
      <LogOut className="h-4 w-4" />
      <span>Sign Out</span>
    </button>
  );
}
