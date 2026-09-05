import { useMemo, useRef } from 'react'
import { PageLayout } from '../components/PageLayout'
import { useFakeData } from '../hooks/useFakeData'
import { DemoButtonsContext, TOCDataContext } from './PageShell'

export function Container() {
	const { sections, menuItems, pushSection, shiftSection } = useFakeData()
	const containerRef = useRef<HTMLDivElement>(null)
	const targets = useMemo(() => sections.map(s => s.id), [sections])

	return (
		<TOCDataContext.Provider value={{ menuItems, targets, containerRef }}>
			<DemoButtonsContext.Provider value={{ pushSection, shiftSection }}>
				<PageLayout>
					<div ref={containerRef} className="Container">
						<div className="ScanLine StickyScanLine" style={{ top: '10px' }}>
							<span>trigger line</span>
						</div>
						{sections.map(section => (
							<section key={section.id}>
								<h2 id={section.id}>{section.title}</h2>
								<p>{section.text}</p>
							</section>
						))}
					</div>
				</PageLayout>
			</DemoButtonsContext.Provider>
		</TOCDataContext.Provider>
	)
}
