import { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { TOCDataContext } from '../pages/PageShell'

/**
 * @zh 滚动触发阈值参考线（窗口滚动场景：纵向滚动画横线，横向滚动画竖线）。
 * 核心包的判定阈值并非固定一条线，而是按滚动方向与首尾目标组合：
 *   阈值 = FIXED_OFFSET(10) + overlay + 方向边界偏移 + 首尾边缘偏移
 * - ↓ / → 朝终点滚动：基线随 offset.toEnd 移动；首目标再叠加 edges.first（提前激活），
 *   尾目标在其末端越过触发线 edges.last 距离后解除
 * - ↑ / ← 朝起点滚动：基线随 offset.toStart 移动；边缘偏移同理参与判定
 * 边缘偏移仅在 edges.first / edges.last 为数字（或 false）时才参与判定。
 * @en Scroll trigger threshold reference lines (window scrolling: horizontal lines for vertical
 * scroll, vertical lines for horizontal scroll). The core package's threshold is not a single fixed
 * line; it combines scroll direction with the first/last targets:
 *   threshold = FIXED_OFFSET(10) + overlay + directional boundary offset + first/last edge offset
 * - ↓ / → scrolling toward the end: the baseline moves with offset.toEnd; the first target adds
 *   edges.first (early activation), the last target deactivates after its end crosses the trigger
 *   line by edges.last
 * - ↑ / ← scrolling toward the start: the baseline moves with offset.toStart; edge offsets
 *   participate in the logic likewise
 * Edge offsets only participate when edges.first / edges.last are numbers (or false).
 */
export function ScanLine() {
	const tocData = useContext(TOCDataContext)
	const containerRef = tocData?.containerRef
	const { t } = useTranslation()

	// @zh 容器滚动场景在页面自身内部渲染参考线，避免全局固定定位错位。
	// @en In container-scroll scenarios the reference lines are rendered inside the page itself to avoid misalignment from global fixed positioning.
	if (containerRef) return null

	const horizontal = tocData?.direction === 'horizontal'
	const overlay = tocData?.overlay ?? 0
	const offset = tocData?.offset
	const toStart = typeof offset === 'number' ? offset : (offset?.toStart ?? 0)
	const toEnd = typeof offset === 'number' ? offset : (offset?.toEnd ?? 0)
	// @zh edges.first / last 缺省为 true（强制激活）；传数字或 false 时边缘偏移才参与判定。
	// @en edges.first / last default to true (forced activation); edge offsets only participate when a number or false is passed.
	const firstEdge = tocData?.edges?.first
	const lastEdge = tocData?.edges?.last
	const showFirstEdge = firstEdge !== undefined && firstEdge !== true
	const showLastEdge = lastEdge !== undefined && lastEdge !== true
	const edgeFirst = typeof firstEdge === 'number' ? firstEdge : 0
	const edgeLast = typeof lastEdge === 'number' ? lastEdge : 0

	const BASE = 10 + overlay

	interface ThresholdLine {
		id: string
		/** @zh 距视口滚动轴起点一侧的距离（纵向为 top，横向为 left） @en Distance from the viewport's start edge along the scroll axis (top for vertical, left for horizontal) */
		pos: number
		label: string
		kind: 'boundary' | 'edge'
	}

	// @zh 标签由翻译 + 方向箭头 + 代码标识拼装，便于随语言切换
	// @en Labels are assembled from translations + direction arrows + code identifiers so they follow the language switch
	const triggerLineLabel = `${horizontal ? '→' : '↓'} ${t('threshold.triggerLine')}`
	const startLineLabel = `${horizontal ? '←' : '↑'} ${t('threshold.triggerLine')}`

	const lines: ThresholdLine[] = [
		{
			id: 'end',
			pos: BASE + toEnd,
			label: triggerLineLabel,
			kind: 'boundary',
		},
		{
			id: 'start',
			pos: BASE + toStart,
			label: startLineLabel,
			kind: 'boundary',
		},
	]
	if (showFirstEdge) {
		lines.push({
			id: 'first',
			pos: BASE + toEnd + edgeFirst,
			label: `${t('threshold.firstTargetLine')} edges.first`,
			kind: 'edge',
		})
	}
	if (showLastEdge) {
		lines.push({
			id: 'last',
			pos: BASE + toEnd - edgeLast,
			label: `${t('threshold.lastTargetLine')} edges.last`,
			kind: 'edge',
		})
	}

	// @zh 位置重合的线合并显示（如 toStart 与 toEnd 均为 0 时两条方向线重合）。
	// @en Merge lines at the same position for display (e.g. the two direction lines overlap when both toStart and toEnd are 0).
	const groups = new Map<number, ThresholdLine[]>()
	for (const line of lines) {
		const group = groups.get(line.pos)
		if (group) group.push(line)
		else groups.set(line.pos, [line])
	}

	if (horizontal) {
		return (
			<>
				{Array.from(groups.entries()).map(([pos, group]) => {
					const offscreen = pos < 0
					const isEdge = group.some(line => line.kind === 'edge')
					const label = `${group.map(line => line.label).join(' / ')} · ${pos}px`
					const key = group.map(line => line.id).join('+')

					// @zh 阈值位于视口外左侧（edges.last 较大时尾目标线常位于视口外）：
					// 不画贯穿线，仅在视口左缘固定一个标记牌提示真实阈值在视口外。
					// @en The threshold is off the left edge of the viewport (the last-target line is often offscreen when edges.last is large):
					// do not draw a through-line; pin a marker at the viewport's left edge to indicate the real threshold is offscreen.
					if (offscreen) {
						return (
							<div
								key={key}
								className="pointer-events-none fixed top-[70px] left-0 z-20"
								aria-hidden="true"
							>
								<span className="rounded-sm border border-dotted border-accent/60 bg-bg px-1.5 py-0.5 text-[10px] text-accent">
										◀ {label} {t('threshold.offscreenLeft')}
									</span>
							</div>
						)
					}

					return (
						<div
							key={key}
							className={`pointer-events-none fixed top-0 bottom-0 z-20 border-l ${
								isEdge ? 'border-dotted border-accent/60' : 'border-dashed border-accent'
							}`}
							style={{ left: `${pos}px` }}
							aria-hidden="true"
						>
							<span
								className={`absolute top-[70px] left-1 rounded-sm border bg-bg px-1.5 py-0.5 text-[10px] whitespace-nowrap text-accent ${
									isEdge ? 'border-dotted border-accent/60' : 'border-dashed border-accent'
								}`}
							>
								{label}
							</span>
						</div>
					)
				})}
			</>
		)
	}

	return (
		<>
			{Array.from(groups.entries()).map(([top, group]) => {
				const offscreen = top < 0
				const isEdge = group.some(line => line.kind === 'edge')
				const label = `${group.map(line => line.label).join(' / ')} · ${top}px`
				const key = group.map(line => line.id).join('+')

				// @zh 阈值位于视口外上方（edges.last 较大时尾目标线常位于视口外）：不画贯穿线，
				// 仅在视口顶部固定一个标记牌提示真实阈值在视口外。
				// @en The threshold is off the top edge of the viewport (the last-target line is often offscreen when edges.last is large): do not draw a through-line;
				// pin a marker at the top of the viewport to indicate the real threshold is offscreen.
				if (offscreen) {
					return (
						<div
							key={key}
							className="pointer-events-none fixed left-0 right-0 top-0 z-20"
							aria-hidden="true"
						>
							<div className="mx-auto flex max-w-7xl justify-end px-4">
								<span className="mt-1 rounded-sm border border-dotted border-accent/60 bg-bg px-1.5 py-0.5 text-[10px] text-accent">
										▲ {label} {t('threshold.offscreenTop')}
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
