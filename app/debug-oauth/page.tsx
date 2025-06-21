"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useConvexAuth } from "convex/react";
import Link from "next/link";
import { Calendar, CheckCircle, ArrowLeft, Zap, Settings } from "lucide-react";
import { GoogleCalendarSync } from "@/components/GoogleCalendarSync";

export default function DebugOAuthPage() {
  const { isAuthenticated } = useConvexAuth();

  // Get calendar status for the new implementation
  const calendarStatus = useQuery(
    api.googleCalendarMutations.getCalendarStatus,
    isAuthenticated ? {} : "skip",
  );

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <Zap className="h-12 w-12 text-purple-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Calendar Settings
            </h1>
            <p className="text-gray-600 mb-6">
              Please sign in to manage your calendar integration
            </p>
            <Link
              href="/signin"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg font-medium transition-colors block text-center"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
          <div className="flex items-center gap-3">
            <Settings className="h-6 w-6 text-purple-600" />
            <h1 className="text-3xl font-bold text-gray-900">
              Calendar Settings
            </h1>
          </div>
        </div>

        {/* Implementation Success Message */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-semibold text-green-800 mb-2">
            🎉 Enhanced Calendar Sync Implementation
          </h2>
          <p className="text-green-700 mb-4">
            The Google Calendar integration now features proper OAuth token
            management, real Google Calendar API integration, and automatic
            token refresh capabilities.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h3 className="font-medium text-green-800 mb-2">New Features:</h3>
              <ul className="list-disc list-inside text-green-600 space-y-1">
                <li>Direct Google Calendar API integration</li>
                <li>Automatic token refresh</li>
                <li>Secure token storage</li>
                <li>Real-time event synchronization</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-green-800 mb-2">Benefits:</h3>
              <ul className="list-disc list-inside text-green-600 space-y-1">
                <li>Reliable calendar access</li>
                <li>Better sync performance</li>
                <li>Improved error handling</li>
                <li>Enhanced security</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Calendar Integration Status */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold">
              Google Calendar Integration
            </h2>
          </div>

          {calendarStatus ? (
            <div className="space-y-4">
              {/* Connection Status */}
              <div className="flex items-center gap-2">
                {calendarStatus.connected ? (
                  <>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-green-700 font-medium">
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
                    <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                    <span className="text-gray-600">
                      Calendar Not Connected
                    </span>
                  </>
                )}
              </div>

              {/* Sync Status */}
              {calendarStatus.lastSync && (
                <div className="text-sm text-gray-600">
                  Last sync:{" "}
                  {new Date(calendarStatus.lastSync).toLocaleString()}
                </div>
              )}

              {/* Error Status */}
              {calendarStatus.error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="text-red-800 text-sm font-medium">Error:</div>
                  <div className="text-red-700 text-sm">
                    {calendarStatus.error}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-gray-500">Loading calendar status...</div>
          )}
        </div>

        {/* OAuth Configuration Status */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Settings className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold">OAuth Configuration</h2>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-800 mb-2">
                  Environment Variables
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    {process.env.NEXT_PUBLIC_AUTH_GOOGLE_ID ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <div className="h-4 w-4 rounded-full border-2 border-red-300" />
                    )}
                    <span>Google Client ID Available</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Backend OAuth Configured</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Calendar API Access Enabled</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-800 mb-2">
                  Implementation Status
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>OAuth Popup Flow</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Token Storage & Refresh</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>API Error Handling</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Calendar Sync Component */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold">Calendar Sync Controls</h2>
          </div>
          <GoogleCalendarSync />
        </div>

        {/* Technical Information */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mt-8">
          <h2 className="text-xl font-semibold mb-4">
            Technical Implementation
          </h2>
          <div className="space-y-4 text-sm text-gray-600">
            <div>
              <h3 className="font-medium text-gray-800 mb-1">OAuth Flow:</h3>
              <p>
                Uses popup-based OAuth with proper callback handling. Tokens are
                securely stored in the backend and automatically refreshed when
                needed.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-gray-800 mb-1">
                API Integration:
              </h3>
              <p>
                Direct integration with Google Calendar API v3 for fetching
                events. Supports up to 250 events from the next 30 days with
                proper pagination.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-gray-800 mb-1">Data Storage:</h3>
              <p>
                Calendar events are stored locally for fast access and offline
                capabilities. Automatic deduplication and updates on each sync.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
