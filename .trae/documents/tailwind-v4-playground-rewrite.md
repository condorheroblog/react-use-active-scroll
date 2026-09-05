# 使用 Tailwind CSS v4 重写 Vite Playground 计划

## 1. 摘要

将 `/Users/david/i/react-use-active-scroll/playground/vite` 从单一深色 CSS 变量方案迁移到 **Tailwind CSS v4**（CSS-first 配置），实现：

1. 明亮 / 暗黑极简主题，支持手动切换与系统偏好联动。
2. 移动端与 PC 端自适应布局。
3. 演示示例覆盖 `src` 中 `useActiveScroll` 的所有配置项与返回值，每个示例保持“小而全”。

## 2. 当前状态分析

### 2.1 源码能力清单（`/Users/david/i/react-use-active-scroll/src`）

- 核心导出：`useActiveScroll` Hook + 4 个类型。
- `UseActiveScrollOptions` 全部选项：
  - `root`：滚动容器（`window/document` 或 `HTMLElement/RefObject`）。
  - `jumpToFirst` / `jumpToLast`：首尾强制激活。
  - `overlayHeight`：顶部固定遮挡高度。
  - `minWidth`：响应式开关阈值。
  - `replaceHash`：同步 URL hash。
  - `edgeOffset.first` / `edgeOffset.last`：边缘目标偏移。
  - `boundaryOffset.toTop` / `boundaryOffset.toBottom`：滚动边界偏移。
- 返回值：`setActive`、`isActive`、`activeEl`、`activeId`、`activeIndex`。

### 2.2 Playground 现状

- 路由：4 个页面（`Window` / `Container` / `FixedHeader` / `Sections`）。
- 样式：单文件 `styles.css`，仅深色主题，无 Tailwind。
- 缺失：未演示 `jumpToFirst`、`jumpToLast`、`minWidth`、`edgeOffset`、`boundaryOffset` 等选项，也未集中展示 `activeEl/activeId/isActive` 等返回值。
- 响应式：仅有一个简单断点，移动端侧边栏体验一般。

## 3. 总体改造策略

### 3.1 依赖升级

- 移除现有样式方案依赖（无）。
- 安装 Tailwind CSS v4 与 Vite 插件：
  - `tailwindcss@^4.0.0`
  - `@tailwindcss/vite@^4.0.0`
- 保持 React 19、React Router 8、`animated-scroll-to` 不变。

### 3.2 样式体系

- 在 `styles.css` 中使用 Tailwind v4 的 `@import "tailwindcss"` 与 `@theme` 定义设计令牌。
- 极简风：
  - 颜色仅保留 `bg`、`fg`、`muted`、`accent`、`border`、`card`。
  - 大留白、无阴影或仅极淡阴影、圆角统一为 `--radius-sm/md`。
  - 字体使用系统字体栈。
- 主题切换：
  - 通过 `<html class="dark">` 或 `<html class="light">` 控制。
  - 默认读取 `prefers-color-scheme`。
  - Header 提供太阳 / 月亮切换按钮，状态持久化到 `localStorage`。

### 3.3 响应式策略

- PC：顶部固定导航 + 右侧 sticky 目录侧边栏 + 主内容区。
- 移动端（`< md`）：
  - 目录侧边栏隐藏。
  - 主内容区全宽。
  - 提供悬浮目录按钮，点击后从右侧滑出抽屉（Drawer）。
  - 导航栏变为可横向滚动或折叠为汉堡菜单（保持简单，使用横向滚动即可）。

### 3.4 示例重构

目标：每个示例页面只聚焦 1~2 个能力，代码行数少，但能完整展示对应选项 / 返回值。

计划页面：

| 路由 | 页面 | 覆盖能力 |
|------|------|----------|
| `/` | `Basic` | `window` 根滚动、`replaceHash`、`activeId` / `activeIndex` / `isActive` 可视化展示。 |
| `/container` | `Container` | 自定义 `root`（`RefObject`）。 |
| `/fixed-header` | `FixedHeader` | `overlayHeight` + 固定头部场景。 |
| `/edge-boundary` | `EdgeBoundary` | `edgeOffset` + `boundaryOffset`。 |
| `/jump-toggles` | `JumpToggles` | `jumpToFirst` + `jumpToLast` 开关对比。 |
| `/responsive` | `Responsive` | `minWidth` 在不同宽度下自动启用 / 禁用。 |
| `/api-showcase` | `ApiShowcase` | 所有返回值（`activeEl`、`activeId`、`activeIndex`、`isActive`、`setActive`）集中演示。 |

说明：
- 旧路由 `fixedheader`、`sections` 合并 / 升级为更聚焦的示例。
- 每个页面使用统一的 `PageShell`，仅传入不同参数。
- `DemoControls` 保留为全局控制面板（`scrollBehavior`、`clickType`），并在需要时增加局部选项开关（如 `jumpToFirst` 的 checkbox）。

## 4. 文件级改动清单

### 4.1 新增依赖

文件：`/Users/david/i/react-use-active-scroll/playground/vite/package.json`

- `devDependencies` 新增：
  - `@tailwindcss/vite`
  - `tailwindcss`

### 4.2 Vite 配置

文件：`/Users/david/i/react-use-active-scroll/playground/vite/vite.config.ts`

- 导入 `@tailwindcss/vite` 并加入 `plugins` 数组。
- 保留 `react-use-active-scroll` alias 不变。

### 4.3 全局样式与主题

文件：`/Users/david/i/react-use-active-scroll/playground/vite/styles.css`

- 替换为 Tailwind v4 CSS-first 入口：
  ```css
  @import "tailwindcss";

  @theme {
    --color-bg: #ffffff;
    --color-fg: #171717;
    --color-muted: #737373;
    --color-accent: #2563eb;
    --color-accent-soft: rgba(37, 99, 235, 0.08);
    --color-border: #e5e5e5;
    --color-card: #fafafa;
    --radius-sm: 0.375rem;
    --radius-md: 0.5rem;
    --font-sans: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }

  .dark {
    --color-bg: #0a0a0a;
    --color-fg: #fafafa;
    --color-muted: #a3a3a3;
    --color-accent: #60a5fa;
    --color-accent-soft: rgba(96, 165, 250, 0.12);
    --color-border: #262626;
    --color-card: #171717;
  }
  ```
- 仅保留少量自定义 CSS（如滚动条微调、section 的 `scroll-margin-top` 等），其余全部用 Tailwind 工具类替代。

### 4.4 主题切换 Hook

文件：`/Users/david/i/react-use-active-scroll/playground/vite/hooks/useTheme.ts`

- 读取 `localStorage` 主题与系统偏好。
- 返回 `[theme, toggleTheme]`。
- 在 `useEffect` 中同步到 `<html>` 的 `class`。

### 4.5 Header 组件

文件：`/Users/david/i/react-use-active-scroll/playground/vite/components/Header.tsx`

- 使用 Tailwind 工具类重写。
- 新增主题切换按钮（太阳 / 月亮图标，使用内联 SVG，不引入图标库）。
- 导航链接改为在移动端可横向滚动，PC 端正常显示。
- 在需要固定头部的页面，Header 仍然支持 `.FixedHeader` 行为，但改用 Tailwind 的 `fixed` / `sticky` 类控制。

### 4.6 布局组件

#### `components/PageLayout.tsx`

- 主内容区与侧边栏使用 Tailwind grid / flex 实现。
- PC：`grid-cols-[1fr_220px]`，侧边栏 `sticky top-16`。
- 移动端：`grid-cols-1`，隐藏侧边栏，提供悬浮目录按钮。

#### `components/Sidebar.tsx`

- 保持目录容器职责。
- 支持 `className` 注入，用于桌面 / 移动端抽屉复用。

#### `components/TOC.tsx`

- 使用 Tailwind 工具类重写。
- Tracker 高亮块改为 Tailwind 的 `absolute`、`translate-y`、`transition-transform`。
- 保持 `useActiveScroll` 调用逻辑。

#### `components/ScanLine.tsx`

- 改为极简虚线 + 标签，使用 Tailwind 定位与颜色。

#### `components/DemoControls.tsx`

- 使用 Tailwind 重写按钮、单选组。
- 新增局部选项插槽，供需要额外开关的页面使用。

### 4.7 页面组件

所有页面使用统一的 `PageShell` 注入 `TOCDataContext` 与 `DemoButtonsContext`。

#### `pages/Basic.tsx`（原 `Window`）

- 展示默认 `window` 根滚动。
- 在内容区顶部展示当前 `activeId` / `activeIndex` / `isActive(section-1)` 等实时状态。
- 开启 `replaceHash: true`。

#### `pages/Container.tsx`

- 自定义 `root={containerRef}`。
- 容器限定高度并带滚动条，内部包含 `ScanLine`。

#### `pages/FixedHeader.tsx`

- Header 固定，`overlayHeight: 60`。
- 展示 `scroll-margin-top` 与激活阈值线。

#### `pages/EdgeBoundary.tsx`

- 提供滑动条 / 数字输入，动态调整 `edgeOffset` 与 `boundaryOffset`。
- 实时观察第一个 / 最后一个 section 的激活时机变化。

#### `pages/JumpToggles.tsx`

- 提供 `jumpToFirst` 与 `jumpToLast` 开关。
- 页面内容刻意做到“不到顶 / 不到底”也能看出差异。

#### `pages/Responsive.tsx`

- 设置 `minWidth: 768`。
- 在窄屏下禁用 Hook，目录不显示高亮；宽屏启用。
- 提示用户调整窗口宽度观察变化。

#### `pages/ApiShowcase.tsx`

- 展示 `setActive`（按钮直接跳转）、`isActive`（每个 section 边框高亮）、`activeEl`（打印标签名）、`activeId`、`activeIndex`。

### 4.8 类型与工具

文件：`/Users/david/i/react-use-active-scroll/playground/vite/types.ts`

- 补充页面级别的新类型（如 `EdgeBoundaryOptions`）。

文件：`/Users/david/i/react-use-active-scroll/playground/vite/hooks/useFakeData.ts`

- 保持数据生成逻辑，调整移动端文本长度策略，继续使用 `matchMedia`。

### 4.9 路由入口

文件：`/Users/david/i/react-use-active-scroll/playground/vite/main.tsx`

- 更新路由表，加入新页面：
  - `/`
  - `/container`
  - `/fixed-header`
  - `/edge-boundary`
  - `/jump-toggles`
  - `/responsive`
  - `/api-showcase`

### 4.10 App 根组件

文件：`/Users/david/i/react-use-active-scroll/playground/vite/App.tsx`

- 引入 `useTheme` 并同步到 `<html>`。
- 保持 `DemoRadiosContext` 提供全局滚动行为控制。

## 5. 设计决策与假设

1. **Tailwind v4 使用 CSS-first 配置**：通过 `@theme` 定义颜色，避免 `tailwind.config.js`，符合 v4 推荐做法。
2. **主题切换使用 class 模式**：`html.light` / `html.dark`，而不是 `prefers-color-scheme` 单独控制，便于用户手动切换并持久化。
3. **不引入图标库**：主题按钮使用内联 SVG，保持依赖最小化。
4. **保留 `animated-scroll-to`**：用于 `custom` 点击滚动演示，保持与源码包的能力一致。
5. **移动端目录抽屉使用 CSS transform**：不引入第三方 UI 库，保持极简。
6. **示例“小而全”的定义**：每个路由只聚焦 1~2 个配置项或返回值，页面 DOM 不超过 2~3 个 section，避免信息过载。
7. **继续使用 React Router 8**：当前项目已使用，无需替换。
8. **保持 alias 导入源码**：`vite.config.ts` 与 `tsconfig.json` 中的 `react-use-active-scroll` alias 不变，便于开发时直接验证源码改动。

## 6. 验证步骤

1. 安装依赖后运行 `pnpm install`（或 `npm install` / `yarn`）。
2. 运行 `pnpm dev`，确认 Vite 正常启动且无 Tailwind 相关报错。
3. 检查所有页面：
   - 路由跳转正常。
   - 每个页面均包含可点击目录与内容区。
   - 滚动时目录高亮跟随。
4. 主题切换：
   - 点击 Header 主题按钮，页面立即切换明暗。
   - 刷新后主题保持。
5. 响应式：
   - 浏览器宽度 < 768px 时，侧边栏隐藏，出现悬浮目录按钮。
   - 点击按钮后目录抽屉滑出。
6. 功能覆盖验证：
   - `Container` 页面：滚动仅在容器内生效，window 不滚动。
   - `FixedHeader` 页面：固定头部存在，激活阈值线位于头部下方。
   - `EdgeBoundary` 页面：调整 offset 后激活行为变化。
   - `JumpToggles` 页面：开关不同组合下，首尾激活行为不同。
   - `Responsive` 页面：窄屏下目录无高亮，宽屏下有高亮。
   - `ApiShowcase` 页面：所有返回值均有可视化展示。
7. 构建验证：运行 `pnpm build`，确认 TypeScript 与 Vite 构建均通过。
