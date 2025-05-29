# Coding Standards & Conventions

## 📋 Overview

This document establishes coding standards, conventions, and best practices for the Productivity App to ensure consistent, maintainable, and high-quality code across the entire project.

---

## 🔧 TypeScript Standards

### Type Definitions

```typescript
// ✅ GOOD: Use exact Convex-generated types
import { Id } from "../convex/_generated/dataModel";

interface TaskProps {
  taskId: Id<"tasks">; // Exact type
  onComplete: (taskId: Id<"tasks">) => void;
}

// ❌ BAD: Generic or loose types
interface TaskProps {
  taskId: string; // Too generic
  onComplete: (id: any) => void; // Avoid 'any'
}
```

### Interface Conventions

```typescript
// ✅ GOOD: Descriptive interface names
interface CreateTaskRequest {
  title: string;
  description?: string;
  columnId: Id<"columns">;
  priority?: TaskPriority;
}

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: Id<"tasks">) => void;
}

// ✅ GOOD: Use union types for constants
type TaskPriority = "low" | "medium" | "high" | "urgent";
type TaskStatus = "todo" | "in-progress" | "done" | "archived";

// ❌ BAD: Unclear or generic names
interface Props {
  data: any;
  callback: Function;
}
```

### Function Signatures

```typescript
// ✅ GOOD: Clear parameter and return types
const createTask = async (request: CreateTaskRequest): Promise<Id<"tasks">> => {
  // Implementation
};

// ✅ GOOD: Use async/await over promises
const handleTaskCreate = async (data: CreateTaskRequest) => {
  try {
    const taskId = await createTask(data);
    toast.success("Task created successfully");
    return taskId;
  } catch (error) {
    toast.error("Failed to create task");
    throw error;
  }
};

// ❌ BAD: Unclear types and error handling
const createTask = (data: any) => {
  // No error handling
  return api.tasks.create(data);
};
```

---

## ⚛️ React Component Standards

### Component Structure

```typescript
// ✅ GOOD: Clear component structure
import React from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import { Id } from '../convex/_generated/dataModel';
import { Button } from './ui/Button';
import { LoadingSpinner } from './ui/LoadingSpinner';

interface TaskCardProps {
  taskId: Id<"tasks">;
  onEdit?: (taskId: Id<"tasks">) => void;
  onDelete?: (taskId: Id<"tasks">) => void;
}

export function TaskCard({ taskId, onEdit, onDelete }: TaskCardProps) {
  // 1. Hooks
  const task = useQuery(api.tasks.getTask, { taskId });
  const deleteTask = useMutation(api.tasks.deleteTask);

  // 2. Event handlers
  const handleDelete = async () => {
    try {
      await deleteTask({ taskId });
      onDelete?.(taskId);
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  // 3. Loading/error states
  if (!task) return <LoadingSpinner />;

  // 4. Render
  return (
    <div className="task-card">
      <h3>{task.title}</h3>
      <p>{task.description}</p>
      <div className="task-actions">
        <Button onClick={() => onEdit?.(taskId)}>Edit</Button>
        <Button variant="danger" onClick={handleDelete}>Delete</Button>
      </div>
    </div>
  );
}
```

### Hook Usage Guidelines

```typescript
// ✅ GOOD: Proper hook ordering and dependencies
const TaskBoard = ({ boardId }: { boardId: Id<"boards"> }) => {
  // 1. All hooks at the top
  const columns = useQuery(api.tasks.getColumns, { boardId });
  const createTask = useMutation(api.tasks.createTask);
  const [selectedColumn, setSelectedColumn] = useState<Id<"columns"> | null>(
    null,
  );

  // 2. Memoized values
  const sortedColumns = useMemo(
    () => columns?.sort((a, b) => a.position - b.position) || [],
    [columns],
  );

  // 3. Effects with proper dependencies
  useEffect(() => {
    if (columns?.length && !selectedColumn) {
      setSelectedColumn(columns[0]._id);
    }
  }, [columns, selectedColumn]);

  // Rest of component...
};

// ❌ BAD: Hooks in conditionals or loops
const BadComponent = ({ condition }: { condition: boolean }) => {
  if (condition) {
    const data = useQuery(api.tasks.getBoards); // ❌ Conditional hook
  }

  for (let i = 0; i < 5; i++) {
    const [state, setState] = useState(i); // ❌ Hook in loop
  }
};
```

### Event Handler Patterns

```typescript
// ✅ GOOD: Descriptive handler names and proper typing
const handleTaskCreate = useCallback(async (data: CreateTaskRequest) => {
  try {
    const taskId = await createTask(data);
    setNewTaskData(null);
    toast.success('Task created');
  } catch (error) {
    toast.error('Failed to create task');
  }
}, [createTask]);

const handleTaskEdit = useCallback((taskId: Id<"tasks">) => {
  setEditingTask(taskId);
  setModalOpen(true);
}, []);

// ✅ GOOD: Use useCallback for handlers passed to children
const TaskList = ({ tasks }: { tasks: Task[] }) => {
  const handleTaskClick = useCallback((taskId: Id<"tasks">) => {
    // Handler logic
  }, []);

  return (
    <div>
      {tasks.map(task => (
        <TaskCard
          key={task._id}
          task={task}
          onClick={handleTaskClick}
        />
      ))}
    </div>
  );
};
```

---

## 🎨 CSS & Styling Standards

### Tailwind CSS Guidelines

```typescript
// ✅ GOOD: Organized class names (layout → spacing → colors → effects)
<div className="
  flex flex-col              // Layout
  space-y-4 p-6             // Spacing
  bg-white border rounded-lg // Appearance
  shadow-sm hover:shadow-md  // Effects
  dark:bg-gray-800          // Dark mode
">

// ✅ GOOD: Use semantic class groupings
<button className="
  inline-flex items-center justify-center  // Layout
  px-4 py-2 space-x-2                      // Spacing
  text-sm font-medium                      // Typography
  text-white bg-blue-600                   // Colors
  border border-transparent rounded-md     // Borders
  hover:bg-blue-700 focus:ring-2          // States
  disabled:opacity-50                      // Disabled
  transition-colors                        // Transitions
">

// ❌ BAD: Disorganized classes
<div className="bg-white p-6 flex shadow-sm space-y-4 hover:shadow-md flex-col rounded-lg border dark:bg-gray-800">
```

### Component-Specific Styling

```typescript
// ✅ GOOD: Create reusable style objects for complex components
const buttonStyles = {
  base: "inline-flex items-center justify-center font-medium rounded-md transition-colors",
  variants: {
    primary: "text-white bg-blue-600 hover:bg-blue-700",
    secondary: "text-gray-700 bg-gray-100 hover:bg-gray-200",
    danger: "text-white bg-red-600 hover:bg-red-700",
  },
  sizes: {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  }
};

// ✅ GOOD: Use CSS custom properties for dynamic values
<div
  className="w-3 h-3 rounded-full"
  style={{ backgroundColor: column.color || '#6b7280' }}
/>
```

---

## 📁 File Organization

### Import Order

```typescript
// ✅ GOOD: Organized import order
// 1. React and external libraries
import React, { useState, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";

// 2. Internal API and types
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";

// 3. Components (UI first, then features)
import { Button } from "./ui/Button";
import { Modal } from "./ui/Modal";
import { TaskCard } from "./features/TaskCard";

// 4. Utilities and constants
import { cn } from "../lib/utils";
import { TASK_PRIORITIES } from "../lib/constants";

// ❌ BAD: Random import order
import { TaskCard } from "./features/TaskCard";
import React from "react";
import { cn } from "../lib/utils";
import { api } from "../convex/_generated/api";
```

### File Naming

```
// ✅ GOOD: Consistent naming conventions
components/
├── ui/
│   ├── Button.tsx         // PascalCase for components
│   ├── Modal.tsx
│   └── index.ts          // Barrel exports
├── features/
│   ├── TaskCard.tsx
│   └── KanbanBoard.tsx
└── layout/
    └── Sidebar.tsx

lib/
├── utils.ts              // camelCase for utilities
├── constants.ts
└── types.ts

// ❌ BAD: Inconsistent naming
components/
├── button.tsx            // Should be PascalCase
├── task-card.tsx         // Should be PascalCase
└── kanban_board.tsx      // Should be PascalCase
```

---

## 🔒 Error Handling

### API Error Handling

```typescript
// ✅ GOOD: Comprehensive error handling
const createTask = async (data: CreateTaskRequest) => {
  try {
    const taskId = await api.tasks.createTask(data);
    toast.success('Task created successfully');
    return taskId;
  } catch (error) {
    // Log error for debugging
    console.error('Failed to create task:', error);

    // User-friendly error message
    if (error instanceof Error) {
      toast.error(error.message);
    } else {
      toast.error('Failed to create task. Please try again.');
    }

    // Re-throw for component error boundaries
    throw error;
  }
};

// ✅ GOOD: Error boundaries for component errors
class TaskErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Task component error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <div>Something went wrong with the task component.</div>;
    }
    return this.props.children;
  }
}
```

### Form Validation

```typescript
// ✅ GOOD: Client-side validation with clear error messages
interface CreateTaskFormData {
  title: string;
  description?: string;
  priority?: TaskPriority;
  dueDate?: Date;
}

const validateTaskForm = (data: CreateTaskFormData): string[] => {
  const errors: string[] = [];

  if (!data.title.trim()) {
    errors.push("Task title is required");
  }

  if (data.title.length > 100) {
    errors.push("Task title must be less than 100 characters");
  }

  if (data.dueDate && data.dueDate < new Date()) {
    errors.push("Due date cannot be in the past");
  }

  return errors;
};
```

---

## 🧪 Testing Standards

### Component Testing

```typescript
// ✅ GOOD: Comprehensive component tests
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TaskCard } from './TaskCard';
import { mockTask } from '../__mocks__/tasks';

describe('TaskCard', () => {
  const defaultProps = {
    task: mockTask,
    onEdit: jest.fn(),
    onDelete: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders task title and description', () => {
    render(<TaskCard {...defaultProps} />);

    expect(screen.getByText(mockTask.title)).toBeInTheDocument();
    expect(screen.getByText(mockTask.description)).toBeInTheDocument();
  });

  it('calls onEdit when edit button is clicked', async () => {
    render(<TaskCard {...defaultProps} />);

    fireEvent.click(screen.getByRole('button', { name: /edit/i }));

    expect(defaultProps.onEdit).toHaveBeenCalledWith(mockTask._id);
  });

  it('shows overdue warning for past due dates', () => {
    const overdueTask = {
      ...mockTask,
      dueDate: Date.now() - 86400000 // 1 day ago
    };

    render(<TaskCard {...defaultProps} task={overdueTask} />);

    expect(screen.getByTestId('overdue-warning')).toBeInTheDocument();
  });
});
```

---

## 📝 Documentation Standards

### Component Documentation

````typescript
/**
 * TaskCard component displays a single task with actions
 *
 * @param task - The task object to display
 * @param onEdit - Callback when edit button is clicked
 * @param onDelete - Callback when delete button is clicked
 * @param className - Additional CSS classes
 *
 * @example
 * ```tsx
 * <TaskCard
 *   task={task}
 *   onEdit={(taskId) => setEditingTask(taskId)}
 *   onDelete={(taskId) => handleDelete(taskId)}
 * />
 * ```
 */
export function TaskCard({ task, onEdit, onDelete, className }: TaskCardProps) {
  // Component implementation
}
````

### API Function Documentation

```typescript
/**
 * Creates a new task in the specified column
 *
 * @param title - Task title (required, max 100 chars)
 * @param description - Task description (optional)
 * @param columnId - Target column ID
 * @param priority - Task priority level
 * @param dueDate - Due date timestamp
 *
 * @returns Promise<Id<"tasks">> - The created task ID
 *
 * @throws {Error} "Not authenticated" - User not logged in
 * @throws {Error} "Column not found" - Invalid column ID
 * @throws {Error} "Title is required" - Missing task title
 */
export const createTask = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    columnId: v.id("columns"),
    priority: v.optional(v.string()),
    dueDate: v.optional(v.number()),
  },
  returns: v.id("tasks"),
  handler: async (ctx, args) => {
    // Implementation
  },
});
```

---

## 🚀 Performance Guidelines

### Optimization Patterns

```typescript
// ✅ GOOD: Memoize expensive calculations
const TaskBoard = ({ boardId }: { boardId: Id<"boards"> }) => {
  const tasks = useQuery(api.tasks.getTasksForBoard, { boardId });

  const tasksByColumn = useMemo(() => {
    if (!tasks) return {};

    return tasks.reduce((acc, task) => {
      if (!acc[task.columnId]) acc[task.columnId] = [];
      acc[task.columnId].push(task);
      return acc;
    }, {} as Record<string, Task[]>);
  }, [tasks]);

  // Rest of component
};

// ✅ GOOD: Use React.memo for pure components
export const TaskCard = React.memo(({ task, onEdit, onDelete }: TaskCardProps) => {
  // Component implementation
});

// ✅ GOOD: Optimize re-renders with useCallback
const TaskList = ({ tasks }: { tasks: Task[] }) => {
  const handleTaskEdit = useCallback((taskId: Id<"tasks">) => {
    // Edit logic
  }, []);

  return (
    <div>
      {tasks.map(task => (
        <TaskCard key={task._id} task={task} onEdit={handleTaskEdit} />
      ))}
    </div>
  );
};
```

These coding standards ensure consistency, maintainability, and high code quality across the entire productivity app project.
