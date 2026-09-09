import { useMemo, useRef, useState } from 'react'
import { PageShell } from '../PageShell'
import { HorizontalSections } from '../../components/HorizontalSections'
import { useFakeData } from '../../hooks/useFakeData'
import type { EdgeBoundaryOptions } from '../../types'

/**
 * @zh 横向 EdgeBoundary 页面。
 * 演示 edges 与 offset 在横向滚动下对首/尾及滚动边界激活时机的影响。
 * 阈值参考线为竖直方向，以滚动容器左缘为基准渲染在覆盖层上。
 * @en Horizontal EdgeBoundary page.
 * Demonstrates how edges and offset affect the activation timing at the first/last targets and scroll boundaries under horizontal scrolling.
 * The threshold reference lines are vertical, rendered on an overlay relative to the scroll container's left edge.
 */
export function EdgeBoundary() {
	const { sections, menuItems, pushSection, shiftSection } = useFakeData()
	const containerRef = useRef<HTMLDivElement>(null)
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

	// @zh 阈值 = FIXED_OFFSET(10) + 方向边界偏移 + 首尾边缘偏移，横向沿容器左缘计量
	// @en Threshold = FIXED_OFFSET(10) + direction-boundary offset + first/last edge offset, measured horizontally along the container's left edge
	const BASE = 10

	interface ThresholdLine {
		id: string
		left: number
		label: string
		kind: 'boundary' | 'edge'
	}

	const lines: ThresholdLine[] = [
		{ id: 'end', left: BASE + options.offsetToEnd, label: '→ 触发线', kind: 'boundary' },
		{ id: 'start', left: BASE + options.offsetToStart, label: '← 触发线', kind: 'boundary' },
		{ id: 'first', left: BASE + options.offsetToEnd + options.edgeFirst, label: '首目标线 edges.first', kind: 'edge' },
		{ id: 'last', left: BASE + options.offsetToEnd - options.edgeLast, label: '尾目标线 edges.last', kind: 'edge' },
	]

	// @zh 位置重合的线合并显示（如 toStart 与 toEnd 均为 0 时两条方向线重合）。
	// @en Lines at the same position are merged for display (e.g. when both toStart and toEnd are 0, the two direction lines coincide).
	const groups = new Map<number, ThresholdLine[]>()
	for (const line of lines) {
		const group = groups.get(line.left)
		if (group) group.push(line)
		else groups.set(line.left, [line])
	}

	return (
		<PageShell
			tocData={{
				menuItems,
				targets,
				containerRef,
				direction: 'horizontal',
				edges: { first: options.edgeFirst, last: options.edgeLast },
				offset: { toStart: options.offsetToStart, toEnd: options.offsetToEnd },
			}}
			demoButtons={{ pushSection, shiftSection }}
			extraControls={extraControls}
		>
			<div className="mx-auto max-w-4xl">
				<p className="mb-4 text-sm leading-relaxed text-muted">
					横向版触发阈值不止一条：虚线 <span className="text-accent">→ / ← 触发线</span>
					分别是向右、向左滚动时的判定线，随 offset.toEnd / toStart 移动；
					点线 <span className="text-accent">首目标线 / 尾目标线</span> 随 edges.first / last 移动。
					若起始处暂无高亮，向右拖动 edges.first 可让首目标提前激活；
					edges.last 为正距离，尾目标线默认位于视口外左侧，
					滚动到最右侧的留白观察区可看到最后一个目标延迟取消激活。
				</p>

				<div className="relative">
					<HorizontalSections
						sections={sections}
						containerRef={containerRef}
						indexLabel
					>
						{/* @zh 尾部留白观察区：edges.last 需要足够的尾部滚动空间才能观察到 @en Trailing whitespace observation area: edges.last needs enough trailing scroll space to be observable */}
						<div className="flex h-full w-[70vw] max-w-[560px] flex-none items-start justify-center rounded-md border border-dashed border-border pt-10">
							<p className="max-w-xs text-center text-xs leading-relaxed text-muted">
								尾部留白观察区：持续向右滚动经过本区域，观察最后一个 section 何时取消高亮
								（edges.last 越大，取消得越晚）；再向左滚动，观察它何时提前恢复高亮。
							</p>
						</div>
					</HorizontalSections>

					{/* @zh 阈值参考线覆盖层：位置以容器左缘为基准 @en Threshold-reference-line overlay: positions are relative to the container's left edge */}
					<div className="pointer-events-none absolute inset-0 z-20" aria-hidden="true">
						{Array.from(groups.entries()).map(([left, group]) => {
							const offscreen = left < 0
							const isEdge = group.some(line => line.kind === 'edge')
							const label = `${group.map(line => line.label).join(' / ')} · ${left}px`
							const key = group.map(line => line.id).join('+')

							// @zh 阈值位于视口外左侧（edges.last 较大时尾目标线常位于视口外）：
							// @en The threshold is outside the viewport on the left (with a large edges.last the last-target line is often outside the viewport):
							// @zh 不画贯穿线，仅在容器左缘固定一个标记牌提示真实阈值在视口外。
							// @en do not draw a through-line, just pin a marker at the container's left edge to hint that the real threshold is offscreen.
							if (offscreen) {
								return (
									<div key={key} className="absolute top-0 bottom-0 left-0">
										<span className="absolute top-1 left-1 rounded-sm border border-dotted border-accent/60 bg-bg px-1.5 py-0.5 text-[10px] whitespace-nowrap text-accent">
											◀ {label}（视口外左侧）
										</span>
									</div>
								)
							}

							return (
								<div
									key={key}
									className={`absolute top-0 bottom-0 border-l ${
										isEdge ? 'border-dotted border-accent/60' : 'border-dashed border-accent'
									}`}
									style={{ left: `${left}px` }}
								>
									<span
										className={`absolute top-1 left-1 rounded-sm border bg-bg px-1.5 py-0.5 text-[10px] whitespace-nowrap text-accent ${
											isEdge ? 'border-dotted border-accent/60' : 'border-dashed border-accent'
										}`}
									>
										{label}
									</span>
								</div>
							)
						})}
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
