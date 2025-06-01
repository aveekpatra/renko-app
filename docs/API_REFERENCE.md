# 🔌 API Reference

**For AI Development**: Current Convex backend status and implementation patterns.

## 🚀 **IMPLEMENTED APIs**

### **Tasks (convex/tasks.ts)** ✅

```typescript
// Get all boards for user
export const getBoards = query({
  args: {},
  returns: v.array(Board),
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
  returns: v.array(Column),
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
  returns: v.array(Task),
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

## ❌ **MISSING APIs** (Need Implementation)

### **Projects (convex/projects.ts)** - NOT IMPLEMENTED

```typescript
// Needed for projects page
export const getProjects = query({ ... });
export const createProject = mutation({ ... });
export const updateProject = mutation({ ... });
export const deleteProject = mutation({ ... });
```

### **Calendar (convex/calendar.ts)** - NOT IMPLEMENTED

```typescript
// Needed for calendar page
export const getEvents = query({ ... });
export const createEvent = mutation({ ... });
export const updateEvent = mutation({ ... });
export const deleteEvent = mutation({ ... });
```

### **Notes (convex/notes.ts)** - NOT IMPLEMENTED

```typescript
// Needed for notes page
export const getNotes = query({ ... });
export const createNote = mutation({ ... });
export const updateNote = mutation({ ... });
export const deleteNote = mutation({ ... });
```

## 🛠️ **DEVELOPMENT PATTERNS**

### **Standard Query Pattern**

```typescript
export const getFunctionName = query({
  args: { param: v.string() },
  returns: v.array(v.object({ field: v.string() })),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("tableName")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});
```

### **Standard Mutation Pattern**

```typescript
export const createFunctionName = mutation({
  args: { title: v.string(), description: v.optional(v.string()) },
  returns: v.id("tableName"),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db.insert("tableName", {
      ...args,
      userId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});
```

### **Error Handling**

```typescript
// Queries: return empty array if not authenticated
if (!userId) return [];

// Mutations: throw error if not authenticated
if (!userId) throw new Error("Not authenticated");

// Validation: check required fields
if (!args.title.trim()) throw new Error("Title is required");

// Reference validation: check if related entity exists
const relatedEntity = await ctx.db.get(args.relatedId);
if (!relatedEntity) throw new Error("Related entity not found");
```

## 🗃️ **DATABASE SCHEMA** (convex/schema.ts)

```typescript
export default defineSchema({
  ...authTables,

  projects: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    color: v.optional(v.string()),
    userId: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),

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
    position: v.number(),
    userId: v.id("users"),
    assignedTo: v.optional(v.id("users")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_project", ["projectId"])
    .index("by_board", ["boardId"])
    .index("by_column", ["columnId"]),

  notes: defineTable({
    title: v.string(),
    content: v.string(),
    tags: v.optional(v.array(v.string())),
    projectId: v.optional(v.id("projects")),
    userId: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_project", ["projectId"]),

  events: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    startDate: v.number(),
    endDate: v.number(),
    allDay: v.boolean(),
    projectId: v.optional(v.id("projects")),
    taskId: v.optional(v.id("tasks")),
    userId: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_project", ["projectId"])
    .index("by_date", ["startDate"]),
});
```

## 🎯 **NEXT API PRIORITIES**

1. **Phase 3**: Complete tasks API (edit, delete, search)
2. **Phase 4**: Implement projects API for projects page
3. **Phase 5**: Implement calendar API for calendar page
4. **Phase 6**: Implement notes API for notes page
