import { useCallback, useRef, useState } from 'react';
import {
  BookOpen, Upload, FileText, CheckCircle, XCircle,
  Loader2, AlertTriangle, CloudUpload, ArrowLeft,
  Clock, Activity, X, ChevronRight,
} from 'lucide-react';
import {
  isSupportedFile, isUnsupportedBinary, getFileExtension,
  readFileAsText, uploadDocument, SUPPORTED_TYPES,
} from '../services/upload';

type FileStatus = 'pending' | 'uploading' | 'queued' | 'error' | 'unsupported';

interface FileEntry {
  id: string;
  file: File;
  status: FileStatus;
  progress: number;
  error?: string;
}

interface Props {
  onOpenChat: () => void;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const TYPE_LABELS: Record<string, string> = {
  '.txt': 'TXT', '.md': 'MD', '.markdown': 'MD', '.html': 'HTML', '.htm': 'HTML', '.json': 'JSON',
};

const FUTURE_SECTIONS = [
  { icon: Clock,    label: 'Upload History',   desc: 'View previously uploaded documents and their ingestion status.' },
  { icon: Activity, label: 'Processing Logs',  desc: 'Monitor extraction, entity detection, and embedding progress.' },
];

function StatusBadge({ status }: { status: FileStatus }) {
  const map: Record<FileStatus, { label: string; className: string }> = {
    pending:     { label: 'Ready',       className: 'bg-slate-100 text-slate-500 border-slate-300' },
    uploading:   { label: 'Uploading',   className: 'bg-accent-light/10 text-accent-light border-accent-light/30' },
    queued:      { label: 'Queued',      className: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
    error:       { label: 'Failed',      className: 'bg-red-50 text-red-500 border-red-200' },
    unsupported: { label: 'Unsupported', className: 'bg-amber-50 text-amber-600 border-amber-200' },
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
      entry.status === 'queued'        ? 'bg-emerald-50 border-emerald-200'
      : entry.status === 'error'       ? 'bg-red-50 border-red-200'
      : entry.status === 'unsupported' ? 'bg-amber-50 border-amber-200'
      : entry.status === 'uploading'   ? 'bg-accent-light/5 border-accent-light/20'
      : 'bg-navy-950 border-navy-600'
    }`}>
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold border ${
        entry.status === 'queued'        ? 'bg-emerald-100 border-emerald-200 text-emerald-600'
        : entry.status === 'error'       ? 'bg-red-100 border-red-200 text-red-500'
        : entry.status === 'unsupported' ? 'bg-amber-100 border-amber-200 text-amber-600'
        : entry.status === 'uploading'   ? 'bg-accent-light/10 border-accent-light/30 text-accent-light'
        : 'bg-navy-700 border-navy-600 text-slate-500'
      }`}>
        {typeLabel}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-900 truncate">{entry.file.name}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-slate-400">{formatBytes(entry.file.size)}</span>
          {(entry.status === 'error' || entry.status === 'unsupported') ? (
            <span className="text-xs text-red-500 truncate">{entry.error}</span>
          ) : entry.status === 'queued' ? (
            <span className="text-xs text-emerald-600">Knowledge extraction started</span>
          ) : null}
        </div>
        {entry.status === 'uploading' && (
          <div className="mt-1.5 h-1 bg-navy-600 rounded-full overflow-hidden">
            <div className="h-full bg-accent-light rounded-full transition-all duration-300" style={{ width: `${entry.progress}%` }} />
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 flex-shrink-0">
        <StatusBadge status={entry.status} />
        {entry.status === 'uploading'   && <Loader2 size={15} className="text-accent-light animate-spin" />}
        {entry.status === 'queued'      && <CheckCircle size={15} className="text-emerald-500" />}
        {entry.status === 'error'       && <XCircle size={15} className="text-red-500" />}
        {entry.status === 'unsupported' && <AlertTriangle size={15} className="text-amber-500" />}
        {entry.status === 'pending'     && <FileText size={15} className="text-slate-400" />}
        {canRemove && (entry.status === 'pending' || entry.status === 'error' || entry.status === 'unsupported') && (
          <button onClick={onRemove} className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-navy-700 transition-colors">
            <X size={13} />
          </button>
        )}
      </div>
    </div>
  );
}

export default function DocumentsPage({ onOpenChat }: Props) {
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

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
          ? `Binary files (${ext}) are not supported. Use: ${Object.keys(SUPPORTED_TYPES).join(', ')}`
          : `Unsupported type (${ext || 'unknown'}). Use: ${Object.keys(SUPPORTED_TYPES).join(', ')}`,
      };
    });
    setFiles(prev => {
      const existing = new Set(prev.map(e => `${e.file.name}|${e.file.size}`));
      return [...prev, ...entries.filter(e => !existing.has(`${e.file.name}|${e.file.size}`))];
    });
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => { e.preventDefault(); setDragging(false); addFiles(Array.from(e.dataTransfer.files)); }, [addFiles]);
  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragging(true); };
  const onDragLeave = (e: React.DragEvent) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragging(false); };
  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => { if (e.target.files) addFiles(Array.from(e.target.files)); e.target.value = ''; };
  const removeFile = (id: string) => { if (uploading) return; setFiles(prev => prev.filter(f => f.id !== id)); };
  const clearAll = () => { if (uploading) return; setFiles([]); };

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
        const content = await readFileAsText(entry.file);
        updateEntry(entry.id, { progress: 50 });
        const ext = getFileExtension(entry.file.name);
        const mimeType = SUPPORTED_TYPES[ext] ?? 'text/plain';
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

  const pendingFiles = files.filter(f => f.status === 'pending');
  const queuedFiles  = files.filter(f => f.status === 'queued');
  const hasFiles     = files.length > 0;
  const allSettled   = hasFiles && files.every(f => ['queued', 'error', 'unsupported'].includes(f.status));
  const showSuccess  = allSettled && queuedFiles.length > 0;

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
            <span className="text-slate-500">Upload Center</span>
          </div>
          <h1 className="text-sm font-semibold text-slate-900 leading-none">Knowledge Upload Center</h1>
        </div>
        <button
          onClick={onOpenChat}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-slate-500 hover:text-slate-800 hover:bg-navy-700 border border-navy-600 transition-colors"
        >
          <ArrowLeft size={13} />
          Back to Chat
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 p-6 lg:p-8 max-w-3xl mx-auto w-full space-y-5">

        {/* Upload card */}
        <div className="rounded-2xl bg-navy-800 border border-navy-600 overflow-hidden shadow-sm">
          <div className="px-6 pt-6 pb-4">
            <div className="flex items-center gap-3 mb-1">
              <CloudUpload size={20} className="text-accent-light flex-shrink-0" />
              <h2 className="text-base font-semibold text-slate-900">Upload Documents</h2>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed">
              Upload documents to build your Knowledge Brain. Extraction runs automatically in the background.
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
                dragging   ? 'border-accent-light bg-accent-light/5 scale-[1.01]'
                : uploading ? 'border-navy-600 opacity-50 cursor-not-allowed'
                : 'border-navy-600 hover:border-accent-light/50 hover:bg-navy-700/40'
              }`}
            >
              <input ref={inputRef} type="file" multiple accept=".txt,.md,.markdown,.html,.htm,.json" onChange={onInputChange} className="hidden" />
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-colors ${
                dragging ? 'bg-accent-light/15 border border-accent-light/30' : 'bg-navy-700 border border-navy-600'
              }`}>
                <Upload size={24} className={dragging ? 'text-accent-light' : 'text-slate-400'} />
              </div>
              <p className="text-base font-medium text-slate-800 mb-1">
                {dragging ? 'Release to add files' : 'Drag & drop files here'}
              </p>
              <p className="text-sm text-slate-500 mb-4">
                or <span className="text-accent-light hover:underline">browse your computer</span>
              </p>
              <div className="flex flex-wrap items-center justify-center gap-1.5">
                {Object.entries(TYPE_LABELS)
                  .filter(([ext], i, arr) => arr.findIndex(([, v]) => v === TYPE_LABELS[ext]) === i)
                  .map(([, label]) => (
                    <span key={label} className="px-2 py-0.5 rounded-md bg-navy-700 border border-navy-600 text-xs text-slate-500 font-mono">
                      .{label.toLowerCase()}
                    </span>
                  ))}
                <span className="text-xs text-slate-400 ml-1">· up to 5 MB each</span>
              </div>
            </div>
          </div>

          <div className="px-6 pb-5">
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-navy-950 border border-navy-600">
              <Activity size={14} className="text-accent-light flex-shrink-0 mt-0.5" />
              <p className="text-xs text-slate-500 leading-relaxed">
                After upload, the ingestion worker automatically runs extraction, builds the knowledge graph,
                and updates embeddings. Return to Chat and start asking questions once processing completes.
              </p>
            </div>
          </div>
        </div>

        {/* File queue */}
        {hasFiles && (
          <div className="rounded-2xl bg-navy-800 border border-navy-600 overflow-hidden animate-fade-in shadow-sm">
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
                <button onClick={clearAll} className="text-xs text-slate-400 hover:text-slate-700 transition-colors">Clear all</button>
              )}
            </div>

            <div className="p-4 space-y-2.5">
              {files.map(entry => (
                <FileRow key={entry.id} entry={entry} onRemove={() => removeFile(entry.id)} canRemove={!uploading} />
              ))}
            </div>

            {!allSettled && (
              <div className="flex items-center justify-between px-5 py-3.5 border-t border-navy-600 bg-navy-950">
                <p className="text-xs text-slate-400">
                  {pendingFiles.length} {pendingFiles.length === 1 ? 'file' : 'files'} ready to upload
                </p>
                <div className="flex items-center gap-2">
                  {!uploading && (
                    <button onClick={clearAll} className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-slate-700 hover:bg-navy-700 transition-colors">
                      Cancel
                    </button>
                  )}
                  <button
                    onClick={uploadAll}
                    disabled={pendingFiles.length === 0 || uploading}
                    className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      pendingFiles.length > 0 && !uploading
                        ? 'bg-accent text-white'
                        : 'bg-navy-700 text-slate-400 cursor-not-allowed'
                    }`}
                    style={pendingFiles.length > 0 && !uploading ? { boxShadow: '0 3px 10px rgba(239,85,32,0.30)' } : undefined}
                  >
                    {uploading ? <><Loader2 size={13} className="animate-spin" />Uploading…</>
                      : <><Upload size={13} />Upload {pendingFiles.length > 0 ? `${pendingFiles.length} ` : ''}{pendingFiles.length === 1 ? 'File' : 'Files'}</>}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Success banner */}
        {showSuccess && (
          <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-6 animate-slide-in">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center flex-shrink-0">
                <CheckCircle size={20} className="text-emerald-500" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-emerald-700 mb-1">
                  Document{queuedFiles.length > 1 ? 's' : ''} uploaded successfully.
                </h3>
                <p className="text-sm text-emerald-600/80 leading-relaxed mb-0.5">Knowledge extraction has started.</p>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Your Knowledge Brain is learning in the background. Return to Chat and ask questions about{' '}
                  {queuedFiles.length === 1 ? 'this document' : 'these documents'} after processing completes.
                </p>
              </div>
            </div>
            <div className="mt-5 flex items-center gap-3">
              <button
                onClick={onOpenChat}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-accent text-white text-sm font-semibold transition-all"
                style={{ boxShadow: '0 3px 10px rgba(239,85,32,0.30)' }}
              >
                Open Chat
                <ChevronRight size={15} />
              </button>
              <button
                onClick={() => setFiles([])}
                className="px-4 py-2 rounded-xl text-sm text-slate-500 hover:text-slate-800 hover:bg-navy-700 border border-navy-600 transition-colors"
              >
                Upload more
              </button>
            </div>
          </div>
        )}

        {/* Coming soon placeholders */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {FUTURE_SECTIONS.map(({ icon: Icon, label, desc }) => (
            <div key={label} className="rounded-xl bg-navy-800 border border-navy-600 p-4 opacity-40 select-none">
              <div className="flex items-center gap-2 mb-2">
                <Icon size={14} className="text-slate-400" />
                <p className="text-xs font-medium text-slate-500">{label}</p>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">{desc}</p>
              <p className="text-xs text-slate-400 mt-2 font-medium">Coming soon</p>
            </div>
          ))}
        </div>

        <div className="h-4" />
      </div>
    </div>
  );
}
