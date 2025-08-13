# Olivium React Training Material

A comprehensive React training program designed for Olivium developers to master modern React development patterns and build production-ready applications.

## 🎯 Program Overview

This training material provides a complete learning journey from basic React concepts to advanced patterns, using a real-world inventory management system as the foundation.

### **What's Included:**
- ✅ **Full-Stack Application**: Next.js frontend + FastAPI backend
- ✅ **10 Progressive Learning Tasks**: From beginner to advanced
- ✅ **Complete Codebase**: Production-ready architecture
- ✅ **Learning Materials**: Detailed guides with hints and examples
- ✅ **API Testing**: Postman collection for backend testing

## 📚 Learning Path

### **Training Structure:**
1. **Tasks 1-2**: React Fundamentals (Components, JSX, Props)
2. **Tasks 3-4**: State Management & API Integration  
3. **Tasks 5-6**: Forms & Complex Interactions
4. **Tasks 7-10**: Advanced Patterns & Real-World Features

### **Total Learning Time**: ~15-20 hours
### **Difficulty Progression**: ⭐ → ⭐⭐⭐⭐

## 🚀 Quick Start

### **For Learners:**
```bash
# Start the learning journey
cd learning/
open README.md
```

### **For Instructors:**
```bash
# Set up the full development environment
pnpm install
pnpm dev  # Start frontend

# In another terminal
cd backend/
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py  # Start backend
```

## 🏗️ Tech Stack

### **Frontend:**
- **Framework**: Next.js 14 (App Router)
- **UI Library**: Material-UI (MUI) v6
- **State Management**: Redux Toolkit + TanStack Query
- **Forms**: React Hook Form + Zod
- **Styling**: Material Design 3 + CSS Variables
- **Charts**: Recharts
- **Drag & Drop**: React Beautiful DnD

### **Backend:**
- **Framework**: FastAPI
- **Database**: SQLite + SQLAlchemy
- **Validation**: Pydantic
- **API Testing**: Postman collection included

### **Development:**
- **Monorepo**: pnpm + Turborepo
- **TypeScript**: Strict mode
- **Testing**: Vitest + React Testing Library
- **Linting**: ESLint + Prettier

## 📁 Project Structure

```
training-material-react/
├── 📚 learning/                 # Training materials
│   ├── README.md               # Master checklist
│   └── task-*.md              # Individual task guides
├── 🖥️ apps/
│   └── web/                   # Next.js frontend
├── 📦 packages/
│   ├── ui/                    # Component library
│   ├── tokens/                # Design tokens
│   └── config/                # Shared configs
├── 🔧 backend/                # FastAPI backend
├── 📮 postman/                # API testing
└── 📋 docs/                   # Additional documentation
```

## 🎓 Learning Objectives

By completing this training, developers will master:

### **React Fundamentals:**
- ✅ Functional components and hooks
- ✅ State management patterns
- ✅ Event handling and forms
- ✅ Component lifecycle

### **Advanced React:**
- ✅ Custom hooks and Context API
- ✅ Complex state management
- ✅ Form validation and error handling
- ✅ Third-party library integration

### **Real-World Skills:**
- ✅ API integration and data fetching
- ✅ Responsive design with MUI
- ✅ Data visualization
- ✅ CRUD operations

### **Professional Patterns:**
- ✅ Multi-step workflows
- ✅ Drag and drop interactions
- ✅ Data persistence
- ✅ Production-ready architecture

## 🏢 About Olivium

This training program is specifically designed for Olivium developers to ensure consistency in React development practices across all projects. Each task simulates real-world scenarios encountered in Olivium applications.

## 📖 Getting Started

1. **Clone this repository**
2. **Navigate to `learning/README.md`** to start your training
3. **Follow the tasks in order** - each builds on the previous
4. **Ask your mentor** when you need help
5. **Track your progress** with the provided checklists

## 🤝 Contributing

This training material is maintained by the Olivium development team. For improvements or suggestions, please create an issue or submit a pull request.

## 📄 License

Internal training material for Olivium developers.

---

**Ready to start your React journey? Open [`learning/README.md`](./learning/README.md) to begin! 🚀**
