"use client";

import React from "react";
import { useQuery } from "convex/react";
import { useConvexAuth } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Settings, ExternalLink, CheckCircle, AlertCircle } from "lucide-react";

export default function DebugOAuthPage() {
  const { isAuthenticated } = useConvexAuth();

  const oauthConfig = useQuery(
    api.googleCalendar.debugOAuthConfig,
    isAuthenticated ? {} : "skip",
  );

  const googleCloudDiagnostic = useQuery(
    api.googleCalendar.diagnoseGoogleCloudSetup,
    isAuthenticated ? {} : "skip",
  );

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">OAuth Debug Page</h1>
          <p className="text-gray-600 mb-4">
            Please sign in to access OAuth diagnostics
          </p>
          <a href="/signin" className="text-blue-600 hover:underline">
            Sign In
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-900">
          🔧 Google Calendar OAuth Debug Center
        </h1>

        {/* Critical Issues Alert */}
        {googleCloudDiagnostic?.criticalIssues && (
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 mb-8">
            <div className="flex items-center mb-4">
              <AlertCircle className="w-6 h-6 text-red-600 mr-2" />
              <h2 className="text-xl font-bold text-red-800">
                🚨 CRITICAL ISSUE DETECTED
              </h2>
            </div>
            <div className="space-y-2">
              {googleCloudDiagnostic.criticalIssues.map((issue, index) => (
                <p key={index} className="text-red-700 font-medium">
                  {issue}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Immediate Actions */}
        {googleCloudDiagnostic?.immediateActions && (
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6 mb-8">
            <div className="flex items-center mb-4">
              <Settings className="w-6 h-6 text-yellow-600 mr-2" />
              <h2 className="text-xl font-bold text-yellow-800">
                ⚡ IMMEDIATE ACTION REQUIRED
              </h2>
            </div>
            <div className="bg-white rounded-lg p-4 border border-yellow-200">
              <ol className="list-decimal list-inside space-y-2">
                {googleCloudDiagnostic.immediateActions.map((action, index) => (
                  <li key={index} className="text-yellow-800 font-medium">
                    {action}
                  </li>
                ))}
              </ol>
            </div>
            <div className="mt-4 p-4 bg-yellow-100 rounded-lg">
              <p className="text-yellow-800 font-semibold">
                🎯 Your exact redirect URI:
              </p>
              <code className="block mt-2 p-2 bg-white rounded border text-sm font-mono text-gray-800">
                {googleCloudDiagnostic.redirectUri}
              </code>
              <p className="text-sm text-yellow-700 mt-2">
                Copy this EXACTLY into your Google Cloud Console OAuth Client
                configuration
              </p>
            </div>
          </div>
        )}

        {/* Detailed Steps */}
        {googleCloudDiagnostic?.googleCloudConsoleSteps && (
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-8">
            <div className="flex items-center mb-4">
              <ExternalLink className="w-6 h-6 text-blue-600 mr-2" />
              <h2 className="text-xl font-bold text-blue-800">
                📋 Google Cloud Console Configuration Steps
              </h2>
            </div>
            <div className="bg-white rounded-lg p-4 border border-blue-200">
              <div className="space-y-1">
                {googleCloudDiagnostic.googleCloudConsoleSteps.map(
                  (step, index) => (
                    <div key={index}>
                      {step === "" ? (
                        <div className="h-2" />
                      ) : step.startsWith("🔧") ? (
                        <h3 className="font-bold text-blue-800 mt-4 mb-2">
                          {step}
                        </h3>
                      ) : step.startsWith("-") ? (
                        <p className="text-blue-700 ml-4 text-sm">{step}</p>
                      ) : (
                        <p className="text-blue-700 text-sm">{step}</p>
                      )}
                    </div>
                  ),
                )}
              </div>
            </div>
          </div>
        )}

        {/* Current Configuration Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* OAuth Configuration */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Settings className="w-5 h-5 mr-2" />
              OAuth Configuration
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Client ID Configured</span>
                <span
                  className={`px-2 py-1 rounded text-sm ${
                    oauthConfig?.hasClientId
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {oauthConfig?.hasClientId ? "✅ Yes" : "❌ No"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Client Secret Configured</span>
                <span
                  className={`px-2 py-1 rounded text-sm ${
                    oauthConfig?.hasClientSecret
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {oauthConfig?.hasClientSecret ? "✅ Yes" : "❌ No"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">User Authenticated</span>
                <span
                  className={`px-2 py-1 rounded text-sm ${
                    oauthConfig?.isAuthenticated
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {oauthConfig?.isAuthenticated ? "✅ Yes" : "❌ No"}
                </span>
              </div>
            </div>
            {oauthConfig && (
              <div className="mt-4 p-3 bg-gray-50 rounded">
                <p className="text-sm text-gray-600 mb-1">Redirect URI:</p>
                <code className="text-xs font-mono text-gray-800 break-all">
                  {oauthConfig.redirectUri}
                </code>
              </div>
            )}
          </div>

          {/* Calendar Status */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <CheckCircle className="w-5 h-5 mr-2" />
              Calendar Status
            </h2>
            <div className="space-y-3">
              {calendarStatus ? (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Connection Status</span>
                    <span
                      className={`px-2 py-1 rounded text-sm ${
                        calendarStatus.connected
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {calendarStatus.connected
                        ? "✅ Connected"
                        : "❌ Not Connected"}
                    </span>
                  </div>
                  {calendarStatus.lastSync && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Last Sync</span>
                      <span className="text-sm text-gray-800">
                        {new Date(calendarStatus.lastSync).toLocaleString()}
                      </span>
                    </div>
                  )}
                  {calendarStatus.error && (
                    <div className="p-3 bg-red-50 rounded">
                      <p className="text-sm text-red-600">
                        <strong>Error:</strong> {calendarStatus.error}
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-gray-500">Loading calendar status...</p>
              )}
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <ExternalLink className="w-5 h-5 mr-2" />
            Quick Links
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <a
              href="https://console.cloud.google.com/apis/credentials"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ExternalLink className="w-4 h-4 mr-2 text-gray-600" />
              <span className="text-sm font-medium">
                Google Cloud Credentials
              </span>
            </a>
            <a
              href="https://console.cloud.google.com/apis/library"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ExternalLink className="w-4 h-4 mr-2 text-gray-600" />
              <span className="text-sm font-medium">API Library</span>
            </a>
            <a
              href="https://console.cloud.google.com/apis/credentials/consent"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ExternalLink className="w-4 h-4 mr-2 text-gray-600" />
              <span className="text-sm font-medium">OAuth Consent Screen</span>
            </a>
          </div>
        </div>

        {/* Back to Home */}
        <div className="mt-8 text-center">
          <a
            href="/"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}
