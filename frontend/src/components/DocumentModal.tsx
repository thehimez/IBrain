import { useEffect, useState } from 'react';
import { X, Download, FileText, Calendar, HardDrive, FileType } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface FileDetail {
  id: number;
  filename: string;
  mime_type: string | null;
  size_bytes: number | null;
  uploaded_at: string | null;
  content: string | null;
  page_slug: string | null;
}

interface Props {
  fileId: number;
  onClose: () => void;
}

function formatBytes(bytes: number | null): string {
  if (bytes === null || bytes === undefined) return 'Unknown size';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string | null): string {
  if (!iso) return 'Unknown date';
  try {
    return new Date(iso).toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
  } catch {
    return iso;
  }
}

function PreviewContent({ content, mimeType }: { content: string | null; mimeType: string | null }) {
  if (content === null) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-slate-500">
        <FileText size={40} className="mb-3 opacity-40" />
        <p className="text-sm">Preview not available for this file type.</p>
      </div>
    );
  }

  const mime = mimeType ?? 'text/plain';

  if (mime === 'text/markdown') {
    return (
      <div className="prose prose-invert prose-sm max-w-none text-slate-200 leading-relaxed">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
      </div>
    );
  }

  if (mime === 'application/json') {
    let pretty = content;
    try { pretty = JSON.stringify(JSON.parse(content), null, 2); } catch { /* leave as-is */ }
    return (
      <pre className="text-xs text-slate-300 bg-navy-900 rounded-lg p-4 overflow-x-auto whitespace-pre-wrap break-all font-mono leading-relaxed">
        {pretty}
      </pre>
    );
  }

  if (mime === 'text/html') {
    return (
      <iframe
        srcDoc={content}
        sandbox="allow-same-origin"
        className="w-full h-80 rounded-lg border border-navy-600 bg-white"
        title="HTML preview"
      />
    );
  }

  // text/plain and fallback
  return (
    <pre className="text-sm text-slate-300 whitespace-pre-wrap break-words leading-relaxed font-mono">
      {content}
    </pre>
  );
}

export default function DocumentModal({ fileId, onClose }: Props) {
  const [file, setFile] = useState<FileDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`/api/files/${fileId}`)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data: FileDetail) => {
        setFile(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err instanceof Error ? err.message : 'Failed to load file');
        setLoading(false);
      });
  }, [fileId]);

  const handleDownload = () => {
    window.open(`/api/files/${fileId}/download`, '_blank');
  };

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/80 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative w-full max-w-2xl mx-4 bg-navy-800 border border-navy-600 rounded-2xl shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-navy-700 flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-accent/15 border border-accent/25 flex items-center justify-center flex-shrink-0">
              <FileText size={17} className="text-accent-light" />
            </div>
            <div className="min-w-0">
              <h2 className="font-semibold text-white text-base truncate leading-tight">
                {loading ? 'Loading…' : (file?.filename ?? 'Document')}
              </h2>
              {file && (
                <p className="text-xs text-slate-500 mt-0.5">{file.mime_type ?? 'text/plain'}</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="ml-4 text-slate-500 hover:text-white transition-colors flex-shrink-0"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Metadata row */}
        {file && (
          <div className="flex flex-wrap gap-x-6 gap-y-1 px-6 py-3 border-b border-navy-700 flex-shrink-0">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Calendar size={12} className="text-slate-500" />
              <span>Uploaded {formatDate(file.uploaded_at)}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <HardDrive size={12} className="text-slate-500" />
              <span>{formatBytes(file.size_bytes)}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <FileType size={12} className="text-slate-500" />
              <span>{file.mime_type ?? 'text/plain'}</span>
            </div>
          </div>
        )}

        {/* Preview */}
        <div className="flex-1 overflow-y-auto px-6 py-4 min-h-0">
          {loading && (
            <div className="flex items-center justify-center py-16 text-slate-500">
              <div className="w-5 h-5 border-2 border-slate-600 border-t-accent rounded-full animate-spin mr-3" />
              <span className="text-sm">Loading…</span>
            </div>
          )}
          {error && (
            <div className="text-red-400 text-sm py-8 text-center">{error}</div>
          )}
          {file && !loading && (
            <PreviewContent content={file.content} mimeType={file.mime_type} />
          )}
        </div>

        {/* Footer buttons */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-navy-700 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors"
          >
            Close
          </button>
          <button
            onClick={handleDownload}
            disabled={!file}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-accent/20 border border-accent/30 text-accent-light rounded-lg hover:bg-accent/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Download size={14} />
            Download
          </button>
        </div>
      </div>
    </div>
  );
}
