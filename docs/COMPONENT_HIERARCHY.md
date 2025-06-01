# Component Hierarchy & Design System

## 🏗️ Application Structure

```
App (layout.tsx)
├── ConvexAuthProvider
│   ├── Sidebar (always visible when authenticated) ✅ Implemented
│   └── MainContent (app router pages)
│       ├── Dashboard (/) ✅ Implemented
│       │   ├── CalendarWidget ✅ Enhanced with detailed task cards
│       │   ├── TimeBasedKanban ✅ Enhanced with rich task information
│       │   ├── ProjectStatusKanban ✅ Enhanced with detailed project cards
│       │   └── QuickTasks ✅ Implemented
│       ├── Tasks (/tasks)
│       ├── Projects (/projects)
│       ├── Calendar (/calendar)
│       ├── Notes (/notes)
│       └── Settings (/settings)
```

---

## 🧩 Component Organization

### ✅ Implemented Components (Current Structure)

```
components/
├── AppLayout.tsx                   # ✅ Main layout with theme provider
├── ConvexClientProvider.tsx        # ✅ Convex client setup
├── Sidebar.tsx                     # ✅ Navigation sidebar (564 lines)
├── UnifiedKanbanWidget.tsx         # ✅ NEW - Unified widget component (400+ lines)
├── CalendarWidget.tsx              # ✅ Calendar component (355 lines)
├── TimeBasedKanban.tsx             # ✅ Time-based task board (345 lines)
├── ProjectStatusKanban.tsx         # ✅ Project workflow board (344 lines)
├── QuickTasks.tsx                  # ✅ Task overview widget (109 lines)
├── StatCard.tsx                    # ✅ Statistics card (72 lines)
├── KanbanBoard.tsx                 # ✅ Generic kanban component (326 lines)
├── ProjectKanbanBoard.tsx          # ✅ Project-specific kanban (578 lines)
└── ProjectSelectorSidebar.tsx      # ✅ Project navigation (400 lines)
```

### ✅ Pages Structure (App Router)

```
app/
├── page.tsx                        # ✅ Main dashboard (111 lines)
├── layout.tsx                      # ✅ Root layout (44 lines)
├── globals.css                     # ✅ Global styles
├── signin/
│   └── page.tsx                    # ✅ Authentication page (85 lines)
├── boards/
│   └── page.tsx                    # ✅ Board management (528 lines)
├── projects/
│   └── page.tsx                    # ✅ Project management (686 lines)
├── calendar/
│   └── page.tsx                    # ✅ Calendar page (976 lines)
├── notes/
│   └── page.tsx                    # ✅ Notes page (546 lines)
└── server/
    └── (server components)
```

---

## 🎨 Design System Implementation

Renko follows a **professional glassmorphic design** philosophy with horizontal scrolling patterns. For complete implementation details, see [Design Guidelines](./DESIGN_GUIDELINES.md).

### Core Design Principles ✅ Implemented

- **Professional over flashy**: Sophisticated aesthetics for business use
- **Horizontal scrolling first**: Wide layouts that scroll horizontally
- **Glassmorphic depth**: Translucent layers with backdrop-blur effects
- **Consistent theming**: Dark/light mode support across all components
- **Responsive design**: Mobile-optimized with touch-friendly interactions

### Current Color Implementation

```css
/* Implemented Glassmorphic Colors */
.dark-mode {
  --bg-primary: rgba(17, 24, 39, 0.6); /* gray-900/60 */
  --bg-secondary: rgba(31, 41, 55, 0.8); /* gray-800/80 */
  --border-primary: rgba(75, 85, 99, 0.6); /* gray-600/60 */
  --text-primary: rgba(255, 255, 255, 1); /* white */
  --text-secondary: rgba(156, 163, 175, 1); /* gray-400 */
  --accent-purple: rgba(147, 51, 234, 1); /* purple-600 */
}

.light-mode {
  --bg-primary: rgba(255, 255, 255, 0.9); /* white/90 */
  --bg-secondary: rgba(249, 250, 251, 0.8); /* gray-50/80 */
  --border-primary: rgba(229, 231, 235, 0.6); /* gray-200/60 */
  --text-primary: rgba(17, 24, 39, 1); /* gray-900 */
  --text-secondary: rgba(107, 114, 128, 1); /* gray-500 */
  --accent-purple: rgba(147, 51, 234, 1); /* purple-600 */
}
```

### Implemented Typography Scale

```css
/* Current Typography Implementation */
.text-2xl {
  font-size: 1.5rem;
  font-weight: 500;
} /* Headers */
.text-xl {
  font-size: 1.25rem;
  font-weight: 600;
} /* Sub-headers */
.text-lg {
  font-size: 1.125rem;
  font-weight: 500;
} /* Large text */
.text-base {
  font-size: 1rem;
  font-weight: 400;
} /* Body text */
.text-sm {
  font-size: 0.875rem;
  font-weight: 500;
} /* Secondary text */
.text-xs {
  font-size: 0.75rem;
  font-weight: 500;
} /* Small text */
```

### Implemented Spacing System

```css
/* 4px Grid System - Implemented */
--space-2: 0.5rem; /* 8px */
--space-3: 0.75rem; /* 12px */
--space-4: 1rem; /* 16px */
--space-6: 1.5rem; /* 24px */
--space-8: 2rem; /* 32px */
```

---

## 🧩 Enhanced Component Patterns

### Horizontal Scrolling Pattern ✅

All major dashboard components follow this pattern:

```typescript
// Enhanced scrollable container with consistent styling
<div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-400/50 scrollbar-track-gray-100/50">
  <div className="flex gap-6 min-w-max">
    {/* Fixed-width columns for optimal content display */}
    <div className="w-[240px] flex-shrink-0 space-y-4">
      {/* Column content */}
    </div>
  </div>
</div>
```

### Enhanced Task Card Pattern ✅

Standardized across all kanban components with rich information:

```typescript
// Enhanced task card with detailed information
<div className={`p-3 rounded-xl cursor-pointer transition-all duration-200 backdrop-blur-sm border shadow-md ${
  isDarkMode
    ? "bg-gray-800/50 border-gray-700/50 shadow-black/20"
    : "bg-white/80 border-gray-200/60 shadow-gray-900/10"
}`}>
  {/* Task Header */}
  <div className="flex items-start justify-between mb-2">
    <span className="font-medium text-sm leading-tight flex-1">
      {task.title}
    </span>
    <div className="flex flex-col items-end space-y-0.5 flex-shrink-0 ml-2">
      <span className="text-xs opacity-75 font-medium">
        {task.dueTime || task.dueDate}
      </span>
      <span className="text-xs opacity-60">
        {task.timeEstimate || task.duration}
      </span>
    </div>
  </div>

  {/* Task Description */}
  <p className="text-xs opacity-75 mb-2 leading-relaxed">
    {task.description}
  </p>

  {/* Task Footer with Tags */}
  <div className="flex items-center justify-between">
    <span className={`text-xs px-2 py-1 rounded-lg font-medium backdrop-blur-sm border ${
      isDarkMode
        ? "bg-gray-700/50 text-gray-300 border-gray-600/50"
        : "bg-white/80 text-gray-600 border-gray-300/60"
    }`}>
      {task.project}
    </span>
    <span className={`text-xs px-2 py-1 rounded-lg font-medium backdrop-blur-sm border ${
      /* Priority-based color styling */
    }`}>
      {task.priority}
    </span>
  </div>
</div>
```

### Column Header Pattern ✅

Consistent header design across all dashboard widgets:

```typescript
// Enhanced column header with icon and task count
<div className="flex items-center justify-between">
  <div className="flex items-center space-x-3">
    <div className={`p-2 rounded-xl backdrop-blur-sm border shadow-lg ${colorClasses[column.color]}`}>
      <column.icon className="w-4 h-4" />
    </div>
    <div>
      <h4 className={`font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}>
        {column.title}
      </h4>
      <p className={`text-sm ${isDarkMode ? "text-gray-500" : "text-gray-500"}`}>
        {tasks.length} tasks
      </p>
    </div>
  </div>
</div>
```

### Priority Tag Pattern ✅

Standardized priority indicators with proper contrast:

```typescript
// Enhanced priority tags with borders and backdrop blur
const priorityClasses = {
  critical: isDarkMode
    ? "bg-red-500/20 text-red-300 border-red-400/40"
    : "bg-red-100 text-red-700 border-red-300/60",
  high: isDarkMode
    ? "bg-orange-500/20 text-orange-300 border-orange-400/40"
    : "bg-orange-100 text-orange-700 border-orange-300/60",
  medium: isDarkMode
    ? "bg-yellow-500/20 text-yellow-300 border-yellow-400/40"
    : "bg-yellow-100 text-yellow-700 border-yellow-300/60",
  low: isDarkMode
    ? "bg-green-500/20 text-green-300 border-green-400/40"
    : "bg-green-100 text-green-700 border-green-300/60",
};
```

---

## 📊 Enhanced Dashboard Components

### CalendarWidget ✅ Enhanced

**Features**: Horizontal scrolling week view with detailed event cards
**Enhancements**:

- Task-specific information (title, description, time, priority, project)
- Kanban-style column headers with calendar icons
- Smaller card heights for better density
- Enhanced tag visibility with rounded outlines
- Subtle shadow effects on event cards

**Data Structure**:

```typescript
interface CalendarEvent {
  title: string;
  description: string;
  time: string;
  duration: string;
  priority: "critical" | "high" | "medium" | "low";
  project: string;
  color: string;
}
```

### TimeBasedKanban ✅ Enhanced

**Features**: Time-organized task management (Today, This Week, This Month, Long Term)
**Enhancements**:

- Rich task details with descriptions and time estimates
- Project associations and priority indicators
- Due time/date information for urgency
- Enhanced visual hierarchy with improved spacing
- Consistent tag styling with borders

**Data Structure**:

```typescript
interface TimeBasedTask {
  id: string;
  title: string;
  description: string;
  priority: "critical" | "high" | "medium" | "low";
  project: string;
  timeEstimate: string;
  dueTime: string;
}
```

### ProjectStatusKanban ✅ Enhanced

**Features**: Project workflow tracking (Draft, Planned, In Progress, Done)
**Enhancements**:

- Comprehensive project information with detailed descriptions
- Time estimates for project planning
- Priority levels with proper visual indicators
- Clear project categorization and due dates
- Professional card styling matching other components

**Data Structure**:

```typescript
interface ProjectTask {
  id: string;
  title: string;
  description: string;
  project: string;
  priority: "critical" | "high" | "medium" | "low";
  timeEstimate: string;
  dueDate: string;
}
```

---

## 🎯 Design Consistency Achievements

### Unified Card Design ✅

- **Consistent padding**: `p-3` for optimal density
- **Standard spacing**: `space-y-2` between cards
- **Unified shadows**: `shadow-md` with color-specific variants
- **Standardized borders**: Rounded corners with backdrop blur

### Enhanced Information Architecture ✅

- **Clear hierarchy**: Title → Description → Tags
- **Consistent typography**: Font weights and sizes standardized
- **Improved readability**: Proper opacity and color contrast
- **Professional styling**: Business-appropriate aesthetics

### Tag System Improvements ✅

- **Project tags**: Neutral styling with gray backgrounds
- **Priority tags**: Color-coded with proper contrast ratios
- **Border enhancement**: Subtle outlines for better visibility
- **Backdrop blur**: Professional glassmorphic effects

### Mobile Optimization ✅

- **Touch-friendly**: Adequate spacing for finger interaction
- **Responsive design**: Horizontal scrolling for mobile screens
- **Accessible**: High contrast ratios and readable text sizes
- **Performance**: Optimized animations and transitions

This enhanced component hierarchy establishes a solid foundation for Phase 3 development, with consistent design patterns and rich information architecture across all dashboard components.

---

## 🆕 **UnifiedKanbanWidget - New Architecture** ✅

### Design Philosophy

The `UnifiedKanbanWidget` component represents a major architectural improvement, consolidating all dashboard widgets into a single, reusable component with proper props interface.

### Key Benefits ✅

- **Consistency**: All widgets now use the same design patterns and styling
- **Maintainability**: Single source of truth for widget behavior
- **Flexibility**: Configurable columns, data, and actions through props
- **Fixed Height Layout**: All kanban widgets have consistent, fixed heights
- **100% Height Columns**: Columns always use full available height for perfect alignment
- **Wide Columns**: 320px width columns for better content display and readability
- **Enhanced Scrolling**: Smooth horizontal scrolling with proper spacing (8px gaps)
- **Dark Theme Compatible**: Optimized contrast and readability in both light and dark modes
- **Enhanced Hover Effects**: Subtle hover animations for better interactivity
- **Add Item Functionality**: Built-in "Add Item" buttons under each column
- **Unified Styling**: Consistent glassmorphic design across all widgets
- **Responsive Padding**: Increased padding and spacing for better visual hierarchy

### Component Interface

```typescript
interface UnifiedKanbanWidgetProps {
  isDarkMode: boolean;
  title: string;
  subtitle?: string;
  icon: LucideIcon;
  columns: WidgetColumn[];
  data: Record<string, WidgetItem[]>;
  onAddItem?: (columnId: string) => void;
  showFilter?: boolean;
  onFilter?: () => void;
  actionButtons?: React.ReactNode;
  height?: string; // Default: "500px"
}
```

### Current Implementation ✅

The home page (`app/page.tsx`) now uses `UnifiedKanbanWidget` for all four dashboard widgets:

1. **Calendar Widget** - Week view with events and time slots
2. **Time-Based Tasks** - Today, This Week, This Month, Long Term
3. **Project Status** - Draft, Planned, In Progress, Done
4. **Quick Tasks** - Urgent, Pending, Review

### Migration Status

- ✅ **UnifiedKanbanWidget**: Fully implemented and active
- ✅ **Home Page**: Updated to use unified component
- ✅ **Legacy Components**: Preserved for reference but replaced in usage
- ✅ **Full Height Columns**: Implemented with configurable min/max heights
- ✅ **Add Item Buttons**: Added to all columns with proper callbacks

---
