"use client";

// 尝试绕过 Next.js 16 export 的 _global-error prerender bug
export const dynamic = "force-static";

// 全局错误边界（Next.js 要求 "use client"，并自含 html/body 根结构）
// 提供显式实现，避免内置 _global-error 在静态导出 prerender 时出错
export default function GlobalError({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	return (
		<html lang="en">
			<body
				style={{
					background: "#0f0f0f",
					color: "#fff",
					fontFamily: "system-ui, sans-serif",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					height: "100vh",
					margin: 0,
				}}
			>
				<div style={{ textAlign: "center" }}>
					<h2>Something went wrong</h2>
					<p>{error.message || "An unexpected error occurred."}</p>
					<button
						onClick={() => reset()}
						style={{
							padding: "8px 16px",
							background: "#1a8cff",
							color: "#fff",
							border: "none",
							borderRadius: 6,
							cursor: "pointer",
						}}
					>
						Try again
					</button>
				</div>
			</body>
		</html>
	);
}
