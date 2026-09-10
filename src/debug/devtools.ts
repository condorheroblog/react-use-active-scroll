import type { CSSProperties, ReactNode, RefObject } from "react";
import type { ResolvedOptions } from "../types";
import type { DebugLineInput } from "./lines";
import { createElement, useEffect, useMemo, useState } from "react";
import { computeDebugLines, groupLines } from "./lines";

/**
 * @zh 调试覆盖层配色与层级（全部经 CSS 变量引用，带 fallback，不注入样式表）：
 * - --uas-debug-line：方向触发线颜色
 * - --uas-debug-edge：首尾边缘线颜色
 * - --uas-debug-bg：标签底色
 * - --uas-debug-z-index：覆盖层层级
 * @en Debug overlay colors and stacking (all referenced via CSS variables with
 * fallbacks; no stylesheet is injected):
 * - --uas-debug-line: directional trigger-line color
 * - --uas-debug-edge: first/last edge-line color
 * - --uas-debug-bg: label background
 * - --uas-debug-z-index: overlay stacking order
 */
const LINE_COLOR = "var(--uas-debug-line, #22d3ee)";
const EDGE_COLOR = "var(--uas-debug-edge, #f59e0b)";
const LABEL_BG = "var(--uas-debug-bg, #ffffff)";
const Z_INDEX = "var(--uas-debug-z-index, 9999)";

export interface DevtoolsProps extends DebugLineInput {
	root: ResolvedOptions["root"]
	/** @zh 是否显示文字标签 @en Whether to show text labels */
	label: boolean
	/** @zh 覆盖层 wrapper 的附加 className @en Extra className on the overlay wrapper */
	className?: string
}

/**
 * @zh 判断归一化 root 是否为窗口根；RefObject 形式读取其 current。
 * @en Determines whether the normalized root is the window root; reads
 * current for a RefObject.
 */
function resolveIsWindowRoot(root: DevtoolsProps["root"]): boolean {
	if (root && typeof root === "object" && "current" in root)
		return !((root as RefObject<HTMLElement | null>).current instanceof HTMLElement);
	return !(root instanceof HTMLElement);
}

/**
 * @zh 触发线调试覆盖层。
 * 窗口滚动时 wrapper fixed 铺满视口；容器滚动时 absolute 铺满最近的
 * position: relative 祖先（即滚动容器的 border-box）。
 * 核心库构建链路不转换 JSX，故这里统一使用 createElement。
 * @en Trigger-line debug overlay.
 * The wrapper is fixed over the viewport for window scrolling, and absolute
 * over the nearest position: relative ancestor (the scroll container's
 * border-box) for container scrolling.
 * The library build does not transform JSX, so createElement is used
 * throughout.
 */
export function Devtools({ root, direction, overlay, edges, offset, label: showLabel, className = "" }: DevtoolsProps): ReactNode {
	// @zh ref 形式的 root 可能在挂载后才拿到元素，挂载后与 root 变化时重新解析 @en A ref root may receive its element only after mount; re-resolve on mount and whenever root changes
	const [isWindowRoot, setIsWindowRoot] = useState(() => resolveIsWindowRoot(root));
	useEffect(() => {
		const next = resolveIsWindowRoot(root);
		setIsWindowRoot(prev => (prev === next ? prev : next));
	}, [root]);

	const groups = useMemo(
		() => groupLines(computeDebugLines({ direction, overlay, edges, offset } satisfies DebugLineInput)),
		[direction, overlay, edges, offset],
	);

	const horizontal = direction === "horizontal";
	const wrapperStyle: CSSProperties = {
		position: isWindowRoot ? "fixed" : "absolute",
		inset: 0,
		// @zh z-index 走 CSS 变量，csstype 仅接受数字，需断言 @en z-index comes from a CSS variable; csstype only accepts numbers, so a cast is needed
		zIndex: Z_INDEX as unknown as number,
		pointerEvents: "none",
		overflow: "hidden",
	};

	const chipStyle: CSSProperties = {
		font: "10px/1.4 ui-monospace, SFMono-Regular, Menlo, monospace",
		whiteSpace: "nowrap",
		padding: "1px 6px",
		borderRadius: "2px",
		backgroundColor: LABEL_BG,
	};

	const chip = (text: string, color: string, dash: string, extraStyle: CSSProperties): ReactNode =>
		createElement(
			"span",
			{ style: { ...chipStyle, border: `2px ${dash} ${color}`, color, ...extraStyle } },
			text,
		);

	const nodes = Array.from(groups.entries()).map(([pos, group]) => {
		const isEdge = group.some(line => line.kind === "edge");
		const color = isEdge ? EDGE_COLOR : LINE_COLOR;
		const dash = isEdge ? "dotted" : "dashed";
		const text = `${group.map(line => line.label).join(" / ")} · ${pos}px`;
		const key = group.map(line => line.id).join("+");

		// @zh pos 为负时触发线位于轴起点之外，改为在起点边缘固定标记牌 @en When pos is negative the line lies beyond the axis start; pin a marker to the start edge instead
		if (pos < 0) {
			if (horizontal) {
				return createElement(
					"div",
					{
						key,
						style: { position: "absolute", left: 0, top: 0, padding: "4px" },
					},
					chip(`◀ ${text} off-screen`, color, dash, {}),
				);
			}
			return createElement(
				"div",
				{
					key,
					style: {
						position: "absolute",
						left: 0,
						right: 0,
						top: 0,
						display: "flex",
						justifyContent: "flex-end",
						padding: "4px 8px",
					},
				},
				chip(`▲ ${text} off-screen`, color, dash, {}),
			);
		}

		if (horizontal) {
			return createElement(
				"div",
				{
					key,
					style: {
						position: "absolute",
						top: 0,
						bottom: 0,
						left: `${pos}px`,
						borderLeft: `2px ${dash} ${color}`,
					},
				},
				showLabel ? chip(text, color, dash, { position: "absolute", top: "4px", left: "4px" }) : null,
			);
		}

		return createElement(
			"div",
			{
				key,
				style: {
					position: "absolute",
					left: 0,
					right: 0,
					top: `${pos}px`,
					borderTop: `2px ${dash} ${color}`,
				},
			},
			showLabel
				? chip(text, color, dash, { position: "absolute", right: "8px", top: 0, transform: "translateY(-50%)" })
				: null,
		);
	});

	return createElement(
		"div",
		{ className, style: wrapperStyle, ariaHidden: true },
		nodes,
	);
}
