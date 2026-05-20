export interface ReactionGroup {
  emoji: string;
  count: number;
  hasMe: boolean;
}

interface ReactionsBarProps {
  reactions: ReactionGroup[];
  onToggle: (emoji: string) => void;
  messageId: string;
}

export function ReactionsBar({ reactions, onToggle }: ReactionsBarProps) {
  if (reactions.length === 0) return null;

  return (
    <div className="flex items-center gap-1 mt-1 flex-wrap">
      {reactions.map((r) => (
        <button
          key={r.emoji}
          onClick={() => onToggle(r.emoji)}
          className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs leading-none transition-colors ${
            r.hasMe
              ? "bg-primary/15 text-primary hover:bg-primary/25"
              : "bg-foreground/5 text-muted-foreground hover:bg-foreground/10 hover:text-foreground"
          }`}
        >
          <span className="text-sm leading-none flex items-center justify-center -translate-y-px">{r.emoji}</span>
          <span className="text-[11px] font-medium leading-none tabular-nums">{r.count}</span>
        </button>
      ))}
    </div>
  );
}
