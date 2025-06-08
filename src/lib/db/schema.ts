import Dexie, { Table } from 'dexie';
import { Board, Bucket, Card, Label } from '@/types';

export class TaskManagerDB extends Dexie {
  boards!: Table<Board>;
  buckets!: Table<Bucket>;
  cards!: Table<Card>;
  labels!: Table<Label>;

  constructor() {
    super('TaskManagerDB');
    
    this.version(1).stores({
      boards: '++id, title, createdAt, updatedAt',
      buckets: '++id, boardId, title, position, createdAt, updatedAt',
      cards: '++id, bucketId, title, position, priority, createdAt, updatedAt',
      labels: '++id, boardId, name, color, createdAt, updatedAt'
    });
  }
}

export const db = new TaskManagerDB();