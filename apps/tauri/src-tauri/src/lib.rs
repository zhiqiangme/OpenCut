use std::process::{Child, Command};
use std::sync::Mutex;
use std::thread;
use std::time::Duration;

#[cfg(windows)]
use std::os::windows::process::CommandExt;

/// 全局持有 dev server 子进程，用于退出时回收
static SERVER_CHILD: Mutex<Option<Child>> = Mutex::new(None);

/// 项目根目录（dev:web 在这里运行）。自己用，硬编码即可；后续可改成读配置。
const PROJECT_ROOT: &str = r"D:\Portable\Video_Cut";

/// 定位本机 bun 可执行文件（与 OpenCut-Start.ps1 一致：优先 ~/.bun/bin/bun.exe）
fn bun_path() -> String {
    if let Ok(home) = std::env::var("USERPROFILE") {
        let local = std::path::PathBuf::from(home)
            .join(".bun")
            .join("bin")
            .join("bun.exe");
        if local.exists() {
            return local.to_string_lossy().to_string();
        }
    }
    // 回退到 PATH 里的 bun
    "bun".to_string()
}

/// 像启动脚本一样启动 dev server（bun dev:web），并等待 3000 端口就绪
fn start_server() -> Result<Child, Box<dyn std::error::Error>> {
    let bun = bun_path();

    // 关键：把 bun 目录注入 PATH
    // bun dev:web 实际执行 turbo run dev，turbo 通过 PATH 查找 bun 二进制；
    // 双击快捷方式的干净环境里没有 ~/.bun/bin，必须手动注入（与启动脚本一致）
    let bun_dir = std::path::Path::new(&bun)
        .parent()
        .map(|p| p.to_string_lossy().to_string())
        .unwrap_or_default();
    let current_path = std::env::var("PATH").unwrap_or_default();
    let new_path = format!("{bun_dir};{current_path}");

    let mut cmd = Command::new(&bun);
    cmd.arg("dev:web").current_dir(PROJECT_ROOT).env("PATH", new_path);

    // Windows：隐藏 bun 子进程的控制台窗口（CREATE_NO_WINDOW），避免黑框闪现
    #[cfg(windows)]
    {
        const CREATE_NO_WINDOW: u32 = 0x0800_0000;
        cmd.creation_flags(CREATE_NO_WINDOW);
    }

    let child = cmd.spawn()?;

    wait_for_server()?;
    Ok(child)
}

/// 轮询 3000 端口，等待 server 就绪（最多 60 秒，dev 首次编译较慢）
fn wait_for_server() -> Result<(), Box<dyn std::error::Error>> {
    for _ in 0..120 {
        if std::net::TcpStream::connect("127.0.0.1:3000").is_ok() {
            return Ok(());
        }
        thread::sleep(Duration::from_millis(500));
    }
    Err("dev server 未能在 60 秒内启动".into())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // 先起 dev server（和启动脚本一致），再让 WebView 加载 localhost:3000
    match start_server() {
        Ok(child) => {
            if let Ok(mut guard) = SERVER_CHILD.lock() {
                *guard = Some(child);
            }
        }
        Err(e) => eprintln!("启动 dev server 失败: {e}"),
    }

    let app = tauri::Builder::default()
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .build(tauri::generate_context!())
        .expect("error while building tauri application");

    app.run(|_app_handle, event| {
        // 应用退出时回收 server 子进程，避免孤儿进程占用端口
        if let tauri::RunEvent::Exit = event {
            if let Ok(mut guard) = SERVER_CHILD.lock() {
                if let Some(mut child) = guard.take() {
                    let _ = child.kill();
                    let _ = child.wait();
                }
            }
        }
    });
}
