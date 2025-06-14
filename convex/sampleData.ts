import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const createSampleData = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Sample projects
    const sampleProjects = [
      {
        name: "Dashboard v2",
        description:
          "A comprehensive productivity application with task management and calendar integration",
        color: "#6366f1",
        status: "active",
      },
      {
        name: "E-commerce Platform",
        description:
          "Modern e-commerce solution with advanced features and real-time inventory management",
        color: "#f59e0b",
        status: "active",
      },
      {
        name: "Mobile App",
        description: "Cross-platform mobile application for iOS and Android",
        color: "#10b981",
        status: "active",
      },
    ];

    // Create projects
    const projectIds = [];
    for (const project of sampleProjects) {
      const projectId = await ctx.db.insert("projects", {
        ...project,
        userId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      projectIds.push(projectId);
    }

    // Create columns for each project (projects are now the boards)
    const columnIds = [];
    const columnNames = ["Todo", "In Progress", "Review", "Done"];

    for (const projectId of projectIds) {
      const projectColumnIds = [];
      for (let i = 0; i < columnNames.length; i++) {
        const columnId = await ctx.db.insert("columns", {
          name: columnNames[i],
          projectId,
          position: i,
          color:
            i === 0
              ? "#ef4444"
              : i === 1
                ? "#f59e0b"
                : i === 2
                  ? "#6366f1"
                  : "#10b981",
          createdAt: Date.now(),
        });
        projectColumnIds.push(columnId);
      }
      columnIds.push(projectColumnIds);
    }

    // Sample tasks
    const sampleTasks = [
      {
        title: "Design new dashboard layout",
        description: "Create wireframes and mockups for the new dashboard",
        status: "in-progress",
        priority: "high",
        projectIndex: 0,
        columnIndex: 1,
      },
      {
        title: "Implement user authentication",
        description: "Set up secure login and registration system",
        status: "todo",
        priority: "high",
        projectIndex: 0,
        columnIndex: 0,
      },
      {
        title: "Create API documentation",
        description: "Document all API endpoints with examples",
        status: "review",
        priority: "medium",
        projectIndex: 0,
        columnIndex: 2,
      },
      {
        title: "Set up payment gateway",
        description: "Integrate Stripe for payment processing",
        status: "todo",
        priority: "high",
        projectIndex: 1,
        columnIndex: 0,
      },
      {
        title: "Design product catalog",
        description: "Create responsive product grid and detail pages",
        status: "in-progress",
        priority: "medium",
        projectIndex: 1,
        columnIndex: 1,
      },
      {
        title: "Implement shopping cart",
        description: "Build cart functionality with local storage",
        status: "done",
        priority: "high",
        projectIndex: 1,
        columnIndex: 3,
      },
      {
        title: "Setup React Native project",
        description: "Initialize project with navigation and basic structure",
        status: "done",
        priority: "high",
        projectIndex: 2,
        columnIndex: 3,
      },
      {
        title: "Implement push notifications",
        description: "Add Firebase for push notification support",
        status: "todo",
        priority: "medium",
        projectIndex: 2,
        columnIndex: 0,
      },
    ];

    // Create tasks
    for (let i = 0; i < sampleTasks.length; i++) {
      const task = sampleTasks[i];
      const columnId = columnIds[task.projectIndex][task.columnIndex];

      await ctx.db.insert("tasks", {
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        columnId,
        position: i,
        userId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }

    // Sample events
    const sampleEvents = [
      {
        title: "Team Standup",
        description: "Daily team synchronization meeting",
        startDate: Date.now() + 1000 * 60 * 60 * 2, // 2 hours from now
        endDate: Date.now() + 1000 * 60 * 60 * 2.5, // 2.5 hours from now
        allDay: false,
        projectIndex: 0,
      },
      {
        title: "Client Presentation",
        description: "Present Q4 roadmap to stakeholders",
        startDate: Date.now() + 1000 * 60 * 60 * 24, // tomorrow
        endDate: Date.now() + 1000 * 60 * 60 * 25, // tomorrow + 1 hour
        allDay: false,
        projectIndex: 1,
      },
      {
        title: "Sprint Planning",
        description: "Plan next sprint tasks and objectives",
        startDate: Date.now() + 1000 * 60 * 60 * 48, // 2 days from now
        endDate: Date.now() + 1000 * 60 * 60 * 50, // 2 days + 2 hours
        allDay: false,
        projectIndex: 0,
      },
    ];

    // Create events
    for (const event of sampleEvents) {
      const projectId = projectIds[event.projectIndex];
      await ctx.db.insert("events", {
        title: event.title,
        description: event.description,
        startDate: event.startDate,
        endDate: event.endDate,
        allDay: event.allDay,
        projectId,
        userId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }

    console.log(`Created ${sampleProjects.length} projects`);
    console.log(`Created ${columnIds.flat().length} columns`);
    console.log(`Created ${sampleTasks.length} tasks`);
    console.log(`Created ${sampleEvents.length} events`);

    return null;
  },
});
