import type { ReactNode, RefObject } from "react";
import type { DebugLineInput, DebugOverlay, DebugOverlayConfig } from "scroll-active-toc";
import type { ResolvedOptions } from "../types";
import { createElement, useEffect, useRef } from "react";
import { createDebugOverlay } from "scroll-active-toc";

export interface DevtoolsProps extends DebugLineInput {
	root: ResolvedOptions["root"]
	/** @zh 是否显示文字标签 @en Whether to show text labels */
	label?: boolean
	/** @zh 覆盖层 wrapper 的附加 className @en Extra className on the overlay wrapper */
	className?: string
}

/**
 * @zh 把 RefObject / 元素 / null 形式的 root 解析为实际容器元素。
 * @en Resolves a RefObject / element / null root to the actual container
 * element.
 */
function resolveRootElement(root: DevtoolsProps["root"]): HTMLElement | null {
	if (root && typeof root === "object" && "current" in root) {
		const current = (root as RefObject<HTMLElement | null>).current;
		return current instanceof HTMLElement ? current : null;
	}
	return root instanceof HTMLElement ? root : null;
}

/**
 * @zh 触发线调试覆盖层（React 适配）。
 * 渲染与判定逻辑全部来自 scroll-active-toc 的命令式 createDebugOverlay，本组件只负责
 * 挂载、按 props 更新与卸载。窗口滚动时覆盖层 fixed 铺满视口；容器滚动时
 * absolute 铺满最近的 position: relative 祖先（即滚动容器的 border-box）。
 * 外层 host 使用 display: contents，不产生额外盒子，因此覆盖层的定位
 * 参照物与直接渲染 wrapper 时完全一致。
 * @en Trigger-line debug overlay (React adapter).
 * Rendering and evaluation come entirely from the imperative
 * createDebugOverlay in scroll-active-toc; this component only mounts,
 * updates on props and unmounts. The overlay is fixed over the viewport for window scrolling,
 * and absolute over the nearest position: relative ancestor (the scroll
 * container's border-box) for container scrolling. The host uses
 * display: contents and generates no box, so the overlay's positioning
 * context is identical to rendering the wrapper directly.
 */
export function Devtools({ root, direction, overlay, edges, offset, label = true, className = "" }: DevtoolsProps): ReactNode {
	const hostRef = useRef<HTMLDivElement | null>(null);
	const overlayRef = useRef<DebugOverlay | null>(null);

	// @zh ref 形式的 root 可能在挂载后才拿到元素；effect 在每次渲染后执行，
	// 确保覆盖层始终拿到最新容器并同步最新配置。
	// @en A ref root may receive its element only after mount; the effect runs
	// after every render to keep the overlay on the latest container and config.
	useEffect(() => {
		const host = hostRef.current;
		if (!host)
			return;

		const config: DebugOverlayConfig = {
			root: resolveRootElement(root),
			direction,
			overlay,
			edges,
			offset,
			label,
			className,
		};

		if (overlayRef.current) {
			overlayRef.current.update(config);
		}
		else {
			const instance = createDebugOverlay(config);
			overlayRef.current = instance;
			host.appendChild(instance.el);
		}
	});

	useEffect(() => () => {
		overlayRef.current?.destroy();
		overlayRef.current = null;
	}, []);

	// @zh 核心库构建链路不转换 JSX，故这里统一使用 createElement；
	// host 仅作挂载点，display: contents 保证不产生额外定位盒子。
	// @en The library build does not transform JSX, so createElement is used;
	// the host is only a mount point, and display: contents ensures no extra
	// positioning box is generated.
	return createElement("div", { ref: hostRef, style: { display: "contents" } });
}
