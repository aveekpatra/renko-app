import React from "react";
import {
  FolderKanban,
  FileText,
  Calendar,
  Clock,
  BarChart3,
} from "lucide-react";

// Enhanced project status tasks with more details
const projectStatusTasks = {
  draft: [
    {
      id: "p1",
      title: "API Documentation Rewrite",
      description:
        "Comprehensive update of API documentation with new endpoints",
      project: "Backend",
      priority: "medium",
      timeEstimate: "8h",
      dueDate: "Dec 5",
    },
    {
      id: "p2",
      title: "User Onboarding Flow",
      description: "Design new user registration and welcome sequence",
      project: "UX Design",
      priority: "high",
      timeEstimate: "12h",
      dueDate: "Dec 8",
    },
    {
      id: "p3",
      title: "Payment Integration",
      description: "Integrate Stripe payment system for subscription billing",
      project: "Backend",
      priority: "critical",
      timeEstimate: "16h",
      dueDate: "Dec 10",
    },
  ],
  planned: [
    {
      id: "p4",
      title: "Mobile Responsive Design",
      description: "Optimize layout and components for mobile devices",
      project: "Frontend",
      priority: "high",
      timeEstimate: "20h",
      dueDate: "Dec 15",
    },
    {
      id: "p5",
      title: "Advanced Search Features",
      description: "Implement filters, sorting, and search suggestions",
      project: "Frontend",
      priority: "medium",
      timeEstimate: "15h",
      dueDate: "Dec 18",
    },
    {
      id: "p6",
      title: "Performance Monitoring",
      description: "Set up comprehensive monitoring and alerting system",
      project: "DevOps",
      priority: "high",
      timeEstimate: "10h",
      dueDate: "Dec 12",
    },
  ],
  inProgress: [
    {
      id: "p7",
      title: "Real-time Notifications",
      description: "Build WebSocket-based notification system",
      project: "Backend",
      priority: "high",
      timeEstimate: "25h",
      dueDate: "Dec 20",
    },
    {
      id: "p8",
      title: "Dark Mode Implementation",
      description: "Add dark theme support across all components",
      project: "Frontend",
      priority: "medium",
      timeEstimate: "12h",
      dueDate: "Dec 14",
    },
  ],
  done: [
    {
      id: "p9",
      title: "Landing Page Redesign",
      description: "Modern redesign of homepage with improved conversion",
      project: "Frontend",
      priority: "high",
      timeEstimate: "18h",
      dueDate: "Dec 1",
    },
    {
      id: "p10",
      title: "Email Templates",
      description: "Professional email templates for user communications",
      project: "Design",
      priority: "medium",
      timeEstimate: "6h",
      dueDate: "Dec 5",
    },
    {
      id: "p11",
      title: "SEO Optimization",
      description:
        "Improve search rankings with meta tags and content optimization",
      project: "Marketing",
      priority: "medium",
      timeEstimate: "8h",
      dueDate: "Dec 10",
    },
    {
      id: "p12",
      title: "Bug Fixes v2.1",
      description: "Critical bug fixes for the latest product release",
      project: "Backend",
      priority: "critical",
      timeEstimate: "10h",
      dueDate: "Dec 12",
    },
  ],
};

interface ProjectStatusKanbanProps {
  isDarkMode: boolean;
}

export default function ProjectStatusKanban({
  isDarkMode,
}: ProjectStatusKanbanProps) {
  const columns = [
    { id: "draft", title: "Draft", icon: FileText, color: "gray" },
    { id: "planned", title: "Planned", icon: Calendar, color: "blue" },
    { id: "inProgress", title: "In Progress", icon: Clock, color: "orange" },
    { id: "done", title: "Done", icon: BarChart3, color: "green" },
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
            <FolderKanban className="w-5 h-5" />
          </div>
          <h3
            className={`text-2xl font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}
          >
            Project Status
          </h3>
        </div>
      </div>

      {/* Project Columns */}
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
                <ProjectColumn
                  key={column.id}
                  column={column}
                  tasks={
                    projectStatusTasks[
                      column.id as keyof typeof projectStatusTasks
                    ]
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

// Project Column Component
interface ProjectColumnProps {
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
    project: string;
    priority: string;
    timeEstimate: string;
    dueDate: string;
  }>;
  isDarkMode: boolean;
}

function ProjectColumn({ column, tasks, isDarkMode }: ProjectColumnProps) {
  const colorClasses = {
    gray: isDarkMode
      ? "bg-gray-500/15 text-gray-400 border-gray-500/30 shadow-gray-900/30"
      : "bg-gray-50/80 text-gray-600 border-gray-200/70 shadow-gray-200/40",
    blue: isDarkMode
      ? "bg-blue-500/15 text-blue-400 border-blue-500/30 shadow-blue-900/30"
      : "bg-blue-50/80 text-blue-600 border-blue-200/70 shadow-blue-200/40",
    orange: isDarkMode
      ? "bg-orange-500/15 text-orange-400 border-orange-500/30 shadow-orange-900/30"
      : "bg-orange-50/80 text-orange-600 border-orange-200/70 shadow-orange-200/40",
    green: isDarkMode
      ? "bg-green-500/15 text-green-400 border-green-500/30 shadow-green-900/30"
      : "bg-green-50/80 text-green-600 border-green-200/70 shadow-green-200/40",
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
                    {task.dueDate}
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
