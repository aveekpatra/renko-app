"use client";

import React, { useState, useEffect, createContext, useContext } from "react";
import { usePathname } from "next/navigation";
import { Authenticated, Unauthenticated } from "convex/react";
import Sidebar from "./Sidebar";
import Header from "./Header";

interface ThemeContextType {
  isDarkMode: boolean;
  setIsDarkMode: (darkMode: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within AppLayout");
  }
  return context;
};

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [sidebarWidth, setSidebarWidth] = useState(280);
  const [isResizing, setIsResizing] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const pathname = usePathname();

  // Prevent hydration mismatch and load saved preferences
  useEffect(() => {
    setIsHydrated(true);
    const savedTheme = localStorage.getItem("darkMode");
    if (savedTheme) {
      setIsDarkMode(JSON.parse(savedTheme));
    }
  }, []);

  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem("darkMode", JSON.stringify(isDarkMode));
    }
  }, [isDarkMode, isHydrated]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsResizing(true);
    e.preventDefault();
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing) return;
    const newWidth = e.clientX;
    if (newWidth >= 200 && newWidth <= 400) {
      setSidebarWidth(newWidth);
    }
  };

  const handleMouseUp = () => {
    setIsResizing(false);
  };

  React.useEffect(() => {
    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isResizing]);

  if (!isHydrated) {
    return (
      <div
        className={`h-screen flex items-center justify-center ${
          isDarkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"
        }`}
      >
        <div className="text-xl font-medium">Loading...</div>
      </div>
    );
  }

  const themeClasses = {
    container: isDarkMode
      ? "h-screen bg-gray-900 flex overflow-hidden"
      : "h-screen bg-gray-50 flex overflow-hidden",
    fullScreen: isDarkMode ? "h-screen bg-gray-900" : "h-screen bg-gray-50",
  };

  // Function to handle task creation - only available on certain pages
  const handleCreateTask = () => {
    // This will be handled by the individual page components
    // For now, we'll just trigger a custom event that pages can listen to
    window.dispatchEvent(new CustomEvent("createTask"));
  };

  // Only show create task button on specific pages
  const showCreateTaskButton = pathname === "/" || pathname === "/boards";

  return (
    <ThemeContext.Provider value={{ isDarkMode, setIsDarkMode }}>
      <Authenticated>
        {/* Authenticated Layout with Header, Sidebar, and Main Content with gaps */}
        <div
          className={`h-screen p-1 ${isDarkMode ? "bg-slate-800" : "bg-slate-100"}`}
        >
          <div className="h-full flex flex-col gap-1 overflow-hidden">
            {/* Header spans full width at top */}
            <Header
              onCreateTask={showCreateTaskButton ? handleCreateTask : undefined}
              className="flex-shrink-0 rounded-lg"
            />

            {/* Content area with sidebar and main content */}
            <div className="flex flex-1 gap-1 overflow-hidden">
              {/* Sidebar */}
              <Sidebar
                sidebarWidth={sidebarWidth}
                isDarkMode={isDarkMode}
                setIsDarkMode={setIsDarkMode}
                handleMouseDown={handleMouseDown}
                className="flex-shrink-0 rounded-lg"
              />

              {/* Main content area */}
              <main className="flex-1 overflow-y-auto rounded-tl-lg">
                {children}
              </main>
            </div>
          </div>
        </div>
      </Authenticated>

      <Unauthenticated>
        {/* Unauthenticated Layout without Sidebar or Header */}
        <div className={themeClasses.fullScreen}>{children}</div>
      </Unauthenticated>
    </ThemeContext.Provider>
  );
}
