"use client";

import { useEffect } from "react";
import { useLanguageStore } from "./language-store";

// 客户端挂载后手动从 localStorage 回填语言偏好，并同步 <html lang> 属性。
// 配合 language-store 的 skipHydration，保证服务端与客户端首帧一致（默认 zh），
// 避免 en 用户出现 SSR hydration mismatch。
export function LanguageHydrator() {
	useEffect(() => {
		Promise.resolve(useLanguageStore.persist.rehydrate())
			.then(() => {
				const { language } = useLanguageStore.getState();
				document.documentElement.lang = language;
			})
			.catch(() => {
				// localStorage 不可用等情况，保持默认 zh
			});
	}, []);
	return null;
}
