import React from 'react';
import { Text, View, ScrollView } from 'react-native';
import { Colors } from '../../constants/colors';

interface Props {
  content: string;
  dimmed?: boolean;
}

/**
 * Lightweight Markdown renderer for React Native.
 * Handles: bold, italic, inline code, code blocks, headings, bullet lists.
 */
export default function MarkdownRenderer({ content, dimmed = false }: Props) {
  const textColor = dimmed ? Colors.text.secondary : Colors.text.primary;
  const lines = content.split('\n');

  return (
    <View style={{ gap: 4 }}>
      {parseBlocks(lines).map((block, i) => (
        <BlockRenderer key={i} block={block} textColor={textColor} />
      ))}
    </View>
  );
}

// ─── Block parsing ─────────────────────────────────────────────────────────────

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

    // Code fence
    if (line.startsWith('```')) {
      const lang = line.slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i]!.startsWith('```')) {
        codeLines.push(lines[i]!);
        i++;
      }
      blocks.push({ type: 'code', lang, text: codeLines.join('\n') });
      i++;
      continue;
    }

    // Horizontal rule
    if (/^[-*_]{3,}$/.test(line.trim())) {
      blocks.push({ type: 'hr' });
      i++;
      continue;
    }

    // Heading
    const hMatch = line.match(/^(#{1,3})\s+(.+)$/);
    if (hMatch) {
      blocks.push({
        type: 'heading',
        level: Math.min(hMatch[1]!.length, 3) as 1 | 2 | 3,
        inline: parseInline(hMatch[2]!),
      });
      i++;
      continue;
    }

    // Bullet
    const bMatch = line.match(/^[-*+]\s+(.+)$/);
    if (bMatch) {
      blocks.push({ type: 'bullet', inline: parseInline(bMatch[1]!) });
      i++;
      continue;
    }

    // Blank line — skip
    if (line.trim() === '') {
      i++;
      continue;
    }

    // Paragraph
    blocks.push({ type: 'paragraph', inline: parseInline(line) });
    i++;
  }

  return blocks;
}

function parseInline(text: string): Inline[] {
  const parts: Inline[] = [];
  // Pattern: **bold**, *italic*, `code`
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|`([^`]+)`)/g;
  let last = 0;
  let m: RegExpExecArray | null;

  while ((m = regex.exec(text)) !== null) {
    if (m.index > last) parts.push({ kind: 'text', value: text.slice(last, m.index) });

    if (m[0].startsWith('**')) {
      parts.push({ kind: 'bold', value: m[2]! });
    } else if (m[0].startsWith('*')) {
      parts.push({ kind: 'italic', value: m[3]! });
    } else {
      parts.push({ kind: 'code', value: m[4]! });
    }

    last = m.index + m[0].length;
  }

  if (last < text.length) parts.push({ kind: 'text', value: text.slice(last) });

  return parts;
}

// ─── Renderers ─────────────────────────────────────────────────────────────────

function InlineRenderer({ inline, color }: { inline: Inline[]; color: string }) {
  return (
    <Text>
      {inline.map((part, i) => {
        if (part.kind === 'bold') {
          return <Text key={i} style={{ fontWeight: '700', color }}>{part.value}</Text>;
        }
        if (part.kind === 'italic') {
          return <Text key={i} style={{ fontStyle: 'italic', color }}>{part.value}</Text>;
        }
        if (part.kind === 'code') {
          return (
            <Text
              key={i}
              style={{
                fontFamily: 'monospace',
                backgroundColor: 'rgba(30,58,95,0.8)',
                color: Colors.accent.light,
                paddingHorizontal: 4,
                borderRadius: 3,
                fontSize: 12,
              }}
            >
              {part.value}
            </Text>
          );
        }
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
      <View
        style={{
          backgroundColor: Colors.bg.secondary,
          borderRadius: 8,
          padding: 12,
          marginVertical: 4,
          borderWidth: 1,
          borderColor: Colors.border.default,
        }}
      >
        {block.lang ? (
          <Text style={{ fontSize: 10, color: Colors.text.muted, marginBottom: 6, fontFamily: 'monospace' }}>
            {block.lang}
          </Text>
        ) : null}
        <Text
          style={{
            fontFamily: 'monospace',
            fontSize: 12,
            color: Colors.accent.light,
            lineHeight: 18,
          }}
        >
          {block.text}
        </Text>
      </View>
    );
  }

  if (block.type === 'hr') {
    return <View style={{ height: 1, backgroundColor: Colors.border.default, marginVertical: 8 }} />;
  }

  if (block.type === 'bullet') {
    return (
      <View style={{ flexDirection: 'row', gap: 6, paddingLeft: 4 }}>
        <Text style={{ color: Colors.text.secondary, lineHeight: 20 }}>•</Text>
        <Text style={{ flex: 1, color: textColor, fontSize: 14, lineHeight: 20 }}>
          <InlineRenderer inline={block.inline} color={textColor} />
        </Text>
      </View>
    );
  }

  // Paragraph
  return (
    <Text style={{ fontSize: 14, lineHeight: 22, color: textColor }}>
      <InlineRenderer inline={block.inline} color={textColor} />
    </Text>
  );
}
