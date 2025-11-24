use std::io;
use std::time::{SystemTime, UNIX_EPOCH};

use tauri::{AppHandle, Manager, Url, WebviewUrl, WebviewWindowBuilder};

use super::{WindowConfig, GAME_WINDOW_CONFIG};

fn sanitize_label(raw: &str) -> String {
    raw.chars()
        .map(|c| {
            if c.is_ascii_alphanumeric() || c == '-' || c == '_' {
                c
            } else {
                '-'
            }
        })
        .collect::<String>()
}

pub fn create_game_window(
    app: &AppHandle,
    target_url: &str,
    label: Option<&str>,
    title: Option<&str>,
) -> tauri::Result<()> {
    // ✅ INI YANG PENTING: ParseError di-convert ke tauri::Error
    let parsed_url = Url::parse(target_url).map_err(|e| {
        tauri::Error::from(io::Error::new(
            io::ErrorKind::InvalidInput,
            format!("Invalid game URL '{target_url}': {e}"),
        ))
    })?;

    let base_label = label
        .map(sanitize_label)
        .filter(|val| !val.is_empty())
        .unwrap_or_else(|| "game-webview".to_string());

    let label_in_use = if app.get_webview_window(&base_label).is_some() {
        let suffix = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap_or_default()
            .as_millis();
        format!("{base_label}-{suffix}")
    } else {
        base_label
    };

    let c: WindowConfig = GAME_WINDOW_CONFIG;

    WebviewWindowBuilder::new(app, label_in_use, WebviewUrl::External(parsed_url))
        .title(title.unwrap_or("PeridotVault – Game"))
        .inner_size(c.width, c.height)
        .min_inner_size(c.min_width, c.min_height)
        .resizable(c.resizable)
        .decorations(c.decorations)
        .center()
        .build()?;

    Ok(())
}
