import { Password } from "@convex-dev/auth/providers/Password";
import Google from "@auth/core/providers/google";
import { convexAuth } from "@convex-dev/auth/server";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Password,
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
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
    async createOrUpdateUser(ctx, args) {
      // This callback is called when a user signs in
      console.log("🔍 [AUTH DEBUG] createOrUpdateUser called with:", {
        existingUserId: args.existingUserId,
        profile: args.profile,
        provider: args.provider,
        type: args.type,
      });

      // Store additional user information including email
      if (args.profile?.email) {
        console.log("✅ [AUTH DEBUG] User email found:", args.profile.email);
      }

      // Default behavior - create or update user
      if (args.existingUserId) {
        console.log(
          "🔄 [AUTH DEBUG] Updating existing user:",
          args.existingUserId,
        );
        return args.existingUserId;
      } else {
        console.log("➕ [AUTH DEBUG] Creating new user");
        const userId = await ctx.db.insert("users", {
          name: args.profile?.name,
          email: args.profile?.email,
          image: args.profile?.image,
        });
        console.log("✅ [AUTH DEBUG] New user created:", userId);
        return userId;
      }
    },
  },
});

export default auth;
