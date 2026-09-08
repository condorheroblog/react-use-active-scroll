import type { RefObject } from "react";

/**
 * 目标集合类型。
 * 支持 ID 字符串数组、元素引用数组，或包含上述数组的 Ref。
 */
export type Targets = string[] | HTMLElement[] | RefObject<string[] | HTMLElement[] | null>;

/**
 * useActiveScroll 配置选项。
 */
export interface UseActiveScrollOptions {
	/**
	 * 滚动容器。传入 null 或含 null 的 RefObject 表示使用窗口/文档根。
	 */
	root?: HTMLElement | null | RefObject<HTMLElement | null>

	/**
	 * 边缘目标（首个/末个）的激活策略。
	 */
	edges?: {
		/**
		 * - true（默认）：始终激活第一个目标，即使未越过触发线
		 * - number：允许"无激活"；第一个目标距触发线该距离时提前激活
		 */
		first?: boolean | number

		/**
		 * - true（默认）：始终激活最后一个目标
		 * - number：允许"无激活"；最后一个目标底部越过触发线该距离后解除
		 */
		last?: boolean | number
	}

	/**
	 * 顶部固定遮挡物高度，单位 px。
	 * @default 0
	 */
	overlayHeight?: number

	/**
	 * 仅在视口宽度大于等于此值时启用监听。
	 * @default 0
	 */
	minWidth?: number

	/**
	 * 滚动过程中同步 URL hash 的方式。
	 * - 'off'：不同步 URL hash
	 * - 'replace'：通过 history.replaceState 替换当前历史记录
	 * - 'push'：通过 history.pushState 新增历史记录
	 * @default 'off'
	 */
	hash?: "off" | "replace" | "push"

	/**
	 * 滚动边界偏移。传入数字时同时应用于两个方向。
	 */
	offset?: number | {
		/**
		 * 向上滚动（朝滚动起点）时的边界偏移，单位 px。
		 * @default 0
		 */
		toStart?: number

		/**
		 * 向下滚动（朝滚动终点）时的边界偏移，单位 px。
		 * @default 0
		 */
		toEnd?: number
	}
}

/**
 * useActiveScroll 返回值。
 */
export interface UseActiveScrollReturn {
	/**
	 * 用户点击目录链接或需要屏蔽普通滚动算法时调用。
	 */
	setActive: (target: string | HTMLElement) => void

	/**
	 * 判断给定 ID 或元素是否为当前激活目标。
	 */
	isActive: (target: string | HTMLElement) => boolean

	/**
	 * 当前激活元素。
	 */
	activeEl: HTMLElement | null

	/**
	 * 当前激活元素的 ID。
	 */
	activeId: string

	/**
	 * 当前激活元素在排序后目标数组中的索引，未激活时为 -1。
	 */
	activeIndex: number
}

/**
 * 内部缓存的目标位置信息。
 */
export interface TargetsCache {
	els: HTMLElement[]
	top: Map<string, number>
	bottom: Map<string, number>
}

/**
 * 合并默认值后的完整配置类型。
 * - edges 已归一化：true 表示强制激活；数字表示边缘偏移距离（false 视为 0）。
 * - offset 已归一化为对象形式（传入数字时拆分到两个方向）。
 */
export interface ResolvedOptions extends Omit<Required<UseActiveScrollOptions>, "edges" | "offset"> {
	edges: {
		first: true | number
		last: true | number
	}
	offset: {
		toStart: number
		toEnd: number
	}
}
