import type { RefObject } from "react";
import type { ResolvedOptions, Targets, TargetsCache, UseActiveScrollOptions } from "./types";

export const FIXED_OFFSET = 10;
export const SCROLLBAR_WIDTH = 17;
export const IDLE_FRAMES = 20;
export const MOUNT_IDLE_FRAMES = 10;

export const defaultOptions: ResolvedOptions = {
	root: null,
	edges: { first: true, last: true },
	overlayHeight: 0,
	minWidth: 0,
	hash: "off",
	offset: { toStart: 0, toEnd: 0 },
};

/**
 * 解析用户传入的 targets，统一转换为 HTMLElement 数组。
 */
export function resolveTargets(userTargets: Targets): HTMLElement[] {
	if (!Array.isArray(userTargets)) {
		const refValue = (userTargets as RefObject<string[] | HTMLElement[] | null>).current;
		if (!refValue)
			return [];
		return resolveTargets(refValue);
	}

	if (userTargets.length === 0)
		return [];

	if (userTargets[0] instanceof HTMLElement) {
		return [...(userTargets as HTMLElement[])];
	}

	return (userTargets as string[])
		.map(id => document.getElementById(id))
		.filter((el): el is HTMLElement => el !== null);
}

/**
 * 取数组最后一项。
 */
export function last<T>(arr: T[]): T | undefined {
	return arr[arr.length - 1];
}

/**
 * 判断目标集合是否为 Ref 对象。
 */
export function isRefObject(value: Targets): value is RefObject<string[] | HTMLElement[] | null> {
	return value !== null && typeof value === "object" && "current" in value;
}

/**
 * 归一化边缘策略：true 保持强制激活；数字原样保留；false 视为 0（无提前量）。
 */
function resolveEdge(value: boolean | number | undefined, fallback: true | number): true | number {
	if (value === undefined)
		return fallback;
	if (value === false)
		return 0;
	return value;
}

/**
 * 将用户选项与默认值合并为完整配置。
 * 注意：必须逐字段使用 ?? 合并，浅展开（...options）会让显式传入的
 * undefined 覆盖默认值，例如 minWidth: undefined 会生成非法媒体查询。
 */
export function resolveOptions(options: UseActiveScrollOptions = {}): ResolvedOptions {
	return {
		root: options.root ?? defaultOptions.root,
		edges: {
			first: resolveEdge(options.edges?.first, defaultOptions.edges.first),
			last: resolveEdge(options.edges?.last, defaultOptions.edges.last),
		},
		overlayHeight: options.overlayHeight ?? defaultOptions.overlayHeight,
		minWidth: options.minWidth ?? defaultOptions.minWidth,
		hash: options.hash ?? defaultOptions.hash,
		offset: typeof options.offset === "number"
			? { toStart: options.offset, toEnd: options.offset }
			: {
				toStart: options.offset?.toStart ?? defaultOptions.offset.toStart,
				toEnd: options.offset?.toEnd ?? defaultOptions.offset.toEnd,
			},
	};
}

/**
 * 获取当前滚动位置。
 */
export function getCurrentY(isWindowRoot: boolean, rootEl: HTMLElement): number {
	return isWindowRoot ? window.scrollY : rootEl.scrollTop;
}

/**
 * 获取哨兵值，即视口顶部相对于文档的位置。
 */
export function getSentinel(isWindowRoot: boolean, rootEl: HTMLElement): number {
	return isWindowRoot
		? rootEl.getBoundingClientRect().top
		: -rootEl.scrollTop;
}

/**
 * 检测滚动容器是否到达顶部或底部边界。
 */
export function getEdges(rootEl: HTMLElement, isWindowRoot: boolean): { isTop: boolean, isBottom: boolean } {
	const clientHeight = isWindowRoot ? window.innerHeight : rootEl.clientHeight;
	const isTop = rootEl.scrollTop <= FIXED_OFFSET * 2;
	const isBottom = Math.abs(rootEl.scrollHeight - clientHeight - rootEl.scrollTop) <= 1;
	return { isTop, isBottom };
}

/**
 * 缓存目标元素及其相对于滚动根的位置。
 */
export function prepareTargets(
	userTargets: Targets,
	rootEl: HTMLElement,
	isWindowRoot: boolean,
	targetsRef: RefObject<TargetsCache>,
): void {
	const _targets: HTMLElement[] = resolveTargets(userTargets);

	_targets.sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top);

	targetsRef.current.els = _targets;

	const rootTop = rootEl.getBoundingClientRect().top - (isWindowRoot ? 0 : rootEl.scrollTop);

	targetsRef.current.top.clear();
	targetsRef.current.bottom.clear();

	_targets.forEach((target) => {
		const { top, bottom } = target.getBoundingClientRect();
		const id = target.id || Math.random().toString(36).slice(2, 11);
		targetsRef.current.top.set(id, top - rootTop);
		targetsRef.current.bottom.set(id, bottom - rootTop);
	});
}
