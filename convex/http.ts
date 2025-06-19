import { httpRouter } from "convex/server";
import { auth } from "./auth";

const http = httpRouter();

// Add auth HTTP routes for authentication flow
auth.addHttpRoutes(http);

// Google Calendar OAuth callback
http.route({
  path: "/auth/google/callback",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const error = url.searchParams.get("error");

    if (error) {
      return new Response(
        JSON.stringify({ error: "OAuth authorization failed", details: error }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    if (!code || !state) {
      return new Response(
        JSON.stringify({ error: "Missing authorization code or state" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    try {
      const result = await ctx.runAction(
        api.googleCalendar.exchangeCodeForTokens,
        {
          code,
          state,
        },
      );

      if (result.success) {
        // Redirect to success page or close popup
        return new Response(
          `
          <html>
            <head>
              <title>Google Calendar Connected</title>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1">
              <style>
                body { 
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  height: 100vh;
                  margin: 0;
                  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                  color: white;
                }
                .container {
                  text-align: center;
                  background: rgba(255, 255, 255, 0.1);
                  padding: 2rem;
                  border-radius: 12px;
                  backdrop-filter: blur(10px);
                }
                .success {
                  font-size: 3rem;
                  margin-bottom: 1rem;
                }
                h1 { margin: 0 0 1rem 0; }
                p { margin: 0; opacity: 0.9; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="success">✅</div>
                <h1>Google Calendar Connected!</h1>
                <p>You can now sync your tasks with Google Calendar.</p>
                <p>This window will close automatically...</p>
              </div>
              <script>
                setTimeout(() => {
                  if (window.opener) {
                    window.opener.postMessage({ success: true, userId: '${result.userId}' }, '*');
                    window.close();
                  } else {
                    window.location.href = '/calendar';
                  }
                }, 2000);
              </script>
            </body>
          </html>
          `,
          {
            status: 200,
            headers: { "Content-Type": "text/html" },
          },
        );
      } else {
        return new Response(JSON.stringify({ error: result.error }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }
    } catch (error) {
      console.error("OAuth callback error:", error);
      return new Response(JSON.stringify({ error: "Internal server error" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }),
});

export default http;
