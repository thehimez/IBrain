import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface Props {
  content: string;
  streaming?: boolean;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={copy}
      className="absolute top-2 right-2 p-1.5 rounded bg-navy-600 hover:bg-navy-500 text-slate-400 hover:text-white transition-colors"
      title="Copy code"
    >
      {copied ? <Check size={13} /> : <Copy size={13} />}
    </button>
  );
}

export default function MarkdownRenderer({ content, streaming }: Props) {
  return (
    <div className={`prose prose-invert prose-sm max-w-none ${streaming ? 'streaming-cursor' : ''}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ className, children, ...rest }) {
            const match = /language-(\w+)/.exec(className || '');
            const code = String(children).replace(/\n$/, '');
            if (match) {
              return (
                <div className="relative group my-3">
                  <CopyButton text={code} />
                  <SyntaxHighlighter
                    style={oneDark}
                    language={match[1]}
                    PreTag="div"
                    customStyle={{
                      margin: 0,
                      borderRadius: '8px',
                      background: '#0d1526',
                      border: '1px solid #1c2a50',
                      fontSize: '0.8rem',
                      paddingTop: '2rem',
                    }}
                    {...(rest as object)}
                  >
                    {code}
                  </SyntaxHighlighter>
                </div>
              );
            }
            return (
              <code
                className="bg-navy-700 text-accent-light px-1.5 py-0.5 rounded text-xs font-mono"
                {...rest}
              >
                {children}
              </code>
            );
          },
          p({ children }) {
            return <p className="mb-3 last:mb-0 leading-relaxed text-slate-200">{children}</p>;
          },
          ul({ children }) {
            return <ul className="list-disc list-inside mb-3 space-y-1 text-slate-200">{children}</ul>;
          },
          ol({ children }) {
            return <ol className="list-decimal list-inside mb-3 space-y-1 text-slate-200">{children}</ol>;
          },
          li({ children }) {
            return <li className="text-slate-200 leading-relaxed">{children}</li>;
          },
          h1({ children }) {
            return <h1 className="text-xl font-bold text-white mb-3 mt-4">{children}</h1>;
          },
          h2({ children }) {
            return <h2 className="text-lg font-semibold text-white mb-2 mt-4">{children}</h2>;
          },
          h3({ children }) {
            return <h3 className="text-base font-semibold text-slate-100 mb-2 mt-3">{children}</h3>;
          },
          blockquote({ children }) {
            return (
              <blockquote className="border-l-2 border-accent pl-4 my-3 text-slate-400 italic">
                {children}
              </blockquote>
            );
          },
          table({ children }) {
            return (
              <div className="overflow-x-auto my-3">
                <table className="w-full text-sm border-collapse">{children}</table>
              </div>
            );
          },
          th({ children }) {
            return (
              <th className="border border-navy-600 bg-navy-700 px-3 py-2 text-left text-slate-200 font-semibold text-xs uppercase tracking-wider">
                {children}
              </th>
            );
          },
          td({ children }) {
            return (
              <td className="border border-navy-600 px-3 py-2 text-slate-300 text-sm">
                {children}
              </td>
            );
          },
          strong({ children }) {
            return <strong className="font-semibold text-white">{children}</strong>;
          },
          a({ href, children }) {
            return (
              <a href={href} className="text-accent-light underline underline-offset-2 hover:text-white" target="_blank" rel="noopener noreferrer">
                {children}
              </a>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
