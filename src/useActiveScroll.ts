import type { RefObject } from "react";
import type { ResolvedOptions, Targets, TargetsCache, UseActiveScrollOptions, UseActiveScrollReturn } from "./types";
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import {
	FIXED_OFFSET,
	getCurrentPos,
	getEdges,
	getSentinel,
	IDLE_FRAMES,
	last,
	MOUNT_IDLE_FRAMES,
	prepareTargets,
	resolveOptions,
	resolveTargets,
	SCROLLBAR_WIDTH,
} from "./utils";

/**
 * @zh 滚动激活 Hook。
 *
 * 根据滚动位置自动判定当前应高亮的目标元素，
 * 不执行滚动也不修改 DOM，只输出激活状态供上层 UI 消费。
 * @en Scroll-activation hook.
 *
 * Automatically determines which target element should be highlighted based
 * on the scroll position; it does not scroll or modify the DOM, and only
 * outputs the active state for the upper UI to consume.
 */
export function useActiveScroll(
	userTargets: Targets,
	options: UseActiveScrollOptions = {},
): UseActiveScrollReturn {
	// @zh 合并配置，并通过 ref 保证事件回调内始终读到最新配置
	// @en Merge options; a ref ensures event callbacks always read the latest config
	const opts = useMemo(() => resolveOptions(options), [options]);
	const optsRef = useRef<ResolvedOptions>(opts);
	optsRef.current = opts;

	// @zh 目标集合 ref，方便在事件回调中读取最新值
	// @en Ref for the target collection, so callbacks can read the latest value
	const userTargetsRef = useRef<Targets>(userTargets);
	userTargetsRef.current = userTargets;

	// @zh 需要触发重渲染的内部状态
	// @en Internal state that triggers re-renders
	const [activeEl, setActiveElState] = useState<HTMLElement | null>(null);
	const [isScrollIdle, setIsScrollIdle] = useState(false);
	const [isScrollFromTarget, setIsScrollFromTarget] = useState(false);
	// @zh 使用 useSyncExternalStore 同步 matchMedia 状态，避免在 useEffect 中直接 setState
	// @en Sync matchMedia state via useSyncExternalStore to avoid calling setState directly in useEffect
	const mql = useMemo(() => {
		if (typeof window === "undefined")
			return null;
		return window.matchMedia(`(min-width: ${opts.minWidth}px)`);
	}, [opts.minWidth]);

	const matchMedia = useSyncExternalStore(
		useCallback(
			(callback: () => void) => {
				if (!mql)
					return () => {};
				mql.addEventListener("change", callback);
				return () => mql.removeEventListener("change", callback);
			},
			[mql],
		),
		() => mql?.matches ?? false,
		() => false,
	);

	// @zh 用 ref 镜像 activeEl，供未在依赖列表中的事件监听器读取最新值
	// @en Mirror activeEl in a ref so listeners missing from the dependency array read the latest value
	const activeElRef = useRef<HTMLElement | null>(activeEl);
	activeElRef.current = activeEl;

	// @zh 稳定的状态设置函数，避免暴露的 callback 引用变化
	// @en Stable state setter to keep the exposed callback reference unchanged
	const setActiveEl = useCallback((el: HTMLElement | null) => {
		activeElRef.current = el;
		setActiveElState(el);
	}, []);

	// @zh 不触发重渲染的内部缓存
	// @en Internal caches that do not trigger re-renders
	const rootRef = useRef<HTMLElement | null>(null);
	const isWindowRootRef = useRef(false);
	const targetsRef = useRef<TargetsCache>({
		els: [],
		start: new Map(),
		end: new Map(),
	});
	const prevScrollPosRef = useRef(0);
	const clickStartPosRef = useRef(0);
	const resizeObserverRef = useRef<ResizeObserver | null>(null);
	const skipObserverCallbackRef = useRef(true);
	const idleRafRef = useRef<number | null>(null);

	// @zh 派生返回值
	// @en Derived return values
	const activeId = useMemo(() => activeEl?.id || "", [activeEl]);
	const activeIndex = useMemo(
		() => targetsRef.current.els.indexOf(activeEl as HTMLElement),
		[activeEl],
	);

	/**
	 * @zh 根据 URL hash 设置初始激活目标。
	 * @en Sets the initial active target based on the URL hash.
	 */
	function setFromHash(): boolean {
		if (typeof window === "undefined")
			return false;

		const hash = window.location.hash.slice(1);
		if (!hash)
			return false;

		const target = targetsRef.current.els.find(el => el.id === hash);
		if (target) {
			setActiveEl(target);
			return true;
		}

		return false;
	}

	/**
	 * @zh 到达滚动起点/终点边界时强制激活首尾目标。
	 * @en Forces activation of the first/last target when the scroll
	 * start/end boundary is reached.
	 */
	function onEdgeReached(): boolean {
		const { first, last: edgesLast } = optsRef.current.edges;
		if (first !== true && edgesLast !== true)
			return false;
		if (!rootRef.current)
			return false;

		const { isStart, isEnd } = getEdges(optsRef.current.direction, rootRef.current, isWindowRootRef.current);

		if (first === true && isStart) {
			setActiveEl(targetsRef.current.els[0] || null);
			return true;
		}

		if (edgesLast === true && isEnd) {
			setActiveEl(last(targetsRef.current.els) || null);
			return true;
		}

		return false;
	}

	/**
	 * @zh 朝滚动终点方向滚动时的激活判定。
	 * @en Activation logic when scrolling toward the scroll end.
	 */
	function onScrollToEnd(isScrollCancel = false): void {
		const { els, start, end } = targetsRef.current;
		if (els.length === 0)
			return;

		const { first, last: edgesLast } = optsRef.current.edges;
		let firstOutEl: HTMLElement | null = first === true
			? els[0]
			: null;

		const sentinel = getSentinel(optsRef.current.direction, isWindowRootRef.current, rootRef.current!);
		const offset = FIXED_OFFSET + optsRef.current.overlay + optsRef.current.offset.toEnd;

		Array.from(start).some(([_, startPos], idx) => {
			const _firstOffset = first !== true && idx === 0
				? first
				: 0;

			if (sentinel + startPos < offset + _firstOffset) {
				firstOutEl = els[idx];
				return false;
			}
			return true;
		});

		if (edgesLast !== true && firstOutEl === last(els)) {
			const lastEnd = last(Array.from(end.values()));
			if (lastEnd !== undefined && sentinel + lastEnd < offset - edgesLast) {
				setActiveEl(null);
				return;
			}
		}

		const isNext = els.indexOf(firstOutEl as HTMLElement) > els.indexOf(activeElRef.current as HTMLElement);

		if (isNext || (firstOutEl && !activeElRef.current)) {
			setActiveEl(firstOutEl);
		}
		else if (isScrollCancel) {
			setActiveEl(firstOutEl);
		}
	}

	/**
	 * @zh 朝滚动起点方向滚动时的激活判定。
	 * @en Activation logic when scrolling toward the scroll start.
	 */
	function onScrollToStart(): void {
		const { els, start, end } = targetsRef.current;
		if (els.length === 0)
			return;

		const { first, last: edgesLast } = optsRef.current.edges;
		let firstInEl: HTMLElement | null = edgesLast === true
			? last(els)!
			: null;

		const sentinel = getSentinel(optsRef.current.direction, isWindowRootRef.current, rootRef.current!);
		const offset = FIXED_OFFSET + optsRef.current.overlay + optsRef.current.offset.toStart;

		Array.from(end).some(([_, endPos], idx) => {
			const _lastOffset = edgesLast !== true && idx === end.size - 1
				? -edgesLast
				: 0;

			if (sentinel + endPos > offset + _lastOffset) {
				firstInEl = els[idx];
				return true;
			}
			return false;
		});

		if (first !== true && firstInEl === els[0]) {
			const firstStart = start.values().next().value;
			if (firstStart !== undefined && sentinel + firstStart > offset + first) {
				setActiveEl(null);
				return;
			}
		}

		const isPrev = els.indexOf(firstInEl as HTMLElement) < els.indexOf(activeElRef.current as HTMLElement);

		if (isPrev || (firstInEl && !activeElRef.current)) {
			setActiveEl(firstInEl);
		}
	}

	/**
	 * @zh 核心判定入口：根据滚动方向分发到起点/终点判定。
	 * @en Core entry point: dispatches to the start/end logic based on the
	 * scroll direction.
	 */
	function processScroll(prevPos: number, isScrollCancel: boolean): number {
		const nextPos = getCurrentPos(optsRef.current.direction, isWindowRootRef.current, rootRef.current!);

		if (nextPos < prevPos) {
			onScrollToStart();
		}
		else {
			onScrollToEnd(isScrollCancel);
		}

		return nextPos;
	}

	/**
	 * @zh 滚动空闲检测：连续若干帧位置不变后认为滚动停止。
	 * @en Scroll idle detection: scrolling is considered stopped after the
	 * position stays unchanged for several consecutive frames.
	 */
	function setIdleScroll(maxFrames: number = IDLE_FRAMES): void {
		if (idleRafRef.current !== null) {
			window.cancelAnimationFrame(idleRafRef.current);
		}

		let frameCount = 0;
		let rafPrevPos = getCurrentPos(optsRef.current.direction, isWindowRootRef.current, rootRef.current!);
		let rafId: number;

		const scrollEnd = () => {
			frameCount++;
			const rafNextPos = getCurrentPos(optsRef.current.direction, isWindowRootRef.current, rootRef.current!);

			if (rafPrevPos !== rafNextPos) {
				frameCount = 0;
				rafPrevPos = rafNextPos;
				rafId = window.requestAnimationFrame(scrollEnd);
				idleRafRef.current = rafId;
				return;
			}

			if (frameCount === maxFrames) {
				setIsScrollIdle(true);
				setIsScrollFromTarget(false);
				window.cancelAnimationFrame(rafId);
				idleRafRef.current = null;
			}
			else {
				rafId = window.requestAnimationFrame(scrollEnd);
				idleRafRef.current = rafId;
			}
		};

		rafId = window.requestAnimationFrame(scrollEnd);
		idleRafRef.current = rafId;
	}

	/**
	 * @zh 注册 ResizeObserver，在容器或目标尺寸变化时重新计算位置并判定。
	 * @en Registers a ResizeObserver to recompute positions and re-evaluate
	 * when the container or targets change size.
	 */
	function setResizeObserver(): void {
		if (resizeObserverRef.current)
			return;
		if (!rootRef.current)
			return;

		resizeObserverRef.current = new ResizeObserver(() => {
			if (!skipObserverCallbackRef.current) {
				prepareTargets(
					userTargetsRef.current,
					rootRef.current!,
					isWindowRootRef.current,
					targetsRef,
					optsRef.current.direction,
				);
				window.requestAnimationFrame(() => {
					if (!onEdgeReached())
						onScrollToEnd();
				});
			}
			else {
				skipObserverCallbackRef.current = false;
			}
		});

		resizeObserverRef.current.observe(rootRef.current);
	}

	/**
	 * @zh 断开 ResizeObserver。
	 * @en Disconnects the ResizeObserver.
	 */
	function destroyResizeObserver(): void {
		resizeObserverRef.current?.disconnect();
		resizeObserverRef.current = null;
	}

	/**
	 * @zh 浏览器前进/后退事件处理。
	 * @en Handles browser forward/back events.
	 */
	function onPrevNext(): void {
		const hash = window.location.hash;
		if (!hash && activeElRef.current) {
			setActiveEl(optsRef.current.edges.first === true ? targetsRef.current.els[0] : null);
			return;
		}
		setFromHash();
	}

	/**
	 * @zh 注册 popstate 监听。
	 * @en Registers the popstate listener.
	 */
	function addPrevNextListener(): void {
		window.addEventListener("popstate", onPrevNext);
	}

	/**
	 * @zh 移除 popstate 监听。
	 * @en Removes the popstate listener.
	 */
	function removePrevNextListener(): void {
		window.removeEventListener("popstate", onPrevNext);
	}

	/**
	 * @zh 挂载时使用的较短空闲检测。
	 * @en Shorter idle detection used on mount.
	 */
	function setMountIdle(): void {
		setIdleScroll(MOUNT_IDLE_FRAMES);
	}

	/**
	 * @zh 清理 pending 的 requestAnimationFrame。
	 * @en Cancels the pending requestAnimationFrame.
	 */
	function cancelIdleRaf(): void {
		if (idleRafRef.current !== null) {
			window.cancelAnimationFrame(idleRafRef.current);
			idleRafRef.current = null;
		}
	}

	// @zh 解析 rootEl
	// @en Resolve rootEl
	useEffect(() => {
		const resolvedRoot
			= opts.root && "current" in opts.root
				? (opts.root as RefObject<HTMLElement | null>).current
				: opts.root;

		if (resolvedRoot instanceof HTMLElement) {
			rootRef.current = resolvedRoot;
			isWindowRootRef.current = false;
		}
		else {
			rootRef.current = typeof document !== "undefined" ? document.documentElement : null;
			isWindowRootRef.current = true;
		}
	}, [opts.root]);

	// @zh 初始化：注册监听并设置初始激活目标
	// @en Initialization: register listeners and set the initial active target
	useEffect(() => {
		if (typeof window === "undefined")
			return;
		if (!rootRef.current)
			return;
		if (!matchMedia)
			return;

		const timer = window.setTimeout(() => {
			prepareTargets(
				userTargetsRef.current,
				rootRef.current!,
				isWindowRootRef.current,
				targetsRef,
				optsRef.current.direction,
			);
			setResizeObserver();
			setMountIdle();
			addPrevNextListener();

			if (!setFromHash() && !onEdgeReached()) {
				onScrollToEnd();
			}
		}, 0);

		return () => {
			window.clearTimeout(timer);
			removePrevNextListener();
			destroyResizeObserver();
			cancelIdleRaf();
			setActiveEl(null);
		};
	}, [matchMedia, userTargets, opts.root, opts.direction]);

	// @zh targets、root 或 direction 变化时重新缓存位置
	// @en Re-cache positions when targets, root, or direction changes
	useEffect(() => {
		if (!matchMedia || !rootRef.current)
			return;

		prepareTargets(
			userTargetsRef.current,
			rootRef.current,
			isWindowRootRef.current,
			targetsRef,
			optsRef.current.direction,
		);
	}, [userTargets, opts.root, opts.direction, matchMedia]);

	// @zh 主滚动监听：仅在滚动空闲、满足宽度阈值且存在目标时注册
	// @en Main scroll listener: registered only when scrolling is idle, the width threshold is met, and targets exist
	useEffect(() => {
		if (typeof window === "undefined")
			return;
		if (!isScrollIdle || !matchMedia || !rootRef.current)
			return;
		if (resolveTargets(userTargetsRef.current).length === 0)
			return;

		const rootEl = isWindowRootRef.current ? document : rootRef.current;

		const onScroll = () => {
			if (!isScrollFromTarget) {
				prevScrollPosRef.current = processScroll(prevScrollPosRef.current, false);
				onEdgeReached();
			}
		};

		rootEl.addEventListener("scroll", onScroll, { passive: true });

		return () => {
			rootEl.removeEventListener("scroll", onScroll);
		};
	}, [isScrollIdle, matchMedia, userTargets, isScrollFromTarget]);

	// @zh 目标触发滚动后的动态事件监听：检测到用户干预时恢复普通判定
	// @en Dynamic listeners after a target-triggered scroll: resume normal logic when user intervention is detected
	useEffect(() => {
		if (typeof window === "undefined")
			return;
		if (!isScrollFromTarget)
			return;
		if (resolveTargets(userTargetsRef.current).length === 0)
			return;

		const rootEl = isWindowRootRef.current ? document : rootRef.current!;

		const restoreHighlight = () => setIsScrollFromTarget(false);

		const onSpaceBar: EventListener = (event) => {
			if ((event as KeyboardEvent).code === "Space")
				restoreHighlight();
		};

		const onScrollCancel: EventListener = (event) => {
			const isAnchor = (event.target as HTMLElement).tagName === "A";
			if (!isAnchor) {
				const isFirefox = window.CSS.supports("-moz-appearance", "none");
				const horizontal = optsRef.current.direction === "horizontal";
				// @zh 纵向滚动条贴容器右缘，横向滚动条贴容器底缘
				// @en The vertical scrollbar sits on the container's right edge; the horizontal scrollbar on the bottom edge
				const containerSize = isWindowRootRef.current
					? (horizontal ? window.innerHeight : window.innerWidth)
					: (horizontal ? rootRef.current!.clientHeight : rootRef.current!.clientWidth);
				const clickPos = horizontal
					? (event as PointerEvent).clientY
					: (event as PointerEvent).clientX;
				const isScrollbar = clickPos >= containerSize - SCROLLBAR_WIDTH;

				if (isFirefox || isScrollbar) {
					restoreHighlight();
					prevScrollPosRef.current = processScroll(clickStartPosRef.current, true);
				}
			}
		};

		const onScrollIdleEvent: EventListener = () => setIdleScroll();

		rootEl.addEventListener("wheel", restoreHighlight, { once: true });
		rootEl.addEventListener("touchmove", restoreHighlight, { once: true });
		rootEl.addEventListener("keydown", onSpaceBar, { once: true });
		rootEl.addEventListener("scroll", onScrollIdleEvent, { passive: true, once: true });
		rootEl.addEventListener("pointerdown", onScrollCancel);

		return () => {
			rootEl.removeEventListener("wheel", restoreHighlight);
			rootEl.removeEventListener("touchmove", restoreHighlight);
			rootEl.removeEventListener("keydown", onSpaceBar);
			rootEl.removeEventListener("scroll", onScrollIdleEvent);
			rootEl.removeEventListener("pointerdown", onScrollCancel);
		};
	}, [isScrollFromTarget, userTargets]);

	// @zh 同步 URL hash
	// @en Sync the URL hash
	useEffect(() => {
		if (opts.hash === "off")
			return;
		if (typeof window === "undefined")
			return;

		const baseUrl = location.href.split("#")[0];
		const start = opts.edges.first === true ? 0 : -1;
		const newHash = activeIndex > start ? `#${activeId}` : "";

		// @zh 与当前地址一致时跳过，避免多余的状态替换或重复历史记录
		// @en Skip when it matches the current URL to avoid redundant state replacement or duplicate history entries
		if (location.hash === newHash)
			return;

		const url = `${baseUrl}${newHash}`;
		if (opts.hash === "push")
			history.pushState(history.state, "", url);
		else
			history.replaceState(history.state, "", url);
	}, [activeId, activeIndex, opts.hash, opts.edges.first]);

	// @zh 暴露方法
	// @en Exposed methods
	const setActive = useCallback((target: string | HTMLElement) => {
		if (typeof window === "undefined")
			return;

		let sourceTarget: HTMLElement | null = null;

		if (typeof target === "string") {
			sourceTarget = targetsRef.current.els.find(({ id }) => id === target) || null;
		}
		else if (target instanceof HTMLElement) {
			sourceTarget = targetsRef.current.els.find(el => el === target) || null;
		}

		if (sourceTarget) {
			setActiveEl(sourceTarget);
			setIsScrollFromTarget(true);
			clickStartPosRef.current = getCurrentPos(optsRef.current.direction, isWindowRootRef.current, rootRef.current!);
		}
	}, []);

	const isActive = useCallback(
		(target: string | HTMLElement) => {
			if (typeof window === "undefined")
				return false;
			if (typeof target === "string")
				return target === activeId;
			if (target instanceof HTMLElement)
				return target === activeEl;
			return false;
		},
		[activeId, activeEl],
	);

	return {
		setActive,
		isActive,
		activeEl,
		activeId,
		activeIndex,
	};
}
