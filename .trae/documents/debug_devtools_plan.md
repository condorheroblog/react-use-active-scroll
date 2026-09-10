# 触发线 Devtools 集成到核心包 实现计划

## Repository Research

### 核心包现状

- 核心包是一个 **headless hook**：README 明确承诺 "What it doesn't do: Mutate the DOM or inject styles"，`package.json` 中 `"sideEffects": false`，构建仅 external `react`（**没有 external `react-dom`，不能用 createPortal**）。
- 构建：vite library mode（rolldown）+ `unplugin-dts` 打包类型，入口 `src/index.ts`，当前 `src` 全部为 `.ts`，但 tsconfig `jsx: preserve`、vite/esbuild 可直接编译 `.tsx`。
- 触发线位置完全由**归一化后的 options 推导**，与目标元素无关（playground `ScanLine.tsx` 已验证）：
  - 基线 `B = FIXED_OFFSET(10) + overlay`
  - 方向触发线：`B + offset.toEnd`（↓/→）、`B + offset.toStart`（↑/←）
  - 边缘线（仅 `edges.first/last !== true` 时存在）：
    - `onScrollToEnd`：first = `B + toEnd + first`，last = `B + toEnd - last`
    - `onScrollToStart`：first = `B + toStart + first`，last = `B + toStart - last`
  - 窗口滚动：触发线距**视口**轴起点边缘 N px（`position: fixed`）
  - 容器滚动：触发线距**容器 border-box** 轴起点 N px（需作为滚动容器兄弟节点放在 `position: relative` 包裹层内，`position: absolute`）
- playground 的 [ScanLine.tsx](file:///Users/david/i/react-use-active-scroll/playground/vite/components/ScanLine.tsx) 用 Tailwind 重新实现了这套可视化；它只画了 toEnd 方向的两条边缘线（toStart/toEnd 不同时信息不完整），位置重合的线会合并标签；`pos < 0` 时在轴起点显示 offscreen 标记牌。
- playground 中 `threshold.*` i18n key 仅被该组件消费（legacy 目录除外）。

### 设计取舍（结论）

1. **新增 option `debug` + 返回值新增 `devtools: ReactNode`**，而不是 hook 内部直接操作 DOM：hook 依然不碰 DOM，用户自己渲染 `{devtools}` 节点，保持 headless 承诺、无需 react-dom、SSR 安全。
2. 线计算（纯函数）与渲染分离，线计算可单测。
3. 边缘线**两个滚动方向都画**（最多 6 条），位置重合自动合并；默认 `toStart === toEnd === 0` 时视觉与 playground 当前 4 线完全一致；偏移不同时才展开，信息更完整。
4. **颜色全部走 CSS 变量（带 fallback，内联样式引用），不注入任何样式表**：
   - `--uas-debug-line`（方向触发线，默认 `#22d3ee`，虚线）
   - `--uas-debug-edge`（首尾边缘线，默认 `#f59e0b`，点线）
   - `--uas-debug-bg`（标签底色，默认 `#ffffff`）
   - `--uas-debug-z-index`（默认 `9999`）
   - 标签文字/边框颜色沿用对应线色。
5. 窗口/容器模式由 Devtools 组件根据归一化 `root` 自动判定（ref 场景用 state + effect 处理 `ref.current` 后置赋值）。
6. playground 迁移为消费核心 `devtools`，删除自带 ScanLine，并用主题 CSS 变量为核心变量赋色，作为真实联调验证。

## API 设计

```ts
// 新增 option
debug?: boolean | {
  /** 是否显示文字标签（方向/偏移量），默认 true */
  label?: boolean
  /** 覆盖层 wrapper 的附加 className，便于自定义定位/样式 */
  className?: string
}

// 返回值新增
devtools: React.ReactNode  // debug 关闭时为 null
```

用法：

```tsx
// 窗口滚动：fixed 定位，渲染在树中任意位置即可
const { activeId, devtools } = useActiveScroll(ids, { debug: true })
return <><main/>{devtools}</>

// 容器滚动：渲染在 relative 包裹层内、滚动容器的兄弟位置
<div style={{ position: 'relative' }}>
  <div ref={containerRef} style={{ overflow: 'auto' }}>{/* ... */}</div>
  {devtools}
</div>
```

标签文案（核心包无运行时 i18n，英文短标签）：`↓ trigger` / `↑ trigger` / `→ trigger` / `← trigger`；边缘线 `↓ first +200`、`↓ last −300`；重合线用 ` / ` 合并；末尾统一追加 `· {pos}px`；`pos < 0` 时在轴起点边缘显示 `▲/◀ {label} off-screen` 标记牌。

## Files and Modules

- `src/debug/lines.ts`（新增）：`DebugLine` 类型、`computeDebugLines(opts)` 纯函数（2 条方向线 + 至多 4 条边缘线，含 id/pos/label/kind/direction）、`groupLines()` 按 pos 合并。
- `src/debug/Devtools.tsx`（新增）：`Devtools` 组件。统一渲染一个 `pointer-events:none` 的 wrapper（窗口 `position:fixed;inset:0`，容器 `position:absolute;inset:0`），内部按纵/横方向渲染线与标签；offscreen 标记牌；所有颜色/层级用内联 `var(--uas-debug-*, fallback)`；支持 `label:false` 与 `className`。
- `src/types.ts`：新增 `DebugOptions` 类型；`UseActiveScrollOptions.debug`；`UseActiveScrollReturn.devtools: ReactNode`；`ResolvedOptions` 中 Omit `"debug"` 并声明归一化形态 `debug: false | { label: boolean; className: string }`。
- `src/utils.ts`：`defaultOptions.debug = false`；`resolveOptions` 中归一化（`undefined→false`、`true→{label:true,className:''}`、对象逐字段 `??`）。
- `src/useActiveScroll.ts`：`useMemo` 在 `opts.debug` 非 false 时 `createElement(Devtools, { root: opts.root, ...opts.debug, direction, overlay, edges, offset })`，返回值新增 `devtools`。hook 文件保持 `.ts`（用 `createElement`，不引入 JSX）。
- `src/index.ts`：导出 `DebugOptions` 类型。
- `vite.config.ts`：external 从 `["react"]` 改为同时排除 `react/jsx-runtime`（正则 `/^react(\/.*)?$/`），否则 Devtools.tsx 的 automatic JSX runtime 会被打进产物。
- `README.md`：Options 表新增 `debug` 行；Return Value 表新增 `devtools` 行；新增 "Debug overlay" 小节（窗口/容器两种挂载方式 + CSS 变量表）；"What it doesn't do" 中 "Mutate the DOM or inject styles" 补充 opt-in debug 例外说明。
- playground 迁移：
  - `DemoContext.tsx`：options 增加 `debug: true`，context 透传 `devtools`。
  - `PageLayout.tsx`：窗口场景渲染 context 中的 `devtools`，删除 `<ScanLine />`。
  - `Playground.tsx`：两个容器分支的 `.relative` 包裹层内用 context 的 `devtools` 替换 `<ContainerScanLine />`。
  - 删除 `components/ScanLine.tsx`；清理 `i18n/zh.ts`、`i18n/en.ts` 中仅它使用的 `threshold.*` 文案。
  - `styles.css`：`:root`（含暗色主题块）把核心变量接到主题色：`--uas-debug-line: var(--color-accent)`、`--uas-debug-edge: #f59e0b`、`--uas-debug-bg: var(--color-bg)`。

## Implementation Steps

1. `src/types.ts`：加 `DebugOptions`、option/return 字段、归一化类型（含 `ReactNode` 的 type import）。
2. `src/utils.ts`：默认值 + `debug` 归一化。
3. `src/debug/lines.ts`：移植并补全 playground 的纯计算逻辑（含 toStart 方向边缘线、重合合并）。
4. `src/debug/Devtools.tsx`：内联样式版本的渲染组件，CSS 变量全部带 fallback；窗口/容器自动判定；offscreen 标记。
5. `src/useActiveScroll.ts` + `src/index.ts`：接线、返回、导出类型。
6. `vite.config.ts`：修正 external 正则。
7. `README.md`：文档更新。
8. playground 迁移与清理（DemoContext / PageLayout / Playground / styles.css / i18n / 删 ScanLine）。
9. 全量验证（见下），浏览器中人工核对四种 direction × root 组合。

## Dependencies and Considerations

- 不引入 `react-dom`，不引入任何运行时依赖；组件代码进入主 chunk，但 `debug:false` 时只产出 `null`，且库本身极小。
- 所有样式内联，宿主无需 import CSS；颜色唯一可定制通道是 CSS 变量（用户明确要求）。
- 核心包运行时文案语言：英文 + 箭头符号，与现有零运行时文案风格一致；playground 原有中文阈值标签随之替换为符号化标签。
- 容器模式要求包裹层 `position: relative`，与 playground 现有 `ContainerScanLine` 约束一致，写入 README。
- Devtools wrapper 一律 `pointer-events:none` + `aria-hidden`，不影响布局（fixed/absolute 脱离文档流）。

## Validation

- `npm run typecheck`
- `npm run lint`
- `npm run build`（确认 `react/jsx-runtime` 未被打入 dist，产物中只 external react 系列）
- playground dev server 人工验证：
  - 纵向/横向 × 窗口/容器 四形态下方向线位置与实际激活切换一致；
  - edges 数字模式下 4 条边缘线位置正确；toStart/toEnd 不同时 6 线展开；
  - 负偏移 offscreen 标记牌；明/暗主题颜色；标签与配置实时联动；
  - 切容器/窗口、切方向后 wrapper 定位模式正确。

## Risks

- **JSX runtime 被打包**：通过步骤 6 的 external 正则规避，build 后检查产物 import 语句确认。
- **ref 形式 root 晚挂载导致模式误判**：Devtools 内 mount effect 重新解析 root 并 setState；options 变化时 memo 重建节点、effect 重跑。
- **fixed wrapper 遮挡页面**：wrapper 与线全部 `pointer-events:none`，无事件拦截；z-index 走变量可调。
- **playground 删组件后视觉差异**：窗口纵向标签由"max-w-7xl 右对齐"改为视口右缘对齐、窗口横向标签由 top:70px 改为贴顶（app 特有避让逻辑不进入通用库）；属预期，必要时用 `className` 在 playground 侧微调。
