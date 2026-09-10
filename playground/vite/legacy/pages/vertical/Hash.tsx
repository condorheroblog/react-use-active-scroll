import { useMemo } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { useQueryState, parseAsStringLiteral } from 'nuqs'
import { PageShell } from '../PageShell'
import { useFakeData } from '../../hooks/useFakeData'

type HashMode = 'off' | 'replace' | 'push'

const MODES: { value: HashMode, key: string }[] = [
	{ value: 'off', key: 'hash.modeOff' },
	{ value: 'replace', key: 'hash.modeReplace' },
	{ value: 'push', key: 'hash.modePush' },
]

/**
 * @zh Hash 页面。
 * 演示 hash 选项的三种 URL 同步模式：
 * - off：不同步 URL hash
 * - replace：replaceState 替换当前历史记录，后退不逐段回退
 * - push：pushState 为每个段落新增历史记录，后退/前进逐段恢复高亮
 * @en Hash page.
 * Demonstrates the three URL sync modes of the hash option:
 * - off: do not sync the URL hash
 * - replace: replaceState replaces the current history entry, so going back does not step back section by section
 * - push: pushState adds a history entry for each section, so back/forward restores the highlight section by section
 */
export function Hash() {
	const { sections, menuItems, pushSection, shiftSection } = useFakeData()
	const targets = useMemo(() => sections.map(s => s.id), [sections])
	const [mode, setMode] = useQueryState('hm', parseAsStringLiteral(['off', 'replace', 'push'] as const).withDefault('replace'))
	const { t } = useTranslation()

	const extraControls = (
		<div className="rounded-md border border-border bg-card p-3 text-sm">
			<div className="mb-2 text-xs font-medium text-muted">hash</div>
			<div className="space-y-2">
				{MODES.map(({ value, key }) => (
					<label key={value} className="flex cursor-pointer items-center gap-2">
						<input
							type="radio"
							name="hashMode"
							checked={mode === value}
							onChange={() => setMode(value)}
							className="accent-accent"
						/>
						<span className="font-mono text-xs text-fg">{`'${value}'`}</span>
						<span className="text-xs text-muted">{t(key)}</span>
					</label>
				))}
			</div>
		</div>
	)

	return (
		<PageShell
			tocData={{ menuItems, targets, hash: mode, offset: 105 }}
			demoButtons={{ pushSection, shiftSection }}
			extraControls={extraControls}
		>
			<div className="mx-auto max-w-2xl">
				<p className="mb-8 text-sm leading-relaxed text-muted">
					<Trans
						i18nKey="hash.desc"
						components={{
							replace: <span className="text-accent" />,
							push: <span className="text-accent" />,
							off: <span className="text-accent" />,
						}}
					/>
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
