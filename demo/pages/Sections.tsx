import { useMemo } from 'react'
import { PageLayout } from '../components/PageLayout'
import { useFakeData } from '../hooks/useFakeData'
import { DemoButtonsContext, TOCDataContext } from './PageShell'

export function Sections() {
	const { sections, menuItems, pushSection, shiftSection } = useFakeData()
	const targets = useMemo(() => sections.map(s => s.id), [sections])

	return (
		<TOCDataContext.Provider value={{ menuItems, targets, overlayHeight: 60 }}>
			<DemoButtonsContext.Provider value={{ pushSection, shiftSection }}>
				<PageLayout>
					<main className="SectionsMain">
						{sections.map(section => (
							<section key={section.id} id={section.id}>
								{section.title}
							</section>
						))}
					</main>
				</PageLayout>
			</DemoButtonsContext.Provider>
		</TOCDataContext.Provider>
	)
}
