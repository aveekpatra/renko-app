import { getAuthUserId } from "@convex-dev/auth/server";
import { QueryCtx, MutationCtx } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Authentication helper
export async function requireAuth(ctx: QueryCtx | MutationCtx) {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new Error("Not authenticated");
  return userId;
}

// Validation helpers
export function validateRequired(value: string | undefined, fieldName: string) {
  if (!value?.trim()) {
    throw new Error(`${fieldName} is required`);
  }
  return value.trim();
}

export function validateDateRange(startDate: number, endDate: number) {
  if (startDate >= endDate) {
    throw new Error("Start date must be before end date");
  }
}

// Data enrichment helpers
export async function enrichWithProject(
  ctx: QueryCtx,
  projectId: Id<"projects"> | undefined,
) {
  if (!projectId) return null;
  const project = await ctx.db.get(projectId);
  return project
    ? {
        _id: project._id,
        name: project.name,
        color: project.color,
      }
    : null;
}

export async function enrichWithTask(
  ctx: QueryCtx,
  taskId: Id<"tasks"> | undefined,
) {
  if (!taskId) return null;
  const task = await ctx.db.get(taskId);
  return task
    ? {
        _id: task._id,
        title: task.title,
        status: task.status,
      }
    : null;
}

export async function enrichWithRoutine(
  ctx: QueryCtx,
  routineId: Id<"routines"> | undefined,
) {
  if (!routineId) return null;
  const routine = await ctx.db.get(routineId);
  return routine
    ? {
        _id: routine._id,
        name: routine.name,
        timeOfDay: routine.timeOfDay,
      }
    : null;
}

// Ownership validation
export async function validateOwnership<T extends { userId: Id<"users"> }>(
  ctx: QueryCtx | MutationCtx,
  entity: T | null,
  entityName: string,
) {
  const userId = await requireAuth(ctx);
  if (!entity || entity.userId !== userId) {
    throw new Error(`${entityName} not found`);
  }
  return entity;
}

// Tag cleaning utility
export function cleanTags(tags: string[] | undefined): string[] | undefined {
  if (!tags) return undefined;
  const cleaned = [
    ...new Set(
      tags.filter((tag) => tag.trim()).map((tag) => tag.trim().toLowerCase()),
    ),
  ];
  return cleaned.length > 0 ? cleaned : undefined;
}

// Time range calculation
export function getTimeRange(range: "week" | "month" | "year" = "month") {
  const now = Date.now();
  const ranges = {
    week: 7 * 24 * 60 * 60 * 1000,
    month: 30 * 24 * 60 * 60 * 1000,
    year: 365 * 24 * 60 * 60 * 1000,
  };
  return {
    start: now - ranges[range],
    end: now,
  };
}

// Pagination helper
export function createPaginationResult<T>(
  items: T[],
  page: number = 1,
  limit: number = 20,
) {
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedItems = items.slice(startIndex, endIndex);

  return {
    items: paginatedItems,
    totalItems: items.length,
    totalPages: Math.ceil(items.length / limit),
    currentPage: page,
    hasNextPage: endIndex < items.length,
    hasPreviousPage: page > 1,
  };
}
