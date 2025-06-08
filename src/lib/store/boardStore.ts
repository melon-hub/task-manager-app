import { create } from 'zustand';
import { Board, Bucket, Card, Label } from '@/types';
import { db } from '@/lib/db/schema';

interface FilterState {
  searchQuery: string;
  selectedLabels: string[];
  selectedPriorities: ('low' | 'medium' | 'high')[];
  selectedBuckets: string[];
  selectedAssignees: string[];
  showCompleted: boolean;
  dueDateFilter: 'all' | 'overdue' | 'today' | 'week' | 'has-date';
}

interface BoardState {
  currentBoard: Board | null;
  buckets: Bucket[];
  cards: Card[];
  labels: Label[];
  loading: boolean;
  filters: FilterState;
  hoveredBucketId: string | null;
  
  // Actions
  loadBoard: (boardId: string) => Promise<void>;
  setHoveredBucketId: (bucketId: string | null) => void;
  createBoard: (title: string) => Promise<Board>;
  updateBoard: (boardId: string, updates: Partial<Board>) => Promise<void>;
  createBucket: (title: string) => Promise<void>;
  createCard: (bucketId: string, title: string) => Promise<string>;
  moveBucket: (bucketId: string, newPosition: number) => Promise<void>;
  moveCard: (cardId: string, toBucketId: string, position: number) => Promise<void>;
  updateCard: (cardId: string, updates: Partial<Card>) => Promise<void>;
  deleteCard: (cardId: string) => Promise<void>;
  deleteBucket: (bucketId: string) => Promise<void>;
  generateMockData: () => Promise<void>;
  
  // Label actions
  createLabel: (name: string, color: string) => Promise<Label>;
  updateLabel: (labelId: string, updates: Partial<Label>) => Promise<void>;
  deleteLabel: (labelId: string) => Promise<void>;
  
  // Filter actions
  updateFilters: (filters: Partial<FilterState>) => void;
  resetFilters: () => void;
  getFilteredCards: () => Card[];
}

const defaultFilters: FilterState = {
  searchQuery: '',
  selectedLabels: [],
  selectedPriorities: [],
  selectedBuckets: [],
  selectedAssignees: [],
  showCompleted: true,
  dueDateFilter: 'all',
};

export const useBoardStore = create<BoardState>((set, get) => ({
  currentBoard: null,
  buckets: [],
  cards: [],
  labels: [],
  loading: false,
  filters: defaultFilters,
  hoveredBucketId: null,

  setHoveredBucketId: (bucketId: string | null) => {
    set({ hoveredBucketId: bucketId });
  },

  loadBoard: async (boardId: string) => {
    set({ loading: true });
    try {
      const board = await db.boards.get(boardId);
      if (!board) throw new Error('Board not found');
      
      const buckets = await db.buckets
        .where('boardId')
        .equals(boardId)
        .sortBy('position');
      
      const labels = await db.labels
        .where('boardId')
        .equals(boardId)
        .toArray();
      
      const bucketIds = buckets.map(b => b.id);
      const cards = await db.cards
        .where('bucketId')
        .anyOf(bucketIds)
        .toArray();
      
      // Ensure all cards have required array properties
      const sanitizedCards = cards.map(card => ({
        ...card,
        labels: card.labels || [],
        assignees: card.assignees || [],
        checklist: card.checklist || []
      }));
      
      set({ currentBoard: board, buckets, cards: sanitizedCards, labels, loading: false });
    } catch (error) {
      console.error('Failed to load board:', error);
      set({ loading: false });
    }
  },

  createBoard: async (title: string) => {
    const board: Board = {
      id: crypto.randomUUID(),
      title,
      viewMode: 'cards',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    await db.boards.add(board);
    return board;
  },

  updateBoard: async (boardId: string, updates: Partial<Board>) => {
    const { currentBoard } = get();
    if (!currentBoard || currentBoard.id !== boardId) return;
    
    await db.boards.update(boardId, {
      ...updates,
      updatedAt: new Date(),
    });
    
    set({ currentBoard: { ...currentBoard, ...updates, updatedAt: new Date() } });
  },

  createBucket: async (title: string) => {
    const { currentBoard, buckets } = get();
    if (!currentBoard) return;
    
    const maxPosition = Math.max(...buckets.map(b => b.position), -1);
    const bucket: Bucket = {
      id: crypto.randomUUID(),
      boardId: currentBoard.id,
      title,
      position: maxPosition + 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    await db.buckets.add(bucket);
    set({ buckets: [...buckets, bucket] });
  },

  createCard: async (bucketId: string, title: string) => {
    const { cards } = get();
    const bucketCards = cards.filter(c => c.bucketId === bucketId);
    const maxPosition = Math.max(...bucketCards.map(c => c.position), -1);
    
    const card: Card = {
      id: crypto.randomUUID(),
      bucketId,
      title,
      position: maxPosition + 1,
      labels: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    await db.cards.add(card);
    set({ cards: [...cards, card] });
    return card.id;
  },

  moveBucket: async (bucketId: string, newPosition: number) => {
    const { buckets } = get();
    const bucket = buckets.find(b => b.id === bucketId);
    if (!bucket) return;
    
    const updatedBuckets = [...buckets];
    const oldPosition = bucket.position;
    
    // Update positions
    updatedBuckets.forEach(b => {
      if (b.id === bucketId) {
        b.position = newPosition;
      } else if (oldPosition < newPosition && b.position > oldPosition && b.position <= newPosition) {
        b.position--;
      } else if (oldPosition > newPosition && b.position < oldPosition && b.position >= newPosition) {
        b.position++;
      }
    });
    
    // Update in DB
    await Promise.all(
      updatedBuckets.map(b => db.buckets.update(b.id, { position: b.position }))
    );
    
    set({ buckets: updatedBuckets.sort((a, b) => a.position - b.position) });
  },

  moveCard: async (cardId: string, toBucketId: string, position: number) => {
    const { cards } = get();
    const card = cards.find(c => c.id === cardId);
    if (!card) return;
    
    // Get cards in the target bucket
    const targetBucketCards = cards
      .filter(c => c.bucketId === toBucketId && c.id !== cardId)
      .sort((a, b) => a.position - b.position);
    
    // Calculate new position if position is 0 (default)
    const newPosition = position === 0 
      ? targetBucketCards.length > 0 
        ? targetBucketCards[targetBucketCards.length - 1].position + 1 
        : 0
      : position;
    
    // Ensure labels is always an array
    const updatedCard = { 
      ...card, 
      bucketId: toBucketId, 
      position: newPosition, 
      updatedAt: new Date(),
      labels: card.labels || []
    };
    
    // Optimistic update - update UI immediately
    const updatedCards = cards.map(c => c.id === cardId ? updatedCard : c);
    set({ cards: updatedCards });
    
    // Then persist to database - only update the changed fields
    await db.cards.update(cardId, {
      bucketId: toBucketId,
      position: newPosition,
      updatedAt: new Date()
    });
  },

  updateCard: async (cardId: string, updates: Partial<Card>) => {
    const { cards } = get();
    const currentCard = cards.find(c => c.id === cardId);
    if (!currentCard) return;
    
    // Ensure arrays have defaults
    const safeUpdates = {
      ...updates,
      labels: updates.labels !== undefined ? updates.labels : currentCard.labels || [],
      assignees: updates.assignees !== undefined ? updates.assignees : currentCard.assignees || [],
      checklist: updates.checklist !== undefined ? updates.checklist : currentCard.checklist || [],
    };
    
    await db.cards.update(cardId, { ...safeUpdates, updatedAt: new Date() });
    
    const updatedCards = cards.map(c => 
      c.id === cardId ? { ...c, ...safeUpdates, updatedAt: new Date() } : c
    );
    set({ cards: updatedCards });
  },

  deleteCard: async (cardId: string) => {
    const { cards } = get();
    await db.cards.delete(cardId);
    set({ cards: cards.filter(c => c.id !== cardId) });
  },

  deleteBucket: async (bucketId: string) => {
    const { buckets, cards } = get();
    
    // Delete all cards in the bucket
    const bucketCards = cards.filter(c => c.bucketId === bucketId);
    await Promise.all(bucketCards.map(c => db.cards.delete(c.id)));
    
    // Delete the bucket
    await db.buckets.delete(bucketId);
    
    set({
      buckets: buckets.filter(b => b.id !== bucketId),
      cards: cards.filter(c => c.bucketId !== bucketId),
    });
  },

  generateMockData: async () => {
    const { currentBoard, createBucket, createCard, buckets, createLabel, labels } = get();
    if (!currentBoard) return;
    
    // Create some default labels if none exist
    if (labels.length === 0) {
      await createLabel('Bug', '#ef4444');
      await createLabel('Feature', '#3b82f6');
      await createLabel('Enhancement', '#10b981');
      await createLabel('Documentation', '#f59e0b');
      await createLabel('Testing', '#8b5cf6');
      await createLabel('Urgent', '#dc2626');
      await createLabel('Help Wanted', '#7c3aed');
    }

    // Different data sets for variety
    const dataSets = [
      {
        buckets: ['Backlog', 'Sprint', 'In Progress', 'Testing', 'Done'],
        cards: [
          { bucket: 0, title: 'Refactor user service', priority: 'medium' as const, description: 'Clean up legacy code' },
          { bucket: 0, title: 'Add dark mode support', priority: 'low' as const },
          { bucket: 1, title: 'Fix payment gateway bug', priority: 'high' as const, description: 'Critical issue with Stripe integration' },
          { bucket: 1, title: 'Update email templates', priority: 'medium' as const },
          { bucket: 2, title: 'Implement search functionality', priority: 'high' as const },
          { bucket: 3, title: 'Test mobile responsiveness', priority: 'medium' as const },
          { bucket: 4, title: 'Release v2.0', priority: 'high' as const, description: 'Major release completed' },
        ]
      },
      {
        buckets: ['Ideas', 'Research', 'Design', 'Development', 'Launch'],
        cards: [
          { bucket: 0, title: 'AI-powered recommendations', priority: 'low' as const },
          { bucket: 0, title: 'Voice command integration', priority: 'medium' as const },
          { bucket: 1, title: 'Competitor analysis', priority: 'high' as const, description: 'Study top 5 competitors' },
          { bucket: 2, title: 'Create mockups for new feature', priority: 'medium' as const },
          { bucket: 3, title: 'Build MVP', priority: 'high' as const },
          { bucket: 4, title: 'Marketing campaign', priority: 'high' as const },
        ]
      },
      {
        buckets: ['Emergency', 'This Week', 'Next Week', 'This Month', 'Someday'],
        cards: [
          { bucket: 0, title: 'Server outage investigation', priority: 'high' as const, description: 'Production down!' },
          { bucket: 1, title: 'Team standup prep', priority: 'medium' as const },
          { bucket: 1, title: 'Client presentation', priority: 'high' as const },
          { bucket: 2, title: 'Performance review', priority: 'medium' as const },
          { bucket: 3, title: 'Quarterly planning', priority: 'medium' as const },
          { bucket: 4, title: 'Learn Rust', priority: 'low' as const },
        ]
      }
    ];

    // Pick a random dataset or cycle through them
    const existingBucketCount = buckets.length;
    const dataSetIndex = existingBucketCount % dataSets.length;
    const selectedDataSet = dataSets[dataSetIndex];

    // Create buckets if they don't exist
    const bucketIds: string[] = [];
    for (const title of selectedDataSet.buckets) {
      const existingBucket = buckets.find(b => b.title === title);
      if (existingBucket) {
        bucketIds.push(existingBucket.id);
      } else {
        await createBucket(title);
        const { buckets: updatedBuckets } = get();
        const bucket = updatedBuckets.find(b => b.title === title);
        if (bucket) bucketIds.push(bucket.id);
      }
    }

    // Create varied cards
    for (const cardData of selectedDataSet.cards) {
      if (bucketIds[cardData.bucket]) {
        const cardId = await createCard(bucketIds[cardData.bucket], cardData.title);
        
        const updates: Partial<Card> = {};
        if (cardData.priority) updates.priority = cardData.priority;
        if (cardData.description) updates.description = cardData.description;
        
        // Randomly add checklists to some cards
        if (Math.random() > 0.5) {
          const checklistTemplates = [
            [
              { text: 'Research requirements', completed: true },
              { text: 'Create design document', completed: true },
              { text: 'Get approval', completed: false },
              { text: 'Start implementation', completed: false },
            ],
            [
              { text: 'Write unit tests', completed: false },
              { text: 'Code implementation', completed: false },
              { text: 'Peer review', completed: false },
            ],
            [
              { text: 'Initial draft', completed: true },
              { text: 'Review and feedback', completed: false },
              { text: 'Final version', completed: false },
              { text: 'Publish', completed: false },
            ],
            [
              { text: 'Define scope', completed: true },
              { text: 'Allocate resources', completed: true },
              { text: 'Execute', completed: false },
              { text: 'Monitor progress', completed: false },
              { text: 'Deliver', completed: false },
            ]
          ];
          
          const template = checklistTemplates[Math.floor(Math.random() * checklistTemplates.length)];
          updates.checklist = template.map(item => ({
            id: crypto.randomUUID(),
            text: item.text,
            completed: item.completed
          }));
        }
        
        // Randomly add due dates to some cards
        if (Math.random() > 0.6) {
          const daysFromNow = Math.floor(Math.random() * 30) - 5; // -5 to +25 days
          const dueDate = new Date();
          dueDate.setDate(dueDate.getDate() + daysFromNow);
          updates.dueDate = dueDate;
        }
        
        // Randomly add labels from existing board labels
        if (Math.random() > 0.7) {
          const { labels } = get();
          if (labels.length > 0) {
            updates.labels = [labels[Math.floor(Math.random() * labels.length)]];
          }
        }
        
        if (Object.keys(updates).length > 0) {
          const { updateCard } = get();
          await updateCard(cardId, updates);
        }
      }
    }
  },

  createLabel: async (name: string, color: string) => {
    const { currentBoard, labels } = get();
    if (!currentBoard) throw new Error('No board selected');
    
    const label: Label = {
      id: crypto.randomUUID(),
      boardId: currentBoard.id,
      name,
      color,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    await db.labels.add(label);
    set({ labels: [...labels, label] });
    return label;
  },

  updateLabel: async (labelId: string, updates: Partial<Label>) => {
    const { labels } = get();
    await db.labels.update(labelId, { ...updates, updatedAt: new Date() });
    
    const updatedLabels = labels.map(l => 
      l.id === labelId ? { ...l, ...updates, updatedAt: new Date() } : l
    );
    set({ labels: updatedLabels });
  },

  deleteLabel: async (labelId: string) => {
    const { labels, cards } = get();
    
    // Remove label from all cards
    const affectedCards = cards.filter(c => c.labels.some(l => l.id === labelId));
    for (const card of affectedCards) {
      const updatedLabels = card.labels.filter(l => l.id !== labelId);
      await db.cards.update(card.id, { labels: updatedLabels, updatedAt: new Date() });
    }
    
    // Delete the label
    await db.labels.delete(labelId);
    
    set({
      labels: labels.filter(l => l.id !== labelId),
      cards: cards.map(c => ({
        ...c,
        labels: c.labels.filter(l => l.id !== labelId)
      }))
    });
  },

  updateFilters: (newFilters: Partial<FilterState>) => {
    const { filters } = get();
    set({ filters: { ...filters, ...newFilters } });
  },

  resetFilters: () => {
    set({ filters: defaultFilters });
  },

  getFilteredCards: () => {
    const { cards, filters } = get();
    
    return cards.filter(card => {
      // Search query filter
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const matchesTitle = card.title.toLowerCase().includes(query);
        const matchesDescription = card.description?.toLowerCase().includes(query) || false;
        const matchesLabels = card.labels?.some(label => 
          label.name.toLowerCase().includes(query)
        ) || false;
        const matchesChecklist = card.checklist?.some(item => 
          item.text.toLowerCase().includes(query)
        ) || false;
        
        if (!matchesTitle && !matchesDescription && !matchesLabels && !matchesChecklist) {
          return false;
        }
      }
      
      // Label filter
      if (filters.selectedLabels.length > 0) {
        const hasSelectedLabel = card.labels?.some(label => 
          filters.selectedLabels.includes(label.id)
        ) || false;
        if (!hasSelectedLabel) return false;
      }
      
      // Priority filter
      if (filters.selectedPriorities.length > 0) {
        if (!card.priority || !filters.selectedPriorities.includes(card.priority)) {
          return false;
        }
      }
      
      // Bucket filter
      if (filters.selectedBuckets.length > 0) {
        if (!filters.selectedBuckets.includes(card.bucketId)) {
          return false;
        }
      }
      
      // Assignee filter
      if (filters.selectedAssignees.length > 0) {
        const hasSelectedAssignee = card.assignees?.some(assignee => 
          filters.selectedAssignees.includes(assignee)
        ) || false;
        if (!hasSelectedAssignee) return false;
      }
      
      // Completed filter
      if (!filters.showCompleted && card.completed) {
        return false;
      }
      
      // Due date filter
      if (filters.dueDateFilter !== 'all') {
        if (!card.dueDate) {
          return filters.dueDateFilter === 'has-date' ? false : true;
        }
        
        const dueDate = new Date(card.dueDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        switch (filters.dueDateFilter) {
          case 'overdue':
            if (dueDate >= today || card.completed) return false;
            break;
          case 'today':
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            if (dueDate < today || dueDate >= tomorrow) return false;
            break;
          case 'week':
            const nextWeek = new Date(today);
            nextWeek.setDate(nextWeek.getDate() + 7);
            if (dueDate < today || dueDate >= nextWeek) return false;
            break;
          case 'has-date':
            // Already handled above
            break;
        }
      }
      
      return true;
    });
  },
}));