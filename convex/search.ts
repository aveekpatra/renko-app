import { query } from "./_generated/server";
import { v } from "convex/values";
import { requireAuth } from "./utils";
import { DataLoader } from "./dataLoaders";

// Unified search across all entities
export const search = query({
  args: {
    query: v.string(),
    types: v.optional(v.array(v.string())), // ["tasks", "notes", "projects", "events"]
    projectId: v.optional(v.id("projects")),
    limit: v.optional(v.number()),
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
    notes: v.array(
      v.object({
        _id: v.id("notes"),
        title: v.string(),
        content: v.string(),
        tags: v.optional(v.array(v.string())),
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
    const userId = await requireAuth(ctx);
    const limit = args.limit || 20;
    const searchTypes = args.types || ["tasks", "notes", "projects", "events"];

    const loader = new DataLoader(ctx);
    const results: any = {
      tasks: [],
      notes: [],
      projects: [],
      events: [],
      totalResults: 0,
    };

    // Search tasks
    if (searchTypes.includes("tasks")) {
      let taskQuery = ctx.db
        .query("tasks")
        .withSearchIndex("search_tasks", (q) =>
          q.search("title", args.query).eq("userId", userId),
        );

      if (args.projectId) {
        taskQuery = taskQuery.filter((q) =>
          q.eq(q.field("projectId"), args.projectId),
        );
      }

      const tasks = await taskQuery.take(limit);

      // Enrich with project data
      const projectIds = tasks.map((t) => t.projectId);
      const projects = await loader.loadProjects(projectIds);

      results.tasks = tasks.map((task, index) => ({
        ...task,
        project: projects[index],
        relevanceScore: calculateRelevanceScore(
          args.query,
          task.title,
          task.description,
        ),
      }));
    }

    // Search notes
    if (searchTypes.includes("notes")) {
      // Search both title and content
      const [titleResults, contentResults] = await Promise.all([
        ctx.db
          .query("notes")
          .withSearchIndex("search_title", (q) =>
            q.search("title", args.query).eq("userId", userId),
          )
          .take(limit / 2),
        ctx.db
          .query("notes")
          .withSearchIndex("search_content", (q) =>
            q.search("content", args.query).eq("userId", userId),
          )
          .take(limit / 2),
      ]);

      // Merge and dedupe results
      const noteMap = new Map();
      [...titleResults, ...contentResults].forEach((note) => {
        if (!noteMap.has(note._id)) {
          noteMap.set(note._id, note);
        }
      });

      const notes = Array.from(noteMap.values());

      // Filter by project if specified
      const filteredNotes = args.projectId
        ? notes.filter((n) => n.projectId === args.projectId)
        : notes;

      // Enrich with project data
      const projectIds = filteredNotes.map((n) => n.projectId);
      const projects = await loader.loadProjects(projectIds);

      results.notes = filteredNotes.map((note, index) => ({
        ...note,
        project: projects[index],
        relevanceScore: calculateRelevanceScore(
          args.query,
          note.title,
          note.content,
        ),
      }));
    }

    // Search projects
    if (searchTypes.includes("projects")) {
      const projects = await ctx.db
        .query("projects")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .collect();

      const matchingProjects = projects
        .filter(
          (p) =>
            p.name.toLowerCase().includes(args.query.toLowerCase()) ||
            (p.description &&
              p.description.toLowerCase().includes(args.query.toLowerCase())),
        )
        .slice(0, limit);

      results.projects = matchingProjects.map((project) => ({
        ...project,
        relevanceScore: calculateRelevanceScore(
          args.query,
          project.name,
          project.description,
        ),
      }));
    }

    // Search events
    if (searchTypes.includes("events")) {
      const events = await ctx.db
        .query("events")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .collect();

      const matchingEvents = events
        .filter(
          (e) =>
            e.title.toLowerCase().includes(args.query.toLowerCase()) ||
            (e.description &&
              e.description.toLowerCase().includes(args.query.toLowerCase())),
        )
        .slice(0, limit);

      // Filter by project if specified
      const filteredEvents = args.projectId
        ? matchingEvents.filter((e) => e.projectId === args.projectId)
        : matchingEvents;

      // Enrich with project data
      const projectIds = filteredEvents.map((e) => e.projectId);
      const projects = await loader.loadProjects(projectIds);

      results.events = filteredEvents.map((event, index) => ({
        ...event,
        project: projects[index],
        relevanceScore: calculateRelevanceScore(
          args.query,
          event.title,
          event.description,
        ),
      }));
    }

    // Sort all results by relevance
    Object.keys(results).forEach((key) => {
      if (key !== "totalResults" && Array.isArray(results[key])) {
        results[key] = results[key]
          .sort((a: any, b: any) => b.relevanceScore - a.relevanceScore)
          .slice(0, Math.ceil(limit / searchTypes.length));
      }
    });

    results.totalResults =
      results.tasks.length +
      results.notes.length +
      results.projects.length +
      results.events.length;

    return results;
  },
});

// Simple relevance scoring
function calculateRelevanceScore(
  query: string,
  title: string,
  content?: string,
): number {
  const queryLower = query.toLowerCase();
  const titleLower = title.toLowerCase();
  const contentLower = content?.toLowerCase() || "";

  let score = 0;

  // Exact title match gets highest score
  if (titleLower === queryLower) score += 100;
  // Title starts with query
  else if (titleLower.startsWith(queryLower)) score += 50;
  // Title contains query
  else if (titleLower.includes(queryLower)) score += 25;

  // Content matches
  if (contentLower.includes(queryLower)) score += 10;

  // Word matches (split by spaces)
  const queryWords = queryLower.split(/\s+/);
  const titleWords = titleLower.split(/\s+/);
  const contentWords = contentLower.split(/\s+/);

  queryWords.forEach((word) => {
    if (titleWords.includes(word)) score += 5;
    if (contentWords.includes(word)) score += 2;
  });

  return score;
}

// Get search suggestions/autocomplete
export const getSearchSuggestions = query({
  args: {
    query: v.string(),
    limit: v.optional(v.number()),
  },
  returns: v.array(
    v.object({
      text: v.string(),
      type: v.string(),
      id: v.string(),
    }),
  ),
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);
    const limit = args.limit || 10;
    const queryLower = args.query.toLowerCase();

    const suggestions: Array<{ text: string; type: string; id: string }> = [];

    // Get project suggestions
    const projects = await ctx.db
      .query("projects")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    projects
      .filter((p) => p.name.toLowerCase().includes(queryLower))
      .slice(0, 3)
      .forEach((p) => {
        suggestions.push({
          text: p.name,
          type: "project",
          id: p._id,
        });
      });

    // Get task suggestions
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    tasks
      .filter((t) => t.title.toLowerCase().includes(queryLower))
      .slice(0, 5)
      .forEach((t) => {
        suggestions.push({
          text: t.title,
          type: "task",
          id: t._id,
        });
      });

    // Get tag suggestions from notes
    const notes = await ctx.db
      .query("notes")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const allTags = new Set<string>();
    notes.forEach((note) => {
      note.tags?.forEach((tag) => {
        if (tag.toLowerCase().includes(queryLower)) {
          allTags.add(tag);
        }
      });
    });

    Array.from(allTags)
      .slice(0, 3)
      .forEach((tag) => {
        suggestions.push({
          text: tag,
          type: "tag",
          id: tag,
        });
      });

    return suggestions.slice(0, limit);
  },
});
