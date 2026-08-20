"use client";

import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { useTheme } from "next-themes";
import { cn } from "@/utils/ui";
import { Sun03Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useT } from "@/i18n";

interface ThemeToggleProps {
	className?: string;
	iconClassName?: string;
	onToggle?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

export function ThemeToggle({
	className,
	iconClassName,
	onToggle,
}: ThemeToggleProps) {
	const { theme, setTheme } = useTheme();
	const t = useT();
	// 挂载标记：next-themes 的 theme 在 SSR 时为 undefined，客户端 hydrate 后才有真实值。
	// 挂载前统一渲染固定值，避免 sr-only 文案在服务端与客户端首次渲染不一致，触发 hydration 失败。
	const [mounted, setMounted] = useState(false);
	useEffect(() => {
		setMounted(true);
	}, []);

	// 仅挂载后读取真实 theme，确保首次渲染与服务端一致
	const isDark = mounted && theme === "dark";

	return (
		<Button
			size="icon"
			variant="ghost"
			className={cn("size-8", className)}
			onClick={(e) => {
				setTheme(theme === "dark" ? "light" : "dark");
				onToggle?.(e);
			}}
		>
			<HugeiconsIcon
				icon={Sun03Icon}
				className={cn("!size-[1.1rem]", iconClassName)}
			/>
			<span className="sr-only">{isDark ? t("Light") : t("Dark")}</span>
		</Button>
	);
}
