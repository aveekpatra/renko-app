# Google Calendar Integration - Simple Implementation

## Overview

This document describes the simple Google Calendar integration implemented for the Renko productivity app. The integration provides a read-only view of Google Calendar events alongside the app's own events in a unified weekly calendar view with comprehensive drag-and-drop functionality.

## Architecture

### Core Components

1. **GoogleCalendarClient** - Singleton class handling Google API interactions
2. **GoogleCalendarView** - React component providing the calendar interface
3. **Environment Configuration** - API keys and OAuth client setup

### Key Features

- **Client-side Integration**: Uses Google Calendar API v3 with browser-based authentication
- **Persistent Authentication**: Tokens stored in localStorage with automatic refresh
- **Unified Calendar View**: Shows both app events and Google Calendar events
- **Drag and Drop Functionality**:
  - Drag tasks from sidebar to schedule them
  - Drag existing events to reschedule
  - Resize events to change duration
  - Click on cells to create new events
- **Event Management**:
  - Create new events by clicking on time slots
  - Edit event details through modal
  - Delete app events
  - View Google Calendar events (read-only)
- **Race Condition Prevention**: Memoized API calls to prevent duplicate requests
- **Error Handling**: Comprehensive error states with user-friendly messages

## Implementation Details

### Drag and Drop Features

#### 1. **Task Scheduling**

- Drag unscheduled tasks from the sidebar
- Drop on any time slot to create a 1-hour event
- Visual feedback during drag operation

#### 2. **Event Rescheduling**

- Drag app events to new time slots
- Maintains event duration during move
- Snaps to 15-minute intervals
- Real-time position updates

#### 3. **Event Resizing**

- Hover over top/bottom edges to show resize handles
- Drag handles to adjust start/end times
- Validates that start time remains before end time
- Visual feedback with colored resize zones

#### 4. **Click to Create**

- Click any empty time slot
- Opens modal with event creation form
- Specify title, description, and duration
- Automatically sets start time based on clicked slot

### Event Types

1. **App Events** (Blue)

   - Fully editable (move, resize, delete)
   - Synced with Convex database
   - Can be linked to tasks and projects

2. **Google Calendar Events** (Green)
   - Read-only display
   - Shows with external link icon
   - Click to open in Google Calendar
   - Cannot be moved or resized

### GoogleCalendarClient Class

```typescript
class GoogleCalendarClient {
  // Singleton pattern for global instance
  static getInstance(): GoogleCalendarClient;

  // Initialize Google APIs and authentication
  async initialize(): Promise<boolean>;

  // Sign in with Google OAuth
  async signIn(): Promise<boolean>;

  // Sign out and clear tokens
  signOut(): void;

  // Fetch calendar events (memoized)
  async getEvents(
    timeMin: string,
    timeMax: string,
  ): Promise<GoogleCalendarEvent[]>;

  // Check authentication status
  isSignedIn(): boolean;
}
```

### State Management

```typescript
// Drag and drop states
const [draggedTask, setDraggedTask] = useState<...>
const [draggedEvent, setDraggedEvent] = useState<...>
const [resizingEvent, setResizingEvent] = useState<...>

// Modal states
const [showEventModal, setShowEventModal] = useState(false)
const [selectedEvent, setSelectedEvent] = useState<UnifiedEvent | null>
const [newEventData, setNewEventData] = useState<...>
```

## Setup Instructions

1. **Enable Google Calendar API**

   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create or select a project
   - Enable the Google Calendar API
   - Create credentials (API Key and OAuth 2.0 Client ID)

2. **Configure Environment Variables**

   ```bash
   # .env.local
   NEXT_PUBLIC_GOOGLE_API_KEY=your_google_api_key
   NEXT_PUBLIC_GOOGLE_CALENDAR_CLIENT_ID=your_oauth_client_id
   ```

3. **OAuth Configuration**
   - Add authorized JavaScript origins: `http://localhost:3000`
   - Add authorized redirect URIs: `http://localhost:3000`
   - For production, add your production domain

## Usage

### Connecting Google Calendar

1. Click "Connect Google Calendar" button
2. Authorize access in the OAuth popup
3. Events will automatically sync

### Creating Events

1. **From Tasks**: Drag a task from sidebar to calendar
2. **New Event**: Click on any time slot
3. **Fill Details**: Enter title, description, duration
4. **Save**: Click "Create Event"

### Managing Events

1. **Move**: Drag event to new time/day
2. **Resize**: Drag top/bottom edges
3. **Edit**: Click event to open details
4. **Delete**: Click event, then "Delete" button

### Keyboard Shortcuts

- `Esc`: Close modals
- `Enter`: Submit forms

## Troubleshooting

### Common Issues

1. **"Cannot read properties of null (reading 'client')"**

   - **Cause**: Google API not properly initialized
   - **Fix**: Refresh the page and ensure API key is correct

2. **"API_ACCESS_DENIED"**

   - **Cause**: Google Calendar API not enabled or API key restrictions
   - **Fix**: Enable Calendar API in Google Cloud Console and check API key permissions

3. **"TOKEN_EXPIRED"**

   - **Cause**: OAuth token has expired
   - **Fix**: Click "Connect Google Calendar" to re-authenticate

4. **Events Not Updating**
   - **Cause**: Race condition or stale data
   - **Fix**: Refresh the page or wait for automatic refresh

### Debug Mode

To enable debug logging:

```javascript
// In GoogleCalendarClient
console.log("Debug: API Response", response);
```

## Security Considerations

1. **Token Storage**: OAuth tokens stored in localStorage
2. **API Key**: Restricted to specific domains
3. **Scope**: Read-only access to Google Calendar
4. **CORS**: Handled by Google APIs

## Future Enhancements

1. **Write Access**: Add ability to create/edit Google Calendar events
2. **Recurring Events**: Support for recurring event patterns
3. **Multi-calendar**: Support multiple Google calendars
4. **Sync Conflicts**: Handle conflicts between app and Google events
5. **Mobile Support**: Touch gestures for drag and drop
6. **Offline Mode**: Cache events for offline viewing

## API Reference

### Convex Mutations

```typescript
// Create event
createEvent({
  title: string,
  description?: string,
  startDate: number,
  endDate: number,
  allDay?: boolean,
  taskId?: Id<"tasks">
})

// Update event
updateEvent({
  eventId: Id<"events">,
  title?: string,
  description?: string,
  startDate?: number,
  endDate?: number
})

// Delete event
deleteEvent({
  eventId: Id<"events">
})
```

### Event Handlers

```typescript
// Drag start
handleEventDragStart(event: UnifiedEvent, e: React.DragEvent)

// Drop
handleEventDrop(day: Date, time: string, e: React.DragEvent)

// Resize
handleResizeStart(event: UnifiedEvent, edge: "start" | "end", e: React.MouseEvent)

// Click
handleCellClick(day: Date, time: string)
handleEventClick(event: UnifiedEvent)
```

## Performance Optimizations

1. **Memoization**: API calls cached for 60 seconds
2. **React.useMemo**: Event calculations optimized
3. **Debouncing**: Resize operations debounced
4. **Virtual Scrolling**: (Future) For large event lists
5. **Lazy Loading**: Google APIs loaded on demand

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
