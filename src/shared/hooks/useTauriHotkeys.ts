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
      default: keys.push(p);
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

    let unlisten: (() => void) | null = null;
    let cancelled = false;

    import("@tauri-apps/api/event").then(({ listen }) => {
      if (cancelled) return;
      listen<string>("shortcut", (event) => {
        const normalized = normalize(event.payload);
        const binding = bindingsRef.current.find(
          (b) => normalize(b.shortcut) === normalized,
        );
        if (binding) binding.action();
      }).then((fn) => { unlisten = fn; });
    });

    return () => {
      cancelled = true;
      unlisten?.();
    };
  }, []);
}
