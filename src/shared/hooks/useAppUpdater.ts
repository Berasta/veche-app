import { useEffect, useState } from "react";
import { isTauri } from "@shared/lib/tauri";

export interface UpdateInfo {
  version: string;
  notes: string;
  available: boolean;
}

/**
 * Хук для проверки и установки обновлений
 * Работает как для Tauri приложения, так и для PWA
 */
export function useAppUpdater() {
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [checking, setChecking] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Проверка обновлений при монтировании
  useEffect(() => {
    checkForUpdates();
  }, []);

  const checkForUpdates = async () => {
    setChecking(true);
    setError(null);

    try {
      if (isTauri()) {
        await checkTauriUpdates();
      } else {
        await checkPWAUpdates();
      }
    } catch (err) {
      console.error("Update check failed:", err);
      setError(err instanceof Error ? err.message : "Ошибка проверки обновлений");
    } finally {
      setChecking(false);
    }
  };

  // Проверка обновлений Tauri
  const checkTauriUpdates = async () => {
    const { check } = await import("@tauri-apps/plugin-updater");
    const { relaunch } = await import("@tauri-apps/plugin-process");

    const update = await check();

    if (update?.available) {
      setUpdateInfo({
        version: update.version,
        notes: update.body || "Доступна новая версия",
        available: true,
      });

      // Автоматическая загрузка и установка
      console.log(`Update to ${update.version} available! Downloading...`);
      setDownloading(true);

      try {
        await update.downloadAndInstall((event) => {
          switch (event.event) {
            case "Started":
              console.log(`Started downloading ${event.data.contentLength} bytes`);
              break;
            case "Progress":
              console.log(`Downloaded ${event.data.chunkLength} bytes`);
              break;
            case "Finished":
              console.log("Download finished");
              break;
          }
        });

        console.log("Update installed, restarting app...");
        await relaunch();
      } catch (err) {
        console.error("Update installation failed:", err);
        setError("Не удалось установить обновление");
        setDownloading(false);
      }
    } else {
      setUpdateInfo({
        version: "current",
        notes: "У вас установлена последняя версия",
        available: false,
      });
    }
  };

  // Проверка обновлений PWA
  const checkPWAUpdates = async () => {
    // Service Worker должен обновиться автоматически благодаря VitePWA
    if ("serviceWorker" in navigator) {
      const registration = await navigator.serviceWorker.ready;
      
      // Проверяем наличие обновления
      await registration.update();

      // Слушаем события обновления
      registration.addEventListener("updatefound", () => {
        const newWorker = registration.installing;
        if (newWorker) {
          setUpdateInfo({
            version: "latest",
            notes: "Доступно обновление веб-приложения",
            available: true,
          });

          newWorker.addEventListener("statechange", () => {
            if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
              // Новая версия готова
              console.log("New PWA version available");
            }
          });
        }
      });
    }
  };

  const installPWAUpdate = () => {
    // Перезагружаем страницу для активации нового Service Worker
    window.location.reload();
  };

  return {
    updateInfo,
    checking,
    downloading,
    error,
    checkForUpdates,
    installUpdate: isTauri() ? () => {} : installPWAUpdate, // Для Tauri обновление автоматическое
  };
}
