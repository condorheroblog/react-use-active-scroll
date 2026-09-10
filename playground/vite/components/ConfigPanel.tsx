import { useEffect, useState } from 'react'
import type { TFunction } from 'i18next'
import { useTranslation } from 'react-i18next'
import { useDemo } from './DemoContext'
import type { DemoConfig, UpdateConfig } from '../types'

/**
 * @zh 统一配置面板。
 * 把 useActiveScroll 的全部配置项按分组展示：
 * - 核心配置：direction / root / overlay / edges / offset / mediaQuery / hash
 * - 演示行为：目录点击滚动方式、目标集合动态增删（非 Hook 配置）
 * 每个分组在配置偏离默认值（"激活"）时显示用法说明与当前效果，
 * 底部实时生成对应的 useActiveScroll 调用代码。
 * @en The unified configuration panel.
 * Groups every useActiveScroll option:
 * - Core options: direction / root / overlay / edges / offset / mediaQuery / hash
 * - Demo behavior: TOC click-scroll method, dynamic target mutations (not hook options)
 * When a group's value deviates from the default ("active"), usage notes and the
 * current effect are shown; the corresponding useActiveScroll call code is
 * generated live at the bottom.
 */
export function ConfigPanel({ update }: { update: UpdateConfig }) {
	const { t } = useTranslation()
	const { config, targets, pushSection, shiftSection } = useDemo()

	return (
		<div className="space-y-3">
			<div className="px-1 text-xs font-semibold tracking-wide text-fg">{t('panel.title')}</div>

			{/* @zh direction：滚动方向 @en direction: scroll direction */}
			<Group
				label="direction"
				active={config.direction !== 'vertical'}
				hint={t('panel.direction.hint')}
				activeText={t('panel.direction.active')}
			>
				<Segmented
					value={config.direction}
					onChange={v => update('direction', v)}
					options={[
						{ value: 'vertical', label: t('panel.direction.vertical') },
						{ value: 'horizontal', label: t('panel.direction.horizontal') },
					]}
				/>
			</Group>

			{/* @zh root：滚动容器 @en root: scroll container */}
			<Group
				label="root"
				active={config.rootMode === 'container'}
				hint={t('panel.root.hint')}
				activeText={t('panel.root.active')}
			>
				<Segmented
					value={config.rootMode}
					onChange={v => update('rootMode', v)}
					options={[
						{ value: 'window', label: t('panel.root.window') },
						{ value: 'container', label: t('panel.root.container') },
					]}
				/>
			</Group>

			{/* @zh overlay：固定遮挡物 @en overlay: fixed overlay */}
			<Group
				label="overlay"
				active={config.overlayEnabled}
				hint={t('panel.overlay.hint')}
				activeText={t('panel.overlay.active')}
			>
				<Toggle
					label={t('panel.overlay.enable')}
					checked={config.overlayEnabled}
					onChange={v => update('overlayEnabled', v)}
				/>
				{config.overlayEnabled && (
					<div className="mt-2">
						<Slider
							label={t('panel.overlay.size')}
							value={config.overlaySize}
							min={20}
							max={240}
							step={10}
							onChange={v => update('overlaySize', v)}
						/>
						{config.direction === 'vertical' && config.rootMode === 'window' && (
							<p className="mt-1 text-[10px] leading-relaxed text-muted">
								{t('panel.overlay.headerNote')}
							</p>
						)}
					</div>
				)}
			</Group>

			{/* @zh edges：首尾边缘激活策略 @en edges: first/last edge activation strategy */}
			<Group
				label="edges"
				active={config.edgesFirstMode === 'number' || config.edgesLastMode === 'number'}
				hint={t('panel.edges.hint')}
				activeText={t('panel.edges.active')}
			>
				<EdgeRow
					title="edges.first"
					mode={config.edgesFirstMode}
					value={config.edgesFirstValue}
					onModeChange={v => update('edgesFirstMode', v)}
					onValueChange={v => update('edgesFirstValue', v)}
					forceLabel={t('panel.edges.force')}
					numberLabel={t('panel.edges.number')}
				/>
				<EdgeRow
					title="edges.last"
					mode={config.edgesLastMode}
					value={config.edgesLastValue}
					onModeChange={v => update('edgesLastMode', v)}
					onValueChange={v => update('edgesLastValue', v)}
					forceLabel={t('panel.edges.force')}
					numberLabel={t('panel.edges.number')}
				/>
			</Group>

			{/* @zh offset：滚动边界偏移 @en offset: scroll boundary offset */}
			<Group
				label="offset"
				active={config.offsetToStart !== 0 || config.offsetToEnd !== 0}
				hint={t('panel.offset.hint')}
				activeText={t('panel.offset.active')}
			>
				<Slider
					label="offset.toStart"
					value={config.offsetToStart}
					min={-200}
					max={600}
					step={10}
					onChange={v => update('offsetToStart', v)}
				/>
				<Slider
					label="offset.toEnd"
					value={config.offsetToEnd}
					min={-200}
					max={600}
					step={10}
					onChange={v => update('offsetToEnd', v)}
				/>
			</Group>

			{/* @zh mediaQuery：响应式门控 @en mediaQuery: responsive gate */}
			<MediaQueryGroup config={config} update={update} />

			{/* @zh hash：URL 同步 @en hash: URL sync */}
			<Group
				label="hash"
				active={config.hash !== 'off'}
				hint={t('panel.hash.hint')}
				activeText={
					config.hash === 'replace'
						? t('panel.hash.activeReplace')
						: config.hash === 'push'
							? t('panel.hash.activePush')
							: undefined
				}
			>
				<div className="space-y-1.5">
					{(['off', 'replace', 'push'] as const).map(mode => (
						<label key={mode} className="flex cursor-pointer items-center gap-2 text-xs">
							<input
								type="radio"
								name="hashMode"
								checked={config.hash === mode}
								onChange={() => update('hash', mode)}
								className="accent-accent"
							/>
							<span className="font-mono text-fg">{`'${mode}'`}</span>
							<span className="text-muted">{t(`panel.hash.${mode}`)}</span>
						</label>
					))}
				</div>
			</Group>

			{/* @zh 演示行为：点击滚动方式（非 Hook 配置） @en Demo behavior: click-scroll method (not a hook option) */}
			<Group label={t('panel.scroll.label')} demo hint={t('panel.scroll.hint')}>
				<div className="space-y-2">
					<div>
						<div className="mb-1 text-[11px] text-muted">{t('panel.scroll.clickType')}</div>
						<Segmented
							value={config.clickType}
							onChange={v => update('clickType', v)}
							options={[
								{ value: 'native', label: t('panel.scroll.native') },
								{ value: 'custom', label: t('panel.scroll.custom') },
							]}
						/>
					</div>
					<div>
						<div className="mb-1 text-[11px] text-muted">{t('panel.scroll.behavior')}</div>
						<Segmented
							value={config.scrollBehavior}
							disabled={config.clickType === 'custom'}
							onChange={v => update('scrollBehavior', v)}
							options={[
								{ value: 'smooth', label: t('panel.scroll.smooth') },
								{ value: 'auto', label: t('panel.scroll.auto') },
							]}
						/>
					</div>
				</div>
			</Group>

			{/* @zh 演示行为：动态目标集合（非 Hook 配置） @en Demo behavior: dynamic target set (not a hook option) */}
			<Group
				label={t('panel.targets.label')}
				demo
				hint={t('panel.targets.hint', { count: targets.length })}
			>
				<div className="grid grid-cols-2 gap-2">
					<button type="button" onClick={shiftSection} className={demoButtonClass}>
						{t('panel.targets.shift')}
					</button>
					<button type="button" onClick={pushSection} className={demoButtonClass}>
						{t('panel.targets.push')}
					</button>
				</div>
			</Group>

			{/* @zh 实时生成的调用代码 @en Live-generated call code */}
			<div className="rounded-md border border-border bg-card p-3">
				<div className="mb-2 text-xs font-medium text-muted">{t('panel.codeTitle')}</div>
				<pre className="overflow-x-auto whitespace-pre text-[10.5px] leading-relaxed text-fg">
					{buildCode(config, t)}
				</pre>
			</div>
		</div>
	)
}

const demoButtonClass =
	'rounded-sm border border-border bg-bg px-3 py-1.5 text-xs text-fg transition-colors hover:border-accent hover:text-accent'

/**
 * @zh 根据当前配置生成 useActiveScroll 调用代码；
 * 与默认值一致的选项省略，全部默认时给出无参形式。
 * @en Generate the useActiveScroll call code from the current config;
 * options matching the defaults are omitted, and the no-arg form is shown when all are default.
 */
function buildCode(config: DemoConfig, t: (key: string) => string): string {
	const lines: string[] = []
	if (config.direction !== 'vertical') lines.push(`  direction: '${config.direction}',`)
	if (config.rootMode === 'container') lines.push('  root: containerRef,')
	if (config.overlayEnabled) lines.push(`  overlay: ${config.overlaySize},`)

	const first = config.edgesFirstMode === 'force' ? true : config.edgesFirstValue
	const last = config.edgesLastMode === 'force' ? true : config.edgesLastValue
	if (first !== true || last !== true) lines.push(`  edges: { first: ${first}, last: ${last} },`)

	if (config.offsetToStart !== 0 || config.offsetToEnd !== 0)
		lines.push(`  offset: { toStart: ${config.offsetToStart}, toEnd: ${config.offsetToEnd} },`)

	if (config.mediaQueryEnabled && config.mediaQuery.trim())
		lines.push(`  mediaQuery: '${config.mediaQuery}',`)

	if (config.hash !== 'off') lines.push(`  hash: '${config.hash}',`)

	if (lines.length === 0) return `useActiveScroll(targets)\n// ${t('panel.codeDefault')}`
	return `useActiveScroll(targets, {\n${lines.join('\n')}\n})`
}

/**
 * @zh mediaQuery 分组：开关 + 查询输入 + 实时匹配状态徽标。
 * @en mediaQuery group: toggle + query input + live match-status badge.
 */
function MediaQueryGroup({ config, update }: { config: DemoConfig; update: UpdateConfig }) {
	const { t } = useTranslation()
	const status = useMediaQueryStatus(config.mediaQueryEnabled, config.mediaQuery)

	const badge =
		status === 'matches'
			? { text: t('panel.mediaQuery.matchBadge'), cls: 'bg-accent-soft text-accent' }
			: status === 'no-match'
				? { text: t('panel.mediaQuery.noMatchBadge'), cls: 'bg-card text-muted border border-border' }
				: status === 'invalid'
					? { text: t('panel.mediaQuery.invalidBadge'), cls: 'bg-red-500/10 text-red-500' }
					: null

	return (
		<Group
			label="mediaQuery"
			active={config.mediaQueryEnabled}
			hint={t('panel.mediaQuery.hint')}
			activeText={t('panel.mediaQuery.active')}
		>
			<Toggle
				label={t('panel.mediaQuery.enable')}
				checked={config.mediaQueryEnabled}
				onChange={v => update('mediaQueryEnabled', v)}
			/>
			{config.mediaQueryEnabled && (
				<div className="mt-2 space-y-2">
					<input
						type="text"
						value={config.mediaQuery}
						onChange={e => update('mediaQuery', e.target.value)}
						spellCheck={false}
						placeholder="(min-width: 768px)"
						className="w-full rounded-sm border border-border bg-bg px-2 py-1 font-mono text-[11px] text-fg outline-none focus:border-accent"
					/>
					{badge && (
						<span className={`inline-block rounded-sm px-2 py-0.5 text-[10px] ${badge.cls}`}>
							{badge.text}
						</span>
					)}
				</div>
			)}
		</Group>
	)
}

/** @zh 媒体查询匹配状态：off / matches / no-match / invalid @en Media query match status: off / matches / no-match / invalid */
type MqStatus = 'off' | 'matches' | 'no-match' | 'invalid'

function useMediaQueryStatus(enabled: boolean, query: string): MqStatus {
	const [status, setStatus] = useState<MqStatus>('off')

	useEffect(() => {
		if (!enabled) {
			setStatus('off')
			return
		}
		if (!query.trim()) {
			setStatus('invalid')
			return
		}
		const mql = window.matchMedia(query)
		if (mql.media === 'not all') {
			setStatus('invalid')
			return
		}
		const update = () => setStatus(mql.matches ? 'matches' : 'no-match')
		update()
		mql.addEventListener('change', update)
		return () => mql.removeEventListener('change', update)
	}, [enabled, query])

	return status
}

/**
 * @zh edges 单行：force(true) / number 模式切换 + 数字模式下的距离滑块。
 * @en Single edges row: force(true) / number mode switch plus the distance slider in number mode.
 */
function EdgeRow({
	title,
	mode,
	value,
	onModeChange,
	onValueChange,
	forceLabel,
	numberLabel,
}: {
	title: string
	mode: DemoConfig['edgesFirstMode']
	value: number
	onModeChange: (mode: DemoConfig['edgesFirstMode']) => void
	onValueChange: (value: number) => void
	forceLabel: string
	numberLabel: string
}) {
	return (
		<div className="space-y-1.5 my-2">
			<div className="flex items-center justify-between gap-2">
				<span className="font-mono text-[11px] text-fg">{title}</span>
				<Segmented
					value={mode}
					onChange={onModeChange}
					options={[
						{ value: 'force', label: forceLabel },
						{ value: 'number', label: numberLabel },
					]}
				/>
			</div>
			{mode === 'number' && (
				<Slider label="" value={value} min={-400} max={600} step={10} onChange={onValueChange} />
			)}
		</div>
	)
}

/**
 * @zh 分组卡片：标题 + 控件 + 常驻提示 + 激活说明。
 * @en Group card: title + controls + persistent hint + active description.
 */
function Group({
	label,
	active = false,
	demo = false,
	hint,
	activeText,
	children,
}: {
	label: string
	active?: boolean
	demo?: boolean
	hint: string
	activeText?: string
	children: React.ReactNode
}) {
	const { t } = useTranslation()
	return (
		<section className="rounded-md border border-border bg-card p-3">
			<header className="mb-2 flex items-center justify-between gap-2">
				<span className="font-mono text-xs font-semibold text-fg">{label}</span>
				{demo ? (
					<span className="rounded-sm bg-card px-1.5 py-0.5 text-[10px] text-muted border border-border">
						{t('panel.demoTag')}
					</span>
				) : active ? (
					<span className="rounded-sm bg-accent-soft px-1.5 py-0.5 text-[10px] text-accent">
						{t('panel.activeBadge')}
					</span>
				) : null}
			</header>
			{children}
			<p className="mt-2 text-[11px] leading-relaxed text-muted">{hint}</p>
			{active && activeText && (
				<p className="mt-2 rounded-sm bg-accent-soft p-2 text-[11px] leading-relaxed text-accent">
					{activeText}
				</p>
			)}
		</section>
	)
}

/** @zh 分段选择器 @en Segmented selector */
function Segmented<T extends string>({
	value,
	onChange,
	options,
	disabled = false,
}: {
	value: T
	onChange: (value: T) => void
	options: { value: T; label: string }[]
	disabled?: boolean
}) {
	return (
		<div
			className={`grid gap-1 ${options.length === 2 ? 'grid-cols-2' : 'grid-cols-3'} ${
				disabled ? 'pointer-events-none opacity-40' : ''
			}`}
		>
			{options.map(opt => (
				<button
					key={opt.value}
					type="button"
					onClick={() => onChange(opt.value)}
					className={`rounded-sm border px-2 py-1 text-[11px] transition-colors ${
						value === opt.value
							? 'border-accent bg-accent text-white'
							: 'border-border bg-bg text-muted hover:text-fg'
					}`}
				>
					{opt.label}
				</button>
			))}
		</div>
	)
}

/** @zh 范围滑块 @en Range slider */
function Slider({
	label,
	value,
	min,
	max,
	step,
	onChange,
}: {
	label: string
	value: number
	min: number
	max: number
	step: number
	onChange: (value: number) => void
}) {
	return (
		<div className="mb-2">
			<div className="mb-1 flex justify-between text-[11px] text-muted">
				<span className="font-mono">{label}</span>
				<span>{value}px</span>
			</div>
			<input
				type="range"
				min={min}
				max={max}
				step={step}
				value={value}
				onChange={e => onChange(Number(e.target.value))}
				className="w-full accent-accent"
				aria-label={label || undefined}
			/>
		</div>
	)
}

/** @zh 开关行 @en Toggle row */
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
		<label className="flex cursor-pointer items-center justify-between text-xs text-fg">
			<span>{label}</span>
			<input
				type="checkbox"
				checked={checked}
				onChange={e => onChange(e.target.checked)}
				className="h-4 w-4 accent-accent"
			/>
		</label>
	)
}
