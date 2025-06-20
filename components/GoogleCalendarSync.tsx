"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useTheme } from "./AppLayout";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Calendar,
  Plus,
  RefreshCw,
  Trash2,
  CheckCircle,
  AlertCircle,
  Clock,
  User,
  Mail,
  Loader2,
} from "lucide-react";

export default function GoogleCalendarSync() {
  const { isDarkMode } = useTheme();
  const [isClient, setIsClient] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Queries and mutations
  const connections = useQuery(api.googleCalendar.getCalendarConnections);
  const calendarStatus = useQuery(api.googleCalendar.getCalendarStatus);
  const generateConnectionUrl = useMutation(
    api.googleCalendar.generateCalendarConnectionUrl,
  );
  const syncCalendars = useMutation(api.googleCalendar.syncAllCalendars);

  // Ensure this only runs on client side
  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const handleConnectCalendar = async () => {
    try {
      const url = await generateConnectionUrl({ returnUrl: "/calendar" });
      window.location.href = url;
    } catch (error) {
      console.error("Failed to generate connection URL:", error);
    }
  };

  const handleSyncCalendars = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    try {
      await syncCalendars({});
      // Give some time for the sync to process
      setTimeout(() => setIsSyncing(false), 2000);
    } catch (error) {
      console.error("Failed to sync calendars:", error);
      setIsSyncing(false);
    }
  };

  const handleDisconnectCalendar = async (connectionId: string) => {
    try {
      const response = await fetch("/calendar/disconnect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: "current", // Will be resolved on server
          connectionId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to disconnect calendar");
      }

      // Refresh the page to update the UI
      window.location.reload();
    } catch (error) {
      console.error("Failed to disconnect calendar:", error);
    }
  };

  const themeClasses = {
    container: isDarkMode
      ? "bg-gray-800/50 border-gray-700/60"
      : "bg-white/80 border-gray-200/60",
    text: {
      primary: isDarkMode ? "text-gray-100" : "text-gray-900",
      secondary: isDarkMode ? "text-gray-300" : "text-gray-700",
      tertiary: isDarkMode ? "text-gray-400" : "text-gray-600",
    },
    button: {
      primary: isDarkMode
        ? "bg-blue-600 hover:bg-blue-500 text-white"
        : "bg-blue-500 hover:bg-blue-600 text-white",
      secondary: isDarkMode
        ? "bg-gray-700 hover:bg-gray-600 text-gray-300 border-gray-600"
        : "bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300",
      danger: isDarkMode
        ? "bg-red-600 hover:bg-red-500 text-white"
        : "bg-red-500 hover:bg-red-600 text-white",
    },
    card: isDarkMode
      ? "bg-gray-700/50 border-gray-600/50"
      : "bg-gray-50/80 border-gray-200/50",
  };

  // Show loading state during SSR and initial hydration
  if (!isClient) {
    return (
      <div
        className={`p-6 rounded-lg border backdrop-blur-md ${themeClasses.container}`}
      >
        <div className="flex items-center space-x-3 mb-4">
          <Calendar className="w-5 h-5 text-blue-500" />
          <h3 className={`text-lg font-semibold ${themeClasses.text.primary}`}>
            Google Calendar Integration
          </h3>
        </div>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`p-6 rounded-lg border backdrop-blur-md ${themeClasses.container}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Calendar className="w-5 h-5 text-blue-500" />
          <h3 className={`text-lg font-semibold ${themeClasses.text.primary}`}>
            Google Calendar Integration
          </h3>
        </div>

        {/* Sync Button */}
        <button
          onClick={handleSyncCalendars}
          disabled={isSyncing || !calendarStatus?.hasConnections}
          className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-sm transition-all ${
            calendarStatus?.hasConnections && !isSyncing
              ? themeClasses.button.secondary
              : "opacity-50 cursor-not-allowed " + themeClasses.button.secondary
          }`}
        >
          {isSyncing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
          <span>{isSyncing ? "Syncing..." : "Sync"}</span>
        </button>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className={`p-3 rounded-lg border ${themeClasses.card}`}>
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span
              className={`text-sm font-medium ${themeClasses.text.secondary}`}
            >
              Connected
            </span>
          </div>
          <div className={`text-lg font-semibold ${themeClasses.text.primary}`}>
            {calendarStatus?.activeConnections || 0}
          </div>
        </div>

        <div className={`p-3 rounded-lg border ${themeClasses.card}`}>
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-blue-500" />
            <span
              className={`text-sm font-medium ${themeClasses.text.secondary}`}
            >
              Total
            </span>
          </div>
          <div className={`text-lg font-semibold ${themeClasses.text.primary}`}>
            {calendarStatus?.totalConnections || 0}
          </div>
        </div>

        <div className={`p-3 rounded-lg border ${themeClasses.card}`}>
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-gray-500" />
            <span
              className={`text-sm font-medium ${themeClasses.text.secondary}`}
            >
              Last Sync
            </span>
          </div>
          <div className={`text-sm ${themeClasses.text.primary}`}>
            {calendarStatus?.lastSyncAt
              ? new Date(calendarStatus.lastSyncAt).toLocaleTimeString()
              : "Never"}
          </div>
        </div>
      </div>

      {/* Connected Calendars */}
      {connections && connections.length > 0 ? (
        <div className="space-y-3 mb-6">
          <h4 className={`text-sm font-medium ${themeClasses.text.secondary}`}>
            Connected Accounts
          </h4>
          {connections.map((connection) => (
            <div
              key={connection._id}
              className={`flex items-center justify-between p-3 rounded-lg border ${themeClasses.card}`}
            >
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  {connection.googleAccountPicture ? (
                    <Image
                      src={connection.googleAccountPicture}
                      alt={connection.googleAccountName}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
                <div>
                  <div
                    className={`text-sm font-medium ${themeClasses.text.primary}`}
                  >
                    {connection.googleAccountName}
                  </div>
                  <div
                    className={`text-xs flex items-center space-x-1 ${themeClasses.text.tertiary}`}
                  >
                    <Mail className="w-3 h-3" />
                    <span>{connection.googleAccountEmail}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {/* Status Indicator */}
                <div className="flex items-center space-x-1">
                  {connection.isActive ? (
                    <>
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className={`text-xs ${themeClasses.text.tertiary}`}>
                        Active
                      </span>
                    </>
                  ) : (
                    <>
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span className={`text-xs ${themeClasses.text.tertiary}`}>
                        Inactive
                      </span>
                    </>
                  )}
                </div>

                {/* Disconnect Button */}
                <button
                  onClick={() => handleDisconnectCalendar(connection._id)}
                  className={`p-1.5 rounded-md transition-colors ${themeClasses.button.danger} opacity-70 hover:opacity-100`}
                  title="Disconnect calendar"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <AlertCircle
            className={`w-12 h-12 mx-auto mb-3 ${themeClasses.text.tertiary}`}
          />
          <h4
            className={`text-lg font-medium mb-2 ${themeClasses.text.primary}`}
          >
            No Google Calendars Connected
          </h4>
          <p className={`text-sm mb-4 ${themeClasses.text.tertiary}`}>
            Connect your Google Calendar to sync events and manage your schedule
          </p>
        </div>
      )}

      {/* Connect Button */}
      <button
        onClick={handleConnectCalendar}
        className={`w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-md text-sm font-medium transition-colors ${themeClasses.button.primary}`}
      >
        <Plus className="w-4 h-4" />
        <span>Connect Google Calendar</span>
      </button>
    </div>
  );
}
