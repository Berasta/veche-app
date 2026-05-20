import { useState } from "react";

const EMOJI_LISTS: Record<string, string[]> = {
  Лица: ["😀","😃","😄","😁","😆","😅","🤣","😂","🙂","😊","😇","🥰","😍","🤩","😘","😗","😚","😋","😛","😜","🤪","😝","🤑","🤗","🤭","🤔","😐","😑","😶","😏","😒","🙄","😬","🤥","😌","😔","😪","🤤","😴","😕","🙃","😢","😭","😤","😠","🤬","😈","👿","💀","💩","🤡","👹","👺","👻","👽","🤖"],
  Жесты: ["👍","👎","👊","✊","🤛","🤜","👏","🙌","👐","🤝","🤲","🤚","✋","👌","🤏","✌","🤞","🤟","🤘","🤙","👈","👉","👆","👇","☝","🖕","💪"],
  Сердца: ["❤","🧡","💛","💚","💙","💜","🖤","🤍","🤎","💕","💞","💓","💗","💖","💘","💝","💟","💔","❤️‍🔥","💌","💋"],
  Символы: ["🔥","⭐","✨","💫","🌟","💥","💯","✅","❌","❓","❗","‼","💢","💬","👀","💤","💨","💦"],
  Предметы: ["🎉","🎊","🎁","🎂","🍕","🍺","🍻","🥂","🍷","☕","🌹","🌸","🌺","🌻","🌞","🌈","⚡","🌙","☀","❄","🎵","🎶","🏆","👑","🔮","💎","🗡","🛡","⚔"],
};

const CATEGORIES = Object.keys(EMOJI_LISTS);
const CATEGORY_ICONS: Record<string, string> = {
  Лица: "😀", Жесты: "👍", Сердца: "❤", Символы: "✨", Предметы: "🎁",
};

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
}

export function EmojiPicker({ onSelect }: EmojiPickerProps) {
  const [category, setCategory] = useState(CATEGORIES[0]);
  const emojis = EMOJI_LISTS[category];

  return (
    <div
      className="w-72 rounded-2xl shadow-2xl shadow-black/30 overflow-hidden"
      style={{
        background: "color-mix(in srgb, var(--background) 60%, transparent)",
        backdropFilter: "blur(28px) saturate(180%)",
        WebkitBackdropFilter: "blur(28px) saturate(180%)",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      {/* Category tabs */}
      <div className="flex gap-0.5 p-1.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            title={cat}
            className={`flex-1 h-8 flex items-center justify-center rounded-xl text-lg transition-all ${
              category === cat
                ? "bg-foreground/10"
                : "opacity-35 hover:opacity-70 hover:bg-foreground/5"
            }`}
          >
            {CATEGORY_ICONS[cat]}
          </button>
        ))}
      </div>

      {/* Emoji grid */}
      <div className="p-2 max-h-52 overflow-y-auto grid grid-cols-8 gap-0.5">
        {emojis.map((emoji, i) => (
          <button
            key={`${emoji}-${i}`}
            onClick={() => onSelect(emoji)}
            className="w-8 h-8 flex items-center justify-center rounded-xl text-lg transition-all hover:bg-foreground/10 hover:scale-110 active:scale-95"
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}
