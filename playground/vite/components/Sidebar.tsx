import { ConfigPanel } from './ConfigPanel'
import { TOC } from './TOC'
import type { UpdateConfig } from '../types'

interface SidebarProps {
	update: UpdateConfig
}

/**
 * @zh 侧边栏内容：目录高亮 + 统一配置面板。
 * 同时用于桌面端侧边栏与移动端抽屉内部。
 * @en Sidebar content: TOC highlight + the unified configuration panel.
 * Used both for the desktop sidebar and inside the mobile drawer.
 */
export function Sidebar({ update }: SidebarProps) {
	return (
		<div className="space-y-4">
			<TOC />
			<ConfigPanel update={update} />
		</div>
	)
}
