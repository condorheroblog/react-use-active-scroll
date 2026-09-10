# 统一阈值线渲染 & FixedHeader 改名 Overlay

## Context

playground 有两处独立诉求：

1. **阈值线渲染割裂**。当前存在三套互不一致的机制：
   - `components/ScanLine.tsx`（窗口滚动，已按 `tocData` 的 overlay/offset/edges 自动调整，`fixed` 定位）。
   - 容器页面里**写死在 10px** 的 sticky 触发线：`pages/vertical/Container.tsx`、`pages/horizontal/Container.tsx`、以及 `components/HorizontalSections.tsx` 的 `triggerLine` prop（被 horizontal Edges/Hash/Responsive 复用）。它们**不随** `tocData` 的 overlay/offset/edges 变化。
   - `pages/horizontal/EdgeBoundary.tsx` 内联重复实现的一套触发线（`absolute` overlay），逻辑与 ScanLine 重复。
   
   目标：抽出共享计算/渲染逻辑，让 ScanLine（窗口 `fixed`）与新的容器 overlay（`absolute`）都按 `tocData` 自动调整；用共享 overlay 替换所有写死 10px 的 sticky 触发线与 EdgeBoundary 内联线。

2. **FixedHeader 与源码参数对齐**。vertical 的 `FixedHeader` 演示的其实是 `overlay` 选项；horizontal 对应页已叫 `Overlay`。把 vertical 的文件/导出/路由/导航名/i18n 一并改为 `Overlay`，与源码参数 `overlay` 对齐。

核心包阈值基准已确认：`FIXED_OFFSET(10) + overlay + offset.toEnd/toStart`（`src/utils.ts:4`、`src/useActiveScroll.ts:176,223`），且**按容器 border-box 计量**（`src/utils.ts:195-208`：`rootStart = rootRect.left - rootScroll`，`rootRect` 为 `getBoundingClientRect()`）。因此 overlay 的 `left:pos`/`top:pos` 从容器 border-box 左/上缘算即可，**不要**补 padding（补 24px 会错位）。

---

## Request 1 — 阈值线全量统一

### 1. `components/ScanLine.tsx`（重构 + 新增 ContainerScanLine，同一文件）

- 抽出模块内私有共享逻辑（取自当前 ScanLine 第 47–100 行）：
  - `computeLines(tocData, t) → ThresholdLine[]`：`BASE = 10 + overlay`；`end = BASE+toEnd`、`start = BASE+toStart`；当 `edges.first !== true` 追加 `first = BASE+toEnd+edgeFirst`；当 `edges.last !== true` 追加 `last = BASE+toEnd-edgeLast`。label 带方向箭头。
  - `groupLines(lines) → Map<pos, ThresholdLine[]>`：同位置合并。
  - 内部 `renderLines(groups, { mode, horizontal, t })`：`mode ∈ 'fixed' | 'absolute'`。
    - through-line 的定位类按 `mode` 切换：`fixed` → `fixed top-0 bottom-0`（横）/ `fixed left-0 right-0`（纵）；`absolute` → `absolute top-0 bottom-0`（横）/ `absolute left-0 right-0`（纵）。
    - **offscreen（pos<0）标记牌也要按 mode 分支**（Plan agent 点 A）：`fixed` 模式沿用当前 `fixed top-[70px] left-0`（视口左缘）/顶部居中；`absolute` 模式改为 `absolute top-1 left-1`（容器左缘）/容器顶部，贴在 overlay 内。
    - **纵轴 label transform 按 mode 分支**（Plan agent 点 B）：`fixed` 模式保留 `-translate-y-1/2`（居中于线）；`absolute` 模式改为不居中（`top-1`/`left-1` 偏移），避免 `top:10` 的 label 上溢到容器外的说明 `<p>`。
- `ScanLine`：改为调用共享 `renderLines(..., { mode: 'fixed', horizontal, t })`；保留 `if (containerRef) return null`（窗口场景才渲染）。行为不变。
- 新增导出 `ContainerScanLine`：`if (!tocData?.containerRef) return null`；外层 `<div className="pointer-events-none absolute inset-0 z-20" aria-hidden>`；内部调用 `renderLines(groups, { mode: 'absolute', horizontal, t })`。

### 2. `components/HorizontalSections.tsx`

- 删除 `triggerLine` prop 及其 sticky 线（第 9–10、32–39 行）。
- 在滚动容器外包一层 `<div className="relative">`（**保持 block，不要 flex**——Plan agent 点 C），把 `<ContainerScanLine />` 作为滚动容器的**兄弟节点**放在 wrapper 内（`absolute inset-0` 覆盖容器 border-box）。`children`（EdgeBoundary 观察区）仍留在滚动容器**内**。

### 3. 容器页面：替换写死 sticky 线

- `pages/vertical/Container.tsx`：删除第 40–47 行 sticky 线；把滚动容器包进 `<div className="relative">`，加 `<ContainerScanLine />` 兄弟节点。
- `pages/horizontal/Container.tsx`：删除第 34–39 行 sticky 线；同样包 `relative` + `<ContainerScanLine />`。
- `pages/horizontal/Edges.tsx`、`pages/horizontal/Hash.tsx`、`pages/horizontal/Responsive.tsx`：去掉 `<HorizontalSections>` 上的 `triggerLine` prop（线由 HorizontalSections 内部自动提供）。

### 4. `pages/horizontal/EdgeBoundary.tsx` 简化

- 删除：`BASE`/`ThresholdLine`/`lines`/`groups` 计算（第 65–90 行）、外层 `<div className="relative">`（约第 116 行与第 172 行闭合）、整段内联 overlay（第 130–170 行）。
- 保留 `<HorizontalSections>` + 观察区 child（HorizontalSections 现自带按 tocData 自动调整的 overlay）。页面其余（extraControls 滑块、说明 `<Trans>`）不动。

### 5. `pages/horizontal/Overlay.tsx`

- 在既有 `<div className="relative">`（第 38 行）内、容器之后加 `<ContainerScanLine />`，让 `overlay:180` 的触发线（`left=190`）可见，落在面板右缘右侧。面板 `z-30` > overlay `z-20`，无冲突。

---

## Request 2 — FixedHeader → Overlay（vertical）

### 1. 新建 `pages/vertical/Overlay.tsx`（内容来自 `FixedHeader.tsx`）

- 导出 `Overlay`（原 `FixedHeader`）。
- 常量 `HEADER_HEIGHT` → `OVERLAY_HEIGHT`（值仍 60），与 horizontal `Overlay` 的 `OVERLAY_WIDTH` 命名一致。
- 顶部固定条文案：`t('common.fixedHeader', ...)` → `t('common.fixedOverlay', { px: OVERLAY_HEIGHT })`（该 key 已存在，horizontal 已在用）。
- 说明文案：`t('fixedHeader.desc', ...)` → `t('overlay.desc', { px: OVERLAY_HEIGHT })`。
- JSDoc 改为 "Overlay 页面 / Overlay page"，描述 overlay 选项（顶部固定条作为 overlay 的具体示例）。
- 删除 `pages/vertical/FixedHeader.tsx`。

### 2. `main.tsx`

- 导入：`import { Overlay } from './pages/vertical/Overlay'`（替换 `FixedHeader` 导入，第 8 行）。
- 路由：`{ path: 'overlay', element: <Overlay /> }`（原 `fixed-header` / `<FixedHeader />`，第 42 行）。

### 3. `pages/vertical/VerticalLayout.tsx`

- 导航项：`{ path: '/vertical/overlay', label: 'Overlay' }`（原 `/vertical/fixed-header` / `'FixedHeader'`，第 7 行）。

### 4. i18n（`i18n/zh.ts`、`i18n/en.ts`）

- 删 `common.fixedHeader`（重命名后无人使用）；保留 `common.fixedOverlay`（vertical+horizontal 共用）。
- 删 `fixedHeader` 命名空间；新增 `overlay` 命名空间，`overlay.desc` 沿用原 `fixedHeader.desc` 文案（顶部固定条 + overlay 选项说明）。

### 5. `pages/horizontal/HorizontalLayout.tsx`

- 注释 "FixedHeader 对应 Overlay"（第 21 行）改为：两组页面一一对应（均以 Overlay 命名）。

---

## 涉及文件清单

**Request 1**：`components/ScanLine.tsx`、`components/HorizontalSections.tsx`、`pages/vertical/Container.tsx`、`pages/horizontal/Container.tsx`、`pages/horizontal/EdgeBoundary.tsx`、`pages/horizontal/Overlay.tsx`、`pages/horizontal/Edges.tsx`、`pages/horizontal/Hash.tsx`、`pages/horizontal/Responsive.tsx`。

**Request 2**：新建 `pages/vertical/Overlay.tsx`、删 `pages/vertical/FixedHeader.tsx`、`main.tsx`、`pages/vertical/VerticalLayout.tsx`、`pages/horizontal/HorizontalLayout.tsx`、`i18n/zh.ts`、`i18n/en.ts`。

## 复用的既有逻辑

- 阈值计算取自 `ScanLine.tsx:47-100`（原 inline，抽出复用）。
- `FIXED_OFFSET=10` 基准来自 `src/utils.ts:4`。
- `common.fixedOverlay` i18n key 已存在，vertical Overlay 直接复用。

## 验证

1. `pnpm --filter playground typecheck`（或 playground 目录 `tsc --noEmit`），确认无类型错误。
2. `pnpm --filter playground dev`，逐页核查：
   - **vertical Container / horizontal Container**：容器左/上缘出现 `trigger line · 10px`（absolute overlay），随 tocData 变化（这两页无 offset/edges，固定 10，但已统一来源）。
   - **horizontal EdgeBoundary**：拖动 `edges.first/last`、`offset.toStart/toEnd` 滑块，overlay 内的触发线/首尾目标线随值实时移动（不再内联，来自 HorizontalSections 的 ContainerScanLine）；`edges.last` 较大时尾目标线负值 → 容器左缘出现 "◀ …（视口外左侧）" 标记。
   - **horizontal Edges/Hash/Responsive**：保留单触发线，来自 HorizontalSections，无 `triggerLine` prop。
   - **horizontal Overlay**：容器内出现 `→ trigger line · 190px` 线，落在 180px 面板右缘右侧。
   - **vertical Window / horizontal Window / vertical EdgeBoundary / vertical Edges**：ScanLine（fixed）行为不变，仍按 tocData 自动调整。
   - **vertical Overlay**（原 FixedHeader）：路由 `/vertical/overlay` 可达；顶部固定条文案为 "Fixed Overlay (overlay: 60px)"；说明文案来自 `overlay.desc`；导航显示 `Overlay`；`/vertical/fixed-header` 不再存在（404 或跳转）。
3. 语言切换中/英，确认 `overlay.desc`、`common.fixedOverlay` 两语种均正常。
