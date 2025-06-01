# Database Schema Documentation

## 📋 Overview

This document defines the complete database schema for the Productivity App using Convex. All tables include automatic `_id`, `_creationTime` system fields.

## 🗃️ Core Tables

### Authentication Tables (Managed by Convex Auth) ✅

Authentication and user management handled by `@convex-dev/auth` with `authTables`.

**Current Implementation:**

```typescript
// convex/schema.ts
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,
  // ... your application tables
});
```

**Key Authentication Files:**

- `convex/auth.ts` - Main auth configuration with Password provider ✅
- `convex/auth.config.ts` - Provider configuration (CRITICAL for token validation) ✅
- `middleware.ts` - Route protection with robust error handling ✅

**Provider Setup:**

- **Password Provider**: Email/password authentication ✅
- **Token Validation**: Uses JWKS and JWT_PRIVATE_KEY ✅
- **Middleware Protection**: All routes except `/signin` require authentication ✅

**User Data Access:**

- All application functions use `getAuthUserId(ctx)` for user identification
- User profile data available through Convex Auth system
- Authentication state managed automatically with real-time updates

**Security Features:**

- Server-side session management ✅
- Automatic token refresh ✅
- Protected route middleware ✅
- Graceful authentication error handling ✅

**Troubleshooting**: For authentication issues, see [Authentication Troubleshooting Guide](./AUTH_TROUBLESHOOTING.md)

---

### Projects Table

Central project management and organization.

**Schema:**

```typescript
projects: defineTable({
  name: v.string(), // Project name
  description: v.optional(v.string()), // Project description
  color: v.optional(v.string()), // Hex color for UI (#3B82F6)
  userId: v.id("users"), // Owner reference
  createdAt: v.number(), // Creation timestamp
  updatedAt: v.number(), // Last modified timestamp
});
```

**Indexes:**

- `by_user: ["userId"]` - Get all projects for a user

**Business Rules:**

- Each project must have a unique name per user
- Color defaults to blue (#3B82F6) if not specified
- Projects are soft-deleted (archived) rather than hard-deleted

---

### Boards Table

Kanban boards for task organization.

**Schema:**

```typescript
boards: defineTable({
  name: v.string(), // Board name
  description: v.optional(v.string()), // Board description
  projectId: v.optional(v.id("projects")), // Optional project association
  userId: v.id("users"), // Owner reference
  createdAt: v.number(), // Creation timestamp
  updatedAt: v.number(), // Last modified timestamp
});
```

**Indexes:**

- `by_user: ["userId"]` - Get all boards for a user
- `by_project: ["projectId"]` - Get boards for a project

**Business Rules:**

- Boards can exist independently or be associated with projects
- Each board gets 3 default columns: "To Do", "In Progress", "Done"
- Default board is created for each new user

---

### Columns Table

Kanban board columns for task organization.

**Schema:**

```typescript
columns: defineTable({
  name: v.string(), // Column name ("To Do", "In Progress", etc.)
  boardId: v.id("boards"), // Parent board reference
  position: v.number(), // Display order (0, 1, 2...)
  color: v.optional(v.string()), // Hex color for column header
  createdAt: v.number(), // Creation timestamp
});
```

**Indexes:**

- `by_board: ["boardId"]` - Get columns for a board (ordered by position)

**Business Rules:**

- Columns are ordered by position (0-based)
- Default colors: To Do (#ef4444), In Progress (#f59e0b), Done (#10b981)
- Cannot delete column if it contains tasks
- Minimum 1 column per board

---

### Tasks Table

Individual task items with full metadata.

**Schema:**

```typescript
tasks: defineTable({
  title: v.string(), // Task title
  description: v.optional(v.string()), // Task description/notes
  status: v.string(), // Current status
  priority: v.optional(v.string()), // Priority level
  dueDate: v.optional(v.number()), // Due date timestamp
  projectId: v.optional(v.id("projects")), // Project association
  boardId: v.optional(v.id("boards")), // Board association
  columnId: v.optional(v.id("columns")), // Column placement
  position: v.number(), // Position within column
  userId: v.id("users"), // Task creator
  assignedTo: v.optional(v.id("users")), // Task assignee (future)
  createdAt: v.number(), // Creation timestamp
  updatedAt: v.number(), // Last modified timestamp
});
```

**Indexes:**

- `by_user: ["userId"]` - Get all tasks for a user
- `by_project: ["projectId"]` - Get tasks for a project
- `by_board: ["boardId"]` - Get tasks for a board
- `by_column: ["columnId"]` - Get tasks for a column (ordered by position)

**Valid Values:**

- `status`: "todo", "in-progress", "done", "archived"
- `priority`: "low", "medium", "high", "urgent"

**Business Rules:**

- Tasks without boardId/columnId are "inbox" tasks
- Position is auto-calculated when adding to column
- Tasks maintain history of status changes (future)

---

### Notes Table

Rich text notes with organization and linking.

**Schema:**

```typescript
notes: defineTable({
  title: v.string(), // Note title
  content: v.string(), // Note content (HTML/Markdown)
  tags: v.optional(v.array(v.string())), // Organization tags
  projectId: v.optional(v.id("projects")), // Project association
  userId: v.id("users"), // Note creator
  createdAt: v.number(), // Creation timestamp
  updatedAt: v.number(), // Last modified timestamp
});
```

**Indexes:**

- `by_user: ["userId"]` - Get all notes for a user
- `by_project: ["projectId"]` - Get notes for a project

**Business Rules:**

- Content supports Markdown formatting
- Tags are case-insensitive and normalized
- Notes can link to tasks/projects via content references
- Search indexes on title and content (future)

---

### Events Table

Calendar events and scheduling.

**Schema:**

```typescript
events: defineTable({
  title: v.string(), // Event title
  description: v.optional(v.string()), // Event description
  startDate: v.number(), // Start timestamp
  endDate: v.number(), // End timestamp
  allDay: v.boolean(), // All-day event flag
  projectId: v.optional(v.id("projects")), // Project association
  taskId: v.optional(v.id("tasks")), // Task association
  userId: v.id("users"), // Event creator
  createdAt: v.number(), // Creation timestamp
  updatedAt: v.number(), // Last modified timestamp
});
```

**Indexes:**

- `by_user: ["userId"]` - Get all events for a user
- `by_project: ["projectId"]` - Get events for a project
- `by_date: ["startDate"]` - Get events by date range

**Business Rules:**

- endDate must be >= startDate
- All-day events have time set to 00:00:00
- Events can be linked to tasks (deadlines) or projects (milestones)
- Recurring events handled by creating multiple instances (future)

---

## 🧠 Smart Interconnectivity Tables

### Relationships Table

Tracks connections between different entities for smart interconnectivity.

**Schema:**

```typescript
relationships: defineTable({
  sourceType: v.string(), // Source entity type ("task", "project", "note", "event")
  sourceId: v.string(), // Source entity ID
  targetType: v.string(), // Target entity type
  targetId: v.string(), // Target entity ID
  relationshipType: v.string(), // Type of relationship
  strength: v.number(), // Relationship strength (0.0 - 1.0)
  userId: v.id("users"), // User who owns this relationship
  createdAt: v.number(), // When relationship was detected/created
  lastInteraction: v.number(), // Last time relationship was accessed
});
```

**Indexes:**

- `by_source: ["sourceType", "sourceId"]` - Find all connections from an entity
- `by_target: ["targetType", "targetId"]` - Find all connections to an entity
- `by_user: ["userId"]` - Get all relationships for a user
- `by_strength: ["strength"]` - Query by relationship strength

**Valid Values:**

- `relationshipType`: "dependency", "similarity", "sequence", "category", "mention", "timeline"
- `sourceType/targetType`: "task", "project", "note", "event", "board", "column"

**Business Rules:**

- Relationships are bidirectional (create both directions)
- Strength is automatically calculated based on user interactions
- Relationships decay over time without interaction

---

### User Patterns Table

Tracks user behavior patterns for AI-powered intelligence.

**Schema:**

```typescript
userPatterns: defineTable({
  userId: v.id("users"), // Pattern owner
  patternType: v.string(), // Type of pattern tracked
  context: v.string(), // Context where pattern occurs
  frequency: v.number(), // How often pattern occurs
  effectiveness: v.number(), // Success rate of pattern (0.0 - 1.0)
  timeOfDay: v.optional(v.number()), // Hour when pattern occurs (0-23)
  dayOfWeek: v.optional(v.number()), // Day of week (0-6)
  duration: v.optional(v.number()), // Average duration in minutes
  metadata: v.object({
    // Additional pattern-specific data
    taskType: v.optional(v.string()),
    energyLevel: v.optional(v.string()),
    complexity: v.optional(v.string()),
    tools: v.optional(v.array(v.string())),
  }),
  firstSeen: v.number(), // When pattern was first detected
  lastSeen: v.number(), // Most recent occurrence
  confidence: v.number(), // Confidence in pattern (0.0 - 1.0)
});
```

**Indexes:**

- `by_user: ["userId"]` - Get all patterns for a user
- `by_pattern_type: ["patternType"]` - Query by pattern type
- `by_effectiveness: ["effectiveness"]` - Find most effective patterns
- `by_time: ["timeOfDay"]` - Find time-based patterns

**Valid Values:**

- `patternType`: "productivity_peak", "task_completion", "context_switch", "break_pattern", "focus_duration"
- `context`: "morning_routine", "deep_work", "meetings", "email", "creative_work"
- `energyLevel`: "high", "medium", "low"

---

### AI Insights Table

Stores AI-generated insights and recommendations.

**Schema:**

```typescript
aiInsights: defineTable({
  userId: v.id("users"), // Insight recipient
  insightType: v.string(), // Type of insight
  title: v.string(), // Insight title
  description: v.string(), // Detailed insight description
  actionItems: v.array(v.string()), // Recommended actions
  confidence: v.number(), // AI confidence in insight (0.0 - 1.0)
  priority: v.string(), // Insight priority level
  category: v.string(), // Insight category
  relatedEntities: v.array(
    v.object({
      // Related items
      type: v.string(),
      id: v.string(),
      relevance: v.number(),
    }),
  ),
  dataPoints: v.object({
    // Supporting data
    metrics: v.optional(v.record(v.string(), v.number())),
    trends: v.optional(v.array(v.string())),
    comparisons: v.optional(v.record(v.string(), v.string())),
  }),
  status: v.string(), // Insight status
  createdAt: v.number(), // When insight was generated
  expiresAt: v.optional(v.number()), // When insight becomes stale
  dismissedAt: v.optional(v.number()), // If user dismissed
  actedUpon: v.optional(v.boolean()), // If user took action
});
```

**Indexes:**

- `by_user: ["userId"]` - Get all insights for a user
- `by_priority: ["priority"]` - Query by priority level
- `by_category: ["category"]` - Group by insight category
- `by_status: ["status"]` - Filter by insight status

**Valid Values:**

- `insightType`: "productivity_optimization", "workload_warning", "pattern_suggestion", "bottleneck_alert", "opportunity"
- `priority`: "low", "medium", "high", "urgent"
- `category`: "scheduling", "productivity", "workload", "collaboration", "efficiency"
- `status`: "new", "viewed", "acted_upon", "dismissed", "expired"

---

### Analytics Data Table

Aggregated analytics data for advanced insights.

**Schema:**

```typescript
analyticsData: defineTable({
  userId: v.id("users"), // Data owner
  dateKey: v.string(), // Date in YYYY-MM-DD format
  metricType: v.string(), // Type of metric
  value: v.number(), // Metric value
  metadata: v.object({
    // Additional metric data
    context: v.optional(v.string()),
    category: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
  }),
  aggregationLevel: v.string(), // Aggregation level
  createdAt: v.number(), // When data was recorded
});
```

**Indexes:**

- `by_user_date: ["userId", "dateKey"]` - Time series data for user
- `by_metric: ["metricType"]` - Query by metric type
- `by_aggregation: ["aggregationLevel"]` - Query by aggregation level

**Valid Values:**

- `metricType`: "tasks_completed", "focus_time", "context_switches", "energy_level", "collaboration_time"
- `aggregationLevel`: "hourly", "daily", "weekly", "monthly"

---

## 🔗 Enhanced Relationships

### Updated One-to-Many Relationships

- **User → Relationships**: One user has many entity relationships
- **User → Patterns**: One user has many behavior patterns
- **User → AI Insights**: One user receives many AI insights
- **User → Analytics Data**: One user generates many data points

### New Cross-Entity Relationships

- **Task ↔ Note**: Tasks can reference notes and vice versa
- **Event ↔ Task**: Events can be task deadlines or milestones
- **Project ↔ Pattern**: Projects can have associated productivity patterns
- **Insight → Multiple Entities**: Insights can reference any entity type

## 🚀 Enhanced Query Patterns

### Smart Discovery Queries

1. **Related Content**: Find all items connected to a specific entity
2. **Context Switching**: Get full context when switching between items
3. **Impact Analysis**: Calculate effects of completing/changing items
4. **Pattern Matching**: Find similar patterns or behaviors

### AI-Powered Queries

1. **Predictive Scheduling**: Optimal timing based on patterns
2. **Workload Analysis**: Capacity and overcommitment detection
3. **Productivity Insights**: Behavioral analysis and recommendations
4. **Automated Relationships**: AI-detected connections between items

### Advanced Analytics Queries

1. **Time Series Analysis**: Productivity trends over time
2. **Correlation Analysis**: Relationship between different metrics
3. **Bottleneck Detection**: Identify process inefficiencies
4. **ROI Calculation**: Value analysis of time investments

## 🔄 Data Migration Strategy

- Schema versioning for backward compatibility
- Migration scripts for schema changes
- Data validation and cleanup procedures
- Backup strategies for production data
