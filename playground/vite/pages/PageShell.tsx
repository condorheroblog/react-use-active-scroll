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
 * 统一页面包装器。
 * 注入 TOCDataContext 与 DemoButtonsContext，并渲染公共布局。
 * extraControls 用于页面级局部选项（如 EdgeBoundary 的偏移滑块）。
 *
 * 注意：tocData / demoButtons 在内部 useMemo 稳定引用，
 * 避免核心库 useActiveScroll 因 props 引用变化而反复清理激活态。
 */
export function PageShell({ children, tocData, demoButtons, extraControls }: PageShellProps) {
	// 将 offset 归一化为两个方向的原始值，作为稳定引用的比较依赖。
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
		tocData.overlayHeight,
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

	return (
		<TOCDataContext.Provider value={stableTocData}>
			<DemoButtonsContext.Provider value={stableDemoButtons}>
				<PageLayout extraControls={extraControls}>{children}</PageLayout>
			</DemoButtonsContext.Provider>
		</TOCDataContext.Provider>
	)
}
