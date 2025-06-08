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

export interface Label {
  id: string;
  boardId: string;  // Labels belong to boards for reusability
  name: string;
  color: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
}

export interface Comment {
  id: string;
  text: string;
  authorId: string;
  createdAt: Date;
}

export interface Member {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface DashboardWidget {
  id: string;
  type: 'stat' | 'chart' | 'list';
  title: string;
  size: 'small' | 'medium' | 'large';
  position: { x: number; y: number };
  config: {
    dataSource: 'tasks' | 'buckets' | 'labels';
    visualization?: 'number' | 'pie' | 'bar' | 'line' | 'list';
  };
}