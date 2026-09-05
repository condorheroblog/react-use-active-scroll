import { NavLink, useLocation } from 'react-router'

const routes = [
	{ path: '/', label: 'Window' },
	{ path: '/container', label: 'Container' },
	{ path: '/fixedheader', label: 'FixedHeader' },
	{ path: '/sections', label: 'Sections' },
]

export function Header() {
	const { pathname } = useLocation()
	const isFixedHeader = pathname === '/fixedheader' || pathname === '/sections'

	return (
		<nav className={`MainNav ${isFixedHeader ? 'FixedHeader' : ''}`}>
			<div>
				{routes.map(route => (
					<NavLink key={route.path} to={route.path} end>
						{route.label}
					</NavLink>
				))}
			</div>
		</nav>
	)
}
