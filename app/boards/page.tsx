"use client";

import React, { useState } from "react";
import {
  Plus,
  MoreHorizontal,
  Edit,
  Filter,
  Edit3,
  Trash2,
  Folder,
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
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import TaskModal from "@/components/TaskModal";
import ColumnModal from "@/components/ColumnModal";
import TaskCard from "@/components/TaskCard";
import { CreateBoardModal, EditProjectModal } from "@/components/BoardModals";

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

// Separate ProjectSidebar component to prevent unnecessary re-renders
const ProjectSidebar = React.memo(
  ({
    isDarkMode,
    selectedBoardId,
    handleBoardSelect,
    handleCreateBoard,
    handleEditProject,
    handleDeleteProject,
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
    filteredBoards:
      | Array<{ _id: Id<"projects">; name: string; description?: string }>
      | undefined;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
  }) => {
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
                              <Edit3 className="w-3.5 h-3.5" />
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
  const updateProjectMutation = useMutation(api.tasks.updateProject);
  const deleteProject = useMutation(api.tasks.deleteProject);
  const deleteColumn = useMutation(api.tasks.deleteColumn);

  // Wrapper function to match EditProjectModal interface
  const updateProject = async (updates: {
    name: string;
    description?: string;
  }) => {
    if (!selectedBoardId) return;
    await updateProjectMutation({
      projectId: selectedBoardId,
      name: updates.name,
      description: updates.description,
    });
  };

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

  const DroppableColumn = ({
    column,
    onEditColumn,
  }: {
    column: Column;
    onEditColumn: (column: Column) => void;
  }) => {
    const tasks = useQuery(api.tasks.getTasks, { columnId: column._id });
    const { setNodeRef, isOver } = useDroppable({
      id: column._id,
    });

    return (
      <div className="h-full flex flex-col">
        {/* Clean Column Header */}
        <div
          className={`group flex items-center justify-between px-3 py-2 ${
            isDarkMode
              ? "text-gray-300 hover:text-gray-200"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          <div className="flex items-center space-x-2">
            <h3
              className={`text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
            >
              {column.name}
            </h3>
            <span
              className={`text-xs px-1.5 py-0.5 rounded-full ${
                isDarkMode
                  ? "bg-gray-800/60 text-gray-400"
                  : "bg-gray-100/80 text-gray-500"
              }`}
            >
              {tasks?.length || 0}
            </span>
          </div>

          <button
            onClick={() => onEditColumn(column)}
            className={`opacity-0 group-hover:opacity-100 p-1 rounded transition-all duration-200 ${
              isDarkMode
                ? "hover:bg-gray-800/40 text-gray-500 hover:text-gray-400"
                : "hover:bg-gray-100/60 text-gray-400 hover:text-gray-600"
            }`}
          >
            <Edit className="w-3 h-3" />
          </button>
        </div>

        {/* Elegant Droppable Area */}
        <div
          ref={setNodeRef}
          className={`flex-1 min-h-0 overflow-y-auto p-3 transition-all duration-300 ${
            isOver
              ? isDarkMode
                ? "bg-purple-500/5 backdrop-blur-sm"
                : "bg-purple-50/30 backdrop-blur-sm"
              : "transparent"
          }`}
        >
          <SortableContext
            items={tasks?.map((task) => task._id) || []}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2.5">
              {tasks?.map((task) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  isDarkMode={isDarkMode}
                  onEditTask={openEditTaskModal}
                />
              ))}

              {/* Clean Add Task Button */}
              <button
                onClick={() => openCreateTaskModal(column._id)}
                className={`group w-full p-3 rounded-lg border border-dashed transition-all duration-300 hover:shadow-sm ${
                  isDarkMode
                    ? "border-gray-600/40 hover:border-gray-500/60 text-gray-500 hover:text-gray-400 hover:bg-gray-800/20"
                    : "border-gray-300/60 hover:border-gray-400/80 text-gray-400 hover:text-gray-600 hover:bg-gray-50/30"
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <Plus className="w-4 h-4" />
                  <span className="text-sm font-medium">Add task</span>
                </div>
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
          filteredBoards={filteredBoards}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        {/* Main Kanban Area */}
        <main className="flex-1 overflow-hidden flex flex-col">
          {/* Board Header */}
          <header
            className={`flex-shrink-0 px-6 py-3 ${
              isDarkMode
                ? "bg-gray-900/50 backdrop-blur-md"
                : "bg-white/50 backdrop-blur-md"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h1
                  className={`text-lg font-medium ${
                    isDarkMode ? "text-gray-200" : "text-gray-800"
                  }`}
                >
                  {boards?.find((b) => b._id === selectedBoardId)?.name ||
                    "Board"}
                </h1>
                <button
                  onClick={openCreateColumnModal}
                  className={`group flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                    isDarkMode
                      ? "bg-gray-800/60 hover:bg-gray-700/60 text-gray-300 hover:text-white"
                      : "bg-gray-100/80 hover:bg-gray-200/80 text-gray-600 hover:text-gray-800"
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Column</span>
                </button>
              </div>
              <div className="flex items-center space-x-1">
                <button
                  className={`p-1.5 rounded-md transition-all duration-200 ${
                    isDarkMode
                      ? "hover:bg-gray-800/40 text-gray-500 hover:text-gray-400"
                      : "hover:bg-gray-100/60 text-gray-400 hover:text-gray-600"
                  }`}
                  title="Filter tasks"
                >
                  <Filter className="w-4 h-4" />
                </button>
                <button
                  className={`p-1.5 rounded-md transition-all duration-200 ${
                    isDarkMode
                      ? "hover:bg-gray-800/40 text-gray-500 hover:text-gray-400"
                      : "hover:bg-gray-100/60 text-gray-400 hover:text-gray-600"
                  }`}
                  title="More options"
                >
                  <MoreHorizontal className="w-4 h-4" />
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
                      />
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </main>

        {/* Drag Overlay */}
        <DragOverlay>
          {activeTask ? (
            <TaskCard
              task={activeTask}
              isDarkMode={isDarkMode}
              onEditTask={openEditTaskModal}
            />
          ) : null}
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
