"use client";

import React, { useMemo } from "react";
import {
  Plus,
  ArrowRight,
  Target,
  Loader2,
  Calendar,
  CheckSquare,
  Clock,
  Sparkles,
} from "lucide-react";
import { useTheme } from "@/components/AppLayout";
import { useAuthActions } from "@convex-dev/auth/react";
import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import TaskModal from "../components/TaskModal";
import { Id } from "@/convex/_generated/dataModel";

// Clean, minimal components
const SimpleCard = ({
  children,
  className = "",
  isDarkMode,
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  isDarkMode: boolean;
  onClick?: () => void;
}) => (
  <div
    className={`
      p-6 rounded-2xl border transition-all duration-200 
      ${onClick ? "cursor-pointer hover:scale-[1.01] hover:shadow-md" : ""}
      ${
        isDarkMode
          ? "bg-gray-900 border-gray-800"
          : "bg-white border-gray-100 shadow-sm"
      }
      ${className}
    `}
    onClick={onClick}
  >
    {children}
  </div>
);

const FocusButton = ({
  children,
  variant = "primary",
  isDarkMode,
  onClick,
  className = "",
}: {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  isDarkMode: boolean;
  onClick?: () => void;
  className?: string;
}) => {
  const variants = {
    primary:
      "bg-blue-500 text-white hover:bg-blue-600 shadow-lg shadow-blue-500/25",
    secondary: isDarkMode
      ? "bg-gray-800 text-gray-200 hover:bg-gray-700 border border-gray-700"
      : "bg-gray-50 text-gray-900 hover:bg-gray-100 border border-gray-200",
    ghost: isDarkMode
      ? "text-gray-400 hover:text-gray-200 hover:bg-gray-800/50"
      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50",
  };

  return (
    <button
      onClick={onClick}
      className={`
        inline-flex items-center justify-center px-6 py-3 rounded-xl font-medium 
        transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        ${variants[variant]} ${className}
      `}
    >
      {children}
    </button>
  );
};

interface Task {
  _id: Id<"tasks">;
  title: string;
  description?: string;
  status: string;
  priority?: string;
  dueDate?: number;
  projectId?: Id<"projects">;
  columnId?: Id<"columns">;
  position: number;
  userId: Id<"users">;
  assignedTo?: Id<"users">;
  tags?: string[];
  timeEstimate?: number;
  completedAt?: number;
  createdAt: number;
  updatedAt: number;
}

const TodayTask = ({
  task,
  isDarkMode,
  onClick,
}: {
  task: Task;
  isDarkMode: boolean;
  onClick?: () => void;
}) => (
  <div
    className={`
      group p-4 rounded-xl border cursor-pointer transition-all duration-200 hover:scale-[1.01]
      ${
        isDarkMode
          ? "bg-gray-800 border-gray-700 hover:border-gray-600"
          : "bg-gray-50 border-gray-200 hover:border-gray-300 hover:shadow-sm"
      }
    `}
    onClick={onClick}
  >
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <h3
          className={`font-medium text-base ${isDarkMode ? "text-white" : "text-gray-900"}`}
        >
          {task.title}
        </h3>
        {task.description && (
          <p
            className={`text-sm mt-1 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
          >
            {task.description}
          </p>
        )}
      </div>
      <ArrowRight
        className={`w-4 h-4 transition-transform group-hover:translate-x-1 ${
          isDarkMode ? "text-gray-500" : "text-gray-400"
        }`}
      />
    </div>
  </div>
);

function AuthenticatedContent() {
  const { isDarkMode } = useTheme();
  const { signOut } = useAuthActions();

  // Optimize currentDate to prevent unnecessary re-renders
  const currentDate = useMemo(() => new Date(), []);

  // Fetch minimal data needed for focus
  const projects = useQuery(api.projects.getProjects, {});
  const boards = useQuery(api.tasks.getBoards);
  const defaultBoard = boards?.[0];
  const columns = useQuery(
    api.tasks.getColumns,
    defaultBoard ? { boardId: defaultBoard._id } : "skip",
  );

  // Get today's events for context
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const todayEvents = useQuery(api.calendar.getEvents, {
    startDate: todayStart.getTime(),
    endDate: todayEnd.getTime(),
  });

  // Get pending tasks (focus on action, not management)
  const pendingTasks = useQuery(
    api.tasks.getTasks,
    columns?.[0] ? { columnId: columns[0]._id } : "skip",
  );

  // Mutations
  const createSampleData = useMutation(api.sampleData.createSampleData);

  // Task modal state
  const [taskModalState, setTaskModalState] = React.useState<{
    isOpen: boolean;
    mode: "create" | "edit";
    columnId?: Id<"columns">;
    taskId?: Id<"tasks">;
  }>({
    isOpen: false,
    mode: "create",
  });

  const handleLogout = async () => {
    await signOut();
  };

  const handleCreateSampleData = async () => {
    try {
      await createSampleData({});
    } catch (error) {
      console.error("Error creating sample data:", error);
    }
  };

  const closeTaskModal = () => {
    setTaskModalState({
      isOpen: false,
      mode: "create",
    });
  };

  // Focus on today's important items only
  const todaysFocus = useMemo(() => {
    const tasks = pendingTasks?.slice(0, 3) || [];
    const events = todayEvents?.slice(0, 2) || [];
    return { tasks, events, hasContent: tasks.length > 0 || events.length > 0 };
  }, [pendingTasks, todayEvents]);

  const timeGreeting = useMemo(() => {
    const hour = currentDate.getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  }, [currentDate]);

  // Show loading state
  if (!projects || todayEvents === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
          <span
            className={`text-lg ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
          >
            Loading your workspace...
          </span>
        </div>
      </div>
    );
  }

  const isNewUser = !projects || projects.length === 0;

  return (
    <div className="min-h-screen">
      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Header - Simple and focused */}
        <div className="text-center mb-12">
          <h1
            className={`text-4xl font-bold mb-3 ${isDarkMode ? "text-white" : "text-gray-900"}`}
          >
            {timeGreeting}
          </h1>
          <p
            className={`text-xl ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
          >
            {isNewUser
              ? "Ready to focus on what matters?"
              : "What will you accomplish today?"}
          </p>
        </div>

        {/* New User - Simple Welcome */}
        {isNewUser ? (
          <div className="space-y-8">
            <SimpleCard
              isDarkMode={isDarkMode}
              className="text-center max-w-2xl mx-auto"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h2
                className={`text-2xl font-semibold mb-4 ${isDarkMode ? "text-white" : "text-gray-900"}`}
              >
                Welcome to Renko
              </h2>
              <p
                className={`text-lg mb-8 leading-relaxed ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
              >
                Your AI-powered productivity platform that learns your patterns
                and helps you focus on doing, not planning.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <FocusButton
                  variant="primary"
                  isDarkMode={isDarkMode}
                  onClick={handleCreateSampleData}
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Explore with Sample Data
                </FocusButton>
                <FocusButton
                  variant="secondary"
                  isDarkMode={isDarkMode}
                  onClick={() =>
                    setTaskModalState({ isOpen: true, mode: "create" })
                  }
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Create Your First Task
                </FocusButton>
              </div>
            </SimpleCard>

            {/* Subtle feature preview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
              <div className="text-center">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 ${
                    isDarkMode ? "bg-gray-800" : "bg-gray-100"
                  }`}
                >
                  <Target
                    className={`w-6 h-6 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                  />
                </div>
                <h3
                  className={`font-medium mb-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}
                >
                  Smart Focus
                </h3>
                <p
                  className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                >
                  AI learns your patterns and suggests what to work on next
                </p>
              </div>
              <div className="text-center">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 ${
                    isDarkMode ? "bg-gray-800" : "bg-gray-100"
                  }`}
                >
                  <Calendar
                    className={`w-6 h-6 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                  />
                </div>
                <h3
                  className={`font-medium mb-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}
                >
                  Connected
                </h3>
                <p
                  className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                >
                  Tasks, calendar, and notes work together seamlessly
                </p>
              </div>
              <div className="text-center">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 ${
                    isDarkMode ? "bg-gray-800" : "bg-gray-100"
                  }`}
                >
                  <Sparkles
                    className={`w-6 h-6 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                  />
                </div>
                <h3
                  className={`font-medium mb-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}
                >
                  AI-Powered
                </h3>
                <p
                  className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                >
                  Intelligent suggestions reduce planning time by 80%
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Existing User - Today's Focus */
          <div className="space-y-8">
            {/* Today's Focus Section */}
            {todaysFocus.hasContent ? (
              <SimpleCard isDarkMode={isDarkMode}>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full bg-green-500`} />
                    <h2
                      className={`text-xl font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}
                    >
                      Today&apos;s Focus
                    </h2>
                  </div>
                  <span
                    className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                  >
                    {currentDate.toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>

                <div className="space-y-3">
                  {/* Today's Events */}
                  {todaysFocus.events.map((event) => (
                    <div
                      key={event._id}
                      className={`flex items-center p-3 rounded-lg border-l-4 border-l-blue-500 ${
                        isDarkMode ? "bg-gray-800" : "bg-blue-50"
                      }`}
                    >
                      <Clock
                        className={`w-4 h-4 mr-3 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                      />
                      <div className="flex-1">
                        <p
                          className={`font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}
                        >
                          {event.title}
                        </p>
                        <p
                          className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                        >
                          {new Date(event.startDate).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  ))}

                  {/* Today's Tasks */}
                  {todaysFocus.tasks.map((task) => (
                    <TodayTask
                      key={task._id}
                      task={task}
                      isDarkMode={isDarkMode}
                      onClick={() =>
                        setTaskModalState({
                          isOpen: true,
                          mode: "edit",
                          taskId: task._id,
                        })
                      }
                    />
                  ))}
                </div>
              </SimpleCard>
            ) : (
              /* No content today - encourage action */
              <SimpleCard isDarkMode={isDarkMode} className="text-center">
                <div
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 ${
                    isDarkMode ? "bg-gray-800" : "bg-gray-100"
                  }`}
                >
                  <CheckSquare
                    className={`w-8 h-8 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                  />
                </div>
                <h2
                  className={`text-xl font-semibold mb-3 ${isDarkMode ? "text-white" : "text-gray-900"}`}
                >
                  Your day is wide open
                </h2>
                <p
                  className={`text-base mb-6 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                >
                  Perfect time to focus on what matters most.
                </p>
                <FocusButton
                  variant="primary"
                  isDarkMode={isDarkMode}
                  onClick={() =>
                    setTaskModalState({ isOpen: true, mode: "create" })
                  }
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Add Something Important
                </FocusButton>
              </SimpleCard>
            )}

            {/* Quick Access - Minimal */}
            <div className="flex justify-center space-x-4">
              <FocusButton
                variant="secondary"
                isDarkMode={isDarkMode}
                onClick={() =>
                  setTaskModalState({ isOpen: true, mode: "create" })
                }
              >
                <Plus className="w-4 h-4 mr-2" />
                New Task
              </FocusButton>
              <FocusButton variant="ghost" isDarkMode={isDarkMode}>
                <Calendar className="w-4 h-4 mr-2" />
                Calendar
              </FocusButton>
              <FocusButton
                variant="ghost"
                isDarkMode={isDarkMode}
                onClick={() => (window.location.href = "/boards")}
              >
                View All Projects
                <ArrowRight className="w-4 h-4 ml-2" />
              </FocusButton>
            </div>
          </div>
        )}

        {/* Subtle user menu */}
        <div className="text-center mt-16">
          <FocusButton
            variant="ghost"
            isDarkMode={isDarkMode}
            onClick={handleLogout}
          >
            Sign Out
          </FocusButton>
        </div>
      </main>

      {/* Task Modal */}
      {taskModalState.isOpen && (
        <TaskModal
          isOpen={taskModalState.isOpen}
          onClose={closeTaskModal}
          mode={taskModalState.mode}
          taskId={taskModalState.taskId}
          columnId={taskModalState.columnId}
        />
      )}
    </div>
  );
}

export default function Home() {
  return (
    <>
      <Authenticated>
        <AuthenticatedContent />
      </Authenticated>

      <Unauthenticated>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Target className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-3">Renko</h1>
            <p className="text-gray-600 mb-8">Focus on doing, not planning</p>
            <a
              href="/signin"
              className="inline-flex items-center justify-center px-6 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors"
            >
              Sign In
            </a>
          </div>
        </div>
      </Unauthenticated>

      <AuthLoading>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="flex items-center space-x-3">
            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            <span className="text-lg text-gray-700">Loading...</span>
          </div>
        </div>
      </AuthLoading>
    </>
  );
}
