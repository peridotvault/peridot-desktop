use tauri::{AppHandle, Manager, WebviewUrl, WebviewWindowBuilder};

mod login;
mod main;

pub use login::create_login_window;
pub use main::create_main_window;

struct WindowConfig {
    width: f64,
    height: f64,
    min_width: f64,
    min_height: f64,
    resizable: bool,
    decorations: bool,
}

const LOGIN_WINDOW_CONFIG: WindowConfig = WindowConfig {
    width: 900.0,
    height: 500.0,
    min_width: 900.0,
    min_height: 500.0,
    resizable: false,
    decorations: false,
};

const MAIN_WINDOW_CONFIG: WindowConfig = WindowConfig {
    width: 1280.0,
    height: 800.0,
    min_width: 1100.0,
    min_height: 600.0,
    resizable: true,
    decorations: false,
};

pub fn build_login_window(app: &AppHandle) -> tauri::Result<()> {
    if app.get_webview_window("login").is_some() {
        return Ok(());
    }

    let c = LOGIN_WINDOW_CONFIG;

    WebviewWindowBuilder::new(app, "login", WebviewUrl::App("login.html".into()))
        .title("PeridotVault – Login")
        .inner_size(c.width, c.height)
        .min_inner_size(c.min_width, c.min_height)
        .resizable(c.resizable)
        .decorations(c.decorations)
        .center()
        .build()?;

    Ok(())
}

pub fn build_main_window(app: &AppHandle) -> tauri::Result<()> {
    if app.get_webview_window("main").is_some() {
        return Ok(());
    }

    let c = MAIN_WINDOW_CONFIG;

    WebviewWindowBuilder::new(app, "main", WebviewUrl::App("index.html".into()))
        .title("PeridotVault")
        .inner_size(c.width, c.height)
        .min_inner_size(c.min_width, c.min_height)
        .resizable(c.resizable)
        .decorations(c.decorations)
        .center()
        .build()?;

    Ok(())
}
