"use client";

import React, { useState, useCallback, useMemo } from "react";
import {
  Plus,
  Bell,
  Calendar,
  Clock,
  Folder,
  CheckSquare,
  FileText,
  Loader2,
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
import { DragEndEvent } from "@dnd-kit/core";
import TaskModal from "../components/TaskModal";
import { Id } from "@/convex/_generated/dataModel";

// Components
import AppLayout from "../components/AppLayout";
import ProjectKanbanBoard from "../components/ProjectKanbanBoard";
import QuickTasks from "../components/QuickTasks";
import { api as sampleDataApi } from "../convex/_generated/api";

function AuthenticatedContent() {
  const { isDarkMode } = useTheme();
  const { signOut } = useAuthActions();
  const currentDate = new Date();

  // Fetch real data from Convex
  const projects = useQuery(api.projects.getProjects, {});

  // Get boards and columns for task creation
  const boards = useQuery(api.tasks.getBoards);
  const defaultBoard = boards?.[0]; // Use first board for quick task creation
  const columns = useQuery(
    api.tasks.getColumns,
    defaultBoard ? { boardId: defaultBoard._id } : "skip",
  );

  // Calculate the date range for the current week
  const weekStartDate = React.useMemo(() => {
    const today = new Date();
    const monday = new Date(today);
    monday.setDate(today.getDate() - today.getDay() + 1);
    monday.setHours(0, 0, 0, 0);
    return monday;
  }, []);

  const weekEndDate = React.useMemo(() => {
    const sunday = new Date(weekStartDate);
    sunday.setDate(weekStartDate.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);
    return sunday;
  }, [weekStartDate]);

  // Fetch events for the specific week being displayed
  const weekEvents = useQuery(api.calendar.getEvents, {
    startDate: weekStartDate.getTime(),
    endDate: weekEndDate.getTime(),
  });

  // Mutation for creating sample data
  const createSampleData = useMutation(api.sampleData.createSampleData);
  const fixBrokenEvents = useMutation(api.calendar.fixBrokenEvents);

  // Mutations for drag and drop updates
  const updateEvent = useMutation(api.calendar.updateEvent);

  // Task modal state
  const [taskModalState, setTaskModalState] = React.useState<{
    isOpen: boolean;
    mode: "create" | "edit";
    columnId?: string; // For dashboard, we'll use string IDs
    taskId?: Id<"tasks">;
  }>({
    isOpen: false,
    mode: "create",
  });

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

  const handleFixEvents = async () => {
    try {
      await fixBrokenEvents({});
      alert("Events fixed successfully! Refresh the page to see the calendar.");
    } catch (error) {
      alert("Error fixing events: " + error);
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

    if (weekEvents && weekEvents.length > 0) {
      weekEvents.forEach((event) => {
        // Validate event data before processing
        if (
          !event.startDate ||
          !event.endDate ||
          isNaN(event.startDate) ||
          isNaN(event.endDate)
        ) {
          console.warn("Skipping event with invalid dates:", event);
          return;
        }

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
  }, [weekEvents, dates, weekDays]);

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

  const handleAddCalendarEvent = (columnId: string) => {
    console.log("Add calendar event to column:", columnId);
  };

  const handleAddTask = (columnId: string) => {
    // Map dashboard column IDs to actual board column IDs
    const columnMapping: Record<string, Id<"columns"> | null> = {
      active:
        columns?.find((c) => c.name.toLowerCase().includes("progress"))?._id ||
        columns?.[1]?._id ||
        null,
      planned: columns?.[0]?._id || null, // First column (usually "To Do")
      completed:
        columns?.find((c) => c.name.toLowerCase().includes("done"))?._id ||
        columns?.[2]?._id ||
        null,
      archived: columns?.[2]?._id || null, // Last column as fallback
    };

    const actualColumnId = columnMapping[columnId];
    if (actualColumnId) {
      setTaskModalState({
        isOpen: true,
        mode: "create",
        columnId: actualColumnId,
      });
    } else {
      alert("Please create a board first by going to the Boards page!");
    }
  };

  const handleAddProject = (columnId: string) => {
    console.log("Add project to column:", columnId);
  };

  const handleFilter = () => {
    console.log("Filter clicked");
  };

  // Task modal control functions
  const closeTaskModal = () => {
    setTaskModalState({
      isOpen: false,
      mode: "create",
    });
  };

  const handleProjectDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const projectId = active.id as string;
    const newStatus = over.id as string;
    const projectItem = active.data.current?.item;

    console.log("Project drag ended:", {
      projectId,
      newStatus,
      projectItem,
    });

    try {
      // Update project status in the backend
      await updateEvent({
        eventId: projectId as any, // Type casting needed for Convex ID
        startDate: new Date(newStatus).getTime(),
        endDate: new Date(newStatus).getTime(),
      });

      console.log(
        `Successfully updated project ${projectId} to status: ${newStatus}`,
      );
    } catch (error) {
      console.error("Failed to update project status:", error);
      // You could show a toast notification here
    }
  };

  const handleTaskDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const projectId = active.id as string;
    const newStatus = over.id as string;
    const projectItem = active.data.current?.item;

    console.log("Task drag ended:", {
      projectId,
      newStatus,
      projectItem,
    });

    try {
      // Update project status in the backend
      await updateEvent({
        eventId: projectId as any, // Type casting needed for Convex ID
        startDate: new Date(newStatus).getTime(),
        endDate: new Date(newStatus).getTime(),
      });

      console.log(
        `Successfully updated project ${projectId} to status: ${newStatus}`,
      );
    } catch (error) {
      console.error("Failed to update project status:", error);
      // You could show a toast notification here
    }
  };

  const handleCalendarDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const eventId = active.id as string;
    const newDayColumnId = parseInt(over.id as string);
    const eventItem = active.data.current?.item;

    // Calculate the new date based on the day column
    const targetDate = dates[newDayColumnId];
    if (!targetDate) return;

    console.log("Calendar event drag ended:", {
      eventId,
      newDayColumnId,
      targetDate: targetDate.toDateString(),
      eventItem,
    });

    try {
      // Find the original event in our data to get the exact timestamps
      const originalEvent = weekEvents?.find((e) => e._id === eventId);
      if (!originalEvent) {
        console.error("Original event not found for ID:", eventId);
        console.log(
          "Available events:",
          weekEvents?.map((e) => ({ id: e._id, title: e.title })),
        );
        return;
      }

      // Validate the original event has valid dates
      if (
        !originalEvent.startDate ||
        !originalEvent.endDate ||
        isNaN(originalEvent.startDate) ||
        isNaN(originalEvent.endDate)
      ) {
        console.error("Original event has invalid dates:", originalEvent);
        return;
      }

      // Get the original start time (hour and minute) from the original event
      const originalStartDate = new Date(originalEvent.startDate);
      const originalEndDate = new Date(originalEvent.endDate);
      const originalDurationMs =
        originalEndDate.getTime() - originalStartDate.getTime();

      // Create new start date with the same time but on the target date
      const newStartDate = new Date(targetDate);
      newStartDate.setHours(
        originalStartDate.getHours(),
        originalStartDate.getMinutes(),
        originalStartDate.getSeconds(),
        originalStartDate.getMilliseconds(),
      );

      // Calculate new end date by adding the original duration
      const newEndDate = new Date(newStartDate.getTime() + originalDurationMs);

      // Validate the new dates are reasonable
      if (newStartDate.getTime() >= newEndDate.getTime()) {
        console.error("Invalid date calculation - start >= end");
        return;
      }

      console.log("Date calculation:", {
        originalStart: originalStartDate.toISOString(),
        originalEnd: originalEndDate.toISOString(),
        newStart: newStartDate.toISOString(),
        newEnd: newEndDate.toISOString(),
        duration: originalDurationMs,
      });

      // Update event date in the backend
      await updateEvent({
        eventId: eventId as any, // Type casting needed for Convex ID
        startDate: newStartDate.getTime(),
        endDate: newEndDate.getTime(),
      });

      console.log(
        `Successfully moved event ${eventId} (${originalEvent.title}) to ${targetDate.toDateString()}`,
      );
    } catch (error) {
      console.error("Failed to update event date:", error);
      // Optionally show user feedback here
      alert("Failed to move event. Please try again.");
    }
  };

  // Show loading state while data is being fetched
  if (!projects || weekEvents === undefined) {
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
                  ? "Welcome! Click 'Add Sample Data' to get started with some example projects."
                  : `You have ${projects?.length || 0} projects.`}
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
              <button
                onClick={handleFixEvents}
                className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg shadow-blue-500/30 hover:shadow-lg hover:shadow-blue-500/40 transform hover:-translate-y-0.5 font-medium text-sm"
              >
                <Calendar className="w-4 h-4" />
                <span>Fix Calendar</span>
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
              enableDragDrop={true}
              onDragEnd={handleCalendarDragEnd}
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

            {/* Quick Tasks */}
            <QuickTasks isDarkMode={isDarkMode} />

            {/* Project Kanban Board */}
            {projects && projects.length > 0 && (
              <ProjectKanbanBoard
                project={{
                  _id: projects[0]._id,
                  name: projects[0].name,
                  description: projects[0].description || "No description",
                  color: projects[0].color || "#6366f1",
                  taskCount: 12, // Mock data for now
                  completedCount: 8, // Mock data for now
                  dueDate: new Date(
                    Date.now() + 7 * 24 * 60 * 60 * 1000,
                  ).toISOString(), // 1 week from now
                  status: "in-progress" as const,
                  priority: "medium" as const,
                }}
                isDarkMode={isDarkMode}
              />
            )}
          </div>
        </div>
      </main>

      {/* Task Modal */}
      <TaskModal
        isOpen={taskModalState.isOpen}
        onClose={closeTaskModal}
        columnId={taskModalState.columnId as Id<"columns">}
        taskId={taskModalState.taskId}
        mode={taskModalState.mode}
      />
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
