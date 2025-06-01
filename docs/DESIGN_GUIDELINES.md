# 🎨 Design System - Quick Reference

**For AI Development**: Essential design patterns and Tailwind classes for consistent UI.

## 🎯 **DESIGN PHILOSOPHY**

- **Professional glassmorphic** design for business use
- **Horizontal scrolling** layout patterns
- **Dark/light mode** with purple accent (#9333ea)
- **Mobile-first** responsive design

## 🌈 **COLOR SYSTEM**

### **Theme Classes**

```typescript
// Use in components
const { isDarkMode } = useTheme();
const bgClass = isDarkMode
  ? "bg-gray-900/60 border-gray-800/60"
  : "bg-white/90 border-gray-200/60";
```

### **Core Colors**

```css
/* Dark Mode */
--bg-primary: rgba(17, 24, 39, 0.6); /* gray-900/60 */
--bg-secondary: rgba(31, 41, 55, 0.8); /* gray-800/80 */
--border: rgba(75, 85, 99, 0.6); /* gray-600/60 */
--text-primary: white;
--text-secondary: rgba(156, 163, 175, 1); /* gray-400 */
--accent: rgba(147, 51, 234, 1); /* purple-600 */

/* Light Mode */
--bg-primary: rgba(255, 255, 255, 0.9); /* white/90 */
--bg-secondary: rgba(249, 250, 251, 0.8); /* gray-50/80 */
--border: rgba(229, 231, 235, 0.6); /* gray-200/60 */
--text-primary: rgba(17, 24, 39, 1); /* gray-900 */
--text-secondary: rgba(107, 114, 128, 1); /* gray-500 */
--accent: rgba(147, 51, 234, 1); /* purple-600 */
```

### **Priority Colors**

```typescript
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

## 📝 **TYPOGRAPHY**

```css
/* Standard Text Sizes */
.text-2xl  /* 24px, font-medium - Headers */
.text-xl   /* 20px, font-semibold - Sub-headers */
.text-lg   /* 18px, font-medium - Large text */
.text-base /* 16px, font-normal - Body text */
.text-sm   /* 14px, font-medium - Secondary */
.text-xs   /* 12px, font-medium - Small text */
```

## 📐 **SPACING**

```css
/* 4px Grid System */
--space-2: 0.5rem; /* 8px - p-2 */
--space-3: 0.75rem; /* 12px - p-3 */
--space-4: 1rem; /* 16px - p-4 */
--space-6: 1.5rem; /* 24px - p-6 */
--space-8: 2rem; /* 32px - p-8 */
```

## 🧩 **COMPONENT PATTERNS**

### **1. Glassmorphic Container**

```typescript
<div className={`
  rounded-2xl backdrop-blur-xl border shadow-2xl p-6
  ${isDarkMode
    ? "bg-gray-900/60 border-gray-800/60 shadow-black/25"
    : "bg-white/90 border-gray-200/60 shadow-gray-900/15"
  }
`}>
  {children}
</div>
```

### **2. Widget Header**

```typescript
<div className="flex items-center justify-between mb-8">
  <div className="flex items-center space-x-4">
    <div className={`p-2.5 rounded-xl backdrop-blur-sm border shadow-sm ${
      isDarkMode
        ? "bg-gray-800/80 border-gray-700/50 text-purple-400"
        : "bg-white/80 border-gray-200/60 text-purple-600"
    }`}>
      <Icon className="w-5 h-5" />
    </div>
    <h3 className={`text-2xl font-medium ${
      isDarkMode ? "text-white" : "text-gray-900"
    }`}>
      {title}
    </h3>
  </div>
  {children}
</div>
```

### **3. Horizontal Scroll Container**

```typescript
<div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-400/50">
  <div className="flex gap-6 min-w-max">
    <div className="w-[240px] flex-shrink-0 space-y-4">
      {/* Column content */}
    </div>
  </div>
</div>
```

### **4. Task Card**

```typescript
<div className={`p-3 rounded-xl cursor-pointer transition-all duration-200 backdrop-blur-sm border shadow-md ${
  isDarkMode
    ? "bg-gray-800/50 border-gray-700/50 shadow-black/20"
    : "bg-white/80 border-gray-200/60 shadow-gray-900/10"
}`}>
  {/* Task header */}
  <div className="flex items-start justify-between mb-2">
    <span className="font-medium text-sm leading-tight flex-1">
      {task.title}
    </span>
    <div className="flex flex-col items-end space-y-0.5 flex-shrink-0 ml-2">
      <span className="text-xs opacity-75 font-medium">
        {task.dueTime}
      </span>
      <span className="text-xs opacity-60">
        {task.timeEstimate}
      </span>
    </div>
  </div>

  {/* Task description */}
  <p className="text-xs opacity-75 mb-2 leading-relaxed">
    {task.description}
  </p>

  {/* Task tags */}
  <div className="flex items-center justify-between">
    <ProjectTag isDarkMode={isDarkMode} project={task.project} />
    <PriorityTag isDarkMode={isDarkMode} priority={task.priority} />
  </div>
</div>
```

### **5. Tag Components**

```typescript
// Project Tag
const ProjectTag = ({ isDarkMode, project }) => (
  <span className={`text-xs px-2 py-1 rounded-lg font-medium backdrop-blur-sm border ${
    isDarkMode
      ? "bg-gray-700/50 text-gray-300 border-gray-600/50"
      : "bg-white/80 text-gray-600 border-gray-300/60"
  }`}>
    {project}
  </span>
);

// Priority Tag
const PriorityTag = ({ isDarkMode, priority }) => (
  <span className={`text-xs px-2 py-1 rounded-lg font-medium backdrop-blur-sm border ${
    priorityClasses[priority]
  }`}>
    {priority}
  </span>
);
```

## 📱 **RESPONSIVE PATTERNS**

### **Mobile Layout**

```typescript
// Sidebar: collapsible on mobile
<div className="lg:w-64 lg:flex-shrink-0">
  <div className="hidden lg:flex lg:flex-col">
    {/* Desktop sidebar */}
  </div>
</div>

// Main content: full width on mobile
<div className="flex-1 min-w-0">
  <div className="p-4 lg:p-6">
    {/* Content */}
  </div>
</div>
```

### **Touch Targets**

```css
/* Minimum 44px touch targets */
.touch-target {
  min-height: 44px;
  min-width: 44px;
  padding: 12px; /* p-3 */
}
```

## 🎛️ **THEME USAGE**

### **Theme Hook**

```typescript
import { useTheme } from "@/components/AppLayout";

const { isDarkMode, toggleTheme } = useTheme();
```

### **Common Theme Classes**

```typescript
const themeClasses = {
  text: {
    primary: isDarkMode ? "text-gray-100" : "text-gray-900",
    secondary: isDarkMode ? "text-gray-300" : "text-gray-700",
    tertiary: isDarkMode ? "text-gray-400" : "text-gray-600",
  },
  bg: {
    primary: isDarkMode ? "bg-gray-900/60" : "bg-white/90",
    secondary: isDarkMode ? "bg-gray-800/80" : "bg-gray-50/80",
  },
  border: isDarkMode ? "border-gray-700/60" : "border-gray-200/60",
  shadow: isDarkMode ? "shadow-black/25" : "shadow-gray-900/15",
};
```

## 📏 **LAYOUT GUIDELINES**

### **Fixed Widths**

- **Sidebar**: `w-64` (256px)
- **Widget columns**: `w-[240px]`
- **Cards**: Full width within column

### **Standard Spacing**

- **Container padding**: `p-6` (24px)
- **Card padding**: `p-3` (12px)
- **Section gaps**: `gap-6` (24px)
- **Card spacing**: `space-y-4` (16px)

### **Border Radius**

- **Containers**: `rounded-2xl`
- **Cards**: `rounded-xl`
- **Tags**: `rounded-lg`
- **Buttons**: `rounded-md`

This design system ensures consistency across all components while maintaining the professional glassmorphic aesthetic.
