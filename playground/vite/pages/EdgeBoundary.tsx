import { useMemo, useState } from 'react'
import { PageShell } from './PageShell'
import { useFakeData } from '../hooks/useFakeData'
import type { EdgeBoundaryOptions } from '../types'

/**
 * EdgeBoundary 页面。
 * 演示 edges 与 offset 对首/尾及滚动边界激活时机的影响。
 */
export function EdgeBoundary() {
	const { sections, menuItems, pushSection, shiftSection } = useFakeData()
	const targets = useMemo(() => sections.map(s => s.id), [sections])

	const [options, setOptions] = useState<EdgeBoundaryOptions>({
		edgeFirst: 100,
		edgeLast: 100,
		offsetToStart: 0,
		offsetToEnd: 0,
	})

	const extraControls = (
		<div className="rounded-md border border-border bg-card p-3 text-sm">
			<div className="mb-2 text-xs font-medium text-muted">Local Options</div>
			<div className="space-y-3">
				<Range
					label="edges.first"
					value={options.edgeFirst}
					min={0}
					max={300}
					onChange={v => setOptions(prev => ({ ...prev, edgeFirst: v }))}
				/>
				<Range
					label="edges.last"
					value={options.edgeLast}
					min={0}
					max={300}
					onChange={v => setOptions(prev => ({ ...prev, edgeLast: v }))}
				/>
				<Range
					label="offset.toStart"
					value={options.offsetToStart}
					min={0}
					max={200}
					onChange={v => setOptions(prev => ({ ...prev, offsetToStart: v }))}
				/>
				<Range
					label="offset.toEnd"
					value={options.offsetToEnd}
					min={0}
					max={200}
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
				// edges 传数字即关闭首尾强制激活并允许"无激活"：
				// 首目标距触发线 edges.first 时提前激活，尾目标底部越过触发线 edges.last 后解除。
				edges: { first: options.edgeFirst, last: options.edgeLast },
				offset: { toStart: options.offsetToStart, toEnd: options.offsetToEnd },
			}}
			demoButtons={{ pushSection, shiftSection }}
			extraControls={extraControls}
		>
			<div className="mx-auto max-w-2xl">
				<p className="mb-8 text-sm leading-relaxed text-muted">
					触发阈值不止一条：虚线 <span className="text-accent">↓ / ↑ 触发线</span> 分别是向下、向上滚动时的判定线，
					随 offset.toEnd / toStart 移动；点线 <span className="text-accent">首目标线 / 尾目标线</span>
					随 edges.first / last 移动。若页面顶部暂无高亮，向右拖动 edges.first
					可让首目标提前激活；edges.last 为正距离，尾目标线默认位于视口外上方，
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

					{/* 尾部留白观察区：edges.last 需要足够的尾部滚动空间才能观察到 */}
					<div className="flex h-[150vh] items-start justify-center rounded-md border border-dashed border-border pt-10">
						<p className="max-w-sm text-center text-xs leading-relaxed text-muted">
							尾部留白观察区：持续向下滚动经过本区域，观察最后一个 section 何时取消高亮
							（edges.last 越大，取消得越晚）；再向上滚动，观察它何时提前恢复高亮。
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
