"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Language = "zh" | "en";

interface LanguageState {
	language: Language;
	setLanguage: (language: Language) => void;
}

export const useLanguageStore = create<LanguageState>()(
	persist(
		(set) => ({
			language: "zh", // 默认中文
			setLanguage: (language) => set({ language }),
		}),
		{
			name: "opencut-language", // localStorage key
			// 关键：不在 store 创建时同步读 localStorage，改由 LanguageHydrator 挂载后手动 rehydrate，
			// 避免服务端首帧（zh）与客户端（localStorage 里的 en）不一致导致 hydration mismatch。
			skipHydration: true,
			partialize: (state) => ({ language: state.language }),
		},
	),
);
