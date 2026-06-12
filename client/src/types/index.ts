export interface Book {
  id: number;
  title: string;
  filename: string;
  file_path: string;
  total_chunks: number;
  created_at: string;
}

export interface Conversation {
  id: number;
  book_id: number;
  teacher_id: number | null;
  title: string | null;
  created_at: string;
}

export interface Message {
  id: number;
  conversation_id: number;
  role: 'user' | 'teacher';
  content: string;
  audio_path: string | null;
  created_at: string;
}

export interface Teacher {
  id: number;
  name: string;
  avatar: string | null;
  style: 'socratic' | 'scholar' | 'humor' | 'case';
  tone: 'gentle' | 'professional' | 'lively';
  max_length: number;
  custom_prompt: string | null;
  is_default: number;
  created_at: string;
}

export interface Concept {
  id: number;
  book_id: number;
  name: string;
  description: string | null;
  chapter: string | null;
}

export interface LearningProgress {
  id: number;
  book_id: number;
  concept_id: number;
  status: 'not_started' | 'learning' | 'familiar' | 'mastered';
  score: number;
  last_reviewed_at: string | null;
  next_review_at: string | null;
  review_count: number;
}

export interface DashboardData {
  totalConcepts: number;
  progress: Record<string, number>;
  chapterProgress: Array<{
    chapter: string;
    total_concepts: number;
    mastered: number;
    familiar: number;
    learning: number;
  }>;
  learningTime: {
    days: number;
    conversations: number;
  };
}

export interface LearningPath {
  mastered: number;
  learning: number;
  notStarted: number;
  recommended: Concept[];
}
