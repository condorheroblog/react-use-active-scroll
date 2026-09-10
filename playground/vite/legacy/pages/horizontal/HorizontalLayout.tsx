import { Outlet } from 'react-router'
import { SectionNav } from '../../components/SectionNav'

const items = [
	{ path: '/legacy/horizontal', label: 'Window' },
	{ path: '/legacy/horizontal/container', label: 'Container' },
	{ path: '/legacy/horizontal/overlay', label: 'Overlay' },
	{ path: '/legacy/horizontal/edge-boundary', label: 'EdgeBoundary' },
	{ path: '/legacy/horizontal/edges', label: 'Edges' },
	{ path: '/legacy/horizontal/responsive', label: 'Responsive' },
	{ path: '/legacy/horizontal/api-showcase', label: 'ApiShowcase' },
	{ path: '/legacy/horizontal/hash', label: 'Hash' },
]

/**
 * @zh 横向滚动演示分组布局。
 * 提供二级导航，子页面演示 direction: 'horizontal' 下的各类场景，
 * 与纵向分组一一对应。
 * @en Horizontal-scroll demo group layout.
 * Provides secondary navigation; the child pages demonstrate various scenarios under direction: 'horizontal',
 * one-to-one with the vertical group.
 */
export function HorizontalLayout() {
	return (
		<>
			<SectionNav items={items} />
			<Outlet />
		</>
	)
}
