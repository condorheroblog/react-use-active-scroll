import { useContext } from 'react'
import type { TFunction } from 'i18next'
import { useTranslation } from 'react-i18next'
import { TOCDataContext } from '../pages/PageShell'
import type { TOCData } from '../types'

/** @zh 核心包的固定基准偏移（src/utils.ts FIXED_OFFSET） @en Fixed base offset from the core package (src/utils.ts FIXED_OFFSET) */
const FIXED_OFFSET = 10

interface ThresholdLine {
	id: string
	/** @zh 距滚动轴起点一侧的距离（纵向为 top，横向为 left），按容器/视口 border-box 计量 @en Distance from the start edge along the scroll axis (top for vertical, left for horizontal), measured from the container/viewport border-box */
	pos: number
	label: string
	kind: 'boundary' | 'edge'
}

type RenderMode = 'fixed' | 'absolute'

/**
 * @zh 由 tocData 计算阈值线集合。
 * 阈值 = FIXED_OFFSET(10) + overlay + 方向边界偏移 + 首尾边缘偏移，
 * 与核心包 src/useActiveScroll.ts 的判定一致（按容器/视口 border-box 计量）。
 * - ↓ / → 朝终点滚动：基线随 offset.toEnd 移动；首目标再叠加 edges.first（提前激活），
 *   尾目标在其末端越过触发线 edges.last 距离后解除。
 * - ↑ / ← 朝起点滚动：基线随 offset.toStart 移动；边缘偏移同理参与判定。
 * 边缘偏移仅在 edges.first / edges.last 为数字（或 false）时才参与判定。
 * @en Compute the set of threshold lines from tocData.
 * threshold = FIXED_OFFSET(10) + overlay + directional boundary offset + first/last edge offset,
 * matching the core package's logic in src/useActiveScroll.ts (measured from the container/viewport border-box).
 * - ↓ / → scrolling toward the end: the baseline moves with offset.toEnd; the first target adds
 *   edges.first (early activation), the last target deactivates after its end crosses the trigger line by edges.last.
 * - ↑ / ← scrolling toward the start: the baseline moves with offset.toStart; edge offsets participate likewise.
 * Edge offsets only participate when edges.first / edges.last are numbers (or false).
 */
function computeLines(tocData: TOCData, t: TFunction): ThresholdLine[] {
	const horizontal = tocData.direction === 'horizontal'
	const overlay = tocData.overlay ?? 0
	const offset = tocData.offset
	const toStart = typeof offset === 'number' ? offset : (offset?.toStart ?? 0)
	const toEnd = typeof offset === 'number' ? offset : (offset?.toEnd ?? 0)
	// @zh edges.first / last 缺省为 true（强制激活）；传数字或 false 时边缘偏移才参与判定。
	// @en edges.first / last default to true (forced activation); edge offsets only participate when a number or false is passed.
	const firstEdge = tocData.edges?.first
	const lastEdge = tocData.edges?.last
	const showFirstEdge = firstEdge !== undefined && firstEdge !== true
	const showLastEdge = lastEdge !== undefined && lastEdge !== true
	const edgeFirst = typeof firstEdge === 'number' ? firstEdge : 0
	const edgeLast = typeof lastEdge === 'number' ? lastEdge : 0

	const BASE = FIXED_OFFSET + overlay
	const triggerLineLabel = `${horizontal ? '→' : '↓'} ${t('threshold.triggerLine')}`
	const startLineLabel = `${horizontal ? '←' : '↑'} ${t('threshold.triggerLine')}`

	const lines: ThresholdLine[] = [
		{ id: 'end', pos: BASE + toEnd, label: triggerLineLabel, kind: 'boundary' },
		{ id: 'start', pos: BASE + toStart, label: startLineLabel, kind: 'boundary' },
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
	return lines
}

/** @zh 位置重合的线合并显示（如 toStart 与 toEnd 均为 0 时两条方向线重合） @en Merge lines at the same position for display (e.g. the two direction lines overlap when both toStart and toEnd are 0) */
function groupLines(lines: ThresholdLine[]): Map<number, ThresholdLine[]> {
	const groups = new Map<number, ThresholdLine[]>()
	for (const line of lines) {
		const group = groups.get(line.pos)
		if (group) group.push(line)
		else groups.set(line.pos, [line])
	}
	return groups
}

/**
 * @zh 渲染阈值线（窗口与容器共用）。
 * mode='fixed'：相对视口固定（窗口滚动场景）；横向 label 下沉到 70px 避让顶部导航，
 * 纵向 label 居中于线（-translate-y-1/2）并按页面 max-w-7xl 右对齐。
 * mode='absolute'：相对容器 border-box 定位（容器滚动场景）；label 贴线偏移不居中，
 * 避免在容器边缘上溢。offscreen（pos<0）时改为在轴起点边缘固定一个标记牌。
 * @en Render threshold lines (shared by window and container).
 * mode='fixed': fixed to the viewport (window-scroll); the horizontal label drops to 70px to clear the top nav,
 * and the vertical label is centered on the line (-translate-y-1/2) and right-aligned to the page's max-w-7xl.
 * mode='absolute': positioned relative to the container's border-box (container-scroll); the label hugs the line
 * without centering to avoid overflowing the container edge. When offscreen (pos<0), a marker is pinned at the axis start edge instead.
 */
function renderLines(
	groups: Map<number, ThresholdLine[]>,
	opts: { mode: RenderMode; horizontal: boolean; t: TFunction },
) {
	const { mode, horizontal, t } = opts
	const posClass = mode === 'fixed' ? 'fixed' : 'absolute'

	return Array.from(groups.entries()).map(([pos, group]) => {
		const offscreen = pos < 0
		const isEdge = group.some(line => line.kind === 'edge')
		const label = `${group.map(line => line.label).join(' / ')} · ${pos}px`
		const key = group.map(line => line.id).join('+')
		const edgeBorder = isEdge ? 'border-dotted border-accent/60' : 'border-dashed border-accent'

		if (horizontal) {
			// @zh 窗口场景横向 label 下沉避让顶部导航；容器场景贴容器左上角 @en Window mode drops the label to clear the top nav; container mode hugs the container's top-left
			const labelTop = mode === 'fixed' ? 'top-[70px]' : 'top-1'
			if (offscreen) {
				return (
					<div
						key={key}
						className={`pointer-events-none ${posClass} ${labelTop} left-0 z-20`}
						aria-hidden="true"
					>
						<span className="rounded-sm border border-dotted border-accent/60 bg-bg px-1.5 py-0.5 text-[10px] whitespace-nowrap text-accent">
							◀ {label} {t('threshold.offscreenLeft')}
						</span>
					</div>
				)
			}
			return (
				<div
					key={key}
					className={`pointer-events-none ${posClass} top-0 bottom-0 z-20 border-l ${edgeBorder}`}
					style={{ left: `${pos}px` }}
					aria-hidden="true"
				>
					<span
						className={`absolute ${labelTop} left-1 rounded-sm border bg-bg px-1.5 py-0.5 text-[10px] whitespace-nowrap text-accent ${edgeBorder}`}
					>
						{label}
					</span>
				</div>
			)
		}

		// @zh 窗口场景纵向 label 按页面 max-w-7xl 右对齐并居中于线；容器场景简化右对齐不居中 @en Window mode right-aligns the vertical label to the page's max-w-7xl and centers it on the line; container mode simplifies to right-aligned without centering
		const labelWrapper = mode === 'fixed'
			? 'mx-auto flex max-w-7xl justify-end px-4'
			: 'flex justify-end px-2'
		const labelTransform = mode === 'fixed' ? '-translate-y-1/2' : ''
		if (offscreen) {
			return (
				<div
					key={key}
					className={`pointer-events-none ${posClass} left-0 right-0 top-0 z-20`}
					aria-hidden="true"
				>
					<div className={labelWrapper}>
						<span className="mt-1 rounded-sm border border-dotted border-accent/60 bg-bg px-1.5 py-0.5 text-[10px] whitespace-nowrap text-accent">
							▲ {label} {t('threshold.offscreenTop')}
						</span>
					</div>
				</div>
			)
		}
		return (
			<div
				key={key}
				className={`pointer-events-none ${posClass} left-0 right-0 z-20 border-t ${edgeBorder}`}
				style={{ top: `${pos}px` }}
				aria-hidden="true"
			>
				<div className={labelWrapper}>
					<span
						className={`${labelTransform} rounded-sm border bg-bg px-1.5 py-0.5 text-[10px] whitespace-nowrap text-accent ${edgeBorder}`}
					>
						{label}
					</span>
				</div>
			</div>
		)
	})
}

/**
 * @zh 滚动触发阈值参考线（窗口滚动场景）。
 * 从 TOCDataContext 读取 overlay/offset/edges 等选项，自动调整阈值线位置；
 * 容器滚动场景（tocData.containerRef 存在）由 ContainerScanLine 负责，此处跳过。
 * @en Scroll trigger threshold reference lines (window-scroll scenario).
 * Reads overlay/offset/edges from TOCDataContext and auto-adjusts the line positions;
 * container-scroll scenarios (tocData.containerRef present) are handled by ContainerScanLine, which is skipped here.
 */
export function ScanLine() {
	const tocData = useContext(TOCDataContext)
	const { t } = useTranslation()
	if (!tocData || tocData.containerRef) return null
	const horizontal = tocData.direction === 'horizontal'
	const groups = groupLines(computeLines(tocData, t))
	return <>{renderLines(groups, { mode: 'fixed', horizontal, t })}</>
}

/**
 * @zh 容器内滚动触发阈值参考线。
 * 与 ScanLine 共用计算逻辑，但以 absolute 定位覆盖容器 border-box，
 * 让容器滚动场景的触发线也随 tocData 的 overlay/offset/edges 自动调整。
 * 需置于一个 position: relative 的包裹元素内（作为滚动容器的兄弟节点）。
 * @en In-container scroll trigger threshold reference lines.
 * Shares the computation logic with ScanLine but uses absolute positioning over the container's border-box,
 * so the container-scroll trigger lines also auto-adjust with tocData's overlay/offset/edges.
 * Must be placed inside a position: relative wrapper as a sibling of the scroll container.
 */
export function ContainerScanLine() {
	const tocData = useContext(TOCDataContext)
	const { t } = useTranslation()
	if (!tocData || !tocData.containerRef) return null
	const horizontal = tocData.direction === 'horizontal'
	const groups = groupLines(computeLines(tocData, t))
	return (
		<div className="pointer-events-none absolute inset-0 z-20" aria-hidden="true">
			{renderLines(groups, { mode: 'absolute', horizontal, t })}
		</div>
	)
}
