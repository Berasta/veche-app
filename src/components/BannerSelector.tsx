import { Image, Upload, X, Crop, Trash2 } from "lucide-react";
import { useState, useRef } from "react";

interface BannerSelectorProps {
  customBannerUrl?: string | null;
  onCustomUpload: (file: File) => Promise<void>;
  onReposition?: () => void;
  onRemove?: () => void;
  onClose: () => void;
}

export function BannerSelector({
  customBannerUrl,
  onCustomUpload,
  onReposition,
  onRemove,
  onClose,
}: BannerSelectorProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFilePick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await onCustomUpload(file);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card/95 backdrop-blur-xl border border-border rounded-lg shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="border-b border-border p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Image className="w-5 h-5 text-primary" strokeWidth={2} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">
                  Хоругвь профиля
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Загрузите фоновое изображеніе для своего профиля
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

        {/* Preview */}
        {customBannerUrl && (
          <div className="border-b border-border p-4 md:p-6 bg-background/50">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Текущая хоругвь
              </span>
            </div>
            <div className="relative w-full aspect-[3.2/1] rounded-lg overflow-hidden border border-border bg-black/20">
              <img src={customBannerUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="flex flex-col items-center justify-center py-8 px-4">
            <div className="w-20 h-20 rounded-2xl bg-muted/50 border-2 border-dashed border-border flex items-center justify-center mb-4">
              <Upload className="w-8 h-8 text-muted-foreground/50" strokeWidth={1.5} />
            </div>
            <p className="text-sm text-foreground font-medium mb-1">Загрузите своё изображеніе</p>
            <p className="text-xs text-muted-foreground text-center mb-5 max-w-xs">
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
              <div className="flex items-center gap-2 mt-5">
                {onReposition && (
                  <button onClick={onReposition}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-sm font-medium transition-colors">
                    <Crop className="w-4 h-4" strokeWidth={2} />
                    Настроить область
                  </button>
                )}
                {onRemove && (
                  <button onClick={onRemove}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-destructive/10 hover:bg-destructive/20 text-destructive text-sm font-medium transition-colors">
                    <Trash2 className="w-4 h-4" strokeWidth={2} />
                    Удалити
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-border p-4 md:p-6 bg-background/50">
          <div className="flex items-center justify-end">
            <button onClick={onClose}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium">
              Готово
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
