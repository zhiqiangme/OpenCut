import { Suspense } from "react";
import { EditorClient } from "./editor-client";

// 静态导出下使用 useSearchParams 需置于 Suspense 边界内，避免构建报错
export default function EditorPage() {
	return (
		<Suspense
			fallback={<div className="bg-background h-screen w-screen" aria-hidden />}
		>
			<EditorClient />
		</Suspense>
	);
}
