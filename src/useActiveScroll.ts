import type { RefObject } from "react";
import type { ActiveScrollController, ActiveScrollOptions, ActiveScrollSnapshot, RootSource, TargetsSource } from "scroll-active-toc";
import type { Targets, UseActiveScrollOptions, UseActiveScrollReturn } from "./types";
import { createElement, useEffect, useMemo, useRef, useSyncExternalStore } from "react";
import { createActiveScroll, resolveOptions } from "scroll-active-toc";
import { Devtools } from "./debug/devtools";

/**
 * @zh 服务端渲染期间返回的空快照（冻结引用，保证 getServerSnapshot 稳定）。
 * @en Empty snapshot returned during SSR (frozen reference keeps
 * getServerSnapshot stable).
 */
const NULL_SNAPSHOT: ActiveScrollSnapshot = Object.freeze({
	activeElement: null,
	activeId: "",
	activeIndex: -1,
});

/**
 * @zh 判断是否为 RefObject 形态（含 current 字段的对象）。
 * @en Checks for the RefObject shape (an object with a current field).
 */
function isRefLike(value: unknown): value is { current: unknown } {
	return value !== null && typeof value === "object" && "current" in value;
}

/**
 * @zh 把 React 侧的 targets 入参转换为 core 的 TargetsSource：
 * RefObject 转为 getter，其余原样透传。
 * @en Converts the React targets argument to a core TargetsSource: a
 * RefObject becomes a getter; everything else passes through.
 */
function toTargetsSource(targets: Targets): TargetsSource {
	if (isRefLike(targets))
		return () => (targets.current as string[] | HTMLElement[] | null) ?? [];
	return targets as TargetsSource;
}

/**
 * @zh 把 React 侧的 root 选项转换为 core 的 RootSource：
 * RefObject 转为 getter，其余原样透传。
 * @en Converts the React root option to a core RootSource: a RefObject
 * becomes a getter; everything else passes through.
 */
function toRootSource(root: UseActiveScrollOptions["root"]): RootSource | undefined {
	if (root === undefined)
		return undefined;
	if (isRefLike(root))
		return () => (root as RefObject<HTMLElement | null>).current;
	return root as RootSource;
}

/**
 * @zh 剥离仅 React 层使用的 debug 字段，并把 root 归一化为 core 入参。
 * @en Strips the React-only debug field and normalizes root for core.
 */
function toEngineOptions(options: UseActiveScrollOptions): ActiveScrollOptions {
	const { debug: _debug, ...rest } = options;
	return { ...rest, root: toRootSource(options.root) };
}

/**
 * @zh 滚动激活 Hook。
 *
 * 根据滚动位置自动判定当前应高亮的目标元素，
 * 不执行滚动也不修改 DOM，只输出激活状态供上层 UI 消费。
 * 本 Hook 是无框架引擎（scroll-active-toc）的薄适配层：
 * 状态管理与事件装配全部在引擎包中完成，这里只负责 RefObject↔getter
 * 转换、生命周期挂载与外部 store 订阅。
 * @en Scroll-activation hook.
 *
 * Automatically determines which target element should be highlighted based
 * on the scroll position; it does not scroll or modify the DOM, and only
 * outputs the active state for the upper UI to consume.
 * This hook is a thin adapter over the framework-agnostic engine
 * (scroll-active-toc): all state management and listener wiring lives in the
 * engine package, while this layer only converts RefObjects to getters,
 * manages the lifecycle and subscribes to the external store.
 */
export function useActiveScroll(
	userTargets: Targets,
	options: UseActiveScrollOptions = {},
): UseActiveScrollReturn {
	// @zh 引擎构造不触碰 DOM，渲染期（含 SSR）创建也是安全的 @en Engine construction touches no DOM, so creating it during render (including SSR) is safe
	const engineRef = useRef<ActiveScrollController | null>(null);
	if (engineRef.current === null)
		engineRef.current = createActiveScroll(toTargetsSource(userTargets), toEngineOptions(options));
	const engine = engineRef.current;

	// @zh 挂载时启动，卸载时销毁（StrictMode 双调用下 start/destroy 均幂等）@en Start on mount, destroy on unmount (both idempotent under StrictMode double-invocation)
	useEffect(() => {
		engine.start();
		return () => engine.destroy();
	}, [engine]);

	// @zh 目标集合变化时替换（RefObject 形态引用稳定，getter 每次读到最新值）@en Replace the target collection when it changes (a RefObject keeps a stable reference; the getter always reads the latest value)
	useEffect(() => {
		engine.setTargets(toTargetsSource(userTargets));
	}, [engine, userTargets]);

	// @zh 配置在每次渲染后同步给引擎，等价于旧实现的 optsRef 镜像；
	// 实质字段未变时引擎内部为空操作。
	// @en Sync options to the engine after every render, equivalent to the
	// optsRef mirror in the old implementation; the engine no-ops when no
	// material field changed.
	useEffect(() => {
		engine.setOptions(toEngineOptions(options));
	});

	// @zh 外部 store 协议：快照引用仅在激活目标变化时变更 @en External-store protocol: the snapshot reference changes only when the active target changes
	const snapshot = useSyncExternalStore(
		engine.subscribe,
		engine.getSnapshot,
		() => NULL_SNAPSHOT,
	);

	// @zh debug 开启时构造触发线覆盖层节点（hook 本身不挂载 DOM，由消费者渲染该节点）@en Build the trigger-line overlay node when debug is enabled (the hook mounts no DOM itself; consumers render this node)
	const devtools = useMemo(() => {
		if (options.debug === false || options.debug === undefined)
			return null;
		const resolved = resolveOptions(toEngineOptions(options));
		const debugConfig = options.debug === true ? {} : options.debug;
		return createElement(Devtools, {
			root: options.root ?? null,
			direction: resolved.direction,
			overlay: resolved.overlay,
			edges: resolved.edges,
			offset: resolved.offset,
			label: debugConfig.label,
			className: debugConfig.className,
		});
		// @zh 与旧实现一致：options 引用变化时重建节点 @en Rebuild the node when the options reference changes, matching the old implementation
	}, [options]);

	return {
		setActive: engine.setActive,
		isActive: engine.isActive,
		activeElement: snapshot.activeElement,
		activeId: snapshot.activeId,
		activeIndex: snapshot.activeIndex,
		devtools,
	};
}
