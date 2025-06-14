import React, { useState, useEffect } from "react";
import { X, Calendar, Clock, Tag, Flag, Folder, Sparkles } from "lucide-react";
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

interface ParsedTask {
  title: string;
  description?: string;
  priority?: "low" | "medium" | "high" | "critical";
  dueDate?: Date;
  tags?: string[];
  timeEstimate?: number;
  projectHint?: string;
}

// Natural language parsing function (simplified version of what Todoist/TickTick do)
function parseNaturalLanguage(input: string): ParsedTask {
  let cleanInput = input.trim();
  const result: ParsedTask = { title: cleanInput };

  // Extract priority (p1, p2, p3, p4 or !1, !2, !3, !4)
  const priorityMatch = cleanInput.match(/\b(?:p([1-4])|!([1-4]))\b/i);
  if (priorityMatch) {
    const level = priorityMatch[1] || priorityMatch[2];
    const priorityMap = {
      "1": "critical",
      "2": "high",
      "3": "medium",
      "4": "low",
    } as const;
    result.priority = priorityMap[level as keyof typeof priorityMap];
    cleanInput = cleanInput.replace(priorityMatch[0], "").trim();
  }

  // Extract tags (#tag)
  const tagMatches = cleanInput.match(/#(\w+)/g);
  if (tagMatches) {
    result.tags = tagMatches.map((tag) => tag.substring(1));
    cleanInput = cleanInput.replace(/#\w+/g, "").trim();
  }

  // Extract time estimates (30min, 2h, 1.5h)
  const timeMatch = cleanInput.match(
    /\b(\d+(?:\.\d+)?)(min|h|hour|hours|minutes?)\b/i,
  );
  if (timeMatch) {
    const value = parseFloat(timeMatch[1]);
    const unit = timeMatch[2].toLowerCase();
    result.timeEstimate = unit.startsWith("h") ? value * 60 : value;
    cleanInput = cleanInput.replace(timeMatch[0], "").trim();
  }

  // Extract times (2pm, 14:00, 2:30pm, etc.) and combine with dates
  const timeMatch24h = cleanInput.match(/\b(\d{1,2}):(\d{2})\b/);
  const timeMatchAmPm = cleanInput.match(
    /\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/i,
  );

  let timeToSet: { hours: number; minutes: number } | null = null;

  if (timeMatch24h) {
    const hours = parseInt(timeMatch24h[1]);
    const minutes = parseInt(timeMatch24h[2]);
    if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
      timeToSet = { hours, minutes };
      cleanInput = cleanInput.replace(timeMatch24h[0], "").trim();
    }
  } else if (timeMatchAmPm) {
    let hours = parseInt(timeMatchAmPm[1]);
    const minutes = parseInt(timeMatchAmPm[2] || "0");
    const period = timeMatchAmPm[3].toLowerCase();

    if (period === "pm" && hours !== 12) hours += 12;
    if (period === "am" && hours === 12) hours = 0;

    if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
      timeToSet = { hours, minutes };
      cleanInput = cleanInput.replace(timeMatchAmPm[0], "").trim();
    }
  }

  // Extract dates (today, tomorrow, monday, next week, 12/25, etc.)
  const datePatterns = [
    { pattern: /\btoday\b/i, offset: 0 },
    { pattern: /\btomorrow\b/i, offset: 1 },
    { pattern: /\bnext week\b/i, offset: 7 },
    { pattern: /\bmonday\b/i, dayOfWeek: 1 },
    { pattern: /\btuesday\b/i, dayOfWeek: 2 },
    { pattern: /\bwednesday\b/i, dayOfWeek: 3 },
    { pattern: /\bthursday\b/i, dayOfWeek: 4 },
    { pattern: /\bfriday\b/i, dayOfWeek: 5 },
    { pattern: /\bsaturday\b/i, dayOfWeek: 6 },
    { pattern: /\bsunday\b/i, dayOfWeek: 0 },
  ];

  for (const { pattern, offset, dayOfWeek } of datePatterns) {
    if (pattern.test(cleanInput)) {
      const date = new Date();
      if (offset !== undefined) {
        date.setDate(date.getDate() + offset);
      } else if (dayOfWeek !== undefined) {
        const currentDay = date.getDay();
        const daysUntil = (dayOfWeek - currentDay + 7) % 7 || 7;
        date.setDate(date.getDate() + daysUntil);
      }

      // Apply time if parsed
      if (timeToSet) {
        date.setHours(timeToSet.hours, timeToSet.minutes, 0, 0);
      }

      result.dueDate = date;
      cleanInput = cleanInput.replace(pattern, "").trim();
      break;
    }
  }

  // Extract specific dates (12/25, 2024-12-25, etc.)
  if (!result.dueDate) {
    const specificDateMatch = cleanInput.match(
      /\b(\d{1,2}\/\d{1,2}(?:\/\d{2,4})?|\d{4}-\d{2}-\d{2})\b/,
    );
    if (specificDateMatch) {
      try {
        const date = new Date(specificDateMatch[1]);
        // Apply time if parsed
        if (timeToSet) {
          date.setHours(timeToSet.hours, timeToSet.minutes, 0, 0);
        }
        result.dueDate = date;
        cleanInput = cleanInput.replace(specificDateMatch[0], "").trim();
      } catch {
        // Invalid date format, ignore
      }
    }
  }

  // If we have a time but no date, set it for today
  if (timeToSet && !result.dueDate) {
    const date = new Date();
    date.setHours(timeToSet.hours, timeToSet.minutes, 0, 0);
    result.dueDate = date;
  }

  // Extract project hints (@project)
  const projectMatch = cleanInput.match(/@(\w+)/);
  if (projectMatch) {
    result.projectHint = projectMatch[1];
    cleanInput = cleanInput.replace(projectMatch[0], "").trim();
  }

  // Clean up the title
  result.title = cleanInput.replace(/\s+/g, " ").trim();

  return result;
}

export default function TaskModal({
  isOpen,
  onClose,
  columnId,
  taskId,
  mode,
}: TaskModalProps) {
  const { isDarkMode } = useTheme();
  const [naturalInput, setNaturalInput] = useState("");
  const [parsedTask, setParsedTask] = useState<ParsedTask>({ title: "" });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Convex queries and mutations
  const projects = useQuery(api.projects.getProjects, {}) || [];
  const existingTask = useQuery(
    api.tasks.getTask,
    taskId && mode === "edit" ? { taskId } : "skip",
  );
  const createTask = useMutation(api.tasks.createTask);
  const updateTask = useMutation(api.tasks.updateTask);

  // Parse natural language input in real-time
  useEffect(() => {
    if (naturalInput) {
      setParsedTask(parseNaturalLanguage(naturalInput));
    } else {
      setParsedTask({ title: "" });
    }
  }, [naturalInput]);

  // Load existing task data for editing
  useEffect(() => {
    if (mode === "edit" && existingTask) {
      const taskText = [
        existingTask.title,
        existingTask.priority
          ? `p${{ critical: "1", high: "2", medium: "3", low: "4" }[existingTask.priority]}`
          : "",
        existingTask.tags?.map((tag) => `#${tag}`).join(" ") || "",
        existingTask.timeEstimate ? `${existingTask.timeEstimate}min` : "",
        existingTask.dueDate
          ? new Date(existingTask.dueDate).toLocaleDateString()
          : "",
      ]
        .filter(Boolean)
        .join(" ");

      setNaturalInput(taskText);

      // Set the description separately since it's not part of the natural language input
      if (existingTask.description) {
        setParsedTask((prev) => ({
          ...prev,
          description: existingTask.description,
        }));
      }
    } else if (mode === "create") {
      // Reset form when switching to create mode
      setNaturalInput("");
      setParsedTask({ title: "" });
      setShowAdvanced(false);
    }
  }, [mode, existingTask]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!parsedTask.title.trim()) return;

    // For edit mode, we don't need columnId
    if (mode === "create" && !columnId) return;

    setIsSubmitting(true);
    try {
      const taskData = {
        title: parsedTask.title.trim(),
        description: parsedTask.description?.trim() || undefined,
        priority: parsedTask.priority || "medium",
        dueDate: parsedTask.dueDate?.getTime(),
        tags: parsedTask.tags?.length ? parsedTask.tags : undefined,
        timeEstimate: parsedTask.timeEstimate || undefined,
        projectId: undefined, // Could be enhanced to match project hints
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
    setNaturalInput("");
    setParsedTask({ title: "" });
    setShowAdvanced(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div
        className={`w-full max-w-2xl rounded-2xl border shadow-2xl backdrop-blur-xl ${
          isDarkMode
            ? "bg-gray-900/80 border-gray-700/40"
            : "bg-white/80 border-gray-200/40"
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between p-5 border-b ${
            isDarkMode ? "border-gray-700/30" : "border-gray-200/30"
          }`}
        >
          <h2
            className={`text-xl font-semibold ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            {mode === "create" ? "Create Task" : "Edit Task"}
          </h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${
              isDarkMode
                ? "hover:bg-gray-800/50 text-gray-400"
                : "hover:bg-gray-100/50 text-gray-500"
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {/* Natural Language Input */}
          <div>
            <label
              className={`block text-sm font-medium mb-2 ${
                isDarkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              <Sparkles className="inline w-4 h-4 mr-1" />
              What needs to be done?
            </label>
            <textarea
              value={naturalInput}
              onChange={(e) => setNaturalInput(e.target.value)}
              rows={3}
              className={`w-full px-4 py-3 rounded-xl border backdrop-blur-sm transition-all resize-none text-base ${
                isDarkMode
                  ? "bg-gray-800/50 border-gray-700/50 text-white placeholder-gray-400 focus:border-purple-500"
                  : "bg-white/70 border-gray-300/70 text-gray-900 placeholder-gray-500 focus:border-purple-500"
              } focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
              placeholder="e.g., Call mom tomorrow at 3pm p2 #personal 30min"
              required
            />
            <div
              className={`text-xs mt-2 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
            >
              Try: &ldquo;Review proposal tomorrow 2pm p1 #work 2h&rdquo; or
              &ldquo;Meeting Monday 14:00 p3 #work&rdquo;
            </div>
          </div>

          {/* Parsed Preview */}
          {parsedTask.title && (
            <div
              className={`p-4 rounded-xl border backdrop-blur-sm ${
                isDarkMode
                  ? "bg-gray-800/30 border-gray-700/50"
                  : "bg-purple-50/50 border-purple-200/50"
              }`}
            >
              <div
                className={`text-sm font-medium mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
              >
                Parsed Task:
              </div>
              <div className="space-y-2 text-sm">
                <div
                  className={`font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}
                >
                  {parsedTask.title}
                </div>
                {parsedTask.description && (
                  <div
                    className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}
                  >
                    {parsedTask.description}
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  {parsedTask.priority && (
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${
                        parsedTask.priority === "critical"
                          ? "bg-red-50 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700"
                          : parsedTask.priority === "high"
                            ? "bg-orange-50 text-orange-800 border-orange-300 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-700"
                            : parsedTask.priority === "medium"
                              ? "bg-blue-50 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700"
                              : "bg-green-50 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700"
                      }`}
                    >
                      <Flag className="w-3 h-3 mr-1" />
                      {parsedTask.priority}
                    </span>
                  )}
                  {parsedTask.dueDate && (
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${
                        isDarkMode
                          ? "bg-purple-500/20 text-purple-200 border-purple-500/30"
                          : "bg-purple-100 text-purple-900 border-purple-200"
                      }`}
                    >
                      <Calendar className="w-3 h-3 mr-1" />
                      {parsedTask.dueDate.toLocaleDateString()}
                      {(parsedTask.dueDate.getHours() !== 0 ||
                        parsedTask.dueDate.getMinutes() !== 0) && (
                        <span className="ml-1">
                          {parsedTask.dueDate.toLocaleTimeString([], {
                            hour: "numeric",
                            minute: "2-digit",
                            hour12: true,
                          })}
                        </span>
                      )}
                    </span>
                  )}
                  {parsedTask.timeEstimate && (
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${
                        isDarkMode
                          ? "bg-indigo-500/20 text-indigo-200 border-indigo-500/30"
                          : "bg-indigo-100 text-indigo-900 border-indigo-200"
                      }`}
                    >
                      <Clock className="w-3 h-3 mr-1" />
                      {parsedTask.timeEstimate >= 60
                        ? `${(parsedTask.timeEstimate / 60).toFixed(1)}h`
                        : `${parsedTask.timeEstimate}min`}
                    </span>
                  )}
                  {parsedTask.tags?.map((tag) => (
                    <span
                      key={tag}
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${
                        isDarkMode
                          ? "bg-gray-600/20 text-gray-200 border-gray-600/30"
                          : "bg-gray-100 text-gray-800 border-gray-200"
                      }`}
                    >
                      <Tag className="w-3 h-3 mr-1" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Advanced Options Toggle */}
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`text-sm font-medium transition-colors ${
              isDarkMode
                ? "text-purple-400 hover:text-purple-300"
                : "text-purple-600 hover:text-purple-700"
            }`}
          >
            {showAdvanced ? "Hide" : "Show"} advanced options
          </button>

          {/* Advanced Options */}
          {showAdvanced && (
            <div className="pt-2 space-y-4">
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Description
                </label>
                <textarea
                  value={parsedTask.description || ""}
                  onChange={(e) =>
                    setParsedTask({
                      ...parsedTask,
                      description: e.target.value,
                    })
                  }
                  rows={2}
                  className={`w-full px-4 py-3 rounded-xl border backdrop-blur-sm transition-all resize-none ${
                    isDarkMode
                      ? "bg-gray-800/50 border-gray-700/50 text-white placeholder-gray-400 focus:border-purple-500"
                      : "bg-white/70 border-gray-300/70 text-gray-900 placeholder-gray-500 focus:border-purple-500"
                  } focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
                  placeholder="Add more details..."
                />
              </div>

              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  <Folder className="inline w-4 h-4 mr-1" />
                  Project
                </label>
                <select
                  className={`w-full px-4 py-3 rounded-xl border backdrop-blur-sm transition-all ${
                    isDarkMode
                      ? "bg-gray-800/50 border-gray-700/50 text-white focus:border-purple-500"
                      : "bg-white/70 border-gray-300/70 text-gray-900 focus:border-purple-500"
                  } focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
                >
                  <option value="">No project</option>
                  {projects?.map((project) => (
                    <option key={project._id} value={project._id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end pt-4 space-x-3">
            <button
              type="button"
              onClick={onClose}
              className={`px-5 py-2.5 rounded-xl font-medium transition-colors backdrop-blur-sm ${
                isDarkMode
                  ? "bg-gray-800/50 text-gray-300 hover:bg-gray-700/50"
                  : "bg-gray-100/70 text-gray-700 hover:bg-gray-200/70"
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!parsedTask.title.trim() || isSubmitting}
              className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium shadow-lg shadow-purple-500/25"
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
