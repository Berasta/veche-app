export function isTauri(): boolean {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

export async function getTauriApi() {
  if (!isTauri()) return null;

  const [
    { invoke },
    { listen },
    { checkUpdate, installUpdate },
    { register, unregister, isRegistered },
  ] = await Promise.all([
    import("@tauri-apps/api/core"),
    import("@tauri-apps/api/event"),
    import("@tauri-apps/plugin-updater"),
    import("@tauri-apps/plugin-global-shortcut"),
  ]);

  return {
    invoke,
    listen,
    checkUpdate,
    installUpdate,
    register,
    unregister,
    isRegistered,
  };
}
