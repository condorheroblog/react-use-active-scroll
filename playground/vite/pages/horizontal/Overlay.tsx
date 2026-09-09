import { useMemo, useRef } from 'react'
import { PageShell } from '../PageShell'
import { useFakeData } from '../../hooks/useFakeData'

const OVERLAY_WIDTH = 180

/**
 * @zh 横向 Overlay 页面。
 * 演示 overlay 选项在横向滚动下的语义：
 * 左侧固定面板悬浮于滚动容器起点一侧，核心包把其宽度计入激活阈值。
 * @en Horizontal Overlay page.
 * Demonstrates the meaning of the overlay option under horizontal scrolling:
 * a fixed panel on the left floats over the starting side of the scroll container, and the core package counts its width into the activation threshold.
 */
export function Overlay() {
	const { sections, menuItems, pushSection, shiftSection } = useFakeData()
	const containerRef = useRef<HTMLDivElement>(null)
	const targets = useMemo(() => sections.map(s => s.id), [sections])

	return (
		<PageShell
			tocData={{
				menuItems,
				targets,
				containerRef,
				direction: 'horizontal',
				overlay: OVERLAY_WIDTH,
			}}
			demoButtons={{ pushSection, shiftSection }}
		>
			<div className="mx-auto max-w-4xl">
				<p className="mb-4 text-sm text-muted">
					左侧固定面板宽 {OVERLAY_WIDTH}px，悬浮于横向滚动容器之上。核心包通过 overlay
					选项将面板宽度纳入激活阈值：完全被面板遮挡的 section 不会立即激活，
					而是越过面板右缘的触发线后才激活。
				</p>

				<div className="relative">
					{/* @zh 左侧固定面板：绝对定位于容器左缘，不随容器滚动 @en Fixed left panel: absolutely positioned at the container's left edge, it does not scroll with the container */}
					<div className="absolute top-0 bottom-0 left-0 z-30 flex w-[180px] items-center justify-center border-r border-border bg-card/95 px-4 text-center text-xs leading-relaxed text-muted backdrop-blur">
						Fixed Overlay (overlay: {OVERLAY_WIDTH}px)
					</div>

					<div
						ref={containerRef}
						className="scroll-behavior-dynamic flex h-[60vh] max-h-[560px] gap-6 overflow-x-auto rounded-md border border-border p-6 pl-[196px]"
					>
						{sections.map(section => (
							<section
								key={section.id}
								id={section.id}
								// @zh scroll-margin 与面板宽度对齐：native 点击定位时目标落在面板右侧而非被遮挡
								// @en Align scroll-margin with the panel width: on native click-positioning the target lands to the right of the panel instead of being obscured
								className="flex h-full w-[min(60vw,520px)] flex-none flex-col scroll-ml-[180px]"
							>
								<h2 className="mb-4 text-2xl font-semibold text-fg">{section.title}</h2>
								<div className="min-h-0 flex-1 overflow-y-auto pr-1">
									<p className="leading-relaxed text-muted">{section.text}</p>
								</div>
							</section>
						))}
					</div>
				</div>
			</div>
		</PageShell>
	)
}
