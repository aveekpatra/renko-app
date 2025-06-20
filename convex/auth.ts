import { Password } from "@convex-dev/auth/providers/Password";
import Google from "@auth/core/providers/google";
import { convexAuth } from "@convex-dev/auth/server";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Password,
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      authorization: {
        params: {
          scope: "openid email profile",
        },
      },
    }),
  ],
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
