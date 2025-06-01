# 🎯 Renko - AI-Ready Productivity App

**For Claude/Cursor AI**: Next.js + Convex productivity app with glassmorphic design, ready for AI features.

## 🚀 **CURRENT STATUS**

### ✅ **IMPLEMENTED**

- **Auth**: Password + Google OAuth (Convex Auth)
- **Database**: Complete schema (6 tables)
- **API**: Tasks CRUD (6 functions)
- **Frontend**: 6 pages with glassmorphic design
- **Components**: 13 reusable components

### 📁 **PROJECT STRUCTURE**

```
app/
├── page.tsx           # Dashboard (4 widgets)
├── boards/page.tsx    # Kanban management
├── calendar/page.tsx  # Week view calendar
├── notes/page.tsx     # Notes with notebooks
├── habits/page.tsx    # Routine builder with templates & insights
└── signin/page.tsx    # Split-screen auth

components/
├── UnifiedKanbanWidget.tsx  # Main widget
├── Sidebar.tsx             # Navigation
└── [11 other components]

convex/
├── schema.ts    # 6 tables (tasks, projects, notes, events, boards, columns)
├── tasks.ts     # 6 working functions
└── auth.ts      # Auth setup
```

## 🔌 **API STATUS**

### ✅ **WORKING** (convex/tasks.ts)

```typescript
getBoards(): Board[]
getColumns(boardId): Column[]
getTasks(columnId): Task[]
createBoard(name, description?, projectId?): boardId
createTask(title, description?, columnId, priority?, dueDate?): taskId
updateTaskPosition(taskId, newColumnId, newPosition): null
```

### ❌ **MISSING** (pages use static data)

- `convex/routines.ts` - Routine management API (blocks, templates, progress)
- `convex/calendar.ts` - Calendar events API
- `convex/notes.ts` - Notes management API

## 🛠️ **DEVELOPMENT GUIDE**

### **Setup**

```bash
npm run dev        # Next.js
npx convex dev     # Backend (parallel)
```

### **Key Patterns**

**1. New Convex Function**

```typescript
export const functionName = query({
  args: { param: v.string() },
  returns: v.array(v.object({ field: v.string() })),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db.query("table").collect();
  },
});
```

**2. Dashboard Widget**

```typescript
<UnifiedKanbanWidget
  isDarkMode={isDarkMode}
  title="Widget Title"
  icon={IconComponent}
  columns={columnsArray}
  data={dataObject}
  onAddItem={(columnId) => console.log(columnId)}
/>
```

**3. Theme Usage**

```typescript
const { isDarkMode } = useTheme();
const styles = isDarkMode
  ? "bg-gray-900/60 border-gray-800/60"
  : "bg-white/90 border-gray-200/60";
```

## 🎯 **NEXT PHASES**

### **Phase 3: Complete Tasks** (Current Priority)

- [ ] Task edit/delete
- [ ] Drag & drop
- [ ] Search/filter
- [ ] Real-time updates

### **Phase 4: Connect Real Data**

- [ ] Implement `convex/routines.ts` (templates, blocks, progress tracking)
- [ ] Implement `convex/calendar.ts`
- [ ] Implement `convex/notes.ts`
- [ ] Replace static data

### **Phase 5: AI Features**

- [ ] Smart suggestions
- [ ] Natural language
- [ ] Pattern learning
- [ ] Optimization

## 📊 **QUICK STATS**

- 7,300 lines of code
- 13 components
- 6 working API functions
- 6 database tables defined
- Auth fully working

## 🔧 **TROUBLESHOOTING**

- **Auth errors**: See `AUTH_TROUBLESHOOTING.md`
- **Missing data**: Pages use static data until APIs implemented
- **Design patterns**: Follow `UnifiedKanbanWidget` style
