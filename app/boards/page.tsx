"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  CheckCircle2,
  Circle,
  MoreHorizontal,
  Folder,
  Clock,
  Target,
} from "lucide-react";
import { useTheme } from "@/components/AppLayout";

interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: "urgent" | "normal" | "low";
  dueDate?: string;
  project?: string;
  color: "blue" | "green" | "orange" | "purple" | "pink";
}

interface Project {
  id: string;
  name: string;
  description: string;
  color: "blue" | "green" | "orange" | "purple" | "pink";
  tasks: {
    todo: Task[];
    inProgress: Task[];
    done: Task[];
  };
}

// Simple project data with rich task styling
const mockProjects: Project[] = [
  {
    id: "1",
    name: "Product Development",
    description: "Main product roadmap and features",
    color: "purple",
    tasks: {
      todo: [
        {
          id: "1",
          title: "Design user interface",
          description: "Create wireframes and mockups for the main dashboard",
          completed: false,
          priority: "urgent",
          color: "purple",
          project: "Frontend",
        },
        {
          id: "2",
          title: "Implement authentication",
          description: "Set up JWT tokens and user sessions",
          completed: false,
          priority: "normal",
          color: "blue",
          project: "Backend",
        },
        {
          id: "3",
          title: "Setup database schema",
          description: "Design tables and relationships",
          completed: false,
          priority: "normal",
          color: "green",
          project: "Database",
        },
        {
          id: "4",
          title: "Write documentation",
          description: "API docs and user guides",
          completed: false,
          priority: "low",
          color: "orange",
          project: "Docs",
        },
      ],
      inProgress: [
        {
          id: "5",
          title: "Build API endpoints",
          description: "REST API for user management",
          completed: false,
          priority: "urgent",
          color: "pink",
          project: "Backend",
        },
        {
          id: "6",
          title: "Frontend components",
          description: "Reusable UI components library",
          completed: false,
          priority: "normal",
          color: "blue",
          project: "Frontend",
        },
      ],
      done: [
        {
          id: "7",
          title: "Project setup",
          description: "Initialize repository and dependencies",
          completed: true,
          priority: "normal",
          color: "green",
          project: "Setup",
        },
        {
          id: "8",
          title: "Initial design",
          description: "Color scheme and typography",
          completed: true,
          priority: "normal",
          color: "purple",
          project: "Design",
        },
      ],
    },
  },
  {
    id: "2",
    name: "Marketing Website",
    description: "Landing page and marketing materials",
    color: "blue",
    tasks: {
      todo: [
        {
          id: "9",
          title: "Write copy",
          description: "Marketing copy for landing page",
          completed: false,
          priority: "normal",
          color: "orange",
          project: "Content",
        },
        {
          id: "10",
          title: "Design assets",
          description: "Icons, images, and illustrations",
          completed: false,
          priority: "urgent",
          color: "purple",
          project: "Design",
        },
      ],
      inProgress: [
        {
          id: "11",
          title: "SEO optimization",
          description: "Meta tags and search optimization",
          completed: false,
          priority: "low",
          color: "green",
          project: "Marketing",
        },
      ],
      done: [
        {
          id: "12",
          title: "Domain setup",
          description: "Register domain and configure DNS",
          completed: true,
          priority: "normal",
          color: "blue",
          project: "Infrastructure",
        },
      ],
    },
  },
];

export default function BoardsPage() {
  const projectSidebarWidth = 240;
  const { isDarkMode } = useTheme();
  const [isProjectSidebarCollapsed, setIsProjectSidebarCollapsed] =
    useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [selectedProject, setSelectedProject] = useState(mockProjects[0]);

  // Prevent hydration mismatch
  useEffect(() => {
    setIsHydrated(true);
    const savedProjectSidebarState = localStorage.getItem(
      "projectSidebarCollapsed",
    );
    if (savedProjectSidebarState) {
      setIsProjectSidebarCollapsed(JSON.parse(savedProjectSidebarState));
    }
  }, []);

  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem(
        "projectSidebarCollapsed",
        JSON.stringify(isProjectSidebarCollapsed),
      );
    }
  }, [isProjectSidebarCollapsed, isHydrated]);

  if (!isHydrated) {
    return (
      <div className="h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center">
        <div className="text-xl font-medium text-gray-700">Loading...</div>
      </div>
    );
  }

  const themeClasses = {
    projectSidebar: isDarkMode
      ? "bg-gray-800/70 backdrop-blur-xl border-r border-gray-700/50 shadow-xl shadow-black/20"
      : "bg-white/60 backdrop-blur-xl border-r border-white/40 shadow-xl shadow-gray-900/10",
    text: {
      primary: isDarkMode ? "text-gray-100" : "text-gray-900",
      secondary: isDarkMode ? "text-gray-300" : "text-gray-700",
      tertiary: isDarkMode ? "text-gray-400" : "text-gray-600",
    },
  };

  const getTaskColor = (color: string, isDark: boolean) => {
    const colors = {
      blue: isDark
        ? "bg-blue-500/15 text-blue-300 border-blue-400/30 shadow-blue-900/20"
        : "bg-blue-50/95 text-blue-800 border-blue-200/60 shadow-blue-200/30",
      green: isDark
        ? "bg-green-500/15 text-green-300 border-green-400/30 shadow-green-900/20"
        : "bg-green-50/95 text-green-800 border-green-200/60 shadow-green-200/30",
      orange: isDark
        ? "bg-orange-500/15 text-orange-300 border-orange-400/30 shadow-orange-900/20"
        : "bg-orange-50/95 text-orange-800 border-orange-200/60 shadow-orange-200/30",
      purple: isDark
        ? "bg-purple-500/15 text-purple-300 border-purple-400/30 shadow-purple-900/20"
        : "bg-purple-50/95 text-purple-800 border-purple-200/60 shadow-purple-200/30",
      pink: isDark
        ? "bg-pink-500/15 text-pink-300 border-pink-400/30 shadow-pink-900/20"
        : "bg-pink-50/95 text-pink-800 border-pink-200/60 shadow-pink-200/30",
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const getPriorityColor = (priority: string, isDark: boolean) => {
    switch (priority) {
      case "urgent":
        return isDark
          ? "bg-red-500/20 text-red-300 border-red-400/40"
          : "bg-red-100 text-red-700 border-red-300/60";
      case "normal":
        return isDark
          ? "bg-blue-500/20 text-blue-300 border-blue-400/40"
          : "bg-blue-100 text-blue-700 border-blue-300/60";
      case "low":
        return isDark
          ? "bg-green-500/20 text-green-300 border-green-400/40"
          : "bg-green-100 text-green-700 border-green-300/60";
      default:
        return isDark
          ? "bg-gray-500/20 text-gray-300 border-gray-400/40"
          : "bg-gray-100 text-gray-700 border-gray-300/60";
    }
  };

  const TaskCard = ({
    task,
    columnType,
  }: {
    task: Task;
    columnType: string;
  }) => (
    <div
      className={`p-3 rounded-xl cursor-pointer backdrop-blur-sm border shadow-md transition-all duration-200 hover:shadow-lg group ${getTaskColor(task.color, isDarkMode)}`}
    >
      {/* Task Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-start space-x-2 flex-1">
          <button className="mt-1 transition-colors">
            {columnType === "done" ? (
              <CheckCircle2 className="w-4 h-4 text-green-500" />
            ) : (
              <Circle className="w-4 h-4 opacity-60" />
            )}
          </button>
          <span
            className={`font-medium text-sm leading-tight flex-1 ${task.completed ? "line-through opacity-60" : ""}`}
          >
            {task.title}
          </span>
        </div>
        <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-black/10 rounded">
          <MoreHorizontal className="w-4 h-4 opacity-60" />
        </button>
      </div>

      {/* Task Description */}
      {task.description && (
        <p className="text-xs opacity-75 mb-2 leading-relaxed">
          {task.description}
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
          {task.project}
        </span>
        <span
          className={`text-xs px-2 py-1 rounded-lg font-medium backdrop-blur-sm border ${getPriorityColor(task.priority, isDarkMode)}`}
        >
          {task.priority}
        </span>
      </div>
    </div>
  );

  const Column = ({
    title,
    tasks,
    columnType,
  }: {
    title: string;
    tasks: Task[];
    columnType: string;
  }) => (
    <div className="flex-1 min-w-0 h-full flex flex-col">
      {/* Column Header */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center space-x-3">
          <div
            className={`p-2 rounded-xl backdrop-blur-sm border shadow-lg ${
              columnType === "todo"
                ? isDarkMode
                  ? "bg-blue-500/15 text-blue-400 border-blue-500/30 shadow-blue-900/30"
                  : "bg-blue-50/80 text-blue-600 border-blue-200/70 shadow-blue-200/40"
                : columnType === "progress"
                  ? isDarkMode
                    ? "bg-orange-500/15 text-orange-400 border-orange-500/30 shadow-orange-900/30"
                    : "bg-orange-50/80 text-orange-600 border-orange-200/70 shadow-orange-200/40"
                  : isDarkMode
                    ? "bg-green-500/15 text-green-400 border-green-500/30 shadow-green-900/30"
                    : "bg-green-50/80 text-green-600 border-green-200/70 shadow-green-200/40"
            }`}
          >
            {columnType === "todo" ? (
              <Target className="w-4 h-4" />
            ) : columnType === "progress" ? (
              <Clock className="w-4 h-4" />
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}
          </div>
          <div>
            <h3 className={`font-medium ${themeClasses.text.primary}`}>
              {title}
            </h3>
            <p className={`text-sm ${themeClasses.text.tertiary}`}>
              {tasks.length} tasks
            </p>
          </div>
        </div>
      </div>

      {/* Column Content */}
      <div
        className={`flex-1 min-h-0 overflow-y-auto scrollbar-thin rounded-lg p-3 backdrop-blur-sm border ${
          isDarkMode
            ? "bg-gray-800/30 border-gray-700/40 scrollbar-thumb-gray-600/50 scrollbar-track-gray-800/20"
            : "bg-gray-50/80 border-gray-200/50 scrollbar-thumb-gray-400/50 scrollbar-track-gray-100/50"
        }`}
      >
        <div className="space-y-2">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} columnType={columnType} />
          ))}
          <button
            className={`w-full p-3 rounded-lg border-2 border-dashed transition-all duration-200 text-sm font-medium ${
              isDarkMode
                ? "border-gray-600 hover:border-gray-500 text-gray-400 hover:bg-gray-700/30"
                : "border-gray-300 hover:border-gray-400 text-gray-600 hover:bg-gray-50/50"
            }`}
          >
            + Add task
          </button>
        </div>
      </div>
    </div>
  );

  const ProjectSidebar = () => (
    <div
      className={`${isProjectSidebarCollapsed ? "w-16" : `w-[${projectSidebarWidth}px]`} ${themeClasses.projectSidebar} flex flex-col transition-all duration-300`}
    >
      <div className="p-6 border-b border-gray-200/20">
        <div className="flex items-center justify-between">
          <h2
            className={`text-lg font-semibold ${themeClasses.text.primary} ${isProjectSidebarCollapsed ? "hidden" : ""}`}
          >
            Boards
          </h2>
          <button
            onClick={() =>
              setIsProjectSidebarCollapsed(!isProjectSidebarCollapsed)
            }
            className={`p-2 rounded-lg transition-all duration-200 ${isDarkMode ? "hover:bg-gray-700/50" : "hover:bg-gray-100/50"}`}
          >
            <Folder className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isProjectSidebarCollapsed && (
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
            {mockProjects.map((project) => (
              <button
                key={project.id}
                onClick={() => setSelectedProject(project)}
                className={`w-full p-4 rounded-xl text-left transition-all duration-200 border backdrop-blur-sm ${
                  selectedProject.id === project.id
                    ? isDarkMode
                      ? "bg-purple-500/20 text-purple-300 border-purple-400/40 shadow-lg"
                      : "bg-purple-50/80 text-purple-800 border-purple-200/60 shadow-lg"
                    : isDarkMode
                      ? "bg-gray-700/30 text-gray-300 border-gray-600/40 hover:bg-gray-700/50"
                      : "bg-white/50 text-gray-700 border-gray-200/50 hover:bg-white/80"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      project.color === "purple"
                        ? "bg-purple-500"
                        : project.color === "blue"
                          ? "bg-blue-500"
                          : project.color === "green"
                            ? "bg-green-500"
                            : project.color === "orange"
                              ? "bg-orange-500"
                              : "bg-pink-500"
                    }`}
                  />
                  <div className="flex-1">
                    <h3 className="font-medium text-sm">{project.name}</h3>
                    <p className="text-xs opacity-75">{project.description}</p>
                  </div>
                </div>
                <div className="mt-2 flex items-center space-x-2 text-xs opacity-75">
                  <span>
                    {project.tasks.todo.length +
                      project.tasks.inProgress.length +
                      project.tasks.done.length}{" "}
                    tasks
                  </span>
                  <span>•</span>
                  <span>{project.tasks.done.length} done</span>
                </div>
              </button>
            ))}
          </div>

          <button
            className={`w-full mt-4 p-4 rounded-xl border-2 border-dashed transition-all duration-200 text-sm font-medium ${
              isDarkMode
                ? "border-gray-600 hover:border-gray-500 text-gray-400 hover:bg-gray-700/30"
                : "border-gray-300 hover:border-gray-400 text-gray-600 hover:bg-white/50"
            }`}
          >
            <Plus className="w-4 h-4 mx-auto mb-1" />
            New Board
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex h-full overflow-hidden">
      {/* Project Sidebar */}
      <ProjectSidebar />

      {/* Main Kanban Area */}
      <main className="flex-1 overflow-hidden">
        <div className="h-full p-6">
          <div className="h-full grid grid-cols-3 gap-6">
            <Column
              title="To Do"
              tasks={selectedProject.tasks.todo}
              columnType="todo"
            />
            <Column
              title="In Progress"
              tasks={selectedProject.tasks.inProgress}
              columnType="progress"
            />
            <Column
              title="Done"
              tasks={selectedProject.tasks.done}
              columnType="done"
            />
          </div>
        </div>
      </main>
    </div>
  );
}
