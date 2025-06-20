import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// Get all projects for a user (projects are the boards)
export const getBoards = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("projects"),
      _creationTime: v.number(),
      name: v.string(),
      description: v.optional(v.string()),
      color: v.optional(v.string()),
      status: v.optional(v.string()),
      priority: v.optional(v.string()),
      dueDate: v.optional(v.number()),
      tags: v.optional(v.array(v.string())),
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
      .query("projects")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});

// Get columns for a project
export const getColumns = query({
  args: { boardId: v.id("projects") },
  returns: v.array(
    v.object({
      _id: v.id("columns"),
      _creationTime: v.number(),
      name: v.string(),
      projectId: v.id("projects"),
      position: v.number(),
      color: v.optional(v.string()),
      createdAt: v.number(),
    }),
  ),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("columns")
      .withIndex("by_project", (q) => q.eq("projectId", args.boardId))
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
      columnId: v.id("columns"),
      position: v.number(),
      userId: v.id("users"),
      assignedTo: v.optional(v.id("users")),
      tags: v.optional(v.array(v.string())),
      timeEstimate: v.optional(v.number()),
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

// Create a new project (with kanban board)
export const createBoard = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
  },
  returns: v.id("projects"),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const now = Date.now();
    const projectId = await ctx.db.insert("projects", {
      name: args.name,
      description: args.description,
      status: "active",
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
        projectId,
        position: i,
        color: defaultColumns[i].color,
        createdAt: now,
      });
    }

    return projectId;
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
    tags: v.optional(v.array(v.string())),
    assignedTo: v.optional(v.id("users")),
    timeEstimate: v.optional(v.number()),
  },
  returns: v.id("tasks"),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Validate title
    if (!args.title.trim()) {
      throw new Error("Task title is required");
    }

    // Get the column to validate it exists
    const column = await ctx.db.get(args.columnId);
    if (!column) {
      throw new Error("Column not found");
    }

    // Validate assigned user if provided
    if (args.assignedTo) {
      const assignedUser = await ctx.db.get(args.assignedTo);
      if (!assignedUser) {
        throw new Error("Assigned user not found");
      }
    }

    // Get the current task count for position
    const tasksInColumn = await ctx.db
      .query("tasks")
      .withIndex("by_column", (q) => q.eq("columnId", args.columnId))
      .collect();

    const now = Date.now();
    return await ctx.db.insert("tasks", {
      title: args.title.trim(),
      description: args.description?.trim(),
      status: "todo",
      priority: args.priority,
      dueDate: args.dueDate,
      columnId: args.columnId,
      position: tasksInColumn.length,
      userId: userId,
      assignedTo: args.assignedTo,
      tags: args.tags,
      timeEstimate: args.timeEstimate,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Get a single task
export const getTask = query({
  args: { taskId: v.id("tasks") },
  returns: v.union(
    v.object({
      _id: v.id("tasks"),
      _creationTime: v.number(),
      title: v.string(),
      description: v.optional(v.string()),
      status: v.string(),
      priority: v.optional(v.string()),
      dueDate: v.optional(v.number()),
      columnId: v.id("columns"),
      routineId: v.optional(v.id("routines")),
      eventId: v.optional(v.id("events")),
      position: v.number(),
      userId: v.id("users"),
      assignedTo: v.optional(v.id("users")),
      tags: v.optional(v.array(v.string())),
      timeEstimate: v.optional(v.number()),
      completedAt: v.optional(v.number()),
      createdAt: v.number(),
      updatedAt: v.number(),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const task = await ctx.db.get(args.taskId);
    if (!task || task.userId !== userId) {
      return null;
    }

    return task;
  },
});

// Update a task
export const updateTask = mutation({
  args: {
    taskId: v.id("tasks"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    priority: v.optional(v.string()),
    dueDate: v.optional(v.number()),
    tags: v.optional(v.array(v.string())),
    assignedTo: v.optional(v.id("users")),
    timeEstimate: v.optional(v.number()),
    status: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const task = await ctx.db.get(args.taskId);
    if (!task || task.userId !== userId) {
      throw new Error("Task not found or not accessible");
    }

    const updates: any = { updatedAt: Date.now() };

    if (args.title !== undefined) {
      if (!args.title.trim()) {
        throw new Error("Task title is required");
      }
      updates.title = args.title.trim();
    }

    if (args.description !== undefined) {
      updates.description = args.description?.trim();
    }

    if (args.priority !== undefined) {
      updates.priority = args.priority;
    }

    if (args.dueDate !== undefined) {
      updates.dueDate = args.dueDate;
    }

    if (args.tags !== undefined) {
      updates.tags = args.tags;
    }

    if (args.assignedTo !== undefined) {
      if (args.assignedTo) {
        const assignedUser = await ctx.db.get(args.assignedTo);
        if (!assignedUser) {
          throw new Error("Assigned user not found");
        }
      }
      updates.assignedTo = args.assignedTo;
    }

    if (args.timeEstimate !== undefined) {
      updates.timeEstimate = args.timeEstimate;
    }

    if (args.status !== undefined) {
      updates.status = args.status;
      if (args.status === "done" && !task.completedAt) {
        updates.completedAt = Date.now();
      } else if (args.status !== "done" && task.completedAt) {
        updates.completedAt = undefined;
      }
    }

    await ctx.db.patch(args.taskId, updates);
    return null;
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

// Update a project
export const updateProject = mutation({
  args: {
    projectId: v.id("projects"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    color: v.optional(v.string()),
    priority: v.optional(v.string()),
    dueDate: v.optional(v.number()),
    tags: v.optional(v.array(v.string())),
    status: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const project = await ctx.db.get(args.projectId);
    if (!project || project.userId !== userId) {
      throw new Error("Project not found or not accessible");
    }

    const updates: any = { updatedAt: Date.now() };

    if (args.name !== undefined) {
      if (!args.name.trim()) {
        throw new Error("Project name is required");
      }
      updates.name = args.name.trim();
    }

    if (args.description !== undefined) {
      updates.description = args.description?.trim();
    }

    if (args.color !== undefined) {
      updates.color = args.color;
    }

    if (args.priority !== undefined) {
      updates.priority = args.priority;
    }

    if (args.dueDate !== undefined) {
      updates.dueDate = args.dueDate;
    }

    if (args.tags !== undefined) {
      updates.tags = args.tags;
    }

    if (args.status !== undefined) {
      updates.status = args.status;
    }

    await ctx.db.patch(args.projectId, updates);
    return null;
  },
});

// Delete a project
export const deleteProject = mutation({
  args: {
    projectId: v.id("projects"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const project = await ctx.db.get(args.projectId);
    if (!project || project.userId !== userId) {
      throw new Error("Project not found or not accessible");
    }

    // Delete all columns and tasks in this project
    const columns = await ctx.db
      .query("columns")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    for (const column of columns) {
      // Delete all tasks in this column
      const tasks = await ctx.db
        .query("tasks")
        .withIndex("by_column", (q) => q.eq("columnId", column._id))
        .collect();

      for (const task of tasks) {
        await ctx.db.delete(task._id);
      }

      // Delete the column
      await ctx.db.delete(column._id);
    }

    // Delete the project
    await ctx.db.delete(args.projectId);
    return null;
  },
});

// Column Management Functions

// Create a new column
export const createColumn = mutation({
  args: {
    name: v.string(),
    projectId: v.id("projects"),
    color: v.optional(v.string()),
  },
  returns: v.id("columns"),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Validate the project exists and user has access
    const project = await ctx.db.get(args.projectId);
    if (!project || project.userId !== userId) {
      throw new Error("Project not found or not accessible");
    }

    // Validate column name
    if (!args.name.trim()) {
      throw new Error("Column name is required");
    }

    // Get current columns to determine position
    const existingColumns = await ctx.db
      .query("columns")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    const now = Date.now();
    return await ctx.db.insert("columns", {
      name: args.name.trim(),
      projectId: args.projectId,
      position: existingColumns.length,
      color: args.color || "#6b7280",
      createdAt: now,
    });
  },
});

// Update a column
export const updateColumn = mutation({
  args: {
    columnId: v.id("columns"),
    name: v.optional(v.string()),
    color: v.optional(v.string()),
    position: v.optional(v.number()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Get the column and validate access
    const column = await ctx.db.get(args.columnId);
    if (!column) {
      throw new Error("Column not found");
    }

    const project = await ctx.db.get(column.projectId);
    if (!project || project.userId !== userId) {
      throw new Error("Not authorized to update this column");
    }

    // Validate name if provided
    if (args.name !== undefined && !args.name.trim()) {
      throw new Error("Column name cannot be empty");
    }

    // Build update object
    const updates: any = {};
    if (args.name !== undefined) updates.name = args.name.trim();
    if (args.color !== undefined) updates.color = args.color;
    if (args.position !== undefined) updates.position = args.position;

    await ctx.db.patch(args.columnId, updates);
    return null;
  },
});

// Delete a column
export const deleteColumn = mutation({
  args: {
    columnId: v.id("columns"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Get the column and validate access
    const column = await ctx.db.get(args.columnId);
    if (!column) {
      throw new Error("Column not found");
    }

    const project = await ctx.db.get(column.projectId);
    if (!project || project.userId !== userId) {
      throw new Error("Not authorized to delete this column");
    }

    // Check if column has tasks
    const tasksInColumn = await ctx.db
      .query("tasks")
      .withIndex("by_column", (q) => q.eq("columnId", args.columnId))
      .collect();

    if (tasksInColumn.length > 0) {
      throw new Error(
        "Cannot delete column with tasks. Please move or delete all tasks first.",
      );
    }

    // Delete the column
    await ctx.db.delete(args.columnId);

    // Reorder remaining columns
    const remainingColumns = await ctx.db
      .query("columns")
      .withIndex("by_project", (q) => q.eq("projectId", column.projectId))
      .order("asc")
      .collect();

    // Update positions
    for (let i = 0; i < remainingColumns.length; i++) {
      if (remainingColumns[i].position !== i) {
        await ctx.db.patch(remainingColumns[i]._id, { position: i });
      }
    }

    return null;
  },
});

// Update column positions (for reordering)
export const updateColumnPositions = mutation({
  args: {
    columnUpdates: v.array(
      v.object({
        columnId: v.id("columns"),
        position: v.number(),
      }),
    ),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Validate all columns belong to user's projects
    for (const update of args.columnUpdates) {
      const column = await ctx.db.get(update.columnId);
      if (!column) {
        throw new Error("Column not found");
      }

      const project = await ctx.db.get(column.projectId);
      if (!project || project.userId !== userId) {
        throw new Error("Not authorized to update column positions");
      }
    }

    // Update all positions
    for (const update of args.columnUpdates) {
      await ctx.db.patch(update.columnId, { position: update.position });
    }

    return null;
  },
});

// === GOOGLE CALENDAR INTEGRATION HELPERS ===

/**
 * Update task with Google Calendar event ID
 */
export const updateTaskGoogleEventId = mutation({
  args: {
    taskId: v.id("tasks"),
    googleEventId: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const task = await ctx.db.get(args.taskId);
    if (!task) {
      throw new Error("Task not found");
    }

    if (task.userId !== userId) {
      throw new Error("Not authorized to update this task");
    }

    await ctx.db.patch(args.taskId, {
      googleEventId: args.googleEventId,
      updatedAt: Date.now(),
    });

    return null;
  },
});

// Get unscheduled tasks for calendar view
export const getUnscheduledTasks = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("tasks"),
      _creationTime: v.number(),
      title: v.string(),
      description: v.optional(v.string()),
      status: v.string(),
      priority: v.optional(v.string()),
      dueDate: v.optional(v.number()),
      columnId: v.id("columns"),
      routineId: v.optional(v.id("routines")),
      eventId: v.optional(v.id("events")),
      googleEventId: v.optional(v.string()),
      position: v.number(),
      userId: v.id("users"),
      assignedTo: v.optional(v.id("users")),
      tags: v.optional(v.array(v.string())),
      timeEstimate: v.optional(v.number()),
      completedAt: v.optional(v.number()),
      createdAt: v.number(),
      updatedAt: v.number(),
      // Additional fields for calendar display
      projectName: v.optional(v.string()),
      projectColor: v.optional(v.string()),
    }),
  ),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    // Get all tasks for the user that are not completed and don't have an event
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) =>
        q.and(
          q.neq(q.field("status"), "done"),
          q.eq(q.field("eventId"), undefined),
        ),
      )
      .collect();

    // Enrich tasks with project information
    const enrichedTasks = await Promise.all(
      tasks.map(async (task) => {
        // Get the column to find the project
        const column = await ctx.db.get(task.columnId);
        if (!column)
          return { ...task, projectName: undefined, projectColor: undefined };

        // Get the project
        const project = await ctx.db.get(column.projectId);
        if (!project)
          return { ...task, projectName: undefined, projectColor: undefined };

        return {
          ...task,
          projectName: project.name,
          projectColor: project.color,
        };
      }),
    );

    return enrichedTasks;
  },
});
