import { useContext, useMemo, useRef } from 'react'
import animateScrollTo from 'animated-scroll-to'
// 通过 vite.config.js 的 alias 映射到本地源码，保持导入与包名一致。
import { useActiveScroll } from 'react-use-active-scroll'
import { DemoRadiosContext } from '../App'
import { TOCDataContext } from '../pages/PageShell'

/**
 * 目录组件。
 * 唯一调用核心库 useActiveScroll 的地方，负责目录高亮与点击滚动。
 */
export function TOC() {
	const tocData = useContext(TOCDataContext)
	const radios = useContext(DemoRadiosContext)
	if (!tocData || !radios) throw new Error('TOC must be used within providers')

	const {
		menuItems,
		targets,
		containerRef,
		overlayHeight = 0,
		hash = 'off',
		edges,
		minWidth,
		offset,
	} = tocData
	const { clickType, scrollBehavior } = radios

	// 稳定 options 对象引用，避免核心库 useEffect 因引用变化反复清理激活态。
	const offsetToStart = typeof offset === 'number' ? offset : offset?.toStart
	const offsetToEnd = typeof offset === 'number' ? offset : offset?.toEnd
	const options = useMemo(
		() => ({
			root: containerRef,
			overlayHeight,
			hash,
			edges,
			minWidth,
			offset,
		}),
		[
			containerRef,
			overlayHeight,
			hash,
			minWidth,
			edges?.first,
			edges?.last,
			offsetToStart,
			offsetToEnd,
		],
	)

	// ====== 唯一一处调用核心包 Hook ======
	const { activeIndex, activeId, setActive, isActive } = useActiveScroll(targets, options)

	const navRef = useRef<HTMLElement>(null)

	// 通过 data-target 属性在当前 nav 内获取激活项高度，驱动 Tracker 平移。
	// 限定在 nav 内查询：移动端抽屉与桌面侧边栏可能同时挂载，
	// 全域查询会命中 display:none 的节点，scrollHeight 恒为 0。
	const activeItemHeight = useMemo(() => {
		if (!activeId) return 0
		const el = navRef.current?.querySelector(`[data-target="${activeId}"]`) as HTMLElement | null
		return el?.scrollHeight || 0
	}, [activeId])

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
		setActive(id) // 同样通知核心包，再由浏览器执行 hash 滚动
		const target = document.getElementById(id)
		target?.scrollIntoView({
			behavior: clickType === 'custom' ? 'auto' : (scrollBehavior as ScrollBehavior),
			block: 'start',
		})
	}

	const handleClick = (id: string) => {
		if (clickType === 'native') nativeScroll(id)
		else customScroll(id)
	}

	return (
		<nav ref={navRef} className="relative rounded-md border border-border bg-card p-3">
			<div className="mb-2 text-xs font-medium text-muted">目录</div>
			{/* 不使用 space-y：Tracker 按 单项高度 * 索引 平移，项间不能有额外间隙 */}
			<ul className="relative list-none p-0">
				{activeIndex >= 0 && activeItemHeight > 0 && (
					<span
						className="pointer-events-none absolute left-0 w-[calc(100%+12px)] rounded-r-sm border-l-2 border-accent bg-accent-soft backdrop-blur-sm transition-transform duration-100"
						style={{
							height: activeItemHeight,
							transform: `translateY(calc(${activeItemHeight}px * ${activeIndex}))`,
						}}
					/>
				)}
				{menuItems.map(item => (
					<li key={item.href}>
						<a
							data-target={item.href}
							href={`#${item.href}`}
							aria-current={isActive(item.href) ? 'true' : undefined}
							className={`relative block truncate rounded-r-sm px-2 py-1 text-sm transition-colors ${
								isActive(item.href)
									? 'font-medium text-accent'
									: 'text-muted hover:text-fg'
							}`}
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
