"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { useAuthActions } from "@convex-dev/auth/react";
import {
  Plus,
  Calendar,
  FolderKanban,
  FileText,
  Settings,
  Home as HomeIcon,
  BarChart3,
  Sparkles,
  GripVertical,
  Moon,
  Sun,
  ChevronLeft,
  ChevronRight,
  Target,
  LogOut,
  ChevronUp,
  Layout,
  Kanban,
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
  { icon: Layout, label: "Dashboard", href: "/" },
  { icon: FolderKanban, label: "Projects", href: "/boards" },
  { icon: Calendar, label: "Calendar", href: "/calendar" },
  { icon: Target, label: "Habits", href: "/habits" },
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
  const router = useRouter();
  const { signOut } = useAuthActions();

  // Manage sidebar collapsed state internally with localStorage persistence
  // Start with false to match server render, then load from localStorage after hydration
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // User dropdown state
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
  });

  // Handle hydration and localStorage loading
  useEffect(() => {
    setIsHydrated(true);
    // Only load from localStorage after hydration to prevent mismatch
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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(event.target as Node)
      ) {
        setIsUserDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Calculate dropdown position when opened
  useEffect(() => {
    if (isUserDropdownOpen && userDropdownRef.current && isHydrated) {
      const rect = userDropdownRef.current.getBoundingClientRect();
      const effectiveIsCollapsed = isHydrated && isCollapsed;
      setDropdownPosition({
        // Always position above the user profile, with some spacing
        top: rect.top - (effectiveIsCollapsed ? 100 : 120),
        left: effectiveIsCollapsed ? rect.right + 8 : rect.left,
        width: effectiveIsCollapsed ? 192 : rect.width - 32, // w-48 = 192px, subtract padding
      });
    }
  }, [isUserDropdownOpen, isCollapsed, isHydrated]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const toggleUserDropdown = () => {
    setIsUserDropdownOpen(!isUserDropdownOpen);
  };

  const handleSettings = () => {
    setIsUserDropdownOpen(false);
    // Add your settings logic here
  };

  const handleLogout = async () => {
    try {
      setIsUserDropdownOpen(false);

      // Step 1: Sign out from Convex Auth
      await signOut();

      // Step 2: Clear all authentication-related storage
      localStorage.clear();
      sessionStorage.clear();

      // Step 3: Clear any cookies (if any)
      document.cookie.split(";").forEach((c) => {
        const eqPos = c.indexOf("=");
        const name = eqPos > -1 ? c.substr(0, eqPos) : c;
        document.cookie =
          name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
        document.cookie =
          name +
          "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=" +
          window.location.hostname;
      });

      // Step 4: According to GitHub issue #92, refresh router cache then redirect
      // This is needed because Convex Auth doesn't auto-redirect
      router.refresh();

      // Step 5: Redirect to signin page
      router.push("/signin");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleQuickAdd = () => {
    // Add your quick add logic here
    console.log("Quick add clicked");
  };

  // Use the hydrated collapsed state, defaulting to expanded for SSR
  const currentSidebarWidth = isHydrated && isCollapsed ? 80 : sidebarWidth;

  // Theme classes
  const themeClasses = {
    sidebar: isDarkMode
      ? "bg-gray-800/70 border-r border-gray-700/50 text-gray-100 flex flex-col shadow-lg h-full relative"
      : "bg-white/80 border-r border-gray-200/60 text-gray-800 flex flex-col shadow-lg h-full relative",
    sidebarSection: isDarkMode ? "bg-gray-700/20" : "bg-gray-50/30",
    text: {
      primary: isDarkMode ? "text-gray-100" : "text-gray-800",
      secondary: isDarkMode ? "text-gray-300" : "text-gray-700",
      tertiary: isDarkMode ? "text-gray-400" : "text-gray-600",
    },
    quickAddButton: isDarkMode
      ? "w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 flex items-center justify-center space-x-2"
      : "w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 flex items-center justify-center space-x-2",
  };

  return (
    <aside
      className={themeClasses.sidebar}
      style={{ width: currentSidebarWidth }}
    >
      {/* Logo Section - More compact */}
      <div
        className={`p-3 border-b ${isDarkMode ? "border-gray-700/50" : "border-gray-200/50"} flex-shrink-0 ${themeClasses.sidebarSection}`}
      >
        <div className="flex items-center justify-between">
          <div
            className={`flex items-center space-x-2 ${isHydrated && isCollapsed ? "justify-center" : ""}`}
          >
            <div
              className={`${
                isHydrated && isCollapsed ? "w-10 h-10" : "w-8 h-8"
              } bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md ${
                isHydrated && isCollapsed
                  ? "cursor-pointer hover:scale-105"
                  : ""
              }`}
              onClick={isHydrated && isCollapsed ? toggleSidebar : undefined}
              title={isHydrated && isCollapsed ? "Expand sidebar" : undefined}
            >
              <Sparkles
                className={`${isHydrated && isCollapsed ? "w-5 h-5" : "w-4 h-4"} text-white`}
              />
            </div>
            {!(isHydrated && isCollapsed) && (
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                  Renko
                </h1>
                <p
                  className={`text-xs font-medium ${themeClasses.text.secondary}`}
                >
                  Productivity Suite
                </p>
              </div>
            )}
          </div>
          {!(isHydrated && isCollapsed) && (
            <div className="flex items-center space-x-1">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className={`p-1.5 rounded-md transition-all duration-200 ${
                  isDarkMode
                    ? "hover:bg-gray-700/50 text-gray-400 hover:text-gray-200"
                    : "hover:bg-gray-100/60 text-gray-600 hover:text-gray-800"
                }`}
              >
                {isDarkMode ? (
                  <Sun className="w-3.5 h-3.5" />
                ) : (
                  <Moon className="w-3.5 h-3.5" />
                )}
              </button>

              {/* Collapse Button */}
              <button
                onClick={toggleSidebar}
                className={`p-1.5 rounded-md transition-all duration-200 ${
                  isDarkMode
                    ? "hover:bg-gray-700/50 text-gray-400 hover:text-gray-200"
                    : "hover:bg-gray-100/60 text-gray-600 hover:text-gray-800"
                }`}
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Quick Add Section - Replaced search */}
      <div className="p-3 flex-shrink-0">
        {!(isHydrated && isCollapsed) ? (
          <button
            onClick={handleQuickAdd}
            className={themeClasses.quickAddButton}
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm">Quick Add</span>
          </button>
        ) : (
          <button
            onClick={handleQuickAdd}
            className={`w-full p-2 rounded-lg transition-all duration-200 flex items-center justify-center ${
              isDarkMode
                ? "bg-blue-600 hover:bg-blue-700 text-white"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            <Plus className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Navigation - Scrollable */}
      <div className="flex-1 overflow-y-auto px-3 pb-3">
        <div className="space-y-0.5">
          {navigationItems.map((item) => (
            <SidebarItem
              key={item.label}
              icon={item.icon}
              label={item.label}
              href={item.href}
              active={pathname === item.href}
              isCollapsed={isHydrated && isCollapsed}
              isDarkMode={isDarkMode}
            />
          ))}
        </div>

        {/* Projects Section */}
        {!(isHydrated && isCollapsed) && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <h3
                className={`text-xs font-bold uppercase tracking-wider ${themeClasses.text.secondary}`}
              >
                Recent Projects
              </h3>
              <button
                className={`p-1 rounded-md transition-all duration-200 ${
                  isDarkMode ? "hover:bg-gray-700/50" : "hover:bg-gray-100/60"
                }`}
              >
                <Plus className={`w-3 h-3 ${themeClasses.text.tertiary}`} />
              </button>
            </div>
            <div className="space-y-0.5">
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

      {/* Expand Button for collapsed state - positioned above user profile */}
      {isHydrated && isCollapsed && (
        <div className="p-3 flex-shrink-0">
          <button
            onClick={toggleSidebar}
            className={`w-full p-2 rounded-lg transition-all duration-200 flex items-center justify-center ${
              isDarkMode
                ? "bg-gray-700/50 hover:bg-gray-700/70 text-gray-300 hover:text-gray-100"
                : "bg-gray-100/60 hover:bg-gray-200/70 text-gray-600 hover:text-gray-800"
            }`}
            title="Expand sidebar"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* User Profile - Fixed at bottom with consistent height */}
      <div
        className={`p-3 border-t ${isDarkMode ? "border-gray-700/50" : "border-gray-200/50"} flex-shrink-0 ${themeClasses.sidebarSection} relative`}
        ref={userDropdownRef}
      >
        <div
          onClick={toggleUserDropdown}
          className={`flex items-center ${isHydrated && isCollapsed ? "justify-center" : "space-x-2"} p-2 rounded-lg transition-all duration-200 cursor-pointer group ${
            isDarkMode ? "hover:bg-gray-700/50" : "hover:bg-gray-100/60"
          }`}
          style={{
            // Ensure consistent container dimensions
            width: isHydrated && isCollapsed ? "48px" : "auto",
            height: "48px", // Same height for both states
          }}
        >
          <div className="relative flex-shrink-0">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-md">
              <span className="text-white font-semibold text-sm">A</span>
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white shadow-sm"></div>
          </div>
          {!(isHydrated && isCollapsed) && (
            <>
              <div className="flex-1 min-w-0">
                <p
                  className={`font-semibold truncate text-sm ${themeClasses.text.primary}`}
                >
                  Jimmy Thompson
                </p>
                <p className={`text-xs truncate ${themeClasses.text.tertiary}`}>
                  Jimmy@renko.com
                </p>
              </div>
              <div
                className={`transition-all duration-200 flex-shrink-0 ${isUserDropdownOpen ? "rotate-180" : ""}`}
              >
                <ChevronUp
                  className={`w-4 h-4 ${themeClasses.text.tertiary}`}
                />
              </div>
            </>
          )}
        </div>

        {/* User Dropdown Menu - Rendered via Portal */}
        {isUserDropdownOpen &&
          isHydrated &&
          createPortal(
            <div
              className={`fixed ios-card z-[99999] overflow-hidden ${
                isDarkMode ? "bg-gray-800/95" : "bg-white/95"
              }`}
              style={{
                top: dropdownPosition.top,
                left: dropdownPosition.left,
                width: dropdownPosition.width,
              }}
            >
              <div className="py-2">
                <button
                  onClick={handleSettings}
                  className={`w-full flex items-center space-x-3 px-4 py-3 transition-all duration-200 ${
                    isDarkMode
                      ? "hover:bg-gray-700/50 text-gray-300 hover:text-gray-100"
                      : "hover:bg-gray-50/80 text-gray-700 hover:text-gray-900"
                  }`}
                >
                  <Settings className="w-4 h-4" />
                  <span className="text-sm font-medium">Settings</span>
                </button>
                <div
                  className={`h-px mx-4 ${
                    isDarkMode ? "bg-gray-700/50" : "bg-gray-200/50"
                  }`}
                />
                <button
                  onClick={handleLogout}
                  className={`w-full flex items-center space-x-3 px-4 py-3 transition-all duration-200 ${
                    isDarkMode
                      ? "hover:bg-red-500/10 text-red-400 hover:text-red-300"
                      : "hover:bg-red-50/80 text-red-600 hover:text-red-700"
                  }`}
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm font-medium">Log out</span>
                </button>
              </div>
            </div>,
            document.body,
          )}
      </div>

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
      className={`w-full flex items-center ${isCollapsed ? "justify-center" : "space-x-3"} px-3 py-2.5 rounded-lg transition-all duration-200 group ${
        active
          ? isDarkMode
            ? "bg-blue-600/20 text-blue-300 border border-blue-500/30"
            : "bg-blue-100/80 text-blue-800 border border-blue-200/70"
          : isDarkMode
            ? "text-gray-300 hover:text-gray-100 hover:bg-gray-700/50"
            : "text-gray-700 hover:text-gray-900 hover:bg-gray-100/60"
      }`}
    >
      <Icon
        className={`w-4 h-4 transition-colors ${
          active
            ? isDarkMode
              ? "text-blue-400"
              : "text-blue-700"
            : isDarkMode
              ? "text-gray-400 group-hover:text-gray-200"
              : "text-gray-600 group-hover:text-gray-800"
        }`}
      />
      {!isCollapsed && <span className="font-semibold text-sm">{label}</span>}
      {active && !isCollapsed && (
        <div className="ml-auto w-2 h-2 bg-blue-500 rounded-full"></div>
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
      className={`w-full flex items-center space-x-2 p-2 rounded-lg transition-all duration-200 group ${
        isDarkMode ? "hover:bg-gray-700/50" : "hover:bg-gray-100/60"
      }`}
    >
      <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
      <div className="flex-1 min-w-0 text-left">
        <p
          className={`text-xs font-semibold truncate transition-colors ${
            isDarkMode
              ? "text-gray-200 group-hover:text-gray-100"
              : "text-gray-800 group-hover:text-gray-900"
          }`}
        >
          {board.name}
        </p>
        <div className="flex items-center space-x-1.5 mt-0.5">
          <div
            className={`w-10 rounded-full h-0.5 ${
              isDarkMode ? "bg-gray-600/80" : "bg-gray-200/80"
            }`}
          >
            <div
              className="bg-blue-500 h-0.5 rounded-full transition-all duration-300"
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
