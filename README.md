# Task Manager App

A modern, feature-rich task management application inspired by Trello, Microsoft Planner, and Apple Notes. Built with a local-first architecture for blazing-fast performance and offline capability.

![Next.js](https://img.shields.io/badge/Next.js-15.3.3-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19.0-blue?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC?style=flat-square&logo=tailwind-css)

## ✨ Features

### Core Functionality
- 📋 **Kanban Boards** - Create multiple boards to organize your projects
- 🗂️ **Lists/Buckets** - Organize tasks into customizable lists
- 🎯 **Cards/Tasks** - Rich task cards with multiple properties
- 🔄 **Drag & Drop** - Smooth drag-and-drop to reorder cards and lists
- 💾 **Local-First** - All data stored locally in IndexedDB for instant access

### Task Management
- ✅ **Task Completion** - Mark tasks as complete with visual indicators
- 📅 **Smart Due Dates** - Relative date display (Today, Tomorrow, Overdue)
- 🏷️ **Custom Labels** - Create and manage colored labels with improved popover interface
- 🎨 **Priority Levels** - High, Medium, Low priority with color coding
- 📝 **Rich Descriptions** - Add detailed descriptions to tasks
- ☑️ **Checklists** - Create sub-tasks with progress tracking and visual indicators
- ✏️ **Inline Editing** - Double-click to edit task titles instantly
- 👥 **Assignee Support** - Assign team members with avatar display
- 🖱️ **Context Menu** - Right-click cards for quick actions
- 📐 **Adaptive Card Height** - Cards automatically adjust height based on content density
- 📊 **Inline Metadata** - Single metadata items display inline for cleaner cards

### User Experience
- 🌓 **Dark/Light Theme** - Beautiful themes with system preference support
- ⚡ **Instant Updates** - Optimistic UI for immediate feedback
- 📱 **Responsive Design** - Works perfectly on desktop and mobile
- 🔍 **Visual Progress** - See checklist progress at a glance with filled dots
- 🎯 **Hover Actions** - Quick access to edit and delete functions
- ⏱️ **Loading States** - Skeleton loaders and empty states for better UX
- ⌨️ **Keyboard Shortcuts** - Press 'e' to edit on hover, 'n' to create new card, Cmd/Ctrl+K for command palette
- 🚀 **Fluid Interactions** - Hover-to-reveal buttons, inline card creation, smooth animations
- 🛡️ **Error Boundaries** - Graceful error handling with retry functionality
- 🏷️ **Label Popover Compact** - Streamlined label management with search, create, and edit in one place
- 🎴 **Smart Card Layout** - Compact cards for simple tasks, expanded view for complex items

### Analytics & Dashboard
- 📊 **Interactive Dashboard** - Comprehensive analytics with charts and metrics
- 📈 **Performance Metrics** - Track velocity, cycle time, and throughput
- 👥 **Team Performance** - Monitor workload distribution and collaboration
- 🎯 **Personal Targets** - Set and track daily/weekly task goals
- 🔍 **Smart Filters** - Filter by board, date range, priority, and assignee
- ⚙️ **Customizable Layout** - Show/hide dashboard sections as needed
- 💾 **Save Preferences** - Remember your dashboard settings
- 📤 **Export Data** - Download analytics data as JSON

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/task-manager-app.git
cd task-manager-app
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🛠️ Tech Stack

### Frontend Framework
- **Next.js 15.3.3** - React framework with App Router
- **React 19** - Latest React with improved performance
- **TypeScript** - Type-safe development

### Styling
- **Tailwind CSS v4** - Utility-first CSS framework
- **shadcn/ui** - Beautiful, accessible component library
- **Radix UI** - Unstyled, accessible components
- **Lucide Icons** - Beautiful open-source icons

### State & Data
- **Zustand** - Lightweight state management
- **Dexie.js** - IndexedDB wrapper for local storage
- **@dnd-kit** - Accessible drag-and-drop library
- **Recharts** - Composable charting library for dashboard

### Development
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript** - Static type checking

### Architecture Highlights
- 🏗️ **Component Composition** - Large components refactored into focused, reusable pieces
- 🧩 **Modular Design** - Clear separation of concerns with dedicated manager components
- 🔄 **State Management** - Efficient state lifting with Zustand for global state
- 💾 **Local-First** - IndexedDB for offline capability and instant performance
- 🎨 **Clean Code** - TypeScript interfaces, proper error handling, and maintainable structure

## 📁 Project Structure

```
src/
├── app/                 # Next.js app router pages
│   ├── boards/         # Board pages
│   ├── dashboard/      # Dashboard page
│   └── settings/       # Settings page
├── components/         # React components
│   ├── ui/            # shadcn/ui components
│   ├── board/         # Board-specific components
│   │   ├── edit-card/ # EditCardDialog sub-components
│   │   │   ├── ChecklistManager.tsx
│   │   │   ├── AssigneeManager.tsx
│   │   │   └── LabelManager.tsx
│   │   └── ...
│   ├── dashboard/     # Dashboard components
│   ├── layout/        # Layout components
│   └── ErrorBoundary.tsx
├── lib/               # Utilities and core logic
│   ├── store/         # Zustand stores
│   ├── db/            # Database schema and operations
│   └── utils/         # Helper functions
└── types/             # TypeScript type definitions
```

## 🎯 Usage

### Creating a Board
1. Click "Create Board" from the dashboard
2. Enter a board name
3. Start adding lists to organize your tasks

### Managing Tasks
- **Add Task**: Click "Add a card" in any list
- **Edit Task**: Click the edit icon or double-click the title
- **Move Task**: Drag and drop between lists
- **Complete Task**: Check the box in the edit dialog
- **Delete Task**: Click the trash icon

### Using Labels
1. Edit any card
2. Click "Add Labels"
3. Create custom colored labels
4. Apply multiple labels to categorize tasks

### Keyboard Shortcuts
- `Escape` - Close dialogs
- `Enter` - Save changes
- Double-click - Quick edit task titles
- Right-click - Open context menu for quick actions

### Using the Dashboard
1. Navigate to Dashboard from the sidebar
2. View comprehensive analytics and metrics
3. Filter by board, date range, priority, or assignee
4. Click charts to drill down into specific data
5. Set personal targets in Dashboard Settings
6. Export data for external analysis

## 🔧 Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run typecheck    # Run TypeScript compiler
```

### Adding Components

Use shadcn/ui to add new components:
```bash
npx shadcn@latest add [component-name]
```

### Database Schema

The app uses IndexedDB with the following schema:
- **boards** - Board information
- **buckets** - Lists/buckets within boards
- **cards** - Individual task cards
- **labels** - Reusable labels for categorization

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Inspired by [Trello](https://trello.com), [Microsoft Planner](https://www.microsoft.com/en-us/microsoft-365/business/task-management-software), and [Apple Notes](https://www.apple.com/notes/)
- Built with [Next.js](https://nextjs.org/) and [React](https://react.dev/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Drag and drop powered by [@dnd-kit](https://dndkit.com/)

## 🚧 Roadmap

### Recently Completed ✅
- [x] Comprehensive analytics dashboard
- [x] Interactive charts with zoom and legend toggles
- [x] Context menu for quick card actions
- [x] Basic assignee data model
- [x] Dashboard preferences and settings
- [x] Loading states and skeleton loaders
- [x] Checklist visual progress indicators
- [x] Smart due date display with color coding
- [x] Adaptive card height system for optimal content density
- [x] Improved label management with LabelPopoverCompact component
- [x] Inline metadata display for single metadata items

### High Priority (Next Up) 🔥
- [ ] Full-text search and advanced filtering
- [ ] Enhanced assignee management UI
- [ ] Keyboard navigation enhancements
- [ ] Dashboard refactoring for intuitive dual-purpose view

### Medium Priority 🎯
- [ ] Comments and activity feed
- [ ] File attachments
- [ ] Card cover images
- [ ] Time tracking features

### Future Vision 🌟
- [ ] Cloud sync and real-time collaboration
- [ ] Import/export from other services
- [ ] Mobile and desktop apps
- [ ] Advanced features (dependencies, automation, custom fields)

## 📚 Documentation

This project's documentation is organized as follows:

- **README.md** - Project overview and quick start guide
- **DEVELOPMENT.md** - Detailed development guide, including:
  - Current implementation status
  - High-priority improvements
  - Technical architecture
  - Development guidelines
  - Future roadmap

For detailed information about the project's current status, upcoming features, and development guidelines, please refer to [DEVELOPMENT.md](./DEVELOPMENT.md).

---

Made with ❤️ by [Your Name]