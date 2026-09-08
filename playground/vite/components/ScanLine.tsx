import { useContext } from 'react'
import { TOCDataContext } from '../pages/PageShell'

/**
 * 滚动触发阈值参考线。
 * 核心包的判定阈值并非固定一条线，而是按滚动方向与首尾目标组合：
 *   阈值 = FIXED_OFFSET(10) + overlayHeight + 方向边界偏移 + 首尾边缘偏移
 * - ↓ 向下滚动：基线随 offset.toEnd 移动；首目标再叠加 edges.first（提前激活），
 *   尾目标在其底部越过触发线 edges.last 距离后解除
 * - ↑ 向上滚动：基线随 offset.toStart 移动；边缘偏移同理参与判定
 * 边缘偏移仅在 edges.first / edges.last 为数字（或 false）时才参与判定。
 */
export function ScanLine() {
	const tocData = useContext(TOCDataContext)
	const containerRef = tocData?.containerRef

	// 容器滚动场景在页面自身内部渲染参考线，避免全局固定定位错位。
	if (containerRef) return null

	const overlayHeight = tocData?.overlayHeight ?? 0
	const offset = tocData?.offset
	const toStart = typeof offset === 'number' ? offset : (offset?.toStart ?? 0)
	const toEnd = typeof offset === 'number' ? offset : (offset?.toEnd ?? 0)
	// edges.first / last 缺省为 true（强制激活）；传数字或 false 时边缘偏移才参与判定。
	const firstEdge = tocData?.edges?.first
	const lastEdge = tocData?.edges?.last
	const showFirstEdge = firstEdge !== undefined && firstEdge !== true
	const showLastEdge = lastEdge !== undefined && lastEdge !== true
	const edgeFirst = typeof firstEdge === 'number' ? firstEdge : 0
	const edgeLast = typeof lastEdge === 'number' ? lastEdge : 0

	const BASE = 10 + overlayHeight

	interface ThresholdLine {
		id: string
		top: number
		label: string
		kind: 'boundary' | 'edge'
	}

	const lines: ThresholdLine[] = [
		{ id: 'down', top: BASE + toEnd, label: '↓ 触发线', kind: 'boundary' },
		{ id: 'up', top: BASE + toStart, label: '↑ 触发线', kind: 'boundary' },
	]
	if (showFirstEdge) {
		lines.push({
			id: 'first',
			top: BASE + toEnd + edgeFirst,
			label: '首目标线 edges.first',
			kind: 'edge',
		})
	}
	if (showLastEdge) {
		lines.push({
			id: 'last',
			top: BASE + toEnd - edgeLast,
			label: '尾目标线 edges.last',
			kind: 'edge',
		})
	}

	// 位置重合的线合并显示（如 toStart 与 toEnd 均为 0 时两条方向线重合）。
	const groups = new Map<number, ThresholdLine[]>()
	for (const line of lines) {
		const group = groups.get(line.top)
		if (group) group.push(line)
		else groups.set(line.top, [line])
	}

	return (
		<>
			{Array.from(groups.entries()).map(([top, group]) => {
				const offscreen = top < 0
				const isEdge = group.some(line => line.kind === 'edge')
				const label = `${group.map(line => line.label).join(' / ')} · ${top}px`
				const key = group.map(line => line.id).join('+')

				// 阈值位于视口外上方（edges.last 较大时尾目标线常位于视口外）：不画贯穿线，
				// 仅在视口顶部固定一个标记牌提示真实阈值在视口外。
				if (offscreen) {
					return (
						<div
							key={key}
							className="pointer-events-none fixed left-0 right-0 top-0 z-20"
							aria-hidden="true"
						>
							<div className="mx-auto flex max-w-7xl justify-end px-4">
								<span className="mt-1 rounded-sm border border-dotted border-accent/60 bg-bg px-1.5 py-0.5 text-[10px] text-accent">
									▲ {label}（视口外上方）
								</span>
							</div>
						</div>
					)
				}

				return (
					<div
						key={key}
						className={`pointer-events-none fixed left-0 right-0 z-20 border-t ${
							isEdge ? 'border-dotted border-accent/60' : 'border-dashed border-accent'
						}`}
						style={{ top: `${top}px` }}
						aria-hidden="true"
					>
						<div className="mx-auto flex max-w-7xl justify-end px-4">
							<span
								className={`-translate-y-1/2 rounded-sm border bg-bg px-1.5 py-0.5 text-[10px] text-accent ${
									isEdge ? 'border-dotted border-accent/60' : 'border-dashed border-accent'
								}`}
							>
								{label}
							</span>
						</div>
					</div>
				)
			})}
		</>
	)
}
