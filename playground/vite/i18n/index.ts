import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'
import en from './en'
import zh from './zh'

/**
 * @zh 语言列表与 localStorage 持久化键名。
 * @en Language list and the localStorage persistence key.
 */
export const LANGUAGES = ['en', 'zh'] as const
export type Language = (typeof LANGUAGES)[number]

export const STORAGE_KEY = 'react-use-active-scroll-lang'

/**
 * @zh i18next 初始化。
 * - 默认显示英语：未检测到已保存语言时回退到 fallbackLng 'en'。
 * - 仅检测 localStorage（不依赖浏览器 navigator），保证首次访问恒为英文。
 * - 用户切换后写入 localStorage，下次访问沿用。
 * @en i18next initialization.
 * - Defaults to English: falls back to fallbackLng 'en' when no saved language is detected.
 * - Detects only localStorage (not navigator) so the first visit is always English.
 * - Persists the user's choice to localStorage for subsequent visits.
 */
void i18n
	.use(LanguageDetector)
	.use(initReactI18next)
	.init({
		resources: {
			en: { translation: en },
			zh: { translation: zh },
		},
		fallbackLng: 'en',
		supportedLngs: [...LANGUAGES],
		detection: {
			order: ['localStorage'],
			lookupLocalStorage: STORAGE_KEY,
			caches: ['localStorage'],
		},
		interpolation: {
			escapeValue: false,
		},
	})

export default i18n
