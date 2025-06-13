import React from "react";
import { Plus, LucideIcon } from "lucide-react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

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
  onDragEnd?: (event: DragEndEvent) => void;
  enableDragDrop?: boolean;
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
  onDragEnd,
  enableDragDrop = false,
}: UnifiedKanbanWidgetProps) {
  const [activeItem, setActiveItem] = React.useState<WidgetItem | null>(null);

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveItem(event.active.data.current?.item || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveItem(null);
    if (onDragEnd) {
      onDragEnd(event);
    }
  };
  return (
    <div className="mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div
            className={`p-2 rounded-lg ${
              isDarkMode
                ? "bg-gray-800/60 text-blue-400"
                : "bg-white/80 text-blue-600"
            } border border-gray-200/20 shadow-sm`}
          >
            <WidgetIcon className="w-5 h-5" />
          </div>
          <div>
            <h3
              className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}
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
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 border ${
                isDarkMode
                  ? "text-gray-400 bg-gray-800/50 border-gray-700/50 hover:bg-gray-700/50"
                  : "text-gray-600 bg-white/70 border-gray-200/60 hover:bg-gray-50/80"
              }`}
            >
              <span>Filter</span>
            </button>
          )}
        </div>
      </div>

      {/* Kanban Container */}
      <div
        className={`ios-card ${isDarkMode ? "bg-gray-900/60" : "bg-white/90"}`}
        style={{ height }}
      >
        <div className="p-4 h-full">
          <div className="overflow-x-auto scrollbar-none h-full">
            {enableDragDrop ? (
              <DndContext
                sensors={sensors}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              >
                <div className="flex gap-6 min-w-max pb-2 h-full">
                  {columns.map((column) => (
                    <KanbanColumn
                      key={column.id}
                      column={column}
                      items={data[column.id] || []}
                      isDarkMode={isDarkMode}
                      onAddItem={onAddItem}
                      enableDragDrop={enableDragDrop}
                    />
                  ))}
                </div>
                <DragOverlay>
                  {activeItem ? (
                    <KanbanItem item={activeItem} isDarkMode={isDarkMode} />
                  ) : null}
                </DragOverlay>
              </DndContext>
            ) : (
              <div className="flex gap-6 min-w-max pb-2 h-full">
                {columns.map((column) => (
                  <KanbanColumn
                    key={column.id}
                    column={column}
                    items={data[column.id] || []}
                    isDarkMode={isDarkMode}
                    onAddItem={onAddItem}
                    enableDragDrop={false}
                  />
                ))}
              </div>
            )}
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
  enableDragDrop?: boolean;
}

function KanbanColumn({
  column,
  items,
  isDarkMode,
  onAddItem,
  enableDragDrop = false,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });
  const getColumnColorClasses = (color: string) => {
    switch (color) {
      case "red":
        return isDarkMode
          ? "bg-red-500/15 text-red-400 border-red-500/30"
          : "bg-red-50/80 text-red-600 border-red-200/70";
      case "orange":
        return isDarkMode
          ? "bg-orange-500/15 text-orange-400 border-orange-500/30"
          : "bg-orange-50/80 text-orange-600 border-orange-200/70";
      case "blue":
        return isDarkMode
          ? "bg-blue-500/15 text-blue-400 border-blue-500/30"
          : "bg-blue-50/80 text-blue-600 border-blue-200/70";
      case "purple":
        return isDarkMode
          ? "bg-purple-500/15 text-purple-400 border-purple-500/30"
          : "bg-purple-50/80 text-purple-600 border-purple-200/70";
      case "green":
        return isDarkMode
          ? "bg-green-500/15 text-green-400 border-green-500/30"
          : "bg-green-50/80 text-green-600 border-green-200/70";
      case "pink":
        return isDarkMode
          ? "bg-pink-500/15 text-pink-400 border-pink-500/30"
          : "bg-pink-50/80 text-pink-600 border-pink-200/70";
      default:
        return isDarkMode
          ? "bg-gray-500/15 text-gray-400 border-gray-500/30"
          : "bg-gray-50/80 text-gray-600 border-gray-200/70";
    }
  };

  return (
    <div className="w-[300px] flex-shrink-0 h-full flex flex-col space-y-4">
      {/* Column Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div className="flex items-center space-x-3">
          <div
            className={`p-2 rounded-lg border ${getColumnColorClasses(
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
        ref={enableDragDrop ? setNodeRef : undefined}
        className={`flex-1 overflow-y-auto scrollbar-none rounded-lg p-3 border transition-all duration-200 ${
          enableDragDrop && isOver
            ? isDarkMode
              ? "bg-blue-800/30 border-blue-500/60"
              : "bg-blue-50/80 border-blue-300/70"
            : isDarkMode
              ? "bg-gray-800/30 border-gray-700/50"
              : "bg-gray-50/80 border-gray-200/60"
        }`}
      >
        {enableDragDrop ? (
          <SortableContext
            items={items.map((item) => item.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {/* Items */}
              {items.map((item) => (
                <KanbanItem
                  key={item.id}
                  item={item}
                  isDarkMode={isDarkMode}
                  enableDragDrop={enableDragDrop}
                />
              ))}
            </div>
          </SortableContext>
        ) : (
          <div className="space-y-2">
            {/* Items */}
            {items.map((item) => (
              <KanbanItem
                key={item.id}
                item={item}
                isDarkMode={isDarkMode}
                enableDragDrop={false}
              />
            ))}
          </div>
        )}

        {/* Add Item Button */}
        {onAddItem && (
          <button
            onClick={() => onAddItem(column.id)}
            className={`w-full p-3 ${items.length > 0 ? "mt-3" : ""} rounded-lg border-2 border-dashed transition-all duration-200 ${
              isDarkMode
                ? "border-gray-600/60 text-gray-300 hover:border-gray-500/80 hover:text-gray-200 hover:bg-gray-800/30"
                : "border-gray-300/70 text-gray-500 hover:border-gray-400/80 hover:text-gray-600 hover:bg-gray-50/50"
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
  );
}

// Kanban Item Component
interface KanbanItemProps {
  item: WidgetItem;
  isDarkMode: boolean;
  enableDragDrop?: boolean;
}

function KanbanItem({
  item,
  isDarkMode,
  enableDragDrop = false,
}: KanbanItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: item.id,
    data: { item },
    disabled: !enableDragDrop,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getItemColorClasses = (item: WidgetItem) => {
    if (item.color) {
      switch (item.color) {
        case "blue":
          return isDarkMode
            ? "bg-blue-500/20 text-blue-200 border-blue-400/40 hover:bg-blue-500/30 hover:border-blue-400/60"
            : "bg-blue-100/90 text-blue-800 border-blue-300/60 hover:bg-blue-200/90 hover:border-blue-400/70";
        case "green":
          return isDarkMode
            ? "bg-green-500/20 text-green-200 border-green-400/40 hover:bg-green-500/30 hover:border-green-400/60"
            : "bg-green-100/90 text-green-800 border-green-300/60 hover:bg-green-200/90 hover:border-green-400/70";
        case "orange":
          return isDarkMode
            ? "bg-orange-500/20 text-orange-200 border-orange-400/40 hover:bg-orange-500/30 hover:border-orange-400/60"
            : "bg-orange-100/90 text-orange-800 border-orange-300/60 hover:bg-orange-200/90 hover:border-orange-400/70";
        case "purple":
          return isDarkMode
            ? "bg-purple-500/20 text-purple-200 border-purple-400/40 hover:bg-purple-500/30 hover:border-purple-400/60"
            : "bg-purple-100/90 text-purple-800 border-purple-300/60 hover:bg-purple-200/90 hover:border-purple-400/70";
        case "pink":
          return isDarkMode
            ? "bg-pink-500/20 text-pink-200 border-pink-400/40 hover:bg-pink-500/30 hover:border-pink-400/60"
            : "bg-pink-100/90 text-pink-800 border-pink-300/60 hover:bg-pink-200/90 hover:border-pink-400/70";
        default:
          return isDarkMode
            ? "bg-gray-800/70 text-gray-100 border-gray-600/50 hover:bg-gray-800/80 hover:border-gray-600/70"
            : "bg-white/90 text-gray-800 border-gray-300/60 hover:bg-gray-50/90 hover:border-gray-400/70";
      }
    }
    return isDarkMode
      ? "bg-gray-800/70 text-gray-100 border-gray-600/50 hover:bg-gray-800/80 hover:border-gray-600/70"
      : "bg-white/90 text-gray-800 border-gray-300/60 hover:bg-gray-50/90 hover:border-gray-400/70";
  };

  const getPriorityClasses = (priority?: string) => {
    switch (priority) {
      case "critical":
        return isDarkMode
          ? "bg-red-500/20 text-red-200 border-red-400/40"
          : "bg-red-100 text-red-700 border-red-300/60";
      case "high":
        return isDarkMode
          ? "bg-orange-500/20 text-orange-200 border-orange-400/40"
          : "bg-orange-100 text-orange-700 border-orange-300/60";
      case "medium":
        return isDarkMode
          ? "bg-yellow-500/20 text-yellow-200 border-yellow-400/40"
          : "bg-yellow-100 text-yellow-700 border-yellow-300/60";
      case "low":
        return isDarkMode
          ? "bg-green-500/20 text-green-200 border-green-400/40"
          : "bg-green-100 text-green-700 border-green-300/60";
      default:
        return isDarkMode
          ? "bg-gray-600/20 text-gray-200 border-gray-500/40"
          : "bg-gray-100 text-gray-700 border-gray-300/60";
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...(enableDragDrop ? attributes : {})}
      {...(enableDragDrop ? listeners : {})}
      className={`p-3 rounded-lg border transition-all duration-200 ${
        enableDragDrop ? "cursor-grab" : "cursor-pointer"
      } ${getItemColorClasses(item)} ${
        isDragging ? "opacity-50 rotate-2 scale-105" : ""
      }`}
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
                  ? "text-gray-300 opacity-85"
                  : "text-gray-600 opacity-70"
              }`}
            >
              {item.time && item.duration
                ? (() => {
                    const startTime = item.time;
                    const duration = item.duration;
                    const durationMatch = duration.match(/(\d+)([hm])/);
                    if (durationMatch) {
                      const [, amount, unit] = durationMatch;
                      const startHour = parseInt(startTime.split(":")[0]);
                      const startMinute = parseInt(
                        startTime.split(":")[1] || "0",
                      );
                      let totalMinutes = startHour * 60 + startMinute;
                      if (unit === "h") {
                        totalMinutes += parseInt(amount) * 60;
                      } else {
                        totalMinutes += parseInt(amount);
                      }
                      const endHour = Math.floor(totalMinutes / 60) % 24;
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
                  ? "text-gray-400 opacity-75"
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
            isDarkMode ? "text-gray-300 opacity-80" : "text-gray-600 opacity-70"
          }`}
        >
          {item.description}
        </p>
      )}

      {/* Item Footer */}
      <div className="flex items-center justify-between gap-1.5">
        {item.project && (
          <span
            className={`text-xs px-1.5 py-0.5 rounded-md font-medium border flex-shrink-0 ${
              isDarkMode
                ? "bg-gray-700/50 text-gray-200 border-gray-600/50"
                : "bg-white/80 text-gray-600 border-gray-300/60"
            }`}
          >
            {item.project}
          </span>
        )}
        {item.priority && (
          <span
            className={`text-xs px-1.5 py-0.5 rounded-md font-medium border flex-shrink-0 ${getPriorityClasses(
              item.priority,
            )}`}
          >
            {item.priority}
          </span>
        )}
      </div>
    </div>
  );
}
