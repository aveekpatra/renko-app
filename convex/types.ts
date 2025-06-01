import { Id } from "./_generated/dataModel";

// Base types for common fields
export interface BaseEntity {
  _id: string;
  userId: Id<"users">;
  createdAt: number;
  updatedAt: number;
}

// Enriched entity types (for API responses)
export interface EnrichedProject {
  _id: Id<"projects">;
  name: string;
  color?: string;
}

export interface EnrichedTask {
  _id: Id<"tasks">;
  title: string;
  status: string;
}

export interface EnrichedRoutine {
  _id: Id<"routines">;
  name: string;
  timeOfDay: string;
}

export interface EnrichedNotebook {
  _id: Id<"notebooks">;
  name: string;
  color?: string;
}

// Common enums/constants
export const TaskStatus = {
  TODO: "todo",
  IN_PROGRESS: "in-progress",
  DONE: "done",
  CANCELLED: "cancelled",
} as const;

export const Priority = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  URGENT: "urgent",
} as const;

export const ProjectStatus = {
  ACTIVE: "active",
  COMPLETED: "completed",
  ARCHIVED: "archived",
  ON_HOLD: "on-hold",
} as const;

export const TimeOfDay = {
  MORNING: "morning",
  AFTERNOON: "afternoon",
  EVENING: "evening",
  ANYTIME: "anytime",
} as const;

export const Difficulty = {
  BEGINNER: "beginner",
  INTERMEDIATE: "intermediate",
  ADVANCED: "advanced",
} as const;

export const EnergyLevel = {
  HIGH: "high",
  MEDIUM: "medium",
  LOW: "low",
} as const;

export const LinkType = {
  RELATED: "related",
  BLOCKS: "blocks",
  SUBTASK: "subtask",
  REFERENCE: "reference",
  INSPIRATION: "inspiration",
  DEPENDENCY: "dependency",
  SCHEDULED: "scheduled",
  MENTIONS: "mentions",
  CONTAINS: "contains",
  ATTACHED_TO: "attachedTo",
} as const;

// Type guards
export function isValidTaskStatus(
  status: string,
): status is keyof typeof TaskStatus {
  return Object.values(TaskStatus).includes(status as any);
}

export function isValidPriority(
  priority: string,
): priority is keyof typeof Priority {
  return Object.values(Priority).includes(priority as any);
}

export function isValidProjectStatus(
  status: string,
): status is keyof typeof ProjectStatus {
  return Object.values(ProjectStatus).includes(status as any);
}

// API response types
export interface PaginatedResponse<T> {
  items: T[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface AnalyticsInsight {
  totalActiveRoutines: number;
  averageCompletionRate: number;
  currentStreaks: Array<{
    routineName: string;
    streak: number;
  }>;
  weeklyProgress: Array<{
    day: string;
    completions: number;
    totalBlocks: number;
  }>;
  energyOptimization: {
    peakEnergyTime?: string;
    lowEnergyTime?: string;
    averageEnergyByHour: Array<{
      hour: number;
      averageEnergy: number;
    }>;
  };
  timeInvested: number;
}

// Search and filter types
export interface SearchFilters {
  searchTerm?: string;
  tags?: string[];
  status?: string;
  priority?: string;
  projectId?: Id<"projects">;
  startDate?: number;
  endDate?: number;
  limit?: number;
  offset?: number;
}
