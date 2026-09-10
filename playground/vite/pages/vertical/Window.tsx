import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useActiveScroll } from 'react-use-active-scroll'
import { PageShell } from '../PageShell'
import { useFakeData } from '../../hooks/useFakeData'

/**
 * @zh Window 页面。
 * 演示针对浏览器窗口的纵向滚动（root 缺省即窗口）、hash: 'replace'，
 * 并在顶部实时展示 activeId / activeIndex / isActive 等返回值。
 * @en Window page.
 * Demonstrates vertical scrolling against the browser window (root defaults to the window) with hash: 'replace',
 * and shows return values such as activeId / activeIndex / isActive live at the top.
 */
export function Window() {
	const { sections, menuItems, pushSection, shiftSection } = useFakeData()
	const targets = useMemo(() => sections.map(s => s.id), [sections])
	const { t } = useTranslation()

	// @zh 本页直接在主内容区消费返回值，便于可视化展示。
	// @en This page consumes the return values directly in the main content area for visual display.
	// @zh hash 同步由目录组件统一处理，避免重复更新 URL。
	// @en Hash sync is handled uniformly by the TOC component to avoid repeatedly updating the URL.
	const { activeId, activeIndex, isActive } = useActiveScroll(targets)

	return (
		<PageShell
			tocData={{ menuItems, targets, hash: 'replace' }}
			demoButtons={{ pushSection, shiftSection }}
		>
			<div className="mx-auto max-w-2xl">
				{/* @zh 返回值展示面板 @en Return-value display panel */}
				<div className="mb-8 rounded-md border border-border bg-card p-4 text-sm">
					<div className="mb-2 font-medium text-fg">{t('common.returnValues')}</div>
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

				{/* @zh 内容区 @en Content area */}
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
