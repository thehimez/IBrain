import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { documentsService } from '../services/documents';
import type { XandaCrossFile, FileUploadEntry } from '../types';

export function useDocuments() {
  const queryClient = useQueryClient();

  const { data: files = [], isLoading, error, refetch } = useQuery<XandaCrossFile[]>({
    queryKey: ['files'],
    queryFn: () => documentsService.list(),
    retry: 2,
  });

  return { files, isLoading, error: error as Error | null, refetch };
}

export function useUpload() {
  const queryClient = useQueryClient();
  const [queue, setQueue] = useState<FileUploadEntry[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const addToQueue = useCallback((entries: FileUploadEntry[]) => {
    setQueue(prev => {
      const existing = new Set(prev.map(e => `${e.name}|${e.size}`));
      return [...prev, ...entries.filter(e => !existing.has(`${e.name}|${e.size}`))];
    });
  }, []);

  const removeFromQueue = useCallback((id: string) => {
    setQueue(prev => prev.filter(e => e.id !== id));
  }, []);

  const clearQueue = useCallback(() => setQueue([]), []);

  const updateEntry = useCallback((id: string, patch: Partial<FileUploadEntry>) => {
    setQueue(prev => prev.map(e => (e.id === id ? { ...e, ...patch } : e)));
  }, []);

  const uploadAll = useCallback(async () => {
    const pending = queue.filter(e => e.status === 'pending');
    if (!pending.length || isUploading) return;
    setIsUploading(true);

    for (const entry of pending) {
      updateEntry(entry.id, { status: 'uploading', progress: 20 });
      try {
        updateEntry(entry.id, { progress: 60 });
        await documentsService.upload(entry.name, entry.content, entry.mimeType);
        updateEntry(entry.id, { status: 'queued', progress: 100 });
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Upload failed';
        updateEntry(entry.id, { status: 'error', error: msg, progress: 0 });
      }
    }

    setIsUploading(false);
    queryClient.invalidateQueries({ queryKey: ['files'] });
  }, [queue, isUploading, updateEntry, queryClient]);

  return { queue, isUploading, addToQueue, removeFromQueue, clearQueue, uploadAll };
}
