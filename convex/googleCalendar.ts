import {
  query,
  mutation,
  internalQuery,
  internalMutation,
  internalAction,
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
    hasConnections: v.boolean(),
    activeConnections: v.number(),
    totalConnections: v.number(),
    lastSyncAt: v.optional(v.number()),
  }),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return {
        hasConnections: false,
        activeConnections: 0,
        totalConnections: 0,
        lastSyncAt: undefined,
      };
    }

    const connections = await ctx.db
      .query("googleCalendarConnections")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const activeConnections = connections.filter((conn) => conn.isActive);
    const lastSyncAt =
      Math.max(...connections.map((conn) => conn.lastSyncAt || 0)) || undefined;

    return {
      hasConnections: connections.length > 0,
      activeConnections: activeConnections.length,
      totalConnections: connections.length,
      lastSyncAt: lastSyncAt === 0 ? undefined : lastSyncAt,
    };
  },
});

/**
 * Generate calendar connection URL for current user
 */
export const generateCalendarConnectionUrl = mutation({
  args: {
    returnUrl: v.optional(v.string()),
  },
  returns: v.string(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Get the current environment URL
    const baseUrl = process.env.CONVEX_SITE_URL || "http://localhost:3000";
    const returnUrl = args.returnUrl || "/calendar";

    return `${baseUrl}/calendar/auth?userId=${userId}&returnUrl=${encodeURIComponent(returnUrl)}`;
  },
});

/**
 * Store calendar connection (called from HTTP callback)
 */
export const storeCalendarConnection = internalMutation({
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

    // Check if connection already exists for this Google account
    const existingConnection = await ctx.db
      .query("googleCalendarConnections")
      .withIndex("by_user_and_google_account", (q) =>
        q.eq("userId", args.userId).eq("googleAccountId", args.googleAccountId),
      )
      .unique();

    if (existingConnection) {
      // Update existing connection
      await ctx.db.patch(existingConnection._id, {
        accessToken: args.accessToken,
        refreshToken: args.refreshToken,
        expiresAt,
        googleAccountName: args.googleAccountName,
        googleAccountPicture: args.googleAccountPicture,
        isActive: true,
        updatedAt: now,
      });
      return existingConnection._id;
    } else {
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
    }
  },
});

/**
 * Remove calendar connection
 */
export const removeCalendarConnection = internalMutation({
  args: {
    userId: v.id("users"),
    connectionId: v.id("googleCalendarConnections"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    // Verify the connection belongs to the user
    const connection = await ctx.db.get(args.connectionId);
    if (!connection || connection.userId !== args.userId) {
      throw new Error("Connection not found or access denied");
    }

    // Delete associated calendar events
    const events = await ctx.db
      .query("googleCalendarEvents")
      .withIndex("by_connection", (q) =>
        q.eq("connectionId", args.connectionId),
      )
      .collect();

    for (const event of events) {
      await ctx.db.delete(event._id);
    }

    // Delete the connection
    await ctx.db.delete(args.connectionId);
    return null;
  },
});

/**
 * Manually trigger calendar sync for all connections
 */
export const syncAllCalendars = mutation({
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

    // Schedule sync for this user
    await ctx.scheduler.runAfter(0, internal.googleCalendar.syncUserCalendars, {
      userId,
    });

    return {
      success: true,
      message: "Calendar sync started",
    };
  },
});

/**
 * Sync calendars for a specific user (internal action)
 */
export const syncUserCalendars = internalAction({
  args: {
    userId: v.id("users"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    "use node";
    try {
      // Get all active connections for the user
      const connections = await ctx.runQuery(
        internal.googleCalendar.getActiveConnections,
        {
          userId: args.userId,
        },
      );

      for (const connection of connections) {
        try {
          await syncConnectionEvents(ctx, connection);
        } catch (error) {
          console.error(`Failed to sync connection ${connection._id}:`, error);
          // Mark connection as inactive if sync fails
          await ctx.runMutation(
            internal.googleCalendar.markConnectionInactive,
            {
              connectionId: connection._id,
            },
          );
        }
      }
    } catch (error) {
      console.error("Failed to sync user calendars:", error);
    }
    return null;
  },
});

/**
 * Get active connections for a user (internal query)
 */
export const getActiveConnections = internalQuery({
  args: {
    userId: v.id("users"),
  },
  returns: v.array(
    v.object({
      _id: v.id("googleCalendarConnections"),
      accessToken: v.string(),
      refreshToken: v.optional(v.string()),
      expiresAt: v.number(),
      googleAccountEmail: v.string(),
    }),
  ),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("googleCalendarConnections")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
  },
});

/**
 * Mark connection as inactive (internal mutation)
 */
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

/**
 * Sync events for a specific connection
 */
async function syncConnectionEvents(
  ctx: {
    runQuery: (fn: any, args: any) => Promise<any>;
    runMutation: (fn: any, args: any) => Promise<any>;
  },
  connection: {
    _id: string;
    userId: string;
    accessToken: string;
    refreshToken?: string;
    expiresAt: number;
  },
) {
  // Check if token is expired
  if (Date.now() >= connection.expiresAt) {
    if (connection.refreshToken) {
      // Try to refresh the token
      const refreshResponse = await fetch(
        "https://oauth2.googleapis.com/token",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            client_id: process.env.AUTH_GOOGLE_ID!,
            client_secret: process.env.AUTH_GOOGLE_SECRET!,
            refresh_token: connection.refreshToken,
            grant_type: "refresh_token",
          }),
        },
      );

      if (!refreshResponse.ok) {
        throw new Error("Failed to refresh token");
      }

      const tokens = await refreshResponse.json();

      // Update connection with new token
      await ctx.runMutation(internal.googleCalendar.updateConnectionToken, {
        connectionId: connection._id,
        accessToken: tokens.access_token,
        expiresIn: tokens.expires_in,
      });

      connection.accessToken = tokens.access_token;
    } else {
      throw new Error("Token expired and no refresh token available");
    }
  }

  // Fetch calendar events from Google Calendar API
  const now = new Date();
  const twoMonthsAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000); // 60 days ago
  const twoMonthsFromNow = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000); // 60 days from now

  const calendarResponse = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events?` +
      new URLSearchParams({
        timeMin: twoMonthsAgo.toISOString(),
        timeMax: twoMonthsFromNow.toISOString(),
        singleEvents: "true",
        orderBy: "startTime",
        maxResults: "250",
      }),
    {
      headers: {
        Authorization: `Bearer ${connection.accessToken}`,
      },
    },
  );

  if (!calendarResponse.ok) {
    throw new Error(
      `Calendar API request failed: ${calendarResponse.statusText}`,
    );
  }

  const calendarData = await calendarResponse.json();
  const events = calendarData.items || [];

  // Update events in database
  for (const event of events) {
    if (!event.start?.dateTime || !event.end?.dateTime) {
      continue; // Skip all-day events for now
    }

    const eventData = {
      userId: connection.userId,
      connectionId: connection._id,
      eventId: event.id,
      summary: event.summary || "Untitled Event",
      description: event.description || "",
      startTime: event.start.dateTime,
      endTime: event.end.dateTime,
      location: event.location || "",
      attendees: (event.attendees || []).map(
        (attendee: { email: string }) => attendee.email,
      ),
      etag: event.etag,
      updatedAt: Date.now(),
    };

    const existingEvent = await ctx.runQuery(
      internal.googleCalendar.getEventByConnectionAndId,
      {
        connectionId: connection._id,
        eventId: event.id,
      },
    );

    if (existingEvent) {
      // Update existing event if etag changed
      if (existingEvent.etag !== event.etag) {
        await ctx.runMutation(internal.googleCalendar.updateEvent, {
          eventDbId: existingEvent._id,
          ...eventData,
        });
      }
    } else {
      // Create new event
      await ctx.runMutation(internal.googleCalendar.createEvent, {
        ...eventData,
        createdAt: Date.now(),
      });
    }
  }

  // Mark connection as synced
  await ctx.runMutation(internal.googleCalendar.updateConnectionSyncTime, {
    connectionId: connection._id,
  });
}

/**
 * Update connection token (internal mutation)
 */
export const updateConnectionToken = internalMutation({
  args: {
    connectionId: v.id("googleCalendarConnections"),
    accessToken: v.string(),
    expiresIn: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const expiresAt = Date.now() + args.expiresIn * 1000;
    await ctx.db.patch(args.connectionId, {
      accessToken: args.accessToken,
      expiresAt,
      updatedAt: Date.now(),
    });
    return null;
  },
});

/**
 * Update connection sync time (internal mutation)
 */
export const updateConnectionSyncTime = internalMutation({
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
 * Get event by connection and event ID (internal query)
 */
export const getEventByConnectionAndId = internalQuery({
  args: {
    connectionId: v.id("googleCalendarConnections"),
    eventId: v.string(),
  },
  returns: v.union(
    v.object({
      _id: v.id("googleCalendarEvents"),
      etag: v.string(),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    const event = await ctx.db
      .query("googleCalendarEvents")
      .withIndex("by_connection_and_event", (q) =>
        q.eq("connectionId", args.connectionId).eq("eventId", args.eventId),
      )
      .unique();

    return event ? { _id: event._id, etag: event.etag } : null;
  },
});

/**
 * Create new event (internal mutation)
 */
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
    createdAt: v.number(),
    updatedAt: v.number(),
  },
  returns: v.id("googleCalendarEvents"),
  handler: async (ctx, args) => {
    return await ctx.db.insert("googleCalendarEvents", args);
  },
});

/**
 * Update existing event (internal mutation)
 */
export const updateEvent = internalMutation({
  args: {
    eventDbId: v.id("googleCalendarEvents"),
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
    updatedAt: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { eventDbId, ...updateData } = args;
    await ctx.db.patch(eventDbId, updateData);
    return null;
  },
});

/**
 * Get all Google Calendar events for the current user
 */
export const getAllCalendarEvents = query({
  args: {},
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
      googleAccountEmail: v.string(),
      googleAccountName: v.string(),
    }),
  ),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const events = await ctx.db
      .query("googleCalendarEvents")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    // Get connection info for each event
    const eventsWithConnectionInfo = [];
    for (const event of events) {
      const connection = await ctx.db.get(event.connectionId);
      if (connection && connection.isActive) {
        eventsWithConnectionInfo.push({
          _id: event._id,
          eventId: event.eventId,
          summary: event.summary,
          description: event.description,
          startTime: event.startTime,
          endTime: event.endTime,
          location: event.location,
          attendees: event.attendees,
          googleAccountEmail: connection.googleAccountEmail,
          googleAccountName: connection.googleAccountName,
        });
      }
    }

    return eventsWithConnectionInfo;
  },
});

/**
 * Sync calendars for all users (cron job)
 */
export const syncAllUserCalendars = internalAction({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    "use node";
    try {
      // Get all users with active calendar connections
      const connections = await ctx.runQuery(
        internal.googleCalendar.getAllActiveConnections,
      );

      // Group connections by user to avoid duplicate sync jobs
      const userIds = new Set(connections.map((conn) => conn.userId));

      for (const userId of userIds) {
        try {
          await ctx.runAction(internal.googleCalendar.syncUserCalendars, {
            userId,
          });
        } catch (error) {
          console.error(`Failed to sync calendars for user ${userId}:`, error);
        }
      }

      console.log(`Synced calendars for ${userIds.size} users`);
    } catch (error) {
      console.error("Failed to sync all user calendars:", error);
    }
    return null;
  },
});

/**
 * Get all active connections (for cron jobs)
 */
export const getAllActiveConnections = internalQuery({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("googleCalendarConnections"),
      userId: v.id("users"),
    }),
  ),
  handler: async (ctx) => {
    return await ctx.db
      .query("googleCalendarConnections")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
  },
});

/**
 * Clean up inactive connections and old events (cron job)
 */
export const cleanupInactiveConnections = internalAction({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    "use node";
    try {
      // Get connections that haven't synced in over 30 days
      const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
      const inactiveConnections = await ctx.runQuery(
        internal.googleCalendar.getInactiveConnections,
        { cutoffTime: thirtyDaysAgo },
      );

      for (const connection of inactiveConnections) {
        try {
          // Delete associated events
          await ctx.runMutation(
            internal.googleCalendar.deleteConnectionEvents,
            {
              connectionId: connection._id,
            },
          );

          // Delete the connection
          await ctx.runMutation(internal.googleCalendar.deleteConnection, {
            connectionId: connection._id,
          });

          console.log(`Cleaned up inactive connection ${connection._id}`);
        } catch (error) {
          console.error(
            `Failed to cleanup connection ${connection._id}:`,
            error,
          );
        }
      }

      console.log(
        `Cleaned up ${inactiveConnections.length} inactive connections`,
      );
    } catch (error) {
      console.error("Failed to cleanup inactive connections:", error);
    }
    return null;
  },
});

/**
 * Get inactive connections (internal query)
 */
export const getInactiveConnections = internalQuery({
  args: {
    cutoffTime: v.number(),
  },
  returns: v.array(
    v.object({
      _id: v.id("googleCalendarConnections"),
      userId: v.id("users"),
    }),
  ),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("googleCalendarConnections")
      .filter((q) =>
        q.or(
          q.eq(q.field("isActive"), false),
          q.and(
            q.neq(q.field("lastSyncAt"), undefined),
            q.lt(q.field("lastSyncAt"), args.cutoffTime),
          ),
        ),
      )
      .collect();
  },
});

/**
 * Delete all events for a connection (internal mutation)
 */
export const deleteConnectionEvents = internalMutation({
  args: {
    connectionId: v.id("googleCalendarConnections"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const events = await ctx.db
      .query("googleCalendarEvents")
      .withIndex("by_connection", (q) =>
        q.eq("connectionId", args.connectionId),
      )
      .collect();

    for (const event of events) {
      await ctx.db.delete(event._id);
    }

    return null;
  },
});

/**
 * Delete a connection (internal mutation)
 */
export const deleteConnection = internalMutation({
  args: {
    connectionId: v.id("googleCalendarConnections"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.delete(args.connectionId);
    return null;
  },
});
