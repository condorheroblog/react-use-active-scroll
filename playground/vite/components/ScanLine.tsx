import { useContext } from 'react'
import { TOCDataContext } from '../pages/PageShell'

/**
 * 滚动触发阈值参考线。
 * 核心包的判定阈值并非固定一条线，而是按滚动方向与首尾目标组合：
 *   阈值 = FIXED_OFFSET(10) + overlayHeight + 方向边界偏移 + 首尾边缘偏移
 * - ↓ 向下滚动：基线随 boundaryOffset.toBottom 移动；首目标再叠加
 *   edgeOffset.first、尾目标再叠加 edgeOffset.last
 * - ↑ 向上滚动：基线随 boundaryOffset.toTop 移动；边缘偏移同理叠加
 * 边缘偏移仅在 jumpToFirst / jumpToLast 关闭时才参与判定（见 README）。
 */
export function ScanLine() {
	const tocData = useContext(TOCDataContext)
	const containerRef = tocData?.containerRef

	// 容器滚动场景在页面自身内部渲染参考线，避免全局固定定位错位。
	if (containerRef) return null

	const overlayHeight = tocData?.overlayHeight ?? 0
	const toTop = tocData?.boundaryOffset?.toTop ?? 0
	const toBottom = tocData?.boundaryOffset?.toBottom ?? 0
	// jump 开关缺省为 true；仅显式关闭对应 jump 时边缘偏移才参与判定。
	const showFirstEdge = tocData?.jumpToFirst === false
	const showLastEdge = tocData?.jumpToLast === false
	const edgeFirst = tocData?.edgeOffset?.first ?? 100
	const edgeLast = tocData?.edgeOffset?.last ?? -100

	const BASE = 10 + overlayHeight

	interface ThresholdLine {
		id: string
		top: number
		label: string
		kind: 'boundary' | 'edge'
	}

	const lines: ThresholdLine[] = [
		{ id: 'down', top: BASE + toBottom, label: '↓ 触发线', kind: 'boundary' },
		{ id: 'up', top: BASE + toTop, label: '↑ 触发线', kind: 'boundary' },
	]
	if (showFirstEdge) {
		lines.push({
			id: 'first',
			top: BASE + toBottom + edgeFirst,
			label: '首目标线 edge.first',
			kind: 'edge',
		})
	}
	if (showLastEdge) {
		lines.push({
			id: 'last',
			top: BASE + toBottom + edgeLast,
			label: '尾目标线 edge.last',
			kind: 'edge',
		})
	}

	// 位置重合的线合并显示（如 toTop 与 toBottom 均为 0 时两条方向线重合）。
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

				// 阈值位于视口外上方（edgeOffset.last 常为负值）：不画贯穿线，
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
