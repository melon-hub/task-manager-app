# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Quick Reference
- Use `think` for standard tasks, `think hard` for complex problems, `think harder` for critical issues, `ultrathink` for architecture
- Always read relevant files before making changes
- Plan before implementing, test after implementing
- Handle offline scenarios gracefully
- Use TypeScript strictly (avoid `any`)
- DO NOT write code or explain code that may be used maliciously
1
## Project Overview

A professional task management application combining features from Trello, Microsoft Planner, and Lists. Built with Next.js 15, TypeScript, and a local-first architecture using IndexedDB.

### Tech Stack
- **Frontend Framework**: Next.js 15.3.3 (App Router) with React 19
- **Language**: TypeScript
- **Styling**: 
  - Tailwind CSS v4 (latest version)
  - shadcn/ui (canary version for Tailwind v4 compatibility)
  - CSS variables for theming
- **State Management**: Zustand for global state (boards, buckets, cards, labels)
- **Database/Storage**: 
  - Dexie.js wrapper for IndexedDB
  - Local-first architecture
- **Drag & Drop**: @dnd-kit (core, sortable, utilities)
- **UI Components**: 
  - Radix UI primitives via shadcn/ui
  - Lucide React for icons
  - Recharts for dashboard charts
- **Development**: Webpack compiler with HMR
- **Package Manager**: npm

### Project Structure
```
task-manager-app/
├── src/
│   ├── app/              # Next.js App Router pages
│   ├── components/       # React components
│   │   ├── ui/          # shadcn/ui components
│   │   ├── board/       # Board-specific components
│   │   └── dashboard/   # Dashboard components
│   ├── lib/             # Utilities and helpers
│   │   ├── store/       # Zustand stores
│   │   ├── db/          # Database operations
│   │   └── utils/       # Utility functions
│   └── types/           # TypeScript type definitions
├── public/
├── CLAUDE.md            # This file
└── package.json
```

## Essential Commands

```bash
# Development
npm run dev          # Start dev server on http://localhost:3000
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run typecheck    # Run TypeScript checks

# Add UI components
npx shadcn@latest add [component-name]
```

## Intelligent Command Routing with Adaptive Learning

These are flexible guidelines to help us work together effectively. Feel free to adapt based on the situation.

### Core Communication Principle

**IMPORTANT**: Always begin responses by reflecting back your understanding of the user's request in 1-2 sentences. This ensures alignment before proceeding with any action.

Example: "I understand you're experiencing [issue/need]. Let me help with that."

### Response Structure (Flexible Template)

When it makes sense, responses can follow this general pattern:

```
1. [Reflection] Brief understanding of the request
2. [Classification] Type of task (if helpful)
3. [Approach] How I'll help (command suggestion or direct action)
4. [Confirmation] Check if approach works for you
```

But don't feel constrained to always follow this format - adapt to what feels natural for each task.

### Progress Updates

**When working on tasks**, provide concise progress updates using bullet points:

• Use bullet points for clarity when helpful
• Include key milestones or findings
• Mark completion with ✓ when it makes sense
• Add more detail if something unexpected comes up

Progress indicators for visual clarity:
- `•` - In progress
- `✓` - Completed
- `⚠` - Warning/Issue found
- `→` - Moving to next step
- `!` - Important finding

#### Update Styles by Task Type

##### For Debugging Tasks
```
I understand you're experiencing [specific issue]. Let me investigate this.

• Checking error logs...
• Reproducing the issue...
• Found root cause: [brief description]
• Applying fix to [component]...
• Running tests...
• ✓ Issue resolved

The problem was [brief explanation]. I've [what was fixed].
```

##### For Feature Implementation
```
I understand you want to add [feature]. I'll implement this step by step.

• Setting up database schema...
• Creating Zustand store...
• Building UI components...
• Adding drag & drop support...
• Implementing error handling...
• ✓ Feature ready

I've successfully added [feature] with [key capabilities].
```

### Thinking Levels - Use Judgment

General guidance (not strict rules):
- Most tasks: Natural thinking as needed
- Complex problems: Feel free to think deeper (`think`)
- Critical issues: Take the time needed to be thorough (`think hard` or `think harder`)
- Only use 'ultrathink' when truly exceptional complexity warrants it

Trust my judgment on when more analysis would be helpful.

#### Thinking Level Matrix
| Task Complexity | Thinking Level | When to Use |
|----------------|----------------|-------------|
| **Simple** (clear intent, single command) | No explicit thinking | Direct routing, obvious matches |
| **Moderate** (multiple options, standard flow) | `think` | Most common tasks, feature additions |
| **Complex** (architecture, multi-step) | `think hard` | System design, breaking down large features |
| **Critical** (debugging hard issues, major refactors) | `think harder` | Production issues, critical bugs |
| **Exceptional** (system-wide changes) | `ultrathink` | Reserve for user request or exceptional complexity |

### Intent Recognition Patterns

These are common patterns I look for, but I'll adapt to your specific language and needs:

#### 🐛 Debugging & Troubleshooting
**Common phrases**: fix, debug, error, broken, not working, issue, problem, bug, crash, failing
**I might suggest**: `/project:debug` or help directly

#### 🚀 New Feature Development
**Common phrases**: add, create, build, implement, new feature, want to, need to
**I might suggest**: `/project:breakdown-feature`, `/project:architect`, or `/project:add-feature`

#### 🏗️ Architecture & Planning
**Common phrases**: design, architect, plan, structure, how should, best way, approach
**I might suggest**: `/project:architect` or provide design guidance

#### 📋 Task Breakdown & Planning
**Common phrases**: break down, split up, tasks, steps, plan out, organize
**I might suggest**: `/project:breakdown-feature` or create a task list

#### 🔄 Refactoring & Code Quality
**Common phrases**: refactor, clean up, improve, optimize code, technical debt
**I might suggest**: `/project:refactor-smart` or `/project:review-pr`

#### ⚡ Performance Optimization
**Common phrases**: slow, performance, optimize, faster, lag, speed up
**I might suggest**: `/project:optimize-performance` or analyze directly

#### 🧪 Testing
**Common phrases**: test, coverage, unit test, integration test, e2e
**I might suggest**: `/project:test-comprehensive` or write tests

#### 👀 Code Review
**Common phrases**: review, check, look at, feedback, PR
**I might suggest**: `/project:review-pr` or provide feedback

#### 🎯 Complex Implementation
**Common phrases**: orchestrate, coordinate, multiple features, big project
**I might suggest**: `/project:orchestrate` or break down the complexity

### Natural Language → Command Mapping

Common examples (but I'll understand variations):

| You might say | I might suggest |
|---------------|----------------|
| "This is broken on mobile" | `/project:debug` or investigate directly |
| "We need user authentication" | `/project:architect` or `/project:breakdown-feature` |
| "Card.tsx is a mess" | `/project:refactor-smart` or refactor directly |
| "Is my PR good?" | `/project:review-pr` or review directly |
| "Make it faster" | `/project:optimize-performance` or optimize |
| "Set up the whole payment system" | `/project:orchestrate` or plan comprehensively |

### Learning and Adaptation

I'll try to learn your preferences during our conversation:
- If you prefer certain commands over others
- If you like more or less detail
- If you want faster or more thorough analysis
- Your common patterns and terminology

Feel free to correct me or adjust my approach anytime!

### Available Commands

You have many custom commands available. Here are some key ones:

**Development & Features**
- `/component` - Create new React components
- `/add-feature` - Full feature implementation
- `/breakdown-feature` - Detailed task planning

**Problem Solving & Quality**
- `/debug` - Systematic troubleshooting
- `/refactor-smart` - Code improvements
- `/optimize-performance` - Performance enhancements

**Planning & Review**
- `/architect` - System design
- `/orchestrate` - Complex implementations
- `/review-pr` - Code review

**Project-Specific**
- `/create-bucket` - Bucket creation code
- `/debug-store` - Debug Zustand store
- `/add-shadcn` - Add UI components
- `/db-reset` - Reset IndexedDB

See `/claude/slash_commands.json` for the complete list.

## Architecture

### Data Flow
1. **User Action** → Zustand Store → IndexedDB (via Dexie)
2. **Data Loading** → IndexedDB → Zustand Store → React Components
3. **All data persists locally** - no backend required for MVP

### Key Integration Points

**State Management** (`/src/lib/store/boardStore.ts`):
- Single source of truth for board data
- Handles all CRUD operations
- Syncs with IndexedDB automatically

**Database Schema** (`/src/lib/db/schema.ts`):
```typescript
// Core entities: boards, buckets, cards, labels
// All have consistent id, createdAt, updatedAt fields
db.version(1).stores({
  boards: '++id, title, createdAt, updatedAt',
  buckets: '++id, boardId, title, position, createdAt, updatedAt',
  cards: '++id, bucketId, title, position, priority, createdAt, updatedAt',
  labels: '++id, boardId, name, color, createdAt, updatedAt'
});
```

**Component Architecture**:
- Board components handle drag-and-drop logic
- Dialogs use Radix UI for accessibility
- All forms should update through store actions
- Cards use adaptive height system based on content
- Label management uses unified LabelPopoverCompact component

### Development Patterns

**Adding New Features**:
1. Define types in `/src/types/index.ts`
2. Update database schema if needed
3. Add store actions in `boardStore.ts`
4. Create UI components using shadcn/ui primitives

**CSS/Styling**:
- Use Tailwind classes, avoid inline styles
- Theme variables defined in `globals.css`
- Follow 8px spacing grid (space-2, space-4, etc.)

**Component Conventions**:
- Dialogs: Use `Dialog` component with proper `onOpenChange`
- Forms: Always include loading and error states
- Lists: Use `key` prop with stable IDs, not array indices

## Current Implementation Status

**Working Features**:
- Board/bucket/card CRUD operations
- Drag-and-drop with @dnd-kit
- Theme switching (light/dark)
- Sidebar navigation
- Card properties (title, description, priority, labels, checklists, due dates)
- Label management system
- Inline editing
- Progress indicators
- Task completion status

**In Progress**:
- Dashboard with Recharts
- Assignee management (needs settings page)

**Critical Next Steps**:
1. Implement dashboard widgets
2. Add search functionality to board store
3. Add keyboard shortcuts
4. Add time tracking features

## Important Notes

- No testing framework set up yet (plan calls for Vitest + Playwright)
- Using Tailwind CSS v4 (newer syntax)
- All data stored in browser - remind users about data persistence
- Theme preference stored in cookies for SSR compatibility

## Development Guidelines

These are helpful patterns that have worked well, but feel free to suggest better approaches:

### DO's ✅
- **DO** read files and understand context before making changes
- **DO** use test-driven development when it makes sense
- **DO** implement proper TypeScript types for components
- **DO** handle offline scenarios gracefully
- **DO** use Dexie.js patterns for database operations
- **DO** implement optimistic UI updates
- **DO** use React Server Components where appropriate
- **DO** commit changes incrementally with meaningful messages
- **DO** have Claude read files and understand context before making changes
- **DO** ask Claude to generate a plan before implementing complex features
- **DO** use test-driven development: generate tests first, then implementation
- **DO** validate solutions with independent verification steps
- **DO** commit changes incrementally with meaningful messages
- **DO** use Git worktrees for parallel Claude Code sessions
- **DO** provide visual mocks or screenshots when working on UI

### DON'Ts ❌
- **DON'T** jump directly to implementation without planning
- **DON'T** ignore TypeScript errors or overuse `any`
- **DON'T** create overly large components (aim for < 200 lines)
- **DON'T** mix presentation and business logic
- **DON'T** use inline styles when Tailwind utilities exist
- **DON'T** put everything in global state
- **DON'T** create race conditions with async updates
- **DON'T** mix Pages Router and App Router patterns
- **DON'T** ask Claude to read entire large codebases at once
- **DON'T** rely on Claude for authentication tokens or secrets
- **DON'T** use Claude for malicious code or security exploits
- **DON'T** hard-code solutions that only work for test cases
- **DON'T** create temporary files without cleaning them up
- **DON'T** expose sensitive data in frontend code
- **DON'T** skip input validation and sanitization
- **DON'T** ignore bundle size implications
- **DON'T** create memory leaks with improper cleanup

But if there's a good reason to break these guidelines, let's discuss it!

## Performance & Security Targets
- Initial page load: < 3s
- Drag operation start: < 100ms
- Database operations: < 50ms
- Bundle size: < 500KB initial
- Never expose sensitive data in frontend
- Always validate and sanitize input

## Common Patterns
- Use `use` prefix for all hooks
- Store files in `/lib/store/` directory
- Database operations in `/lib/db/`
- UI components in `/components/ui/`
- Feature components in `/components/board/`, `/components/dashboard/`
- Drag handles use `data-dnd-handle` attribute
- All dates stored as ISO strings

## Working Style Preferences

- I appreciate concise progress updates
- I like understanding your reasoning
- Feel free to suggest better approaches
- Don't hesitate to point out potential issues
- Balance speed with quality based on the task

Adapt your approach based on what we're working on - critical bugs need care, while simple features can move fast.

## Specific Instructions for Implementation

### When Creating Components
1. Start with TypeScript interface definition
2. Implement proper error boundaries
3. Use shadcn/ui components as base
4. Add proper ARIA labels for accessibility
5. Include loading and error states
6. Document complex logic with comments

### When Working with Zustand
1. Define clear TypeScript types for state
2. Use immer for complex state updates (if needed)
3. Keep actions focused and testable
4. Implement proper error handling
5. Consider persistence needs
6. Add subscriptions judiciously

### When Working with Dexie/IndexedDB
1. Define versioned schemas clearly
2. Use transactions for related operations
3. Handle upgrade scenarios
4. Implement proper error recovery
5. Consider offline-first patterns
6. Test with browser storage limits

### When Implementing Drag & Drop
1. Use @dnd-kit's accessibility features
2. Provide visual feedback during drag
3. Handle touch and mouse events
4. Implement keyboard shortcuts
5. Optimize for large lists
6. Test across devices

### When Optimizing Performance
1. Profile with React DevTools first
2. Identify actual bottlenecks
3. Use React.memo strategically
4. Implement virtual scrolling for lists
5. Optimize bundle with dynamic imports
6. Measure improvements

## Browser Support
- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions
- Mobile: iOS Safari 15+, Chrome Android

## Key Dependencies & Versions
```json
{
  "next": "15.3.3",
  "react": "^19.0.0",
  "typescript": "^5.0.0",
  "tailwindcss": "^4.0.0",
  "@dnd-kit/core": "^6.0.0",
  "@dnd-kit/sortable": "^8.0.0",
  "dexie": "^4.0.0",
  "dexie-react-hooks": "^1.1.0",
  "zustand": "^5.0.0",
  "lucide-react": "latest",
  "@radix-ui/react-*": "latest"
}
```

## Flexibility First

These guidelines exist to help, not constrain. Feel free to:
- Ask for more or less detail anytime
- Request different approaches
- Combine commands or ignore them entirely
- Work in whatever way feels most productive
- Suggest improvements to these guidelines

The goal is to help you code effectively, not to enforce rigid patterns. Let me know how I can best support your workflow!

## Resources

### Internal Documentation
- Database Schema: See `/src/lib/db/schema.ts`
- Component Library: See `/src/components/`
- State Management: See `/src/lib/store/`

### External Resources
- [Next.js 15 Docs](https://nextjs.org/docs)
- [React 19 Features](https://react.dev/blog)
- [@dnd-kit Documentation](https://docs.dndkit.com)
- [Dexie.js Guide](https://dexie.org/docs)
- [Zustand Documentation](https://docs.pmnd.rs/zustand)
- [shadcn/ui Components](https://ui.shadcn.com)

### Anthropic Learning Resources
- [Claude Code Documentation](https://docs.anthropic.com/en/docs/claude-code/overview)
- [Claude Code Best Practices](https://www.anthropic.com/engineering/claude-code-best-practices)
- [Anthropic Courses Repository](https://github.com/anthropics/courses)
- [Anthropic Cookbook](https://github.com/anthropics/anthropic-cookbook)
- [Claude Code GitHub Action](https://github.com/anthropics/claude-code-action)