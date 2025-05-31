"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Plus,
  Calendar,
  FolderKanban,
  FileText,
  Settings,
  Search,
  Home as HomeIcon,
  BarChart3,
  Sparkles,
  GripVertical,
  Moon,
  Sun,
  ChevronLeft,
  ChevronRight,
  Folder,
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
  {
    _id: "board_3",
    name: "Design System",
    description: "UI/UX design components",
    taskCount: 15,
    completedCount: 10,
  },
];

const navigationItems = [
  { icon: HomeIcon, label: "Dashboard", href: "/" },
  { icon: Folder, label: "Projects", href: "/projects" },
  { icon: FolderKanban, label: "Boards", href: "/boards" },
  { icon: Calendar, label: "Calendar", href: "/calendar" },
  { icon: FileText, label: "Notes", href: "/notes" },
  { icon: BarChart3, label: "Analytics", href: "/analytics" },
];

interface SidebarProps {
  sidebarWidth: number;
  isDarkMode: boolean;
  setIsDarkMode: (darkMode: boolean) => void;
  handleMouseDown: (e: React.MouseEvent) => void;
}

export default function Sidebar({
  sidebarWidth,
  isDarkMode,
  setIsDarkMode,
  handleMouseDown,
}: SidebarProps) {
  const pathname = usePathname();

  // Manage sidebar collapsed state internally with localStorage persistence
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
    const savedSidebarState = localStorage.getItem("mainSidebarCollapsed");
    if (savedSidebarState) {
      setIsCollapsed(JSON.parse(savedSidebarState));
    }
  }, []);

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

  const currentSidebarWidth = isCollapsed ? 80 : sidebarWidth;

  // Theme classes
  const themeClasses = {
    sidebar: isDarkMode
      ? "bg-gray-800/90 backdrop-blur-xl border-r border-gray-700/50 text-gray-100 flex flex-col shadow-xl shadow-black/20 h-full relative"
      : "bg-white/50 backdrop-blur-xl border-r border-white/40 text-gray-800 flex flex-col shadow-xl shadow-gray-900/10 h-full relative",
    sidebarSection: isDarkMode
      ? "bg-gradient-to-r from-gray-700/20 to-gray-800/10"
      : "bg-gradient-to-r from-white/20 to-white/10",
    text: {
      primary: isDarkMode ? "text-gray-100" : "text-gray-800",
      secondary: isDarkMode ? "text-gray-300" : "text-gray-700",
      tertiary: isDarkMode ? "text-gray-400" : "text-gray-600",
    },
    search: isDarkMode
      ? "w-full pl-10 pr-4 py-2.5 bg-gray-700/70 backdrop-blur-md border border-gray-600/60 rounded-xl text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400/50 focus:bg-gray-700/80 transition-all duration-200 shadow-sm shadow-black/10 hover:shadow-md hover:shadow-black/20"
      : "w-full pl-10 pr-4 py-2.5 bg-white/70 backdrop-blur-md border border-white/60 rounded-xl text-gray-800 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-300/50 focus:bg-white/80 transition-all duration-200 shadow-sm shadow-gray-900/5 hover:shadow-md hover:shadow-gray-900/10",
  };

  return (
    <aside
      className={themeClasses.sidebar}
      style={{ width: currentSidebarWidth }}
    >
      {/* Logo Section */}
      <div
        className={`p-5 border-b ${isDarkMode ? "border-gray-700/50" : "border-white/30"} flex-shrink-0 ${themeClasses.sidebarSection}`}
      >
        <div className="flex items-center justify-between">
          <div
            className={`flex items-center space-x-3 ${isCollapsed ? "justify-center" : ""}`}
          >
            <div className="w-9 h-9 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 transition-all duration-300">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            {!isCollapsed && (
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-purple-700 to-indigo-700 bg-clip-text text-transparent">
                  Renko
                </h1>
                <p
                  className={`text-sm font-medium ${themeClasses.text.secondary}`}
                >
                  Productivity Suite
                </p>
              </div>
            )}
          </div>
          {!isCollapsed && (
            <div className="flex items-center space-x-2">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-lg transition-all duration-200 hover:shadow-sm ${
                  isDarkMode
                    ? "hover:bg-gray-700/50 text-gray-400 hover:text-gray-200"
                    : "hover:bg-white/60 text-gray-600 hover:text-gray-800"
                }`}
              >
                {isDarkMode ? (
                  <Sun className="w-4 h-4" />
                ) : (
                  <Moon className="w-4 h-4" />
                )}
              </button>

              {/* Collapse Button */}
              <button
                onClick={toggleSidebar}
                className={`p-2 rounded-lg transition-all duration-200 hover:shadow-sm ${
                  isDarkMode
                    ? "hover:bg-gray-700/50 text-gray-400 hover:text-gray-200"
                    : "hover:bg-white/60 text-gray-600 hover:text-gray-800"
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          )}
          {isCollapsed && (
            <div className="flex items-center justify-center">
              {/* Collapse Button for collapsed state */}
              <button
                onClick={toggleSidebar}
                className={`p-2 rounded-lg transition-all duration-200 hover:shadow-sm ${
                  isDarkMode
                    ? "hover:bg-gray-700/50 text-gray-400 hover:text-gray-200"
                    : "hover:bg-white/60 text-gray-600 hover:text-gray-800"
                }`}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Search Section */}
      <div className="p-4 flex-shrink-0">
        {!isCollapsed && (
          <div className="relative">
            <Search
              className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 z-10 ${themeClasses.text.tertiary}`}
            />
            <input
              type="text"
              placeholder="Search..."
              className={themeClasses.search}
            />
          </div>
        )}
      </div>

      {/* Navigation - Scrollable */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="space-y-1">
          {navigationItems.map((item) => (
            <SidebarItem
              key={item.label}
              icon={item.icon}
              label={item.label}
              href={item.href}
              active={pathname === item.href}
              isCollapsed={isCollapsed}
              isDarkMode={isDarkMode}
            />
          ))}
        </div>

        {/* Projects Section */}
        {!isCollapsed && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-3">
              <h3
                className={`text-xs font-bold uppercase tracking-wider ${themeClasses.text.secondary}`}
              >
                Recent Projects
              </h3>
              <button
                className={`p-1.5 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md ${
                  isDarkMode
                    ? "hover:bg-gray-700/50 shadow-black/10 hover:shadow-black/20"
                    : "hover:bg-white/60 shadow-gray-900/5 hover:shadow-gray-900/10"
                }`}
              >
                <Plus className={`w-3 h-3 ${themeClasses.text.tertiary}`} />
              </button>
            </div>
            <div className="space-y-1">
              {mockBoards.slice(0, 3).map((board) => (
                <ProjectItem
                  key={board._id}
                  board={board}
                  isDarkMode={isDarkMode}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* User Profile - Fixed at bottom */}
      <div
        className={`p-4 border-t ${isDarkMode ? "border-gray-700/50" : "border-white/30"} flex-shrink-0 ${themeClasses.sidebarSection}`}
      >
        <div
          className={`flex items-center ${isCollapsed ? "justify-center" : "space-x-3"} p-3 rounded-xl transition-all duration-200 cursor-pointer group ${
            isDarkMode
              ? "hover:bg-gray-700/50 shadow-sm hover:shadow-lg shadow-black/10 hover:shadow-black/20"
              : "hover:bg-white/60 shadow-sm hover:shadow-lg shadow-gray-900/5 hover:shadow-gray-900/15"
          }`}
        >
          <div className="relative">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full flex items-center justify-center shadow-md shadow-purple-500/30">
              <span className="text-white font-semibold text-sm">A</span>
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white shadow-sm"></div>
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p
                className={`font-semibold truncate text-sm ${themeClasses.text.primary}`}
              >
                Alex Thompson
              </p>
              <p className={`text-xs truncate ${themeClasses.text.tertiary}`}>
                alex@renko.com
              </p>
            </div>
          )}
          {!isCollapsed && (
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
              <Settings className={`w-4 h-4 ${themeClasses.text.tertiary}`} />
            </div>
          )}
        </div>
      </div>

      {/* Resize Handle */}
      {!isCollapsed && (
        <div
          className={`absolute top-0 right-0 w-1 h-full cursor-ew-resize group transition-colors ${
            isDarkMode ? "hover:bg-purple-400/40" : "hover:bg-purple-500/40"
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
  active?: boolean;
  isCollapsed: boolean;
  isDarkMode: boolean;
}

function SidebarItem({
  icon: Icon,
  label,
  href,
  active,
  isCollapsed,
  isDarkMode,
}: SidebarItemProps) {
  return (
    <Link
      href={href}
      className={`w-full flex items-center ${isCollapsed ? "justify-center" : "space-x-3"} px-3 py-2.5 rounded-xl transition-all duration-200 group ${
        active
          ? isDarkMode
            ? "bg-gradient-to-r from-purple-900/50 to-indigo-900/50 text-purple-300 shadow-md shadow-purple-900/30 backdrop-blur-sm border border-purple-800/50"
            : "bg-gradient-to-r from-purple-100/90 to-indigo-100/90 text-purple-800 shadow-md shadow-purple-200/60 backdrop-blur-sm border border-purple-200/70"
          : isDarkMode
            ? "text-gray-300 hover:text-gray-100 hover:bg-gray-700/50 hover:shadow-sm hover:shadow-black/10"
            : "text-gray-700 hover:text-gray-900 hover:bg-white/70 hover:shadow-sm hover:shadow-gray-900/10"
      }`}
    >
      <Icon
        className={`w-4 h-4 transition-colors ${
          active
            ? isDarkMode
              ? "text-purple-400"
              : "text-purple-700"
            : isDarkMode
              ? "text-gray-400 group-hover:text-gray-200"
              : "text-gray-600 group-hover:text-gray-800"
        }`}
      />
      {!isCollapsed && <span className="font-semibold text-sm">{label}</span>}
      {active && !isCollapsed && (
        <div className="ml-auto w-2 h-2 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full shadow-sm"></div>
      )}
    </Link>
  );
}

interface ProjectItemProps {
  board: (typeof mockBoards)[0];
  isDarkMode: boolean;
}

function ProjectItem({ board, isDarkMode }: ProjectItemProps) {
  const progress = Math.round((board.completedCount / board.taskCount) * 100);

  return (
    <button
      className={`w-full flex items-center space-x-3 p-2.5 rounded-xl transition-all duration-200 group ${
        isDarkMode
          ? "hover:bg-gray-700/50 hover:shadow-sm hover:shadow-black/10"
          : "hover:bg-white/70 hover:shadow-sm hover:shadow-gray-900/10"
      }`}
    >
      <div className="w-2.5 h-2.5 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full shadow-sm shadow-purple-500/30"></div>
      <div className="flex-1 min-w-0 text-left">
        <p
          className={`text-sm font-semibold truncate transition-colors ${
            isDarkMode
              ? "text-gray-200 group-hover:text-gray-100"
              : "text-gray-800 group-hover:text-gray-900"
          }`}
        >
          {board.name}
        </p>
        <div className="flex items-center space-x-2 mt-1">
          <div
            className={`w-12 rounded-full h-1 shadow-inner ${
              isDarkMode ? "bg-gray-600/80" : "bg-gray-200/80"
            }`}
          >
            <div
              className="bg-gradient-to-r from-purple-500 to-indigo-600 h-1 rounded-full transition-all duration-300 shadow-sm"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span
            className={`text-xs font-medium ${
              isDarkMode ? "text-gray-400" : "text-gray-600"
            }`}
          >
            {progress}%
          </span>
        </div>
      </div>
    </button>
  );
}
