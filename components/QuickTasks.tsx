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
        className={`text-lg font-semibold mb-4 ${
          isDarkMode ? "text-white" : "text-gray-900"
        }`}
      >
        Quick Tasks
      </h3>
      <div
        className={`ios-card p-4 ${
          isDarkMode ? "bg-gray-800/60" : "bg-white/90"
        }`}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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
      ? "bg-red-500/20 text-red-300 border border-red-400/40"
      : "bg-red-100 text-red-700 border border-red-300/60",
    medium: isDarkMode
      ? "bg-yellow-500/20 text-yellow-300 border border-yellow-400/40"
      : "bg-yellow-100 text-yellow-700 border border-yellow-300/60",
    low: isDarkMode
      ? "bg-green-500/20 text-green-300 border border-green-400/40"
      : "bg-green-100 text-green-700 border border-green-300/60",
  };

  return (
    <div
      className={`flex items-start space-x-3 p-3 rounded-lg transition-all duration-200 group ${
        isDarkMode ? "hover:bg-gray-700/30" : "hover:bg-gray-50/80"
      }`}
    >
      <div className="flex-1 min-w-0">
        <h5
          className={`font-medium text-sm mb-1 transition-colors ${
            isDarkMode
              ? "text-white group-hover:text-blue-300"
              : "text-gray-900 group-hover:text-blue-700"
          }`}
        >
          {task.title}
        </h5>
        <div
          className={`flex items-center space-x-2 text-xs ${
            isDarkMode ? "text-gray-400" : "text-gray-600"
          }`}
        >
          <span className="font-medium">{task.boardName}</span>
          <span>•</span>
          <span className="font-medium">{task.dueDate}</span>
        </div>
      </div>
      <span
        className={`px-2 py-1 rounded-md text-xs font-medium ${priorityColors[task.priority]}`}
      >
        {task.priority}
      </span>
    </div>
  );
}
