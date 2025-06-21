import { NextRequest, NextResponse } from "next/server";

/**
 * Google Calendar OAuth Callback Handler
 *
 * This endpoint handles the OAuth callback from Google and exchanges the
 * authorization code for access and refresh tokens, then posts the result
 * back to the parent window via postMessage.
 */

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");
    const error = searchParams.get("error");

    // Handle OAuth errors
    if (error) {
      console.error("OAuth error:", error);
      return new NextResponse(
        `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Calendar Authentication</title>
        </head>
        <body>
          <script>
            window.opener?.postMessage({
              type: 'CALENDAR_AUTH_ERROR',
              error: '${error}'
            }, window.location.origin);
            window.close();
          </script>
        </body>
        </html>
        `,
        { headers: { "Content-Type": "text/html" } },
      );
    }

    // Validate authorization code
    if (!code) {
      return new NextResponse(
        `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Calendar Authentication</title>
        </head>
        <body>
          <script>
            window.opener?.postMessage({
              type: 'CALENDAR_AUTH_ERROR',
              error: 'No authorization code received'
            }, window.location.origin);
            window.close();
          </script>
        </body>
        </html>
        `,
        { headers: { "Content-Type": "text/html" } },
      );
    }

    console.log("📧 [CALENDAR AUTH] Exchanging code for tokens...");

    // Exchange authorization code for tokens
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CALENDAR_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CALENDAR_CLIENT_SECRET!,
        code: code,
        grant_type: "authorization_code",
        redirect_uri: `${process.env.CONVEX_SITE_URL}/api/auth/google/calendar/callback`,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error("Token exchange failed:", errorText);

      return new NextResponse(
        `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Calendar Authentication</title>
        </head>
        <body>
          <script>
            window.opener?.postMessage({
              type: 'CALENDAR_AUTH_ERROR',
              error: 'Failed to exchange authorization code for tokens'
            }, window.location.origin);
            window.close();
          </script>
        </body>
        </html>
        `,
        { headers: { "Content-Type": "text/html" } },
      );
    }

    const tokenData = await tokenResponse.json();
    console.log("✅ [CALENDAR AUTH] Tokens received successfully");

    // Get user profile information
    const profileResponse = await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
      },
    );

    let email = "unknown@example.com";
    if (profileResponse.ok) {
      const profileData = await profileResponse.json();
      email = profileData.email || email;
      console.log("✅ [CALENDAR AUTH] User profile retrieved:", email);
    }

    // Calculate token expiration time
    const expiresAt = Date.now() + tokenData.expires_in * 1000;

    // Return success page that posts tokens to parent window
    return new NextResponse(
      `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Calendar Authentication Successful</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
          }
          .container {
            text-align: center;
            padding: 2rem;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            backdrop-filter: blur(10px);
          }
          .success-icon {
            font-size: 3rem;
            margin-bottom: 1rem;
          }
          .message {
            font-size: 1.1rem;
            margin-bottom: 1rem;
          }
          .submessage {
            font-size: 0.9rem;
            opacity: 0.8;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="success-icon">✅</div>
          <div class="message">Calendar Connected Successfully!</div>
          <div class="submessage">You can close this window and return to the app.</div>
        </div>
        <script>
          // Post success message to parent window
          window.opener?.postMessage({
            type: 'CALENDAR_AUTH_SUCCESS',
            accessToken: '${tokenData.access_token}',
            refreshToken: '${tokenData.refresh_token || ""}',
            expiresAt: ${expiresAt},
            email: '${email}'
          }, window.location.origin);
          
          // Auto-close after a brief delay
          setTimeout(() => {
            window.close();
          }, 2000);
        </script>
      </body>
      </html>
      `,
      { headers: { "Content-Type": "text/html" } },
    );
  } catch (error) {
    console.error("Calendar auth callback error:", error);

    return new NextResponse(
      `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Calendar Authentication Error</title>
      </head>
      <body>
        <script>
          window.opener?.postMessage({
            type: 'CALENDAR_AUTH_ERROR',
            error: 'Internal server error during authentication'
          }, window.location.origin);
          window.close();
        </script>
      </body>
      </html>
      `,
      { headers: { "Content-Type": "text/html" } },
    );
  }
}
