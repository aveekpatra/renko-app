# 🧠 Renko Strategic Vision - AI-First Task Management

## **CORE MISSION**

_"The smartest AI task agent that actually gets things done"_

Build the first AI agent that doesn't just organize your tasks - it thinks about them, prioritizes intelligently, and helps you execute better. Start with the core (AI + tasks) and expand to a full platform later.

---

## **🎯 PHASE 1: AI TASK AGENT MVP** _(Next 6-8 weeks)_

### **Primary Value Proposition**

_"Finally, an AI that understands your workload and actually helps you prioritize"_

**Core Features for MVP**:

- 🤖 **AI Task Agent**: Powered by Gemini 2.5 Flash via OpenRouter
- ✅ **Smart Task Management**: AI-powered prioritization and scheduling
- 📁 **Basic Projects**: Group tasks with AI insights
- 📅 **Calendar Integration**: Google Calendar sync with AI optimization
- 💬 **Natural Language Input**: "Add task: finish report by Friday" → AI extracts all details

### **What Makes This Different**

1. **AI-First Experience**: Every action is enhanced by AI, not just "chatbot on the side"
2. **Actually Smart Prioritization**: Learns your patterns, not just due dates
3. **Zero Setup Burden**: Talks to you in natural language from day one
4. **Execution Focus**: Helps you DO tasks, not just organize them

### **Technical Stack**

- **Frontend**: Next.js + Tailwind (existing)
- **Backend**: Convex (existing)
- **AI**: OpenRouter + Gemini 2.5 Flash ($0.075 per 1M input tokens)
- **Auth**: Convex Auth (existing)
- **Payments**: Stripe with 7-day trial

---

## **🚀 MVP FEATURE SPECIFICATION**

### **1. AI Task Agent Core**

```typescript
// Primary AI capabilities for MVP
interface TaskAgent {
  // Natural language task creation
  parseTaskInput: (input: string) => {
    title: string;
    description?: string;
    dueDate?: Date;
    priority: "low" | "medium" | "high" | "critical";
    projectId?: string;
    estimatedDuration?: number;
  };

  // Smart prioritization
  reprioritizeTasks: (
    tasks: Task[],
    context: UserContext,
  ) => {
    reorderedTasks: Task[];
    reasoning: string;
    suggestedFocus: Task[];
  };

  // Daily planning
  generateDailyPlan: (
    availableTime: number,
    tasks: Task[],
  ) => {
    timeBlocks: TimeBlock[];
    rationale: string;
    bufferTime: number;
  };

  // Progress insights
  analyzeProgress: (
    completedTasks: Task[],
    timeframe: string,
  ) => {
    completionRate: number;
    productivityInsights: string[];
    nextWeekSuggestions: string[];
  };
}
```

### **2. Core Database Schema (MVP)**

```typescript
// Minimal schema for MVP launch
export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    subscriptionStatus: v.string(),
    trialEndsAt: v.optional(v.number()),
    aiPreferences: v.object({
      communicationStyle: v.string(), // "direct" | "encouraging" | "detailed"
      prioritizationStyle: v.string(), // "deadline-driven" | "impact-first" | "balanced"
    }),
  }),

  projects: defineTable({
    userId: v.id("users"),
    name: v.string(),
    description: v.optional(v.string()),
    priority: v.string(),
    status: v.string(),
    aiInsights: v.optional(v.string()),
  }).index("by_user", ["userId"]),

  tasks: defineTable({
    userId: v.id("users"),
    projectId: v.optional(v.id("projects")),
    title: v.string(),
    description: v.optional(v.string()),
    priority: v.string(),
    status: v.string(),
    dueDate: v.optional(v.number()),
    estimatedDuration: v.optional(v.number()),
    actualDuration: v.optional(v.number()),
    aiPriorityScore: v.optional(v.number()),
    aiReasoning: v.optional(v.string()),
    completedAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_project", ["projectId"])
    .index("by_user_status", ["userId", "status"])
    .index("by_user_priority", ["userId", "priority"]),

  calendar_connections: defineTable({
    userId: v.id("users"),
    googleCalendarId: v.string(),
    calendarName: v.string(),
    accessToken: v.string(),
    refreshToken: v.string(),
    expiresAt: v.number(),
    isActive: v.boolean(),
  }).index("by_user", ["userId"]),

  ai_interactions: defineTable({
    userId: v.id("users"),
    type: v.string(), // "task_creation", "prioritization", "daily_plan"
    input: v.string(),
    output: v.string(),
    tokensUsed: v.number(),
    cost: v.number(),
    timestamp: v.number(),
  }).index("by_user_date", ["userId", "timestamp"]),
});
```

### **3. Key AI Functions for MVP**

```typescript
// Core AI-powered functions
export const createTaskWithAI = mutation({
  args: { input: v.string() },
  handler: async (ctx, args) => {
    // Use Gemini to parse natural language input
    // Create task with AI-extracted details
    // Return task + AI reasoning
  },
});

export const getAITaskPriorities = query({
  args: {},
  handler: async (ctx) => {
    // Get user's current tasks
    // Use AI to reorder by intelligent priority
    // Return prioritized list with reasoning
  },
});

export const generateDailyPlan = action({
  args: { date: v.string() },
  handler: async (ctx, args) => {
    // Get calendar events for the day
    // Get pending tasks
    // Use AI to create optimal schedule
    // Return time-blocked plan
  },
});
```

---

## **💰 MONETIZATION STRATEGY**

### **Simple Pricing Model**

```
🚀 RENKO AI TASK AGENT

7-Day Free Trial (no credit card required)
↓
$12/month or $120/year (save 17%)

What's included:
✅ Unlimited AI-powered task management
✅ Smart prioritization and daily planning
✅ Google Calendar integration
✅ Up to 3 projects
✅ Progress insights and coaching

Heavy usage limits:
• 500 AI operations per month
• Additional operations: $0.02 each
```

### **Why This Pricing Works**

- **$12/month**: Lower than competitors ($15-30), accessible for individuals
- **No free tier**: Ensures serious users, reduces support burden
- **7-day trial**: Industry standard, no friction
- **Usage-based overages**: Fair for heavy users, protects margins
- **Annual discount**: Improves retention and cash flow

---

## **📈 PHASE 2: PLATFORM EXPANSION** _(Months 3-6)_

### **Feature Additions**

- 📝 **AI Notes**: Smart note-taking with task extraction
- 🔗 **Zapier Integration**: Connect to 5,000+ apps
- 👥 **Team Features**: Shared projects and AI insights
- 📊 **Advanced Analytics**: Deep productivity patterns
- 🎤 **Voice Input**: Multimodal task capture
- 📱 **Mobile Apps**: Native iOS/Android

### **Market Expansion**

- Individual → Team → Enterprise
- Task management → Full productivity platform
- AI agent → AI workplace assistant

---

## **🎯 SUCCESS METRICS FOR MVP**

### **Technical Metrics**

- **AI Accuracy**: 90%+ correct task parsing from natural language
- **Response Time**: <2 seconds for AI operations
- **Uptime**: 99.5%+ availability

### **Business Metrics**

- **Trial Conversion**: 25%+ (trial → paid)
- **Monthly Churn**: <5%
- **User Engagement**: 4+ AI interactions per week
- **Revenue Target**: $10K MRR within 3 months

### **User Experience Metrics**

- **Time to First Value**: <5 minutes (first AI-created task)
- **Daily Active Usage**: 70%+ of subscribers use daily
- **User Satisfaction**: 4.5+ stars average rating

---

## **🏃‍♂️ GO-TO-MARKET STRATEGY**

### **Launch Approach**

1. **Week 1-2**: Friends & family beta (20 users)
2. **Week 3-4**: Limited public beta (100 users)
3. **Week 5-6**: Product Hunt launch + social media
4. **Week 7-8**: Content marketing + paid ads

### **Content Strategy**

- **Blog**: "How AI Actually Makes Task Management Smarter"
- **Twitter**: Daily AI productivity tips and demos
- **YouTube**: "AI vs Manual: Productivity Showdown"
- **Reddit**: Engage in r/productivity, r/getmotivated

### **Key Messages**

- "Stop organizing tasks, start completing them"
- "Your personal AI productivity coach"
- "The task manager that actually thinks"

---

## **🔮 LONG-TERM VISION** _(Year 1+)_

Transform Renko from an AI task agent into the world's most intelligent productivity platform:

1. **AI Workplace Assistant**: Handles emails, meetings, documentation
2. **Predictive Productivity**: Prevents burnout before it happens
3. **Team Intelligence**: AI that understands group dynamics
4. **Integration Hub**: The AI layer for all your productivity tools
5. **Enterprise Platform**: Custom AI training on company data

**Ultimate Goal**: Become the AI productivity standard that other tools integrate with, not compete against.

---

_This strategy prioritizes speed to market with a focused, AI-first MVP that can generate revenue quickly while building toward the comprehensive platform vision._
