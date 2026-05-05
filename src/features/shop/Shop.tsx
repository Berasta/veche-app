import { useState } from "react";
import { Gem, Sparkles, Crown, Palette, Check } from "lucide-react";

const SHOP_ITEMS = [
  { id: "banner_golden", name: "Златая хоругвь", desc: "Золотой градиентъ для профиля", price: 0, type: "banner", preview: "from-yellow-400 via-amber-500 to-orange-600" },
  { id: "banner_crimson", name: "Червлёная хоругвь", desc: "Багряный узоръ для профиля", price: 0, type: "banner", preview: "from-red-600 via-rose-700 to-purple-800" },
  { id: "banner_azure", name: "Лазурная хоругвь", desc: "Лазурный сводъ для профиля", price: 0, type: "banner", preview: "from-blue-500 via-cyan-600 to-teal-700" },
  { id: "banner_emerald", name: "Изумрудная хоругвь", desc: "Изумрудное поле для профиля", price: 0, type: "banner", preview: "from-emerald-500 via-green-600 to-teal-800" },
  { id: "frame_royal", name: "Царская оправа", desc: "Золотая рамка вокругъ аватара", price: 0, type: "frame", preview: "ring-yellow-500" },
  { id: "frame_violet", name: "Боярская оправа", desc: "Фіолетовая рамка вокругъ аватара", price: 0, type: "frame", preview: "ring-violet-500" },
];

export function Shop() {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Gem className="w-4 h-4 text-foreground/30" strokeWidth={1.5} />
        <h3 className="text-sm font-medium text-foreground/80">Магазинъ украшеній</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {SHOP_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => setSelected(item.id === selected ? null : item.id)}
            className={`relative group text-left rounded-xl overflow-hidden border transition-all ${
              selected === item.id
                ? "border-primary/40 bg-primary/[0.04]"
                : "border-foreground/5 bg-foreground/[0.02] hover:border-foreground/10 hover:bg-foreground/[0.04]"
            }`}
          >
            <div className="p-4">
              {item.type === "banner" ? (
                <div className={`w-full h-16 rounded-lg bg-gradient-to-r ${item.preview} mb-3 opacity-80`} />
              ) : (
                <div className={`w-full h-16 rounded-lg bg-foreground/5 mb-3 flex items-center justify-center`}>
                  <div className={`w-10 h-10 rounded-full bg-foreground/10 ring-2 ${item.preview} ring-offset-2 ring-offset-background`} />
                </div>
              )}
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-foreground/30 flex-shrink-0" strokeWidth={1.5} />
                    <span className="text-sm font-medium text-foreground/70 truncate">{item.name}</span>
                  </div>
                  <p className="text-xs text-foreground/30 mt-0.5">{item.desc}</p>
                </div>
                {selected === item.id && (
                  <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-primary-foreground" strokeWidth={3} />
                  </div>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="text-center py-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-foreground/[0.02] text-xs text-foreground/30">
          <Crown className="w-3.5 h-3.5" strokeWidth={1.5} />
          Больше украшеній скоро будетъ
        </div>
      </div>
    </div>
  );
}
