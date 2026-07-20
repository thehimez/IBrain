import { useEffect, useState } from 'react';
import { FileText } from 'lucide-react';
import DocumentModal from './DocumentModal';

interface Citation {
  page_slug: string;
  citation_index: number;
}

interface SourceFile {
  id: number;
  filename: string;
  mime_type: string | null;
  page_slug: string;
}

interface Props {
  citations: Citation[];
}

export default function SourceChips({ citations }: Props) {
  const [sources, setSources] = useState<SourceFile[]>([]);
  const [selectedFileId, setSelectedFileId] = useState<number | null>(null);

  useEffect(() => {
    if (!citations || citations.length === 0) return;
    const seen = new Set<string>();
    const unique = citations.filter(c => {
      if (seen.has(c.page_slug)) return false;
      seen.add(c.page_slug);
      return true;
    });
    const fetches = unique.map(c =>
      fetch(`/api/files/by-slug?slug=${encodeURIComponent(c.page_slug)}`)
        .then(r => r.ok ? r.json() : null)
        .catch(() => null)
    );
    Promise.all(fetches).then(results => {
      const resolved: SourceFile[] = [];
      results.forEach((data, i) => {
        if (data && data.id) resolved.push({ id: data.id, filename: data.filename, mime_type: data.mime_type, page_slug: unique[i].page_slug });
      });
      setSources(resolved);
    });
  }, [citations]);

  if (sources.length === 0) return null;

  return (
    <>
      <div className="flex flex-col gap-1.5 px-1 mt-1">
        <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Sources</span>
        <div className="flex flex-wrap gap-2">
          {sources.map(src => (
            <button
              key={src.id}
              onClick={() => setSelectedFileId(src.id)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-navy-950 border border-navy-600 text-slate-600 hover:border-accent-light/40 hover:text-accent-light hover:bg-accent-light/5 transition-all text-xs group"
              title={`View ${src.filename}`}
            >
              <FileText size={11} className="text-slate-400 group-hover:text-accent-light transition-colors" />
              <span className="max-w-[180px] truncate">{src.filename}</span>
            </button>
          ))}
        </div>
      </div>
      {selectedFileId !== null && (
        <DocumentModal fileId={selectedFileId} onClose={() => setSelectedFileId(null)} />
      )}
    </>
  );
}
