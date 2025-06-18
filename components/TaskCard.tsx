import React, { useState } from "react";
import {
  Clock,
  Edit3,
  Trash2,
  MoreHorizontal,
  Calendar,
  User,
  Timer,
} from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Id } from "@/convex/_generated/dataModel";

interface Task {
  _id: Id<"tasks">;
  title: string;
  description?: string;
  status: string;
  priority?: string;
  dueDate?: number;
  columnId: Id<"columns">;
  position: number;
  tags?: string[];
  timeEstimate?: number;
  userId: Id<"users">;
  assignedTo?: Id<"users">;
  createdAt: number;
  updatedAt: number;
}

interface TaskCardProps {
  task: Task;
  isDarkMode: boolean;
  onEditTask: (taskId: Id<"tasks">) => void;
  onDeleteTask?: (taskId: Id<"tasks">) => void;
}

export default function TaskCard({
  task,
  isDarkMode,
  onEditTask,
  onDeleteTask,
}: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task._id,
    data: { task },
  });
  const [showMenu, setShowMenu] = useState(false);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Get card styling with better contrast and priority tinting
  const getCardStyling = (priority?: string) => {
    const baseStyles = isDarkMode
      ? "bg-gray-800/90 border-gray-600/50 shadow-lg shadow-black/20"
      : "bg-white/95 border-gray-200/70 shadow-lg shadow-gray-500/10";

    const priorityTint = priority
      ? {
          high: isDarkMode
            ? "border-l-4 border-l-red-500/70 bg-red-950/20"
            : "border-l-4 border-l-red-500 bg-red-50/80",
          medium: isDarkMode
            ? "border-l-4 border-l-orange-500/70 bg-orange-950/20"
            : "border-l-4 border-l-orange-500 bg-orange-50/80",
          low: isDarkMode
            ? "border-l-4 border-l-green-500/70 bg-green-950/20"
            : "border-l-4 border-l-green-500 bg-green-50/80",
        }[priority]
      : "";

    return `${baseStyles} ${priorityTint}`;
  };

  // Format date for display
  const formatDate = (timestamp?: number) => {
    if (!timestamp) return null;
    const date = new Date(timestamp);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === tomorrow.toDateString()) return "Tomorrow";

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
    });
  };

  // Format time estimate
  const formatTimeEstimate = (minutes?: number) => {
    if (!minutes) return null;
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0
      ? `${hours}h ${remainingMinutes}m`
      : `${hours}h`;
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className={`p-3 rounded-lg backdrop-blur-md transition-all duration-300 opacity-50 cursor-grabbing ${getCardStyling(task.priority)}`}
      >
        <h4
          className={`text-sm font-medium ${isDarkMode ? "text-gray-200" : "text-gray-800"}`}
        >
          {task.title}
        </h4>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`group relative p-3 rounded-lg backdrop-blur-md transition-all duration-200 hover:shadow-xl hover:-translate-y-1 cursor-grab active:cursor-grabbing ${getCardStyling(task.priority)}`}
      onMouseLeave={() => setShowMenu(false)}
    >
      {/* Header with title and menu */}
      <div className="flex items-start justify-between mb-2">
        <h4
          className={`text-sm font-semibold leading-tight pr-2 ${isDarkMode ? "text-gray-100" : "text-gray-900"}`}
        >
          {task.title}
        </h4>

        {/* Three-dot menu */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu(!showMenu);
          }}
          className={`p-1 rounded transition-all duration-200 ${
            isDarkMode
              ? "hover:bg-gray-700/50 text-gray-400 hover:text-gray-200"
              : "hover:bg-gray-100/80 text-gray-500 hover:text-gray-700"
          } opacity-0 group-hover:opacity-100 shrink-0`}
        >
          <MoreHorizontal className="w-3.5 h-3.5" />
        </button>

        {showMenu && (
          <div
            className={`absolute right-0 top-8 w-40 rounded-lg shadow-xl border z-50 ${
              isDarkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEditTask(task._id);
                setShowMenu(false);
              }}
              className={`w-full flex items-center space-x-2 px-3 py-2 text-sm transition-colors rounded-t-lg ${
                isDarkMode
                  ? "hover:bg-gray-700 text-gray-300"
                  : "hover:bg-gray-50 text-gray-700"
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Task</span>
            </button>
            {onDeleteTask && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteTask(task._id);
                  setShowMenu(false);
                }}
                className={`w-full flex items-center space-x-2 px-3 py-2 text-sm transition-colors rounded-b-lg ${
                  isDarkMode
                    ? "hover:bg-red-900/20 text-red-400"
                    : "hover:bg-red-50 text-red-600"
                }`}
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Task</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Description */}
      {task.description && (
        <p
          className={`text-xs leading-relaxed mb-3 line-clamp-2 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}
        >
          {task.description}
        </p>
      )}

      {/* Vital Information */}
      <div className="space-y-2">
        {/* Priority and Time Estimate Row */}
        <div className="flex items-center justify-between">
          {task.priority && (
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                task.priority === "high"
                  ? isDarkMode
                    ? "bg-red-500/20 text-red-300 border border-red-500/30"
                    : "bg-red-100 text-red-700 border border-red-200"
                  : task.priority === "medium"
                    ? isDarkMode
                      ? "bg-orange-500/20 text-orange-300 border border-orange-500/30"
                      : "bg-orange-100 text-orange-700 border border-orange-200"
                    : isDarkMode
                      ? "bg-green-500/20 text-green-300 border border-green-500/30"
                      : "bg-green-100 text-green-700 border border-green-200"
              }`}
            >
              {task.priority}
            </span>
          )}

          {task.timeEstimate && (
            <div
              className={`flex items-center space-x-1 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
            >
              <Timer className="w-3 h-3" />
              <span className="text-xs">
                {formatTimeEstimate(task.timeEstimate)}
              </span>
            </div>
          )}
        </div>

        {/* Due Date and Assignee Row */}
        <div className="flex items-center justify-between">
          {task.dueDate && (
            <div
              className={`flex items-center space-x-1 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
            >
              <Calendar className="w-3 h-3" />
              <span className="text-xs">{formatDate(task.dueDate)}</span>
            </div>
          )}

          {task.assignedTo && (
            <div
              className={`flex items-center space-x-1 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
            >
              <User className="w-3 h-3" />
              <span className="text-xs">Assigned</span>
            </div>
          )}
        </div>

        {/* Tags */}
        {task.tags && task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {task.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className={`px-1.5 py-0.5 rounded text-xs ${
                  isDarkMode
                    ? "bg-gray-700/60 text-gray-300"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {tag}
              </span>
            ))}
            {task.tags.length > 3 && (
              <span
                className={`text-xs ${isDarkMode ? "text-gray-500" : "text-gray-500"}`}
              >
                +{task.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
