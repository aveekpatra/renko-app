import { httpRouter } from "convex/server";
import { auth } from "./auth";

const http = httpRouter();

// Add auth HTTP routes for authentication flow
auth.addHttpRoutes(http);

// Google Calendar integration is now handled via Next.js API routes:
// - /api/auth/google/calendar/callback - OAuth callback
// - Calendar connection/sync is managed through Convex mutations/actions
// This approach is simpler and avoids conflicts with Convex Auth

export default http;
