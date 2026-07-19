import { useEffect, useRef, useState, useCallback } from 'react';
import {
  Network, Search, X, FileText, Link2,
  Users, RefreshCw, Info, ChevronRight,
} from 'lucide-react';
import { apiGet } from '../services/api';

// ─── Types ─────────────────────────────────────────────────────────────────────

interface GraphNode {
  id: string;
  label: string;
  type: string;        // 'page' | 'entity' | ...
  kind?: string;       // page type, or entity kind (person/company/…)
  slug?: string;
  claim?: string;
  // simulation state
  x: number;
  y: number;
  vx: number;
  vy: number;
  pinned?: boolean;
}

interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label: string;
  context?: string;
}

interface GraphData {
  stats: { pages: number; entities: number; relationships: number };
  nodes: Omit<GraphNode, 'x' | 'y' | 'vx' | 'vy'>[];
  edges: GraphEdge[];
}

// ─── Colour palette ────────────────────────────────────────────────────────────

const NODE_COLORS: Record<string, string> = {
  page:        '#3b82f6',   // blue
  person:      '#f59e0b',   // amber
  company:     '#10b981',   // emerald
  organization:'#10b981',
  location:    '#ec4899',   // pink
  product:     '#8b5cf6',   // purple
  event:       '#ef4444',   // red
  entity:      '#6366f1',   // indigo
};

function nodeColor(n: GraphNode): string {
  if (n.type === 'page') return NODE_COLORS.page;
  const k = (n.kind ?? n.type ?? '').toLowerCase();
  return NODE_COLORS[k] ?? NODE_COLORS.entity;
}

function nodeRadius(n: GraphNode): number {
  return n.type === 'page' ? 22 : 16;
}

// ─── Force simulation helpers ──────────────────────────────────────────────────

function initPositions(nodes: GraphNode[], w: number, h: number) {
  const cx = w / 2, cy = h / 2;
  nodes.forEach((n, i) => {
    const angle = (2 * Math.PI * i) / nodes.length;
    const r = Math.min(w, h) * 0.28;
    n.x = cx + r * Math.cos(angle) + (Math.random() - 0.5) * 30;
    n.y = cy + r * Math.sin(angle) + (Math.random() - 0.5) * 30;
    n.vx = 0; n.vy = 0;
  });
}

function tick(
  nodes: GraphNode[],
  edges: GraphEdge[],
  nodeMap: Map<string, GraphNode>,
  w: number, h: number,
  alpha: number,
) {
  const cx = w / 2, cy = h / 2;
  const k = Math.sqrt((w * h) / Math.max(nodes.length, 1));
  const repulsion = k * k * 1.6;
  const springLen = k * 1.2;

  // Repulsion
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const a = nodes[i], b = nodes[j];
      const dx = a.x - b.x, dy = a.y - b.y;
      const d2 = dx * dx + dy * dy + 0.01;
      const d = Math.sqrt(d2);
      const f = repulsion / d2;
      const fx = (dx / d) * f, fy = (dy / d) * f;
      a.vx += fx; a.vy += fy;
      b.vx -= fx; b.vy -= fy;
    }
  }

  // Spring attraction along edges
  for (const e of edges) {
    const s = nodeMap.get(e.source), t = nodeMap.get(e.target);
    if (!s || !t) continue;
    const dx = t.x - s.x, dy = t.y - s.y;
    const d = Math.sqrt(dx * dx + dy * dy) + 0.01;
    const f = ((d - springLen) / d) * 0.35;
    const fx = dx * f, fy = dy * f;
    s.vx += fx; s.vy += fy;
    t.vx -= fx; t.vy -= fy;
  }

  // Gravity toward center
  for (const n of nodes) {
    n.vx += (cx - n.x) * 0.008 * alpha;
    n.vy += (cy - n.y) * 0.008 * alpha;
  }

  // Integrate + damp + clamp
  for (const n of nodes) {
    if (n.pinned) { n.vx = 0; n.vy = 0; continue; }
    n.vx *= 0.78 * alpha; n.vy *= 0.78 * alpha;
    n.x += n.vx; n.y += n.vy;
    n.x = Math.max(30, Math.min(w - 30, n.x));
    n.y = Math.max(30, Math.min(h - 30, n.y));
  }
}

// ─── Component ─────────────────────────────────────────────────────────────────

export default function KnowledgeGraphPage() {
  const [data, setData] = useState<GraphData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [edges, setEdges] = useState<GraphEdge[]>([]);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });

  const svgRef = useRef<SVGSVGElement>(null);
  const rafRef = useRef<number>(0);
  const nodesRef = useRef<GraphNode[]>([]);
  const edgesRef = useRef<GraphEdge[]>([]);
  const frameRef = useRef(0);
  const draggingRef = useRef<{ nodeId: string; ox: number; oy: number } | null>(null);
  const panRef = useRef<{ startX: number; startY: number; tx: number; ty: number } | null>(null);

  const loadGraph = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const gd = await apiGet<GraphData>('/graph');
      setData(gd);
      const svgEl = svgRef.current;
      const w = svgEl?.clientWidth ?? 800;
      const h = svgEl?.clientHeight ?? 600;
      const ns: GraphNode[] = gd.nodes.map(n => ({ ...n, x: 0, y: 0, vx: 0, vy: 0 }));
      initPositions(ns, w, h);
      nodesRef.current = ns;
      edgesRef.current = gd.edges;
      frameRef.current = 0;
      setNodes([...ns]);
      setEdges(gd.edges);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadGraph(); }, [loadGraph]);

  // Run simulation
  useEffect(() => {
    if (nodesRef.current.length === 0) return;
    const MAX_FRAMES = 200;

    const step = () => {
      if (frameRef.current >= MAX_FRAMES) return;
      frameRef.current++;
      const alpha = Math.max(0.05, 1 - frameRef.current / MAX_FRAMES);
      const svgEl = svgRef.current;
      const w = svgEl?.clientWidth ?? 800;
      const h = svgEl?.clientHeight ?? 600;
      const nm = new Map(nodesRef.current.map(n => [n.id, n]));
      tick(nodesRef.current, edgesRef.current, nm, w, h, alpha);
      setNodes([...nodesRef.current]);
      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [nodes.length, edges.length]); // restart sim when graph changes

  // Filtered node ids for search/type filter
  const visibleIds = new Set(
    nodesRef.current
      .filter(n => {
        const matchType = typeFilter === 'all' || n.type === typeFilter || n.kind === typeFilter;
        const matchSearch = !search || n.label.toLowerCase().includes(search.toLowerCase());
        return matchType && matchSearch;
      })
      .map(n => n.id)
  );

  // Unique type list for filter dropdown
  const typeOptions = ['all', ...Array.from(new Set(nodesRef.current.map(n => n.type === 'page' ? 'page' : (n.kind ?? n.type))))];

  // Connected nodes for selected node side-panel
  const connectedEdges = selectedNode
    ? edges.filter(e => e.source === selectedNode.id || e.target === selectedNode.id)
    : [];
  const connectedNodeIds = new Set(connectedEdges.flatMap(e => [e.source, e.target]).filter(id => id !== selectedNode?.id));
  const connectedNodes = nodesRef.current.filter(n => connectedNodeIds.has(n.id));

  // ── SVG interaction ────────────────────────────────────────────────────────

  function svgPoint(evt: React.MouseEvent) {
    const rect = svgRef.current!.getBoundingClientRect();
    return {
      x: (evt.clientX - rect.left - transform.x) / transform.scale,
      y: (evt.clientY - rect.top - transform.y) / transform.scale,
    };
  }

  function handleSvgMouseDown(evt: React.MouseEvent<SVGSVGElement>) {
    // Pan start (only if clicking empty space — node mousedown stops propagation)
    panRef.current = { startX: evt.clientX, startY: evt.clientY, tx: transform.x, ty: transform.y };
  }

  function handleSvgMouseMove(evt: React.MouseEvent<SVGSVGElement>) {
    if (draggingRef.current) {
      const pt = svgPoint(evt);
      const n = nodesRef.current.find(n => n.id === draggingRef.current!.nodeId);
      if (n) { n.x = pt.x; n.y = pt.y; n.vx = 0; n.vy = 0; n.pinned = true; setNodes([...nodesRef.current]); }
      return;
    }
    if (panRef.current) {
      const dx = evt.clientX - panRef.current.startX;
      const dy = evt.clientY - panRef.current.startY;
      setTransform(t => ({ ...t, x: panRef.current!.tx + dx, y: panRef.current!.ty + dy }));
    }
  }

  function handleSvgMouseUp() {
    draggingRef.current = null;
    panRef.current = null;
  }

  function handleNodeMouseDown(evt: React.MouseEvent<Element>, nodeId: string) {
    evt.stopPropagation();
    const pt = svgPoint(evt);
    const n = nodesRef.current.find(n => n.id === nodeId);
    if (n) draggingRef.current = { nodeId, ox: pt.x - n.x, oy: pt.y - n.y };
  }

  function handleNodeClick(evt: React.MouseEvent<Element>, node: GraphNode) {
    evt.stopPropagation();
    setSelectedNode(s => s?.id === node.id ? null : node);
  }

  function handleSvgClick() {
    setSelectedNode(null);
  }

  function handleWheel(evt: React.WheelEvent<SVGSVGElement>) {
    evt.preventDefault();
    const factor = evt.deltaY < 0 ? 1.12 : 0.89;
    const rect = svgRef.current!.getBoundingClientRect();
    const mx = evt.clientX - rect.left;
    const my = evt.clientY - rect.top;
    setTransform(t => {
      const ns = Math.max(0.2, Math.min(4, t.scale * factor));
      return { scale: ns, x: mx - (mx - t.x) * (ns / t.scale), y: my - (my - t.y) * (ns / t.scale) };
    });
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Loading knowledge graph…</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center text-red-400">
          <p className="font-medium mb-2">Failed to load graph</p>
          <p className="text-sm text-slate-500">{error}</p>
          <button onClick={loadGraph} className="mt-4 px-4 py-2 rounded-lg bg-navy-700 text-slate-300 hover:text-white text-sm transition-colors">
            Retry
          </button>
        </div>
      </div>
    );
  }

  const isEmpty = nodes.length === 0;

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-navy-900">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-navy-700 px-6 py-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-accent/15 border border-accent/30 flex items-center justify-center">
              <Network size={16} className="text-accent-light" />
            </div>
            <div>
              <h1 className="text-base font-semibold text-white">Knowledge Graph</h1>
              <p className="text-xs text-slate-500">Your private knowledge network</p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4">
            <Stat icon={<FileText size={13} />} label="Pages" value={data?.stats.pages ?? 0} color="blue" />
            <Stat icon={<Users size={13} />} label="Entities" value={data?.stats.entities ?? 0} color="amber" />
            <Stat icon={<Link2 size={13} />} label="Relationships" value={data?.stats.relationships ?? 0} color="emerald" />
            <button onClick={loadGraph} className="p-2 rounded-lg hover:bg-navy-700 text-slate-500 hover:text-slate-300 transition-colors" title="Refresh">
              <RefreshCw size={14} />
            </button>
          </div>
        </div>

        {/* Controls */}
        {!isEmpty && (
          <div className="flex items-center gap-3 mt-3">
            <div className="relative flex-1 max-w-xs">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search nodes…"
                className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-navy-800 border border-navy-600 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-accent/50"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400">
                  <X size={12} />
                </button>
              )}
            </div>
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-navy-800 border border-navy-600 text-sm text-slate-300 focus:outline-none focus:border-accent/50"
            >
              {typeOptions.map(t => (
                <option key={t} value={t}>{t === 'all' ? 'All types' : t.charAt(0).toUpperCase() + t.slice(1)}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Main area */}
      <div className="flex flex-1 min-h-0">
        {/* Graph canvas */}
        <div className="flex-1 relative min-w-0">
          {isEmpty ? (
            <EmptyState />
          ) : (
            <svg
              ref={svgRef}
              className="w-full h-full cursor-grab active:cursor-grabbing select-none"
              onMouseDown={handleSvgMouseDown}
              onMouseMove={handleSvgMouseMove}
              onMouseUp={handleSvgMouseUp}
              onMouseLeave={handleSvgMouseUp}
              onClick={handleSvgClick}
              onWheel={handleWheel}
            >
              <defs>
                <marker id="arrow" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#334155" />
                </marker>
              </defs>
              <g transform={`translate(${transform.x},${transform.y}) scale(${transform.scale})`}>
                {/* Edges */}
                {edges.map(e => {
                  const s = nodesRef.current.find(n => n.id === e.source);
                  const t = nodesRef.current.find(n => n.id === e.target);
                  if (!s || !t) return null;
                  const bothVisible = visibleIds.has(s.id) && visibleIds.has(t.id);
                  const isHighlighted = selectedNode && (e.source === selectedNode.id || e.target === selectedNode.id);
                  if (!bothVisible && !isHighlighted) return null;
                  const dx = t.x - s.x, dy = t.y - s.y;
                  const d = Math.sqrt(dx * dx + dy * dy) + 0.01;
                  const r = nodeRadius(t);
                  const ex = t.x - (dx / d) * (r + 4);
                  const ey = t.y - (dy / d) * (r + 4);
                  const mx = (s.x + ex) / 2, my = (s.y + ey) / 2;
                  return (
                    <g key={e.id} opacity={bothVisible ? 1 : 0.3}>
                      <line
                        x1={s.x} y1={s.y} x2={ex} y2={ey}
                        stroke={isHighlighted ? '#60a5fa' : '#1e3a5f'}
                        strokeWidth={isHighlighted ? 1.8 : 1.2}
                        markerEnd="url(#arrow)"
                      />
                      <text x={mx} y={my - 4} textAnchor="middle" fontSize={9} fill="#475569" className="pointer-events-none">
                        {e.label}
                      </text>
                    </g>
                  );
                })}

                {/* Nodes */}
                {nodesRef.current.map(node => {
                  const visible = visibleIds.has(node.id);
                  const isSelected = selectedNode?.id === node.id;
                  const isConnected = connectedNodeIds.has(node.id);
                  const dim = selectedNode && !isSelected && !isConnected;
                  const r = nodeRadius(node);
                  const color = nodeColor(node);
                  return (
                    <g
                      key={node.id}
                      transform={`translate(${node.x},${node.y})`}
                      opacity={!visible ? 0.15 : dim ? 0.25 : 1}
                      style={{ cursor: 'pointer' }}
                      onMouseDown={evt => handleNodeMouseDown(evt, node.id)}
                      onClick={evt => handleNodeClick(evt, node)}
                    >
                      {/* Glow ring for selected */}
                      {isSelected && (
                        <circle r={r + 6} fill="none" stroke={color} strokeWidth={2} opacity={0.4} />
                      )}
                      {isConnected && !isSelected && (
                        <circle r={r + 4} fill="none" stroke={color} strokeWidth={1} opacity={0.3} />
                      )}
                      <circle
                        r={r}
                        fill={color}
                        fillOpacity={0.18}
                        stroke={color}
                        strokeWidth={isSelected ? 2.5 : 1.5}
                      />
                      {/* Icon letter */}
                      <text
                        textAnchor="middle" dominantBaseline="central"
                        fontSize={node.type === 'page' ? 11 : 9}
                        fill={color}
                        fontWeight="600"
                        className="pointer-events-none"
                      >
                        {node.type === 'page' ? '📄' : node.label.charAt(0).toUpperCase()}
                      </text>
                      {/* Label below */}
                      <text
                        y={r + 11}
                        textAnchor="middle"
                        fontSize={10}
                        fill={isSelected ? '#e2e8f0' : '#94a3b8'}
                        fontWeight={isSelected ? '600' : '400'}
                        className="pointer-events-none"
                        style={{ textShadow: '0 1px 3px #0f172a' }}
                      >
                        {node.label.length > 18 ? node.label.slice(0, 16) + '…' : node.label}
                      </text>
                    </g>
                  );
                })}
              </g>
            </svg>
          )}

          {/* Zoom hint */}
          {!isEmpty && (
            <div className="absolute bottom-3 left-3 text-xs text-slate-700 pointer-events-none">
              Scroll to zoom · Drag to pan · Click node to inspect
            </div>
          )}

          {/* Zoom controls */}
          {!isEmpty && (
            <div className="absolute bottom-3 right-3 flex flex-col gap-1">
              <button onClick={() => setTransform(t => ({ ...t, scale: Math.min(4, t.scale * 1.2) }))}
                className="w-7 h-7 rounded bg-navy-800 border border-navy-600 text-slate-400 hover:text-white flex items-center justify-center text-sm transition-colors">+</button>
              <button onClick={() => setTransform(t => ({ ...t, scale: Math.max(0.2, t.scale / 1.2) }))}
                className="w-7 h-7 rounded bg-navy-800 border border-navy-600 text-slate-400 hover:text-white flex items-center justify-center text-sm transition-colors">−</button>
              <button onClick={() => setTransform({ x: 0, y: 0, scale: 1 })}
                className="w-7 h-7 rounded bg-navy-800 border border-navy-600 text-slate-400 hover:text-white flex items-center justify-center transition-colors" title="Reset view">
                <RefreshCw size={11} />
              </button>
            </div>
          )}
        </div>

        {/* Side panel — node detail */}
        {selectedNode && (
          <aside className="w-72 flex-shrink-0 border-l border-navy-700 bg-navy-800/50 flex flex-col overflow-y-auto">
            <div className="flex items-center justify-between px-4 py-3 border-b border-navy-700">
              <span className="text-sm font-semibold text-white">Node Details</span>
              <button onClick={() => setSelectedNode(null)} className="p-1 rounded hover:bg-navy-700 text-slate-500 hover:text-white transition-colors">
                <X size={14} />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* Node header */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 border"
                  style={{ background: nodeColor(selectedNode) + '22', borderColor: nodeColor(selectedNode) + '44' }}>
                  <span style={{ color: nodeColor(selectedNode) }} className="text-sm font-bold">
                    {selectedNode.type === 'page' ? <FileText size={16} /> : selectedNode.label.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white break-words">{selectedNode.label}</p>
                  <p className="text-xs text-slate-500 mt-0.5 capitalize">{selectedNode.kind ?? selectedNode.type}</p>
                </div>
              </div>

              {/* Slug */}
              {selectedNode.slug && (
                <div>
                  <p className="text-xs text-slate-600 uppercase tracking-wider mb-1">Source document</p>
                  <p className="text-xs text-accent-light font-mono break-all">{selectedNode.slug}</p>
                </div>
              )}

              {/* Claim */}
              {selectedNode.claim && (
                <div>
                  <p className="text-xs text-slate-600 uppercase tracking-wider mb-1">Claim</p>
                  <p className="text-xs text-slate-300 leading-relaxed">{selectedNode.claim}</p>
                </div>
              )}

              {/* Relationships */}
              <div>
                <p className="text-xs text-slate-600 uppercase tracking-wider mb-2">
                  Relationships ({connectedEdges.length})
                </p>
                {connectedEdges.length === 0 ? (
                  <p className="text-xs text-slate-600">No connections yet.</p>
                ) : (
                  <div className="space-y-2">
                    {connectedEdges.map(e => {
                      const other = nodesRef.current.find(n => n.id === (e.source === selectedNode.id ? e.target : e.source));
                      const isOut = e.source === selectedNode.id;
                      return (
                        <button
                          key={e.id}
                          onClick={() => other && setSelectedNode(other)}
                          className="w-full text-left flex items-center gap-2 px-2.5 py-2 rounded-lg bg-navy-700/60 hover:bg-navy-700 transition-colors group"
                        >
                          <div className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center"
                            style={{ background: other ? nodeColor(other) + '33' : '#334155' }}>
                            <span className="text-xs" style={{ color: other ? nodeColor(other) : '#64748b' }}>
                              {other?.label.charAt(0).toUpperCase() ?? '?'}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-slate-300 group-hover:text-white truncate">
                              {isOut ? '→' : '←'} {other?.label ?? e.target}
                            </p>
                            <p className="text-xs text-slate-600 truncate">{e.label}</p>
                          </div>
                          <ChevronRight size={11} className="text-slate-700 group-hover:text-slate-500 flex-shrink-0" />
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Connected nodes */}
              {connectedNodes.length > 0 && (
                <div>
                  <p className="text-xs text-slate-600 uppercase tracking-wider mb-2">Connected nodes</p>
                  <div className="flex flex-wrap gap-1.5">
                    {connectedNodes.map(n => (
                      <button
                        key={n.id}
                        onClick={() => setSelectedNode(n)}
                        className="px-2 py-0.5 rounded-full text-xs border transition-colors hover:opacity-80"
                        style={{ borderColor: nodeColor(n) + '55', color: nodeColor(n), background: nodeColor(n) + '15' }}
                      >
                        {n.label.length > 14 ? n.label.slice(0, 12) + '…' : n.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function Stat({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
  const colorMap: Record<string, string> = {
    blue:    'text-blue-400 bg-blue-900/20 border-blue-800/40',
    amber:   'text-amber-400 bg-amber-900/20 border-amber-800/40',
    emerald: 'text-emerald-400 bg-emerald-900/20 border-emerald-800/40',
  };
  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs ${colorMap[color]}`}>
      {icon}
      <span className="font-semibold">{value}</span>
      <span className="text-slate-500">{label}</span>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex-1 flex items-center justify-center p-8 h-full">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 rounded-2xl bg-navy-800 border border-navy-600 flex items-center justify-center mx-auto mb-4">
          <Network size={28} className="text-slate-600" />
        </div>
        <h3 className="text-base font-semibold text-slate-300 mb-2">No graph data yet</h3>
        <p className="text-sm text-slate-500 leading-relaxed mb-4">
          Upload documents and XandaCross will extract entities and relationships to populate your knowledge graph.
        </p>
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-navy-800/60 border border-navy-700 text-left">
          <Info size={13} className="text-accent-light flex-shrink-0" />
          <p className="text-xs text-slate-400">
            Entity extraction runs automatically in the background after each upload.
          </p>
        </div>
      </div>
    </div>
  );
}
