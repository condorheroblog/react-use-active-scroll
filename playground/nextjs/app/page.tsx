"use client";

import Link from "next/link";
import { useMemo, useRef } from "react";
// @zh 通过 tsconfig paths 映射到本地源码。
// @en Mapped to local source via tsconfig paths.
import { useActiveScroll } from "react-use-active-scroll";
import styles from "./vertical-demo.module.css";

const sections = Array.from({ length: 8 }, (_, index) => ({
	id: `section-${index + 1}`,
	title: `Section ${index + 1}`,
	body: "纵向滚动容器中，引擎根据触发线位置实时计算当前激活的区块。侧边目录、顶部状态标签与区块高亮均由同一份 activeId 驱动，滚动即同步。",
}));

/**
 * @zh Next.js App Router 客户端页面示例。
 * 展示如何在带滚动容器的布局中使用 useActiveScroll 驱动目录高亮与 hash 同步。
 * @en Next.js App Router client page example.
 * Shows how to use useActiveScroll in a layout with a scroll container to drive
 * TOC highlighting and hash sync.
 */
export default function HomePage() {
	const containerRef = useRef<HTMLDivElement>(null);
	const targetIds = useMemo(() => sections.map(s => s.id), []);

	const { activeId, activeIndex, isActive } = useActiveScroll(targetIds, {
		root: containerRef,
		hash: "replace",
	});

	return (
		<main className={styles.page}>
			<header className={styles.header}>
				<div>
					<h1 className={styles.title}>
						纵向滚动高亮示例
						<code className={styles.titleBadge}>direction: &quot;vertical&quot;</code>
					</h1>
					<p className={styles.subtitle}>
						在下方滚动容器内上下滚动，左侧目录会随当前区块自动高亮，URL hash 通过 replace 同步。
					</p>
				</div>
				<Link href="/horizontal" className={styles.headerLink}>
					横向滚动高亮示例 →
				</Link>
			</header>

			<div className={styles.layout}>
				<nav className={styles.nav} aria-label="区块目录">
					<div className={styles.navTitle}>目录 Contents</div>
					<ul className={styles.navList}>
						{sections.map((section, index) => {
							const active = isActive(section.id);
							return (
								<li key={section.id} className={styles.navItem}>
									<a
										href={`#${section.id}`}
										className={active ? styles.navLinkOn : styles.navLink}
									>
										<span className={styles.navIndex}>
											{String(index + 1).padStart(2, "0")}
										</span>
										{section.title}
									</a>
								</li>
							);
						})}
					</ul>
				</nav>

				<section className={styles.stage} aria-label="纵向滚动演示区">
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
							<span className={styles.chipLabel}>hash</span>
							<code>replace</code>
						</span>
					</div>

					<div ref={containerRef} className={styles.scroller}>
						{sections.map((section) => {
							const active = isActive(section.id);
							return (
								<section
									key={section.id}
									id={section.id}
									className={active ? styles.sectionOn : styles.section}
								>
									<div className={styles.sectionKicker}>{section.id}</div>
									<h2 className={styles.sectionTitle}>{section.title}</h2>
									<p className={styles.sectionBody}>{section.body}</p>
									<span className={styles.activeTag}>
										<span className={styles.activeDot} />
										{`activeId: ${active ? section.id : "—"}`}
									</span>
								</section>
							);
						})}
					</div>
				</section>
			</div>
		</main>
	);
}
