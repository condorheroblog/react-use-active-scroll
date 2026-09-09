import { useMemo, useRef, useState } from 'react'
import { PageShell } from '../PageShell'
import { HorizontalSections } from '../../components/HorizontalSections'
import { useFakeData } from '../../hooks/useFakeData'

type HashMode = 'off' | 'replace' | 'push'

const MODES: { value: HashMode, desc: string }[] = [
	{ value: 'off', desc: '不同步 URL' },
	{ value: 'replace', desc: '替换当前历史记录' },
	{ value: 'push', desc: '新增历史记录' },
]

/**
 * @zh 横向 Hash 页面。
 * 演示 hash 选项的三种 URL 同步模式在横向滚动下的表现。
 * @en Horizontal Hash page.
 * Demonstrates the behavior of the hash option's three URL sync modes under horizontal scrolling.
 */
export function Hash() {
	const { sections, menuItems, pushSection, shiftSection } = useFakeData()
	const containerRef = useRef<HTMLDivElement>(null)
	const targets = useMemo(() => sections.map(s => s.id), [sections])
	const [mode, setMode] = useState<HashMode>('replace')

	const extraControls = (
		<div className="rounded-md border border-border bg-card p-3 text-sm">
			<div className="mb-2 text-xs font-medium text-muted">hash</div>
			<div className="space-y-2">
				{MODES.map(({ value, desc }) => (
					<label key={value} className="flex cursor-pointer items-center gap-2">
						<input
							type="radio"
							name="hashMode"
							checked={mode === value}
							onChange={() => setMode(value)}
							className="accent-accent"
						/>
						<span className="font-mono text-xs text-fg">{`'${value}'`}</span>
						<span className="text-xs text-muted">{desc}</span>
					</label>
				))}
			</div>
		</div>
	)

	return (
		<PageShell
			tocData={{
				menuItems,
				targets,
				containerRef,
				direction: 'horizontal',
				hash: mode,
			}}
			demoButtons={{ pushSection, shiftSection }}
			extraControls={extraControls}
		>
			<div className="mx-auto max-w-4xl">
				<p className="mb-4 text-sm leading-relaxed text-muted">
					切换 hash 模式并横向滚动容器，观察地址栏变化：
					<span className="text-accent">replace</span> 替换当前历史记录，后退不会逐段回退；
					<span className="text-accent">push</span> 为每个段落新增历史记录，点击浏览器后退 / 前进
					可逐段恢复高亮（浏览器会同时把容器滚回对应 section）；
					<span className="text-accent">off</span> 完全不同步 URL。
				</p>

				<HorizontalSections sections={sections} containerRef={containerRef} triggerLine />
			</div>
		</PageShell>
	)
}
