import { useCallback, useRef, useState } from 'react';
import { X, Upload, FileText, CheckCircle, XCircle, Loader2, AlertTriangle } from 'lucide-react';
import {
  isSupportedFile,
  isUnsupportedBinary,
  getFileExtension,
  readFileAsText,
  uploadDocument,
  SUPPORTED_TYPES,
} from '../services/upload';

interface FileEntry {
  id: string;
  file: File;
  status: 'pending' | 'uploading' | 'done' | 'error' | 'unsupported';
  error?: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onUploaded?: (count: number) => void;
}

export default function UploadModal({ open, onClose, onUploaded }: Props) {
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback((incoming: File[]) => {
    const entries: FileEntry[] = incoming.map(file => ({
      id: `${file.name}-${file.size}-${Date.now()}-${Math.random()}`,
      file,
      status: isSupportedFile(file.name) ? 'pending'
        : isUnsupportedBinary(file.name) ? 'unsupported'
        : 'unsupported',
      error: isSupportedFile(file.name)
        ? undefined
        : isUnsupportedBinary(file.name)
          ? `Binary files (${getFileExtension(file.name)}) are not yet supported. Supported: ${Object.keys(SUPPORTED_TYPES).join(', ')}`
          : `Unsupported file type (${getFileExtension(file.name) || 'unknown'}). Supported: ${Object.keys(SUPPORTED_TYPES).join(', ')}`,
    }));
    setFiles(prev => {
      const existingNames = new Set(prev.map(e => e.file.name + e.file.size));
      return [...prev, ...entries.filter(e => !existingNames.has(e.file.name + e.file.size))];
    });
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const dropped = Array.from(e.dataTransfer.files);
    addFiles(dropped);
  }, [addFiles]);

  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragging(true); };
  const onDragLeave = () => setDragging(false);

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFiles(Array.from(e.target.files));
    e.target.value = '';
  };

  const removeFile = (id: string) => {
    if (uploading) return;
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const updateEntry = (id: string, patch: Partial<FileEntry>) => {
    setFiles(prev => prev.map(f => f.id === id ? { ...f, ...patch } : f));
  };

  const uploadAll = async () => {
    const pending = files.filter(f => f.status === 'pending');
    if (!pending.length) return;
    setUploading(true);

    let successCount = 0;
    for (const entry of pending) {
      updateEntry(entry.id, { status: 'uploading' });
      try {
        const content = await readFileAsText(entry.file);
        const ext = getFileExtension(entry.file.name);
        const mimeType = SUPPORTED_TYPES[ext] ?? 'text/plain';
        await uploadDocument(entry.file.name, content, mimeType);
        updateEntry(entry.id, { status: 'done' });
        successCount++;
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Upload failed';
        updateEntry(entry.id, { status: 'error', error: msg });
      }
    }

    setUploading(false);
    if (successCount > 0) onUploaded?.(successCount);
  };

  const hasPending = files.some(f => f.status === 'pending');
  const allDone = files.length > 0 && files.every(f => f.status === 'done' || f.status === 'unsupported' || f.status === 'error');

  const handleClose = () => {
    if (uploading) return;
    setFiles([]);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={e => { if (e.target === e.currentTarget) handleClose(); }}>
      <div className="w-full max-w-lg bg-navy-800 border border-navy-600 rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-navy-600 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-accent/15 border border-accent/25 flex items-center justify-center">
              <Upload size={15} className="text-accent-light" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">Upload Documents</h2>
              <p className="text-xs text-slate-500">TXT, Markdown, HTML, JSON</p>
            </div>
          </div>
          <button onClick={handleClose} disabled={uploading} className="p-1.5 rounded-lg hover:bg-navy-700 text-slate-500 hover:text-white transition-colors disabled:opacity-40">
            <X size={16} />
          </button>
        </div>

        {/* Drop zone */}
        <div className="p-4 flex-shrink-0">
          <div
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onClick={() => !uploading && inputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
              dragging
                ? 'border-accent bg-accent/10 scale-[1.01]'
                : 'border-navy-500 hover:border-accent/50 hover:bg-navy-700/40'
            } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <input
              ref={inputRef}
              type="file"
              multiple
              accept=".txt,.md,.markdown,.html,.htm,.json"
              onChange={onInputChange}
              className="hidden"
            />
            <Upload size={24} className={`mx-auto mb-3 ${dragging ? 'text-accent-light' : 'text-slate-500'}`} />
            <p className="text-sm text-slate-300 font-medium">
              {dragging ? 'Drop files here' : 'Drag & drop files, or click to browse'}
            </p>
            <p className="text-xs text-slate-600 mt-1">
              .txt · .md · .html · .json · up to 5 MB each
            </p>
          </div>
        </div>

        {/* File list */}
        {files.length > 0 && (
          <div className="flex-1 overflow-y-auto px-4 pb-2 space-y-2 min-h-0">
            {files.map(entry => (
              <div key={entry.id} className={`flex items-start gap-3 p-3 rounded-xl border transition-colors ${
                entry.status === 'done' ? 'bg-emerald-900/20 border-emerald-800/40'
                : entry.status === 'error' ? 'bg-red-900/20 border-red-800/40'
                : entry.status === 'unsupported' ? 'bg-amber-900/20 border-amber-800/40'
                : entry.status === 'uploading' ? 'bg-accent/10 border-accent/25'
                : 'bg-navy-700/50 border-navy-600'
              }`}>
                {/* Icon */}
                <div className="flex-shrink-0 mt-0.5">
                  {entry.status === 'done' && <CheckCircle size={16} className="text-emerald-400" />}
                  {entry.status === 'error' && <XCircle size={16} className="text-red-400" />}
                  {entry.status === 'unsupported' && <AlertTriangle size={16} className="text-amber-400" />}
                  {entry.status === 'uploading' && <Loader2 size={16} className="text-accent-light animate-spin" />}
                  {entry.status === 'pending' && <FileText size={16} className="text-slate-400" />}
                </div>

                {/* Name + status */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate font-medium">{entry.file.name}</p>
                  <p className={`text-xs mt-0.5 ${
                    entry.status === 'done' ? 'text-emerald-400'
                    : entry.status === 'error' ? 'text-red-400'
                    : entry.status === 'unsupported' ? 'text-amber-400'
                    : entry.status === 'uploading' ? 'text-accent-light'
                    : 'text-slate-500'
                  }`}>
                    {entry.status === 'done' && 'Uploaded — queued for indexing'}
                    {entry.status === 'uploading' && 'Uploading…'}
                    {entry.status === 'pending' && `${(entry.file.size / 1024).toFixed(1)} KB`}
                    {(entry.status === 'error' || entry.status === 'unsupported') && (entry.error ?? 'Failed')}
                  </p>
                </div>

                {/* Remove */}
                {!uploading && entry.status !== 'uploading' && (
                  <button onClick={() => removeFile(entry.id)} className="flex-shrink-0 p-1 rounded text-slate-600 hover:text-slate-300 transition-colors">
                    <X size={13} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="px-4 py-4 border-t border-navy-600 flex items-center justify-between gap-3 flex-shrink-0">
          <p className="text-xs text-slate-600">
            {files.length === 0
              ? 'No files selected'
              : `${files.filter(f => f.status === 'done').length} / ${files.length} uploaded`}
          </p>
          <div className="flex items-center gap-2">
            <button onClick={handleClose} disabled={uploading} className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-navy-700 transition-colors disabled:opacity-40">
              {allDone ? 'Close' : 'Cancel'}
            </button>
            {!allDone && (
              <button
                onClick={uploadAll}
                disabled={!hasPending || uploading}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  hasPending && !uploading
                    ? 'bg-accent hover:bg-accent-dim text-white glow-blue-sm'
                    : 'bg-navy-700 text-slate-600 cursor-not-allowed'
                }`}
              >
                {uploading ? (
                  <span className="flex items-center gap-1.5"><Loader2 size={12} className="animate-spin" />Uploading…</span>
                ) : (
                  `Upload ${files.filter(f => f.status === 'pending').length > 0 ? `${files.filter(f => f.status === 'pending').length} ` : ''}File${files.filter(f => f.status === 'pending').length !== 1 ? 's' : ''}`
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
