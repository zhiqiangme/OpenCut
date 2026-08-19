"use client";

import { useCallback } from "react";
import { useLanguageStore, type Language } from "./language-store";
import { zh } from "./locales/zh";
import { en } from "./locales/en";

export type { Language } from "./language-store";
export { useLanguageStore } from "./language-store";

const messages: Record<Language, Record<string, string>> = { zh, en };

type InterpolationParams = Record<string, string | number>;

function interpolate(template: string, params?: InterpolationParams): string {
	if (!params) return template;
	return template.replace(/\{(\w+)\}/g, (match, name: string) =>
		name in params ? String(params[name]) : match,
	);
}

// 非响应式：一次性读取当前语言（用于事件回调、toast 等非渲染路径）
export function translate(key: string, params?: InterpolationParams): string {
	const { language } = useLanguageStore.getState();
	return interpolate(messages[language][key] ?? key, params);
}

// 响应式：语言变化时返回新的 t，触发组件重渲染
export function useT() {
	const language = useLanguageStore((s) => s.language);
	return useCallback(
		(key: string, params?: InterpolationParams) =>
			interpolate(messages[language][key] ?? key, params),
		[language],
	);
}
