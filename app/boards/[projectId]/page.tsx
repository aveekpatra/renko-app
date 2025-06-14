"use client";

import React, { useState } from "react";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Edit,
  MoreHorizontal,
  Plus,
  Target,
  Users,
  Activity,
  Archive,
  Trash2,
  Star,
  FolderKanban,
} from "lucide-react";
import { useTheme } from "@/components/AppLayout";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useRouter } from "next/navigation";

interface ProjectDetailsPageProps {
  params: {
    projectId: string;
  };
}

export default function ProjectDetailsPage({
  params,
}: ProjectDetailsPageProps) {
  const { isDarkMode } = useTheme();
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);

  const projectId = params.projectId as Id<"projects">;

  // Fetch project data
  const project = useQuery(api.projects.getProject, { projectId });
  const boards = useQuery(api.tasks.getBoards);
  const projectBoards =
    boards?.filter((board) => board.projectId === projectId) || [];

  // Get project stats
  const allTasks = useQuery(api.tasks.getAllTasks, {});
  const projectTasks =
    allTasks?.filter((task) => task.projectId === projectId) || [];

  const completedTasks = projectTasks.filter(
    (task) => task.status === "done",
  ).length;
  const totalTasks = projectTasks.length;
  const progressPercentage =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Mutations
  const updateProject = useMutation(api.projects.updateProject);
  const deleteProject = useMutation(api.projects.deleteProject);

  if (project === undefined) {
    return (
      <div className="flex items-center justify-center h-full">
        <div
          className={`text-lg ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}
        >
          Loading project...
        </div>
      </div>
    );
  }

  if (project === null) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h1
            className={`text-2xl font-bold mb-4 ${isDarkMode ? "text-white" : "text-gray-900"}`}
          >
            Project not found
          </h1>
          <button
            onClick={() => router.push("/boards")}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
          >
            Back to Projects
          </button>
        </div>
      </div>
    );
  }

  const handleArchiveProject = async () => {
    try {
      await updateProject({ projectId, status: "archived" });
      router.push("/boards");
    } catch (error) {
      console.error("Failed to archive project:", error);
    }
  };

  const handleDeleteProject = async () => {
    if (
      confirm(
        "Are you sure you want to delete this project? This action cannot be undone.",
      )
    ) {
      try {
        await deleteProject({ projectId });
        router.push("/boards");
      } catch (error) {
        console.error("Failed to delete project:", error);
      }
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "active":
        return isDarkMode
          ? "bg-green-500/20 text-green-300 border-green-500/30"
          : "bg-green-100/80 text-green-700 border-green-200/70";
      case "completed":
        return isDarkMode
          ? "bg-blue-500/20 text-blue-300 border-blue-500/30"
          : "bg-blue-100/80 text-blue-700 border-blue-200/70";
      case "archived":
        return isDarkMode
          ? "bg-gray-500/20 text-gray-300 border-gray-500/30"
          : "bg-gray-100/80 text-gray-700 border-gray-200/70";
      default:
        return isDarkMode
          ? "bg-gray-500/20 text-gray-300 border-gray-500/30"
          : "bg-gray-100/80 text-gray-700 border-gray-200/70";
    }
  };

  const themeClasses = {
    container: isDarkMode
      ? "min-h-screen bg-gray-950 transition-colors duration-300"
      : "min-h-screen bg-gray-50 transition-colors duration-300",
    card: isDarkMode
      ? "bg-gray-900/60 border-gray-800/60 shadow-black/25"
      : "bg-white/90 border-gray-200/60 shadow-gray-900/15",
    text: {
      primary: isDarkMode ? "text-white" : "text-gray-900",
      secondary: isDarkMode ? "text-gray-300" : "text-gray-700",
      tertiary: isDarkMode ? "text-gray-400" : "text-gray-600",
    },
  };

  return (
    <div className={themeClasses.container}>
      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push("/boards")}
              className={`p-2.5 rounded-xl backdrop-blur-sm border shadow-sm transition-colors ${
                isDarkMode
                  ? "bg-gray-800/80 border-gray-700/50 text-gray-300 hover:bg-gray-700/80"
                  : "bg-white/80 border-gray-200/60 text-gray-600 hover:bg-gray-100/80"
              }`}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div
              className={`p-2.5 rounded-xl backdrop-blur-sm border shadow-sm ${
                isDarkMode
                  ? "bg-gray-800/80 border-gray-700/50"
                  : "bg-white/80 border-gray-200/60"
              }`}
              style={{
                backgroundColor: isDarkMode
                  ? `${project.color || "#6366f1"}20`
                  : `${project.color || "#6366f1"}10`,
              }}
            >
              <FolderKanban
                className="w-6 h-6"
                style={{ color: project.color || "#6366f1" }}
              />
            </div>

            <div>
              <h1 className={`text-3xl font-bold ${themeClasses.text.primary}`}>
                {project.name}
              </h1>
              <div className="flex items-center space-x-3 mt-1">
                <span
                  className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border backdrop-blur-sm ${getStatusColor(project.status)}`}
                >
                  {project.status || "active"}
                </span>
                <span className={`text-sm ${themeClasses.text.tertiary}`}>
                  Created {new Date(project.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Actions Menu */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className={`p-2.5 rounded-xl backdrop-blur-sm border shadow-sm transition-colors ${
                isDarkMode
                  ? "bg-gray-800/80 border-gray-700/50 text-gray-300 hover:bg-gray-700/80"
                  : "bg-white/80 border-gray-200/60 text-gray-600 hover:bg-gray-100/80"
              }`}
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>

            {showMenu && (
              <div
                className={`absolute right-0 top-full mt-2 w-48 rounded-2xl border shadow-2xl z-10 backdrop-blur-xl ${
                  isDarkMode
                    ? "bg-gray-900/90 border-gray-800/60"
                    : "bg-white/90 border-gray-200/60"
                }`}
              >
                <div className="p-2">
                  <button
                    onClick={() => {
                      // TODO: Implement edit modal
                      setShowMenu(false);
                    }}
                    className={`w-full flex items-center space-x-2 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                      isDarkMode
                        ? "hover:bg-gray-800/50 text-gray-300"
                        : "hover:bg-gray-100/50 text-gray-700"
                    }`}
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit Project</span>
                  </button>
                  <button
                    onClick={() => {
                      handleArchiveProject();
                      setShowMenu(false);
                    }}
                    className={`w-full flex items-center space-x-2 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                      isDarkMode
                        ? "hover:bg-gray-800/50 text-gray-300"
                        : "hover:bg-gray-100/50 text-gray-700"
                    }`}
                  >
                    <Archive className="w-4 h-4" />
                    <span>Archive</span>
                  </button>
                  <button
                    onClick={() => {
                      handleDeleteProject();
                      setShowMenu(false);
                    }}
                    className={`w-full flex items-center space-x-2 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                      isDarkMode
                        ? "hover:bg-red-900/50 text-red-400"
                        : "hover:bg-red-50/50 text-red-600"
                    }`}
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Project Description */}
        {project.description && (
          <div
            className={`p-6 rounded-2xl backdrop-blur-xl border shadow-2xl mb-8 ${themeClasses.card}`}
          >
            <h2
              className={`text-lg font-semibold mb-3 ${themeClasses.text.primary}`}
            >
              Description
            </h2>
            <p
              className={`text-base leading-relaxed ${themeClasses.text.secondary}`}
            >
              {project.description}
            </p>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Progress */}
          <div
            className={`p-6 rounded-2xl backdrop-blur-xl border shadow-2xl ${themeClasses.card}`}
          >
            <div className="flex items-center space-x-3 mb-4">
              <div
                className={`p-2 rounded-xl backdrop-blur-sm border shadow-sm ${
                  isDarkMode
                    ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                    : "bg-blue-100/80 text-blue-600 border-blue-200/70"
                }`}
              >
                <Target className="w-4 h-4" />
              </div>
              <span className={`font-medium ${themeClasses.text.secondary}`}>
                Progress
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span
                  className={`text-2xl font-bold ${themeClasses.text.primary}`}
                >
                  {progressPercentage}%
                </span>
                <span className={`text-sm ${themeClasses.text.tertiary}`}>
                  {completedTasks}/{totalTasks}
                </span>
              </div>
              <div
                className={`w-full bg-gray-200 rounded-full h-2 ${isDarkMode ? "bg-gray-700" : ""}`}
              >
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          </div>

          {/* Total Tasks */}
          <div
            className={`p-6 rounded-2xl backdrop-blur-xl border shadow-2xl ${themeClasses.card}`}
          >
            <div className="flex items-center space-x-3 mb-4">
              <div
                className={`p-2 rounded-xl backdrop-blur-sm border shadow-sm ${
                  isDarkMode
                    ? "bg-green-500/20 text-green-400 border-green-500/30"
                    : "bg-green-100/80 text-green-600 border-green-200/70"
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <span className={`font-medium ${themeClasses.text.secondary}`}>
                Tasks
              </span>
            </div>
            <span className={`text-2xl font-bold ${themeClasses.text.primary}`}>
              {totalTasks}
            </span>
          </div>

          {/* Boards */}
          <div
            className={`p-6 rounded-2xl backdrop-blur-xl border shadow-2xl ${themeClasses.card}`}
          >
            <div className="flex items-center space-x-3 mb-4">
              <div
                className={`p-2 rounded-xl backdrop-blur-sm border shadow-sm ${
                  isDarkMode
                    ? "bg-purple-500/20 text-purple-400 border-purple-500/30"
                    : "bg-purple-100/80 text-purple-600 border-purple-200/70"
                }`}
              >
                <FolderKanban className="w-4 h-4" />
              </div>
              <span className={`font-medium ${themeClasses.text.secondary}`}>
                Boards
              </span>
            </div>
            <span className={`text-2xl font-bold ${themeClasses.text.primary}`}>
              {projectBoards.length}
            </span>
          </div>

          {/* Last Updated */}
          <div
            className={`p-6 rounded-2xl backdrop-blur-xl border shadow-2xl ${themeClasses.card}`}
          >
            <div className="flex items-center space-x-3 mb-4">
              <div
                className={`p-2 rounded-xl backdrop-blur-sm border shadow-sm ${
                  isDarkMode
                    ? "bg-orange-500/20 text-orange-400 border-orange-500/30"
                    : "bg-orange-100/80 text-orange-600 border-orange-200/70"
                }`}
              >
                <Clock className="w-4 h-4" />
              </div>
              <span className={`font-medium ${themeClasses.text.secondary}`}>
                Updated
              </span>
            </div>
            <span
              className={`text-sm font-medium ${themeClasses.text.primary}`}
            >
              {new Date(project.updatedAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Project Boards */}
        <div
          className={`p-6 rounded-2xl backdrop-blur-xl border shadow-2xl ${themeClasses.card}`}
        >
          <div className="flex items-center justify-between mb-6">
            <h2
              className={`text-lg font-semibold ${themeClasses.text.primary}`}
            >
              Project Boards
            </h2>
            <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium shadow-lg shadow-blue-500/25">
              <Plus className="w-4 h-4 mr-2" />
              New Board
            </button>
          </div>

          {projectBoards.length === 0 ? (
            <div className="text-center py-12">
              <div
                className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm border ${
                  isDarkMode
                    ? "bg-gray-800/50 border-gray-700/50"
                    : "bg-gray-100/50 border-gray-200/50"
                }`}
              >
                <FolderKanban
                  className={`w-8 h-8 ${themeClasses.text.tertiary}`}
                />
              </div>
              <h3
                className={`text-xl font-semibold mb-3 ${themeClasses.text.primary}`}
              >
                No boards yet
              </h3>
              <p className={`text-base mb-6 ${themeClasses.text.tertiary}`}>
                Create your first board to start organizing tasks
              </p>
              <button className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium shadow-lg shadow-blue-500/25">
                <Plus className="w-5 h-5 mr-2" />
                Create First Board
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projectBoards.map((board) => (
                <button
                  key={board._id}
                  onClick={() => router.push(`/boards?boardId=${board._id}`)}
                  className={`p-4 rounded-xl backdrop-blur-sm border shadow-md transition-all duration-200 hover:scale-[1.02] hover:shadow-lg text-left ${
                    isDarkMode
                      ? "bg-gray-800/50 border-gray-700/50 hover:bg-gray-800/70"
                      : "bg-white/70 border-gray-200/50 hover:bg-white/90"
                  }`}
                >
                  <div className="flex items-start space-x-3 mb-3">
                    <div
                      className={`p-2 rounded-lg backdrop-blur-sm border shadow-sm ${
                        isDarkMode
                          ? "bg-purple-500/20 text-purple-400 border-purple-500/30"
                          : "bg-purple-100/80 text-purple-600 border-purple-200/70"
                      }`}
                    >
                      <FolderKanban className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3
                        className={`font-semibold text-sm leading-tight truncate ${themeClasses.text.primary}`}
                      >
                        {board.name}
                      </h3>
                      {board.description && (
                        <p
                          className={`text-xs mt-1 line-clamp-2 ${themeClasses.text.tertiary}`}
                        >
                          {board.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs ${themeClasses.text.tertiary}`}>
                      Board
                    </span>
                    <span
                      className={`text-xs font-medium ${themeClasses.text.secondary}`}
                    >
                      View →
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
