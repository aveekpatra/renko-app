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

  // Sample events with more detail
  const sampleEvents = {
    1: [
      { title: "Design Review", time: "10:00", type: "meeting", color: "blue" },
      { title: "Team Sync", time: "15:30", type: "meeting", color: "purple" },
    ],
    2: [
      {
        title: "Client Presentation",
        time: "14:00",
        type: "presentation",
        color: "green",
      },
    ],
    3: [
      {
        title: "Product Launch",
        time: "09:00",
        type: "milestone",
        color: "orange",
      },
      {
        title: "Lunch with Sarah",
        time: "12:30",
        type: "personal",
        color: "pink",
      },
    ],
    4: [
      {
        title: "Code Review",
        time: "11:00",
        type: "development",
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
              className={`text-2xl font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}
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
            className={`p-2.5 rounded-xl backdrop-blur-sm border shadow-lg transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5 ${
              isDarkMode
                ? "bg-gray-800/70 border-gray-700/50 text-gray-400 hover:text-gray-200 shadow-black/20"
                : "bg-white/70 border-gray-200/60 text-gray-600 hover:text-gray-900 shadow-gray-900/10"
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
                    ? "text-gray-400 hover:text-gray-200"
                    : "text-gray-600 hover:text-gray-900"
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
                    ? "text-gray-400 hover:text-gray-200"
                    : "text-gray-600 hover:text-gray-900"
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
                  <div key={day} className="space-y-3 w-[200px] flex-shrink-0">
                    <div className="text-center">
                      <div
                        className={`text-sm font-medium mb-2 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                      >
                        {day}
                      </div>
                      <div
                        className={`inline-flex items-center justify-center w-8 h-8 rounded-lg font-semibold transition-all duration-200 ${
                          dates[index].toDateString() ===
                          currentDate.toDateString()
                            ? isDarkMode
                              ? "bg-purple-600 text-white shadow-md shadow-purple-900/40"
                              : "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                            : isDarkMode
                              ? "text-gray-300 hover:bg-gray-800/50"
                              : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        {dates[index].getDate()}
                      </div>
                    </div>

                    <div
                      className={`rounded-lg min-h-[280px] max-h-[400px] p-3 transition-all duration-200 backdrop-blur-sm border overflow-y-auto scrollbar-thin ${
                        dates[index].toDateString() ===
                        currentDate.toDateString()
                          ? isDarkMode
                            ? "bg-purple-500/8 border-purple-500/25 scrollbar-thumb-purple-600/50 scrollbar-track-purple-900/20"
                            : "bg-purple-50/90 border-purple-200/60 scrollbar-thumb-purple-400/50 scrollbar-track-purple-100/50"
                          : isDarkMode
                            ? "bg-gray-800/30 hover:bg-gray-800/50 border-gray-700/40 scrollbar-thumb-gray-600/50 scrollbar-track-gray-800/20"
                            : "bg-gray-50/80 hover:bg-gray-100/90 border-gray-200/50 scrollbar-thumb-gray-400/50 scrollbar-track-gray-100/50"
                      }`}
                    >
                      <div className="space-y-2">
                        {sampleEvents[index] &&
                          sampleEvents[index].map((event, eventIndex) => (
                            <div
                              key={eventIndex}
                              className={`p-2.5 rounded-md text-xs backdrop-blur-sm border transition-all duration-200 hover:scale-[1.02] cursor-pointer ${
                                event.color === "blue"
                                  ? isDarkMode
                                    ? "bg-blue-500/20 text-blue-300 border-blue-400/30 hover:bg-blue-500/30"
                                    : "bg-blue-50/95 text-blue-800 border-blue-200/60 hover:bg-blue-100"
                                  : event.color === "green"
                                    ? isDarkMode
                                      ? "bg-green-500/20 text-green-300 border-green-400/30 hover:bg-green-500/30"
                                      : "bg-green-50/95 text-green-800 border-green-200/60 hover:bg-green-100"
                                    : event.color === "orange"
                                      ? isDarkMode
                                        ? "bg-orange-500/20 text-orange-300 border-orange-400/30 hover:bg-orange-500/30"
                                        : "bg-orange-50/95 text-orange-800 border-orange-200/60 hover:bg-orange-100"
                                      : event.color === "purple"
                                        ? isDarkMode
                                          ? "bg-purple-500/20 text-purple-300 border-purple-400/30 hover:bg-purple-500/30"
                                          : "bg-purple-50/95 text-purple-800 border-purple-200/60 hover:bg-purple-100"
                                        : isDarkMode
                                          ? "bg-pink-500/20 text-pink-300 border-pink-400/30 hover:bg-pink-500/30"
                                          : "bg-pink-50/95 text-pink-800 border-pink-200/60 hover:bg-pink-100"
                              }`}
                            >
                              <div className="space-y-1">
                                <div className="flex items-start justify-between">
                                  <span className="font-medium leading-tight flex-1 pr-2">
                                    {event.title}
                                  </span>
                                  <span
                                    className={`text-xs opacity-75 flex-shrink-0`}
                                  >
                                    {event.time}
                                  </span>
                                </div>
                                <div
                                  className={`text-xs opacity-60 capitalize`}
                                >
                                  {event.type}
                                </div>
                              </div>
                            </div>
                          ))}
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
