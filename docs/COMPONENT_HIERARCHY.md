# Component Hierarchy & Design System

## 🏗️ Application Structure

```
App (layout.tsx)
├── ConvexAuthProvider
│   ├── Sidebar (always visible when authenticated) ✅ Implemented
│   └── MainContent (app router pages)
│       ├── Dashboard (/) ✅ Implemented
│       │   ├── CalendarWidget ✅ Implemented
│       │   ├── TimeBasedKanban ✅ Implemented
│       │   ├── ProjectStatusKanban ✅ Implemented
│       │   └── QuickTasks ✅ Implemented
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
│   ├── Sidebar.tsx      ✅ Implemented - Collapsible navigation with theme toggle
│   ├── Header.tsx
│   ├── Navigation.tsx
│   └── MobileMenu.tsx
├── dashboard/           # Dashboard-specific components ✅ Implemented
│   ├── CalendarWidget.tsx    ✅ Horizontal scrolling week view with events
│   ├── TimeBasedKanban.tsx   ✅ Time-based task organization with scrolling
│   ├── ProjectStatusKanban.tsx ✅ Project workflow tracking with scrolling
│   ├── StatCard.tsx          ✅ Dashboard statistics display
│   └── QuickTasks.tsx        ✅ Task overview and management
├── forms/               # Form components
│   ├── TaskForm.tsx
│   ├── ProjectForm.tsx
│   ├── EventForm.tsx
│   ├── NoteForm.tsx
│   └── FormField.tsx
├── features/           # Feature-specific components
│   ├── kanban/        # Kanban board components
│   │   ├── KanbanBoard.tsx     ✅ Implemented (legacy)
│   │   ├── KanbanColumn.tsx    ✅ Part of KanbanBoard
│   │   ├── TaskCard.tsx        ✅ Part of KanbanBoard
│   │   ├── NewTaskForm.tsx     ✅ Part of KanbanBoard
│   │   └── DragDropContext.tsx
│   ├── calendar/      # Calendar components
│   │   ├── CalendarGrid.tsx    # Enhanced version of CalendarWidget
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

## 🧩 Implemented Component Patterns

### Horizontal Scrolling Pattern ✅

All major dashboard components follow this pattern:

```typescript
// Horizontal scroll container
<div className="overflow-x-auto scrollbar-thin">
  <div className="flex gap-6 min-w-max">
    {items.map(item => (
      <ItemComponent key={item.id} className="w-[240px] flex-shrink-0" />
    ))}
  </div>
</div>
```

### Glassmorphic Component Pattern ✅

```typescript
// Standard glassmorphic container
<div className={`
  rounded-2xl backdrop-blur-xl border shadow-2xl
  ${isDarkMode
    ? "bg-gray-900/60 border-gray-800/60 shadow-black/25"
    : "bg-white/90 border-gray-200/60 shadow-gray-900/15"
  }
`}>
  {children}
</div>
```

### Header Pattern ✅

```typescript
// Consistent header pattern across components
<div className="flex items-center justify-between mb-8">
  <div className="flex items-center space-x-4">
    <div className={`
      p-2.5 rounded-xl backdrop-blur-sm border shadow-sm
      ${isDarkMode
        ? "bg-gray-800/80 border-gray-700/50 text-purple-400"
        : "bg-white/80 border-gray-200/60 text-purple-600"
      }
    `}>
      <Icon className="w-5 h-5" />
    </div>
    <h3 className={`text-2xl font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}>
      Component Title
    </h3>
  </div>
</div>
```

---

## 📅 CalendarWidget Implementation

### Component Structure ✅

```typescript
CalendarWidget
├── Header (icon + title + date display + controls)
├── ViewToggle (Week/Month buttons)
├── AddEventButton (+ icon)
└── WeekView (horizontal scrolling)
    ├── DayColumn (200px width, flex-shrink-0)
    │   ├── DayHeader (date number in badge)
    │   └── EventsContainer (vertical scroll, max-height)
    │       └── EventCard[] (with time, type, color)
    └── ...more days
```

### Key Features ✅

- **Horizontal Scrolling**: Week view scrolls horizontally on mobile
- **Event Management**: Multiple events per day with categorization
- **Current Day Highlighting**: Purple badge for today's date
- **Professional Styling**: Glassmorphic design with hover effects

---

## 📋 Kanban Components Implementation

### TimeBasedKanban ✅

```typescript
TimeBasedKanban
├── Header (icon + title + filter button)
└── HorizontalScrollContainer
    ├── TodayColumn (240px width)
    ├── ThisWeekColumn (240px width)
    ├── ThisMonthColumn (240px width)
    └── LongTermColumn (240px width)
        ├── ColumnHeader (icon + title + task count)
        └── TasksContainer (vertical scroll)
            └── TaskCard[] (priority indicators)
```

### ProjectStatusKanban ✅

```typescript
ProjectStatusKanban
├── Header (icon + title)
└── HorizontalScrollContainer
    ├── DraftColumn (240px width)
    ├── PlannedColumn (240px width)
    ├── InProgressColumn (240px width)
    └── DoneColumn (240px width)
        ├── ColumnHeader (colored icon + title)
        └── TasksContainer (vertical scroll)
            └── ProjectCard[] (project tags + due dates)
```

### Common Kanban Patterns ✅

- **Fixed Column Width**: 240px for optimal content display
- **Vertical Overflow**: Individual columns scroll when content exceeds height
- **Color Coding**: Different themes for priorities and project types
- **Interactive Cards**: Hover effects and smooth transitions

---

## 🔧 Component Props Patterns

### Standard Component Interface ✅

```typescript
interface ComponentProps {
  isDarkMode: boolean; // Theme state
  className?: string; // Additional styling
  children?: React.ReactNode; // Optional content
}
```

### Dashboard Widget Interface ✅

```typescript
interface DashboardWidgetProps {
  isDarkMode: boolean;
  data?: any[]; // Optional data array
  onAction?: () => void; // Optional action handler
}
```

### Horizontal Scroll Component ✅

```typescript
interface HorizontalScrollComponentProps {
  isDarkMode: boolean;
  items: any[];
  itemWidth?: string; // Default: "240px"
  gap?: string; // Default: "gap-6"
}
```

---

## 📱 Responsive Design Implementation

### Breakpoint Strategy ✅

- **Mobile First**: Components designed for mobile, enhanced for desktop
- **Horizontal Scroll**: Wide content scrolls horizontally on small screens
- **Touch Optimization**: Larger touch targets and smooth scrolling
- **Flexible Layouts**: Components adapt to available space

### Mobile Optimizations ✅

- **Sidebar Collapse**: Hamburger menu on mobile devices
- **Touch Scrolling**: Smooth horizontal and vertical scrolling
- **Larger Touch Targets**: Buttons and interactive elements sized for fingers
- **Reduced Animations**: Performance-optimized transitions

---

## 🎯 Design System Guidelines

### Do's ✅ Implemented

- Use glassmorphic containers with backdrop-blur
- Implement horizontal scrolling for wide content
- Maintain consistent theming across light/dark modes
- Apply professional color palette and typography
- Include hover effects and smooth transitions

### Don'ts ❌ Avoided

- Don't use excessive animations or scaling effects
- Don't make components too "flashy" or unprofessional
- Don't use harsh colors or high contrast without purpose
- Don't implement layouts that break on mobile devices
- Don't ignore accessibility considerations

---

## 🚀 Next Implementation Steps

### Immediate Priorities

1. **Enhance Current Components**:

   - Add drag & drop to kanban boards
   - Implement calendar month view
   - Add task editing capabilities

2. **New Dashboard Widgets**:

   - NotificationCenter component
   - AnalyticsDashboard widget
   - QuickActions component enhancement

3. **Advanced Features**:
   - SearchBar with global filtering
   - ProjectCard with enhanced details
   - NoteEditor with rich text support

### Future Intelligent Components

- **RelationshipMap**: Visual connections between entities
- **AIScheduler**: Intelligent task scheduling
- **ProductivityDashboard**: Advanced analytics and insights
- **SmartSuggestions**: AI-powered recommendations

---

This component hierarchy reflects the current implementation state with a focus on professional design, horizontal scrolling patterns, and preparation for intelligent features. All components follow the established glassmorphic design system and responsive patterns.
