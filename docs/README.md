# Renko Documentation

## Overview

Renko is a modern productivity application that combines project management, task tracking, and calendar scheduling into one seamless experience. Built with Next.js and Convex for real-time functionality.

## Features

- **Project Management**: Kanban boards with drag-and-drop functionality
- **Task Tracking**: Comprehensive task management with priorities and due dates
- **Calendar Integration**: Weekly calendar view with scheduling capabilities
- **Real-time Updates**: Live collaboration and instant updates
- **Authentication**: Secure Google OAuth integration

## Architecture

### Backend (Convex)

The backend is built on Convex, providing:

- Real-time database with automatic syncing
- Serverless functions for business logic
- Type-safe API generation
- Built-in authentication

### File Structure

```
convex/
├── auth.ts              # Authentication configuration
├── projects.ts          # 8 functions - Project management
├── tasks.ts             # 15 functions - Task operations
├── calendar.ts          # 4 functions - Calendar events
├── routines.ts          # 8 functions - Routine templates
├── users.ts             # 4 functions - User management
├── search.ts            # 2 functions - Search functionality
├── utils.ts             # Utility functions
└── schema.ts            # Database schema
```

### Frontend (Next.js)

```
app/
├── page.tsx             # Home page with calendar
├── boards/              # Project boards
├── calendar/            # Calendar page
├── signin/              # Authentication
└── signup/              # User registration

components/
├── AppLayout.tsx        # Main layout wrapper
├── Header.tsx           # Navigation header
├── Sidebar.tsx          # Navigation sidebar
├── Calendar.tsx         # Calendar component
├── TaskCard.tsx         # Task display
├── TaskModal.tsx        # Task editing
└── BoardModals.tsx      # Board management
```

## API Reference

### Core Functions

#### **PROJECT API** (convex/projects.ts) - 8 Functions

**Queries:**

- `getProjects()` - Get all user projects
- `getProject(projectId)` - Get single project with columns
- `getProjectStats(projectId)` - Get project statistics

**Mutations:**

- `createProject(name, description?, color?)` - Create new project
- `updateProject(projectId, updates)` - Update project details
- `deleteProject(projectId)` - Delete project and all tasks
- `createColumn(projectId, name, position)` - Add column to project
- `updateColumn(columnId, updates)` - Update column details

#### **TASK API** (convex/tasks.ts) - 15 Functions

**Queries:**

- `getTasks(columnId)` - Get tasks for column
- `getTask(taskId)` - Get single task
- `getTasksByProject(projectId)` - Get all project tasks
- `getUnscheduledTasks()` - Get tasks without calendar events

**Mutations:**

- `createTask(columnId, title, description?, priority?)` - Create task
- `updateTask(taskId, updates)` - Update task details
- `deleteTask(taskId)` - Delete task
- `moveTask(taskId, columnId, position)` - Move task between columns
- `updateTaskPositions(updates[])` - Bulk position updates

#### **CALENDAR API** (convex/calendar.ts) - 4 Functions

**Queries:**

- `getEvents(startDate, endDate)` - Get calendar events
- `getEventsByProject(projectId)` - Get project-specific events

**Mutations:**

- `createEvent(title, startDate, endDate, allDay?, projectId?, taskId?)` - Create event
- `updateEvent(eventId, updates)` - Update event details

#### **ROUTINE API** (convex/routines.ts) - 8 Functions

**Queries:**

- `getRoutineTemplates()` - Get available templates
- `getUserRoutines()` - Get user's personal routines
- `getRoutineBlocks(routineId)` - Get routine components

**Mutations:**

- `createRoutineFromTemplate(templateId, customizations?)` - Create from template
- `createCustomRoutine(name, description, blocks[])` - Create custom routine
- `updateRoutine(routineId, updates)` - Update routine
- `deleteRoutine(routineId)` - Delete routine

## Database Schema

### Core Tables

**projects** - Project/board management

- name, description, color, status, priority, dueDate, tags
- userId, createdAt, updatedAt

**columns** - Kanban columns within projects

- name, projectId, position, color, createdAt

**tasks** - Individual tasks

- title, description, status, priority, dueDate
- columnId, routineId, eventId, position
- userId, assignedTo, tags, timeEstimate
- completedAt, createdAt, updatedAt

**events** - Calendar events

- title, description, startDate, endDate, allDay
- projectId, taskId, routineId, userId
- createdAt, updatedAt

### Routine System

**routineTemplates** - Community and personal templates

- name, description, category, difficulty, estimatedDuration
- isPublic, popularity, tags, userId

**routines** - User's personal routines

- name, description, templateId, timeOfDay, isActive
- totalDuration, userId

**routineBlocks** - Individual routine components

- name, description, duration, category, energyLevel
- color, icon, position, routineId/templateId

## Development

### Setup

1. Clone repository
2. Install dependencies: `npm install`
3. Set up Convex: `npx convex dev`
4. Configure environment variables
5. Start development: `npm run dev`

### Environment Variables

```bash
# Convex
CONVEX_DEPLOYMENT=your-deployment-url
NEXT_PUBLIC_CONVEX_URL=your-convex-url

# Authentication
AUTH_GOOGLE_ID=your-google-client-id
AUTH_GOOGLE_SECRET=your-google-client-secret
```

### Key Technologies

- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **Convex**: Backend-as-a-service
- **Lucide Icons**: Modern icon library

## Status

**Current Phase**: Production-ready core functionality

✅ **Complete Features:**

- Project and task management
- Kanban board interface
- Calendar scheduling
- User authentication
- Real-time updates
- Responsive design

**Next Phase**: AI integration and advanced features

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## Support

- Check documentation in `/docs` folder
- Use GitHub issues for bugs
- Use GitHub discussions for questions
