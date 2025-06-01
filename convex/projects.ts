import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// Get all projects for user
export const getProjects = query({
  args: {
    status: v.optional(v.string()),
  },
  returns: v.array(
    v.object({
      _id: v.id("projects"),
      _creationTime: v.number(),
      name: v.string(),
      description: v.optional(v.string()),
      color: v.optional(v.string()),
      status: v.optional(v.string()),
      userId: v.id("users"),
      createdAt: v.number(),
      updatedAt: v.number(),
      taskCount: v.number(),
      completedTasks: v.number(),
      noteCount: v.number(),
      eventCount: v.number(),
      routineCount: v.number(),
      progress: v.number(),
    }),
  ),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    let query = ctx.db
      .query("projects")
      .withIndex("by_user", (q) => q.eq("userId", userId));

    if (args.status) {
      query = ctx.db
        .query("projects")
        .withIndex("by_user_and_status", (q) =>
          q.eq("userId", userId).eq("status", args.status),
        );
    }

    const projects = await query.collect();

    // Get related data counts for each project
    const projectsWithData = await Promise.all(
      projects.map(async (project) => {
        // Count tasks
        const tasks = await ctx.db
          .query("tasks")
          .withIndex("by_project", (q) => q.eq("projectId", project._id))
          .collect();

        const completedTasks = tasks.filter(
          (task) => task.status === "done",
        ).length;

        // Count notes
        const notes = await ctx.db
          .query("notes")
          .withIndex("by_project", (q) => q.eq("projectId", project._id))
          .collect();

        // Count events
        const events = await ctx.db
          .query("events")
          .withIndex("by_project", (q) => q.eq("projectId", project._id))
          .collect();

        // Count routines (indirectly through tasks)
        const routineCount = 0; // Could implement routine-project linking later

        const progress =
          tasks.length > 0
            ? Math.round((completedTasks / tasks.length) * 100)
            : 0;

        return {
          ...project,
          taskCount: tasks.length,
          completedTasks,
          noteCount: notes.length,
          eventCount: events.length,
          routineCount,
          progress,
        };
      }),
    );

    return projectsWithData.sort((a, b) => b.updatedAt - a.updatedAt);
  },
});

// Get single project with details
export const getProject = query({
  args: {
    projectId: v.id("projects"),
  },
  returns: v.union(
    v.object({
      _id: v.id("projects"),
      _creationTime: v.number(),
      name: v.string(),
      description: v.optional(v.string()),
      color: v.optional(v.string()),
      status: v.optional(v.string()),
      userId: v.id("users"),
      createdAt: v.number(),
      updatedAt: v.number(),
      tasks: v.array(
        v.object({
          _id: v.id("tasks"),
          title: v.string(),
          status: v.string(),
          priority: v.optional(v.string()),
          dueDate: v.optional(v.number()),
          assignedTo: v.optional(v.id("users")),
        }),
      ),
      notes: v.array(
        v.object({
          _id: v.id("notes"),
          title: v.string(),
          content: v.string(),
          tags: v.optional(v.array(v.string())),
          createdAt: v.number(),
        }),
      ),
      events: v.array(
        v.object({
          _id: v.id("events"),
          title: v.string(),
          startDate: v.number(),
          endDate: v.number(),
          allDay: v.boolean(),
        }),
      ),
      notebooks: v.array(
        v.object({
          _id: v.id("notebooks"),
          name: v.string(),
          color: v.optional(v.string()),
          noteCount: v.number(),
        }),
      ),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return undefined;

    const project = await ctx.db.get(args.projectId);
    if (!project || project.userId !== userId) {
      return undefined;
    }

    // Get related data
    const [tasks, notes, events, notebooks] = await Promise.all([
      ctx.db
        .query("tasks")
        .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
        .collect(),
      ctx.db
        .query("notes")
        .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
        .collect(),
      ctx.db
        .query("events")
        .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
        .collect(),
      ctx.db
        .query("notebooks")
        .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
        .collect(),
    ]);

    // Get note counts for notebooks
    const notebooksWithCounts = await Promise.all(
      notebooks.map(async (notebook) => {
        const notebookNotes = await ctx.db
          .query("notes")
          .withIndex("by_notebook", (q) => q.eq("notebookId", notebook._id))
          .collect();

        return {
          _id: notebook._id,
          name: notebook.name,
          color: notebook.color,
          noteCount: notebookNotes.length,
        };
      }),
    );

    return {
      ...project,
      tasks: tasks.map((task) => ({
        _id: task._id,
        title: task.title,
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate,
        assignedTo: task.assignedTo,
      })),
      notes: notes.map((note) => ({
        _id: note._id,
        title: note.title,
        content: note.content,
        tags: note.tags,
        createdAt: note.createdAt,
      })),
      events: events.map((event) => ({
        _id: event._id,
        title: event.title,
        startDate: event.startDate,
        endDate: event.endDate,
        allDay: event.allDay,
      })),
      notebooks: notebooksWithCounts,
    };
  },
});

// Create project
export const createProject = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    color: v.optional(v.string()),
    status: v.optional(v.string()),
  },
  returns: v.id("projects"),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    if (!args.name.trim()) throw new Error("Project name is required");

    return await ctx.db.insert("projects", {
      name: args.name.trim(),
      description: args.description?.trim(),
      color: args.color || "#6366f1",
      status: args.status || "active",
      userId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

// Update project
export const updateProject = mutation({
  args: {
    projectId: v.id("projects"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    color: v.optional(v.string()),
    status: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const project = await ctx.db.get(args.projectId);
    if (!project || project.userId !== userId) {
      throw new Error("Project not found");
    }

    const updates: any = { updatedAt: Date.now() };

    if (args.name !== undefined) {
      if (!args.name.trim()) throw new Error("Project name is required");
      updates.name = args.name.trim();
    }
    if (args.description !== undefined)
      updates.description = args.description?.trim();
    if (args.color !== undefined) updates.color = args.color;
    if (args.status !== undefined) updates.status = args.status;

    await ctx.db.patch(args.projectId, updates);
    return null;
  },
});

// Delete project (and all related data)
export const deleteProject = mutation({
  args: {
    projectId: v.id("projects"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const project = await ctx.db.get(args.projectId);
    if (!project || project.userId !== userId) {
      throw new Error("Project not found");
    }

    // Get all related data
    const [tasks, notes, events, notebooks, boards] = await Promise.all([
      ctx.db
        .query("tasks")
        .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
        .collect(),
      ctx.db
        .query("notes")
        .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
        .collect(),
      ctx.db
        .query("events")
        .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
        .collect(),
      ctx.db
        .query("notebooks")
        .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
        .collect(),
      ctx.db
        .query("boards")
        .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
        .collect(),
    ]);

    // Delete all related entities
    await Promise.all([
      // Delete tasks
      ...tasks.map((task) => ctx.db.delete(task._id)),
      // Delete notes
      ...notes.map((note) => ctx.db.delete(note._id)),
      // Delete events
      ...events.map((event) => ctx.db.delete(event._id)),
      // Delete notebooks (and their notes will be handled by the notebook deletion)
      ...notebooks.map((notebook) => ctx.db.delete(notebook._id)),
      // Delete boards
      ...boards.map((board) => ctx.db.delete(board._id)),
    ]);

    // Delete the project itself
    await ctx.db.delete(args.projectId);
    return null;
  },
});

// Get project stats/analytics
export const getProjectStats = query({
  args: {
    projectId: v.optional(v.id("projects")),
    timeRange: v.optional(v.string()), // "week", "month", "year"
  },
  returns: v.object({
    totalProjects: v.number(),
    activeProjects: v.number(),
    completedProjects: v.number(),
    totalTasks: v.number(),
    completedTasks: v.number(),
    totalNotes: v.number(),
    totalEvents: v.number(),
    productivityScore: v.number(),
    recentActivity: v.array(
      v.object({
        type: v.string(), // "task", "note", "event"
        title: v.string(),
        date: v.number(),
        projectName: v.string(),
      }),
    ),
  }),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return {
        totalProjects: 0,
        activeProjects: 0,
        completedProjects: 0,
        totalTasks: 0,
        completedTasks: 0,
        totalNotes: 0,
        totalEvents: 0,
        productivityScore: 0,
        recentActivity: [],
      };
    }

    // Calculate time range
    const timeRange = args.timeRange || "month";
    const now = Date.now();
    const ranges = {
      week: 7 * 24 * 60 * 60 * 1000,
      month: 30 * 24 * 60 * 60 * 1000,
      year: 365 * 24 * 60 * 60 * 1000,
    };
    const startTime = now - ranges[timeRange as keyof typeof ranges];

    // Get projects
    const projects = await ctx.db
      .query("projects")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const activeProjects = projects.filter((p) => p.status === "active").length;
    const completedProjects = projects.filter(
      (p) => p.status === "completed",
    ).length;

    // Get tasks
    const allTasks = await Promise.all(
      projects.map((project) =>
        ctx.db
          .query("tasks")
          .withIndex("by_project", (q) => q.eq("projectId", project._id))
          .collect(),
      ),
    );
    const tasks = allTasks.flat();
    const completedTasks = tasks.filter(
      (task) => task.status === "done",
    ).length;

    // Get notes
    const allNotes = await Promise.all(
      projects.map((project) =>
        ctx.db
          .query("notes")
          .withIndex("by_project", (q) => q.eq("projectId", project._id))
          .collect(),
      ),
    );
    const notes = allNotes.flat();

    // Get events
    const allEvents = await Promise.all(
      projects.map((project) =>
        ctx.db
          .query("events")
          .withIndex("by_project", (q) => q.eq("projectId", project._id))
          .collect(),
      ),
    );
    const events = allEvents.flat();

    // Calculate productivity score (simple algorithm)
    const taskCompletionRate =
      tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;
    const activityScore = Math.min(
      100,
      ((tasks.length + notes.length + events.length) / 10) * 100,
    );
    const productivityScore = Math.round(
      (taskCompletionRate + activityScore) / 2,
    );

    // Get recent activity
    const recentTasks = tasks
      .filter((task) => task.createdAt >= startTime)
      .map((task) => ({
        type: "task" as const,
        title: task.title,
        date: task.createdAt,
        projectName:
          projects.find((p) => p._id === task.projectId)?.name || "Unknown",
      }));

    const recentNotes = notes
      .filter((note) => note.createdAt >= startTime)
      .map((note) => ({
        type: "note" as const,
        title: note.title,
        date: note.createdAt,
        projectName:
          projects.find((p) => p._id === note.projectId)?.name || "Unknown",
      }));

    const recentEvents = events
      .filter((event) => event.createdAt >= startTime)
      .map((event) => ({
        type: "event" as const,
        title: event.title,
        date: event.createdAt,
        projectName:
          projects.find((p) => p._id === event.projectId)?.name || "Unknown",
      }));

    const recentActivity = [...recentTasks, ...recentNotes, ...recentEvents]
      .sort((a, b) => b.date - a.date)
      .slice(0, 10);

    return {
      totalProjects: projects.length,
      activeProjects,
      completedProjects,
      totalTasks: tasks.length,
      completedTasks,
      totalNotes: notes.length,
      totalEvents: events.length,
      productivityScore,
      recentActivity,
    };
  },
});

// Archive/unarchive project
export const archiveProject = mutation({
  args: {
    projectId: v.id("projects"),
    archive: v.boolean(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const project = await ctx.db.get(args.projectId);
    if (!project || project.userId !== userId) {
      throw new Error("Project not found");
    }

    await ctx.db.patch(args.projectId, {
      status: args.archive ? "archived" : "active",
      updatedAt: Date.now(),
    });

    return null;
  },
});
