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
	/** 是否同步 URL hash */
	replaceHash?: boolean
	/** 到达顶部时是否强制激活第一个目标 */
	jumpToFirst?: boolean
	/** 到达底部时是否强制激活最后一个目标 */
	jumpToLast?: boolean
	/** 仅在视口宽度大于等于此值时启用监听 */
	minWidth?: number
	/** 边缘目标额外偏移 */
	edgeOffset?: { first?: number; last?: number }
	/** 滚动边界偏移 */
	boundaryOffset?: { toTop?: number; toBottom?: number }
}

/**
 * EdgeBoundary 页面使用的本地偏移状态。
 */
export interface EdgeBoundaryOptions {
	edgeFirst: number
	edgeLast: number
	boundaryTop: number
	boundaryBottom: number
}

/**
 * JumpToggles 页面使用的本地开关状态。
 */
export interface JumpToggleOptions {
	jumpToFirst: boolean
	jumpToLast: boolean
}
