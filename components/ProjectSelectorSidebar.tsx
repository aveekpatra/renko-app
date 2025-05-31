"use client";

import React from "react";
import {
  FolderOpen,
  Plus,
  ChevronLeft,
  ChevronRight,
  Clock,
  BarChart3,
  CheckCircle2,
  Circle,
  PlayCircle,
} from "lucide-react";

interface Project {
  _id: string;
  name: string;
  description: string;
  color: string;
  taskCount: number;
  completedCount: number;
  dueDate: string;
  status: "draft" | "planned" | "in-progress" | "done";
  priority: "low" | "medium" | "high" | "critical";
}

interface ProjectSelectorSidebarProps {
  projects: Project[];
  selectedProject: Project;
  onSelectProject: (project: Project) => void;
  isDarkMode: boolean;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export default function ProjectSelectorSidebar({
  projects,
  selectedProject,
  onSelectProject,
  isDarkMode,
  isCollapsed,
  setIsCollapsed,
}: ProjectSelectorSidebarProps) {
  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const currentSidebarWidth = isCollapsed ? 80 : 320;

  // Theme classes
  const themeClasses = {
    sidebar: isDarkMode
      ? "bg-gray-800/80 backdrop-blur-xl border-r border-gray-700/50 text-gray-100 flex flex-col shadow-xl shadow-black/20 h-full relative"
      : "bg-white/80 backdrop-blur-xl border-r border-gray-200/60 text-gray-800 flex flex-col shadow-xl shadow-gray-900/10 h-full relative",
    headerSection: isDarkMode
      ? "bg-gradient-to-r from-gray-700/20 to-gray-800/10"
      : "bg-gradient-to-r from-white/30 to-white/10",
    text: {
      primary: isDarkMode ? "text-gray-100" : "text-gray-800",
      secondary: isDarkMode ? "text-gray-300" : "text-gray-700",
      tertiary: isDarkMode ? "text-gray-400" : "text-gray-600",
    },
  };

  const getStatusIcon = (status: Project["status"]) => {
    switch (status) {
      case "draft":
        return Circle;
      case "planned":
        return Clock;
      case "in-progress":
        return PlayCircle;
      case "done":
        return CheckCircle2;
      default:
        return Circle;
    }
  };

  const getStatusColor = (status: Project["status"]) => {
    switch (status) {
      case "draft":
        return "text-gray-400";
      case "planned":
        return "text-blue-400";
      case "in-progress":
        return "text-orange-400";
      case "done":
        return "text-green-400";
      default:
        return "text-gray-400";
    }
  };

  const getPriorityColor = (priority: Project["priority"]) => {
    switch (priority) {
      case "low":
        return isDarkMode
          ? "bg-green-500/20 text-green-300 border-green-400/40"
          : "bg-green-100 text-green-700 border-green-300/60";
      case "medium":
        return isDarkMode
          ? "bg-yellow-500/20 text-yellow-300 border-yellow-400/40"
          : "bg-yellow-100 text-yellow-700 border-yellow-300/60";
      case "high":
        return isDarkMode
          ? "bg-orange-500/20 text-orange-300 border-orange-400/40"
          : "bg-orange-100 text-orange-700 border-orange-300/60";
      case "critical":
        return isDarkMode
          ? "bg-red-500/20 text-red-300 border-red-400/40"
          : "bg-red-100 text-red-700 border-red-300/60";
      default:
        return isDarkMode
          ? "bg-gray-500/20 text-gray-300 border-gray-400/40"
          : "bg-gray-100 text-gray-700 border-gray-300/60";
    }
  };

  return (
    <aside
      className={themeClasses.sidebar}
      style={{ width: currentSidebarWidth }}
    >
      {/* Header Section */}
      <div
        className={`p-5 border-b ${isDarkMode ? "border-gray-700/50" : "border-gray-200/50"} flex-shrink-0 ${themeClasses.headerSection}`}
      >
        <div className="flex items-center justify-between">
          <div
            className={`flex items-center space-x-3 ${isCollapsed ? "justify-center" : ""}`}
          >
            <div
              className={`p-2.5 rounded-xl backdrop-blur-sm border shadow-sm ${
                isDarkMode
                  ? "bg-gray-800/80 border-gray-700/50 text-purple-400 shadow-black/20"
                  : "bg-white/80 border-gray-200/60 text-purple-600 shadow-gray-900/10"
              }`}
            >
              <FolderOpen className="w-5 h-5" />
            </div>
            {!isCollapsed && (
              <div>
                <h2
                  className={`text-lg font-semibold ${themeClasses.text.primary}`}
                >
                  Projects
                </h2>
                <p className={`text-sm ${themeClasses.text.tertiary}`}>
                  {projects.length} projects
                </p>
              </div>
            )}
          </div>
          {!isCollapsed && (
            <div className="flex items-center space-x-2">
              {/* New Project Button */}
              <button
                className={`p-2 rounded-lg transition-all duration-200 hover:shadow-sm ${
                  isDarkMode
                    ? "hover:bg-gray-700/50 text-gray-400 hover:text-gray-200"
                    : "hover:bg-white/60 text-gray-600 hover:text-gray-800"
                }`}
              >
                <Plus className="w-4 h-4" />
              </button>

              {/* Collapse Button */}
              <button
                onClick={toggleSidebar}
                className={`p-2 rounded-lg transition-all duration-200 hover:shadow-sm ${
                  isDarkMode
                    ? "hover:bg-gray-700/50 text-gray-400 hover:text-gray-200"
                    : "hover:bg-white/60 text-gray-600 hover:text-gray-800"
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          )}
          {isCollapsed && (
            <div className="flex items-center justify-center">
              {/* Collapse Button for collapsed state */}
              <button
                onClick={toggleSidebar}
                className={`p-2 rounded-lg transition-all duration-200 hover:shadow-sm ${
                  isDarkMode
                    ? "hover:bg-gray-700/50 text-gray-400 hover:text-gray-200"
                    : "hover:bg-white/60 text-gray-600 hover:text-gray-800"
                }`}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Projects List - Scrollable */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-3">
          {projects.map((project) => {
            const isSelected = selectedProject._id === project._id;
            const StatusIcon = getStatusIcon(project.status);
            const statusColor = getStatusColor(project.status);
            const priorityColor = getPriorityColor(project.priority);
            const completionPercentage = Math.round(
              (project.completedCount / project.taskCount) * 100,
            );

            return (
              <div key={project._id}>
                {isCollapsed ? (
                  // Collapsed project item
                  <button
                    onClick={() => onSelectProject(project)}
                    className={`w-full p-3 rounded-xl transition-all duration-200 backdrop-blur-sm border shadow-sm ${
                      isSelected
                        ? isDarkMode
                          ? "bg-purple-500/20 border-purple-400/60 text-purple-300 shadow-purple-500/20"
                          : "bg-purple-100/80 border-purple-300/60 text-purple-700 shadow-purple-500/20"
                        : isDarkMode
                          ? "bg-gray-800/50 border-gray-700/50 text-gray-300 hover:bg-gray-700/60 hover:border-gray-600/60 shadow-black/20"
                          : "bg-white/80 border-gray-200/60 text-gray-700 hover:bg-white/90 hover:border-gray-300/60 shadow-gray-900/10"
                    }`}
                  >
                    <div className="flex items-center justify-center">
                      <div
                        className="w-6 h-6 rounded-lg flex items-center justify-center text-white text-xs font-medium"
                        style={{ backgroundColor: project.color }}
                      >
                        {project.name.charAt(0)}
                      </div>
                    </div>
                  </button>
                ) : (
                  // Full project item
                  <button
                    onClick={() => onSelectProject(project)}
                    className={`w-full p-4 rounded-xl transition-all duration-200 backdrop-blur-sm border shadow-sm text-left ${
                      isSelected
                        ? isDarkMode
                          ? "bg-purple-500/20 border-purple-400/60 shadow-purple-500/20"
                          : "bg-purple-100/80 border-purple-300/60 shadow-purple-500/20"
                        : isDarkMode
                          ? "bg-gray-800/50 border-gray-700/50 hover:bg-gray-700/60 hover:border-gray-600/60 shadow-black/20"
                          : "bg-white/80 border-gray-200/60 hover:bg-white/90 hover:border-gray-300/60 shadow-gray-900/10"
                    }`}
                  >
                    {/* Project Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3 flex-1">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-medium flex-shrink-0"
                          style={{ backgroundColor: project.color }}
                        >
                          {project.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3
                            className={`font-semibold text-sm leading-tight truncate ${
                              isSelected
                                ? isDarkMode
                                  ? "text-purple-200"
                                  : "text-purple-800"
                                : themeClasses.text.primary
                            }`}
                          >
                            {project.name}
                          </h3>
                          <p
                            className={`text-xs truncate ${
                              isSelected
                                ? isDarkMode
                                  ? "text-purple-300/70"
                                  : "text-purple-700/70"
                                : themeClasses.text.tertiary
                            }`}
                          >
                            {project.description}
                          </p>
                        </div>
                      </div>
                      <StatusIcon
                        className={`w-4 h-4 flex-shrink-0 ${statusColor}`}
                      />
                    </div>

                    {/* Project Stats */}
                    <div className="space-y-2">
                      {/* Progress Bar */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span
                            className={
                              isSelected
                                ? isDarkMode
                                  ? "text-purple-300/80"
                                  : "text-purple-700/80"
                                : themeClasses.text.tertiary
                            }
                          >
                            Progress
                          </span>
                          <span
                            className={`font-medium ${
                              isSelected
                                ? isDarkMode
                                  ? "text-purple-200"
                                  : "text-purple-800"
                                : themeClasses.text.secondary
                            }`}
                          >
                            {completionPercentage}%
                          </span>
                        </div>
                        <div
                          className={`w-full h-1.5 rounded-full ${
                            isDarkMode ? "bg-gray-700/50" : "bg-gray-200/60"
                          }`}
                        >
                          <div
                            className="h-full rounded-full transition-all duration-300"
                            style={{
                              width: `${completionPercentage}%`,
                              backgroundColor: project.color,
                            }}
                          />
                        </div>
                      </div>

                      {/* Task Count and Priority */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-xs">
                          <BarChart3 className="w-3 h-3" />
                          <span
                            className={
                              isSelected
                                ? isDarkMode
                                  ? "text-purple-300/80"
                                  : "text-purple-700/80"
                                : themeClasses.text.tertiary
                            }
                          >
                            {project.completedCount}/{project.taskCount} tasks
                          </span>
                        </div>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-md font-medium backdrop-blur-sm border ${priorityColor}`}
                        >
                          {project.priority}
                        </span>
                      </div>

                      {/* Due Date */}
                      <div className="flex items-center space-x-2 text-xs">
                        <Clock className="w-3 h-3" />
                        <span
                          className={
                            isSelected
                              ? isDarkMode
                                ? "text-purple-300/80"
                                : "text-purple-700/80"
                              : themeClasses.text.tertiary
                          }
                        >
                          Due {new Date(project.dueDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Actions */}
      {!isCollapsed && (
        <div
          className={`p-4 border-t ${isDarkMode ? "border-gray-700/50" : "border-gray-200/50"} flex-shrink-0`}
        >
          <button
            className={`w-full p-3 rounded-xl backdrop-blur-sm border transition-all duration-200 flex items-center justify-center space-x-2 ${
              isDarkMode
                ? "bg-gray-800/50 border-gray-700/50 text-gray-300 hover:bg-gray-700/60 hover:border-gray-600/60 shadow-black/20"
                : "bg-white/80 border-gray-200/60 text-gray-700 hover:bg-white/90 hover:border-gray-300/60 shadow-gray-900/10"
            }`}
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm font-medium">New Project</span>
          </button>
        </div>
      )}
    </aside>
  );
}
