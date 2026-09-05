import { useContext, useMemo } from 'react'
import { useLocation } from 'react-router'
import animateScrollTo from 'animated-scroll-to'
import { useActiveScroll } from '../../src'
import { DemoRadiosContext } from '../App'
import { TOCDataContext } from '../pages/PageShell'

export function TOC() {
	const tocData = useContext(TOCDataContext)
	const radios = useContext(DemoRadiosContext)
	if (!tocData || !radios) throw new Error('TOC must be used within providers')

	const { menuItems, targets, containerRef, overlayHeight = 0 } = tocData
	const { clickType } = radios
	const location = useLocation()

	// ====== 唯一一处调用核心包 Hook ======
	const { activeIndex, activeId, setActive, isActive } = useActiveScroll(targets, {
		root: containerRef,
		overlayHeight,
		replaceHash: true,
	})

	// 测量激活项高度以驱动 Tracker 平移
	const activeItemHeight = useMemo(() => {
		const selector = `a[href="${location.pathname}#${activeId}"]`
		const el = document.querySelector(selector) as HTMLElement | null
		return el?.scrollHeight || 0
	}, [activeId, location.pathname])

	function customScroll(id: string) {
		setActive(id) // 先告诉核心包：本次滚动由目标触发
		const target = document.getElementById(id)
		if (!target) return
		animateScrollTo(target, {
			elementToScroll: containerRef?.current ?? window,
			easing: (x: number) =>
				1 + (1.70158 + 1) * Math.pow(x - 1, 3) + 1.70158 * Math.pow(x - 1, 2),
			maxDuration: 600,
			verticalOffset: -overlayHeight,
			cancelOnUserAction: true,
		})
	}

	function nativeScroll(id: string) {
		setActive(id) // 同样通知核心包，再由浏览器/路由执行 hash 滚动
		const target = document.getElementById(id)
		target?.scrollIntoView({
			behavior:
				clickType === 'custom'
					? 'auto'
					: (radios?.scrollBehavior as ScrollBehavior),
			block: 'start',
		})
	}

	const handleClick = (id: string) => {
		if (clickType === 'native') nativeScroll(id)
		else customScroll(id)
	}

	return (
		<nav className="TOCNav">
			<ul
				style={
					{
						'--ActiveIndex': activeIndex,
						'--ActiveItemHeight': `${activeItemHeight}px`,
					} as React.CSSProperties
				}
			>
				{activeIndex >= 0 && <span className="Tracker" />}
				{menuItems.map(item => (
					<li key={item.href}>
						<a
							href={`#${item.href}`}
							aria-current={isActive(item.href) ? 'true' : undefined}
							className={isActive(item.href) ? 'Active' : ''}
							onClick={(e) => {
								e.preventDefault()
								handleClick(item.href)
							}}
						>
							{item.label}
						</a>
					</li>
				))}
			</ul>
		</nav>
	)
}
