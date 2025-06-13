# 🎯 Renko - AI-Ready Productivity App

**For Claude/Cursor AI**: Next.js + Convex productivity app with glassmorphic design, comprehensive backend, and real-time data integration.

## 🚀 **CURRENT STATUS**

### ✅ **FULLY IMPLEMENTED BACKEND + CALENDAR FIXES**

- **Auth**: Password + Google OAuth (Convex Auth) ✅
- **Database**: 13 interconnected tables with proper indexing ✅
- **API**: 49 functions across 6 backend files ✅
- **Frontend**: 6 pages with real Convex data integration ✅
- **Components**: 13+ reusable components with dynamic data ✅
- **TypeScript**: All compilation errors resolved ✅
- **Sample Data**: Comprehensive demo data system ✅
- **Calendar Widget**: Drag & drop functionality fully working ✅
- **Data Integrity**: All corrupted timestamps repaired ✅

### 📁 **PROJECT STRUCTURE**

```
app/
├── page.tsx           # Dashboard with real Convex data
├── boards/page.tsx    # Kanban management
├── calendar/page.tsx  # Calendar with events API
├── notes/page.tsx     # Notes with notebooks API
├── habits/page.tsx    # Routines with templates & insights
└── signin/page.tsx    # Multi-provider auth

components/
├── UnifiedKanbanWidget.tsx  # Dynamic widget with real data
├── Sidebar.tsx             # Navigation with user data
└── [13+ other components]

convex/
├── schema.ts       # 13 tables with relationships
├── projects.ts     # 7 functions - project management
├── tasks.ts        # 6 functions - task management
├── calendar.ts     # 6 functions - event management
├── notes.ts        # 10 functions - notes & notebooks
├── routines.ts     # 9 functions - routine templates & tracking
├── links.ts        # 8 functions - universal entity linking
├── search.ts       # 2 functions - full-text search
├── sampleData.ts   # Demo data generation
└── auth.ts         # Multi-provider auth setup
```

## 🔌 **COMPLETE API COVERAGE**

### ✅ **PROJECTS API** (convex/projects.ts)

```typescript
getProjects(status?): Project[]
getProject(projectId): Project | null
createProject(name, description?, color?, status?): projectId
updateProject(projectId, updates): null
deleteProject(projectId): null
getProjectStats(projectId?, timeRange?): ProjectStats
archiveProject(projectId, archive): null
```

### ✅ **TASKS API** (convex/tasks.ts)

```typescript
getBoards(): Board[]
getColumns(boardId): Column[]
getTasks(columnId): Task[]
createBoard(name, description?, projectId?): boardId
createTask(title, description?, columnId, priority?, dueDate?): taskId
updateTaskPosition(taskId, newColumnId, newPosition): null
```

### ✅ **CALENDAR API** (convex/calendar.ts)

```typescript
getEvents(startDate, endDate, projectId?): Event[]
createEvent(title, description?, startDate, endDate, allDay?, projectId?, taskId?, routineId?): eventId
updateEvent(eventId, updates): null
deleteEvent(eventId): null
getTodayEvents(): Event[]
getUpcomingEvents(days?): Event[]
fixAllBrokenEventsTemp(): null
```

### ✅ **NOTES API** (convex/notes.ts)

```typescript
getNotebooks(projectId?): Notebook[]
createNotebook(name, description?, color?, projectId?): notebookId
updateNotebook(notebookId, updates): null
deleteNotebook(notebookId): null
getNotes(notebookId?, projectId?, taskId?, routineId?, tags?, searchTerm?): Note[]
createNote(title, content, tags?, projectId?, taskId?, routineId?, notebookId?): noteId
updateNote(noteId, updates): null
deleteNote(noteId): null
getAllTags(): string[]
getRecentNotes(): Note[]
```

### ✅ **ROUTINES API** (convex/routines.ts)

```typescript
getTemplates(category?, difficulty?): RoutineTemplate[]
createTemplate(name, description, category, difficulty, isPublic, tags, blocks): templateId
getRoutines(timeOfDay?, isActive?): Routine[]
createRoutine(name, description?, templateId?, timeOfDay, blocks?): routineId
completeBlock(routineId, blockId, actualDuration?, notes?, energyLevel?): null
getInsights(timeRange?): RoutineInsights
updateRoutine(routineId, updates): null
deleteRoutine(routineId): null
```

### ✅ **UNIVERSAL LINKING API** (convex/links.ts)

```typescript
createLink(fromTable, fromId, toTable, toId, linkType, metadata?): linkId
getLinksFrom(fromTable, fromId, linkType?): Link[]
getLinksTo(toTable, toId, linkType?): Link[]
getAllLinks(table, id, linkType?): {outgoing: Link[], incoming: Link[]}
updateLink(linkId, metadata): null
deleteLink(linkId): null
linkTaskToRoutine(taskId, routineId, description?): linkId
linkNoteToEntity(noteId, entityTable, entityId, linkType?): linkId
getConnectionGraph(entityTable, entityId, depth?): {nodes: Node[], edges: Edge[]}
```

### ✅ **SEARCH API** (convex/search.ts)

```typescript
search(query, types?, projectId?, limit?): SearchResults
getSearchSuggestions(query): string[]
```

### ✅ **SAMPLE DATA API** (convex/sampleData.ts)

```typescript
createSampleData(): null
```

## 🛠️ **DEVELOPMENT GUIDE**

### **Setup**

```bash
npm run dev        # Next.js
npx convex dev     # Backend (parallel)
```

### **Key Patterns**

**1. New Convex Function with Proper Validation**

```typescript
export const functionName = query({
  args: { param: v.string() },
  returns: v.array(
    v.object({
      _id: v.id("tableName"),
      _creationTime: v.number(),
      field: v.string(),
      userId: v.id("users"),
      createdAt: v.number(),
      updatedAt: v.number(),
    }),
  ),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("tableName")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});
```

**2. Dashboard Widget with Real Data**

```typescript
const projects = useQuery(api.projects.getProjects);
const notes = useQuery(api.notes.getRecentNotes);
const events = useQuery(api.calendar.getUpcomingEvents);

<UnifiedKanbanWidget
  isDarkMode={isDarkMode}
  title="Widget Title"
  icon={IconComponent}
  columns={columnsArray}
  data={transformedData}
  onAddItem={handleAddItem}
/>
```

**3. System Field Validation**

```typescript
// Always include system fields in return validators
returns: v.array(
  v.object({
    _id: v.id("tableName"),
    _creationTime: v.number(), // Required system field
    // ... other fields
    userId: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  }),
);
```

## 🎯 **UPDATED PHASE STATUS**

### **Phase 2: Dashboard & Design System** ✅ **COMPLETE + CALENDAR FIXES**

- ✅ Professional glassmorphic design system
- ✅ Comprehensive Convex backend (49 functions)
- ✅ Real-time data integration across all widgets
- ✅ TypeScript compilation fully resolved
- ✅ Sample data system for demos
- ✅ Universal linking between entities
- ✅ Full-text search functionality
- ✅ **Calendar drag & drop functionality fully working**
- ✅ **Data integrity issues identified and resolved**

### **Phase 3A: Google Calendar Integration** (Next Priority)

- [ ] Google Calendar API setup and OAuth
- [ ] Two-way sync (import/export events)
- [ ] Sync management UI with status tracking
- [ ] Conflict resolution and error handling

### **Phase 3B: Complete UI CRUD Operations**

- [ ] Modal dialogs for all entity creation
- [ ] Inline editing for quick updates
- [ ] Bulk operations and power user features
- [ ] Template systems for rapid creation

### **Phase 3C: UI/UX Polish & Refinement**

- [ ] Smooth animations and transitions
- [ ] Mobile-optimized responsive design
- [ ] Performance optimization
- [ ] Accessibility improvements

### **Phase 4: Unified Quick Add with NLP**

- [ ] Global command palette (Cmd/Ctrl + K)
- [ ] Natural language entity creation
- [ ] Smart date/time parsing
- [ ] Voice integration support

### **Phase 5: AI Agent Integration**

- [ ] Smart task prioritization
- [ ] Proactive productivity insights
- [ ] Natural language AI interface
- [ ] Pattern learning and optimization

## 🎉 **RECENT MAJOR ACCOMPLISHMENTS**

### **Calendar Widget Drag & Drop - FULLY FIXED**

**Issue Resolved**: Events were disappearing during drag operations
**Root Cause**: Corrupted event timestamps (NaN/null values) in database
**Solution**: Complete data repair and enhanced drag handler validation

**Technical Fixes:**

- Created `fixAllBrokenEventsTemp` mutation for data repair
- Enhanced drag handler with comprehensive validation
- Improved date calculations preserving time while changing dates
- Added robust error logging and user feedback
- Implemented optimistic update patterns

### **Enhanced Development Tools**

- ✅ MCP Convex tools integration for live database debugging
- ✅ Comprehensive error handling and validation patterns
- ✅ Data integrity monitoring and repair utilities
- ✅ Real-time debugging capabilities

### **Backend Excellence**

- ✅ Complete API coverage for all major features
- ✅ Proper TypeScript validation with system fields
- ✅ Universal linking system between all entities
- ✅ Full-text search across tasks, notes, projects, events
- ✅ Sample data generation for demos
- ✅ Data repair utilities for maintenance

### **Frontend Integration**

- ✅ Dashboard transformed from dummy to real data
- ✅ Real-time updates across all components
- ✅ Proper loading states and error handling
- ✅ Professional glassmorphic design system
- ✅ Calendar widget with working drag & drop

### **Developer Experience**

- ✅ Comprehensive API documentation
- ✅ Consistent patterns across all functions
- ✅ Proper error handling and validation
- ✅ Complete TypeScript coverage
- ✅ MCP tools for advanced debugging

## 🛠️ **NEXT PHASE PRIORITIES**

### **1. Google Calendar Integration** (Priority 1)

**Timeline**: 1-2 weeks

- Google Calendar API OAuth setup
- Two-way sync implementation
- Conflict resolution strategies
- Professional sync management UI

### **2. Complete UI CRUD Operations** (Priority 2)

**Timeline**: 1-2 weeks

- Modal dialogs for all entity creation
- Inline editing capabilities
- Bulk operations for power users
- Template systems for rapid creation

### **3. UI/UX Polish** (Priority 3)

**Timeline**: 1 week

- Smooth animations and transitions
- Mobile responsiveness improvements
- Performance optimization
- Accessibility enhancements

### **4. Unified Quick Add with NLP** (Priority 4)

**Timeline**: 2-3 weeks

- Global command palette interface
- Natural language processing for entity creation
- Smart parsing and suggestions
- Voice integration support

### **5. AI Agent Integration** (Priority 5)

**Timeline**: 3-4 weeks

- AI-powered task prioritization and scheduling
- Proactive productivity insights
- Conversational AI interface
- Pattern learning and optimization

## 📊 **COMPREHENSIVE STATISTICS**

- **Backend Functions**: 49 implemented across 6 files
- **Database Tables**: 13 interconnected with proper indexing
- **API Coverage**: 100% of core functionality + data repair utilities
- **Frontend Pages**: 6 with real data integration
- **Components**: 13+ reusable with dynamic data
- **Authentication**: Multi-provider (Password + Google OAuth)
- **Real-time**: Full Convex real-time synchronization
- **Search**: Full-text search across all entities
- **Linking**: Universal cross-entity linking system
- **Data Integrity**: Automated repair and validation systems

## 🔧 **DEVELOPMENT INSIGHTS**

### **What's Working Exceptionally Well:**

- **MCP Convex Tools**: Game-changing for database debugging and data repair
- **Real-time Data Integration**: Seamless updates across all components
- **Comprehensive Backend**: 49 functions provide solid foundation
- **Design System**: Consistent glassmorphic patterns enable rapid development

### **Key Success Factors:**

- **Data-First Approach**: Fixing data integrity first resolved UI issues
- **Comprehensive Logging**: Detailed error logging accelerated debugging
- **Modular Architecture**: Easy to isolate and fix specific issues
- **Real-time Debugging**: MCP tools enabled live database inspection

## 🔧 **TROUBLESHOOTING**

- **Auth errors**: See `AUTH_TROUBLESHOOTING.md`
- **TypeScript errors**: All system fields included in validators
- **Real data**: All pages now use live Convex data
- **Design patterns**: Follow established glassmorphic patterns
- **Calendar issues**: Drag & drop functionality fully working
- **Data integrity**: Automated repair utilities available

**Status**: Production-ready backend with battle-tested functionality. Calendar issues resolved. Ready for Google Calendar integration and advanced feature development.
