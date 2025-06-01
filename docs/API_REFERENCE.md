# 🔌 API Reference

**For AI Development**: Complete Convex backend implementation with 49 functions across 6 files.

## 🚀 **FULLY IMPLEMENTED BACKEND**

All APIs are now fully implemented and integrated with the frontend. TypeScript compilation is complete with proper system field validation.

### **Projects API (convex/projects.ts)** ✅ **7 Functions**

```typescript
// Get all projects for user with enriched data
export const getProjects = query({
  args: { status: v.optional(v.string()) },
  returns: v.array(ProjectWithStats),
  handler: async (ctx, args) => {
    // Returns projects with task counts, progress, note counts, etc.
  },
});

// Get single project with all related data
export const getProject = query({
  args: { projectId: v.id("projects") },
  returns: v.union(ProjectWithDetails, v.null()),
  handler: async (ctx, args) => {
    // Returns project with tasks, notes, events, notebooks
  },
});

// Create new project
export const createProject = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    color: v.optional(v.string()),
    status: v.optional(v.string()),
  },
  returns: v.id("projects"),
});

// Update project details
export const updateProject = mutation({
  args: {
    projectId: v.id("projects"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    color: v.optional(v.string()),
    status: v.optional(v.string()),
  },
  returns: v.null(),
});

// Delete project and all related data
export const deleteProject = mutation({
  args: { projectId: v.id("projects") },
  returns: v.null(),
  handler: async (ctx, args) => {
    // Cascades delete to tasks, notes, events, notebooks, boards
  },
});

// Get project analytics and insights
export const getProjectStats = query({
  args: {
    projectId: v.optional(v.id("projects")),
    timeRange: v.optional(v.string()),
  },
  returns: ProjectStatsObject,
  handler: async (ctx, args) => {
    // Returns comprehensive project analytics
  },
});

// Archive/unarchive project
export const archiveProject = mutation({
  args: {
    projectId: v.id("projects"),
    archive: v.boolean(),
  },
  returns: v.null(),
});
```

### **Tasks API (convex/tasks.ts)** ✅ **6 Functions**

```typescript
// Get all boards for user
export const getBoards = query({
  args: {},
  returns: v.array(BoardWithSystemFields),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("boards")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});

// Get columns for a board
export const getColumns = query({
  args: { boardId: v.id("boards") },
  returns: v.array(ColumnWithSystemFields),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("columns")
      .withIndex("by_board", (q) => q.eq("boardId", args.boardId))
      .order("asc")
      .collect();
  },
});

// Get tasks for a column
export const getTasks = query({
  args: { columnId: v.id("columns") },
  returns: v.array(TaskWithSystemFields),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("tasks")
      .withIndex("by_column", (q) => q.eq("columnId", args.columnId))
      .order("asc")
      .collect();
  },
});

// Create new board with default columns
export const createBoard = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    projectId: v.optional(v.id("projects")),
  },
  returns: v.id("boards"),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const boardId = await ctx.db.insert("boards", {
      ...args,
      userId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Create default columns
    const defaultColumns = [
      { name: "To Do", color: "#ef4444" },
      { name: "In Progress", color: "#f59e0b" },
      { name: "Done", color: "#10b981" },
    ];

    for (let i = 0; i < defaultColumns.length; i++) {
      await ctx.db.insert("columns", {
        name: defaultColumns[i].name,
        boardId,
        position: i,
        color: defaultColumns[i].color,
        createdAt: Date.now(),
      });
    }

    return boardId;
  },
});

// Create new task
export const createTask = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    columnId: v.id("columns"),
    priority: v.optional(v.string()),
    dueDate: v.optional(v.number()),
  },
  returns: v.id("tasks"),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const column = await ctx.db.get(args.columnId);
    if (!column) throw new Error("Column not found");

    const tasksInColumn = await ctx.db
      .query("tasks")
      .withIndex("by_column", (q) => q.eq("columnId", args.columnId))
      .collect();

    return await ctx.db.insert("tasks", {
      ...args,
      status: "todo",
      boardId: column.boardId,
      position: tasksInColumn.length,
      userId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

// Update task position (drag & drop)
export const updateTaskPosition = mutation({
  args: {
    taskId: v.id("tasks"),
    newColumnId: v.id("columns"),
    newPosition: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.taskId);
    if (!task) throw new Error("Task not found");

    await ctx.db.patch(args.taskId, {
      columnId: args.newColumnId,
      position: args.newPosition,
      updatedAt: Date.now(),
    });

    return null;
  },
});
```

### **Calendar API (convex/calendar.ts)** ✅ **6 Functions**

```typescript
// Get events for date range with enriched data
export const getEvents = query({
  args: {
    startDate: v.number(),
    endDate: v.number(),
    projectId: v.optional(v.id("projects")),
  },
  returns: v.array(EventWithDetails),
  handler: async (ctx, args) => {
    // Returns events with project, task, routine data
  },
});

// Create calendar event
export const createEvent = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    startDate: v.number(),
    endDate: v.number(),
    allDay: v.optional(v.boolean()),
    projectId: v.optional(v.id("projects")),
    taskId: v.optional(v.id("tasks")),
    routineId: v.optional(v.id("routines")),
  },
  returns: v.id("events"),
});

// Update event details
export const updateEvent = mutation({
  args: {
    eventId: v.id("events"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    allDay: v.optional(v.boolean()),
    projectId: v.optional(v.id("projects")),
    taskId: v.optional(v.id("tasks")),
    routineId: v.optional(v.id("routines")),
  },
  returns: v.null(),
});

// Delete calendar event
export const deleteEvent = mutation({
  args: { eventId: v.id("events") },
  returns: v.null(),
});

// Get today's events
export const getTodayEvents = query({
  args: {},
  returns: v.array(EventWithSystemFields),
});

// Get upcoming events (next 7 days)
export const getUpcomingEvents = query({
  args: { days: v.optional(v.number()) },
  returns: v.array(EventWithSystemFields),
});
```

### **Notes API (convex/notes.ts)** ✅ **10 Functions**

```typescript
// NOTEBOOKS
export const getNotebooks = query({
  args: { projectId: v.optional(v.id("projects")) },
  returns: v.array(NotebookWithDetails),
});

export const createNotebook = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    color: v.optional(v.string()),
    projectId: v.optional(v.id("projects")),
  },
  returns: v.id("notebooks"),
});

export const updateNotebook = mutation({
  args: {
    notebookId: v.id("notebooks"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    color: v.optional(v.string()),
    projectId: v.optional(v.id("projects")),
  },
  returns: v.null(),
});

export const deleteNotebook = mutation({
  args: { notebookId: v.id("notebooks") },
  returns: v.null(),
  handler: async (ctx, args) => {
    // Cascades delete to all notes in notebook
  },
});

// NOTES
export const getNotes = query({
  args: {
    notebookId: v.optional(v.id("notebooks")),
    projectId: v.optional(v.id("projects")),
    taskId: v.optional(v.id("tasks")),
    routineId: v.optional(v.id("routines")),
    tags: v.optional(v.array(v.string())),
    searchTerm: v.optional(v.string()),
  },
  returns: v.array(NoteWithDetails),
  handler: async (ctx, args) => {
    // Advanced filtering and enriched with related data
  },
});

export const createNote = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    tags: v.optional(v.array(v.string())),
    projectId: v.optional(v.id("projects")),
    taskId: v.optional(v.id("tasks")),
    routineId: v.optional(v.id("routines")),
    notebookId: v.optional(v.id("notebooks")),
  },
  returns: v.id("notes"),
});

export const updateNote = mutation({
  args: {
    noteId: v.id("notes"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    projectId: v.optional(v.id("projects")),
    taskId: v.optional(v.id("tasks")),
    routineId: v.optional(v.id("routines")),
    notebookId: v.optional(v.id("notebooks")),
  },
  returns: v.null(),
});

export const deleteNote = mutation({
  args: { noteId: v.id("notes") },
  returns: v.null(),
});

export const getAllTags = query({
  args: {},
  returns: v.array(v.string()),
});

export const getRecentNotes = query({
  args: {},
  returns: v.array(NoteWithSystemFields),
});
```

### **Routines API (convex/routines.ts)** ✅ **8 Functions**

```typescript
// ROUTINE TEMPLATES
export const getTemplates = query({
  args: {
    category: v.optional(v.string()),
    difficulty: v.optional(v.string()),
  },
  returns: v.array(TemplateWithBlocks),
  handler: async (ctx, args) => {
    // Returns public templates + user's private templates with blocks
  },
});

export const createTemplate = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    category: v.string(),
    difficulty: v.string(),
    isPublic: v.boolean(),
    tags: v.array(v.string()),
    blocks: v.array(RoutineBlockInput),
  },
  returns: v.id("routineTemplates"),
});

// USER ROUTINES
export const getRoutines = query({
  args: {
    timeOfDay: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
  },
  returns: v.array(RoutineWithStats),
  handler: async (ctx, args) => {
    // Returns routines with completion stats and streak tracking
  },
});

export const createRoutine = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    templateId: v.optional(v.id("routineTemplates")),
    timeOfDay: v.string(),
    blocks: v.optional(v.array(RoutineBlockInput)),
  },
  returns: v.id("routines"),
});

export const completeBlock = mutation({
  args: {
    routineId: v.id("routines"),
    blockId: v.id("routineBlocks"),
    actualDuration: v.optional(v.number()),
    notes: v.optional(v.string()),
    energyLevel: v.optional(v.string()),
  },
  returns: v.null(),
});

export const getInsights = query({
  args: { timeRange: v.optional(v.string()) },
  returns: RoutineInsightsObject,
  handler: async (ctx, args) => {
    // Comprehensive routine analytics and optimization suggestions
  },
});

export const updateRoutine = mutation({
  args: {
    routineId: v.id("routines"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    timeOfDay: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
  },
  returns: v.null(),
});

export const deleteRoutine = mutation({
  args: { routineId: v.id("routines") },
  returns: v.null(),
  handler: async (ctx, args) => {
    // Cascades delete to blocks and completions
  },
});
```

### **Universal Linking API (convex/links.ts)** ✅ **9 Functions**

```typescript
// Core linking functions
export const createLink = mutation({
  args: {
    fromTable: v.string(),
    fromId: v.string(),
    toTable: v.string(),
    toId: v.string(),
    linkType: v.string(),
    metadata: v.optional(LinkMetadata),
  },
  returns: v.id("links"),
});

export const getLinksFrom = query({
  args: {
    fromTable: v.string(),
    fromId: v.string(),
    linkType: v.optional(v.string()),
  },
  returns: v.array(LinkWithSystemFields),
});

export const getLinksTo = query({
  args: {
    toTable: v.string(),
    toId: v.string(),
    linkType: v.optional(v.string()),
  },
  returns: v.array(LinkWithSystemFields),
});

export const getAllLinks = query({
  args: {
    table: v.string(),
    id: v.string(),
    linkType: v.optional(v.string()),
  },
  returns: v.object({
    outgoing: v.array(LinkWithSystemFields),
    incoming: v.array(LinkWithSystemFields),
  }),
});

export const updateLink = mutation({
  args: {
    linkId: v.id("links"),
    metadata: v.optional(LinkMetadata),
  },
  returns: v.null(),
});

export const deleteLink = mutation({
  args: { linkId: v.id("links") },
  returns: v.null(),
});

// Helper functions for common linking patterns
export const linkTaskToRoutine = mutation({
  args: {
    taskId: v.id("tasks"),
    routineId: v.id("routines"),
    description: v.optional(v.string()),
  },
  returns: v.id("links"),
});

export const linkNoteToEntity = mutation({
  args: {
    noteId: v.id("notes"),
    entityTable: v.string(),
    entityId: v.string(),
    linkType: v.optional(v.string()),
  },
  returns: v.id("links"),
});

// Advanced graph analysis
export const getConnectionGraph = query({
  args: {
    entityTable: v.string(),
    entityId: v.string(),
    depth: v.optional(v.number()),
  },
  returns: v.object({
    nodes: v.array(GraphNode),
    edges: v.array(GraphEdge),
  }),
});
```

### **Search API (convex/search.ts)** ✅ **2 Functions**

```typescript
// Unified search across all entities
export const search = query({
  args: {
    query: v.string(),
    types: v.optional(v.array(v.string())),
    projectId: v.optional(v.id("projects")),
    limit: v.optional(v.number()),
  },
  returns: v.object({
    tasks: v.array(TaskSearchResult),
    notes: v.array(NoteSearchResult),
    projects: v.array(ProjectSearchResult),
    events: v.array(EventSearchResult),
    totalResults: v.number(),
  }),
});

// Get search suggestions for autocomplete
export const getSearchSuggestions = query({
  args: { query: v.string() },
  returns: v.array(v.string()),
});
```

### **Sample Data API (convex/sampleData.ts)** ✅ **1 Function**

```typescript
// Create comprehensive sample data for demos
export const createSampleData = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx, args) => {
    // Creates 5 projects, 5 notes, 2 notebooks, 4 events
    // Includes realistic content and proper relationships
  },
});
```

## 🛠️ **IMPLEMENTATION PATTERNS**

### **System Field Validation (CRITICAL)**

All queries must include system fields in return validators:

```typescript
export const getItems = query({
  returns: v.array(
    v.object({
      _id: v.id("items"),
      _creationTime: v.number(), // REQUIRED system field
      // ... other fields
      userId: v.id("users"),
      createdAt: v.number(),
      updatedAt: v.number(),
    }),
  ),
});
```

### **Authentication Pattern**

```typescript
// Queries: return empty array if not authenticated
const userId = await getAuthUserId(ctx);
if (!userId) return [];

// Mutations: throw error if not authenticated
const userId = await getAuthUserId(ctx);
if (!userId) throw new Error("Not authenticated");
```

### **Data Enrichment Pattern**

```typescript
// Enrich with related data
const items = await query.collect();
const enrichedItems = await Promise.all(
  items.map(async (item) => {
    const relatedData = await ctx.db.get(item.relatedId);
    return { ...item, relatedData };
  }),
);
```

### **Cascading Delete Pattern**

```typescript
// Delete entity and all related data
const relatedItems = await ctx.db
  .query("relatedItems")
  .withIndex("by_parent", (q) => q.eq("parentId", args.parentId))
  .collect();

await Promise.all(relatedItems.map((item) => ctx.db.delete(item._id)));
await ctx.db.delete(args.parentId);
```

## 🗃️ **DATABASE SCHEMA (13 Tables)**

Complete schema with proper indexing and relationships:

```typescript
export default defineSchema({
  ...authTables,

  projects: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    color: v.optional(v.string()),
    status: v.optional(v.string()),
    userId: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_status", ["status"])
    .index("by_user_and_status", ["userId", "status"]),

  boards: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    projectId: v.optional(v.id("projects")),
    userId: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_project", ["projectId"]),

  columns: defineTable({
    name: v.string(),
    boardId: v.id("boards"),
    position: v.number(),
    color: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_board", ["boardId"]),

  tasks: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    status: v.string(),
    priority: v.optional(v.string()),
    dueDate: v.optional(v.number()),
    projectId: v.optional(v.id("projects")),
    boardId: v.optional(v.id("boards")),
    columnId: v.optional(v.id("columns")),
    routineId: v.optional(v.id("routines")),
    position: v.number(),
    userId: v.id("users"),
    assignedTo: v.optional(v.id("users")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_project", ["projectId"])
    .index("by_board", ["boardId"])
    .index("by_column", ["columnId"])
    .index("by_routine", ["routineId"])
    .index("by_status", ["status"])
    .index("by_due_date", ["dueDate"])
    .searchIndex("search_tasks", {
      searchField: "title",
      filterFields: ["projectId", "status", "userId"],
    }),

  notebooks: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    color: v.optional(v.string()),
    projectId: v.optional(v.id("projects")),
    userId: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_project", ["projectId"]),

  notes: defineTable({
    title: v.string(),
    content: v.string(),
    tags: v.optional(v.array(v.string())),
    projectId: v.optional(v.id("projects")),
    taskId: v.optional(v.id("tasks")),
    routineId: v.optional(v.id("routines")),
    notebookId: v.optional(v.id("notebooks")),
    userId: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_project", ["projectId"])
    .index("by_notebook", ["notebookId"])
    .index("by_task", ["taskId"])
    .index("by_tags", ["tags"])
    .searchIndex("search_title", {
      searchField: "title",
      filterFields: ["tags", "userId"],
    })
    .searchIndex("search_content", {
      searchField: "content",
      filterFields: ["projectId", "userId"],
    }),

  events: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    startDate: v.number(),
    endDate: v.number(),
    allDay: v.boolean(),
    projectId: v.optional(v.id("projects")),
    taskId: v.optional(v.id("tasks")),
    routineId: v.optional(v.id("routines")),
    userId: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_project", ["projectId"])
    .index("by_date", ["startDate"])
    .index("by_task", ["taskId"])
    .index("by_routine", ["routineId"]),

  // Additional tables: routineTemplates, routineBlocks, routineCompletions, routines, links
});
```

## 🎯 **BACKEND COMPLETION STATUS**

✅ **100% Complete**: All core APIs implemented and tested
✅ **TypeScript**: All validation errors resolved with system fields
✅ **Real-time**: Full Convex synchronization working
✅ **Relationships**: Universal linking between all entities
✅ **Search**: Full-text search across all content
✅ **Sample Data**: Comprehensive demo data generation

**Next Phase**: Enhanced features and AI integration
