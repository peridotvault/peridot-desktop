use tauri::AppHandle;

use super::build_login_window;

pub fn create_login_window(app: &AppHandle) -> tauri::Result<()> {
    build_login_window(app)
}
