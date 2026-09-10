import { Outlet } from 'react-router'
import { Header } from './components/Header'
import { useTheme } from './hooks/useTheme'

/**
 * @zh 应用根组件。
 * 仅负责挂载顶部导航与主题同步；演示配置状态由 Playground 页面自身管理。
 * @en App root component.
 * Only mounts the top nav and syncs the theme; demo config state is managed by the Playground page itself.
 */
export function App() {
	// @zh 挂载 useTheme 以同步初始主题类名
	// @en Mount useTheme to sync the initial theme class name
	useTheme()

	return (
		<div className="min-h-screen bg-bg text-fg">
			<Header />
			<Outlet />
		</div>
	)
}
