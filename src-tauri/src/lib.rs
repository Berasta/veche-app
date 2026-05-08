use tauri::{Emitter, Manager, WebviewUrl};
use tauri_plugin_global_shortcut::{Code, GlobalShortcutExt, Modifiers, Shortcut, ShortcutState};
use serde::Serialize;

#[derive(Serialize, Clone)]
struct ShortcutEvent {
    shortcut: String,
    event_type: String,
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

#[tauri::command]
fn register_shortcut(app: tauri::AppHandle, shortcut_str: String) -> Result<(), String> {
    let shortcut = parse_shortcut(&shortcut_str)?;
    app.global_shortcut()
        .register(shortcut)
        .map_err(|e| e.to_string())
}

#[tauri::command]
fn unregister_shortcut(app: tauri::AppHandle, shortcut_str: String) -> Result<(), String> {
    let shortcut = parse_shortcut(&shortcut_str)?;
    app.global_shortcut()
        .unregister(shortcut)
        .map_err(|e| e.to_string())
}

fn parse_shortcut(s: &str) -> Result<Shortcut, String> {
    let parts: Vec<&str> = s.split('+').map(|p| p.trim()).collect();
    if parts.is_empty() {
        return Err("Пустой шорткат".into());
    }

    let mut modifiers = Modifiers::empty();
    let mut key = None;

    for part in &parts {
        let lower = part.to_lowercase();
        match lower.as_str() {
            "cmd" | "command" | "super" | "meta" => modifiers |= Modifiers::SUPER,
            "ctrl" | "control" => modifiers |= Modifiers::CONTROL,
            "shift" => modifiers |= Modifiers::SHIFT,
            "alt" | "option" => modifiers |= Modifiers::ALT,
            _ => {
                if key.is_some() {
                    return Err(format!("Лишняя клавиша: {}", part));
                }
                key = Some(parse_code(part)?);
            }
        }
    }

    let code = key.ok_or_else(|| "Не указана клавиша".to_string())?;
    Ok(Shortcut { mods: modifiers, key: code, id: 0 })
}

fn parse_code(s: &str) -> Result<Code, String> {
    let upper = s.to_uppercase();
    match upper.as_str() {
        "A" => Ok(Code::KeyA),
        "B" => Ok(Code::KeyB),
        "C" => Ok(Code::KeyC),
        "D" => Ok(Code::KeyD),
        "E" => Ok(Code::KeyE),
        "F" => Ok(Code::KeyF),
        "G" => Ok(Code::KeyG),
        "H" => Ok(Code::KeyH),
        "I" => Ok(Code::KeyI),
        "J" => Ok(Code::KeyJ),
        "K" => Ok(Code::KeyK),
        "L" => Ok(Code::KeyL),
        "M" => Ok(Code::KeyM),
        "N" => Ok(Code::KeyN),
        "O" => Ok(Code::KeyO),
        "P" => Ok(Code::KeyP),
        "Q" => Ok(Code::KeyQ),
        "R" => Ok(Code::KeyR),
        "S" => Ok(Code::KeyS),
        "T" => Ok(Code::KeyT),
        "U" => Ok(Code::KeyU),
        "V" => Ok(Code::KeyV),
        "W" => Ok(Code::KeyW),
        "X" => Ok(Code::KeyX),
        "Y" => Ok(Code::KeyY),
        "Z" => Ok(Code::KeyZ),
        "0" => Ok(Code::Digit0),
        "1" => Ok(Code::Digit1),
        "2" => Ok(Code::Digit2),
        "3" => Ok(Code::Digit3),
        "4" => Ok(Code::Digit4),
        "5" => Ok(Code::Digit5),
        "6" => Ok(Code::Digit6),
        "7" => Ok(Code::Digit7),
        "8" => Ok(Code::Digit8),
        "9" => Ok(Code::Digit9),
        "SPACE" => Ok(Code::Space),
        "ENTER" | "RETURN" => Ok(Code::Enter),
        "ESCAPE" | "ESC" => Ok(Code::Escape),
        "TAB" => Ok(Code::Tab),
        "BACKSPACE" => Ok(Code::Backspace),
        "DELETE" => Ok(Code::Delete),
        "INSERT" => Ok(Code::Insert),
        "HOME" => Ok(Code::Home),
        "END" => Ok(Code::End),
        "PAGEUP" => Ok(Code::PageUp),
        "PAGEDOWN" => Ok(Code::PageDown),
        "UP" | "ARROWUP" => Ok(Code::ArrowUp),
        "DOWN" | "ARROWDOWN" => Ok(Code::ArrowDown),
        "LEFT" | "ARROWLEFT" => Ok(Code::ArrowLeft),
        "RIGHT" | "ARROWRIGHT" => Ok(Code::ArrowRight),
        "F1" => Ok(Code::F1),
        "F2" => Ok(Code::F2),
        "F3" => Ok(Code::F3),
        "F4" => Ok(Code::F4),
        "F5" => Ok(Code::F5),
        "F6" => Ok(Code::F6),
        "F7" => Ok(Code::F7),
        "F8" => Ok(Code::F8),
        "F9" => Ok(Code::F9),
        "F10" => Ok(Code::F10),
        "F11" => Ok(Code::F11),
        "F12" => Ok(Code::F12),
        "F13" => Ok(Code::F13),
        "F14" => Ok(Code::F14),
        "F15" => Ok(Code::F15),
        "F16" => Ok(Code::F16),
        "F17" => Ok(Code::F17),
        "F18" => Ok(Code::F18),
        "F19" => Ok(Code::F19),
        "F20" => Ok(Code::F20),
        _ => Err(format!("Неизвестная клавиша: {}", s)),
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_log::Builder::default().level(log::LevelFilter::Info).build())
        .plugin(
            tauri_plugin_global_shortcut::Builder::new()
                .with_handler(move |app, shortcut, event| {
                    let event_type = match event.state {
                        ShortcutState::Pressed => "keydown",
                        ShortcutState::Released => "keyup",
                    };
                    
                    let payload = ShortcutEvent {
                        shortcut: shortcut.to_string(),
                        event_type: event_type.to_string(),
                    };
                    
                    let _ = app.emit("shortcut", payload);
                })
                .build(),
        )
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_process::init())
        .invoke_handler(tauri::generate_handler![
            toggle_overlay,
            open_overlay,
            register_shortcut,
            unregister_shortcut
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
