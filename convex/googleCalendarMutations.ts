import {
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

/**
 * Check if user has calendar access through their existing auth token
 */
export const getCalendarStatus = query({
  args: {},
  returns: v.object({
    connected: v.boolean(),
    hasCalendarScope: v.boolean(),
    email: v.optional(v.string()),
    lastSync: v.optional(v.number()),
    error: v.optional(v.string()),
  }),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return {
        connected: false,
        hasCalendarScope: false,
      };
    }

    // Check if user has existing calendar connection
    const user = await ctx.db.get(userId);
    if (!user) {
      return {
        connected: false,
        hasCalendarScope: false,
      };
    }

    // In the unified approach, calendar access is determined by the OAuth scopes
    // granted during initial authentication. We'll check this via the user's auth data.
    const calendarConnection = await ctx.db
      .query("calendarConnections")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    return {
      connected: !!calendarConnection,
      hasCalendarScope: !!calendarConnection?.hasCalendarScope,
      email: calendarConnection?.email,
      lastSync: calendarConnection?.lastSync,
      error: calendarConnection?.error,
    };
  },
});

/**
 * Initialize calendar connection - now with proper token storage
 */
export const initializeCalendarConnection = mutation({
  args: {
    accessToken: v.optional(v.string()),
    refreshToken: v.optional(v.string()),
    expiresAt: v.optional(v.number()),
    email: v.optional(v.string()),
  },
  returns: v.object({
    success: v.boolean(),
    message: v.string(),
  }),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    console.log(
      "🔍 [INIT DEBUG] Initializing calendar connection for user:",
      userId,
    );
    console.log("🔍 [INIT DEBUG] Args received:", {
      hasAccessToken: !!args.accessToken,
      hasRefreshToken: !!args.refreshToken,
      hasEmail: !!args.email,
      hasExpiresAt: !!args.expiresAt,
    });

    // Validate required tokens
    if (!args.accessToken || !args.email || !args.expiresAt) {
      console.log("❌ [INIT DEBUG] Missing required fields:", {
        accessToken: !!args.accessToken,
        email: !!args.email,
        expiresAt: !!args.expiresAt,
      });
      return {
        success: false,
        message:
          "Missing required authentication data. Please try connecting your calendar again.",
      };
    }

    // Check if connection already exists
    const existingConnection = await ctx.db
      .query("calendarConnections")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (existingConnection) {
      // Update existing connection
      await ctx.db.patch(existingConnection._id, {
        hasCalendarScope: true,
        email: args.email!,
        connectedAt: Date.now(),
        error: undefined, // Clear any previous errors
      });

      // Store/update tokens securely
      await ctx.db.patch(existingConnection._id, {
        // Note: In production, tokens should be encrypted
        accessToken: args.accessToken!,
        refreshToken: args.refreshToken,
        expiresAt: args.expiresAt!,
      });

      console.log("✅ [INIT DEBUG] Updated existing calendar connection");
    } else {
      // Create new connection
      await ctx.db.insert("calendarConnections", {
        userId,
        hasCalendarScope: true,
        email: args.email!,
        connectedAt: Date.now(),
        accessToken: args.accessToken!,
        refreshToken: args.refreshToken,
        expiresAt: args.expiresAt!,
      });

      console.log("✅ [INIT DEBUG] Created new calendar connection");
    }

    return {
      success: true,
      message: "Calendar connection initialized successfully",
    };
  },
});

/**
 * Store Google Calendar events in the database
 */
export const storeGoogleCalendarEvents = internalMutation({
  args: {
    userId: v.id("users"),
    events: v.array(
      v.object({
        id: v.string(),
        summary: v.string(),
        description: v.optional(v.string()),
        start: v.object({
          dateTime: v.optional(v.string()),
          date: v.optional(v.string()),
        }),
        end: v.object({
          dateTime: v.optional(v.string()),
          date: v.optional(v.string()),
        }),
        location: v.optional(v.string()),
        attendees: v.optional(
          v.array(
            v.object({
              email: v.string(),
            }),
          ),
        ),
      }),
    ),
  },
  returns: v.number(),
  handler: async (ctx, args) => {
    let storedCount = 0;

    for (const event of args.events) {
      // Check if event already exists
      const existingEvent = await ctx.db
        .query("unifiedGoogleCalendarEvents")
        .withIndex("by_user_and_event", (q) =>
          q.eq("userId", args.userId).eq("eventId", event.id),
        )
        .first();

      // Determine start and end times
      const startTime = event.start.dateTime || event.start.date;
      const endTime = event.end.dateTime || event.end.date;

      if (!startTime || !endTime) {
        console.warn("Skipping event with missing start/end time:", event.id);
        continue;
      }

      // Extract attendee emails
      const attendees = event.attendees?.map((a) => a.email) || [];

      if (existingEvent) {
        // Update existing event
        await ctx.db.patch(existingEvent._id, {
          summary: event.summary,
          description: event.description,
          startTime,
          endTime,
          location: event.location,
          attendees,
          updatedAt: Date.now(),
        });
      } else {
        // Create new event
        await ctx.db.insert("unifiedGoogleCalendarEvents", {
          userId: args.userId,
          eventId: event.id,
          summary: event.summary,
          description: event.description,
          startTime,
          endTime,
          location: event.location,
          attendees,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
        storedCount++;
      }
    }

    return storedCount;
  },
});

/**
 * Internal query to get calendar connection with tokens
 */
export const getCalendarConnectionWithTokens = internalQuery({
  args: { userId: v.id("users") },
  returns: v.union(
    v.object({
      _id: v.id("calendarConnections"),
      userId: v.id("users"),
      hasCalendarScope: v.boolean(),
      email: v.string(),
      connectedAt: v.number(),
      lastSync: v.optional(v.number()),
      error: v.optional(v.string()),
      accessToken: v.optional(v.string()),
      refreshToken: v.optional(v.string()),
      expiresAt: v.optional(v.number()),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("calendarConnections")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();
  },
});

/**
 * Internal mutation to update connection tokens
 */
export const updateConnectionTokens = internalMutation({
  args: {
    userId: v.id("users"),
    accessToken: v.string(),
    expiresAt: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const connection = await ctx.db
      .query("calendarConnections")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (connection) {
      await ctx.db.patch(connection._id, {
        accessToken: args.accessToken,
        expiresAt: args.expiresAt,
      });
    }
    return null;
  },
});

/**
 * Internal query to get a Google Calendar event by event ID
 */
export const getGoogleCalendarEventByEventId = internalQuery({
  args: {
    eventId: v.string(),
    userId: v.id("users"),
  },
  returns: v.union(
    v.object({
      _id: v.id("unifiedGoogleCalendarEvents"),
      _creationTime: v.number(),
      userId: v.id("users"),
      eventId: v.string(),
      summary: v.string(),
      description: v.optional(v.string()),
      startTime: v.string(),
      endTime: v.string(),
      location: v.optional(v.string()),
      attendees: v.array(v.string()),
      createdAt: v.number(),
      updatedAt: v.number(),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("unifiedGoogleCalendarEvents")
      .withIndex("by_user_and_event", (q) =>
        q.eq("userId", args.userId).eq("eventId", args.eventId),
      )
      .first();
  },
});

/**
 * Internal mutation to create a Google Calendar event
 */
export const createGoogleCalendarEvent = internalMutation({
  args: {
    eventId: v.string(),
    summary: v.string(),
    description: v.optional(v.string()),
    startTime: v.string(),
    endTime: v.string(),
    location: v.optional(v.string()),
    attendees: v.array(v.string()),
    userId: v.id("users"),
  },
  returns: v.id("unifiedGoogleCalendarEvents"),
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("unifiedGoogleCalendarEvents", {
      userId: args.userId,
      eventId: args.eventId,
      summary: args.summary,
      description: args.description,
      startTime: args.startTime,
      endTime: args.endTime,
      location: args.location,
      attendees: args.attendees,
      createdAt: now,
      updatedAt: now,
    });
  },
});

/**
 * Internal mutation to update a Google Calendar event
 */
export const updateGoogleCalendarEvent = internalMutation({
  args: {
    eventDocId: v.id("unifiedGoogleCalendarEvents"),
    summary: v.string(),
    description: v.optional(v.string()),
    startTime: v.string(),
    endTime: v.string(),
    location: v.optional(v.string()),
    attendees: v.array(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.eventDocId, {
      summary: args.summary,
      description: args.description,
      startTime: args.startTime,
      endTime: args.endTime,
      location: args.location,
      attendees: args.attendees,
      updatedAt: Date.now(),
    });
    return null;
  },
});

/**
 * Internal mutation to update calendar connection
 */
export const updateCalendarConnection = internalMutation({
  args: {
    userId: v.id("users"),
    lastSync: v.optional(v.number()),
    error: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const connection = await ctx.db
      .query("calendarConnections")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (connection) {
      const updateData: any = {};
      if (args.lastSync !== undefined) {
        updateData.lastSync = args.lastSync;
      }
      if (args.error !== undefined) {
        updateData.error = args.error;
      }

      await ctx.db.patch(connection._id, updateData);
    }
    return null;
  },
});

/**
 * Disconnect calendar and clean up connections
 */
export const disconnectCalendar = mutation({
  args: {},
  returns: v.object({
    success: v.boolean(),
    message: v.string(),
  }),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    console.log(
      "🔍 [DISCONNECT DEBUG] Disconnecting calendar for user:",
      userId,
    );

    // Find and remove calendar connection
    const connection = await ctx.db
      .query("calendarConnections")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (connection) {
      console.log("🗑️ [DISCONNECT DEBUG] Removing connection:", {
        email: connection.email,
        isFake: connection.email === "user@example.com",
      });

      await ctx.db.delete(connection._id);

      // Also clean up any associated events
      const events = await ctx.db
        .query("unifiedGoogleCalendarEvents")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .collect();

      console.log(
        "🗑️ [DISCONNECT DEBUG] Removing",
        events.length,
        "calendar events",
      );

      for (const event of events) {
        await ctx.db.delete(event._id);
      }
    }

    console.log("✅ [DISCONNECT DEBUG] Calendar disconnected successfully");

    return {
      success: true,
      message:
        "Calendar disconnected successfully. You can now reconnect with proper permissions.",
    };
  },
});
