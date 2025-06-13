# 🛠️ Technical Implementation Guide - Renko Platform

**For AI Development**: Detailed technical specifications and implementation patterns for each roadmap phase.

## 🎯 **IMPLEMENTATION PHILOSOPHY**

This guide provides the specific technical implementation details for the Renko productivity platform roadmap. Each phase includes:

- **API Specifications**: Exact function signatures and database schemas
- **Component Architecture**: React component structure and patterns
- **Integration Patterns**: External service integration approaches
- **Performance Considerations**: Optimization strategies and best practices

---

## **PHASE 3A: GOOGLE CALENDAR INTEGRATION** 🔄

### **Week 6: Technical Foundation**

#### **Google Calendar API Setup**

```bash
# Environment Variables Required
GOOGLE_CALENDAR_CLIENT_ID=your_client_id
GOOGLE_CALENDAR_CLIENT_SECRET=your_client_secret
GOOGLE_CALENDAR_REDIRECT_URI=http://localhost:3000/api/google/callback
```

#### **New Convex Functions**

```typescript
// convex/googleCalendar.ts

import { mutation, query, action } from "./_generated/server";
import { v } from "convex/values";

// OAuth connection management
export const connectGoogleCalendar = action({
  args: {
    authCode: v.string(),
    redirectUri: v.string(),
  },
  returns: v.object({
    accessToken: v.string(),
    refreshToken: v.string(),
    expiresAt: v.number(),
  }),
  handler: async (ctx, args) => {
    // Exchange auth code for tokens
    // Store encrypted tokens in database
    // Return connection status
  },
});

// Import events from Google Calendar
export const importGoogleEvents = action({
  args: {
    calendarId: v.string(),
    timeMin: v.string(),
    timeMax: v.string(),
  },
  returns: v.array(
    v.object({
      googleEventId: v.string(),
      renkoEventId: v.id("events"),
      status: v.string(),
    }),
  ),
  handler: async (ctx, args) => {
    // Fetch events from Google Calendar API
    // Map to Renko event format
    // Handle duplicates and conflicts
    // Create/update Renko events
  },
});

// Export events to Google Calendar
export const exportToGoogleCalendar = action({
  args: {
    eventIds: v.array(v.id("events")),
    targetCalendarId: v.string(),
  },
  returns: v.object({
    success: v.number(),
    failed: v.number(),
    errors: v.array(v.string()),
  }),
  handler: async (ctx, args) => {
    // Get Renko events
    // Map to Google Calendar format
    // Create/update Google Calendar events
    // Handle rate limiting and errors
  },
});
```

#### **Database Schema Extensions**

```typescript
// convex/schema.ts additions

export default defineSchema({
  // ... existing tables

  googleCalendarConnections: defineTable({
    userId: v.id("users"),
    googleCalendarId: v.string(),
    calendarName: v.string(),
    accessToken: v.string(), // encrypted
    refreshToken: v.string(), // encrypted
    expiresAt: v.number(),
    isActive: v.boolean(),
    syncPreferences: v.object({
      autoSync: v.boolean(),
      syncInterval: v.number(), // minutes
      conflictResolution: v.string(), // "renko_wins" | "google_wins" | "manual"
    }),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_calendar", ["userId", "googleCalendarId"]),

  syncLogs: defineTable({
    userId: v.id("users"),
    connectionId: v.id("googleCalendarConnections"),
    syncType: v.string(), // "import" | "export" | "bidirectional"
    status: v.string(), // "success" | "partial" | "failed"
    eventsProcessed: v.number(),
    eventsSucceeded: v.number(),
    eventsFailed: v.number(),
    errors: v.array(v.string()),
    startedAt: v.number(),
    completedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_connection", ["connectionId"])
    .index("by_status", ["status"]),
});
```

### **Week 7: Sync Management UI**

#### **React Components**

```typescript
// components/GoogleCalendarSync/GoogleCalendarSetup.tsx

interface GoogleCalendarSetupProps {
  onConnectionSuccess: (connection: GoogleCalendarConnection) => void;
  onError: (error: string) => void;
}

export function GoogleCalendarSetup({ onConnectionSuccess, onError }: GoogleCalendarSetupProps) {
  const connectGoogle = useMutation(api.googleCalendar.connectGoogleCalendar);

  const handleConnect = async () => {
    // Initiate OAuth flow
    // Handle callback and token exchange
    // Update connection status
  };

  return (
    <div className="space-y-6">
      {/* OAuth connection UI */}
      {/* Calendar selection */}
      {/* Sync preferences */}
    </div>
  );
}

// components/GoogleCalendarSync/SyncStatus.tsx

export function SyncStatus() {
  const connections = useQuery(api.googleCalendar.getConnections);
  const syncLogs = useQuery(api.googleCalendar.getRecentSyncLogs);

  return (
    <div className="space-y-4">
      {/* Real-time sync status */}
      {/* Last sync information */}
      {/* Manual sync triggers */}
      {/* Error handling and retry */}
    </div>
  );
}
```

---

## **PHASE 3B: COMPLETE UI CRUD OPERATIONS** 🎨

### **Week 8: Modal Systems**

#### **Universal Modal Pattern**

```typescript
// components/modals/BaseModal.tsx

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}

export function BaseModal({ isOpen, onClose, title, children, size = "md" }: BaseModalProps) {
  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog onClose={onClose} className="relative z-50">
        {/* Backdrop */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
        </Transition.Child>

        {/* Modal content */}
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className={`
                w-full max-w-${size} transform overflow-hidden rounded-2xl
                bg-white/90 backdrop-blur-xl border border-gray-200/60
                p-6 text-left align-middle shadow-2xl transition-all
                dark:bg-gray-900/60 dark:border-gray-800/60
              `}>
                <Dialog.Title className="text-xl font-medium leading-6 text-gray-900 dark:text-white mb-4">
                  {title}
                </Dialog.Title>
                {children}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
```

#### **Task Creation Modal**

```typescript
// components/modals/TaskCreateModal.tsx

interface TaskCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Partial<TaskFormData>;
  projectId?: Id<"projects">;
  columnId?: Id<"columns">;
}

interface TaskFormData {
  title: string;
  description: string;
  priority: "low" | "medium" | "high" | "critical";
  dueDate: Date | null;
  projectId: Id<"projects"> | null;
  tags: string[];
  assignedTo: Id<"users"> | null;
  timeEstimate: number | null; // minutes
}

export function TaskCreateModal({ isOpen, onClose, initialData, projectId, columnId }: TaskCreateModalProps) {
  const createTask = useMutation(api.tasks.createTask);
  const projects = useQuery(api.projects.getProjects);
  const { isDarkMode } = useTheme();

  const form = useForm<TaskFormData>({
    defaultValues: {
      title: "",
      description: "",
      priority: "medium",
      dueDate: null,
      projectId: projectId || null,
      tags: [],
      assignedTo: null,
      timeEstimate: null,
      ...initialData,
    },
  });

  const onSubmit = async (data: TaskFormData) => {
    try {
      await createTask({
        ...data,
        columnId: columnId!,
        dueDate: data.dueDate?.getTime(),
      });
      onClose();
      form.reset();
      toast.success("Task created successfully!");
    } catch (error) {
      toast.error("Failed to create task");
    }
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Create New Task" size="lg">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Title Input */}
        <div>
          <label className="block text-sm font-medium mb-2">Title *</label>
          <input
            {...form.register("title", { required: "Title is required" })}
            className={`w-full px-3 py-2 rounded-lg border ${
              isDarkMode
                ? "bg-gray-800/50 border-gray-700 text-white"
                : "bg-white border-gray-300 text-gray-900"
            }`}
            placeholder="Enter task title..."
          />
          {form.formState.errors.title && (
            <p className="text-red-500 text-sm mt-1">{form.formState.errors.title.message}</p>
          )}
        </div>

        {/* Description Textarea */}
        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <textarea
            {...form.register("description")}
            rows={3}
            className={`w-full px-3 py-2 rounded-lg border ${
              isDarkMode
                ? "bg-gray-800/50 border-gray-700 text-white"
                : "bg-white border-gray-300 text-gray-900"
            }`}
            placeholder="Enter task description..."
          />
        </div>

        {/* Priority and Due Date Row */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Priority</label>
            <select
              {...form.register("priority")}
              className={`w-full px-3 py-2 rounded-lg border ${
                isDarkMode
                  ? "bg-gray-800/50 border-gray-700 text-white"
                  : "bg-white border-gray-300 text-gray-900"
              }`}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Due Date</label>
            <DatePicker
              selected={form.watch("dueDate")}
              onChange={(date) => form.setValue("dueDate", date)}
              className={`w-full px-3 py-2 rounded-lg border ${
                isDarkMode
                  ? "bg-gray-800/50 border-gray-700 text-white"
                  : "bg-white border-gray-300 text-gray-900"
              }`}
              placeholderText="Select due date..."
            />
          </div>
        </div>

        {/* Project Selection */}
        <div>
          <label className="block text-sm font-medium mb-2">Project</label>
          <select
            {...form.register("projectId")}
            className={`w-full px-3 py-2 rounded-lg border ${
              isDarkMode
                ? "bg-gray-800/50 border-gray-700 text-white"
                : "bg-white border-gray-300 text-gray-900"
            }`}
          >
            <option value="">No project</option>
            {projects?.map((project) => (
              <option key={project._id} value={project._id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>

        {/* Tags Input */}
        <div>
          <label className="block text-sm font-medium mb-2">Tags</label>
          <TagInput
            value={form.watch("tags")}
            onChange={(tags) => form.setValue("tags", tags)}
            placeholder="Add tags..."
          />
        </div>

        {/* Time Estimate */}
        <div>
          <label className="block text-sm font-medium mb-2">Time Estimate (minutes)</label>
          <input
            type="number"
            {...form.register("timeEstimate", { min: 0 })}
            className={`w-full px-3 py-2 rounded-lg border ${
              isDarkMode
                ? "bg-gray-800/50 border-gray-700 text-white"
                : "bg-white border-gray-300 text-gray-900"
            }`}
            placeholder="Estimated time in minutes..."
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-2 rounded-lg border ${
              isDarkMode
                ? "border-gray-700 text-gray-300 hover:bg-gray-800"
                : "border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!form.formState.isValid || form.formState.isSubmitting}
            className={`px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700
              disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {form.formState.isSubmitting ? "Creating..." : "Create Task"}
          </button>
        </div>
      </form>
    </BaseModal>
  );
}
```

### **Week 9: Bulk Operations**

#### **Multi-Select System**

```typescript
// hooks/useMultiSelect.ts

interface UseMultiSelectProps<T> {
  items: T[];
  getId: (item: T) => string;
}

export function useMultiSelect<T>({ items, getId }: UseMultiSelectProps<T>) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const selectAll = () => {
    setSelectedIds(new Set(items.map(getId)));
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  const selectedItems = items.filter(item => selectedIds.has(getId(item)));
  const isAllSelected = items.length > 0 && selectedIds.size === items.length;
  const isPartiallySelected = selectedIds.size > 0 && selectedIds.size < items.length;

  return {
    selectedIds,
    selectedItems,
    isSelected: (id: string) => selectedIds.has(id),
    toggleSelection,
    selectAll,
    clearSelection,
    isAllSelected,
    isPartiallySelected,
    selectedCount: selectedIds.size,
  };
}

// components/BulkOperations/BulkActionBar.tsx

interface BulkActionBarProps {
  selectedCount: number;
  onBulkEdit: () => void;
  onBulkMove: () => void;
  onBulkDelete: () => void;
  onClearSelection: () => void;
}

export function BulkActionBar({
  selectedCount,
  onBulkEdit,
  onBulkMove,
  onBulkDelete,
  onClearSelection
}: BulkActionBarProps) {
  const { isDarkMode } = useTheme();

  if (selectedCount === 0) return null;

  return (
    <div className={`
      fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40
      px-6 py-3 rounded-2xl backdrop-blur-xl border shadow-2xl
      ${isDarkMode
        ? "bg-gray-900/80 border-gray-800/60 text-white"
        : "bg-white/90 border-gray-200/60 text-gray-900"
      }
    `}>
      <div className="flex items-center space-x-4">
        <span className="text-sm font-medium">
          {selectedCount} item{selectedCount > 1 ? 's' : ''} selected
        </span>

        <div className="flex items-center space-x-2">
          <button
            onClick={onBulkEdit}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              isDarkMode
                ? "hover:bg-gray-800 text-gray-300"
                : "hover:bg-gray-100 text-gray-600"
            }`}
          >
            Edit
          </button>

          <button
            onClick={onBulkMove}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              isDarkMode
                ? "hover:bg-gray-800 text-gray-300"
                : "hover:bg-gray-100 text-gray-600"
            }`}
          >
            Move
          </button>

          <button
            onClick={onBulkDelete}
            className="px-3 py-1.5 text-sm rounded-lg transition-colors hover:bg-red-500 hover:text-white text-red-500"
          >
            Delete
          </button>

          <div className="w-px h-4 bg-gray-400" />

          <button
            onClick={onClearSelection}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              isDarkMode
                ? "hover:bg-gray-800 text-gray-400"
                : "hover:bg-gray-100 text-gray-500"
            }`}
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

## **PHASE 4: UNIFIED QUICK ADD WITH NLP** 🤖

### **Week 11: Command Palette**

#### **Command Palette Architecture**

```typescript
// hooks/useCommandPalette.ts

interface Command {
  id: string;
  title: string;
  subtitle?: string;
  icon?: React.ComponentType;
  keywords: string[];
  category: "navigation" | "create" | "search" | "action";
  handler: () => void | Promise<void>;
  shortcut?: string;
}

export function useCommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [commands, setCommands] = useState<Command[]>([]);

  // Register commands
  const registerCommand = useCallback((command: Command) => {
    setCommands((prev) => [
      ...prev.filter((c) => c.id !== command.id),
      command,
    ]);
  }, []);

  // Search commands
  const filteredCommands = useMemo(() => {
    if (!query) return commands;

    const fuse = new Fuse(commands, {
      keys: ["title", "subtitle", "keywords"],
      threshold: 0.3,
    });

    return fuse.search(query).map((result) => result.item);
  }, [commands, query]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(true);
      }

      if (e.key === "Escape") {
        setIsOpen(false);
        setQuery("");
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return {
    isOpen,
    setIsOpen,
    query,
    setQuery,
    commands: filteredCommands,
    registerCommand,
  };
}
```

### **Week 12: Natural Language Processing**

#### **Date/Time Parser**

```typescript
// utils/nlp/dateParser.ts

interface ParsedDate {
  date: Date;
  confidence: number;
  originalText: string;
}

export class DateTimeParser {
  private static patterns = {
    // Relative dates
    today: /\b(today|now)\b/i,
    tomorrow: /\b(tomorrow|tmrw)\b/i,
    yesterday: /\byesterday\b/i,
    nextWeek:
      /\bnext\s+(week|monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i,
    inDays: /\bin\s+(\d+)\s+(day|days)\b/i,

    // Specific times
    time24: /\b([01]?[0-9]|2[0-3]):([0-5][0-9])\b/,
    time12: /\b(1[0-2]|0?[1-9]):([0-5][0-9])\s*(am|pm)\b/i,
    timeNatural: /\b(morning|afternoon|evening|night|noon|midnight)\b/i,

    // Durations
    duration: /\b(for\s+)?(\d+)\s*(min|minutes?|hr|hours?|h)\b/i,
  };

  static parseDateTime(text: string): ParsedDate[] {
    const results: ParsedDate[] = [];
    const now = new Date();

    // Parse relative dates
    if (this.patterns.today.test(text)) {
      results.push({
        date: new Date(now.setHours(9, 0, 0, 0)), // Default to 9 AM
        confidence: 0.9,
        originalText: text.match(this.patterns.today)?.[0] || "",
      });
    }

    if (this.patterns.tomorrow.test(text)) {
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(9, 0, 0, 0);
      results.push({
        date: tomorrow,
        confidence: 0.9,
        originalText: text.match(this.patterns.tomorrow)?.[0] || "",
      });
    }

    // Parse specific times
    const timeMatch =
      text.match(this.patterns.time12) || text.match(this.patterns.time24);
    if (timeMatch) {
      const baseDate = results[0]?.date || new Date();
      const hours = parseInt(timeMatch[1]);
      const minutes = parseInt(timeMatch[2]);
      const isPM = timeMatch[3]?.toLowerCase() === "pm";

      baseDate.setHours(
        isPM && hours !== 12 ? hours + 12 : hours,
        minutes,
        0,
        0,
      );

      if (results.length > 0) {
        results[0].date = baseDate;
        results[0].confidence = Math.min(results[0].confidence + 0.1, 1.0);
      } else {
        results.push({
          date: baseDate,
          confidence: 0.8,
          originalText: timeMatch[0],
        });
      }
    }

    return results;
  }

  static parseDuration(text: string): number | null {
    const match = text.match(this.patterns.duration);
    if (!match) return null;

    const value = parseInt(match[2]);
    const unit = match[3].toLowerCase();

    switch (unit) {
      case "min":
      case "minutes":
      case "minute":
        return value;
      case "hr":
      case "hours":
      case "hour":
      case "h":
        return value * 60;
      default:
        return null;
    }
  }
}
```

#### **Entity Extraction**

```typescript
// utils/nlp/entityExtractor.ts

interface ExtractedEntities {
  priority?: "low" | "medium" | "high" | "critical";
  project?: string;
  tags?: string[];
  people?: string[];
  locations?: string[];
}

export class EntityExtractor {
  private static priorityPatterns = {
    critical: /\b(critical|urgent|asap|emergency|immediately)\b/i,
    high: /\b(high\s+priority|important|high|hot)\b/i,
    medium: /\b(medium\s+priority|normal|medium)\b/i,
    low: /\b(low\s+priority|minor|low|later)\b/i,
  };

  private static projectPatterns = {
    explicit: /\b(in|for|project:?)\s+([a-zA-Z][\w\s-]+)/i,
    hashtag: /#([a-zA-Z][\w-]+)/g,
  };

  static extractEntities(
    text: string,
    availableProjects: string[] = [],
  ): ExtractedEntities {
    const entities: ExtractedEntities = {};

    // Extract priority
    for (const [priority, pattern] of Object.entries(this.priorityPatterns)) {
      if (pattern.test(text)) {
        entities.priority = priority as "low" | "medium" | "high" | "critical";
        break;
      }
    }

    // Extract project
    const projectMatch = text.match(this.projectPatterns.explicit);
    if (projectMatch) {
      const projectName = projectMatch[2].trim();
      const matchingProject = availableProjects.find(
        (p) =>
          p.toLowerCase().includes(projectName.toLowerCase()) ||
          projectName.toLowerCase().includes(p.toLowerCase()),
      );
      entities.project = matchingProject || projectName;
    }

    // Extract tags from hashtags
    const tagMatches = Array.from(text.matchAll(this.projectPatterns.hashtag));
    if (tagMatches.length > 0) {
      entities.tags = tagMatches.map((match) => match[1]);
    }

    // Extract people (mentions)
    const peopleMatches = Array.from(text.matchAll(/@([a-zA-Z][\w-]+)/g));
    if (peopleMatches.length > 0) {
      entities.people = peopleMatches.map((match) => match[1]);
    }

    // Extract locations
    const locationMatches = Array.from(
      text.matchAll(/\bat\s+([a-zA-Z][\w\s-]+)/gi),
    );
    if (locationMatches.length > 0) {
      entities.locations = locationMatches.map((match) => match[1].trim());
    }

    return entities;
  }
}
```

### **Week 13: Natural Language Commands**

#### **Command Parser**

```typescript
// utils/nlp/commandParser.ts

interface ParsedCommand {
  action: "create_task" | "create_event" | "create_note" | "create_project";
  entities: ExtractedEntities;
  datetime?: ParsedDate;
  duration?: number;
  content: string;
  confidence: number;
}

export class CommandParser {
  private static actionPatterns = {
    create_task: /\b(add|create|new)\s+(task|todo|item)/i,
    create_event:
      /\b(schedule|add|create|new)\s+(meeting|event|appointment|call)/i,
    create_note: /\b(add|create|new|write)\s+(note|memo|idea)/i,
    create_project: /\b(add|create|new|start)\s+(project|workspace)/i,
  };

  static parseCommand(
    text: string,
    context: { projects: string[] },
  ): ParsedCommand | null {
    // Determine action
    let action: ParsedCommand["action"] | null = null;
    let confidence = 0.5;

    for (const [actionType, pattern] of Object.entries(this.actionPatterns)) {
      if (pattern.test(text)) {
        action = actionType as ParsedCommand["action"];
        confidence = 0.8;
        break;
      }
    }

    // If no explicit action, infer from context
    if (!action) {
      if (DateTimeParser.parseDateTime(text).length > 0) {
        action = "create_event";
        confidence = 0.6;
      } else {
        action = "create_task"; // Default assumption
        confidence = 0.4;
      }
    }

    // Extract entities
    const entities = EntityExtractor.extractEntities(text, context.projects);

    // Extract datetime
    const datetimes = DateTimeParser.parseDateTime(text);
    const datetime = datetimes[0] || undefined;

    // Extract duration
    const duration = DateTimeParser.parseDuration(text);

    // Clean content (remove command keywords)
    let content = text;
    for (const pattern of Object.values(this.actionPatterns)) {
      content = content.replace(pattern, "").trim();
    }

    // Remove extracted entities from content
    if (entities.priority) {
      for (const pattern of Object.values(EntityExtractor.priorityPatterns)) {
        content = content.replace(pattern, "").trim();
      }
    }

    return {
      action,
      entities,
      datetime,
      duration,
      content: content || text,
      confidence,
    };
  }

  static async executeCommand(
    command: ParsedCommand,
  ): Promise<{ success: boolean; message: string; entityId?: string }> {
    try {
      switch (command.action) {
        case "create_task":
          return await this.createTask(command);
        case "create_event":
          return await this.createEvent(command);
        case "create_note":
          return await this.createNote(command);
        case "create_project":
          return await this.createProject(command);
        default:
          return { success: false, message: "Unknown command action" };
      }
    } catch (error) {
      return { success: false, message: `Failed to execute command: ${error}` };
    }
  }

  private static async createTask(command: ParsedCommand) {
    // Implementation for task creation
    // Use the existing createTask mutation with parsed data
    return {
      success: true,
      message: "Task created successfully",
      entityId: "task_id",
    };
  }

  private static async createEvent(command: ParsedCommand) {
    // Implementation for event creation
    return {
      success: true,
      message: "Event created successfully",
      entityId: "event_id",
    };
  }

  private static async createNote(command: ParsedCommand) {
    // Implementation for note creation
    return {
      success: true,
      message: "Note created successfully",
      entityId: "note_id",
    };
  }

  private static async createProject(command: ParsedCommand) {
    // Implementation for project creation
    return {
      success: true,
      message: "Project created successfully",
      entityId: "project_id",
    };
  }
}
```

---

## **PHASE 5: AI AGENT INTEGRATION** 🧠

### **Week 14: AI Infrastructure**

#### **OpenAI Integration with Cost Management**

```typescript
// utils/ai/openaiClient.ts

import OpenAI from "openai";

interface AIResponse {
  content: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  cost: number;
}

export class AIClient {
  private openai: OpenAI;
  private costTracker: Map<string, number> = new Map();

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async generateResponse(
    prompt: string,
    context: any,
    userId: string,
    maxTokens: number = 500,
  ): Promise<AIResponse> {
    // Check daily usage limits
    const dailyUsage = this.getDailyUsage(userId);
    if (dailyUsage > 10000) {
      // 10k tokens per day limit
      throw new Error("Daily AI usage limit exceeded");
    }

    const response = await this.openai.chat.completions.create({
      model: "gpt-4o-mini", // Cost-effective model
      messages: [
        {
          role: "system",
          content: this.getSystemPrompt(context),
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: maxTokens,
      temperature: 0.7,
    });

    const usage = response.usage!;
    const cost = this.calculateCost(usage.total_tokens);

    // Track usage
    this.trackUsage(userId, usage.total_tokens, cost);

    return {
      content: response.choices[0].message.content!,
      usage: {
        promptTokens: usage.prompt_tokens,
        completionTokens: usage.completion_tokens,
        totalTokens: usage.total_tokens,
      },
      cost,
    };
  }

  private getSystemPrompt(context: any): string {
    return `You are Renko, an AI productivity assistant. You help users optimize their productivity by analyzing their tasks, calendar, and work patterns.

Context:
- Current date: ${new Date().toISOString()}
- User's tasks: ${JSON.stringify(context.tasks?.slice(0, 10) || [])}
- User's events: ${JSON.stringify(context.events?.slice(0, 10) || [])}
- User's projects: ${JSON.stringify(context.projects || [])}

Provide helpful, actionable advice that is specific to the user's current situation. Be concise and practical.`;
  }

  private calculateCost(tokens: number): number {
    // GPT-4o-mini pricing: $0.15 per 1M input tokens, $0.6 per 1M output tokens
    // Simplified calculation assuming average mix
    return (tokens / 1000000) * 0.375; // Average cost
  }

  private trackUsage(userId: string, tokens: number, cost: number): void {
    const today = new Date().toDateString();
    const key = `${userId}_${today}`;
    const currentUsage = this.costTracker.get(key) || 0;
    this.costTracker.set(key, currentUsage + tokens);
  }

  private getDailyUsage(userId: string): number {
    const today = new Date().toDateString();
    const key = `${userId}_${today}`;
    return this.costTracker.get(key) || 0;
  }
}
```

#### **Smart Prioritization System**

```typescript
// utils/ai/priorityEngine.ts

interface TaskPriorityAnalysis {
  taskId: string;
  currentPriority: string;
  suggestedPriority: string;
  confidence: number;
  reasoning: string;
  factors: {
    deadlineUrgency: number;
    projectImportance: number;
    estimatedEffort: number;
    dependencies: number;
    userPatterns: number;
  };
}

export class PriorityEngine {
  static analyzeTaskPriority(
    task: any,
    context: {
      allTasks: any[];
      projects: any[];
      userPatterns: any;
      currentDate: Date;
    },
  ): TaskPriorityAnalysis {
    const factors = this.calculatePriorityFactors(task, context);
    const suggestedPriority = this.determinePriority(factors);

    return {
      taskId: task._id,
      currentPriority: task.priority || "medium",
      suggestedPriority,
      confidence: this.calculateConfidence(factors),
      reasoning: this.generateReasoning(factors, suggestedPriority),
      factors,
    };
  }

  private static calculatePriorityFactors(task: any, context: any) {
    const now = context.currentDate;
    const dueDate = task.dueDate ? new Date(task.dueDate) : null;

    // Deadline urgency (0-1)
    let deadlineUrgency = 0.5;
    if (dueDate) {
      const daysUntilDue =
        (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      if (daysUntilDue < 1) deadlineUrgency = 1.0;
      else if (daysUntilDue < 3) deadlineUrgency = 0.8;
      else if (daysUntilDue < 7) deadlineUrgency = 0.6;
      else deadlineUrgency = 0.3;
    }

    // Project importance (0-1)
    const project = context.projects.find((p: any) => p._id === task.projectId);
    const projectImportance =
      project?.priority === "high"
        ? 0.9
        : project?.priority === "medium"
          ? 0.6
          : 0.3;

    // Estimated effort (0-1, inverse correlation)
    const estimatedEffort = task.timeEstimate
      ? Math.max(0.1, 1 - task.timeEstimate / 480)
      : 0.5; // 8 hours = low priority

    // Dependencies (0-1)
    const blockingTasks = context.allTasks.filter((t: any) =>
      t.dependencies?.includes(task._id),
    ).length;
    const dependencies = Math.min(1, blockingTasks * 0.3);

    // User patterns (0-1)
    const userPatterns = this.analyzeUserPatterns(task, context.userPatterns);

    return {
      deadlineUrgency,
      projectImportance,
      estimatedEffort,
      dependencies,
      userPatterns,
    };
  }

  private static determinePriority(factors: any): string {
    const score =
      factors.deadlineUrgency * 0.3 +
      factors.projectImportance * 0.25 +
      factors.estimatedEffort * 0.15 +
      factors.dependencies * 0.2 +
      factors.userPatterns * 0.1;

    if (score >= 0.8) return "critical";
    if (score >= 0.6) return "high";
    if (score >= 0.4) return "medium";
    return "low";
  }

  private static calculateConfidence(factors: any): number {
    // Higher confidence when we have more data points
    const dataPoints = Object.values(factors).filter((v) => v !== 0.5).length;
    return Math.min(0.95, 0.5 + dataPoints * 0.1);
  }

  private static generateReasoning(factors: any, priority: string): string {
    const reasons: string[] = [];

    if (factors.deadlineUrgency > 0.7) {
      reasons.push("Due date is approaching soon");
    }
    if (factors.projectImportance > 0.7) {
      reasons.push("Part of a high-priority project");
    }
    if (factors.dependencies > 0.5) {
      reasons.push("Other tasks are waiting on this");
    }
    if (factors.estimatedEffort > 0.7) {
      reasons.push("Quick task that can be completed easily");
    }

    return reasons.length > 0
      ? reasons.join("; ")
      : "Standard priority assessment";
  }

  private static analyzeUserPatterns(task: any, userPatterns: any): number {
    // Analyze user's completion patterns for similar tasks
    // This would use historical data to determine likelihood of completion
    return 0.5; // Placeholder
  }
}
```

## 🤖 **AI INTEGRATION ARCHITECTURE**

### **OpenRouter Integration**

```typescript
// convex/ai/openrouter.ts
import { action } from "../_generated/server";
import { v } from "convex/values";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const MODEL = "google/gemini-2.5-flash";

export const generateTaskInsights = action({
  args: {
    userId: v.id("users"),
    tasks: v.array(v.any()),
    context: v.string(),
  },
  returns: v.object({
    suggestions: v.array(v.string()),
    priorities: v.array(v.string()),
    schedule: v.optional(v.string()),
  }),
  handler: async (ctx, args) => {
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": process.env.SITE_URL,
          "X-Title": "Renko AI Task Manager",
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [
            {
              role: "system",
              content: `You are an AI productivity assistant. Analyze the user's tasks and provide intelligent insights.`,
            },
            {
              role: "user",
              content: `Tasks: ${JSON.stringify(args.tasks)}\nContext: ${args.context}`,
            },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "prioritize_tasks",
                description: "Reorder tasks by priority and urgency",
                parameters: {
                  type: "object",
                  properties: {
                    priorities: {
                      type: "array",
                      items: { type: "string" },
                    },
                  },
                },
              },
            },
          ],
          tool_choice: "auto",
        }),
      },
    );

    const data = await response.json();
    return parseAIResponse(data);
  },
});
```

### **Custom AI Agent Framework**

```typescript
// convex/ai/agent.ts
export class TaskAgent {
  constructor(private userId: string) {}

  async analyzeUserPatterns() {
    // Analyze completion times, preferred work hours, etc.
  }

  async generateSchedule(tasks: Task[]) {
    // Use AI to create optimal time blocks
  }

  async predictDeadlineRisks() {
    // Identify tasks likely to be delayed
  }

  async suggestWorkflowImprovements() {
    // Learn from user behavior patterns
  }
}
```

## 💳 **SUBSCRIPTION & BILLING ARCHITECTURE**

### **Stripe Integration**

```typescript
// convex/billing/stripe.ts
import { action } from "../_generated/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export const createSubscription = action({
  args: {
    userId: v.id("users"),
    priceId: v.string(),
    trialDays: v.optional(v.number()),
  },
  returns: v.object({
    subscriptionId: v.string(),
    clientSecret: v.string(),
  }),
  handler: async (ctx, args) => {
    const user = await ctx.runQuery(api.users.getUser, { userId: args.userId });

    // Create customer if doesn't exist
    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
      });
      customerId = customer.id;

      await ctx.runMutation(api.users.updateStripeCustomerId, {
        userId: args.userId,
        customerId: customerId,
      });
    }

    // Create subscription with trial
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: args.priceId }],
      trial_period_days: args.trialDays || 7,
      trial_settings: {
        end_behavior: {
          missing_payment_method: "pause", // Don't cancel, just pause
        },
      },
      payment_behavior: "default_incomplete",
      payment_settings: { save_default_payment_method: "on_subscription" },
      expand: ["latest_invoice.payment_intent"],
    });

    return {
      subscriptionId: subscription.id,
      clientSecret: subscription.latest_invoice.payment_intent.client_secret,
    };
  },
});
```

### **Usage Tracking for AI Operations**

```typescript
// convex/billing/usage.ts
export const trackAIUsage = mutation({
  args: {
    userId: v.id("users"),
    operation: v.string(),
    tokens: v.number(),
    cost: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.insert("ai_usage", {
      userId: args.userId,
      operation: args.operation,
      tokens: args.tokens,
      cost: args.cost,
      timestamp: Date.now(),
    });

    // Check if user is approaching limits
    const monthlyUsage = await ctx.db
      .query("ai_usage")
      .withIndex("by_user_date", (q) =>
        q.eq("userId", args.userId).gte("timestamp", getMonthStart()),
      )
      .collect();

    const totalOperations = monthlyUsage.length;
    const user = await ctx.db.get(args.userId);
    const plan = await ctx.db.get(user.subscriptionPlanId);

    if (totalOperations >= plan.aiOperationsLimit * 0.8) {
      // Send warning email at 80% usage
      await ctx.scheduler.runAfter(0, api.notifications.sendUsageWarning, {
        userId: args.userId,
        usage: totalOperations,
        limit: plan.aiOperationsLimit,
      });
    }
  },
});
```

### **Subscription Plans Schema**

```typescript
// convex/schema.ts - Add to existing schema
export default defineSchema({
  // ... existing tables

  subscription_plans: defineTable({
    name: v.string(),
    price: v.number(),
    stripePriceId: v.string(),
    aiOperationsLimit: v.number(), // per month
    features: v.array(v.string()),
    isActive: v.boolean(),
  }),

  user_subscriptions: defineTable({
    userId: v.id("users"),
    stripeSubscriptionId: v.string(),
    planId: v.id("subscription_plans"),
    status: v.string(), // active, trialing, past_due, canceled
    currentPeriodStart: v.number(),
    currentPeriodEnd: v.number(),
    trialEnd: v.optional(v.number()),
  }).index("by_user", ["userId"]),

  ai_usage: defineTable({
    userId: v.id("users"),
    operation: v.string(), // "task_analysis", "schedule_generation", etc.
    tokens: v.number(),
    cost: v.number(),
    timestamp: v.number(),
  }).index("by_user_date", ["userId", "timestamp"]),
});
```

This technical implementation guide provides the specific code patterns, API structures, and architectural decisions needed to implement each phase of the roadmap. Each section includes:

- **Exact function signatures** for Convex backend functions
- **Complete React components** with proper TypeScript types
- **Database schema extensions** for new features
- **AI integration patterns** with cost management
- **Performance optimization strategies**

The guide follows the established patterns from the existing codebase while introducing new capabilities systematically.
