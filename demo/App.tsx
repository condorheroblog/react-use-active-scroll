import { createContext, useMemo, useState } from 'react'
import { Outlet } from 'react-router'
import { Header } from './components/Header'
import type { DemoRadios } from './types'

export const DemoRadiosContext = createContext<DemoRadios | null>(null)

export function App() {
	const [scrollBehavior, setScrollBehavior] = useState<'smooth' | 'auto'>('smooth')
	const [clickType, setClickType] = useState<'native' | 'custom'>('native')

	const value = useMemo<DemoRadios>(
		() => ({ scrollBehavior, setScrollBehavior, clickType, setClickType }),
		[scrollBehavior, clickType],
	)

	return (
		<DemoRadiosContext.Provider value={value}>
			<div className="Wrapper">
				<Header />
				<Outlet />
			</div>
		</DemoRadiosContext.Provider>
	)
}
