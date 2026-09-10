import { useMemo, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { PageShell } from '../PageShell'
import { useFakeData } from '../../hooks/useFakeData'
import type { EdgeBoundaryOptions } from '../../types'

/**
 * @zh EdgeBoundary 页面。
 * 演示 edges 与 offset 对首/尾及滚动边界激活时机的影响。
 * @en EdgeBoundary page.
 * Demonstrates how edges and offset affect the activation timing at the first/last targets and scroll boundaries.
 */
export function EdgeBoundary() {
	const { sections, menuItems, pushSection, shiftSection } = useFakeData()
	const targets = useMemo(() => sections.map(s => s.id), [sections])
	const { t } = useTranslation()

	const [options, setOptions] = useState<EdgeBoundaryOptions>({
		edgeFirst: -280,
		edgeLast: 300,
		offsetToStart: 100,
		offsetToEnd: 500,
	})

	const extraControls = (
		<div className="rounded-md border border-border bg-card p-3 text-sm">
			<div className="mb-2 text-xs font-medium text-muted">{t('common.localOptions')}</div>
			<div className="space-y-3">
				<Range
					label="edges.first"
					value={options.edgeFirst}
					min={-600}
					max={600}
					onChange={v => setOptions(prev => ({ ...prev, edgeFirst: v }))}
				/>
				<Range
					label="edges.last"
					value={options.edgeLast}
					min={-600}
					max={600}
					onChange={v => setOptions(prev => ({ ...prev, edgeLast: v }))}
				/>
				<Range
					label="offset.toStart"
					value={options.offsetToStart}
					min={-600}
					max={600}
					onChange={v => setOptions(prev => ({ ...prev, offsetToStart: v }))}
				/>
				<Range
					label="offset.toEnd"
					value={options.offsetToEnd}
					min={-600}
					max={600}
					onChange={v => setOptions(prev => ({ ...prev, offsetToEnd: v }))}
				/>
			</div>
		</div>
	)

	return (

		<PageShell
			tocData={{
				menuItems,
				targets,
				// @zh edges 传数字即关闭首尾强制激活并允许"无激活"：
				// @en Passing a number to edges disables forced first/last activation and allows "no active":
				// @zh 首目标距触发线 edges.first 时提前激活，尾目标底部越过触发线 edges.last 后解除。
				// @en the first target activates early when it is edges.first away from the trigger line, and the last
				// target deactivates after its bottom crosses the trigger line edges.last.
				edges: { first: options.edgeFirst, last: options.edgeLast },
				offset: { toStart: options.offsetToStart, toEnd: options.offsetToEnd },
			}}
			demoButtons={{ pushSection, shiftSection }}
			extraControls={extraControls}
		>
			<div className="mx-auto max-w-2xl">
					<p className="mb-8 text-sm leading-relaxed text-muted">
						<Trans
							i18nKey="edgeBoundary.desc"
							components={{
								arrow: <span className="text-accent" />,
								edge: <span className="text-accent" />,
							}}
						/>
					</p>

					<div className="space-y-16">
						{sections.map((section, idx) => (
							<section key={section.id} className="scroll-mt-24">
								<div className="mb-2 text-xs text-muted">
									index: {idx} · id: {section.id}
								</div>
								<h2 id={section.id} className="mb-4 text-2xl font-semibold text-fg">
									{section.title}
								</h2>
								<p className="leading-relaxed text-muted">{section.text}</p>
							</section>
						))}

						{/* @zh 尾部留白观察区：edges.last 需要足够的尾部滚动空间才能观察到 @en Trailing whitespace observation area: edges.last needs enough trailing scroll space to be observable */}
						<div className="flex h-[150vh] items-start justify-center rounded-md border border-dashed border-border pt-10">
							<p className="max-w-sm text-center text-xs leading-relaxed text-muted">
								{t('edgeBoundary.observation')}
							</p>
						</div>
					</div>
				</div>
		</PageShell>
	)
}

function Range({
	label,
	value,
	min,
	max,
	onChange,
}: {
	label: string
	value: number
	min: number
	max: number
	onChange: (value: number) => void
}) {
	return (
		<div>
			<div className="mb-1 flex justify-between text-xs text-muted">
				<span>{label}</span>
				<span>{value}px</span>
			</div>
			<input
				type="range"
				min={min}
				max={max}
				value={value}
				onChange={e => onChange(Number(e.target.value))}
				className="w-full accent-accent"
			/>
		</div>
	)
}
