import PocketBase, { AsyncAuthStore } from "pocketbase";
import { isTauri } from "@shared/lib/tauri";
import { storeGet, storeSet, storeDelete } from "@shared/lib/tauriStore";

export const PB_URL = import.meta.env.VITE_PB_URL || "http://localhost:8090";

const STORE_KEY = "pb_auth";

function createPb() {
  if (isTauri()) {
    const store = new AsyncAuthStore({
      save: async (serialized) => storeSet(STORE_KEY, serialized),
      initial: storeGet<string>(STORE_KEY).then((v) => v ?? ""),
      clear: async () => storeDelete(STORE_KEY),
    });
    return new PocketBase(PB_URL, store);
  }
  return new PocketBase(PB_URL);
}

export const pb = createPb();
