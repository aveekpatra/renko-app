import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Sync Google Calendar events every 30 minutes
crons.interval(
  "sync google calendar events",
  { minutes: 30 },
  internal.googleCalendar.syncAllUserCalendars,
  {},
);

// Clean up inactive connections weekly (using cron expression)
crons.cron(
  "cleanup inactive calendar connections",
  "0 2 * * 0", // Every Sunday at 2 AM
  internal.googleCalendar.cleanupInactiveConnections,
  {},
);

export default crons;
