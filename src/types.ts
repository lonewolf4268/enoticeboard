export type Category = 'Academic' | 'Administrative' | 'Campus Life' | 'Clubs' | 'Alert';

export interface Notice {
  id: string;
  title: string;
  content: string;
  author: string;
  department: string;
  date: string;
  category: Category;
  isUrgent: boolean;
  dueDate?: string;
}
