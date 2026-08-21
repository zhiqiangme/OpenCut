// opencut-wasm 的 server 端 stub
// 用途：webpack 的 server 构建时通过 resolve.alias 将 "opencut-wasm" 替换为本文件，
// 避免 SSR prerender 时加载 .wasm 文件失败（opencut-wasm 在模块顶层 import wasm 并初始化）。
// 仅提供时间/时间码等纯计算函数的简化实现，GPU 渲染函数为空实现（server 端不会调用）。

export interface FloorToFrameOptions {
	time: MediaTime;
	rate: FrameRate;
}

export interface FormatTimecodeOptions {
	time: MediaTime;
	format?: TimeCodeFormat;
	rate?: FrameRate;
}

export interface FrameRate {
	numerator: number;
	denominator: number;
}

export interface GuessTimecodeFormatOptions {
	timeCode: string;
}

export interface IsFrameAlignedOptions {
	time: MediaTime;
	rate: FrameRate;
}

export interface LastFrameTimeOptions {
	duration: MediaTime;
	rate: FrameRate;
}

export interface MediaTimeAddOptions {
	lhs: MediaTime;
	rhs: MediaTime;
}

export interface MediaTimeClampOptions {
	time: MediaTime;
	min: MediaTime;
	max: MediaTime;
}

export interface MediaTimeFromFrameOptions {
	frame: number;
	rate: FrameRate;
}

export interface MediaTimeFromSecondsOptions {
	seconds: number;
}

export interface MediaTimeMaxOptions {
	lhs: MediaTime;
	rhs: MediaTime;
}

export interface MediaTimeMinOptions {
	lhs: MediaTime;
	rhs: MediaTime;
}

export interface MediaTimeSubOptions {
	lhs: MediaTime;
	rhs: MediaTime;
}

export interface MediaTimeToFrameOptions {
	time: MediaTime;
	rate: FrameRate;
}

export interface MediaTimeToSecondsOptions {
	time: MediaTime;
}

export interface ParseTimecodeOptions {
	timeCode: string;
	format?: TimeCodeFormat;
	rate?: FrameRate;
}

export interface RoundToFrameOptions {
	time: MediaTime;
	rate: FrameRate;
}

export interface SnappedSeekTimeOptions {
	time: MediaTime;
	duration: MediaTime;
	rate: FrameRate;
}

export type MediaTime = number;

export type TimeCodeFormat =
	| "MM:SS"
	| "HH:MM:SS"
	| "HH:MM:SS:CS"
	| "HH:MM:SS:FF";

// 与 rust/crates/time/src/media_time.rs 的 TICKS_PER_SECOND 保持一致
const TICKS = 120_000;

export function TICKS_PER_SECOND(): number {
	return TICKS;
}

// —— 纯计算函数（server 端 render 可能用到，提供等价实现） ——

export function formatTimecode({
	time,
}: FormatTimecodeOptions): string | undefined {
	const totalSeconds = Math.floor(time / TICKS);
	const minutes = Math.floor(totalSeconds / 60);
	const seconds = totalSeconds % 60;
	const pad = (n: number) => String(n).padStart(2, "0");
	return `${pad(minutes)}:${pad(seconds)}`;
}

export function mediaTimeToSeconds({ time }: MediaTimeToSecondsOptions): number {
	return time / TICKS;
}

export function mediaTimeFromSeconds({
	seconds,
}: MediaTimeFromSecondsOptions): MediaTime | undefined {
	return Math.round(seconds * TICKS);
}

export function mediaTimeAdd({ lhs, rhs }: MediaTimeAddOptions): MediaTime {
	return lhs + rhs;
}

export function mediaTimeSub({ lhs, rhs }: MediaTimeSubOptions): MediaTime {
	return lhs - rhs;
}

export function mediaTimeMax({ lhs, rhs }: MediaTimeMaxOptions): MediaTime {
	return lhs > rhs ? lhs : rhs;
}

export function mediaTimeMin({ lhs, rhs }: MediaTimeMinOptions): MediaTime {
	return lhs < rhs ? lhs : rhs;
}

export function mediaTimeClamp({
	time,
	min,
	max,
}: MediaTimeClampOptions): MediaTime {
	return Math.min(max, Math.max(min, time));
}

export function roundToFrame({ time }: RoundToFrameOptions): MediaTime | undefined {
	return time;
}

export function floorToFrame({ time }: FloorToFrameOptions): MediaTime | undefined {
	return time;
}

export function snappedSeekTime({ time }: SnappedSeekTimeOptions): MediaTime | undefined {
	return time;
}

export function lastFrameTime({ duration }: LastFrameTimeOptions): MediaTime | undefined {
	return duration;
}

export function mediaTimeFromFrame({
	frame,
	rate,
}: MediaTimeFromFrameOptions): MediaTime | undefined {
	return Math.round((frame * rate.denominator * TICKS) / rate.numerator);
}

export function mediaTimeToFrame({
	time,
	rate,
}: MediaTimeToFrameOptions): bigint | undefined {
	return BigInt(Math.round((time * rate.numerator) / (rate.denominator * TICKS)));
}

export function isFrameAligned(): boolean | undefined {
	return true;
}

export function guessTimecodeFormat(): TimeCodeFormat | undefined {
	return "MM:SS";
}

export function parseTimecode(): MediaTime | undefined {
	return undefined;
}

// —— GPU 渲染函数（server 端不调用，空实现） ——

export function applyEffectPasses(): never {
	throw new Error("applyEffectPasses is not available on the server");
}

export function applyMaskFeather(): never {
	throw new Error("applyMaskFeather is not available on the server");
}

export function getCompositorCanvas(): never {
	throw new Error("getCompositorCanvas is not available on the server");
}

export function getLastFrameProfile(): never {
	throw new Error("getLastFrameProfile is not available on the server");
}

export function initCompositor(): void {}

export function initializeGpu(): Promise<void> {
	return Promise.resolve();
}

export function releaseTexture(): void {}

export function renderFrame(): void {}

export function resizeCompositor(): void {}

export function uploadTexture(): void {}
