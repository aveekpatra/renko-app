import { httpRouter } from "convex/server";
import { auth } from "./auth";

const http = httpRouter();

// Add auth HTTP routes for authentication flow
auth.addHttpRoutes(http);

export default http;
