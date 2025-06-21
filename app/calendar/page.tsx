"use client";

import React, { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  Users,
  Coffee,
  BookOpen,
  Target,
  GripVertical,
  Search,
} from "lucide-react";
import { useTheme } from "@/components/AppLayout";
import { GoogleCalendarSync } from "@/components/GoogleCalendarSync";

interface Task {
  id: string;
  title: string;
  description?: string;
  priority: "urgent" | "normal" | "low";
  color: "purple" | "blue" | "green" | "orange" | "pink" | "indigo";
  type: "meeting" | "task" | "break" | "focus" | "review";
  icon?: React.ComponentType<{ className?: string }>;
}

interface ScheduledEvent extends Task {
  startTime: string;
  endTime: string;
  day: number; // 0-4 for weekdays
}

// Unscheduled tasks in the sidebar
const unscheduledTasks: Task[] = [
  {
    id: "task-1",
    title: "Review design mockups",
    description: "Check the new dashboard designs",
    priority: "urgent",
    color: "purple",
    type: "review",
    icon: Target,
  },
  {
    id: "task-2",
    title: "Update documentation",
    description: "Add API examples and usage guides",
    priority: "normal",
    color: "blue",
    type: "task",
    icon: BookOpen,
  },
  {
    id: "task-3",
    title: "Client presentation prep",
    description: "Prepare slides for quarterly review",
    priority: "urgent",
    color: "green",
    type: "meeting",
    icon: Users,
  },
  {
    id: "task-4",
    title: "Code refactoring",
    description: "Clean up authentication module",
    priority: "normal",
    color: "indigo",
    type: "task",
    icon: Target,
  },
  {
    id: "task-5",
    title: "Team 1:1 planning",
    description: "Prepare talking points for team meetings",
    priority: "low",
    color: "pink",
    type: "meeting",
    icon: Users,
  },
  {
    id: "task-6",
    title: "Database optimization",
    description: "Improve query performance",
    priority: "normal",
    color: "orange",
    type: "task",
    icon: Target,
  },
];

// Already scheduled events
const scheduledEvents: ScheduledEvent[] = [
  // Monday (day 0)
  {
    id: "event-1",
    title: "Morning Planning",
    description: "Plan the week ahead and set priorities",
    startTime: "08:30",
    endTime: "09:30",
    day: 0,
    color: "purple",
    type: "meeting",
    icon: Target,
    priority: "normal",
  },
  {
    id: "event-2",
    title: "Client Call",
    description: "Weekly check-in with key client",
    startTime: "10:00",
    endTime: "11:00",
    day: 0,
    color: "blue",
    type: "meeting",
    icon: Users,
    priority: "urgent",
  },
  {
    id: "event-3",
    title: "Code Review",
    description: "Review pull requests from the team",
    startTime: "14:00",
    endTime: "15:30",
    day: 0,
    color: "green",
    type: "review",
    icon: Target,
    priority: "normal",
  },
  {
    id: "event-4",
    title: "Lunch Break",
    startTime: "12:00",
    endTime: "13:00",
    day: 0,
    color: "orange",
    type: "break",
    icon: Coffee,
    priority: "low",
  },

  // Tuesday (day 1)
  {
    id: "event-5",
    title: "Team Standup",
    description: "Daily team sync and updates",
    startTime: "09:30",
    endTime: "10:00",
    day: 1,
    color: "purple",
    type: "meeting",
    icon: Users,
    priority: "normal",
  },
  {
    id: "event-6",
    title: "Deep Work Session",
    description: "Focus time for complex development tasks",
    startTime: "10:30",
    endTime: "12:00",
    day: 1,
    color: "indigo",
    type: "focus",
    icon: BookOpen,
    priority: "urgent",
  },
  {
    id: "event-7",
    title: "Lunch Meeting",
    description: "Lunch with potential new hire",
    startTime: "12:00",
    endTime: "13:30",
    day: 1,
    color: "pink",
    type: "meeting",
    icon: Users,
    priority: "normal",
  },
  {
    id: "event-8",
    title: "Product Demo",
    description: "Demo latest features to stakeholders",
    startTime: "15:30",
    endTime: "16:30",
    day: 1,
    color: "blue",
    type: "meeting",
    icon: Target,
    priority: "urgent",
  },

  // Wednesday (day 2)
  {
    id: "event-9",
    title: "Focus Time",
    description: "Uninterrupted development time",
    startTime: "09:00",
    endTime: "11:00",
    day: 2,
    color: "indigo",
    type: "focus",
    icon: BookOpen,
    priority: "normal",
  },
  {
    id: "event-10",
    title: "Architecture Review",
    description: "Technical design discussion",
    startTime: "11:30",
    endTime: "12:30",
    day: 2,
    color: "green",
    type: "review",
    icon: Target,
    priority: "normal",
  },
  {
    id: "event-11",
    title: "Sprint Review",
    description: "Review completed work with team",
    startTime: "15:00",
    endTime: "16:00",
    day: 2,
    color: "blue",
    type: "review",
    icon: Target,
    priority: "normal",
  },
  {
    id: "event-12",
    title: "Coffee Chat",
    description: "Informal catch-up with mentor",
    startTime: "16:30",
    endTime: "17:00",
    day: 2,
    color: "orange",
    type: "break",
    icon: Coffee,
    priority: "low",
  },

  // Thursday (day 3)
  {
    id: "event-13",
    title: "Team Meeting",
    description: "Weekly team planning and retrospective",
    startTime: "08:00",
    endTime: "09:00",
    day: 3,
    color: "purple",
    type: "meeting",
    icon: Users,
    priority: "normal",
  },
  {
    id: "event-14",
    title: "Bug Fixes",
    description: "Address critical production issues",
    startTime: "10:00",
    endTime: "12:00",
    day: 3,
    color: "green",
    type: "task",
    icon: Target,
    priority: "urgent",
  },
  {
    id: "event-15",
    title: "Lunch & Learn",
    description: "Tech talk on new frameworks",
    startTime: "12:30",
    endTime: "13:30",
    day: 3,
    color: "pink",
    type: "meeting",
    icon: BookOpen,
    priority: "low",
  },
  {
    id: "event-16",
    title: "1:1 with Manager",
    description: "Weekly one-on-one check-in",
    startTime: "14:00",
    endTime: "14:30",
    day: 3,
    color: "blue",
    type: "meeting",
    icon: Users,
    priority: "normal",
  },
  {
    id: "event-17",
    title: "Documentation",
    description: "Update project documentation",
    startTime: "15:00",
    endTime: "17:00",
    day: 3,
    color: "indigo",
    type: "task",
    icon: BookOpen,
    priority: "normal",
  },

  // Friday (day 4)
  {
    id: "event-18",
    title: "Code Deploy",
    description: "Deploy weekly release to production",
    startTime: "08:30",
    endTime: "09:30",
    day: 4,
    color: "green",
    type: "task",
    icon: Target,
    priority: "urgent",
  },
  {
    id: "event-19",
    title: "All Hands Meeting",
    description: "Company-wide monthly update",
    startTime: "10:00",
    endTime: "11:00",
    day: 4,
    color: "purple",
    type: "meeting",
    icon: Users,
    priority: "normal",
  },
  {
    id: "event-20",
    title: "Team Retrospective",
    description: "Weekly team reflection and planning",
    startTime: "13:00",
    endTime: "14:00",
    day: 4,
    color: "blue",
    type: "review",
    icon: Target,
    priority: "normal",
  },
  {
    id: "event-21",
    title: "Friday Social",
    description: "Team bonding and casual conversations",
    startTime: "17:00",
    endTime: "18:00",
    day: 4,
    color: "pink",
    type: "break",
    icon: Coffee,
    priority: "low",
  },
];

const timeSlots = [
  "00:00",
  "01:00",
  "02:00",
  "03:00",
  "04:00",
  "05:00",
  "06:00",
  "07:00",
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
  "20:00",
  "21:00",
  "22:00",
  "23:00",
];

const weekDays = [
  { name: "Monday", short: "Mon", date: 15 },
  { name: "Tuesday", short: "Tue", date: 16 },
  { name: "Wednesday", short: "Wed", date: 17 },
  { name: "Thursday", short: "Thu", date: 18 },
  { name: "Friday", short: "Fri", date: 19 },
];

export default function CalendarPage() {
  const { isDarkMode } = useTheme();
  const [selectedView, setSelectedView] = useState<"week" | "day" | "month">(
    "week",
  );
  const [currentWeek] = useState("March 15-19, 2024");
  const [selectedFilter] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const themeClasses = {
    sidebar: isDarkMode
      ? "bg-gray-900/80 backdrop-blur-xl border-r border-gray-700/60 shadow-2xl shadow-black/30"
      : "bg-white/80 backdrop-blur-xl border-r border-purple-200/30 shadow-2xl shadow-purple-900/10",
    text: {
      primary: isDarkMode ? "text-gray-100" : "text-gray-900",
      secondary: isDarkMode ? "text-gray-300" : "text-gray-700",
      tertiary: isDarkMode ? "text-gray-400" : "text-gray-600",
    },
    timeSlot: isDarkMode
      ? "border-gray-700/50 text-gray-400 bg-gray-900/20"
      : "border-gray-200/50 text-gray-600 bg-gray-50/30",
    dayHeader: isDarkMode
      ? "bg-gray-800/50 border-gray-700/50"
      : "bg-gray-50/80 border-gray-200/50",
    calendarGrid: isDarkMode ? "bg-gray-900/10" : "bg-white/20",
    search: isDarkMode
      ? "bg-gray-800/70 border-gray-700/60 text-gray-100 placeholder-gray-400 focus:border-purple-500/50 focus:bg-gray-800/90"
      : "bg-white/80 border-purple-200/60 text-gray-800 placeholder-gray-500 focus:border-purple-400/50 focus:bg-white/95",
  };

  const getTaskColor = (color: string, isDark: boolean) => {
    const colors = {
      purple: isDark
        ? "bg-gradient-to-br from-purple-500/20 to-purple-600/15 text-purple-300 border-purple-400/40 shadow-lg shadow-purple-900/30"
        : "bg-gradient-to-br from-purple-50/95 to-purple-100/80 text-purple-800 border-purple-200/70 shadow-lg shadow-purple-200/40",
      blue: isDark
        ? "bg-gradient-to-br from-blue-500/20 to-blue-600/15 text-blue-300 border-blue-400/40 shadow-lg shadow-blue-900/30"
        : "bg-gradient-to-br from-blue-50/95 to-blue-100/80 text-blue-800 border-blue-200/70 shadow-lg shadow-blue-200/40",
      green: isDark
        ? "bg-gradient-to-br from-green-500/20 to-green-600/15 text-green-300 border-green-400/40 shadow-lg shadow-green-900/30"
        : "bg-gradient-to-br from-green-50/95 to-green-100/80 text-green-800 border-green-200/70 shadow-lg shadow-green-200/40",
      orange: isDark
        ? "bg-gradient-to-br from-orange-500/20 to-orange-600/15 text-orange-300 border-orange-400/40 shadow-lg shadow-orange-900/30"
        : "bg-gradient-to-br from-orange-50/95 to-orange-100/80 text-orange-800 border-orange-200/70 shadow-lg shadow-orange-200/40",
      pink: isDark
        ? "bg-gradient-to-br from-pink-500/20 to-pink-600/15 text-pink-300 border-pink-400/40 shadow-lg shadow-pink-900/30"
        : "bg-gradient-to-br from-pink-50/95 to-pink-100/80 text-pink-800 border-pink-200/70 shadow-lg shadow-pink-200/40",
      indigo: isDark
        ? "bg-gradient-to-br from-indigo-500/20 to-indigo-600/15 text-indigo-300 border-indigo-400/40 shadow-lg shadow-indigo-900/30"
        : "bg-gradient-to-br from-indigo-50/95 to-indigo-100/80 text-indigo-800 border-indigo-200/70 shadow-lg shadow-indigo-200/40",
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const getPriorityColor = (priority: string, isDark: boolean) => {
    switch (priority) {
      case "urgent":
        return isDark
          ? "bg-red-500/25 text-red-300 border-red-400/50 shadow-sm shadow-red-900/20"
          : "bg-red-100/80 text-red-700 border-red-300/70 shadow-sm shadow-red-200/30";
      case "normal":
        return isDark
          ? "bg-blue-500/25 text-blue-300 border-blue-400/50 shadow-sm shadow-blue-900/20"
          : "bg-blue-100/80 text-blue-700 border-blue-300/70 shadow-sm shadow-blue-200/30";
      case "low":
        return isDark
          ? "bg-green-500/25 text-green-300 border-green-400/50 shadow-sm shadow-green-900/20"
          : "bg-green-100/80 text-green-700 border-green-300/70 shadow-sm shadow-green-200/30";
      default:
        return isDark
          ? "bg-gray-500/25 text-gray-300 border-gray-400/50 shadow-sm shadow-gray-900/20"
          : "bg-gray-100/80 text-gray-700 border-gray-300/70 shadow-sm shadow-gray-200/30";
    }
  };

  const TaskCard = ({
    task,
    draggable = true,
  }: {
    task: Task;
    draggable?: boolean;
  }) => {
    const Icon = task.icon || Clock;

    return (
      <div
        className={`p-2.5 rounded-lg border backdrop-blur-md transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer group ${getTaskColor(task.color, isDarkMode)} ${
          draggable ? "cursor-grab hover:cursor-grabbing transform-gpu" : ""
        }`}
        draggable={draggable}
        onDragStart={(e) => {
          if (draggable) {
            e.dataTransfer.setData("text/plain", JSON.stringify(task));
          }
        }}
      >
        <div className="flex items-start space-x-2 mb-2">
          {draggable && (
            <GripVertical className="w-3 h-3 mt-0.5 opacity-40 group-hover:opacity-70 transition-opacity flex-shrink-0" />
          )}
          <Icon className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 opacity-80" />
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-semibold leading-tight truncate">
              {task.title}
            </h4>
            {task.description && (
              <p className="text-xs opacity-60 leading-tight mt-0.5 line-clamp-1">
                {task.description}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span
            className={`text-xs px-2 py-0.5 rounded font-medium backdrop-blur-sm border ${getPriorityColor(task.priority, isDarkMode)}`}
          >
            {task.priority}
          </span>
          <div
            className={`w-2.5 h-2.5 rounded-full shadow-sm ${
              task.color === "purple"
                ? "bg-purple-500"
                : task.color === "blue"
                  ? "bg-blue-500"
                  : task.color === "green"
                    ? "bg-green-500"
                    : task.color === "orange"
                      ? "bg-orange-500"
                      : task.color === "pink"
                        ? "bg-pink-500"
                        : "bg-indigo-500"
            }`}
          />
        </div>
      </div>
    );
  };

  const ScheduledEventCard = ({ event }: { event: ScheduledEvent }) => {
    const Icon = event.icon || Clock;
    const eventHeight = getEventHeight(event.startTime, event.endTime);

    // Define size thresholds based on height
    const isVeryShort = eventHeight < 50; // Only title (< 25 minutes)
    const isShort = eventHeight < 80; // Title + basic info (< 40 minutes)
    const isMedium = eventHeight < 140; // Title + time + priority (< 70 minutes)

    // Get color value for the event
    const getColorValue = (color: string) => {
      const colorMap = {
        purple: "#8b5cf6",
        blue: "#3b82f6",
        green: "#10b981",
        orange: "#f59e0b",
        pink: "#ec4899",
        indigo: "#6366f1",
      };
      return colorMap[color as keyof typeof colorMap] || colorMap.blue;
    };

    return (
      <div
        className={`absolute rounded-lg cursor-pointer backdrop-blur-md border transition-all duration-200 hover:shadow-lg group flex flex-col overflow-hidden ${
          isDarkMode
            ? "bg-gray-800/90 border-gray-700/50 hover:bg-gray-700/60 hover:border-gray-600/60 shadow-black/20"
            : "bg-white/95 border-gray-200/60 hover:bg-white hover:border-gray-300/60 shadow-gray-900/10"
        }`}
        style={{
          top: `${getTimePosition(event.startTime)}px`,
          height: `${Math.max(eventHeight - 2, 30)}px`, // Account for borders, minimum 30px
          left: "4px",
          right: "4px",
          zIndex: 10,
          maxWidth: "calc(100% - 8px)", // Ensure it fits within grid cell
        }}
      >
        {isVeryShort ? (
          // Very short events: Only title with color dot
          <div className="p-1.5 flex items-center w-full overflow-hidden">
            <div
              className="w-2 h-2 rounded-full flex-shrink-0 mr-1.5"
              style={{ backgroundColor: getColorValue(event.color) }}
            />
            <span
              className={`text-xs font-semibold truncate flex-1 ${themeClasses.text.primary}`}
            >
              {event.title}
            </span>
          </div>
        ) : isShort ? (
          // Short events: Title + time with minimal padding
          <div className="p-2 flex flex-col justify-center h-full overflow-hidden">
            <div className="flex items-start justify-between mb-1 min-h-0">
              <h4
                className={`font-semibold text-xs leading-tight truncate flex-1 pr-1 ${themeClasses.text.primary}`}
              >
                {event.title}
              </h4>
              <div
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: getColorValue(event.color) }}
              />
            </div>
            <div className="flex items-center space-x-1 min-h-0 overflow-hidden">
              <Icon className="w-2.5 h-2.5 flex-shrink-0 opacity-75" />
              <span
                className={`text-xs font-medium truncate ${themeClasses.text.secondary}`}
              >
                {event.startTime}-{event.endTime}
              </span>
            </div>
          </div>
        ) : isMedium ? (
          // Medium events: Title + time + priority/type
          <div className="p-2.5 flex flex-col h-full overflow-hidden">
            <div className="flex items-start justify-between mb-1.5 flex-shrink-0 min-h-0">
              <h4
                className={`font-semibold text-xs leading-tight truncate flex-1 pr-1 ${themeClasses.text.primary}`}
              >
                {event.title}
              </h4>
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: getColorValue(event.color) }}
              />
            </div>

            <div className="flex items-center space-x-1.5 mb-1.5 flex-shrink-0 min-h-0 overflow-hidden">
              <Icon className="w-3 h-3 flex-shrink-0 opacity-75" />
              <span
                className={`text-xs font-medium truncate ${themeClasses.text.secondary}`}
              >
                {event.startTime} - {event.endTime}
              </span>
            </div>

            <div className="flex items-center justify-between mt-auto flex-shrink-0 min-h-0 overflow-hidden">
              <span
                className={`text-xs px-1.5 py-0.5 rounded font-medium backdrop-blur-sm border truncate max-w-[60%] ${getPriorityColor(event.priority, isDarkMode)}`}
              >
                {event.priority}
              </span>
              <span
                className={`text-xs opacity-60 truncate ml-1 max-w-[35%] ${themeClasses.text.tertiary}`}
              >
                {event.type}
              </span>
            </div>
          </div>
        ) : (
          // Large events: Full content with scrolling
          <div className="p-3 flex flex-col h-full overflow-hidden">
            {/* Header - fixed */}
            <div className="flex items-start justify-between mb-2 flex-shrink-0 min-h-0">
              <h4
                className={`font-semibold text-xs leading-tight flex-1 pr-2 ${themeClasses.text.primary}`}
              >
                {event.title}
              </h4>
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: getColorValue(event.color) }}
              />
            </div>

            {/* Scrollable Content - flexible */}
            <div className="flex-1 overflow-y-auto min-h-0 overflow-x-hidden">
              <div className="flex items-center space-x-2 mb-2">
                <Icon className="w-3 h-3 flex-shrink-0 opacity-75" />
                <span
                  className={`text-xs font-medium break-words ${themeClasses.text.secondary}`}
                >
                  {event.startTime} - {event.endTime}
                </span>
              </div>

              {event.description && (
                <div className="mb-2">
                  <p
                    className={`text-xs leading-relaxed break-words ${themeClasses.text.tertiary}`}
                  >
                    {event.description}
                  </p>
                </div>
              )}
            </div>

            {/* Footer - fixed */}
            <div className="flex items-center justify-between flex-shrink-0 mt-2 min-h-0 overflow-hidden">
              <span
                className={`text-xs px-2 py-0.5 rounded-md font-medium backdrop-blur-sm border truncate max-w-[60%] ${getPriorityColor(event.priority, isDarkMode)}`}
              >
                {event.priority}
              </span>
              <span
                className={`text-xs opacity-60 truncate max-w-[35%] ${themeClasses.text.tertiary}`}
              >
                {event.type}
              </span>
            </div>
          </div>
        )}
      </div>
    );
  };

  const getTimePosition = (time: string) => {
    const [hour, minute] = time.split(":").map(Number);
    const startHour = 0; // Start from midnight
    return ((hour - startHour) * 60 + minute) * (120 / 60); // 120px per hour
  };

  const getEventHeight = (startTime: string, endTime: string) => {
    const [startHour, startMinute] = startTime.split(":").map(Number);
    const [endHour, endMinute] = endTime.split(":").map(Number);
    const durationMinutes =
      endHour * 60 + endMinute - (startHour * 60 + startMinute);
    // Scale to match the 120px row height, minimum 30px for 15-min events
    return Math.max((durationMinutes * 120) / 60, 30);
  };

  const handleDrop = (e: React.DragEvent, day: number, timeSlot: string) => {
    e.preventDefault();
    const taskData = e.dataTransfer.getData("text/plain");
    if (taskData) {
      const task = JSON.parse(taskData);
      console.log(
        `Dropped task "${task.title}" on ${weekDays[day].name} at ${timeSlot}`,
      );
      // Here you would handle adding the task to the calendar with the specified date/time
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const filteredTasks = unscheduledTasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ??
        false);
    const matchesFilter = selectedFilter ? task.type === selectedFilter : true;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="flex h-full overflow-hidden">
      {/* Tasks Sidebar */}
      <div className={`w-80 ${themeClasses.sidebar} flex flex-col`}>
        <div className="p-4 border-b border-gray-200/20">
          <h2 className={`text-base font-bold ${themeClasses.text.primary}`}>
            Unscheduled Tasks
          </h2>
          <p className={`text-xs ${themeClasses.text.tertiary} mt-1`}>
            Drag tasks to calendar to schedule
          </p>
        </div>

        {/* Search Bar and New Task Button */}
        <div className="p-3 border-b border-gray-200/20">
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search
                className={`absolute left-2.5 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 z-10 ${themeClasses.text.tertiary}`}
              />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-9 pr-3 py-2 rounded-lg border backdrop-blur-md transition-all duration-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/30 ${themeClasses.search}`}
              />
            </div>
            <button className="flex items-center justify-center px-3 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 shadow-md shadow-purple-500/30 hover:shadow-lg hover:shadow-purple-500/40 transform hover:-translate-y-0.5 font-medium backdrop-blur-sm">
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Tasks List */}
        <div className="flex-1 overflow-y-auto p-3">
          <div className="space-y-2">
            {filteredTasks.map((task) => (
              <TaskCard key={task.id} task={task} draggable={true} />
            ))}
          </div>

          {filteredTasks.length === 0 && (
            <div className={`text-center py-8 ${themeClasses.text.tertiary}`}>
              <Clock className="w-6 h-6 mx-auto mb-2 opacity-40" />
              <p className="text-xs font-medium">No tasks found</p>
              <p className="text-xs opacity-70 mt-1">
                Try adjusting your search or filters
              </p>
            </div>
          )}
        </div>

        <GoogleCalendarSync />
      </div>

      {/* Main Calendar Area */}
      <main className="flex-1 overflow-hidden">
        <div className="h-full flex flex-col">
          {/* Calendar Header with Controls */}
          <div
            className={`p-3 border-b ${
              isDarkMode
                ? "border-gray-700/40 bg-gray-900/30"
                : "border-gray-200/40 bg-white/30"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <h1
                  className={`text-lg font-bold ${themeClasses.text.primary}`}
                >
                  {currentWeek}
                </h1>
                <div className="flex items-center space-x-1">
                  <button
                    className={`p-1.5 rounded-lg transition-all duration-200 ${
                      isDarkMode
                        ? "hover:bg-gray-700/50"
                        : "hover:bg-gray-100/60"
                    }`}
                  >
                    <ChevronLeft
                      className={`w-4 h-4 ${themeClasses.text.secondary}`}
                    />
                  </button>
                  <button
                    className={`p-1.5 rounded-lg transition-all duration-200 ${
                      isDarkMode
                        ? "hover:bg-gray-700/50"
                        : "hover:bg-gray-100/60"
                    }`}
                  >
                    <ChevronRight
                      className={`w-4 h-4 ${themeClasses.text.secondary}`}
                    />
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {/* View Controls - All in one line */}
                {[
                  { value: "week", label: "Week" },
                  { value: "day", label: "Day" },
                  { value: "month", label: "Month" },
                ].map((view) => (
                  <button
                    key={view.value}
                    onClick={() =>
                      setSelectedView(view.value as "week" | "day" | "month")
                    }
                    className={`px-3 py-1.5 rounded-lg transition-all duration-200 text-xs font-medium ${
                      selectedView === view.value
                        ? isDarkMode
                          ? "bg-purple-600/70 text-purple-200"
                          : "bg-purple-600 text-white"
                        : isDarkMode
                          ? "text-gray-400 hover:bg-gray-700/50 hover:text-gray-300"
                          : "text-gray-600 hover:bg-gray-100/60 hover:text-gray-800"
                    }`}
                  >
                    {view.label}
                  </button>
                ))}

                <button
                  className={`px-3 py-1.5 rounded-lg transition-all duration-200 text-xs font-medium ${
                    isDarkMode
                      ? "bg-gray-700/60 text-gray-300 hover:bg-gray-700/80"
                      : "bg-gray-100/80 text-gray-700 hover:bg-gray-100/95"
                  }`}
                >
                  Today
                </button>
              </div>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className={`flex-1 overflow-auto ${themeClasses.calendarGrid}`}>
            <div className="min-h-full">
              {/* Day Headers */}
              <div
                className="grid grid-cols-6 border-b border-dashed"
                style={{ gridTemplateColumns: "80px repeat(5, 1fr)" }}
              >
                <div
                  className={`p-2 border-r border-dashed ${themeClasses.dayHeader} ${
                    isDarkMode ? "border-gray-700/60" : "border-gray-300/60"
                  }`}
                ></div>
                {weekDays.map((day) => (
                  <div
                    key={day.name}
                    className={`p-2 text-center border-r border-dashed ${themeClasses.dayHeader} ${
                      isDarkMode ? "border-gray-700/60" : "border-gray-300/60"
                    }`}
                  >
                    <div
                      className={`text-xs font-medium ${themeClasses.text.secondary} uppercase tracking-wide`}
                    >
                      {day.short}
                    </div>
                    <div
                      className={`text-lg font-bold ${themeClasses.text.primary} mt-0.5`}
                    >
                      {day.date}
                    </div>
                  </div>
                ))}
              </div>

              {/* Time Grid */}
              <div className="relative">
                {timeSlots.map((time, index) => (
                  <div
                    key={time}
                    className={`grid grid-cols-6 border-b border-dashed transition-colors duration-200 ${
                      isDarkMode
                        ? "border-gray-700/50 hover:bg-gray-800/10"
                        : "border-gray-300/50 hover:bg-gray-50/20"
                    }`}
                    style={{
                      gridTemplateColumns: "80px repeat(5, 1fr)",
                      height: "120px",
                    }}
                  >
                    <div
                      className={`p-2 border-r border-dashed text-center ${themeClasses.timeSlot} ${
                        isDarkMode ? "border-gray-700/60" : "border-gray-300/60"
                      }`}
                    >
                      <span className="text-xs font-medium">{time}</span>
                    </div>
                    {weekDays.map((day, dayIndex) => (
                      <div
                        key={`${time}-${day.name}`}
                        className={`relative border-r border-dashed transition-all duration-200 group ${
                          isDarkMode
                            ? "border-gray-700/60 hover:bg-gray-800/5"
                            : "border-gray-300/60 hover:bg-gray-50/10"
                        }`}
                        onDrop={(e) => handleDrop(e, dayIndex, time)}
                        onDragOver={handleDragOver}
                      >
                        {/* Drop zone indicator */}
                        <div
                          className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded m-0.5 border border-dashed ${
                            isDarkMode
                              ? "border-purple-500/40"
                              : "border-purple-400/50"
                          }`}
                        ></div>

                        {/* Scheduled events for this day - render all in first time slot */}
                        {index === 0 &&
                          scheduledEvents
                            .filter((event) => event.day === dayIndex)
                            .map((event) => (
                              <ScheduledEventCard
                                key={event.id}
                                event={event}
                              />
                            ))}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
