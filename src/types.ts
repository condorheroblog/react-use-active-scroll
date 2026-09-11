import type { ReactNode, RefObject } from "react";

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
 * @zh 触发线调试覆盖层配置。
 * 仅在需要可视化调试时传入；颜色通过 CSS 变量定制，见 README "Debug overlay"。
 * @en Trigger-line debug overlay options.
 * Pass it only when visual debugging is needed; colors are customized via CSS
 * variables, see "Debug overlay" in the README.
 */
export interface DebugOptions {
	/**
	 * @zh 是否显示文字标签（滚动方向与触发位置 px）。
	 * @en Whether to show text labels (scroll direction and the trigger
	 * position in px).
	 * @default true
	 */
	label?: boolean

	/**
	 * @zh 覆盖层 wrapper 的附加 className，便于进一步自定义定位与样式。
	 * @en Extra className on the overlay wrapper for further positioning and
	 * style customization.
	 * @default ''
	 */
	className?: string
}

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
	 * @zh CSS 媒体查询，如 '(min-width: 768px)'。
	 * 传入且语法合法时，仅在查询匹配期间启用监听；语法非法或未传时
	 * 门控不生效，始终启用监听。
	 * @en CSS media query, e.g. '(min-width: 768px)'.
	 * When provided and syntactically valid, listeners are enabled only while
	 * the query matches; an invalid or missing query disables this gating and
	 * listeners stay always enabled.
	 * @default ''
	 */
	mediaQuery?: string

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

	/**
	 * @zh 触发线调试覆盖层。
	 * - true：渲染调试覆盖层（等价于 {}）
	 * - false（默认）：不渲染，返回值 devtools 为 null
	 * - 对象：细调标签与 className
	 * 开启后需把返回值中的 devtools 节点渲染到树中：窗口滚动场景放在任意位置
	 * （fixed 定位）；容器滚动场景放在滚动容器的兄弟节点，且外层包裹元素
	 * 需要 position: relative。
	 * @en Trigger-line debug overlay.
	 * - true: render the debug overlay (equivalent to {})
	 * - false (default): do not render; the returned devtools node is null
	 * - object: fine-tune the label and className
	 * When enabled, render the returned devtools node in your tree: anywhere
	 * for window scrolling (fixed positioning); for container scrolling, as a
	 * sibling of the scroll container inside a position: relative wrapper.
	 * @default false
	 */
	debug?: boolean | DebugOptions
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
	activeElement: HTMLElement | null

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

	/**
	 * @zh 触发线调试覆盖层节点；未开启 debug 选项时为 null。
	 * 窗口滚动场景渲染在树中任意位置即可；容器滚动场景需放在滚动容器的
	 * 兄弟节点，且外层包裹元素需要 position: relative。
	 * @en The trigger-line debug overlay node; null when the debug option is
	 * disabled. Render it anywhere in the tree for window scrolling; for
	 * container scrolling, place it as a sibling of the scroll container
	 * inside a position: relative wrapper.
	 */
	devtools: ReactNode
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
 * - debug 已归一化：false 表示关闭；对象形式包含完整的标签与 className 配置。
 * @en Full configuration type after merging with defaults.
 * - edges is normalized: true means forced activation; a number means the edge
 *   offset distance (false is treated as 0).
 * - offset is normalized to object form (a number input is split across both
 *   directions).
 * - debug is normalized: false means disabled; the object form carries the
 *   full label and className config.
 */
export interface ResolvedOptions extends Omit<Required<UseActiveScrollOptions>, "edges" | "offset" | "debug"> {
	edges: {
		first: true | number
		last: true | number
	}
	offset: {
		toStart: number
		toEnd: number
	}
	debug: false | {
		label: boolean
		className: string
	}
}
