import { Password } from "@convex-dev/auth/providers/Password";
import Google from "@auth/core/providers/google";
import { convexAuth } from "@convex-dev/auth/server";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [Password, Google],
  callbacks: {
    async redirect({ redirectTo }) {
      // Handle redirect after authentication
      if (redirectTo?.includes("/signin") || redirectTo?.includes("/auth")) {
        return "/signin";
      }
      if (redirectTo?.includes("/signup")) {
        return "/signup";
      }
      // Fallback to home after successful authentication
      return "/";
    },
  },
});

export default auth;
