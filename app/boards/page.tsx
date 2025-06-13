"use client";

import React, { useState } from "react";
import {
  Plus,
  CheckCircle2,
  Circle,
  MoreHorizontal,
  Folder,
  Clock,
  Target,
  Edit,
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
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import TaskModal from "@/components/TaskModal";

interface Task {
  _id: Id<"tasks">;
  title: string;
  description?: string;
  status: string;
  priority?: string;
  dueDate?: number;
  projectId?: Id<"projects">;
  columnId?: Id<"columns">;
  position: number;
}

interface Column {
  _id: Id<"columns">;
  name: string;
  boardId: Id<"boards">;
  position: number;
  color?: string;
}

export default function BoardsPage() {
  const { isDarkMode } = useTheme();
  const [selectedBoardId, setSelectedBoardId] = useState<Id<"boards"> | null>(
    null,
  );
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [taskModalState, setTaskModalState] = useState<{
    isOpen: boolean;
    mode: "create" | "edit";
    columnId?: Id<"columns">;
    taskId?: Id<"tasks">;
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
  const projects = useQuery(api.projects.getProjects, {});

  // Get columns and tasks for selected board
  const columns = useQuery(
    api.tasks.getColumns,
    selectedBoardId ? { boardId: selectedBoardId } : "skip",
  );

  // Mutations
  const updateTaskPosition = useMutation(api.tasks.updateTaskPosition);

  // Set default board if not selected
  React.useEffect(() => {
    if (boards && boards.length > 0 && !selectedBoardId) {
      setSelectedBoardId(boards[0]._id);
    }
  }, [boards, selectedBoardId]);

  // Show loading state
  if (boards === undefined || projects === undefined) {
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

  // Drag and drop sensors - moved to top to avoid conditional hook calls

  const handleDragStart = (event: DragStartEvent) => {
    setActiveTask(event.active.data.current?.task || null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const taskId = active.id as Id<"tasks">;
    const newColumnId = over.id as Id<"columns">;

    // Find the task to get current position
    const task = activeTask;
    if (!task) return;

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

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    };

    const getTaskColor = () => {
      // Default blue color for tasks
      return isDarkMode
        ? "bg-blue-500/15 text-blue-300 border-blue-400/30 shadow-blue-900/20"
        : "bg-blue-50/95 text-blue-800 border-blue-200/60 shadow-blue-200/30";
    };

    const getPriorityColor = (priority?: string) => {
      switch (priority) {
        case "urgent":
          return isDarkMode
            ? "bg-red-500/20 text-red-300 border-red-400/40"
            : "bg-red-100 text-red-700 border-red-300/60";
        case "normal":
          return isDarkMode
            ? "bg-blue-500/20 text-blue-300 border-blue-400/40"
            : "bg-blue-100 text-blue-700 border-blue-300/60";
        case "low":
          return isDarkMode
            ? "bg-green-500/20 text-green-300 border-green-400/40"
            : "bg-green-100 text-green-700 border-green-300/60";
        default:
          return isDarkMode
            ? "bg-gray-500/20 text-gray-300 border-gray-400/40"
            : "bg-gray-100 text-gray-700 border-gray-300/60";
      }
    };

    return (
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className={`p-3 rounded-xl cursor-grab backdrop-blur-sm border shadow-md transition-all duration-200 hover:shadow-lg group ${getTaskColor()} ${
          isDragging ? "opacity-50 rotate-3 scale-105" : ""
        }`}
      >
        {/* Task Header */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-start space-x-2 flex-1">
            <button className="mt-1 transition-colors">
              {task.status === "done" ? (
                <CheckCircle2 className="w-4 h-4 text-green-500" />
              ) : (
                <Circle className="w-4 h-4 opacity-60" />
              )}
            </button>
            <span
              className={`font-medium text-sm leading-tight flex-1 ${
                task.status === "done" ? "line-through opacity-60" : ""
              }`}
            >
              {task.title}
            </span>
          </div>
          <div className="flex space-x-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                openEditTaskModal(task._id);
              }}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-black/10 rounded"
            >
              <Edit className="w-4 h-4 opacity-60" />
            </button>
            <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-black/10 rounded">
              <MoreHorizontal className="w-4 h-4 opacity-60" />
            </button>
          </div>
        </div>

        {/* Task Description */}
        {task.description && (
          <p className="text-xs opacity-75 mb-2 leading-relaxed">
            {task.description}
          </p>
        )}

        {/* Task Footer */}
        <div className="flex items-center justify-between">
          <span
            className={`text-xs px-2 py-1 rounded-lg font-medium backdrop-blur-sm border ${
              isDarkMode
                ? "bg-gray-700/50 text-gray-300 border-gray-600/50"
                : "bg-white/80 text-gray-600 border-gray-300/60"
            }`}
          >
            {task.status}
          </span>
          {task.priority && (
            <span
              className={`text-xs px-2 py-1 rounded-lg font-medium backdrop-blur-sm border ${getPriorityColor(task.priority)}`}
            >
              {task.priority}
            </span>
          )}
        </div>
      </div>
    );
  };

  const DroppableColumn = ({ column }: { column: Column }) => {
    const tasks = useQuery(api.tasks.getTasks, { columnId: column._id });
    const { setNodeRef, isOver } = useDroppable({
      id: column._id,
    });

    if (tasks === undefined) {
      return (
        <div className="flex-1 min-w-0 h-full flex flex-col">
          <div className="flex items-center justify-center h-32">
            <div
              className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
            >
              Loading tasks...
            </div>
          </div>
        </div>
      );
    }

    const getColumnIcon = (position: number) => {
      switch (position) {
        case 0:
          return <Target className="w-4 h-4" />;
        case 1:
          return <Clock className="w-4 h-4" />;
        case 2:
          return <CheckCircle2 className="w-4 h-4" />;
        default:
          return <Circle className="w-4 h-4" />;
      }
    };

    const getColumnColor = (position: number) => {
      switch (position) {
        case 0:
          return isDarkMode
            ? "bg-blue-500/15 text-blue-400 border-blue-500/30 shadow-blue-900/30"
            : "bg-blue-50/80 text-blue-600 border-blue-200/70 shadow-blue-200/40";
        case 1:
          return isDarkMode
            ? "bg-orange-500/15 text-orange-400 border-orange-500/30 shadow-orange-900/30"
            : "bg-orange-50/80 text-orange-600 border-orange-200/70 shadow-orange-200/40";
        case 2:
          return isDarkMode
            ? "bg-green-500/15 text-green-400 border-green-500/30 shadow-green-900/30"
            : "bg-green-50/80 text-green-600 border-green-200/70 shadow-green-200/40";
        default:
          return isDarkMode
            ? "bg-gray-500/15 text-gray-400 border-gray-500/30 shadow-gray-900/30"
            : "bg-gray-50/80 text-gray-600 border-gray-200/70 shadow-gray-200/40";
      }
    };

    return (
      <div className="flex-1 min-w-0 h-full flex flex-col">
        {/* Column Header */}
        <div className="flex items-center justify-between mb-4 px-1">
          <div className="flex items-center space-x-3">
            <div
              className={`p-2 rounded-xl backdrop-blur-sm border shadow-lg ${getColumnColor(column.position)}`}
            >
              {getColumnIcon(column.position)}
            </div>
            <div>
              <h3 className={`font-medium ${themeClasses.text.primary}`}>
                {column.name}
              </h3>
              <p className={`text-sm ${themeClasses.text.tertiary}`}>
                {tasks.length} tasks
              </p>
            </div>
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
            items={tasks.map((task) => task._id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {tasks.map((task) => (
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

  const ProjectSidebar = () => (
    <div className={`w-80 ${themeClasses.projectSidebar} flex flex-col`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200/20">
        <h2 className={`text-base font-bold ${themeClasses.text.primary}`}>
          Boards
        </h2>
        <p className={`text-xs ${themeClasses.text.tertiary} mt-1`}>
          Manage your project boards and tasks
        </p>
      </div>

      {/* Search Bar */}
      <div className="p-3 border-b border-gray-200/20">
        <div className="relative">
          <Plus
            className={`absolute left-2.5 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 z-10 ${themeClasses.text.tertiary}`}
          />
          <input
            type="text"
            placeholder="Search boards..."
            className={`w-full pl-9 pr-3 py-2 rounded-lg border backdrop-blur-md transition-all duration-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/30 ${
              isDarkMode
                ? "bg-gray-800/70 border-gray-700/60 text-gray-100 placeholder-gray-400 focus:border-purple-500/50 focus:bg-gray-800/90"
                : "bg-white/80 border-purple-200/60 text-gray-800 placeholder-gray-500 focus:border-purple-400/50 focus:bg-white/95"
            }`}
          />
        </div>
      </div>

      {/* Boards Section */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-3">
          <div className="flex items-center justify-between mb-3">
            <h3
              className={`text-xs font-semibold uppercase tracking-wide ${themeClasses.text.secondary}`}
            >
              Project Boards
            </h3>
            <button className="p-1 rounded hover:bg-gray-100/10 transition-colors">
              <Folder className={`w-3.5 h-3.5 ${themeClasses.text.tertiary}`} />
            </button>
          </div>

          <div className="space-y-2">
            {boards.map((board) => {
              const isSelected = selectedBoardId === board._id;

              return (
                <button
                  key={board._id}
                  onClick={() => setSelectedBoardId(board._id)}
                  className={`w-full p-2.5 rounded-lg transition-all duration-200 text-left group border backdrop-blur-md ${
                    isSelected
                      ? isDarkMode
                        ? "bg-gradient-to-br from-purple-500/20 to-purple-600/15 text-purple-300 border-purple-400/40 shadow-lg shadow-purple-900/30"
                        : "bg-gradient-to-br from-purple-50/95 to-purple-100/80 text-purple-800 border-purple-200/70 shadow-lg shadow-purple-200/40"
                      : isDarkMode
                        ? "bg-gradient-to-br from-gray-700/20 to-gray-800/15 text-gray-300 border-gray-600/40 hover:bg-gray-700/50 shadow-lg shadow-gray-900/30"
                        : "bg-gradient-to-br from-white/50 to-gray-50/80 text-gray-700 border-gray-200/50 hover:bg-white/80 shadow-lg shadow-gray-200/40"
                  }`}
                >
                  <div className="flex items-start space-x-2.5 mb-2">
                    <div className="w-3 h-3 rounded-full mt-0.5 flex-shrink-0 shadow-sm bg-purple-500" />
                    <div className="min-w-0 flex-1">
                      <h3 className="text-xs font-semibold leading-tight truncate">
                        {board.name}
                      </h3>
                      <p className="text-xs opacity-60 leading-tight mt-0.5 line-clamp-1">
                        {board.description || "Board description"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-xs opacity-75">
                      <span>Board</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* New Board Button */}
      <div className="p-3 border-t border-gray-200/20">
        <button className="w-full flex items-center justify-center px-3 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 shadow-md shadow-purple-500/30 hover:shadow-lg hover:shadow-purple-500/40 transform hover:-translate-y-0.5 font-medium backdrop-blur-sm">
          <Plus className="w-4 h-4 mr-2" />
          New Board
        </button>
      </div>
    </div>
  );

  if (!selectedBoardId || !columns) {
    return (
      <div className="flex h-full overflow-hidden">
        <ProjectSidebar />
        <main className="flex-1 overflow-hidden flex items-center justify-center">
          <div
            className={`text-lg ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}
          >
            {boards.length === 0
              ? "No boards available"
              : "Select a board to get started"}
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
        <ProjectSidebar />

        {/* Main Kanban Area */}
        <main className="flex-1 overflow-hidden">
          <div className="h-full p-6">
            <div className="h-full grid grid-cols-3 gap-6">
              {columns
                .sort((a, b) => a.position - b.position)
                .map((column) => (
                  <DroppableColumn key={column._id} column={column} />
                ))}
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
    </DndContext>
  );
}
