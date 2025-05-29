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

### Priority and Status Colors ✅

```css
/* Task Priority Colors */
--priority-high-dark: rgba(239, 68, 68, 0.3); /* red-500/30 */
--priority-high-light: rgba(254, 226, 226, 0.9); /* red-100/90 */

--priority-medium-dark: rgba(245, 158, 11, 0.3); /* yellow-500/30 */
--priority-medium-light: rgba(254, 243, 199, 0.9); /* yellow-100/90 */

--priority-low-dark: rgba(34, 197, 94, 0.3); /* green-500/30 */
--priority-low-light: rgba(220, 252, 231, 0.9); /* green-100/90 */

/* Column Header Colors */
--red-theme-dark: rgba(239, 68, 68, 0.15); /* red-500/15 */
--orange-theme-dark: rgba(251, 146, 60, 0.15); /* orange-500/15 */
--blue-theme-dark: rgba(59, 130, 246, 0.15); /* blue-500/15 */
--purple-theme-dark: rgba(168, 85, 247, 0.15); /* purple-500/15 */
--gray-theme-dark: rgba(107, 114, 128, 0.15); /* gray-500/15 */
--green-theme-dark: rgba(34, 197, 94, 0.15); /* green-500/15 */
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

### Component Spacing Patterns ✅

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
```

---

## Component Patterns ✅

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

### Header Pattern with Icon

```tsx
// Consistent header pattern across dashboard widgets
const ComponentHeader = ({ isDarkMode, icon: Icon, title, action }) => (
  <div className="flex items-center justify-between mb-8">
    <div className="flex items-center space-x-4">
      <div
        className={`
        p-2.5 rounded-xl backdrop-blur-sm border shadow-sm
        ${
          isDarkMode
            ? "bg-gray-800/80 border-gray-700/50 text-purple-400 shadow-black/20"
            : "bg-white/80 border-gray-200/60 text-purple-600 shadow-gray-900/10"
        }
      `}
      >
        <Icon className="w-5 h-5" />
      </div>
      <h3
        className={`text-2xl font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}
      >
        {title}
      </h3>
    </div>
    {action && action}
  </div>
);
```

### Horizontal Scroll Container

```tsx
// Standard horizontal scrolling pattern
const HorizontalScrollContainer = ({ children }) => (
  <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-400/50 scrollbar-track-gray-100/50">
    <div className="flex gap-6 min-w-max">{children}</div>
  </div>
);
```

### Column/Card Pattern

```tsx
// Fixed-width columns for horizontal scrolling
const ScrollableColumn = ({ isDarkMode, width = "240px", children }) => (
  <div className={`${width} flex-shrink-0`}>{children}</div>
);
```

---

## Interaction Patterns ✅

### Hover Effects

```css
/* Subtle lift effect for interactive elements */
.hover-lift {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.hover-lift:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

/* Active state */
.hover-lift:active {
  transform: translateY(0);
}
```

### Button Interactions

```tsx
// Professional button with glassmorphic styling
const GlassButton = ({ isDarkMode, variant, children, ...props }) => {
  const baseClasses = `
    px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
    backdrop-blur-sm border shadow-lg hover:shadow-xl hover:-translate-y-0.5
  `;

  const variantClasses = variant === 'primary'
    ? isDarkMode
      ? "text-gray-400 hover:text-gray-200 bg-gray-800/70 hover:bg-gray-800/90 border-gray-700/50 shadow-black/20"
      : "text-gray-600 hover:text-gray-900 bg-white/70 hover:bg-white/90 border-gray-200/60 shadow-gray-900/10"
    : /* secondary styles */;

  return (
    <button className={`${baseClasses} ${variantClasses}`} {...props}>
      {children}
    </button>
  );
};
```

---

## Border Radius System ✅

```css
/* Implemented Border Radius Scale */
.rounded-lg {
  /* 8px - small components */
  border-radius: 0.5rem;
}

.rounded-xl {
  /* 12px - cards and buttons */
  border-radius: 0.75rem;
}

.rounded-2xl {
  /* 16px - major containers */
  border-radius: 1rem;
}

.rounded-3xl {
  /* 24px - large sections */
  border-radius: 1.5rem;
}
```

---

## Shadow System ✅

### Professional Shadow Hierarchy

```css
/* Light Mode Shadows */
.shadow-sm {
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.shadow-lg {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.shadow-xl {
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
}

.shadow-2xl {
  box-shadow: 0 16px 32px rgba(0, 0, 0, 0.2);
}

/* Dark Mode Shadows */
.dark .shadow-black/10 {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.dark .shadow-black/20 {
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

.dark .shadow-black/25 {
  box-shadow: 0 16px 32px rgba(0, 0, 0, 0.25);
}
```

---

## Responsive Breakpoints ✅

### Mobile-First Strategy

```css
/* Tailwind Breakpoints - Used in Implementation */
/* Default: Mobile (0px and up) */
@media (min-width: 640px) {
  /* sm: */
}
@media (min-width: 768px) {
  /* md: */
}
@media (min-width: 1024px) {
  /* lg: */
}
@media (min-width: 1280px) {
  /* xl: */
}
@media (min-width: 1536px) {
  /* 2xl: */
}
```

### Responsive Patterns

```tsx
// Example responsive implementation
const ResponsiveWidget = () => (
  <div
    className="
    w-full                    // Mobile: full width
    md:w-[240px]             // Desktop: fixed width
    flex-shrink-0            // Prevent shrinking in flex containers
    overflow-hidden          // Prevent content overflow
  "
  >
    <div
      className="
      max-h-[300px]          // Mobile: limited height
      md:max-h-[400px]       // Desktop: more height
      overflow-y-auto        // Vertical scroll when needed
      scrollbar-thin         // Custom scrollbar styling
    "
    >
      {content}
    </div>
  </div>
);
```

---

## Scrollbar Styling ✅

### Custom Scrollbar Implementation

```css
/* Implemented Scrollbar Styles */
.scrollbar-thin {
  scrollbar-width: thin;
}

.scrollbar-thumb-gray-400\/50::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.5);
  border-radius: 0.375rem;
}

.scrollbar-track-gray-100\/50::-webkit-scrollbar-track {
  background-color: rgba(243, 244, 246, 0.5);
}

/* Dark mode scrollbar */
.dark .scrollbar-thumb-gray-600\/50::-webkit-scrollbar-thumb {
  background-color: rgba(75, 85, 99, 0.5);
}

.dark .scrollbar-track-gray-800\/20::-webkit-scrollbar-track {
  background-color: rgba(31, 41, 55, 0.2);
}
```

---

## Animation Guidelines ✅

### Professional Transitions

```css
/* Standard transition timing */
.transition-all {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Micro-interactions */
.hover-translate {
  transition: transform 0.2s ease-out;
}

.hover-translate:hover {
  transform: translateY(-2px);
}

/* Focus states */
.focus-ring:focus {
  outline: 2px solid rgba(147, 51, 234, 0.5);
  outline-offset: 2px;
}
```

---

## Implementation Standards ✅

### Do's (Currently Implemented)

- ✅ Use backdrop-blur-xl for all major containers
- ✅ Implement horizontal scrolling for wide content
- ✅ Maintain 240px fixed width for scrollable columns
- ✅ Use consistent header patterns with icons
- ✅ Apply professional color palette throughout
- ✅ Include smooth hover transitions
- ✅ Support both dark and light modes seamlessly
- ✅ Use rounded-2xl for major containers
- ✅ Apply appropriate shadow hierarchy

### Don'ts (Successfully Avoided)

- ❌ Excessive scaling effects (hover:scale-105)
- ❌ Overly bright or saturated colors
- ❌ Inconsistent spacing patterns
- ❌ Heavy animations that impact performance
- ❌ Layouts that break on mobile devices
- ❌ Color-only information conveyance

---

## Current Component Examples ✅

### CalendarWidget Implementation

```tsx
// Professional calendar with horizontal scrolling
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
  <div className="p-6">
    <div className="overflow-x-auto scrollbar-thin">
      <div className="flex gap-4 min-w-max">
        {days.map((day) => (
          <div key={day} className="w-[200px] flex-shrink-0">
            {/* Day content */}
          </div>
        ))}
      </div>
    </div>
  </div>
</div>
```

### Kanban Column Implementation

```tsx
// Fixed-width column with vertical scrolling
<div className="w-[240px] flex-shrink-0 space-y-4">
  <div
    className={`
    min-h-[280px] max-h-[400px] overflow-y-auto scrollbar-thin 
    rounded-lg p-3 backdrop-blur-sm border
    ${
      isDarkMode
        ? "bg-gray-800/30 border-gray-700/40"
        : "bg-gray-50/80 border-gray-200/50"
    }
  `}
  >
    {tasks.map((task) => (
      <TaskCard key={task.id} task={task} isDarkMode={isDarkMode} />
    ))}
  </div>
</div>
```

---

This design system represents the current implementation state of Renko's professional glassmorphic aesthetic with horizontal scrolling patterns. All components follow these established patterns for consistency and maintainability.
