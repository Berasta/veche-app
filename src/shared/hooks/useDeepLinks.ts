import { useEffect } from "react";
import { useNavigate } from "react-router";
import { isTauri } from "@shared/lib/tauri";

function handleDeepLinkUrl(url: string, navigate: ReturnType<typeof useNavigate>) {
  try {
    const parsed = new URL(url);
    // veche://invite/CODE or veche://join/CODE
    if (parsed.protocol === "veche:") {
      const host = parsed.hostname; // "invite" or "join"
      const code = parsed.pathname.replace(/^\/+/, ""); // strip leading slashes
      if ((host === "invite" || host === "join") && code) {
        navigate(`/invite/${code}`);
      }
    }
  } catch {
    // ignore malformed URLs
  }
}

export function useDeepLinks() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!isTauri()) return;

    let unlisten: (() => void) | undefined;

    import("@tauri-apps/plugin-deep-link").then(({ onOpenUrl, getCurrent }) => {
      // Handle deep links received while the app is already running
      onOpenUrl((urls: string[]) => {
        for (const url of urls) {
          handleDeepLinkUrl(url, navigate);
        }
      }).then((fn) => { unlisten = fn; });

      // Handle deep link that launched the app (cold start)
      getCurrent().then((urls: string[] | null) => {
        if (!urls) return;
        for (const url of urls) {
          handleDeepLinkUrl(url, navigate);
        }
      });
    });

    return () => { unlisten?.(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
