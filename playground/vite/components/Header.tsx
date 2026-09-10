import { Link, NavLink } from 'react-router'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../hooks/useTheme'
import { useLanguage } from '../hooks/useLanguage'

const GITHUB_URL = 'https://github.com/condorheroblog/react-use-active-scroll'

/**
 * @zh 顶部导航栏。
 * - fixed 定位：纵向滚动常驻顶部；窗口横向滚动（horizontal/Window 演示）时
 *   sticky 无法水平固定（sticky 的水平可移动范围受包含块宽度限制，永远为 0），
 *   只有 fixed 才能锚定视口。
 * - fixed 不占文档流，渲染等高占位保持内容布局：
 *   12px padding * 2 + 34px 内容行 + 1px 边框 = 59px。
 * - 移动端导航可横向滚动；右侧控制区从左到右依次为：
 *   GitHub 图标、语言切换按钮、主题切换按钮。
 * - 主导航按滚动方向分组（纵向 / 横向），子演示由 SectionNav 提供。
 * @en Top navigation bar.
 * - fixed positioning: stays at the top during vertical scrolling; during window horizontal
 *   scrolling (the horizontal/Window demo) sticky cannot pin horizontally (sticky's horizontal
 *   travel range is bounded by the containing block width and is always 0), so only fixed anchors to the viewport.
 * - fixed is out of flow, so an equal-height spacer is rendered to preserve layout:
 *   12px padding * 2 + 34px content row + 1px border = 59px.
 * - The nav is horizontally scrollable on mobile; the right-side controls are, from left to right:
 *   a GitHub icon, a language toggle button, and a theme toggle button.
 * - The main nav is grouped by scroll direction (Vertical / Horizontal); sub-demos come from SectionNav.
 */
export function Header() {
	const { toggleTheme } = useTheme()
	const { toggleLanguage } = useLanguage()
	const { t } = useTranslation()

	const routes = [
		{ path: '/vertical', label: t('nav.vertical') },
		{ path: '/horizontal', label: t('nav.horizontal') },
	]

	return (
		<>
			{/* @zh 等高占位 @en Equal-height spacer */}
			<div className="h-[59px]" aria-hidden="true" />

			<nav className="fixed inset-x-0 top-0 z-50 border-b border-border bg-bg/90 backdrop-blur">
				<div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
					{/* @zh 品牌图标：点击跳转首页 @en Brand icon: click to go home */}
					<Link to="/" className="hidden shrink-0 sm:block">
						<img
							src={`${import.meta.env.BASE_URL}logo.svg`}
							alt="react-use-active-scroll"
							className="h-8 w-8"
						/>
					</Link>

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

					{/* @zh 控制区：GitHub 图标 + 语言切换 + 主题切换 @en Controls: GitHub icon + language toggle + theme toggle */}
					<div className="ml-4 flex items-center gap-1">
						<a
							href={GITHUB_URL}
							target="_blank"
							rel="noopener noreferrer"
							className="rounded-md p-2 text-muted transition-colors hover:bg-card hover:text-fg"
							aria-label={t('aria.github')}
						>
							<GitHubIcon />
						</a>

						<button
							type="button"
							onClick={toggleLanguage}
							className="rounded-md p-2 text-muted transition-colors hover:bg-card hover:text-fg"
							aria-label={t('aria.toggleLanguage')}
						>
							<LanguageIcon />
						</button>

						<button
							type="button"
							onClick={toggleTheme}
							className="rounded-md p-2 text-muted transition-colors hover:bg-card hover:text-fg"
							aria-label={t('aria.toggleTheme')}
						>
							<SunMoonIcon />
						</button>
					</div>
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

/**
 * @zh 地球图标，表示语言切换。
 * @en Globe icon, indicating language switching.
 */
function LanguageIcon() {
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
			<circle cx="12" cy="12" r="10" />
			<path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
		</svg>
	)
}

/**
 * @zh GitHub 标志图标。
 * @en GitHub mark icon.
 */
function GitHubIcon() {
	return (
		<svg
			width="18"
			height="18"
			viewBox="0 0 24 24"
			fill="currentColor"
			aria-hidden="true"
		>
			<path d="M12 .5C5.73.5.5 5.73.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.7-3.88-1.54-3.88-1.54-.52-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.71.08-.71 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.1 11.1 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.42-2.69 5.39-5.25 5.68.41.36.78 1.07.78 2.16 0 1.56-.01 2.82-.01 3.2 0 .31.21.68.8.56A11.51 11.51 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5z" />
		</svg>
	)
}
