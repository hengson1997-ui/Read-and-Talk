export interface Book {
  id: number;
  title: string;
  filename: string;
  file_path: string;
  total_chunks: number;
  created_at: string;
}

export interface BookChunk {
  id: number;
  book_id: number;
  content: string;
  chunk_index: number;
  chapter: string | null;
}

export interface Concept {
  id: number;
  book_id: number;
  name: string;
  description: string | null;
  chapter: string | null;
  related_concept_ids: string | null;
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
  concepts_discussed: string | null;
  understanding_score: number | null;
  created_at: string;
}

export interface LearningProgress {
  id: number;
  book_id: number;
  concept_id: number;
  user_id: string;
  status: 'not_started' | 'learning' | 'familiar' | 'mastered';
  score: number;
  last_reviewed_at: string | null;
  next_review_at: string | null;
  review_count: number;
  created_at: string;
  updated_at: string;
}

export interface Note {
  id: number;
  book_id: number;
  conversation_id: number | null;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface ReviewHistory {
  id: number;
  concept_id: number;
  user_id: string;
  score: number;
  reviewed_at: string;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export interface TTSRequest {
  text: string;
  speaker?: string;
  speed?: number;
}

export interface ASRRequest {
  audio: Buffer | Blob;
  language?: string;
}

export interface ASRResponse {
  text: string;
  confidence?: number;
}
