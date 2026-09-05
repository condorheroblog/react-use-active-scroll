import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router'
import { App } from './App'
import { Basic } from './pages/Basic'
import { Container } from './pages/Container'
import { FixedHeader } from './pages/FixedHeader'
import { EdgeBoundary } from './pages/EdgeBoundary'
import { JumpToggles } from './pages/JumpToggles'
import { Responsive } from './pages/Responsive'
import { ApiShowcase } from './pages/ApiShowcase'
import './styles.css'

const router = createBrowserRouter([
	{
		path: '/',
		element: <App />,
		children: [
			{ index: true, element: <Basic /> },
			{ path: 'container', element: <Container /> },
			{ path: 'fixed-header', element: <FixedHeader /> },
			{ path: 'edge-boundary', element: <EdgeBoundary /> },
			{ path: 'jump-toggles', element: <JumpToggles /> },
			{ path: 'responsive', element: <Responsive /> },
			{ path: 'api-showcase', element: <ApiShowcase /> },
		],
	},
])

ReactDOM.createRoot(document.getElementById('app')!).render(
	<React.StrictMode>
		<RouterProvider router={router} />
	</React.StrictMode>,
)
