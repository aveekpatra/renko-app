"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  Users,
  MapPin,
  CheckSquare,
  GripVertical,
  Search,
  Calendar as CalendarIcon,
} from "lucide-react";
import { useTheme } from "./AppLayout";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

interface Task {
  id: string;
  title: string;
  description?: string;
  priority: "urgent" | "high" | "normal" | "low";
  projectColor?: string;
  projectName?: string;
  taskId?: Id<"tasks">;
}

interface ScheduledEvent {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  day: number; // 0-4 for weekdays
  priority?: "urgent" | "high" | "normal" | "low";
  color: string;
  type: "app" | "google" | "task";
  location?: string;
  attendees?: string[];
  taskId?: Id<"tasks">;
  eventId?: Id<"events">;
  googleEventId?: string;
}

interface CalendarProps {
  className?: string;
}

const getIconForEventType = (type: string) => {
  switch (type) {
    case "google":
      return CalendarIcon;
    case "task":
      return CheckSquare;
    default:
      return Clock;
  }
};

const getColorFromProjectColor = (color?: string): string => {
  if (!color) return "blue";

  // Map hex colors to our color names
  const colorMap: { [key: string]: string } = {
    "#8b5cf6": "purple",
    "#3b82f6": "blue",
    "#10b981": "green",
    "#f59e0b": "orange",
    "#ec4899": "pink",
    "#6366f1": "indigo",
    "#ef4444": "red",
    "#f97316": "orange",
    "#14b8a6": "teal",
  };

  return colorMap[color.toLowerCase()] || "blue";
};

const getPriorityFromTask = (
  priority?: string,
): "urgent" | "high" | "normal" | "low" => {
  switch (priority?.toLowerCase()) {
    case "critical":
    case "urgent":
      return "urgent";
    case "high":
      return "high";
    case "normal":
    case "medium":
      return "normal";
    case "low":
      return "low";
    default:
      return "normal";
  }
};

// Time slots remain the same
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

const fullWeekDays = [
  { name: "Monday", short: "Mon", abbr: "M" },
  { name: "Tuesday", short: "Tue", abbr: "T" },
  { name: "Wednesday", short: "Wed", abbr: "W" },
  { name: "Thursday", short: "Thu", abbr: "T" },
  { name: "Friday", short: "Fri", abbr: "F" },
  { name: "Saturday", short: "Sat", abbr: "S" },
  { name: "Sunday", short: "Sun", abbr: "S" },
];

export default function Calendar({ className = "" }: CalendarProps) {
  const { isDarkMode } = useTheme();
  const [selectedView, setSelectedView] = useState<"week" | "day" | "month">(
    "week",
  );
  const [currentWeek] = useState(() => {
    const now = new Date();
    const start = new Date(now);
    start.setDate(now.getDate() - now.getDay() + 1); // Monday
    const end = new Date(start);
    end.setDate(start.getDate() + 4); // Friday

    return `${start.toLocaleDateString("en-US", { month: "long", day: "numeric" })} - ${end.toLocaleDateString("en-US", { day: "numeric", year: "numeric" })}`;
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());
  const calendarScrollRef = useRef<HTMLDivElement>(null);
  const [currentWeekStart] = useState(() => {
    const now = new Date();
    const start = new Date(now);
    start.setDate(now.getDate() - now.getDay() + 1); // Monday
    start.setHours(0, 0, 0, 0);
    return start;
  });

  // Fetch unscheduled tasks
  const unscheduledTasksData = useQuery(api.tasks.getUnscheduledTasks);

  // Calculate date range for fetching events
  const startDate = currentWeekStart.getTime();
  const endDate =
    new Date(currentWeekStart).setDate(currentWeekStart.getDate() + 6) +
    24 * 60 * 60 * 1000;

  // Fetch calendar events
  const eventsData = useQuery(api.calendar.getAllCalendarEvents, {
    startDate,
    endDate,
  });

  // Mutations
  const scheduleTask = useMutation(api.calendar.scheduleTask);

  // Convert unscheduled tasks to our format
  const unscheduledTasks: Task[] =
    unscheduledTasksData?.map((task) => ({
      id: task._id,
      title: task.title,
      description: task.description,
      priority: getPriorityFromTask(task.priority),
      projectColor: task.projectColor,
      projectName: task.projectName,
      taskId: task._id,
    })) || [];

  // Convert events to our calendar format
  const events: ScheduledEvent[] = [];

  if (eventsData) {
    // Add app events
    eventsData.appEvents.forEach((event) => {
      const eventDate = new Date(event.startDate);
      const dayOfWeek = eventDate.getDay();
      const adjustedDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Convert Sunday=0 to 6, Monday=1 to 0

      if (adjustedDay >= 0 && adjustedDay <= 4) {
        // Only weekdays for week view
        events.push({
          id: event._id,
          title: event.title,
          description: event.description,
          startTime: eventDate.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }),
          endTime: new Date(event.endDate).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }),
          day: adjustedDay,
          priority: event.task?.priority
            ? getPriorityFromTask(event.task.priority)
            : "normal",
          color: event.project?.color
            ? getColorFromProjectColor(event.project.color)
            : "blue",
          type: "app",
          taskId: event.taskId,
          eventId: event._id,
        });
      }
    });

    // Add Google Calendar events
    eventsData.googleEvents.forEach((event) => {
      const eventDate = new Date(event.startDate);
      const dayOfWeek = eventDate.getDay();
      const adjustedDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

      if (adjustedDay >= 0 && adjustedDay <= 4) {
        events.push({
          id: event._id,
          title: event.title,
          description: event.description,
          startTime: eventDate.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }),
          endTime: new Date(event.endDate).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }),
          day: adjustedDay,
          color: "purple", // Google events in purple
          type: "google",
          location: event.location,
          attendees: event.attendees,
          googleEventId: event.eventId,
        });
      }
    });
  }

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  // Auto-scroll to current time on mount and view change
  useEffect(() => {
    if (
      calendarScrollRef.current &&
      (selectedView === "week" || selectedView === "day")
    ) {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();

      // Calculate position based on current time
      const timePosition = getTimePosition(
        `${currentHour.toString().padStart(2, "0")}:${currentMinute.toString().padStart(2, "0")}`,
      );

      // Scroll to show current time in the middle of the viewport
      const scrollContainer = calendarScrollRef.current;
      const containerHeight = scrollContainer.clientHeight;
      const scrollTo = Math.max(0, timePosition - containerHeight / 2);

      // Use setTimeout to ensure the view has rendered
      setTimeout(() => {
        scrollContainer.scrollTo({
          top: scrollTo,
          behavior: "smooth",
        });
      }, 100);
    }
  }, [selectedView]);

  // Function to scroll to current time (for Today button)
  const scrollToCurrentTime = () => {
    if (
      calendarScrollRef.current &&
      (selectedView === "week" || selectedView === "day")
    ) {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();

      const timePosition = getTimePosition(
        `${currentHour.toString().padStart(2, "0")}:${currentMinute.toString().padStart(2, "0")}`,
      );
      const scrollContainer = calendarScrollRef.current;
      const containerHeight = scrollContainer.clientHeight;
      const scrollTo = Math.max(0, timePosition - containerHeight / 2);

      scrollContainer.scrollTo({
        top: scrollTo,
        behavior: "smooth",
      });
    }
  };

  // Get current time indicator position
  const getCurrentTimeIndicatorStyle = () => {
    const now = currentTime;
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const timePosition = getTimePosition(
      `${currentHour.toString().padStart(2, "0")}:${currentMinute.toString().padStart(2, "0")}`,
    );

    return {
      top: `${timePosition}px`,
      zIndex: 50,
    };
  };

  // Check if current time indicator should be shown (only show for today)
  const shouldShowCurrentTimeIndicator = () => {
    const today = new Date();
    const currentDayOfWeek = today.getDay();
    const adjustedDay = currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1;
    return (
      adjustedDay >= 0 &&
      adjustedDay <= 4 &&
      (selectedView === "week" || selectedView === "day")
    );
  };

  // Handle task drop
  const handleDrop = async (
    e: React.DragEvent,
    day: number,
    timeSlot: string,
  ) => {
    e.preventDefault();
    const taskData = e.dataTransfer.getData("text/plain");
    if (taskData) {
      const task = JSON.parse(taskData);

      // Calculate start and end times
      const [hour] = timeSlot.split(":").map(Number);
      const eventDate = new Date(currentWeekStart);
      eventDate.setDate(currentWeekStart.getDate() + day);
      eventDate.setHours(hour, 0, 0, 0);

      const startDate = eventDate.getTime();
      const endDate = startDate + 60 * 60 * 1000; // 1 hour duration

      if (task.taskId) {
        const result = await scheduleTask({
          taskId: task.taskId,
          startDate,
          endDate,
        });

        if (!result.success) {
          console.error("Failed to schedule task:", result.error);
        }
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleEventClick = async (event: ScheduledEvent) => {
    if (event.type === "app" && event.eventId) {
      // For now, just log - you can implement a modal or detailed view
      console.log("Event clicked:", event);
    }
  };

  const filteredTasks = unscheduledTasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ??
        false);
    return matchesSearch;
  });

  // Get current date info for month view
  const getCurrentDateInfo = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const date = today.getDate();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay() + 1); // Start from Monday

    return { today, year, month, date, firstDay, lastDay, startDate };
  };

  // Generate calendar days for month view
  const getCalendarDays = () => {
    const { startDate } = getCurrentDateInfo();
    const days = [];

    for (let i = 0; i < 42; i++) {
      // 6 weeks * 7 days
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + i);
      days.push(day);
    }

    return days;
  };

  // Get events for a specific date
  const getEventsForDate = (date: Date) => {
    return events.filter((event) => {
      const eventDate = new Date(currentWeekStart);
      eventDate.setDate(currentWeekStart.getDate() + event.day);
      return eventDate.toDateString() === date.toDateString();
    });
  };

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
      case "high":
        return isDark
          ? "bg-orange-500/25 text-orange-300 border-orange-400/50 shadow-sm shadow-orange-900/20"
          : "bg-orange-100/80 text-orange-700 border-orange-300/70 shadow-sm shadow-orange-200/30";
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
    const color = getColorFromProjectColor(task.projectColor);

    return (
      <div
        className={`p-2.5 rounded-lg border backdrop-blur-md transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer group ${getTaskColor(color, isDarkMode)} ${
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
          <CheckSquare className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 opacity-80" />
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
          {task.projectName && (
            <span className="text-xs opacity-60 truncate max-w-[100px]">
              {task.projectName}
            </span>
          )}
        </div>
      </div>
    );
  };

  const ScheduledEventCard = ({ event }: { event: ScheduledEvent }) => {
    const Icon = getIconForEventType(event.type);
    const eventHeight = getEventHeight(event.startTime, event.endTime);

    const isVeryShort = eventHeight < 50;
    const isShort = eventHeight < 80;
    const isMedium = eventHeight < 140;

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
          height: `${Math.max(eventHeight - 2, 30)}px`,
          left: "4px",
          right: "4px",
          zIndex: 10,
          maxWidth: "calc(100% - 8px)",
        }}
        onClick={() => handleEventClick(event)}
      >
        {isVeryShort ? (
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
            {event.type === "google" && event.location && (
              <div className="flex items-center space-x-1 mb-1 flex-shrink-0 min-h-0">
                <MapPin className="w-2.5 h-2.5 flex-shrink-0 opacity-60" />
                <span
                  className={`text-xs opacity-60 truncate ${themeClasses.text.tertiary}`}
                >
                  {event.location}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between mt-auto flex-shrink-0 min-h-0 overflow-hidden">
              {event.priority && (
                <span
                  className={`text-xs px-1.5 py-0.5 rounded font-medium backdrop-blur-sm border truncate max-w-[60%] ${getPriorityColor(event.priority, isDarkMode)}`}
                >
                  {event.priority}
                </span>
              )}
              <span
                className={`text-xs opacity-60 truncate ml-1 max-w-[35%] ${themeClasses.text.tertiary}`}
              >
                {event.type}
              </span>
            </div>
          </div>
        ) : (
          <div className="p-3 flex flex-col h-full overflow-hidden">
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
              {event.type === "google" && (
                <>
                  {event.location && (
                    <div className="flex items-center space-x-1 mb-1">
                      <MapPin className="w-3 h-3 flex-shrink-0 opacity-60" />
                      <span
                        className={`text-xs opacity-60 ${themeClasses.text.tertiary}`}
                      >
                        {event.location}
                      </span>
                    </div>
                  )}
                  {event.attendees && event.attendees.length > 0 && (
                    <div className="flex items-center space-x-1 mb-1">
                      <Users className="w-3 h-3 flex-shrink-0 opacity-60" />
                      <span
                        className={`text-xs opacity-60 ${themeClasses.text.tertiary}`}
                      >
                        {event.attendees.length} attendee
                        {event.attendees.length > 1 ? "s" : ""}
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>
            {event.priority && (
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
            )}
          </div>
        )}
      </div>
    );
  };

  const getTimePosition = (time: string) => {
    const [hour, minute] = time.split(":").map(Number);
    const startHour = 0;
    return ((hour - startHour) * 60 + minute) * (120 / 60);
  };

  const getEventHeight = (startTime: string, endTime: string) => {
    const [startHour, startMinute] = startTime.split(":").map(Number);
    const [endHour, endMinute] = endTime.split(":").map(Number);
    const durationMinutes =
      endHour * 60 + endMinute - (startHour * 60 + startMinute);
    return Math.max((durationMinutes * 120) / 60, 30);
  };

  // Render Month View
  const renderMonthView = () => {
    const calendarDays = getCalendarDays();
    const { today, month } = getCurrentDateInfo();

    return (
      <div className="flex-1 overflow-auto max-h-full">
        {/* Month Header */}
        <div
          className={`grid grid-cols-7 border-b ${isDarkMode ? "border-gray-700/40" : "border-gray-200/40"}`}
        >
          {fullWeekDays.map((day) => (
            <div
              key={day.name}
              className={`p-3 text-center border-r ${themeClasses.dayHeader} ${isDarkMode ? "border-gray-700/60" : "border-gray-300/60"}`}
            >
              <div
                className={`text-sm font-semibold ${themeClasses.text.secondary} uppercase tracking-wide`}
              >
                {day.short}
              </div>
            </div>
          ))}
        </div>

        {/* Month Grid */}
        <div
          className="grid grid-cols-7 flex-1 min-h-0"
          style={{ minHeight: "600px" }}
        >
          {calendarDays.map((day, index) => {
            const isToday = day.toDateString() === today.toDateString();
            const isCurrentMonth = day.getMonth() === month;
            const dayEvents = getEventsForDate(day);

            return (
              <div
                key={index}
                className={`border-r border-b p-2 transition-all duration-200 hover:bg-opacity-50 cursor-pointer group ${
                  isDarkMode
                    ? "border-gray-700/50 hover:bg-gray-800/20"
                    : "border-gray-200/50 hover:bg-gray-50/30"
                } ${
                  !isCurrentMonth
                    ? isDarkMode
                      ? "bg-gray-900/20"
                      : "bg-gray-50/50"
                    : ""
                }`}
              >
                <div className="h-full flex flex-col">
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-sm font-medium transition-all duration-200 ${
                        isToday
                          ? "bg-purple-600 text-white w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                          : isCurrentMonth
                            ? themeClasses.text.primary
                            : themeClasses.text.tertiary
                      }`}
                    >
                      {day.getDate()}
                    </span>
                    {dayEvents.length > 0 && (
                      <div className="flex space-x-1">
                        {dayEvents.slice(0, 3).map((event, i) => (
                          <div
                            key={i}
                            className={`w-2 h-2 rounded-full ${
                              event.color === "purple"
                                ? "bg-purple-500"
                                : event.color === "blue"
                                  ? "bg-blue-500"
                                  : event.color === "green"
                                    ? "bg-green-500"
                                    : event.color === "orange"
                                      ? "bg-orange-500"
                                      : event.color === "pink"
                                        ? "bg-pink-500"
                                        : "bg-indigo-500"
                            }`}
                          />
                        ))}
                        {dayEvents.length > 3 && (
                          <span
                            className={`text-xs ${themeClasses.text.tertiary}`}
                          >
                            +{dayEvents.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-1 overflow-hidden">
                    {dayEvents.slice(0, 3).map((event, i) => (
                      <div
                        key={i}
                        className={`text-xs p-1 rounded truncate transition-all duration-200 cursor-pointer ${getTaskColor(event.color, isDarkMode)}`}
                        onClick={() => handleEventClick(event)}
                      >
                        {event.title}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Render Day View
  const renderDayView = () => {
    const today = new Date();
    const todayEvents = events.filter((event) => {
      const currentDay = today.getDay();
      const adjustedDay = currentDay === 0 ? 6 : currentDay - 1;
      return event.day === adjustedDay;
    });

    return (
      <div className="flex-1 overflow-hidden">
        {/* Day Header */}
        <div
          className={`p-4 border-b ${isDarkMode ? "border-gray-700/40" : "border-gray-200/40"}`}
        >
          <div className="text-center">
            <div className={`text-lg font-bold ${themeClasses.text.primary}`}>
              {today.toLocaleDateString("en-US", { weekday: "long" })}
            </div>
            <div
              className={`text-3xl font-bold mt-1 ${themeClasses.text.primary}`}
            >
              {today.getDate()}
            </div>
            <div className={`text-sm ${themeClasses.text.secondary}`}>
              {today.toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </div>
          </div>
        </div>

        {/* Day Schedule */}
        <div
          className="flex-1 overflow-auto max-h-full"
          ref={calendarScrollRef}
        >
          <div className="relative" style={{ height: `${24 * 120}px` }}>
            {/* Current Time Indicator for day view */}
            {shouldShowCurrentTimeIndicator() && (
              <div
                className="absolute left-0 right-0 pointer-events-none"
                style={getCurrentTimeIndicatorStyle()}
              >
                <div className="flex items-center">
                  <div className="px-2 py-1 rounded text-xs font-bold shadow-lg z-50 bg-red-500 text-white">
                    {currentTime.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    })}
                  </div>
                  <div className="flex-1 h-0.5 bg-red-500 shadow-lg"></div>
                  <div className="w-2 h-2 bg-red-500 rounded-full shadow-lg mr-2"></div>
                </div>
              </div>
            )}

            {/* Time slots for day view */}
            {timeSlots.map((time, index) => (
              <div
                key={time}
                className={`flex border-b border-dashed transition-colors duration-200 ${
                  isDarkMode
                    ? "border-gray-700/50 hover:bg-gray-800/10"
                    : "border-gray-300/50 hover:bg-gray-50/20"
                }`}
                style={{ height: "120px" }}
              >
                <div
                  className={`w-20 p-2 text-center border-r border-dashed ${themeClasses.timeSlot} ${isDarkMode ? "border-gray-700/60" : "border-gray-300/60"}`}
                >
                  <span className="text-xs font-medium">{time}</span>
                </div>
                <div
                  className={`flex-1 relative border-dashed transition-all duration-200 group ${
                    isDarkMode ? "hover:bg-gray-800/5" : "hover:bg-gray-50/10"
                  }`}
                  onDrop={(e) => {
                    const currentDay = today.getDay();
                    const adjustedDay = currentDay === 0 ? 6 : currentDay - 1;
                    handleDrop(e, adjustedDay, time);
                  }}
                  onDragOver={handleDragOver}
                >
                  <div
                    className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded m-0.5 border border-dashed ${isDarkMode ? "border-purple-500/40" : "border-purple-400/50"}`}
                  ></div>

                  {index === 0 &&
                    todayEvents.map((event) => (
                      <ScheduledEventCard key={event.id} event={event} />
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Render Week View
  const renderWeekView = () => {
    const weekDates: Array<{
      name: string;
      short: string;
      date: number;
    }> = [];
    for (let i = 0; i < 5; i++) {
      const date = new Date(currentWeekStart);
      date.setDate(currentWeekStart.getDate() + i);
      weekDates.push({
        name: weekDays[i].name,
        short: weekDays[i].short,
        date: date.getDate(),
      });
    }

    return (
      <div className="flex-1 overflow-auto max-h-full" ref={calendarScrollRef}>
        <div className="relative" style={{ height: `${24 * 120}px` }}>
          {/* Day Headers */}
          <div
            className="grid grid-cols-6 border-b border-dashed"
            style={{ gridTemplateColumns: "80px repeat(5, 1fr)" }}
          >
            <div
              className={`p-2 border-r border-dashed ${themeClasses.dayHeader} ${isDarkMode ? "border-gray-700/60" : "border-gray-300/60"}`}
            ></div>
            {weekDates.map((day) => (
              <div
                key={day.name}
                className={`p-2 text-center border-r border-dashed ${themeClasses.dayHeader} ${isDarkMode ? "border-gray-700/60" : "border-gray-300/60"}`}
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

          {/* Current Time Indicator */}
          {shouldShowCurrentTimeIndicator() && (
            <div
              className="absolute left-0 right-0 pointer-events-none"
              style={getCurrentTimeIndicatorStyle()}
            >
              <div className="flex items-center">
                <div className="px-2 py-1 rounded text-xs font-bold shadow-lg z-50 bg-red-500 text-white">
                  {currentTime.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  })}
                </div>
                <div className="flex-1 h-0.5 bg-red-500 shadow-lg"></div>
                <div className="w-2 h-2 bg-red-500 rounded-full shadow-lg mr-2"></div>
              </div>
            </div>
          )}

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
                  className={`p-2 border-r border-dashed text-center ${themeClasses.timeSlot} ${isDarkMode ? "border-gray-700/60" : "border-gray-300/60"}`}
                >
                  <span className="text-xs font-medium">{time}</span>
                </div>
                {weekDates.map((day, dayIndex) => (
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
                    <div
                      className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded m-0.5 border border-dashed ${isDarkMode ? "border-purple-500/40" : "border-purple-400/50"}`}
                    ></div>

                    {index === 0 &&
                      events
                        .filter((event) => event.day === dayIndex)
                        .map((event) => (
                          <ScheduledEventCard key={event.id} event={event} />
                        ))}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`flex h-full overflow-hidden ${className}`}>
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
      </div>

      {/* Main Calendar Area */}
      <main className="flex-1 flex flex-col min-h-0">
        <div className="flex-1 flex flex-col min-h-0">
          {/* Calendar Header with Controls */}
          <div
            className={`p-3 border-b ${isDarkMode ? "border-gray-700/40 bg-gray-900/30" : "border-gray-200/40 bg-white/30"}`}
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
                    className={`p-1.5 rounded-lg transition-all duration-200 ${isDarkMode ? "hover:bg-gray-700/50" : "hover:bg-gray-100/60"}`}
                  >
                    <ChevronLeft
                      className={`w-4 h-4 ${themeClasses.text.secondary}`}
                    />
                  </button>
                  <button
                    className={`p-1.5 rounded-lg transition-all duration-200 ${isDarkMode ? "hover:bg-gray-700/50" : "hover:bg-gray-100/60"}`}
                  >
                    <ChevronRight
                      className={`w-4 h-4 ${themeClasses.text.secondary}`}
                    />
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-2">
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
                  onClick={scrollToCurrentTime}
                  className={`px-3 py-1.5 rounded-lg transition-all duration-200 text-xs font-medium ${isDarkMode ? "bg-gray-700/60 text-gray-300 hover:bg-gray-700/80" : "bg-gray-100/80 text-gray-700 hover:bg-gray-100/95"}`}
                >
                  Today
                </button>
              </div>
            </div>
          </div>

          {/* Dynamic Calendar View */}
          <div
            className={`flex-1 overflow-hidden ${themeClasses.calendarGrid}`}
          >
            {selectedView === "month"
              ? renderMonthView()
              : selectedView === "day"
                ? renderDayView()
                : renderWeekView()}
          </div>
        </div>
      </main>
    </div>
  );
}
