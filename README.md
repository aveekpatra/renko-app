# Renko - Focus on Doing, Not Planning

A modern productivity app that combines project management, task tracking, and intelligent scheduling into one seamless experience.

## ✨ Features

### **📋 Project Management**

- Kanban boards with drag-and-drop functionality
- Task organization with priorities and due dates
- Project-based task grouping

### **📅 Calendar Integration**

- Weekly calendar view with drag-and-drop scheduling
- Task scheduling and time blocking
- Smart calendar interface

### **🎯 Productivity Focus**

- Routine templates and habit tracking
- Time estimation and progress tracking
- Clean, distraction-free interface

## 🚀 Quick Start

1. **Clone and Install**

   ```bash
   git clone <repository-url>
   cd renko-app
   npm install
   ```

2. **Set up Convex**

   ```bash
   npx convex dev
   ```

3. **Configure Environment**

   ```bash
   # Copy .env.example to .env.local and configure:
   AUTH_GOOGLE_ID=your_google_oauth_client_id
   AUTH_GOOGLE_SECRET=your_google_oauth_client_secret

   # For Google Calendar integration (optional):
   GOOGLE_API_KEY=your_google_api_key
   ```

4. **Start Development**
   ```bash
   npm run dev
   ```

## 🏗️ Architecture

- **Frontend**: Next.js 14 with TypeScript and Tailwind CSS
- **Backend**: Convex for real-time database and serverless functions
- **Authentication**: Convex Auth with Google OAuth
- **UI**: Custom components with Lucide icons

## 📝 Status

✅ Core project and task management
✅ Kanban board interface
✅ Calendar scheduling system
✅ User authentication
✅ Real-time updates
✅ Responsive design

**Status**: Production-ready backend with comprehensive task management and calendar functionality.

## 🛠️ Development

### **Project Structure**

```
renko-app/
├── app/                 # Next.js pages and routing
├── components/          # React components
├── convex/             # Backend functions and schema
└── docs/               # Documentation
```

### **Key Technologies**

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Convex (Backend)
- Lucide Icons

## 📖 Documentation

See the `docs/` folder for detailed documentation:

- [API Reference](docs/API_REFERENCE.md)
- [Technical Implementation](docs/TECHNICAL_IMPLEMENTATION_GUIDE.md)
- [Development Roadmap](docs/DEVELOPMENT_ROADMAP.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.
