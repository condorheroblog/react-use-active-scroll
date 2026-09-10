import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { PageShell } from '../PageShell'
import { useFakeData } from '../../hooks/useFakeData'

const OVERLAY_HEIGHT = 60

/**
 * @zh Overlay 页面。
 * 演示 overlay 选项：页面顶部有一个固定占位条（顶部固定头部），
 * 核心包通过 overlay 选项把它的占用空间计入激活判定阈值。
 * @en Overlay page.
 * Demonstrates the overlay option: there is a fixed placeholder bar at the top of the page (a top fixed header),
 * and the core package counts its occupied space into the activation-detection threshold via the overlay option.
 */
export function Overlay() {
	const { sections, menuItems, pushSection, shiftSection } = useFakeData()
	const targets = useMemo(() => sections.map(s => s.id), [sections])
	const { t } = useTranslation()

	return (
		<PageShell
			tocData={{ menuItems, targets, overlay: OVERLAY_HEIGHT }}
			demoButtons={{ pushSection, shiftSection }}
		>
			{/* @zh 固定占位条，模拟被固定头部遮挡的区域 @en Fixed placeholder bar, simulating the area obscured by a fixed header */}
			<div
				className="fixed left-0 right-0 top-0 z-40 flex items-center border-b border-border bg-card px-6 text-sm font-medium text-fg"
				style={{ height: OVERLAY_HEIGHT }}
			>
				{t('common.fixedOverlay', { px: OVERLAY_HEIGHT })}
			</div>

			<div className="mx-auto max-w-2xl pt-24">
				<p className="mb-8 text-sm text-muted">
					{t('overlay.desc', { px: OVERLAY_HEIGHT })}
				</p>

				<div className="space-y-16">
					{sections.map(section => (
						<section key={section.id}>
							<h2
								id={section.id}
								className="mb-4 scroll-mt-24 text-2xl font-semibold text-fg"
								style={{ scrollMarginTop: OVERLAY_HEIGHT + 16 }}
							>
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
