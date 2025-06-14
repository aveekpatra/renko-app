import { Password } from "@convex-dev/auth/providers/Password";
import Google from "@auth/core/providers/google";
import { convexAuth } from "@convex-dev/auth/server";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [Password, Google],
  callbacks: {
    async redirect({ url, baseUrl }) {
      // Redirect to custom pages instead of default auth pages
      if (url.includes("/signin") || url.includes("/auth")) {
        return "/signin";
      }
      if (url.includes("/signup")) {
        return "/signup";
      }
      // Fallback to home after successful authentication
      return "/";
    },
  },
});

export default auth;
