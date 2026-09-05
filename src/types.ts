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
	 * 是否在到达滚动区域顶部时强制激活第一个目标。
	 * @default true
	 */
	jumpToFirst?: boolean

	/**
	 * 是否在到达滚动区域底部时强制激活最后一个目标。
	 * @default true
	 */
	jumpToLast?: boolean

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
	 * 是否在滚动过程中通过 history.replaceState 同步替换 URL hash。
	 * @default false
	 */
	replaceHash?: boolean

	/**
	 * 边缘目标的额外偏移。
	 */
	edgeOffset?: {
		/**
		 * 第一个目标的额外偏移，单位 px。
		 * @default 100
		 */
		first?: number

		/**
		 * 最后一个目标的额外偏移，单位 px。
		 * @default -100
		 */
		last?: number
	}

	/**
	 * 滚动边界偏移。
	 */
	boundaryOffset?: {
		/**
		 * 向上滚动时的边界偏移，单位 px。
		 * @default 0
		 */
		toTop?: number

		/**
		 * 向下滚动时的边界偏移，单位 px。
		 * @default 0
		 */
		toBottom?: number
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
 */
export interface ResolvedOptions extends Required<UseActiveScrollOptions> {
	edgeOffset: Required<NonNullable<UseActiveScrollOptions["edgeOffset"]>>
	boundaryOffset: Required<NonNullable<UseActiveScrollOptions["boundaryOffset"]>>
}
