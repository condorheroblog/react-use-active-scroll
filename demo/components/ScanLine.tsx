import { useContext } from 'react'
import { TOCDataContext } from '../pages/PageShell'

/** 滚动触发阈值参考线，帮助用户在滚动时直观看到激活判定位置。 */
export function ScanLine() {
	const tocData = useContext(TOCDataContext)
	if (!tocData) return null

	const { overlayHeight = 0, containerRef } = tocData

	// 容器滚动场景在页面自身内部渲染参考线，此处不再重复渲染。
	if (containerRef) return null

	const top = overlayHeight + 10

	return (
		<div className="ScanLine" style={{ top: `${top}px` }}>
			<span>trigger line</span>
		</div>
	)
}
