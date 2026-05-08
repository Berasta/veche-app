import { useEffect, useState } from "react";
import { Download, X, RefreshCw } from "lucide-react";
import { useAppUpdater } from "@shared/hooks/useAppUpdater";
import { isTauri } from "@shared/lib/tauri";

/**
 * Компонент уведомления о доступных обновлениях
 * Отображается в углу экрана, когда доступна новая версия
 */
export function UpdateNotification() {
  const { updateInfo, checking, downloading, error, installUpdate } = useAppUpdater();
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Сбрасываем dismissed при появлении нового обновления
    if (updateInfo?.available) {
      setDismissed(false);
    }
  }, [updateInfo?.available]);

  // Не показываем, если нет обновления или пользователь закрыл уведомление
  if (!updateInfo?.available || dismissed) {
    return null;
  }

  // Для Tauri - показываем процесс загрузки
  if (isTauri() && downloading) {
    return (
      <div className="fixed bottom-4 right-4 z-50 bg-background/95 backdrop-blur-xl border border-primary/20 rounded-xl shadow-2xl p-4 max-w-sm animate-in slide-in-from-bottom-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <RefreshCw className="w-5 h-5 text-primary animate-spin" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-foreground">
              Установка обновления...
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Приложение перезапустится автоматически
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-background/95 backdrop-blur-xl border border-primary/20 rounded-xl shadow-2xl p-4 max-w-sm animate-in slide-in-from-bottom-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Download className="w-5 h-5 text-primary" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="text-sm font-semibold text-foreground">
              Доступно обновленiе
            </h3>
            <button
              onClick={() => setDismissed(true)}
              className="w-5 h-5 rounded-md hover:bg-foreground/10 flex items-center justify-center text-foreground/40 hover:text-foreground/60 transition-colors flex-shrink-0"
              aria-label="Закрыть"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <p className="text-xs text-muted-foreground mb-3">
            {updateInfo.notes}
          </p>

          {!isTauri() && (
            <button
              onClick={installUpdate}
              className="w-full px-3 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors"
            >
              Обновити сейчасъ
            </button>
          )}

          {isTauri() && (
            <p className="text-xs text-primary/70">
              Загрузка началась автоматически...
            </p>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-3 pt-3 border-t border-foreground/10">
          <p className="text-xs text-red-500">{error}</p>
        </div>
      )}
    </div>
  );
}
