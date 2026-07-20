import React from 'react';
import { Text, View } from 'react-native';
import { Colors } from '../../constants/colors';

interface Props {
  content: string;
  dimmed?: boolean;
  textStyle?: { color?: string };
}

export default function MarkdownRenderer({ content, dimmed = false, textStyle }: Props) {
  const textColor = textStyle?.color ?? (dimmed ? Colors.text.secondary : Colors.text.primary);
  const lines = content.split('\n');

  return (
    <View style={{ gap: 4 }}>
      {parseBlocks(lines).map((block, i) => (
        <BlockRenderer key={i} block={block} textColor={textColor} />
      ))}
    </View>
  );
}

// ─── Block parsing ──────────────────────────────────────────────────────────────

type Block =
  | { type: 'paragraph'; inline: Inline[] }
  | { type: 'heading'; level: 1 | 2 | 3; inline: Inline[] }
  | { type: 'bullet'; inline: Inline[] }
  | { type: 'code'; lang: string; text: string }
  | { type: 'hr' };

type Inline =
  | { kind: 'text'; value: string }
  | { kind: 'bold'; value: string }
  | { kind: 'italic'; value: string }
  | { kind: 'code'; value: string };

function parseBlocks(lines: string[]): Block[] {
  const blocks: Block[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i]!;
    if (line.startsWith('```')) {
      const lang = line.slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i]!.startsWith('```')) { codeLines.push(lines[i]!); i++; }
      blocks.push({ type: 'code', lang, text: codeLines.join('\n') });
      i++;
      continue;
    }
    if (/^[-*_]{3,}$/.test(line.trim())) { blocks.push({ type: 'hr' }); i++; continue; }
    const hMatch = line.match(/^(#{1,3})\s+(.+)$/);
    if (hMatch) {
      blocks.push({ type: 'heading', level: Math.min(hMatch[1]!.length, 3) as 1|2|3, inline: parseInline(hMatch[2]!) });
      i++; continue;
    }
    const bMatch = line.match(/^[-*+]\s+(.+)$/);
    if (bMatch) { blocks.push({ type: 'bullet', inline: parseInline(bMatch[1]!) }); i++; continue; }
    if (line.trim() === '') { i++; continue; }
    blocks.push({ type: 'paragraph', inline: parseInline(line) });
    i++;
  }
  return blocks;
}

function parseInline(text: string): Inline[] {
  const parts: Inline[] = [];
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|`([^`]+)`)/g;
  let last = 0; let m: RegExpExecArray | null;
  while ((m = regex.exec(text)) !== null) {
    if (m.index > last) parts.push({ kind: 'text', value: text.slice(last, m.index) });
    if (m[0].startsWith('**')) parts.push({ kind: 'bold', value: m[2]! });
    else if (m[0].startsWith('*')) parts.push({ kind: 'italic', value: m[3]! });
    else parts.push({ kind: 'code', value: m[4]! });
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push({ kind: 'text', value: text.slice(last) });
  return parts;
}

// ─── Renderers ──────────────────────────────────────────────────────────────────

function InlineRenderer({ inline, color }: { inline: Inline[]; color: string }) {
  return (
    <Text>
      {inline.map((part, i) => {
        if (part.kind === 'bold')
          return <Text key={i} style={{ fontWeight: '700', color }}>{part.value}</Text>;
        if (part.kind === 'italic')
          return <Text key={i} style={{ fontStyle: 'italic', color }}>{part.value}</Text>;
        if (part.kind === 'code')
          return (
            <Text key={i} style={{ fontFamily: 'monospace', backgroundColor: Colors.accent.bg, color: Colors.accent.default, fontSize: 12 }}>
              {part.value}
            </Text>
          );
        return <Text key={i} style={{ color }}>{part.value}</Text>;
      })}
    </Text>
  );
}

function BlockRenderer({ block, textColor }: { block: Block; textColor: string }) {
  if (block.type === 'heading') {
    const size = block.level === 1 ? 18 : block.level === 2 ? 16 : 14;
    return (
      <View style={{ marginTop: block.level === 1 ? 8 : 4 }}>
        <Text style={{ fontSize: size, fontWeight: '700', color: textColor, lineHeight: size * 1.4 }}>
          <InlineRenderer inline={block.inline} color={textColor} />
        </Text>
      </View>
    );
  }
  if (block.type === 'code') {
    return (
      <View style={{ backgroundColor: Colors.bg.primary, borderRadius: 10, padding: 12, marginVertical: 4, borderWidth: 1, borderColor: Colors.border.default }}>
        {block.lang ? <Text style={{ fontSize: 10, color: Colors.text.muted, marginBottom: 6, fontFamily: 'monospace' }}>{block.lang}</Text> : null}
        <Text style={{ fontFamily: 'monospace', fontSize: 12, color: Colors.accent.default, lineHeight: 18 }}>{block.text}</Text>
      </View>
    );
  }
  if (block.type === 'hr')
    return <View style={{ height: 1, backgroundColor: Colors.border.default, marginVertical: 8 }} />;
  if (block.type === 'bullet') {
    return (
      <View style={{ flexDirection: 'row', gap: 8, paddingLeft: 4 }}>
        <View style={{ width: 5, height: 5, borderRadius: 2.5, backgroundColor: Colors.accent.default, marginTop: 8 }} />
        <Text style={{ flex: 1, color: textColor, fontSize: 14, lineHeight: 21 }}>
          <InlineRenderer inline={block.inline} color={textColor} />
        </Text>
      </View>
    );
  }
  return (
    <Text style={{ fontSize: 14, lineHeight: 22, color: textColor }}>
      <InlineRenderer inline={block.inline} color={textColor} />
    </Text>
  );
}
