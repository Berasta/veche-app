import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Portal } from "./Portal";

const EMOJI_DATA: Record<string, { emoji: string; name: string }[]> = {
  Лица: [
    { emoji: "😀", name: "улыбка" }, { emoji: "😃", name: "радость" }, { emoji: "😄", name: "смех" },
    { emoji: "😁", name: "сияние" }, { emoji: "😆", name: "хохот" }, { emoji: "😅", name: "пот" },
    { emoji: "🤣", name: "валяюсь" }, { emoji: "😂", name: "слезы" }, { emoji: "🙂", name: "легко" },
    { emoji: "😊", name: "стеснение" }, { emoji: "😇", name: "ангел" }, { emoji: "🥰", name: "влюблен" },
    { emoji: "😍", name: "сердца" }, { emoji: "🤩", name: "звезды" }, { emoji: "😘", name: "воздух" },
    { emoji: "😗", name: "чмок" }, { emoji: "😚", name: "закрыто" }, { emoji: "😋", name: "вкусно" },
    { emoji: "😛", name: "язык" }, { emoji: "😜", name: "подмиг" }, { emoji: "🤪", name: "безумец" },
    { emoji: "😝", name: "глаза" }, { emoji: "🤑", name: "деньги" }, { emoji: "🤗", name: "объятья" },
    { emoji: "🤭", name: "ой" }, { emoji: "🤔", name: "хмм" }, { emoji: "😐", name: "нейтр" },
    { emoji: "😑", name: "безэм" }, { emoji: "😶", name: "тихо" }, { emoji: "😏", name: "ухмыл" },
    { emoji: "😒", name: "недов" }, { emoji: "🙄", name: "закат" }, { emoji: "😬", name: "нелов" },
    { emoji: "🤥", name: "пинок" }, { emoji: "😌", name: "облегч" }, { emoji: "😔", name: "грусть" },
    { emoji: "😪", name: "соня" }, { emoji: "🤤", name: "течет" }, { emoji: "😴", name: "сплю" },
    { emoji: "😕", name: "растер" }, { emoji: "🙃", name: "вверх" }, { emoji: "😢", name: "слезка" },
    { emoji: "😭", name: "рыдаю" }, { emoji: "😤", name: "пар" }, { emoji: "😠", name: "злость" },
    { emoji: "🤬", name: "мат" }, { emoji: "😈", name: "рожки" }, { emoji: "👿", name: "зло" },
    { emoji: "💀", name: "череп" }, { emoji: "☠️", name: "пират" }, { emoji: "💩", name: "кака" },
    { emoji: "🤡", name: "клоун" }, { emoji: "👹", name: "монстр" }, { emoji: "👺", name: "нос" },
    { emoji: "👻", name: "призр" }, { emoji: "👽", name: "инопл" }, { emoji: "🤖", name: "робот" },
  ],
  Жесты: [
    { emoji: "👍", name: "палец вверх" }, { emoji: "👎", name: "палец вниз" }, { emoji: "👊", name: "кулак" },
    { emoji: "✊", name: "поднят" }, { emoji: "🤛", name: "влево" }, { emoji: "🤜", name: "вправо" },
    { emoji: "👏", name: "хлоп" }, { emoji: "🙌", name: "вверх" }, { emoji: "👐", name: "откр" },
    { emoji: "🤝", name: "рукоп" }, { emoji: "🤲", name: "ладони" }, { emoji: "🤚", name: "стоп" },
    { emoji: "✋", name: "ладонь" }, { emoji: "👌", name: "ок" }, { emoji: "🤏", name: "чуть-чуть" },
    { emoji: "✌️", name: "мир" }, { emoji: "🤞", name: "скрещ" }, { emoji: "🤟", name: "рок" },
    { emoji: "🤘", name: "коза" }, { emoji: "🤙", name: "позвон" }, { emoji: "👈", name: "влево" },
    { emoji: "👉", name: "вправо" }, { emoji: "👆", name: "вверх" }, { emoji: "👇", name: "вниз" },
    { emoji: "☝️", name: "указ" }, { emoji: "🖕", name: "фак" }, { emoji: "🖐️", name: "пять" },
    { emoji: "🤙", name: "позвон" }, { emoji: "💪", name: "биц" }, { emoji: "🦵", name: "нога" },
    { emoji: "🦶", name: "ступа" },
  ],
  Сердца: [
    { emoji: "❤️", name: "сердце" }, { emoji: "🧡", name: "оранж" }, { emoji: "💛", name: "желт" },
    { emoji: "💚", name: "зелен" }, { emoji: "💙", name: "синее" }, { emoji: "💜", name: "фиол" },
    { emoji: "🖤", name: "черн" }, { emoji: "🤍", name: "белое" }, { emoji: "🤎", name: "корич" },
    { emoji: "💕", name: "два" }, { emoji: "💞", name: "круг" }, { emoji: "💓", name: "бьется" },
    { emoji: "💗", name: "растет" }, { emoji: "💖", name: "блеск" }, { emoji: "💘", name: "стрела" },
    { emoji: "💝", name: "лента" }, { emoji: "💟", name: "бел" }, { emoji: "❣️", name: "воскл" },
    { emoji: "💔", name: "разбит" }, { emoji: "❤️‍🔥", name: "огонь" }, { emoji: "❤️‍🩹", name: "пласт" },
    { emoji: "💌", name: "письмо" }, { emoji: "💋", name: "губы" },
  ],
  Символы: [
    { emoji: "🔥", name: "огонь" }, { emoji: "⭐", name: "звезда" }, { emoji: "✨", name: "искры" },
    { emoji: "💫", name: "круж" }, { emoji: "🌟", name: "сияет" }, { emoji: "💥", name: "взрыв" },
    { emoji: "💯", name: "сто" }, { emoji: "✅", name: "галка" }, { emoji: "❌", name: "крест" },
    { emoji: "❓", name: "вопрос" }, { emoji: "❗", name: "воскл" }, { emoji: "‼️", name: "два" },
    { emoji: "💢", name: "злость" }, { emoji: "💬", name: "обл" }, { emoji: "👀", name: "глаза" },
    { emoji: "👁️", name: "глаз" }, { emoji: "🗣️", name: "говор" }, { emoji: "💤", name: "сон" },
    { emoji: "💨", name: "ветер" }, { emoji: "💦", name: "капли" }, { emoji: "💪", name: "мышца" },
  ],
  Предметы: [
    { emoji: "🎉", name: "хлопуш" }, { emoji: "🎊", name: "шар" }, { emoji: "🎁", name: "подар" },
    { emoji: "🎂", name: "торт" }, { emoji: "🍕", name: "пицца" }, { emoji: "🍺", name: "пиво" },
    { emoji: "🍻", name: "чок" }, { emoji: "🥂", name: "бокал" }, { emoji: "🍷", name: "вино" },
    { emoji: "☕", name: "кофе" }, { emoji: "🌹", name: "роза" }, { emoji: "🌸", name: "цвет" },
    { emoji: "🌺", name: "гибиск" }, { emoji: "🌻", name: "солн" }, { emoji: "🌞", name: "солнце" },
    { emoji: "🌈", name: "радуга" }, { emoji: "⚡", name: "молния" }, { emoji: "🌙", name: "луна" },
    { emoji: "☀️", name: "солнце" }, { emoji: "❄️", name: "снеж" }, { emoji: "🎵", name: "нота" },
    { emoji: "🎶", name: "ноты" }, { emoji: "🏆", name: "кубок" }, { emoji: "👑", name: "корона" },
    { emoji: "🔮", name: "шар" }, { emoji: "💎", name: "алмаз" }, { emoji: "🗡️", name: "кинж" },
    { emoji: "🛡️", name: "щит" }, { emoji: "⚔️", name: "меча" },
  ],
};

const CATEGORIES = Object.keys(EMOJI_DATA);
const CATEGORY_ICONS: Record<string, string> = {
  Лица: "😀", Жесты: "👍", Сердца: "❤️", Символы: "✨", Предметы: "🎁",
};

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
  onClose: () => void;
}

export function EmojiPicker({ onSelect, onClose }: EmojiPickerProps) {
  const [category, setCategory] = useState(CATEGORIES[0]);

  return (
    <Portal>
      <div className="fixed inset-0 z-50" onClick={onClose} />
      <div className="absolute bottom-full left-0 mb-1 z-50 bg-popover border border-border rounded-xl shadow-2xl overflow-hidden w-72"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Category tabs */}
        <div className="flex border-b border-border bg-sidebar/30 overflow-x-auto">
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

        {/* Emoji grid */}
        <div className="p-2 max-h-48 overflow-y-auto grid grid-cols-8 gap-0.5">
          {EMOJI_DATA[category].map((e) => (
            <button
              key={e.emoji}
              onClick={() => { onSelect(e.emoji); onClose(); }}
              className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-muted text-lg transition-colors"
              title={e.name}
            >
              {e.emoji}
            </button>
          ))}
        </div>
      </div>
    </Portal>
  );
}
