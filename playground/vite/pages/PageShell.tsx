import { createContext, useMemo } from 'react'
import { PageLayout } from '../components/PageLayout'
import type { DemoButtons, TOCData } from '../types'

export const TOCDataContext = createContext<TOCData | null>(null)
export const DemoButtonsContext = createContext<DemoButtons | null>(null)

interface PageShellProps {
	children: React.ReactNode
	tocData: TOCData
	demoButtons: DemoButtons
	extraControls?: React.ReactNode
}

/**
 * @zh 统一页面包装器。
 * 注入 TOCDataContext 与 DemoButtonsContext，并渲染公共布局。
 * extraControls 用于页面级局部选项（如 EdgeBoundary 的偏移滑块）。
 *
 * 注意：tocData / demoButtons 在内部 useMemo 稳定引用，
 * 避免核心库 useActiveScroll 因 props 引用变化而反复清理激活态。
 * @en Unified page wrapper.
 * Injects TOCDataContext and DemoButtonsContext and renders the shared layout.
 * extraControls is for page-level local options (e.g. EdgeBoundary's offset sliders).
 *
 * Note: tocData / demoButtons have their references stabilized via useMemo internally,
 * so the core useActiveScroll does not repeatedly clear the active state due to changing props references.
 */
export function PageShell({ children, tocData, demoButtons, extraControls }: PageShellProps) {
	// @zh 将 offset 归一化为两个方向的原始值，作为稳定引用的比较依赖。
	// @en Normalize offset into raw values for both directions, used as comparison deps for the stable reference.
	const offsetToStart = typeof tocData.offset === 'number'
		? tocData.offset
		: tocData.offset?.toStart
	const offsetToEnd = typeof tocData.offset === 'number'
		? tocData.offset
		: tocData.offset?.toEnd

	const stableTocData = useMemo(() => tocData, [
		tocData.menuItems,
		tocData.targets,
		tocData.containerRef,
		tocData.direction,
		tocData.overlay,
		tocData.hash,
		tocData.minWidth,
		tocData.edges?.first,
		tocData.edges?.last,
		offsetToStart,
		offsetToEnd,
	])
	const stableDemoButtons = useMemo(
		() => demoButtons,
		[demoButtons.shiftSection, demoButtons.pushSection],
	)

	// @zh 窗口横向滚动场景：文档整体横向滚动，sticky 侧边栏会随文档滚出视口，
	// 通知布局改为 fixed 定位保持目录常驻。
	// @en Window horizontal-scroll scenario: the document scrolls horizontally as a whole and the sticky
	// sidebar would scroll out of the viewport, so tell the layout to switch to fixed positioning to keep the TOC persistent.
	const fixedSidebar = tocData.direction === 'horizontal' && !tocData.containerRef

	return (
		<TOCDataContext.Provider value={stableTocData}>
			<DemoButtonsContext.Provider value={stableDemoButtons}>
				<PageLayout extraControls={extraControls} fixedSidebar={fixedSidebar}>
					{children}
				</PageLayout>
			</DemoButtonsContext.Provider>
		</TOCDataContext.Provider>
	)
}
