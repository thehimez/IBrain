import { apiPost } from './api';
import type { ChatRequest, ChatResponse } from '../types';

export const chatService = {
  async send(req: ChatRequest): Promise<ChatResponse> {
    return apiPost<ChatResponse>('/chat', req);
  },
};
