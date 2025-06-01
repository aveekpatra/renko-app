import React from "react";
import { Clock, Calendar, CalendarDays, Filter } from "lucide-react";

// Enhanced task data with more details
const timeBasedTasks = {
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
    },
    {
      id: "t2",
      title: "Update dashboard metrics",
      description: "Add new KPI tracking for user engagement and retention",
      priority: "medium",
      project: "Analytics",
      timeEstimate: "1h",
      dueTime: "16:30",
    },
    {
      id: "t3",
      title: "Team standup meeting",
      description: "Daily sync with the development team",
      priority: "high",
      project: "General",
      timeEstimate: "30m",
      dueTime: "09:30",
    },
  ],
  thisWeek: [
    {
      id: "t4",
      title: "Design system documentation",
      description: "Complete component library documentation for new designers",
      priority: "medium",
      project: "Design System",
      timeEstimate: "4h",
      dueTime: "Wed",
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
    },
    {
      id: "t6",
      title: "User testing sessions",
      description: "Conduct usability testing for the new onboarding flow",
      priority: "medium",
      project: "UX Research",
      timeEstimate: "3h",
      dueTime: "Thu",
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
    },
    {
      id: "t8",
      title: "Security audit",
      description: "Comprehensive security review of authentication system",
      priority: "critical",
      project: "Security",
      timeEstimate: "8h",
      dueTime: "Dec 20",
    },
    {
      id: "t9",
      title: "Marketing campaign launch",
      description: "Launch holiday marketing campaign across all channels",
      priority: "medium",
      project: "Marketing",
      timeEstimate: "5h",
      dueTime: "Dec 10",
    },
    {
      id: "t10",
      title: "Personal development plan",
      description:
        "Create quarterly learning objectives and skill development plan",
      priority: "low",
      project: "Personal",
      timeEstimate: "2h",
      dueTime: "Dec 25",
    },
  ],
  longTerm: [
    {
      id: "t11",
      title: "Platform migration",
      description: "Migrate entire platform to new cloud infrastructure",
      priority: "high",
      project: "Infrastructure",
      timeEstimate: "40h",
      dueTime: "Q1 2024",
    },
    {
      id: "t12",
      title: "Mobile app development",
      description: "Build native iOS and Android applications",
      priority: "medium",
      project: "Mobile",
      timeEstimate: "200h",
      dueTime: "Q2 2024",
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
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 backdrop-blur-sm border shadow-lg ${
            isDarkMode
              ? "text-gray-400 bg-gray-800/70 border-gray-700/50 shadow-black/20"
              : "text-gray-600 bg-white/70 border-gray-200/60 shadow-gray-900/10"
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
          <div className="overflow-x-auto scrollbar-none">
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
    description: string;
    priority: string;
    project: string;
    timeEstimate: string;
    dueTime: string;
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
        className={`min-h-[280px] max-h-[400px] overflow-y-auto scrollbar-none rounded-lg p-3 backdrop-blur-sm border ${
          isDarkMode
            ? "bg-gray-800/30 border-gray-700/40"
            : "bg-gray-50/80 border-gray-200/50"
        }`}
      >
        <div className="space-y-2">
          {tasks.map((task) => (
            <div
              key={task.id}
              className={`p-3 rounded-xl cursor-pointer transition-all duration-200 backdrop-blur-sm border shadow-md ${
                isDarkMode
                  ? "bg-gray-800/50 border-gray-700/50 shadow-black/20"
                  : "bg-white/80 border-gray-200/60 shadow-gray-900/10"
              }`}
            >
              {/* Task Header */}
              <div className="flex items-start justify-between mb-2">
                <span className="font-medium text-sm leading-tight flex-1">
                  {task.title}
                </span>
                <div className="flex flex-col items-end space-y-0.5 flex-shrink-0 ml-2">
                  <span
                    className={`text-xs opacity-75 font-medium ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                  >
                    {task.dueTime}
                  </span>
                  <span
                    className={`text-xs opacity-60 ${isDarkMode ? "text-gray-500" : "text-gray-500"}`}
                  >
                    {task.timeEstimate}
                  </span>
                </div>
              </div>

              {/* Task Description */}
              <p
                className={`text-xs opacity-75 mb-2 leading-relaxed ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
              >
                {task.description}
              </p>

              {/* Task Footer */}
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs px-2 py-1 rounded-lg font-medium backdrop-blur-sm border ${
                    isDarkMode
                      ? "bg-gray-700/50 text-gray-300 border-gray-600/50"
                      : "bg-white/80 text-gray-600 border-gray-300/60"
                  }`}
                >
                  {task.project}
                </span>
                <span
                  className={`text-xs px-2 py-1 rounded-lg font-medium backdrop-blur-sm border ${
                    task.priority === "critical"
                      ? isDarkMode
                        ? "bg-red-500/20 text-red-300 border-red-400/40"
                        : "bg-red-100 text-red-700 border-red-300/60"
                      : task.priority === "high"
                        ? isDarkMode
                          ? "bg-orange-500/20 text-orange-300 border-orange-400/40"
                          : "bg-orange-100 text-orange-700 border-orange-300/60"
                        : task.priority === "medium"
                          ? isDarkMode
                            ? "bg-yellow-500/20 text-yellow-300 border-yellow-400/40"
                            : "bg-yellow-100 text-yellow-700 border-yellow-300/60"
                          : isDarkMode
                            ? "bg-green-500/20 text-green-300 border-green-400/40"
                            : "bg-green-100 text-green-700 border-green-300/60"
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
