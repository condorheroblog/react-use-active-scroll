import { useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { PageShell } from '../PageShell'
import { useFakeData } from '../../hooks/useFakeData'

/**
 * @zh Container 页面。
 * 演示自定义滚动容器 root（传入 RefObject）。
 * 容器限定高度，window 不滚动，内部渲染自己的激活阈值参考线。
 * @en Container page.
 * Demonstrates a custom scroll container root (passing a RefObject).
 * The container has a fixed height so the window does not scroll, and it renders its own activation-threshold reference line inside.
 */
export function Container() {
	const { sections, menuItems, pushSection, shiftSection } = useFakeData()
	const containerRef = useRef<HTMLDivElement>(null)
	const targets = useMemo(() => sections.map(s => s.id), [sections])
	const { t } = useTranslation()

	return (
		<PageShell
			tocData={{ menuItems, targets, containerRef }}
			demoButtons={{ pushSection, shiftSection }}
		>
			<div className="mx-auto max-w-2xl">
				<p className="mb-4 text-sm text-muted">
					{t('container.desc')}
				</p>

				{/*
					@zh scroll-behavior-dynamic：跟随 --ScrollBehavior 变量，
					由 DemoControls 在 native(custom/smooth/auto) 间切换。
					@en scroll-behavior-dynamic: follows the --ScrollBehavior variable,
					toggled by DemoControls between native (custom/smooth/auto).
				*/}
				<div
					ref={containerRef}
					className="scroll-behavior-dynamic h-[70vh] max-h-[600px] overflow-auto rounded-md border border-border p-6"
				>
					{/* @zh 容器内激活阈值参考线 @en In-container activation-threshold reference line */}
					<div className="sticky top-2 z-10 border-t border-dashed border-accent">
						<div className="flex justify-end">
							<span className="-translate-y-1/2 rounded-sm border border-dashed border-accent bg-bg px-1.5 py-0.5 text-[10px] text-accent">
								{t('threshold.triggerLine')}
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
