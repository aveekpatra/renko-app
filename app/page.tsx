"use client";

import React, { useState } from "react";
import {
  Plus,
  Calendar,
  FolderKanban,
  FileText,
  Settings,
  Search,
  Bell,
  Home as HomeIcon,
  BarChart3,
  Users,
  Sparkles,
  GripVertical,
  Moon,
  Sun,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  CalendarDays,
  Filter,
} from "lucide-react";

// Mock data
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

// Time-based tasks data
const timeBasedTasks = {
  today: [
    {
      id: "t1",
      title: "Review design mockups",
      priority: "high",
      assignee: "Alex",
    },
    {
      id: "t2",
      title: "Client call at 3pm",
      priority: "high",
      assignee: "Sarah",
    },
    {
      id: "t3",
      title: "Update project docs",
      priority: "medium",
      assignee: "Mike",
    },
  ],
  thisWeek: [
    {
      id: "t4",
      title: "Implement new feature",
      priority: "high",
      assignee: "Alex",
    },
    {
      id: "t5",
      title: "User testing session",
      priority: "medium",
      assignee: "Sarah",
    },
    {
      id: "t6",
      title: "Performance optimization",
      priority: "low",
      assignee: "Mike",
    },
    { id: "t7", title: "Code review", priority: "medium", assignee: "Alex" },
  ],
  thisMonth: [
    {
      id: "t8",
      title: "Q4 planning meeting",
      priority: "high",
      assignee: "Sarah",
    },
    { id: "t9", title: "Security audit", priority: "medium", assignee: "Mike" },
    {
      id: "t10",
      title: "Team building event",
      priority: "low",
      assignee: "Alex",
    },
  ],
  longTerm: [
    {
      id: "t11",
      title: "Platform migration",
      priority: "high",
      assignee: "Mike",
    },
    {
      id: "t12",
      title: "Mobile app development",
      priority: "medium",
      assignee: "Sarah",
    },
  ],
};

// Project status tasks data
const projectStatusTasks = {
  draft: [
    {
      id: "p1",
      title: "AI Integration Proposal",
      project: "Product",
      dueDate: "Dec 15",
    },
    {
      id: "p2",
      title: "New Onboarding Flow",
      project: "UX",
      dueDate: "Dec 20",
    },
  ],
  planned: [
    {
      id: "p3",
      title: "Database Optimization",
      project: "Backend",
      dueDate: "Jan 5",
    },
    {
      id: "p4",
      title: "Mobile Responsive Design",
      project: "Frontend",
      dueDate: "Jan 10",
    },
    {
      id: "p5",
      title: "API Documentation",
      project: "Backend",
      dueDate: "Jan 15",
    },
  ],
  inProgress: [
    {
      id: "p6",
      title: "User Dashboard Redesign",
      project: "UX",
      dueDate: "Dec 30",
    },
    {
      id: "p7",
      title: "Authentication System",
      project: "Backend",
      dueDate: "Jan 2",
    },
    {
      id: "p8",
      title: "Payment Integration",
      project: "Backend",
      dueDate: "Jan 8",
    },
  ],
  done: [
    {
      id: "p9",
      title: "Landing Page Redesign",
      project: "Frontend",
      dueDate: "Dec 1",
    },
    {
      id: "p10",
      title: "Email Templates",
      project: "Design",
      dueDate: "Dec 5",
    },
    {
      id: "p11",
      title: "SEO Optimization",
      project: "Marketing",
      dueDate: "Dec 10",
    },
    {
      id: "p12",
      title: "Bug Fixes v2.1",
      project: "Backend",
      dueDate: "Dec 12",
    },
  ],
};

const mockTasks = [
  {
    _id: "task_1",
    title: "Design landing page",
    priority: "high" as const,
    dueDate: "Tomorrow",
    boardName: "Product Development",
  },
  {
    _id: "task_2",
    title: "Set up analytics",
    priority: "medium" as const,
    dueDate: "Friday",
    boardName: "Marketing Campaign",
  },
  {
    _id: "task_3",
    title: "User testing session",
    priority: "high" as const,
    dueDate: "Monday",
    boardName: "Design System",
  },
];

const navigationItems = [
  { icon: HomeIcon, label: "Dashboard", active: true },
  { icon: FolderKanban, label: "Boards", active: false },
  { icon: Calendar, label: "Calendar", active: false },
  { icon: FileText, label: "Notes", active: false },
  { icon: BarChart3, label: "Analytics", active: false },
  { icon: Users, label: "Team", active: false },
];

export default function Home() {
  const [sidebarWidth, setSidebarWidth] = useState(280);
  const [isResizing, setIsResizing] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isCollapsed) {
      setIsResizing(true);
      e.preventDefault();
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing || isCollapsed) return;
    const newWidth = e.clientX;
    if (newWidth >= 200 && newWidth <= 400) {
      setSidebarWidth(newWidth);
    }
  };

  const handleMouseUp = () => {
    setIsResizing(false);
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
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

  const currentSidebarWidth = isCollapsed ? 80 : sidebarWidth;

  // Theme classes
  const themeClasses = {
    container: isDarkMode
      ? "h-screen bg-gradient-to-br from-gray-900 to-slate-900 flex overflow-hidden"
      : "h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex overflow-hidden",
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
    mainBg: isDarkMode
      ? "bg-gray-800/60 backdrop-blur-md rounded-2xl border border-gray-700/60"
      : "bg-white/80 backdrop-blur-md rounded-2xl border border-white/60",
  };

  return (
    <div className={themeClasses.container}>
      {/* Beautiful Sidebar */}
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
                active={item.active}
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

          {/* Collapse Button */}
          <button
            onClick={toggleSidebar}
            className={`w-full mt-3 p-2 rounded-lg transition-all duration-200 flex items-center justify-center ${
              isDarkMode
                ? "hover:bg-gray-700/50 text-gray-400 hover:text-gray-200"
                : "hover:bg-white/60 text-gray-600 hover:text-gray-800"
            }`}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
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
              <GripVertical
                className={`w-4 h-4 ${themeClasses.text.tertiary}`}
              />
            </div>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          {/* Top Bar */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2
                className={`text-3xl font-bold mb-2 ${isDarkMode ? "text-gray-100" : "text-gray-900"}`}
              >
                Good morning, Alex!
              </h2>
              <p
                className={`font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
              >
                Here&apos;s what&apos;s happening with your projects today.
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                className={`p-3 backdrop-blur-md rounded-xl shadow-lg transition-all duration-300 border hover:-translate-y-0.5 ${
                  isDarkMode
                    ? "bg-gray-800/80 border-gray-700/60 hover:bg-gray-800/90 shadow-black/20 hover:shadow-black/30"
                    : "bg-white/80 border-white/60 hover:bg-white/90 shadow-gray-900/10 hover:shadow-gray-900/15"
                }`}
              >
                <Bell
                  className={`w-5 h-5 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
                />
              </button>
              <button className="flex items-center space-x-2 px-5 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 transform hover:-translate-y-0.5 font-semibold">
                <Plus className="w-4 h-4" />
                <span>New Project</span>
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatCard
              title="Total Tasks"
              value="35"
              subtitle="8 due today"
              color="purple"
              trend="+12%"
              isDarkMode={isDarkMode}
            />
            <StatCard
              title="In Progress"
              value="12"
              subtitle="Across 3 boards"
              color="blue"
              trend="+5%"
              isDarkMode={isDarkMode}
            />
            <StatCard
              title="Completed"
              value="20"
              subtitle="This week"
              color="green"
              trend="+18%"
              isDarkMode={isDarkMode}
            />
          </div>

          <div className="space-y-8">
            {/* Time-Based Kanban Board */}
            <TimeBasedKanban isDarkMode={isDarkMode} />

            {/* Project Status Kanban Board */}
            <ProjectStatusKanban isDarkMode={isDarkMode} />

            {/* Calendar Widget */}
            <CalendarWidget isDarkMode={isDarkMode} />

            {/* Quick Tasks - Horizontal layout */}
            <div>
              <h3
                className={`text-xl font-semibold mb-6 ${isDarkMode ? "text-gray-100" : "text-gray-900"}`}
              >
                Quick Tasks
              </h3>
              <div
                className={`backdrop-blur-md rounded-2xl border p-5 shadow-lg transition-all duration-300 ${
                  isDarkMode
                    ? "bg-gray-800/70 border-gray-700/60 shadow-black/20 hover:shadow-black/30 hover:bg-gray-800/80"
                    : "bg-white/70 border-white/60 shadow-gray-900/10 hover:shadow-gray-900/15 hover:bg-white/80"
                }`}
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {mockTasks.map((task) => (
                    <TaskItem
                      key={task._id}
                      task={task}
                      isDarkMode={isDarkMode}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

interface SidebarItemProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active?: boolean;
  isCollapsed: boolean;
  isDarkMode: boolean;
}

function SidebarItem({
  icon: Icon,
  label,
  active,
  isCollapsed,
  isDarkMode,
}: SidebarItemProps) {
  return (
    <button
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
    </button>
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

interface StatCardProps {
  title: string;
  value: string;
  subtitle: string;
  color: "purple" | "blue" | "green";
  trend: string;
  isDarkMode: boolean;
}

function StatCard({
  title,
  value,
  subtitle,
  color,
  trend,
  isDarkMode,
}: StatCardProps) {
  const colorClasses = {
    purple:
      "bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-500/40",
    blue: "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/40",
    green:
      "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-500/40",
  };

  return (
    <div
      className={`backdrop-blur-md rounded-2xl border p-5 shadow-lg transition-all duration-300 hover:-translate-y-1 ${
        isDarkMode
          ? "bg-gray-800/80 border-gray-700/60 shadow-black/20 hover:shadow-black/30 hover:bg-gray-800/90"
          : "bg-white/80 border-white/60 shadow-gray-900/10 hover:shadow-gray-900/15 hover:bg-white/90"
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <h4
            className={`text-sm font-semibold mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
          >
            {title}
          </h4>
          <div className="flex items-baseline space-x-2">
            <span
              className={`text-3xl font-bold ${isDarkMode ? "text-gray-100" : "text-gray-900"}`}
            >
              {value}
            </span>
            <span
              className={`text-sm font-semibold px-2.5 py-1 rounded-full shadow-sm border ${
                isDarkMode
                  ? "text-green-400 bg-green-900/50 border-green-800/60"
                  : "text-green-700 bg-green-100/90 border-green-200/60"
              }`}
            >
              {trend}
            </span>
          </div>
          <p
            className={`text-sm font-medium mt-1 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
          >
            {subtitle}
          </p>
        </div>
        <div
          className={`p-3 rounded-xl ${colorClasses[color]} hover:scale-105 transition-transform duration-200`}
        >
          <div className="w-6 h-6"></div>
        </div>
      </div>
    </div>
  );
}

interface TimeBasedKanbanProps {
  isDarkMode: boolean;
}

function TimeBasedKanban({ isDarkMode }: TimeBasedKanbanProps) {
  const columns = [
    { id: "today", title: "Today", icon: Clock, color: "red" },
    { id: "thisWeek", title: "This Week", icon: Calendar, color: "orange" },
    { id: "thisMonth", title: "This Month", icon: CalendarDays, color: "blue" },
    { id: "longTerm", title: "Long Term", icon: User, color: "purple" },
  ];

  return (
    <div
      className={`backdrop-blur-md rounded-2xl border shadow-lg transition-all duration-300 ${
        isDarkMode
          ? "bg-gray-800/70 border-gray-700/60 shadow-black/20"
          : "bg-white/70 border-white/60 shadow-gray-900/10"
      }`}
    >
      {/* Header */}
      <div
        className={`flex items-center justify-between p-6 border-b ${
          isDarkMode ? "border-gray-700/50" : "border-white/30"
        }`}
      >
        <div className="flex items-center space-x-3">
          <Clock
            className={`w-6 h-6 ${isDarkMode ? "text-purple-400" : "text-purple-600"}`}
          />
          <h3
            className={`text-xl font-semibold ${isDarkMode ? "text-gray-100" : "text-gray-900"}`}
          >
            Time-Based Tasks
          </h3>
        </div>
        <button
          className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
            isDarkMode
              ? "text-purple-400 hover:text-purple-300 bg-purple-900/30 hover:bg-purple-900/40"
              : "text-purple-600 hover:text-purple-700 bg-purple-50/80 hover:bg-purple-100/80"
          }`}
        >
          <Filter className="w-4 h-4" />
          <span>Filter</span>
        </button>
      </div>

      {/* Connected Kanban Columns */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {columns.map((column, index) => (
            <div key={column.id} className="relative">
              <ConnectedKanbanColumn
                column={column}
                tasks={timeBasedTasks[column.id as keyof typeof timeBasedTasks]}
                isDarkMode={isDarkMode}
              />
              {/* Connection line */}
              {index < columns.length - 1 && (
                <div
                  className={`hidden lg:block absolute top-8 -right-2 w-4 h-0.5 ${
                    isDarkMode ? "bg-gray-600/50" : "bg-gray-300/50"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface TaskItemProps {
  task: (typeof mockTasks)[0];
  isDarkMode: boolean;
}

function TaskItem({ task, isDarkMode }: TaskItemProps) {
  const priorityColors = {
    high: isDarkMode
      ? "bg-red-900/50 text-red-400 border-red-800/60 shadow-sm shadow-red-900/30"
      : "bg-red-100/90 text-red-800 border-red-200/80 shadow-sm shadow-red-200/60",
    medium: isDarkMode
      ? "bg-yellow-900/50 text-yellow-400 border-yellow-800/60 shadow-sm shadow-yellow-900/30"
      : "bg-yellow-100/90 text-yellow-800 border-yellow-200/80 shadow-sm shadow-yellow-200/60",
    low: isDarkMode
      ? "bg-green-900/50 text-green-400 border-green-800/60 shadow-sm shadow-green-900/30"
      : "bg-green-100/90 text-green-800 border-green-200/80 shadow-sm shadow-green-200/60",
  };

  return (
    <div
      className={`flex items-start space-x-3 p-3 rounded-xl transition-all duration-200 group ${
        isDarkMode
          ? "hover:bg-gray-700/50 hover:backdrop-blur-sm hover:shadow-md hover:shadow-black/20"
          : "hover:bg-white/70 hover:backdrop-blur-sm hover:shadow-md hover:shadow-gray-900/10"
      }`}
    >
      <div className="flex-1">
        <h5
          className={`font-semibold mb-1 transition-colors ${
            isDarkMode
              ? "text-gray-100 group-hover:text-purple-400"
              : "text-gray-900 group-hover:text-purple-700"
          }`}
        >
          {task.title}
        </h5>
        <div
          className={`flex items-center space-x-2 text-sm ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
        >
          <span className="font-medium">{task.boardName}</span>
          <span>•</span>
          <span className="font-medium">{task.dueDate}</span>
        </div>
      </div>
      <span
        className={`px-3 py-1.5 rounded-full text-xs font-semibold border backdrop-blur-sm ${priorityColors[task.priority]}`}
      >
        {task.priority}
      </span>
    </div>
  );
}

// Connected Kanban Column Component (replaces KanbanColumn)
interface ConnectedKanbanColumnProps {
  column: {
    id: string;
    title: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
  };
  tasks: Array<{
    id: string;
    title: string;
    priority: string;
    assignee: string;
  }>;
  isDarkMode: boolean;
}

function ConnectedKanbanColumn({
  column,
  tasks,
  isDarkMode,
}: ConnectedKanbanColumnProps) {
  const colorClasses = {
    red: isDarkMode
      ? "from-red-500/20 to-red-600/20 border-red-500/30"
      : "from-red-50 to-red-100 border-red-200",
    orange: isDarkMode
      ? "from-orange-500/20 to-orange-600/20 border-orange-500/30"
      : "from-orange-50 to-orange-100 border-orange-200",
    blue: isDarkMode
      ? "from-blue-500/20 to-blue-600/20 border-blue-500/30"
      : "from-blue-50 to-blue-100 border-blue-200",
    purple: isDarkMode
      ? "from-purple-500/20 to-purple-600/20 border-purple-500/30"
      : "from-purple-50 to-purple-100 border-purple-200",
    gray: isDarkMode
      ? "from-gray-500/20 to-gray-600/20 border-gray-500/30"
      : "from-gray-50 to-gray-100 border-gray-200",
    green: isDarkMode
      ? "from-green-500/20 to-green-600/20 border-green-500/30"
      : "from-green-50 to-green-100 border-green-200",
  };

  const iconColorClasses = {
    red: isDarkMode ? "text-red-400" : "text-red-600",
    orange: isDarkMode ? "text-orange-400" : "text-orange-600",
    blue: isDarkMode ? "text-blue-400" : "text-blue-600",
    purple: isDarkMode ? "text-purple-400" : "text-purple-600",
    gray: isDarkMode ? "text-gray-400" : "text-gray-600",
    green: isDarkMode ? "text-green-400" : "text-green-600",
  };

  return (
    <div
      className={`rounded-xl border p-4 transition-all duration-300 ${
        isDarkMode
          ? "bg-gray-700/30 border-gray-600/40 hover:bg-gray-700/50"
          : "bg-white/40 border-white/60 hover:bg-white/60"
      }`}
    >
      <div
        className={`flex items-center space-x-3 mb-4 p-3 rounded-xl bg-gradient-to-r border ${colorClasses[column.color as keyof typeof colorClasses]}`}
      >
        <column.icon
          className={`w-5 h-5 ${iconColorClasses[column.color as keyof typeof iconColorClasses]}`}
        />
        <h4
          className={`font-semibold ${isDarkMode ? "text-gray-100" : "text-gray-900"}`}
        >
          {column.title}
        </h4>
        <span
          className={`ml-auto text-sm font-medium px-2 py-1 rounded-full ${
            isDarkMode
              ? "bg-gray-600/80 text-gray-300"
              : "bg-gray-200/80 text-gray-600"
          }`}
        >
          {tasks.length}
        </span>
      </div>

      <div className="space-y-3 min-h-[200px]">
        {tasks.map((task) => (
          <div
            key={task.id}
            className={`p-3 rounded-xl transition-all duration-200 cursor-pointer group ${
              isDarkMode
                ? "bg-gray-600/30 hover:bg-gray-600/60 border border-gray-500/30 hover:border-gray-500/60"
                : "bg-white/60 hover:bg-white/80 border border-white/40 hover:border-white/60"
            } hover:shadow-md hover:-translate-y-0.5`}
          >
            <div className="flex items-start justify-between mb-2">
              <h5
                className={`font-medium text-sm ${
                  isDarkMode
                    ? "text-gray-100 group-hover:text-purple-400"
                    : "text-gray-900 group-hover:text-purple-700"
                }`}
              >
                {task.title}
              </h5>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  task.priority === "high"
                    ? isDarkMode
                      ? "bg-red-800/50 text-red-400"
                      : "bg-red-100 text-red-700"
                    : task.priority === "medium"
                      ? isDarkMode
                        ? "bg-yellow-800/50 text-yellow-400"
                        : "bg-yellow-100 text-yellow-700"
                      : isDarkMode
                        ? "bg-green-800/50 text-green-400"
                        : "bg-green-100 text-green-700"
                }`}
              >
                {task.priority}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <User
                className={`w-3 h-3 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
              />
              <span
                className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
              >
                {task.assignee}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Project Status Kanban Component
interface ProjectStatusKanbanProps {
  isDarkMode: boolean;
}

function ProjectStatusKanban({ isDarkMode }: ProjectStatusKanbanProps) {
  const columns = [
    { id: "draft", title: "Draft", icon: FileText, color: "gray" },
    { id: "planned", title: "Planned", icon: Calendar, color: "blue" },
    { id: "inProgress", title: "In Progress", icon: Clock, color: "orange" },
    { id: "done", title: "Done", icon: BarChart3, color: "green" },
  ];

  return (
    <div
      className={`backdrop-blur-md rounded-2xl border shadow-lg transition-all duration-300 ${
        isDarkMode
          ? "bg-gray-800/70 border-gray-700/60 shadow-black/20"
          : "bg-white/70 border-white/60 shadow-gray-900/10"
      }`}
    >
      {/* Header */}
      <div
        className={`flex items-center justify-between p-6 border-b ${
          isDarkMode ? "border-gray-700/50" : "border-white/30"
        }`}
      >
        <div className="flex items-center space-x-3">
          <FolderKanban
            className={`w-6 h-6 ${isDarkMode ? "text-purple-400" : "text-purple-600"}`}
          />
          <h3
            className={`text-xl font-semibold ${isDarkMode ? "text-gray-100" : "text-gray-900"}`}
          >
            Project Status
          </h3>
        </div>
      </div>

      {/* Connected Project Columns */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {columns.map((column, index) => (
            <div key={column.id} className="relative">
              <ProjectColumn
                column={column}
                tasks={
                  projectStatusTasks[
                    column.id as keyof typeof projectStatusTasks
                  ]
                }
                isDarkMode={isDarkMode}
              />
              {/* Connection line */}
              {index < columns.length - 1 && (
                <div
                  className={`hidden lg:block absolute top-8 -right-2 w-4 h-0.5 ${
                    isDarkMode ? "bg-gray-600/50" : "bg-gray-300/50"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Project Column Component
interface ProjectColumnProps {
  column: {
    id: string;
    title: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
  };
  tasks: Array<{
    id: string;
    title: string;
    project: string;
    dueDate: string;
  }>;
  isDarkMode: boolean;
}

function ProjectColumn({ column, tasks, isDarkMode }: ProjectColumnProps) {
  const colorClasses = {
    gray: isDarkMode
      ? "from-gray-500/20 to-gray-600/20 border-gray-500/30"
      : "from-gray-50 to-gray-100 border-gray-200",
    blue: isDarkMode
      ? "from-blue-500/20 to-blue-600/20 border-blue-500/30"
      : "from-blue-50 to-blue-100 border-blue-200",
    orange: isDarkMode
      ? "from-orange-500/20 to-orange-600/20 border-orange-500/30"
      : "from-orange-50 to-orange-100 border-orange-200",
    green: isDarkMode
      ? "from-green-500/20 to-green-600/20 border-green-500/30"
      : "from-green-50 to-green-100 border-green-200",
  };

  const iconColorClasses = {
    gray: isDarkMode ? "text-gray-400" : "text-gray-600",
    blue: isDarkMode ? "text-blue-400" : "text-blue-600",
    orange: isDarkMode ? "text-orange-400" : "text-orange-600",
    green: isDarkMode ? "text-green-400" : "text-green-600",
  };

  return (
    <div
      className={`rounded-xl border p-4 transition-all duration-300 ${
        isDarkMode
          ? "bg-gray-700/30 border-gray-600/40 hover:bg-gray-700/50"
          : "bg-white/40 border-white/60 hover:bg-white/60"
      }`}
    >
      <div
        className={`flex items-center space-x-3 mb-4 p-3 rounded-xl bg-gradient-to-r border ${colorClasses[column.color as keyof typeof colorClasses]}`}
      >
        <column.icon
          className={`w-5 h-5 ${iconColorClasses[column.color as keyof typeof iconColorClasses]}`}
        />
        <h4
          className={`font-semibold ${isDarkMode ? "text-gray-100" : "text-gray-900"}`}
        >
          {column.title}
        </h4>
        <span
          className={`ml-auto text-sm font-medium px-2 py-1 rounded-full ${
            isDarkMode
              ? "bg-gray-600/80 text-gray-300"
              : "bg-gray-200/80 text-gray-600"
          }`}
        >
          {tasks.length}
        </span>
      </div>

      <div className="space-y-3 min-h-[200px]">
        {tasks.map((task) => (
          <div
            key={task.id}
            className={`p-3 rounded-xl transition-all duration-200 cursor-pointer group ${
              isDarkMode
                ? "bg-gray-600/30 hover:bg-gray-600/60 border border-gray-500/30 hover:border-gray-500/60"
                : "bg-white/60 hover:bg-white/80 border border-white/40 hover:border-white/60"
            } hover:shadow-md hover:-translate-y-0.5`}
          >
            <h5
              className={`font-medium text-sm mb-2 ${
                isDarkMode
                  ? "text-gray-100 group-hover:text-purple-400"
                  : "text-gray-900 group-hover:text-purple-700"
              }`}
            >
              {task.title}
            </h5>
            <div className="flex items-center justify-between">
              <span
                className={`text-xs px-2 py-1 rounded-full ${
                  isDarkMode
                    ? "bg-purple-800/50 text-purple-400"
                    : "bg-purple-100 text-purple-700"
                }`}
              >
                {task.project}
              </span>
              <span
                className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
              >
                {task.dueDate}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Calendar Widget Component
interface CalendarWidgetProps {
  isDarkMode: boolean;
}

function CalendarWidget({ isDarkMode }: CalendarWidgetProps) {
  const [viewMode, setViewMode] = useState<"week" | "month">("week");
  const currentDate = new Date();

  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const dates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - date.getDay() + i + 1);
    return date;
  });

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Calendar
            className={`w-6 h-6 ${isDarkMode ? "text-purple-400" : "text-purple-600"}`}
          />
          <h3
            className={`text-xl font-semibold ${isDarkMode ? "text-gray-100" : "text-gray-900"}`}
          >
            Calendar
          </h3>
        </div>
        <div
          className={`flex items-center rounded-xl border ${
            isDarkMode
              ? "bg-gray-800/80 border-gray-700/60"
              : "bg-white/80 border-white/60"
          }`}
        >
          <button
            onClick={() => setViewMode("week")}
            className={`px-3 py-2 text-sm font-medium rounded-l-xl transition-all ${
              viewMode === "week"
                ? isDarkMode
                  ? "bg-purple-600 text-white"
                  : "bg-purple-600 text-white"
                : isDarkMode
                  ? "text-gray-300 hover:text-gray-100"
                  : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Week
          </button>
          <button
            onClick={() => setViewMode("month")}
            className={`px-3 py-2 text-sm font-medium rounded-r-xl transition-all ${
              viewMode === "month"
                ? isDarkMode
                  ? "bg-purple-600 text-white"
                  : "bg-purple-600 text-white"
                : isDarkMode
                  ? "text-gray-300 hover:text-gray-100"
                  : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Month
          </button>
        </div>
      </div>

      <div
        className={`backdrop-blur-md rounded-2xl border p-4 shadow-lg transition-all duration-300 ${
          isDarkMode
            ? "bg-gray-800/70 border-gray-700/60 shadow-black/20"
            : "bg-white/70 border-white/60 shadow-gray-900/10"
        }`}
      >
        {viewMode === "week" ? (
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map((day, index) => (
              <div key={day} className="text-center">
                <div
                  className={`text-sm font-medium mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
                >
                  {day}
                </div>
                <div
                  className={`p-2 rounded-lg min-h-[60px] transition-all ${
                    dates[index].toDateString() === currentDate.toDateString()
                      ? isDarkMode
                        ? "bg-purple-900/50 border border-purple-700/50"
                        : "bg-purple-100 border border-purple-200"
                      : isDarkMode
                        ? "bg-gray-700/50 hover:bg-gray-700/80"
                        : "bg-gray-50/80 hover:bg-gray-100/80"
                  }`}
                >
                  <div
                    className={`text-sm font-semibold ${isDarkMode ? "text-gray-100" : "text-gray-900"}`}
                  >
                    {dates[index].getDate()}
                  </div>
                  {/* Sample events */}
                  {index === 1 && (
                    <div
                      className={`mt-1 p-1 rounded text-xs ${
                        isDarkMode
                          ? "bg-blue-900/50 text-blue-400"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      Design Review
                    </div>
                  )}
                  {index === 3 && (
                    <div
                      className={`mt-1 p-1 rounded text-xs ${
                        isDarkMode
                          ? "bg-green-900/50 text-green-400"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      Launch
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <CalendarDays
              className={`w-12 h-12 mx-auto mb-3 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
            />
            <p className={`${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
              Month view coming soon...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
