import React from "react";
import { Plus, LucideIcon } from "lucide-react";

export interface WidgetItem {
  id: string;
  title: string;
  description?: string;
  time?: string;
  duration?: string;
  priority?: "critical" | "high" | "medium" | "low";
  project?: string;
  dueTime?: string;
  timeEstimate?: string;
  dueDate?: string;
  color?: string;
}

export interface WidgetColumn {
  id: string;
  title: string;
  icon: LucideIcon;
  color: string;
  subtitle?: string;
  itemCount?: number;
}

export interface UnifiedKanbanWidgetProps {
  isDarkMode: boolean;
  title: string;
  subtitle?: string;
  icon: LucideIcon;
  columns: WidgetColumn[];
  data: Record<string, WidgetItem[]>;
  onAddItem?: (columnId: string) => void;
  showFilter?: boolean;
  onFilter?: () => void;
  actionButtons?: React.ReactNode;
  height?: string;
}

export default function UnifiedKanbanWidget({
  isDarkMode,
  title,
  subtitle,
  icon: WidgetIcon,
  columns,
  data,
  onAddItem,
  showFilter = false,
  onFilter,
  actionButtons,
  height = "500px",
}: UnifiedKanbanWidgetProps) {
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
          {actionButtons}
          {showFilter && onFilter && (
            <button
              onClick={onFilter}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 backdrop-blur-sm border shadow-lg ${
                isDarkMode
                  ? "text-gray-400 bg-gray-800/70 border-gray-700/50 shadow-black/20"
                  : "text-gray-600 bg-white/70 border-gray-200/60 shadow-gray-900/10"
              }`}
            >
              <span>Filter</span>
            </button>
          )}
        </div>
      </div>

      {/* Kanban Container */}
      <div
        className={`rounded-2xl backdrop-blur-xl border shadow-2xl ${
          isDarkMode
            ? "bg-gray-900/60 border-gray-800/60 shadow-black/25"
            : "bg-white/90 border-gray-200/60 shadow-gray-900/15"
        }`}
        style={{ height }}
      >
        <div className="p-6 h-full">
          <div className="overflow-x-auto scrollbar-none h-full">
            <div className="flex gap-8 min-w-max pb-2 h-full">
              {columns.map((column) => (
                <KanbanColumn
                  key={column.id}
                  column={column}
                  items={data[column.id] || []}
                  isDarkMode={isDarkMode}
                  onAddItem={onAddItem}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Kanban Column Component
interface KanbanColumnProps {
  column: WidgetColumn;
  items: WidgetItem[];
  isDarkMode: boolean;
  onAddItem?: (columnId: string) => void;
}

function KanbanColumn({
  column,
  items,
  isDarkMode,
  onAddItem,
}: KanbanColumnProps) {
  const getColumnColorClasses = (color: string) => {
    switch (color) {
      case "red":
        return isDarkMode
          ? "bg-red-500/15 text-red-400 border-red-500/30 shadow-red-900/30"
          : "bg-red-50/80 text-red-600 border-red-200/70 shadow-red-200/40";
      case "orange":
        return isDarkMode
          ? "bg-orange-500/15 text-orange-400 border-orange-500/30 shadow-orange-900/30"
          : "bg-orange-50/80 text-orange-600 border-orange-200/70 shadow-orange-200/40";
      case "blue":
        return isDarkMode
          ? "bg-blue-500/15 text-blue-400 border-blue-500/30 shadow-blue-900/30"
          : "bg-blue-50/80 text-blue-600 border-blue-200/70 shadow-blue-200/40";
      case "purple":
        return isDarkMode
          ? "bg-purple-500/15 text-purple-400 border-purple-500/30 shadow-purple-900/30"
          : "bg-purple-50/80 text-purple-600 border-purple-200/70 shadow-purple-200/40";
      case "green":
        return isDarkMode
          ? "bg-green-500/15 text-green-400 border-green-500/30 shadow-green-900/30"
          : "bg-green-50/80 text-green-600 border-green-200/70 shadow-green-200/40";
      case "pink":
        return isDarkMode
          ? "bg-pink-500/15 text-pink-400 border-pink-500/30 shadow-pink-900/30"
          : "bg-pink-50/80 text-pink-600 border-pink-200/70 shadow-pink-200/40";
      default:
        return isDarkMode
          ? "bg-gray-500/15 text-gray-400 border-gray-500/30 shadow-gray-900/30"
          : "bg-gray-50/80 text-gray-600 border-gray-200/70 shadow-gray-200/40";
    }
  };

  const getPriorityClasses = (priority?: string) => {
    switch (priority) {
      case "critical":
        return isDarkMode
          ? "bg-red-500/25 text-red-200 border-red-400/50 shadow-red-900/20"
          : "bg-red-100 text-red-700 border-red-300/60 shadow-red-200/20";
      case "high":
        return isDarkMode
          ? "bg-orange-500/25 text-orange-200 border-orange-400/50 shadow-orange-900/20"
          : "bg-orange-100 text-orange-700 border-orange-300/60 shadow-orange-200/20";
      case "medium":
        return isDarkMode
          ? "bg-yellow-500/25 text-yellow-200 border-yellow-400/50 shadow-yellow-900/20"
          : "bg-yellow-100 text-yellow-700 border-yellow-300/60 shadow-yellow-200/20";
      case "low":
        return isDarkMode
          ? "bg-green-500/25 text-green-200 border-green-400/50 shadow-green-900/20"
          : "bg-green-100 text-green-700 border-green-300/60 shadow-green-200/20";
      default:
        return isDarkMode
          ? "bg-gray-600/25 text-gray-200 border-gray-500/50 shadow-gray-900/20"
          : "bg-gray-100 text-gray-700 border-gray-300/60 shadow-gray-200/20";
    }
  };

  const getItemColorClasses = (item: WidgetItem) => {
    if (item.color) {
      switch (item.color) {
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
    }
    return isDarkMode
      ? "bg-gray-800/80 text-gray-100 border-gray-600/60 shadow-black/30 hover:bg-gray-800/90 hover:border-gray-600/80"
      : "bg-white/95 text-gray-800 border-gray-300/70 shadow-gray-900/10 hover:bg-gray-50/95 hover:border-gray-400/80";
  };

  return (
    <div className="w-[320px] flex-shrink-0 h-full flex flex-col space-y-4">
      {/* Column Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div className="flex items-center space-x-3">
          <div
            className={`p-2 rounded-xl backdrop-blur-sm border shadow-lg ${getColumnColorClasses(
              column.color,
            )}`}
          >
            <column.icon className="w-4 h-4" />
          </div>
          <div>
            <h4
              className={`font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}
            >
              {column.title}
            </h4>
            <p
              className={`text-sm ${isDarkMode ? "text-gray-500" : "text-gray-500"}`}
            >
              {column.subtitle ||
                `${items.length} ${items.length === 1 ? "item" : "items"}`}
            </p>
          </div>
        </div>
      </div>

      {/* Column Content */}
      <div
        className={`flex-1 overflow-y-auto scrollbar-none rounded-lg p-4 backdrop-blur-sm border ${
          isDarkMode
            ? "bg-gray-800/40 border-gray-700/50"
            : "bg-gray-50/90 border-gray-200/60"
        }`}
      >
        <div className="space-y-2">
          {/* Items */}
          {items.map((item) => (
            <div
              key={item.id}
              className={`p-3 rounded-xl cursor-pointer backdrop-blur-sm border shadow-md transition-all duration-200 ${getItemColorClasses(
                item,
              )}`}
            >
              {/* Item Header */}
              <div className="flex items-start justify-between mb-1">
                <span
                  className={`font-medium text-sm leading-tight flex-1 ${
                    isDarkMode ? "text-gray-100" : "text-gray-900"
                  }`}
                >
                  {item.title}
                </span>
                <div className="flex flex-col items-end flex-shrink-0 ml-2">
                  {(item.time || item.dueTime) && (
                    <span
                      className={`text-xs font-medium ${
                        isDarkMode
                          ? "text-gray-300 opacity-90"
                          : "text-gray-600 opacity-75"
                      }`}
                    >
                      {item.time && item.duration
                        ? (() => {
                            const startTime = item.time;
                            const duration = item.duration;
                            const durationMatch = duration.match(/(\d+)([hm])/);
                            if (durationMatch) {
                              const [_, amount, unit] = durationMatch;
                              const startHour = parseInt(
                                startTime.split(":")[0],
                              );
                              const startMinute = parseInt(
                                startTime.split(":")[1] || "0",
                              );
                              let totalMinutes = startHour * 60 + startMinute;
                              if (unit === "h") {
                                totalMinutes += parseInt(amount) * 60;
                              } else {
                                totalMinutes += parseInt(amount);
                              }
                              const endHour =
                                Math.floor(totalMinutes / 60) % 24;
                              const endMinute = totalMinutes % 60;
                              return `${startTime}-${endHour.toString().padStart(2, "0")}:${endMinute.toString().padStart(2, "0")}`;
                            }
                            return startTime;
                          })()
                        : item.time || item.dueTime}
                    </span>
                  )}
                  {item.timeEstimate && !item.time && (
                    <span
                      className={`text-xs ${
                        isDarkMode
                          ? "text-gray-400 opacity-80"
                          : "text-gray-500 opacity-60"
                      }`}
                    >
                      {item.timeEstimate}
                    </span>
                  )}
                </div>
              </div>

              {/* Item Description */}
              {item.description && (
                <p
                  className={`text-xs mb-1.5 leading-snug ${
                    isDarkMode
                      ? "text-gray-300 opacity-85"
                      : "text-gray-600 opacity-75"
                  }`}
                >
                  {item.description}
                </p>
              )}

              {/* Item Footer */}
              <div className="flex items-center justify-between gap-1.5">
                {item.project && (
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded-md font-medium backdrop-blur-sm border flex-shrink-0 ${
                      isDarkMode
                        ? "bg-gray-700/60 text-gray-200 border-gray-600/60 shadow-gray-900/20"
                        : "bg-white/90 text-gray-600 border-gray-300/60 shadow-gray-200/20"
                    }`}
                  >
                    {item.project}
                  </span>
                )}
                {item.priority && (
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded-md font-medium backdrop-blur-sm border flex-shrink-0 ${getPriorityClasses(
                      item.priority,
                    )}`}
                  >
                    {item.priority}
                  </span>
                )}
              </div>
            </div>
          ))}

          {/* Add Item Button */}
          {onAddItem && (
            <button
              onClick={() => onAddItem(column.id)}
              className={`w-full p-4 rounded-xl border-2 border-dashed transition-all duration-200 backdrop-blur-sm ${
                isDarkMode
                  ? "border-gray-600/60 text-gray-300 hover:border-gray-500/80 hover:text-gray-200 hover:bg-gray-800/40 shadow-gray-900/20"
                  : "border-gray-300/70 text-gray-500 hover:border-gray-400/80 hover:text-gray-600 hover:bg-gray-50/60 shadow-gray-200/20"
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <Plus className="w-4 h-4" />
                <span className="text-sm font-medium">Add Item</span>
              </div>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
