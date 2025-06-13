"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  Target,
  Calendar,
  Clock,
  TrendingUp,
  Flame,
  CheckCircle,
  XCircle,
  Sun,
  Moon,
  Coffee,
  Dumbbell,
  Book,
  Brain,
  Heart,
  Play,
  Pause,
  Settings,
  Copy,
  Edit3,
  Star,
  Users,
  Sparkles,
  Timer,
  BarChart3,
  Zap,
} from "lucide-react";
import { useTheme } from "@/components/AppLayout";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

interface RoutineBlock {
  id: string;
  name: string;
  description: string;
  duration: number; // minutes
  category: "wellness" | "health" | "learning" | "productivity" | "personal";
  energyLevel: "high" | "medium" | "low";
  color: string;
  icon: React.ComponentType<{ className?: string }>;
  isCompleted: boolean;
  streak: number;
  bestStreak: number;
}

interface Routine {
  id: string;
  name: string;
  description: string;
  timeOfDay: "morning" | "afternoon" | "evening" | "anytime";
  blocks: RoutineBlock[];
  totalDuration: number;
  completionRate: number;
  isActive: boolean;
  lastCompleted: string;
}

interface RoutineTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  estimatedTime: number;
  difficulty: "beginner" | "intermediate" | "advanced";
  blocks: Omit<RoutineBlock, "id" | "isCompleted" | "streak" | "bestStreak">[];
  popularity: number;
  tags: string[];
}

// Mock data
const mockTemplates: RoutineTemplate[] = [
  {
    id: "t1",
    name: "Power Morning",
    description: "High-energy morning routine to kickstart your day",
    category: "Morning",
    estimatedTime: 45,
    difficulty: "intermediate",
    popularity: 4.8,
    tags: ["energizing", "productive", "wellness"],
    blocks: [
      {
        name: "Hydrate",
        description: "Drink 16oz of water",
        duration: 2,
        category: "health",
        energyLevel: "low",
        color: "blue",
        icon: Coffee,
      },
      {
        name: "Meditation",
        description: "10 minutes mindfulness",
        duration: 10,
        category: "wellness",
        energyLevel: "low",
        color: "purple",
        icon: Brain,
      },
      {
        name: "Exercise",
        description: "20 minutes workout",
        duration: 20,
        category: "health",
        energyLevel: "high",
        color: "green",
        icon: Dumbbell,
      },
      {
        name: "Journal",
        description: "Gratitude & intentions",
        duration: 8,
        category: "wellness",
        energyLevel: "medium",
        color: "purple",
        icon: Edit3,
      },
      {
        name: "Review Goals",
        description: "Check daily priorities",
        duration: 5,
        category: "productivity",
        energyLevel: "medium",
        color: "orange",
        icon: Target,
      },
    ],
  },
  {
    id: "t2",
    name: "Evening Wind Down",
    description: "Peaceful routine to prepare for restful sleep",
    category: "Evening",
    estimatedTime: 30,
    difficulty: "beginner",
    popularity: 4.6,
    tags: ["relaxing", "sleep", "wellness"],
    blocks: [
      {
        name: "Digital Sunset",
        description: "Put away all devices",
        duration: 1,
        category: "wellness",
        energyLevel: "low",
        color: "orange",
        icon: Moon,
      },
      {
        name: "Herbal Tea",
        description: "Chamomile or passionflower",
        duration: 5,
        category: "wellness",
        energyLevel: "low",
        color: "green",
        icon: Coffee,
      },
      {
        name: "Reading",
        description: "20 minutes of fiction",
        duration: 20,
        category: "learning",
        energyLevel: "low",
        color: "blue",
        icon: Book,
      },
      {
        name: "Reflection",
        description: "Review the day",
        duration: 4,
        category: "wellness",
        energyLevel: "low",
        color: "purple",
        icon: Heart,
      },
    ],
  },
  {
    id: "t3",
    name: "Focus Flow",
    description: "Deep work preparation routine",
    category: "Productivity",
    estimatedTime: 15,
    difficulty: "beginner",
    popularity: 4.4,
    tags: ["focus", "productivity", "concentration"],
    blocks: [
      {
        name: "Environment Setup",
        description: "Clean & organize workspace",
        duration: 5,
        category: "productivity",
        energyLevel: "medium",
        color: "orange",
        icon: Settings,
      },
      {
        name: "Breathing Exercise",
        description: "4-7-8 breathing technique",
        duration: 3,
        category: "wellness",
        energyLevel: "low",
        color: "purple",
        icon: Brain,
      },
      {
        name: "Intention Setting",
        description: "Define focus goals",
        duration: 7,
        category: "productivity",
        energyLevel: "medium",
        color: "orange",
        icon: Target,
      },
    ],
  },
];

// Mock data removed - now using real Convex data

export default function RoutinesPage() {
  const { isDarkMode } = useTheme();
  const [activeTab, setActiveTab] = useState<
    "my-routines" | "templates" | "builder" | "insights"
  >("my-routines");

  // Real data from Convex - temporarily disabled while system is being built
  // const routines = useQuery(api.routines.getRoutines, {}) || [];
  // const templates = useQuery(api.routines.getTemplates, {}) || [];
  // const insights = useQuery(api.routines.getInsights, {}) || {
  const routines: any[] = []; // Temporary placeholder
  const templates: any[] = []; // Temporary placeholder
  const insights = {
    totalActiveRoutines: 0,
    averageCompletionRate: 0,
    currentStreaks: [],
    weeklyProgress: [],
    energyOptimization: {
      peakEnergyTime: undefined,
      lowEnergyTime: undefined,
      averageEnergyByHour: [],
    },
    timeInvested: 0,
  };

  // Mutations
  const createRoutineMutation = useMutation(api.routines.createRoutine);
  const completeBlockMutation = useMutation(api.routines.completeBlock);

  const [selectedTemplate, setSelectedTemplate] =
    useState<RoutineTemplate | null>(null);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [timeElapsed, setTimeElapsed] = useState(0);

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (currentlyPlaying) {
      interval = setInterval(() => {
        setTimeElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [currentlyPlaying]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getEnergyBg = (level: string, isDark: boolean) => {
    switch (level) {
      case "high":
        return isDark
          ? "bg-red-500/20 border-red-400/40"
          : "bg-red-100 border-red-300/60";
      case "medium":
        return isDark
          ? "bg-yellow-500/20 border-yellow-400/40"
          : "bg-yellow-100 border-yellow-300/60";
      case "low":
        return isDark
          ? "bg-green-500/20 border-green-400/40"
          : "bg-green-100 border-green-300/60";
      default:
        return isDark
          ? "bg-gray-500/20 border-gray-400/40"
          : "bg-gray-100 border-gray-300/60";
    }
  };

  const playRoutine = (routineId: string) => {
    setCurrentlyPlaying(routineId);
    setTimeElapsed(0);
  };

  const pauseRoutine = () => {
    setCurrentlyPlaying(null);
  };

  const RoutineCard = ({ routine }: { routine: Routine }) => (
    <div
      className={`rounded-2xl backdrop-blur-xl border shadow-xl p-6 transition-all duration-300 hover:shadow-2xl ${
        isDarkMode
          ? "bg-gray-900/60 border-gray-800/60 shadow-black/25 hover:bg-gray-900/70"
          : "bg-white/90 border-gray-200/60 shadow-gray-900/15 hover:bg-white/95"
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <div
              className={`p-2 rounded-xl ${
                routine.timeOfDay === "morning"
                  ? "bg-yellow-500/20 text-yellow-400"
                  : routine.timeOfDay === "afternoon"
                    ? "bg-blue-500/20 text-blue-400"
                    : routine.timeOfDay === "evening"
                      ? "bg-purple-500/20 text-purple-400"
                      : "bg-gray-500/20 text-gray-400"
              }`}
            >
              {routine.timeOfDay === "morning" ? (
                <Sun className="w-5 h-5" />
              ) : routine.timeOfDay === "afternoon" ? (
                <Sun className="w-5 h-5" />
              ) : routine.timeOfDay === "evening" ? (
                <Moon className="w-5 h-5" />
              ) : (
                <Clock className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3
                className={`text-xl font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}
              >
                {routine.name}
              </h3>
              <p
                className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
              >
                {routine.description}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4 mb-4">
            <div
              className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
            >
              <span className="font-medium">
                {formatDuration(routine.totalDuration)}
              </span>
            </div>
            <div
              className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
            >
              <span className="font-medium">{routine.completionRate}%</span>{" "}
              completion
            </div>
            <div
              className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
            >
              {routine.blocks.length} blocks
            </div>
          </div>

          {/* Progress bar */}
          <div
            className={`w-full h-2 rounded-full mb-4 ${isDarkMode ? "bg-gray-700/50" : "bg-gray-200/50"}`}
          >
            <div
              className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 transition-all duration-300"
              style={{ width: `${routine.completionRate}%` }}
            />
          </div>

          {/* Blocks timeline */}
          <div className="space-y-2 mb-4">
            {routine.blocks.map((block, index) => (
              <div key={block.id} className="flex items-center space-x-3">
                <div
                  className={`p-2 rounded-lg border ${getEnergyBg(block.energyLevel, isDarkMode)}`}
                >
                  <block.icon className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
                    >
                      {block.name}
                    </span>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                      >
                        {block.duration}m
                      </span>
                      {block.isCompleted && (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      )}
                    </div>
                  </div>
                  <p
                    className={`text-xs ${isDarkMode ? "text-gray-500" : "text-gray-500"}`}
                  >
                    {block.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col space-y-2 ml-4">
          <button
            onClick={() =>
              currentlyPlaying === routine.id
                ? pauseRoutine()
                : playRoutine(routine.id)
            }
            className={`p-3 rounded-xl transition-all duration-200 ${
              isDarkMode
                ? "bg-purple-600/90 hover:bg-purple-600 text-white shadow-purple-500/25"
                : "bg-purple-600 hover:bg-purple-700 text-white shadow-purple-500/25"
            }`}
          >
            {currentlyPlaying === routine.id ? (
              <Pause className="w-5 h-5" />
            ) : (
              <Play className="w-5 h-5" />
            )}
          </button>
          <button
            className={`p-2 rounded-lg transition-all duration-200 ${
              isDarkMode
                ? "bg-gray-700/50 hover:bg-gray-600/50 text-gray-300"
                : "bg-gray-100 hover:bg-gray-200 text-gray-600"
            }`}
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {currentlyPlaying === routine.id && (
        <div
          className={`mt-4 p-4 rounded-xl border ${
            isDarkMode
              ? "bg-purple-900/20 border-purple-400/40"
              : "bg-purple-50 border-purple-200/60"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span
              className={`text-sm font-medium ${isDarkMode ? "text-purple-300" : "text-purple-700"}`}
            >
              Currently Running
            </span>
            <span
              className={`text-lg font-mono font-bold ${isDarkMode ? "text-purple-300" : "text-purple-700"}`}
            >
              {formatTime(timeElapsed)}
            </span>
          </div>
          <div className="text-xs text-gray-500">
            Next:{" "}
            {routine.blocks.find((b) => !b.isCompleted)?.name || "Complete!"}
          </div>
        </div>
      )}
    </div>
  );

  const TemplateCard = ({ template }: { template: RoutineTemplate }) => (
    <div
      className={`rounded-2xl backdrop-blur-xl border shadow-xl p-6 transition-all duration-300 hover:shadow-2xl cursor-pointer ${
        isDarkMode
          ? "bg-gray-900/60 border-gray-800/60 shadow-black/25 hover:bg-gray-900/70"
          : "bg-white/90 border-gray-200/60 shadow-gray-900/15 hover:bg-white/95"
      }`}
      onClick={() => setSelectedTemplate(template)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h3
              className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}
            >
              {template.name}
            </h3>
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 text-yellow-500 fill-current" />
              <span
                className={`text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
              >
                {template.popularity}
              </span>
            </div>
          </div>
          <p
            className={`text-sm mb-3 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
          >
            {template.description}
          </p>

          <div className="flex items-center space-x-4 mb-3">
            <span
              className={`text-xs px-2 py-1 rounded-lg font-medium border ${
                template.difficulty === "beginner"
                  ? "bg-green-500/20 text-green-400 border-green-400/40"
                  : template.difficulty === "intermediate"
                    ? "bg-yellow-500/20 text-yellow-400 border-yellow-400/40"
                    : "bg-red-500/20 text-red-400 border-red-400/40"
              }`}
            >
              {template.difficulty}
            </span>
            <span
              className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
            >
              {formatDuration(template.estimatedTime)}
            </span>
            <span
              className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
            >
              {template.blocks.length} blocks
            </span>
          </div>

          <div className="flex flex-wrap gap-1 mb-4">
            {template.tags.map((tag) => (
              <span
                key={tag}
                className={`text-xs px-2 py-1 rounded-lg ${
                  isDarkMode
                    ? "bg-gray-700/50 text-gray-300"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-2 ml-4">
          <Users
            className={`w-4 h-4 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
          />
          <span
            className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
          >
            {Math.floor(template.popularity * 1000)}+
          </span>
        </div>
      </div>

      {/* Block preview */}
      <div className="grid grid-cols-3 gap-2">
        {template.blocks.slice(0, 6).map((block, index) => (
          <div
            key={index}
            className={`p-2 rounded-lg text-center border ${getEnergyBg(block.energyLevel, isDarkMode)}`}
          >
            <block.icon className="w-4 h-4 mx-auto mb-1" />
            <div className="text-xs font-medium truncate">{block.name}</div>
            <div className="text-xs text-gray-500">{block.duration}m</div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200/20">
        <button
          className={`w-full px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
            isDarkMode
              ? "bg-purple-600/90 hover:bg-purple-600 text-white"
              : "bg-purple-600 hover:bg-purple-700 text-white"
          }`}
        >
          Use This Template
        </button>
      </div>
    </div>
  );

  return (
    <div
      className={`flex h-screen ${
        isDarkMode
          ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
          : "bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100"
      }`}
    >
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div
          className={`p-6 border-b backdrop-blur-xl ${
            isDarkMode
              ? "bg-gray-900/80 border-gray-700/60"
              : "bg-white/80 border-gray-200/60"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div
                className={`p-3 rounded-xl backdrop-blur-sm border shadow-sm ${
                  isDarkMode
                    ? "bg-gray-800/80 border-gray-700/50 text-purple-400"
                    : "bg-white/80 border-gray-200/60 text-purple-600"
                }`}
              >
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h1
                  className={`text-3xl font-medium ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  Routines
                </h1>
                <p
                  className={`text-sm ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Build powerful daily routines that transform your life
                </p>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex items-center space-x-1">
              {[
                { id: "my-routines", label: "My Routines", icon: Target },
                { id: "templates", label: "Templates", icon: Copy },
                { id: "builder", label: "Builder", icon: Plus },
                { id: "insights", label: "Insights", icon: BarChart3 },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id as any)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                    activeTab === id
                      ? isDarkMode
                        ? "bg-purple-600/90 text-white shadow-purple-500/25"
                        : "bg-purple-600 text-white shadow-purple-500/25"
                      : isDarkMode
                        ? "text-gray-300 hover:bg-gray-700/50"
                        : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm">{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto p-6">
          {activeTab === "my-routines" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2
                  className={`text-2xl font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}
                >
                  Your Routines
                </h2>
                <button
                  onClick={() => setActiveTab("builder")}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 backdrop-blur-sm border shadow-sm ${
                    isDarkMode
                      ? "bg-purple-600/90 hover:bg-purple-600 text-white border-purple-500/50 shadow-purple-500/25"
                      : "bg-purple-600 hover:bg-purple-700 text-white border-purple-500/30 shadow-purple-500/25"
                  }`}
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Routine</span>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {routines.length === 0 ? (
                  <div
                    className={`col-span-2 text-center py-12 rounded-2xl border border-dashed ${
                      isDarkMode
                        ? "border-gray-700 text-gray-400"
                        : "border-gray-300 text-gray-600"
                    }`}
                  >
                    <div
                      className={`inline-flex p-4 rounded-2xl mb-4 ${
                        isDarkMode ? "bg-purple-500/20" : "bg-purple-100"
                      }`}
                    >
                      <Target
                        className={`w-8 h-8 ${
                          isDarkMode ? "text-purple-400" : "text-purple-600"
                        }`}
                      />
                    </div>
                    <h3
                      className={`text-xl font-semibold mb-2 ${
                        isDarkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      No Routines Yet
                    </h3>
                    <p className="mb-6">
                      Create your first routine to start building better habits.
                    </p>
                    <button
                      className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                        isDarkMode
                          ? "bg-purple-600/90 hover:bg-purple-600 text-white"
                          : "bg-purple-600 hover:bg-purple-700 text-white"
                      }`}
                    >
                      Create First Routine
                    </button>
                  </div>
                ) : (
                  routines.map((routine) => (
                    <RoutineCard key={routine._id} routine={routine} />
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === "templates" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2
                  className={`text-2xl font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}
                >
                  Routine Templates
                </h2>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    placeholder="Search templates..."
                    className={`px-4 py-2 rounded-xl border backdrop-blur-sm transition-all duration-200 ${
                      isDarkMode
                        ? "bg-gray-800/70 border-gray-700/60 text-gray-100 placeholder-gray-400 focus:border-purple-500/50"
                        : "bg-white/80 border-gray-200/60 text-gray-800 placeholder-gray-500 focus:border-purple-400/50"
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {templates.map((template) => (
                  <TemplateCard key={template.id} template={template} />
                ))}
              </div>
            </div>
          )}

          {activeTab === "builder" && (
            <div
              className={`rounded-2xl backdrop-blur-xl border shadow-2xl p-8 ${
                isDarkMode
                  ? "bg-gray-900/60 border-gray-800/60 shadow-black/25"
                  : "bg-white/90 border-gray-200/60 shadow-gray-900/15"
              }`}
            >
              <div className="text-center py-12">
                <div
                  className={`inline-flex p-4 rounded-2xl mb-6 ${
                    isDarkMode ? "bg-purple-500/20" : "bg-purple-100"
                  }`}
                >
                  <Plus
                    className={`w-8 h-8 ${isDarkMode ? "text-purple-400" : "text-purple-600"}`}
                  />
                </div>
                <h3
                  className={`text-2xl font-semibold mb-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}
                >
                  Routine Builder
                </h3>
                <p
                  className={`text-lg mb-8 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                >
                  Create your perfect routine from scratch or customize a
                  template
                </p>
                <div className="flex justify-center space-x-4">
                  <button
                    className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                      isDarkMode
                        ? "bg-purple-600/90 hover:bg-purple-600 text-white shadow-purple-500/25"
                        : "bg-purple-600 hover:bg-purple-700 text-white shadow-purple-500/25"
                    }`}
                  >
                    Start from Scratch
                  </button>
                  <button
                    onClick={() => setActiveTab("templates")}
                    className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 border ${
                      isDarkMode
                        ? "border-gray-600 text-gray-300 hover:bg-gray-700/50"
                        : "border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    Use Template
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "insights" && (
            <div className="space-y-6">
              <h2
                className={`text-2xl font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}
              >
                Routine Insights
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  {
                    label: "Active Routines",
                    value: insights.totalActiveRoutines.toString(),
                    icon: Target,
                    color: "purple",
                  },
                  {
                    label: "Avg Completion",
                    value: `${insights.averageCompletionRate}%`,
                    icon: TrendingUp,
                    color: "green",
                  },
                  {
                    label: "Current Streak",
                    value:
                      insights.currentStreaks &&
                      insights.currentStreaks.length > 0 &&
                      insights.currentStreaks[0]
                        ? `${(insights.currentStreaks[0] as any).streak || 0} days`
                        : "0 days",
                    icon: Flame,
                    color: "red",
                  },
                  {
                    label: "Time Invested",
                    value: `${Math.round(insights.timeInvested / 60)}h`,
                    icon: Timer,
                    color: "blue",
                  },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className={`rounded-2xl backdrop-blur-xl border shadow-xl p-6 ${
                      isDarkMode
                        ? "bg-gray-900/60 border-gray-800/60 shadow-black/25"
                        : "bg-white/90 border-gray-200/60 shadow-gray-900/15"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`p-3 rounded-xl ${
                          stat.color === "purple"
                            ? "bg-purple-500/20 text-purple-400"
                            : stat.color === "green"
                              ? "bg-green-500/20 text-green-400"
                              : stat.color === "red"
                                ? "bg-red-500/20 text-red-400"
                                : "bg-blue-500/20 text-blue-400"
                        }`}
                      >
                        <stat.icon className="w-6 h-6" />
                      </div>
                      <div>
                        <p
                          className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}
                        >
                          {stat.value}
                        </p>
                        <p
                          className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                        >
                          {stat.label}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Weekly Progress Chart */}
              <div
                className={`rounded-2xl backdrop-blur-xl border shadow-xl p-6 ${
                  isDarkMode
                    ? "bg-gray-900/60 border-gray-800/60 shadow-black/25"
                    : "bg-white/90 border-gray-200/60 shadow-gray-900/15"
                }`}
              >
                <h3
                  className={`text-xl font-semibold mb-4 ${isDarkMode ? "text-white" : "text-gray-900"}`}
                >
                  Weekly Progress
                </h3>
                <div className="grid grid-cols-7 gap-2">
                  {insights.weeklyProgress.map((dayData, index) => (
                    <div key={dayData.day} className="text-center">
                      <div
                        className={`text-sm font-medium mb-2 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                      >
                        {dayData.day.substring(0, 3)}
                      </div>
                      <div
                        className={`h-20 rounded-lg flex items-end justify-center ${
                          isDarkMode ? "bg-gray-800/50" : "bg-gray-100/50"
                        }`}
                      >
                        <div
                          className="w-full bg-gradient-to-t from-purple-500 to-purple-400 rounded-lg transition-all duration-300"
                          style={{
                            height: `${Math.max(10, (dayData.completions / Math.max(dayData.totalBlocks, 1)) * 100)}%`,
                          }}
                        />
                      </div>
                      <div
                        className={`text-xs mt-1 ${isDarkMode ? "text-gray-500" : "text-gray-600"}`}
                      >
                        {dayData.completions}/{dayData.totalBlocks}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Energy Optimization */}
              <div
                className={`rounded-2xl backdrop-blur-xl border shadow-xl p-6 ${
                  isDarkMode
                    ? "bg-gray-900/60 border-gray-800/60 shadow-black/25"
                    : "bg-white/90 border-gray-200/60 shadow-gray-900/15"
                }`}
              >
                <h3
                  className={`text-xl font-semibold mb-4 ${isDarkMode ? "text-white" : "text-gray-900"}`}
                >
                  Energy Optimization
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-400/20">
                    <div className="flex items-center space-x-3">
                      <Zap className="w-6 h-6 text-yellow-500" />
                      <div>
                        <p
                          className={`font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}
                        >
                          Peak Energy Time
                        </p>
                        <p
                          className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                        >
                          8:00 AM - 10:00 AM
                        </p>
                      </div>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-lg bg-yellow-500/20 text-yellow-400 font-medium">
                      High Energy
                    </span>
                  </div>

                  <div className="text-sm text-gray-500">
                    💡 Schedule high-energy activities like exercise and deep
                    work during your peak hours
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
