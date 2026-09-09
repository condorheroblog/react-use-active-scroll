import { useState } from 'react'
import { ScanLine } from './ScanLine'
import { Sidebar } from './Sidebar'

interface PageLayoutProps {
	children: React.ReactNode
	extraControls?: React.ReactNode
	/** @zh 窗口横向滚动场景：侧边栏改为 fixed，避免随文档横向滚出视口 @en Window horizontal-scroll scenario: make the sidebar fixed so it does not scroll out of the viewport horizontally */
	fixedSidebar?: boolean
}

/**
 * @zh 页面公共布局。
 * - PC：右侧 sticky 目录侧边栏（窗口横向滚动场景为 fixed）。
 * - 移动端（< md）：侧边栏隐藏，点击悬浮按钮从右侧滑出抽屉。
 * @en Shared page layout.
 * - PC: a sticky TOC sidebar on the right (fixed in the window horizontal-scroll scenario).
 * - Mobile (< md): the sidebar is hidden; a floating button slides out a drawer from the right.
 */
export function PageLayout({ children, extraControls, fixedSidebar }: PageLayoutProps) {
	const [drawerOpen, setDrawerOpen] = useState(false)

	return (
		<div className="relative mx-auto grid max-w-7xl grid-cols-1 md:grid-cols-[1fr_220px]">
			{/* @zh 主内容区 @en Main content area */}
			<div className="min-w-0 px-4 pb-20 pt-8 md:px-8">
				{children}
			</div>

			{/* @zh 桌面端侧边栏：窗口横向滚动场景 fixed 常驻，否则 sticky 跟随 @en Desktop sidebar: fixed and persistent in the window horizontal-scroll scenario, otherwise sticky */}
			<aside className="hidden md:block">
				{fixedSidebar ? (
					<div className="fixed top-20 right-4 z-40 w-[220px] space-y-6">
						<Sidebar extraControls={extraControls} />
					</div>
				) : (
					<div className="sticky top-20 space-y-6">
						<Sidebar extraControls={extraControls} />
					</div>
				)}
			</aside>

			{/* @zh 激活阈值参考线（容器内场景自行渲染，此处跳过） @en Activation threshold reference line (rendered separately for in-container scenarios; skipped here) */}
			<ScanLine />

			{/* @zh 移动端悬浮目录按钮 @en Mobile floating TOC button */}
			<button
				type="button"
				onClick={() => setDrawerOpen(true)}
				className="fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-accent text-white shadow-sm md:hidden"
				aria-label="打开目录"
			>
				<MenuIcon />
			</button>

			{/* @zh 移动端目录抽屉 @en Mobile TOC drawer */}
			{drawerOpen && (
				<>
					<div
						className="fixed inset-0 z-40 bg-fg/20 backdrop-blur-sm md:hidden"
						onClick={() => setDrawerOpen(false)}
						aria-hidden="true"
					/>
					<div className="fixed bottom-0 right-0 top-0 z-50 w-72 translate-x-0 transform border-l border-border bg-bg p-4 shadow-lg transition-transform duration-200 md:hidden">
						<div className="mb-4 flex items-center justify-between">
							<span className="text-sm font-semibold text-fg">目录</span>
							<button
								type="button"
								onClick={() => setDrawerOpen(false)}
								className="rounded-md p-1 text-muted hover:bg-card hover:text-fg"
								aria-label="关闭目录"
							>
								<CloseIcon />
							</button>
						</div>
						<Sidebar extraControls={extraControls} />
					</div>
				</>
			)}
		</div>
	)
}

function MenuIcon() {
	return (
		<svg
			width="20"
			height="20"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<line x1="4" y1="6" x2="20" y2="6" />
			<line x1="4" y1="12" x2="20" y2="12" />
			<line x1="4" y1="18" x2="20" y2="18" />
		</svg>
	)
}

function CloseIcon() {
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
			<line x1="18" y1="6" x2="6" y2="18" />
			<line x1="6" y1="6" x2="18" y2="18" />
		</svg>
	)
}
