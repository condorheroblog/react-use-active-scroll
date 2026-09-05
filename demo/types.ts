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

export interface TOCData {
	menuItems: MenuItem[]
	/** 演示应用透传给核心包 useActiveScroll 的目标集合 */
	targets: string[] | HTMLElement[]
	/** 容器滚动场景下，演示应用持有的容器 ref */
	containerRef?: React.RefObject<HTMLElement | null>
	/** 固定头部场景下，演示应用通过 options 透传的核心包配置 */
	overlayHeight?: number
}
