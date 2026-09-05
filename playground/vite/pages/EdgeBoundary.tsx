import { useMemo, useState } from 'react'
import { PageShell } from './PageShell'
import { useFakeData } from '../hooks/useFakeData'
import type { EdgeBoundaryOptions } from '../types'

/**
 * EdgeBoundary 页面。
 * 演示 edgeOffset 与 boundaryOffset 对首/尾及滚动边界激活时机的影响。
 */
export function EdgeBoundary() {
	const { sections, menuItems, pushSection, shiftSection } = useFakeData()
	const targets = useMemo(() => sections.map(s => s.id), [sections])

	const [options, setOptions] = useState<EdgeBoundaryOptions>({
		edgeFirst: 100,
		edgeLast: -100,
		boundaryTop: 0,
		boundaryBottom: 0,
	})

	const extraControls = (
		<div className="rounded-md border border-border bg-card p-3 text-sm">
			<div className="mb-2 text-xs font-medium text-muted">Local Options</div>
			<div className="space-y-3">
				<Range
					label="edgeOffset.first"
					value={options.edgeFirst}
					min={0}
					max={300}
					onChange={v => setOptions(prev => ({ ...prev, edgeFirst: v }))}
				/>
				<Range
					label="edgeOffset.last"
					value={options.edgeLast}
					min={-300}
					max={0}
					onChange={v => setOptions(prev => ({ ...prev, edgeLast: v }))}
				/>
				<Range
					label="boundaryOffset.toTop"
					value={options.boundaryTop}
					min={0}
					max={200}
					onChange={v => setOptions(prev => ({ ...prev, boundaryTop: v }))}
				/>
				<Range
					label="boundaryOffset.toBottom"
					value={options.boundaryBottom}
					min={0}
					max={200}
					onChange={v => setOptions(prev => ({ ...prev, boundaryBottom: v }))}
				/>
			</div>
		</div>
	)

	return (
		<PageShell
			tocData={{
				menuItems,
				targets,
				edgeOffset: { first: options.edgeFirst, last: options.edgeLast },
				boundaryOffset: { toTop: options.boundaryTop, toBottom: options.boundaryBottom },
			}}
			demoButtons={{ pushSection, shiftSection }}
			extraControls={extraControls}
		>
			<div className="mx-auto max-w-2xl">
				<p className="mb-8 text-sm text-muted">
					调整侧边栏滑块观察首/尾 section 激活时机变化。edgeOffset 影响首尾目标，boundaryOffset 影响滚动边界判定。
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
