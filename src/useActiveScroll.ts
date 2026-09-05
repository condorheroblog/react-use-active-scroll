import type { RefObject } from "react";
import type { ResolvedOptions, Targets, TargetsCache, UseActiveScrollOptions, UseActiveScrollReturn } from "./types";
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import {
	FIXED_OFFSET,
	getCurrentY,
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
 * 滚动激活 Hook。
 *
 * 根据滚动位置自动判定当前应高亮的目标元素，
 * 不执行滚动也不修改 DOM，只输出激活状态供上层 UI 消费。
 */
export function useActiveScroll(
	userTargets: Targets,
	options: UseActiveScrollOptions = {},
): UseActiveScrollReturn {
	// 合并配置，并通过 ref 保证事件回调内始终读到最新配置
	const opts = useMemo(() => resolveOptions(options), [options]);
	const optsRef = useRef<ResolvedOptions>(opts);
	optsRef.current = opts;

	// 目标集合 ref，方便在事件回调中读取最新值
	const userTargetsRef = useRef<Targets>(userTargets);
	userTargetsRef.current = userTargets;

	// 需要触发重渲染的内部状态
	const [activeEl, setActiveElState] = useState<HTMLElement | null>(null);
	const [isScrollIdle, setIsScrollIdle] = useState(false);
	const [isScrollFromTarget, setIsScrollFromTarget] = useState(false);
	// 使用 useSyncExternalStore 同步 matchMedia 状态，避免在 useEffect 中直接 setState
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

	// 用 ref 镜像 activeEl，供未在依赖列表中的事件监听器读取最新值
	const activeElRef = useRef<HTMLElement | null>(activeEl);
	activeElRef.current = activeEl;

	// 稳定的状态设置函数，避免暴露的 callback 引用变化
	const setActiveEl = useCallback((el: HTMLElement | null) => {
		activeElRef.current = el;
		setActiveElState(el);
	}, []);

	// 不触发重渲染的内部缓存
	const rootRef = useRef<HTMLElement | null>(null);
	const isWindowRootRef = useRef(false);
	const targetsRef = useRef<TargetsCache>({
		els: [],
		top: new Map(),
		bottom: new Map(),
	});
	const prevScrollYRef = useRef(0);
	const clickStartYRef = useRef(0);
	const resizeObserverRef = useRef<ResizeObserver | null>(null);
	const skipObserverCallbackRef = useRef(true);
	const idleRafRef = useRef<number | null>(null);

	// 派生返回值
	const activeId = useMemo(() => activeEl?.id || "", [activeEl]);
	const activeIndex = useMemo(
		() => targetsRef.current.els.indexOf(activeEl as HTMLElement),
		[activeEl],
	);

	/**
	 * 根据 URL hash 设置初始激活目标。
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
	 * 到达顶部/底部边界时强制激活首尾目标。
	 */
	function onEdgeReached(): boolean {
		if (!optsRef.current.jumpToFirst && !optsRef.current.jumpToLast)
			return false;
		if (!rootRef.current)
			return false;

		const { isTop, isBottom } = getEdges(rootRef.current, isWindowRootRef.current);

		if (optsRef.current.jumpToFirst && isTop) {
			setActiveEl(targetsRef.current.els[0] || null);
			return true;
		}

		if (optsRef.current.jumpToLast && isBottom) {
			setActiveEl(last(targetsRef.current.els) || null);
			return true;
		}

		return false;
	}

	/**
	 * 向下滚动时的激活判定。
	 */
	function onScrollDown(isScrollCancel = false): void {
		const { els, top, bottom } = targetsRef.current;
		if (els.length === 0)
			return;

		let firstOutEl: HTMLElement | null = optsRef.current.jumpToFirst
			? els[0]
			: null;

		const sentinel = getSentinel(isWindowRootRef.current, rootRef.current!);
		const offset = FIXED_OFFSET + optsRef.current.overlayHeight + optsRef.current.boundaryOffset.toBottom;

		Array.from(top).some(([_, topPos], idx) => {
			const _firstOffset = !optsRef.current.jumpToFirst && idx === 0
				? optsRef.current.edgeOffset.first
				: 0;

			if (sentinel + topPos < offset + _firstOffset) {
				firstOutEl = els[idx];
				return false;
			}
			return true;
		});

		if (!optsRef.current.jumpToLast && firstOutEl === last(els)) {
			const lastBottom = last(Array.from(bottom.values()));
			if (lastBottom !== undefined && sentinel + lastBottom < offset + optsRef.current.edgeOffset.last) {
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
	 * 向上滚动时的激活判定。
	 */
	function onScrollUp(): void {
		const { els, top, bottom } = targetsRef.current;
		if (els.length === 0)
			return;

		let firstInEl: HTMLElement | null = optsRef.current.jumpToLast
			? last(els)!
			: null;

		const sentinel = getSentinel(isWindowRootRef.current, rootRef.current!);
		const offset = FIXED_OFFSET + optsRef.current.overlayHeight + optsRef.current.boundaryOffset.toTop;

		Array.from(bottom).some(([_, bottomPos], idx) => {
			const _lastOffset
				= !optsRef.current.jumpToLast && idx === bottom.size - 1
					? optsRef.current.edgeOffset.last
					: 0;

			if (sentinel + bottomPos > offset + _lastOffset) {
				firstInEl = els[idx];
				return true;
			}
			return false;
		});

		if (!optsRef.current.jumpToFirst && firstInEl === els[0]) {
			const firstTop = top.values().next().value;
			if (firstTop !== undefined && sentinel + firstTop > offset + optsRef.current.edgeOffset.first) {
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
	 * 核心判定入口：根据滚动方向分发到向上/向下判定。
	 */
	function processScroll(prevY: number, isScrollCancel: boolean): number {
		const nextY = getCurrentY(isWindowRootRef.current, rootRef.current!);

		if (nextY < prevY) {
			onScrollUp();
		}
		else {
			onScrollDown(isScrollCancel);
		}

		return nextY;
	}

	/**
	 * 滚动空闲检测：连续若干帧位置不变后认为滚动停止。
	 */
	function setIdleScroll(maxFrames: number = IDLE_FRAMES): void {
		if (idleRafRef.current !== null) {
			window.cancelAnimationFrame(idleRafRef.current);
		}

		let frameCount = 0;
		let rafPrevY = getCurrentY(isWindowRootRef.current, rootRef.current!);
		let rafId: number;

		const scrollEnd = () => {
			frameCount++;
			const rafNextY = getCurrentY(isWindowRootRef.current, rootRef.current!);

			if (rafPrevY !== rafNextY) {
				frameCount = 0;
				rafPrevY = rafNextY;
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
	 * 注册 ResizeObserver，在容器或目标尺寸变化时重新计算位置并判定。
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
				);
				window.requestAnimationFrame(() => {
					if (!onEdgeReached())
						onScrollDown();
				});
			}
			else {
				skipObserverCallbackRef.current = false;
			}
		});

		resizeObserverRef.current.observe(rootRef.current);
	}

	/**
	 * 断开 ResizeObserver。
	 */
	function destroyResizeObserver(): void {
		resizeObserverRef.current?.disconnect();
		resizeObserverRef.current = null;
	}

	/**
	 * 浏览器前进/后退事件处理。
	 */
	function onPrevNext(event: PopStateEvent): void {
		const stateCurrent = event?.state?.current || "";
		if (!stateCurrent.includes("#") && activeElRef.current) {
			setActiveEl(optsRef.current.jumpToFirst ? targetsRef.current.els[0] : null);
			return;
		}
		setFromHash();
	}

	/**
	 * 注册/移除 popstate 监听。
	 */
	function addPrevNextListener(): void {
		window.addEventListener("popstate", onPrevNext);
	}

	function removePrevNextListener(): void {
		window.removeEventListener("popstate", onPrevNext);
	}

	/**
	 * 挂载时使用的较短空闲检测。
	 */
	function setMountIdle(): void {
		setIdleScroll(MOUNT_IDLE_FRAMES);
	}

	/**
	 * 清理 pending 的 requestAnimationFrame。
	 */
	function cancelIdleRaf(): void {
		if (idleRafRef.current !== null) {
			window.cancelAnimationFrame(idleRafRef.current);
			idleRafRef.current = null;
		}
	}

	// 解析 rootEl
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

	// 初始化：注册监听并设置初始激活目标
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
			);
			setResizeObserver();
			setMountIdle();
			addPrevNextListener();

			if (!setFromHash() && !onEdgeReached()) {
				onScrollDown();
			}
		}, 0);

		return () => {
			window.clearTimeout(timer);
			removePrevNextListener();
			destroyResizeObserver();
			cancelIdleRaf();
			setActiveEl(null);
		};
	}, [matchMedia, userTargets, opts.root]);

	// targets 或 root 变化时重新缓存位置
	useEffect(() => {
		if (!matchMedia || !rootRef.current)
			return;

		prepareTargets(
			userTargetsRef.current,
			rootRef.current,
			isWindowRootRef.current,
			targetsRef,
		);
	}, [userTargets, opts.root, matchMedia]);

	// 主滚动监听：仅在滚动空闲、满足宽度阈值且存在目标时注册
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
				prevScrollYRef.current = processScroll(prevScrollYRef.current, false);
				onEdgeReached();
			}
		};

		rootEl.addEventListener("scroll", onScroll, { passive: true });

		return () => {
			rootEl.removeEventListener("scroll", onScroll);
		};
	}, [isScrollIdle, matchMedia, userTargets, isScrollFromTarget]);

	// 目标触发滚动后的动态事件监听：检测到用户干预时恢复普通判定
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
				const containerWidth = isWindowRootRef.current
					? window.innerWidth
					: rootRef.current!.clientWidth;
				const isScrollbar = (event as PointerEvent).clientX >= containerWidth - SCROLLBAR_WIDTH;

				if (isFirefox || isScrollbar) {
					restoreHighlight();
					prevScrollYRef.current = processScroll(clickStartYRef.current, true);
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

	// 同步 URL hash
	useEffect(() => {
		if (!opts.replaceHash)
			return;
		if (typeof window === "undefined")
			return;

		const baseUrl = location.href.split("#")[0];
		const start = opts.jumpToFirst ? 0 : -1;
		const newHash = activeIndex > start ? `#${activeId}` : "";

		history.replaceState(history.state, "", `${baseUrl}${newHash}`);
	}, [activeId, activeIndex, opts.replaceHash, opts.jumpToFirst]);

	// 暴露方法
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
			clickStartYRef.current = getCurrentY(isWindowRootRef.current, rootRef.current!);
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
