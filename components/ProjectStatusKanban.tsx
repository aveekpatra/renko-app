import React from "react";
import {
  FolderKanban,
  FileText,
  Calendar,
  Clock,
  BarChart3,
} from "lucide-react";

// Project status tasks data
const projectStatusTasks = {
  draft: [
    {
      id: "p1",
      title: "AI Integration Proposal",
      project: "Product",
      dueDate: "Dec 15",
    },
    {
      id: "p2",
      title: "New Onboarding Flow",
      project: "UX",
      dueDate: "Dec 20",
    },
  ],
  planned: [
    {
      id: "p3",
      title: "Database Optimization",
      project: "Backend",
      dueDate: "Jan 5",
    },
    {
      id: "p4",
      title: "Mobile Responsive Design",
      project: "Frontend",
      dueDate: "Jan 10",
    },
    {
      id: "p5",
      title: "API Documentation",
      project: "Backend",
      dueDate: "Jan 15",
    },
  ],
  inProgress: [
    {
      id: "p6",
      title: "User Dashboard Redesign",
      project: "UX",
      dueDate: "Dec 30",
    },
    {
      id: "p7",
      title: "Authentication System",
      project: "Backend",
      dueDate: "Jan 2",
    },
    {
      id: "p8",
      title: "Payment Integration",
      project: "Backend",
      dueDate: "Jan 8",
    },
  ],
  done: [
    {
      id: "p9",
      title: "Landing Page Redesign",
      project: "Frontend",
      dueDate: "Dec 1",
    },
    {
      id: "p10",
      title: "Email Templates",
      project: "Design",
      dueDate: "Dec 5",
    },
    {
      id: "p11",
      title: "SEO Optimization",
      project: "Marketing",
      dueDate: "Dec 10",
    },
    {
      id: "p12",
      title: "Bug Fixes v2.1",
      project: "Backend",
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
    project: string;
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
              <h5
                className={`font-medium text-sm mb-3 leading-relaxed ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                {task.title}
              </h5>
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs px-2 py-1 rounded-lg font-medium backdrop-blur-sm border ${
                    isDarkMode
                      ? "bg-purple-500/20 text-purple-300 border-purple-400/30"
                      : "bg-purple-50/90 text-purple-700 border-purple-200/60"
                  }`}
                >
                  {task.project}
                </span>
                <span
                  className={`text-xs font-medium ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
                >
                  {task.dueDate}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
