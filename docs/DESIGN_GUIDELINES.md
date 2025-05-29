# Renko Design Guidelines - Tailwind CSS

_Minimal • Focused • Elegant • Zen_

## Core Design Philosophy

- **Breath over clutter**: Every element has purpose and space
- **Subtle depth**: Gentle 3D touches without overwhelming
- **Glass morphism**: Translucent layers with soft blurs
- **Purposeful minimalism**: Clean but not sterile
- **Zen aesthetics**: Calming, focused, professional

---

## Tailwind Config Setup

```js
// tailwind.config.js
module.exports = {
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Light theme
        light: {
          canvas: "#FAFBFC",
          secondary: "#F5F7FA",
          tertiary: "#E8EDF5",
          glass: "#FFFFFF",
        },
        // Dark theme
        dark: {
          canvas: "#0F1116",
          secondary: "#1A1D29",
          tertiary: "#252A3A",
          glass: "#2D3347",
        },
        // Accent colors
        accent: {
          primary: "#5B7FFF",
          "primary-dark": "#6B8AFF",
          success: "#00D4AA",
          "success-dark": "#00E6C3",
          error: "#FF6B6B",
          "error-dark": "#FF7A7A",
          warning: "#FFB347",
          "warning-dark": "#FFC266",
        },
        // Text colors
        text: {
          primary: "#1A1D29",
          secondary: "#4A5568",
          tertiary: "#718096",
          "primary-dark": "#F7FAFC",
          "secondary-dark": "#CBD5E0",
          "tertiary-dark": "#A0AEC0",
        },
      },
      backdropBlur: {
        glass: "20px",
        "glass-subtle": "12px",
        "glass-strong": "32px",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
      },
      spacing: {
        18: "4.5rem",
        22: "5.5rem",
      },
      borderRadius: {
        glass: "16px",
        button: "12px",
      },
      boxShadow: {
        glass: "0 2px 8px rgba(0, 0, 0, 0.04)",
        "glass-hover": "0 4px 16px rgba(0, 0, 0, 0.08)",
        "glass-active": "0 8px 24px rgba(0, 0, 0, 0.12)",
        "glass-modal": "0 16px 48px rgba(0, 0, 0, 0.16)",
        button: "0 2px 8px rgba(91, 127, 255, 0.15)",
        "button-hover": "0 4px 16px rgba(91, 127, 255, 0.25)",
        "button-active": "0 1px 4px rgba(91, 127, 255, 0.3)",
      },
      transitionTimingFunction: {
        smooth: "cubic-bezier(0.4, 0, 0.2, 1)",
      },
    },
  },
};
```

---

## Custom CSS Classes

```css
/* Glass morphism utilities */
@layer utilities {
  .glass-primary {
    @apply bg-white/70 dark:bg-dark-glass/80 backdrop-blur-glass border border-white/20;
  }

  .glass-elevated {
    @apply bg-white/90 dark:bg-dark-glass/95 backdrop-blur-glass-strong border border-white/30 shadow-glass-modal;
  }

  .glass-subtle {
    @apply bg-white/40 dark:bg-dark-glass/50 backdrop-blur-glass-subtle border border-white/10;
  }

  /* 3D Touch effects */
  .touch-lift {
    @apply transition-all duration-200 ease-smooth;
  }

  .touch-lift:hover {
    @apply -translate-y-0.5 shadow-glass-hover;
  }

  .touch-lift:active {
    @apply translate-y-0 shadow-glass-active;
  }

  /* Button variants */
  .btn-primary {
    @apply glass-primary text-white bg-accent-primary/20 dark:bg-accent-primary-dark/20 
           px-5 py-3 rounded-button shadow-button touch-lift
           hover:shadow-button-hover active:shadow-button-active;
  }

  .btn-secondary {
    @apply glass-subtle text-accent-primary dark:text-accent-primary-dark
           px-5 py-3 rounded-button border border-accent-primary/30
           hover:glass-primary;
  }
}
```

---

## Typography Classes

```css
/* Typography utilities */
.text-h1 {
  @apply text-3xl font-semibold tracking-tight leading-tight;
}
.text-h2 {
  @apply text-2xl font-semibold tracking-tight leading-tight;
}
.text-h3 {
  @apply text-xl font-medium tracking-tight leading-tight;
}
.text-body {
  @apply text-base font-normal leading-relaxed;
}
.text-caption {
  @apply text-sm font-normal tracking-wide leading-normal;
}
.text-small {
  @apply text-xs font-medium tracking-wider leading-normal;
}

/* Text color utilities */
.text-primary {
  @apply text-text-primary dark:text-text-primary-dark;
}
.text-secondary {
  @apply text-text-secondary dark:text-text-secondary-dark;
}
.text-tertiary {
  @apply text-text-tertiary dark:text-text-tertiary-dark;
}
```

---

## Component Examples

### Card Component

```jsx
<div className="glass-primary rounded-glass p-5 touch-lift">
  <h3 className="text-h3 text-primary mb-4">Task Title</h3>
  <p className="text-body text-secondary">Task description...</p>
</div>
```

### Button Components

```jsx
<!-- Primary Button -->
<button className="btn-primary">
  Complete Task
</button>

<!-- Secondary Button -->
<button className="btn-secondary">
  Edit Task
</button>

<!-- Icon Button -->
<button className="glass-primary p-3 rounded-button touch-lift">
  <Icon className="w-5 h-5 text-primary" />
</button>
```

### Form Field

```jsx
<input
  className="glass-primary w-full p-4 rounded-glass border-0 
             text-primary placeholder:text-tertiary
             focus:ring-2 focus:ring-accent-primary/30 focus:outline-none
             transition-all duration-200"
  placeholder="Enter task name..."
/>
```

---

## Layout Classes

```css
/* Container utilities */
.container-main {
  @apply max-w-6xl mx-auto px-5 py-8;
}

.container-card {
  @apply glass-primary rounded-glass p-5 mb-6;
}

/* Grid utilities */
.grid-main {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6;
}

.grid-sidebar {
  @apply grid grid-cols-1 lg:grid-cols-4 gap-6;
}

/* Flex utilities */
.flex-between {
  @apply flex items-center justify-between;
}

.flex-center {
  @apply flex items-center justify-center;
}
```

---

## Theme Background Classes

```css
/* Background utilities */
.bg-canvas {
  @apply bg-light-canvas dark:bg-dark-canvas;
}

.bg-secondary {
  @apply bg-light-secondary dark:bg-dark-secondary;
}

.bg-tertiary {
  @apply bg-light-tertiary dark:bg-dark-tertiary;
}
```

---

## Common Patterns

### Navigation Bar

```jsx
<nav className="glass-primary sticky top-0 z-50 px-6 py-4">
  <div className="flex-between max-w-6xl mx-auto">
    <div className="text-h3 text-primary">Renko</div>
    <div className="flex items-center space-x-4">{/* Nav items */}</div>
  </div>
</nav>
```

### Sidebar

```jsx
<aside className="w-64 h-screen glass-subtle p-6">
  <div className="space-y-4">{/* Sidebar content */}</div>
</aside>
```

### Modal

```jsx
<div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex-center z-50">
  <div className="glass-elevated rounded-glass p-8 max-w-md w-full mx-4">
    <h2 className="text-h2 text-primary mb-6">Modal Title</h2>
    {/* Modal content */}
  </div>
</div>
```

### Kanban Card

```jsx
<div className="glass-primary rounded-glass p-4 touch-lift cursor-pointer">
  <div className="flex-between mb-3">
    <span className="text-small text-tertiary uppercase tracking-wider">
      In Progress
    </span>
    <div className="w-3 h-3 rounded-full bg-accent-primary"></div>
  </div>
  <h4 className="text-body text-primary font-medium mb-2">
    Design new feature
  </h4>
  <p className="text-caption text-secondary mb-4">
    Create wireframes and prototypes
  </p>
  <div className="flex items-center space-x-2">
    <img className="w-6 h-6 rounded-full" src="avatar.jpg" alt="User" />
    <span className="text-small text-tertiary">Due: Tomorrow</span>
  </div>
</div>
```

### Task List Item

```jsx
<div className="glass-subtle rounded-glass p-4 mb-3 touch-lift hover:glass-primary">
  <div className="flex items-start space-x-3">
    <input
      type="checkbox"
      className="mt-1 w-4 h-4 text-accent-primary rounded border-gray-300 
                 focus:ring-accent-primary/30"
    />
    <div className="flex-1 min-w-0">
      <p className="text-body text-primary font-medium">
        Complete project documentation
      </p>
      <p className="text-caption text-secondary mt-1">
        Marketing Project • Due: May 30
      </p>
    </div>
    <button className="p-1 text-tertiary hover:text-primary">
      <Icon className="w-4 h-4" />
    </button>
  </div>
</div>
```

---

## Animation Classes

```css
/* Animation utilities */
.animate-fade-in {
  @apply animate-in fade-in duration-300;
}

.animate-slide-up {
  @apply animate-in slide-in-from-bottom-4 duration-300;
}

.animate-slide-down {
  @apply animate-in slide-in-from-top-4 duration-300;
}

.animate-scale-in {
  @apply animate-in zoom-in-95 duration-200;
}

/* Hover animations */
.hover-lift {
  @apply transition-transform duration-200 hover:-translate-y-0.5;
}

.hover-glow {
  @apply transition-all duration-200 hover:shadow-glass-hover;
}
```

---

## Responsive Spacing

```css
/* Responsive padding utilities */
.p-responsive {
  @apply p-4 md:p-6 lg:p-8;
}

.px-responsive {
  @apply px-4 md:px-6 lg:px-8;
}

.py-responsive {
  @apply py-4 md:py-6 lg:py-8;
}

/* Container responsive */
.container-responsive {
  @apply px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto;
}
```

---

## Dark Mode Toggle

```jsx
// Theme toggle component
<button
  onClick={toggleTheme}
  className="glass-primary p-3 rounded-button touch-lift"
>
  {theme === "dark" ? (
    <SunIcon className="w-5 h-5 text-primary" />
  ) : (
    <MoonIcon className="w-5 h-5 text-primary" />
  )}
</button>
```

---

## Implementation Tips

### 1. Theme Setup

```jsx
// In your root component
<html className={theme}>
  <body className="bg-canvas text-primary">{/* Your app */}</body>
</html>
```

### 2. Glass Effect Performance

```css
/* Only apply backdrop-filter when needed */
@supports (backdrop-filter: blur(20px)) {
  .glass-primary {
    backdrop-filter: blur(20px);
  }
}

/* Fallback for non-supporting browsers */
@supports not (backdrop-filter: blur(20px)) {
  .glass-primary {
    @apply bg-white/90 dark:bg-dark-glass/90;
  }
}
```

### 3. Focus Management

```css
/* Custom focus styles */
.focus-ring {
  @apply focus:outline-none focus:ring-2 focus:ring-accent-primary/30 focus:ring-offset-2 focus:ring-offset-canvas;
}
```

---

_This design system creates a cohesive, zen-like experience that feels both modern and timeless, professional yet approachable._
