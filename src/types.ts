import type { RefObject } from "react";

/**
 * @zh 滚动方向。
 * - vertical：纵向滚动（默认）
 * - horizontal：横向滚动（暂不支持 RTL）
 * @en Scroll direction.
 * - vertical: vertical scrolling (default)
 * - horizontal: horizontal scrolling (RTL not supported yet)
 */
export type Direction = "vertical" | "horizontal";

/**
 * @zh 目标集合类型。
 * 支持 ID 字符串数组、元素引用数组，或包含上述数组的 Ref。
 * @en Target collection type.
 * Accepts an array of ID strings, an array of element references, or a Ref
 * containing either array.
 */
export type Targets = string[] | HTMLElement[] | RefObject<string[] | HTMLElement[] | null>;

/**
 * @zh useActiveScroll 配置选项。
 * @en Configuration options for useActiveScroll.
 */
export interface UseActiveScrollOptions {
	/**
	 * @zh 滚动方向。
	 * - 'vertical'（默认）：纵向滚动
	 * - 'horizontal'：横向滚动（暂不支持 RTL）
	 * @en Scroll direction.
	 * - 'vertical' (default): vertical scrolling
	 * - 'horizontal': horizontal scrolling (RTL not supported yet)
	 * @default 'vertical'
	 */
	direction?: Direction

	/**
	 * @zh 滚动容器。传入 null 或含 null 的 RefObject 表示使用窗口/文档根。
	 * @en Scroll container. Pass null, or a RefObject containing null, to use
	 * the window/document root.
	 */
	root?: HTMLElement | null | RefObject<HTMLElement | null>

	/**
	 * @zh 边缘目标（首个/末个）的激活策略。
	 * @en Activation strategy for the edge targets (first/last).
	 */
	edges?: {
		/**
		 * @zh - true（默认）：始终激活第一个目标，即使未越过触发线
		 * - number：允许"无激活"；第一个目标距触发线该距离时提前激活
		 * @en - true (default): always activate the first target, even before it
		 *   crosses the trigger line
		 * - number: allows "no active target"; activates early when the first
		 *   target is this distance from the trigger line
		 */
		first?: boolean | number

		/**
		 * @zh - true（默认）：始终激活最后一个目标
		 * - number：允许"无激活"；最后一个目标末端越过触发线该距离后解除
		 * @en - true (default): always activate the last target
		 * - number: allows "no active target"; deactivates after the end of the
		 *   last target crosses the trigger line by this distance
		 */
		last?: boolean | number
	}

	/**
	 * @zh 沿滚动轴起点一侧固定遮挡物的尺寸，单位 px。
	 * 纵向为顶部遮挡高度，横向为左侧遮挡宽度。
	 * @en Size in px of the fixed overlay on the start side of the scroll axis.
	 * For vertical scrolling it is the top overlay height; for horizontal
	 * scrolling it is the left overlay width.
	 * @default 0
	 */
	overlay?: number

	/**
	 * @zh 仅在视口宽度大于等于此值时启用监听。
	 * @en Enable listeners only when the viewport width is greater than or
	 * equal to this value.
	 * @default 0
	 */
	minWidth?: number

	/**
	 * @zh 滚动过程中同步 URL hash 的方式。
	 * - 'off'：不同步 URL hash
	 * - 'replace'：通过 history.replaceState 替换当前历史记录
	 * - 'push'：通过 history.pushState 新增历史记录
	 * @en How to sync the URL hash during scrolling.
	 * - 'off': do not sync the URL hash
	 * - 'replace': replace the current history entry via history.replaceState
	 * - 'push': add a new history entry via history.pushState
	 * @default 'off'
	 */
	hash?: "off" | "replace" | "push"

	/**
	 * @zh 滚动边界偏移。传入数字时同时应用于两个方向。
	 * @en Scroll boundary offset. When a number is passed it applies to both
	 * directions.
	 */
	offset?: number | {
		/**
		 * @zh 朝滚动起点滚动时的边界偏移，单位 px。
		 * @en Boundary offset in px when scrolling toward the scroll start.
		 * @default 0
		 */
		toStart?: number

		/**
		 * @zh 朝滚动终点滚动时的边界偏移，单位 px。
		 * @en Boundary offset in px when scrolling toward the scroll end.
		 * @default 0
		 */
		toEnd?: number
	}
}

/**
 * @zh useActiveScroll 返回值。
 * @en Return value of useActiveScroll.
 */
export interface UseActiveScrollReturn {
	/**
	 * @zh 用户点击目录链接或需要屏蔽普通滚动算法时调用。
	 * @en Called when the user clicks a TOC link or when the normal scroll
	 * algorithm should be bypassed.
	 */
	setActive: (target: string | HTMLElement) => void

	/**
	 * @zh 判断给定 ID 或元素是否为当前激活目标。
	 * @en Checks whether the given ID or element is the currently active target.
	 */
	isActive: (target: string | HTMLElement) => boolean

	/**
	 * @zh 当前激活元素。
	 * @en The currently active element.
	 */
	activeEl: HTMLElement | null

	/**
	 * @zh 当前激活元素的 ID。
	 * @en The ID of the currently active element.
	 */
	activeId: string

	/**
	 * @zh 当前激活元素在排序后目标数组中的索引，未激活时为 -1。
	 * @en Index of the currently active element in the sorted targets array;
	 * -1 when nothing is active.
	 */
	activeIndex: number
}

/**
 * @zh 内部缓存的目标位置信息。
 * start / end 分别为目标沿滚动轴起点/末端方向相对于滚动根内容起点的位置。
 * @en Internally cached target position info.
 * start / end are the target's positions toward the scroll-axis start/end,
 * relative to the start of the scroll root content.
 */
export interface TargetsCache {
	els: HTMLElement[]
	start: Map<string, number>
	end: Map<string, number>
}

/**
 * @zh 合并默认值后的完整配置类型。
 * - edges 已归一化：true 表示强制激活；数字表示边缘偏移距离（false 视为 0）。
 * - offset 已归一化为对象形式（传入数字时拆分到两个方向）。
 * @en Full configuration type after merging with defaults.
 * - edges is normalized: true means forced activation; a number means the edge
 *   offset distance (false is treated as 0).
 * - offset is normalized to object form (a number input is split across both
 *   directions).
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
