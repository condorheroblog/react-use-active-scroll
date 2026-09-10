import { useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PageShell } from '../PageShell'
import { HorizontalSections } from '../../components/HorizontalSections'
import { useFakeData } from '../../hooks/useFakeData'
import type { EdgesOptions } from '../../types'

/**
 * @zh 横向 Edges 页面。
 * 演示 edges.first 与 edges.last 开关在横向滚动下的行为：
 * true 时到达容器最左 / 最右始终强制激活第一个 / 最后一个目标；
 * 关闭后允许"无激活"，首尾目标按普通触发线判定。
 * @en Horizontal Edges page.
 * Demonstrates the behavior of the edges.first and edges.last switches under horizontal scrolling:
 * when true, reaching the far left/far right of the container always forces the first/last target to be active;
 * when disabled, "no active" is allowed and the first/last targets are judged by the normal trigger line.
 */
export function Edges() {
	const { sections, menuItems, pushSection, shiftSection } = useFakeData()
	const containerRef = useRef<HTMLDivElement>(null)
	const targets = useMemo(() => sections.map(s => s.id), [sections])
	const { t } = useTranslation()

	const [options, setOptions] = useState<EdgesOptions>({
		first: true,
		last: true,
	})

	const extraControls = (
		<div className="rounded-md border border-border bg-card p-3 text-sm">
			<div className="mb-2 text-xs font-medium text-muted">{t('common.localOptions')}</div>
			<div className="space-y-2">
				<Toggle
					label="edges.first"
					checked={options.first}
					onChange={v => setOptions(prev => ({ ...prev, first: v }))}
				/>
				<Toggle
					label="edges.last"
					checked={options.last}
					onChange={v => setOptions(prev => ({ ...prev, last: v }))}
				/>
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
				edges: { first: options.first, last: options.last },
			}}
			demoButtons={{ pushSection, shiftSection }}
			extraControls={extraControls}
		>
			<div className="mx-auto max-w-4xl">
					<p className="mb-4 text-sm text-muted">
						{t('edgesH.desc')}
					</p>

				<HorizontalSections sections={sections} containerRef={containerRef} triggerLine />
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
