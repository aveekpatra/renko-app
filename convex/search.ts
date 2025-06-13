import { query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// Universal search function
export const search = query({
  args: {
    query: v.string(),
    limit: v.optional(v.number()),
    projectId: v.optional(v.id("projects")),
    types: v.optional(v.array(v.string())), // ["tasks", "projects", "events"]
  },
  returns: v.object({
    tasks: v.array(
      v.object({
        _id: v.id("tasks"),
        title: v.string(),
        description: v.optional(v.string()),
        status: v.string(),
        projectId: v.optional(v.id("projects")),
        project: v.optional(
          v.object({
            _id: v.id("projects"),
            name: v.string(),
            color: v.optional(v.string()),
          }),
        ),
        relevanceScore: v.number(),
      }),
    ),
    projects: v.array(
      v.object({
        _id: v.id("projects"),
        name: v.string(),
        description: v.optional(v.string()),
        color: v.optional(v.string()),
        relevanceScore: v.number(),
      }),
    ),
    events: v.array(
      v.object({
        _id: v.id("events"),
        title: v.string(),
        description: v.optional(v.string()),
        startDate: v.number(),
        projectId: v.optional(v.id("projects")),
        project: v.optional(
          v.object({
            _id: v.id("projects"),
            name: v.string(),
            color: v.optional(v.string()),
          }),
        ),
        relevanceScore: v.number(),
      }),
    ),
    totalResults: v.number(),
  }),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return {
        tasks: [],
        projects: [],
        events: [],
        totalResults: 0,
      };
    }

    const limit = args.limit || 50;
    const searchQuery = args.query.toLowerCase().trim();

    if (!searchQuery) {
      return {
        tasks: [],
        projects: [],
        events: [],
        totalResults: 0,
      };
    }

    const searchTypes = args.types || ["tasks", "projects", "events"];

    const results = {
      tasks: [] as any[],
      projects: [] as any[],
      events: [] as any[],
      totalResults: 0,
    };

    // Search tasks
    if (searchTypes.includes("tasks")) {
      const taskMap = new Map();

      // Search by title
      const tasksByTitle = await ctx.db
        .query("tasks")
        .withSearchIndex("search_tasks", (q) =>
          q.search("title", searchQuery).eq("userId", userId),
        )
        .take(limit);

      tasksByTitle.forEach((task, index) => {
        if (!taskMap.has(task._id)) {
          taskMap.set(task._id, {
            ...task,
            relevanceScore: 1.0 - index * 0.01,
          });
        }
      });

      const tasks = Array.from(taskMap.values());

      // Filter by project if specified
      const filteredTasks = args.projectId
        ? tasks.filter((t) => t.projectId === args.projectId)
        : tasks;

      // Get project data for tasks
      const projectIds = filteredTasks.map((t) => t.projectId).filter(Boolean);
      const projects = await Promise.all(
        [...new Set(projectIds)].map((id) => ctx.db.get(id!)),
      );

      results.tasks = filteredTasks.map((task, index) => ({
        _id: task._id,
        title: task.title,
        description: task.description,
        status: task.status,
        projectId: task.projectId,
        project: task.projectId
          ? projects.find((p) => p?._id === task.projectId) || null
          : null,
        relevanceScore: task.relevanceScore || 1.0 - index * 0.01,
      }));
    }

    // Search projects
    if (searchTypes.includes("projects")) {
      const projectsByName = await ctx.db
        .query("projects")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .filter((q) =>
          q.or(
            q.eq(q.field("name"), searchQuery),
            q.eq(q.field("description"), searchQuery),
          ),
        )
        .take(limit);

      results.projects = projectsByName.map((project, index) => ({
        _id: project._id,
        name: project.name,
        description: project.description,
        color: project.color,
        relevanceScore: 1.0 - index * 0.01,
      }));
    }

    // Search events
    if (searchTypes.includes("events")) {
      const eventsByTitle = await ctx.db
        .query("events")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .filter((q) =>
          q.or(
            q.eq(q.field("title"), searchQuery),
            q.eq(q.field("description"), searchQuery),
          ),
        )
        .take(limit);

      const filteredEvents = args.projectId
        ? eventsByTitle.filter((e) => e.projectId === args.projectId)
        : eventsByTitle;

      // Get project data for events
      const projectIds = filteredEvents.map((e) => e.projectId).filter(Boolean);
      const projects = await Promise.all(
        [...new Set(projectIds)].map((id) => ctx.db.get(id!)),
      );

      results.events = filteredEvents.map((event, index) => ({
        _id: event._id,
        title: event.title,
        description: event.description,
        startDate: event.startDate,
        projectId: event.projectId,
        project: event.projectId
          ? projects.find((p) => p?._id === event.projectId) || null
          : null,
        relevanceScore: 1.0 - index * 0.01,
      }));
    }

    results.totalResults =
      results.tasks.length + results.projects.length + results.events.length;

    return results;
  },
});

// Get search suggestions for autocomplete
export const getSearchSuggestions = query({
  args: {
    query: v.string(),
    limit: v.optional(v.number()),
  },
  returns: v.array(
    v.object({
      id: v.string(),
      text: v.string(),
      type: v.string(), // "task", "project", "event", "tag"
    }),
  ),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const limit = args.limit || 10;
    const searchQuery = args.query.toLowerCase().trim();

    if (!searchQuery || searchQuery.length < 2) return [];

    const suggestions: Array<{ id: string; text: string; type: string }> = [];

    // Get project suggestions
    const projects = await ctx.db
      .query("projects")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.gte(q.field("name"), searchQuery))
      .take(5);

    projects.forEach((project) => {
      if (project.name.toLowerCase().includes(searchQuery)) {
        suggestions.push({
          id: project._id,
          text: project.name,
          type: "project",
        });
      }
    });

    // Get task suggestions
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.gte(q.field("title"), searchQuery))
      .take(5);

    tasks.forEach((task) => {
      if (task.title.toLowerCase().includes(searchQuery)) {
        suggestions.push({
          id: task._id,
          text: task.title,
          type: "task",
        });
      }
    });

    // Get event suggestions
    const events = await ctx.db
      .query("events")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.gte(q.field("title"), searchQuery))
      .take(5);

    events.forEach((event) => {
      if (event.title.toLowerCase().includes(searchQuery)) {
        suggestions.push({
          id: event._id,
          text: event.title,
          type: "event",
        });
      }
    });

    // Sort by relevance and limit
    return suggestions
      .sort((a, b) => {
        const aMatch = a.text.toLowerCase().indexOf(searchQuery);
        const bMatch = b.text.toLowerCase().indexOf(searchQuery);
        return aMatch - bMatch;
      })
      .slice(0, limit);
  },
});
