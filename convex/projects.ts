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
    return projects.sort((a, b) => b.updatedAt - a.updatedAt);
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
    if (!project) throw new Error("Project not found");
    if (project.userId !== userId) throw new Error("Unauthorized");

    const updateData: Record<string, any> = {
      updatedAt: Date.now(),
    };

    if (args.name !== undefined) updateData.name = args.name.trim();
    if (args.description !== undefined)
      updateData.description = args.description?.trim();
    if (args.color !== undefined) updateData.color = args.color;
    if (args.status !== undefined) updateData.status = args.status;

    await ctx.db.patch(args.projectId, updateData);
    return null;
  },
});
 