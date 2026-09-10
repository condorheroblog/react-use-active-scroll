import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQueryStates, parseAsBoolean, parseAsInteger, parseAsString, parseAsStringLiteral } from 'nuqs'
import { DemoProvider, useDemo } from '../components/DemoContext'
import { PageLayout } from '../components/PageLayout'
import { useFakeData } from '../hooks/useFakeData'
import type { DemoConfig, Section, UpdateConfig } from '../types'

/** @zh 应用顶部固定导航栏高度（见 Header 注释），窗口纵向滚动时自动计入 overlay @en Height of the fixed app header (see Header notes), automatically included in overlay for vertical window scrolling */
const HEADER_HEIGHT = 59

/**
 * @zh nuqs URL 查询参数解析器：每个配置项对应一个 URL 参数，带默认值。
 * 刷新页面或分享 URL 后配置依然保留。
 * @en nuqs URL query-param parsers: each config field maps to a URL parameter with a default.
 * The configuration persists across refreshes and is shareable via URL.
 */
const configParsers = {
	direction: parseAsStringLiteral(['vertical', 'horizontal'] as const).withDefault('vertical'),
	rootMode: parseAsStringLiteral(['window', 'container'] as const).withDefault('window'),
	overlayEnabled: parseAsBoolean.withDefault(false),
	overlaySize: parseAsInteger.withDefault(120),
	edgesFirstMode: parseAsStringLiteral(['force', 'number'] as const).withDefault('force'),
	edgesFirstValue: parseAsInteger.withDefault(200),
	edgesLastMode: parseAsStringLiteral(['force', 'number'] as const).withDefault('force'),
	edgesLastValue: parseAsInteger.withDefault(300),
	offsetToStart: parseAsInteger.withDefault(0),
	offsetToEnd: parseAsInteger.withDefault(0),
	mediaQueryEnabled: parseAsBoolean.withDefault(false),
	mediaQuery: parseAsString.withDefault('(min-width: 768px)'),
	hash: parseAsStringLiteral(['off', 'replace', 'push'] as const).withDefault('off'),
	clickType: parseAsStringLiteral(['native', 'custom'] as const).withDefault('native'),
	scrollBehavior: parseAsStringLiteral(['smooth', 'auto'] as const).withDefault('smooth'),
}

/**
 * @zh 统一演示页（全应用唯一示例）。
 * 左侧/内容区是可滚动的 section 集合，右侧是目录高亮与配置面板；
 * direction / root / overlay / edges / offset / mediaQuery / hash 全部配置项
 * 都收进配置面板按分组动态演示，切换即时生效，非默认配置附带用法说明与实时调用代码。
 * @en The unified demo page (the single example in the whole app).
 * The content area is a scrollable set of sections; the right side holds the TOC
 * highlight and the config panel. Every option — direction / root / overlay /
 * edges / offset / mediaQuery / hash — is grouped in the config panel for live
 * experimentation; changes apply instantly, non-default options show usage notes
 * and the live call code.
 */
export function Playground() {
	const { sections, menuItems, pushSection, shiftSection } = useFakeData()
	const targets = useMemo(() => sections.map(s => s.id), [sections])

	// @zh 配置状态由 nuqs 管理，URL 可分享、刷新后保留
	// @en Config state managed by nuqs; URL is shareable and persists on refresh
	const [config, setConfig] = useQueryStates(configParsers)

	// @zh 容器滚动模式下挂载的滚动容器元素；窗口模式为 null（由 ref 卸载自动置空）。
	// @en The scroll container element mounted in container mode; null in window mode (auto-nulled on ref unmount).
	const [rootEl, setRootEl] = useState<HTMLDivElement | null>(null)

	const update = useCallback<UpdateConfig>(
		(key, value) => setConfig({ [key]: value } as Partial<DemoConfig>),
		[setConfig],
	)

	const horizontal = config.direction === 'horizontal'
	const windowMode = config.rootMode === 'window'
	const demoOverlay = config.overlayEnabled ? config.overlaySize : 0
	// @zh 窗口纵向滚动时，应用顶部 59px 固定导航栏本身就是遮挡物，自动计入。
	// @en In vertical window mode the app's 59px fixed header is itself an overlay, counted automatically.
	const effectiveOverlay = windowMode && !horizontal ? HEADER_HEIGHT + demoOverlay : demoOverlay
	// @zh 窗口横向滚动时侧边栏需 fixed 常驻（sticky 无法水平固定）。
	// @en In horizontal window mode the sidebar must be fixed (sticky cannot pin horizontally).
	const fixedSidebar = horizontal && windowMode
	// @zh edges 为数字模式时才显示尾部留白观察区（只有此时才有"无激活"/延迟取消高亮可观察）。
	// @en Show the trailing observation area only when edges are in number mode
	// (only then is there "no active" / late deactivation to observe).
	const edgesAreNumbers = config.edgesFirstMode === 'number' || config.edgesLastMode === 'number'

	return (
		<DemoProvider
			config={config}
			rootEl={rootEl}
			targets={targets}
			menuItems={menuItems}
			effectiveOverlay={effectiveOverlay}
			pushSection={pushSection}
			shiftSection={shiftSection}
		>
			<PageLayout update={update} fixedSidebar={fixedSidebar}>
				<DemoContent
					sections={sections}
					horizontal={horizontal}
					windowMode={windowMode}
					demoOverlay={demoOverlay}
					effectiveOverlay={effectiveOverlay}
					edgesAreNumbers={edgesAreNumbers}
					setRootEl={setRootEl}
				/>
			</PageLayout>
		</DemoProvider>
	)
}

/**
 * @zh 演示内容区：按 direction × rootMode 渲染四种滚动形态，并挂载可选固定遮挡物。
 * @en Demo content area: renders the four scroll forms by direction × rootMode,
 * mounting the optional fixed overlay.
 */
function DemoContent({
	sections,
	horizontal,
	windowMode,
	demoOverlay,
	effectiveOverlay,
	edgesAreNumbers,
	setRootEl,
}: {
	sections: Section[]
	horizontal: boolean
	windowMode: boolean
	demoOverlay: number
	effectiveOverlay: number
	edgesAreNumbers: boolean
	setRootEl: (el: HTMLDivElement | null) => void
}) {
	const { t } = useTranslation()
	// @zh 容器模式下核心触发线覆盖层挂在相对定位的容器包裹层内 @en In container mode the core trigger-line overlay is mounted inside the relatively-positioned container wrapper
	const { devtools } = useDemo()

	const intro = (
		<div className="mb-6">
			<p className="text-sm leading-relaxed text-muted">{t('panel.intro')}</p>
		</div>
	)

	// @zh ===== 纵向 × 窗口：文档正常流，窗口滚动 =====
	// @en ===== Vertical × window: normal document flow, window scrolling =====
	if (!horizontal && windowMode) {
		return (
			<>
				{demoOverlay > 0 && (
					<div
						className="fixed inset-x-0 z-40 flex items-center border-b border-border bg-card/95 px-6 text-sm font-medium text-fg backdrop-blur"
						style={{ top: HEADER_HEIGHT, height: demoOverlay }}
					>
						{t('common.fixedOverlay', { px: demoOverlay })}
					</div>
				)}

				<div className="mx-auto max-w-2xl" style={{ paddingTop: demoOverlay + 8 }}>
					{intro}
					<ValuesPanel />
					<div className="space-y-16">
						{sections.map(section => (
							<section key={section.id}>
								<h2
									id={section.id}
									className="mb-4 text-2xl font-semibold text-fg"
									style={{ scrollMarginTop: effectiveOverlay + 16 }}
								>
									{section.title}
								</h2>
								<p className="leading-relaxed text-muted">{section.text}</p>
							</section>
						))}
					</div>
					{edgesAreNumbers && <ObservationArea className="mt-16 h-[120vh]" />}
				</div>
			</>
		)
	}

	// @zh ===== 纵向 × 容器：固定高度容器内部滚动 =====
	// @en ===== Vertical × container: scrolling inside a fixed-height container =====
	if (!horizontal && !windowMode) {
		return (
			<div className="mx-auto max-w-2xl">
				{intro}
				<ValuesPanel />
				<div className="relative">
					{demoOverlay > 0 && (
						<div
							className="absolute inset-x-0 top-0 z-30 flex items-center justify-center rounded-t-md border-b border-border bg-card/95 px-4 text-center text-xs font-medium text-fg backdrop-blur"
							style={{ height: demoOverlay }}
						>
							{t('common.fixedOverlay', { px: demoOverlay })}
						</div>
					)}
					<div
						ref={setRootEl}
						className="scroll-behavior-dynamic h-[70vh] max-h-[600px] overflow-auto rounded-md border border-border p-6"
						style={demoOverlay > 0 ? { paddingTop: demoOverlay + 24 } : undefined}
					>
						<div className="space-y-16">
							{sections.map(section => (
								<section key={section.id}>
									<h2
										id={section.id}
										className="mb-4 text-2xl font-semibold text-fg"
										style={{ scrollMarginTop: demoOverlay + 16 }}
									>
										{section.title}
									</h2>
									<p className="leading-relaxed text-muted">{section.text}</p>
								</section>
							))}
						</div>
						{edgesAreNumbers && <ObservationArea className="mt-16 h-[120vh]" />}
				</div>
				{devtools}
			</div>
		</div>
	)
}

	// @zh ===== 横向 × 窗口：section 水平排布撑开文档宽度，窗口横向滚动 =====
	// @en ===== Horizontal × window: sections laid out horizontally stretch the document, window scrolls horizontally =====
	if (horizontal && windowMode) {
		return (
			<>
				{demoOverlay > 0 && (
					<div
						className="fixed bottom-0 left-0 z-40 flex items-center justify-center border-r border-border bg-card/95 px-2 text-center text-[11px] font-medium leading-relaxed text-fg backdrop-blur"
						style={{ top: HEADER_HEIGHT, width: demoOverlay }}
					>
						{t('common.fixedOverlay', { px: demoOverlay })}
					</div>
				)}

				<div className="max-w-2xl">
					{intro}
					<ValuesPanel />
				</div>

				<div
					className="flex w-max gap-6 pb-10"
					style={demoOverlay > 0 ? { paddingLeft: demoOverlay + 24 } : undefined}
				>
					{sections.map(section => (
						<section
							key={section.id}
							id={section.id}
							className="w-[min(80vw,520px)] flex-none"
							style={{ scrollMarginLeft: demoOverlay + 24 }}
						>
							<h2 className="mb-4 text-2xl font-semibold text-fg">{section.title}</h2>
							<p className="leading-relaxed text-muted">{section.text}</p>
						</section>
					))}
					{edgesAreNumbers && <ObservationArea className="h-[320px] w-[70vw] max-w-[560px] flex-none pt-10" />}
				</div>
			</>
		)
	}

	// @zh ===== 横向 × 容器：固定高度容器内部横向滚动 =====
	// @en ===== Horizontal × container: horizontal scrolling inside a fixed-height container =====
	return (
		<div className="mx-auto max-w-4xl">
			{intro}
			<ValuesPanel />
			<div className="relative">
				{demoOverlay > 0 && (
					<div
						className="absolute bottom-0 left-0 top-0 z-30 flex items-center justify-center rounded-l-md border-r border-border bg-card/95 px-4 text-center text-xs font-medium text-fg backdrop-blur"
						style={{ width: demoOverlay }}
					>
						{t('common.fixedOverlay', { px: demoOverlay })}
					</div>
				)}
				<div
					ref={setRootEl}
					className="scroll-behavior-dynamic flex h-[60vh] max-h-[560px] gap-6 overflow-x-auto rounded-md border border-border p-6"
					style={demoOverlay > 0 ? { paddingLeft: demoOverlay + 16 } : undefined}
				>
					{sections.map(section => (
						<section
							key={section.id}
							id={section.id}
							className="flex h-full w-[min(60vw,520px)] flex-none flex-col"
							style={{ scrollMarginLeft: demoOverlay }}
						>
							<h2 className="mb-4 text-2xl font-semibold text-fg">{section.title}</h2>
							<div className="min-h-0 flex-1 overflow-y-auto pr-1">
								<p className="leading-relaxed text-muted">{section.text}</p>
							</div>
						</section>
					))}
					{edgesAreNumbers && <ObservationArea className="h-full w-[70vw] max-w-[560px] flex-none pt-10" />}
				</div>
				{devtools}
			</div>
		</div>
	)
}

/**
 * @zh 返回值面板：实时展示 activeId / activeIndex / activeEl / isActive，
 * 并提供 setActive 快捷跳转按钮演示命令式 API。
 * @en Return-value panel: shows activeId / activeIndex / activeEl / isActive live,
 * with setActive quick-jump buttons demonstrating the imperative API.
 */
function ValuesPanel() {
	const { t } = useTranslation()
	const { activeId, activeIndex, activeEl, isActive, setActive, targets } = useDemo()
	const firstId = targets[0] ?? ''

	return (
		<div className="mb-8 rounded-md border border-border bg-card p-4 text-sm">
			<div className="mb-2 font-medium text-fg">{t('panel.values.title')}</div>
			<div className="grid grid-cols-2 gap-2 text-muted sm:grid-cols-4">
				<div>
					<span className="block text-xs">activeId</span>
					<span className="font-mono text-fg">{activeId || '-'}</span>
				</div>
				<div>
					<span className="block text-xs">activeIndex</span>
					<span className="font-mono text-fg">{activeIndex}</span>
				</div>
				<div>
					<span className="block text-xs">activeEl.tagName</span>
					<span className="font-mono text-fg">{activeEl?.tagName || '-'}</span>
				</div>
				<div>
					<span className="block text-xs">isActive(first)</span>
					<span className="font-mono text-fg">{firstId && isActive(firstId) ? 'true' : 'false'}</span>
				</div>
			</div>
			<div className="mt-3 flex flex-wrap gap-2">
				{targets.slice(0, 3).map(id => (
					<button
						key={id}
						type="button"
						onClick={() => setActive(id)}
						className="rounded-sm border border-border bg-bg px-3 py-1 text-xs text-fg transition-colors hover:border-accent hover:text-accent"
					>
						setActive('{id}')
					</button>
				))}
			</div>
		</div>
	)
}

/**
 * @zh 尾部留白观察区。
 * edges.first / last 传数字时需要额外的滚动空间才能观察到"无激活"与延迟取消高亮，
 * 其余模式下作为普通留白无害存在。
 * @en Trailing whitespace observation area.
 * When edges.first / last are numbers, extra scroll space is needed to observe
 * "no active" and late deactivation; in other modes it is harmless whitespace.
 */
function ObservationArea({ className }: { className: string }) {
	const { t } = useTranslation()
	return (
		<div className={`flex items-start justify-center rounded-md border border-dashed border-border ${className}`}>
			<p className="max-w-sm px-4 text-center text-xs leading-relaxed text-muted">
				{t('panel.observation')}
			</p>
		</div>
	)
}
