use tauri::AppHandle;

use super::build_main_window;

pub fn create_main_window(app: &AppHandle) -> tauri::Result<()> {
    build_main_window(app)
}
