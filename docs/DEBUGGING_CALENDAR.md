# Calendar Integration Debugging Guide

## Common Issues and Solutions

### Issue: "ArgumentValidationError: Object is missing the required field `accessToken`"

**Cause:** This error occurs when something is calling `initializeCalendarConnection` with an empty object instead of proper OAuth tokens.

**Possible Sources:**

1. Stale OAuth popup windows from previous connection attempts
2. Browser extensions interfering with OAuth flow
3. Cached localStorage/sessionStorage with incomplete OAuth data
4. Multiple tabs with incomplete OAuth flows

**Solutions:**

1. **Close all browser tabs** and restart the browser
2. **Clear browser storage** for the app:
   ```javascript
   // In browser console, run:
   localStorage.clear();
   sessionStorage.clear();
   ```
3. **Check for popup windows**: Look for any open popup windows with Google OAuth URLs
4. **Disable browser extensions** temporarily to test if they're interfering
5. **Use incognito/private browsing** to test without extensions and cached data

### Issue: Excessive console logging

**Status:** ✅ Fixed - Debug logging has been removed from production code

### Issue: Calendar connection fails silently

**Debug Steps:**

1. Check browser developer tools Network tab for failed requests
2. Look for OAuth callback errors in Console
3. Verify Google Cloud Console configuration:
   - Client ID and Secret are correct
   - Redirect URI matches exactly: `{your-domain}/api/auth/google/calendar/callback`
   - Calendar API is enabled
   - OAuth consent screen is configured

### Issue: Token refresh failures

**Causes:**

- Refresh token expired or revoked
- Google API credentials changed
- User revoked app permissions

**Solutions:**

1. Disconnect and reconnect calendar
2. Check Google account permissions at https://myaccount.google.com/permissions
3. Verify API credentials in Google Cloud Console

## Development Debugging

### Enable Debug Logging

To temporarily enable debug logging in development:

```typescript
// In Calendar.tsx, temporarily add back:
console.log("📅 Calendar Events Debug:", {
  eventsData,
  totalEvents: events.length,
  googleEvents: events.filter((e) => e.type === "google").length,
  appEvents: events.filter((e) => e.type === "app").length,
});
```

### Check Calendar Status

```typescript
// In browser console:
// Check if user is authenticated
console.log("Auth status:", convex.query("auth:currentUser"));

// Check calendar connection
console.log(
  "Calendar status:",
  convex.query("googleCalendar:getCalendarStatus"),
);
```

### Manual Storage Cleanup

```javascript
// Clear any OAuth-related storage
Object.keys(localStorage).forEach((key) => {
  if (key.includes("google") || key.includes("oauth") || key.includes("auth")) {
    localStorage.removeItem(key);
  }
});

// Also clear session storage
Object.keys(sessionStorage).forEach((key) => {
  if (key.includes("google") || key.includes("oauth") || key.includes("auth")) {
    sessionStorage.removeItem(key);
  }
});
```

## Production Monitoring

### Key Metrics to Monitor

1. OAuth callback success/failure rates
2. Token refresh success rates
3. Calendar sync frequency and success rates
4. Error patterns in logs

### Error Patterns to Watch

- `ArgumentValidationError` - Usually indicates client-side OAuth issues
- `Token refresh failed` - May indicate API quota issues or revoked permissions
- `Calendar not connected` - Users may need guidance on reconnection

## Security Considerations

### Current Implementation

- ⚠️ **Tokens stored in plain text** - In production, implement encryption for stored tokens
- ✅ **Proper OAuth scopes** - Only requests necessary calendar permissions
- ✅ **Token expiration handling** - Automatic refresh of expired tokens
- ✅ **Error logging** - Comprehensive error tracking without exposing sensitive data

### Recommended Production Enhancements

1. Encrypt stored OAuth tokens
2. Implement token rotation
3. Add rate limiting for API calls
4. Monitor for suspicious OAuth patterns
