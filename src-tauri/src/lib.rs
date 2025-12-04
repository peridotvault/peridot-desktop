mod commands;
mod session;
mod windows;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let mut context = tauri::generate_context!();
    // Prevent Tauri from spawning any windows defined in config; we create them manually.
    context.config_mut().app.windows.clear();

    tauri::Builder::default()
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![
            commands::greet,
            commands::open_main_window,
            commands::open_login_window,
            commands::open_game_window
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
        .run(context)
        .expect("error while running tauri application");
}
