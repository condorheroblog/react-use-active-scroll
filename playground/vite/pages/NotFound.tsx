import { Link } from 'react-router'
import { useTranslation } from 'react-i18next'

/**
 * @zh 404 页面。
 * 当用户访问不存在的路由时展示，提供返回首页的入口，
 * 替代 React Router 默认的错误占位界面。
 * @en 404 page.
 * Displayed when the user visits a non-existent route, providing an entry back
 * to the home page, replacing React Router's default error placeholder.
 */
export function NotFound() {
	const { t } = useTranslation()

	return (
		<div className="mx-auto flex min-h-[calc(100vh-59px)] max-w-2xl flex-col items-center justify-center px-4 text-center">
			{/* @zh 404 大字 @en 404 large text */}
			<div className="text-7xl font-bold text-accent">404</div>

			{/* @zh 描述文案 @en Description text */}
			<p className="mt-4 text-lg font-medium text-fg">{t('notFound.title')}</p>
			<p className="mt-2 text-sm text-muted">{t('notFound.desc')}</p>

			{/* @zh 返回首页按钮 @en Back-to-home button */}
			<Link
				to="/"
				className="mt-8 inline-flex items-center rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
			>
				{t('notFound.back')}
			</Link>
		</div>
	)
}
