import { useState } from "react";
import { Plus } from "lucide-react";
import { EmojiPicker } from "@shared/ui/EmojiPicker";

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

const QUICK_EMOJIS = ["👍", "❤", "😄", "😢"];

export function ReactionsBar({ reactions, onToggle }: ReactionsBarProps) {
  const [showPicker, setShowPicker] = useState(false);

  const reactedSet = new Set(reactions.map((r) => r.emoji));

  return (
    <div className="flex items-center gap-0.5 mt-1 flex-wrap">
      {reactions.map((r) => (
        <button
          key={r.emoji}
          onClick={() => onToggle(r.emoji)}
          className={`inline-flex items-center gap-px px-1 py-0.5 rounded text-xs leading-none transition-colors ${
            r.hasMe
              ? "bg-primary/15 text-primary"
              : "text-muted-foreground/60 hover:text-foreground hover:bg-muted/30"
          }`}
        >
          <span className="text-sm leading-none">{r.emoji}</span>
          {r.count > 1 && (
            <span className="text-[10px] font-medium leading-none ml-px opacity-60">{r.count}</span>
          )}
        </button>
      ))}

      {/* Quick reactions */}
      {QUICK_EMOJIS.filter((e) => !reactedSet.has(e)).slice(0, 2).map((emoji) => (
        <button
          key={emoji}
          onClick={() => onToggle(emoji)}
          className="inline-flex items-center px-1 py-0.5 rounded text-xs text-muted-foreground/30 hover:text-muted-foreground hover:bg-muted/30 transition-colors"
        >
          <span className="text-sm leading-none">{emoji}</span>
        </button>
      ))}

      <div className="relative">
        <button
          onClick={() => setShowPicker(!showPicker)}
          className="inline-flex items-center justify-center w-4 h-4 rounded text-muted-foreground/30 hover:text-muted-foreground hover:bg-muted/30 transition-colors"
        >
          <Plus className="w-3 h-3" strokeWidth={2} />
        </button>

        {showPicker && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowPicker(false)} />
            <div className="absolute bottom-full left-0 mb-1 z-50">
              <EmojiPicker onSelect={(emoji) => { onToggle(emoji); setShowPicker(false); }} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
