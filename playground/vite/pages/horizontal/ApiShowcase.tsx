import { useMemo, useRef } from 'react'
import { useActiveScroll } from 'react-use-active-scroll'
import { PageShell } from '../PageShell'
import { useFakeData } from '../../hooks/useFakeData'

/**
 * @zh 横向 ApiShowcase 页面。
 * 集中展示 useActiveScroll 所有返回值在横向滚动下的表现：
 * - activeId、activeIndex、activeEl（DOM 引用）
 * - isActive、setActive
 * @en Horizontal ApiShowcase page.
 * Showcases how all return values of useActiveScroll behave under horizontal scrolling:
 * - activeId, activeIndex, activeEl (DOM reference)
 * - isActive, setActive
 */
export function ApiShowcase() {
	const { sections, menuItems, pushSection, shiftSection } = useFakeData()
	const containerRef = useRef<HTMLDivElement>(null)
	const targets = useMemo(() => sections.map(s => s.id), [sections])

	// @zh 在主内容区直接消费返回值，便于在 UI 中展示。
	// @en Consume the return values directly in the main content area so they can be shown in the UI.
	const { activeId, activeIndex, activeEl, isActive, setActive } = useActiveScroll(targets, {
		root: containerRef,
		direction: 'horizontal',
	})

	return (
		<PageShell
			tocData={{ menuItems, targets, containerRef, direction: 'horizontal' }}
			demoButtons={{ pushSection, shiftSection }}
		>
			<div className="mx-auto max-w-4xl">
				{/* @zh 返回值展示面板 @en Return-value display panel */}
				<div className="mb-8 rounded-md border border-border bg-card p-4 text-sm">
					<div className="mb-2 font-medium text-fg">Return Values</div>
					<div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
						<div>
							<span className="block text-xs text-muted">activeId</span>
							<span className="font-mono text-fg">{activeId || '-'}</span>
						</div>
						<div>
							<span className="block text-xs text-muted">activeIndex</span>
							<span className="font-mono text-fg">{activeIndex}</span>
						</div>
						<div>
							<span className="block text-xs text-muted">activeEl.tagName</span>
							<span className="font-mono text-fg">{activeEl?.tagName || '-'}</span>
						</div>
						<div>
							<span className="block text-xs text-muted">isActive(title_0)</span>
							<span className="font-mono text-fg">{isActive('title_0') ? 'true' : 'false'}</span>
						</div>
					</div>
				</div>

				{/* @zh setActive 快捷跳转按钮 @en setActive quick-jump buttons */}
				<div className="mb-8 flex flex-wrap gap-2">
					{sections.slice(0, 4).map(section => (
						<button
							key={section.id}
							type="button"
							onClick={() => setActive(section.id)}
							className="rounded-sm border border-border bg-bg px-3 py-1.5 text-xs text-fg transition-colors hover:border-accent hover:text-accent"
						>
							setActive({section.id})
						</button>
					))}
				</div>

				{/* @zh 内容区：isActive 给当前激活的卡片加上边框高亮 @en Content area: isActive adds a border highlight to the currently active card */}
				<div
					ref={containerRef}
					className="scroll-behavior-dynamic flex h-[60vh] max-h-[560px] gap-6 overflow-x-auto rounded-md border border-border p-6"
				>
					{sections.map(section => (
						<section
							key={section.id}
							id={section.id}
							className={`flex h-full w-[min(60vw,520px)] flex-none flex-col rounded-md border p-4 transition-colors ${
								isActive(section.id)
									? 'border-accent bg-accent-soft'
									: 'border-border'
							}`}
						>
							<h2 className="mb-4 text-2xl font-semibold text-fg">{section.title}</h2>
							<div className="min-h-0 flex-1 overflow-y-auto pr-1">
								<p className="leading-relaxed text-muted">{section.text}</p>
							</div>
						</section>
					))}
				</div>
			</div>
		</PageShell>
	)
}
