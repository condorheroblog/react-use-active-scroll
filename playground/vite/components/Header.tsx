import { NavLink, useLocation } from 'react-router'
import { useTheme } from '../hooks/useTheme'

const routes = [
	{ path: '/', label: 'Basic' },
	{ path: '/container', label: 'Container' },
	{ path: '/fixed-header', label: 'FixedHeader' },
	{ path: '/edge-boundary', label: 'EdgeBoundary' },
	{ path: '/jump-toggles', label: 'JumpToggles' },
	{ path: '/responsive', label: 'Responsive' },
	{ path: '/api-showcase', label: 'ApiShowcase' },
]

/**
 * 顶部导航栏。
 * - 移动端导航可横向滚动。
 * - 提供明亮 / 暗黑主题切换按钮。
 * - FixedHeader / EdgeBoundary 等页面需要固定头部时，由页面自身控制，
 *   导航栏保持 sticky 定位以简化整体布局。
 */
export function Header() {
	const { pathname } = useLocation()
	const { toggleTheme } = useTheme()

	return (
		<nav className="sticky top-0 z-50 w-full border-b border-border bg-bg/90 backdrop-blur">
			<div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
				{/* 品牌标题 */}
				<div className="hidden text-sm font-semibold text-fg sm:block">
					react-use-active-scroll
				</div>

				{/* 导航链接：移动端横向滚动 */}
				<div className="flex-1 overflow-x-auto pr-4 sm:flex-none">
					<div className="flex gap-5 text-sm">
						{routes.map(route => (
							<NavLink
								key={route.path}
								to={route.path}
								end
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

				{/* 主题切换按钮 */}
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
	)
}

/**
 * 太阳 / 月亮组合图标，不使用第三方图标库。
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
