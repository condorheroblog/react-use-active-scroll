import { useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { PageShell } from '../PageShell'
import { HorizontalSections } from '../../components/HorizontalSections'
import { useFakeData } from '../../hooks/useFakeData'

const MEDIA_QUERY = '(min-width: 768px)'

/**
 * @zh 横向 Responsive 页面。
 * 演示 mediaQuery 选项在横向滚动下的行为：
 * 仅在 CSS 媒体查询 '(min-width: 768px)' 匹配（视口宽度 >= 768px）时
 * 启用横向滚动监听。
 * @en Horizontal Responsive page.
 * Demonstrates the behavior of the mediaQuery option under horizontal
 * scrolling: horizontal scroll listening is enabled only while the CSS media
 * query '(min-width: 768px)' matches (viewport width >= 768px).
 */
export function Responsive() {
	const { sections, menuItems, pushSection, shiftSection } = useFakeData()
	const containerRef = useRef<HTMLDivElement>(null)
	const targets = useMemo(() => sections.map(s => s.id), [sections])
	const { t } = useTranslation()

	return (
		<PageShell
			tocData={{
				menuItems,
				targets,
				containerRef,
				direction: 'horizontal',
				mediaQuery: MEDIA_QUERY,
			}}
			demoButtons={{ pushSection, shiftSection }}
		>
			<div className="mx-auto max-w-4xl">
				<div className="mb-4 rounded-md border border-border bg-card p-4 text-sm">
					<div className="mb-2 font-medium text-fg">mediaQuery: '{MEDIA_QUERY}'</div>
					<p className="text-muted">
						{t('responsiveH.desc', { query: MEDIA_QUERY })}
					</p>
				</div>

				<HorizontalSections sections={sections} containerRef={containerRef} triggerLine />
			</div>
		</PageShell>
	)
}
