"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  BookOpen,
  FileText,
  Edit3,
  MoreHorizontal,
  Folder,
  Star,
  Clock,
  ChevronRight,
  ChevronDown,
  Trash2,
  FolderPlus,
} from "lucide-react";
import { useTheme } from "@/components/AppLayout";

interface Note {
  id: string;
  title: string;
  content: string;
  notebookId: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  isFavorite: boolean;
}

interface Notebook {
  id: string;
  name: string;
  color: "purple" | "blue" | "green" | "orange" | "pink" | "indigo";
  icon?: React.ComponentType<{ className?: string }>;
  isExpanded: boolean;
  noteCount: number;
}

// Mock data
const mockNotebooks: Notebook[] = [
  {
    id: "1",
    name: "Personal",
    color: "purple",
    icon: BookOpen,
    isExpanded: true,
    noteCount: 5,
  },
  {
    id: "2",
    name: "Work Projects",
    color: "blue",
    icon: Folder,
    isExpanded: true,
    noteCount: 8,
  },
  {
    id: "3",
    name: "Ideas & Inspiration",
    color: "green",
    icon: Star,
    isExpanded: false,
    noteCount: 12,
  },
  {
    id: "4",
    name: "Meeting Notes",
    color: "orange",
    icon: Clock,
    isExpanded: true,
    noteCount: 6,
  },
  {
    id: "5",
    name: "Learning",
    color: "pink",
    icon: Edit3,
    isExpanded: false,
    noteCount: 15,
  },
];

const mockNotes: Note[] = [
  {
    id: "1",
    title: "Daily Journal Entry",
    content:
      "Today was a productive day. I managed to complete most of my tasks and had a good meeting with the team. Looking forward to tomorrow's challenges.\n\nKey accomplishments:\n- Finished the UI mockups\n- Had a great brainstorming session\n- Organized my workspace",
    notebookId: "1",
    createdAt: "2024-03-15T10:30:00Z",
    updatedAt: "2024-03-15T10:30:00Z",
    tags: ["daily", "reflection"],
    isFavorite: true,
  },
  {
    id: "2",
    title: "Project Roadmap Q2",
    content:
      "# Q2 Project Roadmap\n\n## Key Objectives\n1. Launch new user dashboard\n2. Implement advanced analytics\n3. Improve mobile experience\n\n## Timeline\n- April: Complete UI/UX design\n- May: Development phase\n- June: Testing and launch\n\n## Resources Needed\n- 2 Frontend developers\n- 1 Backend developer\n- 1 QA engineer",
    notebookId: "2",
    createdAt: "2024-03-14T14:20:00Z",
    updatedAt: "2024-03-15T09:15:00Z",
    tags: ["roadmap", "planning", "Q2"],
    isFavorite: false,
  },
  {
    id: "3",
    title: "App Architecture Ideas",
    content:
      "Exploring microservices architecture for our new platform.\n\nPros:\n- Better scalability\n- Independent deployments\n- Technology diversity\n\nCons:\n- Increased complexity\n- Network latency\n- Monitoring challenges\n\nNext steps: Create a proof of concept with 2-3 services.",
    notebookId: "3",
    createdAt: "2024-03-13T16:45:00Z",
    updatedAt: "2024-03-13T16:45:00Z",
    tags: ["architecture", "microservices", "ideas"],
    isFavorite: true,
  },
  {
    id: "4",
    title: "Weekly Team Standup",
    content:
      "## Team Standup - March 15, 2024\n\n### Attendees\n- Alice (Frontend)\n- Bob (Backend)\n- Carol (Design)\n- Dave (QA)\n\n### Updates\n- Alice: Completed login page redesign\n- Bob: Fixed API performance issues\n- Carol: Working on new icon set\n- Dave: Found 3 critical bugs\n\n### Action Items\n- [ ] Alice to review Bob's API changes\n- [ ] Carol to share icon prototypes\n- [ ] Dave to create bug report tickets",
    notebookId: "4",
    createdAt: "2024-03-15T09:00:00Z",
    updatedAt: "2024-03-15T09:00:00Z",
    tags: ["meeting", "standup", "team"],
    isFavorite: false,
  },
  {
    id: "5",
    title: "React Best Practices",
    content:
      "# React Best Practices\n\n## Component Organization\n1. Keep components small and focused\n2. Use custom hooks for reusable logic\n3. Implement proper error boundaries\n\n## Performance Tips\n- Use React.memo for expensive components\n- Optimize re-renders with useCallback/useMemo\n- Lazy load components when possible\n\n## Code Quality\n- Write comprehensive tests\n- Use TypeScript for better type safety\n- Follow consistent naming conventions",
    notebookId: "5",
    createdAt: "2024-03-12T11:30:00Z",
    updatedAt: "2024-03-14T15:20:00Z",
    tags: ["react", "javascript", "best-practices"],
    isFavorite: true,
  },
];

export default function NotesPage() {
  const { isDarkMode } = useTheme();
  const [selectedNotebook, setSelectedNotebook] = useState<Notebook | null>(
    mockNotebooks[0],
  );
  const [selectedNote, setSelectedNote] = useState<Note | null>(mockNotes[0]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [notebooks, setNotebooks] = useState(mockNotebooks);

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
    noteEditor: isDarkMode
      ? "bg-gray-900/40 border-gray-700/40"
      : "bg-white/40 border-gray-200/40",
  };

  const getNotebookColor = (color: string, isDark: boolean) => {
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

  const toggleNotebook = (notebookId: string) => {
    setNotebooks(
      notebooks.map((nb) =>
        nb.id === notebookId ? { ...nb, isExpanded: !nb.isExpanded } : nb,
      ),
    );
  };

  const filteredNotes = mockNotes.filter((note) => {
    const matchesSearch =
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesNotebook = selectedNotebook
      ? note.notebookId === selectedNotebook.id
      : true;
    return matchesSearch && matchesNotebook;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffInHours < 168) {
      // 7 days
      return date.toLocaleDateString([], { weekday: "short" });
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    }
  };

  const startEditing = () => {
    if (selectedNote) {
      setEditContent(selectedNote.content);
      setIsEditing(true);
    }
  };

  const saveNote = () => {
    if (selectedNote) {
      // Here you would save the note
      console.log("Saving note:", editContent);
      setIsEditing(false);
    }
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditContent("");
  };

  return (
    <div className="flex h-full overflow-hidden">
      {/* Notebooks & Notes Sidebar */}
      <div className={`w-80 ${themeClasses.sidebar} flex flex-col`}>
        {/* Header */}
        <div className="p-4 border-b border-gray-200/20">
          <h2 className={`text-base font-bold ${themeClasses.text.primary}`}>
            Notes
          </h2>
          <p className={`text-xs ${themeClasses.text.tertiary} mt-1`}>
            Organize your thoughts and ideas
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
              placeholder="Search notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-9 pr-3 py-2 rounded-lg border backdrop-blur-md transition-all duration-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/30 ${themeClasses.search}`}
            />
          </div>
        </div>

        {/* Notebooks Section */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-3">
            <div className="flex items-center justify-between mb-3">
              <h3
                className={`text-xs font-semibold uppercase tracking-wide ${themeClasses.text.secondary}`}
              >
                Notebooks
              </h3>
              <button className="p-1 rounded hover:bg-gray-100/10 transition-colors">
                <FolderPlus
                  className={`w-3.5 h-3.5 ${themeClasses.text.tertiary}`}
                />
              </button>
            </div>

            <div className="space-y-1">
              {notebooks.map((notebook) => {
                const Icon = notebook.icon || BookOpen;
                const isSelected = selectedNotebook?.id === notebook.id;

                return (
                  <div key={notebook.id}>
                    <div
                      className={`w-full p-2.5 rounded-lg transition-all duration-200 flex items-center space-x-2 group cursor-pointer ${
                        isSelected
                          ? getNotebookColor(notebook.color, isDarkMode)
                          : isDarkMode
                            ? "hover:bg-gray-800/60 text-gray-300"
                            : "hover:bg-gray-100/60 text-gray-700"
                      }`}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleNotebook(notebook.id);
                        }}
                        className="p-0.5 rounded hover:bg-black/10 transition-colors"
                      >
                        {notebook.isExpanded ? (
                          <ChevronDown className="w-3 h-3" />
                        ) : (
                          <ChevronRight className="w-3 h-3" />
                        )}
                      </button>
                      <div
                        onClick={() => {
                          setSelectedNotebook(notebook);
                          setSelectedNote(null);
                        }}
                        className="flex items-center space-x-2 flex-1 cursor-pointer"
                      >
                        <Icon className="w-4 h-4 flex-shrink-0" />
                        <div className="flex-1 text-left">
                          <div className="text-xs font-medium truncate">
                            {notebook.name}
                          </div>
                          <div
                            className={`text-xs opacity-60 ${themeClasses.text.tertiary}`}
                          >
                            {notebook.noteCount} notes
                          </div>
                        </div>
                      </div>
                      <button className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-black/10 transition-all">
                        <MoreHorizontal className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Notes list for expanded notebooks */}
                    {notebook.isExpanded && (
                      <div className="ml-4 mt-1 space-y-1">
                        {filteredNotes
                          .filter((note) => note.notebookId === notebook.id)
                          .slice(0, 5)
                          .map((note) => (
                            <button
                              key={note.id}
                              onClick={() => setSelectedNote(note)}
                              className={`w-full p-2 rounded-lg transition-all duration-200 text-left group ${
                                selectedNote?.id === note.id
                                  ? isDarkMode
                                    ? "bg-purple-500/20 text-purple-300 border border-purple-400/40"
                                    : "bg-purple-100/80 text-purple-800 border border-purple-200/70"
                                  : isDarkMode
                                    ? "hover:bg-gray-800/50 text-gray-400"
                                    : "hover:bg-gray-100/50 text-gray-600"
                              }`}
                            >
                              <div className="flex items-start space-x-2">
                                <FileText className="w-3 h-3 mt-0.5 flex-shrink-0 opacity-70" />
                                <div className="min-w-0 flex-1">
                                  <div className="text-xs font-medium truncate">
                                    {note.title}
                                  </div>
                                  <div
                                    className={`text-xs opacity-60 mt-0.5 ${themeClasses.text.tertiary}`}
                                  >
                                    {formatDate(note.updatedAt)}
                                  </div>
                                </div>
                                {note.isFavorite && (
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

        {/* New Note Button */}
        <div className="p-3 border-t border-gray-200/20">
          <button className="w-full flex items-center justify-center px-3 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 shadow-md shadow-purple-500/30 hover:shadow-lg hover:shadow-purple-500/40 transform hover:-translate-y-0.5 font-medium backdrop-blur-sm">
            <Plus className="w-4 h-4 mr-2" />
            New Note
          </button>
        </div>
      </div>

      {/* Main Note Editor Area */}
      <main className="flex-1 overflow-hidden flex flex-col">
        {selectedNote ? (
          <>
            {/* Note Header */}
            <div className={`p-4 border-b ${themeClasses.noteEditor}`}>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h1
                    className={`text-xl font-bold ${themeClasses.text.primary}`}
                  >
                    {selectedNote.title}
                  </h1>
                  <div className="flex items-center space-x-4 mt-2">
                    <span className={`text-xs ${themeClasses.text.tertiary}`}>
                      Last updated: {formatDate(selectedNote.updatedAt)}
                    </span>
                    <div className="flex items-center space-x-1">
                      {selectedNote.tags.map((tag) => (
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
                    onClick={() => {
                      // Toggle favorite
                      console.log("Toggle favorite");
                    }}
                    className={`p-2 rounded-lg transition-colors ${
                      selectedNote.isFavorite
                        ? "text-yellow-500"
                        : isDarkMode
                          ? "text-gray-400 hover:text-yellow-500"
                          : "text-gray-600 hover:text-yellow-500"
                    }`}
                  >
                    <Star
                      className={`w-5 h-5 ${selectedNote.isFavorite ? "fill-current" : ""}`}
                    />
                  </button>
                  {!isEditing ? (
                    <button
                      onClick={startEditing}
                      className={`p-2 rounded-lg transition-colors ${
                        isDarkMode
                          ? "text-gray-400 hover:text-purple-400 hover:bg-gray-800/60"
                          : "text-gray-600 hover:text-purple-600 hover:bg-gray-100/60"
                      }`}
                    >
                      <Edit3 className="w-5 h-5" />
                    </button>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={cancelEditing}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          isDarkMode
                            ? "text-gray-400 hover:text-gray-300 hover:bg-gray-800/60"
                            : "text-gray-600 hover:text-gray-700 hover:bg-gray-100/60"
                        }`}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={saveNote}
                        className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 text-xs font-medium"
                      >
                        Save
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Note Content */}
            <div className="flex-1 overflow-auto p-4">
              {isEditing ? (
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className={`w-full h-full p-4 rounded-lg border backdrop-blur-md transition-all duration-200 font-mono text-sm leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-purple-500/30 ${
                    isDarkMode
                      ? "bg-gray-800/70 border-gray-700/60 text-gray-100 placeholder-gray-400"
                      : "bg-white/80 border-gray-200/60 text-gray-800 placeholder-gray-500"
                  }`}
                  placeholder="Start writing your note..."
                />
              ) : (
                <div
                  className={`prose prose-sm max-w-none ${
                    isDarkMode ? "prose-invert" : ""
                  }`}
                >
                  <pre
                    className={`whitespace-pre-wrap font-sans text-sm leading-relaxed ${themeClasses.text.primary}`}
                  >
                    {selectedNote.content}
                  </pre>
                </div>
              )}
            </div>
          </>
        ) : (
          /* Empty State */
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <FileText
                className={`w-16 h-16 mx-auto mb-4 opacity-40 ${themeClasses.text.tertiary}`}
              />
              <h3
                className={`text-lg font-semibold mb-2 ${themeClasses.text.primary}`}
              >
                Select a note to view
              </h3>
              <p className={`text-sm ${themeClasses.text.tertiary} mb-4`}>
                Choose a note from the sidebar or create a new one
              </p>
              <button className="flex items-center justify-center px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 shadow-md shadow-purple-500/30 hover:shadow-lg hover:shadow-purple-500/40 transform hover:-translate-y-0.5 font-medium backdrop-blur-sm mx-auto">
                <Plus className="w-4 h-4 mr-2" />
                Create New Note
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
