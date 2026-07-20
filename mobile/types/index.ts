// ─── Auth ──────────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  provider: string;
  name: string;
  email?: string | null;
  avatarUrl?: string | null;
  sourceId: string;
}

// ─── Chat ──────────────────────────────────────────────────────────────────────

export interface Citation {
  page_slug: string;
  row_num: number | null;
  citation_index: number;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string; // ISO string for serialization
  citations?: Citation[];
  gaps?: string[];
  isStreaming?: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: Message[];
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

// ─── Brain ─────────────────────────────────────────────────────────────────────

export interface BrainStatus {
  connected: boolean;
  name: string;
  pageCount: number;
  engine: string;
  version: string;
}

// ─── Documents ─────────────────────────────────────────────────────────────────

<<<<<<< HEAD
export interface XandaCrossFile {
=======
export interface GBrainFile {
>>>>>>> origin/main
  id: string;
  source_id: string;
  page_id: string | null;
  filename: string;
  mime_type: string;
  size_bytes: number;
  created_at: string;
  content_raw?: string | null;
}

export interface UploadResult {
  job_id: string;
  content_hash: string;
  filename: string;
  message: string;
}

export type FileUploadStatus = 'pending' | 'uploading' | 'queued' | 'error' | 'unsupported';

export interface FileUploadEntry {
  id: string;
  name: string;
  size: number;
  mimeType: string;
  content: string;
  status: FileUploadStatus;
  progress: number;
  error?: string;
}

// ─── Graph ─────────────────────────────────────────────────────────────────────

export interface GraphNode {
  id: string;
  label: string;
  type: string;
  kind?: string;
  slug?: string;
  claim?: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  pinned?: boolean;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label: string;
  context?: string;
}

export interface GraphData {
  stats: { pages: number; entities: number; relationships: number };
  nodes: Omit<GraphNode, 'x' | 'y' | 'vx' | 'vy'>[];
  edges: GraphEdge[];
}
