import React, { useState } from "react";
import { Calendar, CalendarDays, Plus } from "lucide-react";

interface CalendarWidgetProps {
  isDarkMode: boolean;
}

export default function CalendarWidget({ isDarkMode }: CalendarWidgetProps) {
  const [viewMode, setViewMode] = useState<"week" | "month">("week");
  const currentDate = new Date();

  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const dates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - date.getDay() + i + 1);
    return date;
  });

  // Task-based calendar events
  const sampleEvents: Record<
    number,
    Array<{
      title: string;
      description: string;
      time: string;
      duration: string;
      priority: string;
      project: string;
      color: string;
    }>
  > = {
    1: [
      {
        title: "Design Review",
        description: "Review new dashboard mockups with team",
        time: "10:00",
        duration: "1h",
        priority: "high",
        project: "Dashboard v2",
        color: "blue",
      },
      {
        title: "Team Sync",
        description: "Weekly team standup meeting",
        time: "15:30",
        duration: "30m",
        priority: "medium",
        project: "General",
        color: "purple",
      },
    ],
    2: [
      {
        title: "Client Presentation",
        description: "Present Q4 progress and roadmap",
        time: "14:00",
        duration: "2h",
        priority: "high",
        project: "Client Relations",
        color: "green",
      },
    ],
    3: [
      {
        title: "Product Launch",
        description: "Final launch preparations and go-live",
        time: "09:00",
        duration: "4h",
        priority: "critical",
        project: "Product Launch",
        color: "orange",
      },
      {
        title: "Lunch with Sarah",
        description: "Discuss new marketing strategy",
        time: "12:30",
        duration: "1h",
        priority: "low",
        project: "Marketing",
        color: "pink",
      },
    ],
    4: [
      {
        title: "Code Review",
        description: "Review authentication system implementation",
        time: "11:00",
        duration: "45m",
        priority: "medium",
        project: "Backend",
        color: "blue",
      },
    ],
  };

  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <div
            className={`p-3 rounded-xl backdrop-blur-sm border shadow-lg ${
              isDarkMode
                ? "bg-gray-800/80 border-gray-700/50 text-purple-400 shadow-black/20"
                : "bg-white/90 border-gray-200/60 text-purple-600 shadow-gray-900/10"
            }`}
          >
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h3
              className={`text-2xl font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}
            >
              Calendar
            </h3>
            <p
              className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
            >
              {currentDate.toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            className={`p-2.5 rounded-xl backdrop-blur-sm border shadow-lg ${
              isDarkMode
                ? "bg-gray-800/70 border-gray-700/50 text-gray-400 shadow-black/20"
                : "bg-white/70 border-gray-200/60 text-gray-600 shadow-gray-900/10"
            }`}
          >
            <Plus className="w-4 h-4" />
          </button>
          <div
            className={`flex items-center rounded-xl backdrop-blur-md border shadow-lg ${
              isDarkMode
                ? "bg-gray-800/70 border-gray-700/50 shadow-black/20"
                : "bg-white/80 border-gray-200/60 shadow-gray-900/10"
            }`}
          >
            <button
              onClick={() => setViewMode("week")}
              className={`px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
                viewMode === "week"
                  ? isDarkMode
                    ? "bg-white text-gray-900 shadow-lg shadow-black/10"
                    : "bg-white text-gray-900 shadow-lg shadow-gray-900/15"
                  : isDarkMode
                    ? "text-gray-400"
                    : "text-gray-600"
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setViewMode("month")}
              className={`px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
                viewMode === "month"
                  ? isDarkMode
                    ? "bg-white text-gray-900 shadow-lg shadow-black/10"
                    : "bg-white text-gray-900 shadow-lg shadow-gray-900/15"
                  : isDarkMode
                    ? "text-gray-400"
                    : "text-gray-600"
              }`}
            >
              Month
            </button>
          </div>
        </div>
      </div>

      <div
        className={`rounded-2xl backdrop-blur-xl border shadow-2xl ${
          isDarkMode
            ? "bg-gray-900/60 border-gray-800/60 shadow-black/25"
            : "bg-white/90 border-gray-200/60 shadow-gray-900/15"
        }`}
      >
        {viewMode === "week" ? (
          <div className="p-6">
            <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-400/50 scrollbar-track-gray-100/50">
              <div className="flex gap-6 min-w-max">
                {weekDays.map((day, index) => (
                  <div key={day} className="w-[240px] flex-shrink-0 space-y-4">
                    {/* Day Header - Kanban Style */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`p-2 rounded-xl backdrop-blur-sm border shadow-lg ${
                            dates[index].toDateString() ===
                            currentDate.toDateString()
                              ? isDarkMode
                                ? "bg-purple-500/15 text-purple-400 border-purple-500/30 shadow-purple-900/30"
                                : "bg-purple-50/80 text-purple-600 border-purple-200/70 shadow-purple-200/40"
                              : isDarkMode
                                ? "bg-gray-500/15 text-gray-400 border-gray-500/30 shadow-gray-900/30"
                                : "bg-gray-50/80 text-gray-600 border-gray-200/70 shadow-gray-200/40"
                          }`}
                        >
                          <Calendar className="w-4 h-4" />
                        </div>
                        <div>
                          <h4
                            className={`font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}
                          >
                            {day}
                          </h4>
                          <p
                            className={`text-sm ${isDarkMode ? "text-gray-500" : "text-gray-500"}`}
                          >
                            {dates[index].getDate()} •{" "}
                            {sampleEvents[index]
                              ? sampleEvents[index].length
                              : 0}{" "}
                            tasks
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Day Column - Kanban Style */}
                    <div
                      className={`min-h-[280px] max-h-[400px] overflow-y-auto scrollbar-thin rounded-lg p-3 backdrop-blur-sm border ${
                        isDarkMode
                          ? "bg-gray-800/30 border-gray-700/40 scrollbar-thumb-gray-600/50 scrollbar-track-gray-800/20"
                          : "bg-gray-50/80 border-gray-200/50 scrollbar-thumb-gray-400/50 scrollbar-track-gray-100/50"
                      }`}
                    >
                      <div className="space-y-2">
                        {sampleEvents[index] &&
                          sampleEvents[index].map((event, eventIndex) => {
                            return (
                              <div
                                key={eventIndex}
                                className={`p-3 rounded-xl cursor-pointer backdrop-blur-sm border shadow-md transition-all duration-200 ${
                                  event.color === "blue"
                                    ? isDarkMode
                                      ? "bg-blue-500/15 text-blue-300 border-blue-400/30 shadow-blue-900/20"
                                      : "bg-blue-50/95 text-blue-800 border-blue-200/60 shadow-blue-200/30"
                                    : event.color === "green"
                                      ? isDarkMode
                                        ? "bg-green-500/15 text-green-300 border-green-400/30 shadow-green-900/20"
                                        : "bg-green-50/95 text-green-800 border-green-200/60 shadow-green-200/30"
                                      : event.color === "orange"
                                        ? isDarkMode
                                          ? "bg-orange-500/15 text-orange-300 border-orange-400/30 shadow-orange-900/20"
                                          : "bg-orange-50/95 text-orange-800 border-orange-200/60 shadow-orange-200/30"
                                        : event.color === "purple"
                                          ? isDarkMode
                                            ? "bg-purple-500/15 text-purple-300 border-purple-400/30 shadow-purple-900/20"
                                            : "bg-purple-50/95 text-purple-800 border-purple-200/60 shadow-purple-200/30"
                                          : isDarkMode
                                            ? "bg-pink-500/15 text-pink-300 border-pink-400/30 shadow-pink-900/20"
                                            : "bg-pink-50/95 text-pink-800 border-pink-200/60 shadow-pink-200/30"
                                }`}
                              >
                                {/* Task Header */}
                                <div className="flex items-start justify-between mb-2">
                                  <span className="font-medium text-sm leading-tight flex-1">
                                    {event.title}
                                  </span>
                                  <div className="flex flex-col items-end space-y-0.5 flex-shrink-0 ml-2">
                                    <span className="text-xs opacity-75 font-medium">
                                      {event.time}
                                    </span>
                                    <span className="text-xs opacity-60">
                                      {event.duration}
                                    </span>
                                  </div>
                                </div>

                                {/* Task Description */}
                                {event.description && (
                                  <p className="text-xs opacity-75 mb-2 leading-relaxed">
                                    {event.description}
                                  </p>
                                )}

                                {/* Task Footer */}
                                <div className="flex items-center justify-between">
                                  <span
                                    className={`text-xs px-2 py-1 rounded-lg font-medium backdrop-blur-sm border ${
                                      isDarkMode
                                        ? "bg-gray-700/50 text-gray-300 border-gray-600/50"
                                        : "bg-white/80 text-gray-600 border-gray-300/60"
                                    }`}
                                  >
                                    {event.project}
                                  </span>
                                  <span
                                    className={`text-xs px-2 py-1 rounded-lg font-medium backdrop-blur-sm border ${
                                      event.priority === "critical"
                                        ? isDarkMode
                                          ? "bg-red-500/20 text-red-300 border-red-400/40"
                                          : "bg-red-100 text-red-700 border-red-300/60"
                                        : event.priority === "high"
                                          ? isDarkMode
                                            ? "bg-orange-500/20 text-orange-300 border-orange-400/40"
                                            : "bg-orange-100 text-orange-700 border-orange-300/60"
                                          : event.priority === "medium"
                                            ? isDarkMode
                                              ? "bg-yellow-500/20 text-yellow-300 border-yellow-400/40"
                                              : "bg-yellow-100 text-yellow-700 border-yellow-300/60"
                                            : isDarkMode
                                              ? "bg-green-500/20 text-green-300 border-green-400/40"
                                              : "bg-green-100 text-green-700 border-green-300/60"
                                    }`}
                                  >
                                    {event.priority}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-20">
            <div
              className={`inline-flex p-6 rounded-2xl backdrop-blur-sm border shadow-lg mb-6 ${
                isDarkMode
                  ? "bg-gray-800/70 border-gray-700/50 shadow-black/20"
                  : "bg-gray-100/80 border-gray-200/60 shadow-gray-900/10"
              }`}
            >
              <CalendarDays
                className={`w-12 h-12 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
              />
            </div>
            <h4
              className={`text-xl font-semibold mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
            >
              Month View
            </h4>
            <p
              className={`text-lg ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
            >
              Coming soon with enhanced features
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
