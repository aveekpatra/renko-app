import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const createSampleData = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Check if sample data already exists
    const existingProjects = await ctx.db
      .query("projects")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (existingProjects) {
      console.log("Sample data already exists, skipping creation");
      return null;
    }

    console.log("Creating sample data...");

    // Sample projects
    const sampleProjects = [
      {
        name: "Renko Productivity App",
        description:
          "A comprehensive productivity application with task management, notes, and calendar integration",
        color: "#6366f1",
        status: "active",
      },
      {
        name: "E-commerce Platform",
        description:
          "Modern e-commerce solution with advanced analytics and real-time inventory management",
        color: "#f59e0b",
        status: "planned",
      },
      {
        name: "Mobile App Redesign",
        description:
          "Complete UI/UX overhaul with enhanced user experience and accessibility features",
        color: "#10b981",
        status: "active",
      },
      {
        name: "API Gateway Migration",
        description:
          "Modernize API infrastructure with improved security and performance monitoring",
        color: "#ef4444",
        status: "completed",
      },
      {
        name: "Customer Support Portal",
        description:
          "Comprehensive support system with ticket management and knowledge base integration",
        color: "#8b5cf6",
        status: "draft",
      },
    ];

    const projectIds: any[] = [];

    for (const project of sampleProjects) {
      const projectId = await ctx.db.insert("projects", {
        ...project,
        userId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      projectIds.push(projectId);
    }

    // Sample notebooks
    const notebook1 = await ctx.db.insert("notebooks", {
      name: "Development Notes",
      description: "Technical notes and documentation",
      color: "#3b82f6",
      projectId: projectIds[0],
      userId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    const notebook2 = await ctx.db.insert("notebooks", {
      name: "Meeting Notes",
      description: "Notes from team meetings and client calls",
      color: "#10b981",
      userId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Sample notes
    const sampleNotes = [
      {
        title: "Dashboard Component Architecture",
        content:
          "The dashboard should be built with reusable React components. Key components include:\n\n1. UnifiedKanbanWidget - for displaying cards in columns\n2. RecentNotesGallery - for showing recent notes\n3. ProjectStats - for analytics\n\nEach component should accept isDarkMode and theming props.",
        tags: ["development", "architecture", "react"],
        projectId: projectIds[0],
        notebookId: notebook1,
      },
      {
        title: "Client Feedback Meeting",
        content:
          "Meeting with client on Dec 15, 2024:\n\n✅ They love the new dashboard design\n✅ Mobile responsiveness is crucial\n🔄 Need to add bulk operations for tasks\n🔄 Calendar integration requested\n⏳ Timeline: finish by end of Q1",
        tags: ["meeting", "client", "feedback"],
        projectId: projectIds[0],
        notebookId: notebook2,
      },
      {
        title: "API Performance Optimization",
        content:
          "// Key optimizations implemented:\n\n1. Database indexing\n   - Added indexes on userId, projectId, status\n   - Query performance improved by 75%\n\n2. Caching strategy\n   - Redis cache for frequently accessed data\n   - 15-minute TTL for project data\n\n3. Pagination\n   - Implemented cursor-based pagination\n   - Reduced payload size by 60%",
        tags: ["code", "performance", "optimization"],
        projectId: projectIds[3],
        notebookId: notebook1,
      },
      {
        title: "E-commerce Feature Requirements",
        content:
          "Required features for the new e-commerce platform:\n\n📦 Product Management\n- Inventory tracking\n- Bulk product import/export\n- Image gallery support\n\n💳 Payment Integration\n- Stripe integration\n- PayPal support\n- Apple Pay / Google Pay\n\n📊 Analytics Dashboard\n- Sales metrics\n- Customer insights\n- Revenue tracking",
        tags: ["planning", "ecommerce", "requirements"],
        projectId: projectIds[1],
        notebookId: notebook2,
      },
      {
        title: "Mobile App User Testing Results",
        content:
          "User testing session results (10 participants):\n\n🟢 Positives:\n- Intuitive navigation (9/10)\n- Fast performance (8/10)\n- Clean design (10/10)\n\n🟡 Areas for improvement:\n- Search functionality needs work (6/10)\n- Onboarding flow too long (5/10)\n- Need better offline support (4/10)\n\n📋 Next steps:\n1. Redesign search interface\n2. Streamline onboarding to 3 steps\n3. Implement offline data sync",
        tags: ["research", "mobile", "user-testing"],
        projectId: projectIds[2],
        notebookId: notebook2,
      },
    ];

    for (const note of sampleNotes) {
      await ctx.db.insert("notes", {
        ...note,
        userId,
        createdAt: Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000, // Random time in last week
        updatedAt: Date.now() - Math.random() * 24 * 60 * 60 * 1000, // Random time in last day
      });
    }

    // Sample events
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;

    const sampleEvents = [
      {
        title: "Team Standup",
        description: "Daily team sync and progress update",
        startDate: now + oneDay, // Tomorrow 9 AM
        endDate: now + oneDay + 30 * 60 * 1000, // 30 minutes
        allDay: false,
        projectId: projectIds[0],
      },
      {
        title: "Client Demo Presentation",
        description: "Present new features to the client",
        startDate: now + 2 * oneDay + 14 * 60 * 60 * 1000, // Day after tomorrow 2 PM
        endDate: now + 2 * oneDay + 15 * 60 * 60 * 1000, // 1 hour
        allDay: false,
        projectId: projectIds[0],
      },
      {
        title: "Design Review Session",
        description: "Review mobile app mockups with design team",
        startDate: now + 3 * oneDay + 10 * 60 * 60 * 1000, // 3 days from now 10 AM
        endDate: now + 3 * oneDay + 12 * 60 * 60 * 1000, // 2 hours
        allDay: false,
        projectId: projectIds[2],
      },
      {
        title: "Sprint Planning",
        description: "Plan next sprint and assign tasks",
        startDate: now + 5 * oneDay + 9 * 60 * 60 * 1000, // Friday 9 AM
        endDate: now + 5 * oneDay + 11 * 60 * 60 * 1000, // 2 hours
        allDay: false,
        projectId: projectIds[0],
      },
    ];

    for (const event of sampleEvents) {
      await ctx.db.insert("events", {
        ...event,
        userId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }

    console.log("Sample data created successfully!");
    console.log(`Created ${sampleProjects.length} projects`);
    console.log(`Created ${sampleNotes.length} notes`);
    console.log(`Created ${sampleEvents.length} events`);

    return null;
  },
});
