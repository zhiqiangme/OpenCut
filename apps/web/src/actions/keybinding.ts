import type { TActionWithOptionalArgs } from "./types";

/**
 * Alt is also regarded as macOS OPTION (⌥) key
 * Ctrl is also regarded as macOS COMMAND (⌘) key (NOTE: this differs from HTML Keyboard spec where COMMAND is Meta key!)
 */
export type ModifierKeys =
	| "ctrl"
	| "alt"
	| "shift"
	| "ctrl+shift"
	| "alt+shift"
	| "ctrl+alt"
	| "ctrl+alt+shift";

const KEYS = [
	"a", "b", "c", "d", "e", "f", "g", "h", "i", "j",
	"k", "l", "m", "n", "o", "p", "q", "r", "s", "t",
	"u", "v", "w", "x", "y", "z",
	"0", "1", "2", "3", "4", "5", "6", "7", "8", "9",
	"up", "down", "left", "right",
	"/", "?", ".",
	"enter", "tab", "space", "escape", "esc",
	"backspace", "delete", "home", "end",
] as const;

export type Key = (typeof KEYS)[number];

const KEY_SET: ReadonlySet<string> = new Set(KEYS);

export function isKey(value: string): value is Key {
	return KEY_SET.has(value);
}

// 合法的修饰键组合集合（与 ModifierKeys 类型保持一致）
const MODIFIER_KEY_SET: ReadonlySet<string> = new Set([
	"ctrl",
	"alt",
	"shift",
	"ctrl+shift",
	"alt+shift",
	"ctrl+alt",
	"ctrl+alt+shift",
]);

/**
 * 判断字符串是否为合法的快捷键组合（ShortcutKey）：
 * - 单个按键（如 "a"、"space"）
 * - 修饰键 + 按键（如 "ctrl+z"、"ctrl+shift+a"）
 */
export function isShortcutKey(value: string): value is ShortcutKey {
	if (isKey(value)) return true;
	// 按键本身不含 "+"，故按最后一个 "+" 拆分修饰键与按键
	const lastPlus = value.lastIndexOf("+");
	if (lastPlus === -1) return false;
	const modifiers = value.slice(0, lastPlus);
	const key = value.slice(lastPlus + 1);
	return MODIFIER_KEY_SET.has(modifiers) && isKey(key);
}

export type ModifierBasedShortcutKey = `${ModifierKeys}+${Key}`;
// Singular keybindings (these will be disabled when an input-ish area has been focused)
export type SingleCharacterShortcutKey = `${Key}`;

export type ShortcutKey = ModifierBasedShortcutKey | SingleCharacterShortcutKey;

export type KeybindingConfig = {
	[key in ShortcutKey]?: TActionWithOptionalArgs;
};
