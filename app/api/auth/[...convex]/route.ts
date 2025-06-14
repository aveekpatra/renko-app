import { auth } from "@/convex/auth";
import { NextRequest, NextResponse } from "next/server";

const handler = auth.createAuthRouteHandlers({
  pages: {
    signIn: "/signin",
    signUp: "/signup",
  },
  callbacks: {
    async redirect({ url, baseUrl }) {
      // Force redirect to custom pages instead of default auth pages
      if (url.includes("/auth") || url === "/" || url === baseUrl) {
        return "/signin";
      }
      // Always return to signin page for auth-related redirects
      if (url.includes("signin") || url.includes("login")) {
        return "/signin";
      }
      if (url.includes("signup") || url.includes("register")) {
        return "/signup";
      }
      // Default to home after successful authentication
      return url.startsWith("/") ? `${baseUrl}${url}` : baseUrl;
    },
  },
});

// Override GET handler to prevent default auth pages
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  
  // Block any default auth page requests and redirect to custom signin
  if (url.pathname.includes("/signin") && !url.pathname.includes("/api/")) {
    return NextResponse.redirect(new URL("/signin", request.url));
  }
  
  if (url.pathname.includes("/signup") && !url.pathname.includes("/api/")) {
    return NextResponse.redirect(new URL("/signup", request.url));
  }

  // For any other auth-related paths, redirect to signin
  if (url.pathname.includes("/auth") && !url.pathname.includes("/api/")) {
    return NextResponse.redirect(new URL("/signin", request.url));
  }
  
  return handler.GET(request);
}

export const POST = handler.POST; 