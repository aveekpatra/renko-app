import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// === NOTEBOOKS ===

// Get user's notebooks
export const getNotebooks = query({
  args: {
    projectId: v.optional(v.id("projects")),
  },
  returns: v.array(
    v.object({
      _id: v.id("notebooks"),
      _creationTime: v.number(),
      name: v.string(),
      description: v.optional(v.string()),
      color: v.optional(v.string()),
      projectId: v.optional(v.id("projects")),
      userId: v.id("users"),
      createdAt: v.number(),
      updatedAt: v.number(),
      noteCount: v.number(),
      project: v.union(
        v.object({
          _id: v.id("projects"),
          name: v.string(),
          color: v.optional(v.string()),
        }),
        v.null(),
      ),
    }),
  ),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    let query = ctx.db
      .query("notebooks")
      .withIndex("by_user", (q) => q.eq("userId", userId));

    if (args.projectId) {
      query = ctx.db
        .query("notebooks")
        .withIndex("by_project", (q) => q.eq("projectId", args.projectId));
    }

    const notebooks = await query.collect();

    // Get note counts and project data
    const notebooksWithData = await Promise.all(
      notebooks.map(async (notebook) => {
        // Count notes in this notebook
        const noteCount = await ctx.db
          .query("notes")
          .withIndex("by_notebook", (q) => q.eq("notebookId", notebook._id))
          .collect();

        // Get project data if linked
        let project = null;
        if (notebook.projectId) {
          const projectData = await ctx.db.get(notebook.projectId);
          if (projectData) {
            project = {
              _id: projectData._id,
              name: projectData.name,
              color: projectData.color,
            };
          }
        }

        return {
          ...notebook,
          noteCount: noteCount.length,
          project,
        };
      }),
    );

    return notebooksWithData.sort((a, b) => b.updatedAt - a.updatedAt);
  },
});

// Create notebook
export const createNotebook = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    color: v.optional(v.string()),
    projectId: v.optional(v.id("projects")),
  },
  returns: v.id("notebooks"),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    if (!args.name.trim()) throw new Error("Notebook name is required");

    // Validate project if specified
    if (args.projectId) {
      const project = await ctx.db.get(args.projectId);
      if (!project || project.userId !== userId) {
        throw new Error("Project not found");
      }
    }

    return await ctx.db.insert("notebooks", {
      name: args.name.trim(),
      description: args.description?.trim(),
      color: args.color || "#6366f1",
      projectId: args.projectId,
      userId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

// Update notebook
export const updateNotebook = mutation({
  args: {
    notebookId: v.id("notebooks"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    color: v.optional(v.string()),
    projectId: v.optional(v.id("projects")),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const notebook = await ctx.db.get(args.notebookId);
    if (!notebook || notebook.userId !== userId) {
      throw new Error("Notebook not found");
    }

    const updates: any = { updatedAt: Date.now() };
    if (args.name !== undefined) {
      if (!args.name.trim()) throw new Error("Notebook name is required");
      updates.name = args.name.trim();
    }
    if (args.description !== undefined)
      updates.description = args.description?.trim();
    if (args.color !== undefined) updates.color = args.color;
    if (args.projectId !== undefined) updates.projectId = args.projectId;

    await ctx.db.patch(args.notebookId, updates);
    return null;
  },
});

// Delete notebook
export const deleteNotebook = mutation({
  args: {
    notebookId: v.id("notebooks"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const notebook = await ctx.db.get(args.notebookId);
    if (!notebook || notebook.userId !== userId) {
      throw new Error("Notebook not found");
    }

    // Delete all notes in the notebook
    const notes = await ctx.db
      .query("notes")
      .withIndex("by_notebook", (q) => q.eq("notebookId", args.notebookId))
      .collect();

    await Promise.all(notes.map((note) => ctx.db.delete(note._id)));

    // Delete notebook
    await ctx.db.delete(args.notebookId);
    return null;
  },
});

// === NOTES ===

// Get notes with filtering options
export const getNotes = query({
  args: {
    notebookId: v.optional(v.id("notebooks")),
    projectId: v.optional(v.id("projects")),
    taskId: v.optional(v.id("tasks")),
    routineId: v.optional(v.id("routines")),
    tags: v.optional(v.array(v.string())),
    searchTerm: v.optional(v.string()),
  },
  returns: v.array(
    v.object({
      _id: v.id("notes"),
      _creationTime: v.number(),
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
      notebook: v.union(
        v.object({
          _id: v.id("notebooks"),
          name: v.string(),
          color: v.optional(v.string()),
        }),
        v.null(),
      ),
      project: v.union(
        v.object({
          _id: v.id("projects"),
          name: v.string(),
          color: v.optional(v.string()),
        }),
        v.null(),
      ),
      task: v.union(
        v.object({
          _id: v.id("tasks"),
          title: v.string(),
          status: v.string(),
        }),
        v.null(),
      ),
      routine: v.union(
        v.object({
          _id: v.id("routines"),
          name: v.string(),
          timeOfDay: v.string(),
        }),
        v.null(),
      ),
    }),
  ),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    let query = ctx.db
      .query("notes")
      .withIndex("by_user", (q) => q.eq("userId", userId));

    // Apply filters
    if (args.notebookId) {
      query = ctx.db
        .query("notes")
        .withIndex("by_notebook", (q) => q.eq("notebookId", args.notebookId));
    } else if (args.projectId) {
      query = ctx.db
        .query("notes")
        .withIndex("by_project", (q) => q.eq("projectId", args.projectId));
    } else if (args.taskId) {
      query = ctx.db
        .query("notes")
        .withIndex("by_task", (q) => q.eq("taskId", args.taskId));
    }

    const notes = await query.collect();

    // Apply additional filters
    let filteredNotes = notes;

    if (args.routineId) {
      filteredNotes = filteredNotes.filter(
        (note) => note.routineId === args.routineId,
      );
    }

    if (args.tags && args.tags.length > 0) {
      filteredNotes = filteredNotes.filter(
        (note) =>
          note.tags && args.tags!.some((tag) => note.tags!.includes(tag)),
      );
    }

    if (args.searchTerm) {
      const searchLower = args.searchTerm.toLowerCase();
      filteredNotes = filteredNotes.filter(
        (note) =>
          note.title.toLowerCase().includes(searchLower) ||
          note.content.toLowerCase().includes(searchLower) ||
          (note.tags &&
            note.tags.some((tag) => tag.toLowerCase().includes(searchLower))),
      );
    }

    // Enrich with related data
    const notesWithData = await Promise.all(
      filteredNotes.map(async (note) => {
        let notebook = null;
        let project = null;
        let task = null;
        let routine = null;

        if (note.notebookId) {
          const notebookData = await ctx.db.get(note.notebookId);
          if (notebookData) {
            notebook = {
              _id: notebookData._id,
              name: notebookData.name,
              color: notebookData.color,
            };
          }
        }

        if (note.projectId) {
          const projectData = await ctx.db.get(note.projectId);
          if (projectData) {
            project = {
              _id: projectData._id,
              name: projectData.name,
              color: projectData.color,
            };
          }
        }

        if (note.taskId) {
          const taskData = await ctx.db.get(note.taskId);
          if (taskData) {
            task = {
              _id: taskData._id,
              title: taskData.title,
              status: taskData.status,
            };
          }
        }

        if (note.routineId) {
          const routineData = await ctx.db.get(note.routineId);
          if (routineData) {
            routine = {
              _id: routineData._id,
              name: routineData.name,
              timeOfDay: routineData.timeOfDay,
            };
          }
        }

        return {
          ...note,
          notebook,
          project,
          task,
          routine,
        };
      }),
    );

    return notesWithData.sort((a, b) => b.updatedAt - a.updatedAt);
  },
});

// Create note
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
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    if (!args.title.trim()) throw new Error("Note title is required");
    if (!args.content.trim()) throw new Error("Note content is required");

    // Validate references
    if (args.notebookId) {
      const notebook = await ctx.db.get(args.notebookId);
      if (!notebook || notebook.userId !== userId) {
        throw new Error("Notebook not found");
      }
    }

    if (args.projectId) {
      const project = await ctx.db.get(args.projectId);
      if (!project || project.userId !== userId) {
        throw new Error("Project not found");
      }
    }

    if (args.taskId) {
      const task = await ctx.db.get(args.taskId);
      if (!task || task.userId !== userId) {
        throw new Error("Task not found");
      }
    }

    if (args.routineId) {
      const routine = await ctx.db.get(args.routineId);
      if (!routine || routine.userId !== userId) {
        throw new Error("Routine not found");
      }
    }

    // Clean and dedupe tags
    const cleanTags = args.tags
      ? [
          ...new Set(
            args.tags
              .filter((tag) => tag.trim())
              .map((tag) => tag.trim().toLowerCase()),
          ),
        ]
      : [];

    return await ctx.db.insert("notes", {
      title: args.title.trim(),
      content: args.content.trim(),
      tags: cleanTags.length > 0 ? cleanTags : undefined,
      projectId: args.projectId,
      taskId: args.taskId,
      routineId: args.routineId,
      notebookId: args.notebookId,
      userId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

// Update note
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
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const note = await ctx.db.get(args.noteId);
    if (!note || note.userId !== userId) {
      throw new Error("Note not found");
    }

    const updates: any = { updatedAt: Date.now() };

    if (args.title !== undefined) {
      if (!args.title.trim()) throw new Error("Note title is required");
      updates.title = args.title.trim();
    }
    if (args.content !== undefined) {
      if (!args.content.trim()) throw new Error("Note content is required");
      updates.content = args.content.trim();
    }
    if (args.tags !== undefined) {
      const cleanTags = args.tags
        ? [
            ...new Set(
              args.tags
                .filter((tag) => tag.trim())
                .map((tag) => tag.trim().toLowerCase()),
            ),
          ]
        : [];
      updates.tags = cleanTags.length > 0 ? cleanTags : undefined;
    }
    if (args.projectId !== undefined) updates.projectId = args.projectId;
    if (args.taskId !== undefined) updates.taskId = args.taskId;
    if (args.routineId !== undefined) updates.routineId = args.routineId;
    if (args.notebookId !== undefined) updates.notebookId = args.notebookId;

    await ctx.db.patch(args.noteId, updates);
    return null;
  },
});

// Delete note
export const deleteNote = mutation({
  args: {
    noteId: v.id("notes"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const note = await ctx.db.get(args.noteId);
    if (!note || note.userId !== userId) {
      throw new Error("Note not found");
    }

    await ctx.db.delete(args.noteId);
    return null;
  },
});

// Get all unique tags for user
export const getAllTags = query({
  args: {},
  returns: v.array(v.string()),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const notes = await ctx.db
      .query("notes")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const allTags = new Set<string>();
    notes.forEach((note) => {
      if (note.tags) {
        note.tags.forEach((tag) => allTags.add(tag));
      }
    });

    return Array.from(allTags).sort();
  },
});

// Get recent notes (last 10)
export const getRecentNotes = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("notes"),
      _creationTime: v.number(),
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
    }),
  ),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("notes")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(10);
  },
});
