import { useEffect, useRef } from "react";
import { isTauri } from "@shared/lib/tauri";

export interface HotkeyBinding {
  id: string;
  shortcut: string;
  action: () => void;
}

function normalize(shortcut: string): string {
  const parts = shortcut.split("+").map((p) => p.trim().toLowerCase());
  const mods: string[] = [];
  const keys: string[] = [];
  for (const p of parts) {
    switch (p) {
      case "super": case "cmd": case "command":
      case "commandorcontrol": case "commandorctrl":
      case "cmdorctrl": case "cmdorcontrol":
        mods.push("cmd"); break;
      case "control": case "ctrl":
        mods.push("ctrl"); break;
      case "shift": mods.push("shift"); break;
      case "alt": case "option": mods.push("alt"); break;
      default: {
        // global-hotkey emits Code names: "KeyM" → "m", "Digit1" → "1"
        let k = p;
        if (/^key[a-z]$/.test(k)) k = k.slice(3);
        else if (/^digit(\d)$/.test(k)) k = k.slice(5);
        keys.push(k);
      }
    }
  }
  return [...mods.sort(), ...keys].join("+");
}

export function useTauriHotkeys(bindings: HotkeyBinding[]) {
  const bindingsRef = useRef(bindings);
  const prevShortcutsRef = useRef<string[]>([]);
  bindingsRef.current = bindings;

  // Sync shortcuts with Tauri when bindings change
  const shortcutsKey = bindings.map((b) => b.shortcut).join(",");
  useEffect(() => {
    if (!isTauri()) return;

    const shortcuts = bindings.map((b) => b.shortcut);
    const prev = prevShortcutsRef.current;

    (async () => {
      const { invoke } = await import("@tauri-apps/api/core");
      // Unregister removed/changed shortcuts
      for (const s of prev) {
        if (!shortcuts.includes(s)) {
          try { await invoke("unregister_shortcut", { shortcut: s }); } catch {}
        }
      }
      // Register new shortcuts
      for (const s of shortcuts) {
        if (!prev.includes(s)) {
          try { await invoke("register_shortcut", { shortcut: s }); } catch {}
        }
      }
      prevShortcutsRef.current = shortcuts;
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shortcutsKey]);

  // Cleanup on unmount
  useEffect(() => {
    if (!isTauri()) return;
    return () => {
      const shortcuts = prevShortcutsRef.current;
      if (!shortcuts.length) return;
      import("@tauri-apps/api/core").then(({ invoke }) => {
        shortcuts.forEach((s) => invoke("unregister_shortcut", { shortcut: s }).catch(() => {}));
      });
    };
  }, []);

  // Listen for shortcut events
  useEffect(() => {
    if (!isTauri()) return;

    let cancelled = false;
    let unlistenPromise: Promise<() => void> | null = null;

    import("@tauri-apps/api/event").then(({ listen }) => {
      if (cancelled) return;
      unlistenPromise = listen<string>("shortcut", (event) => {
        const normalized = normalize(event.payload);
        const binding = bindingsRef.current.find(
          (b) => normalize(b.shortcut) === normalized,
        );
        if (binding) binding.action();
      });
    });

    return () => {
      cancelled = true;
      // If listen() already resolved — call unlisten immediately.
      // If still pending — attach cleanup so it runs once the promise settles.
      if (unlistenPromise) {
        unlistenPromise.then((fn) => fn()).catch(() => {});
      }
    };
  }, []);
}
