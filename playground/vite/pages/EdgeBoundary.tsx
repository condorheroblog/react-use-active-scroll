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
				// edgeOffset 仅在 jumpToFirst / jumpToLast 关闭时才参与判定（见 README），
				// 本页专门演示边缘偏移，因此显式关闭首尾强制激活。
				jumpToFirst: false,
				jumpToLast: false,
				edgeOffset: { first: options.edgeFirst, last: options.edgeLast },
				boundaryOffset: { toTop: options.boundaryTop, toBottom: options.boundaryBottom },
			}}
			demoButtons={{ pushSection, shiftSection }}
			extraControls={extraControls}
		>
			<div className="mx-auto max-w-2xl">
				<p className="mb-8 text-sm leading-relaxed text-muted">
					触发阈值不止一条：虚线 <span className="text-accent">↓ / ↑ 触发线</span> 分别是向下、向上滚动时的判定线，
					随 boundaryOffset.toBottom / toTop 移动；点线 <span className="text-accent">首目标线 / 尾目标线</span>
					随 edgeOffset.first / last 移动。若页面顶部暂无高亮，向右拖动 edgeOffset.first
					可让首目标提前激活；edgeOffset.last 为负值，尾目标线默认位于视口外上方，
					滚动到页面底部的留白观察区可看到最后一个目标延迟取消激活。
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

					{/* 尾部留白观察区：edgeOffset.last 需要足够的尾部滚动空间才能观察到 */}
					<div className="flex h-[150vh] items-start justify-center rounded-md border border-dashed border-border pt-10">
						<p className="max-w-sm text-center text-xs leading-relaxed text-muted">
							尾部留白观察区：持续向下滚动经过本区域，观察最后一个 section 何时取消高亮
							（edgeOffset.last 越负，取消得越晚）；再向上滚动，观察它何时提前恢复高亮。
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
