import { NavLink } from 'react-router'
import { useTheme } from '../hooks/useTheme'

const routes = [
	{ path: '/vertical', label: 'Vertical' },
	{ path: '/horizontal', label: 'Horizontal' },
]

/**
 * @zh 顶部导航栏。
 * - fixed 定位：纵向滚动常驻顶部；窗口横向滚动（horizontal/Window 演示）时
 *   sticky 无法水平固定（sticky 的水平可移动范围受包含块宽度限制，永远为 0），
 *   只有 fixed 才能锚定视口。
 * - fixed 不占文档流，渲染等高占位保持内容布局：
 *   12px padding * 2 + 34px 内容行 + 1px 边框 = 59px。
 * - 移动端导航可横向滚动；提供明亮 / 暗黑主题切换按钮。
 * - 主导航按滚动方向分组（Vertical / Horizontal），子演示由 SectionNav 提供。
 * @en Top navigation bar.
 * - fixed positioning: stays at the top during vertical scrolling; during window horizontal
 *   scrolling (the horizontal/Window demo) sticky cannot pin horizontally (sticky's horizontal
 *   travel range is bounded by the containing block width and is always 0), so only fixed anchors to the viewport.
 * - fixed is out of flow, so an equal-height spacer is rendered to preserve layout:
 *   12px padding * 2 + 34px content row + 1px border = 59px.
 * - The nav is horizontally scrollable on mobile; a light/dark theme toggle button is provided.
 * - The main nav is grouped by scroll direction (Vertical / Horizontal); sub-demos come from SectionNav.
 */
export function Header() {
	const { toggleTheme } = useTheme()

	return (
		<>
			{/* @zh 等高占位 @en Equal-height spacer */}
			<div className="h-[59px]" aria-hidden="true" />

			<nav className="fixed inset-x-0 top-0 z-50 border-b border-border bg-bg/90 backdrop-blur">
				<div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
					{/* @zh 品牌标题 @en Brand title */}
					<div className="hidden text-sm font-semibold text-fg sm:block">
						react-use-active-scroll
					</div>

					{/* @zh 导航链接：移动端横向滚动 @en Nav links: horizontally scrollable on mobile */}
					<div className="flex-1 overflow-x-auto pr-4 sm:flex-none">
						<div className="flex gap-5 text-sm">
							{routes.map(route => (
								<NavLink
									key={route.path}
									to={route.path}
									className={({ isActive }) =>
										`whitespace-nowrap transition-colors ${
											isActive
												? 'font-semibold text-accent'
												: 'text-muted hover:text-fg'
										}`
									}
								>
									{route.label}
								</NavLink>
							))}
						</div>
					</div>

					{/* @zh 主题切换按钮 @en Theme toggle button */}
					<button
						type="button"
						onClick={toggleTheme}
						className="ml-4 rounded-md p-2 text-muted transition-colors hover:bg-card hover:text-fg"
						aria-label="切换主题"
					>
						<SunMoonIcon />
					</button>
				</div>
			</nav>
		</>
	)
}

/**
 * @zh 太阳 / 月亮组合图标，不使用第三方图标库。
 * @en Combined sun/moon icon without a third-party icon library.
 */
function SunMoonIcon() {
	return (
		<svg
			width="18"
			height="18"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<circle cx="12" cy="12" r="5" />
			<path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
		</svg>
	)
}
