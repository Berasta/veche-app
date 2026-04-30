import { useState } from "react";
import { Plus } from "lucide-react";
import { EmojiPicker } from "../ui/EmojiPicker";

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
  const [showPicker, setShowPicker] = useState(false);

  return (
    <div className="flex items-center gap-1 mt-1.5 flex-wrap">
      {reactions.map((r) => (
        <button
          key={r.emoji}
          onClick={() => onToggle(r.emoji)}
          className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-xs border transition-colors ${
            r.hasMe
              ? "bg-primary/20 border-primary/40 text-primary"
              : "bg-muted/30 border-border text-muted-foreground hover:bg-muted/50 hover:text-foreground"
          }`}
        >
          <span className="text-sm leading-none">{r.emoji}</span>
          <span className="font-medium leading-none">{r.count}</span>
        </button>
      ))}

      <div className="relative">
        <button
          onClick={() => setShowPicker(!showPicker)}
          className="inline-flex items-center justify-center w-6 h-6 rounded-md text-xs border border-border text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
        >
          <Plus className="w-3 h-3" strokeWidth={2} />
        </button>

        {showPicker && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowPicker(false)} />
            <div className="absolute bottom-full left-0 mb-2 z-50">
              <EmojiPicker onSelect={(emoji) => { onToggle(emoji); setShowPicker(false); }} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
