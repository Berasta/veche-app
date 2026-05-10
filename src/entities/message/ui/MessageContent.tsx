import { ReactNode } from "react";

export interface MessageContentProps {
  content: string;
}

// ─── Security ────────────────────────────────────────────────────────────────

function safeHref(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return null;
    return parsed.href;
  } catch {
    return null;
  }
}

// ─── Inline renderer ─────────────────────────────────────────────────────────

// Matches (in order of precedence):
//   **bold**   *italic*   `code`   [text](url)   bare https?:// url
const INLINE_RE =
  /(\*\*(.+?)\*\*|\*(.+?)\*|`([^`]+)`|\[([^\]]+)\]\((https?:\/\/[^\)]+)\)|(https?:\/\/[^\s<>"']+[^\s<>"'.,;!?)\]]*))/g;

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let last = 0;
  INLINE_RE.lastIndex = 0;

  let m: RegExpExecArray | null;
  while ((m = INLINE_RE.exec(text)) !== null) {
    if (m.index > last) nodes.push(text.slice(last, m.index));

    const key = `${keyPrefix}-${m.index}`;
    if (m[2] !== undefined) {
      // **bold**
      nodes.push(<strong key={key} className="font-semibold">{m[2]}</strong>);
    } else if (m[3] !== undefined) {
      // *italic*
      nodes.push(<em key={key}>{m[3]}</em>);
    } else if (m[4] !== undefined) {
      // `code`
      nodes.push(
        <code key={key} className="px-1 py-0.5 rounded bg-foreground/10 text-foreground/80 text-[0.8em] font-mono">
          {m[4]}
        </code>
      );
    } else if (m[5] !== undefined && m[6] !== undefined) {
      // [text](url)
      const href = safeHref(m[6]);
      if (href) {
        nodes.push(
          <a key={key} href={href} target="_blank" rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 underline underline-offset-2 break-all">
            {m[5]}
          </a>
        );
      } else {
        nodes.push(m[0]);
      }
    } else if (m[7] !== undefined) {
      // bare url
      const href = safeHref(m[7]);
      if (href) {
        nodes.push(
          <a key={key} href={href} target="_blank" rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 underline underline-offset-2 break-all">
            {m[7]}
          </a>
        );
      } else {
        nodes.push(m[7]);
      }
    }

    last = INLINE_RE.lastIndex;
  }

  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

// ─── Block renderer ───────────────────────────────────────────────────────────

function renderContent(content: string): ReactNode[] {
  const lines = content.split("\n");
  const result: ReactNode[] = [];
  let quoteBuffer: string[] = [];

  const flushQuote = () => {
    if (quoteBuffer.length === 0) return;
    result.push(
      <blockquote
        key={`q-${result.length}`}
        className="my-0.5 pl-2.5 border-l-2 border-foreground/20 text-foreground/60 italic"
      >
        {quoteBuffer.map((l, i) => (
          <span key={i} className="block">
            {renderInline(l, `q-${result.length}-${i}`)}
          </span>
        ))}
      </blockquote>
    );
    quoteBuffer = [];
  };

  lines.forEach((line, i) => {
    if (line.startsWith("> ")) {
      quoteBuffer.push(line.slice(2));
    } else {
      flushQuote();
      result.push(
        <span key={i} className="block">
          {renderInline(line, `l-${i}`)}
        </span>
      );
    }
  });

  flushQuote();
  return result;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function MessageContent({ content }: MessageContentProps) {
  return (
    <div className="text-sm text-foreground leading-relaxed break-words">
      {renderContent(content)}
    </div>
  );
}
