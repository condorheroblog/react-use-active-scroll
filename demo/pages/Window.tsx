import { useMemo } from 'react'
import { PageLayout } from '../components/PageLayout'
import { useFakeData } from '../hooks/useFakeData'
import { DemoButtonsContext, TOCDataContext } from './PageShell'

export function Window() {
	const { sections, menuItems, pushSection, shiftSection } = useFakeData()
	const targets = useMemo(() => sections.map(s => s.id), [sections])

	return (
		<TOCDataContext.Provider value={{ menuItems, targets }}>
			<DemoButtonsContext.Provider value={{ pushSection, shiftSection }}>
				<PageLayout>
					<main className="WindowMain">
						{sections.map(section => (
							<section key={section.id}>
								<h2 id={section.id}>{section.title}</h2>
								<p>{section.text}</p>
							</section>
						))}
					</main>
				</PageLayout>
			</DemoButtonsContext.Provider>
		</TOCDataContext.Provider>
	)
}
