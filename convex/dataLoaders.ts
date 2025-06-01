import { QueryCtx } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import {
  EnrichedProject,
  EnrichedTask,
  EnrichedRoutine,
  EnrichedNotebook,
} from "./types";

// Batch data loaders to avoid N+1 queries
export class DataLoader {
  private ctx: QueryCtx;
  private projectCache = new Map<Id<"projects">, EnrichedProject | null>();
  private taskCache = new Map<Id<"tasks">, EnrichedTask | null>();
  private routineCache = new Map<Id<"routines">, EnrichedRoutine | null>();
  private notebookCache = new Map<Id<"notebooks">, EnrichedNotebook | null>();

  constructor(ctx: QueryCtx) {
    this.ctx = ctx;
  }

  // Batch load projects
  async loadProjects(
    projectIds: (Id<"projects"> | undefined)[],
  ): Promise<(EnrichedProject | null)[]> {
    const validIds = projectIds.filter(
      (id): id is Id<"projects"> => id !== undefined,
    );
    const uncachedIds = validIds.filter((id) => !this.projectCache.has(id));

    if (uncachedIds.length > 0) {
      const projects = await Promise.all(
        uncachedIds.map((id) => this.ctx.db.get(id)),
      );

      projects.forEach((project, index) => {
        const id = uncachedIds[index];
        this.projectCache.set(
          id,
          project
            ? {
                _id: project._id,
                name: project.name,
                color: project.color,
              }
            : null,
        );
      });
    }

    return projectIds.map((id) =>
      id ? this.projectCache.get(id) || null : null,
    );
  }

  // Batch load tasks
  async loadTasks(
    taskIds: (Id<"tasks"> | undefined)[],
  ): Promise<(EnrichedTask | null)[]> {
    const validIds = taskIds.filter(
      (id): id is Id<"tasks"> => id !== undefined,
    );
    const uncachedIds = validIds.filter((id) => !this.taskCache.has(id));

    if (uncachedIds.length > 0) {
      const tasks = await Promise.all(
        uncachedIds.map((id) => this.ctx.db.get(id)),
      );

      tasks.forEach((task, index) => {
        const id = uncachedIds[index];
        this.taskCache.set(
          id,
          task
            ? {
                _id: task._id,
                title: task.title,
                status: task.status,
              }
            : null,
        );
      });
    }

    return taskIds.map((id) => (id ? this.taskCache.get(id) || null : null));
  }

  // Batch load routines
  async loadRoutines(
    routineIds: (Id<"routines"> | undefined)[],
  ): Promise<(EnrichedRoutine | null)[]> {
    const validIds = routineIds.filter(
      (id): id is Id<"routines"> => id !== undefined,
    );
    const uncachedIds = validIds.filter((id) => !this.routineCache.has(id));

    if (uncachedIds.length > 0) {
      const routines = await Promise.all(
        uncachedIds.map((id) => this.ctx.db.get(id)),
      );

      routines.forEach((routine, index) => {
        const id = uncachedIds[index];
        this.routineCache.set(
          id,
          routine
            ? {
                _id: routine._id,
                name: routine.name,
                timeOfDay: routine.timeOfDay,
              }
            : null,
        );
      });
    }

    return routineIds.map((id) =>
      id ? this.routineCache.get(id) || null : null,
    );
  }

  // Load single project with cache
  async loadProject(
    projectId: Id<"projects"> | undefined,
  ): Promise<EnrichedProject | null> {
    const results = await this.loadProjects([projectId]);
    return results[0];
  }

  // Load single task with cache
  async loadTask(
    taskId: Id<"tasks"> | undefined,
  ): Promise<EnrichedTask | null> {
    const results = await this.loadTasks([taskId]);
    return results[0];
  }

  // Load single routine with cache
  async loadRoutine(
    routineId: Id<"routines"> | undefined,
  ): Promise<EnrichedRoutine | null> {
    const results = await this.loadRoutines([routineId]);
    return results[0];
  }
}

// Specialized queries for common patterns
export async function getTasksWithCounts(
  ctx: QueryCtx,
  userId: Id<"users">,
  projectId?: Id<"projects">,
) {
  let query = ctx.db
    .query("tasks")
    .withIndex("by_user", (q) => q.eq("userId", userId));

  if (projectId) {
    query = ctx.db
      .query("tasks")
      .withIndex("by_project", (q) => q.eq("projectId", projectId));
  }

  const tasks = await query.collect();

  return {
    tasks,
    total: tasks.length,
    completed: tasks.filter((t) => t.status === "done").length,
    inProgress: tasks.filter((t) => t.status === "in-progress").length,
    todo: tasks.filter((t) => t.status === "todo").length,
  };
}

export async function getProjectsWithStats(ctx: QueryCtx, userId: Id<"users">) {
  const projects = await ctx.db
    .query("projects")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .collect();

  // Batch load all related data
  const projectStats = await Promise.all(
    projects.map(async (project) => {
      const [tasks, notes, events] = await Promise.all([
        ctx.db
          .query("tasks")
          .withIndex("by_project", (q) => q.eq("projectId", project._id))
          .collect(),
        ctx.db
          .query("notes")
          .withIndex("by_project", (q) => q.eq("projectId", project._id))
          .collect(),
        ctx.db
          .query("events")
          .withIndex("by_project", (q) => q.eq("projectId", project._id))
          .collect(),
      ]);

      const completedTasks = tasks.filter((t) => t.status === "done").length;
      const progress =
        tasks.length > 0
          ? Math.round((completedTasks / tasks.length) * 100)
          : 0;

      return {
        ...project,
        taskCount: tasks.length,
        completedTasks,
        noteCount: notes.length,
        eventCount: events.length,
        progress,
      };
    }),
  );

  return projectStats.sort((a, b) => b.updatedAt - a.updatedAt);
}
