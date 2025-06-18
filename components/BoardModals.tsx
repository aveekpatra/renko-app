"use client";

import React, { useState } from "react";
import { X } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

interface CreateBoardModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
}

export const CreateBoardModal = ({
  isOpen,
  onClose,
  isDarkMode,
}: CreateBoardModalProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createProject = useMutation(api.projects.createProject);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await createProject({
        name: name.trim(),
        description: description.trim() || undefined,
      });
      setName("");
      setDescription("");
      onClose();
    } catch (error) {
      console.error("Failed to create project:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div
        className={`w-full max-w-lg p-8 rounded-2xl shadow-2xl border ${
          isDarkMode
            ? "bg-gray-900 border-gray-700 shadow-black/60"
            : "bg-white border-gray-200 shadow-gray-900/25"
        }`}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2
              className={`text-xl font-semibold tracking-tight ${
                isDarkMode ? "text-gray-100" : "text-gray-900"
              }`}
            >
              Create New Project
            </h2>
            <p
              className={`text-sm mt-1 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
            >
              Set up a new project board to organize your tasks
            </p>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-xl transition-all duration-200 hover:scale-105 ${
              isDarkMode
                ? "hover:bg-gray-800/60 text-gray-400 hover:text-gray-300"
                : "hover:bg-gray-100/80 text-gray-500 hover:text-gray-700"
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label
              className={`block text-sm font-semibold ${
                isDarkMode ? "text-gray-200" : "text-gray-800"
              }`}
            >
              Project Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter project name"
              className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 text-sm ${
                isDarkMode
                  ? "bg-gray-800 border-gray-600 text-gray-100 placeholder-gray-400 focus:border-purple-400 focus:bg-gray-750"
                  : "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-purple-400 focus:bg-white"
              } focus:outline-none focus:ring-4 focus:ring-purple-500/20 hover:border-gray-400`}
              required
            />
          </div>

          <div className="space-y-2">
            <label
              className={`block text-sm font-semibold ${
                isDarkMode ? "text-gray-200" : "text-gray-800"
              }`}
            >
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of your project goals..."
              rows={4}
              className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 text-sm resize-none ${
                isDarkMode
                  ? "bg-gray-800 border-gray-600 text-gray-100 placeholder-gray-400 focus:border-purple-400 focus:bg-gray-750"
                  : "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-purple-400 focus:bg-white"
              } focus:outline-none focus:ring-4 focus:ring-purple-500/20 hover:border-gray-400`}
            />
          </div>

          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 py-3 px-6 rounded-xl border-2 transition-all duration-200 text-sm font-semibold hover:scale-105 ${
                isDarkMode
                  ? "border-gray-600 text-gray-300 hover:bg-gray-800 hover:border-gray-500"
                  : "border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400"
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || isSubmitting}
              className={`flex-1 py-3 px-6 rounded-xl transition-all duration-200 text-sm font-semibold hover:scale-105 ${
                !name.trim() || isSubmitting
                  ? "bg-gray-500 text-gray-300 cursor-not-allowed"
                  : isDarkMode
                    ? "bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white shadow-lg shadow-purple-600/40"
                    : "bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-400 hover:to-purple-500 text-white shadow-lg shadow-purple-500/40"
              }`}
            >
              {isSubmitting ? "Creating..." : "Create Project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface EditProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  project: {
    name?: string;
    description?: string;
  } | null;
  onUpdate: (updates: { name: string; description?: string }) => Promise<void>;
}

export const EditProjectModal = ({
  isOpen,
  onClose,
  isDarkMode,
  project,
  onUpdate,
}: EditProjectModalProps) => {
  const [name, setName] = useState(project?.name || "");
  const [description, setDescription] = useState(project?.description || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (project) {
      setName(project.name || "");
      setDescription(project.description || "");
    }
  }, [project]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onUpdate({
        name: name.trim(),
        description: description.trim() || undefined,
      });
      onClose();
    } catch (error) {
      console.error("Failed to update project:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !project) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div
        className={`w-full max-w-lg p-8 rounded-2xl shadow-2xl border ${
          isDarkMode
            ? "bg-gray-900 border-gray-700 shadow-black/60"
            : "bg-white border-gray-200 shadow-gray-900/25"
        }`}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2
              className={`text-xl font-semibold tracking-tight ${
                isDarkMode ? "text-gray-100" : "text-gray-900"
              }`}
            >
              Edit Project
            </h2>
            <p
              className={`text-sm mt-1 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
            >
              Update your project details and settings
            </p>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-xl transition-all duration-200 hover:scale-105 ${
              isDarkMode
                ? "hover:bg-gray-800/60 text-gray-400 hover:text-gray-300"
                : "hover:bg-gray-100/80 text-gray-500 hover:text-gray-700"
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label
              className={`block text-sm font-semibold ${
                isDarkMode ? "text-gray-200" : "text-gray-800"
              }`}
            >
              Project Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter project name"
              className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 text-sm ${
                isDarkMode
                  ? "bg-gray-800 border-gray-600 text-gray-100 placeholder-gray-400 focus:border-purple-400 focus:bg-gray-750"
                  : "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-purple-400 focus:bg-white"
              } focus:outline-none focus:ring-4 focus:ring-purple-500/20 hover:border-gray-400`}
              required
            />
          </div>

          <div className="space-y-2">
            <label
              className={`block text-sm font-semibold ${
                isDarkMode ? "text-gray-200" : "text-gray-800"
              }`}
            >
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of your project goals..."
              rows={4}
              className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 text-sm resize-none ${
                isDarkMode
                  ? "bg-gray-800 border-gray-600 text-gray-100 placeholder-gray-400 focus:border-purple-400 focus:bg-gray-750"
                  : "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-purple-400 focus:bg-white"
              } focus:outline-none focus:ring-4 focus:ring-purple-500/20 hover:border-gray-400`}
            />
          </div>

          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 py-3 px-6 rounded-xl border-2 transition-all duration-200 text-sm font-semibold hover:scale-105 ${
                isDarkMode
                  ? "border-gray-600 text-gray-300 hover:bg-gray-800 hover:border-gray-500"
                  : "border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400"
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || isSubmitting}
              className={`flex-1 py-3 px-6 rounded-xl transition-all duration-200 text-sm font-semibold hover:scale-105 ${
                !name.trim() || isSubmitting
                  ? "bg-gray-500 text-gray-300 cursor-not-allowed"
                  : isDarkMode
                    ? "bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white shadow-lg shadow-purple-600/40"
                    : "bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-400 hover:to-purple-500 text-white shadow-lg shadow-purple-500/40"
              }`}
            >
              {isSubmitting ? "Updating..." : "Update Project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
 