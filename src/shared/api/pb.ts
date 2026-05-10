import PocketBase from "pocketbase";
import { isTauri } from "@shared/lib/tauri";
import { storeGet, storeSet, storeDelete } from "@shared/lib/tauriStore";

export const PB_URL = import.meta.env.VITE_PB_URL || "http://localhost:8090";

const STORE_KEY = "pb_auth";

// Resolves once the auth token has been loaded from disk and applied to pb.authStore.
let _resolveReady!: () => void;
export const pbReady = new Promise<void>((resolve) => {
  _resolveReady = resolve;
});

// Create the PocketBase client immediately (no AsyncAuthStore — we manage persistence ourselves).
export const pb = new PocketBase(PB_URL);

if (isTauri()) {
  // Load persisted auth from tauri-plugin-store, apply it synchronously to pb.authStore,
  // then resolve pbReady. All requests that await pbReady will see the token.
  storeGet<string>(STORE_KEY).then((serialized) => {
    if (serialized) {
      try {
        const { token, record } = JSON.parse(serialized);
        if (token && record) {
          pb.authStore.save(token, record);
        }
      } catch {
        // corrupted data — start fresh
      }
    }
    _resolveReady();
  });

  // Persist every future auth change to disk.
  pb.authStore.onChange((token, record) => {
    if (token && record) {
      storeSet(STORE_KEY, JSON.stringify({ token, record }));
    } else {
      storeDelete(STORE_KEY);
    }
  });
} else {
  // Browser: localStorage is handled by PocketBase's default store. Resolve immediately.
  _resolveReady();
}
