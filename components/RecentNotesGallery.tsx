import React from "react";
import {
  FileText,
  Calendar,
  CheckSquare,
  Lightbulb,
  Code,
  Image,
  LucideIcon,
} from "lucide-react";

export interface NoteItem {
  id: string;
  title: string;
  content: string;
  type: "text" | "meeting" | "todo" | "idea" | "code" | "image";
  project?: string;
  lastModified: string;
  tags?: string[];
  color?: string;
}

export interface RecentNotesGalleryProps {
  isDarkMode: boolean;
  title: string;
  subtitle?: string;
  icon: LucideIcon;
  notes: NoteItem[];
  onNoteClick?: (noteId: string) => void;
  onAddNote?: () => void;
  height?: string;
}

export default function RecentNotesGallery({
  isDarkMode,
  title,
  subtitle,
  icon: WidgetIcon,
  notes,
  onNoteClick,
  onAddNote,
  height = "450px",
}: RecentNotesGalleryProps) {
  const getNoteTypeIcon = (type: string) => {
    switch (type) {
      case "meeting":
        return Calendar;
      case "todo":
        return CheckSquare;
      case "idea":
        return Lightbulb;
      case "code":
        return Code;
      case "image":
        return Image;
      default:
        return FileText;
    }
  };

  const getNoteTypeColor = (type: string) => {
    switch (type) {
      case "meeting":
        return "blue";
      case "todo":
        return "green";
      case "idea":
        return "purple";
      case "code":
        return "orange";
      case "image":
        return "pink";
      default:
        return "gray";
    }
  };

  const getProjectColor = (project: string): string => {
    const projectColors: Record<string, string> = {
      "Dashboard v2": "blue",
      General: "purple",
      "Client Relations": "green",
      "Product Launch": "orange",
      Marketing: "pink",
      Backend: "blue",
      Analytics: "purple",
      "Design System": "blue",
      "UX Research": "green",
      Mobile: "orange",
      Security: "pink",
      Infrastructure: "purple",
      Personal: "gray",
    };
    return projectColors[project] || "gray";
  };

  const getNoteColorClasses = (note: NoteItem) => {
    const color = note.color || getNoteTypeColor(note.type);
    switch (color) {
      case "blue":
        return isDarkMode
          ? "bg-blue-500/25 text-blue-200 border-blue-400/50 shadow-blue-900/30 hover:bg-blue-500/35 hover:border-blue-400/70"
          : "bg-blue-100/95 text-blue-800 border-blue-300/70 shadow-blue-200/30 hover:bg-blue-200/95 hover:border-blue-400/80";
      case "green":
        return isDarkMode
          ? "bg-green-500/25 text-green-200 border-green-400/50 shadow-green-900/30 hover:bg-green-500/35 hover:border-green-400/70"
          : "bg-green-100/95 text-green-800 border-green-300/70 shadow-green-200/30 hover:bg-green-200/95 hover:border-green-400/80";
      case "orange":
        return isDarkMode
          ? "bg-orange-500/25 text-orange-200 border-orange-400/50 shadow-orange-900/30 hover:bg-orange-500/35 hover:border-orange-400/70"
          : "bg-orange-100/95 text-orange-800 border-orange-300/70 shadow-orange-200/30 hover:bg-orange-200/95 hover:border-orange-400/80";
      case "purple":
        return isDarkMode
          ? "bg-purple-500/25 text-purple-200 border-purple-400/50 shadow-purple-900/30 hover:bg-purple-500/35 hover:border-purple-400/70"
          : "bg-purple-100/95 text-purple-800 border-purple-300/70 shadow-purple-200/30 hover:bg-purple-200/95 hover:border-purple-400/80";
      case "pink":
        return isDarkMode
          ? "bg-pink-500/25 text-pink-200 border-pink-400/50 shadow-pink-900/30 hover:bg-pink-500/35 hover:border-pink-400/70"
          : "bg-pink-100/95 text-pink-800 border-pink-300/70 shadow-pink-200/30 hover:bg-pink-200/95 hover:border-pink-400/80";
      default:
        return isDarkMode
          ? "bg-gray-800/80 text-gray-100 border-gray-600/60 shadow-black/30 hover:bg-gray-800/90 hover:border-gray-600/80"
          : "bg-white/95 text-gray-800 border-gray-300/70 shadow-gray-900/10 hover:bg-gray-50/95 hover:border-gray-400/80";
    }
  };

  return (
    <div className="mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div
            className={`p-2.5 rounded-xl backdrop-blur-sm border shadow-lg ${
              isDarkMode
                ? "bg-gray-800/80 border-gray-700/50 text-purple-400 shadow-black/20"
                : "bg-white/90 border-gray-200/60 text-purple-600 shadow-gray-900/10"
            }`}
          >
            <WidgetIcon className="w-5 h-5" />
          </div>
          <div>
            <h3
              className={`text-2xl font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}
            >
              {title}
            </h3>
            {subtitle && (
              <p
                className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
              >
                {subtitle}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {onAddNote && (
            <button
              onClick={onAddNote}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 backdrop-blur-sm border shadow-lg ${
                isDarkMode
                  ? "text-gray-400 bg-gray-800/70 border-gray-700/50 shadow-black/20 hover:bg-gray-800/80 hover:text-gray-300"
                  : "text-gray-600 bg-white/70 border-gray-200/60 shadow-gray-900/10 hover:bg-white/80 hover:text-gray-700"
              }`}
            >
              <span>New Note</span>
            </button>
          )}
        </div>
      </div>

      {/* Gallery Container */}
      <div
        className={`rounded-2xl backdrop-blur-xl border shadow-2xl ${
          isDarkMode
            ? "bg-gray-900/60 border-gray-800/60 shadow-black/25"
            : "bg-white/90 border-gray-200/60 shadow-gray-900/15"
        }`}
        style={{ height }}
      >
        <div className="p-6 h-full">
          <div className="overflow-y-auto scrollbar-none h-full">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {notes.map((note) => {
                const TypeIcon = getNoteTypeIcon(note.type);
                return (
                  <div
                    key={note.id}
                    onClick={() => onNoteClick?.(note.id)}
                    className={`p-3 rounded-xl cursor-pointer backdrop-blur-sm border shadow-md transition-all duration-200 ${getNoteColorClasses(
                      note,
                    )}`}
                  >
                    {/* Note Header */}
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2 flex-1">
                        <TypeIcon className="w-4 h-4 flex-shrink-0 opacity-75" />
                        <span
                          className={`font-medium text-sm leading-tight flex-1 line-clamp-1 ${
                            isDarkMode ? "text-gray-100" : "text-gray-900"
                          }`}
                        >
                          {note.title}
                        </span>
                      </div>
                      <span
                        className={`text-xs ${
                          isDarkMode
                            ? "text-gray-300 opacity-75"
                            : "text-gray-600 opacity-75"
                        }`}
                      >
                        {note.lastModified}
                      </span>
                    </div>

                    {/* Note Content Preview */}
                    <p
                      className={`text-xs mb-2 leading-snug line-clamp-3 ${
                        isDarkMode
                          ? "text-gray-300 opacity-85"
                          : "text-gray-600 opacity-75"
                      }`}
                    >
                      {note.content}
                    </p>

                    {/* Note Footer */}
                    <div className="flex items-center justify-between gap-1.5">
                      {note.project && (
                        <span
                          className={`text-xs px-1.5 py-0.5 rounded-md font-medium backdrop-blur-sm border flex-shrink-0 ${
                            isDarkMode
                              ? "bg-gray-700/60 text-gray-200 border-gray-600/60 shadow-gray-900/20"
                              : "bg-white/90 text-gray-600 border-gray-300/60 shadow-gray-200/20"
                          }`}
                        >
                          {note.project}
                        </span>
                      )}
                      {note.tags && note.tags.length > 0 && (
                        <div className="flex gap-1 flex-wrap">
                          {note.tags.slice(0, 2).map((tag, index) => (
                            <span
                              key={index}
                              className={`text-xs px-1.5 py-0.5 rounded-md font-medium backdrop-blur-sm border ${
                                isDarkMode
                                  ? "bg-gray-600/40 text-gray-300 border-gray-500/50"
                                  : "bg-gray-100/80 text-gray-700 border-gray-300/60"
                              }`}
                            >
                              {tag}
                            </span>
                          ))}
                          {note.tags.length > 2 && (
                            <span
                              className={`text-xs px-1.5 py-0.5 rounded-md font-medium ${
                                isDarkMode ? "text-gray-400" : "text-gray-500"
                              }`}
                            >
                              +{note.tags.length - 2}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Add Note Card */}
              {onAddNote && (
                <div
                  onClick={onAddNote}
                  className={`p-3 rounded-xl border-2 border-dashed transition-all duration-200 backdrop-blur-sm cursor-pointer ${
                    isDarkMode
                      ? "border-gray-600/60 text-gray-300 hover:border-gray-500/80 hover:text-gray-200 hover:bg-gray-800/40 shadow-gray-900/20"
                      : "border-gray-300/70 text-gray-500 hover:border-gray-400/80 hover:text-gray-600 hover:bg-gray-50/60 shadow-gray-200/20"
                  }`}
                >
                  <div className="flex flex-col items-center justify-center h-24 space-y-2">
                    <FileText className="w-6 h-6" />
                    <span className="text-sm font-medium">Add Note</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
