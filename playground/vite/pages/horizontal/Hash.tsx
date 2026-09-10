import { useMemo, useRef, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { PageShell } from '../PageShell'
import { HorizontalSections } from '../../components/HorizontalSections'
import { useFakeData } from '../../hooks/useFakeData'

type HashMode = 'off' | 'replace' | 'push'

const MODES: { value: HashMode, key: string }[] = [
	{ value: 'off', key: 'hash.modeOff' },
	{ value: 'replace', key: 'hash.modeReplace' },
	{ value: 'push', key: 'hash.modePush' },
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
					<Trans
						i18nKey="hashH.desc"
						components={{
							replace: <span className="text-accent" />,
							push: <span className="text-accent" />,
							off: <span className="text-accent" />,
						}}
					/>
				</p>

				<HorizontalSections sections={sections} containerRef={containerRef} />
			</div>
		</PageShell>
	)
}
