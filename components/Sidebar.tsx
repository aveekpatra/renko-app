"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Calendar,
  Settings,
  Sparkles,
  GripVertical,
  Moon,
  Sun,
  ChevronLeft,
  ChevronRight,
  Inbox,
  List,
  Tag,
  Activity,
} from "lucide-react";

// Mock data for boards
const mockBoards = [
  {
    _id: "board_1",
    name: "Product Development",
    description: "Main product roadmap and features",
    taskCount: 12,
    completedCount: 7,
  },
  {
    _id: "board_2",
    name: "Marketing Campaign",
    description: "Q4 marketing initiatives",
    taskCount: 8,
    completedCount: 3,
  },
];

const primaryNavItems = [
  { icon: Inbox, label: "Inbox", href: "/" },
  { icon: Calendar, label: "Today", href: "/today", badge: "17" },
  { icon: List, label: "Upcoming", href: "/upcoming" },
  { icon: Tag, label: "All tasks", href: "/boards" },
  { icon: Calendar, label: "Google Calendar", href: "/google-calendar" },
];

// Commented out for now
// const secondaryNavItems = [
//   { icon: FolderKanban, label: "Projects", href: "/boards" },
//   { icon: Calendar, label: "Calendar", href: "/calendar" },
//   { icon: Target, label: "Habits", href: "/habits" },
// ];

interface SidebarProps {
  sidebarWidth: number;
  isDarkMode: boolean;
  setIsDarkMode: (darkMode: boolean) => void;
  handleMouseDown: (e: React.MouseEvent) => void;
  className?: string;
}

export default function Sidebar({
  sidebarWidth,
  isDarkMode,
  setIsDarkMode,
  handleMouseDown,
  className = "",
}: SidebarProps) {
  const pathname = usePathname();

  // Manage sidebar collapsed state internally with localStorage persistence
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Handle hydration and localStorage loading
  useEffect(() => {
    setIsHydrated(true);
    const savedSidebarState = localStorage.getItem("mainSidebarCollapsed");
    if (savedSidebarState) {
      const parsedState = JSON.parse(savedSidebarState);
      setIsCollapsed(parsedState);
    }
  }, []);

  // Save to localStorage only after hydration
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem("mainSidebarCollapsed", JSON.stringify(isCollapsed));
    }
  }, [isCollapsed, isHydrated]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  // These are commented out but kept for future use
  // const toggleUserDropdown = () => {
  //   setIsUserDropdownOpen(!isUserDropdownOpen);
  // };

  // const handleSettings = () => {
  //   setIsUserDropdownOpen(false);
  // };

  // Use the hydrated collapsed state, defaulting to expanded for SSR
  const currentSidebarWidth = isHydrated && isCollapsed ? 60 : sidebarWidth;

  // Theme classes - more minimal design
  const themeClasses = {
    sidebar: isDarkMode
      ? "bg-gray-950/95 border-r border-gray-800/50 text-gray-100 flex flex-col h-full relative"
      : "bg-gray-50/95 border-r border-gray-200/50 text-gray-900 flex flex-col h-full relative",
    text: {
      primary: isDarkMode ? "text-gray-100" : "text-gray-900",
      secondary: isDarkMode ? "text-gray-400" : "text-gray-600",
      tertiary: isDarkMode ? "text-gray-500" : "text-gray-500",
    },
  };

  return (
    <aside
      className={`${themeClasses.sidebar} ${className}`}
      style={{ width: currentSidebarWidth }}
    >
      {/* Header - Very minimal */}
      {!(isHydrated && isCollapsed) && (
        <div className="px-4 py-3 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-sm font-semibold">Renko</span>
            </div>
            <div className="flex items-center space-x-1">
              <button
                onClick={toggleTheme}
                className={`p-1 rounded-md transition-colors ${
                  isDarkMode
                    ? "hover:bg-gray-800/50 text-gray-500 hover:text-gray-300"
                    : "hover:bg-gray-200/50 text-gray-500 hover:text-gray-700"
                }`}
              >
                {isDarkMode ? (
                  <Sun className="w-3.5 h-3.5" />
                ) : (
                  <Moon className="w-3.5 h-3.5" />
                )}
              </button>
              <button
                onClick={toggleSidebar}
                className={`p-1 rounded-md transition-colors ${
                  isDarkMode
                    ? "hover:bg-gray-800/50 text-gray-500 hover:text-gray-300"
                    : "hover:bg-gray-200/50 text-gray-500 hover:text-gray-700"
                }`}
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Navigation - Compact */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-3 py-2 space-y-1">
          {primaryNavItems.map((item) => (
            <SidebarItem
              key={item.label}
              icon={item.icon}
              label={item.label}
              href={item.href}
              badge={item.badge}
              active={pathname === item.href}
              isCollapsed={isHydrated && isCollapsed}
              isDarkMode={isDarkMode}
            />
          ))}
        </div>

        {/* Projects Section - Minimal */}
        {!(isHydrated && isCollapsed) && (
          <div className="px-3 mt-6">
            <div className="flex items-center justify-between mb-2 px-2">
              <span
                className={`text-xs font-medium uppercase tracking-wide ${themeClasses.text.secondary}`}
              >
                Projects
              </span>
            </div>
            {mockBoards.length === 0 ? (
              <div className="px-2 py-6 text-center">
                <p className={`text-xs ${themeClasses.text.tertiary}`}>
                  Create Projects to
                  <br />
                  release the stats
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {mockBoards.map((board) => (
                  <ProjectItem
                    key={board._id}
                    board={board}
                    isDarkMode={isDarkMode}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tags Section - Minimal */}
        {!(isHydrated && isCollapsed) && (
          <div className="px-3 mt-6">
            <div className="flex items-center justify-between mb-2 px-2">
              <span
                className={`text-xs font-medium uppercase tracking-wide ${themeClasses.text.secondary}`}
              >
                Tags
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Expand Button for collapsed state */}
      {isHydrated && isCollapsed && (
        <div className="p-2 flex-shrink-0">
          <button
            onClick={toggleSidebar}
            className={`w-full p-2 rounded-lg transition-colors flex items-center justify-center ${
              isDarkMode
                ? "hover:bg-gray-800/50 text-gray-500 hover:text-gray-300"
                : "hover:bg-gray-200/50 text-gray-500 hover:text-gray-700"
            }`}
            title="Expand sidebar"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Footer Section - Minimal */}
      {!(isHydrated && isCollapsed) && (
        <div className="flex-shrink-0 px-3 py-2 space-y-1">
          <SidebarItem
            icon={Activity}
            label="Statistics"
            href="/statistics"
            active={pathname === "/statistics"}
            isCollapsed={false}
            isDarkMode={isDarkMode}
          />
          <SidebarItem
            icon={Settings}
            label="Shutdown"
            href="/shutdown"
            active={pathname === "/shutdown"}
            isCollapsed={false}
            isDarkMode={isDarkMode}
          />
        </div>
      )}

      {/* Resize Handle */}
      {!(isHydrated && isCollapsed) && (
        <div
          className={`absolute top-0 right-0 w-1 h-full cursor-ew-resize group transition-colors ${
            isDarkMode ? "hover:bg-blue-400/40" : "hover:bg-blue-500/40"
          }`}
          onMouseDown={handleMouseDown}
        >
          <div className="absolute top-1/2 -translate-y-1/2 -right-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <GripVertical className={`w-4 h-4 ${themeClasses.text.tertiary}`} />
          </div>
        </div>
      )}
    </aside>
  );
}

interface SidebarItemProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href: string;
  badge?: string;
  active?: boolean;
  isCollapsed: boolean;
  isDarkMode: boolean;
}

function SidebarItem({
  icon: Icon,
  label,
  href,
  badge,
  active,
  isCollapsed,
  isDarkMode,
}: SidebarItemProps) {
  return (
    <Link
      href={href}
      className={`w-full flex items-center ${isCollapsed ? "justify-center px-2 py-2" : "justify-between px-2 py-1.5"} rounded-md transition-all duration-200 group ${
        active
          ? isDarkMode
            ? "bg-gray-800/60 text-gray-100"
            : "bg-gray-200/60 text-gray-900"
          : isDarkMode
            ? "text-gray-400 hover:text-gray-200 hover:bg-gray-800/30"
            : "text-gray-600 hover:text-gray-900 hover:bg-gray-200/30"
      }`}
    >
      <div className="flex items-center space-x-2">
        <Icon className="w-4 h-4 flex-shrink-0" />
        {!isCollapsed && <span className="text-sm font-medium">{label}</span>}
      </div>
      {!isCollapsed && badge && (
        <span
          className={`text-xs px-1.5 py-0.5 rounded ${
            isDarkMode
              ? "bg-gray-800 text-gray-300"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          {badge}
        </span>
      )}
    </Link>
  );
}

interface ProjectItemProps {
  board: (typeof mockBoards)[0];
  isDarkMode: boolean;
}

function ProjectItem({ board, isDarkMode }: ProjectItemProps) {
  return (
    <button
      className={`w-full flex items-center space-x-2 px-2 py-1.5 rounded-md transition-all duration-200 group ${
        isDarkMode
          ? "text-gray-400 hover:text-gray-200 hover:bg-gray-800/30"
          : "text-gray-600 hover:text-gray-900 hover:bg-gray-200/30"
      }`}
    >
      <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
      <span className="text-sm font-medium truncate">{board.name}</span>
    </button>
  );
}
