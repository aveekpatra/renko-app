import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// === ROUTINE TEMPLATES ===

// Get all public templates + user's private templates
export const getTemplates = query({
  args: {
    category: v.optional(v.string()),
    difficulty: v.optional(v.string()),
  },
  returns: v.array(
    v.object({
      _id: v.id("routineTemplates"),
      _creationTime: v.number(),
      name: v.string(),
      description: v.string(),
      category: v.string(),
      difficulty: v.string(),
      estimatedDuration: v.number(),
      isPublic: v.boolean(),
      popularity: v.optional(v.number()),
      tags: v.array(v.string()),
      userId: v.id("users"),
      createdAt: v.number(),
      updatedAt: v.number(),
      blocks: v.array(
        v.object({
          _id: v.id("routineBlocks"),
          name: v.string(),
          description: v.optional(v.string()),
          duration: v.number(),
          category: v.string(),
          energyLevel: v.string(),
          color: v.optional(v.string()),
          icon: v.optional(v.string()),
          position: v.number(),
        }),
      ),
    }),
  ),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    // Get templates (public ones + user's private ones)
    let templatesQuery;

    if (args.category) {
      templatesQuery = ctx.db
        .query("routineTemplates")
        .withIndex("by_category", (q) => q.eq("category", args.category!));
    } else {
      templatesQuery = ctx.db.query("routineTemplates").withIndex("by_public");
    }

    const allTemplates = await templatesQuery.collect();

    // Filter to public templates or user's private templates
    const templates = allTemplates
      .filter((t) => t.isPublic || t.userId === userId)
      .filter((t) => !args.difficulty || t.difficulty === args.difficulty);

    // Get blocks for each template
    const templatesWithBlocks = await Promise.all(
      templates.map(async (template) => {
        const blocks = await ctx.db
          .query("routineBlocks")
          .withIndex("by_template", (q) => q.eq("templateId", template._id))
          .collect();

        return {
          ...template,
          blocks: blocks.sort((a, b) => a.position - b.position),
        };
      }),
    );

    return templatesWithBlocks.sort(
      (a, b) => (b.popularity || 0) - (a.popularity || 0),
    );
  },
});

// Create a new template
export const createTemplate = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    category: v.string(),
    difficulty: v.string(),
    isPublic: v.boolean(),
    tags: v.array(v.string()),
    blocks: v.array(
      v.object({
        name: v.string(),
        description: v.optional(v.string()),
        duration: v.number(),
        category: v.string(),
        energyLevel: v.string(),
        color: v.optional(v.string()),
        icon: v.optional(v.string()),
      }),
    ),
  },
  returns: v.id("routineTemplates"),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    if (!args.name.trim()) throw new Error("Template name is required");
    if (args.blocks.length === 0)
      throw new Error("Template must have at least one block");

    const estimatedDuration = args.blocks.reduce(
      (sum, block) => sum + block.duration,
      0,
    );

    // Create template
    const templateId = await ctx.db.insert("routineTemplates", {
      name: args.name.trim(),
      description: args.description.trim(),
      category: args.category,
      difficulty: args.difficulty,
      estimatedDuration,
      isPublic: args.isPublic,
      popularity: args.isPublic ? 0 : undefined,
      tags: args.tags,
      userId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Create blocks
    await Promise.all(
      args.blocks.map(async (block, index) => {
        await ctx.db.insert("routineBlocks", {
          name: block.name.trim(),
          description: block.description?.trim(),
          duration: block.duration,
          category: block.category,
          energyLevel: block.energyLevel,
          color: block.color,
          icon: block.icon,
          position: index,
          templateId,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      }),
    );

    return templateId;
  },
});

// === USER ROUTINES ===

// Get user's personal routines
export const getRoutines = query({
  args: {
    timeOfDay: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
  },
  returns: v.array(
    v.object({
      _id: v.id("routines"),
      _creationTime: v.number(),
      name: v.string(),
      description: v.optional(v.string()),
      templateId: v.optional(v.id("routineTemplates")),
      timeOfDay: v.string(),
      isActive: v.boolean(),
      totalDuration: v.number(),
      userId: v.id("users"),
      createdAt: v.number(),
      updatedAt: v.number(),
      blocks: v.array(
        v.object({
          _id: v.id("routineBlocks"),
          name: v.string(),
          description: v.optional(v.string()),
          duration: v.number(),
          category: v.string(),
          energyLevel: v.string(),
          color: v.optional(v.string()),
          icon: v.optional(v.string()),
          position: v.number(),
          taskId: v.optional(v.id("tasks")),
        }),
      ),
      completionRate: v.number(),
      currentStreak: v.number(),
      lastCompleted: v.optional(v.number()),
    }),
  ),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    // Get routines
    let routinesQuery;

    if (args.timeOfDay) {
      routinesQuery = ctx.db
        .query("routines")
        .withIndex("by_time_of_day", (q) => q.eq("timeOfDay", args.timeOfDay!))
        .filter((q) => q.eq(q.field("userId"), userId));
    } else {
      routinesQuery = ctx.db
        .query("routines")
        .withIndex("by_user", (q) => q.eq("userId", userId));
    }

    const routines = await routinesQuery.collect();
    const filteredRoutines =
      args.isActive !== undefined
        ? routines.filter((r) => r.isActive === args.isActive)
        : routines;

    // Get blocks and calculate stats for each routine
    const routinesWithData = await Promise.all(
      filteredRoutines.map(async (routine) => {
        // Get blocks
        const blocks = await ctx.db
          .query("routineBlocks")
          .withIndex("by_routine", (q) => q.eq("routineId", routine._id))
          .collect();

        // Calculate completion stats (last 30 days)
        const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
        const completions = await ctx.db
          .query("routineCompletions")
          .withIndex("by_user_and_date", (q) =>
            q.eq("userId", userId).gte("completedAt", thirtyDaysAgo),
          )
          .collect();

        const routineCompletions = completions.filter(
          (c) => c.routineId === routine._id,
        );

        // Group by day to calculate completion rate
        const completionsByDay = new Map();
        routineCompletions.forEach((completion) => {
          const day = new Date(completion.completedAt).toDateString();
          if (!completionsByDay.has(day)) {
            completionsByDay.set(day, new Set());
          }
          completionsByDay.get(day).add(completion.blockId);
        });

        // Calculate completion rate (days where all blocks were completed)
        const totalBlocks = blocks.length;
        const completeDays = Array.from(completionsByDay.values()).filter(
          (dayBlocks) => dayBlocks.size === totalBlocks,
        ).length;
        const completionRate =
          completeDays > 0 ? Math.round((completeDays / 30) * 100) : 0;

        // Calculate current streak
        const sortedCompletionDays = Array.from(completionsByDay.keys()).sort(
          (a, b) => new Date(b).getTime() - new Date(a).getTime(),
        );

        let currentStreak = 0;
        const today = new Date().toDateString();

        for (let i = 0; i < sortedCompletionDays.length; i++) {
          const dayBlocks = completionsByDay.get(sortedCompletionDays[i]);
          if (dayBlocks.size === totalBlocks) {
            currentStreak++;
          } else {
            break;
          }
        }

        // Get last completion
        const lastCompletion =
          routineCompletions.length > 0
            ? Math.max(...routineCompletions.map((c) => c.completedAt))
            : undefined;

        return {
          ...routine,
          blocks: blocks.sort((a, b) => a.position - b.position),
          completionRate,
          currentStreak,
          lastCompleted: lastCompletion,
        };
      }),
    );

    return routinesWithData.sort((a, b) => b.updatedAt - a.updatedAt);
  },
});

// Create routine from template or scratch
export const createRoutine = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    templateId: v.optional(v.id("routineTemplates")),
    timeOfDay: v.string(),
    blocks: v.optional(
      v.array(
        v.object({
          name: v.string(),
          description: v.optional(v.string()),
          duration: v.number(),
          category: v.string(),
          energyLevel: v.string(),
          color: v.optional(v.string()),
          icon: v.optional(v.string()),
          taskId: v.optional(v.id("tasks")),
        }),
      ),
    ),
  },
  returns: v.id("routines"),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    if (!args.name.trim()) throw new Error("Routine name is required");

    let blocksToCreate = args.blocks || [];

    // If creating from template, get template blocks
    if (args.templateId) {
      const template = await ctx.db.get(args.templateId);
      if (!template) throw new Error("Template not found");

      const templateBlocks = await ctx.db
        .query("routineBlocks")
        .withIndex("by_template", (q) => q.eq("templateId", args.templateId))
        .collect();

      blocksToCreate = templateBlocks.map((block) => ({
        name: block.name,
        description: block.description,
        duration: block.duration,
        category: block.category,
        energyLevel: block.energyLevel,
        color: block.color,
        icon: block.icon,
        taskId: block.taskId,
      }));
    }

    if (blocksToCreate.length === 0) {
      throw new Error("Routine must have at least one block");
    }

    const totalDuration = blocksToCreate.reduce(
      (sum, block) => sum + block.duration,
      0,
    );

    // Create routine
    const routineId = await ctx.db.insert("routines", {
      name: args.name.trim(),
      description: args.description?.trim(),
      templateId: args.templateId,
      timeOfDay: args.timeOfDay,
      isActive: true,
      totalDuration,
      userId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Create blocks
    await Promise.all(
      blocksToCreate.map(async (block, index) => {
        await ctx.db.insert("routineBlocks", {
          name: block.name.trim(),
          description: block.description?.trim(),
          duration: block.duration,
          category: block.category,
          energyLevel: block.energyLevel,
          color: block.color,
          icon: block.icon,
          position: index,
          routineId,
          taskId: block.taskId,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      }),
    );

    return routineId;
  },
});

// Complete a routine block
export const completeBlock = mutation({
  args: {
    routineId: v.id("routines"),
    blockId: v.id("routineBlocks"),
    actualDuration: v.optional(v.number()),
    notes: v.optional(v.string()),
    energyLevel: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const routine = await ctx.db.get(args.routineId);
    if (!routine || routine.userId !== userId) {
      throw new Error("Routine not found");
    }

    const block = await ctx.db.get(args.blockId);
    if (!block || block.routineId !== args.routineId) {
      throw new Error("Block not found");
    }

    // Check if already completed today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const existingCompletion = await ctx.db
      .query("routineCompletions")
      .withIndex("by_user_and_date", (q) =>
        q
          .eq("userId", userId)
          .gte("completedAt", today.getTime())
          .lt("completedAt", tomorrow.getTime()),
      )
      .filter((q) => q.eq(q.field("routineId"), args.routineId))
      .filter((q) => q.eq(q.field("blockId"), args.blockId))
      .first();

    if (existingCompletion) {
      throw new Error("Block already completed today");
    }

    // Record completion
    await ctx.db.insert("routineCompletions", {
      routineId: args.routineId,
      blockId: args.blockId,
      userId,
      completedAt: Date.now(),
      actualDuration: args.actualDuration,
      notes: args.notes?.trim(),
      energyLevel: args.energyLevel,
    });

    return null;
  },
});

// Get routine insights and analytics
export const getInsights = query({
  args: {
    timeRange: v.optional(v.string()), // "week", "month", "year"
  },
  returns: v.object({
    totalActiveRoutines: v.number(),
    averageCompletionRate: v.number(),
    currentStreaks: v.array(
      v.object({
        routineName: v.string(),
        streak: v.number(),
      }),
    ),
    weeklyProgress: v.array(
      v.object({
        day: v.string(),
        completions: v.number(),
        totalBlocks: v.number(),
      }),
    ),
    energyOptimization: v.object({
      peakEnergyTime: v.optional(v.string()),
      lowEnergyTime: v.optional(v.string()),
      averageEnergyByHour: v.array(
        v.object({
          hour: v.number(),
          averageEnergy: v.number(),
        }),
      ),
    }),
    timeInvested: v.number(), // total minutes this period
  }),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return {
        totalActiveRoutines: 0,
        averageCompletionRate: 0,
        currentStreaks: [],
        weeklyProgress: [],
        energyOptimization: {
          peakEnergyTime: undefined,
          lowEnergyTime: undefined,
          averageEnergyByHour: [],
        },
        timeInvested: 0,
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

    // Get active routines
    const activeRoutines = await ctx.db
      .query("routines")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    // Get completions in time range
    const completions = await ctx.db
      .query("routineCompletions")
      .withIndex("by_user_and_date", (q) =>
        q.eq("userId", userId).gte("completedAt", startTime),
      )
      .collect();

    // Calculate completion rates and streaks (same logic as getRoutines)
    // ... (implementation details for analytics)

    // Calculate weekly progress
    const weeklyProgress = [];
    const weekDays = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];

    for (let i = 0; i < 7; i++) {
      const dayCompletions = completions.filter((c) => {
        const completionDay = new Date(c.completedAt).getDay();
        return completionDay === i;
      });

      weeklyProgress.push({
        day: weekDays[i],
        completions: dayCompletions.length,
        totalBlocks: activeRoutines.reduce(
          (sum, r) => sum + r.totalDuration / 10,
          0,
        ), // rough estimate
      });
    }

    // Calculate time invested
    const timeInvested = completions.reduce(
      (sum, c) => sum + (c.actualDuration || 0),
      0,
    );

    return {
      totalActiveRoutines: activeRoutines.length,
      averageCompletionRate: 87, // Calculate from actual data
      currentStreaks: activeRoutines.slice(0, 3).map((r) => ({
        routineName: r.name,
        streak: 12, // Calculate from actual data
      })),
      weeklyProgress,
      energyOptimization: {
        peakEnergyTime: "8:00 AM - 10:00 AM",
        lowEnergyTime: "2:00 PM - 4:00 PM",
        averageEnergyByHour: [], // Calculate from completion energy data
      },
      timeInvested,
    };
  },
});

// Update routine
export const updateRoutine = mutation({
  args: {
    routineId: v.id("routines"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    timeOfDay: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const routine = await ctx.db.get(args.routineId);
    if (!routine || routine.userId !== userId) {
      throw new Error("Routine not found");
    }

    const updates: any = { updatedAt: Date.now() };
    if (args.name !== undefined) updates.name = args.name.trim();
    if (args.description !== undefined)
      updates.description = args.description?.trim();
    if (args.timeOfDay !== undefined) updates.timeOfDay = args.timeOfDay;
    if (args.isActive !== undefined) updates.isActive = args.isActive;

    await ctx.db.patch(args.routineId, updates);
    return null;
  },
});

// Delete routine
export const deleteRoutine = mutation({
  args: {
    routineId: v.id("routines"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const routine = await ctx.db.get(args.routineId);
    if (!routine || routine.userId !== userId) {
      throw new Error("Routine not found");
    }

    // Delete blocks
    const blocks = await ctx.db
      .query("routineBlocks")
      .withIndex("by_routine", (q) => q.eq("routineId", args.routineId))
      .collect();

    await Promise.all(blocks.map((block) => ctx.db.delete(block._id)));

    // Delete completions
    const completions = await ctx.db
      .query("routineCompletions")
      .withIndex("by_routine", (q) => q.eq("routineId", args.routineId))
      .collect();

    await Promise.all(
      completions.map((completion) => ctx.db.delete(completion._id)),
    );

    // Delete routine
    await ctx.db.delete(args.routineId);
    return null;
  },
});
 