# Task Manager App - Development Guide

## Project Status

### Current Implementation Status ✅

#### Core Features
- [x] Multiple boards with customizable lists/buckets
- [x] Drag-and-drop card management
- [x] Rich card properties (title, description, due dates, priority)
- [x] Custom labels with color coding
- [x] Checklists with progress tracking
- [x] Smart due date display with color coding
- [x] Completion status with visual indicators
- [x] Inline editing for quick modifications
- [x] Context menus for quick actions
- [x] Analytics dashboard with charts and metrics
- [x] Theme system (light/dark mode)
- [x] Responsive design for all devices

#### Partially Implemented Features 🔄
- [x] Assignee data model (basic implementation)
- [x] Label system (needs UX improvements)
- [x] Search functionality (basic implementation)

### High Priority Improvements 🔥

#### 1. Search & Filtering
- [ ] Implement full-text search across cards
- [ ] Add advanced filtering system
- [ ] Create filter presets
- [ ] Add keyboard shortcuts for search
- [ ] Implement quick filters

#### 2. Label System UX Improvements
- [ ] Better keyboard navigation in label picker
- [ ] Ability to reorder labels
- [ ] Label groups/categories
- [ ] Quick label toggle from card
- [ ] Bulk apply/remove labels
- [ ] Label usage statistics
- [ ] Import/export label sets

#### 3. Assignee Management
- [ ] Create people/team management in settings
- [ ] Enhance assignee selection UI
- [ ] Support multiple assignees with overlapping avatars
- [ ] Add assignee filtering
- [ ] Implement assignee workload view

### UX Polish & Feel: Implementation Plan

This section details a backlog of high-impact features focused on improving the application's "feel" and intuitive nature, inspired by best-in-class apps like Trello and Microsoft Planner.

#### Phase 1: Fluid Card & List Interactions (High Impact)
This phase focuses on making the core interactions of creating and manipulating cards feel seamless and satisfying.

- **[ ] Hover-to-reveal 'Add Card' button:**
  - **Description:** Instead of a persistent "Add Card" button at the bottom of a list, a subtle `+ Add a card` button should appear only when a user hovers in the space below the last card in a bucket. This is less intrusive and more contextual.
  - **Implementation Details:**
    - **File:** `src/components/board/Bucket.tsx`.
    - **Logic:** The `div` wrapping the bucket's content should become a `group`. The `Button` (or a new `div` that looks like a button) will have `opacity-0 group-hover:opacity-100 transition-opacity` classes.
    - **Regression Guard:** This button will replace the logic that currently opens the `CreateCardDialog`, as this new pattern is for in-place creation.

- **[ ] "Quick Add" in-place card creation:**
  - **Description:** Clicking the `+ Add a card` button should transform it directly into a `textarea` for the card title and a "Save Card" button, avoiding a disruptive dialog. Pressing `Enter` saves the card and adds another "quick add" input below it for rapid, multi-card creation. Pressing `Escape` cancels the action.
  - **Implementation Details:**
    - **File:** `src/components/board/Bucket.tsx`.
    - **State:** Use local component state: `const [isAddingCard, setIsAddingCard] = useState(false)`.
    - **Logic:** When `isAddingCard` is true, render a `<form>` containing a `Textarea` and a `Button`. The `Textarea` should use `onKeyDown` to handle `Enter` (to submit the form) and `Escape` (to set `isAddingCard(false)`). The form's `onSubmit` handler will call the `createCard` store action.
    - **Data:** The `createCard` function must be called with `{ title, bucketId }`. The `bucketId` is available from the `Bucket.tsx` component's props.

- **[ ] Subtle hover animations on cards:**
  - **Description:** When a user hovers over a card, it should gently "lift" with a subtle `box-shadow` increase and a slight `transform: translateY(-2px)`. This makes the cards feel more tangible and interactive.
  - **Implementation Details:**
    - **File:** `src/components/board/CardItem.tsx`.
    - **Logic:** Add `transition-all duration-200 ease-in-out` and `hover:shadow-lg hover:-translate-y-0.5` classes to the main wrapper `div` of the card.
    - **Regression Guard:** Ensure these classes do not interfere with the styles applied by `@dnd-kit` when `isDragging` is true. The `isDragging` styles should take precedence.

- **[ ] Visual drag-and-drop placeholder:**
  - **Description:** When dragging a card, the original space it occupied should show a dashed, semi-transparent placeholder. This gives the user a clear indicator of where the card came from and makes the board feel less jarring during moves.
  - **Implementation Details:**
    - **File:** `src/components/board/CardItem.tsx`.
    - **Library:** `@dnd-kit`.
    - **Logic:** The `useSortable` hook provides an `isDragging` boolean. Use this to conditionally apply classes to the card's wrapper `div`: `cn({ 'opacity-50 border-dashed bg-muted': isDragging })}`.
    - **Drag Overlay:** To perfect the effect, the `DragOverlay` component from `@dnd-kit` should be used in `BoardView.tsx` to render a visually identical, non-translucent copy of the `CardItem` that follows the cursor during the drag operation.

#### Phase 2: Keyboard Superpowers (High Impact for Power Users)
This phase is dedicated to making the app incredibly fast for keyboard-centric users.

- **[ ] Contextual keyboard shortcuts on cards:**
  - **Description:** When a card is "active" (e.g., clicked on), enable a suite of shortcuts: `e` to open the edit dialog, `l` for labels, `d` for due dates, `c` to complete/un-complete, and `Delete` for deletion (with an "Undo" toast).
  - **Implementation Details:**
    - **State:** Add `activeCardId: string | null` to the `useBoardStore`, along with an action `setActiveCardId`.
    - **Activation:** In `CardItem.tsx`, add an `onClick` handler to the main card `div` that calls `setActiveCardId(card.id)`.
    - **Listener:** Add a `useEffect` in `BoardView.tsx` to add/remove a global `keydown` event listener.
    - **Visuals:** In `CardItem.tsx`, apply a visual indicator (e.g., a blue ring class like `ring-2 ring-blue-500`) when `useBoardStore(s => s.activeCardId) === card.id`.
    - **Regression Guard:** The event listener callback *must* check if the user is typing in an input to prevent shortcuts from firing incorrectly. Start the callback with: `if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;`.

- **[ ] Global "Quick Add" shortcut:**
  - **Description:** Pressing `n` anywhere in the app should open the `CreateCardDialog`, pre-populating the board/bucket based on the current view or the most recently used.
  - **Implementation Details:**
    - **File:** `app/layout.tsx` is the best place for a truly global listener.
    - **Logic:** The listener will trigger a global state in a new `useUIStore` (to keep concerns separate) like `setCreateCardDialogOpen(true)`. The `CreateCardDialog` component will then listen to this state.
    - **Context:** To pre-populate, the `useBoardStore` should track the `lastViewedBucketId`. When navigating, this value should be updated. The `CreateCardDialog` can then use this ID.
    - **Regression Guard:** The global listener must also check `e.target` to avoid firing while in an input field.

- **[ ] Command Palette (`Cmd/Ctrl + K`):**
  - **Description:** A power-user feature to quickly search for and navigate to any board, card, or setting.
  - **Implementation Details:**
    - **Library:** `cmdk` is the recommended library.
    - **Component:** Create a new `CommandPalette.tsx` component, rendered conditionally in `app/layout.tsx`.
    - **Data:** It will need to be populated with items from multiple Zustand stores: boards from `useBoardStore`, settings actions, etc. Each item will have a `name`, `action`, and `keywords`.

#### Phase 3: Smarter UI & Feedback (Medium Impact)
This phase focuses on small but crucial details that build user trust and make the app feel "smart".

- **[ ] Actionable "Undo" on delete:**
  - **Description:** When a card is deleted, instead of a confirmation dialog, immediately delete it from the UI and show a "toast" notification at the bottom of the screen: "Card deleted. [Undo]". Clicking "Undo" restores the card.
  - **Implementation Details:**
    - **Library:** `sonner` is recommended for its simplicity and built-in features.
    - **Store Logic:** The `deleteCard` action in `useBoardStore` should be modified. Instead of deleting, it moves the card to a `recentlyDeleted: Map<string, Card>`. It then calls `toast.success("Card deleted", { action: { label: "Undo", onClick: () => undoDelete(card.id) } })` and starts a `setTimeout` (e.g., 5 seconds).
    - **Cleanup:** The `setTimeout` callback will perform the permanent deletion from the Map and from IndexedDB. The `undoDelete` action cancels the timeout and moves the card back. This ensures atomicity.

- **[ ] Auto-save indicators in dialogs:**
  - **Description:** While a user is typing in the `EditCardDialog`, automatically save changes in the background. A subtle "Saving..." and then "Saved ✓" text should appear in the dialog's footer to provide clear feedback. This eliminates the need for a "Save" button.
  - **Implementation Details:**
    - **File:** `src/components/board/EditCardDialog.tsx`.
    - **Logic:** Use a `useDebouncedCallback` hook (from a library like `use-debounce` or a custom implementation) inside a `useEffect` that tracks changes to the form fields.
    - **State:** Manage a local status: `const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')`.
    - **UI:** The debounced callback will set status to `'saving'`, call the `updateCard` store action, and then set status to `'saved'`. Render the status text in the `DialogFooter`.
    - **UX Refinement:** Once this is implemented, the main "Save" button in the form's footer can be removed, as it becomes redundant. The dialog's close button (`X`) will suffice for dismissal.

### Medium Priority Features 🎯

#### 1. Comments & Activity
- [ ] Add comment interface with timestamp and author
- [ ] Create comment section in card dialog
- [ ] Show comment count on card
- [ ] Display latest activity timestamp
- [ ] Add activity feed

#### 2. Time Tracking
- [ ] Add estimated/actual hours fields
- [ ] Create time input UI
- [ ] Display time on card
- [ ] Show variance indicators
- [ ] Add simple timer functionality

#### 3. Card Enhancements
- [ ] Add file attachments
- [ ] Implement card cover images
- [ ] Add card dependencies
- [ ] Create card templates
- [ ] Add custom fields

### Future Vision 🌟

#### 1. Collaboration & Sync
- [ ] Cloud sync option
- [ ] Real-time collaboration
- [ ] Team workspaces
- [ ] Activity feed
- [ ] Notifications

#### 2. Platform Expansion
- [ ] Mobile app (React Native)
- [ ] Desktop app (Electron/Tauri)
- [ ] API for third-party integrations
- [ ] Import/export from other services

#### 3. Advanced Features
- [ ] Automation rules
- [ ] AI-powered suggestions
- [ ] Calendar integration
- [ ] Gantt charts
- [ ] Time tracking analytics

## Technical Architecture

### Tech Stack
- **Frontend**: Next.js 15.3.3 (App Router), TypeScript 5
- **UI**: shadcn/ui, Radix UI, Tailwind CSS v4
- **State**: Zustand
- **Data**: IndexedDB with Dexie.js (local-first)
- **Drag & Drop**: @dnd-kit
- **Charts**: Recharts
- **Icons**: Lucide React

### Data Model
```typescript
// Core Entities
export interface Board {
  id: string;
  title: string;
  viewMode?: 'cards' | 'list';
  createdAt: Date;
  updatedAt: Date;
}

export interface Bucket {
  id: string;
  boardId: string;
  title: string;
  position: number;
  color?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Card {
  id: string;
  bucketId: string;
  title: string;
  description?: string;
  position: number;
  completed?: boolean;
  dueDate?: Date;
  priority?: 'low' | 'medium' | 'high';
  labels: Label[];
  checklist?: ChecklistItem[];
  coverImage?: string;
  coverColor?: string;
  attachments?: Attachment[];
  comments?: Comment[];
  members?: Member[];
  assigneeId?: string;
  assignees?: string[];
  createdAt: Date;
  updatedAt: Date;
}
```

### Project Structure
```
src/
├── app/                 # Next.js app router pages
│   ├── boards/         # Board pages
│   ├── dashboard/      # Dashboard page
│   └── settings/       # Settings page
├── components/         # React components
│   ├── ui/            # shadcn/ui components
│   ├── board/         # Board-specific components
│   ├── dashboard/     # Dashboard components
│   └── layout/        # Layout components
├── lib/               # Utilities and core logic
│   ├── store/         # Zustand stores
│   ├── db/            # Database schema and operations
│   └── utils/         # Helper functions
└── types/             # TypeScript type definitions
```

## Development Guidelines

### Code Standards
- TypeScript strict mode
- ESLint configuration
- Prettier formatting
- Commit conventions

### Testing Strategy
- Unit tests with Vitest
- Integration tests with React Testing Library
- E2E tests with Playwright
- 80% coverage target for business logic

### Performance Goals
- Page load < 3s
- Interaction < 100ms
- 60fps animations
- Offline-first functionality

### Design Principles
- Clean, professional aesthetic
- Consistent spacing (8px grid)
- Subtle animations (200-300ms)
- Accessibility first
- Keyboard navigation
- Mobile responsive

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Development Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Type checking
npm run typecheck

# Linting
npm run lint
```

### Key Commands
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run typecheck    # Run TypeScript compiler
``` 