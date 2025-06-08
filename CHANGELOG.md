# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Phase 1: Fluid Card & List Interactions
  - Hover-to-reveal 'Add Card' button in buckets
  - Quick Add in-place card creation with inline textarea
  - Subtle hover animations on cards
  - Visual drag-and-drop placeholder with dashed border
- Phase 2: Keyboard Superpowers
  - Press 'e' to edit when hovering over a card
  - Press 'n' anywhere to create a new card (context-aware)
  - Cmd/Ctrl+K opens command palette for quick navigation
- Error boundaries for graceful error handling
- Component composition improvements for better maintainability

### Changed
- Refactored EditCardDialog into smaller, focused components:
  - ChecklistManager: Handles checklist functionality with progress tracking
  - AssigneeManager: Manages adding/removing assignees  
  - LabelManager: Manages labels with drag-and-drop reordering
- Improved drag-and-drop UX by removing grip handles for cleaner appearance
- Made bucket hover indicators more subtle
- Fixed TypeScript type safety issues throughout the codebase

### Fixed
- Fixed board type issues in dashboard
- Fixed card.checklist TypeScript errors
- Fixed label persistence with proper boardId and timestamps
- Fixed priority filter type inference issues
- Fixed SVG className handling in DebugOverlay

## [0.1.0] - 2025-01-08

### Added
- Initial MVP release
- Board management (create, edit, delete boards)
- Bucket/column management within boards
- Card management with drag-and-drop functionality
- Card properties:
  - Title and description
  - Priority levels (Low, Medium, High, Urgent)
  - Due dates
  - Labels with custom colors
  - Checklists with progress tracking
  - Assignees (UI ready, backend pending)
- Label management system
- Dark/light theme support
- Responsive sidebar navigation
- Local-first architecture with IndexedDB
- Real-time updates using Zustand state management
- Keyboard shortcuts for common actions
- Progress indicators and task completion tracking

### Technical Details
- Built with Next.js 15.3.3 and React 19
- TypeScript for type safety
- Tailwind CSS v4 for styling
- shadcn/ui components for consistent UI
- @dnd-kit for accessible drag-and-drop
- Dexie.js for IndexedDB operations
- Zustand for state management

[Unreleased]: https://github.com/melon-hub/task-manager-app/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/melon-hub/task-manager-app/releases/tag/v0.1.0