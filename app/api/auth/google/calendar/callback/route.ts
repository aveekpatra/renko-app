import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET(request: NextRequest) {
  console.log("📅 Calendar OAuth callback received");

  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const state = searchParams.get("state");
  const scope = searchParams.get("scope");

  // Debug logging - log all parameters
  console.log("OAuth callback params:", {
    code: code ? `${code.substring(0, 10)}...` : null,
    error,
    state: state ? `${state.substring(0, 20)}...` : null,
    scope,
    fullUrl: request.url,
    allParams: Object.fromEntries(searchParams.entries()),
  });

  // Handle OAuth errors
  if (error) {
    console.error("❌ OAuth error:", error);
    const errorDescriptions: Record<string, string> = {
      access_denied: "User denied access to Google Calendar",
      invalid_request: "Invalid OAuth request",
      unauthorized_client: "Unauthorized OAuth client",
      unsupported_response_type: "Unsupported response type",
      invalid_scope: "Invalid OAuth scope",
      server_error: "Google server error",
      temporarily_unavailable: "Google service temporarily unavailable",
    };

    const errorMessage = errorDescriptions[error] || `OAuth error: ${error}`;
    return NextResponse.redirect(
      new URL(
        `/?calendar_error=${encodeURIComponent(errorMessage)}`,
        request.url,
      ),
    );
  }

  if (!code) {
    console.error("❌ No authorization code received");
    console.log("This usually means:");
    console.log("1. Google OAuth app is not properly configured");
    console.log("2. Redirect URI mismatch in Google Cloud Console");
    console.log("3. OAuth consent screen needs configuration");
    console.log("4. Calendar API is not enabled");

    return NextResponse.redirect(
      new URL("/?calendar_error=no_authorization_code", request.url),
    );
  }

  if (!state) {
    console.error("❌ No state parameter received");
    return NextResponse.redirect(
      new URL("/?calendar_error=missing_state", request.url),
    );
  }

  try {
    // Parse state to get user info
    const { userId, type } = JSON.parse(state);

    if (type !== "calendar") {
      console.error("❌ Invalid state type:", type);
      return NextResponse.redirect(
        new URL("/?calendar_error=invalid_state_type", request.url),
      );
    }

    console.log("🔄 Exchanging code for tokens...");

    // Construct the exact redirect URI used in the authorization request
    const redirectUri = `${new URL(request.url).origin}/api/auth/google/calendar/callback`;

    console.log("🔗 Token exchange parameters:", {
      client_id:
        process.env.GOOGLE_CALENDAR_CLIENT_ID?.substring(0, 20) + "...",
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
      code: code.substring(0, 10) + "...",
    });

    // Exchange authorization code for tokens using calendar-specific credentials
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CALENDAR_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CALENDAR_CLIENT_SECRET!,
        code,
        grant_type: "authorization_code",
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error(
        "❌ Token exchange failed:",
        tokenResponse.status,
        tokenResponse.statusText,
        errorText,
      );

      // Parse error details if available
      try {
        const errorData = JSON.parse(errorText);
        console.error("Token exchange error details:", errorData);
      } catch (e) {
        console.error("Could not parse error response as JSON");
      }

      throw new Error(
        `Token exchange failed: ${tokenResponse.status} ${tokenResponse.statusText}`,
      );
    }

    const tokens = await tokenResponse.json();
    console.log("✅ Tokens received successfully");
    console.log("Token info:", {
      access_token: tokens.access_token ? "present" : "missing",
      refresh_token: tokens.refresh_token ? "present" : "missing",
      expires_in: tokens.expires_in,
      scope: tokens.scope,
      token_type: tokens.token_type,
    });

    // Get user profile from Google using the correct endpoint
    const profileResponse = await fetch(
      "https://www.googleapis.com/oauth2/v1/userinfo?alt=json",
      {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
        },
      },
    );

    if (!profileResponse.ok) {
      console.error(
        "❌ Profile fetch failed:",
        profileResponse.status,
        profileResponse.statusText,
      );
      throw new Error(
        `Profile fetch failed: ${profileResponse.status} ${profileResponse.statusText}`,
      );
    }

    const profile = await profileResponse.json();
    console.log("✅ User profile retrieved:", {
      id: profile.id,
      email: profile.email,
      name: profile.name,
      picture: profile.picture ? "present" : "missing",
    });

    // Store calendar connection in Convex
    const connectionId = await convex.mutation(
      api.googleCalendar.storeCalendarConnection,
      {
        userId,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token || undefined,
        expiresIn: tokens.expires_in || 3600,
        googleAccountId: profile.id,
        googleAccountEmail: profile.email,
        googleAccountName: profile.name || profile.email,
        googleAccountPicture: profile.picture,
      },
    );

    console.log("✅ Calendar connection stored:", connectionId);

    // Redirect back to app with success
    return NextResponse.redirect(
      new URL("/?calendar_connected=true", request.url),
    );
  } catch (error) {
    console.error("❌ Calendar callback error:", error);
    console.error(
      "Error stack:",
      error instanceof Error ? error.stack : "No stack trace",
    );

    return NextResponse.redirect(
      new URL("/?calendar_error=connection_failed", request.url),
    );
  }
}
