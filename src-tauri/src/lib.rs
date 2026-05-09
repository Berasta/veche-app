use tauri::{Emitter, Manager, WebviewUrl};
use tauri_plugin_global_shortcut::GlobalShortcutExt;

#[allow(dead_code)]
#[tauri::command]
fn register_shortcut(app: tauri::AppHandle, shortcut: String) -> Result<(), String> {
    app.global_shortcut()
        .register(shortcut.as_str())
        .map_err(|e| format!("{e}"))
}

#[allow(dead_code)]
#[tauri::command]
fn unregister_shortcut(app: tauri::AppHandle, shortcut: String) -> Result<(), String> {
    app.global_shortcut()
        .unregister(shortcut.as_str())
        .map_err(|e| format!("{e}"))
}

#[tauri::command]
fn open_devtools(app: tauri::AppHandle) {
    if let Some(window) = app.get_webview_window("main") {
        window.open_devtools();
    }
}

#[tauri::command]
fn toggle_overlay(app: tauri::AppHandle) {
    if let Some(overlay) = app.get_webview_window("overlay") {
        if overlay.is_visible().unwrap_or(false) {
            let _ = overlay.hide();
        } else {
            let _ = overlay.show();
            let _ = overlay.set_focus();
        }
    }
}

#[tauri::command]
fn open_overlay(app: tauri::AppHandle) {
    if app.get_webview_window("overlay").is_none() {
        let overlay = tauri::WebviewWindowBuilder::new(
            &app,
            "overlay",
            WebviewUrl::App("/overlay".into()),
        )
        .title("Вече — Оверлей")
        .decorations(false)
        .always_on_top(true)
        .skip_taskbar(true)
        .focused(false)
        .inner_size(400.0, 100.0)
        .position(100.0, 100.0)
        .build()
        .ok();

        if let Some(w) = overlay {
            let _ = w.set_background_color(Some(tauri::webview::Color(0, 0, 0, 0)));
        }
    } else {
        toggle_overlay(app);
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_log::Builder::default().level(log::LevelFilter::Info).build())
        .plugin(
            tauri_plugin_global_shortcut::Builder::new()
                .with_handler(move |app, shortcut, event| {
                    if event.state == tauri_plugin_global_shortcut::ShortcutState::Pressed {
                        let _ = app.emit("shortcut", shortcut.to_string());
                    }
                })
                .build(),
        )
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_deep_link::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .setup(|app| {
            #[cfg(debug_assertions)]
            {
                let window = app.get_webview_window("main").unwrap();
                window.open_devtools();
            }

            // Clear WebView cache so updated assets load after auto-update
            // Auth token is persisted in tauri-plugin-store, not localStorage
            if let Some(window) = app.get_webview_window("main") {
                let _ = window.clear_all_browsing_data();
            }

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![toggle_overlay, open_overlay, register_shortcut, unregister_shortcut, open_devtools])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
