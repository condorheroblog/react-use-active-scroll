import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router'
import { App } from './App'
import { VerticalLayout } from './pages/vertical/VerticalLayout'
import { Window } from './pages/vertical/Window'
import { Container } from './pages/vertical/Container'
import { FixedHeader } from './pages/vertical/FixedHeader'
import { EdgeBoundary } from './pages/vertical/EdgeBoundary'
import { Edges } from './pages/vertical/Edges'
import { Responsive } from './pages/vertical/Responsive'
import { ApiShowcase } from './pages/vertical/ApiShowcase'
import { Hash as VerticalHash } from './pages/vertical/Hash'
import { HorizontalLayout } from './pages/horizontal/HorizontalLayout'
import { Window as HorizontalWindow } from './pages/horizontal/Window'
import { Container as HorizontalContainer } from './pages/horizontal/Container'
import { Overlay as HorizontalOverlay } from './pages/horizontal/Overlay'
import { EdgeBoundary as HorizontalEdgeBoundary } from './pages/horizontal/EdgeBoundary'
import { Edges as HorizontalEdges } from './pages/horizontal/Edges'
import { Responsive as HorizontalResponsive } from './pages/horizontal/Responsive'
import { ApiShowcase as HorizontalApiShowcase } from './pages/horizontal/ApiShowcase'
import { Hash as HorizontalHash } from './pages/horizontal/Hash'
import './i18n' // @zh 初始化 i18next（默认英文，可在 Header 切换为中文） @en Initialize i18next (English by default, switchable to Chinese from the Header)
import './styles.css'

const router = createBrowserRouter(
	[
		{
			path: '/',
			element: <App />,
			children: [
				// @zh 默认展示纵向演示分组
				// @en Show the vertical demo group by default
				{ index: true, element: <Navigate to="/vertical" replace /> },
				{
					path: 'vertical',
					element: <VerticalLayout />,
					children: [
						{ index: true, element: <Window /> },
						{ path: 'container', element: <Container /> },
						{ path: 'fixed-header', element: <FixedHeader /> },
						{ path: 'edge-boundary', element: <EdgeBoundary /> },
						{ path: 'edges', element: <Edges /> },
						{ path: 'responsive', element: <Responsive /> },
						{ path: 'api-showcase', element: <ApiShowcase /> },
						{ path: 'hash', element: <VerticalHash /> },
					],
				},
				{
					path: 'horizontal',
					element: <HorizontalLayout />,
					children: [
						{ index: true, element: <HorizontalWindow /> },
						{ path: 'container', element: <HorizontalContainer /> },
						{ path: 'overlay', element: <HorizontalOverlay /> },
						{ path: 'edge-boundary', element: <HorizontalEdgeBoundary /> },
						{ path: 'edges', element: <HorizontalEdges /> },
						{ path: 'responsive', element: <HorizontalResponsive /> },
						{ path: 'api-showcase', element: <HorizontalApiShowcase /> },
						{ path: 'hash', element: <HorizontalHash /> },
					],
				},
			],
		},
	],
	{
		basename: '/react-use-active-scroll/',
	},
)

ReactDOM.createRoot(document.getElementById('app')!).render(
	<React.StrictMode>
		<RouterProvider router={router} />
	</React.StrictMode>,
)
