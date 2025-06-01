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
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import UnifiedKanbanWidget, {
  WidgetColumn,
  WidgetItem,
} from "../components/UnifiedKanbanWidget";
import RecentNotesGallery, { NoteItem } from "../components/RecentNotesGallery";

function AuthenticatedContent() {
  const { isDarkMode } = useTheme();
  const { signOut } = useAuthActions();
  const currentDate = new Date();

  // Fetch real data from Convex
  const projects = useQuery(api.projects.getProjects, {});
  const projectStats = useQuery(api.projects.getProjectStats, {});
  const recentNotes = useQuery(api.notes.getRecentNotes, {});
  const todayEvents = useQuery(api.calendar.getTodayEvents, {});
  const upcomingEvents = useQuery(api.calendar.getUpcomingEvents, { days: 7 });

  // Mutation for creating sample data
  const createSampleData = useMutation(api.sampleData.createSampleData);

  const handleLogout = async () => {
    await signOut();
  };

  const handleCreateSampleData = async () => {
    try {
      await createSampleData({});
      alert("Sample data created successfully! Refresh the page to see it.");
    } catch (error) {
      alert("Error creating sample data: " + error);
    }
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

  // Transform real events data for calendar widget
  const calendarData: Record<string, WidgetItem[]> = React.useMemo(() => {
    const data: Record<string, WidgetItem[]> = {};

    // Initialize empty arrays for each day
    weekDays.forEach((_, index) => {
      data[index.toString()] = [];
    });

    if (upcomingEvents) {
      upcomingEvents.forEach((event) => {
        const eventDate = new Date(event.startDate);
        const dayIndex = dates.findIndex(
          (date) => date.toDateString() === eventDate.toDateString(),
        );

        if (dayIndex !== -1) {
          data[dayIndex.toString()].push({
            id: event._id,
            title: event.title,
            description: event.description || "",
            time: eventDate.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            }),
            duration: `${Math.round((event.endDate - event.startDate) / (1000 * 60))}m`,
            priority: "medium",
            project: "General",
            color: "blue",
          });
        }
      });
    }

    return data;
  }, [upcomingEvents, dates]);

  // Time-based tasks data (we'll use projects as tasks for now)
  const timeBasedColumns: WidgetColumn[] = [
    { id: "active", title: "Active", icon: Clock, color: "green" },
    { id: "planned", title: "Planned", icon: Calendar, color: "blue" },
    { id: "completed", title: "Completed", icon: CheckSquare, color: "purple" },
    { id: "archived", title: "Archived", icon: Folder, color: "gray" },
  ];

  const timeBasedData: Record<string, WidgetItem[]> = React.useMemo(() => {
    const data: Record<string, WidgetItem[]> = {
      active: [],
      planned: [],
      completed: [],
      archived: [],
    };

    if (projects) {
      projects.forEach((project) => {
        const item: WidgetItem = {
          id: project._id,
          title: project.name,
          description: project.description || "",
          priority:
            project.progress > 75
              ? "high"
              : project.progress > 25
                ? "medium"
                : "low",
          project: project.name,
          timeEstimate: `${project.taskCount} tasks`,
          color: getProjectColor(project.name),
        };

        if (project.status === "active") {
          data.active.push(item);
        } else if (project.status === "completed") {
          data.completed.push(item);
        } else if (project.status === "archived") {
          data.archived.push(item);
        } else {
          data.planned.push(item);
        }
      });
    }

    return data;
  }, [projects]);

  // Project status data
  const projectStatusColumns: WidgetColumn[] = [
    { id: "draft", title: "Draft", icon: Folder, color: "gray" },
    { id: "planned", title: "Planned", icon: Calendar, color: "blue" },
    { id: "active", title: "Active", icon: Clock, color: "orange" },
    { id: "completed", title: "Completed", icon: CheckSquare, color: "green" },
  ];

  const projectStatusData: Record<string, WidgetItem[]> = React.useMemo(() => {
    const data: Record<string, WidgetItem[]> = {
      draft: [],
      planned: [],
      active: [],
      completed: [],
    };

    if (projects) {
      projects.forEach((project) => {
        const item: WidgetItem = {
          id: project._id,
          title: project.name,
          description:
            project.description ||
            `${project.taskCount} tasks, ${project.progress}% complete`,
          project: project.name,
          priority:
            project.progress > 75
              ? "high"
              : project.progress > 25
                ? "medium"
                : "low",
          timeEstimate: `${project.taskCount} tasks`,
          dueDate: new Date(project.updatedAt).toLocaleDateString(),
          color: project.color || getProjectColor(project.name),
        };

        const status = project.status || "draft";
        if (data[status]) {
          data[status].push(item);
        } else {
          data.draft.push(item);
        }
      });
    }

    return data;
  }, [projects]);

  // Transform real notes data
  const recentNotesData: NoteItem[] = React.useMemo(() => {
    if (!recentNotes) return [];

    return recentNotes.map((note) => ({
      id: note._id,
      title: note.title,
      content: note.content,
      type: note.tags?.includes("meeting")
        ? "meeting"
        : note.tags?.includes("code")
          ? "code"
          : note.tags?.includes("todo")
            ? "todo"
            : "text",
      project: "General",
      lastModified: new Date(note.updatedAt).toLocaleDateString(),
      tags: note.tags || [],
      color: "blue",
    }));
  }, [recentNotes]);

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

  // Show loading state while data is being fetched
  if (!projects || !recentNotes) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-hidden">
      <main className="h-full overflow-auto">
        <div className="p-6">
          {/* Top Bar */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold mb-1 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 bg-clip-text text-transparent">
                Good morning!
              </h2>
              <p
                className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
              >
                {projects?.length === 0
                  ? "Welcome! Click 'Add Sample Data' to get started with some example projects and notes."
                  : `You have ${projects?.length || 0} projects and ${recentNotes?.length || 0} recent notes.`}
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
              {(!projects || projects.length === 0) && (
                <button
                  onClick={handleCreateSampleData}
                  className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-lg shadow-green-500/30 hover:shadow-lg hover:shadow-green-500/40 transform hover:-translate-y-0.5 font-medium text-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Sample Data</span>
                </button>
              )}
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
              title="Project Status Overview"
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
              title="Project Management"
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
