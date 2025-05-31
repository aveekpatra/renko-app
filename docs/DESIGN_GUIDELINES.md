# Renko Design Guidelines - Professional Glassmorphism

_Professional • Sophisticated • Elegant • Business-Ready_

## Core Design Philosophy ✅ Implemented

- **Professional over flashy**: Sophisticated aesthetics suitable for business environments
- **Horizontal scrolling first**: Wide layouts that scroll horizontally for better content organization
- **Glassmorphic depth**: Translucent layers with tasteful backdrop-blur effects
- **Consistent theming**: Seamless dark/light mode transitions across all components
- **Touch-optimized**: Mobile-first design with finger-friendly interactions

---

## Current Implementation Colors

### Glassmorphic Color System ✅

```css
/* Dark Mode Implementation */
.dark {
  /* Primary Backgrounds */
  --bg-primary: rgba(17, 24, 39, 0.6); /* gray-900/60 */
  --bg-secondary: rgba(31, 41, 55, 0.8); /* gray-800/80 */
  --bg-tertiary: rgba(55, 65, 81, 0.3); /* gray-700/30 */

  /* Borders */
  --border-primary: rgba(75, 85, 99, 0.6); /* gray-600/60 */
  --border-secondary: rgba(107, 114, 128, 0.5); /* gray-500/50 */

  /* Text Colors */
  --text-primary: rgba(255, 255, 255, 1); /* white */
  --text-secondary: rgba(156, 163, 175, 1); /* gray-400 */
  --text-tertiary: rgba(107, 114, 128, 1); /* gray-500 */

  /* Accent Colors */
  --accent-purple: rgba(147, 51, 234, 1); /* purple-600 */
  --accent-purple-light: rgba(168, 85, 247, 0.4); /* purple-500/40 */
}

/* Light Mode Implementation */
.light {
  /* Primary Backgrounds */
  --bg-primary: rgba(255, 255, 255, 0.9); /* white/90 */
  --bg-secondary: rgba(249, 250, 251, 0.8); /* gray-50/80 */
  --bg-tertiary: rgba(243, 244, 246, 0.5); /* gray-100/50 */

  /* Borders */
  --border-primary: rgba(229, 231, 235, 0.6); /* gray-200/60 */
  --border-secondary: rgba(209, 213, 219, 0.5); /* gray-300/50 */

  /* Text Colors */
  --text-primary: rgba(17, 24, 39, 1); /* gray-900 */
  --text-secondary: rgba(107, 114, 128, 1); /* gray-500 */
  --text-tertiary: rgba(156, 163, 175, 1); /* gray-400 */

  /* Accent Colors */
  --accent-purple: rgba(147, 51, 234, 1); /* purple-600 */
  --accent-purple-light: rgba(147, 51, 234, 0.1); /* purple-600/10 */
}
```

### Enhanced Priority and Status Colors ✅

```css
/* Enhanced Task Priority Colors with Borders */
--priority-critical-dark: rgba(239, 68, 68, 0.2); /* red-500/20 */
--priority-critical-light: rgba(254, 226, 226, 1); /* red-100 */
--priority-critical-border-dark: rgba(248, 113, 113, 0.4); /* red-400/40 */
--priority-critical-border-light: rgba(220, 38, 38, 0.6); /* red-600/60 */

--priority-high-dark: rgba(251, 146, 60, 0.2); /* orange-500/20 */
--priority-high-light: rgba(254, 215, 170, 1); /* orange-100 */
--priority-high-border-dark: rgba(251, 146, 60, 0.4); /* orange-400/40 */
--priority-high-border-light: rgba(194, 65, 12, 0.6); /* orange-700/60 */

--priority-medium-dark: rgba(245, 158, 11, 0.2); /* yellow-500/20 */
--priority-medium-light: rgba(254, 240, 138, 1); /* yellow-100 */
--priority-medium-border-dark: rgba(251, 191, 36, 0.4); /* yellow-400/40 */
--priority-medium-border-light: rgba(161, 98, 7, 0.6); /* yellow-700/60 */

--priority-low-dark: rgba(34, 197, 94, 0.2); /* green-500/20 */
--priority-low-light: rgba(187, 247, 208, 1); /* green-100 */
--priority-low-border-dark: rgba(74, 222, 128, 0.4); /* green-400/40 */
--priority-low-border-light: rgba(21, 128, 61, 0.6); /* green-700/60 */

/* Enhanced Column Header Colors */
--red-theme-dark: rgba(239, 68, 68, 0.15); /* red-500/15 */
--orange-theme-dark: rgba(251, 146, 60, 0.15); /* orange-500/15 */
--blue-theme-dark: rgba(59, 130, 246, 0.15); /* blue-500/15 */
--purple-theme-dark: rgba(168, 85, 247, 0.15); /* purple-500/15 */
--gray-theme-dark: rgba(107, 114, 128, 0.15); /* gray-500/15 */
--green-theme-dark: rgba(34, 197, 94, 0.15); /* green-500/15 */

/* Enhanced Project Tag Colors */
--project-tag-dark: rgba(55, 65, 81, 0.5); /* gray-700/50 */
--project-tag-light: rgba(255, 255, 255, 0.8); /* white/80 */
--project-tag-border-dark: rgba(107, 114, 128, 0.5); /* gray-500/50 */
--project-tag-border-light: rgba(156, 163, 175, 0.6); /* gray-400/60 */
```

---

## Typography Implementation ✅

### Font Hierarchy

```css
/* Current Typography Scale - Professional */
.text-2xl {
  font-size: 1.5rem; /* 24px */
  font-weight: 500; /* medium */
  line-height: 1.2;
}

.text-xl {
  font-size: 1.25rem; /* 20px */
  font-weight: 600; /* semibold */
  line-height: 1.3;
}

.text-lg {
  font-size: 1.125rem; /* 18px */
  font-weight: 500; /* medium */
  line-height: 1.4;
}

.text-base {
  font-size: 1rem; /* 16px */
  font-weight: 400; /* normal */
  line-height: 1.5;
}

.text-sm {
  font-size: 0.875rem; /* 14px */
  font-weight: 500; /* medium */
  line-height: 1.4;
}

.text-xs {
  font-size: 0.75rem; /* 12px */
  font-weight: 500; /* medium */
  line-height: 1.3;
}
```

### Font Weight Usage ✅

- **font-medium (500)**: Headers and important text
- **font-semibold (600)**: Sub-headers and emphasized content
- **font-normal (400)**: Body text and descriptions
- **font-bold (700)**: Reserved for branding only

---

## Spacing System ✅

### Implemented 4px Grid

```css
/* Consistent Spacing - 4px increments */
--space-1: 0.25rem; /* 4px */
--space-2: 0.5rem; /* 8px */
--space-3: 0.75rem; /* 12px */
--space-4: 1rem; /* 16px */
--space-5: 1.25rem; /* 20px */
--space-6: 1.5rem; /* 24px */
--space-8: 2rem; /* 32px */
--space-10: 2.5rem; /* 40px */
--space-12: 3rem; /* 48px */
```

### Enhanced Component Spacing Patterns ✅

```css
/* Standard Component Padding */
.component-padding {
  padding: 1.5rem; /* 24px - p-6 */
}

.component-gap {
  gap: 1.5rem; /* 24px - gap-6 */
}

.section-margin {
  margin-bottom: 2.5rem; /* 40px - mb-10 */
}

/* Enhanced Card Patterns */
.card-padding {
  padding: 0.75rem; /* 12px - p-3 */
}

.card-spacing {
  margin-bottom: 0.5rem; /* 8px - space-y-2 */
}

.tag-padding {
  padding: 0.25rem 0.5rem; /* 4px 8px - px-2 py-1 */
}
```

---

## Enhanced Component Patterns ✅

### Glassmorphic Container Pattern

```tsx
// Standard container used across all components
const GlassmorphicContainer = ({ isDarkMode, children }) => (
  <div
    className={`
    rounded-2xl backdrop-blur-xl border shadow-2xl
    ${
      isDarkMode
        ? "bg-gray-900/60 border-gray-800/60 shadow-black/25"
        : "bg-white/90 border-gray-200/60 shadow-gray-900/15"
    }
  `}
  >
    {children}
  </div>
);
```

### Enhanced Header Pattern with Icon ✅

```tsx
// Consistent header pattern across dashboard widgets
const WidgetHeader = ({ isDarkMode, icon: Icon, title, children }) => (
  <div className="flex items-center justify-between mb-8">
    <div className="flex items-center space-x-4">
      <div
        className={`p-2.5 rounded-xl backdrop-blur-sm border shadow-sm ${
          isDarkMode
            ? "bg-gray-800/80 border-gray-700/50 text-purple-400 shadow-black/20"
            : "bg-white/80 border-gray-200/60 text-purple-600 shadow-gray-900/10"
        }`}
      >
        <Icon className="w-5 h-5" />
      </div>
      <h3
        className={`text-2xl font-medium ${
          isDarkMode ? "text-white" : "text-gray-900"
        }`}
      >
        {title}
      </h3>
    </div>
    {children}
  </div>
);
```

### Enhanced Column Header Pattern ✅

```tsx
// Enhanced column headers with task counts and themed icons
const ColumnHeader = ({ isDarkMode, column, taskCount }) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center space-x-3">
      <div
        className={`p-2 rounded-xl backdrop-blur-sm border shadow-lg ${
          colorClasses[column.color]
        }`}
      >
        <column.icon className="w-4 h-4" />
      </div>
      <div>
        <h4
          className={`font-medium ${
            isDarkMode ? "text-white" : "text-gray-900"
          }`}
        >
          {column.title}
        </h4>
        <p
          className={`text-sm ${
            isDarkMode ? "text-gray-500" : "text-gray-500"
          }`}
        >
          {taskCount} tasks
        </p>
      </div>
    </div>
  </div>
);
```

### Enhanced Task Card Pattern ✅

```tsx
// Standardized task card with rich information and professional styling
const TaskCard = ({ isDarkMode, task }) => (
  <div
    className={`p-3 rounded-xl cursor-pointer transition-all duration-200 backdrop-blur-sm border shadow-md ${
      isDarkMode
        ? "bg-gray-800/50 border-gray-700/50 shadow-black/20"
        : "bg-white/80 border-gray-200/60 shadow-gray-900/10"
    }`}
  >
    {/* Task Header with Time Information */}
    <div className="flex items-start justify-between mb-2">
      <span className="font-medium text-sm leading-tight flex-1">
        {task.title}
      </span>
      <div className="flex flex-col items-end space-y-0.5 flex-shrink-0 ml-2">
        <span
          className={`text-xs opacity-75 font-medium ${
            isDarkMode ? "text-gray-400" : "text-gray-600"
          }`}
        >
          {task.dueTime || task.dueDate}
        </span>
        <span
          className={`text-xs opacity-60 ${
            isDarkMode ? "text-gray-500" : "text-gray-500"
          }`}
        >
          {task.timeEstimate || task.duration}
        </span>
      </div>
    </div>

    {/* Task Description */}
    <p
      className={`text-xs opacity-75 mb-2 leading-relaxed ${
        isDarkMode ? "text-gray-400" : "text-gray-600"
      }`}
    >
      {task.description}
    </p>

    {/* Enhanced Task Footer with Styled Tags */}
    <div className="flex items-center justify-between">
      <ProjectTag isDarkMode={isDarkMode} project={task.project} />
      <PriorityTag isDarkMode={isDarkMode} priority={task.priority} />
    </div>
  </div>
);
```

### Enhanced Tag System Patterns ✅

```tsx
// Project tag with enhanced visibility
const ProjectTag = ({ isDarkMode, project }) => (
  <span
    className={`text-xs px-2 py-1 rounded-lg font-medium backdrop-blur-sm border ${
      isDarkMode
        ? "bg-gray-700/50 text-gray-300 border-gray-600/50"
        : "bg-white/80 text-gray-600 border-gray-300/60"
    }`}
  >
    {project}
  </span>
);

// Priority tag with enhanced colors and borders
const PriorityTag = ({ isDarkMode, priority }) => {
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

  return (
    <span
      className={`text-xs px-2 py-1 rounded-lg font-medium backdrop-blur-sm border ${priorityClasses[priority]}`}
    >
      {priority}
    </span>
  );
};
```

### Horizontal Scrolling Container Pattern ✅

```tsx
// Enhanced scrollable container with consistent styling
const HorizontalScrollContainer = ({ children }) => (
  <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-400/50 scrollbar-track-gray-100/50">
    <div className="flex gap-6 min-w-max">{children}</div>
  </div>
);

// Fixed-width columns for optimal content display
const FixedColumn = ({ children }) => (
  <div className="w-[240px] flex-shrink-0 space-y-4">{children}</div>
);
```

---

## Enhanced Information Architecture ✅

### Task/Event Data Structure

```tsx
// Standardized task structure across all components
interface EnhancedTask {
  id: string;
  title: string;
  description: string;
  priority: "critical" | "high" | "medium" | "low";
  project: string;
  timeEstimate?: string;
  dueTime?: string;
  dueDate?: string;
  status?: string;
}

// Calendar event structure
interface CalendarEvent extends EnhancedTask {
  time: string;
  duration: string;
  color: string;
}
```

### Card Information Hierarchy ✅

```tsx
// Consistent information display order
const CardStructure = {
  header: {
    title: "Primary title (font-medium text-sm)",
    timeInfo: "Due time/date and duration (text-xs opacity-75)",
  },
  body: {
    description: "Context and details (text-xs opacity-75)",
  },
  footer: {
    projectTag: "Left-aligned with neutral styling",
    priorityTag: "Right-aligned with color coding",
  },
};
```

---

## Component-Specific Guidelines

### CalendarWidget ✅ Enhanced

- **Week View**: Horizontal scrolling with fixed-width date columns
- **Event Cards**: Task-specific information with proper time display
- **Current Day**: Highlighted with purple accent colors
- **Event Density**: Optimized card heights for better information display

### TimeBasedKanban ✅ Enhanced

- **Time Columns**: Today, This Week, This Month, Long Term
- **Rich Tasks**: Descriptions, time estimates, project associations
- **Due Time**: Urgency indicators with proper formatting
- **Color Coding**: Red (Today), Orange (Week), Blue (Month), Purple (Long Term)

### ProjectStatusKanban ✅ Enhanced

- **Status Workflow**: Draft → Planned → In Progress → Done
- **Project Details**: Comprehensive information with time estimates
- **Priority System**: Enhanced visual indicators with borders
- **Progress Tracking**: Clear categorization with due dates

---

## Accessibility Guidelines ✅

### Enhanced Contrast Standards

```css
/* Minimum contrast ratios achieved */
.text-contrast {
  /* Normal text: 4.5:1 ratio minimum */
  /* Large text: 3:1 ratio minimum */
  /* Interactive elements: 3:1 ratio minimum */
}

/* Enhanced tag visibility */
.priority-tags {
  /* High contrast borders for better visibility */
  border-width: 1px;
  backdrop-filter: blur(4px);
}
```

### Touch Target Requirements ✅

```css
/* Enhanced mobile interactions */
.touch-target {
  min-height: 44px; /* iOS guideline */
  min-width: 44px;
  padding: 12px; /* p-3 for cards */
}

.tag-touch {
  padding: 4px 8px; /* px-2 py-1 */
  border-radius: 8px; /* rounded-lg */
}
```

---

## Performance Guidelines ✅

### Enhanced Animation Standards

```css
/* Optimized transitions */
.transition-standard {
  transition: all 0.2s ease-in-out;
}

/* Removed hover effects for cleaner interactions */
.no-hover {
  /* Clean design without complex hover states */
}

/* Enhanced shadow performance */
.shadow-optimized {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}
```

### Memory Optimization

- **Fixed Column Widths**: Consistent 240px for predictable layouts
- **Reduced Card Padding**: p-3 instead of p-4 for better density
- **Optimized Spacing**: space-y-2 for tighter card arrangements
- **Efficient Shadows**: Single shadow-md instead of complex effects

---

## Enhanced Design Achievements ✅

### Consistency Improvements

- **Unified Card Design**: All components use the same card pattern
- **Standardized Spacing**: Consistent padding and margins throughout
- **Enhanced Tags**: Improved visibility with borders and proper contrast
- **Information Hierarchy**: Clear title → description → tags structure

### Professional Enhancements

- **Business Aesthetics**: Sophisticated styling appropriate for professional use
- **Improved Readability**: Better typography and opacity management
- **Enhanced Accessibility**: High contrast ratios and touch-friendly sizing
- **Mobile Optimization**: Responsive design with horizontal scrolling

### Performance Optimizations

- **Cleaner Interactions**: Removed complex hover effects
- **Efficient Layouts**: Optimized card sizes and spacing
- **Better Density**: More information in less space
- **Smooth Scrolling**: Enhanced scrollbar styling and performance

---

This enhanced design system establishes a solid foundation for professional productivity applications with rich information architecture, consistent styling patterns, and optimal user experience across all components.
