# src-tauri/
> L2 | 父级: /CLAUDE.md

## 成员清单

src/main.rs: Rust 主程序，初始化 Tauri 应用，注册全局快捷键，暴露通知/导出/导入命令
Cargo.toml: Rust 项目配置，依赖 tauri 2.0 + 插件(notification, global-shortcut, dialog, fs)
tauri.conf.json: Tauri 配置，窗口大小、权限、插件设置
build.rs: 构建脚本，调用 tauri_build::build()

[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
