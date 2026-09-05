import { useContext, useEffect } from 'react'
import { DemoRadiosContext } from '../App'
import { DemoButtonsContext } from '../pages/PageShell'

/**
 * 全局演示控制面板。
 * 控制点击滚动类型（native / custom）与原生滚动行为（smooth / auto），
 * 并提供 Shift / Push 按钮演示目标集合的动态变化。
 */
export function DemoControls() {
	const radios = useContext(DemoRadiosContext)
	const buttons = useContext(DemoButtonsContext)
	if (!radios || !buttons) throw new Error('DemoControls must be used within providers')

	const { scrollBehavior, setScrollBehavior, clickType, setClickType } = radios
	const { shiftSection, pushSection } = buttons

	// native 模式由 CSS scroll-behavior 控制；custom 模式由 JS 动画库接管，
	// 因此容器滚动场景需要把 scroll-behavior 设为 auto，避免与 JS 动画冲突。
	useEffect(() => {
		document.documentElement.style.setProperty(
			'--ScrollBehavior',
			clickType === 'custom' ? 'auto' : scrollBehavior,
		)
	}, [scrollBehavior, clickType])

	return (
		<div className="space-y-4 rounded-md border border-border bg-card p-3">
			<fieldset className="space-y-2">
				<legend className="text-xs font-medium text-muted">Scroll</legend>
				<Radio
					name="clickType"
					value="native"
					checked={clickType === 'native'}
					onChange={() => setClickType('native')}
					label="Native"
				/>
				<Radio
					name="clickType"
					value="custom"
					checked={clickType === 'custom'}
					onChange={() => setClickType('custom')}
					label="Custom JS"
				/>
			</fieldset>

			<fieldset className="space-y-2" disabled={clickType === 'custom'}>
				<legend className="text-xs font-medium text-muted">scroll-behavior</legend>
				<Radio
					name="scrollBehavior"
					value="auto"
					checked={scrollBehavior === 'auto'}
					onChange={() => setScrollBehavior('auto')}
					label="auto"
				/>
				<Radio
					name="scrollBehavior"
					value="smooth"
					checked={scrollBehavior === 'smooth'}
					onChange={() => setScrollBehavior('smooth')}
					label="smooth"
				/>
			</fieldset>

			<div className="grid grid-cols-2 gap-2">
				<button
					type="button"
					onClick={shiftSection}
					className="rounded-sm border border-border bg-bg px-3 py-1.5 text-xs text-fg transition-colors hover:border-accent hover:text-accent"
				>
					Shift
				</button>
				<button
					type="button"
					onClick={pushSection}
					className="rounded-sm border border-border bg-bg px-3 py-1.5 text-xs text-fg transition-colors hover:border-accent hover:text-accent"
				>
					Push
				</button>
			</div>
		</div>
	)
}

function Radio({
	name,
	value,
	checked,
	onChange,
	label,
	disabled,
}: {
	name: string
	value: string
	checked: boolean
	onChange: () => void
	label: string
	disabled?: boolean
}) {
	return (
		<label className={`flex items-center gap-2 text-sm ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
			<input
				type="radio"
				name={name}
				value={value}
				checked={checked}
				onChange={onChange}
				disabled={disabled}
				className="accent-accent"
			/>
			<span className="text-fg">{label}</span>
		</label>
	)
}
