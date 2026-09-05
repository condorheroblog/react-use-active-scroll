import { useContext } from 'react'
import { TOCDataContext } from '../pages/PageShell'

/**
 * 滚动触发阈值参考线。
 * 帮助用户直观看到核心包判定当前激活目标时所用的阈值位置。
 * overlayHeight + FIXED_OFFSET(10) 即核心包内部的实际触发位置。
 */
export function ScanLine() {
	const tocData = useContext(TOCDataContext)
	const overlayHeight = tocData?.overlayHeight ?? 0
	const containerRef = tocData?.containerRef

	// 容器滚动场景在页面自身内部渲染参考线，避免全局固定定位错位。
	if (containerRef) return null

	const top = overlayHeight + 10

	return (
		<div
			className="pointer-events-none fixed left-0 right-0 z-20 border-t border-dashed border-accent"
			style={{ top: `${top}px` }}
			aria-hidden="true"
		>
			<div className="mx-auto flex max-w-7xl justify-end px-4">
				<span className="-translate-y-1/2 rounded-sm border border-dashed border-accent bg-bg px-1.5 py-0.5 text-[10px] text-accent">
					trigger line ({top}px)
				</span>
			</div>
		</div>
	)
}
