# react-use-active-scroll：API 设计规范与业务逻辑说明书

> 包名：`react-use-active-scroll`

---

## 1. 项目定位

`react-use-active-scroll` 是一个**滚动激活（Scroll Activation）Hook**，用于在长页面或滚动容器中，根据滚动位置自动判定当前应高亮的目录/导航目标。它解决的核心问题是：传统交叉观察器（Intersection Observer）在平滑滚动、快速滚动、首尾边界、点击导航等场景下高亮状态不稳定的问题。

该 Hook 本身**不执行滚动**，也不修改 DOM 结构或注入样式，只负责输出“当前激活目标”的状态，供上层 UI 消费。

---

## 2. 核心概念

| 概念 | 说明 |
|------|------|
| **Target（目标）** | 被监听的可滚动锚点，通常为标题（heading）或区块（section）。每个目标必须拥有唯一标识，可为字符串 ID 或元素引用。 |
| **Root（滚动根）** | 发生滚动的容器元素。若未指定，则默认为文档根（即窗口滚动）。 |
| **Sentinel（哨兵）** | 用于判断目标是否进入/离开视口触发线的基准值，本质上是视口顶部相对于文档的位置。 |
| **Active Target（激活目标）** | 当前被判定为高亮的目标元素。 |
| **Scroll Idle（滚动空闲）** | 连续若干动画帧滚动位置未变化，认为滚动已停止。 |
| **Scroll From Target（目标触发滚动）** | 当前滚动是由点击目标链接或 hash 导航触发，而非用户手动滚动。此状态用于屏蔽普通滚动算法，避免高亮跳动。 |

---

## 3. 公共 API 接口（React Hook 形态）

### 3.1 入口 Hook

```typescript
function useActiveScroll(
	targets: Targets,
	options?: UseActiveScrollOptions
): UseActiveScrollReturn;
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `targets` | `string[]` \| `HTMLElement[]` \| `RefObject<...>` | 是 | 目标集合。支持 ID 字符串数组、元素引用数组，或包含上述数组的 Ref。 |
| `options` | `UseActiveScrollOptions` | 否 | 配置对象，见 3.2。 |

### 3.2 配置对象（UseActiveScrollOptions）

```typescript
interface UseActiveScrollOptions {
	root?: HTMLElement | null | React.RefObject<HTMLElement | null>
	jumpToFirst?: boolean
	jumpToLast?: boolean
	overlayHeight?: number
	minWidth?: number
	replaceHash?: boolean
	edgeOffset?: {
		first?: number
		last?: number
	}
	boundaryOffset?: {
		toTop?: number
		toBottom?: number
	}
}
```

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `root` | `HTMLElement \| null \| React.RefObject<HTMLElement \| null>` | `null` | 滚动容器。`null` 表示窗口/文档根。 |
| `jumpToFirst` | `boolean` | `true` | 是否在到达滚动区域顶部时强制激活第一个目标。 |
| `jumpToLast` | `boolean` | `true` | 是否在到达滚动区域底部时强制激活最后一个目标。 |
| `overlayHeight` | `number` | `0` | 顶部固定遮挡物高度。 |
| `minWidth` | `number` | `0` | 仅在视口宽度大于等于此值时启用监听。 |
| `replaceHash` | `boolean` | `false` | 是否在滚动过程中通过 `history.replaceState` 同步替换 URL hash。 |
| `edgeOffset.first` | `number` | `100` | 第一个目标的额外偏移。 |
| `edgeOffset.last` | `number` | `-100` | 最后一个目标的额外偏移。 |
| `boundaryOffset.toTop` | `number` | `0` | 向上滚动时的边界偏移。 |
| `boundaryOffset.toBottom` | `number` | `0` | 向下滚动时的边界偏移。 |

### 3.3 返回值（UseActiveScrollReturn）

```typescript
interface UseActiveScrollReturn {
	setActive: (target: string | HTMLElement) => void
	isActive: (target: string | HTMLElement) => boolean
	activeEl: HTMLElement | null
	activeId: string
	activeIndex: number
}
```

| 属性/方法 | 类型 | 说明 |
|-----------|------|------|
| `setActive(target)` | `(string \| HTMLElement) => void` | 用户点击目录链接时调用。 |
| `isActive(target)` | `(string \| HTMLElement) => boolean` | 判断给定 ID 或元素是否为当前激活目标。 |
| `activeEl` | `HTMLElement \| null` | 当前激活元素。 |
| `activeId` | `string` | 当前激活元素的 ID。 |
| `activeIndex` | `number` | 当前激活元素在排序后目标数组中的索引。 |

### 3.4 React 状态映射说明

- `activeEl`、`activeId`、`activeIndex`、`isScrollIdle`、`isScrollFromTarget`、`matchMedia` 使用 `useState` 或 `useRef` 维护。
- `targets.top` / `targets.bottom` 使用 `useRef` 维护（Map 不需要触发重渲染）。
- `prevScrollY` 使用 `useRef` 维护。
- `resizeObserver` 使用 `useRef` 维护。

---

## 4. 数据模型

### 4.1 内部状态

| 状态 | React 实现建议 | 说明 |
|------|---------------|------|
| `rootEl` | `useRef<HTMLElement>()` | 实际滚动容器。 |
| `isWindowRoot` | `useRef<boolean>()` 或派生 | 当前是否使用窗口/文档根滚动。 |
| `targets.els` | `useRef<HTMLElement[]>()` | 按文档位置排序后的目标元素数组。 |
| `targets.top` | `useRef<Map<string, number>>()` | 每个目标顶部相对于滚动根的偏移。 |
| `targets.bottom` | `useRef<Map<string, number>>()` | 每个目标底部相对于滚动根的偏移。 |
| `matchMedia` | `useState<boolean>()` | 当前视口宽度是否满足 `minWidth` 要求。 |
| `isScrollIdle` | `useState<boolean>()` | 滚动是否已停止。 |
| `isScrollFromTarget` | `useState<boolean>()` | 当前滚动是否由点击/hash 触发。 |
| `activeEl` | `useState<HTMLElement \| null>()` | 当前激活目标。 |
| `prevScrollY` | `useRef<number>()` | 上一次滚动位置。 |
| `clickStartY` | `useRef<number>()` | 点击触发滚动时的起始 Y 位置。 |

### 4.2 常量

```typescript
const FIXED_OFFSET = 10;
const SCROLLBAR_WIDTH = 17;
const IDLE_FRAMES = 20;
const MOUNT_IDLE_FRAMES = 10;

const defaultOptions: Required<UseActiveScrollOptions> = {
	root: null,
	jumpToFirst: true,
	jumpToLast: true,
	overlayHeight: 0,
	minWidth: 0,
	replaceHash: false,
	edgeOffset: { first: 100, last: -100 },
	boundaryOffset: { toTop: 0, toBottom: 0 },
};
```

---

## 5. 位置计算

### 5.1 当前滚动位置

```typescript
function getCurrentY(isWindowRoot: boolean, rootEl: HTMLElement) {
	return isWindowRoot ? window.scrollY : rootEl.scrollTop;
}
```

### 5.2 哨兵值

```typescript
function getSentinel(isWindowRoot: boolean, rootEl: HTMLElement) {
	return isWindowRoot
		? rootEl.getBoundingClientRect().top
		: -rootEl.scrollTop;
}
```

### 5.3 目标位置缓存（prepareTargets）

```typescript
function prepareTargets(
	userTargets: string[] | HTMLElement[],
	rootEl: HTMLElement,
	isWindowRoot: boolean,
	targetsRef: React.RefObject<TargetsCache>
) {
	let _targets: HTMLElement[] = [];

	if (userTargets[0] instanceof HTMLElement) {
		_targets = userTargets as HTMLElement[];
	}
	else {
		;(userTargets as string[]).forEach((id) => {
			const target = document.getElementById(id);
			if (target)
				_targets.push(target);
		});
	}

	_targets.sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top);

	targetsRef.current.els = _targets;

	const rootTop = rootEl.getBoundingClientRect().top - (isWindowRoot ? 0 : rootEl.scrollTop);

	targetsRef.current.top.clear();
	targetsRef.current.bottom.clear();

	_targets.forEach((target) => {
		const { top, bottom } = target.getBoundingClientRect();
		const id = target.id || Math.random().toString(36).slice(2, 11);
		targetsRef.current.top.set(id, top - rootTop);
		targetsRef.current.bottom.set(id, bottom - rootTop);
	});
}
```

### 5.4 边界检测

```typescript
function getEdges(rootEl: HTMLElement, isWindowRoot: boolean) {
	const clientHeight = isWindowRoot ? window.innerHeight : rootEl.clientHeight;
	const isTop = rootEl.scrollTop <= FIXED_OFFSET * 2;
	const isBottom = Math.abs(rootEl.scrollHeight - clientHeight - rootEl.scrollTop) <= 1;
	return { isTop, isBottom };
}
```

---

## 6. 激活判定算法

### 6.1 核心判定入口

```typescript
function setActive(
	prevY: number,
	isScrollCancel: boolean,
	state: InternalState,
	options: ResolvedOptions
): number {
	const nextY = getCurrentY(state.isWindowRoot, state.rootEl!);

	if (nextY < prevY) {
		onScrollUp(state, options);
	}
	else {
		onScrollDown(state, options, isScrollCancel);
	}

	return nextY;
}
```

### 6.2 向下滚动（onScrollDown）

```typescript
function onScrollDown(
	state: InternalState,
	options: ResolvedOptions,
	isScrollCancel: boolean = false
) {
	let firstOutEl: HTMLElement | null = options.jumpToFirst
		? state.targets.els[0]
		: null;

	const sentinel = getSentinel(state.isWindowRoot, state.rootEl!);
	const offset = FIXED_OFFSET + options.overlayHeight + options.boundaryOffset.toBottom;

	Array.from(state.targets.top).some(([_, top], idx) => {
		const _firstOffset = !options.jumpToFirst && idx === 0 ? options.edgeOffset.first : 0;

		if (sentinel + top < offset + _firstOffset) {
			firstOutEl = state.targets.els[idx];
			return false;
		}
		return true;
	});

	if (!options.jumpToLast && firstOutEl === last(state.targets.els)) {
		const lastBottom = last(Array.from(state.targets.bottom.values()));
		if (sentinel + lastBottom < offset + options.edgeOffset.last) {
			state.setActiveEl(null);
			return;
		}
	}

	const isNext
		= state.targets.els.indexOf(firstOutEl as HTMLElement)
		  > state.targets.els.indexOf(state.activeEl as HTMLElement);

	if (isNext || (firstOutEl && !state.activeEl)) {
		state.setActiveEl(firstOutEl);
	}
	else if (isScrollCancel) {
		state.setActiveEl(firstOutEl);
	}
}
```

### 6.3 向上滚动（onScrollUp）

```typescript
function onScrollUp(state: InternalState, options: ResolvedOptions) {
	let firstInEl: HTMLElement | null = options.jumpToLast
		? last(state.targets.els)
		: null;

	const sentinel = getSentinel(state.isWindowRoot, state.rootEl!);
	const offset = FIXED_OFFSET + options.overlayHeight + options.boundaryOffset.toTop;

	Array.from(state.targets.bottom).some(([_, bottom], idx) => {
		const _lastOffset
			= !options.jumpToLast && idx === state.targets.bottom.size - 1
				? options.edgeOffset.last
				: 0;

		if (sentinel + bottom > offset + _lastOffset) {
			firstInEl = state.targets.els[idx];
			return true;
		}
		return false;
	});

	if (!options.jumpToFirst && firstInEl === state.targets.els[0]) {
		const firstTop = state.targets.top.values().next().value;
		if (firstTop && sentinel + firstTop > offset + options.edgeOffset.first) {
			state.setActiveEl(null);
			return;
		}
	}

	const isPrev
		= state.targets.els.indexOf(firstInEl as HTMLElement)
		  < state.targets.els.indexOf(state.activeEl as HTMLElement);

	if (isPrev || (firstInEl && !state.activeEl)) {
		state.setActiveEl(firstInEl);
	}
}
```

### 6.4 边缘强制激活

```typescript
function onEdgeReached(state: InternalState, options: ResolvedOptions): boolean {
	if (!options.jumpToFirst && !options.jumpToLast)
		return false;

	const { isTop, isBottom } = getEdges(state.rootEl!, state.isWindowRoot);

	if (options.jumpToFirst && isTop) {
		state.setActiveEl(state.targets.els[0]);
		return true;
	}

	if (options.jumpToLast && isBottom) {
		state.setActiveEl(last(state.targets.els));
		return true;
	}

	return false;
}
```

### 6.5 初始化优先级

```typescript
if (!setFromHash(state) && !onEdgeReached(state, options)) {
	onScrollDown(state, options);
}
```

---

## 7. React 生命周期与事件对接

### 7.1 Hook 整体结构

```typescript
export function useActiveScroll(
	userTargets: Targets,
	options: UseActiveScrollOptions = {}
): UseActiveScrollReturn {
	const opts = useMemo(() => ({ ...defaultOptions, ...options }), [options]);

	const [activeEl, setActiveEl] = useState<HTMLElement | null>(null);
	const [isScrollIdle, setIsScrollIdle] = useState(false);
	const [isScrollFromTarget, setIsScrollFromTarget] = useState(false);
	const [matchMedia, setMatchMedia] = useState(() =>
		typeof window === "undefined"
			? false
			: window.matchMedia(`(min-width: ${opts.minWidth}px)`).matches
	);

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

	// activeId / activeIndex 派生
	const activeId = useMemo(() => activeEl?.id || "", [activeEl]);
	const activeIndex = useMemo(
		() => targetsRef.current.els.indexOf(activeEl as HTMLElement),
		[activeEl]
	);

	// ... effects 与 callbacks ...
}
```

### 7.2 root 解析

```typescript
useEffect(() => {
	const resolvedRoot
		= opts.root && "current" in opts.root ? opts.root.current : opts.root;

	if (resolvedRoot instanceof HTMLElement) {
		rootRef.current = resolvedRoot;
		isWindowRootRef.current = false;
	}
	else {
		rootRef.current = typeof document !== "undefined" ? document.documentElement : null;
		isWindowRootRef.current = true;
	}
}, [opts.root]);
```

### 7.3 初始化 Effect

```typescript
useEffect(() => {
	if (typeof window === "undefined")
		return;
	if (!rootRef.current)
		return;
	if (!matchMedia)
		return;

	const timer = window.setTimeout(() => {
		prepareTargets(resolveTargets(userTargets), rootRef.current!, isWindowRootRef.current, targetsRef);
		setResizeObserver();
		setMountIdle();
		addPrevNextListener();

		if (!setFromHash() && !onEdgeReached()) {
			onScrollDown();
		}
	}, 0);

	return () => {
		clearTimeout(timer);
		removePrevNextListener();
		destroyResizeObserver();
	};
}, [matchMedia, userTargets, opts.root]);
```

### 7.4 targets 与 root 变化监听

```typescript
useEffect(() => {
	if (!matchMedia || !rootRef.current)
		return;
	prepareTargets(resolveTargets(userTargets), rootRef.current, isWindowRootRef.current, targetsRef);
}, [userTargets, opts.root, matchMedia]);
```

### 7.5 主滚动监听注册

```typescript
useEffect(() => {
	if (typeof window === "undefined")
		return;
	if (!isScrollIdle || !matchMedia || !rootRef.current)
		return;
	if (resolveTargets(userTargets).length === 0)
		return;

	const rootEl = isWindowRootRef.current ? document : rootRef.current;
	const onScroll = () => {
		if (!isScrollFromTarget) {
			prevScrollYRef.current = setActive(prevScrollYRef.current, false);
			onEdgeReached();
		}
	};

	rootEl.addEventListener("scroll", onScroll, { passive: true });

	return () => {
		rootEl.removeEventListener("scroll", onScroll);
	};
}, [isScrollIdle, matchMedia, userTargets, isScrollFromTarget]);
```

### 7.6 动态事件监听（scroll cancel）

```typescript
useEffect(() => {
	if (typeof window === "undefined")
		return;
	if (!isScrollFromTarget)
		return;
	if (resolveTargets(userTargets).length === 0)
		return;

	const rootEl = isWindowRootRef.current ? document : rootRef.current!;

	const restoreHighlight = () => setIsScrollFromTarget(false);

	const onSpaceBar = (event: KeyboardEvent) => {
		if (event.code === "Space")
			restoreHighlight();
	};

	const onScrollCancel = (event: PointerEvent) => {
		const isAnchor = (event.target as HTMLElement).tagName === "A";
		if (!isAnchor) {
			const isFirefox = window.CSS.supports("-moz-appearance", "none");
			const containerWidth = isWindowRootRef.current
				? window.innerWidth
				: rootRef.current!.clientWidth;
			const isScrollbar = event.clientX >= containerWidth - SCROLLBAR_WIDTH;

			if (isFirefox || isScrollbar) {
				restoreHighlight();
				prevScrollYRef.current = setActive(clickStartYRef.current, true);
			}
		}
	};

	const events: Array<[string, EventListener, AddEventListenerOptions?]> = [
		["wheel", restoreHighlight, { once: true }],
		["touchmove", restoreHighlight, { once: true }],
		["keydown", onSpaceBar as EventListener, { once: true }],
		["scroll", setIdleScroll as EventListener, { passive: true, once: true }],
		["pointerdown", onScrollCancel as EventListener],
	];

	events.forEach(([e, cb, options]) => rootEl.addEventListener(e, cb, options));

	return () => {
		events.forEach(([e, cb]) => rootEl.removeEventListener(e, cb));
	};
}, [isScrollFromTarget, userTargets]);
```

### 7.7 resize / matchMedia

```typescript
useEffect(() => {
	if (typeof window === "undefined")
		return;

	const mql = window.matchMedia(`(min-width: ${opts.minWidth}px)`);
	const onChange = (event: MediaQueryListEvent) => setMatchMedia(event.matches);

	// modern API
	mql.addEventListener("change", onChange);
	setMatchMedia(mql.matches);

	return () => mql.removeEventListener("change", onChange);
}, [opts.minWidth]);
```

### 7.8 replaceHash

```typescript
useEffect(() => {
	if (!opts.replaceHash)
		return;

	const baseUrl = location.href.split("#")[0];
	const start = opts.jumpToFirst ? 0 : -1;
	const newHash = activeIndex > start ? `#${activeId}` : "";

	history.replaceState(history.state, "", `${baseUrl}${newHash}`);
}, [activeId, activeIndex, opts.replaceHash, opts.jumpToFirst]);
```

### 7.9 setActive 暴露方法

```typescript
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
	[activeId, activeEl]
);
```

---

## 8. TypeScript 类型定义

```typescript
export type Targets = string[] | HTMLElement[];

export interface UseActiveScrollOptions {
	root?: HTMLElement | null | React.RefObject<HTMLElement | null>
	jumpToFirst?: boolean
	jumpToLast?: boolean
	overlayHeight?: number
	minWidth?: number
	replaceHash?: boolean
	edgeOffset?: {
		first?: number
		last?: number
	}
	boundaryOffset?: {
		toTop?: number
		toBottom?: number
	}
}

export interface UseActiveScrollReturn {
	setActive: (target: string | HTMLElement) => void
	isActive: (target: string | HTMLElement) => boolean
	activeEl: HTMLElement | null
	activeId: string
	activeIndex: number
}

interface TargetsCache {
	els: HTMLElement[]
	top: Map<string, number>
	bottom: Map<string, number>
}

interface ResolvedOptions extends Required<UseActiveScrollOptions> {
	edgeOffset: Required<NonNullable<UseActiveScrollOptions["edgeOffset"]>>
	boundaryOffset: Required<NonNullable<UseActiveScrollOptions["boundaryOffset"]>>
}
```

---

## 9. 完整事件与生命周期流程（同通用版）

### 9.1 初始化流程

```text
1. 解析 options，合并默认值。
2. 解析 rootEl（未指定 -> 文档根）。
3. 初始化 matchMedia 状态。
4. 注册 matchMedia change 监听。
5. 若 matchMedia 为 true：
   a. 执行 prepareTargets() 缓存目标位置。
   b. 注册 ResizeObserver 监听 rootEl。
   c. 调用 setMountIdle() 设置滚动空闲状态。
   d. 注册 popstate 监听。
   e. 按优先级（hash > 边缘 > onScrollDown）设置初始激活目标。
6. 注册目标集合与 root 的变更监听，变化时重新 prepareTargets。
7. 注册 activeIndex 监听，replaceHash 为 true 时同步 URL hash。
```

### 9.2 滚动监听注册条件

主滚动监听器只在以下条件全部满足时注册：

- `isScrollIdle === true`
- `matchMedia === true`
- `rootRef.current` 已解析
- `targets` 非空

### 9.3 用户手动滚动流程

```text
1. 触发 scroll 事件。
2. isScrollFromTarget 为 false，进入普通判定。
3. setActive({ prevScrollY }) 判断方向并更新 activeEl。
4. onEdgeReached() 处理首尾边界。
5. prevScrollY 更新为当前位置。
```

### 9.4 点击/hash 触发滚动流程

```text
1. 用户点击目录链接，调用 setActive(targetId)。
2. 在目标集合中查找对应元素。
3. 若存在，设置 activeEl = target，并设置 isScrollFromTarget = true。
4. 浏览器/hash 导航执行滚动。
5. 由于 isScrollFromTarget 为 true，普通滚动算法被屏蔽。
6. 当检测到 wheel / touchmove / keydown(Space) / scroll / pointerdown 时恢复普通判定。
```

### 9.5 滚动空闲检测

```typescript
function setIdleScroll(maxFrames: number = IDLE_FRAMES) {
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
			return;
		}

		if (frameCount === maxFrames) {
			setIsScrollIdle(true);
			setIsScrollFromTarget(false);
			window.cancelAnimationFrame(rafId);
		}
		else {
			rafId = window.requestAnimationFrame(scrollEnd);
		}
	};

	rafId = window.requestAnimationFrame(scrollEnd);
}
```

### 9.6 Resize 处理

```typescript
function setResizeObserver() {
	if (resizeObserverRef.current)
		return;

	resizeObserverRef.current = new ResizeObserver(() => {
		if (!skipObserverCallbackRef.current) {
			prepareTargets(
				resolveTargets(userTargets),
				rootRef.current!,
				isWindowRootRef.current,
				targetsRef
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

	resizeObserverRef.current.observe(rootRef.current!);
}

function destroyResizeObserver() {
	resizeObserverRef.current?.disconnect();
	resizeObserverRef.current = null;
}
```

### 9.7 浏览器前进/后退（popstate）

```typescript
function onPrevNext(event: PopStateEvent) {
	const stateCurrent = event?.state?.current || "";
	if (!stateCurrent.includes("#") && activeEl) {
		setActiveEl(opts.jumpToFirst ? targetsRef.current.els[0] : null);
		return;
	}
	setFromHash();
}
```

### 9.8 销毁流程

```text
1. 移除 matchMedia change 监听。
2. 移除 popstate 监听。
3. 断开 ResizeObserver。
4. 移除主滚动监听与动态事件监听。
5. 清除所有 pending 的 setTimeout / requestAnimationFrame。
```

---

## 10. 特殊场景处理

### 10.1 滚动取消（Scroll Cancel）

已在 7.6 中描述。注意 pointerdown 事件需要持久监听直到下一次滚动完成。

### 10.2 宽度阈值（minWidth）

- 使用 `window.matchMedia('(min-width: {minWidth}px)')` 并通过 `addEventListener('change', ...)` 监听。
- matchMedia 变为 false 时：
  - `setActiveEl(null)`
  - 移除 popstate 监听
  - 断开 ResizeObserver
- matchMedia 变为 true 时：
  - 重新 prepareTargets
  - 重新注册 ResizeObserver 与 popstate
  - 按边缘 > onScrollDown 设置激活目标

### 10.3 SSR

- `typeof window === 'undefined'` 时直接返回默认状态。
- `setActive` / `isActive` 为空操作或返回 false。
- 服务端可默认高亮第一个目录项。

### 10.4 空目标集合

当 `targets` 为空数组时，不注册滚动监听，不执行判定，激活状态保持为 null。

### 10.5 Hash 同步（replaceHash）

已在 7.8 中描述。

---

## 11. 接口契约摘要

### 11.1 输入

| 输入 | 约束 |
|------|------|
| 目标 ID 数组 | 每个 ID 必须能在文档中通过 `getElementById` 找到对应元素。 |
| 目标元素数组 | 元素必须已挂载到 DOM，否则位置缓存不准确。 |
| root | 必须是可滚动容器，或为 null / 含 null 的 RefObject 表示窗口。 |
| overlayHeight | 非负整数，单位 px。 |
| boundaryOffset / edgeOffset | 整数，单位 px。 |

### 11.2 输出

| 输出 | 约束 |
|------|------|
| `activeEl` | 始终指向 `targets.els` 中的某个元素，或为 null。 |
| `activeId` | 为 `activeEl.id` 或空字符串。 |
| `activeIndex` | 为 `targets.els` 中的索引，未激活时为 `-1`。 |

### 11.3 调用方义务

1. 点击目录链接时**必须**调用 `setActive(target)`。
2. 若使用 hash 导航，需由 React Router 或浏览器负责实际滚动。
3. 若存在固定头部，应同时设置 `overlayHeight` 并在目标 CSS 中配置 `scroll-margin-top`。
4. 若使用 JS 动画库滚动，应在启动动画前调用 `setActive(target)`。

---

## 12. React 实现检查清单

- [ ] 创建 `useActiveScroll` Hook，接收 `targets` 与 `options`。
- [ ] 定义完整 TypeScript 类型并导出。
- [ ] 使用 `useState` 维护 `activeEl`、`isScrollIdle`、`isScrollFromTarget`、`matchMedia`。
- [ ] 使用 `useRef` 维护 `rootEl`、`targetsCache`、`prevScrollY`、`resizeObserver`。
- [ ] 使用 `useMemo` 派生 `activeId`、`activeIndex`、`resolvedOptions`。
- [ ] 使用 `useCallback` 封装 `setActive`、`isActive`。
- [ ] 使用 `useEffect` 处理挂载、卸载、targets/root 变化、matchMedia 变化、replaceHash 同步。
- [ ] 实现 `prepareTargets`、`getCurrentY`、`getSentinel`、`getEdges`。
- [ ] 实现 `onScrollDown`、`onScrollUp`、`onEdgeReached`、`setActive`、`setIdleScroll`。
- [ ] 注册 ResizeObserver 并在尺寸变化时重新判定。
- [ ] 实现点击触发后的动态事件监听与滚动取消恢复。
- [ ] 处理 SSR 安全访问（`typeof window` 判断）。
- [ ] 配置 `package.json`、`tsconfig.json`、构建工具（建议 Vite + rollup-plugin-dts）。
- [ ] 编写 React 组件测试（建议 React Testing Library + jsdom 或 Cypress Component Testing）。
