import { useMemo } from 'react'
import { PageShell } from './PageShell'
import { useFakeData } from '../hooks/useFakeData'

const MIN_WIDTH = 768

/**
 * Responsive 页面。
 * 演示 minWidth 选项：仅在视口宽度 >= 768px 时启用滚动监听。
 */
export function Responsive() {
	const { sections, menuItems, pushSection, shiftSection } = useFakeData()
	const targets = useMemo(() => sections.map(s => s.id), [sections])

	return (
		<PageShell
			tocData={{ menuItems, targets, minWidth: MIN_WIDTH }}
			demoButtons={{ pushSection, shiftSection }}
		>
			<div className="mx-auto max-w-2xl">
				<div className="mb-8 rounded-md border border-border bg-card p-4 text-sm">
					<div className="mb-2 font-medium text-fg">minWidth: {MIN_WIDTH}px</div>
					<p className="text-muted">
						当视口宽度小于 {MIN_WIDTH}px 时，useActiveScroll 自动停止监听，目录不再高亮；
						拉宽窗口超过 {MIN_WIDTH}px 后重新启用。请尝试调整浏览器宽度观察变化。
					</p>
				</div>

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
