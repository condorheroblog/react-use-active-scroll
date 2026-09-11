import { createContext, useContext, useEffect, useMemo } from 'react'
import { useActiveScroll, type UseActiveScrollOptions } from 'react-use-active-scroll'
import type { DemoConfig, MenuItem } from '../types'

/**
 * @zh 统一演示上下文。
 * 整个应用只调用一次 useActiveScroll（在 DemoProvider 内），
 * 目录、返回值面板、阈值参考线等所有消费者共享同一份激活状态，
 * 避免多实例重复同步 URL hash。
 * @en Unified demo context.
 * useActiveScroll is called exactly once in the whole app (inside DemoProvider);
 * the TOC, return-value panel, threshold lines and all other consumers share
 * the same active state, avoiding duplicate URL hash sync from multiple instances.
 */
export interface DemoContextValue {
	config: DemoConfig
	/** @zh 滚动容器元素；null 表示窗口/文档根滚动 @en Scroll container element; null means window/document-root scrolling */
	rootEl: HTMLElement | null
	targets: string[]
	menuItems: MenuItem[]
	/**
	 * @zh 实际传给核心包的 overlay 值。
	 * 窗口纵向滚动时自动计入应用顶部固定导航栏（59px），其余场景即演示遮挡物尺寸。
	 * @en The overlay value actually passed to the core package.
	 * In vertical window mode it automatically includes the app's fixed top nav (59px);
	 * in all other cases it is the demo overlay size.
	 */
	effectiveOverlay: number
	activeId: string
	activeIndex: number
	activeElement: HTMLElement | null
	isActive: (target: string | HTMLElement) => boolean
	setActive: (target: string | HTMLElement) => void
	/**
	 * @zh 核心包内置触发线调试覆盖层节点：窗口模式挂在 PageLayout，容器模式挂在容器包裹层。
	 * @en The core package's built-in trigger-line debug overlay node: mounted in PageLayout in window mode, and inside the container wrapper in container mode.
	 */
	devtools: React.ReactNode
	pushSection: () => void
	shiftSection: () => void
}

const DemoContext = createContext<DemoContextValue | null>(null)

/** @zh 读取演示上下文，必须在 DemoProvider 内使用 @en Read the demo context; must be used within DemoProvider */
export function useDemo(): DemoContextValue {
	const ctx = useContext(DemoContext)
	if (!ctx) throw new Error('useDemo must be used within DemoProvider')
	return ctx
}

interface DemoProviderProps {
	config: DemoConfig
	rootEl: HTMLElement | null
	targets: string[]
	menuItems: MenuItem[]
	effectiveOverlay: number
	pushSection: () => void
	shiftSection: () => void
	children: React.ReactNode
}

/**
 * @zh 演示数据提供者：把面板配置归一化为核心包选项，调用一次 useActiveScroll，
 * 并将配置、目标集合与返回值统一下发。
 * 同时把演示层的 scroll-behavior 写入 --ScrollBehavior CSS 变量
 * （native 模式跟随 smooth/auto，custom 模式强制 auto 以免与 JS 动画冲突）。
 * @en Demo data provider: normalizes panel config into core options, calls
 * useActiveScroll once, and distributes the config, targets and return values.
 * It also writes the demo-level scroll-behavior to the --ScrollBehavior CSS
 * variable (native follows smooth/auto; custom forces auto to avoid conflicting
 * with the JS animation).
 */
export function DemoProvider({
	config,
	rootEl,
	targets,
	menuItems,
	effectiveOverlay,
	pushSection,
	shiftSection,
	children,
}: DemoProviderProps) {
	// @zh 稳定 options 对象引用：依赖全部为原始值/元素引用，配置变化才重建。
	// @en Stabilize the options object reference: deps are all primitives/element refs, rebuilt only when config changes.
	const options = useMemo<UseActiveScrollOptions>(
		() => ({
			root: config.rootMode === 'container' ? rootEl : null,
			direction: config.direction,
			overlay: effectiveOverlay,
			hash: config.hash,
			mediaQuery: config.mediaQueryEnabled ? config.mediaQuery : '',
			edges: {
				first: config.edgesFirstMode === 'force' ? true : config.edgesFirstValue,
				last: config.edgesLastMode === 'force' ? true : config.edgesLastValue,
			},
			offset: { toStart: config.offsetToStart, toEnd: config.offsetToEnd },
			debug: true,
		}),
		[
			config.rootMode,
			config.direction,
			effectiveOverlay,
			config.hash,
			config.mediaQueryEnabled,
			config.mediaQuery,
			config.edgesFirstMode,
			config.edgesFirstValue,
			config.edgesLastMode,
			config.edgesLastValue,
			config.offsetToStart,
			config.offsetToEnd,
			rootEl,
		],
	)

	// @zh ====== 全应用唯一一处调用核心包 Hook ======
	// @en ====== The single place in the whole app that calls the core hook ======
	const { activeId, activeIndex, activeElement, isActive, setActive, devtools } = useActiveScroll(targets, options)

	// @zh native 模式由 CSS scroll-behavior 控制；custom 模式由 JS 动画库接管，
	// 容器滚动场景需要把 scroll-behavior 设为 auto，避免与 JS 动画冲突。
	// @en In native mode CSS scroll-behavior controls scrolling; in custom mode the JS animation
	// library takes over, so scroll-behavior is set to auto to avoid conflicting with JS animation.
	useEffect(() => {
		document.documentElement.style.setProperty(
			'--ScrollBehavior',
			config.clickType === 'custom' ? 'auto' : config.scrollBehavior,
		)
	}, [config.clickType, config.scrollBehavior])

	const value = useMemo<DemoContextValue>(
		() => ({
			config,
			rootEl,
			targets,
			menuItems,
			effectiveOverlay,
			activeId,
			activeIndex,
			activeElement,
			isActive,
			setActive,
			devtools,
			pushSection,
			shiftSection,
		}),
		[
			config,
			rootEl,
			targets,
			menuItems,
			effectiveOverlay,
			activeId,
			activeIndex,
			activeElement,
			isActive,
			setActive,
			devtools,
			pushSection,
			shiftSection,
		],
	)

	return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>
}
