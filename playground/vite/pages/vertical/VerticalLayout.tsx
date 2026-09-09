import { Outlet } from 'react-router'
import { SectionNav } from '../../components/SectionNav'

const items = [
	{ path: '/vertical', label: 'Window' },
	{ path: '/vertical/container', label: 'Container' },
	{ path: '/vertical/fixed-header', label: 'FixedHeader' },
	{ path: '/vertical/edge-boundary', label: 'EdgeBoundary' },
	{ path: '/vertical/edges', label: 'Edges' },
	{ path: '/vertical/responsive', label: 'Responsive' },
	{ path: '/vertical/api-showcase', label: 'ApiShowcase' },
	{ path: '/vertical/hash', label: 'Hash' },
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
