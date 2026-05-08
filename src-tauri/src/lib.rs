use tauri::{Emitter, Manager, WebviewUrl};

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
                .with_shortcut("Cmd+Shift+M")
                .expect("invalid shortcut")
                .with_shortcut("Cmd+Shift+O")
                .expect("invalid shortcut")
                .with_handler(move |app, shortcut, event| {
                    if event.state == tauri_plugin_global_shortcut::ShortcutState::Pressed {
                        let _ = app.emit("shortcut", shortcut.to_string());
                    }
                })
                .build(),
        )
        .plugin(tauri_plugin_updater::Builder::new().build())
        .invoke_handler(tauri::generate_handler![toggle_overlay, open_overlay])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
