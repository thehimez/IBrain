import { API_ENDPOINTS } from '../constants/api';
import { apiGet } from './api';
import type { GraphData } from '../types';

export const graphService = {
  async getGraph(): Promise<GraphData> {
    return apiGet<GraphData>(API_ENDPOINTS.graph);
  },
};
