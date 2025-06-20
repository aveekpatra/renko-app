import {
  query,
  mutation,
  internalQuery,
  internalMutation,
  internalAction,
  action,
} from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";

/**
 * Get all calendar connections for the current user
 */
export const getCalendarConnections = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("googleCalendarConnections"),
      googleAccountEmail: v.string(),
      googleAccountName: v.string(),
      googleAccountPicture: v.optional(v.string()),
      isActive: v.boolean(),
      lastSyncAt: v.optional(v.number()),
      createdAt: v.number(),
    }),
  ),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const connections = await ctx.db
      .query("googleCalendarConnections")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    return connections.map((conn) => ({
      _id: conn._id,
      googleAccountEmail: conn.googleAccountEmail,
      googleAccountName: conn.googleAccountName,
      googleAccountPicture: conn.googleAccountPicture,
      isActive: conn.isActive,
      lastSyncAt: conn.lastSyncAt,
      createdAt: conn.createdAt,
    }));
  },
});

/**
 * Get calendar connection status for current user
 */
export const getCalendarStatus = query({
  args: {},
  returns: v.object({
    hasConnection: v.boolean(),
    email: v.optional(v.string()),
    lastSyncAt: v.optional(v.number()),
  }),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return { hasConnection: false };
    }

    const connection = await ctx.db
      .query("googleCalendarConnections")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!connection || !connection.isActive) {
      return { hasConnection: false };
    }

    return {
      hasConnection: true,
      email: connection.googleAccountEmail,
      lastSyncAt: connection.lastSyncAt,
    };
  },
});

/**
 * Generate OAuth URL for calendar connection
 */
export const generateCalendarOAuthUrl = mutation({
  args: {},
  returns: v.string(),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const clientId = process.env.GOOGLE_CALENDAR_CLIENT_ID;
    if (!clientId) {
      throw new Error("Google Calendar OAuth not configured");
    }

    const redirectUri =
      process.env.SITE_URL + "/api/auth/google/calendar/callback";

    // Simplified scopes - start with just calendar access
    const scopes = [
      "https://www.googleapis.com/auth/calendar.readonly",
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/userinfo.profile",
    ].join(" ");

    const state = JSON.stringify({ userId, type: "calendar" });

    // Use the standard OAuth 2.0 authorization endpoint
    const oauthUrl = new URL("https://accounts.google.com/o/oauth2/auth");
    oauthUrl.searchParams.set("client_id", clientId);
    oauthUrl.searchParams.set("redirect_uri", redirectUri);
    oauthUrl.searchParams.set("response_type", "code");
    oauthUrl.searchParams.set("scope", scopes);
    oauthUrl.searchParams.set("state", state);
    oauthUrl.searchParams.set("access_type", "offline");
    oauthUrl.searchParams.set("prompt", "consent");
    oauthUrl.searchParams.set("include_granted_scopes", "true");

    console.log("🔗 Generated OAuth URL:", oauthUrl.toString());
    console.log("📋 OAuth parameters:", {
      client_id: clientId,
      redirect_uri: redirectUri,
      scopes: scopes,
      state: state,
    });

    return oauthUrl.toString();
  },
});

/**
 * Store calendar connection from OAuth callback
 */
export const storeCalendarConnection = mutation({
  args: {
    userId: v.id("users"),
    accessToken: v.string(),
    refreshToken: v.optional(v.string()),
    expiresIn: v.number(),
    googleAccountId: v.string(),
    googleAccountEmail: v.string(),
    googleAccountName: v.string(),
    googleAccountPicture: v.optional(v.string()),
  },
  returns: v.id("googleCalendarConnections"),
  handler: async (ctx, args) => {
    const now = Date.now();
    const expiresAt = now + args.expiresIn * 1000;

    // Remove any existing connections for this user
    const existingConnections = await ctx.db
      .query("googleCalendarConnections")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    for (const conn of existingConnections) {
      await ctx.db.delete(conn._id);
    }

    // Create new connection
    return await ctx.db.insert("googleCalendarConnections", {
      userId: args.userId,
      googleAccountId: args.googleAccountId,
      googleAccountEmail: args.googleAccountEmail,
      googleAccountName: args.googleAccountName,
      googleAccountPicture: args.googleAccountPicture,
      accessToken: args.accessToken,
      refreshToken: args.refreshToken,
      expiresAt,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
  },
});

/**
 * Disconnect calendar
 */
export const disconnectCalendar = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const connections = await ctx.db
      .query("googleCalendarConnections")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    for (const conn of connections) {
      await ctx.db.delete(conn._id);
    }

    // Also delete associated events
    const events = await ctx.db
      .query("googleCalendarEvents")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    for (const event of events) {
      await ctx.db.delete(event._id);
    }

    return null;
  },
});

/**
 * Get Google Calendar events for display
 */
export const getGoogleCalendarEvents = query({
  args: {
    startDate: v.number(),
    endDate: v.number(),
  },
  returns: v.array(
    v.object({
      _id: v.id("googleCalendarEvents"),
      eventId: v.string(),
      summary: v.string(),
      description: v.optional(v.string()),
      startTime: v.string(),
      endTime: v.string(),
      location: v.optional(v.string()),
      attendees: v.array(v.string()),
      type: v.literal("google"),
    }),
  ),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    // Get events within the date range
    const events = await ctx.db
      .query("googleCalendarEvents")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    // Filter by date range (simplified - you might want better date filtering)
    return events
      .filter((event) => {
        const eventStart = new Date(event.startTime).getTime();
        return eventStart >= args.startDate && eventStart <= args.endDate;
      })
      .map((event) => ({
        _id: event._id,
        eventId: event.eventId,
        summary: event.summary,
        description: event.description,
        startTime: event.startTime,
        endTime: event.endTime,
        location: event.location,
        attendees: event.attendees,
        type: "google" as const,
      }));
  },
});

/**
 * Sync Google Calendar events (called manually or via cron)
 */
export const syncCalendarEvents = action({
  args: {},
  returns: v.object({
    success: v.boolean(),
    message: v.string(),
    eventsAdded: v.number(),
  }),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    try {
      // Get the user's calendar connection
      const connection = await ctx.runQuery(
        internal.googleCalendar.getActiveConnection,
        {
          userId,
        },
      );

      if (!connection) {
        return {
          success: false,
          message: "No active calendar connection found",
          eventsAdded: 0,
        };
      }

      // Fetch events from Google Calendar API
      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events?` +
          new URLSearchParams({
            timeMin: new Date(
              Date.now() - 7 * 24 * 60 * 60 * 1000,
            ).toISOString(), // Last 7 days
            timeMax: new Date(
              Date.now() + 30 * 24 * 60 * 60 * 1000,
            ).toISOString(), // Next 30 days
            singleEvents: "true",
            orderBy: "startTime",
            maxResults: "100",
          }),
        {
          headers: {
            Authorization: `Bearer ${connection.accessToken}`,
          },
        },
      );

      if (!response.ok) {
        if (response.status === 401) {
          // Token expired, mark connection as inactive
          await ctx.runMutation(
            internal.googleCalendar.markConnectionInactive,
            {
              connectionId: connection._id,
            },
          );
          return {
            success: false,
            message: "Calendar connection expired. Please reconnect.",
            eventsAdded: 0,
          };
        }
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const data = await response.json();
      const events = data.items || [];

      let eventsAdded = 0;

      for (const event of events) {
        if (event.id && event.summary) {
          const existingEvent = await ctx.runQuery(
            internal.googleCalendar.getEventByGoogleId,
            {
              userId,
              googleEventId: event.id,
            },
          );

          if (!existingEvent) {
            await ctx.runMutation(internal.googleCalendar.createEvent, {
              userId,
              connectionId: connection._id,
              eventId: event.id,
              summary: event.summary || "Untitled Event",
              description: event.description,
              startTime:
                event.start?.dateTime ||
                event.start?.date ||
                new Date().toISOString(),
              endTime:
                event.end?.dateTime ||
                event.end?.date ||
                new Date().toISOString(),
              location: event.location,
              attendees: (event.attendees || [])
                .map((att: any) => att.email)
                .filter(Boolean),
              etag: event.etag || "",
            });
            eventsAdded++;
          }
        }
      }

      // Update last sync time
      await ctx.runMutation(internal.googleCalendar.updateLastSyncTime, {
        connectionId: connection._id,
      });

      return {
        success: true,
        message: `Successfully synced ${eventsAdded} new events`,
        eventsAdded,
      };
    } catch (error) {
      console.error("Calendar sync error:", error);
      return {
        success: false,
        message: `Sync failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        eventsAdded: 0,
      };
    }
  },
});

// Internal functions for the action to use

export const getActiveConnection = internalQuery({
  args: {
    userId: v.id("users"),
  },
  returns: v.union(
    v.object({
      _id: v.id("googleCalendarConnections"),
      accessToken: v.string(),
      refreshToken: v.optional(v.string()),
      expiresAt: v.number(),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    const connection = await ctx.db
      .query("googleCalendarConnections")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .first();

    if (!connection) {
      return null;
    }

    return {
      _id: connection._id,
      accessToken: connection.accessToken,
      refreshToken: connection.refreshToken,
      expiresAt: connection.expiresAt,
    };
  },
});

export const markConnectionInactive = internalMutation({
  args: {
    connectionId: v.id("googleCalendarConnections"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.connectionId, {
      isActive: false,
      updatedAt: Date.now(),
    });
    return null;
  },
});

export const getEventByGoogleId = internalQuery({
  args: {
    userId: v.id("users"),
    googleEventId: v.string(),
  },
  returns: v.union(
    v.object({
      _id: v.id("googleCalendarEvents"),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    const event = await ctx.db
      .query("googleCalendarEvents")
      .withIndex("by_user_and_event", (q) =>
        q.eq("userId", args.userId).eq("eventId", args.googleEventId),
      )
      .first();

    return event ? { _id: event._id } : null;
  },
});

export const createEvent = internalMutation({
  args: {
    userId: v.id("users"),
    connectionId: v.id("googleCalendarConnections"),
    eventId: v.string(),
    summary: v.string(),
    description: v.optional(v.string()),
    startTime: v.string(),
    endTime: v.string(),
    location: v.optional(v.string()),
    attendees: v.array(v.string()),
    etag: v.string(),
  },
  returns: v.id("googleCalendarEvents"),
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("googleCalendarEvents", {
      userId: args.userId,
      connectionId: args.connectionId,
      eventId: args.eventId,
      summary: args.summary,
      description: args.description,
      startTime: args.startTime,
      endTime: args.endTime,
      location: args.location,
      attendees: args.attendees,
      etag: args.etag,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateLastSyncTime = internalMutation({
  args: {
    connectionId: v.id("googleCalendarConnections"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.connectionId, {
      lastSyncAt: Date.now(),
      updatedAt: Date.now(),
    });
    return null;
  },
});

/**
 * Debug OAuth configuration
 */
export const debugOAuthConfig = query({
  args: {},
  returns: v.object({
    hasClientId: v.boolean(),
    hasClientSecret: v.boolean(),
    siteUrl: v.optional(v.string()),
    redirectUri: v.string(),
    isAuthenticated: v.boolean(),
  }),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);

    return {
      hasClientId: !!process.env.GOOGLE_CALENDAR_CLIENT_ID,
      hasClientSecret: !!process.env.GOOGLE_CALENDAR_CLIENT_SECRET,
      siteUrl: process.env.SITE_URL,
      redirectUri: process.env.SITE_URL + "/api/auth/google/calendar/callback",
      isAuthenticated: !!userId,
    };
  },
});

/**
 * CRITICAL: Google Cloud Console Configuration Guide
 *
 * Based on your callback logs, Google is granting scopes but not returning an authorization code.
 * This is a classic "redirect_uri_mismatch" error in Google Cloud Console.
 *
 * IMMEDIATE ACTION REQUIRED:
 * 1. Go to https://console.cloud.google.com/apis/credentials
 * 2. Find your OAuth 2.0 Client ID: 174352036669-us3f51bd13q48rhbk0h6g83iulu24g6o.apps.googleusercontent.com
 * 3. Click on it to edit
 * 4. In "Authorized redirect URIs" section, add EXACTLY:
 *    http://localhost:3000/api/auth/google/calendar/callback
 * 5. Click "Save"
 *
 * ALSO REQUIRED:
 * 1. Enable Google Calendar API:
 *    - Go to https://console.cloud.google.com/apis/library
 *    - Search for "Google Calendar API"
 *    - Click "Enable"
 *
 * 2. Configure OAuth Consent Screen:
 *    - Go to https://console.cloud.google.com/apis/credentials/consent
 *    - Add your scopes:
 *      - https://www.googleapis.com/auth/calendar.readonly
 *      - https://www.googleapis.com/auth/userinfo.email
 *      - https://www.googleapis.com/auth/userinfo.profile
 *
 * Your callback shows Google granted these scopes but no code - this is redirect URI mismatch!
 */

/**
 * Enhanced Google Cloud Console setup diagnostic with specific fixes
 */
export const diagnoseGoogleCloudSetup = query({
  args: {},
  returns: v.object({
    clientId: v.string(),
    redirectUri: v.string(),
    criticalIssues: v.array(v.string()),
    immediateActions: v.array(v.string()),
    googleCloudConsoleSteps: v.array(v.string()),
  }),
  handler: async (ctx) => {
    const clientId = process.env.GOOGLE_CALENDAR_CLIENT_ID || "NOT_CONFIGURED";
    const siteUrl = process.env.SITE_URL || "http://localhost:3000";
    const redirectUri = siteUrl + "/api/auth/google/calendar/callback";

    const criticalIssues = [
      "🚨 CRITICAL: Google is granting scopes but not returning authorization code",
      "🚨 This is a REDIRECT_URI_MISMATCH error in Google Cloud Console",
      "🚨 Your callback shows scopes were granted but no 'code' parameter",
      "🚨 This means Google Cloud Console redirect URI doesn't match exactly",
    ];

    const immediateActions = [
      "1. Go to https://console.cloud.google.com/apis/credentials",
      "2. Find OAuth Client: " + clientId,
      "3. Click to edit the OAuth 2.0 Client ID",
      "4. In 'Authorized redirect URIs' add EXACTLY: " + redirectUri,
      "5. Click 'Save' and wait 5 minutes for propagation",
      "6. Test OAuth flow again",
    ];

    const googleCloudConsoleSteps = [
      "🔧 STEP 1: Fix Redirect URI Mismatch",
      "- Go to: https://console.cloud.google.com/apis/credentials",
      "- Find your OAuth 2.0 Client ID: " + clientId,
      "- Click on it to edit",
      "- In 'Authorized redirect URIs' section, add EXACTLY:",
      "  " + redirectUri,
      "- Click 'Save'",
      "",
      "🔧 STEP 2: Enable Google Calendar API",
      "- Go to: https://console.cloud.google.com/apis/library",
      "- Search for 'Google Calendar API'",
      "- Click 'Enable'",
      "",
      "🔧 STEP 3: Configure OAuth Consent Screen",
      "- Go to: https://console.cloud.google.com/apis/credentials/consent",
      "- In 'Scopes' section, add these scopes:",
      "  - https://www.googleapis.com/auth/calendar.readonly",
      "  - https://www.googleapis.com/auth/userinfo.email",
      "  - https://www.googleapis.com/auth/userinfo.profile",
      "- Click 'Save'",
      "",
      "🔧 STEP 4: Verify Configuration",
      "- Wait 5-10 minutes for changes to propagate",
      "- Test the OAuth flow again",
      "- Check that authorization code is returned in callback",
    ];

    return {
      clientId,
      redirectUri,
      criticalIssues,
      immediateActions,
      googleCloudConsoleSteps,
    };
  },
});
