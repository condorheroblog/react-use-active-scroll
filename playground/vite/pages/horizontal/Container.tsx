import { useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { PageShell } from '../PageShell'
import { ContainerScanLine } from '../../components/ScanLine'
import { useFakeData } from '../../hooks/useFakeData'

/**
 * @zh 横向 Container 页面。
 * 演示混合滚动容器：容器同时支持横向与纵向滚动（卡片高度超出容器），
 * direction: 'horizontal' 只跟踪横向滚动位置，纵向滚动不影响高亮。
 * @en Horizontal Container page.
 * Demonstrates a mixed-scroll container: the container supports both horizontal and vertical scrolling (cards are taller than the container),
 * and direction: 'horizontal' tracks only the horizontal scroll position, so vertical scrolling does not affect the highlight.
 */
export function Container() {
	const { sections, menuItems, pushSection, shiftSection } = useFakeData()
	const containerRef = useRef<HTMLDivElement>(null)
	const targets = useMemo(() => sections.map(s => s.id), [sections])
	const { t } = useTranslation()

	return (
		<PageShell
			tocData={{ menuItems, targets, containerRef, direction: 'horizontal' }}
			demoButtons={{ pushSection, shiftSection }}
		>
			<div className="mx-auto max-w-4xl">
				<p className="mb-4 text-sm text-muted">
					{t('containerH.desc')}
				</p>

				<div className="relative">
					<div
						ref={containerRef}
						className="scroll-behavior-dynamic flex h-[60vh] max-h-[560px] gap-6 overflow-auto rounded-md border border-border p-6"
					>
						{sections.map(section => (
							<section
								key={section.id}
								id={section.id}
								className="w-[min(60vw,520px)] min-h-[125%] flex-none"
							>
								<h2 className="mb-4 text-2xl font-semibold text-fg">{section.title}</h2>
								<p className="leading-relaxed text-muted">{section.text}</p>
							</section>
						))}
					</div>

					{/* @zh 容器内激活阈值参考线：absolute 覆盖容器 border-box，按 tocData 自动调整 @en In-container activation threshold reference line: absolute overlay over the container's border-box, auto-adjusting with tocData */}
					<ContainerScanLine />
				</div>
			</div>
		</PageShell>
	)
}
