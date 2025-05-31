"use client";

import React, { useState, useEffect, createContext, useContext } from "react";
import { Authenticated, Unauthenticated } from "convex/react";
import Sidebar from "./Sidebar";

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
  }, [isResizing]);

  if (!isHydrated) {
    return (
      <div className="h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center">
        <div className="text-xl font-medium text-gray-700">Loading...</div>
      </div>
    );
  }

  const themeClasses = {
    container: isDarkMode
      ? "h-screen bg-gradient-to-br from-gray-900 to-slate-900 flex overflow-hidden"
      : "h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex overflow-hidden",
    fullScreen: isDarkMode
      ? "h-screen bg-gradient-to-br from-gray-900 to-slate-900"
      : "h-screen bg-gradient-to-br from-purple-50 to-indigo-100",
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, setIsDarkMode }}>
      <Authenticated>
        {/* Authenticated Layout with Sidebar */}
        <div className={themeClasses.container}>
          <Sidebar
            sidebarWidth={sidebarWidth}
            isDarkMode={isDarkMode}
            setIsDarkMode={setIsDarkMode}
            handleMouseDown={handleMouseDown}
          />
          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
      </Authenticated>

      <Unauthenticated>
        {/* Unauthenticated Layout without Sidebar */}
        <div className={themeClasses.fullScreen}>{children}</div>
      </Unauthenticated>
    </ThemeContext.Provider>
  );
}
