import { isTauri } from "./tauri";

const STORE_FILE = "veche.json";

// Singleton — reuse the same Store instance to avoid load/flush races.
let storePromise: Promise<import("@tauri-apps/plugin-store").Store> | null = null;

function getStore() {
  if (!storePromise) {
    storePromise = import("@tauri-apps/plugin-store").then(({ load }) =>
      load(STORE_FILE, { autoSave: false }),
    );
  }
  return storePromise;
}

export async function storeGet<T>(key: string): Promise<T | null> {
  if (!isTauri()) return null;
  try {
    const store = await getStore();
    const value = await store.get<T>(key);
    return value ?? null;
  } catch {
    return null;
  }
}

export async function storeSet(key: string, value: unknown): Promise<void> {
  if (!isTauri()) return;
  try {
    const store = await getStore();
    await store.set(key, value);
    // Explicitly flush to disk — don't rely on autoSave timing.
    await store.save();
  } catch {
    // ignore
  }
}

export async function storeDelete(key: string): Promise<void> {
  if (!isTauri()) return;
  try {
    const store = await getStore();
    await store.delete(key);
    await store.save();
  } catch {
    // ignore
  }
}
