import { useMemo } from 'react'
import { useActiveScroll } from 'react-use-active-scroll'
import { PageShell } from './PageShell'
import { useFakeData } from '../hooks/useFakeData'

/**
 * Basic 页面。
 * 演示默认 window/document 根滚动、hash: 'replace'，
 * 并在顶部实时展示 activeId / activeIndex / isActive 等返回值。
 */
export function Basic() {
	const { sections, menuItems, pushSection, shiftSection } = useFakeData()
	const targets = useMemo(() => sections.map(s => s.id), [sections])

	// 本页直接在主内容区消费返回值，便于可视化展示。
	// hash 同步由目录组件统一处理，避免重复更新 URL。
	const { activeId, activeIndex, isActive } = useActiveScroll(targets)

	return (
		<PageShell
			tocData={{ menuItems, targets, hash: 'replace' }}
			demoButtons={{ pushSection, shiftSection }}
		>
			<div className="mx-auto max-w-2xl">
				{/* 返回值展示面板 */}
				<div className="mb-8 rounded-md border border-border bg-card p-4 text-sm">
					<div className="mb-2 font-medium text-fg">Return Values</div>
					<div className="grid grid-cols-2 gap-2 text-muted sm:grid-cols-4">
						<div>
							<span className="block text-xs">activeId</span>
							<span className="font-mono text-fg">{activeId || '-'}</span>
						</div>
						<div>
							<span className="block text-xs">activeIndex</span>
							<span className="font-mono text-fg">{activeIndex}</span>
						</div>
						<div>
							<span className="block text-xs">isActive(title_0)</span>
							<span className="font-mono text-fg">{isActive('title_0') ? 'true' : 'false'}</span>
						</div>
						<div>
							<span className="block text-xs">hash</span>
							<span className="font-mono text-fg">'replace'</span>
						</div>
					</div>
				</div>

				{/* 内容区 */}
				<div className="space-y-16">
					{sections.map(section => (
						<section key={section.id} className="scroll-mt-24">
							<h2 id={section.id} className="mb-4 text-2xl font-semibold text-fg">
								{section.title}
							</h2>
							<p className="leading-relaxed text-muted">{section.text}</p>
						</section>
					))}
				</div>
			</div>
		</PageShell>
	)
}
