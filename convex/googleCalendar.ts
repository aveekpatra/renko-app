"use node";

import { query, mutation, action } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";

/**
 * UNIFIED OAUTH APPROACH
 *
 * Now using the same Google OAuth client for both authentication and calendar access.
 * Calendar permissions are requested during the initial sign-in flow.
 * This eliminates the dual-OAuth conflict that was causing sign-out issues.
 */

/**
 * ENHANCED CALENDAR SYNC IMPLEMENTATION
 *
 * This new implementation:
 * 1. Properly stores and manages Google OAuth tokens
 * 2. Uses Node.js environment for Google Calendar API calls
 * 3. Handles token refresh automatically
 * 4. Provides robust error handling and debugging
 * 5. Syncs Google Calendar events to our local database
 */

// Note: getCalendarStatus and initializeCalendarConnection moved to googleCalendarMutations.ts
// since this file has "use node"; and can only contain actions

/**
 * Sync calendar events from Google Calendar - now with working API calls
 */
export const syncCalendarEvents = action({
  args: {},
  returns: v.union(
    v.object({
      success: v.boolean(),
      message: v.string(),
      eventsCount: v.number(),
    }),
    v.object({
      success: v.boolean(),
      message: v.string(),
    }),
  ),
  handler: async (
    ctx,
  ): Promise<{
    success: boolean;
    message: string;
    eventsCount?: number;
  }> => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    console.log("🔍 [SYNC DEBUG] Starting calendar sync for user:", userId);

    try {
      // Get calendar connection with tokens
      const connection = await ctx.runQuery(
        internal.googleCalendarMutations.getCalendarConnectionWithTokens,
        { userId },
      );

      if (!connection) {
        console.log("❌ [SYNC DEBUG] No calendar connection found");
        return { success: false, message: "Calendar not connected" };
      }

      console.log("✅ [SYNC DEBUG] Calendar connection found:", {
        email: connection.email,
        hasCalendarScope: connection.hasCalendarScope,
        hasAccessToken: !!connection.accessToken,
        hasRefreshToken: !!connection.refreshToken,
        expiresAt: connection.expiresAt
          ? new Date(connection.expiresAt).toISOString()
          : "No expiry",
      });

      if (!connection.hasCalendarScope || !connection.accessToken) {
        console.log("❌ [SYNC DEBUG] No calendar scope or access token");
        return { success: false, message: "Calendar access not granted" };
      }

      // Check if token is expired and refresh if needed
      let accessToken = connection.accessToken;
      if (connection.expiresAt && Date.now() >= connection.expiresAt) {
        console.log(
          "🔄 [SYNC DEBUG] Access token expired, attempting refresh...",
        );

        if (connection.refreshToken) {
          try {
            const refreshResult = await refreshAccessToken(
              connection.refreshToken,
            );
            if (refreshResult.success) {
              accessToken = refreshResult.accessToken!;

              // Update stored tokens
              await ctx.runMutation(
                internal.googleCalendarMutations.updateConnectionTokens,
                {
                  userId,
                  accessToken: refreshResult.accessToken!,
                  expiresAt: refreshResult.expiresAt!,
                },
              );

              console.log("✅ [SYNC DEBUG] Token refreshed successfully");
            } else {
              console.log(
                "❌ [SYNC DEBUG] Token refresh failed:",
                refreshResult.error,
              );

              await ctx.runMutation(
                internal.googleCalendarMutations.updateCalendarConnection,
                {
                  userId,
                  error: "Token refresh failed: " + refreshResult.error,
                },
              );

              return {
                success: false,
                message:
                  "Calendar access expired. Please reconnect your calendar.",
              };
            }
          } catch (error) {
            console.error("❌ [SYNC DEBUG] Token refresh error:", error);
            return {
              success: false,
              message: "Failed to refresh calendar access. Please reconnect.",
            };
          }
        } else {
          console.log("❌ [SYNC DEBUG] No refresh token available");
          return {
            success: false,
            message:
              "Calendar access expired and no refresh token available. Please reconnect.",
          };
        }
      }

      // Fetch calendar events from Google Calendar API
      console.log("🔍 [SYNC DEBUG] Fetching events from Google Calendar...");

      const eventsResult = await fetchGoogleCalendarEvents(accessToken);

      if (!eventsResult.success) {
        console.log(
          "❌ [SYNC DEBUG] Failed to fetch events:",
          eventsResult.error,
        );

        await ctx.runMutation(
          internal.googleCalendarMutations.updateCalendarConnection,
          {
            userId,
            error: "Failed to fetch events: " + eventsResult.error,
          },
        );

        return {
          success: false,
          message: "Failed to fetch calendar events: " + eventsResult.error,
        };
      }

      console.log(
        "✅ [SYNC DEBUG] Fetched",
        eventsResult.events.length,
        "events from Google Calendar",
      );

      // Store events in our database
      const storedCount = await ctx.runMutation(
        internal.googleCalendarMutations.storeGoogleCalendarEvents,
        {
          userId,
          events: eventsResult.events,
        },
      );

      // Update last sync time
      await ctx.runMutation(
        internal.googleCalendarMutations.updateCalendarConnection,
        {
          userId,
          lastSync: Date.now(),
          error: undefined, // Clear any previous errors
        },
      );

      console.log(
        "✅ [SYNC DEBUG] Successfully stored",
        storedCount,
        "calendar events",
      );

      return {
        success: true,
        message: `Successfully synced ${storedCount} calendar events`,
        eventsCount: storedCount,
      };
    } catch (error) {
      console.error("❌ [SYNC DEBUG] Sync failed:", error);

      // Update connection with error
      await ctx.runMutation(
        internal.googleCalendarMutations.updateCalendarConnection,
        {
          userId,
          error: error instanceof Error ? error.message : "Unknown sync error",
        },
      );

      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to sync calendar events",
      };
    }
  },
});

/**
 * Node.js function to refresh Google OAuth access token
 */
async function refreshAccessToken(refreshToken: string): Promise<{
  success: boolean;
  accessToken?: string;
  expiresAt?: number;
  error?: string;
}> {
  try {
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CALENDAR_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CALENDAR_CLIENT_SECRET!,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      return {
        success: false,
        error: `HTTP ${response.status}: ${errorData}`,
      };
    }

    const data = await response.json();

    return {
      success: true,
      accessToken: data.access_token,
      expiresAt: Date.now() + data.expires_in * 1000, // Convert seconds to milliseconds
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Node.js function to fetch events from Google Calendar API
 */
async function fetchGoogleCalendarEvents(accessToken: string): Promise<{
  success: boolean;
  events: Array<{
    id: string;
    summary: string;
    description?: string;
    start: { dateTime?: string; date?: string };
    end: { dateTime?: string; date?: string };
    location?: string;
    attendees?: Array<{ email: string }>;
  }>;
  error?: string;
}> {
  try {
    // Fetch events from the next 30 days
    const timeMin = new Date().toISOString();
    const timeMax = new Date(
      Date.now() + 30 * 24 * 60 * 60 * 1000,
    ).toISOString();

    const url = new URL(
      "https://www.googleapis.com/calendar/v3/calendars/primary/events",
    );
    url.searchParams.set("timeMin", timeMin);
    url.searchParams.set("timeMax", timeMax);
    url.searchParams.set("singleEvents", "true");
    url.searchParams.set("orderBy", "startTime");
    url.searchParams.set("maxResults", "250");

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.text();
      return {
        success: false,
        events: [],
        error: `HTTP ${response.status}: ${errorData}`,
      };
    }

    const data = await response.json();

    return {
      success: true,
      events: data.items || [],
    };
  } catch (error) {
    return {
      success: false,
      events: [],
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// All database mutations and queries have been moved to googleCalendarMutations.ts
// This file now contains only actions that can use Node.js APIs
