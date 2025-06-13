import {
  convexAuthNextjsMiddleware,
  createRouteMatcher,
  nextjsMiddlewareRedirect,
} from "@convex-dev/auth/nextjs/server";

const isSignInPage = createRouteMatcher(["/signin", "/signup"]);
const isAuthApiRoute = createRouteMatcher([
  "/api/auth/signin",
  "/api/auth/signup",
  "/api/auth/signIn",
  "/api/auth/signUp",
]);
const protectedRoutes = ["/", "/calendar", "/boards", "/habits"];

export default convexAuthNextjsMiddleware(async (request, { convexAuth }) => {
  // Block any default Convex Auth signin/signup pages and redirect to custom ones
  if (isAuthApiRoute(request)) {
    const pathname = request.pathname.toLowerCase();
    if (pathname.includes("signin") || pathname.includes("login")) {
      return nextjsMiddlewareRedirect(request, "/signin");
    }
    if (pathname.includes("signup") || pathname.includes("register")) {
      return nextjsMiddlewareRedirect(request, "/signup");
    }
  }

  // Handle authentication check with proper error handling
  let isAuthenticated = false;
  try {
    isAuthenticated = await convexAuth.isAuthenticated();
  } catch (error) {
    // If authentication check fails, treat as unauthenticated
    console.log("Authentication check failed:", error);
    isAuthenticated = false;
  }

  // If user is on signin/signup page and already authenticated, redirect to home
  if (isSignInPage(request) && isAuthenticated) {
    return nextjsMiddlewareRedirect(request, "/");
  }

  // If user is on protected route and not authenticated, redirect to signin
  if (protectedRoutes.includes(request.pathname) && !isAuthenticated) {
    return nextjsMiddlewareRedirect(request, "/signin");
  }
});

export const config = {
  // The following matcher runs middleware on all routes
  // except static assets.
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
