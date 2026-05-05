import { useState } from "react";
import { Gem, Sparkles, Crown, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@entities/user/useAuth";
import { useAppDispatch } from "@app/hooks";
import { fetchCurrentUser } from "@entities/user/authSlice";
import { applyShopItem, removeShopItem } from "@entities/user/userApi";

const SHOP_ITEMS = [
  // Static frames
  { id: "frame_royal", name: "Царская оправа", desc: "Золотая рамка для аватара", type: "frame" as const, preview: "ring-yellow-500" },
  { id: "frame_violet", name: "Боярская оправа", desc: "Фіолетовая рамка для аватара", type: "frame" as const, preview: "ring-violet-500" },
  { id: "frame_ruby", name: "Рубиновая оправа", desc: "Червлёная рамка для аватара", type: "frame" as const, preview: "ring-red-500" },
  // Animated frames
  { id: "frame_ancient", name: "Древнее сіяніе", desc: "Мерцающая золотая рамка ✨", type: "frame" as const, animated: true, preview: "ring-yellow-400 animate-[glow-pulse_2s_ease-in-out_infinite]" },
  { id: "frame_arcane", name: "Чародѣйскій ореолъ", desc: "Переливающаяся фіолетовая рамка", type: "frame" as const, animated: true, preview: "ring-purple-500 animate-[glow-pulse_2.5s_ease-in-out_infinite]" },
  // Static banners
  { id: "banner_golden", name: "Златая хоругвь", desc: "Золотой градиентъ для профиля", type: "banner" as const, preview: "from-yellow-400 via-amber-500 to-orange-600" },
  { id: "banner_crimson", name: "Червлёная хоругвь", desc: "Багряный узоръ для профиля", type: "banner" as const, preview: "from-red-600 via-rose-700 to-purple-800" },
  { id: "banner_azure", name: "Лазурная хоругвь", desc: "Лазурный сводъ для профиля", type: "banner" as const, preview: "from-blue-500 via-cyan-600 to-teal-700" },
  // Animated banners
  { id: "banner_aurora", name: "Сѣверное сіяніе", desc: "Анимированное полярное сіяніе 🌌", type: "banner" as const, animated: true, preview: "bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 animate-[aurora_4s_ease-in-out_infinite] bg-[length:200%_100%]" },
  { id: "banner_inferno", name: "Адское пламя", desc: "Пульсирующее пламя 🔥", type: "banner" as const, animated: true, preview: "bg-gradient-to-r from-red-600 via-orange-500 to-yellow-400 animate-[shimmer_3s_ease-in-out_infinite] bg-[length:200%_100%]" },
];

export function Shop() {
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const [applying, setApplying] = useState<string | null>(null);

  const activeFrame = (user as any)?.avatar_frame;
  const activeBannerSkin = (user as any)?.banner_skin;

  const isActive = (item: typeof SHOP_ITEMS[0]) => {
    if (item.type === "frame") return activeFrame === item.id;
    if (item.type === "banner") return activeBannerSkin === item.id;
    return false;
  };

  const handleToggle = async (item: typeof SHOP_ITEMS[0]) => {
    if (!user?.id) return;
    setApplying(item.id);
    try {
      if (isActive(item)) {
        await removeShopItem(user.id, item.type);
      } else {
        await applyShopItem(user.id, item.id, item.type);
      }
      dispatch(fetchCurrentUser());
      toast.success(isActive(item) ? "Украшеніе убрано" : "Украшеніе примѣнено");
    } catch {
      toast.error("Ошибка при примѣненіи украшенія");
    } finally {
      setApplying(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Gem className="w-4 h-4 text-foreground/30" strokeWidth={1.5} />
        <h3 className="text-sm font-medium text-foreground/80">Магазинъ украшеній</h3>
      </div>

      {/* Frames */}
      <div>
        <p className="text-[10px] font-semibold text-foreground/30 uppercase tracking-widest mb-2 px-1">Оправы для аватара</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {SHOP_ITEMS.filter((i) => i.type === "frame").map((item) => (
            <ItemCard key={item.id} item={item} active={isActive(item)} applying={applying === item.id} onToggle={() => handleToggle(item)} />
          ))}
        </div>
      </div>

      {/* Banners */}
      <div>
        <p className="text-[10px] font-semibold text-foreground/30 uppercase tracking-widest mb-2 px-1">Хоругви для профиля</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {SHOP_ITEMS.filter((i) => i.type === "banner").map((item) => (
            <ItemCard key={item.id} item={item} active={isActive(item)} applying={applying === item.id} onToggle={() => handleToggle(item)} />
          ))}
        </div>
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

function ItemCard({ item, active, applying, onToggle }: {
  item: typeof SHOP_ITEMS[0];
  active: boolean;
  applying: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      disabled={applying}
      className={`relative group text-left rounded-xl overflow-hidden border transition-all ${
        active
          ? "border-primary/30 bg-primary/[0.04]"
          : "border-foreground/5 bg-foreground/[0.02] hover:border-foreground/10 hover:bg-foreground/[0.04]"
      }`}
    >
      <div className="p-3">
        {item.type === "frame" ? (
          <div className="w-full h-14 rounded-lg bg-foreground/5 mb-2 flex items-center justify-center">
            <div className={`w-9 h-9 rounded-full bg-foreground/10 ring-2 ${item.preview} ring-offset-2 ring-offset-background`} />
          </div>
        ) : (
          <div className={`w-full h-14 rounded-lg bg-gradient-to-r ${item.preview} mb-2 opacity-70`} />
        )}
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-medium text-foreground/60 truncate flex-1">{item.name}</span>
          {applying ? (
            <Loader2 className="w-3 h-3 animate-spin text-foreground/30 flex-shrink-0" />
          ) : active ? (
            <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
              <Check className="w-2.5 h-2.5 text-primary-foreground" strokeWidth={3} />
            </div>
          ) : null}
        </div>
      </div>
    </button>
  );
}
