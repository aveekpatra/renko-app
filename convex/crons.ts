import { cronJobs } from "convex/server";

const crons = cronJobs();

// Calendar sync is now manual - users click "Sync" button when needed
// This keeps things simple and gives users control over when to fetch calendar data

export default crons;
