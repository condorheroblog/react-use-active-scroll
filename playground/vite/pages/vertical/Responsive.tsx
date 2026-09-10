import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { PageShell } from '../PageShell'
import { useFakeData } from '../../hooks/useFakeData'

const MEDIA_QUERY = '(min-width: 768px)'

/**
 * @zh Responsive 页面。
 * 演示 mediaQuery 选项：仅在 CSS 媒体查询 '(min-width: 768px)' 匹配
 * （视口宽度 >= 768px）时启用滚动监听。
 * @en Responsive page.
 * Demonstrates the mediaQuery option: scroll listening is enabled only while
 * the CSS media query '(min-width: 768px)' matches (viewport width >= 768px).
 */
export function Responsive() {
	const { sections, menuItems, pushSection, shiftSection } = useFakeData()
	const targets = useMemo(() => sections.map(s => s.id), [sections])
	const { t } = useTranslation()

	return (
		<PageShell
			tocData={{ menuItems, targets, mediaQuery: MEDIA_QUERY }}
			demoButtons={{ pushSection, shiftSection }}
		>
			<div className="mx-auto max-w-2xl">
				<div className="mb-8 rounded-md border border-border bg-card p-4 text-sm">
					<div className="mb-2 font-medium text-fg">mediaQuery: '{MEDIA_QUERY}'</div>
					<p className="text-muted">
						{t('responsive.desc', { query: MEDIA_QUERY })}
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
