import { useEffect, useMemo, useRef } from "react";
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

async function registerRust(shortcut: string) {
  const { invoke } = await import("@tauri-apps/api/core");
  return invoke("register_shortcut", { shortcutStr: shortcut });
}

async function unregisterRust(shortcut: string) {
  const { invoke } = await import("@tauri-apps/api/core");
  return invoke("unregister_shortcut", { shortcutStr: shortcut });
}

export function useTauriHotkeys(bindings: HotkeyBinding[]) {
  const bindingsRef = useRef(bindings);
  bindingsRef.current = bindings;

  const depKey = useMemo(
    () => bindings.map((b) => `${b.id}:${b.shortcut}`).sort().join("|"),
    [bindings],
  );

  useEffect(() => {
    if (!isTauri()) return;

    const currentBindings = bindingsRef.current;

    let unlisten: (() => void) | null = null;
    let cancelled = false;

    currentBindings.forEach((b) => {
      registerRust(b.shortcut).catch((e) =>
        console.error(`register ${b.shortcut}:`, e),
      );
    });

    import("@tauri-apps/api/event").then(({ listen }) => {
      if (cancelled) return;
      listen<string>("shortcut", (event) => {
        const normalized = normalize(event.payload);
        const binding = bindingsRef.current.find(
          (b) => normalize(b.shortcut) === normalized,
        );
        binding?.action();
      }).then((fn) => { unlisten = fn; });
    });

    return () => {
      cancelled = true;
      unlisten?.();
      currentBindings.forEach((b) => {
        unregisterRust(b.shortcut).catch(() => {});
      });
    };
  }, [depKey]);
}
