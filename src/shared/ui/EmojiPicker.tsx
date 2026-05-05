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
    <div className="bg-popover border border-border rounded-xl shadow-2xl overflow-hidden w-72">
      <div className="flex border-b border-border bg-sidebar/30">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`flex-1 px-2 py-2 text-center text-sm transition-colors ${
              category === cat ? "bg-primary/10 border-b-2 border-primary" : "hover:bg-muted/50"
            }`}
            title={cat}
          >
            <span className="text-lg leading-none">{CATEGORY_ICONS[cat]}</span>
          </button>
        ))}
      </div>
      <div className="p-2 max-h-48 overflow-y-auto grid grid-cols-8 gap-0.5">
        {emojis.map((emoji, i) => (
          <button
            key={`${emoji}-${i}`}
            onClick={() => onSelect(emoji)}
            className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-muted text-lg transition-colors"
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}
