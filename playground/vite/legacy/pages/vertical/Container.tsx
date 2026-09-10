import { useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { PageShell } from '../PageShell'
import { ContainerScanLine } from '../../components/ScanLine'
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
				<div className="relative">
					<div
						ref={containerRef}
						className="scroll-behavior-dynamic h-[70vh] max-h-[600px] overflow-auto rounded-md border border-border p-6"
					>
						<div className="space-y-16">
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

					{/* @zh 容器内激活阈值参考线：absolute 覆盖容器 border-box，按 tocData 自动调整 @en In-container activation threshold reference line: absolute overlay over the container's border-box, auto-adjusting with tocData */}
					<ContainerScanLine />
				</div>
			</div>
		</PageShell>
	)
}
