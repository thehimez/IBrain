import { useQuery } from '@tanstack/react-query';
import { graphService } from '../services/graph';
import type { GraphData } from '../types';

export function useGraph() {
  const { data, isLoading, error, refetch } = useQuery<GraphData>({
    queryKey: ['graph'],
    queryFn: () => graphService.getGraph(),
    staleTime: 30_000,
    retry: 2,
  });

  return {
    data: data ?? null,
    isLoading,
    error: error as Error | null,
    refetch,
  };
}
