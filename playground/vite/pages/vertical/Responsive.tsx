import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { PageShell } from '../PageShell'
import { useFakeData } from '../../hooks/useFakeData'

const MIN_WIDTH = 768

/**
 * @zh Responsive 页面。
 * 演示 minWidth 选项：仅在视口宽度 >= 768px 时启用滚动监听。
 * @en Responsive page.
 * Demonstrates the minWidth option: scroll listening is enabled only when the viewport width >= 768px.
 */
export function Responsive() {
	const { sections, menuItems, pushSection, shiftSection } = useFakeData()
	const targets = useMemo(() => sections.map(s => s.id), [sections])
	const { t } = useTranslation()

	return (
		<PageShell
			tocData={{ menuItems, targets, minWidth: MIN_WIDTH }}
			demoButtons={{ pushSection, shiftSection }}
		>
			<div className="mx-auto max-w-2xl">
				<div className="mb-8 rounded-md border border-border bg-card p-4 text-sm">
					<div className="mb-2 font-medium text-fg">minWidth: {MIN_WIDTH}px</div>
					<p className="text-muted">
						{t('responsive.desc', { px: MIN_WIDTH })}
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
