import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router'
import { NuqsAdapter } from 'nuqs/adapters/react-router/v8'
import { App } from './App'
import { Playground } from './pages/Playground'
import { NotFound } from './pages/NotFound'
// @zh 旧版演示页：单独存放在 legacy/ 目录，代码与新版隔离，可随时一键删除
// @en Legacy demo pages: isolated in the legacy/ directory, easy to delete anytime
import { App as LegacyApp } from './legacy/App'
import { VerticalLayout } from './legacy/pages/vertical/VerticalLayout'
import { Window as VerticalWindow } from './legacy/pages/vertical/Window'
import { Container as VerticalContainer } from './legacy/pages/vertical/Container'
import { Overlay as VerticalOverlay } from './legacy/pages/vertical/Overlay'
import { EdgeBoundary as VerticalEdgeBoundary } from './legacy/pages/vertical/EdgeBoundary'
import { Edges as VerticalEdges } from './legacy/pages/vertical/Edges'
import { Responsive as VerticalResponsive } from './legacy/pages/vertical/Responsive'
import { ApiShowcase as VerticalApiShowcase } from './legacy/pages/vertical/ApiShowcase'
import { Hash as VerticalHash } from './legacy/pages/vertical/Hash'
import { HorizontalLayout } from './legacy/pages/horizontal/HorizontalLayout'
import { Window as HorizontalWindow } from './legacy/pages/horizontal/Window'
import { Container as HorizontalContainer } from './legacy/pages/horizontal/Container'
import { Overlay as HorizontalOverlay } from './legacy/pages/horizontal/Overlay'
import { EdgeBoundary as HorizontalEdgeBoundary } from './legacy/pages/horizontal/EdgeBoundary'
import { Edges as HorizontalEdges } from './legacy/pages/horizontal/Edges'
import { Responsive as HorizontalResponsive } from './legacy/pages/horizontal/Responsive'
import { ApiShowcase as HorizontalApiShowcase } from './legacy/pages/horizontal/ApiShowcase'
import { Hash as HorizontalHash } from './legacy/pages/horizontal/Hash'
import './i18n' // @zh 初始化 i18next（默认英文，可在 Header 切换为中文） @en Initialize i18next (English by default, switchable to Chinese from the Header)
import './styles.css'

const router = createBrowserRouter(
	[
		{
			// @zh 新版唯一演示页 @en New single demo page
			path: '/',
			element: <App />,
			children: [
				{ index: true, element: <Playground /> },
				{ path: '*', element: <NotFound /> },
			],
		},
		{
			// @zh ===== 旧版演示页路由（可一键删除 legacy/ 目录与此路由块） =====
			// @en ===== Legacy demo routes (delete the legacy/ directory and this route block to remove) =====
			path: '/legacy',
			element: <LegacyApp />,
			children: [
				{ index: true, element: <Navigate to="/legacy/vertical" replace /> },
				{
					path: 'vertical',
					element: <VerticalLayout />,
					children: [
						{ index: true, element: <VerticalWindow /> },
						{ path: 'container', element: <VerticalContainer /> },
						{ path: 'overlay', element: <VerticalOverlay /> },
						{ path: 'edge-boundary', element: <VerticalEdgeBoundary /> },
						{ path: 'edges', element: <VerticalEdges /> },
						{ path: 'responsive', element: <VerticalResponsive /> },
						{ path: 'api-showcase', element: <VerticalApiShowcase /> },
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
				{ path: '*', element: <NotFound /> },
			],
		},
	],
	{
		basename: '/react-use-active-scroll/',
	},
)

ReactDOM.createRoot(document.getElementById('app')!).render(
	<React.StrictMode>
		<NuqsAdapter>
			<RouterProvider router={router} />
		</NuqsAdapter>
	</React.StrictMode>,
)
