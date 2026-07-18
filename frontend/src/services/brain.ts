import { apiGet } from './api';
import type { BrainStatus } from '../types';

export const brainService = {
  async getStatus(): Promise<BrainStatus> {
    return apiGet<BrainStatus>('/brain/status');
  },
};
