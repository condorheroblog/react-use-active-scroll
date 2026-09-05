import { useCallback, useEffect, useMemo, useState } from 'react'
import type { MenuItem, Section } from '../types'

function getInt(min: number, max: number) {
	return Math.floor(Math.random() * (max - min + 1) + min)
}

export function useFakeData(length = 10) {
	const start = parseInt(sessionStorage.getItem('firstNumber') || '0')
	const end = parseInt(sessionStorage.getItem('lastNumber') || '0')
	const parsedLength = end - start + 1

	const isMobile = window.matchMedia('(max-width: 610px)').matches
	const minText = isMobile ? 50 : 80
	const maxText = isMobile ? 100 : 320

	const [sections, setSections] = useState<Section[]>(() =>
		Array.from({ length: parsedLength <= 1 ? length : parsedLength }, (_, index) => ({
			id: `title_${start + index}`,
			title: `${start + index} `.repeat(6).toUpperCase(),
			text: 'Text '.repeat(getInt(minText, maxText)),
		})),
	)

	const firstNum = useMemo(() => parseInt(sections[0]?.title ?? '-1'), [sections])
	const lastNum = useMemo(
		() => parseInt(sections[sections.length - 1]?.title ?? '-1'),
		[sections],
	)

	useEffect(() => {
		sessionStorage.setItem('firstNumber', `${firstNum}`)
		sessionStorage.setItem('lastNumber', `${lastNum}`)
	}, [firstNum, lastNum])

	const menuItems: MenuItem[] = useMemo(
		() => sections.map(item => ({ label: item.title, href: item.id })),
		[sections],
	)

	const shiftSection = useCallback(() => setSections(prev => prev.slice(1)), [])

	const pushSection = useCallback(() => {
		setSections((prev) => {
			const lastTitle = parseInt(prev[prev.length - 1]?.title ?? '-1')
			return [
				...prev,
				{
					id: `title_${lastTitle + 1}`,
					title: `${lastTitle + 1} `.repeat(6).toUpperCase(),
					text: 'Text '.repeat(getInt(50, 100)),
				},
			]
		})
	}, [])

	return { sections, menuItems, pushSection, shiftSection }
}
