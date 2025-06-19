import { v } from "convex/values";
import { mutation, query, action } from "./_generated/server";
import { internal } from "./_generated/api";

// Google Calendar OAuth configuration
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;

// Google Calendar API scopes
const CALENDAR_SCOPES = [
  "https://www.googleapis.com/auth/calendar",
  "https://www.googleapis.com/auth/calendar.events",
].join(" ");

/**
 * Generate Google OAuth URL for calendar authorization
 */
export const generateGoogleAuthUrl = query({
  args: { userId: v.id("users") },
  returns: v.string(),
  handler: async (ctx, args) => {
    const state = JSON.stringify({ userId: args.userId });
    const params = new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID!,
      redirect_uri: GOOGLE_REDIRECT_URI!,
      scope: CALENDAR_SCOPES,
      response_type: "code",
      access_type: "offline",
      prompt: "consent",
      state: Buffer.from(state).toString("base64"),
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  },
});

/**
 * Exchange authorization code for access tokens
 */
export const exchangeCodeForTokens = action({
  args: {
    code: v.string(),
    state: v.string(),
  },
  returns: v.object({
    success: v.boolean(),
    userId: v.optional(v.id("users")),
    error: v.optional(v.string()),
  }),
  handler: async (ctx, args) => {
    try {
      const stateData = JSON.parse(
        Buffer.from(args.state, "base64").toString(),
      );
      const userId = stateData.userId;

      const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_id: GOOGLE_CLIENT_ID!,
          client_secret: GOOGLE_CLIENT_SECRET!,
          code: args.code,
          grant_type: "authorization_code",
          redirect_uri: GOOGLE_REDIRECT_URI!,
        }),
      });

      const tokens = await tokenResponse.json();

      if (tokens.error) {
        throw new Error(tokens.error_description || tokens.error);
      }

      // Store tokens in database
      await ctx.runMutation(internal.googleCalendar.storeUserTokens, {
        userId,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt: Date.now() + tokens.expires_in * 1000,
      });

      return { success: true, userId };
    } catch (error) {
      console.error("Token exchange failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
});

/**
 * Store user's Google Calendar tokens
 */
export const storeUserTokens = mutation({
  args: {
    userId: v.id("users"),
    accessToken: v.string(),
    refreshToken: v.string(),
    expiresAt: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    // Check if user already has calendar integration
    const existing = await ctx.db
      .query("googleCalendarTokens")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        accessToken: args.accessToken,
        refreshToken: args.refreshToken,
        expiresAt: args.expiresAt,
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("googleCalendarTokens", {
        userId: args.userId,
        accessToken: args.accessToken,
        refreshToken: args.refreshToken,
        expiresAt: args.expiresAt,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
    return null;
  },
});

/**
 * Get valid access token for user (refresh if needed)
 */
export const getValidAccessToken = action({
  args: { userId: v.id("users") },
  returns: v.union(v.string(), v.null()),
  handler: async (ctx, args) => {
    const tokens = await ctx.runQuery(internal.googleCalendar.getUserTokens, {
      userId: args.userId,
    });

    if (!tokens) return null;

    // Check if token is still valid (with 5-minute buffer)
    if (tokens.expiresAt > Date.now() + 300000) {
      return tokens.accessToken;
    }

    // Refresh the token
    try {
      const refreshResponse = await fetch(
        "https://oauth2.googleapis.com/token",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            client_id: GOOGLE_CLIENT_ID!,
            client_secret: GOOGLE_CLIENT_SECRET!,
            refresh_token: tokens.refreshToken,
            grant_type: "refresh_token",
          }),
        },
      );

      const newTokens = await refreshResponse.json();

      if (newTokens.error) {
        console.error("Token refresh failed:", newTokens.error);
        return null;
      }

      // Update stored tokens
      await ctx.runMutation(internal.googleCalendar.storeUserTokens, {
        userId: args.userId,
        accessToken: newTokens.access_token,
        refreshToken: tokens.refreshToken, // Keep existing refresh token if not provided
        expiresAt: Date.now() + newTokens.expires_in * 1000,
      });

      return newTokens.access_token;
    } catch (error) {
      console.error("Token refresh error:", error);
      return null;
    }
  },
});

/**
 * Get user's stored Google Calendar tokens
 */
export const getUserTokens = query({
  args: { userId: v.id("users") },
  returns: v.union(
    v.object({
      accessToken: v.string(),
      refreshToken: v.string(),
      expiresAt: v.number(),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    const tokens = await ctx.db
      .query("googleCalendarTokens")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .unique();

    if (!tokens) return null;

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresAt: tokens.expiresAt,
    };
  },
});

/**
 * Sync task to Google Calendar
 */
export const syncTaskToGoogleCalendar = action({
  args: {
    userId: v.id("users"),
    taskId: v.id("tasks"),
    startTime: v.string(), // ISO format
    endTime: v.string(), // ISO format
  },
  returns: v.object({
    success: v.boolean(),
    eventId: v.optional(v.string()),
    error: v.optional(v.string()),
  }),
  handler: async (ctx, args) => {
    try {
      const accessToken = await ctx.runAction(
        internal.googleCalendar.getValidAccessToken,
        {
          userId: args.userId,
        },
      );

      if (!accessToken) {
        return { success: false, error: "No valid access token found" };
      }

      const task = await ctx.runQuery(internal.tasks.getTask, {
        taskId: args.taskId,
      });
      if (!task) {
        return { success: false, error: "Task not found" };
      }

      const event = {
        summary: task.title,
        description: task.description || "",
        start: {
          dateTime: args.startTime,
          timeZone: "UTC",
        },
        end: {
          dateTime: args.endTime,
          timeZone: "UTC",
        },
        colorId: getGoogleCalendarColorId(task.priority),
      };

      const response = await fetch(
        "https://www.googleapis.com/calendar/v3/calendars/primary/events",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(event),
        },
      );

      const result = await response.json();

      if (result.error) {
        return { success: false, error: result.error.message };
      }

      // Store the Google Calendar event ID with the task
      await ctx.runMutation(internal.tasks.updateTaskGoogleEventId, {
        taskId: args.taskId,
        googleEventId: result.id,
      });

      return { success: true, eventId: result.id };
    } catch (error) {
      console.error("Failed to sync task to Google Calendar:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
});

/**
 * Fetch and cache Google Calendar events
 */
export const fetchAndCacheGoogleCalendarEvents = action({
  args: {
    userId: v.id("users"),
    timeMin: v.string(), // ISO format
    timeMax: v.string(), // ISO format
  },
  returns: v.object({
    success: v.boolean(),
    eventCount: v.optional(v.number()),
    error: v.optional(v.string()),
  }),
  handler: async (ctx, args) => {
    try {
      const accessToken = await ctx.runAction(
        internal.googleCalendar.getValidAccessToken,
        {
          userId: args.userId,
        },
      );

      if (!accessToken) {
        return { success: false, error: "No valid access token found" };
      }

      const url = new URL(
        "https://www.googleapis.com/calendar/v3/calendars/primary/events",
      );
      url.searchParams.set("timeMin", args.timeMin);
      url.searchParams.set("timeMax", args.timeMax);
      url.searchParams.set("singleEvents", "true");
      url.searchParams.set("orderBy", "startTime");
      url.searchParams.set("maxResults", "250");

      const response = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();

      if (data.error) {
        return { success: false, error: data.error.message };
      }

      // Cache events in database
      const events = data.items || [];
      for (const event of events) {
        await ctx.runMutation(internal.googleCalendar.cacheCalendarEvent, {
          userId: args.userId,
          eventId: event.id,
          summary: event.summary || "",
          description: event.description || "",
          startTime: event.start?.dateTime || event.start?.date,
          endTime: event.end?.dateTime || event.end?.date,
          location: event.location || "",
          attendees: event.attendees?.map((a: any) => a.email) || [],
          etag: event.etag,
        });
      }

      return { success: true, eventCount: events.length };
    } catch (error) {
      console.error("Failed to fetch Google Calendar events:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
});

/**
 * Cache a Google Calendar event
 */
export const cacheCalendarEvent = mutation({
  args: {
    userId: v.id("users"),
    eventId: v.string(),
    summary: v.string(),
    description: v.string(),
    startTime: v.string(),
    endTime: v.string(),
    location: v.string(),
    attendees: v.array(v.string()),
    etag: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("googleCalendarEvents")
      .withIndex("by_user_and_event", (q) =>
        q.eq("userId", args.userId).eq("eventId", args.eventId),
      )
      .unique();

    if (existing) {
      // Update if etag has changed (event was modified)
      if (existing.etag !== args.etag) {
        await ctx.db.patch(existing._id, {
          summary: args.summary,
          description: args.description,
          startTime: args.startTime,
          endTime: args.endTime,
          location: args.location,
          attendees: args.attendees,
          etag: args.etag,
          updatedAt: Date.now(),
        });
      }
    } else {
      await ctx.db.insert("googleCalendarEvents", {
        userId: args.userId,
        eventId: args.eventId,
        summary: args.summary,
        description: args.description,
        startTime: args.startTime,
        endTime: args.endTime,
        location: args.location,
        attendees: args.attendees,
        etag: args.etag,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
    return null;
  },
});

/**
 * Get cached Google Calendar events for a user
 */
export const getCachedCalendarEvents = query({
  args: {
    userId: v.id("users"),
    startDate: v.string(),
    endDate: v.string(),
  },
  returns: v.array(
    v.object({
      _id: v.id("googleCalendarEvents"),
      eventId: v.string(),
      summary: v.string(),
      description: v.string(),
      startTime: v.string(),
      endTime: v.string(),
      location: v.string(),
      attendees: v.array(v.string()),
    }),
  ),
  handler: async (ctx, args) => {
    const events = await ctx.db
      .query("googleCalendarEvents")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) =>
        q.and(
          q.gte(q.field("startTime"), args.startDate),
          q.lte(q.field("startTime"), args.endDate),
        ),
      )
      .collect();

    return events.map((event) => ({
      _id: event._id,
      eventId: event.eventId,
      summary: event.summary,
      description: event.description,
      startTime: event.startTime,
      endTime: event.endTime,
      location: event.location,
      attendees: event.attendees,
    }));
  },
});

/**
 * Get all users with Google Calendar tokens (for cron sync)
 */
export const getUsersWithTokens = query({
  args: {},
  returns: v.array(
    v.object({
      userId: v.id("users"),
    }),
  ),
  handler: async (ctx) => {
    const tokens = await ctx.db.query("googleCalendarTokens").collect();

    return tokens.map((token) => ({
      userId: token.userId,
    }));
  },
});

/**
 * Delete old cached calendar events
 */
export const deleteOldCachedEvents = mutation({
  args: { cutoffDate: v.string() },
  returns: v.number(),
  handler: async (ctx, args) => {
    const oldEvents = await ctx.db
      .query("googleCalendarEvents")
      .filter((q) => q.lt(q.field("startTime"), args.cutoffDate))
      .collect();

    for (const event of oldEvents) {
      await ctx.db.delete(event._id);
    }

    return oldEvents.length;
  },
});

// Helper function to map task priority to Google Calendar color
function getGoogleCalendarColorId(priority: string): string {
  switch (priority) {
    case "urgent":
      return "11"; // Red
    case "high":
      return "9"; // Blue
    case "normal":
      return "2"; // Green
    case "low":
      return "5"; // Yellow
    default:
      return "1"; // Lavender
  }
}
