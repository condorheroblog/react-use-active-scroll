import { Outlet } from 'react-router'
import { SectionNav } from '../../components/SectionNav'

const items = [
	{ path: '/legacy/vertical', label: 'Window' },
	{ path: '/legacy/vertical/container', label: 'Container' },
	{ path: '/legacy/vertical/overlay', label: 'Overlay' },
	{ path: '/legacy/vertical/edge-boundary', label: 'EdgeBoundary' },
	{ path: '/legacy/vertical/edges', label: 'Edges' },
	{ path: '/legacy/vertical/responsive', label: 'Responsive' },
	{ path: '/legacy/vertical/api-showcase', label: 'ApiShowcase' },
	{ path: '/legacy/vertical/hash', label: 'Hash' },
]

/**
 * @zh 纵向滚动演示分组布局。
 * 提供二级导航，子页面为全部纵向演示。
 * @en Vertical-scroll demo group layout.
 * Provides secondary navigation; the child pages are all vertical-scroll demos.
 */
export function VerticalLayout() {
	return (
		<>
			<SectionNav items={items} />
			<Outlet />
		</>
	)
}
