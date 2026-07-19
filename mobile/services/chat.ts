import { API_ENDPOINTS } from '../constants/api';
import { apiGet, apiPost } from './api';
import type { BrainStatus, ChatRequest, ChatResponse } from '../types';

export const chatService = {
  async send(req: ChatRequest): Promise<ChatResponse> {
    return apiPost<ChatResponse>(API_ENDPOINTS.chat, req);
  },
};

export const brainService = {
  async getStatus(): Promise<BrainStatus> {
    return apiGet<BrainStatus>(API_ENDPOINTS.brainStatus);
  },
};
