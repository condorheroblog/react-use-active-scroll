import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PageShell } from '../PageShell'
import { useFakeData } from '../../hooks/useFakeData'
import type { EdgesOptions } from '../../types'

/**
 * @zh Edges 页面。
 * 演示 edges.first 与 edges.last 开关：
 * true 时到达顶部/底部始终强制激活第一个 / 最后一个目标；
 * 关闭后允许"无激活"，首尾目标按普通触发线判定。
 * @en Edges page.
 * Demonstrates the edges.first and edges.last switches:
 * when true, reaching the top/bottom always forces the first/last target to be active;
 * when disabled, "no active" is allowed and the first/last targets are judged by the normal trigger line.
 */
export function Edges() {
	const { sections, menuItems, pushSection, shiftSection } = useFakeData()
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
				edges: { first: options.first, last: options.last },
			}}
			demoButtons={{ pushSection, shiftSection }}
			extraControls={extraControls}
		>
			<div className="mx-auto max-w-2xl">
					<p className="mb-8 text-sm text-muted">
						{t('edges.desc')}
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
