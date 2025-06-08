import { db } from '@/lib/db/schema';
import { Board, Bucket, Card, Label } from '@/types';

export async function createMockData() {
  try {
    // Check if we already have data
    const existingBoards = await db.boards.toArray();
    if (existingBoards.length > 0) {
      console.log('Mock data already exists');
      return;
    }

    // Create WFP Board
    const wfpBoard: Board = {
      id: 'wfp-board',
      title: 'WFP Project Tasks',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await db.boards.add(wfpBoard);

    // Create buckets
    const buckets: Bucket[] = [
      {
        id: 'todo-bucket',
        boardId: wfpBoard.id,
        title: 'To Do',
        position: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'in-progress-bucket',
        boardId: wfpBoard.id,
        title: 'In Progress',
        position: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'review-bucket',
        boardId: wfpBoard.id,
        title: 'Review',
        position: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'done-bucket',
        boardId: wfpBoard.id,
        title: 'Done',
        position: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    await db.buckets.bulkAdd(buckets);

    // Create labels
    const labels: Label[] = [
      { id: 'label-1', name: 'Frontend', color: '#3B82F6' },
      { id: 'label-2', name: 'Backend', color: '#10B981' },
      { id: 'label-3', name: 'Design', color: '#F59E0B' },
      { id: 'label-4', name: 'Bug', color: '#EF4444' },
      { id: 'label-5', name: 'Feature', color: '#8B5CF6' },
      { id: 'label-6', name: 'Documentation', color: '#6B7280' },
    ];
    await db.labels.bulkAdd(labels);

    // Create cards
    const cards: Card[] = [
      // To Do
      {
        id: 'card-1',
        bucketId: 'todo-bucket',
        title: 'Set up authentication system',
        description: 'Implement user login/logout with JWT tokens',
        position: 0,
        priority: 'high',
        labels: [labels[1], labels[4]],
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        completed: false,
        assignees: ['John Doe', 'Jane Smith'],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'card-2',
        bucketId: 'todo-bucket',
        title: 'Design dashboard mockups',
        description: 'Create wireframes and high-fidelity designs for the analytics dashboard',
        position: 1,
        priority: 'medium',
        labels: [labels[2]],
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'card-3',
        bucketId: 'todo-bucket',
        title: 'Write API documentation',
        description: 'Document all REST endpoints with examples',
        position: 2,
        priority: 'low',
        labels: [labels[5]],
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'card-4',
        bucketId: 'todo-bucket',
        title: 'Fix navigation menu bug',
        description: 'Menu items not highlighting correctly on mobile devices',
        position: 3,
        priority: 'high',
        labels: [labels[0], labels[3]],
        dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // Tomorrow
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // In Progress
      {
        id: 'card-5',
        bucketId: 'in-progress-bucket',
        title: 'Implement user profile page',
        description: 'Create profile view with edit functionality',
        position: 0,
        priority: 'medium',
        labels: [labels[0], labels[1]],
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        completed: false,
        assignees: ['Mike Johnson'],
        checklist: [
          { id: 'check-1', text: 'Create profile component', completed: true },
          { id: 'check-2', text: 'Add edit form', completed: true },
          { id: 'check-3', text: 'Connect to API', completed: false },
          { id: 'check-4', text: 'Add validation', completed: false },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'card-6',
        bucketId: 'in-progress-bucket',
        title: 'Optimize database queries',
        description: 'Improve performance of slow queries identified in monitoring',
        position: 1,
        priority: 'high',
        labels: [labels[1]],
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // Review
      {
        id: 'card-7',
        bucketId: 'review-bucket',
        title: 'Search functionality',
        description: 'Full-text search across all content',
        position: 0,
        priority: 'medium',
        labels: [labels[0], labels[1], labels[4]],
        completed: false,
        checklist: [
          { id: 'check-5', text: 'Implement search API', completed: true },
          { id: 'check-6', text: 'Create search UI', completed: true },
          { id: 'check-7', text: 'Add filters', completed: true },
          { id: 'check-8', text: 'Test edge cases', completed: false },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // Done (mix of completed and non-completed for testing)
      {
        id: 'card-8',
        bucketId: 'done-bucket',
        title: 'Set up CI/CD pipeline',
        description: 'GitHub Actions for automated testing and deployment',
        position: 0,
        priority: 'high',
        labels: [labels[1]],
        completed: true,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      },
      {
        id: 'card-9',
        bucketId: 'done-bucket',
        title: 'Create color palette',
        description: 'Define brand colors and usage guidelines',
        position: 1,
        priority: 'low',
        labels: [labels[2]],
        completed: true,
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
        updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      },
      {
        id: 'card-10',
        bucketId: 'done-bucket',
        title: 'Initial project setup',
        description: 'Repository, development environment, and base configuration',
        position: 2,
        priority: 'medium',
        labels: [labels[0], labels[1]],
        completed: true,
        createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000), // 21 days ago
        updatedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
      },
    ];
    await db.cards.bulkAdd(cards);

    console.log('Mock data created successfully!');
    return wfpBoard;
  } catch (error) {
    console.error('Error creating mock data:', error);
  }
}

// Function to clear all data
export async function clearAllData() {
  await db.cards.clear();
  await db.buckets.clear();
  await db.boards.clear();
  await db.labels.clear();
  console.log('All data cleared');
}