/**
 * @zh 演示应用自身类型定义。
 * @en Type definitions for the demo app itself.
 */

export interface Section {
	id: string
	title: string
	text: string
}

export interface MenuItem {
	label: string
	href: string
}

export interface DemoRadios {
	scrollBehavior: "smooth" | "auto"
	setScrollBehavior: (value: "smooth" | "auto") => void
	clickType: "native" | "custom"
	setClickType: (value: "native" | "custom") => void
}

export interface DemoButtons {
	shiftSection: () => void
	pushSection: () => void
}

/**
 * @zh 传递给核心包 useActiveScroll 的演示配置。
 * 包含所有选项，页面按需透传。
 * @en Demo config passed to the core useActiveScroll.
 * Contains all options; pages pass them through as needed.
 */
export interface TOCData {
	menuItems: MenuItem[]
	/** @zh 演示应用透传给核心包 useActiveScroll 的目标集合 @en Targets passed through to the core useActiveScroll by the demo */
	targets: string[] | HTMLElement[]
	/** @zh 容器滚动场景下，演示应用持有的容器 ref @en Container ref held by the demo for container-scroll scenarios */
	containerRef?: React.RefObject<HTMLElement | null>
	/** @zh 滚动方向，透传给核心包 direction 选项 @en Scroll direction, passed through to the core direction option */
	direction?: "vertical" | "horizontal"
	/** @zh 沿滚动轴起点一侧固定遮挡物尺寸，透传给核心包 overlay 选项 @en Size of the fixed overlay on the start side of the scroll axis, passed to the core overlay option */
	overlay?: number
	/** @zh URL hash 同步方式 @en URL hash sync mode */
	hash?: "off" | "replace" | "push"
	/** @zh 边缘目标（首个/末个）的激活策略 @en Activation strategy for edge targets (first/last) */
	edges?: { first?: boolean | number, last?: boolean | number }
	/** @zh CSS 媒体查询，仅在查询匹配期间启用监听；未传或非法时始终启用 @en CSS media query; listeners are enabled only while it matches, and stay always enabled when omitted or invalid */
	mediaQuery?: string
	/** @zh 滚动边界偏移，数字形式同时应用于两个方向 @en Scroll boundary offset; a number applies to both directions */
	offset?: number | { toStart?: number, toEnd?: number }
}

/**
 * @zh EdgeBoundary 页面使用的本地偏移状态。
 * @en Local offset state used by the EdgeBoundary page.
 */
export interface EdgeBoundaryOptions {
	edgeFirst: number
	edgeLast: number
	offsetToStart: number
	offsetToEnd: number
}

/**
 * @zh Edges 页面使用的本地开关状态。
 * @en Local toggle state used by the Edges page.
 */
export interface EdgesOptions {
	first: boolean
	last: boolean
}
