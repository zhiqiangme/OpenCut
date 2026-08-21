use std::process::{Child, Command};
use std::sync::Mutex;
use std::thread;
use std::time::Duration;

/// 全局持有 standalone server 子进程，用于退出时回收
static SERVER_CHILD: Mutex<Option<Child>> = Mutex::new(None);

/// 定位 bun 可执行文件
/// 开发环境用系统 bun；生产环境用打包进 exe 的 sidecar（bun.exe）
fn bun_path() -> String {
    if cfg!(debug_assertions) {
        return "bun".to_string();
    }
    let exe = std::env::current_exe().unwrap_or_default();
    let exe_dir = exe.parent().unwrap_or_else(|| std::path::Path::new("."));
    exe_dir.join("bun.exe").to_string_lossy().to_string()
}

/// 定位 standalone 产物目录（含 server.js）
/// 开发环境用项目绝对路径；生产环境用打包进 exe 的资源目录
fn standalone_dir() -> String {
    if cfg!(debug_assertions) {
        return r"D:\Portable\Video_Cut\apps\web\.next\standalone\apps\web".to_string();
    }
    let exe = std::env::current_exe().unwrap_or_default();
    let exe_dir = exe.parent().unwrap_or_else(|| std::path::Path::new("."));
    // resources 打包到安装根目录，server.js 位于 standalone/apps/web/
    exe_dir
        .join("standalone")
        .join("apps")
        .join("web")
        .to_string_lossy()
        .to_string()
}

/// 启动 Next.js standalone server（bun 运行时），并等待其就绪
fn start_server() -> Result<Child, Box<dyn std::error::Error>> {
    let dir = standalone_dir();

    let child = Command::new(bun_path())
        .arg("server.js")
        .current_dir(&dir)
        // 服务端连接配置（默认指向本机 Docker 的 Postgres/Redis）
        .env("PORT", "3000")
        .env("NODE_ENV", "production")
        .env(
            "DATABASE_URL",
            "postgresql://opencut:opencut@localhost:5432/opencut",
        )
        .env("UPSTASH_REDIS_REST_URL", "http://localhost:8079")
        .env("UPSTASH_REDIS_REST_TOKEN", "example_token")
        .env("MARBLE_WORKSPACE_KEY", "test")
        .env("FREESOUND_CLIENT_ID", "test")
        .env("FREESOUND_API_KEY", "test")
        .spawn()?;

    wait_for_server()?;
    Ok(child)
}

/// 轮询 3000 端口，等待 server 就绪（最多 30 秒）
fn wait_for_server() -> Result<(), Box<dyn std::error::Error>> {
    for _ in 0..60 {
        if std::net::TcpStream::connect("127.0.0.1:3000").is_ok() {
            return Ok(());
        }
        thread::sleep(Duration::from_millis(500));
    }
    Err("standalone server 未能在 30 秒内启动".into())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // 生产构建：启动 standalone server（dev 模式用 `bun dev:web` 的 dev server）
    if !cfg!(debug_assertions) {
        match start_server() {
            Ok(child) => {
                if let Ok(mut guard) = SERVER_CHILD.lock() {
                    *guard = Some(child);
                }
            }
            Err(e) => eprintln!("启动 standalone server 失败: {e}"),
        }
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
