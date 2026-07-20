import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, Text, Dimensions, PanResponder } from 'react-native';
import Svg, { Line, Circle, Text as SvgText, Defs, Marker, Path, G } from 'react-native-svg';
import { Colors } from '../../constants/colors';
import type { GraphNode, GraphEdge, GraphData } from '../../types';

const NODE_COLORS: Record<string, string> = {
  page:         Colors.accent.default,
  person:       '#f59e0b',
  company:      '#10b981',
  organization: '#10b981',
  location:     '#ec4899',
  product:      '#8b5cf6',
  event:        '#ef4444',
  entity:       '#6366f1',
};

function nodeColor(n: GraphNode): string {
  if (n.type === 'page') return NODE_COLORS.page!;
  const k = (n.kind ?? n.type ?? '').toLowerCase();
  return NODE_COLORS[k] ?? NODE_COLORS.entity!;
}

function nodeRadius(n: GraphNode): number {
  return n.type === 'page' ? 20 : 14;
}

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

function tick(nodes: GraphNode[], edges: GraphEdge[], nodeMap: Map<string, GraphNode>, w: number, h: number, alpha: number) {
  const cx = w / 2, cy = h / 2;
  const k = Math.sqrt((w * h) / Math.max(nodes.length, 1));
  const repulsion = k * k * 1.6;
  const springLen = k * 1.2;

  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const a = nodes[i]!, b = nodes[j]!;
      const dx = a.x - b.x, dy = a.y - b.y;
      const d2 = dx * dx + dy * dy + 0.01;
      const d = Math.sqrt(d2);
      const f = repulsion / d2;
      a.vx += (dx / d) * f; a.vy += (dy / d) * f;
      b.vx -= (dx / d) * f; b.vy -= (dy / d) * f;
    }
  }

  for (const e of edges) {
    const s = nodeMap.get(e.source), t = nodeMap.get(e.target);
    if (!s || !t) continue;
    const dx = t.x - s.x, dy = t.y - s.y;
    const d = Math.sqrt(dx * dx + dy * dy) + 0.01;
    const f = ((d - springLen) / d) * 0.35;
    s.vx += dx * f; s.vy += dy * f;
    t.vx -= dx * f; t.vy -= dy * f;
  }

  for (const n of nodes) {
    n.vx += (cx - n.x) * 0.008 * alpha;
    n.vy += (cy - n.y) * 0.008 * alpha;
  }

  for (const n of nodes) {
    if (n.pinned) { n.vx = 0; n.vy = 0; continue; }
    n.vx *= 0.78 * alpha; n.vy *= 0.78 * alpha;
    n.x += n.vx; n.y += n.vy;
    n.x = Math.max(30, Math.min(w - 30, n.x));
    n.y = Math.max(30, Math.min(h - 30, n.y));
  }
}

interface Props {
  data: GraphData;
  onSelectNode?: (node: GraphNode | null) => void;
  selectedNodeId?: string | null;
}

export default function GraphCanvas({ data, onSelectNode, selectedNodeId }: Props) {
  const { width } = Dimensions.get('window');
  const height = 400;
  const nodesRef = useRef<GraphNode[]>([]);
  const edgesRef = useRef<GraphEdge[]>([]);
  const frameRef = useRef(0);
  const rafRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [edges, setEdges] = useState<GraphEdge[]>([]);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const lastPan = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const ns: GraphNode[] = data.nodes.map(n => ({ ...n, x: 0, y: 0, vx: 0, vy: 0 }));
    initPositions(ns, width, height);
    nodesRef.current = ns;
    edgesRef.current = data.edges;
    frameRef.current = 0;
    setNodes([...ns]);
    setEdges(data.edges);
  }, [data, width]);

  useEffect(() => {
    if (nodesRef.current.length === 0) return;
    const MAX = 180;
    rafRef.current = setInterval(() => {
      if (frameRef.current >= MAX) { clearInterval(rafRef.current!); return; }
      frameRef.current++;
      const alpha = Math.max(0.05, 1 - frameRef.current / MAX);
      const nm = new Map(nodesRef.current.map(n => [n.id, n]));
      tick(nodesRef.current, edgesRef.current, nm, width, height, alpha);
      setNodes([...nodesRef.current]);
    }, 16);
    return () => { if (rafRef.current) clearInterval(rafRef.current); };
  }, [nodes.length, edges.length, width]);

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (_, gs) => {
      lastPan.current = { x: translate.x, y: translate.y };
    },
    onPanResponderMove: (_, gs) => {
      setTranslate({ x: lastPan.current.x + gs.dx, y: lastPan.current.y + gs.dy });
    },
  });

  const handleNodePress = useCallback((node: GraphNode) => {
    onSelectNode?.(selectedNodeId === node.id ? null : node);
  }, [onSelectNode, selectedNodeId]);

  const connectedIds = selectedNodeId
    ? new Set(
        edgesRef.current
          .filter(e => e.source === selectedNodeId || e.target === selectedNodeId)
          .flatMap(e => [e.source, e.target]),
      )
    : null;

  return (
    <View style={{ width, height, backgroundColor: Colors.bg.primary, overflow: 'hidden' }}>
      <Svg width={width} height={height} {...panResponder.panHandlers}>
        <Defs>
          <Marker id="arrow" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="5" markerHeight="5" orient="auto">
            <Path d="M 0 0 L 10 5 L 0 10 z" fill="#334155" />
          </Marker>
        </Defs>
        <G translateX={translate.x} translateY={translate.y}>
          {/* Edges */}
          {edges.map(e => {
            const s = nodesRef.current.find(n => n.id === e.source);
            const t = nodesRef.current.find(n => n.id === e.target);
            if (!s || !t) return null;
            const isHighlighted = selectedNodeId && (e.source === selectedNodeId || e.target === selectedNodeId);
            const dx = t.x - s.x, dy = t.y - s.y;
            const d = Math.sqrt(dx * dx + dy * dy) + 0.01;
            const r = nodeRadius(t);
            const ex = t.x - (dx / d) * (r + 4);
            const ey = t.y - (dy / d) * (r + 4);
            return (
              <Line
                key={e.id}
                x1={s.x} y1={s.y} x2={ex} y2={ey}
                stroke={isHighlighted ? Colors.accent.light : '#1e3a5f'}
                strokeWidth={isHighlighted ? 1.8 : 1.2}
                opacity={selectedNodeId && !isHighlighted ? 0.3 : 1}
              />
            );
          })}

          {/* Nodes */}
          {nodesRef.current.map(node => {
            const color = nodeColor(node);
            const r = nodeRadius(node);
            const isSelected = node.id === selectedNodeId;
            const dim = connectedIds && !connectedIds.has(node.id);
            return (
              <G
                key={node.id}
                translateX={node.x}
                translateY={node.y}
                opacity={dim ? 0.25 : 1}
                onPress={() => handleNodePress(node)}
              >
                {isSelected && (
                  <Circle r={r + 6} fill="none" stroke={color} strokeWidth={2} opacity={0.4} />
                )}
                <Circle r={r} fill={color + '30'} stroke={color} strokeWidth={isSelected ? 2.5 : 1.5} />
                <SvgText
                  textAnchor="middle"
                  dy="4"
                  fontSize={node.type === 'page' ? 10 : 8}
                  fill={color}
                  fontWeight="600"
                >
                  {node.type === 'page' ? 'P' : node.label.charAt(0).toUpperCase()}
                </SvgText>
                <SvgText
                  textAnchor="middle"
                  dy={r + 12}
                  fontSize={9}
                  fill={isSelected ? Colors.text.primary : Colors.text.secondary}
                >
                  {node.label.length > 14 ? node.label.slice(0, 12) + '…' : node.label}
                </SvgText>
              </G>
            );
          })}
        </G>
      </Svg>
    </View>
  );
}
