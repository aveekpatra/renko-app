"use client";

import { useState } from "react";
import {
  LayoutDashboard,
  FolderKanban,
  Calendar,
  FileText,
  Settings,
  User,
  ChevronLeft,
  ChevronRight,
  Plus,
} from "lucide-react";

const navigationItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/", active: true },
  { icon: FolderKanban, label: "Projects", href: "/projects", active: false },
  { icon: Calendar, label: "Calendar", href: "/calendar", active: false },
  { icon: FileText, label: "Notes", href: "/notes", active: false },
];

const mockProjects = [
  { _id: "1", name: "Product Development", color: "#3b82f6" },
  { _id: "2", name: "Marketing Campaign", color: "#10b981" },
  { _id: "3", name: "Design System", color: "#f59e0b" },
];

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside
      className={`
      glass-primary border-r border-white/10 transition-all duration-300 ease-in-out
      ${isCollapsed ? "w-16" : "w-64"}
    `}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <div>
                <h1 className="text-subtitle text-primary font-bold">Renko</h1>
                <p className="text-small text-tertiary">Productivity Suite</p>
              </div>
            )}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 glass-subtle rounded-button hover:glass-primary transition-all touch-lift"
            >
              {isCollapsed ? (
                <ChevronRight className="w-4 h-4 text-secondary" />
              ) : (
                <ChevronLeft className="w-4 h-4 text-secondary" />
              )}
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            {navigationItems.map((item) => (
              <SidebarItem
                key={item.label}
                icon={item.icon}
                label={item.label}
                active={item.active}
                collapsed={isCollapsed}
              />
            ))}
          </div>

          {/* Projects Section */}
          {!isCollapsed && (
            <div className="mt-8">
              <div className="flex-between mb-4">
                <h3 className="text-caption text-secondary font-medium">
                  Projects
                </h3>
                <button className="p-1 glass-subtle rounded-button hover:glass-primary transition-all touch-lift">
                  <Plus className="w-3 h-3 text-tertiary" />
                </button>
              </div>
              <div className="space-y-2">
                {mockProjects.map((project) => (
                  <div
                    key={project._id}
                    className="flex items-center space-x-3 p-2 glass-subtle rounded-button 
                               hover:glass-primary cursor-pointer transition-all touch-lift"
                  >
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: project.color }}
                    />
                    <span className="text-small text-secondary truncate">
                      {project.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-white/10">
          <div
            className={`
            flex items-center space-x-3 p-3 glass-subtle rounded-button 
            hover:glass-primary cursor-pointer transition-all touch-lift
            ${isCollapsed ? "justify-center" : ""}
          `}
          >
            <div className="w-8 h-8 bg-gradient-to-br from-accent-primary to-accent-secondary rounded-full flex-shrink-0 flex-center">
              <User className="w-4 h-4 text-white" />
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-small text-primary font-medium truncate">
                  You
                </p>
                <p className="text-small text-tertiary truncate">
                  you@example.com
                </p>
              </div>
            )}
          </div>

          {!isCollapsed && (
            <button
              className="w-full mt-3 p-2 glass-subtle rounded-button hover:glass-primary 
                             transition-all touch-lift flex items-center justify-center"
            >
              <Settings className="w-4 h-4 text-secondary mr-2" />
              <span className="text-small text-secondary">Settings</span>
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}

interface SidebarItemProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active?: boolean;
  collapsed?: boolean;
}

function SidebarItem({
  icon: Icon,
  label,
  active,
  collapsed,
}: SidebarItemProps) {
  return (
    <div
      className={`
        flex items-center space-x-3 p-3 rounded-button cursor-pointer transition-all touch-lift
        ${collapsed ? "justify-center" : ""}
        ${
          active
            ? "glass-primary text-accent-primary border border-accent-primary/30"
            : "glass-subtle text-secondary hover:glass-primary hover:text-primary"
        }
      `}
    >
      <Icon className="w-5 h-5 flex-shrink-0" />
      {!collapsed && (
        <span className="text-body font-medium truncate">{label}</span>
      )}
    </div>
  );
}
