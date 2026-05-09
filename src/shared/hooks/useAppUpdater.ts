import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import { isTauri } from "@shared/lib/tauri";

export interface UpdateInfo {
  version: string;
  notes: string;
  available: boolean;
}

export function useAppUpdater() {
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [checking, setChecking] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [readyToInstall, setReadyToInstall] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const relaunchRef = useRef<(() => Promise<void>) | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      checkForUpdates(true);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  const checkForUpdates = async (silent = false) => {
    setChecking(true);
    setError(null);
    try {
      if (isTauri()) {
        await checkTauriUpdates(silent);
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

  const checkTauriUpdates = async (silent = false) => {
    try {
      const { check } = await import("@tauri-apps/plugin-updater");
      const { relaunch } = await import("@tauri-apps/plugin-process");

      console.log("[updater] Checking for updates...");
      const update = await check({ timeout: 10000 });
      console.log("[updater] check() result:", update);

      if (update) {
        console.log("[updater] version:", update.version, "currentVersion:", update.currentVersion);

        setUpdateInfo({
          version: update.version,
          notes: update.body || "Доступна новая версия",
          available: true,
        });

        // В passive (silent) режиме — качаем в фоне, не перезапускаем
        if (silent) {
          toast.info(`Загружаю обновленiе v${update.version} в фоне...`, { duration: 4000 });
          setDownloading(true);
          try {
            await update.download((event) => {
              if (event.event === "Started") console.log(`[updater] Download started, size: ${event.data.contentLength} bytes`);
              if (event.event === "Progress") console.log(`[updater] Downloaded chunk: ${event.data.chunkLength} bytes`);
              if (event.event === "Finished") console.log("[updater] Download finished");
            });
            relaunchRef.current = relaunch;
            setReadyToInstall(true);
            setDownloading(false);
            toast.success(`Обновленiе v${update.version} готово — перезапустите приложенiе`, {
              duration: 0,
              action: { label: "Перезапустить", onClick: () => applyUpdate() },
            });
          } catch (err) {
            console.error("[updater] Background download failed:", err);
            setDownloading(false);
          }
        } else {
          // В ручном режиме — качаем и сразу устанавливаем
          toast.info(`Загружаю обновленiе до v${update.version}...`);
          setDownloading(true);
          try {
            await update.downloadAndInstall((event) => {
              if (event.event === "Started") console.log(`[updater] Download started, size: ${event.data.contentLength} bytes`);
              if (event.event === "Progress") console.log(`[updater] Downloaded chunk: ${event.data.chunkLength} bytes`);
              if (event.event === "Finished") console.log("[updater] Download finished");
            });
            console.log("[updater] Update installed, relaunching...");
            await relaunch();
          } catch (err) {
            console.error("[updater] Installation failed:", err);
            toast.error("Не удалось установить обновленiе");
            setError("Не удалось установить обновление");
            setDownloading(false);
          }
        }
      } else {
        console.log("[updater] No update available (check() returned null)");
        setUpdateInfo({ version: "current", notes: "У вас установлена последняя версия", available: false });
        if (!silent) toast.success("Актуальная версiя установлена");
      }
    } catch (err) {
      console.warn("[updater] Check failed:", err);
      if (!silent) toast.error("Не удалось проверить обновленiя");
      setUpdateInfo({ version: "current", notes: "Не удалось проверить обновления", available: false });
    }
  };

  const applyUpdate = async () => {
    if (relaunchRef.current) {
      await relaunchRef.current();
    }
  };

  const checkPWAUpdates = async () => {
    if ("serviceWorker" in navigator) {
      const registration = await navigator.serviceWorker.ready;
      await registration.update();
      registration.addEventListener("updatefound", () => {
        const newWorker = registration.installing;
        if (newWorker) {
          setUpdateInfo({ version: "latest", notes: "Доступно обновление веб-приложения", available: true });
          newWorker.addEventListener("statechange", () => {
            if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
              console.log("New PWA version available");
            }
          });
        }
      });
    }
  };

  return {
    updateInfo,
    checking,
    downloading,
    readyToInstall,
    error,
    checkForUpdates,
    applyUpdate,
    installUpdate: isTauri() ? applyUpdate : () => window.location.reload(),
  };
}

export interface UpdateInfo {
  version: string;
  notes: string;
  available: boolean;
}
