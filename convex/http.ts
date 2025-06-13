import { httpRouter } from "convex/server";
import { auth } from "./auth";

const http = httpRouter();

// Add only the necessary auth HTTP API routes (for authentication flow)
// This excludes the default auth pages that Convex Auth might serve
auth.addHttpRoutes(http);

export default http;
