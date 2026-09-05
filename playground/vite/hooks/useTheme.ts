import { useCallback, useEffect, useState } from 'react'

/**
 * 主题类型：跟随系统、明亮、暗黑。
 */
type Theme = "system" | "light" | "dark"

const STORAGE_KEY = "react-use-active-scroll-theme"

/**
 * 解析最终应应用到 <html> 的类名。
 * system 模式根据 prefers-color-scheme 决定。
 */
function resolveClass(theme: Theme): "light" | "dark" {
	if (theme === "system") {
		if (typeof window === "undefined") return "light"
		return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
	}
	return theme
}

/**
 * 提供主题状态与切换方法。
 * 主题类名会同步到 <html>，并持久化到 localStorage。
 */
export function useTheme(): { theme: Theme; setTheme: (theme: Theme) => void; toggleTheme: () => void } {
	const [theme, setThemeState] = useState<Theme>(() => {
		if (typeof window === "undefined") return "system"
		return (localStorage.getItem(STORAGE_KEY) as Theme) || "system"
	})

	const apply = useCallback((next: Theme) => {
		const html = document.documentElement
		html.classList.remove("light", "dark")
		html.classList.add(resolveClass(next))
	}, [])

	useEffect(() => {
		apply(theme)
	}, [apply, theme])

	// 监听系统主题变化，system 模式下自动切换
	useEffect(() => {
		if (theme !== "system") return
		const media = window.matchMedia("(prefers-color-scheme: dark)")
		const handler = () => apply("system")
		media.addEventListener("change", handler)
		return () => media.removeEventListener("change", handler)
	}, [apply, theme])

	const setTheme = useCallback((next: Theme) => {
		localStorage.setItem(STORAGE_KEY, next)
		setThemeState(next)
	}, [])

	const toggleTheme = useCallback(() => {
		const current = resolveClass(theme)
		setTheme(current === "dark" ? "light" : "dark")
	}, [setTheme, theme])

	return { theme, setTheme, toggleTheme }
}
