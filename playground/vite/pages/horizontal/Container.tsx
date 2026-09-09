import { useMemo, useRef } from 'react'
import { PageShell } from '../PageShell'
import { useFakeData } from '../../hooks/useFakeData'

/**
 * @zh 横向 Container 页面。
 * 演示混合滚动容器：容器同时支持横向与纵向滚动（卡片高度超出容器），
 * direction: 'horizontal' 只跟踪横向滚动位置，纵向滚动不影响高亮。
 * @en Horizontal Container page.
 * Demonstrates a mixed-scroll container: the container supports both horizontal and vertical scrolling (cards are taller than the container),
 * and direction: 'horizontal' tracks only the horizontal scroll position, so vertical scrolling does not affect the highlight.
 */
export function Container() {
	const { sections, menuItems, pushSection, shiftSection } = useFakeData()
	const containerRef = useRef<HTMLDivElement>(null)
	const targets = useMemo(() => sections.map(s => s.id), [sections])

	return (
		<PageShell
			tocData={{ menuItems, targets, containerRef, direction: 'horizontal' }}
			demoButtons={{ pushSection, shiftSection }}
		>
			<div className="mx-auto max-w-4xl">
				<p className="mb-4 text-sm text-muted">
					容器同时开启横向与纵向滚动：卡片高度超出容器高度，纵向滚动条常驻。
					上下滚动容器时目录高亮保持不变，左右滚动时才推进高亮——direction: 'horizontal'
					只跟踪横向滚动位置。
				</p>

				<div
					ref={containerRef}
					className="scroll-behavior-dynamic flex h-[60vh] max-h-[560px] gap-6 overflow-auto rounded-md border border-border p-6"
				>
					{/* @zh 容器内激活阈值参考线：sticky 于容器左缘，高度随最高卡片拉伸 @en In-container activation-threshold reference line: sticky to the container's left edge, its height stretches with the tallest card */}
					<div className="sticky left-[10px] z-10 w-0 border-l border-dashed border-accent">
						<span className="absolute top-1 left-1 rounded-sm border border-dashed border-accent bg-bg px-1.5 py-0.5 text-[10px] whitespace-nowrap text-accent">
							trigger line
						</span>
					</div>

					{sections.map(section => (
						<section
							key={section.id}
							id={section.id}
							className="w-[min(60vw,520px)] min-h-[125%] flex-none"
						>
							<h2 className="mb-4 text-2xl font-semibold text-fg">{section.title}</h2>
							<p className="leading-relaxed text-muted">{section.text}</p>
						</section>
					))}
				</div>
			</div>
		</PageShell>
	)
}
