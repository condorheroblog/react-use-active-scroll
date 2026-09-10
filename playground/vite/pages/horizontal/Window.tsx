import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { PageShell } from '../PageShell'
import { useFakeData } from '../../hooks/useFakeData'

/**
 * @zh 横向 Window 页面。
 * 演示针对浏览器窗口的横向滚动：section 沿水平方向排布并撑开文档宽度，
 * 窗口出现横向滚动条（底部滚动条 / shift + 滚轮 / 触控板横扫），
 * 目录随窗口横向滚动位置依次高亮。
 * @en Horizontal Window page.
 * Demonstrates horizontal scrolling against the browser window: sections are laid out horizontally and stretch the document width,
 * the window shows a horizontal scrollbar (bottom scrollbar / shift + wheel / trackpad swipe),
 * and the TOC highlights in sequence as the window scrolls horizontally.
 */
export function Window() {
	const { sections, menuItems, pushSection, shiftSection } = useFakeData()
	const targets = useMemo(() => sections.map(s => s.id), [sections])
	const { t } = useTranslation()

	return (
		<PageShell
			tocData={{
				menuItems,
				targets,
				direction: 'horizontal',
				hash: 'replace',
				offset: { toStart: 200 },
			}}
			demoButtons={{ pushSection, shiftSection }}
		>
			{/* @zh 说明块限制宽度，避免随横向内容一起被拉宽 @en The description block is width-limited so it is not stretched along with the horizontal content */}
			<div className="max-w-2xl">
				<p className="mb-4 text-sm leading-relaxed text-muted">
					{t('windowH.desc')}
				</p>
			</div>

			{/* @zh 横向内容行：w-max 撑开文档宽度，使窗口可横向滚动 @en Horizontal content row: w-max stretches the document width so the window can scroll horizontally */}
			<div className="flex w-max gap-6 pb-10">
				{sections.map(section => (
					<section
						key={section.id}
						id={section.id}
						className="w-[min(80vw,520px)] flex-none"
					>
						<h2 className="mb-4 text-2xl font-semibold text-fg">{section.title}</h2>
						<p className="leading-relaxed text-muted">{section.text}</p>
					</section>
				))}
			</div>
		</PageShell>
	)
}
