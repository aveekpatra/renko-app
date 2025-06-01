import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { api } from "./_generated/api";

// Create a link between any two entities
export const createLink = mutation({
  args: {
    fromTable: v.string(),
    fromId: v.string(),
    toTable: v.string(),
    toId: v.string(),
    linkType: v.string(),
    metadata: v.optional(
      v.object({
        description: v.optional(v.string()),
        strength: v.optional(v.number()), // 1-10
        tags: v.optional(v.array(v.string())),
      }),
    ),
  },
  returns: v.id("links"),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Validate link type
    const validLinkTypes = [
      "related",
      "blocks",
      "subtask",
      "reference",
      "inspiration",
      "dependency",
      "scheduled",
      "mentions",
      "contains",
      "attachedTo",
    ];
    if (!validLinkTypes.includes(args.linkType)) {
      throw new Error("Invalid link type");
    }

    // Check if link already exists
    const existingLink = await ctx.db
      .query("links")
      .withIndex("by_from", (q) =>
        q.eq("fromTable", args.fromTable).eq("fromId", args.fromId),
      )
      .filter((q) => q.eq(q.field("toTable"), args.toTable))
      .filter((q) => q.eq(q.field("toId"), args.toId))
      .filter((q) => q.eq(q.field("linkType"), args.linkType))
      .first();

    if (existingLink) {
      throw new Error("Link already exists");
    }

    return await ctx.db.insert("links", {
      fromTable: args.fromTable,
      fromId: args.fromId,
      toTable: args.toTable,
      toId: args.toId,
      linkType: args.linkType,
      metadata: args.metadata,
      userId,
      createdAt: Date.now(),
    });
  },
});

// Get all links from an entity
export const getLinksFrom = query({
  args: {
    fromTable: v.string(),
    fromId: v.string(),
    linkType: v.optional(v.string()),
  },
  returns: v.array(
    v.object({
      _id: v.id("links"),
      _creationTime: v.number(),
      fromTable: v.string(),
      fromId: v.string(),
      toTable: v.string(),
      toId: v.string(),
      linkType: v.string(),
      metadata: v.optional(
        v.object({
          description: v.optional(v.string()),
          strength: v.optional(v.number()),
          tags: v.optional(v.array(v.string())),
        }),
      ),
      createdAt: v.number(),
    }),
  ),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    let query = ctx.db
      .query("links")
      .withIndex("by_from", (q) =>
        q.eq("fromTable", args.fromTable).eq("fromId", args.fromId),
      )
      .filter((q) => q.eq(q.field("userId"), userId));

    if (args.linkType) {
      query = query.filter((q) => q.eq(q.field("linkType"), args.linkType));
    }

    return await query.collect();
  },
});

// Get all links to an entity
export const getLinksTo = query({
  args: {
    toTable: v.string(),
    toId: v.string(),
    linkType: v.optional(v.string()),
  },
  returns: v.array(
    v.object({
      _id: v.id("links"),
      _creationTime: v.number(),
      fromTable: v.string(),
      fromId: v.string(),
      toTable: v.string(),
      toId: v.string(),
      linkType: v.string(),
      metadata: v.optional(
        v.object({
          description: v.optional(v.string()),
          strength: v.optional(v.number()),
          tags: v.optional(v.array(v.string())),
        }),
      ),
      createdAt: v.number(),
    }),
  ),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    let query = ctx.db
      .query("links")
      .withIndex("by_to", (q) =>
        q.eq("toTable", args.toTable).eq("toId", args.toId),
      )
      .filter((q) => q.eq(q.field("userId"), userId));

    if (args.linkType) {
      query = query.filter((q) => q.eq(q.field("linkType"), args.linkType));
    }

    return await query.collect();
  },
});

// Get bidirectional links (both from and to)
export const getAllLinks: any = query({
  args: {
    table: v.string(),
    id: v.string(),
    linkType: v.optional(v.string()),
  },
  returns: v.object({
    outgoing: v.array(
      v.object({
        _id: v.id("links"),
        _creationTime: v.number(),
        fromTable: v.string(),
        fromId: v.string(),
        toTable: v.string(),
        toId: v.string(),
        linkType: v.string(),
        metadata: v.optional(
          v.object({
            description: v.optional(v.string()),
            strength: v.optional(v.number()),
            tags: v.optional(v.array(v.string())),
          }),
        ),
        createdAt: v.number(),
      }),
    ),
    incoming: v.array(
      v.object({
        _id: v.id("links"),
        _creationTime: v.number(),
        fromTable: v.string(),
        fromId: v.string(),
        toTable: v.string(),
        toId: v.string(),
        linkType: v.string(),
        metadata: v.optional(
          v.object({
            description: v.optional(v.string()),
            strength: v.optional(v.number()),
            tags: v.optional(v.array(v.string())),
          }),
        ),
        createdAt: v.number(),
      }),
    ),
  }),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return { outgoing: [], incoming: [] };

    // Get outgoing links
    const outgoing: any = await ctx.runQuery(api.links.getLinksFrom, {
      fromTable: args.table,
      fromId: args.id,
      linkType: args.linkType,
    });

    // Get incoming links
    const incoming: any = await ctx.runQuery(api.links.getLinksTo, {
      toTable: args.table,
      toId: args.id,
      linkType: args.linkType,
    });

    return { outgoing, incoming };
  },
});

// Update link metadata
export const updateLink = mutation({
  args: {
    linkId: v.id("links"),
    metadata: v.optional(
      v.object({
        description: v.optional(v.string()),
        strength: v.optional(v.number()),
        tags: v.optional(v.array(v.string())),
      }),
    ),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const link = await ctx.db.get(args.linkId);
    if (!link || link.userId !== userId) {
      throw new Error("Link not found");
    }

    await ctx.db.patch(args.linkId, {
      metadata: args.metadata,
    });

    return null;
  },
});

// Delete a link
export const deleteLink = mutation({
  args: {
    linkId: v.id("links"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const link = await ctx.db.get(args.linkId);
    if (!link || link.userId !== userId) {
      throw new Error("Link not found");
    }

    await ctx.db.delete(args.linkId);
    return null;
  },
});

// Helper: Quick link creation functions for common use cases

// Link a task to a routine block
export const linkTaskToRoutine: any = mutation({
  args: {
    taskId: v.id("tasks"),
    routineId: v.id("routines"),
    description: v.optional(v.string()),
  },
  returns: v.id("links"),
  handler: async (ctx, args) => {
    return await ctx.runMutation(api.links.createLink, {
      fromTable: "tasks",
      fromId: args.taskId,
      toTable: "routines",
      toId: args.routineId,
      linkType: "scheduled",
      metadata: {
        description: args.description || "Task scheduled in routine",
        strength: 8,
        tags: ["automation"],
      },
    });
  },
});

// Link a note to multiple entities
export const linkNoteToEntity: any = mutation({
  args: {
    noteId: v.id("notes"),
    entityTable: v.string(),
    entityId: v.string(),
    linkType: v.optional(v.string()),
  },
  returns: v.id("links"),
  handler: async (ctx, args) => {
    return await ctx.runMutation(api.links.createLink, {
      fromTable: "notes",
      fromId: args.noteId,
      toTable: args.entityTable,
      toId: args.entityId,
      linkType: args.linkType || "reference",
      metadata: {
        description: `Note references ${args.entityTable}`,
        strength: 5,
        tags: ["documentation"],
      },
    });
  },
});

// Get connection graph for visualization
export const getConnectionGraph = query({
  args: {
    entityTable: v.string(),
    entityId: v.string(),
    depth: v.optional(v.number()), // How many levels deep to traverse
  },
  returns: v.object({
    nodes: v.array(
      v.object({
        id: v.string(),
        table: v.string(),
        title: v.string(),
        type: v.string(),
      }),
    ),
    edges: v.array(
      v.object({
        from: v.string(),
        to: v.string(),
        linkType: v.string(),
        strength: v.optional(v.number()),
      }),
    ),
  }),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return { nodes: [], edges: [] };

    const depth = args.depth || 2;
    const visited = new Set<string>();
    const nodes: any[] = [];
    const edges: any[] = [];

    // Get direct connections only (depth 1)
    const nodeKey = `${args.entityTable}:${args.entityId}`;
    visited.add(nodeKey);

    // Add root node
    nodes.push({
      id: nodeKey,
      table: args.entityTable,
      title: `${args.entityTable}:${args.entityId}`,
      type: args.entityTable,
    });

    // Get outgoing links
    const outgoingLinks = await ctx.db
      .query("links")
      .withIndex("by_from", (q) =>
        q.eq("fromTable", args.entityTable).eq("fromId", args.entityId),
      )
      .filter((q) => q.eq(q.field("userId"), userId))
      .collect();

    // Get incoming links
    const incomingLinks = await ctx.db
      .query("links")
      .withIndex("by_to", (q) =>
        q.eq("toTable", args.entityTable).eq("toId", args.entityId),
      )
      .filter((q) => q.eq(q.field("userId"), userId))
      .collect();

    // Process outgoing connections
    for (const link of outgoingLinks) {
      const targetKey = `${link.toTable}:${link.toId}`;
      if (!visited.has(targetKey)) {
        visited.add(targetKey);
        nodes.push({
          id: targetKey,
          table: link.toTable,
          title: `${link.toTable}:${link.toId}`,
          type: link.toTable,
        });
      }

      edges.push({
        from: nodeKey,
        to: targetKey,
        linkType: link.linkType,
        strength: link.metadata?.strength,
      });
    }

    // Process incoming connections
    for (const link of incomingLinks) {
      const sourceKey = `${link.fromTable}:${link.fromId}`;
      if (!visited.has(sourceKey)) {
        visited.add(sourceKey);
        nodes.push({
          id: sourceKey,
          table: link.fromTable,
          title: `${link.fromTable}:${link.fromId}`,
          type: link.fromTable,
        });
      }

      edges.push({
        from: sourceKey,
        to: nodeKey,
        linkType: link.linkType,
        strength: link.metadata?.strength,
      });
    }

    return { nodes, edges };
  },
});
