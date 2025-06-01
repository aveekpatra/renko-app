import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["'Geist'", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["'Geist Mono'", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      colors: {
        // Zen-inspired color palette
        canvas: {
          DEFAULT: "hsl(var(--canvas))",
        },
        text: {
          primary: "hsl(var(--text-primary))",
          secondary: "hsl(var(--text-secondary))",
          tertiary: "hsl(var(--text-tertiary))",
        },
        accent: {
          primary: "hsl(var(--accent-primary))",
          secondary: "hsl(var(--accent-secondary))",
          success: "hsl(var(--accent-success))",
          warning: "hsl(var(--accent-warning))",
          error: "hsl(var(--accent-error))",
        },
      },
    },
  },
  plugins: [],
};

export default config;
 