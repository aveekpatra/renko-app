import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

// The schema is normally optional, but Convex Auth
// requires indexes defined on `authTables`.
// The schema provides more precise TypeScript types.
export default defineSchema({
  ...authTables,

  // Projects table (boards are projects with kanban view)
  projects: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    color: v.optional(v.string()),
    status: v.optional(v.string()), // "active", "completed", "archived"
    priority: v.optional(v.string()), // "low", "medium", "high", "critical"
    dueDate: v.optional(v.number()), // Project deadline
    tags: v.optional(v.array(v.string())), // Project tags
    userId: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_status", ["status"])
    .index("by_user_and_status", ["userId", "status"])
    .index("by_priority", ["priority"])
    .index("by_due_date", ["dueDate"]),

  // Columns for kanban boards (within projects)
  columns: defineTable({
    name: v.string(),
    projectId: v.id("projects"),
    position: v.number(),
    color: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_project", ["projectId"]),

  // Tasks table
  tasks: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    status: v.string(), // "todo", "in-progress", "done", etc.
    priority: v.optional(v.string()), // "low", "medium", "high", "critical"
    dueDate: v.optional(v.number()),
    columnId: v.id("columns"), // Tasks belong to columns, which belong to projects
    routineId: v.optional(v.id("routines")), // Link to routines
    eventId: v.optional(v.id("events")), // Link to calendar events
    googleEventId: v.optional(v.string()), // Google Calendar event ID
    position: v.number(),
    userId: v.id("users"),
    assignedTo: v.optional(v.id("users")),
    tags: v.optional(v.array(v.string())), // Task tags
    timeEstimate: v.optional(v.number()), // Estimated time in minutes
    completedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_column", ["columnId"])
    .index("by_routine", ["routineId"])
    .index("by_status", ["status"])
    .index("by_due_date", ["dueDate"])
    .searchIndex("search_tasks", {
      searchField: "title",
      filterFields: ["userId", "status"],
    }),

  // Calendar events
  events: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    startDate: v.number(),
    endDate: v.number(),
    allDay: v.boolean(),
    projectId: v.optional(v.id("projects")), // Events can be linked to projects
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
    actualDuration: v.optional(v.number()), // actual vs planned
    energyLevel: v.optional(v.string()), // how user felt
    notes: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_routine", ["routineId"])
    .index("by_block", ["blockId"])
    .index("by_date", ["completedAt"])
    .index("by_user_and_date", ["userId", "completedAt"]),

  // Links between entities (for relationship tracking)
  links: defineTable({
    fromTable: v.string(), // "tasks", "projects", "events", etc.
    fromId: v.string(), // entity ID
    toTable: v.string(),
    toId: v.string(),
    linkType: v.string(), // "blocks", "depends_on", "references", etc.
    userId: v.id("users"), // owner of the link
    metadata: v.optional(
      v.object({
        description: v.optional(v.string()),
        strength: v.optional(v.number()), // 1-10 relationship strength
        tags: v.optional(v.array(v.string())),
      }),
    ),
    createdAt: v.number(),
  })
    .index("by_from", ["fromTable", "fromId"])
    .index("by_to", ["toTable", "toId"])
    .index("by_type", ["linkType"])
    .index("by_user", ["userId"]),

  // User preferences and settings
  userPreferences: defineTable({
    userId: v.id("users"),
    theme: v.optional(v.string()), // "light", "dark", "auto"
    timeZone: v.optional(v.string()),
    workingHours: v.optional(
      v.object({
        start: v.string(), // "09:00"
        end: v.string(), // "17:00"
        days: v.array(v.string()), // ["monday", "tuesday", ...]
      }),
    ),
    notifications: v.optional(
      v.object({
        email: v.boolean(),
        push: v.boolean(),
        desktop: v.boolean(),
        reminders: v.boolean(),
      }),
    ),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),

  // === GOOGLE CALENDAR INTEGRATION ===

  // Unified Calendar Connection (single OAuth client approach)
  calendarConnections: defineTable({
    userId: v.id("users"),
    hasCalendarScope: v.boolean(),
    email: v.string(),
    connectedAt: v.number(),
    lastSync: v.optional(v.number()),
    error: v.optional(v.string()),
    // OAuth token storage for API access
    accessToken: v.optional(v.string()),
    refreshToken: v.optional(v.string()),
    expiresAt: v.optional(v.number()),
  }).index("by_user", ["userId"]),

  // Unified Google Calendar Events (for the new unified approach)
  unifiedGoogleCalendarEvents: defineTable({
    userId: v.id("users"),
    eventId: v.string(), // Google Calendar event ID
    summary: v.string(),
    description: v.optional(v.string()),
    startTime: v.string(), // ISO string from Google
    endTime: v.string(), // ISO string from Google
    location: v.optional(v.string()),
    attendees: v.array(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_event", ["userId", "eventId"]),

  // Google Calendar Integration - Support multiple calendar connections (LEGACY)
  googleCalendarConnections: defineTable({
    userId: v.id("users"),
    googleAccountId: v.string(),
    googleAccountEmail: v.string(),
    googleAccountName: v.string(),
    googleAccountPicture: v.optional(v.string()),
    accessToken: v.string(),
    refreshToken: v.optional(v.string()),
    expiresAt: v.number(),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
    lastSyncAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_google_account", ["userId", "googleAccountId"])
    .index("by_google_account", ["googleAccountId"]),

  googleCalendarEvents: defineTable({
    userId: v.id("users"),
    connectionId: v.id("googleCalendarConnections"),
    eventId: v.string(),
    summary: v.string(),
    description: v.optional(v.string()),
    startTime: v.string(),
    endTime: v.string(),
    location: v.optional(v.string()),
    attendees: v.array(v.string()),
    etag: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_connection", ["connectionId"])
    .index("by_user_and_event", ["userId", "eventId"])
    .index("by_connection_and_event", ["connectionId", "eventId"]),

  // Remove old single calendar tables
  // googleCalendarTokens and old googleCalendarEvents will be replaced
});
