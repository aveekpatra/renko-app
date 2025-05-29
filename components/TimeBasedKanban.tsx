import React from "react";
import { Clock, Calendar, CalendarDays, Filter } from "lucide-react";

// Time-based tasks data
const timeBasedTasks = {
  today: [
    {
      id: "t1",
      title: "Review design mockups",
      priority: "high",
    },
    {
      id: "t2",
      title: "Client call at 3pm",
      priority: "high",
    },
    {
      id: "t3",
      title: "Update project docs",
      priority: "medium",
    },
  ],
  thisWeek: [
    {
      id: "t4",
      title: "Implement new feature",
      priority: "high",
    },
    {
      id: "t5",
      title: "User testing session",
      priority: "medium",
    },
    {
      id: "t6",
      title: "Performance optimization",
      priority: "low",
    },
    { id: "t7", title: "Code review", priority: "medium" },
  ],
  thisMonth: [
    {
      id: "t8",
      title: "Q4 planning meeting",
      priority: "high",
    },
    { id: "t9", title: "Security audit", priority: "medium" },
    {
      id: "t10",
      title: "Personal development plan",
      priority: "low",
    },
  ],
  longTerm: [
    {
      id: "t11",
      title: "Platform migration",
      priority: "high",
    },
    {
      id: "t12",
      title: "Mobile app development",
      priority: "medium",
    },
  ],
};

interface TimeBasedKanbanProps {
  isDarkMode: boolean;
}

export default function TimeBasedKanban({ isDarkMode }: TimeBasedKanbanProps) {
  const columns = [
    { id: "today", title: "Today", icon: Clock, color: "red" },
    { id: "thisWeek", title: "This Week", icon: Calendar, color: "orange" },
    { id: "thisMonth", title: "This Month", icon: CalendarDays, color: "blue" },
    { id: "longTerm", title: "Long Term", icon: Clock, color: "purple" },
  ];

  return (
    <div className="mb-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <div
            className={`p-2.5 rounded-xl backdrop-blur-sm border shadow-sm ${
              isDarkMode
                ? "bg-gray-800/80 border-gray-700/50 text-purple-400 shadow-black/20"
                : "bg-white/80 border-gray-200/60 text-purple-600 shadow-gray-900/10"
            }`}
          >
            <Clock className="w-5 h-5" />
          </div>
          <h3
            className={`text-2xl font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}
          >
            Time-Based Tasks
          </h3>
        </div>
        <button
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 backdrop-blur-sm border shadow-lg hover:shadow-xl hover:-translate-y-0.5 ${
            isDarkMode
              ? "text-gray-400 hover:text-gray-200 bg-gray-800/70 hover:bg-gray-800/90 border-gray-700/50 shadow-black/20"
              : "text-gray-600 hover:text-gray-900 bg-white/70 hover:bg-white/90 border-gray-200/60 shadow-gray-900/10"
          }`}
        >
          <Filter className="w-4 h-4" />
          <span>Filter</span>
        </button>
      </div>

      {/* Kanban Columns */}
      <div
        className={`rounded-2xl backdrop-blur-xl border shadow-2xl ${
          isDarkMode
            ? "bg-gray-900/60 border-gray-800/60 shadow-black/25"
            : "bg-white/90 border-gray-200/60 shadow-gray-900/15"
        }`}
      >
        <div className="p-6">
          <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-400/50 scrollbar-track-gray-100/50">
            <div className="flex gap-6 min-w-max">
              {columns.map((column) => (
                <KanbanColumn
                  key={column.id}
                  column={column}
                  tasks={
                    timeBasedTasks[column.id as keyof typeof timeBasedTasks]
                  }
                  isDarkMode={isDarkMode}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Kanban Column Component
interface KanbanColumnProps {
  column: {
    id: string;
    title: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
  };
  tasks: Array<{
    id: string;
    title: string;
    priority: string;
  }>;
  isDarkMode: boolean;
}

function KanbanColumn({ column, tasks, isDarkMode }: KanbanColumnProps) {
  const colorClasses = {
    red: isDarkMode
      ? "bg-red-500/15 text-red-400 border-red-500/30 shadow-red-900/30"
      : "bg-red-50/80 text-red-600 border-red-200/70 shadow-red-200/40",
    orange: isDarkMode
      ? "bg-orange-500/15 text-orange-400 border-orange-500/30 shadow-orange-900/30"
      : "bg-orange-50/80 text-orange-600 border-orange-200/70 shadow-orange-200/40",
    blue: isDarkMode
      ? "bg-blue-500/15 text-blue-400 border-blue-500/30 shadow-blue-900/30"
      : "bg-blue-50/80 text-blue-600 border-blue-200/70 shadow-blue-200/40",
    purple: isDarkMode
      ? "bg-purple-500/15 text-purple-400 border-purple-500/30 shadow-purple-900/30"
      : "bg-purple-50/80 text-purple-600 border-purple-200/70 shadow-purple-200/40",
  };

  return (
    <div className="w-[240px] flex-shrink-0 space-y-4">
      {/* Column Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div
            className={`p-2 rounded-xl backdrop-blur-sm border shadow-lg ${colorClasses[column.color as keyof typeof colorClasses]}`}
          >
            <column.icon className="w-4 h-4" />
          </div>
          <div>
            <h4
              className={`font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}
            >
              {column.title}
            </h4>
            <p
              className={`text-sm ${isDarkMode ? "text-gray-500" : "text-gray-500"}`}
            >
              {tasks.length} tasks
            </p>
          </div>
        </div>
      </div>

      {/* Tasks */}
      <div
        className={`min-h-[280px] max-h-[400px] overflow-y-auto scrollbar-thin rounded-lg p-3 backdrop-blur-sm border ${
          isDarkMode
            ? "bg-gray-800/30 border-gray-700/40 scrollbar-thumb-gray-600/50 scrollbar-track-gray-800/20"
            : "bg-gray-50/80 border-gray-200/50 scrollbar-thumb-gray-400/50 scrollbar-track-gray-100/50"
        }`}
      >
        <div className="space-y-3">
          {tasks.map((task) => (
            <div
              key={task.id}
              className={`p-4 rounded-xl cursor-pointer transition-all duration-200 backdrop-blur-sm border shadow-lg hover:shadow-xl hover:-translate-y-0.5 ${
                isDarkMode
                  ? "bg-gray-800/50 hover:bg-gray-800/70 border-gray-700/50 shadow-black/20"
                  : "bg-white/80 hover:bg-white/95 border-gray-200/60 shadow-gray-900/10"
              }`}
            >
              <div className="flex items-start justify-between">
                <h5
                  className={`font-medium text-sm leading-relaxed pr-3 ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  {task.title}
                </h5>
                <span
                  className={`px-2 py-1 rounded-lg text-xs font-medium flex-shrink-0 backdrop-blur-sm border shadow-sm ${
                    task.priority === "high"
                      ? isDarkMode
                        ? "bg-red-500/30 text-red-300 border-red-400/40 shadow-red-900/30"
                        : "bg-red-100/90 text-red-600 border-red-200/70 shadow-red-200/40"
                      : task.priority === "medium"
                        ? isDarkMode
                          ? "bg-yellow-500/30 text-yellow-300 border-yellow-400/40 shadow-yellow-900/30"
                          : "bg-yellow-100/90 text-yellow-600 border-yellow-200/70 shadow-yellow-200/40"
                        : isDarkMode
                          ? "bg-green-500/30 text-green-300 border-green-400/40 shadow-green-900/30"
                          : "bg-green-100/90 text-green-600 border-green-200/70 shadow-green-200/40"
                  }`}
                >
                  {task.priority}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
