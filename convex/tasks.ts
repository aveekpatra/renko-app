import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// Get all boards for a user
export const getBoards = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("boards"),
      _creationTime: v.number(),
      name: v.string(),
      description: v.optional(v.string()),
      projectId: v.optional(v.id("projects")),
      userId: v.id("users"),
      createdAt: v.number(),
      updatedAt: v.number(),
    }),
  ),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    return await ctx.db
      .query("boards")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});

// Get columns for a board
export const getColumns = query({
  args: { boardId: v.id("boards") },
  returns: v.array(
    v.object({
      _id: v.id("columns"),
      _creationTime: v.number(),
      name: v.string(),
      boardId: v.id("boards"),
      position: v.number(),
      color: v.optional(v.string()),
      createdAt: v.number(),
    }),
  ),
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
  returns: v.array(
    v.object({
      _id: v.id("tasks"),
      _creationTime: v.number(),
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
    }),
  ),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("tasks")
      .withIndex("by_column", (q) => q.eq("columnId", args.columnId))
      .order("asc")
      .collect();
  },
});

// Create a new board
export const createBoard = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    projectId: v.optional(v.id("projects")),
  },
  returns: v.id("boards"),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const now = Date.now();
    const boardId = await ctx.db.insert("boards", {
      name: args.name,
      description: args.description,
      projectId: args.projectId,
      userId: userId,
      createdAt: now,
      updatedAt: now,
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
        createdAt: now,
      });
    }

    return boardId;
  },
});

// Create a new task
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
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Get the column to find the board
    const column = await ctx.db.get(args.columnId);
    if (!column) {
      throw new Error("Column not found");
    }

    // Get the current task count for position
    const tasksInColumn = await ctx.db
      .query("tasks")
      .withIndex("by_column", (q) => q.eq("columnId", args.columnId))
      .collect();

    const now = Date.now();
    return await ctx.db.insert("tasks", {
      title: args.title,
      description: args.description,
      status: "todo",
      priority: args.priority,
      dueDate: args.dueDate,
      boardId: column.boardId,
      columnId: args.columnId,
      position: tasksInColumn.length,
      userId: userId,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Update task position (for drag and drop)
export const updateTaskPosition = mutation({
  args: {
    taskId: v.id("tasks"),
    newColumnId: v.id("columns"),
    newPosition: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.taskId);
    if (!task) {
      throw new Error("Task not found");
    }

    await ctx.db.patch(args.taskId, {
      columnId: args.newColumnId,
      position: args.newPosition,
      updatedAt: Date.now(),
    });

    return null;
  },
});
