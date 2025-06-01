"use client";

import React, { useState } from "react";
import {
  Plus,
  Bell,
  Calendar,
  Clock,
  Folder,
  CheckSquare,
  Filter,
  FileText,
} from "lucide-react";
import { useTheme } from "@/components/AppLayout";
import { useAuthActions } from "@convex-dev/auth/react";
import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";
import UnifiedKanbanWidget, {
  WidgetColumn,
  WidgetItem,
} from "../components/UnifiedKanbanWidget";
import RecentNotesGallery, { NoteItem } from "../components/RecentNotesGallery";

function AuthenticatedContent() {
  const { isDarkMode } = useTheme();
  const { signOut } = useAuthActions();
  const currentDate = new Date();

  const handleLogout = async () => {
    await signOut();
  };

  // Project color mapping for consistency across all widgets
  const getProjectColor = (project: string): string => {
    const projectColors: Record<string, string> = {
      "Dashboard v2": "blue",
      General: "purple",
      "Client Relations": "green",
      "Product Launch": "orange",
      Marketing: "pink",
      Backend: "blue",
      Analytics: "purple",
      "Design System": "blue",
      "UX Research": "green",
      Mobile: "orange",
      Security: "pink",
      Infrastructure: "purple",
      "E-commerce": "orange",
      Support: "green",
      Sales: "pink",
      HR: "blue",
      Documentation: "purple",
      Design: "green",
    };
    return projectColors[project] || "gray";
  };

  // Calendar data
  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const dates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - date.getDay() + i + 1);
    return date;
  });

  const calendarColumns: WidgetColumn[] = weekDays.map((day, index) => ({
    id: index.toString(),
    title: day,
    icon: Calendar,
    color:
      dates[index].toDateString() === currentDate.toDateString()
        ? "purple"
        : "gray",
    subtitle: `${dates[index].getDate()} • events`,
  }));

  const calendarData: Record<string, WidgetItem[]> = {
    "1": [
      {
        id: "c1",
        title: "Design Review",
        description: "Review new dashboard mockups with team",
        time: "10:00",
        duration: "1h",
        priority: "high",
        project: "Dashboard v2",
        color: getProjectColor("Dashboard v2"),
      },
      {
        id: "c2",
        title: "Team Sync",
        description: "Weekly team standup meeting",
        time: "15:30",
        duration: "30m",
        priority: "medium",
        project: "General",
        color: getProjectColor("General"),
      },
    ],
    "2": [
      {
        id: "c3",
        title: "Client Presentation",
        description: "Present Q4 progress and roadmap",
        time: "14:00",
        duration: "2h",
        priority: "high",
        project: "Client Relations",
        color: getProjectColor("Client Relations"),
      },
    ],
    "3": [
      {
        id: "c4",
        title: "Product Launch",
        description: "Final launch preparations and go-live",
        time: "09:00",
        duration: "4h",
        priority: "critical",
        project: "Product Launch",
        color: getProjectColor("Product Launch"),
      },
      {
        id: "c5",
        title: "Lunch with Sarah",
        description: "Discuss new marketing strategy",
        time: "12:30",
        duration: "1h",
        priority: "low",
        project: "Marketing",
        color: getProjectColor("Marketing"),
      },
    ],
    "4": [
      {
        id: "c6",
        title: "Code Review",
        description: "Review authentication system implementation",
        time: "11:00",
        duration: "45m",
        priority: "medium",
        project: "Backend",
        color: getProjectColor("Backend"),
      },
    ],
  };

  // Time-based tasks data
  const timeBasedColumns: WidgetColumn[] = [
    { id: "today", title: "Today", icon: Clock, color: "red" },
    { id: "thisWeek", title: "This Week", icon: Calendar, color: "orange" },
    { id: "thisMonth", title: "This Month", icon: Calendar, color: "blue" },
    { id: "longTerm", title: "Long Term", icon: Clock, color: "purple" },
  ];

  const timeBasedData: Record<string, WidgetItem[]> = {
    today: [
      {
        id: "t1",
        title: "Review client proposal",
        description:
          "Final review of the Q4 marketing proposal before client meeting",
        priority: "high",
        project: "Marketing",
        timeEstimate: "2h",
        dueTime: "14:00",
        color: getProjectColor("Marketing"),
      },
      {
        id: "t2",
        title: "Update dashboard metrics",
        description: "Add new KPI tracking for user engagement and retention",
        priority: "medium",
        project: "Analytics",
        timeEstimate: "1h",
        dueTime: "16:30",
        color: getProjectColor("Analytics"),
      },
      {
        id: "t3",
        title: "Team standup meeting",
        description: "Daily sync with the development team",
        priority: "high",
        project: "General",
        timeEstimate: "30m",
        dueTime: "09:30",
        color: getProjectColor("General"),
      },
    ],
    thisWeek: [
      {
        id: "t4",
        title: "Design system documentation",
        description:
          "Complete component library documentation for new designers",
        priority: "medium",
        project: "Design System",
        timeEstimate: "4h",
        dueTime: "Wed",
        color: getProjectColor("Design System"),
      },
      {
        id: "t5",
        title: "Database optimization",
        description:
          "Optimize queries and add proper indexing for better performance",
        priority: "high",
        project: "Backend",
        timeEstimate: "6h",
        dueTime: "Fri",
        color: getProjectColor("Backend"),
      },
      {
        id: "t6",
        title: "User testing sessions",
        description: "Conduct usability testing for the new onboarding flow",
        priority: "medium",
        project: "UX Research",
        timeEstimate: "3h",
        dueTime: "Thu",
        color: getProjectColor("UX Research"),
      },
    ],
    thisMonth: [
      {
        id: "t7",
        title: "Mobile app beta release",
        description: "Prepare and deploy beta version to testing group",
        priority: "high",
        project: "Mobile",
        timeEstimate: "12h",
        dueTime: "Dec 15",
        color: getProjectColor("Mobile"),
      },
      {
        id: "t8",
        title: "Security audit",
        description: "Comprehensive security review of authentication system",
        priority: "critical",
        project: "Security",
        timeEstimate: "8h",
        dueTime: "Dec 20",
        color: getProjectColor("Security"),
      },
      {
        id: "t9",
        title: "Marketing campaign launch",
        description: "Launch holiday marketing campaign across all channels",
        priority: "medium",
        project: "Marketing",
        timeEstimate: "5h",
        dueTime: "Dec 10",
        color: getProjectColor("Marketing"),
      },
    ],
    longTerm: [
      {
        id: "t10",
        title: "Platform migration",
        description: "Migrate entire platform to new cloud infrastructure",
        priority: "high",
        project: "Infrastructure",
        timeEstimate: "40h",
        dueTime: "Q1 2024",
        color: getProjectColor("Infrastructure"),
      },
      {
        id: "t11",
        title: "Mobile app development",
        description: "Build native iOS and Android applications",
        priority: "medium",
        project: "Mobile",
        timeEstimate: "200h",
        dueTime: "Q2 2024",
        color: getProjectColor("Mobile"),
      },
    ],
  };

  // Project status data
  const projectStatusColumns: WidgetColumn[] = [
    { id: "draft", title: "Draft", icon: Folder, color: "gray" },
    { id: "planned", title: "Planned", icon: Calendar, color: "blue" },
    { id: "inProgress", title: "In Progress", icon: Clock, color: "orange" },
    { id: "done", title: "Done", icon: CheckSquare, color: "green" },
  ];

  const projectStatusData: Record<string, WidgetItem[]> = {
    draft: [
      {
        id: "p1",
        title: "E-commerce Platform",
        description:
          "Modern e-commerce solution with advanced analytics and real-time inventory management",
        project: "E-commerce",
        priority: "high",
        timeEstimate: "120h",
        dueDate: "Q2 2024",
        color: getProjectColor("E-commerce"),
      },
      {
        id: "p2",
        title: "Customer Support Portal",
        description:
          "Comprehensive support system with ticket management and knowledge base integration",
        project: "Support",
        priority: "medium",
        timeEstimate: "80h",
        dueDate: "Q1 2024",
        color: getProjectColor("Support"),
      },
    ],
    planned: [
      {
        id: "p3",
        title: "API Gateway Redesign",
        description:
          "Modernize API infrastructure with improved security and performance monitoring",
        project: "Infrastructure",
        priority: "high",
        timeEstimate: "60h",
        dueDate: "Feb 2024",
        color: getProjectColor("Infrastructure"),
      },
      {
        id: "p4",
        title: "Mobile App Redesign",
        description:
          "Complete UI/UX overhaul with enhanced user experience and accessibility features",
        project: "Mobile",
        priority: "medium",
        timeEstimate: "100h",
        dueDate: "Mar 2024",
        color: getProjectColor("Mobile"),
      },
    ],
    inProgress: [
      {
        id: "p5",
        title: "Dashboard Analytics",
        description:
          "Advanced analytics dashboard with real-time data visualization and reporting capabilities",
        project: "Analytics",
        priority: "critical",
        timeEstimate: "40h",
        dueDate: "Jan 15",
        color: getProjectColor("Analytics"),
      },
      {
        id: "p6",
        title: "User Authentication System",
        description:
          "Secure authentication with multi-factor support and session management",
        project: "Security",
        priority: "high",
        timeEstimate: "30h",
        dueDate: "Jan 10",
        color: getProjectColor("Security"),
      },
    ],
    done: [
      {
        id: "p7",
        title: "Database Migration",
        description:
          "Successfully migrated from PostgreSQL to modern cloud infrastructure",
        project: "Infrastructure",
        priority: "high",
        timeEstimate: "50h",
        dueDate: "Completed",
        color: getProjectColor("Infrastructure"),
      },
      {
        id: "p8",
        title: "Landing Page Redesign",
        description:
          "Modern landing page with improved conversion rates and mobile optimization",
        project: "Marketing",
        priority: "medium",
        timeEstimate: "25h",
        dueDate: "Completed",
        color: getProjectColor("Marketing"),
      },
    ],
  };

  // Recent notes data
  const recentNotesData: NoteItem[] = [
    {
      id: "n1",
      title: "Dashboard Design Ideas",
      content:
        "Exploring new glassmorphic design patterns for the dashboard. Consider implementing floating cards with enhanced depth effects and improved color contrast ratios for better accessibility.",
      type: "idea",
      project: "Dashboard v2",
      lastModified: "2 hours ago",
      tags: ["design", "ui", "glassmorphic"],
      color: getProjectColor("Dashboard v2"),
    },
    {
      id: "n2",
      title: "Client Meeting Notes",
      content:
        "Discussed Q4 roadmap priorities and feature requests. Key points: mobile app improvements, better analytics dashboard, and enhanced security features. Next steps include creating detailed user stories.",
      type: "meeting",
      project: "Client Relations",
      lastModified: "1 day ago",
      tags: ["meeting", "roadmap", "Q4"],
      color: getProjectColor("Client Relations"),
    },
    {
      id: "n3",
      title: "Authentication Bug Fix",
      content:
        "// Fixed token validation issue\nconst validateToken = async (token: string) => {\n  if (!token) throw new Error('Token required');\n  return jwt.verify(token, SECRET_KEY);\n};\n\n// Updated middleware to handle edge cases",
      type: "code",
      project: "Backend",
      lastModified: "3 hours ago",
      tags: ["auth", "bug-fix", "security"],
      color: getProjectColor("Backend"),
    },
    {
      id: "n4",
      title: "Marketing Campaign Todos",
      content:
        "1. Finalize holiday campaign creative assets\n2. Schedule social media posts for next week\n3. Review email marketing automation flows\n4. Coordinate with design team on landing page updates",
      type: "todo",
      project: "Marketing",
      lastModified: "5 hours ago",
      tags: ["campaign", "social", "email"],
      color: getProjectColor("Marketing"),
    },
    {
      id: "n5",
      title: "Mobile App Architecture",
      content:
        "Considering React Native vs Flutter for cross-platform development. Key factors: team expertise, performance requirements, and long-term maintenance. Need to evaluate development timeline and resource allocation.",
      type: "text",
      project: "Mobile",
      lastModified: "1 day ago",
      tags: ["architecture", "react-native", "flutter"],
      color: getProjectColor("Mobile"),
    },
    {
      id: "n6",
      title: "User Research Insights",
      content:
        "Key findings from recent user interviews: 1) Users want faster navigation, 2) Color coding is highly valued, 3) Mobile experience needs improvement, 4) Integration with third-party tools is essential.",
      type: "idea",
      project: "UX Research",
      lastModified: "2 days ago",
      tags: ["research", "insights", "users"],
      color: getProjectColor("UX Research"),
    },
    {
      id: "n7",
      title: "Security Audit Checklist",
      content:
        "✓ Review authentication flows\n✓ Check input validation\n✓ Test API rate limiting\n• Audit database permissions\n• Review error handling\n• Test session management",
      type: "todo",
      project: "Security",
      lastModified: "6 hours ago",
      tags: ["security", "audit", "checklist"],
      color: getProjectColor("Security"),
    },
    {
      id: "n8",
      title: "Team Standup Notes",
      content:
        "Today's progress: Design system components completed, API endpoints tested, mobile mockups ready for review. Blockers: Waiting for design feedback on navigation patterns. Tomorrow: Focus on integration testing.",
      type: "meeting",
      project: "General",
      lastModified: "4 hours ago",
      tags: ["standup", "progress", "blockers"],
      color: getProjectColor("General"),
    },
  ];

  const handleAddCalendarEvent = (columnId: string) => {
    console.log("Add calendar event to column:", columnId);
  };

  const handleAddTask = (columnId: string) => {
    console.log("Add task to column:", columnId);
  };

  const handleAddProject = (columnId: string) => {
    console.log("Add project to column:", columnId);
  };

  const handleNoteClick = (noteId: string) => {
    console.log("Note clicked:", noteId);
  };

  const handleAddNote = () => {
    console.log("Add new note");
  };

  const handleFilter = () => {
    console.log("Filter clicked");
  };

  return (
    <div className="h-full overflow-hidden">
      <main className="h-full overflow-auto">
        <div className="p-6">
          {/* Top Bar */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold mb-1 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 bg-clip-text text-transparent">
                Good morning, Jimmy!
              </h2>
              <p
                className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
              >
                Here&apos;s what&apos;s happening with your personal projects
                today.
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleLogout}
                className="px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors text-sm"
              >
                Sign Out
              </button>
              <button
                className={`p-2.5 backdrop-blur-md rounded-lg shadow-lg transition-all duration-300 border hover:-translate-y-0.5 ${
                  isDarkMode
                    ? "bg-gray-800/80 border-gray-700/60 hover:bg-gray-800/90 shadow-black/20 hover:shadow-black/30"
                    : "bg-white/80 border-white/60 hover:bg-white/90 shadow-gray-900/10 hover:shadow-gray-900/15"
                }`}
              >
                <Bell
                  className={`w-4 h-4 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
                />
              </button>
              <button className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 shadow-lg shadow-purple-500/30 hover:shadow-lg hover:shadow-purple-500/40 transform hover:-translate-y-0.5 font-medium text-sm">
                <Plus className="w-4 h-4" />
                <span>New Project</span>
              </button>
            </div>
          </div>

          <div className="space-y-6">
          {/* Calendar Widget */}
            <UnifiedKanbanWidget
              isDarkMode={isDarkMode}
              title="Calendar"
              subtitle={currentDate.toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
              icon={Calendar}
              columns={calendarColumns}
              data={calendarData}
              onAddItem={handleAddCalendarEvent}
              height="480px"
              actionButtons={
                <button
                  className={`p-2.5 rounded-xl backdrop-blur-sm border shadow-lg ${
                    isDarkMode
                      ? "bg-gray-800/70 border-gray-700/50 text-gray-400 shadow-black/20"
                      : "bg-white/70 border-gray-200/60 text-gray-600 shadow-gray-900/10"
                  }`}
                >
                  <Plus className="w-4 h-4" />
                </button>
              }
            />

            {/* Time-Based Tasks */}
            <UnifiedKanbanWidget
              isDarkMode={isDarkMode}
              title="Time-Based Tasks"
              icon={Clock}
              columns={timeBasedColumns}
              data={timeBasedData}
              onAddItem={handleAddTask}
              showFilter={true}
              onFilter={handleFilter}
              height="550px"
            />

            {/* Project Status */}
            <UnifiedKanbanWidget
              isDarkMode={isDarkMode}
              title="Project Status"
              icon={Folder}
              columns={projectStatusColumns}
              data={projectStatusData}
              onAddItem={handleAddProject}
              showFilter={true}
              onFilter={handleFilter}
              height="500px"
            />

            {/* Recent Notes */}
            <RecentNotesGallery
              isDarkMode={isDarkMode}
              title="Recent Notes"
              subtitle="Recently created and modified notes"
              icon={FileText}
              notes={recentNotesData}
              onNoteClick={handleNoteClick}
              onAddNote={handleAddNote}
              height="450px"
            />
          </div>
        </div>
      </main>
    </div>
  );
}

export default function Home() {
  return (
    <>
      <AuthLoading>
        <div className="flex items-center justify-center h-screen">
          <div className="text-lg">Loading...</div>
        </div>
      </AuthLoading>

      <Authenticated>
        <AuthenticatedContent />
      </Authenticated>

      <Unauthenticated>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Welcome</h1>
            <p className="text-gray-600 mb-4">Please sign in to continue</p>
            <a
              href="/signin"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md transition-colors"
            >
              Sign In
            </a>
          </div>
        </div>
      </Unauthenticated>
    </>
  );
}
