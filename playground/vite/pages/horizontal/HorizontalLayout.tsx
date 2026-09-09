import { Outlet } from 'react-router'
import { SectionNav } from '../../components/SectionNav'

const items = [
	{ path: '/horizontal', label: 'Window' },
	{ path: '/horizontal/container', label: 'Container' },
	{ path: '/horizontal/overlay', label: 'Overlay' },
	{ path: '/horizontal/edge-boundary', label: 'EdgeBoundary' },
	{ path: '/horizontal/edges', label: 'Edges' },
	{ path: '/horizontal/responsive', label: 'Responsive' },
	{ path: '/horizontal/api-showcase', label: 'ApiShowcase' },
	{ path: '/horizontal/hash', label: 'Hash' },
]

/**
 * @zh 横向滚动演示分组布局。
 * 提供二级导航，子页面演示 direction: 'horizontal' 下的各类场景，
 * 与纵向分组一一对应（FixedHeader 对应 Overlay）。
 * @en Horizontal-scroll demo group layout.
 * Provides secondary navigation; the child pages demonstrate various scenarios under direction: 'horizontal',
 * one-to-one with the vertical group (FixedHeader corresponds to Overlay).
 */
export function HorizontalLayout() {
	return (
		<>
			<SectionNav items={items} />
			<Outlet />
		</>
	)
}
