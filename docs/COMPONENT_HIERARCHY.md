# Component Hierarchy & Design System

## 🏗️ Application Structure

```
App (layout.tsx)
├── ConvexAuthProvider
│   ├── Sidebar (always visible when authenticated)
│   └── MainContent (app router pages)
│       ├── Dashboard (/)
│       ├── Tasks (/tasks)
│       ├── Projects (/projects)
│       ├── Calendar (/calendar)
│       ├── Notes (/notes)
│       └── Settings (/settings)
```

---

## 📁 Component Organization

### `/components` Directory Structure

```
components/
├── ui/                    # Base UI components (reusable)
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Modal.tsx
│   ├── Card.tsx
│   ├── Badge.tsx
│   ├── Avatar.tsx
│   ├── Dropdown.tsx
│   ├── Tooltip.tsx
│   ├── LoadingSpinner.tsx
│   └── EmptyState.tsx
├── layout/               # Layout components
│   ├── Sidebar.tsx      ✅ Implemented
│   ├── Header.tsx
│   ├── Navigation.tsx
│   └── MobileMenu.tsx
├── forms/               # Form components
│   ├── TaskForm.tsx
│   ├── ProjectForm.tsx
│   ├── EventForm.tsx
│   ├── NoteForm.tsx
│   └── FormField.tsx
├── features/           # Feature-specific components
│   ├── kanban/        # Kanban board components
│   │   ├── KanbanBoard.tsx     ✅ Implemented
│   │   ├── KanbanColumn.tsx    ✅ Part of KanbanBoard
│   │   ├── TaskCard.tsx        ✅ Part of KanbanBoard
│   │   ├── NewTaskForm.tsx     ✅ Part of KanbanBoard
│   │   └── DragDropContext.tsx
│   ├── dashboard/     # Dashboard components
│   │   ├── StatsCards.tsx      ✅ Part of Dashboard
│   │   ├── RecentTasks.tsx
│   │   ├── UpcomingEvents.tsx
│   │   └── QuickActions.tsx
│   ├── calendar/      # Calendar components
│   │   ├── CalendarGrid.tsx
│   │   ├── EventCard.tsx
│   │   ├── DatePicker.tsx
│   │   └── TimeSlots.tsx
│   ├── notes/         # Notes components
│   │   ├── NoteEditor.tsx
│   │   ├── NoteList.tsx
│   │   ├── NoteFolders.tsx
│   │   └── NoteSearch.tsx
│   ├── projects/      # Project components
│   │   ├── ProjectCard.tsx
│   │   ├── ProjectList.tsx
│   │   ├── ProjectStats.tsx
│   │   └── ProjectTimeline.tsx
│   ├── intelligence/ # Smart interconnectivity components
│   │   ├── RelationshipMap.tsx
│   │   ├── ContextSidebar.tsx
│   │   ├── ImpactChart.tsx
│   │   ├── SmartSuggestions.tsx
│   │   ├── ConnectionGraph.tsx
│   │   └── RelatedItems.tsx
│   ├── ai/           # AI-powered components
│   │   ├── AIScheduler.tsx
│   │   ├── WorkloadAnalyzer.tsx
│   │   ├── EnergyTracker.tsx
│   │   ├── SmartBatcher.tsx
│   │   ├── PredictiveInsights.tsx
│   │   └── IntelligentAssistant.tsx
│   ├── analytics/    # Advanced analytics components
│   │   ├── ProductivityDashboard.tsx
│   │   ├── BottleneckAnalyzer.tsx
│   │   ├── CollaborationInsights.tsx
│   │   ├── ROITracker.tsx
│   │   ├── PatternVisualizer.tsx
│   │   └── AdvancedCharts.tsx
│   └── nlp/         # Natural language processing
│       ├── NLPInterface.tsx
│       ├── VoiceCommands.tsx
│       ├── SmartSearch.tsx
│       └── ConversationalUI.tsx
└── common/            # Common utility components
    ├── SearchBar.tsx
    ├── FilterDropdown.tsx
    ├── SortSelector.tsx
    ├── Pagination.tsx
    └── ErrorBoundary.tsx
```

---

## 🎨 Design System

Renko follows a **glass morphism and zen aesthetic** design philosophy. For complete implementation details, see [Design Guidelines](./DESIGN_GUIDELINES.md).

### Core Design Principles

- **Breath over clutter**: Every element has purpose and space
- **Subtle depth**: Gentle 3D touches without overwhelming
- **Glass morphism**: Translucent layers with soft blurs
- **Purposeful minimalism**: Clean but not sterile
- **Zen aesthetics**: Calming, focused, professional

### Color Palette

Defined in [Design Guidelines](./DESIGN_GUIDELINES.md) with complete Tailwind configuration:

```css
/* Primary Colors (from Design Guidelines) */
--primary-50: #eff6ff --primary-100: #dbeafe --primary-500: #3b82f6
  --primary-600: #2563eb --primary-700: #1d4ed8 /* Semantic Colors */
  --success: #10b981 --warning: #f59e0b --error: #ef4444 --info: #06b6d4
  /* Neutral Colors */ --gray-50: #f9fafb --gray-100: #f3f4f6
  --gray-200: #e5e7eb --gray-300: #d1d5db --gray-400: #9ca3af
  --gray-500: #6b7280 --gray-600: #4b5563 --gray-700: #374151
  --gray-800: #1f2937 --gray-900: #111827 /* Dark Mode */ --dark-bg: #0a0a0a
  --dark-fg: #ededed;
```

**Note**: Use the new glass morphism color system from [Design Guidelines](./DESIGN_GUIDELINES.md) for all new components.

### Typography Scale

```css
/* Font Families */
--font-sans:
  "Geist Sans", system-ui, sans-serif --font-mono: "Geist Mono", "Monaco",
  monospace /* Font Sizes */ --text-xs: 0.75rem /* 12px */ --text-sm: 0.875rem
    /* 14px */ --text-base: 1rem /* 16px */ --text-lg: 1.125rem /* 18px */
    --text-xl: 1.25rem /* 20px */ --text-2xl: 1.5rem /* 24px */
    --text-3xl: 1.875rem /* 30px */ --text-4xl: 2.25rem /* 36px */
    /* Font Weights */ --font-normal: 400 --font-medium: 500
    --font-semibold: 600 --font-bold: 700;
```

**Note**: Use the semantic typography classes from [Design Guidelines](./DESIGN_GUIDELINES.md) (`.text-h1`, `.text-h2`, etc.) instead of direct Tailwind classes.

### Spacing System (4px grid)

```css
--space-1: 0.25rem /* 4px */ --space-2: 0.5rem /* 8px */ --space-3: 0.75rem
  /* 12px */ --space-4: 1rem /* 16px */ --space-6: 1.5rem /* 24px */
  --space-8: 2rem /* 32px */ --space-12: 3rem /* 48px */ --space-16: 4rem
  /* 64px */;
```

### Border Radius

```css
--radius-sm: 0.25rem /* 4px */ --radius-md: 0.375rem /* 6px */
  --radius-lg: 0.5rem /* 8px */ --radius-xl: 0.75rem /* 12px */
  --radius-full: 9999px /* circular */;
```

---

## 🧩 Base UI Components

### Button Component

```typescript
interface ButtonProps {
  variant: "primary" | "secondary" | "ghost" | "danger";
  size: "sm" | "md" | "lg";
  icon?: React.ComponentType<{ className?: string }>;
  loading?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}
```

**Variants:**

- `primary`: Blue background, white text
- `secondary`: Gray background, dark text
- `ghost`: Transparent background, hover effects
- `danger`: Red background, white text

### Input Component

```typescript
interface InputProps {
  type: "text" | "email" | "password" | "number" | "date";
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
}
```

### Modal Component

```typescript
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  size: "sm" | "md" | "lg" | "xl";
  children: React.ReactNode;
}
```

### Card Component

```typescript
interface CardProps {
  padding?: "sm" | "md" | "lg";
  hover?: boolean;
  border?: boolean;
  shadow?: "sm" | "md" | "lg";
  children: React.ReactNode;
}
```

---

## 🔄 State Management Patterns

### Data Flow

```
User Action → Component → Convex Mutation → Database → Real-time Update → All Components
```

### Loading States

```typescript
const data = useQuery(api.tasks.getBoards);

// Three states to handle:
if (data === undefined) return <LoadingSpinner />
if (data.length === 0) return <EmptyState />
return <DataDisplay data={data} />
```

### Error Handling

```typescript
try {
  await mutation({ param: value });
  // Success feedback
  toast.success("Operation completed");
} catch (error) {
  // Error feedback
  toast.error(error.message);
}
```

---

## 📱 Responsive Design

### Breakpoints

```css
/* Mobile First Approach */
--screen-sm: 640px /* Small tablets */ --screen-md: 768px /* Tablets */
  --screen-lg: 1024px /* Laptops */ --screen-xl: 1280px /* Desktops */
  --screen-2xl: 1536px /* Large screens */;
```

### Layout Strategy

- **Mobile (< 768px)**: Single column, collapsible sidebar
- **Tablet (768px - 1024px)**: Sidebar + main content
- **Desktop (> 1024px)**: Full three-column layout when needed

### Component Responsiveness

```typescript
// Example responsive component
const KanbanBoard = () => {
  return (
    <div className="
      flex flex-col space-y-4    // Mobile: vertical stack
      md:flex-row md:space-x-6   // Desktop: horizontal flow
      overflow-x-auto            // Horizontal scroll on mobile
    ">
      {columns.map(column => ...)}
    </div>
  )
}
```

---

## ♿ Accessibility Guidelines

### ARIA Labels

- All interactive elements have descriptive labels
- Form inputs have associated labels
- Buttons describe their action

### Keyboard Navigation

- Tab order follows visual flow
- Escape key closes modals/dropdowns
- Enter/Space activate buttons
- Arrow keys navigate lists/grids

### Color & Contrast

- WCAG 2.1 AA compliance (4.5:1 ratio)
- Never rely on color alone for information
- High contrast mode support

### Screen Reader Support

- Semantic HTML structure
- Live regions for dynamic content
- Skip links for main content

---

## 🎯 Component Development Guidelines

### Naming Conventions

- **Components**: PascalCase (`TaskCard`, `KanbanBoard`)
- **Props**: camelCase (`isLoading`, `onTaskCreate`)
- **Files**: PascalCase (`TaskCard.tsx`, `KanbanBoard.tsx`)

### Props Interface Patterns

```typescript
// Base props for all components
interface BaseProps {
  className?: string;
  children?: React.ReactNode;
}

// Event handler props
interface EventProps {
  onClick?: () => void;
  onSubmit?: (data: FormData) => void;
  onChange?: (value: string) => void;
}

// Data props with strict typing
interface DataProps {
  task: Task; // Use exact Convex types
  board: Board;
  user: User;
}
```

### Component Composition

```typescript
// Compound component pattern
const KanbanBoard = ({ boardId }) => {
  return (
    <Board>
      <Board.Header />
      <Board.Columns>
        {columns.map(column => (
          <Board.Column key={column._id}>
            <Column.Header />
            <Column.Tasks />
            <Column.AddTask />
          </Board.Column>
        ))}
      </Board.Columns>
    </Board>
  )
}
```

### Performance Optimization

- Use `React.memo()` for expensive components
- Implement `useMemo()` for heavy calculations
- Lazy load non-critical components
- Optimize re-renders with proper dependency arrays

---

## 🧪 Testing Strategy

### Component Testing

```typescript
// Example test structure
describe("TaskCard", () => {
  it("renders task title and description", () => {});
  it("shows priority badge when priority is set", () => {});
  it("handles click events correctly", () => {});
  it("displays overdue warning for past due dates", () => {});
});
```

### Testing Tools

- **Unit Tests**: Jest + React Testing Library
- **Integration Tests**: Playwright
- **Visual Tests**: Storybook + Chromatic
- **Accessibility Tests**: Jest-axe

This component hierarchy ensures consistent, maintainable, and scalable development as the app grows. Each component has a clear purpose and follows established patterns.

---

## 🧠 Smart Interconnectivity Components

### RelationshipMap Component

Visualizes connections between entities in an interactive network graph.

```typescript
interface RelationshipMapProps {
  entityType: string;
  entityId: string;
  depth?: number; // How many levels of connections to show
  interactive?: boolean;
  onNodeClick?: (nodeType: string, nodeId: string) => void;
  highlightPath?: boolean;
}
```

### ContextSidebar Component

Shows related items and contextual information for the current focus.

```typescript
interface ContextSidebarProps {
  currentEntity: {
    type: string;
    id: string;
    title: string;
  };
  relatedItems: RelatedItem[];
  onItemClick: (type: string, id: string) => void;
  showInsights?: boolean;
}
```

### SmartSuggestions Component

Displays AI-powered suggestions based on current context.

```typescript
interface SmartSuggestionsProps {
  context: {
    entityType: string;
    entityId: string;
    userAction?: string;
  };
  suggestions: ContextualInsight[];
  onSuggestionAccept: (suggestion: ContextualInsight) => void;
  onSuggestionDismiss: (suggestionId: string) => void;
}
```

---

## 🤖 AI-Powered Components

### AIScheduler Component

Provides intelligent scheduling suggestions for tasks.

```typescript
interface AISchedulerProps {
  tasks: Task[];
  timeframe: "day" | "week" | "month";
  preferences: {
    workingHours: [number, number];
    energyPeaks: number[];
    breakPreferences: object;
  };
  onScheduleAccept: (schedule: ScheduleSuggestion[]) => void;
}
```

### WorkloadAnalyzer Component

Visualizes workload distribution and capacity analysis.

```typescript
interface WorkloadAnalyzerProps {
  timeframe: string;
  workloadData: WorkloadAnalysis;
  showPredictions?: boolean;
  onCapacityAdjust?: (newCapacity: number) => void;
  alertThreshold?: number;
}
```

### PredictiveInsights Component

Shows AI-generated insights and productivity recommendations.

```typescript
interface PredictiveInsightsProps {
  insights: AIInsight[];
  priorityFilter?: "high" | "medium" | "low";
  categoryFilter?: string[];
  onInsightAction: (insightId: string, action: string) => void;
  dismissible?: boolean;
}
```

### IntelligentAssistant Component

Conversational AI interface for natural interactions.

```typescript
interface IntelligentAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  context?: {
    currentPage: string;
    selectedItems: any[];
  };
  onAction: (action: string, parameters: object) => void;
  voiceEnabled?: boolean;
}
```

---

## 📊 Advanced Analytics Components

### ProductivityDashboard Component

Comprehensive analytics dashboard with multiple views.

```typescript
interface ProductivityDashboardProps {
  timeframe: "day" | "week" | "month" | "quarter";
  userId: string;
  dashboardData: ProductivityDashboard;
  customizable?: boolean;
  widgets: DashboardWidget[];
  onWidgetAdd?: (widget: DashboardWidget) => void;
}
```

### BottleneckAnalyzer Component

Identifies and visualizes process bottlenecks.

```typescript
interface BottleneckAnalyzerProps {
  projectId?: string;
  analysisData: BottleneckAnalysis;
  viewType: "flow" | "timeline" | "heatmap";
  onBottleneckSelect: (bottleneck: Bottleneck) => void;
  showSuggestions?: boolean;
}
```

### PatternVisualizer Component

Displays user behavior patterns and trends.

```typescript
interface PatternVisualizerProps {
  patterns: ProductivityPattern[];
  visualizationType: "timeline" | "heatmap" | "graph";
  interactive?: boolean;
  onPatternSelect?: (pattern: ProductivityPattern) => void;
  showCorrelations?: boolean;
}
```

### ROITracker Component

Tracks and visualizes return on investment for time spent.

```typescript
interface ROITrackerProps {
  timeframe: string;
  roiData: ROIAnalysis;
  projectFilter?: string[];
  showProjections?: boolean;
  onOutcomeRecord: (outcome: Outcome) => void;
}
```

---

## 🎭 Natural Language Processing Components

### NLPInterface Component

Main interface for natural language interactions.

```typescript
interface NLPInterfaceProps {
  placeholder?: string;
  suggestions?: string[];
  onQuery: (query: string) => void;
  onResult: (result: NLPResponse) => void;
  voiceInput?: boolean;
  contextAware?: boolean;
}
```

### SmartSearch Component

Intelligent search with natural language understanding.

```typescript
interface SmartSearchProps {
  query: string;
  onQueryChange: (query: string) => void;
  results: SearchResult[];
  filters: SearchFilter[];
  onFilterChange: (filters: SearchFilter[]) => void;
  showSuggestions?: boolean;
}
```

### ConversationalUI Component

Chat-like interface for AI interactions.

```typescript
interface ConversationalUIProps {
  messages: ConversationMessage[];
  onMessage: (message: string) => void;
  isTyping?: boolean;
  suggestions?: string[];
  context?: ConversationContext;
}
```
