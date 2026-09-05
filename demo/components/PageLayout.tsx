import { ScanLine } from './ScanLine'
import { Sidebar } from './Sidebar'

export function PageLayout({ children }: { children: React.ReactNode }) {
	return (
		<div className="PageLayout">
			{children}
			<ScanLine />
			<Sidebar />
		</div>
	)
}
