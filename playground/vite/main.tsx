import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router'
import { App } from './App'
import { Playground } from './pages/Playground'
import { NotFound } from './pages/NotFound'
import './i18n' // @zh 初始化 i18next（默认英文，可在 Header 切换为中文） @en Initialize i18next (English by default, switchable to Chinese from the Header)
import './styles.css'

const router = createBrowserRouter(
	[
		{
			path: '/',
			element: <App />,
			children: [
				// @zh 唯一演示页：全部配置项收进页面内的配置面板 @en The single demo page: all options live in its configuration panel
				{ index: true, element: <Playground /> },
				// @zh 兜底路由：未匹配的路径展示 404 页面
				// @en Catch-all route: unmatched paths show the 404 page
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
		<RouterProvider router={router} />
	</React.StrictMode>,
)
