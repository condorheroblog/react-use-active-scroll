import { useContext, useEffect } from 'react'
import { DemoRadiosContext } from '../App'
import { DemoButtonsContext } from '../pages/PageShell'

export function DemoControls() {
	const radios = useContext(DemoRadiosContext)
	const buttons = useContext(DemoButtonsContext)
	if (!radios || !buttons) throw new Error('DemoControls must be used within providers')

	const { scrollBehavior, setScrollBehavior, clickType, setClickType } = radios
	const { shiftSection, pushSection } = buttons

	useEffect(() => {
		document.documentElement.style.setProperty(
			'--ScrollBehavior',
			clickType === 'custom' ? 'auto' : scrollBehavior,
		)
	}, [scrollBehavior, clickType])

	return (
		<div className="Controls">
			<fieldset>
				<legend>Scroll</legend>
				<div>
					<label>
						<input
							type="radio"
							name="clickType"
							value="native"
							checked={clickType === 'native'}
							onChange={() => setClickType('native')}
						/>
						Native
					</label>
					<label>
						<input
							type="radio"
							name="clickType"
							value="custom"
							checked={clickType === 'custom'}
							onChange={() => setClickType('custom')}
						/>
						Custom JS
					</label>
				</div>
			</fieldset>

			<fieldset disabled={clickType === 'custom'}>
				<legend>scroll-behavior</legend>
				<div>
					<label>
						<input
							type="radio"
							name="scrollBehavior"
							value="auto"
							checked={scrollBehavior === 'auto'}
							onChange={() => setScrollBehavior('auto')}
						/>
						auto
					</label>
					<label>
						<input
							type="radio"
							name="scrollBehavior"
							value="smooth"
							checked={scrollBehavior === 'smooth'}
							onChange={() => setScrollBehavior('smooth')}
						/>
						smooth
					</label>
				</div>
			</fieldset>

			<div className="Buttons">
				<button onClick={shiftSection}>Shift</button>
				<button onClick={pushSection}>Push</button>
			</div>
		</div>
	)
}
