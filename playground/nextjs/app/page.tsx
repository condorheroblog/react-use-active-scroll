"use client";

import { useMemo, useRef } from "react";
// @zh 通过 next.config.js / tsconfig paths 映射到本地源码。
// @en Mapped to local source via next.config.js / tsconfig paths.
import { useActiveScroll } from "react-use-active-scroll";

const sections = Array.from({ length: 8 }, (_, index) => ({
	id: `section-${index + 1}`,
	title: `Section ${index + 1}`,
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
	const targetIds = useMemo(() => sections.map((s) => s.id), []);

	const { activeId, isActive } = useActiveScroll(targetIds, {
		root: containerRef,
		hash: "replace",
	});

	return (
		<div
			style={{
				display: "flex",
				gap: 24,
				padding: 24,
				maxWidth: 1200,
				margin: "0 auto",
			}}
		>
			<nav style={{ position: "sticky", top: 24, height: "fit-content" }}>
				<ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
					{sections.map((s) => (
						<li key={s.id} style={{ marginBottom: 8 }}>
							<a
								href={`#${s.id}`}
								style={{
									fontWeight: isActive(s.id) ? "bold" : "normal",
									color: isActive(s.id)
										? "#00adb5"
										: "rgba(255, 255, 255, 0.64)",
								}}
							>
								{s.title}
							</a>
						</li>
					))}
				</ul>
			</nav>

			<div
				ref={containerRef}
				style={{
					flex: 1,
					height: 500,
					overflow: "auto",
					border: "1px solid #384a5d",
					borderRadius: 8,
				}}
			>
				{sections.map((s) => (
					<section
						key={s.id}
						id={s.id}
						style={{
							height: 600,
							padding: 24,
							borderBottom: "1px dashed #384a5d",
						}}
					>
						<h2>{s.title}</h2>
						<p>Current active id: {activeId || "none"}</p>
					</section>
				))}
			</div>
		</div>
	);
}
