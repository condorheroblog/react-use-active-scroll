# vitest 测试方案设计：react-use-active-scroll

## Summary

为 `src/`（4 个文件：`types.ts` / `utils.ts` / `useActiveScroll.ts` / `index.ts`）建立完整测试体系：基于 **jsdom + 几何模拟**（确定性高、CI 友好），新增 `vitest.config.ts`、`tests/` 目录（setup + 3 个 helper 模块 + 5 个测试文件，约 60 个用例），覆盖 utils 纯函数单测与 Hook 全特性集成测试。

## Current State Analysis

- `package.json` 已有 `"test": "vitest"` 和 `vitest@^4.1.11`，但：**无 vitest.config.ts**（vitest 会读到根 `vite.config.ts` 的 lib 构建 + dts 插件配置，不适合跑测试）、**无 tests 目录**、**无 jsdom / @testing-library/react / react-dom 依赖**。
- Hook 重度依赖浏览器 API，jsdom 均缺失或不可用：
  - `window.matchMedia`（jsdom 未实现，需 stub）
  - `ResizeObserver`（未实现，需 stub）
  - `requestAnimationFrame`（vitest jsdom 默认 `pretendToBeVisual` 可用，但不可控——idle 检测需要连续 10/20 帧位置不变，必须换成手动帧队列）
  - `getBoundingClientRect`（jsdom 恒返回全 0，必须 mock）
  - 滚动属性（`scrollTop` 可直接赋值不 clamp；`scrollHeight`/`clientHeight`/`window.scrollY`/`innerHeight` 是 getter，需 spy/defineProperty）
  - `window.CSS`（jsdom 无，`onScrollCancel` 的 Firefox 分支用到 `CSS.supports`）
- CI（`.github/workflows/publish.yml`）只部署 playground，不跑测试，无需改动。
- `pnpm-workspace.yaml` 以根目录为包，安装根依赖需 `-w`。

## 核心洞察：统一触发公式（用例数值设计的依据）

推导自 `onScrollToEnd`（`sentinel + startPos < offset`，`offset = FIXED_OFFSET(10) + overlay + toEnd`）：

- **向下滚动**：`scrollPos > targetTop - offset` 时该目标激活（取最后一个满足者）
- **向上滚动**：`scrollPos < targetEnd - offset` 时该目标激活（取第一个满足者）
- **窗口根的坑**：`sentinel = documentElement.getBoundingClientRect().top = -scrollPos`，rect mock 是静态的，所以 **mock 必须动态跟随 scrollPos**（`fixture.setScrollPos` 同步更新 docEl 的 rect 和 `scrollY` spy）。容器根无此问题（`sentinel = -el.scrollTop` 自动跟随，section rect 静态 mock 即可）。

## Proposed Changes

### 1. 依赖与配置

**安装依赖**（注意：`@testing-library/react` 的 peer 依赖 `react-dom` 目前缺失，必须一起装）：

```bash
pnpm add -D -w jsdom @testing-library/react react-dom
```

版本：`@testing-library/react@^16`（React 19 兼容）、`react-dom` 与现有 `react@19.2.8` 同 minor（`^19.2.8`）。

**新建 `vitest.config.ts`**（根目录；vitest 优先级高于 `vite.config.ts`，不会加载 dts 插件）：

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		environment: "jsdom",
		setupFiles: ["./tests/setup.ts"],
		include: ["tests/**/*.test.{ts,tsx}"],
	},
});
```

`tsconfig.json` 不改（`include: ["src"]`）：测试用显式 `import { describe, it, expect } from "vitest"`，无需 globals 类型；`pnpm typecheck` / `pnpm build` 不受影响。`package.json` 的 test 脚本已是 `vitest`，无需改动。

### 2. 目录结构

```
tests/
├── setup.ts                            # 全局 stub + cleanup 注册
├── helpers/
│   ├── env.ts                          # matchMedia / ResizeObserver / rAF / CSS stubs
│   ├── geometry.ts                     # rect / 滚动几何 mock 工具
│   └── fixture.ts                       # DOM 夹具 + 挂载 + 滚动模拟
├── utils.test.ts                       # 纯函数单测
├── use-active-scroll.init.test.ts      # 初始化行为
├── use-active-scroll.scroll.test.ts    # 滚动判定（含容器 root）
├── use-active-scroll.api.test.ts       # setActive/isActive/hash/popstate/用户干预
└── use-active-scroll.horizontal.test.ts# 水平方向
```

### 3. 基础设施层

**`tests/setup.ts`**：

- `beforeEach` 中 stub：rAF（手动队列）、matchMedia、ResizeObserver、`CSS = { supports: () => false }`
- `afterEach`：`vi.unstubAllGlobals()`、`vi.restoreAllMocks()`、`cleanup()`（从 `@testing-library/react` 显式导入注册，globals:false 时 RTL 不自动清理）、`history.replaceState(null, "", location.pathname)` 重置 hash
- `document.body.innerHTML = ""` 清理夹具 DOM

**`tests/helpers/env.ts`**：

```ts
// rAF：手动帧队列（核心）
export function advanceFrames(count: number): void;
// 每帧 drain 当前队列并同步执行回调（回调内部再注册的进入下一帧），
// 调用方需包在 act() 中，因为会触发 setState

// matchMedia：可变 matches + change 监听注册表
export function setMediaMatches(v: boolean): void;
export function triggerMediaChange(): void; // 触发 useSyncExternalStore 订阅回调

// ResizeObserver：实例收集，支持手动触发
export function getResizeObservers(): MockResizeObserver[];
// MockResizeObserver { observe/unobserve/disconnect 空实现, trigger() 调用构造回调 }
```

**`tests/helpers/geometry.ts`**：

```ts
export function setRect(el: HTMLElement, rect: Partial<DOMRect>): void;
// vi.spyOn(el, "getBoundingClientRect").mockReturnValue({ 全 0 + 传入字段 })

export function defineScroll(el: HTMLElement, props: {
	scrollTop?: number; scrollLeft?: number;
	scrollHeight?: number; scrollWidth?: number;
	clientHeight?: number; clientWidth?: number;
}): void;
// Object.defineProperty(el, key, { value, configurable: true })

// 窗口几何：spyOn getter
export function mockWindowScroll(pos: number): void;   // scrollY/scrollX + docEl rect 动态联动见 fixture
export function mockViewport(w: number, h: number): void;
```

**`tests/helpers/fixture.ts`**：

```ts
export interface SectionSpec { id: string; start: number; size: number } // start=top(纵向)/left(横向)

export interface Fixture {
	targets: string[];        // 传给 hook 的 id 数组
	els: HTMLElement[];        // 排序前的原始元素数组（乱序可用于排序用例）
	rootEl: HTMLElement;      // 容器场景的滚动根；窗口场景为 documentElement
	setScrollPos(pos: number): void;   // 窗口根：scrollY spy + docEl rect.top=-pos + docEl.scrollTop=pos
	                                   // 容器根：直接赋值 el.scrollTop/scrollLeft
	dispatchScroll(): void;   // 在实际监听的元素上派发 scroll 事件（窗口根在 document 上）
}

export function createFixture(opts: {
	direction?: "vertical" | "horizontal";       // 默认 vertical
	root?: "window" | HTMLElement | { current: HTMLElement | null }; // 默认 "window"
	sections: SectionSpec[];
	contentSize?: number;   // 默认 sections 末端 + 800
	viewport?: { width?: number; height?: number }; // 默认 1024×800
}): Fixture;

// renderHook 包装：创建 fixture → mock 几何 → renderHook → flush 初始化
export async function mountHook(opts: {...同上}, hookOptions?: UseActiveScrollOptions): Promise<{
	result: RenderHookResult...; fixture: Fixture; unmount: () => void;
}>;
// flush 流程（mount 的 setTimeout(0) 用真实 timer）：
//   await act(async () => { await new Promise(r => setTimeout(r, 0)); });
//   act(() => advanceFrames(11));   // MOUNT_IDLE_FRAMES=10，多给 1 帧 → isScrollIdle=true → scroll 监听挂上
```

### 4. 默认夹具几何（决策完备的数值表）

垂直 + 窗口根（viewport 800 高，scrollHeight 2800）：

| section | top | height | end |
|---|---|---|---|
| s1 | 0 | 500 | 500 |
| s2 | 500 | 500 | 1000 |
| s3 | 1000 | 500 | 1500 |
| s4 | 1500 | 500 | 2000 |

默认 `offset=10` 时的预期行为（写用例断言直接引用）：

| scrollPos | 激活 | 依据 |
|---|---|---|
| 0 | s1 | 初始（edges.first=true；也是向下判定的自然结果） |
| 500 | s2 | `500 > 500-10` |
| 1000 | s3 | |
| 1500 | s4 | |
| 2000 | s4 | isEnd（`|2800-800-2000|=0 ≤ 1`）强制最后一个 |
| 1000 → 480 回滚 | s2 → s1 | 向上：`480 < 500-10=490` → s1 |

水平夹具同构：容器宽 600、sections 宽 500、left 间隔 500（判定公式相同，`scrollLeft > left_k - 10`）。

### 5. 测试用例清单

**`utils.test.ts`**（纯函数，直接调用，无需 fixture）：

- `resolveOptions`：空对象全默认；逐字段覆盖；`edges.first/last` 的 `false→0`、`undefined→true`、数字保留；`offset` 数字拆分 `{toStart,toEnd}` / 对象部分传入缺省 0；**显式 `undefined` 字段不覆盖默认值**（回归用例：minWidth: undefined 必须解析为 0，此前出过真实 bug）
- `resolveTargets`：`string[]` → getElementById 映射并过滤 null；`HTMLElement[]` → 返回新数组（不相等引用）；Ref → 递归解析 current；Ref.current 为 null → `[]`；空数组 → `[]`
- `last`：普通/空数组（undefined）
- `isRefObject`：ref 对象 true；null/数组/无 current 对象 false
- `getCurrentPos` / `getSentinel` / `getEdges`：vertical×horizontal × 窗口×容器 共 4 组合各 2-3 断言（start/end/中间；isStart 阈值 `≤ FIXED_OFFSET*2`、isEnd 容差 `≤1`）
- `prepareTargets`：乱序传入按 top 排序；start/end map 数值（`rect.top - rootStart`）；无 id 元素生成随机 key 且两个无 id 元素 key 不同；horizontal 用 left/right

**`use-active-scroll.init.test.ts`**：

- 默认配置：挂载后 `activeId === "s1"`、`activeIndex === 0`
- URL hash 预设 `#s3`：初始激活 s3（renderHook 前 `replaceState` 设置）
- hash 指向不存在于 targets 的 id：回退到 edges 判定 → s1
- `edges: { first: false }`（=0）：初始无元素越过触发线 → `activeEl === null`、`activeIndex === -1`
- `minWidth` 不满足（`setMediaMatches(false)`）：不初始化，`activeId === ""`
- 动态响应：初始 matches=false，`triggerMediaChange()` 切 true → 完成初始化激活 s1
- unmount 后再派发 popstate/scroll：无副作用不报错（清理逻辑）

**`use-active-scroll.scroll.test.ts`**：

- 向下滚动逐段激活：s1 → (500) s2 → (1000) s3 → (1500) s4（数值表）
- 向上滚动回退：s4 ← (480) s1 等
- 滚到顶（`scrollPos ≤ 20`）强制 s1；滚到底（isEnd）强制 s4
- `edges.first` 为数字（如 100）：顶部尚未越过提前量 → null；越过后激活 s1
- `edges.last` 为数字：末尾越过触发线后 → null（按 `end` map 末值设计数值）
- `offset` 数字 / `{ toStart, toEnd }` 对象：触发线平移，验证偏移生效
- `overlay`：等效于 offset 增量，验证触发线 = 10 + overlay
- **容器 root**（`root: HTMLElement` 及 `root: { current: el }` 两种传入）：div 容器 + `overflow`，scroll 事件在容器上派发，同样数值表验证
- `renderHook` rerender 换 targets：prepareTargets 重算（新 section 激活）

**`use-active-scroll.api.test.ts`**：

- `setActive("s2")` / `setActive(el)`：`activeId`/`activeIndex`/`activeEl` 更新
- `isActive`：字符串 id / 元素引用 / 非激活目标 false
- `setActive` 不存在的 id：状态不变
- `setActive` 后屏蔽普通滚动判定：手动滚动越过 s3 触发线 + dispatchScroll → 仍激活 s2
- 用户干预恢复：`wheel` 事件（`{ once: true }`）→ 恢复后 scroll → 正常判定
- `keydown Space`（`new KeyboardEvent("keydown", { code: "Space" })`）恢复
- `pointerdown` 点在滚动条区域（`clientX ≥ containerSize - 17`）恢复；点在内容区不恢复（需 `CSS.supports` stub 为 false 走非 Firefox 分支）
- hash 同步：`hash: "replace"` → 滚到 s2 后 `location.hash === "#s2"` 且 `history.replaceState` 被调用（spy）；注意 s1（index 0，edges.first=true）对应 hash 为空串
- `hash: "push"` → `pushState` spy 调用；`hash: "off"`（默认）→ hash 恒为 ""
- popstate：`replaceState` 到 `#s2` + `dispatchEvent(new PopStateEvent("popstate"))` → 激活 s2；back 到无 hash → `edges.first=true` → 重置为 s1
- ResizeObserver：修改某 section 的 rect mock → `getResizeObservers()[0].trigger()` + `act(advanceFrames(1))` → 激活按新几何重算

**`use-active-scroll.horizontal.test.ts`**：

- 水平 + 窗口根：`scrollX`/docEl rect.left 动态联动，数值表同构验证 s1→s4
- 水平 + 容器 root：`scrollLeft` 赋值 + 容器上派发 scroll
- 水平 `edges` 首尾强制（isStart/isEnd 横向分支）

## Assumptions & Decisions

1. **环境选 jsdom + 模拟几何**（用户跳过提问，采用推荐项）：快、确定性、无浏览器依赖；代价是 helper 层的 mock 成本，集中在 3 个 helper 文件里，测试文件保持干净。
2. **覆盖范围：全覆盖**（utils + Hook 全特性）。
3. **rAF 用手动队列而非 fake timers**：idle 检测是"连续 N 帧位置不变"的时序逻辑，手动 `advanceFrames` 最确定；mount 的 `setTimeout(0)` 用真实 timer + microtask flush。
4. `advanceFrames` 内部触发 setState，调用处统一包 `act`（从 `react` 导入）。
5. `sentinel` 动态 mock（窗口根的 docEl rect 跟随 scrollPos）是窗口场景正确性的关键，在 `fixture.setScrollPos` 内闭环处理。
6. tsconfig 不加 `tests`：保持 `pnpm typecheck` / `pnpm build`（内含 tsc --noEmit）不受测试代码影响；测试文件用显式 import，编辑器类型正常。
7. 不改 CI workflow（现有 workflow 只管 playground 部署）；后续如需 PR 检查可另加，不在本次范围。
8. 测试代码需过现有 `@antfu/eslint-config`（`pnpm lint`），写完跑一次 `pnpm lint:fix`。

## Verification

1. `pnpm add -D -w jsdom @testing-library/react react-dom` 安装成功
2. `pnpm test`（vitest watch 模式下用 `vitest run` 一次性验证）：5 个测试文件全绿，预期 55-65 个用例
3. `pnpm typecheck`、`pnpm lint` 不因新增文件报错
4. 抽查关键回归：`resolveOptions` 显式 undefined 用例、hash 初始激活用例、向下滚动数值表用例
