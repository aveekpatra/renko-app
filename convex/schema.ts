import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

// The schema is normally optional, but Convex Auth
// requires indexes defined on `authTables`.
// The schema provides more precise TypeScript types.
export default defineSchema({
  ...authTables,

  // Projects table
  projects: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    color: v.optional(v.string()),
    status: v.optional(v.string()), // "active", "completed", "archived"
    userId: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_status", ["status"])
    .index("by_user_and_status", ["userId", "status"]),

  // Boards table for kanban boards
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

  // Columns for kanban boards
  columns: defineTable({
    name: v.string(),
    boardId: v.id("boards"),
    position: v.number(),
    color: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_board", ["boardId"]),

  // Tasks table
  tasks: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    status: v.string(), // "todo", "in-progress", "done", etc.
    priority: v.optional(v.string()), // "low", "medium", "high", "urgent"
    dueDate: v.optional(v.number()),
    projectId: v.optional(v.id("projects")),
    boardId: v.optional(v.id("boards")),
    columnId: v.optional(v.id("columns")),
    routineId: v.optional(v.id("routines")), // Link to routines
    eventId: v.optional(v.id("events")), // Link to calendar events
    position: v.number(),
    userId: v.id("users"),
    assignedTo: v.optional(v.id("users")),
    completedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_project", ["projectId"])
    .index("by_board", ["boardId"])
    .index("by_column", ["columnId"])
    .index("by_routine", ["routineId"])
    .index("by_status", ["status"])
    .index("by_due_date", ["dueDate"])
    .searchIndex("search_tasks", {
      searchField: "title",
      filterFields: ["userId", "status", "projectId"],
    }),

  // Notes table
  notes: defineTable({
    title: v.string(),
    content: v.string(),
    tags: v.optional(v.array(v.string())),
    projectId: v.optional(v.id("projects")),
    taskId: v.optional(v.id("tasks")), // Link to tasks
    routineId: v.optional(v.id("routines")), // Link to routines
    notebookId: v.optional(v.id("notebooks")), // Organize notes
    userId: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_project", ["projectId"])
    .index("by_task", ["taskId"])
    .index("by_notebook", ["notebookId"])
    .index("by_tags", ["tags"])
    .searchIndex("search_content", {
      searchField: "content",
      filterFields: ["userId", "projectId"],
    })
    .searchIndex("search_title", {
      searchField: "title",
      filterFields: ["userId", "tags"],
    }),

  // Notebooks for organizing notes
  notebooks: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    color: v.optional(v.string()),
    projectId: v.optional(v.id("projects")),
    userId: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_project", ["projectId"]),

  // Calendar events
  events: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    startDate: v.number(),
    endDate: v.number(),
    allDay: v.boolean(),
    projectId: v.optional(v.id("projects")),
    taskId: v.optional(v.id("tasks")),
    routineId: v.optional(v.id("routines")), // Link to routines
    userId: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_project", ["projectId"])
    .index("by_date", ["startDate"])
    .index("by_task", ["taskId"])
    .index("by_routine", ["routineId"]),

  // === ROUTINES SYSTEM ===

  // Routine templates (community + personal)
  routineTemplates: defineTable({
    name: v.string(),
    description: v.string(),
    category: v.string(), // "morning", "evening", "focus", "wellness"
    difficulty: v.string(), // "beginner", "intermediate", "advanced"
    estimatedDuration: v.number(), // minutes
    isPublic: v.boolean(), // community template vs personal
    popularity: v.optional(v.number()), // rating for public templates
    tags: v.array(v.string()),
    userId: v.id("users"), // creator
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_category", ["category"])
    .index("by_public", ["isPublic"])
    .index("by_popularity", ["popularity"]),

  // User's personal routines (created from templates or scratch)
  routines: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    templateId: v.optional(v.id("routineTemplates")), // source template
    timeOfDay: v.string(), // "morning", "afternoon", "evening", "anytime"
    isActive: v.boolean(),
    totalDuration: v.number(), // calculated from blocks
    userId: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_template", ["templateId"])
    .index("by_time_of_day", ["timeOfDay"])
    .index("by_active", ["isActive"]),

  // Individual blocks within routines
  routineBlocks: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    duration: v.number(), // minutes
    category: v.string(), // "wellness", "health", "learning", "productivity", "personal"
    energyLevel: v.string(), // "high", "medium", "low"
    color: v.optional(v.string()),
    icon: v.optional(v.string()), // icon name
    position: v.number(), // order within routine
    routineId: v.optional(v.id("routines")), // for user routines
    templateId: v.optional(v.id("routineTemplates")), // for templates
    taskId: v.optional(v.id("tasks")), // can link to specific tasks
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_routine", ["routineId"])
    .index("by_template", ["templateId"])
    .index("by_category", ["category"])
    .index("by_energy", ["energyLevel"]),

  // Track routine completions and progress
  routineCompletions: defineTable({
    routineId: v.id("routines"),
    blockId: v.id("routineBlocks"),
    userId: v.id("users"),
    completedAt: v.number(),
    actualDuration: v.optional(v.number()), // how long it actually took
    notes: v.optional(v.string()),
    energyLevel: v.optional(v.string()), // how user felt during this block
  })
    .index("by_routine", ["routineId"])
    .index("by_user", ["userId"])
    .index("by_date", ["completedAt"])
    .index("by_user_and_date", ["userId", "completedAt"]),

  // === UNIVERSAL LINKING SYSTEM ===

  // Universal connections between any entities
  links: defineTable({
    fromTable: v.string(), // table name
    fromId: v.string(), // document ID
    toTable: v.string(), // table name
    toId: v.string(), // document ID
    linkType: v.string(), // "related", "blocks", "subtask", "reference", etc.
    metadata: v.optional(
      v.object({
        description: v.optional(v.string()),
        strength: v.optional(v.number()), // 1-10 relationship strength
        tags: v.optional(v.array(v.string())),
      }),
    ),
    userId: v.id("users"),
    createdAt: v.number(),
  })
    .index("by_from", ["fromTable", "fromId"])
    .index("by_to", ["toTable", "toId"])
    .index("by_user", ["userId"])
    .index("by_link_type", ["linkType"]),
});
