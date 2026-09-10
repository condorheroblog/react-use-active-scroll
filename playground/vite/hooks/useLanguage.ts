import { useCallback, useEffect, useState } from 'react'
import i18n, { type Language, STORAGE_KEY } from '../i18n'

/**
 * @zh 语言状态与切换方法。
 * 与 i18next-browser-languagedetector 共用 localStorage 键，
 * 切换时调用 i18n.changeLanguage 由 detector 持久化，并同步 <html lang>。
 * 默认语言为 en（未持久化时由 i18n fallbackLng 决定）。
 * @en Language state and toggle method.
 * Shares the localStorage key with i18next-browser-languagedetector:
 * toggling calls i18n.changeLanguage so the detector persists it, and syncs <html lang>.
 * Default language is en (when nothing is persisted, i18n's fallbackLng applies).
 */
export function useLanguage(): {
	language: Language
	setLanguage: (next: Language) => void
	toggleLanguage: () => void
} {
	const [language, setLanguageState] = useState<Language>(() => {
		if (typeof window === 'undefined') return 'en'
		const stored = localStorage.getItem(STORAGE_KEY) as Language | null
		return stored === 'zh' || stored === 'en' ? stored : 'en'
	})

	// @zh 挂载时与 i18n 当前语言对齐，避免 SSR / 检测器异步期间的偏差
	// @en Align with i18n's current language on mount to cover SSR / async detector gaps
	useEffect(() => {
		if (i18n.language && (i18n.language === 'en' || i18n.language === 'zh') && i18n.language !== language) {
			setLanguageState(i18n.language)
		}
	}, [language])

	// @zh 同步 <html lang> 属性
	// @en Sync the <html lang> attribute
	useEffect(() => {
		document.documentElement.lang = language
	}, [language])

	const setLanguage = useCallback((next: Language) => {
		setLanguageState(next)
		void i18n.changeLanguage(next) // @zh detector 会自动写入 localStorage @en the detector caches to localStorage automatically
	}, [])

	const toggleLanguage = useCallback(() => {
		setLanguage(language === 'en' ? 'zh' : 'en')
	}, [language, setLanguage])

	return { language, setLanguage, toggleLanguage }
}
