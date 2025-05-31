"use client";

import React from "react";
import {
  Plus,
  Clock,
  User,
  Calendar,
  Flag,
  MoreVertical,
  Target,
  TrendingUp,
  Users,
  Settings,
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

interface Task {
  _id: string;
  title: string;
  description: string;
  priority: "low" | "medium" | "high" | "critical";
  dueDate: string;
  assignee?: string;
  timeEstimate: string;
  tags: string[];
  subtasks?: number;
  completedSubtasks?: number;
}

interface Column {
  _id: string;
  title: string;
  color: string;
  tasks: Task[];
  icon: React.ComponentType<{ className?: string }>;
}

interface ProjectKanbanBoardProps {
  project: Project;
  isDarkMode: boolean;
}

// Mock tasks data for the kanban board
const getMockTasksForProject = (projectId: string): Column[] => {
  const allTasks: Record<string, Task[]> = {
    project_1: [
      {
        _id: "task_1",
        title: "User Authentication Flow",
        description: "Implement OAuth and JWT token management",
        priority: "high",
        dueDate: "2024-01-25",
        assignee: "John D.",
        timeEstimate: "2 days",
        tags: ["Backend", "Security"],
        subtasks: 4,
        completedSubtasks: 2,
      },
      {
        _id: "task_2",
        title: "Dashboard Analytics",
        description: "Create comprehensive analytics dashboard",
        priority: "medium",
        dueDate: "2024-01-30",
        assignee: "Sarah M.",
        timeEstimate: "3 days",
        tags: ["Frontend", "Analytics"],
        subtasks: 6,
        completedSubtasks: 1,
      },
      {
        _id: "task_3",
        title: "API Documentation",
        description: "Complete API documentation with examples",
        priority: "low",
        dueDate: "2024-02-05",
        assignee: "Mike R.",
        timeEstimate: "1 day",
        tags: ["Documentation"],
      },
      {
        _id: "task_4",
        title: "Payment Gateway",
        description: "Integrate Stripe payment processing",
        priority: "critical",
        dueDate: "2024-01-28",
        assignee: "Alex K.",
        timeEstimate: "4 days",
        tags: ["Backend", "Payment"],
        subtasks: 8,
        completedSubtasks: 6,
      },
    ],
    project_2: [
      {
        _id: "task_5",
        title: "Social Media Campaign",
        description: "Design and launch Q4 social media campaign",
        priority: "high",
        dueDate: "2024-01-20",
        assignee: "Emma L.",
        timeEstimate: "5 days",
        tags: ["Marketing", "Social"],
        subtasks: 3,
        completedSubtasks: 2,
      },
      {
        _id: "task_6",
        title: "Email Newsletter",
        description: "Create monthly newsletter template",
        priority: "medium",
        dueDate: "2024-01-26",
        assignee: "David P.",
        timeEstimate: "2 days",
        tags: ["Email", "Content"],
      },
    ],
    project_3: [
      {
        _id: "task_7",
        title: "Component Library",
        description: "Build reusable UI component library",
        priority: "high",
        dueDate: "2024-02-10",
        assignee: "Lisa W.",
        timeEstimate: "6 days",
        tags: ["Design", "Components"],
        subtasks: 12,
        completedSubtasks: 8,
      },
    ],
    project_4: [
      {
        _id: "task_8",
        title: "Mobile App Architecture",
        description: "Design mobile app architecture and navigation",
        priority: "critical",
        dueDate: "2024-02-01",
        assignee: "Tom H.",
        timeEstimate: "3 days",
        tags: ["Mobile", "Architecture"],
        subtasks: 5,
        completedSubtasks: 1,
      },
    ],
    project_5: [
      {
        _id: "task_9",
        title: "API Testing",
        description: "Complete integration testing for all APIs",
        priority: "medium",
        dueDate: "2024-01-15",
        assignee: "Nina S.",
        timeEstimate: "2 days",
        tags: ["Testing", "API"],
        subtasks: 3,
        completedSubtasks: 3,
      },
    ],
  };

  const projectTasks = allTasks[projectId] || allTasks.project_1;

  return [
    {
      _id: "todo",
      title: "To Do",
      color: "#EF4444",
      icon: Flag,
      tasks: projectTasks.filter((_, index) => index % 4 === 0),
    },
    {
      _id: "in-progress",
      title: "In Progress",
      color: "#F59E0B",
      icon: Clock,
      tasks: projectTasks.filter((_, index) => index % 4 === 1),
    },
    {
      _id: "review",
      title: "Review",
      color: "#3B82F6",
      icon: Target,
      tasks: projectTasks.filter((_, index) => index % 4 === 2),
    },
    {
      _id: "done",
      title: "Done",
      color: "#10B981",
      icon: TrendingUp,
      tasks: projectTasks.filter((_, index) => index % 4 === 3),
    },
  ];
};

export default function ProjectKanbanBoard({
  project,
  isDarkMode,
}: ProjectKanbanBoardProps) {
  const columns = getMockTasksForProject(project._id);
  const completionPercentage = Math.round(
    (project.completedCount / project.taskCount) * 100,
  );

  // Theme classes
  const themeClasses = {
    container: isDarkMode
      ? "bg-gray-900/60 backdrop-blur-xl text-gray-100"
      : "bg-gray-50/80 backdrop-blur-xl text-gray-800",
    header: isDarkMode
      ? "bg-gray-800/60 backdrop-blur-xl border-b border-gray-700/50"
      : "bg-white/80 backdrop-blur-xl border-b border-gray-200/60",
    text: {
      primary: isDarkMode ? "text-gray-100" : "text-gray-800",
      secondary: isDarkMode ? "text-gray-300" : "text-gray-700",
      tertiary: isDarkMode ? "text-gray-400" : "text-gray-600",
    },
  };

  const getPriorityColor = (priority: Task["priority"]) => {
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
    <div className={`h-full flex flex-col ${themeClasses.container}`}>
      {/* Project Header */}
      <div className={`p-6 flex-shrink-0 ${themeClasses.header}`}>
        <div className="flex items-center justify-between">
          {/* Project Info */}
          <div className="flex items-center space-x-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-lg font-semibold shadow-lg"
              style={{ backgroundColor: project.color }}
            >
              {project.name.charAt(0)}
            </div>
            <div>
              <h1
                className={`text-2xl font-semibold ${themeClasses.text.primary}`}
              >
                {project.name}
              </h1>
              <p className={`text-sm ${themeClasses.text.tertiary}`}>
                {project.description}
              </p>
            </div>
          </div>

          {/* Project Stats */}
          <div className="flex items-center space-x-6">
            {/* Progress */}
            <div className="text-center">
              <div
                className={`text-2xl font-bold ${themeClasses.text.primary}`}
              >
                {completionPercentage}%
              </div>
              <div className={`text-xs ${themeClasses.text.tertiary}`}>
                Complete
              </div>
            </div>

            {/* Tasks */}
            <div className="text-center">
              <div
                className={`text-2xl font-bold ${themeClasses.text.primary}`}
              >
                {project.completedCount}/{project.taskCount}
              </div>
              <div className={`text-xs ${themeClasses.text.tertiary}`}>
                Tasks
              </div>
            </div>

            {/* Due Date */}
            <div className="text-center">
              <div
                className={`text-sm font-medium ${themeClasses.text.primary}`}
              >
                {new Date(project.dueDate).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </div>
              <div className={`text-xs ${themeClasses.text.tertiary}`}>
                Due Date
              </div>
            </div>

            {/* Team */}
            <div className="flex items-center space-x-2">
              <Users className={`w-5 h-5 ${themeClasses.text.secondary}`} />
              <div className="flex -space-x-2">
                {["JD", "SM", "MR", "AK"].map((initials, index) => (
                  <div
                    key={index}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium text-white border-2 ${
                      isDarkMode ? "border-gray-800" : "border-white"
                    }`}
                    style={{ backgroundColor: project.color }}
                  >
                    {initials}
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <button
              className={`p-2 rounded-lg transition-all duration-200 ${
                isDarkMode
                  ? "hover:bg-gray-700/50 text-gray-400 hover:text-gray-200"
                  : "hover:bg-gray-100/60 text-gray-600 hover:text-gray-800"
              }`}
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div
            className={`w-full h-2 rounded-full ${
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
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-hidden p-6">
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-400/50 scrollbar-track-gray-100/50 h-full">
          <div className="flex gap-6 min-w-max h-full">
            {columns.map((column) => (
              <div
                key={column._id}
                className="w-[300px] flex-shrink-0 flex flex-col h-full"
              >
                {/* Column Header */}
                <div
                  className={`p-4 rounded-xl backdrop-blur-sm border shadow-sm mb-4 ${
                    isDarkMode
                      ? "bg-gray-800/50 border-gray-700/50 shadow-black/20"
                      : "bg-white/80 border-gray-200/60 shadow-gray-900/10"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className="p-2 rounded-lg flex items-center justify-center text-white"
                        style={{ backgroundColor: column.color }}
                      >
                        <column.icon className="w-4 h-4" />
                      </div>
                      <div>
                        <h3
                          className={`font-semibold ${themeClasses.text.primary}`}
                        >
                          {column.title}
                        </h3>
                        <p className={`text-sm ${themeClasses.text.tertiary}`}>
                          {column.tasks.length} tasks
                        </p>
                      </div>
                    </div>
                    <button
                      className={`p-2 rounded-lg transition-all duration-200 ${
                        isDarkMode
                          ? "hover:bg-gray-700/50 text-gray-400 hover:text-gray-200"
                          : "hover:bg-gray-100/60 text-gray-600 hover:text-gray-800"
                      }`}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Tasks */}
                <div className="flex-1 space-y-3 overflow-y-auto">
                  {column.tasks.map((task) => {
                    const priorityColor = getPriorityColor(task.priority);
                    const hasSubtasks =
                      task.subtasks && task.completedSubtasks !== undefined;
                    const subtaskProgress = hasSubtasks
                      ? Math.round(
                          (task.completedSubtasks! / task.subtasks!) * 100,
                        )
                      : 0;

                    return (
                      <div
                        key={task._id}
                        className={`p-4 rounded-xl cursor-pointer transition-all duration-200 backdrop-blur-sm border shadow-sm ${
                          isDarkMode
                            ? "bg-gray-800/40 border-gray-700/50 hover:bg-gray-700/50 hover:border-gray-600/60 shadow-black/20"
                            : "bg-white/90 border-gray-200/60 hover:bg-white hover:border-gray-300/60 shadow-gray-900/10"
                        }`}
                      >
                        {/* Task Header */}
                        <div className="flex items-start justify-between mb-3">
                          <h4
                            className={`font-medium text-sm leading-tight flex-1 ${themeClasses.text.primary}`}
                          >
                            {task.title}
                          </h4>
                          <button
                            className={`p-1 rounded transition-colors ${
                              isDarkMode
                                ? "hover:bg-gray-600/50 text-gray-400"
                                : "hover:bg-gray-100 text-gray-500"
                            }`}
                          >
                            <MoreVertical className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Task Description */}
                        <p
                          className={`text-xs mb-3 leading-relaxed ${themeClasses.text.tertiary}`}
                        >
                          {task.description}
                        </p>

                        {/* Subtasks Progress */}
                        {hasSubtasks && (
                          <div className="mb-3">
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className={themeClasses.text.tertiary}>
                                Subtasks
                              </span>
                              <span
                                className={`font-medium ${themeClasses.text.secondary}`}
                              >
                                {task.completedSubtasks}/{task.subtasks}
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
                                  width: `${subtaskProgress}%`,
                                  backgroundColor: column.color,
                                }}
                              />
                            </div>
                          </div>
                        )}

                        {/* Task Tags */}
                        <div className="flex flex-wrap gap-1 mb-3">
                          {task.tags.map((tag, index) => (
                            <span
                              key={index}
                              className={`text-xs px-2 py-1 rounded-md font-medium backdrop-blur-sm border ${
                                isDarkMode
                                  ? "bg-gray-700/50 text-gray-300 border-gray-600/50"
                                  : "bg-white/80 text-gray-600 border-gray-300/60"
                              }`}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>

                        {/* Task Footer */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3 text-xs">
                            {/* Due Date */}
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-3 h-3" />
                              <span className={themeClasses.text.tertiary}>
                                {new Date(task.dueDate).toLocaleDateString(
                                  "en-US",
                                  {
                                    month: "short",
                                    day: "numeric",
                                  },
                                )}
                              </span>
                            </div>

                            {/* Time Estimate */}
                            <div className="flex items-center space-x-1">
                              <Clock className="w-3 h-3" />
                              <span className={themeClasses.text.tertiary}>
                                {task.timeEstimate}
                              </span>
                            </div>

                            {/* Assignee */}
                            {task.assignee && (
                              <div className="flex items-center space-x-1">
                                <User className="w-3 h-3" />
                                <span className={themeClasses.text.tertiary}>
                                  {task.assignee}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Priority Badge */}
                          <span
                            className={`text-xs px-2 py-1 rounded-md font-medium backdrop-blur-sm border ${priorityColor}`}
                          >
                            {task.priority}
                          </span>
                        </div>
                      </div>
                    );
                  })}

                  {/* Add Task Button */}
                  <button
                    className={`w-full p-4 rounded-xl backdrop-blur-sm border-2 border-dashed transition-all duration-200 flex items-center justify-center space-x-2 ${
                      isDarkMode
                        ? "border-gray-600/50 text-gray-400 hover:border-gray-500/60 hover:text-gray-300 hover:bg-gray-800/20"
                        : "border-gray-300/60 text-gray-500 hover:border-gray-400/60 hover:text-gray-600 hover:bg-gray-50/60"
                    }`}
                  >
                    <Plus className="w-4 h-4" />
                    <span className="text-sm font-medium">Add Task</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
