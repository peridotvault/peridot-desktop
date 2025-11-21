mod commands;
mod session;
mod windows;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_process::init())
        .invoke_handler(tauri::generate_handler![
            commands::greet,
            commands::open_main_window,
            commands::open_login_window
        ])
        .setup(|app| {
            let handle = app.handle();

            if session::is_logged_in() {
                windows::create_main_window(&handle)?;
            } else {
                windows::create_login_window(&handle)?;
            }

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
