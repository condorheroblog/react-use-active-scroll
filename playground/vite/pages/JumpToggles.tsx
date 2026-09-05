import { useMemo, useState } from 'react'
import { PageShell } from './PageShell'
import { useFakeData } from '../hooks/useFakeData'
import type { JumpToggleOptions } from '../types'

/**
 * JumpToggles 页面。
 * 演示 jumpToFirst 与 jumpToLast 开关：
 * 到达顶部/底部时是否强制激活第一个 / 最后一个目标。
 */
export function JumpToggles() {
	const { sections, menuItems, pushSection, shiftSection } = useFakeData()
	const targets = useMemo(() => sections.map(s => s.id), [sections])

	const [options, setOptions] = useState<JumpToggleOptions>({
		jumpToFirst: true,
		jumpToLast: true,
	})

	const extraControls = (
		<div className="rounded-md border border-border bg-card p-3 text-sm">
			<div className="mb-2 text-xs font-medium text-muted">Local Options</div>
			<div className="space-y-2">
				<Toggle
					label="jumpToFirst"
					checked={options.jumpToFirst}
					onChange={v => setOptions(prev => ({ ...prev, jumpToFirst: v }))}
				/>
				<Toggle
					label="jumpToLast"
					checked={options.jumpToLast}
					onChange={v => setOptions(prev => ({ ...prev, jumpToLast: v }))}
				/>
			</div>
		</div>
	)

	return (
		<PageShell
			tocData={{
				menuItems,
				targets,
				jumpToFirst: options.jumpToFirst,
				jumpToLast: options.jumpToLast,
			}}
			demoButtons={{ pushSection, shiftSection }}
			extraControls={extraControls}
		>
			<div className="mx-auto max-w-2xl">
				<p className="mb-8 text-sm text-muted">
					切换 jumpToFirst / jumpToLast，滚动到页面最顶部或最底部，观察首尾 section 是否被强制激活。
				</p>

				<div className="space-y-16">
					{sections.map(section => (
						<section key={section.id} className="scroll-mt-24">
							<h2 id={section.id} className="mb-4 text-2xl font-semibold text-fg">
								{section.title}
							</h2>
							<p className="leading-relaxed text-muted">{section.text}</p>
						</section>
					))}
				</div>
			</div>
		</PageShell>
	)
}

function Toggle({
	label,
	checked,
	onChange,
}: {
	label: string
	checked: boolean
	onChange: (value: boolean) => void
}) {
	return (
		<label className="flex cursor-pointer items-center justify-between text-sm text-fg">
			<span>{label}</span>
			<input
				type="checkbox"
				checked={checked}
				onChange={e => onChange(e.target.checked)}
				className="accent-accent"
			/>
		</label>
	)
}
