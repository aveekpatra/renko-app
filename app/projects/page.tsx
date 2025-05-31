"use client";

import React, { useState } from "react";
import {
  Plus,
  Search,
  Folder,
  FolderOpen,
  Target,
  Calendar,
  Users,
  TrendingUp,
  Clock,
  Star,
  MoreHorizontal,
  ChevronRight,
  ChevronDown,
  GitBranch,
  Briefcase,
  Zap,
  Award,
  Activity,
} from "lucide-react";
import { useTheme } from "@/components/AppLayout";

interface Project {
  id: string;
  name: string;
  description: string;
  status: "planning" | "active" | "completed" | "on-hold";
  priority: "urgent" | "normal" | "low";
  color: "purple" | "blue" | "green" | "orange" | "pink" | "indigo";
  progress: number;
  teamSize: number;
  deadline: string;
  budget: string;
  tags: string[];
  isFavorite: boolean;
}

interface ProjectCategory {
  id: string;
  name: string;
  color: "purple" | "blue" | "green" | "orange" | "pink" | "indigo";
  icon?: React.ComponentType<{ className?: string }>;
  isExpanded: boolean;
  projectCount: number;
}

// Mock data
const mockCategories: ProjectCategory[] = [
  {
    id: "1",
    name: "Product Development",
    color: "purple",
    icon: Zap,
    isExpanded: true,
    projectCount: 4,
  },
  {
    id: "2",
    name: "Client Projects",
    color: "blue",
    icon: Briefcase,
    isExpanded: true,
    projectCount: 6,
  },
  {
    id: "3",
    name: "Internal Tools",
    color: "green",
    icon: GitBranch,
    isExpanded: false,
    projectCount: 3,
  },
  {
    id: "4",
    name: "Research & Innovation",
    color: "orange",
    icon: TrendingUp,
    isExpanded: true,
    projectCount: 2,
  },
  {
    id: "5",
    name: "Marketing & Growth",
    color: "pink",
    icon: Award,
    isExpanded: false,
    projectCount: 5,
  },
];

const mockProjects: Project[] = [
  {
    id: "1",
    name: "Renko Dashboard v2",
    description:
      "Complete redesign of the main dashboard with new analytics features and improved UX",
    status: "active",
    priority: "urgent",
    color: "purple",
    progress: 75,
    teamSize: 5,
    deadline: "2024-04-15",
    budget: "$85,000",
    tags: ["frontend", "analytics", "ux"],
    isFavorite: true,
  },
  {
    id: "2",
    name: "E-commerce Platform",
    description:
      "Building a complete e-commerce solution for our client with modern payment integrations",
    status: "active",
    priority: "normal",
    color: "blue",
    progress: 45,
    teamSize: 8,
    deadline: "2024-05-30",
    budget: "$150,000",
    tags: ["e-commerce", "payments", "backend"],
    isFavorite: false,
  },
  {
    id: "3",
    name: "AI Content Generator",
    description:
      "Research and development of an AI-powered content generation tool for marketing teams",
    status: "planning",
    priority: "normal",
    color: "orange",
    progress: 15,
    teamSize: 3,
    deadline: "2024-06-30",
    budget: "$75,000",
    tags: ["ai", "research", "content"],
    isFavorite: true,
  },
  {
    id: "4",
    name: "Mobile App Launch",
    description:
      "Development and launch of our mobile application for iOS and Android platforms",
    status: "active",
    priority: "urgent",
    color: "green",
    progress: 60,
    teamSize: 6,
    deadline: "2024-04-01",
    budget: "$120,000",
    tags: ["mobile", "ios", "android"],
    isFavorite: false,
  },
  {
    id: "5",
    name: "Internal CRM System",
    description:
      "Custom CRM system to manage our client relationships and sales pipeline",
    status: "completed",
    priority: "low",
    color: "indigo",
    progress: 100,
    teamSize: 4,
    deadline: "2024-03-01",
    budget: "$60,000",
    tags: ["crm", "internal", "sales"],
    isFavorite: false,
  },
];

export default function ProjectsPage() {
  const { isDarkMode } = useTheme();
  const [selectedCategory, setSelectedCategory] =
    useState<ProjectCategory | null>(mockCategories[0]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(
    mockProjects[0],
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [categories, setCategories] = useState(mockCategories);

  const themeClasses = {
    sidebar: isDarkMode
      ? "bg-gray-900/80 backdrop-blur-xl border-r border-gray-700/60 shadow-2xl shadow-black/30"
      : "bg-white/80 backdrop-blur-xl border-r border-purple-200/30 shadow-2xl shadow-purple-900/10",
    text: {
      primary: isDarkMode ? "text-gray-100" : "text-gray-900",
      secondary: isDarkMode ? "text-gray-300" : "text-gray-700",
      tertiary: isDarkMode ? "text-gray-400" : "text-gray-600",
    },
    search: isDarkMode
      ? "bg-gray-800/70 border-gray-700/60 text-gray-100 placeholder-gray-400 focus:border-purple-500/50 focus:bg-gray-800/90"
      : "bg-white/80 border-purple-200/60 text-gray-800 placeholder-gray-500 focus:border-purple-400/50 focus:bg-white/95",
    projectArea: isDarkMode
      ? "bg-gray-900/40 border-gray-700/40"
      : "bg-white/40 border-gray-200/40",
  };

  const getCategoryColor = (color: string, isDark: boolean) => {
    const colors = {
      purple: isDark
        ? "bg-gradient-to-br from-purple-500/20 to-purple-600/15 text-purple-300 border-purple-400/40"
        : "bg-gradient-to-br from-purple-50/95 to-purple-100/80 text-purple-800 border-purple-200/70",
      blue: isDark
        ? "bg-gradient-to-br from-blue-500/20 to-blue-600/15 text-blue-300 border-blue-400/40"
        : "bg-gradient-to-br from-blue-50/95 to-blue-100/80 text-blue-800 border-blue-200/70",
      green: isDark
        ? "bg-gradient-to-br from-green-500/20 to-green-600/15 text-green-300 border-green-400/40"
        : "bg-gradient-to-br from-green-50/95 to-green-100/80 text-green-800 border-green-200/70",
      orange: isDark
        ? "bg-gradient-to-br from-orange-500/20 to-orange-600/15 text-orange-300 border-orange-400/40"
        : "bg-gradient-to-br from-orange-50/95 to-orange-100/80 text-orange-800 border-orange-200/70",
      pink: isDark
        ? "bg-gradient-to-br from-pink-500/20 to-pink-600/15 text-pink-300 border-pink-400/40"
        : "bg-gradient-to-br from-pink-50/95 to-pink-100/80 text-pink-800 border-pink-200/70",
      indigo: isDark
        ? "bg-gradient-to-br from-indigo-500/20 to-indigo-600/15 text-indigo-300 border-indigo-400/40"
        : "bg-gradient-to-br from-indigo-50/95 to-indigo-100/80 text-indigo-800 border-indigo-200/70",
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const getStatusColor = (status: string, isDark: boolean) => {
    const colors = {
      planning: isDark
        ? "bg-yellow-500/20 text-yellow-300 border-yellow-400/40"
        : "bg-yellow-100/80 text-yellow-800 border-yellow-200/70",
      active: isDark
        ? "bg-green-500/20 text-green-300 border-green-400/40"
        : "bg-green-100/80 text-green-800 border-green-200/70",
      completed: isDark
        ? "bg-blue-500/20 text-blue-300 border-blue-400/40"
        : "bg-blue-100/80 text-blue-800 border-blue-200/70",
      "on-hold": isDark
        ? "bg-gray-500/20 text-gray-300 border-gray-400/40"
        : "bg-gray-100/80 text-gray-700 border-gray-200/70",
    };
    return colors[status as keyof typeof colors] || colors.active;
  };

  const getPriorityColor = (priority: string, isDark: boolean) => {
    const colors = {
      urgent: isDark
        ? "bg-red-500/20 text-red-300 border-red-400/40"
        : "bg-red-100/80 text-red-800 border-red-200/70",
      normal: isDark
        ? "bg-blue-500/20 text-blue-300 border-blue-400/40"
        : "bg-blue-100/80 text-blue-800 border-blue-200/70",
      low: isDark
        ? "bg-green-500/20 text-green-300 border-green-400/40"
        : "bg-green-100/80 text-green-800 border-green-200/70",
    };
    return colors[priority as keyof typeof colors] || colors.normal;
  };

  const toggleCategory = (categoryId: string) => {
    setCategories(
      categories.map((cat) =>
        cat.id === categoryId ? { ...cat, isExpanded: !cat.isExpanded } : cat,
      ),
    );
  };

  const filteredProjects = mockProjects.filter((project) => {
    const matchesSearch =
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString([], {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="flex h-full overflow-hidden">
      {/* Projects Sidebar */}
      <div className={`w-80 ${themeClasses.sidebar} flex flex-col`}>
        {/* Header */}
        <div className="p-4 border-b border-gray-200/20">
          <h2 className={`text-base font-bold ${themeClasses.text.primary}`}>
            Projects
          </h2>
          <p className={`text-xs ${themeClasses.text.tertiary} mt-1`}>
            Manage your project portfolio
          </p>
        </div>

        {/* Search Bar */}
        <div className="p-3 border-b border-gray-200/20">
          <div className="relative">
            <Search
              className={`absolute left-2.5 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 z-10 ${themeClasses.text.tertiary}`}
            />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-9 pr-3 py-2 rounded-lg border backdrop-blur-md transition-all duration-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/30 ${themeClasses.search}`}
            />
          </div>
        </div>

        {/* Categories Section */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-3">
            <div className="flex items-center justify-between mb-3">
              <h3
                className={`text-xs font-semibold uppercase tracking-wide ${themeClasses.text.secondary}`}
              >
                Categories
              </h3>
              <button className="p-1 rounded hover:bg-gray-100/10 transition-colors">
                <Plus className={`w-3.5 h-3.5 ${themeClasses.text.tertiary}`} />
              </button>
            </div>

            <div className="space-y-1">
              {categories.map((category) => {
                const Icon = category.icon || Folder;
                const isSelected = selectedCategory?.id === category.id;

                return (
                  <div key={category.id}>
                    <div
                      className={`w-full p-2.5 rounded-lg transition-all duration-200 flex items-center space-x-2 group cursor-pointer ${
                        isSelected
                          ? getCategoryColor(category.color, isDarkMode)
                          : isDarkMode
                            ? "hover:bg-gray-800/60 text-gray-300"
                            : "hover:bg-gray-100/60 text-gray-700"
                      }`}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleCategory(category.id);
                        }}
                        className="p-0.5 rounded hover:bg-black/10 transition-colors"
                      >
                        {category.isExpanded ? (
                          <ChevronDown className="w-3 h-3" />
                        ) : (
                          <ChevronRight className="w-3 h-3" />
                        )}
                      </button>
                      <div
                        onClick={() => {
                          setSelectedCategory(category);
                          setSelectedProject(null);
                        }}
                        className="flex items-center space-x-2 flex-1 cursor-pointer"
                      >
                        <Icon className="w-4 h-4 flex-shrink-0" />
                        <div className="flex-1 text-left">
                          <div className="text-xs font-medium truncate">
                            {category.name}
                          </div>
                          <div
                            className={`text-xs opacity-60 ${themeClasses.text.tertiary}`}
                          >
                            {category.projectCount} projects
                          </div>
                        </div>
                      </div>
                      <button className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-black/10 transition-all">
                        <MoreHorizontal className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Projects list for expanded categories */}
                    {category.isExpanded && (
                      <div className="ml-4 mt-1 space-y-1">
                        {filteredProjects.slice(0, 3).map((project) => (
                          <button
                            key={project.id}
                            onClick={() => setSelectedProject(project)}
                            className={`w-full p-2 rounded-lg transition-all duration-200 text-left group ${
                              selectedProject?.id === project.id
                                ? isDarkMode
                                  ? "bg-purple-500/20 text-purple-300 border border-purple-400/40"
                                  : "bg-purple-100/80 text-purple-800 border border-purple-200/70"
                                : isDarkMode
                                  ? "hover:bg-gray-800/50 text-gray-400"
                                  : "hover:bg-gray-100/50 text-gray-600"
                            }`}
                          >
                            <div className="flex items-start space-x-2">
                              <Target className="w-3 h-3 mt-0.5 flex-shrink-0 opacity-70" />
                              <div className="min-w-0 flex-1">
                                <div className="text-xs font-medium truncate">
                                  {project.name}
                                </div>
                                <div className="flex items-center space-x-2 mt-0.5">
                                  <span
                                    className={`text-xs px-1.5 py-0.5 rounded font-medium ${getStatusColor(project.status, isDarkMode)}`}
                                  >
                                    {project.status}
                                  </span>
                                  <span
                                    className={`text-xs opacity-60 ${themeClasses.text.tertiary}`}
                                  >
                                    {project.progress}%
                                  </span>
                                </div>
                              </div>
                              {project.isFavorite && (
                                <Star className="w-3 h-3 text-yellow-500 fill-current flex-shrink-0" />
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* New Project Button */}
        <div className="p-3 border-t border-gray-200/20">
          <button className="w-full flex items-center justify-center px-3 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 shadow-md shadow-purple-500/30 hover:shadow-lg hover:shadow-purple-500/40 transform hover:-translate-y-0.5 font-medium backdrop-blur-sm">
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </button>
        </div>
      </div>

      {/* Main Project Area */}
      <main className="flex-1 overflow-hidden flex flex-col">
        {selectedProject ? (
          <>
            {/* Project Header */}
            <div className={`p-4 border-b ${themeClasses.projectArea}`}>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h1
                    className={`text-xl font-bold ${themeClasses.text.primary}`}
                  >
                    {selectedProject.name}
                  </h1>
                  <p className={`text-sm mt-1 ${themeClasses.text.secondary}`}>
                    {selectedProject.description}
                  </p>
                  <div className="flex items-center space-x-4 mt-3">
                    <span
                      className={`text-xs px-2 py-1 rounded font-medium ${getStatusColor(selectedProject.status, isDarkMode)}`}
                    >
                      {selectedProject.status}
                    </span>
                    <span
                      className={`text-xs px-2 py-1 rounded font-medium ${getPriorityColor(selectedProject.priority, isDarkMode)}`}
                    >
                      {selectedProject.priority}
                    </span>
                    <div className="flex items-center space-x-1">
                      {selectedProject.tags.map((tag) => (
                        <span
                          key={tag}
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            isDarkMode
                              ? "bg-gray-700/60 text-gray-300"
                              : "bg-gray-200/80 text-gray-700"
                          }`}
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    className={`p-2 rounded-lg transition-colors ${
                      selectedProject.isFavorite
                        ? "text-yellow-500"
                        : isDarkMode
                          ? "text-gray-400 hover:text-yellow-500"
                          : "text-gray-600 hover:text-yellow-500"
                    }`}
                  >
                    <Star
                      className={`w-5 h-5 ${selectedProject.isFavorite ? "fill-current" : ""}`}
                    />
                  </button>
                  <button
                    className={`p-2 rounded-lg transition-colors ${
                      isDarkMode
                        ? "text-gray-400 hover:text-purple-400 hover:bg-gray-800/60"
                        : "text-gray-600 hover:text-purple-600 hover:bg-gray-100/60"
                    }`}
                  >
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Project Details */}
            <div className="flex-1 overflow-auto p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Progress Card */}
                <div
                  className={`p-4 rounded-lg border backdrop-blur-md ${
                    isDarkMode
                      ? "bg-gray-800/60 border-gray-700/60"
                      : "bg-white/60 border-gray-200/60"
                  }`}
                >
                  <div className="flex items-center space-x-2 mb-3">
                    <Activity
                      className={`w-4 h-4 ${themeClasses.text.secondary}`}
                    />
                    <h3
                      className={`text-sm font-semibold ${themeClasses.text.primary}`}
                    >
                      Progress
                    </h3>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className={themeClasses.text.secondary}>
                        Completion
                      </span>
                      <span className={themeClasses.text.primary}>
                        {selectedProject.progress}%
                      </span>
                    </div>
                    <div
                      className={`w-full rounded-full h-2 ${isDarkMode ? "bg-gray-700" : "bg-gray-200"}`}
                    >
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500"
                        style={{ width: `${selectedProject.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Team Card */}
                <div
                  className={`p-4 rounded-lg border backdrop-blur-md ${
                    isDarkMode
                      ? "bg-gray-800/60 border-gray-700/60"
                      : "bg-white/60 border-gray-200/60"
                  }`}
                >
                  <div className="flex items-center space-x-2 mb-3">
                    <Users
                      className={`w-4 h-4 ${themeClasses.text.secondary}`}
                    />
                    <h3
                      className={`text-sm font-semibold ${themeClasses.text.primary}`}
                    >
                      Team
                    </h3>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className={themeClasses.text.secondary}>
                        Team Size
                      </span>
                      <span className={themeClasses.text.primary}>
                        {selectedProject.teamSize} members
                      </span>
                    </div>
                  </div>
                </div>

                {/* Timeline Card */}
                <div
                  className={`p-4 rounded-lg border backdrop-blur-md ${
                    isDarkMode
                      ? "bg-gray-800/60 border-gray-700/60"
                      : "bg-white/60 border-gray-200/60"
                  }`}
                >
                  <div className="flex items-center space-x-2 mb-3">
                    <Calendar
                      className={`w-4 h-4 ${themeClasses.text.secondary}`}
                    />
                    <h3
                      className={`text-sm font-semibold ${themeClasses.text.primary}`}
                    >
                      Timeline
                    </h3>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className={themeClasses.text.secondary}>
                        Deadline
                      </span>
                      <span className={themeClasses.text.primary}>
                        {formatDate(selectedProject.deadline)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Budget Card */}
                <div
                  className={`p-4 rounded-lg border backdrop-blur-md ${
                    isDarkMode
                      ? "bg-gray-800/60 border-gray-700/60"
                      : "bg-white/60 border-gray-200/60"
                  }`}
                >
                  <div className="flex items-center space-x-2 mb-3">
                    <TrendingUp
                      className={`w-4 h-4 ${themeClasses.text.secondary}`}
                    />
                    <h3
                      className={`text-sm font-semibold ${themeClasses.text.primary}`}
                    >
                      Budget
                    </h3>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className={themeClasses.text.secondary}>
                        Total Budget
                      </span>
                      <span className={themeClasses.text.primary}>
                        {selectedProject.budget}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Project Description */}
              <div
                className={`mt-6 p-4 rounded-lg border backdrop-blur-md ${
                  isDarkMode
                    ? "bg-gray-800/60 border-gray-700/60"
                    : "bg-white/60 border-gray-200/60"
                }`}
              >
                <h3
                  className={`text-sm font-semibold mb-3 ${themeClasses.text.primary}`}
                >
                  Project Details
                </h3>
                <p
                  className={`text-sm leading-relaxed ${themeClasses.text.secondary}`}
                >
                  {selectedProject.description}
                </p>
              </div>
            </div>
          </>
        ) : (
          /* Empty State */
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Target
                className={`w-16 h-16 mx-auto mb-4 opacity-40 ${themeClasses.text.tertiary}`}
              />
              <h3
                className={`text-lg font-semibold mb-2 ${themeClasses.text.primary}`}
              >
                Select a project to view
              </h3>
              <p className={`text-sm ${themeClasses.text.tertiary} mb-4`}>
                Choose a project from the sidebar or create a new one
              </p>
              <button className="flex items-center justify-center px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 shadow-md shadow-purple-500/30 hover:shadow-lg hover:shadow-purple-500/40 transform hover:-translate-y-0.5 font-medium backdrop-blur-sm mx-auto">
                <Plus className="w-4 h-4 mr-2" />
                Create New Project
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
