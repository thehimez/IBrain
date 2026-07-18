import { useCallback, useRef, useState } from 'react';
import {
  BookOpen, Upload, FileText, CheckCircle, XCircle,
  Loader2, AlertTriangle, CloudUpload, ArrowLeft,
  Clock, Activity, X, ChevronRight,
} from 'lucide-react';
import {
  isSupportedFile,
  isUnsupportedBinary,
  getFileExtension,
  readFileAsText,
  uploadDocument,
  SUPPORTED_TYPES,
} from '../services/upload';

// ─── Types ────────────────────────────────────────────────────────────────────

type FileStatus = 'pending' | 'uploading' | 'queued' | 'error' | 'unsupported';

interface FileEntry {
  id: string;
  file: File;
  status: FileStatus;
  progress: number; // 0–100, for visual indicator
  error?: string;
}

interface Props {
  onOpenChat: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const TYPE_LABELS: Record<string, string> = {
  '.txt': 'TXT',
  '.md': 'MD',
  '.markdown': 'MD',
  '.html': 'HTML',
  '.htm': 'HTML',
  '.json': 'JSON',
};

const FUTURE_SECTIONS = [
  { icon: Clock, label: 'Upload History', desc: 'View previously uploaded documents and their ingestion status.' },
  { icon: Activity, label: 'Processing Logs', desc: 'Monitor extraction, entity detection, and embedding progress.' },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: FileStatus }) {
  const map: Record<FileStatus, { label: string; className: string }> = {
    pending:     { label: 'Ready',       className: 'bg-slate-700/60 text-slate-400 border-slate-600' },
    uploading:   { label: 'Uploading',   className: 'bg-accent/15 text-accent-light border-accent/30' },
    queued:      { label: 'Queued',      className: 'bg-emerald-900/30 text-emerald-400 border-emerald-700/50' },
    error:       { label: 'Failed',      className: 'bg-red-900/30 text-red-400 border-red-700/50' },
    unsupported: { label: 'Unsupported', className: 'bg-amber-900/30 text-amber-400 border-amber-700/50' },
  };
  const { label, className } = map[status];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${className}`}>
      {label}
    </span>
  );
}

function FileRow({ entry, onRemove, canRemove }: { entry: FileEntry; onRemove: () => void; canRemove: boolean }) {
  const ext = getFileExtension(entry.file.name);
  const typeLabel = TYPE_LABELS[ext] ?? (ext.replace('.', '').toUpperCase() || '?');

  return (
    <div className={`flex items-center gap-4 p-3.5 rounded-xl border transition-all duration-300 ${
      entry.status === 'queued'      ? 'bg-emerald-900/10 border-emerald-800/30'
      : entry.status === 'error'     ? 'bg-red-900/10 border-red-800/30'
      : entry.status === 'unsupported' ? 'bg-amber-900/10 border-amber-800/30'
      : entry.status === 'uploading' ? 'bg-accent/8 border-accent/20'
      : 'bg-navy-700/30 border-navy-600/50'
    }`}>
      {/* File type badge */}
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold border ${
        entry.status === 'queued'      ? 'bg-emerald-900/30 border-emerald-700/40 text-emerald-400'
        : entry.status === 'error'     ? 'bg-red-900/30 border-red-700/40 text-red-400'
        : entry.status === 'unsupported' ? 'bg-amber-900/30 border-amber-700/40 text-amber-400'
        : entry.status === 'uploading' ? 'bg-accent/15 border-accent/30 text-accent-light'
        : 'bg-navy-700 border-navy-600 text-slate-400'
      }`}>
        {typeLabel}
      </div>

      {/* Name + meta */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">{entry.file.name}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-slate-500">{formatBytes(entry.file.size)}</span>
          {entry.status === 'error' || entry.status === 'unsupported' ? (
            <span className="text-xs text-red-400 truncate">{entry.error}</span>
          ) : entry.status === 'queued' ? (
            <span className="text-xs text-emerald-500">Knowledge extraction started</span>
          ) : null}
        </div>

        {/* Progress bar */}
        {entry.status === 'uploading' && (
          <div className="mt-1.5 h-1 bg-navy-600 rounded-full overflow-hidden">
            <div
              className="h-full bg-accent rounded-full transition-all duration-300"
              style={{ width: `${entry.progress}%` }}
            />
          </div>
        )}
      </div>

      {/* Status icon */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <StatusBadge status={entry.status} />
        {entry.status === 'uploading' && <Loader2 size={15} className="text-accent-light animate-spin" />}
        {entry.status === 'queued'    && <CheckCircle size={15} className="text-emerald-400" />}
        {entry.status === 'error'     && <XCircle size={15} className="text-red-400" />}
        {entry.status === 'unsupported' && <AlertTriangle size={15} className="text-amber-400" />}
        {entry.status === 'pending'   && <FileText size={15} className="text-slate-500" />}

        {/* Remove button */}
        {canRemove && (entry.status === 'pending' || entry.status === 'error' || entry.status === 'unsupported') && (
          <button
            onClick={onRemove}
            className="p-1 rounded-md text-slate-600 hover:text-slate-300 hover:bg-navy-600 transition-colors"
          >
            <X size={13} />
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function DocumentsPage({ onOpenChat }: Props) {
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // ── File handling ────────────────────────────────────────────────────────

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
        error: supported
          ? undefined
          : binary
            ? `Binary files (${ext}) are not supported. Use: ${Object.keys(SUPPORTED_TYPES).join(', ')}`
            : `Unsupported type (${ext || 'unknown'}). Use: ${Object.keys(SUPPORTED_TYPES).join(', ')}`,
      };
    });
    setFiles(prev => {
      const existing = new Set(prev.map(e => `${e.file.name}|${e.file.size}`));
      return [...prev, ...entries.filter(e => !existing.has(`${e.file.name}|${e.file.size}`))];
    });
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    addFiles(Array.from(e.dataTransfer.files));
  }, [addFiles]);

  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragging(true); };
  const onDragLeave = (e: React.DragEvent) => {
    // Only clear drag when leaving the zone itself, not its children
    if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragging(false);
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFiles(Array.from(e.target.files));
    e.target.value = '';
  };

  const removeFile = (id: string) => {
    if (uploading) return;
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const clearAll = () => {
    if (uploading) return;
    setFiles([]);
  };

  // ── Upload ───────────────────────────────────────────────────────────────

  const updateEntry = (id: string, patch: Partial<FileEntry>) => {
    setFiles(prev => prev.map(f => f.id === id ? { ...f, ...patch } : f));
  };

  const uploadAll = async () => {
    const pending = files.filter(f => f.status === 'pending');
    if (!pending.length || uploading) return;
    setUploading(true);

    for (const entry of pending) {
      updateEntry(entry.id, { status: 'uploading', progress: 10 });

      try {
        // Read file content (advance progress indicator)
        const content = await readFileAsText(entry.file);
        updateEntry(entry.id, { progress: 50 });

        const ext = getFileExtension(entry.file.name);
        const mimeType = SUPPORTED_TYPES[ext] ?? 'text/plain';

        // Upload to backend
        updateEntry(entry.id, { progress: 75 });
        await uploadDocument(entry.file.name, content, mimeType);

        updateEntry(entry.id, { status: 'queued', progress: 100 });
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Upload failed';
        updateEntry(entry.id, { status: 'error', error: msg, progress: 0 });
      }
    }

    setUploading(false);
  };

  // ── Derived state ────────────────────────────────────────────────────────

  const pendingFiles  = files.filter(f => f.status === 'pending');
  const queuedFiles   = files.filter(f => f.status === 'queued');
  const hasFiles      = files.length > 0;
  const allSettled    = hasFiles && files.every(f => ['queued', 'error', 'unsupported'].includes(f.status));
  const hasSuccess    = queuedFiles.length > 0;
  const showSuccess   = allSettled && hasSuccess;

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-navy-900 bg-grid">

      {/* ── Page header ─────────────────────────────────────────────────────── */}
      <div className="border-b border-navy-600 bg-navy-800/50 backdrop-blur-sm px-6 py-4 flex items-center gap-4 flex-shrink-0">
        <div className="w-9 h-9 rounded-xl bg-accent/15 border border-accent/25 flex items-center justify-center flex-shrink-0">
          <BookOpen size={16} className="text-accent-light" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-xs text-slate-600 mb-0.5">
            <span>Documents</span>
            <ChevronRight size={11} />
            <span className="text-slate-500">Upload Center</span>
          </div>
          <h1 className="text-sm font-semibold text-white leading-none">Industrial Knowledge Upload Center</h1>
        </div>
        <button
          onClick={onOpenChat}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-navy-700 border border-navy-600 transition-colors"
        >
          <ArrowLeft size={13} />
          Back to Chat
        </button>
      </div>

      {/* ── Scrollable body ──────────────────────────────────────────────────── */}
      <div className="flex-1 p-6 lg:p-8 max-w-3xl mx-auto w-full space-y-5">

        {/* ── Upload card ─────────────────────────────────────────────────── */}
        <div className="rounded-2xl bg-navy-800 border border-navy-600 overflow-hidden">
          {/* Card header */}
          <div className="px-6 pt-6 pb-4">
            <div className="flex items-center gap-3 mb-1">
              <CloudUpload size={20} className="text-accent-light flex-shrink-0" />
              <h2 className="text-base font-semibold text-white">Upload Industrial Documents</h2>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Upload documents to continuously improve your Industrial Knowledge Brain.
              Once uploaded, the extraction pipeline runs automatically in the background.
            </p>
          </div>

          {/* Drop zone */}
          <div className="px-6 pb-4">
            <div
              onDrop={onDrop}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onClick={() => !uploading && inputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-200 ${
                dragging
                  ? 'border-accent bg-accent/8 scale-[1.01] glow-blue'
                  : uploading
                    ? 'border-navy-500 opacity-50 cursor-not-allowed'
                    : 'border-navy-500 hover:border-accent/50 hover:bg-navy-700/30'
              }`}
            >
              <input
                ref={inputRef}
                type="file"
                multiple
                accept=".txt,.md,.markdown,.html,.htm,.json"
                onChange={onInputChange}
                className="hidden"
              />

              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-colors ${
                dragging ? 'bg-accent/20 border-accent/40 border' : 'bg-navy-700 border border-navy-600'
              }`}>
                <Upload size={24} className={dragging ? 'text-accent-light' : 'text-slate-500'} />
              </div>

              <p className="text-base font-medium text-white mb-1">
                {dragging ? 'Release to add files' : 'Drag & drop files here'}
              </p>
              <p className="text-sm text-slate-500 mb-4">
                or{' '}
                <span className="text-accent-light hover:underline">browse your computer</span>
              </p>

              {/* Type pills */}
              <div className="flex flex-wrap items-center justify-center gap-1.5">
                {Object.entries(TYPE_LABELS)
                  .filter(([ext], i, arr) => arr.findIndex(([, v]) => v === TYPE_LABELS[ext]) === i)
                  .map(([, label]) => (
                    <span key={label} className="px-2 py-0.5 rounded-md bg-navy-600/80 border border-navy-500 text-xs text-slate-400 font-mono">
                      .{label.toLowerCase()}
                    </span>
                  ))}
                <span className="text-xs text-slate-600 ml-1">· up to 5 MB each</span>
              </div>
            </div>
          </div>

          {/* Note: what happens after upload */}
          <div className="px-6 pb-5">
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-navy-700/40 border border-navy-600/60">
              <Activity size={14} className="text-accent-light flex-shrink-0 mt-0.5" />
              <p className="text-xs text-slate-400 leading-relaxed">
                After upload, the ingestion worker automatically runs extraction, builds the knowledge graph,
                and updates embeddings. You can return to Chat and start asking questions once processing completes.
              </p>
            </div>
          </div>
        </div>

        {/* ── File queue ──────────────────────────────────────────────────── */}
        {hasFiles && (
          <div className="rounded-2xl bg-navy-800 border border-navy-600 overflow-hidden animate-fade-in">
            {/* Queue header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-navy-600">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-white">Upload Queue</h3>
                <span className="px-2 py-0.5 rounded-full bg-navy-700 border border-navy-600 text-xs text-slate-400">
                  {files.length} {files.length === 1 ? 'file' : 'files'}
                </span>
                {queuedFiles.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-900/30 border border-emerald-700/40 text-xs text-emerald-400">
                    {queuedFiles.length} queued
                  </span>
                )}
              </div>
              {!uploading && !allSettled && (
                <button
                  onClick={clearAll}
                  className="text-xs text-slate-600 hover:text-slate-300 transition-colors"
                >
                  Clear all
                </button>
              )}
            </div>

            {/* File rows */}
            <div className="p-4 space-y-2.5">
              {files.map(entry => (
                <FileRow
                  key={entry.id}
                  entry={entry}
                  onRemove={() => removeFile(entry.id)}
                  canRemove={!uploading}
                />
              ))}
            </div>

            {/* Queue footer / actions */}
            {!allSettled && (
              <div className="flex items-center justify-between px-5 py-3.5 border-t border-navy-600 bg-navy-800/60">
                <p className="text-xs text-slate-500">
                  {pendingFiles.length} {pendingFiles.length === 1 ? 'file' : 'files'} ready to upload
                </p>
                <div className="flex items-center gap-2">
                  {!uploading && (
                    <button
                      onClick={clearAll}
                      className="px-3 py-1.5 rounded-lg text-xs text-slate-500 hover:text-white hover:bg-navy-700 transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    onClick={uploadAll}
                    disabled={pendingFiles.length === 0 || uploading}
                    className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      pendingFiles.length > 0 && !uploading
                        ? 'bg-accent hover:bg-accent-dim text-white glow-blue-sm'
                        : 'bg-navy-700 text-slate-600 cursor-not-allowed'
                    }`}
                  >
                    {uploading ? (
                      <>
                        <Loader2 size={13} className="animate-spin" />
                        Uploading…
                      </>
                    ) : (
                      <>
                        <Upload size={13} />
                        Upload {pendingFiles.length > 0 ? `${pendingFiles.length} ` : ''}
                        {pendingFiles.length === 1 ? 'File' : 'Files'}
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Success banner ───────────────────────────────────────────────── */}
        {showSuccess && (
          <div className="rounded-2xl bg-emerald-950/40 border border-emerald-700/40 p-6 animate-slide-in">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-900/50 border border-emerald-700/50 flex items-center justify-center flex-shrink-0">
                <CheckCircle size={20} className="text-emerald-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-emerald-300 mb-1">
                  Document{queuedFiles.length > 1 ? 's' : ''} uploaded successfully.
                </h3>
                <p className="text-sm text-emerald-400/80 leading-relaxed mb-0.5">
                  Knowledge extraction has started.
                </p>
                <p className="text-sm text-slate-400 leading-relaxed">
                  The Industrial Knowledge Brain is continuously learning in the background.
                  You can now return to Chat and ask questions about{' '}
                  {queuedFiles.length === 1 ? 'this document' : 'these documents'} after processing completes.
                </p>
              </div>
            </div>

            <div className="mt-5 flex items-center gap-3">
              <button
                onClick={onOpenChat}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-accent hover:bg-accent-dim text-white text-sm font-semibold transition-all glow-blue-sm"
              >
                Open Chat
                <ChevronRight size={15} />
              </button>
              <button
                onClick={() => setFiles([])}
                className="px-4 py-2 rounded-xl text-sm text-slate-400 hover:text-white hover:bg-navy-700 border border-navy-600 transition-colors"
              >
                Upload more
              </button>
            </div>
          </div>
        )}

        {/* ── Future-ready sections (placeholders only) ────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {FUTURE_SECTIONS.map(({ icon: Icon, label, desc }) => (
            <div
              key={label}
              className="rounded-xl bg-navy-800/30 border border-navy-600/40 p-4 opacity-40 select-none"
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon size={14} className="text-slate-600" />
                <p className="text-xs font-medium text-slate-600">{label}</p>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">{desc}</p>
              <p className="text-xs text-slate-700 mt-2 font-medium">Coming soon</p>
            </div>
          ))}
        </div>

        {/* bottom breathing room */}
        <div className="h-4" />
      </div>
    </div>
  );
}
