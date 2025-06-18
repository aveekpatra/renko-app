"use client";

import React, { useState } from "react";
import { Plus, MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";

interface ProjectSidebarProps {
  isDarkMode: boolean;
  selectedBoardId: Id<"projects"> | null;
  handleBoardSelect: (boardId: Id<"projects">) => void;
  handleCreateBoard: () => void;
  handleEditProject: (boardId: Id<"projects">) => void;
  handleDeleteProject: (boardId: Id<"projects">) => void;
  filteredBoards:
    | Array<{ _id: Id<"projects">; name: string; description?: string }>
    | undefined;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export default function ProjectSidebar({
  isDarkMode,
  selectedBoardId,
  handleBoardSelect,
  handleCreateBoard,
  handleEditProject,
  handleDeleteProject,
  filteredBoards,
  searchQuery,
  setSearchQuery,
}: ProjectSidebarProps) {
  const [showMenu, setShowMenu] = useState<Id<"projects"> | null>(null);

  const themeClasses = {
    projectSidebar: isDarkMode
      ? "bg-gray-900/80 backdrop-blur-xl border-r border-gray-700/60 shadow-2xl shadow-black/30"
      : "bg-white/80 backdrop-blur-xl border-r border-purple-200/30 shadow-2xl shadow-purple-900/10",
    text: {
      primary: isDarkMode ? "text-gray-100" : "text-gray-900",
      secondary: isDarkMode ? "text-gray-300" : "text-gray-700",
      tertiary: isDarkMode ? "text-gray-400" : "text-gray-600",
    },
  };

  return (
    <div className={`w-80 ${themeClasses.projectSidebar} flex flex-col`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200/20">
        <h2 className={`text-base font-bold ${themeClasses.text.primary}`}>
          Projects
        </h2>
        <p className={`text-xs ${themeClasses.text.tertiary} mt-1`}>
          Manage your project boards
        </p>
      </div>

      {/* Search Bar */}
      <div className="p-3 border-b border-gray-200/20">
        <input
          type="text"
          placeholder="Search projects..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={`w-full px-3 py-2 rounded-lg border backdrop-blur-md transition-all text-sm ${
            isDarkMode
              ? "bg-gray-800/70 border-gray-700/60 text-gray-100 placeholder-gray-400 focus:border-purple-500/50"
              : "bg-white/80 border-purple-200/60 text-gray-800 placeholder-gray-500 focus:border-purple-400/50"
          } focus:outline-none focus:ring-1 focus:ring-purple-500/20`}
        />
      </div>

      {/* Projects List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-3">
          <div className="flex items-center justify-between mb-3">
            <h3
              className={`text-xs font-semibold uppercase tracking-wide ${themeClasses.text.secondary}`}
            >
              All Projects
            </h3>
            <button
              onClick={handleCreateBoard}
              className="p-1 rounded hover:bg-gray-100/10 transition-colors"
              title="Create New Project"
            >
              <Plus className={`w-3.5 h-3.5 ${themeClasses.text.tertiary}`} />
            </button>
          </div>

          {filteredBoards && filteredBoards.length > 0 ? (
            <div className="space-y-2">
              {filteredBoards.map((board) => (
                <div
                  key={board._id}
                  onClick={() => handleBoardSelect(board._id)}
                  className={`group relative p-3 rounded-lg border backdrop-blur-md cursor-pointer transition-all duration-200 hover:shadow-md ${
                    selectedBoardId === board._id
                      ? isDarkMode
                        ? "bg-gradient-to-br from-purple-500/20 to-purple-600/15 text-purple-300 border-purple-400/40 shadow-lg shadow-purple-900/30"
                        : "bg-gradient-to-br from-purple-50/95 to-purple-100/80 text-purple-800 border-purple-200/70 shadow-lg shadow-purple-200/40"
                      : isDarkMode
                        ? "bg-gray-800/30 border-gray-700/40 hover:bg-gray-800/50 text-gray-300"
                        : "bg-white/70 border-gray-200/50 hover:bg-white/90 text-gray-800"
                  }`}
                  onMouseLeave={() => setShowMenu(null)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 flex-1 min-w-0 pr-8">
                      <div
                        className={`w-3 h-3 rounded-full flex-shrink-0 shadow-sm ${
                          selectedBoardId === board._id
                            ? "bg-purple-500"
                            : "bg-gray-400"
                        }`}
                      />
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-semibold leading-tight truncate">
                          {board.name}
                        </h3>
                        {board.description && (
                          <p className="text-xs opacity-75 leading-tight mt-0.5 truncate">
                            {board.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Three-dot menu - only visible on hover */}
                    <div className="absolute top-2 right-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowMenu(
                            showMenu === board._id ? null : board._id,
                          );
                        }}
                        className={`p-1.5 rounded-lg transition-all duration-200 ${
                          isDarkMode
                            ? "hover:bg-gray-600/50 text-gray-400 hover:text-gray-200"
                            : "hover:bg-gray-200/50 text-gray-500 hover:text-gray-700"
                        } opacity-0 group-hover:opacity-100`}
                      >
                        <MoreHorizontal className="w-3.5 h-3.5" />
                      </button>

                      {/* Dropdown Menu */}
                      {showMenu === board._id && (
                        <div
                          className={`absolute right-0 top-full mt-1 w-40 rounded-lg shadow-lg border z-50 ${
                            isDarkMode
                              ? "bg-gray-800 border-gray-700"
                              : "bg-white border-gray-200"
                          }`}
                        >
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditProject(board._id);
                              setShowMenu(null);
                            }}
                            className={`w-full flex items-center space-x-2 px-3 py-2 text-sm transition-colors rounded-t-lg ${
                              isDarkMode
                                ? "hover:bg-gray-700 text-gray-300"
                                : "hover:bg-gray-50 text-gray-700"
                            }`}
                          >
                            <Edit className="w-3.5 h-3.5" />
                            <span>Edit Project</span>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteProject(board._id);
                              setShowMenu(null);
                            }}
                            className={`w-full flex items-center space-x-2 px-3 py-2 text-sm transition-colors rounded-b-lg ${
                              isDarkMode
                                ? "hover:bg-red-900/20 text-red-400"
                                : "hover:bg-red-50 text-red-600"
                            }`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete Project</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={`text-center py-8 ${themeClasses.text.tertiary}`}>
              <p className="text-sm">
                {searchQuery ? "No matching projects" : "No projects yet"}
              </p>
              {!searchQuery && (
                <button
                  onClick={handleCreateBoard}
                  className="mt-2 text-purple-500 hover:text-purple-600 text-sm underline"
                >
                  Create your first project
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
