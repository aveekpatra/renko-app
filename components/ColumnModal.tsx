import React, { useState, useEffect } from "react";
import { X, Plus, Edit3, Palette } from "lucide-react";
import { useTheme } from "@/components/AppLayout";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

interface ColumnModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: Id<"projects">;
  columnId?: Id<"columns">; // For editing existing column
  mode: "create" | "edit";
  initialData?: {
    name: string;
    color: string;
  };
}

const COLUMN_COLORS = [
  { name: "Red", value: "#ef4444", bg: "bg-red-500" },
  { name: "Orange", value: "#f59e0b", bg: "bg-orange-500" },
  { name: "Yellow", value: "#eab308", bg: "bg-yellow-500" },
  { name: "Green", value: "#10b981", bg: "bg-green-500" },
  { name: "Blue", value: "#3b82f6", bg: "bg-blue-500" },
  { name: "Indigo", value: "#6366f1", bg: "bg-indigo-500" },
  { name: "Purple", value: "#8b5cf6", bg: "bg-purple-500" },
  { name: "Pink", value: "#ec4899", bg: "bg-pink-500" },
  { name: "Gray", value: "#6b7280", bg: "bg-gray-500" },
];

export default function ColumnModal({
  isOpen,
  onClose,
  projectId,
  columnId,
  mode,
  initialData,
}: ColumnModalProps) {
  const { isDarkMode } = useTheme();
  const [name, setName] = useState("");
  const [color, setColor] = useState("#6b7280");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createColumn = useMutation(api.tasks.createColumn);
  const updateColumn = useMutation(api.tasks.updateColumn);

  useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && initialData) {
        setName(initialData.name);
        setColor(initialData.color);
      } else {
        setName("");
        setColor("#6b7280");
      }
    }
  }, [isOpen, mode, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      if (mode === "create") {
        await createColumn({
          name: name.trim(),
          projectId,
          color,
        });
      } else if (mode === "edit" && columnId) {
        await updateColumn({
          columnId,
          name: name.trim(),
          color,
        });
      }
      onClose();
    } catch (error) {
      console.error("Failed to save column:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={`relative w-full max-w-md mx-4 rounded-2xl shadow-2xl ${
          isDarkMode
            ? "bg-gray-900 border border-gray-800"
            : "bg-white border border-gray-200"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center space-x-3">
            <div
              className={`p-2 rounded-lg ${
                isDarkMode
                  ? "bg-blue-500/20 text-blue-400"
                  : "bg-blue-50 text-blue-600"
              }`}
            >
              {mode === "create" ? (
                <Plus className="w-5 h-5" />
              ) : (
                <Edit3 className="w-5 h-5" />
              )}
            </div>
            <h2
              className={`text-lg font-semibold ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              {mode === "create" ? "Create Column" : "Edit Column"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${
              isDarkMode
                ? "hover:bg-gray-800 text-gray-400 hover:text-white"
                : "hover:bg-gray-100 text-gray-500 hover:text-gray-700"
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Column Name */}
          <div>
            <label
              className={`block text-sm font-medium mb-2 ${
                isDarkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Column Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter column name..."
              className={`w-full px-4 py-3 rounded-xl border transition-colors ${
                isDarkMode
                  ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500"
                  : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500"
              } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
              required
              autoFocus
            />
          </div>

          {/* Color Selection */}
          <div>
            <label
              className={`block text-sm font-medium mb-3 ${
                isDarkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              <Palette className="w-4 h-4 inline mr-2" />
              Column Color
            </label>
            <div className="grid grid-cols-5 gap-3">
              {COLUMN_COLORS.map((colorOption) => (
                <button
                  key={colorOption.value}
                  type="button"
                  onClick={() => setColor(colorOption.value)}
                  className={`relative w-12 h-12 rounded-xl ${colorOption.bg} transition-all duration-200 hover:scale-110 ${
                    color === colorOption.value
                      ? "ring-2 ring-offset-2 ring-blue-500 ring-offset-white dark:ring-offset-gray-900"
                      : ""
                  }`}
                  title={colorOption.name}
                >
                  {color === colorOption.value && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-3 h-3 bg-white rounded-full shadow-sm" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 px-4 py-3 rounded-xl font-medium transition-colors ${
                isDarkMode
                  ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || isSubmitting}
              className={`flex-1 px-4 py-3 rounded-xl font-medium transition-colors ${
                !name.trim() || isSubmitting
                  ? isDarkMode
                    ? "bg-gray-800 text-gray-600 cursor-not-allowed"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-blue-500 text-white hover:bg-blue-600"
              }`}
            >
              {isSubmitting
                ? "Saving..."
                : mode === "create"
                  ? "Create Column"
                  : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
