import { useContext, useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import animateScrollTo from 'animated-scroll-to'
// @zh 通过 vite.config.js 的 alias 映射到本地源码，保持导入与包名一致。
// @en Mapped to local source via the alias in vite.config.js so the import matches the package name.
import { useActiveScroll } from 'react-use-active-scroll'
import { DemoRadiosContext } from '../App'
import { TOCDataContext } from '../pages/PageShell'

/**
 * @zh 目录组件。
 * 唯一调用核心库 useActiveScroll 的地方，负责目录高亮与点击滚动。
 * @en Table-of-contents component.
 * The only place that calls the core useActiveScroll; handles TOC highlighting and click-to-scroll.
 */
export function TOC() {
	const tocData = useContext(TOCDataContext)
	const radios = useContext(DemoRadiosContext)
	if (!tocData || !radios) throw new Error('TOC must be used within providers')
	const { t } = useTranslation()

	const {
		menuItems,
		targets,
		containerRef,
		direction = 'vertical',
		overlay = 0,
		hash = 'off',
		edges,
		mediaQuery,
		offset,
	} = tocData
	const { clickType, scrollBehavior } = radios

	// @zh 稳定 options 对象引用，避免核心库 useEffect 因引用变化反复清理激活态。
	// @en Stabilize the options object reference so the core library's useEffect does not repeatedly clear the active state on reference changes.
	const offsetToStart = typeof offset === 'number' ? offset : offset?.toStart
	const offsetToEnd = typeof offset === 'number' ? offset : offset?.toEnd
	const options = useMemo(
		() => ({
			root: containerRef,
			direction,
			overlay,
			hash,
			edges,
			mediaQuery,
			offset,
		}),
		[
			containerRef,
			direction,
			overlay,
			hash,
			mediaQuery,
			edges?.first,
			edges?.last,
			offsetToStart,
			offsetToEnd,
		],
	)

	// @zh ====== 唯一一处调用核心包 Hook ======
	// @en ====== The single place that calls the core package hook ======
	const { activeIndex, activeId, setActive, isActive } = useActiveScroll(targets, options)

	const navRef = useRef<HTMLElement>(null)

	// @zh 通过 data-target 属性在当前 nav 内获取激活项高度，驱动 Tracker 平移。
	// 限定在 nav 内查询：移动端抽屉与桌面侧边栏可能同时挂载，
	// 全域查询会命中 display:none 的节点，scrollHeight 恒为 0。
	// @en Get the active item's height within the current nav via the data-target attribute to drive the Tracker's translation.
	// The query is scoped to the nav: the mobile drawer and desktop sidebar may both be mounted,
	// and a global query would hit display:none nodes whose scrollHeight is always 0.
	const activeItemHeight = useMemo(() => {
		if (!activeId) return 0
		const el = navRef.current?.querySelector(`[data-target="${activeId}"]`) as HTMLElement | null
		return el?.scrollHeight || 0
	}, [activeId])

	function customScroll(id: string) {
		setActive(id) // @zh 先告诉核心包：本次滚动由目标触发 @en Tell the core package first: this scroll is triggered by a target
		const target = document.getElementById(id)
		if (!target) return
		const animateOptions = {
			easing: (x: number) =>
				1 + (1.70158 + 1) * Math.pow(x - 1, 3) + 1.70158 * Math.pow(x - 1, 2),
			maxDuration: 600,
			cancelOnUserAction: true,
		}

		// @zh 横向：手动计算目标 scrollLeft 并以坐标形式调用，另一轴传 null 保持不动。
		// 动画库基于元素定位时会同时动画两轴，窗口场景会导致纵向意外跳动；
		// 滚动定位时为固定遮挡物留出空间（overlay）。
		// @en Horizontal: manually compute the target scrollLeft and call it as coordinates, passing null for the other axis to keep it still.
		// When positioning by element the animation library animates both axes, which would cause an unexpected vertical jump in window scenarios;
		// leave room for the fixed overlay when scrolling into position.
		if (direction === 'horizontal') {
			if (containerRef?.current) {
				const container = containerRef.current
				const desired
					= container.scrollLeft
					+ target.getBoundingClientRect().left
					- container.getBoundingClientRect().left
					- overlay
				animateScrollTo([desired, null], {
					elementToScroll: container,
					...animateOptions,
				})
			}
			else {
				const desired = window.scrollX + target.getBoundingClientRect().left - overlay
				animateScrollTo([desired, null], {
					elementToScroll: window,
					...animateOptions,
				})
			}
			return
		}

		animateScrollTo(target, {
			elementToScroll: containerRef?.current ?? window,
			...animateOptions,
			// @zh 滚动定位时为固定遮挡物留出空间 @en Leave room for the fixed overlay when scrolling into position
			verticalOffset: -overlay,
		})
	}

	function nativeScroll(id: string) {
		setActive(id) // @zh 同样通知核心包，再由浏览器执行 hash 滚动 @en Also notify the core package, then let the browser perform the hash scroll
		const target = document.getElementById(id)
		target?.scrollIntoView({
			behavior: clickType === 'custom' ? 'auto' : (scrollBehavior as ScrollBehavior),
			block: direction === 'horizontal' ? 'nearest' : 'start',
			inline: direction === 'horizontal' ? 'start' : 'nearest',
		})
	}

	const handleClick = (id: string) => {
		if (clickType === 'native') nativeScroll(id)
		else customScroll(id)
	}

	return (
		<nav ref={navRef} className="relative rounded-md border border-border bg-card p-3">
			<div className="mb-2 text-xs font-medium text-muted">{t('toc.title')}</div>
			{/* @zh 不使用 space-y：Tracker 按 单项高度 * 索引 平移，项间不能有额外间隙 @en Do not use space-y: the Tracker translates by itemHeight * index, so items cannot have extra gaps */}
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
