import { DemoControls } from './DemoControls'
import { TOC } from './TOC'

interface SidebarProps {
	extraControls?: React.ReactNode
}

/**
 * 目录侧边栏内容。
 * 同时用于桌面端侧边栏与移动端抽屉内部。
 */
export function Sidebar({ extraControls }: SidebarProps) {
	return (
		<div className="space-y-6">
			<DemoControls />
			{extraControls && <div className="space-y-3">{extraControls}</div>}
			<TOC />
		</div>
	)
}
