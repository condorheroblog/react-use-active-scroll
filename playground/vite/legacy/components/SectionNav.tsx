import { NavLink } from 'react-router'

interface SectionNavItem {
	path: string
	label: string
}

interface SectionNavProps {
	items: SectionNavItem[]
}

/**
 * @zh 分组子导航。
 * 顶部主导航（Vertical / Horizontal）下的二级路由入口，
 * 移动端可横向滚动。
 * @en Group sub-navigation.
 * Secondary route entries under the top main nav (Vertical / Horizontal);
 * horizontally scrollable on mobile.
 */
export function SectionNav({ items }: SectionNavProps) {
	return (
		<div className="border-b border-border bg-bg/60 backdrop-blur">
			<div className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 py-1.5 text-sm">
				{items.map(item => (
					<NavLink
						key={item.path}
						to={item.path}
						end
						className={({ isActive }) =>
							`whitespace-nowrap rounded-full px-3 py-1 transition-colors ${
								isActive
									? 'bg-accent-soft font-medium text-accent'
									: 'text-muted hover:bg-card hover:text-fg'
							}`
						}
					>
						{item.label}
					</NavLink>
				))}
			</div>
		</div>
	)
}
