import React, { useState, useEffect } from "react";
import { X, Calendar, Clock, Tag, User, Flag, Folder } from "lucide-react";
import { useTheme } from "@/components/AppLayout";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  columnId?: Id<"columns">;
  taskId?: Id<"tasks">; // For editing existing task
  mode: "create" | "edit";
}

interface TaskFormData {
  title: string;
  description: string;
  priority: "low" | "medium" | "high" | "critical";
  dueDate: string; // YYYY-MM-DD format
  dueTime: string; // HH:MM format
  projectId: Id<"projects"> | "";
  tags: string[];
  assignedTo: Id<"users"> | "";
  timeEstimate: number | ""; // minutes
  status: string;
}

export default function TaskModal({
  isOpen,
  onClose,
  columnId,
  taskId,
  mode,
}: TaskModalProps) {
  const { isDarkMode } = useTheme();
  const [formData, setFormData] = useState<TaskFormData>({
    title: "",
    description: "",
    priority: "medium",
    dueDate: "",
    dueTime: "",
    projectId: "",
    tags: [],
    assignedTo: "",
    timeEstimate: "",
    status: "todo",
  });
  const [tagInput, setTagInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Convex queries and mutations
  const projects = useQuery(api.projects.getProjects, {}) || [];
  const users = useQuery(api.users.getUsers, {}) || [];

  const existingTask = useQuery(
    api.tasks.getTask,
    taskId && mode === "edit" ? { taskId } : "skip",
  );
  const createTask = useMutation(api.tasks.createTask);
  const updateTask = useMutation(api.tasks.updateTask);

  // Load existing task data for editing
  useEffect(() => {
    if (mode === "edit" && existingTask) {
      setFormData({
        title: existingTask.title,
        description: existingTask.description || "",
        priority: (existingTask.priority as any) || "medium",
        dueDate: existingTask.dueDate
          ? new Date(existingTask.dueDate).toISOString().split("T")[0]
          : "",
        dueTime: existingTask.dueDate
          ? new Date(existingTask.dueDate).toTimeString().slice(0, 5)
          : "",
        projectId: existingTask.projectId || "",
        tags: existingTask.tags || [],
        assignedTo: existingTask.assignedTo || "",
        timeEstimate: existingTask.timeEstimate || "",
        status: existingTask.status,
      });
    }
  }, [mode, existingTask]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !columnId) return;

    setIsSubmitting(true);
    try {
      let dueDateTime: number | undefined;
      if (formData.dueDate) {
        const date = new Date(formData.dueDate);
        if (formData.dueTime) {
          const [hours, minutes] = formData.dueTime.split(":");
          date.setHours(parseInt(hours), parseInt(minutes));
        }
        dueDateTime = date.getTime();
      }

      const taskData = {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        priority: formData.priority,
        dueDate: dueDateTime,
        projectId: formData.projectId || undefined,
        tags: formData.tags.length > 0 ? formData.tags : undefined,
        assignedTo: formData.assignedTo || undefined,
        timeEstimate:
          typeof formData.timeEstimate === "number" && formData.timeEstimate > 0
            ? formData.timeEstimate
            : undefined,
      };

      if (mode === "create") {
        await createTask({
          ...taskData,
          columnId: columnId!,
        });
      } else if (mode === "edit" && taskId) {
        await updateTask({
          taskId,
          ...taskData,
        });
      }

      onClose();
      resetForm();
    } catch (error) {
      console.error("Failed to save task:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      priority: "medium",
      dueDate: "",
      dueTime: "",
      projectId: "",
      tags: [],
      assignedTo: "",
      timeEstimate: "",
      status: "todo",
    });
    setTagInput("");
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()],
      });
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((tag) => tag !== tagToRemove),
    });
  };

  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div
        className={`w-full max-w-2xl ios-card ${
          isDarkMode ? "bg-gray-900/95" : "bg-white/95"
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between p-5 border-b ${
            isDarkMode ? "border-gray-700/50" : "border-gray-200/50"
          }`}
        >
          <h2
            className={`text-lg font-semibold ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            {mode === "create" ? "Create New Task" : "Edit Task"}
          </h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${
              isDarkMode
                ? "hover:bg-gray-700/50 text-gray-400"
                : "hover:bg-gray-100 text-gray-500"
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {/* Title */}
          <div>
            <label
              className={`block text-sm font-medium mb-2 ${
                isDarkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Task Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className={`w-full px-3 py-2.5 rounded-lg border transition-all ${
                isDarkMode
                  ? "bg-gray-800/50 border-gray-600/50 text-white placeholder-gray-400 focus:border-blue-500"
                  : "bg-white/70 border-gray-300/70 text-gray-900 placeholder-gray-500 focus:border-blue-500"
              } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
              placeholder="Enter task title..."
              required
            />
          </div>

          {/* Description */}
          <div>
            <label
              className={`block text-sm font-medium mb-2 ${
                isDarkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
              className={`w-full px-3 py-2.5 rounded-lg border transition-all resize-none ${
                isDarkMode
                  ? "bg-gray-800/50 border-gray-600/50 text-white placeholder-gray-400 focus:border-blue-500"
                  : "bg-white/70 border-gray-300/70 text-gray-900 placeholder-gray-500 focus:border-blue-500"
              } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
              placeholder="Enter task description..."
            />
          </div>

          {/* Priority & Time Estimate Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                <Flag className="w-4 h-4 inline mr-1" />
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    priority: e.target.value as any,
                  })
                }
                className={`w-full px-3 py-2.5 rounded-lg border transition-all ${
                  isDarkMode
                    ? "bg-gray-800/50 border-gray-600/50 text-white focus:border-blue-500"
                    : "bg-white/70 border-gray-300/70 text-gray-900 focus:border-blue-500"
                } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            <div>
              <label
                className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                <Clock className="w-4 h-4 inline mr-1" />
                Time Estimate (minutes)
              </label>
              <input
                type="number"
                value={formData.timeEstimate}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    timeEstimate: e.target.value
                      ? parseInt(e.target.value)
                      : "",
                  })
                }
                min="0"
                className={`w-full px-3 py-2.5 rounded-lg border transition-all ${
                  isDarkMode
                    ? "bg-gray-800/50 border-gray-600/50 text-white placeholder-gray-400 focus:border-blue-500"
                    : "bg-white/70 border-gray-300/70 text-gray-900 placeholder-gray-500 focus:border-blue-500"
                } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                placeholder="e.g. 30"
              />
            </div>
          </div>

          {/* Due Date & Time Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                <Calendar className="w-4 h-4 inline mr-1" />
                Due Date
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) =>
                  setFormData({ ...formData, dueDate: e.target.value })
                }
                className={`w-full px-3 py-2.5 rounded-lg border transition-all ${
                  isDarkMode
                    ? "bg-gray-800/50 border-gray-600/50 text-white focus:border-blue-500"
                    : "bg-white/70 border-gray-300/70 text-gray-900 focus:border-blue-500"
                } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
              />
            </div>

            <div>
              <label
                className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                <Clock className="w-4 h-4 inline mr-1" />
                Due Time
              </label>
              <input
                type="time"
                value={formData.dueTime}
                onChange={(e) =>
                  setFormData({ ...formData, dueTime: e.target.value })
                }
                className={`w-full px-3 py-2.5 rounded-lg border transition-all ${
                  isDarkMode
                    ? "bg-gray-800/50 border-gray-600/50 text-white focus:border-blue-500"
                    : "bg-white/70 border-gray-300/70 text-gray-900 focus:border-blue-500"
                } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
              />
            </div>
          </div>

          {/* Project & Assigned To Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                <Folder className="w-4 h-4 inline mr-1" />
                Project
              </label>
              <select
                value={formData.projectId}
                onChange={(e) =>
                  setFormData({ ...formData, projectId: e.target.value as any })
                }
                className={`w-full px-3 py-2.5 rounded-lg border transition-all ${
                  isDarkMode
                    ? "bg-gray-800/50 border-gray-600/50 text-white focus:border-blue-500"
                    : "bg-white/70 border-gray-300/70 text-gray-900 focus:border-blue-500"
                } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
              >
                <option value="">No project</option>
                {projects?.map((project) => (
                  <option key={project._id} value={project._id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                <User className="w-4 h-4 inline mr-1" />
                Assigned To
              </label>
              <select
                value={formData.assignedTo}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    assignedTo: e.target.value as any,
                  })
                }
                className={`w-full px-3 py-2.5 rounded-lg border transition-all ${
                  isDarkMode
                    ? "bg-gray-800/50 border-gray-600/50 text-white focus:border-blue-500"
                    : "bg-white/70 border-gray-300/70 text-gray-900 focus:border-blue-500"
                } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
              >
                <option value="">Unassigned</option>
                {users.map((user) => (
                  <option key={user._id} value={user._id}>
                    {user.name || user.email}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label
              className={`block text-sm font-medium mb-2 ${
                isDarkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              <Tag className="w-4 h-4 inline mr-1" />
              Tags
            </label>
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={handleTagKeyPress}
                  className={`flex-1 px-3 py-2.5 rounded-lg border transition-all ${
                    isDarkMode
                      ? "bg-gray-800/50 border-gray-600/50 text-white placeholder-gray-400 focus:border-blue-500"
                      : "bg-white/70 border-gray-300/70 text-gray-900 placeholder-gray-500 focus:border-blue-500"
                  } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                  placeholder="Add a tag..."
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Add
                </button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <span
                      key={tag}
                      className={`inline-flex items-center px-2.5 py-1 rounded-lg text-sm font-medium border ${
                        isDarkMode
                          ? "bg-blue-500/20 text-blue-300 border-blue-500/30"
                          : "bg-blue-100 text-blue-800 border-blue-200"
                      }`}
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1.5 hover:text-red-500 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className={`px-5 py-2.5 rounded-lg font-medium transition-colors ${
                isDarkMode
                  ? "bg-gray-700/50 text-gray-300 hover:bg-gray-600/50"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!formData.title.trim() || isSubmitting}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {isSubmitting
                ? mode === "create"
                  ? "Creating..."
                  : "Updating..."
                : mode === "create"
                  ? "Create Task"
                  : "Update Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
