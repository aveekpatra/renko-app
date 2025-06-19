# Google Calendar Integration Guide

This guide covers the complete implementation of Google Calendar API integration in your Renko task management app.

## Overview

The Google Calendar integration allows users to:

- Connect their Google Calendar accounts
- Sync tasks to Google Calendar as events
- Cache Google Calendar events for performance
- Automatically sync calendars every 30 minutes
- View Google Calendar events alongside tasks

## Setup Instructions

### 1. Google Cloud Console Setup

Follow these steps to configure your Google Cloud project:

1. **Create Google Cloud Project**

   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one

2. **Enable Google Calendar API**

   - Navigate to "APIs & Services" → "Library"
   - Search for "Google Calendar API"
   - Click "Enable"

3. **Configure OAuth Consent Screen**

   - Go to "APIs & Services" → "OAuth consent screen"
   - Choose "External" user type (unless internal-only)
   - Fill in required app information:
     - App name: "Renko Task Manager"
     - User support email
     - Developer contact email
   - Add scopes:
     - `https://www.googleapis.com/auth/calendar`
     - `https://www.googleapis.com/auth/calendar.events`

4. **Create OAuth Client**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - Choose "Web application"
   - Add authorized redirect URIs:
     - Production: `https://your-domain.com/auth/google/callback`
     - Development: `http://localhost:3000/auth/google/callback`
   - Save Client ID and Client Secret

### 2. Environment Variables

Add these environment variables to your Convex deployment:

```bash
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=https://your-domain.com/auth/google/callback
```

For local development:

```bash
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback
```

### 3. Required Scopes

The integration requires these Google Calendar scopes:

- `https://www.googleapis.com/auth/calendar` - Full calendar access
- `https://www.googleapis.com/auth/calendar.events` - Event management

## Architecture Overview

### Database Schema

#### `googleCalendarTokens` Table

Stores OAuth tokens for authenticated users:

```typescript
{
  userId: Id<"users">,
  accessToken: string,
  refreshToken: string,
  expiresAt: number, // Unix timestamp
  createdAt: number,
  updatedAt: number,
}
```

#### `googleCalendarEvents` Table

Caches Google Calendar events for performance:

```typescript
{
  userId: Id<"users">,
  eventId: string, // Google Calendar event ID
  summary: string,
  description: string,
  startTime: string, // ISO string
  endTime: string, // ISO string
  location: string,
  attendees: string[], // email addresses
  etag: string, // For change detection
  createdAt: number,
  updatedAt: number,
}
```

#### Updated `tasks` Table

Added Google Calendar integration field:

```typescript
{
  // ... existing fields
  googleEventId?: string, // Google Calendar event ID
}
```

### Core Functions

#### Authentication Flow

1. `generateGoogleAuthUrl` - Creates OAuth authorization URL
2. `exchangeCodeForTokens` - Exchanges auth code for tokens
3. `getValidAccessToken` - Gets/refreshes access tokens
4. HTTP endpoint at `/auth/google/callback` handles OAuth callback

#### Calendar Sync

1. `syncTaskToGoogleCalendar` - Creates Google Calendar event from task
2. `fetchAndCacheGoogleCalendarEvents` - Fetches and caches events
3. `getCachedCalendarEvents` - Retrieves cached events
4. Cron jobs for automatic sync every 30 minutes

#### Caching Strategy

- Events cached in Convex database for performance
- ETags used for change detection to avoid unnecessary updates
- Old events (60+ days) automatically cleaned up daily
- Automatic token refresh when needed

## Implementation Details

### Token Management

**Automatic Token Refresh**:

```typescript
// Tokens are automatically refreshed when expired
const accessToken = await getValidAccessToken({ userId });
```

**Token Storage**:

- Access tokens stored securely in Convex database
- Refresh tokens used for automatic renewal
- 5-minute buffer before expiration for proactive refresh

### Caching Strategy

**Event Caching Benefits**:

- Reduces API calls to Google Calendar
- Improves app performance
- Enables offline viewing of calendar data
- Efficient change detection using ETags

**Cache Invalidation**:

- Events updated when ETags change
- Old events automatically cleaned up
- Manual refresh available for users

### Error Handling

**Common Error Scenarios**:

1. **Expired/Invalid Tokens**: Automatic refresh attempted
2. **API Rate Limits**: Exponential backoff implemented
3. **Network Issues**: Graceful fallback to cached data
4. **Insufficient Permissions**: Clear error messages to users

### Quota Management

**Google Calendar API Quotas**:

- 1,000,000 requests per day
- 100 requests per 100 seconds per user
- Caching reduces API usage significantly
- Batch operations where possible

## Usage Examples

### Connecting Google Calendar

```typescript
// Generate authorization URL
const authUrl = await api.googleCalendar.generateGoogleAuthUrl({ userId });

// Open popup for user authorization
const popup = window.open(authUrl, "google-auth", "width=500,height=600");

// Listen for successful authorization
window.addEventListener("message", (event) => {
  if (event.data.success) {
    console.log("Google Calendar connected!");
    popup.close();
  }
});
```

### Syncing a Task to Google Calendar

```typescript
// Sync task with specific time
await api.googleCalendar.syncTaskToGoogleCalendar({
  userId,
  taskId,
  startTime: "2024-01-15T09:00:00Z",
  endTime: "2024-01-15T10:00:00Z",
});
```

### Fetching Cached Events

```typescript
// Get cached events for date range
const events = await api.googleCalendar.getCachedCalendarEvents({
  userId,
  startDate: "2024-01-01T00:00:00Z",
  endDate: "2024-01-31T23:59:59Z",
});
```

## Security Considerations

### Token Security

- Tokens stored server-side only
- No sensitive data exposed to client
- Automatic token rotation

### Scope Limitations

- Only request necessary calendar scopes
- Users can revoke access anytime
- Clear permission explanations

### Data Privacy

- User calendar data cached temporarily
- No personal data logged
- GDPR-compliant data handling

## Best Practices

### Performance Optimization

1. **Efficient Caching**:

   - Cache events for 30-day windows
   - Use ETags for change detection
   - Batch API requests when possible

2. **Rate Limiting**:

   - Implement exponential backoff
   - Respect Google's quota limits
   - Monitor API usage patterns

3. **Error Recovery**:
   - Graceful degradation when API unavailable
   - Retry mechanisms for transient failures
   - Clear user feedback for permanent errors

### User Experience

1. **Seamless Integration**:

   - One-click calendar connection
   - Automatic background sync
   - Visual indicators for sync status

2. **Clear Permissions**:
   - Explain why calendar access needed
   - Show what data will be accessed
   - Provide easy disconnection option

## Troubleshooting

### Common Issues

1. **"Invalid Client" Error**:

   - Check CLIENT_ID and CLIENT_SECRET
   - Verify redirect URI matches exactly
   - Ensure OAuth client is configured correctly

2. **"Insufficient Permissions" Error**:

   - Check required scopes are enabled
   - Verify OAuth consent screen approved
   - Ensure user granted necessary permissions

3. **Token Refresh Failures**:
   - Check refresh token validity
   - Verify client credentials
   - User may need to reauthorize

### Monitoring

Key metrics to monitor:

- Token refresh success rate
- API quota usage
- Sync job success rate
- User calendar connection rate
- Event cache hit ratio

## Future Enhancements

Potential improvements:

1. **Two-way Sync**: Sync Google Calendar events back to tasks
2. **Multiple Calendars**: Support for multiple calendar accounts
3. **Smart Scheduling**: AI-powered optimal time suggestions
4. **Conflict Detection**: Warn about calendar conflicts
5. **Recurring Events**: Support for recurring task patterns

## References

- [Google Calendar API Documentation](https://developers.google.com/calendar/api/guides/overview)
- [OneCal Integration Guide](https://www.onecal.io/blog/how-to-integrate-google-calendar-api-into-your-app)
- [OAuth 2.0 Best Practices](https://tools.ietf.org/html/rfc6749)
- [Convex Authentication Docs](https://docs.convex.dev/auth)
