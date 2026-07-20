import { useCallback, useEffect, useRef, useState } from 'react';
import {
  BookOpen, Upload, FileText, CheckCircle, XCircle,
  Loader2, AlertTriangle, CloudUpload, ArrowLeft,
  X, ChevronRight, RefreshCw, Eye,
} from 'lucide-react';
import {
  isSupportedFile, isUnsupportedBinary, getFileExtension,
  readFileAsText, uploadDocument, SUPPORTED_TYPES,
} from '../services/upload';
import DocumentModal from '../components/DocumentModal';

// ─── Types ───────────────────────────────────────────────────────────────────

type FileStatus = 'pending' | 'uploading' | 'queued' | 'error' | 'unsupported';

interface FileEntry {
  id: string;
  file: File;
  status: FileStatus;
  progress: number;
  error?: string;
}

interface StoredFile {
  id: number;
  filename: string;
  mime_type: string | null;
  size_bytes: number | null;
  page_slug: string | null;
  uploaded_at: string | null;
}

interface Props {
  onOpenChat: () => void;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatBytes(bytes: number | null): string {
  if (bytes === null || bytes === undefined) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  } catch { return '—'; }
}

const TYPE_LABELS: Record<string, string> = {
  '.txt': 'TXT', '.md': 'MD', '.markdown': 'MD', '.html': 'HTML', '.htm': 'HTML', '.json': 'JSON',
};

function extLabel(filename: string): string {
  const ext = '.' + (filename.split('.').pop()?.toLowerCase() ?? '');
  return TYPE_LABELS[ext] ?? (ext.replace('.', '').toUpperCase() || '?');
}

const EXT_COLORS: Record<string, string> = {
  TXT:  'bg-slate-100 text-slate-600 border-slate-200',
  MD:   'bg-teal-50 text-teal-600 border-teal-200',
  HTML: 'bg-orange-50 text-orange-500 border-orange-200',
  JSON: 'bg-purple-50 text-purple-500 border-purple-200',
};

type UploadFileStatus = 'pending' | 'uploading' | 'queued' | 'error' | 'unsupported';

function StatusBadge({ status }: { status: UploadFileStatus }) {
  const map: Record<UploadFileStatus, { label: string; className: string }> = {
    pending:     { label: 'Ready',       className: 'bg-slate-100 text-slate-500 border-slate-300' },
    uploading:   { label: 'Uploading',   className: 'bg-accent-light/10 text-accent-light border-accent-light/30' },
    queued:      { label: 'Queued',      className: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
    error:       { label: 'Failed',      className: 'bg-red-50 text-red-500 border-red-200' },
    unsupported: { label: 'Unsupported', className: 'bg-amber-50 text-amber-600 border-amber-200' },
  };
  const { label, className } = map[status];
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${className}`}>{label}</span>;
}

// ─── Stored file row ──────────────────────────────────────────────────────────

function StoredFileRow({ file, onPreview }: { file: StoredFile; onPreview: () => void }) {
  const label = extLabel(file.filename);
  const colorCls = EXT_COLORS[label] ?? 'bg-slate-100 text-slate-500 border-slate-200';
  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-navy-600 last:border-0 hover:bg-navy-700/30 transition-colors group">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold border ${colorCls}`}>
        {label}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-900 truncate">{file.filename}</p>
        <p className="text-xs text-slate-400 mt-0.5">
          {formatBytes(file.size_bytes)} · {formatDate(file.uploaded_at)}
        </p>
      </div>
      <button
        onClick={onPreview}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-slate-400 hover:text-accent-light hover:bg-accent-light/8 border border-transparent hover:border-accent-light/20 transition-all opacity-0 group-hover:opacity-100"
      >
        <Eye size={12} />
        View
      </button>
    </div>
  );
}

// ─── Upload queue row ─────────────────────────────────────────────────────────

function FileRow({ entry, onRemove, canRemove }: { entry: FileEntry; onRemove: () => void; canRemove: boolean }) {
  const ext = getFileExtension(entry.file.name);
  const typeLabel = TYPE_LABELS[ext] ?? (ext.replace('.', '').toUpperCase() || '?');
  const colorCls = EXT_COLORS[typeLabel] ?? 'bg-slate-100 text-slate-500 border-slate-200';

  return (
    <div className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
      entry.status === 'queued'        ? 'bg-emerald-50 border-emerald-200'
      : entry.status === 'error'       ? 'bg-red-50 border-red-200'
      : entry.status === 'unsupported' ? 'bg-amber-50 border-amber-200'
      : entry.status === 'uploading'   ? 'bg-accent-light/5 border-accent-light/20'
      : 'bg-navy-950 border-navy-600'
    }`}>
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold border ${colorCls}`}>
        {typeLabel}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-800 truncate">{entry.file.name}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-slate-400">{formatBytes(entry.file.size)}</span>
          {(entry.status === 'error' || entry.status === 'unsupported') && (
            <span className="text-xs text-red-500 truncate">{entry.error}</span>
          )}
          {entry.status === 'queued' && <span className="text-xs text-emerald-600">Queued for extraction</span>}
        </div>
        {entry.status === 'uploading' && (
          <div className="mt-1.5 h-1 bg-navy-600 rounded-full overflow-hidden">
            <div className="h-full bg-accent-light rounded-full transition-all" style={{ width: `${entry.progress}%` }} />
          </div>
        )}
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <StatusBadge status={entry.status} />
        {entry.status === 'uploading'   && <Loader2 size={14} className="text-accent-light animate-spin" />}
        {entry.status === 'queued'      && <CheckCircle size={14} className="text-emerald-500" />}
        {entry.status === 'error'       && <XCircle size={14} className="text-red-500" />}
        {entry.status === 'unsupported' && <AlertTriangle size={14} className="text-amber-500" />}
        {canRemove && ['pending', 'error', 'unsupported'].includes(entry.status) && (
          <button onClick={onRemove} className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-navy-700 transition-colors">
            <X size={12} />
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function DocumentsPage({ onOpenChat }: Props) {
  // Upload state
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Stored files state
  const [storedFiles, setStoredFiles] = useState<StoredFile[]>([]);
  const [loadingStored, setLoadingStored] = useState(true);
  const [storedError, setStoredError] = useState<string | null>(null);
  const [previewFileId, setPreviewFileId] = useState<number | null>(null);

  // Load existing files from the API
  const loadStoredFiles = useCallback(async () => {
    setLoadingStored(true);
    setStoredError(null);
    try {
      const res = await fetch('/api/files', { credentials: 'include' });
      if (!res.ok) throw new Error(`Failed to load files (${res.status})`);
      const data = await res.json() as StoredFile[];
      setStoredFiles(data);
    } catch (err) {
      setStoredError(err instanceof Error ? err.message : 'Failed to load files');
    } finally {
      setLoadingStored(false);
    }
  }, []);

  useEffect(() => { loadStoredFiles(); }, [loadStoredFiles]);

  // Upload logic
  const addFiles = useCallback((incoming: File[]) => {
    const entries: FileEntry[] = incoming.map(file => {
      const supported = isSupportedFile(file.name);
      const binary = isUnsupportedBinary(file.name);
      const ext = getFileExtension(file.name);
      return {
        id: `${file.name}-${file.size}-${Date.now()}-${Math.random()}`,
        file,
        status: supported ? 'pending' : 'unsupported',
        progress: 0,
        error: supported ? undefined : binary
          ? `Binary files (${ext}) not supported`
          : `Unsupported type (${ext || 'unknown'})`,
      };
    });
    setFiles(prev => {
      const existing = new Set(prev.map(e => `${e.file.name}|${e.file.size}`));
      return [...prev, ...entries.filter(e => !existing.has(`${e.file.name}|${e.file.size}`))];
    });
  }, []);

  const onDrop      = useCallback((e: React.DragEvent) => { e.preventDefault(); setDragging(false); addFiles(Array.from(e.dataTransfer.files)); }, [addFiles]);
  const onDragOver  = (e: React.DragEvent) => { e.preventDefault(); setDragging(true); };
  const onDragLeave = (e: React.DragEvent) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragging(false); };
  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => { if (e.target.files) addFiles(Array.from(e.target.files)); e.target.value = ''; };
  const removeFile  = (id: string) => { if (!uploading) setFiles(prev => prev.filter(f => f.id !== id)); };
  const clearAll    = () => { if (!uploading) setFiles([]); };

  const updateEntry = (id: string, patch: Partial<FileEntry>) =>
    setFiles(prev => prev.map(f => f.id === id ? { ...f, ...patch } : f));

  const uploadAll = async () => {
    const pending = files.filter(f => f.status === 'pending');
    if (!pending.length || uploading) return;
    setUploading(true);
    for (const entry of pending) {
      updateEntry(entry.id, { status: 'uploading', progress: 10 });
      try {
        const content = await readFileAsText(entry.file);
        updateEntry(entry.id, { progress: 50 });
        const ext = getFileExtension(entry.file.name);
        const mimeType = SUPPORTED_TYPES[ext] ?? 'text/plain';
        updateEntry(entry.id, { progress: 75 });
        await uploadDocument(entry.file.name, content, mimeType);
        updateEntry(entry.id, { status: 'queued', progress: 100 });
      } catch (err) {
        updateEntry(entry.id, { status: 'error', error: err instanceof Error ? err.message : 'Upload failed', progress: 0 });
      }
    }
    setUploading(false);
    // Refresh the stored files list after uploading
    setTimeout(() => loadStoredFiles(), 1500);
  };

  const pendingFiles = files.filter(f => f.status === 'pending');
  const queuedFiles  = files.filter(f => f.status === 'queued');
  const hasQueue     = files.length > 0;
  const allSettled   = hasQueue && files.every(f => ['queued', 'error', 'unsupported'].includes(f.status));

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-navy-950">

      {/* Header */}
      <div className="border-b border-navy-600 bg-navy-800 px-6 py-4 flex items-center gap-4 flex-shrink-0">
        <div className="w-9 h-9 rounded-xl bg-accent-light/10 border border-accent-light/25 flex items-center justify-center flex-shrink-0">
          <BookOpen size={16} className="text-accent-light" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-0.5">
            <span>Documents</span>
            <ChevronRight size={11} />
            <span className="text-slate-500">Knowledge Library</span>
          </div>
          <h1 className="text-sm font-semibold text-slate-900 leading-none">Your Documents</h1>
        </div>
        <button
          onClick={onOpenChat}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-slate-500 hover:text-slate-800 hover:bg-navy-700 border border-navy-600 transition-colors"
        >
          <ArrowLeft size={13} />
          Back to Chat
        </button>
      </div>

      <div className="flex-1 p-6 lg:p-8 max-w-3xl mx-auto w-full space-y-5">

        {/* ── Existing files ─────────────────────────────────────── */}
        <div className="rounded-2xl bg-navy-800 border border-navy-600 overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-navy-600">
            <div className="flex items-center gap-2">
              <FileText size={14} className="text-accent-light" />
              <h2 className="text-sm font-semibold text-slate-900">Knowledge Library</h2>
              {!loadingStored && (
                <span className="px-2 py-0.5 rounded-full bg-navy-700 border border-navy-600 text-xs text-slate-500">
                  {storedFiles.length} {storedFiles.length === 1 ? 'file' : 'files'}
                </span>
              )}
            </div>
            <button
              onClick={loadStoredFiles}
              disabled={loadingStored}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-navy-700 transition-colors"
              title="Refresh"
            >
              <RefreshCw size={13} className={loadingStored ? 'animate-spin' : ''} />
            </button>
          </div>

          {loadingStored ? (
            <div className="flex items-center justify-center gap-2 py-12 text-slate-400">
              <Loader2 size={16} className="animate-spin" />
              <span className="text-sm">Loading documents…</span>
            </div>
          ) : storedError ? (
            <div className="flex flex-col items-center gap-3 py-10 px-6 text-center">
              <XCircle size={24} className="text-red-400" />
              <p className="text-sm text-slate-600">{storedError}</p>
              <button onClick={loadStoredFiles} className="px-4 py-1.5 rounded-lg text-xs bg-navy-700 border border-navy-600 text-slate-500 hover:text-slate-800 transition-colors">
                Retry
              </button>
            </div>
          ) : storedFiles.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-12 px-6 text-center">
              <div className="w-10 h-10 rounded-xl bg-navy-700 border border-navy-600 flex items-center justify-center mb-1">
                <BookOpen size={18} className="text-slate-400" />
              </div>
              <p className="text-sm font-medium text-slate-600">No documents yet</p>
              <p className="text-xs text-slate-400">Upload files below to build your knowledge brain.</p>
            </div>
          ) : (
            <div>
              {storedFiles.map(f => (
                <StoredFileRow key={f.id} file={f} onPreview={() => setPreviewFileId(f.id)} />
              ))}
            </div>
          )}
        </div>

        {/* ── Upload card ────────────────────────────────────────── */}
        <div className="rounded-2xl bg-navy-800 border border-navy-600 overflow-hidden shadow-sm">
          <div className="px-6 pt-5 pb-4">
            <div className="flex items-center gap-3 mb-1">
              <CloudUpload size={18} className="text-accent-light flex-shrink-0" />
              <h2 className="text-base font-semibold text-slate-900">Upload Documents</h2>
            </div>
            <p className="text-sm text-slate-500">Add files to your knowledge brain. Extraction runs automatically.</p>
          </div>

          <div className="px-6 pb-5">
            <div
              onDrop={onDrop} onDragOver={onDragOver} onDragLeave={onDragLeave}
              onClick={() => !uploading && inputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                dragging    ? 'border-accent-light bg-accent-light/5 scale-[1.01]'
                : uploading ? 'border-navy-600 opacity-50 cursor-not-allowed'
                : 'border-navy-600 hover:border-accent-light/50 hover:bg-navy-700/30'
              }`}
            >
              <input ref={inputRef} type="file" multiple accept=".txt,.md,.markdown,.html,.htm,.json" onChange={onInputChange} className="hidden" />
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 transition-colors ${dragging ? 'bg-accent-light/15 border border-accent-light/30' : 'bg-navy-700 border border-navy-600'}`}>
                <Upload size={20} className={dragging ? 'text-accent-light' : 'text-slate-400'} />
              </div>
              <p className="text-sm font-medium text-slate-700 mb-1">{dragging ? 'Release to add files' : 'Drag & drop or click to browse'}</p>
              <div className="flex flex-wrap items-center justify-center gap-1.5 mt-2">
                {['TXT', 'MD', 'HTML', 'JSON'].map(l => (
                  <span key={l} className="px-2 py-0.5 rounded bg-navy-700 border border-navy-600 text-xs text-slate-500 font-mono">.{l.toLowerCase()}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Queue ──────────────────────────────────────────────── */}
        {hasQueue && (
          <div className="rounded-2xl bg-navy-800 border border-navy-600 overflow-hidden shadow-sm">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-navy-600">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-slate-900">Upload Queue</h3>
                <span className="px-2 py-0.5 rounded-full bg-navy-700 border border-navy-600 text-xs text-slate-500">
                  {files.length} {files.length === 1 ? 'file' : 'files'}
                </span>
                {queuedFiles.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs text-emerald-600">
                    {queuedFiles.length} queued
                  </span>
                )}
              </div>
              {!uploading && !allSettled && (
                <button onClick={clearAll} className="text-xs text-slate-400 hover:text-slate-700">Clear all</button>
              )}
            </div>

            <div className="p-4 space-y-2">
              {files.map(entry => (
                <FileRow key={entry.id} entry={entry} onRemove={() => removeFile(entry.id)} canRemove={!uploading} />
              ))}
            </div>

            {!allSettled ? (
              <div className="flex items-center justify-between px-5 py-3.5 border-t border-navy-600 bg-navy-950">
                <p className="text-xs text-slate-400">{pendingFiles.length} file{pendingFiles.length !== 1 ? 's' : ''} ready</p>
                <div className="flex items-center gap-2">
                  {!uploading && (
                    <button onClick={clearAll} className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-slate-700 hover:bg-navy-700 transition-colors">Cancel</button>
                  )}
                  <button
                    onClick={uploadAll}
                    disabled={pendingFiles.length === 0 || uploading}
                    className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      pendingFiles.length > 0 && !uploading ? 'bg-accent text-white' : 'bg-navy-700 text-slate-400 cursor-not-allowed'
                    }`}
                    style={pendingFiles.length > 0 && !uploading ? { boxShadow: '0 3px 10px rgba(239,85,32,0.28)' } : undefined}
                  >
                    {uploading ? <><Loader2 size={12} className="animate-spin" />Uploading…</> : <><Upload size={12} />Upload {pendingFiles.length > 0 ? pendingFiles.length : ''} file{pendingFiles.length !== 1 ? 's' : ''}</>}
                  </button>
                </div>
              </div>
            ) : allSettled && queuedFiles.length > 0 ? (
              <div className="px-5 py-4 border-t border-navy-600 bg-emerald-50 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-emerald-500 flex-shrink-0" />
                  <p className="text-sm text-emerald-700 font-medium">
                    {queuedFiles.length} file{queuedFiles.length !== 1 ? 's' : ''} uploaded — extraction started.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={onOpenChat} className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-accent text-white text-xs font-semibold" style={{ boxShadow: '0 3px 10px rgba(239,85,32,0.28)' }}>
                    Open Chat <ChevronRight size={13} />
                  </button>
                  <button onClick={() => setFiles([])} className="px-3 py-1.5 rounded-lg text-xs text-slate-500 hover:bg-navy-700 border border-navy-600 transition-colors">Upload more</button>
                </div>
              </div>
            ) : null}
          </div>
        )}

        <div className="h-4" />
      </div>

      {/* Document preview modal */}
      {previewFileId !== null && (
        <DocumentModal fileId={previewFileId} onClose={() => setPreviewFileId(null)} />
      )}
    </div>
  );
}
