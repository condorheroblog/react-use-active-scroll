import { createContext, useMemo, useState } from 'react'
import { Outlet } from 'react-router'
import { Header } from './components/Header'
import { useTheme } from './hooks/useTheme'
import type { DemoRadios } from './types'

export const DemoRadiosContext = createContext<DemoRadios | null>(null)

/**
 * @zh 应用根组件。
 * 提供 DemoRadiosContext 与主题切换，并通过 useTheme 同步 <html> 类。
 * @en App root component.
 * Provides DemoRadiosContext and theme toggling, syncing the <html> class via useTheme.
 */
export function App() {
	const [scrollBehavior, setScrollBehavior] = useState<'smooth' | 'auto'>('smooth')
	const [clickType, setClickType] = useState<'native' | 'custom'>('native')

	// @zh 挂载 useTheme 以同步初始主题类名
	// @en Mount useTheme to sync the initial theme class name
	useTheme()

	const value = useMemo<DemoRadios>(
		() => ({ scrollBehavior, setScrollBehavior, clickType, setClickType }),
		[scrollBehavior, clickType],
	)

	return (
		<DemoRadiosContext.Provider value={value}>
			<div className="min-h-screen bg-bg text-fg">
				<Header />
				<Outlet />
			</div>
		</DemoRadiosContext.Provider>
	)
}
