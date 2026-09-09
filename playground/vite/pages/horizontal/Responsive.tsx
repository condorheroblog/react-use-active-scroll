import { useMemo, useRef } from 'react'
import { PageShell } from '../PageShell'
import { HorizontalSections } from '../../components/HorizontalSections'
import { useFakeData } from '../../hooks/useFakeData'

const MIN_WIDTH = 768

/**
 * @zh 横向 Responsive 页面。
 * 演示 minWidth 选项在横向滚动下的行为：
 * 仅在视口宽度 >= 768px 时启用横向滚动监听。
 * @en Horizontal Responsive page.
 * Demonstrates the behavior of the minWidth option under horizontal scrolling:
 * horizontal scroll listening is enabled only when the viewport width >= 768px.
 */
export function Responsive() {
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
				minWidth: MIN_WIDTH,
			}}
			demoButtons={{ pushSection, shiftSection }}
		>
			<div className="mx-auto max-w-4xl">
				<div className="mb-4 rounded-md border border-border bg-card p-4 text-sm">
					<div className="mb-2 font-medium text-fg">minWidth: {MIN_WIDTH}px</div>
					<p className="text-muted">
						当视口宽度小于 {MIN_WIDTH}px 时，useActiveScroll 自动停止监听，目录不再高亮；
						拉宽窗口超过 {MIN_WIDTH}px 后重新启用。请尝试调整浏览器宽度观察变化。
					</p>
				</div>

				<HorizontalSections sections={sections} containerRef={containerRef} triggerLine />
			</div>
		</PageShell>
	)
}
