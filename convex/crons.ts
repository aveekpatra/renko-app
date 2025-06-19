import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";
import { internalAction } from "./_generated/server";
import { v } from "convex/values";

/**
 * Sync Google Calendar events for all users with connected calendars
 */
const syncGoogleCalendars = internalAction({
  args: {},
  returns: v.null(),
  handler: async (ctx, args) => {
    try {
      // Get all users with Google Calendar tokens
      const users = await ctx.runQuery(
        internal.googleCalendar.getUsersWithTokens,
      );

      const now = new Date();
      const timeMin = now.toISOString();
      const timeMax = new Date(
        now.getTime() + 30 * 24 * 60 * 60 * 1000,
      ).toISOString(); // 30 days ahead

      let syncCount = 0;
      let errorCount = 0;

      for (const user of users) {
        try {
          const result = await ctx.runAction(
            internal.googleCalendar.fetchAndCacheGoogleCalendarEvents,
            {
              userId: user.userId,
              timeMin,
              timeMax,
            },
          );

          if (result.success) {
            syncCount++;
            console.log(
              `Synced ${result.eventCount} events for user ${user.userId}`,
            );
          } else {
            errorCount++;
            console.error(
              `Failed to sync calendar for user ${user.userId}:`,
              result.error,
            );
          }
        } catch (error) {
          errorCount++;
          console.error(
            `Error syncing calendar for user ${user.userId}:`,
            error,
          );
        }
      }

      console.log(
        `Calendar sync completed: ${syncCount} users synced, ${errorCount} errors`,
      );
    } catch (error) {
      console.error("Calendar sync job failed:", error);
    }

    return null;
  },
});

/**
 * Clean up old cached calendar events (older than 60 days)
 */
const cleanupOldCalendarEvents = internalAction({
  args: {},
  returns: v.null(),
  handler: async (ctx, args) => {
    try {
      const cutoffDate = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000); // 60 days ago
      const deleted = await ctx.runMutation(
        internal.googleCalendar.deleteOldCachedEvents,
        {
          cutoffDate: cutoffDate.toISOString(),
        },
      );

      console.log(`Cleaned up ${deleted} old calendar events`);
    } catch (error) {
      console.error("Calendar cleanup job failed:", error);
    }

    return null;
  },
});

const crons = cronJobs();

// Sync Google Calendar events every 30 minutes
crons.interval(
  "sync google calendars",
  { minutes: 30 },
  internal.crons.syncGoogleCalendars,
  {},
);

// Clean up old cached events daily at 2 AM
crons.cron(
  "cleanup old calendar events",
  "0 2 * * *",
  internal.crons.cleanupOldCalendarEvents,
  {},
);

export default crons;
