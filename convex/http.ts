import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { auth } from "./auth";

const http = httpRouter();

// Add auth HTTP routes for authentication flow
auth.addHttpRoutes(http);

// Independent Google Calendar OAuth
http.route({
  path: "/calendar/auth",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");
    const returnUrl = url.searchParams.get("returnUrl") || "/calendar";

    if (!userId) {
      return new Response("Missing userId parameter", { status: 400 });
    }

    // Google Calendar OAuth URL
    const googleAuthUrl = new URL(
      "https://accounts.google.com/o/oauth2/v2/auth",
    );
    googleAuthUrl.searchParams.set("client_id", process.env.AUTH_GOOGLE_ID!);
    googleAuthUrl.searchParams.set(
      "redirect_uri",
      `${url.origin}/calendar/callback`,
    );
    googleAuthUrl.searchParams.set("response_type", "code");
    googleAuthUrl.searchParams.set(
      "scope",
      "https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events",
    );
    googleAuthUrl.searchParams.set("access_type", "offline");
    googleAuthUrl.searchParams.set("prompt", "consent");
    googleAuthUrl.searchParams.set(
      "state",
      JSON.stringify({ userId, returnUrl }),
    );

    return Response.redirect(googleAuthUrl.toString());
  }),
});

// Calendar OAuth callback
http.route({
  path: "/calendar/callback",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const error = url.searchParams.get("error");

    if (error) {
      console.error("Calendar OAuth error:", error);
      return Response.redirect(`${url.origin}/calendar?error=access_denied`);
    }

    if (!code || !state) {
      return new Response("Missing code or state parameter", { status: 400 });
    }

    try {
      const { userId, returnUrl } = JSON.parse(state);

      // Exchange code for tokens
      const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_id: process.env.AUTH_GOOGLE_ID!,
          client_secret: process.env.AUTH_GOOGLE_SECRET!,
          code,
          grant_type: "authorization_code",
          redirect_uri: `${url.origin}/calendar/callback`,
        }),
      });

      if (!tokenResponse.ok) {
        throw new Error(`Token exchange failed: ${tokenResponse.statusText}`);
      }

      const tokens = await tokenResponse.json();

      // Get user's Google account info
      const profileResponse = await fetch(
        "https://www.googleapis.com/oauth2/v1/userinfo",
        {
          headers: {
            Authorization: `Bearer ${tokens.access_token}`,
          },
        },
      );

      if (!profileResponse.ok) {
        throw new Error(`Profile fetch failed: ${profileResponse.statusText}`);
      }

      const profile = await profileResponse.json();

      // Store calendar connection
      await ctx.runMutation(internal.googleCalendar.storeCalendarConnection, {
        userId,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresIn: tokens.expires_in,
        googleAccountId: profile.id,
        googleAccountEmail: profile.email,
        googleAccountName: profile.name,
        googleAccountPicture: profile.picture,
      });

      // Trigger initial calendar sync
      await ctx.runAction(internal.googleCalendar.syncUserCalendars, {
        userId,
      });

      return Response.redirect(`${url.origin}${returnUrl}?connected=true`);
    } catch (error) {
      console.error("Calendar callback error:", error);
      return Response.redirect(
        `${url.origin}/calendar?error=connection_failed`,
      );
    }
  }),
});

// Calendar disconnect endpoint
http.route({
  path: "/calendar/disconnect",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const { userId, connectionId } = await request.json();

      if (!userId || !connectionId) {
        return new Response("Missing userId or connectionId", { status: 400 });
      }

      await ctx.runMutation(internal.googleCalendar.removeCalendarConnection, {
        userId,
        connectionId,
      });

      return new Response(JSON.stringify({ success: true }), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Calendar disconnect error:", error);
      return new Response(
        JSON.stringify({
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    }
  }),
});

export default http;
