"use client";

import React from "react";
import { Loader2, Target } from "lucide-react";
import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";
import TaskModal from "../components/TaskModal";
import WeeklyCalendar from "../components/Calendar";
import { Id } from "@/convex/_generated/dataModel";

function AuthenticatedContent() {
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

  // Listen for create task events from the header
  React.useEffect(() => {
    const handleCreateTask = () => {
      setTaskModalState({ isOpen: true, mode: "create" });
    };

    window.addEventListener("createTask", handleCreateTask);
    return () => window.removeEventListener("createTask", handleCreateTask);
  }, []);

  const closeTaskModal = () => {
    setTaskModalState({
      isOpen: false,
      mode: "create",
    });
  };

  return (
    <>
      <div className="h-full bg-white">
        {/* Calendar - Full Width */}
        <WeeklyCalendar className="h-full" />
      </div>

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
    </>
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
            <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
            <span className="text-sm text-gray-600">Loading...</span>
          </div>
        </div>
      </AuthLoading>
    </>
  );
}
