import React from 'react';
import { ExternalLink, Copy, Check } from 'lucide-react';

// ── Inline code highlight map ────────────────────────────────
const KEYWORD_CLASS = 'text-blue-400';
const STRING_CLASS = 'text-green-400';
const COMMENT_CLASS = 'text-gray-500 italic';
const NUMBER_CLASS = 'text-yellow-400';
const FUNC_CLASS = 'text-purple-400';

function highlightCode(code: string, lang: string): React.ReactNode[] {
  // Very lightweight syntax highlighting via regex
  const lines = code.split('\n');
  return lines.map((line, i) => (
    <div key={i} className="table-row">
      <span className="table-cell pr-4 text-right text-gray-600 select-none text-xs w-8 shrink-0">
        {i + 1}
      </span>
      <span className="table-cell whitespace-pre-wrap break-all">{highlightLine(line, lang)}</span>
    </div>
  ));
}

function highlightLine(line: string, lang: string): React.ReactNode {
  // Simple pass-through with basic highlights
  const lower = lang.toLowerCase();

  if (['js', 'javascript', 'ts', 'typescript', 'jsx', 'tsx'].includes(lower)) {
    return applyJsHighlight(line);
  }
  if (['python', 'py'].includes(lower)) {
    return applyPythonHighlight(line);
  }
  return <span>{line}</span>;
}

function applyJsHighlight(line: string): React.ReactNode {
  // Very simplified JS highlight
  const keywords = /\b(const|let|var|function|return|if|else|for|while|class|import|export|from|async|await|new|this|typeof|instanceof|true|false|null|undefined|=>)\b/g;
  const strings = /("[^"]*"|'[^']*'|`[^`]*`)/g;
  const comments = /(\/\/.*$)/;
  const numbers = /\b(\d+\.?\d*)\b/g;

  // Simple approach: just render as styled text
  return <span dangerouslySetInnerHTML={{ __html: escapeAndStyle(line, 'js') }} />;
}

function applyPythonHighlight(line: string): React.ReactNode {
  return <span dangerouslySetInnerHTML={{ __html: escapeAndStyle(line, 'python') }} />;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function escapeAndStyle(line: string, lang: string): string {
  const escaped = escapeHtml(line);
  let result = escaped;

  // Comments
  if (lang === 'python') {
    result = result.replace(/(#.*)$/gm, `<span class="${COMMENT_CLASS}">$1</span>`);
  } else {
    result = result.replace(/(\/\/.*)$/gm, `<span class="${COMMENT_CLASS}">$1</span>`);
  }

  // Strings
  result = result.replace(/(&quot;[^&]*&quot;|&#x27;[^&]*&#x27;)/g, `<span class="${STRING_CLASS}">$1</span>`);

  // Numbers
  result = result.replace(/\b(\d+\.?\d*)\b/g, `<span class="${NUMBER_CLASS}">$1</span>`);

  // Keywords
  const jsKws = 'const|let|var|function|return|if|else|for|while|class|import|export|from|async|await|new|this|typeof|instanceof|true|false|null|undefined';
  const pyKws = 'def|class|return|if|elif|else|for|while|import|from|as|with|try|except|finally|True|False|None|in|not|and|or|lambda|yield|pass|break|continue|raise';
  const kws = lang === 'python' ? pyKws : jsKws;
  result = result.replace(
    new RegExp(`\\b(${kws})\\b`, 'g'),
    `<span class="${KEYWORD_CLASS}">$1</span>`
  );

  return result;
}

// ── Code Block with Copy Button ──────────────────────────────

function CodeBlock({ code, lang }: { code: string; lang: string }) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="my-3 rounded-xl overflow-hidden border border-gray-700 bg-[#1A1F2E]">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#0F1420] border-b border-gray-700">
        <span className="text-xs font-mono text-gray-400 uppercase tracking-wider">
          {lang || 'code'}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors px-2 py-1 rounded-lg hover:bg-white/10"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-green-400" />
              <span className="text-green-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code body */}
      <pre className="p-4 overflow-x-auto text-sm font-mono text-gray-100 leading-relaxed">
        <div className="table w-full">
          {highlightCode(code, lang)}
        </div>
      </pre>
    </div>
  );
}

// ── Inline styling helpers ────────────────────────────────────

function parseBoldItalic(text: string): React.ReactNode[] {
  // Bold+italic: ***text***, Bold: **text**, Italic: *text*, Inline code: `code`
  const parts = text.split(/(\*\*\*[^*]+\*\*\*|\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\(https?:\/\/[^\s)]+\))/g);

  return parts.map((part, i) => {
    if (/^\*\*\*/.test(part)) {
      return <strong key={i} className="font-extrabold italic">{part.slice(3, -3)}</strong>;
    }
    if (/^\*\*/.test(part)) {
      return <strong key={i} className="font-bold text-gray-900">{part.slice(2, -2)}</strong>;
    }
    if (/^\*[^*]/.test(part)) {
      return <em key={i}>{part.slice(1, -1)}</em>;
    }
    if (/^`/.test(part)) {
      return (
        <code key={i} className="px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-mono text-sm border border-indigo-100">
          {part.slice(1, -1)}
        </code>
      );
    }
    // Markdown link [text](url)
    const linkMatch = part.match(/^\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)$/);
    if (linkMatch) {
      return (
        <a
          key={i}
          href={linkMatch[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-semibold underline decoration-indigo-300 hover:decoration-indigo-600"
        >
          {linkMatch[1]}
          <ExternalLink className="w-3 h-3 shrink-0" />
        </a>
      );
    }
    return part;
  });
}

// ── Main Renderer ─────────────────────────────────────────────

interface MarkdownRendererProps {
  text: string;
  className?: string;
}

export function MarkdownRenderer({ text, className = '' }: MarkdownRendererProps) {
  const nodes: React.ReactNode[] = [];
  const lines = text.split('\n');
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // ── Fenced code block (``` ... ```) ───────────────────
    if (trimmed.startsWith('```')) {
      const lang = trimmed.slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // skip closing ```
      nodes.push(<CodeBlock key={`code-${i}`} code={codeLines.join('\n')} lang={lang} />);
      continue;
    }

    // ── HR (--- or ***) ────────────────────────────────────
    if (/^[-*]{3,}$/.test(trimmed)) {
      nodes.push(<hr key={`hr-${i}`} className="my-4 border-gray-200" />);
      i++;
      continue;
    }

    // ── H1 ─────────────────────────────────────────────────
    if (trimmed.startsWith('# ') && !trimmed.startsWith('## ')) {
      nodes.push(
        <h1 key={`h1-${i}`} className="text-2xl font-black text-[#0F2B5B] mt-4 mb-2">
          {parseBoldItalic(trimmed.slice(2))}
        </h1>
      );
      i++;
      continue;
    }

    // ── H2 ─────────────────────────────────────────────────
    if (trimmed.startsWith('## ') && !trimmed.startsWith('### ')) {
      nodes.push(
        <h2 key={`h2-${i}`} className="text-xl font-black text-[#0F2B5B] mt-4 mb-2 pb-1 border-b border-gray-200">
          {parseBoldItalic(trimmed.slice(3))}
        </h2>
      );
      i++;
      continue;
    }

    // ── H3 ─────────────────────────────────────────────────
    if (trimmed.startsWith('### ') && !trimmed.startsWith('#### ')) {
      nodes.push(
        <h3 key={`h3-${i}`} className="text-lg font-extrabold text-gray-900 mt-3 mb-1.5 flex items-center gap-2">
          {parseBoldItalic(trimmed.slice(4))}
        </h3>
      );
      i++;
      continue;
    }

    // ── H4 ─────────────────────────────────────────────────
    if (trimmed.startsWith('#### ')) {
      nodes.push(
        <h4 key={`h4-${i}`} className="text-base font-extrabold text-indigo-800 mt-2 mb-1">
          {parseBoldItalic(trimmed.slice(5))}
        </h4>
      );
      i++;
      continue;
    }

    // ── Table ──────────────────────────────────────────────
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        tableLines.push(lines[i]);
        i++;
      }
      const headers = tableLines[0].split('|').filter(Boolean).map((h) => h.trim());
      const rows = tableLines
        .slice(2) // skip separator line
        .map((row) => row.split('|').filter(Boolean).map((c) => c.trim()));

      nodes.push(
        <div key={`table-${i}`} className="my-3 overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#EFF6FF]">
                {headers.map((h, hi) => (
                  <th key={hi} className="px-4 py-2.5 text-left font-extrabold text-[#0F2B5B] border-b border-gray-200 whitespace-nowrap">
                    {parseBoldItalic(h)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, ri) => (
                <tr key={ri} className={ri % 2 === 0 ? 'bg-white' : 'bg-gray-50/60'}>
                  {row.map((cell, ci) => (
                    <td key={ci} className="px-4 py-2 text-gray-700 border-b border-gray-100">
                      {parseBoldItalic(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      continue;
    }

    // ── Numbered list ──────────────────────────────────────
    if (/^\d+\.\s/.test(trimmed)) {
      const listItems: string[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i].trim())) {
        const match = lines[i].trim().match(/^\d+\.\s+(.*)/);
        if (match) listItems.push(match[1]);
        i++;
      }
      nodes.push(
        <ol key={`ol-${i}`} className="my-2 ml-2 space-y-1.5 list-none">
          {listItems.map((item, li) => (
            <li key={li} className="flex items-start gap-2.5">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-extrabold flex items-center justify-center mt-0.5">
                {li + 1}
              </span>
              <span className="text-sm text-gray-800 leading-relaxed pt-0.5">{parseBoldItalic(item)}</span>
            </li>
          ))}
        </ol>
      );
      continue;
    }

    // ── Bullet list (- or *) ───────────────────────────────
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const listItems: string[] = [];
      while (i < lines.length && (lines[i].trim().startsWith('- ') || lines[i].trim().startsWith('* '))) {
        listItems.push(lines[i].trim().slice(2));
        i++;
      }
      nodes.push(
        <ul key={`ul-${i}`} className="my-2 ml-1 space-y-1.5 list-none">
          {listItems.map((item, li) => (
            <li key={li} className="flex items-start gap-2.5">
              <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2" />
              <span className="text-sm text-gray-800 leading-relaxed">{parseBoldItalic(item)}</span>
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // ── Blockquote ─────────────────────────────────────────
    if (trimmed.startsWith('> ')) {
      nodes.push(
        <blockquote key={`bq-${i}`} className="my-2 pl-4 border-l-4 border-indigo-400 text-gray-600 italic text-sm">
          {parseBoldItalic(trimmed.slice(2))}
        </blockquote>
      );
      i++;
      continue;
    }

    // ── Empty line ─────────────────────────────────────────
    if (!trimmed) {
      nodes.push(<div key={`br-${i}`} className="h-1.5" />);
      i++;
      continue;
    }

    // ── Regular paragraph ──────────────────────────────────
    nodes.push(
      <p key={`p-${i}`} className="text-sm text-gray-800 leading-relaxed my-0.5">
        {parseBoldItalic(trimmed)}
      </p>
    );
    i++;
  }

  return <div className={`space-y-0.5 ${className}`}>{nodes}</div>;
}
