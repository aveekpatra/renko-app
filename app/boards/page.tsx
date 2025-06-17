"use client";

import React, { useState, useCallback } from "react";
import {
  Plus,
  CheckCircle2,
  Circle,
  MoreHorizontal,
  Folder,
  Clock,
  Target,
  Edit,
  Edit2,
  Trash2,
  AlertCircle,
  Calendar,
  Tag,
  X,
  Search,
  Edit3,
  Flag,
  Users,
  Filter,
  SortAsc,
  Grid3X3,
  List,
  Settings,
  Archive,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import { useTheme } from "@/components/AppLayout";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import TaskModal from "@/components/TaskModal";
import CreateBoardModal from "@/components/CreateBoardModal";
import EditProjectModal from "@/components/EditProjectModal";
import ColumnModal from "@/components/ColumnModal";

// Separate ProjectSidebar component to prevent unnecessary re-renders
const ProjectSidebar = React.memo(
  ({
    isDarkMode,
    selectedBoardId,
    handleBoardSelect,
    handleCreateBoard,
    handleEditProject,
    handleDeleteProject,
    setSelectedBoardId,
    filteredBoards,
    searchQuery,
    setSearchQuery,
  }: {
    isDarkMode: boolean;
    selectedBoardId: Id<"projects"> | null;
    handleBoardSelect: (boardId: Id<"projects">) => void;
    handleCreateBoard: () => void;
    handleEditProject: (boardId: Id<"projects">) => void;
    handleDeleteProject: (boardId: Id<"projects">) => void;
    setSelectedBoardId: (boardId: Id<"projects">) => void;
    filteredBoards: any[] | undefined;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
  }) => {
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
                {filteredBoards.map((board) => {
                  const [showMenu, setShowMenu] = React.useState(false);

                  return (
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
                      onMouseLeave={() => setShowMenu(false)}
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
                              setShowMenu(!showMenu);
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
                          {showMenu && (
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
                                  setShowMenu(false);
                                }}
                                className={`w-full flex items-center space-x-2 px-3 py-2 text-sm transition-colors rounded-t-lg ${
                                  isDarkMode
                                    ? "hover:bg-gray-700 text-gray-300"
                                    : "hover:bg-gray-50 text-gray-700"
                                }`}
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                                <span>Edit Project</span>
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteProject(board._id);
                                  setShowMenu(false);
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
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className={`mb-4 ${themeClasses.text.tertiary}`}>
                  <Folder className="w-12 h-12 mx-auto mb-3 opacity-50" />
                </div>
                <p className={`text-sm ${themeClasses.text.tertiary} mb-4`}>
                  {searchQuery.trim() ? "No projects found" : "No projects yet"}
                </p>
                {!searchQuery.trim() && (
                  <button
                    onClick={handleCreateBoard}
                    className={`px-4 py-2 rounded-lg border transition-all text-sm font-medium ${
                      isDarkMode
                        ? "bg-purple-500/20 border-purple-400/40 text-purple-300 hover:bg-purple-500/30"
                        : "bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100"
                    }`}
                  >
                    <Plus className="w-4 h-4 inline mr-2" />
                    Create Your First Project
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  },
);

ProjectSidebar.displayName = "ProjectSidebar";

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

interface Column {
  _id: Id<"columns">;
  name: string;
  projectId: Id<"projects">;
  position: number;
  color?: string;
}

// Create Project Modal Component
const CreateBoardModal = ({
  isOpen,
  onClose,
  isDarkMode,
}: {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
}) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createBoard = useMutation(api.tasks.createBoard);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setIsSubmitting(true);
    try {
      await createBoard({
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
      });
      setFormData({ name: "", description: "" });
      onClose();
    } catch (error) {
      console.error("Failed to create project:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div
        className={`w-full max-w-md rounded-2xl border shadow-2xl backdrop-blur-xl ${
          isDarkMode
            ? "bg-gray-900/95 border-gray-800/60"
            : "bg-white/95 border-gray-200/60"
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between p-6 border-b ${
            isDarkMode ? "border-gray-800/50" : "border-gray-200/50"
          }`}
        >
          <h2
            className={`text-xl font-semibold ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            Create New Project
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
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label
              className={`block text-sm font-medium mb-2 ${
                isDarkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Project Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className={`w-full px-4 py-3 rounded-xl border backdrop-blur-sm transition-all ${
                isDarkMode
                  ? "bg-gray-800/50 border-gray-700/50 text-white placeholder-gray-400 focus:border-purple-500"
                  : "bg-white/70 border-gray-300/70 text-gray-900 placeholder-gray-500 focus:border-purple-500"
              } focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
              placeholder="Enter project name..."
              required
            />
          </div>

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
              className={`w-full px-4 py-3 rounded-xl border backdrop-blur-sm transition-all resize-none ${
                isDarkMode
                  ? "bg-gray-800/50 border-gray-700/50 text-white placeholder-gray-400 focus:border-purple-500"
                  : "bg-white/70 border-gray-300/70 text-gray-900 placeholder-gray-500 focus:border-purple-500"
              } focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
              placeholder="Enter project description..."
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4">
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
              disabled={!formData.name.trim() || isSubmitting}
              className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium shadow-lg shadow-purple-500/25"
            >
              {isSubmitting ? "Creating..." : "Create Project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Edit Project Modal Component
const EditProjectModal = ({
  isOpen,
  onClose,
  isDarkMode,
  project,
  onUpdate,
}: {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  project: any;
  onUpdate: (updates: any) => Promise<any>;
}) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update form data when project changes
  React.useEffect(() => {
    if (project) {
      setFormData({
        name: project.name || "",
        description: project.description || "",
      });
    }
  }, [project]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setIsSubmitting(true);
    try {
      const updates: any = {
        projectId: project._id,
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
      };

      await onUpdate(updates);
      onClose();
    } catch (error) {
      console.error("Failed to update project:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !project) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div
        className={`w-full max-w-md rounded-2xl border shadow-2xl backdrop-blur-xl ${
          isDarkMode
            ? "bg-gray-900/95 border-gray-800/60"
            : "bg-white/95 border-gray-200/60"
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between p-6 border-b ${
            isDarkMode ? "border-gray-800/50" : "border-gray-200/50"
          }`}
        >
          <h2
            className={`text-xl font-bold ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            Edit Project
          </h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${
              isDarkMode
                ? "hover:bg-gray-800/50 text-gray-400"
                : "hover:bg-gray-100/50 text-gray-600"
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label
              className={`block text-sm font-medium mb-2 ${
                isDarkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Project Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className={`w-full px-4 py-3 rounded-xl border backdrop-blur-sm transition-all ${
                isDarkMode
                  ? "bg-gray-800/50 border-gray-700/50 text-white placeholder-gray-400 focus:border-purple-500"
                  : "bg-white/70 border-gray-300/70 text-gray-900 placeholder-gray-500 focus:border-purple-500"
              } focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
              placeholder="Enter project name..."
              required
            />
          </div>

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
              className={`w-full px-4 py-3 rounded-xl border backdrop-blur-sm transition-all resize-none ${
                isDarkMode
                  ? "bg-gray-800/50 border-gray-700/50 text-white placeholder-gray-400 focus:border-purple-500"
                  : "bg-white/70 border-gray-300/70 text-gray-900 placeholder-gray-500 focus:border-purple-500"
              } focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
              placeholder="Enter project description..."
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4">
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
              disabled={!formData.name.trim() || isSubmitting}
              className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium shadow-lg shadow-purple-500/25"
            >
              {isSubmitting ? "Updating..." : "Update Project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function BoardsPage() {
  const { isDarkMode } = useTheme();
  const [selectedBoardId, setSelectedBoardId] = useState<Id<"projects"> | null>(
    null,
  );
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateBoardModal, setShowCreateBoardModal] = useState(false);
  const [showEditProjectModal, setShowEditProjectModal] = useState(false);
  const [taskModalState, setTaskModalState] = useState<{
    isOpen: boolean;
    mode: "create" | "edit";
    columnId?: Id<"columns">;
    taskId?: Id<"tasks">;
  }>({
    isOpen: false,
    mode: "create",
  });
  const [columnModalState, setColumnModalState] = useState<{
    isOpen: boolean;
    mode: "create" | "edit";
    columnId?: Id<"columns">;
    initialData?: { name: string; color: string };
  }>({
    isOpen: false,
    mode: "create",
  });

  // Drag and drop sensors - must be called unconditionally
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );

  // Fetch real data from Convex
  const boards = useQuery(api.tasks.getBoards);

  // Get columns and tasks for selected board
  const columns = useQuery(
    api.tasks.getColumns,
    selectedBoardId ? { boardId: selectedBoardId } : "skip",
  );

  // Mutations
  const updateTaskPosition = useMutation(api.tasks.updateTaskPosition);
  const updateProject = useMutation(api.tasks.updateProject);
  const deleteProject = useMutation(api.tasks.deleteProject);
  const deleteColumn = useMutation(api.tasks.deleteColumn);

  // Callback functions - must be defined before any conditional returns
  const handleBoardSelect = React.useCallback((boardId: Id<"projects">) => {
    setSelectedBoardId(boardId);
  }, []);

  const handleCreateBoard = React.useCallback(() => {
    setShowCreateBoardModal(true);
  }, []);

  const handleEditProject = React.useCallback((boardId: Id<"projects">) => {
    setShowEditProjectModal(true);
    setSelectedBoardId(boardId);
  }, []);

  const handleDeleteProject = React.useCallback(
    async (boardId: Id<"projects">) => {
      const confirmed = window.confirm(
        "Are you sure you want to delete this project? This will delete all columns and tasks within it. This action cannot be undone.",
      );

      if (confirmed) {
        try {
          await deleteProject({ projectId: boardId });
          // Reset selected board after deletion
          setSelectedBoardId(null);
        } catch (error) {
          console.error("Failed to delete project:", error);
          alert("Failed to delete project. Please try again.");
        }
      }
    },
    [deleteProject],
  );

  // Column management functions - moved here to fix hooks order
  const openCreateColumnModal = React.useCallback(() => {
    setColumnModalState({
      isOpen: true,
      mode: "create",
    });
  }, []);

  const openEditColumnModal = React.useCallback((column: Column) => {
    setColumnModalState({
      isOpen: true,
      mode: "edit",
      columnId: column._id,
      initialData: {
        name: column.name,
        color: column.color || "#6b7280",
      },
    });
  }, []);

  const handleDeleteColumn = React.useCallback(
    async (columnId: Id<"columns">) => {
      if (
        window.confirm(
          "Are you sure you want to delete this column? This action cannot be undone.",
        )
      ) {
        try {
          await deleteColumn({ columnId });
        } catch (error) {
          console.error("Failed to delete column:", error);
          alert("Failed to delete column. Please make sure it's empty first.");
        }
      }
    },
    [deleteColumn],
  );

  const closeColumnModal = React.useCallback(() => {
    setColumnModalState({
      isOpen: false,
      mode: "create",
    });
  }, []);

  // Set default board if not selected
  React.useEffect(() => {
    if (boards && boards.length > 0 && !selectedBoardId) {
      setSelectedBoardId(boards[0]._id);
    }
  }, [boards, selectedBoardId]);

  // Filter boards based on search query
  const filteredBoards = React.useMemo(() => {
    if (!boards) return [];
    if (!searchQuery.trim()) return boards;

    return boards.filter(
      (board) =>
        board.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        board.description?.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [boards, searchQuery]);

  // Show loading state
  if (boards === undefined) {
    return (
      <div className="flex items-center justify-center h-full">
        <div
          className={`text-lg ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}
        >
          Loading...
        </div>
      </div>
    );
  }

  // Show loading state for columns
  if (selectedBoardId && columns === undefined) {
    return (
      <div className="flex items-center justify-center h-full">
        <div
          className={`text-lg ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}
        >
          Loading board...
        </div>
      </div>
    );
  }

  const handleDragStart = (event: DragStartEvent) => {
    setActiveTask(event.active.data.current?.task || null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const taskId = active.id as Id<"tasks">;

    // Find the task to get current position
    const task = activeTask;
    if (!task) return;

    // Determine the target column ID
    let newColumnId: Id<"columns">;

    // Check if we're dropping on a column or on another task
    const overData = over.data?.current;
    if (overData?.task) {
      // Dropping on another task - use that task's column
      newColumnId = overData.task.columnId;
    } else {
      // Dropping on a column directly
      newColumnId = over.id as Id<"columns">;
    }

    // Don't update if dropping in the same column
    if (task.columnId === newColumnId) {
      return;
    }

    // Calculate new position (for now, just append to end)
    const newPosition = 0; // This could be calculated based on drop position

    try {
      await updateTaskPosition({
        taskId,
        newColumnId,
        newPosition,
      });
    } catch (error) {
      console.error("Failed to update task position:", error);
    }
  };

  const openCreateTaskModal = (columnId: Id<"columns">) => {
    setTaskModalState({
      isOpen: true,
      mode: "create",
      columnId,
    });
  };

  const openEditTaskModal = (taskId: Id<"tasks">) => {
    setTaskModalState({
      isOpen: true,
      mode: "edit",
      taskId,
    });
  };

  const closeTaskModal = () => {
    setTaskModalState({
      isOpen: false,
      mode: "create",
    });
  };

  const DraggableTaskCard = ({ task }: { task: Task }) => {
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

    const getTaskColor = () => {
      if (task.priority === "high") return "border-l-red-500";
      if (task.priority === "medium") return "border-l-orange-500";
      return "border-l-blue-500";
    };

    const getPriorityColor = (priority?: string) => {
      switch (priority) {
        case "high":
          return isDarkMode
            ? "bg-red-500/20 text-red-400 border-red-500/30"
            : "bg-red-50 text-red-600 border-red-200";
        case "medium":
          return isDarkMode
            ? "bg-orange-500/20 text-orange-400 border-orange-500/30"
            : "bg-orange-50 text-orange-600 border-orange-200";
        case "low":
          return isDarkMode
            ? "bg-green-500/20 text-green-400 border-green-500/30"
            : "bg-green-50 text-green-600 border-green-200";
        default:
          return isDarkMode
            ? "bg-gray-500/20 text-gray-400 border-gray-500/30"
            : "bg-gray-50 text-gray-600 border-gray-200";
      }
    };

    if (isDragging) {
      return (
        <div
          ref={setNodeRef}
          style={style}
          className={`p-4 rounded-lg border-l-4 ${getTaskColor()} backdrop-blur-sm border shadow-lg opacity-50 ${
            isDarkMode
              ? "bg-gray-800/90 border-gray-700/50"
              : "bg-white/90 border-gray-200/50"
          }`}
        >
          <h4
            className={`font-medium text-sm mb-2 ${
              isDarkMode ? "text-gray-200" : "text-gray-800"
            }`}
          >
            {task.title}
          </h4>
          {task.description && (
            <p
              className={`text-xs mb-3 line-clamp-2 ${
                isDarkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              {task.description}
            </p>
          )}
        </div>
      );
    }

    return (
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className={`group relative p-4 rounded-lg border-l-4 ${getTaskColor()} backdrop-blur-sm border shadow-sm hover:shadow-md transition-all duration-200 cursor-grab active:cursor-grabbing ${
          isDarkMode
            ? "bg-gray-800/60 border-gray-700/50 hover:bg-gray-800/80"
            : "bg-white/80 border-gray-200/50 hover:bg-white/90"
        }`}
        onMouseLeave={() => setShowMenu(false)}
      >
        {/* Task Content */}
        <div className="pr-8">
          <div className="flex items-start justify-between mb-2">
            <h4
              className={`font-medium text-sm ${
                isDarkMode ? "text-gray-200" : "text-gray-800"
              }`}
            >
              {task.title}
            </h4>
          </div>

          {task.description && (
            <p
              className={`text-xs mb-3 line-clamp-2 ${
                isDarkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              {task.description}
            </p>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {task.priority && (
                <span
                  className={`px-2 py-1 rounded-md text-xs font-medium border ${getPriorityColor(
                    task.priority,
                  )}`}
                >
                  {task.priority}
                </span>
              )}
              {task.dueDate && (
                <div className="flex items-center space-x-1">
                  <Calendar className="w-3 h-3 text-gray-400" />
                  <span
                    className={`text-xs ${
                      isDarkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    {new Date(task.dueDate).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Three-dot menu - only visible on hover */}
        <div className="absolute top-2 right-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
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
          {showMenu && (
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
                  openEditTaskModal(task._id);
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
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  // Add delete task functionality here
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
            </div>
          )}
        </div>
      </div>
    );
  };

  const DroppableColumn = ({
    column,
    onEditColumn,
    onDeleteColumn,
  }: {
    column: Column;
    onEditColumn: (column: Column) => void;
    onDeleteColumn: (columnId: Id<"columns">) => void;
  }) => {
    const tasks = useQuery(api.tasks.getTasks, { columnId: column._id });
    const { setNodeRef, isOver } = useDroppable({
      id: column._id,
    });
    const [showMenu, setShowMenu] = useState(false);

    const getColumnIcon = (position: number) => {
      const icons = [
        { icon: Clock, color: "text-red-500" },
        { icon: Sparkles, color: "text-orange-500" },
        { icon: Flag, color: "text-green-500" },
      ];
      return icons[position % icons.length] || icons[0];
    };

    const getColumnColor = (position: number) => {
      const colors = [
        "bg-red-500/10 border-red-500/20",
        "bg-orange-500/10 border-orange-500/20",
        "bg-green-500/10 border-green-500/20",
      ];
      return colors[position % colors.length] || colors[0];
    };

    const IconComponent = getColumnIcon(column.position).icon;

    return (
      <div className="h-full flex flex-col space-y-4">
        {/* Column Header */}
        <div
          className={`flex items-center justify-between p-4 rounded-xl border backdrop-blur-sm group relative ${getColumnColor(column.position)} ${
            isDarkMode
              ? "bg-gray-800/40 border-gray-700/50"
              : "bg-white/80 border-gray-200/60"
          }`}
          onMouseLeave={() => setShowMenu(false)}
        >
          <div className="flex items-center space-x-3">
            <div
              className={`p-2 rounded-lg ${
                isDarkMode
                  ? "bg-gray-700/50 text-gray-300"
                  : "bg-gray-100/80 text-gray-600"
              }`}
            >
              <IconComponent className="w-4 h-4" />
            </div>
            <div>
              <h3
                className={`font-medium ${isDarkMode ? "text-gray-100" : "text-gray-900"}`}
              >
                {column.name}
              </h3>
              <p
                className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
              >
                {tasks?.length || 0} tasks
              </p>
            </div>
          </div>

          {/* Three-dot menu - only visible on hover */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className={`p-2 rounded-lg transition-all duration-200 ${
                isDarkMode
                  ? "hover:bg-gray-600/50 text-gray-400 hover:text-gray-200"
                  : "hover:bg-gray-200/50 text-gray-500 hover:text-gray-700"
              } opacity-0 group-hover:opacity-100`}
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>

            {/* Dropdown Menu */}
            {showMenu && (
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
                    onEditColumn(column);
                    setShowMenu(false);
                  }}
                  className={`w-full flex items-center space-x-2 px-3 py-2 text-sm transition-colors rounded-t-lg ${
                    isDarkMode
                      ? "hover:bg-gray-700 text-gray-300"
                      : "hover:bg-gray-50 text-gray-700"
                  }`}
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Edit Column</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteColumn(column._id);
                    setShowMenu(false);
                  }}
                  className={`w-full flex items-center space-x-2 px-3 py-2 text-sm transition-colors rounded-b-lg ${
                    isDarkMode
                      ? "hover:bg-red-900/20 text-red-400"
                      : "hover:bg-red-50 text-red-600"
                  }`}
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Column</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Column Content - Droppable Area */}
        <div
          ref={setNodeRef}
          className={`flex-1 min-h-0 overflow-y-auto scrollbar-none rounded-lg p-3 backdrop-blur-sm border transition-all duration-200 ${
            isOver
              ? isDarkMode
                ? "bg-blue-800/40 border-blue-500/60 shadow-lg shadow-blue-900/30"
                : "bg-blue-50/90 border-blue-300/70 shadow-lg shadow-blue-200/40"
              : isDarkMode
                ? "bg-gray-800/30 border-gray-700/40"
                : "bg-gray-50/80 border-gray-200/50"
          }`}
        >
          <SortableContext
            items={tasks?.map((task) => task._id) || []}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {tasks?.map((task) => (
                <DraggableTaskCard key={task._id} task={task} />
              ))}
              <button
                onClick={() => openCreateTaskModal(column._id)}
                className={`w-full p-3 rounded-lg border-2 border-dashed transition-all duration-200 text-sm font-medium ${
                  isDarkMode
                    ? "border-gray-600 hover:border-gray-500 text-gray-400 hover:bg-gray-700/30"
                    : "border-gray-300 hover:border-gray-400 text-gray-600 hover:bg-gray-50/50"
                }`}
              >
                <Plus className="w-4 h-4 inline mr-2" />
                Add task
              </button>
            </div>
          </SortableContext>
        </div>
      </div>
    );
  };

  if (!selectedBoardId || !columns) {
    return (
      <div className="flex h-full overflow-hidden">
        <ProjectSidebar
          isDarkMode={isDarkMode}
          selectedBoardId={selectedBoardId}
          handleBoardSelect={handleBoardSelect}
          handleCreateBoard={handleCreateBoard}
          handleEditProject={handleEditProject}
          handleDeleteProject={handleDeleteProject}
          setSelectedBoardId={setSelectedBoardId}
          filteredBoards={filteredBoards}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
        <main className="flex-1 overflow-hidden flex items-center justify-center">
          <div
            className={`text-lg ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}
          >
            {boards && boards.length === 0
              ? "No projects available"
              : "Select a project to get started"}
          </div>
        </main>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex h-full overflow-hidden">
        {/* Project Sidebar */}
        <ProjectSidebar
          isDarkMode={isDarkMode}
          selectedBoardId={selectedBoardId}
          handleBoardSelect={handleBoardSelect}
          handleCreateBoard={handleCreateBoard}
          handleEditProject={handleEditProject}
          handleDeleteProject={handleDeleteProject}
          setSelectedBoardId={setSelectedBoardId}
          filteredBoards={filteredBoards}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        {/* Main Kanban Area */}
        <main className="flex-1 overflow-hidden flex flex-col">
          {/* Board Header */}
          <header
            className={`flex-shrink-0 border-b px-6 py-4 ${
              isDarkMode
                ? "bg-gray-900 border-gray-800"
                : "bg-white border-gray-200"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h1
                  className={`text-2xl font-bold ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  {boards?.find((b) => b._id === selectedBoardId)?.name ||
                    "Board"}
                </h1>
                <button
                  onClick={openCreateColumnModal}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    isDarkMode
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "bg-blue-500 hover:bg-blue-600 text-white"
                  }`}
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Column</span>
                </button>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  className={`p-2 rounded-lg transition-colors ${
                    isDarkMode
                      ? "hover:bg-gray-800 text-gray-400"
                      : "hover:bg-gray-100 text-gray-600"
                  }`}
                >
                  <Filter className="w-5 h-5" />
                </button>
                <button
                  className={`p-2 rounded-lg transition-colors ${
                    isDarkMode
                      ? "hover:bg-gray-800 text-gray-400"
                      : "hover:bg-gray-100 text-gray-600"
                  }`}
                >
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>
            </div>
          </header>

          {/* Kanban Columns */}
          <div className="flex-1 overflow-hidden">
            <div className="h-full p-6">
              <div className="h-full flex gap-6 overflow-x-auto">
                {columns
                  .sort((a, b) => a.position - b.position)
                  .map((column) => (
                    <div
                      key={column._id}
                      className="flex-1 min-w-80 max-w-96 h-full"
                    >
                      <DroppableColumn
                        column={column}
                        onEditColumn={openEditColumnModal}
                        onDeleteColumn={handleDeleteColumn}
                      />
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </main>

        {/* Drag Overlay */}
        <DragOverlay>
          {activeTask ? <DraggableTaskCard task={activeTask} /> : null}
        </DragOverlay>
      </div>

      {/* Task Modal */}
      <TaskModal
        isOpen={taskModalState.isOpen}
        onClose={closeTaskModal}
        columnId={taskModalState.columnId}
        taskId={taskModalState.taskId}
        mode={taskModalState.mode}
      />

      {/* Create Board Modal */}
      <CreateBoardModal
        isOpen={showCreateBoardModal}
        onClose={() => setShowCreateBoardModal(false)}
        isDarkMode={isDarkMode}
      />

      {/* Edit Project Modal */}
      <EditProjectModal
        isOpen={showEditProjectModal}
        onClose={() => setShowEditProjectModal(false)}
        isDarkMode={isDarkMode}
        project={
          selectedBoardId
            ? boards?.find((b) => b._id === selectedBoardId)
            : null
        }
        onUpdate={updateProject}
      />

      {/* Column Modal */}
      <ColumnModal
        isOpen={columnModalState.isOpen}
        onClose={closeColumnModal}
        projectId={selectedBoardId}
        columnId={columnModalState.columnId}
        mode={columnModalState.mode}
        initialData={columnModalState.initialData}
      />
    </DndContext>
  );
}
