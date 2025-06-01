# API Reference - Convex Functions

## 📋 Overview

This document provides a complete reference for all Convex backend functions, including queries, mutations, and their expected parameters and return types.

## 🔐 Authentication

### Current Setup ✅

**Authentication System**: Convex Auth with Password provider

**Key Files:**

- `convex/auth.ts` - Main authentication configuration ✅
- `convex/auth.config.ts` - Provider configuration (CRITICAL) ✅
- `middleware.ts` - Route protection with error handling ✅
- `convex/schema.ts` - Includes `authTables` for user management ✅

**Provider Configuration:**

```typescript
// convex/auth.ts
export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [Password],
});

// convex/auth.config.ts
export default {
  providers: [
    {
      domain: process.env.CONVEX_SITE_URL,
      applicationID: "convex",
    },
  ],
};
```

**Environment Variables:**

- `JWKS` - Public key for token validation
- `JWT_PRIVATE_KEY` - Private key for token signing
- `SITE_URL` - Application URL (http://localhost:3000)

**Function Access**: All functions use `getAuthUserId(ctx)` to get the current user ID. Functions return empty arrays or throw authentication errors if user is not logged in.

**Troubleshooting**: See [Authentication Troubleshooting Guide](./AUTH_TROUBLESHOOTING.md) for common issues and solutions.

---

## 📊 Tasks API (`convex/tasks.ts`) ✅ **IMPLEMENTED**

### Queries ✅

#### `getBoards` ✅

Get all kanban boards for the authenticated user.

**Signature:**

```typescript
getBoards(): Board[]
```

**Parameters:** None

**Returns:**

```typescript
Array<{
  _id: Id<"boards">;
  name: string;
  description?: string;
  projectId?: Id<"projects">;
  userId: Id<"users">;
  createdAt: number;
  updatedAt: number;
}>;
```

**Example:**

```typescript
const boards = useQuery(api.tasks.getBoards);
```

---

#### `getColumns` ✅

Get all columns for a specific board, ordered by position.

**Signature:**

```typescript
getColumns(boardId: Id<"boards">): Column[]
```

**Parameters:**

- `boardId: Id<"boards">` - The board to get columns for

**Returns:**

```typescript
Array<{
  _id: Id<"columns">;
  name: string;
  boardId: Id<"boards">;
  position: number;
  color?: string;
  createdAt: number;
}>;
```

**Example:**

```typescript
const columns = useQuery(api.tasks.getColumns, { boardId });
```

---

#### `getTasks` ✅

Get all tasks in a specific column, ordered by position.

**Signature:**

```typescript
getTasks(columnId: Id<"columns">): Task[]
```

**Parameters:**

- `columnId: Id<"columns">` - The column to get tasks for

**Returns:**

```typescript
Array<{
  _id: Id<"tasks">;
  title: string;
  description?: string;
  status: string;
  priority?: string;
  dueDate?: number;
  projectId?: Id<"projects">;
  boardId?: Id<"boards">;
  columnId?: Id<"columns">;
  position: number;
  userId: Id<"users">;
  assignedTo?: Id<"users">;
  createdAt: number;
  updatedAt: number;
}>;
```

**Example:**

```typescript
const tasks = useQuery(api.tasks.getTasks, { columnId });
```

### Mutations ✅

#### `createBoard` ✅

Create a new kanban board with default columns.

**Signature:**

```typescript
createBoard(name: string, description?: string, projectId?: Id<"projects">): Id<"boards">
```

**Parameters:**

- `name: string` - Board name (required)
- `description?: string` - Board description (optional)
- `projectId?: Id<"projects">` - Associate with project (optional)

**Returns:** `Id<"boards">` - The created board ID

**Side Effects:**

- Creates 3 default columns: "To Do", "In Progress", "Done"
- Sets default colors for columns (#ef4444, #f59e0b, #10b981)

**Example:**

```typescript
const createBoard = useMutation(api.tasks.createBoard);
const boardId = await createBoard({
  name: "Sprint Planning",
  description: "Q4 Sprint Tasks",
  projectId: "project_123",
});
```

---

#### `createTask` ✅

Create a new task in a specific column.

**Signature:**

```typescript
createTask(title: string, description?: string, columnId: Id<"columns">, priority?: string, dueDate?: number): Id<"tasks">
```

**Parameters:**

- `title: string` - Task title (required)
- `description?: string` - Task description (optional)
- `columnId: Id<"columns">` - Target column (required)
- `priority?: string` - Priority level: "low" | "medium" | "high" | "urgent" (optional)
- `dueDate?: number` - Due date timestamp (optional)

**Returns:** `Id<"tasks">` - The created task ID

**Side Effects:**

- Sets position to end of column
- Sets status to "todo"
- Associates with board via column

**Example:**

```typescript
const createTask = useMutation(api.tasks.createTask);
const taskId = await createTask({
  title: "Implement user authentication",
  description: "Set up Convex Auth with email/password",
  columnId: "column_123",
  priority: "high",
  dueDate: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days from now
});
```

---

#### `updateTaskPosition` ✅

Move a task to a different column and/or position (drag & drop).

**Signature:**

```typescript
updateTaskPosition(taskId: Id<"tasks">, newColumnId: Id<"columns">, newPosition: number): null
```

**Parameters:**

- `taskId: Id<"tasks">` - Task to move (required)
- `newColumnId: Id<"columns">` - Target column (required)
- `newPosition: number` - New position in column (required)

**Returns:** `null`

**Side Effects:**

- Updates task's columnId and position
- Updates task's updatedAt timestamp

**Example:**

```typescript
const updateTaskPosition = useMutation(api.tasks.updateTaskPosition);
await updateTaskPosition({
  taskId: "task_123",
  newColumnId: "column_456",
  newPosition: 2,
});
```

---

## 📁 Projects API (`convex/projects.ts`) - **NOT YET IMPLEMENTED**

_The following APIs are planned but not yet implemented. Current project functionality is handled through static data in components._

### Queries (Planned)

#### `getProjects` (Planned)

Get all projects for the authenticated user.

#### `getProject` (Planned)

Get a specific project with full details.

#### `getProjectStats` (Planned)

Get analytics and statistics for a project.

### Mutations (Planned)

#### `createProject` (Planned)

Create a new project.

#### `updateProject` (Planned)

Update project details.

#### `archiveProject` (Planned)

Soft-delete a project.

---

## 📝 Notes API (`convex/notes.ts`) - **NOT YET IMPLEMENTED**

_The following APIs are planned but not yet implemented. Current notes functionality uses static UI._

### Queries (Planned)

#### `getNotes` (Planned)

Get all notes for user, optionally filtered by project.

#### `searchNotes` (Planned)

Full-text search across note titles and content.

### Mutations (Planned)

#### `createNote` (Planned)

Create a new note.

#### `updateNote` (Planned)

Update note content.

#### `deleteNote` (Planned)

Delete a note.

---

## 📅 Calendar API (`convex/calendar.ts`) - **NOT YET IMPLEMENTED**

_The following APIs are planned but not yet implemented. Current calendar functionality uses static event data._

### Queries (Planned)

#### `getEvents` (Planned)

Get events for a date range.

#### `getUpcomingEvents` (Planned)

Get upcoming events and deadlines.

### Mutations (Planned)

#### `createEvent` (Planned)

Create a new calendar event.

#### `updateEvent` (Planned)

Update event details.

#### `deleteEvent` (Planned)

Delete an event.

---

## 🛠️ Error Handling

### Authentication Errors

```typescript
// Returns empty array for queries
if (!userId) {
  return [];
}

// Throws error for mutations
if (!userId) {
  throw new Error("Not authenticated");
}
```

### Validation Errors

```typescript
// Missing required fields
if (!title.trim()) {
  throw new Error("Title is required");
}

// Invalid references
if (!column) {
  throw new Error("Column not found");
}
```

### Common Error Types

- `"Not authenticated"` - User not logged in
- `"Not found"` - Referenced entity doesn't exist
- `"Validation error"` - Invalid input data
- `"Permission denied"` - User doesn't own resource

---

## 🚀 Usage Patterns

### React Hooks

```typescript
// Queries (real-time)
const boards = useQuery(api.tasks.getBoards);
const columns = useQuery(api.tasks.getColumns, { boardId });

// Mutations
const createBoard = useMutation(api.tasks.createBoard);
const createTask = useMutation(api.tasks.createTask);

// Usage
const handleCreateBoard = async () => {
  try {
    const boardId = await createBoard({ name: "New Board" });
    console.log("Created board:", boardId);
  } catch (error) {
    console.error("Failed to create board:", error);
  }
};
```

### Loading States

```typescript
const boards = useQuery(api.tasks.getBoards);

if (boards === undefined) {
  return <LoadingSpinner />;
}

if (boards.length === 0) {
  return <EmptyState />;
}

return <BoardList boards={boards} />;
```

### Optimistic Updates

Convex automatically handles optimistic updates for mutations. UI updates immediately and syncs with server.

---

## 🧠 Smart Interconnectivity API (`convex/intelligence.ts`) - Future

### Queries

#### `getRelatedItems` (Planned)

Get all items connected to a specific entity.

**Signature:**

```typescript
getRelatedItems(entityType: string, entityId: string, limit?: number): RelatedItem[]
```

**Parameters:**

- `entityType: string` - Type of source entity ("task", "project", "note", "event")
- `entityId: string` - ID of the source entity
- `limit?: number` - Maximum items to return (default: 20)

**Returns:**

```typescript
Array<{
  entityType: string;
  entityId: string;
  title: string;
  relationshipType: string;
  strength: number;
  lastInteraction: number;
}>;
```

#### `getContextualInsights` (Planned)

Get AI-powered contextual suggestions for an entity.

**Signature:**

```typescript
getContextualInsights(entityType: string, entityId: string): ContextualInsight[]
```

**Returns:**

```typescript
Array<{
  type: "suggestion" | "warning" | "optimization";
  title: string;
  description: string;
  actionItems: string[];
  confidence: number;
  relatedItems: RelatedItem[];
}>;
```

### Mutations

#### `createRelationship` (Planned)

Manually create or strengthen a relationship between entities.

**Signature:**

```typescript
createRelationship(
  sourceType: string,
  sourceId: string,
  targetType: string,
  targetId: string,
  relationshipType: string
): null
```

#### `trackInteraction` (Planned)

Record user interaction to strengthen relationships and patterns.

**Signature:**

```typescript
trackInteraction(
  entityType: string,
  entityId: string,
  interactionType: string,
  context?: object
): null
```

---

## 🤖 AI Intelligence API (`convex/ai.ts`) - Future

### Queries

#### `getPredictiveSchedule` (Planned)

Get AI-suggested optimal timing for tasks.

**Signature:**

```typescript
getPredictiveSchedule(taskIds: Id<"tasks">[], timeframe: string): ScheduleSuggestion[]
```

**Returns:**

```typescript
Array<{
  taskId: Id<"tasks">;
  suggestedStart: number;
  suggestedDuration: number;
  confidence: number;
  reasoning: string;
  energyLevel: "high" | "medium" | "low";
}>;
```

#### `getWorkloadAnalysis` (Planned)

Analyze current workload and capacity.

**Signature:**

```typescript
getWorkloadAnalysis(timeframe: string): WorkloadAnalysis
```

**Returns:**

```typescript
{
  currentCapacity: number;
  utilization: number;
  overcommitmentRisk: number;
  suggestions: string[];
  bottlenecks: Array<{
    type: string;
    description: string;
    impact: number;
  }>;
}
```

#### `getProductivityPatterns` (Planned)

Get user's productivity patterns and insights.

**Signature:**

```typescript
getProductivityPatterns(timeframe: string): ProductivityPattern[]
```

**Returns:**

```typescript
Array<{
  patternType: string;
  description: string;
  frequency: number;
  effectiveness: number;
  recommendations: string[];
  timeOfDay?: number;
  dayOfWeek?: number;
}>;
```

### Mutations

#### `recordProductivityData` (Planned)

Record productivity metrics for AI learning.

**Signature:**

```typescript
recordProductivityData(
  metricType: string,
  value: number,
  context: object
): null
```

#### `dismissInsight` (Planned)

Mark an AI insight as dismissed.

**Signature:**

```typescript
dismissInsight(insightId: Id<"aiInsights">): null
```

---

## 📊 Advanced Analytics API (`convex/analytics.ts`) - Future

### Queries

#### `getProductivityDashboard` (Planned)

Get comprehensive productivity analytics dashboard.

**Signature:**

```typescript
getProductivityDashboard(timeframe: string): ProductivityDashboard
```

**Returns:**

```typescript
{
  overview: {
    tasksCompleted: number;
    focusTime: number;
    productivityScore: number;
    trend: "up" | "down" | "stable";
  };
  patterns: {
    peakHours: number[];
    mostProductiveDays: string[];
    averageFocusSession: number;
  };
  insights: Array<{
    title: string;
    description: string;
    impact: "high" | "medium" | "low";
    actionable: boolean;
  }>;
  comparisons: {
    lastWeek: number;
    lastMonth: number;
    average: number;
  };
}
```

#### `getBottleneckAnalysis` (Planned)

Identify process bottlenecks and inefficiencies.

**Signature:**

```typescript
getBottleneckAnalysis(projectId?: Id<"projects">): BottleneckAnalysis
```

**Returns:**

```typescript
{
  bottlenecks: Array<{
    location: string;
    type: "process" | "resource" | "dependency";
    severity: number;
    description: string;
    suggestedFixes: string[];
    estimatedImpact: string;
  }>;
  flowMetrics: {
    averageLeadTime: number;
    cycleTime: number;
    throughput: number;
    workInProgress: number;
  }
}
```

#### `getROIAnalysis` (Planned)

Calculate return on investment for time spent.

**Signature:**

```typescript
getROIAnalysis(timeframe: string, projectId?: Id<"projects">): ROIAnalysis
```

**Returns:**

```typescript
{
  timeInvestment: number;
  outcomes: Array<{
    type: string;
    value: number;
    description: string;
  }>;
  roi: number;
  trends: Array<{
    period: string;
    roi: number;
    timeSpent: number;
  }>;
  recommendations: string[];
}
```

### Mutations

#### `recordOutcome` (Planned)

Record a completed outcome for ROI calculation.

**Signature:**

```typescript
recordOutcome(
  projectId: Id<"projects">,
  outcomeType: string,
  value: number,
  description: string
): null
```

---

## 🎭 Natural Language API (`convex/nlp.ts`) - Future

### Mutations

#### `processNaturalLanguageQuery` (Planned)

Process natural language commands and queries.

**Signature:**

```typescript
processNaturalLanguageQuery(query: string): NLPResponse
```

**Parameters:**

- `query: string` - Natural language input (e.g., "Show me everything related to the Johnson project due this week")

**Returns:**

```typescript
{
  intent: string;
  entities: Array<{
    type: string;
    value: string;
    confidence: number;
  }>;
  actions: Array<{
    type: string;
    parameters: object;
  }>;
  response: string;
  suggestions?: string[];
}
```

#### `createFromNaturalLanguage` (Planned)

Create tasks, events, or notes from natural language.

**Signature:**

```typescript
createFromNaturalLanguage(
  input: string,
  type: "task" | "event" | "note"
): NLPCreationResult
```

**Returns:**

```typescript
{
  success: boolean;
  createdId?: string;
  extractedData: object;
  confidence: number;
  clarificationNeeded?: Array<{
    field: string;
    question: string;
    suggestions: string[];
  }>;
}
```

---

## 📈 Performance Considerations

### Smart Caching

- Relationship data cached with TTL
- AI insights cached until data changes
- Analytics aggregated in background jobs

### Batch Operations

- Bulk relationship creation
- Batch pattern analysis
- Aggregated analytics computation

### Real-time vs Background

- **Real-time**: User interactions, relationship tracking
- **Background**: Pattern analysis, AI insights generation, analytics aggregation

---

## 🔐 Enhanced Error Handling

### Intelligence-Specific Errors

```typescript
// AI Service Errors
if (!aiServiceAvailable) {
  throw new Error("AI service temporarily unavailable");
}

// Insufficient Data Errors
if (userData.length < minimumRequired) {
  throw new Error("Insufficient data for reliable insights");
}

// Rate Limiting
if (rateLimitExceeded) {
  throw new Error("Too many AI requests. Please try again later.");
}
```

### Graceful Degradation

- Fall back to basic functionality when AI unavailable
- Show cached insights when real-time analysis fails
- Provide manual alternatives for AI-powered features

---

## 📊 Performance Considerations

### Query Optimization

- Use specific indexes for filtering
- Limit results for large datasets
- Implement pagination for 100+ items

### Mutation Best Practices

- Validate input on client and server
- Use bulk operations for multiple changes
- Handle errors gracefully with user feedback

### Real-time Subscriptions

- Queries automatically subscribe to changes
- Components re-render when data updates
- Use React.memo() to prevent unnecessary re-renders
