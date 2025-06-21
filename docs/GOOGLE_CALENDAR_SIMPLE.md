# Google Calendar Integration - Simple Implementation

## Overview

This document describes the simple Google Calendar integration implemented for the Renko productivity app. The integration provides a read-only view of Google Calendar events alongside the app's own events in a unified weekly calendar view.

## Architecture

### Core Components

1. **GoogleCalendarClient** - Singleton class handling Google API interactions
2. **GoogleCalendarView** - React component providing the calendar interface
3. **Environment Configuration** - API keys and OAuth client setup

### Key Features

- **Client-side Integration**: Uses Google Calendar API v3 with browser-based authentication
- **Persistent Authentication**: Tokens stored in localStorage with automatic refresh
- **Unified Calendar View**: Shows both app events (blue) and Google Calendar events (green)
- **Drag-and-Drop Scheduling**: Drag tasks from sidebar to calendar days
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Connection Status**: Real-time connection status indicators

## Technical Implementation

### Authentication Flow

1. **Initialization**: Load Google APIs and initialize client
2. **OAuth Flow**: Use Google Identity Services for authentication popup
3. **Token Management**: Store access tokens with expiry tracking
4. **Persistent Sessions**: Automatically restore authentication on page reload

### API Integration

- **Google Calendar API v3**: Read-only access to primary calendar
- **Event Fetching**: Retrieve events for current week view
- **Rate Limiting**: Memoized requests to prevent excessive API calls
- **Error Handling**: Graceful degradation when API unavailable

### Data Flow

```
GoogleCalendarClient → API Request → Google Calendar API
                                  ↓
                              Event Data
                                  ↓
                         GoogleCalendarView
                                  ↓
                           Unified Events
                                  ↓
                          Calendar Display
```

## Setup Instructions

### 1. Google Cloud Console Setup

1. Create a new project or select existing project
2. Enable the Google Calendar API
3. Create credentials:
   - **API Key**: For Calendar API access
   - **OAuth 2.0 Client ID**: For user authentication

### 2. Environment Variables

Add to your `.env.local` file:

```bash
# Google API Key (for Calendar API access)
GOOGLE_API_KEY=your_google_api_key_here
NEXT_PUBLIC_GOOGLE_API_KEY=your_google_api_key_here

# OAuth Client ID (for user authentication)
NEXT_PUBLIC_GOOGLE_CALENDAR_CLIENT_ID=your_oauth_client_id_here
```

**Important**: The API Key and OAuth Client ID are different credentials with different purposes.

### 3. OAuth Configuration

Configure your OAuth 2.0 Client ID in Google Cloud Console:

- **Authorized JavaScript origins**: `http://localhost:3000` (development)
- **Authorized redirect URIs**: Not required for this client-side implementation

## Usage

### Accessing the Calendar

Navigate to `/google-calendar` in your application to access the Google Calendar integration.

### Connecting to Google Calendar

1. Click "Connect Google Calendar" button
2. Complete OAuth authentication in popup window
3. Grant calendar read permissions
4. View your Google Calendar events alongside app events

### Features Available

- **Week Navigation**: Navigate between weeks using arrow buttons
- **Event Display**: View events with different colors for app vs Google events
- **Task Scheduling**: Drag unscheduled tasks to calendar days
- **External Links**: Click Google Calendar events to open in Google Calendar
- **Connection Management**: Connect/disconnect from Google Calendar

## Error Handling

The integration includes comprehensive error handling for common issues:

### Common Errors and Solutions

1. **"Google Calendar API not properly initialized"**

   - **Cause**: API client failed to initialize properly
   - **Solution**: Refresh the page and try again
   - **Prevention**: Ensure API key is valid and Calendar API is enabled

2. **"API access denied"**

   - **Cause**: API key restrictions or Calendar API not enabled
   - **Solution**: Check Google Cloud Console configuration
   - **Steps**:
     - Verify Calendar API is enabled
     - Check API key restrictions
     - Ensure API key has Calendar API access

3. **"Session expired"**

   - **Cause**: OAuth token has expired
   - **Solution**: Reconnect to Google Calendar
   - **Prevention**: Tokens are automatically refreshed when possible

4. **"Cross-Origin-Opener-Policy errors"**
   - **Cause**: Browser security policies blocking OAuth popup
   - **Solution**: These are warnings and don't affect functionality
   - **Note**: Integration works despite these console warnings

### Connection Status Indicators

- **🔴 Not Connected**: No Google Calendar connection
- **🟡 Connecting**: Authentication in progress
- **🟢 Connected**: Successfully connected and authenticated
- **🔴 Connection Error**: Failed to connect or API error

## Security Considerations

### Data Privacy

- **Read-only Access**: Only calendar read permissions requested
- **Local Storage**: Tokens stored locally in browser
- **No Server Storage**: No calendar data stored on application servers

### API Security

- **Scoped Permissions**: Limited to calendar read-only access
- **Token Expiry**: Automatic token expiry and refresh
- **API Key Restrictions**: Recommend restricting API key to specific domains

## Performance Optimizations

### Caching and Memoization

- **Request Memoization**: Prevent duplicate API calls within 60 seconds
- **Token Validation**: Check token expiry before API requests
- **Lazy Loading**: Google APIs loaded only when needed

### Error Recovery

- **Automatic Retry**: Some errors trigger automatic reconnection
- **Graceful Degradation**: App functions without Google Calendar
- **User Feedback**: Clear error messages and status indicators

## Troubleshooting

### Build Issues

- Ensure all environment variables are set correctly
- Check that Google Cloud Console APIs are enabled
- Verify OAuth client configuration

### Runtime Issues

- **Null Client Errors**: Fixed by properly storing gapi reference during initialization
- **Authentication Loops**: Clear localStorage and reconnect
- **API Errors**: Check Google Cloud Console quotas and billing

### Browser Compatibility

- **Modern Browsers**: Requires ES6+ support
- **Popup Blockers**: May interfere with OAuth flow
- **CORS Issues**: Handled by Google's CORS configuration

## Development Notes

### Code Organization

- **Singleton Pattern**: GoogleCalendarClient ensures single instance
- **React Hooks**: Standard hooks for state management
- **TypeScript**: Full type safety with Google API types
- **Error Boundaries**: Comprehensive error handling

### Testing Considerations

- **Mock API Responses**: For unit testing
- **Environment Switching**: Different configs for dev/prod
- **Error Simulation**: Test error handling paths

### Future Enhancements

- **Write Access**: Add event creation capabilities
- **Multiple Calendars**: Support for multiple calendar accounts
- **Offline Support**: Cache events for offline viewing
- **Sync Improvements**: Real-time event synchronization

## API Reference

### GoogleCalendarClient Methods

```typescript
// Initialize the client
await client.initialize(): Promise<boolean>

// Sign in user
await client.signIn(): Promise<boolean>

// Sign out user
client.signOut(): void

// Get events for date range
await client.getEvents(timeMin: string, timeMax: string): Promise<GoogleCalendarEvent[]>

// Check if user is signed in
client.isSignedIn(): boolean
```

### Event Data Structure

```typescript
interface GoogleCalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: {
    dateTime?: string;
    date?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
  };
  htmlLink: string;
}
```

## Changelog

### Version 1.1 (Latest)

- **Fixed**: Null client reference errors by properly storing gapi instance
- **Added**: Enhanced error handling for API initialization failures
- **Improved**: Connection status indicators and user feedback
- **Enhanced**: Token validation and automatic cleanup

### Version 1.0

- Initial implementation with basic Google Calendar integration
- OAuth authentication with popup flow
- Read-only calendar event display
- Drag-and-drop task scheduling

---

For additional support or questions, refer to the main project documentation or create an issue in the project repository.
