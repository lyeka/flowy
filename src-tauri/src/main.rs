// [INPUT]: Tauri 核心库、插件(notification, global-shortcut, dialog, fs)
// [OUTPUT]: 桌面应用主进程、全局快捷键、通知、文件操作命令、开发菜单
// [POS]: Tauri 应用入口,负责初始化桌面端能力并暴露给前端
// [PROTOCOL]: 变更时更新此头部,然后检查 CLAUDE.md

#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::Manager;
use tauri_plugin_notification::NotificationExt;
use tauri_plugin_dialog::DialogExt;
use tauri_plugin_global_shortcut::GlobalShortcutExt;

#[cfg(debug_assertions)]
use tauri::menu::{Menu, MenuItem, Submenu};
#[cfg(debug_assertions)]
use tauri::Runtime;

#[cfg(debug_assertions)]
fn build_menu<R: Runtime>(app: &tauri::AppHandle<R>) -> tauri::Result<Menu<R>> {
    let menu = Menu::default(app)?;
    let devtools = MenuItem::with_id(app, "toggle_devtools", "Toggle DevTools", true, None::<&str>)?;
    let developer = Submenu::with_items(app, "Developer", true, &[&devtools])?;
    menu.append_items(&[&developer])?;
    Ok(menu)
}

// ============================================================
// 命令: 显示桌面通知
// ============================================================
#[tauri::command]
fn show_notification(app: tauri::AppHandle, title: String, body: String) -> Result<(), String> {
    app.notification()
        .builder()
        .title(title)
        .body(body)
        .show()
        .map_err(|e| e.to_string())?;
    Ok(())
}

// ============================================================
// 命令: 导出数据到文件
// ============================================================
#[tauri::command]
async fn export_data(app: tauri::AppHandle, data: String) -> Result<String, String> {
    let file_path = app.dialog()
        .file()
        .add_filter("JSON", &["json"])
        .add_filter("Markdown", &["md"])
        .blocking_save_file();

    if let Some(path) = file_path {
        let path_buf = path.as_path().ok_or("无效路径")?;
        std::fs::write(path_buf, data).map_err(|e| e.to_string())?;
        Ok(path_buf.to_string_lossy().to_string())
    } else {
        Err("用户取消保存".to_string())
    }
}

// ============================================================
// 命令: 导入数据
// ============================================================
#[tauri::command]
async fn import_data(app: tauri::AppHandle) -> Result<String, String> {
    let file_path = app.dialog()
        .file()
        .add_filter("JSON", &["json"])
        .blocking_pick_file();

    if let Some(path) = file_path {
        let path_buf = path.as_path().ok_or("无效路径")?;
        let data = std::fs::read_to_string(path_buf).map_err(|e| e.to_string())?;
        Ok(data)
    } else {
        Err("用户取消导入".to_string())
    }
}

fn main() {
    let builder = tauri::Builder::default()
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init());

    #[cfg(debug_assertions)]
    let builder = builder
        .menu(|app| build_menu(app))
        .on_menu_event(|app, event| {
            if event.id() == "toggle_devtools" {
                if let Some(window) = app.get_webview_window("main") {
                    if window.is_devtools_open() {
                        window.close_devtools();
                    } else {
                        window.open_devtools();
                    }
                }
            }
        });

    builder.setup(|app| {
            // ============================================================
            // 注册全局快捷键: Cmd+Shift+Space (macOS) / Ctrl+Shift+Space (Windows/Linux)
            // ============================================================
            #[cfg(target_os = "macos")]
            let shortcut = "Cmd+Shift+Space";
            #[cfg(not(target_os = "macos"))]
            let shortcut = "Ctrl+Shift+Space";

            let app_handle = app.handle().clone();
            app.global_shortcut().on_shortcut(shortcut, move |_app, _shortcut, _event| {
                if let Some(window) = app_handle.get_webview_window("main") {
                    let _ = if window.is_visible().unwrap_or(false) {
                        window.hide()
                    } else {
                        window.show().and_then(|_| window.set_focus())
                    };
                }
            })?;

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            show_notification,
            export_data,
            import_data
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
