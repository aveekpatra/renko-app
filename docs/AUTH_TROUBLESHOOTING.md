# 🔐 Authentication Troubleshooting Guide

## 📋 Overview

This document provides comprehensive troubleshooting guidance for Convex Auth implementation, based on real-world debugging experience and lessons learned during the Renko project development.

---

## 🚨 Common Error: "No auth provider found matching the given token"

### Problem Description

The most common authentication error encountered is:

```
Error: {"code":"NoAuthProvider","message":"No auth provider found matching the given token"}
```

This error occurs in middleware, authentication checks, and signin operations.

### Root Cause Analysis

This error typically indicates that **Convex Auth is missing the provider configuration file** (`auth.config.ts`) that tells the system how to validate authentication tokens.

### ✅ Complete Solution

#### 1. Run Official Setup Tool

The official Convex Auth setup tool is **REQUIRED** and handles critical configuration:

```bash
npx @convex-dev/auth
```

**What this tool does:**

- ✅ Creates `convex/auth.config.ts` with provider configuration
- ✅ Updates JWT_PRIVATE_KEY and JWKS on the deployment
- ✅ Verifies tsconfig.json and other setup files
- ✅ Ensures environment variables are properly configured

#### 2. Verify auth.config.ts Creation

The setup tool should create `convex/auth.config.ts`:

```typescript
export default {
  providers: [
    {
      domain: process.env.CONVEX_SITE_URL,
      applicationID: "convex",
    },
  ],
};
```

**Critical Notes:**

- This file is **REQUIRED** for token validation
- Uses `CONVEX_SITE_URL` environment variable (not `SITE_URL`)
- Must be in the `convex/` directory

#### 3. Update auth.ts Exports

Ensure `convex/auth.ts` exports `isAuthenticated`:

```typescript
import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [Password],
});

export default auth;
```

#### 4. Implement Robust Middleware Error Handling

Update `middleware.ts` to handle authentication errors gracefully:

```typescript
import {
  convexAuthNextjsMiddleware,
  createRouteMatcher,
  nextjsMiddlewareRedirect,
} from "@convex-dev/auth/nextjs/server";

const isSignInPage = createRouteMatcher(["/signin"]);
const isProtectedRoute = createRouteMatcher([
  "/",
  "/boards",
  "/calendar",
  "/notes",
  "/analytics",
  "/projects",
]);

export default convexAuthNextjsMiddleware(async (request, { convexAuth }) => {
  // Handle authentication check with proper error handling
  let isAuthenticated = false;
  try {
    isAuthenticated = await convexAuth.isAuthenticated();
  } catch (error) {
    // If authentication check fails, treat as unauthenticated
    console.log("Authentication check failed:", error);
    isAuthenticated = false;
  }

  if (isSignInPage(request) && isAuthenticated) {
    return nextjsMiddlewareRedirect(request, "/");
  }

  if (isProtectedRoute(request) && !isAuthenticated) {
    return nextjsMiddlewareRedirect(request, "/signin");
  }
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
```

**Key Points:**

- ✅ Wrap `isAuthenticated()` in try-catch
- ✅ Default to `false` on authentication errors
- ✅ Log errors for debugging
- ✅ Allow middleware to function even with token issues

---

## 🔍 Debugging Methodology

### Step 1: Environment Variable Verification

```bash
npx convex env list
```

**Required Variables:**

- `JWKS` - Public key for token validation
- `JWT_PRIVATE_KEY` - Private key for token signing
- `SITE_URL` - Application URL (e.g., http://localhost:3000)

### Step 2: File Structure Verification

Ensure these files exist:

```
convex/
├── auth.ts ✅
├── auth.config.ts ✅ CRITICAL
├── http.ts ✅
└── schema.ts ✅
```

### Step 3: Schema Verification

Confirm `convex/schema.ts` includes auth tables:

```typescript
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,
  // ... your other tables
});
```

### Step 4: Port Consistency Check

Verify SITE_URL matches your development server:

- Development server on port 3000 → `SITE_URL=http://localhost:3000`
- Development server on port 3001 → `SITE_URL=http://localhost:3001`

---

## 🛠️ Common Pitfalls & Solutions

### Pitfall 1: Missing auth.config.ts

**Problem:** Forgetting to run `npx @convex-dev/auth` setup tool

**Solution:** Always run the official setup tool, don't try to create files manually

### Pitfall 2: Port Mismatch

**Problem:** SITE_URL doesn't match actual development server port

**Solution:** Update environment variable when Next.js starts on different port

### Pitfall 3: Missing isAuthenticated Export

**Problem:** Not exporting `isAuthenticated` from `convex/auth.ts`

**Solution:** Include it in the destructured exports from `convexAuth()`

### Pitfall 4: Middleware Crashes on Auth Errors

**Problem:** Not handling authentication errors in middleware

**Solution:** Implement try-catch blocks and default to unauthenticated state

### Pitfall 5: Outdated JWT Keys

**Problem:** Stale JWT keys causing token validation failures

**Solution:** Re-run `npx @convex-dev/auth` to refresh keys

---

## 📚 Lessons Learned

### Critical Insights

1. **Official Setup Tool is Mandatory**

   - Don't skip `npx @convex-dev/auth`
   - It handles configuration that's impossible to do manually
   - Creates essential `auth.config.ts` file

2. **auth.config.ts is the Missing Piece**

   - This file defines how tokens are validated
   - Without it, all authentication fails
   - Must use correct environment variable names

3. **Error Handling is Essential**

   - Middleware must handle auth failures gracefully
   - Default to unauthenticated rather than crashing
   - Log errors for debugging but don't expose to users

4. **Environment Consistency Matters**
   - SITE_URL must exactly match development server
   - Port mismatches cause authentication failures
   - Always verify with `npx convex env list`

### Development Workflow Best Practices

1. **Always Start with Official Setup**

   ```bash
   npx @convex-dev/auth
   ```

2. **Verify Environment After Changes**

   ```bash
   npx convex env list
   ```

3. **Test Authentication Flow**

   - Create test account
   - Verify middleware redirects
   - Check token validation

4. **Monitor Logs for Auth Errors**
   - Watch for "No auth provider" errors
   - Check middleware console logs
   - Verify Convex deployment logs

---

## 🚀 Future Reference Checklist

When encountering authentication issues:

- [ ] Run `npx @convex-dev/auth` setup tool
- [ ] Verify `convex/auth.config.ts` exists
- [ ] Check environment variables with `npx convex env list`
- [ ] Confirm port consistency between SITE_URL and dev server
- [ ] Ensure middleware has error handling
- [ ] Verify `isAuthenticated` is exported from `auth.ts`
- [ ] Test with clean browser session (no cached tokens)
- [ ] Check Convex deployment logs for additional context

---

## 📞 Emergency Debugging Commands

```bash
# Reset authentication completely
npx @convex-dev/auth

# Check environment variables
npx convex env list

# Restart Convex dev server
npx convex dev

# Clear browser storage and test again
# (DevTools → Application → Storage → Clear)
```

---

This troubleshooting guide should prevent future authentication headaches and serve as a comprehensive reference for the Renko development team.
