import { isTauri } from "./tauri";

export interface ScreenSource {
  index: number;
  name: string;
  width: number;
  height: number;
  is_primary: boolean;
}

/** Enumerate available monitors via Tauri API. Returns [] in browser mode. */
export async function getScreenSources(): Promise<ScreenSource[]> {
  if (!isTauri()) return [];
  try {
    const { availableMonitors, primaryMonitor } = await import("@tauri-apps/api/window");
    const [monitors, primary] = await Promise.all([availableMonitors(), primaryMonitor()]);

    return monitors.map((m, i) => {
      const isPrimary =
        primary != null &&
        m.name === primary.name &&
        m.size.width === primary.size.width &&
        m.size.height === primary.size.height;

      const label = isPrimary
        ? `Главный экранъ (${m.size.width}×${m.size.height})`
        : `Экранъ ${i + 1} (${m.size.width}×${m.size.height})`;

      return {
        index: i,
        name: label,
        width: m.size.width,
        height: m.size.height,
        is_primary: isPrimary,
      };
    });
  } catch {
    return [];
  }
}

/**
 * Try to open a screen capture stream for a specific monitor index using
 * Chromium's internal `chromeMediaSource: 'desktop'` API.
 * This bypasses the OS native picker dialog when available in the WebView2 version.
 * Returns null if not supported — caller should fall back to getDisplayMedia.
 */
export async function captureScreenStream(
  index: number,
  width: number,
  height: number,
  fps: number,
): Promise<MediaStream | null> {
  try {
    // chromeMediaSource is a Chromium-specific extension to getUserMedia.
    // It is available in Electron and potentially in WebView2 (Chromium-based).
    // Source ID format: "screen:{index}:0"
    const stream = await (navigator.mediaDevices as any).getUserMedia({
      audio: false,
      video: {
        mandatory: {
          chromeMediaSource: "desktop",
          chromeMediaSourceId: `screen:${index}:0`,
          maxWidth: width,
          maxHeight: height,
          maxFrameRate: fps,
        },
      },
    });
    return stream as MediaStream;
  } catch {
    return null;
  }
}
