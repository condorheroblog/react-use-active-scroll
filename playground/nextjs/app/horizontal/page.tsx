"use client";

import type { CSSProperties } from "react";
import type { UseActiveScrollOptions } from "react-use-active-scroll";
import type { DemoConfig } from "./config";
import Link from "next/link";
import { useCallback, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { useActiveScroll } from "react-use-active-scroll";
import { DEFAULT_CONFIG } from "./config";
import { ConfigPanel } from "./ConfigPanel";
import styles from "./horizontal-demo.module.css";

interface DemoSection {
	id: string
	index: number
	title: string
	en: string
	width: number
	hue: number
	body: string
}

const MAX_SECTIONS = 16;

const TITLES: Array<[string, string]> = [
	["序章 · 起点", "Genesis"],
	["概览面板", "Overview"],
	["数据洞察", "Insights"],
	["横向画廊", "Gallery"],
	["时间轴", "Timeline"],
	["组件矩阵", "Matrix"],
	["性能火焰", "Flame"],
	["设计令牌", "Tokens"],
	["交互模型", "Interaction"],
	["动效曲线", "Motion"],
	["无障碍", "A11y"],
	["网络层", "Network"],
	["缓存策略", "Cache"],
	["流式渲染", "Streaming"],
	["服务边界", "Boundary"],
	["终章 · 尾点", "Finale"],
];

const WIDTHS = [340, 420, 300, 380, 460, 340, 400, 320, 380, 300, 440, 360, 400, 320, 380, 360];
const HUES = [187, 215, 265, 330, 20, 150, 10, 250, 190, 300, 100, 230, 350, 170, 45, 285];
const BODY = "横向滚动容器中，引擎根据触发线与边界偏移实时计算激活目标，本卡片仅用于撑开不同的内容宽度。";

const ALL_SECTIONS: DemoSection[] = TITLES.slice(0, MAX_SECTIONS).map(([title, en], index) => ({
	id: `h-panel-${index + 1}`,
	index: index + 1,
	title,
	en,
	width: WIDTHS[index],
	hue: HUES[index],
	body: BODY,
}));

interface ScrollInfo {
	left: number
	max: number
}

/**
 * @zh 横向滚动高亮演示页。
 * direction 固定为 "horizontal"，滚动容器内放置不同宽度的卡片；
 * 右侧配置面板可实时调整 overlay / offset / edges / hash / debug / mediaQuery，
 * 所有变更通过引擎 setOptions 热生效。debug 覆盖层作为滚动容器的兄弟节点
 * 渲染在 position: relative 的包裹层中。
 * @en Horizontal scroll-spy demo page.
 * direction is pinned to "horizontal"; cards of varying widths live inside a
 * horizontal scroll container. The config panel on the right tunes overlay /
 * offset / edges / hash / debug / mediaQuery live via the engine's setOptions.
 * The debug overlay is rendered as a sibling of the scroll container inside a
 * position: relative wrapper.
 */
export default function HorizontalPage() {
	const [config, setConfig] = useState<DemoConfig>(DEFAULT_CONFIG);
	const [scrollInfo, setScrollInfo] = useState<ScrollInfo>({ left: 0, max: 0 });
	const containerRef = useRef<HTMLDivElement>(null);

	// @zh 以外部 store 方式订阅媒体查询门控的匹配状态（SSR 快照恒为 true）。
	// @en Subscribes to the media-query gate state as an external store (SSR snapshot is always true).
	const mediaMatches = useSyncExternalStore(
		(onChange) => {
			if (!config.mediaEnabled)
				return () => {};
			const query = config.mediaQuery.trim();
			if (!query || typeof window === "undefined")
				return () => {};
			let mql: MediaQueryList | null = null;
			try {
				mql = window.matchMedia(query);
			}
			catch {
				return () => {};
			}
			mql.addEventListener("change", onChange);
			return () => mql?.removeEventListener("change", onChange);
		},
		() => {
			if (!config.mediaEnabled)
				return true;
			const query = config.mediaQuery.trim();
			if (!query)
				return true;
			try {
				return window.matchMedia(query).matches;
			}
			catch {
				return false;
			}
		},
		() => true,
	);

	const sections = useMemo(() => ALL_SECTIONS.slice(0, config.sectionCount), [config.sectionCount]);
	const targetIds = useMemo(() => sections.map(s => s.id), [sections]);

	const patchConfig = useCallback((patch: Partial<DemoConfig>) => {
		setConfig(prev => ({ ...prev, ...patch }));
	}, []);

	const resetConfig = useCallback(() => setConfig(DEFAULT_CONFIG), []);

	// @zh 把演示配置映射为库选项；引用每次渲染都变化无妨，引擎内部按字段去重。
	// @en Maps demo config to library options; a fresh reference each render is fine — the engine diffs fields internally.
	const options = useMemo<UseActiveScrollOptions>(() => ({
		direction: "horizontal",
		root: containerRef,
		overlay: config.overlay,
		offset: { toStart: config.offsetToStart, toEnd: config.offsetToEnd },
		edges: {
			first: config.firstMode === "force" ? true : config.firstDistance,
			last: config.lastMode === "force" ? true : config.lastDistance,
		},
		hash: config.hash,
		debug: config.debug ? { label: config.debugLabel } : false,
		mediaQuery: config.mediaEnabled ? config.mediaQuery.trim() : undefined,
	}), [config]);

	const { activeId, activeIndex, isActive, setActive, devtools } = useActiveScroll(targetIds, options);

	const scrollToSection = useCallback((id: string) => {
		setActive(id);
		document.getElementById(id)?.scrollIntoView({
			behavior: config.smoothScroll ? "smooth" : "auto",
			inline: "start",
			block: "nearest",
		});
	}, [setActive, config.smoothScroll]);

	const handleScroll = useCallback(() => {
		const el = containerRef.current;
		if (!el)
			return;
		setScrollInfo({
			left: Math.round(el.scrollLeft),
			max: Math.max(0, Math.round(el.scrollWidth - el.clientWidth)),
		});
	}, []);

	const trackingPaused = config.mediaEnabled && !mediaMatches;

	return (
		<main className={styles.page}>
			<header className={styles.header}>
				<div>
					<h1 className={styles.title}>
						横向滚动高亮示例
						<code className={styles.titleBadge}>direction: &quot;horizontal&quot;</code>
					</h1>
					<p className={styles.subtitle}>
						横向滚动容器内的卡片会随 scrollLeft 自动高亮，顶部导航与触发线覆盖层实时联动。
					</p>
				</div>
				<nav className={styles.headerNav}>
					<Link href="/" className={styles.headerLink}>
						← 纵向滚动示例
					</Link>
				</nav>
			</header>

			<div className={styles.layout}>
				<section className={styles.stage} aria-label="横向滚动演示区">
					<nav className={styles.pills} aria-label="卡片导航">
						{sections.map((section) => {
							const active = isActive(section.id);
							return (
								<button
									key={section.id}
									type="button"
									className={active ? styles.pillOn : styles.pill}
									style={active ? { "--pill-hue": `${section.hue}` } as CSSProperties : undefined}
									onClick={() => scrollToSection(section.id)}
								>
									<span className={styles.pillIndex}>{String(section.index).padStart(2, "0")}</span>
									{section.title}
								</button>
							);
						})}
					</nav>

					<div className={styles.stageInner}>
						<div
							ref={containerRef}
							className={styles.scroller}
							style={{ scrollBehavior: config.smoothScroll ? "smooth" : "auto" }}
							onScroll={handleScroll}
						>
							{sections.map((section) => {
								const active = isActive(section.id);
								return (
									<article
										key={section.id}
										id={section.id}
										className={active ? styles.cardOn : styles.card}
										style={{
											"flexBasis": section.width,
											"scrollMarginLeft": config.overlay,
											"--card-hue": `${section.hue}`,
										} as CSSProperties}
									>
										<div className={styles.cardKicker}>{section.id}</div>
										<strong className={styles.cardTitle}>{section.title}</strong>
										<span className={styles.cardEn}>{section.en}</span>
										<p className={styles.cardBody}>{section.body}</p>
										<div className={styles.cardFoot}>
											<span>{`flex: 0 0 ${section.width}px`}</span>
											<span className={active ? styles.cardStateOn : styles.cardState}>
												{active ? "ACTIVE" : "idle"}
											</span>
										</div>
										<span className={styles.cardWatermark} aria-hidden="true">
											{String(section.index).padStart(2, "0")}
										</span>
									</article>
								);
							})}
						</div>

						{config.overlay > 0
							? (
								<div className={styles.overlayShim} style={{ width: config.overlay }} aria-hidden="true">
									<span className={styles.overlayShimText}>{`fixed overlay · ${config.overlay}px`}</span>
								</div>
							)
							: null}

						{devtools}
					</div>

					<div className={styles.statusbar}>
						<span className={styles.chip}>
							<span className={styles.chipLabel}>active</span>
							<code>{activeIndex === -1 ? "—" : `${activeIndex + 1} / ${sections.length}`}</code>
						</span>
						<span className={styles.chip}>
							<span className={styles.chipLabel}>activeId</span>
							<code>{activeId || "（无）"}</code>
						</span>
						<span className={styles.chip}>
							<span className={styles.chipLabel}>scrollLeft</span>
							<code>
								{scrollInfo.left}
								{" "}
								/
								{" "}
								{scrollInfo.max}
								{" "}
								px
							</code>
						</span>
						<span className={`${styles.chip} ${trackingPaused ? styles.chipWarn : ""}`}>
							<span className={styles.chipLabel}>listener</span>
							<code>{trackingPaused ? "paused" : "running"}</code>
						</span>
					</div>
				</section>

				<aside className={styles.panelWrap}>
					<ConfigPanel config={config} onChange={patchConfig} onReset={resetConfig} />
				</aside>
			</div>
		</main>
	);
}
