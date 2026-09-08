/**
 * 演示应用自身类型定义。
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
	scrollBehavior: 'smooth' | 'auto'
	setScrollBehavior: (value: 'smooth' | 'auto') => void
	clickType: 'native' | 'custom'
	setClickType: (value: 'native' | 'custom') => void
}

export interface DemoButtons {
	shiftSection: () => void
	pushSection: () => void
}

/**
 * 传递给核心包 useActiveScroll 的演示配置。
 * 包含所有选项，页面按需透传。
 */
export interface TOCData {
	menuItems: MenuItem[]
	/** 演示应用透传给核心包 useActiveScroll 的目标集合 */
	targets: string[] | HTMLElement[]
	/** 容器滚动场景下，演示应用持有的容器 ref */
	containerRef?: React.RefObject<HTMLElement | null>
	/** 固定头部场景下，演示应用通过 options 透传的核心包配置 */
	overlayHeight?: number
	/** URL hash 同步方式 */
	hash?: 'off' | 'replace' | 'push'
	/** 边缘目标（首个/末个）的激活策略 */
	edges?: { first?: boolean | number; last?: boolean | number }
	/** 仅在视口宽度大于等于此值时启用监听 */
	minWidth?: number
	/** 滚动边界偏移，数字形式同时应用于两个方向 */
	offset?: number | { toStart?: number; toEnd?: number }
}

/**
 * EdgeBoundary 页面使用的本地偏移状态。
 */
export interface EdgeBoundaryOptions {
	edgeFirst: number
	edgeLast: number
	offsetToStart: number
	offsetToEnd: number
}

/**
 * Edges 页面使用的本地开关状态。
 */
export interface EdgesOptions {
	first: boolean
	last: boolean
}
