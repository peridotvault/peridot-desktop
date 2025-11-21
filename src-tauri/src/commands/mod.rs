use tauri::{AppHandle, Manager};

use crate::windows::{create_login_window, create_main_window};

#[tauri::command]
pub fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
pub fn open_main_window(app_handle: AppHandle) {
    if let Err(e) = create_main_window(&app_handle) {
        eprintln!("failed to create main window: {e}");
        return;
    }

    if let Some(login_win) = app_handle.get_webview_window("login") {
        if let Err(e) = login_win.close() {
            eprintln!("failed to close login window: {e}");
        }
    }
}

#[tauri::command]
pub fn open_login_window(app_handle: AppHandle, stage: Option<String>) {
    let _ = stage; // stage can be used later to drive UI, but is ignored for now.

    if let Err(e) = create_login_window(&app_handle) {
        eprintln!("failed to create login window: {e}");
        return;
    }

    if let Some(main_win) = app_handle.get_webview_window("main") {
        if let Err(e) = main_win.close() {
            eprintln!("failed to close main window: {e}");
        }
    }
}
