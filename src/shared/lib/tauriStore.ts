import { isTauri } from "./tauri";

const STORE_FILE = "veche.json";

async function getStore() {
  const { load } = await import("@tauri-apps/plugin-store");
  return load(STORE_FILE, { autoSave: true });
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
  } catch {
    // ignore
  }
}

export async function storeDelete(key: string): Promise<void> {
  if (!isTauri()) return;
  try {
    const store = await getStore();
    await store.delete(key);
  } catch {
    // ignore
  }
}
