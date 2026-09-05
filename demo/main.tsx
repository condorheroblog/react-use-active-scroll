import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router'
import { App } from './App'
import { Window } from './pages/Window'
import { Container } from './pages/Container'
import { FixedHeader } from './pages/FixedHeader'
import { Sections } from './pages/Sections'
import './styles.css'

const router = createBrowserRouter([
	{
		path: '/',
		element: <App />,
		children: [
			{ index: true, element: <Window /> },
			{ path: 'container', element: <Container /> },
			{ path: 'fixedheader', element: <FixedHeader /> },
			{ path: 'sections', element: <Sections /> },
		],
	},
])

ReactDOM.createRoot(document.getElementById('app')!).render(
	<React.StrictMode>
		<RouterProvider router={router} />
	</React.StrictMode>,
)
