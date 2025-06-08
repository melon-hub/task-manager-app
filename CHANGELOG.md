# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- (Add new features here)

### Changed
- (Add changes to existing functionality here)

### Deprecated
- (Add deprecated features here)

### Removed
- (Add removed features here)

### Fixed
- (Add bug fixes here)

### Security
- (Add security updates here)

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