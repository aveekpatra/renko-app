"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useAction, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useConvexAuth } from "convex/react";
import {
  Calendar,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  X,
  ExternalLink,
} from "lucide-react";

/**
 * ENHANCED GOOGLE CALENDAR SYNC COMPONENT
 *
 * This component now supports the new calendar sync implementation with:
 * - Proper OAuth token management
 * - Real Google Calendar API integration
 * - Token refresh functionality
 * - Better error handling and user guidance
 */

export function GoogleCalendarSync() {
  const { isAuthenticated } = useConvexAuth();
  const [syncing, setSyncing] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [lastSyncResult, setLastSyncResult] = useState<{
    success: boolean;
    message: string;
    eventsCount?: number;
  } | null>(null);

  // Get current calendar status
  const calendarStatus = useQuery(
    api.googleCalendarMutations.getCalendarStatus,
    isAuthenticated ? {} : "skip",
  );

  // Sync action
  const syncCalendarEvents = useAction(api.googleCalendar.syncCalendarEvents);

  // Initialize connection mutation
  const initializeConnection = useMutation(
    api.googleCalendarMutations.initializeCalendarConnection,
  );

  // Disconnect mutation
  const disconnectCalendar = useMutation(
    api.googleCalendarMutations.disconnectCalendar,
  );

  // Clean up any stale OAuth state on component mount
  useEffect(() => {
    // Clear any stale OAuth popup state on mount
    const handleStorageCleanup = () => {
      try {
        // Remove any stale OAuth state from localStorage/sessionStorage if they exist
        if (typeof window !== "undefined") {
          const keysToRemove = [];
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.includes("google") && key.includes("oauth")) {
              keysToRemove.push(key);
            }
          }
          keysToRemove.forEach((key) => localStorage.removeItem(key));
        }
      } catch {
        // Silently handle storage cleanup errors
      }
    };

    handleStorageCleanup();
  }, []);

  const handleConnect = async () => {
    setConnecting(true);
    setLastSyncResult(null);

    try {
      // Initiate Google OAuth flow with calendar permissions
      const authUrl =
        `https://accounts.google.com/o/oauth2/v2/auth?` +
        new URLSearchParams({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CALENDAR_CLIENT_ID || "",
          redirect_uri: `${window.location.origin}/api/auth/google/calendar/callback`,
          response_type: "code",
          scope:
            "openid email profile https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/calendar.events",
          access_type: "offline",
          prompt: "consent",
          include_granted_scopes: "true",
        });

      // Open OAuth flow in a popup
      const popup = window.open(
        authUrl,
        "google-calendar-auth",
        "width=500,height=600,scrollbars=yes,resizable=yes",
      );

      // Listen for OAuth completion
      const handleMessage = async (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;

        if (event.data.type === "CALENDAR_AUTH_SUCCESS") {
          const { accessToken, refreshToken, expiresAt, email } = event.data;

          // Validate required fields before calling initialization
          if (!accessToken || !email || !expiresAt) {
            console.error("❌ Invalid OAuth data received:", {
              hasAccessToken: !!accessToken,
              hasEmail: !!email,
              hasExpiresAt: !!expiresAt,
            });
            setLastSyncResult({
              success: false,
              message: "Invalid authentication data received from Google",
            });
            popup?.close();
            window.removeEventListener("message", handleMessage);
            return;
          }

          try {
            const result = await initializeConnection({
              accessToken,
              refreshToken,
              expiresAt,
              email,
            });

            if (result.success) {
              setLastSyncResult({
                success: true,
                message: "Calendar connected successfully!",
              });
            } else {
              setLastSyncResult({
                success: false,
                message: result.message,
              });
            }
          } catch (error) {
            setLastSyncResult({
              success: false,
              message: `Connection failed: ${error instanceof Error ? error.message : "Unknown error"}`,
            });
          }

          popup?.close();
          window.removeEventListener("message", handleMessage);
        } else if (event.data.type === "CALENDAR_AUTH_ERROR") {
          setLastSyncResult({
            success: false,
            message: event.data.error || "Authentication failed",
          });
          popup?.close();
          window.removeEventListener("message", handleMessage);
        }
      };

      window.addEventListener("message", handleMessage);

      // Check if popup was closed without completing auth
      const checkClosed = setInterval(() => {
        if (popup?.closed) {
          clearInterval(checkClosed);
          window.removeEventListener("message", handleMessage);
          setConnecting(false);
        }
      }, 1000);
    } catch (error) {
      console.error("Calendar connection error:", error);
      setLastSyncResult({
        success: false,
        message: `Connection failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      });
    } finally {
      setConnecting(false);
    }
  };

  const handleSync = async () => {
    if (!calendarStatus?.connected) {
      setLastSyncResult({
        success: false,
        message: "Calendar not connected. Please connect your calendar first.",
      });
      return;
    }

    setSyncing(true);
    setLastSyncResult(null);

    try {
      const result = await syncCalendarEvents({});
      setLastSyncResult({
        success: result.success,
        message: result.message,
        eventsCount: "eventsCount" in result ? result.eventsCount : undefined,
      });
    } catch (error) {
      console.error("Calendar sync error:", error);
      setLastSyncResult({
        success: false,
        message: `Sync failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      });
    } finally {
      setSyncing(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      const result = await disconnectCalendar({});
      if (result.success) {
        setLastSyncResult({
          success: true,
          message: "Calendar disconnected successfully",
        });
      } else {
        setLastSyncResult({
          success: false,
          message: result.message,
        });
      }
    } catch (error) {
      setLastSyncResult({
        success: false,
        message: `Disconnect failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      });
    }
  };

  const dismissResult = () => {
    setLastSyncResult(null);
  };

  if (!isAuthenticated) {
    return (
      <div className="text-center p-4 text-gray-500">
        Please sign in to manage calendar sync
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Connection Status */}
      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
        <Calendar className="h-5 w-5 text-blue-600" />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            {calendarStatus?.connected ? (
              <>
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="font-medium text-green-700">
                  Calendar Connected
                </span>
                {calendarStatus.email && (
                  <span className="text-sm text-gray-600">
                    ({calendarStatus.email})
                  </span>
                )}
              </>
            ) : (
              <>
                <div className="h-4 w-4 rounded-full border-2 border-gray-300" />
                <span className="text-gray-600">Calendar Not Connected</span>
              </>
            )}
          </div>
          {calendarStatus?.lastSync && (
            <p className="text-sm text-gray-500 mt-1">
              Last sync: {new Date(calendarStatus.lastSync).toLocaleString()}
            </p>
          )}
        </div>
      </div>

      {/* Connection Controls */}
      <div className="flex items-center gap-3">
        {!calendarStatus?.connected ? (
          <button
            onClick={handleConnect}
            disabled={connecting}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:bg-blue-400"
          >
            <ExternalLink
              className={`h-4 w-4 ${connecting ? "animate-pulse" : ""}`}
            />
            {connecting ? "Connecting..." : "Connect Calendar"}
          </button>
        ) : (
          <>
            <button
              onClick={handleSync}
              disabled={syncing}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:bg-blue-400"
            >
              <RefreshCw
                className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`}
              />
              {syncing ? "Syncing..." : "Sync Now"}
            </button>

            <button
              onClick={handleDisconnect}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
            >
              Disconnect
            </button>
          </>
        )}
      </div>

      {/* Sync Result */}
      {lastSyncResult && (
        <div
          className={`flex items-start gap-3 p-4 rounded-lg border ${
            lastSyncResult.success
              ? "bg-green-50 border-green-200"
              : "bg-red-50 border-red-200"
          }`}
        >
          {lastSyncResult.success ? (
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
          ) : (
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
          )}
          <div className="flex-1">
            <p
              className={`text-sm font-medium ${
                lastSyncResult.success ? "text-green-800" : "text-red-800"
              }`}
            >
              {lastSyncResult.message}
              {lastSyncResult.eventsCount !== undefined && (
                <span className="ml-1">
                  ({lastSyncResult.eventsCount} events)
                </span>
              )}
            </p>
          </div>
          <button
            onClick={dismissResult}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Instructions */}
      {!calendarStatus?.connected && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">
            Connect Your Google Calendar
          </h3>
          <p className="text-blue-700 text-sm mb-3">
            Connect your Google Calendar to sync events and enable AI-powered
            scheduling features.
          </p>
          <ol className="list-decimal list-inside text-sm text-blue-600 space-y-1">
            <li>
              Click &quot;Connect Calendar&quot; to start the authorization
              process
            </li>
            <li>Sign in to your Google account if prompted</li>
            <li>Grant calendar permissions when requested</li>
            <li>Return to this page to start syncing events</li>
          </ol>
        </div>
      )}

      {/* Error Display */}
      {calendarStatus?.error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-800 mb-1">
                Connection Error
              </h3>
              <p className="text-red-700 text-sm">{calendarStatus.error}</p>
              <button
                onClick={handleDisconnect}
                className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
              >
                Reset connection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
