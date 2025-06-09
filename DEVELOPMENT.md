# Task Manager App - Development Guide

## Project Status

### Current Implementation Status ✅

#### Core Features
- [x] Multiple boards with customizable lists/buckets
- [x] Drag-and-drop card management
- [x] Rich card properties (title, description, due dates, priority)
- [x] Custom labels with color coding and improved management
- [x] Checklists with progress tracking
- [x] Smart due date display with color coding
- [x] Completion status with visual indicators
- [x] Inline editing for quick modifications
- [x] Context menus for quick actions
- [x] Analytics dashboard with charts and metrics
- [x] Theme system (light/dark mode)
- [x] Responsive design for all devices
- [x] Adaptive card height system
- [x] Inline metadata display for cleaner cards

#### Partially Implemented Features 🔄
- [x] Assignee data model (basic implementation)
- [x] Label system (improved with LabelPopoverCompact)
- [x] Search functionality (basic implementation)

### Recently Completed Improvements ✅

#### Code Quality & Architecture Improvements
- **[x] Error Boundaries:** Added React error boundaries to gracefully handle component errors
  - `ErrorBoundary.tsx` component with user-friendly error UI
  - Wrapped critical components like BoardView
  - Includes retry functionality
  
- **[x] Component Decomposition:** Refactored large components into smaller, focused pieces
  - Split EditCardDialog (450 lines) into:
    - `ChecklistManager.tsx` - Manages checklist items with progress tracking
    - `AssigneeManager.tsx` - Handles assignee add/remove functionality  
    - `LabelManager.tsx` - Label management with drag-and-drop reordering
  - Improved maintainability and testability
  - Better separation of concerns

#### UI/UX Improvements
- **[x] Adaptive Card Height System:** Cards now dynamically adjust their height based on content
  - Compact mode for simple cards (title only or single metadata)
  - Reduced padding and border width for minimal cards
  - Inline metadata display when only one type exists
  - Smart layout decisions based on content density
  
- **[x] Improved Label Management:** New LabelPopoverCompact component
  - Unified interface for search, create, edit, and delete labels
  - In-popover editing with color picker
  - Search functionality to find labels quickly
  - Streamlined workflow reduces clicks
  
- **[x] Inline Metadata Display:** Single metadata items now display inline
  - Due dates appear next to title when it's the only metadata
  - Checklist progress shows inline for better scanning
  - Assignee avatars display inline when no other metadata exists
  - Cleaner, more compact card appearance

### High Priority Improvements 🔥

#### 1. Dashboard Refactoring for Intuitive Use
- **Goal:** Transform the dashboard from a single, data-dense view into a focused, two-tab experience: an actionable to-do list ("My Tasks") and a powerful data overview ("Analytics & Insights").
- **Core Problem:** The current dashboard serves two conflicting purposes (personal action vs. project analysis), leading to clutter and a lack of clear direction for the user.
- **Solution:** Use a tabbed interface to separate these two contexts, with "My Tasks" as the default view.

- **[ ] Step 1: Create the Tabbed Layout**
  - **File:** `app/dashboard/page.tsx`
  - **Library:** Use the `Tabs` component from `shadcn/ui`.
  - **Implementation:**
    - Create a `<Tabs defaultValue="my-tasks">` component at the top of the page.
    - Define two `<TabsTrigger>` components: one for "My Tasks" (`value="my-tasks"`) and one for "Analytics & Insights" (`value="analytics"`).
    - The existing filter bar (`Board`, `Date Range`, etc.) should be moved *inside* the "Analytics & Insights" tab content, as it's not relevant to the "My Tasks" view.

- **[ ] Step 2: Build the "My Tasks" View**
  - **Goal:** Provide a clean, scannable list of what the user needs to do now.
  - **Implementation:**
    1.  **Create New Component:** `src/components/dashboard/MyTasksView.tsx`.
    2.  **Data Fetching:** In this component, fetch all cards and filter them into three groups (assuming a "current user" context, which can be mocked for now):
        -   `Overdue & Due Today`: `!card.completed && card.dueDate <= today`
        -   `Upcoming (Next 7 Days)`: `!card.completed && card.dueDate > today && card.dueDate <= nextWeek`
        -   `No Due Date`: `!card.completed && !card.dueDate`
    3.  **Create List Item Component:** `src/components/dashboard/TaskListItem.tsx`. This component will display the card title, priority, its board/list name (e.g., "Project Phoenix / In Progress"), and the formatted due date. It should also have a `Checkbox` for quick completion.
    4.  **Layout:** Render the three lists, each with a clear heading. If a list is empty, show a congratulatory message (e.g., "🎉 No overdue tasks!").

- **[ ] Step 3: Refactor the "Analytics & Insights" View**
  - **Goal:** Move all existing analytics logic into its own self-contained component.
  - **Implementation:**
    1.  **Create New Component:** `src/components/dashboard/AnalyticsView.tsx`.
    2.  **Move Logic:** Cut almost all of the existing state management, filtering logic, and chart rendering from `app/dashboard/page.tsx` and paste it into `AnalyticsView.tsx`.
    3.  **Cleanup:** The `app/dashboard/page.tsx` file will become much simpler. It will primarily manage the tab state and render either `<MyTasksView />` or `<AnalyticsView />` inside the appropriate `<TabsContent>` block.

- **[ ] Step 4: Final Integration**
  - **File:** `app/dashboard/page.tsx`
  - **Final Structure:**
    ```tsx
    <Tabs defaultValue="my-tasks">
      <TabsList>
        <TabsTrigger value="my-tasks">My Tasks</TabsTrigger>
        <TabsTrigger value="analytics">Analytics & Insights</TabsTrigger>
      </TabsList>
      <TabsContent value="my-tasks">
        <MyTasksView />
      </TabsContent>
      <TabsContent value="analytics">
        <AnalyticsView />
      </TabsContent>
    </Tabs>
    ```

#### 2. Search & Filtering
- [ ] Implement full-text search across cards
- [ ] Add advanced filtering system
- [ ] Create filter presets
- [ ] Add keyboard shortcuts for search
- [ ] Implement quick filters

#### 3. Additional Label System Improvements
- [x] Better label management with LabelPopoverCompact
- [x] Search functionality in label picker
- [x] In-popover label editing and deletion
- [ ] Keyboard navigation in label picker
- [ ] Drag-and-drop label reordering
- [ ] Label groups/categories
- [ ] Quick label toggle from card view
- [ ] Bulk apply/remove labels
- [ ] Label usage statistics
- [ ] Import/export label sets

#### 4. Assignee Management
- [ ] Create people/team management in settings
- [ ] Enhance assignee selection UI
- [ ] Support multiple assignees with overlapping avatars
- [ ] Add assignee filtering
- [ ] Implement assignee workload view

### UX Polish & Feel: Implementation Plan

This section details a backlog of high-impact features focused on improving the application's "feel" and intuitive nature, inspired by best-in-class apps like Trello and Microsoft Planner.

#### Phase 1: Fluid Card & List Interactions (High Impact) ✅ COMPLETED
This phase focuses on making the core interactions of creating and manipulating cards feel seamless and satisfying.

- **[x] Hover-to-reveal 'Add Card' button:**
  - **Description:** Instead of a persistent "Add Card" button at the bottom of a list, a subtle `+ Add a card` button should appear only when a user hovers in the space below the last card in a bucket. This is less intrusive and more contextual.
  - **Implementation Details:**
    - **File:** `src/components/board/Bucket.tsx`.
    - **Logic:** The `div` wrapping the bucket's content should become a `group`. The `Button` (or a new `div` that looks like a button) will have `opacity-0 group-hover:opacity-100 transition-opacity` classes.
    - **Regression Guard:** This button will replace the logic that currently opens the `CreateCardDialog`, as this new pattern is for in-place creation.

- **[x] "Quick Add" in-place card creation:**
  - **Description:** Clicking the `+ Add a card` button should transform it directly into a `textarea` for the card title and a "Save Card" button, avoiding a disruptive dialog. Pressing `Enter` saves the card and adds another "quick add" input below it for rapid, multi-card creation. Pressing `Escape` cancels the action.
  - **Implementation Details:**
    - **File:** `src/components/board/Bucket.tsx`.
    - **State:** Use local component state: `const [isAddingCard, setIsAddingCard] = useState(false)`.
    - **Logic:** When `isAddingCard` is true, render a `<form>` containing a `Textarea` and a `Button`. The `Textarea` should use `onKeyDown` to handle `Enter` (to submit the form) and `Escape` (to set `isAddingCard(false)`). The form's `onSubmit` handler will call the `createCard` store action.
    - **Data:** The `createCard` function must be called with `{ title, bucketId }`. The `bucketId` is available from the `Bucket.tsx` component's props.

- **[x] Subtle hover animations on cards:**
  - **Description:** When a user hovers over a card, it should gently "lift" with a subtle `box-shadow` increase and a slight `transform: translateY(-2px)`. This makes the cards feel more tangible and interactive.
  - **Implementation Details:**
    - **File:** `src/components/board/CardItem.tsx`.
    - **Logic:** Add `transition-all duration-200 ease-in-out` and `hover:shadow-lg hover:-translate-y-0.5` classes to the main wrapper `div` of the card.
    - **Regression Guard:** Ensure these classes do not interfere with the styles applied by `@dnd-kit` when `isDragging` is true. The `isDragging` styles should take precedence.

- **[x] Visual drag-and-drop placeholder:**
  - **Description:** When dragging a card, the original space it occupied should show a dashed, semi-transparent placeholder. This gives the user a clear indicator of where the card came from and makes the board feel less jarring during moves.
  - **Implementation Details:**
    - **File:** `src/components/board/CardItem.tsx`.
    - **Library:** `@dnd-kit`.
    - **Logic:** The `useSortable` hook provides an `isDragging` boolean. Use this to conditionally apply classes to the card's wrapper `div`: `cn({ 'opacity-50 border-dashed bg-muted': isDragging })}`.
    - **Drag Overlay:** To perfect the effect, the `DragOverlay` component from `@dnd-kit` should be used in `BoardView.tsx` to render a visually identical, non-translucent copy of the `CardItem` that follows the cursor during the drag operation.

#### Phase 2: Keyboard Superpowers (High Impact for Power Users) ✅ COMPLETED
This phase is dedicated to making the app incredibly fast for keyboard-centric users.

- **[x] Contextual keyboard shortcuts on cards:**
  - **Description:** When hovering over a card, press `e` to open the edit dialog.
  - **Implementation Details:**
    - **File:** `src/components/board/CardItem.tsx`.
    - **Logic:** Uses a hover-based approach with `isHovered` state that triggers keyboard event listener.
    - **Regression Guard:** The event listener checks if the user is typing in an input/textarea to prevent shortcuts from firing incorrectly.

- **[x] Global "Quick Add" shortcut:**
  - **Description:** Pressing `n` anywhere in the app opens the `CreateCardDialog`, with context-aware list selection based on the currently hovered bucket.
  - **Implementation Details:**
    - **File:** `src/components/layout/GlobalShortcuts.tsx`.
    - **Logic:** The listener captures the `hoveredBucketId` at the moment `n` is pressed and passes it to CreateCardDialog.
    - **Context:** The `useBoardStore` tracks `hoveredBucketId` which is updated on bucket hover.
    - **Regression Guard:** The global listener checks `e.target` to avoid firing while in an input field.

- **[x] Command Palette (`Cmd/Ctrl + K`):**
  - **Description:** A power-user feature to quickly search for and navigate to any board, card, or setting.
  - **Implementation Details:**
    - **Library:** `cmdk` library is used.
    - **Component:** `CommandPalette.tsx` component in `src/components/layout/`.
    - **Data:** Populated with boards from `useBoardStore`, allowing quick navigation.

#### Phase 3: Smarter UI & Feedback (Medium Impact)
This phase focuses on small but crucial details that build user trust and make the app feel "smart".

- **[x] Actionable "Undo" on delete:**
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

## Security Architecture & Implementation Plan

This plan outlines a phased approach to security, designed to evolve the application from its current local-first state to a secure, multi-user, cloud-enabled platform.

### Phase 1: Securing the Local-First Application (Current State)
This phase focuses on hardening the existing client-side application.

- **[ ] Input Sanitization:**
  - **Goal:** Prevent Cross-Site Scripting (XSS) where malicious code could be injected into card titles, descriptions, etc.
  - **Implementation:** Before rendering any user-generated content (like card descriptions) that might contain HTML, use a library like `DOMPurify` to sanitize it. This strips out dangerous tags and attributes.
  - **Action:** `npm install dompurify && npm install -D @types/dompurify`. In components that render rich text, wrap the content: `dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(card.description) }}`.

- **[ ] Dependency Vulnerability Scanning:**
  - **Goal:** Continuously check for known vulnerabilities in third-party `npm` packages.
  - **Implementation:** Regularly run `npm audit`. Integrate this into the CI/CD pipeline so it runs automatically on every push.
  - **Action:** Add a step to the future CI/CD workflow (e.g., in a `.github/workflows/ci.yml` file) that executes `npm audit --audit-level=high`.

- **[ ] Content Security Policy (CSP):**
  - **Goal:** Define a whitelist of approved sources for content (scripts, styles, images), mitigating the risk of injection attacks.
  - **Implementation:** Use Next.js's built-in support for CSP headers. In `next.config.ts`, add a `headers` configuration to define a strict policy, allowing content only from your own domain and trusted third parties.

### Phase 2: Authentication - Adding User Sign-In
This phase introduces user accounts, a prerequisite for any cloud features.

- **[ ] Authentication Strategy: OAuth & Passwordless**
  - **Goal:** Provide secure, user-friendly sign-in without managing passwords directly.
  - **Recommendation:** Use **NextAuth.js** (`next-auth`). It is the de-facto standard for Next.js, is highly secure, and provides simple integration for many OAuth providers (Google, GitHub, etc.).

- **[ ] Implementation Plan for Google Sign-In:**
  1.  **Install:** `npm install next-auth`.
  2.  **Setup Google OAuth Credentials:** Go to the Google Cloud Console, create a new project, and get an OAuth 2.0 Client ID and Client Secret. Add these to your environment variables (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`).
  3.  **Create API Route:** Create `src/app/api/auth/[...nextauth]/route.ts`. Configure it with the Google provider using the environment variables.
  4.  **Wrap App in `SessionProvider`:** In `app/layout.tsx`, wrap the main component with the `<SessionProvider>`.
  5.  **Create Sign-In/Out UI:** Add login and logout buttons that use the `signIn()` and `signOut()` methods from `next-auth/react`.
  6.  **Extend Data Model:** Add a `User` table to the database schema (`id`, `name`, `email`, `image`) to store user profiles.

### Phase 3: Authorization - Permissions & Sharing
Once users exist, we need to control what they can see and do.

- **[ ] Data Model for Permissions:**
  - **Goal:** Define relationships between users, boards, and their roles.
  - **Implementation:** Create a new "join table" in the database schema called `BoardMember`.
  - **Schema:** `BoardMember { id: string, boardId: string, userId: string, role: 'owner' | 'editor' | 'viewer' }`. This table links a user to a board with a specific role.

- **[ ] API-Level Access Control:**
  - **Goal:** Ensure every action is authorized on the (future) backend.
  - **Implementation:** Before any database operation (e.g., `updateCard`), create helper functions that check the user's role from the `BoardMember` table. For example: `const userRole = await getUserRole(userId, boardId); if (userRole !== 'owner' && userRole !== 'editor') { throw new Error("Unauthorized"); }`.

- **[ ] Board Sharing UI:**
  - **Goal:** Allow board owners to invite other users.
  - **Implementation:** Create a "Share" button on the board that opens a dialog. The dialog will allow the owner to enter another user's email, select a role, and add them to the `BoardMember` table for that board.

### Phase 4: Securing the Cloud Infrastructure (Future)
When data moves from local-only to a cloud database.

- **[ ] Secure Secrets Management:**
  - **Goal:** Never commit sensitive credentials (API keys, database URLs, OAuth secrets) to Git.
  - **Implementation:** Use the environment variable management provided by your hosting platform (e.g., Vercel, Netlify). Store all secrets there. For local development, use a `.env.local` file, which is already in your `.gitignore`.

- **[ ] Secure Database Connection:**
  - **Goal:** Ensure data is encrypted both in transit and at rest.
  - **Implementation:** Use a managed database provider (e.g., Vercel Postgres, Supabase) that enforces SSL/TLS connections by default and encrypts data at rest.

- **[ ] API Hardening:**
  - **Goal:** Protect public-facing API endpoints from abuse.
  - **Implementation:**
    - **JWT Validation:** On every API request, validate the JWT provided by NextAuth.js to authenticate the user.
    - **Rate Limiting:** Use a library like `express-rate-limit` or Vercel's built-in helpers to prevent brute-force attacks.
    - **CORS:** Configure Cross-Origin Resource Sharing in `next.config.ts` to only allow requests from your application's domain.

## Recent Architectural Improvements

### Adaptive Card Height System
The card component now intelligently adjusts its visual density based on content:
- **Compact Mode**: Triggered when card has minimal content (title only or single metadata)
- **Dynamic Padding**: Reduces from `p-2.5` to `p-1.5` for compact cards
- **Border Width**: Reduces from `border-l-4` to `border-l-2` for compact cards
- **Inline Metadata**: Single metadata items display inline next to title

### LabelPopoverCompact Component
A unified label management interface that replaces the previous multi-component approach:
- **Single Popover**: Search, create, edit, and delete all in one place
- **Color Picker**: Integrated 12-color palette for label customization
- **Search Filter**: Quick label search functionality
- **Edit Mode**: Click edit icon to modify existing labels inline
- **Reduced Clicks**: Streamlined workflow improves efficiency

### Inline Metadata Display
Smart layout decisions for cleaner card appearance:
- **Single Due Date**: Shows inline with color-coded background
- **Single Checklist**: Shows progress dots or bar inline
- **Single Assignee Set**: Shows avatars inline (up to 3 visible)
- **Multiple Metadata**: Falls back to traditional stacked layout

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
│   │   ├── edit-card/ # EditCardDialog sub-components
│   │   │   ├── ChecklistManager.tsx
│   │   │   ├── AssigneeManager.tsx
│   │   │   └── LabelManager.tsx
│   │   ├── BoardView.tsx
│   │   ├── CardItem.tsx
│   │   ├── EditCardDialog.tsx
│   │   └── ...
│   ├── dashboard/     # Dashboard components
│   ├── layout/        # Layout components
│   │   ├── CommandPalette.tsx
│   │   ├── GlobalShortcuts.tsx
│   │   └── Sidebar.tsx
│   └── ErrorBoundary.tsx
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