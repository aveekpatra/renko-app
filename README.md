# 🧠 Renko - AI Task Agent

**"The smartest AI task agent that actually gets things done"**

Renko is an AI-first task management platform that doesn't just organize your tasks - it thinks about them, prioritizes intelligently, and helps you execute better. Built with Next.js 15, Convex, and powered by Gemini 2.5 Flash via OpenRouter.

## 🎯 Mission

Build the first AI agent that helps you DO tasks, not just organize them. Start with core AI + tasks, generate revenue quickly, then expand to a full productivity platform.

## 🚀 Tech Stack

- **Frontend**: Next.js 15 + React 19 + TypeScript
- **Backend**: Convex (database + server logic)
- **AI**: OpenRouter + Gemini 2.5 Flash ($0.075 per 1M tokens)
- **Authentication**: Convex Auth (Password + Google OAuth)
- **Styling**: Tailwind CSS with glassmorphic design
- **Payments**: Stripe with 7-day trial

## ✨ Core Features (MVP)

### **🤖 AI Task Agent**

- **Natural Language Input**: "Add task: finish report by Friday 3pm" → AI extracts all details
- **Smart Prioritization**: AI reorders tasks based on your patterns, not just due dates
- **Daily Planning**: AI generates optimal time blocks with reasoning
- **Progress Insights**: AI analyzes your productivity patterns and suggests improvements

### **📁 Basic Projects**

- Group tasks with AI-generated insights
- Project progress tracking with AI analysis
- Smart task suggestions per project

### **📅 Calendar Integration**

- Google Calendar sync with AI optimization
- AI-powered scheduling conflict detection
- Focus time blocking suggestions

## 💰 Pricing Strategy

```
🚀 RENKO AI TASK AGENT

7-Day Free Trial (no credit card required)
↓
$12/month or $120/year (save 17%)

✅ Unlimited AI-powered task management
✅ Smart prioritization and daily planning
✅ Google Calendar integration
✅ Up to 3 projects
✅ Progress insights and coaching

Heavy usage: 500 AI operations/month
Additional operations: $0.02 each
```

## 🎯 Current Development Status

### **✅ Completed Foundation**

- [x] Authentication system with Convex Auth
- [x] Basic task management (CRUD operations)
- [x] Project organization system
- [x] Calendar page foundation
- [x] Glassmorphic UI with dark/light themes
- [x] Database schema (10 tables + auth)
- [x] 35 backend functions across 8 files

### **🔄 In Progress (Week 1-2)**

- [ ] OpenRouter + Gemini 2.5 Flash integration
- [ ] Core AI functions (`createTaskWithAI`, `getAITaskPriorities`, `generateDailyPlan`)
- [ ] AI usage tracking and cost monitoring
- [ ] Natural language task parsing

### **📅 Next Priorities (Week 3-4)**

- [ ] AI-enhanced UI with reasoning display
- [ ] Natural language input component
- [ ] Daily plan view with AI explanations
- [ ] Progress insights dashboard

## 🧠 AI Implementation

### **Core AI Capabilities**

```typescript
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
}
```

## 📈 Success Metrics

### **Technical Targets**

- **AI Accuracy**: 90%+ correct task parsing from natural language
- **Response Time**: <2 seconds for AI operations
- **Uptime**: 99.5%+ availability

### **Business Targets**

- **Trial Conversion**: 25%+ (trial → paid)
- **Monthly Churn**: <5%
- **Revenue Target**: $10K MRR within 3 months
- **User Engagement**: 4+ AI interactions per week

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Add your OpenRouter API key, Convex URL, etc.

# Start development server
npm run dev

# Deploy to Convex
npx convex deploy
```

### **Required Environment Variables**

```bash
# Convex
CONVEX_DEPLOYMENT=your-deployment-url
NEXT_PUBLIC_CONVEX_URL=your-convex-url

# OpenRouter (for AI)
OPENROUTER_API_KEY=your-openrouter-key

# Authentication
JWKS=auto-generated
JWT_PRIVATE_KEY=auto-generated
SITE_URL=http://localhost:3000

# Google OAuth (optional)
AUTH_GOOGLE_ID=your-google-client-id
AUTH_GOOGLE_SECRET=your-google-client-secret
```

## 📚 Documentation

- [Strategic Vision](./docs/STRATEGIC_VISION.md) - AI-first MVP strategy
- [Development Roadmap](./docs/DEVELOPMENT_ROADMAP.md) - 8-week launch plan
- [Technical Implementation](./docs/TECHNICAL_IMPLEMENTATION_GUIDE.md) - Detailed specs
- [API Reference](./docs/API_REFERENCE.md) - Backend functions
- [Auth Troubleshooting](./docs/AUTH_TROUBLESHOOTING.md) - Common fixes

## 🎯 Development Philosophy

### **AI-First Principles**

1. **Every action enhanced by AI** - Not just "chatbot on the side"
2. **Actually smart prioritization** - Learns patterns, not just due dates
3. **Zero setup burden** - Natural language from day one
4. **Execution focused** - Help users DO tasks, not organize them

### **MVP Strategy**

- **Focus**: Build the smartest AI task agent first
- **Speed**: 6-8 weeks to revenue-generating MVP
- **Expansion**: Add platform features (notes, teams, etc.) later
- **Quality**: 90%+ AI accuracy, <2s response times

## 🔮 Future Roadmap (Phase 2)

### **Platform Expansion** _(Months 3-6)_

- 📝 AI Notes with task extraction
- 🔗 Zapier integration (5,000+ apps)
- 👥 Team collaboration features
- 🎤 Voice input and multimodal capture
- 📱 Native mobile applications
- 📊 Advanced analytics and insights

### **Long-term Vision** _(Year 1+)_

Transform from AI task agent → World's most intelligent productivity platform:

1. **AI Workplace Assistant**: Emails, meetings, documentation
2. **Predictive Productivity**: Prevent burnout before it happens
3. **Team Intelligence**: AI that understands group dynamics
4. **Integration Hub**: AI layer for all productivity tools
5. **Enterprise Platform**: Custom AI training on company data

## 🤝 Contributing

This project follows a focused AI-first strategy. Contributions should align with:

- **Speed to market** for core AI features
- **Quality AI interactions** over feature complexity
- **Revenue generation** through subscription model
- **Platform expansion** planned for Phase 2

## 📞 Contact & Support

- **Issues**: Use GitHub issues for bugs and feature requests
- **Discussions**: GitHub Discussions for questions and ideas
- **Documentation**: Check `/docs` folder for detailed guides

---

**Built for productivity enthusiasts who want AI that actually helps them get things done. 🚀**
