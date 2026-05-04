import { Check, Image, Palette, Upload, X, Crop } from "lucide-react";
import { useState, useRef } from "react";

interface BannerSelectorProps {
  currentBanner: string;
  onSelect: (bannerId: string) => void;
  onCustomUpload: (file: File) => Promise<void>;
  customBannerUrl?: string | null;
  onReposition?: () => void;
  onClose: () => void;
}

export const predefinedBannerIds = [
  "default", "forest", "birch", "fire", "water", "night", "ornament", "monastery",
];

export const banners = [
  {
    id: "default",
    name: "Златой узоръ",
    gradient: "from-primary/30 via-accent/20 to-primary/30",
    pattern: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 50 Q25 25, 50 50 T100 50' stroke='%23d4af37' fill='none' stroke-width='2'/%3E%3Cpath d='M0 70 Q25 45, 50 70 T100 70' stroke='%23d4af37' fill='none' stroke-width='2'/%3E%3C/svg%3E")`,
  },
  {
    id: "forest",
    name: "Лѣсная чаща",
    gradient: "from-green-900/40 via-emerald-800/30 to-green-900/40",
    pattern: `url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='30' cy='30' r='2' fill='%237cb342' opacity='0.3'/%3E%3Ccircle cx='10' cy='10' r='1.5' fill='%237cb342' opacity='0.4'/%3E%3Ccircle cx='50' cy='15' r='1' fill='%237cb342' opacity='0.3'/%3E%3C/svg%3E")`,
  },
  {
    id: "birch",
    name: "Берёзовая кора",
    gradient: "from-amber-100/60 via-yellow-50/50 to-amber-100/60",
    pattern: `url("data:image/svg+xml,%3Csvg width='80' height='120' xmlns='http://www.w3.org/2000/svg'%3E%3Cline x1='20' y1='0' x2='20' y2='120' stroke='%23000' stroke-width='1' opacity='0.15'/%3E%3Cline x1='60' y1='0' x2='60' y2='120' stroke='%23000' stroke-width='0.5' opacity='0.1'/%3E%3Cellipse cx='20' cy='30' rx='8' ry='3' fill='none' stroke='%23000' stroke-width='0.5' opacity='0.2'/%3E%3Cellipse cx='20' cy='80' rx='6' ry='2' fill='none' stroke='%23000' stroke-width='0.5' opacity='0.2'/%3E%3C/svg%3E")`,
  },
  {
    id: "fire",
    name: "Пламя вѣчное",
    gradient: "from-orange-900/50 via-red-800/40 to-orange-900/50",
    pattern: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M50 20 Q45 35, 50 50 Q55 35, 50 20' fill='%23ff6b35' opacity='0.3'/%3E%3Cpath d='M30 40 Q28 50, 30 60 Q32 50, 30 40' fill='%23f7931e' opacity='0.2'/%3E%3Cpath d='M70 35 Q68 48, 70 60 Q72 48, 70 35' fill='%23ff6b35' opacity='0.25'/%3E%3C/svg%3E")`,
  },
  {
    id: "water",
    name: "Рѣчная гладь",
    gradient: "from-blue-900/40 via-cyan-800/30 to-blue-900/40",
    pattern: `url("data:image/svg+xml,%3Csvg width='100' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 20 Q25 10, 50 20 T100 20' stroke='%234fc3f7' fill='none' stroke-width='1' opacity='0.3'/%3E%3Cpath d='M0 28 Q25 18, 50 28 T100 28' stroke='%234fc3f7' fill='none' stroke-width='0.5' opacity='0.2'/%3E%3C/svg%3E")`,
  },
  {
    id: "night",
    name: "Звѣздная ночь",
    gradient: "from-indigo-950/60 via-purple-900/50 to-indigo-950/60",
    pattern: `url("data:image/svg+xml,%3Csvg width='200' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='30' cy='30' r='1' fill='%23fff' opacity='0.8'/%3E%3Ccircle cx='150' cy='50' r='1.5' fill='%23fff' opacity='0.6'/%3E%3Ccircle cx='80' cy='120' r='1' fill='%23fff' opacity='0.9'/%3E%3Ccircle cx='170' cy='140' r='0.8' fill='%23fff' opacity='0.7'/%3E%3Ccircle cx='40' cy='170' r='1.2' fill='%23fff' opacity='0.85'/%3E%3Ccircle cx='120' cy='80' r='0.7' fill='%23fff' opacity='0.75'/%3E%3C/svg%3E")`,
  },
  {
    id: "ornament",
    name: "Древній орнаментъ",
    gradient: "from-red-900/40 via-yellow-800/30 to-red-900/40",
    pattern: `url("data:image/svg+xml,%3Csvg width='80' height='80' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M40 0 L50 30 L80 40 L50 50 L40 80 L30 50 L0 40 L30 30 Z' fill='%23d4af37' opacity='0.15'/%3E%3Ccircle cx='40' cy='40' r='15' fill='none' stroke='%23d4af37' stroke-width='1' opacity='0.2'/%3E%3C/svg%3E")`,
  },
  {
    id: "monastery",
    name: "Монастырскія своды",
    gradient: "from-stone-800/50 via-stone-700/40 to-stone-800/50",
    pattern: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0 L100 0 L100 100 L0 100 Z' fill='none' stroke='%23a8a29e' stroke-width='0.5' opacity='0.2'/%3E%3Cpath d='M50 0 L50 100 M0 50 L100 50' stroke='%23a8a29e' stroke-width='0.3' opacity='0.15'/%3E%3Ccircle cx='50' cy='50' r='20' fill='none' stroke='%23a8a29e' stroke-width='0.5' opacity='0.1'/%3E%3C/svg%3E")`,
  },
];

const isCustom = (id: string) => !predefinedBannerIds.includes(id);

export function BannerSelector({
  currentBanner,
  onSelect,
  onCustomUpload,
  customBannerUrl,
  onReposition,
  onClose,
}: BannerSelectorProps) {
  const [selectedBanner, setSelectedBanner] = useState(currentBanner);
  const [uploading, setUploading] = useState(false);
  const [tab, setTab] = useState<"patterns" | "custom">(
    isCustom(currentBanner) ? "custom" : "patterns",
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSelect = (bannerId: string) => {
    setSelectedBanner(bannerId);
    setTab("patterns");
    onSelect(bannerId);
  };

  const handleFilePick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await onCustomUpload(file);
      setSelectedBanner("custom");
      setTab("custom");
    } finally {
      setUploading(false);
    }
  };

  const previewBanner = banners.find((b) => b.id === selectedBanner);
  const showCustomPreview = tab === "custom" || isCustom(selectedBanner);

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card/95 backdrop-blur-xl border border-border rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="border-b border-border p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Image className="w-5 h-5 text-primary" strokeWidth={2} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">
                  Избрати хоругвь профиля
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Выберите фоновый узоръ или загрузите свой
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-md hover:bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border">
          <button
            onClick={() => setTab("patterns")}
            className={`flex-1 py-2.5 text-xs font-semibold uppercase tracking-widest transition-colors ${
              tab === "patterns"
                ? "text-foreground border-b-2 border-primary"
                : "text-muted-foreground/50 hover:text-muted-foreground"
            }`}
          >
            Узоры
          </button>
          <button
            onClick={() => setTab("custom")}
            className={`flex-1 py-2.5 text-xs font-semibold uppercase tracking-widest transition-colors ${
              tab === "custom"
                ? "text-foreground border-b-2 border-primary"
                : "text-muted-foreground/50 hover:text-muted-foreground"
            }`}
          >
            Своё изображеніе
          </button>
        </div>

        {/* Preview */}
        <div className="border-b border-border p-4 md:p-6 bg-background/50">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Предварительный просмотръ
            </span>
            {showCustomPreview && customBannerUrl && onReposition && (
              <button onClick={onReposition}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-primary/10 hover:bg-primary/20 text-primary text-[11px] font-medium transition-colors">
                <Crop className="w-3 h-3" strokeWidth={2} />
                Настроить область
              </button>
            )}
          </div>
          <div className="relative h-32 rounded-lg overflow-hidden border border-border">
            {showCustomPreview && customBannerUrl ? (
              <img
                src={customBannerUrl}
                alt=""
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : previewBanner ? (
              <div className={`absolute inset-0 bg-gradient-to-br ${previewBanner.gradient}`}>
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: previewBanner.pattern }} />
              </div>
            ) : null}
            <div className="absolute inset-0 flex items-end p-4">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center ring-4 ring-background">
                  <Palette className="w-8 h-8 text-primary" strokeWidth={2} />
                </div>
                <div>
                  <div className="text-sm font-bold text-white drop-shadow-lg">
                    Гость градскій
                  </div>
                  <div className="text-xs text-white/80 drop-shadow">
                    @gost_gradskiy
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {tab === "patterns" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {banners.map((banner) => (
                <button
                  key={banner.id}
                  onClick={() => handleSelect(banner.id)}
                  className={`
                    group relative rounded-lg overflow-hidden border-2 transition-all
                    ${
                      selectedBanner === banner.id
                        ? "border-primary ring-2 ring-primary/20"
                        : "border-border hover:border-primary/50"
                    }
                  `}
                >
                  <div className={`relative h-24 bg-gradient-to-br ${banner.gradient}`}>
                    <div className="absolute inset-0 opacity-20" style={{ backgroundImage: banner.pattern }} />
                    {selectedBanner === banner.id && (
                      <div className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center shadow-lg">
                        <Check className="w-4 h-4 text-primary-foreground" strokeWidth={3} />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                  </div>
                  <div className="p-3 bg-card/80 backdrop-blur-sm">
                    <div className="text-sm font-medium text-foreground text-center">{banner.name}</div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <div className="w-24 h-24 rounded-2xl bg-muted/50 border-2 border-dashed border-border flex items-center justify-center mb-4">
                <Upload className="w-8 h-8 text-muted-foreground/50" strokeWidth={1.5} />
              </div>
              <p className="text-sm text-foreground font-medium mb-1">Загрузите своё изображеніе</p>
              <p className="text-xs text-muted-foreground text-center mb-4 max-w-xs">
                Рекомендуемый размеръ: 640×200 пикселей
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFilePick}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="px-5 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                {uploading ? "Загрузка..." : "Выбрати изображеніе"}
              </button>
              {customBannerUrl && (
                <div className="flex items-center gap-3 mt-4">
                  {onReposition && (
                    <button onClick={onReposition}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-sm font-medium transition-colors">
                      <Crop className="w-4 h-4" strokeWidth={2} />
                      Настроить область
                    </button>
                  )}
                  <button onClick={() => onSelect("default")}
                    className="text-xs text-muted-foreground hover:text-foreground underline transition-colors">
                    Удалити своё изображеніе
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border p-4 md:p-6 bg-background/50">
          <div className="flex items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">
              Выбрано:{" "}
              <span className="text-foreground font-medium">
                {showCustomPreview && customBannerUrl ? "Своё изображеніе" : previewBanner?.name}
              </span>
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
            >
              Сохранити
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
