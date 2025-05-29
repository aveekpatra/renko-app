import React from "react";

// Mock tasks data
const mockTasks = [
  {
    _id: "task_1",
    title: "Design landing page",
    priority: "high" as const,
    dueDate: "Tomorrow",
    boardName: "Product Development",
  },
  {
    _id: "task_2",
    title: "Set up analytics",
    priority: "medium" as const,
    dueDate: "Friday",
    boardName: "Marketing Campaign",
  },
  {
    _id: "task_3",
    title: "User testing session",
    priority: "high" as const,
    dueDate: "Monday",
    boardName: "Design System",
  },
];

interface QuickTasksProps {
  isDarkMode: boolean;
}

export default function QuickTasks({ isDarkMode }: QuickTasksProps) {
  return (
    <div>
      <h3
        className={`text-xl font-semibold mb-6 ${isDarkMode ? "text-gray-100" : "text-gray-900"}`}
      >
        Quick Tasks
      </h3>
      <div
        className={`backdrop-blur-md rounded-2xl border p-5 shadow-lg transition-all duration-300 ${
          isDarkMode
            ? "bg-gray-800/70 border-gray-700/60 shadow-black/20 hover:shadow-black/30 hover:bg-gray-800/80"
            : "bg-white/70 border-white/60 shadow-gray-900/10 hover:shadow-gray-900/15 hover:bg-white/80"
        }`}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {mockTasks.map((task) => (
            <TaskItem key={task._id} task={task} isDarkMode={isDarkMode} />
          ))}
        </div>
      </div>
    </div>
  );
}

interface TaskItemProps {
  task: (typeof mockTasks)[0];
  isDarkMode: boolean;
}

function TaskItem({ task, isDarkMode }: TaskItemProps) {
  const priorityColors = {
    high: isDarkMode
      ? "bg-red-900/50 text-red-400 border-red-800/60 shadow-sm shadow-red-900/30"
      : "bg-red-100/90 text-red-800 border-red-200/80 shadow-sm shadow-red-200/60",
    medium: isDarkMode
      ? "bg-yellow-900/50 text-yellow-400 border-yellow-800/60 shadow-sm shadow-yellow-900/30"
      : "bg-yellow-100/90 text-yellow-800 border-yellow-200/80 shadow-sm shadow-yellow-200/60",
    low: isDarkMode
      ? "bg-green-900/50 text-green-400 border-green-800/60 shadow-sm shadow-green-900/30"
      : "bg-green-100/90 text-green-800 border-green-200/80 shadow-sm shadow-green-200/60",
  };

  return (
    <div
      className={`flex items-start space-x-3 p-3 rounded-xl transition-all duration-200 group ${
        isDarkMode
          ? "hover:bg-gray-700/50 hover:backdrop-blur-sm hover:shadow-md hover:shadow-black/20"
          : "hover:bg-white/70 hover:backdrop-blur-sm hover:shadow-md hover:shadow-gray-900/10"
      }`}
    >
      <div className="flex-1">
        <h5
          className={`font-semibold mb-1 transition-colors ${
            isDarkMode
              ? "text-gray-100 group-hover:text-purple-400"
              : "text-gray-900 group-hover:text-purple-700"
          }`}
        >
          {task.title}
        </h5>
        <div
          className={`flex items-center space-x-2 text-sm ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
        >
          <span className="font-medium">{task.boardName}</span>
          <span>•</span>
          <span className="font-medium">{task.dueDate}</span>
        </div>
      </div>
      <span
        className={`px-3 py-1.5 rounded-full text-xs font-semibold border backdrop-blur-sm ${priorityColors[task.priority]}`}
      >
        {task.priority}
      </span>
    </div>
  );
}
