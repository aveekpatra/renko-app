"use client";

import { useState } from "react";
import { Plus, Clock, User } from "lucide-react";

// Mock data
const mockColumns = [
  { _id: "col_1", name: "To Do", order: 0, boardId: "board_1" },
  { _id: "col_2", name: "In Progress", order: 1, boardId: "board_1" },
  { _id: "col_3", name: "Done", order: 2, boardId: "board_1" },
];

const mockTasks = [
  {
    _id: "task_1",
    title: "Design landing page",
    description: "Create a modern landing page with hero section and CTA",
    priority: "high" as const,
    status: "todo" as const,
    dueDate: Date.now() + 86400000, // tomorrow
    columnId: "col_1",
    order: 0,
  },
  {
    _id: "task_2",
    title: "Set up analytics",
    description: "Implement Google Analytics and set up conversion tracking",
    priority: "medium" as const,
    status: "todo" as const,
    dueDate: Date.now() + 172800000, // day after tomorrow
    columnId: "col_1",
    order: 1,
  },
  {
    _id: "task_3",
    title: "API integration",
    description: "Connect frontend to backend API endpoints",
    priority: "high" as const,
    status: "in_progress" as const,
    dueDate: Date.now() + 259200000, // 3 days
    columnId: "col_2",
    order: 0,
  },
  {
    _id: "task_4",
    title: "User authentication",
    description: "Implement login/signup flow with JWT tokens",
    priority: "medium" as const,
    status: "done" as const,
    dueDate: Date.now() - 86400000, // yesterday (completed)
    columnId: "col_3",
    order: 0,
  },
  {
    _id: "task_5",
    title: "Database schema",
    description: "Design and implement the database structure",
    priority: "low" as const,
    status: "done" as const,
    dueDate: Date.now() - 172800000, // 2 days ago (completed)
    columnId: "col_3",
    order: 1,
  },
];

interface KanbanBoardProps {
  boardId: string;
}

export default function KanbanBoard({ boardId }: KanbanBoardProps) {
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [selectedColumnId, setSelectedColumnId] = useState<string>("");

  // Filter columns and tasks for the current board
  const columns = mockColumns.filter((col) => col.boardId === boardId);
  const tasks = mockTasks;

  const getTasksForColumn = (columnId: string) => {
    return tasks
      .filter((task) => task.columnId === columnId)
      .sort((a, b) => a.order - b.order);
  };

  return (
    <div className="flex-1 overflow-x-auto">
      <div className="flex gap-6 min-w-max p-1">
        {columns.map((column) => (
          <KanbanColumn
            key={column._id}
            column={column}
            tasks={getTasksForColumn(column._id)}
            onCreateTask={() => {
              setSelectedColumnId(column._id);
              setShowCreateTask(true);
            }}
          />
        ))}
      </div>

      {/* Create Task Modal */}
      {showCreateTask && (
        <CreateTaskModal
          columnId={selectedColumnId}
          onClose={() => setShowCreateTask(false)}
        />
      )}
    </div>
  );
}

interface KanbanColumnProps {
  column: (typeof mockColumns)[0];
  tasks: typeof mockTasks;
  onCreateTask: () => void;
}

function KanbanColumn({ column, tasks, onCreateTask }: KanbanColumnProps) {
  return (
    <div className="w-80 flex-shrink-0">
      <div className="glass-subtle rounded-glass p-4">
        {/* Column Header */}
        <div className="flex-between mb-4">
          <div className="flex items-center space-x-2">
            <h3 className="text-subtitle text-primary font-medium">
              {column.name}
            </h3>
            <span className="glass-primary px-2 py-1 rounded-button text-small text-secondary">
              {tasks.length}
            </span>
          </div>
          <button
            onClick={onCreateTask}
            className="p-2 glass-primary rounded-button transition-all"
          >
            <Plus className="w-4 h-4 text-secondary" />
          </button>
        </div>

        {/* Tasks */}
        <div className="space-y-3 min-h-20">
          {tasks.map((task) => (
            <TaskCard key={task._id} task={task} />
          ))}
        </div>
      </div>
    </div>
  );
}

interface TaskCardProps {
  task: (typeof mockTasks)[0];
}

function TaskCard({ task }: TaskCardProps) {
  const priorityColors = {
    low: "text-accent-success bg-accent-success/10 border-accent-success/20",
    medium: "text-accent-warning bg-accent-warning/10 border-accent-warning/20",
    high: "text-accent-error bg-accent-error/10 border-accent-error/20",
  };

  const isOverdue = task.dueDate < Date.now() && task.status !== "done";
  const isDueSoon =
    task.dueDate < Date.now() + 86400000 && task.status !== "done"; // due within 24 hours

  return (
    <div className="glass-primary rounded-glass p-4 cursor-pointer transition-all">
      {/* Task Header */}
      <div className="flex-between mb-2">
        <span
          className={`px-2 py-1 rounded-button text-small border ${priorityColors[task.priority]}`}
        >
          {task.priority}
        </span>
        <div className="flex items-center space-x-1">
          {(isOverdue || isDueSoon) && (
            <Clock
              className={`w-3 h-3 ${isOverdue ? "text-accent-error" : "text-accent-warning"}`}
            />
          )}
        </div>
      </div>

      {/* Task Content */}
      <h4 className="text-body text-primary font-medium mb-2">{task.title}</h4>
      {task.description && (
        <p className="text-small text-secondary mb-3 line-clamp-2">
          {task.description}
        </p>
      )}

      {/* Task Footer */}
      <div className="flex-between">
        <div className="text-small text-tertiary">
          {new Date(task.dueDate).toLocaleDateString()}
        </div>
        <div className="flex items-center space-x-1">
          <User className="w-3 h-3 text-tertiary" />
          <span className="text-small text-tertiary">You</span>
        </div>
      </div>
    </div>
  );
}

function CreateTaskModal({
  columnId,
  onClose,
}: {
  columnId: string;
  onClose: () => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [dueDate, setDueDate] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    // Simulate task creation
    console.log("Creating task:", {
      title,
      description,
      priority,
      dueDate,
      columnId,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex-center z-50">
      <div className="glass-elevated rounded-glass p-8 max-w-md w-full mx-4 animate-scale-in">
        <h2 className="text-h2 text-primary mb-6">Create New Task</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-caption text-secondary mb-2">
              Task Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="glass-primary w-full p-4 rounded-glass border-0 
                         text-primary placeholder:text-tertiary
                         focus:ring-2 focus:ring-accent-primary/30 focus:outline-none
                         transition-all duration-200"
              placeholder="Enter task title..."
              autoFocus
            />
          </div>

          <div className="mb-4">
            <label className="block text-caption text-secondary mb-2">
              Description (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="glass-primary w-full p-4 rounded-glass border-0 
                         text-primary placeholder:text-tertiary
                         focus:ring-2 focus:ring-accent-primary/30 focus:outline-none
                         transition-all duration-200"
              placeholder="Enter description..."
              rows={3}
            />
          </div>

          <div className="mb-4">
            <label className="block text-caption text-secondary mb-2">
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) =>
                setPriority(e.target.value as "low" | "medium" | "high")
              }
              className="glass-primary w-full p-4 rounded-glass border-0 
                         text-primary
                         focus:ring-2 focus:ring-accent-primary/30 focus:outline-none
                         transition-all duration-200"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div className="mb-6">
            <label className="block text-caption text-secondary mb-2">
              Due Date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="glass-primary w-full p-4 rounded-glass border-0 
                         text-primary
                         focus:ring-2 focus:ring-accent-primary/30 focus:outline-none
                         transition-all duration-200"
            />
          </div>

          <div className="flex space-x-3">
            <button
              type="submit"
              disabled={!title.trim()}
              className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create Task
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
