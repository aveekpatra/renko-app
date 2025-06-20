# Google Calendar Integration Guide

This guide covers the complete implementation of Google Calendar API integration in your Renko task management app.

## Overview

The Google Calendar integration allows users to:

- Connect their Google Calendar accounts **during login** (unified OAuth)
- Sync tasks to Google Calendar as events
- Cache Google Calendar events for performance
- Automatically sync calendars every 30 minutes
- View Google Calendar events alongside tasks

## 🔄 **UNIFIED OAUTH APPROACH**

**NEW**: We now use your existing Google OAuth login to also grant Calendar access. No separate OAuth flow needed!

### **How It Works:**

1. **During Login**: Users sign in with Google and grant Calendar permissions
2. **Auto-Extraction**: Calendar tokens are automatically extracted from the login session
3. **Seamless Integration**: Users can immediately sync tasks with their calendar

## Setup Instructions

### 1. Google Cloud Console Setup

Update your **existing** Google Cloud project (the one used for login):

1. **Enable Google Calendar API**

   - Navigate to "APIs & Services" → "Library"
   - Search for "Google Calendar API"
   - Click "Enable"

2. **Update OAuth Consent Screen**

   - Go to "APIs & Services" → "OAuth consent screen"
   - Add these scopes to your existing scopes:
     - `https://www.googleapis.com/auth/calendar`
     - `https://www.googleapis.com/auth/calendar.events`

3. **Your Existing OAuth Client**
   - **No changes needed** to your existing OAuth client
   - The same `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET` will work
   - Redirect URIs remain the same

### 2. Environment Variables

**Use your existing environment variables** - no new ones needed:

```bash
# Existing Convex Auth variables (keep these)
AUTH_GOOGLE_ID=your_existing_google_client_id
AUTH_GOOGLE_SECRET=your_existing_google_client_secret
SITE_URL=http://localhost:3000
```

**Optional**: Keep the separate Calendar variables as fallback:

```bash
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback
```

### 3. Updated Auth Configuration

Your `convex/auth.ts` now includes Calendar scopes:

```typescript
import { Password } from "@convex-dev/auth/providers/Password";
import Google from "@auth/core/providers/google";
import { convexAuth } from "@convex-dev/auth/server";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Password,
    Google({
      authorization: {
        params: {
          scope:
            "openid email profile https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events",
          access_type: "offline",
          prompt: "consent",
        },
      },
    }),
  ],
  // ... rest of config
});
```

## User Experience Flow

### **For New Users:**

1. Sign up with Google → Grants login + calendar permissions
2. Calendar access automatically activated
3. Can immediately sync tasks

### **For Existing Users:**

1. Sign out and sign back in with Google
2. Grant additional Calendar permissions when prompted
3. Calendar access automatically activated

### **Component Integration:**

Add the `GoogleCalendarSync` component to any page:

```typescript
import { GoogleCalendarSync } from "@/components/GoogleCalendarSync";

export default function CalendarPage() {
  return (
    <div>
      <h1>Calendar Integration</h1>
      <GoogleCalendarSync />
      {/* Rest of your calendar UI */}
    </div>
  );
}
```

## Technical Implementation

### **New Functions Added:**

- `extractCalendarTokensFromAuth()` - Extracts Calendar tokens from user's OAuth session
- `checkCalendarAccess()` - Checks if user has Calendar access

### **Automatic Token Extraction:**

The system automatically:

1. Detects when a user has Google OAuth but no Calendar tokens
2. Extracts Calendar tokens from their OAuth session
3. Stores them in the `googleCalendarTokens` table
4. Enables all Calendar functionality

### **Database Schema:**

No changes needed - uses existing `googleCalendarTokens` and `googleCalendarEvents` tables.

## Benefits of Unified Approach

✅ **Single OAuth Flow** - Users only need to authenticate once
✅ **Seamless UX** - No separate "Connect Calendar" step needed
✅ **Automatic Setup** - Calendar access activated during login
✅ **Simplified Maintenance** - One set of OAuth credentials to manage
✅ **Better Security** - Leverages existing trusted auth flow

## Migration for Existing Users

Users who previously connected Calendar separately will continue to work. New users will get the unified experience automatically.

**To migrate existing users to unified OAuth:**

1. They can continue using separate Calendar connection
2. Or sign out/in with Google to get unified OAuth benefits

## Required Scopes

The integration now uses these scopes during login:

- `openid` - Basic OpenID Connect
- `email` - User email address
- `profile` - Basic profile info
- `https://www.googleapis.com/auth/calendar` - Full calendar access
- `https://www.googleapis.com/auth/calendar.events` - Event management

## Architecture Overview

### **Unified Token Flow:**

1. **Login with Google** → User grants all permissions
2. **Token Extraction** → Calendar tokens extracted automatically
3. **Storage** → Tokens stored in `googleCalendarTokens` table
4. **Calendar Functions** → All existing Calendar functions work seamlessly

### **Fallback Support:**

The system still supports the separate OAuth flow as fallback:

- If unified OAuth fails, users can use separate Calendar connection
- Separate environment variables still supported
- Both approaches store tokens in the same format

## Troubleshooting

### **Common Issues:**

1. **"Calendar access not granted during login"**

   - User needs to sign out and sign back in with Google
   - Ensure Calendar API is enabled in Google Console
   - Check that Calendar scopes are added to OAuth consent screen

2. **"No access token found in OAuth account"**

   - User may have denied Calendar permissions
   - Try signing out/in again and accept all permissions

3. **Existing Calendar connection not working**
   - Check if `GOOGLE_CLIENT_ID` environment variable is set
   - Fallback to separate OAuth flow should work automatically

### **Migration Steps:**

For smooth migration:

1. Update Google Console to include Calendar scopes
2. Deploy updated `convex/auth.ts`
3. Add `GoogleCalendarSync` component to relevant pages
4. Test with new user signup
5. Existing users can migrate by signing out/in

## References

- [Google Calendar API Documentation](https://developers.google.com/calendar/api/guides/overview)
- [Convex Authentication Docs](https://docs.convex.dev/auth)
- [OAuth 2.0 Best Practices](https://tools.ietf.org/html/rfc6749)
