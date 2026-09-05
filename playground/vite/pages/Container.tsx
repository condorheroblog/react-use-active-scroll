import { useMemo, useRef } from 'react'
import { PageShell } from './PageShell'
import { useFakeData } from '../hooks/useFakeData'

/**
 * Container 页面。
 * 演示自定义滚动容器 root（传入 RefObject）。
 * 容器限定高度，window 不滚动，内部渲染自己的激活阈值参考线。
 */
export function Container() {
	const { sections, menuItems, pushSection, shiftSection } = useFakeData()
	const containerRef = useRef<HTMLDivElement>(null)
	const targets = useMemo(() => sections.map(s => s.id), [sections])

	return (
		<PageShell
			tocData={{ menuItems, targets, containerRef }}
			demoButtons={{ pushSection, shiftSection }}
		>
			<div className="mx-auto max-w-2xl">
				<p className="mb-4 text-sm text-muted">
					本页面滚动发生在下方容器内部，window 本身不滚动。root 选项指向容器 ref。
				</p>

				<div
					ref={containerRef}
					className="h-[70vh] max-h-[600px] overflow-auto rounded-md border border-border p-6 scroll-smooth"
				>
					{/* 容器内激活阈值参考线 */}
					<div className="sticky top-2 z-10 border-t border-dashed border-accent">
						<div className="flex justify-end">
							<span className="-translate-y-1/2 rounded-sm border border-dashed border-accent bg-bg px-1.5 py-0.5 text-[10px] text-accent">
								trigger line
							</span>
						</div>
					</div>

					<div className="space-y-16 pt-4">
						{sections.map(section => (
							<section key={section.id}>
								<h2 id={section.id} className="mb-4 text-2xl font-semibold text-fg">
									{section.title}
								</h2>
								<p className="leading-relaxed text-muted">{section.text}</p>
							</section>
						))}
					</div>
				</div>
			</div>
		</PageShell>
	)
}
