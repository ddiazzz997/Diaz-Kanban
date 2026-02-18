
export type Priority = 'low' | 'medium' | 'high';
export type ColumnType = 'pending' | 'progress' | 'done';

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  progress: number;
  column: ColumnType;
  createdAt: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}
