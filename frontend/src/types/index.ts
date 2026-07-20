export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  citations?: Citation[];
  gaps?: string[];
  isStreaming?: boolean;
}

export interface Citation {
  page_slug: string;
  row_num: number | null;
  citation_index: number;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  messages: Message[];
}

export interface BrainStatus {
  connected: boolean;
  name: string;
  pageCount: number;
  engine: string;
  version: string;
}

export interface ChatRequest {
  message: string;
  conversationHistory: { role: string; content: string }[];
}

export interface ChatResponse {
  answer: string;
  citations: Citation[];
  gaps: string[];
}

export interface AppUser {
  id: string;
  name: string;
  avatar?: string;
}
