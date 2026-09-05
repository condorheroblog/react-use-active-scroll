# react-use-active-scroll Demo：演示应用交互逻辑与 UI 样式设计说明书

> 目标读者：使用 React + TypeScript 实现 `react-use-active-scroll` 演示应用（demo）的 Agent / 开发者
> 说明：本文档聚焦**演示应用本身**的组件结构、页面逻辑、视觉设计、状态管理与路由配置。核心 Hook 的内部实现详见 [plan-api-logic-react.md](file:///Users/david/i/react-use-active-scroll/plan-api-logic-react.md)，本文仅在「使用核心包」的层面与它协作，不重复实现其内部逻辑。

---

## 0. 与核心包的关系

### 0.1 职责划分

| 模块 | 包 | 职责 |
|------|----|------|
| `useActiveScroll` Hook | `react-use-active-scroll`（核心包） | 监听滚动、判定激活目标、暴露 `setActive` / `isActive` / `activeId` / `activeIndex` / `activeEl`。 |
| 演示应用 | `react-use-active-scroll-demo` | 渲染四个示例页面、Header、Sidebar、TOC、DemoControls。**不实现**任何滚动判定逻辑，全部通过 `useActiveScroll` 完成。 |

### 0.2 核心包对外契约（本演示应用依赖部分）

```typescript
// 来源：react-use-active-scroll
function useActiveScroll(
  targets: string[] | HTMLElement[],
  options?: {
    root?: HTMLElement | null | React.RefObject<HTMLElement | null>
    jumpToFirst?: boolean
    jumpToLast?: boolean
    overlayHeight?: number
    minWidth?: number
    replaceHash?: boolean
    edgeOffset?: { first?: number; last?: number }
    boundaryOffset?: { toTop?: number; toBottom?: number }
  }
): {
  setActive: (target: string | HTMLElement) => void
  isActive: (target: string | HTMLElement) => boolean
  activeEl: HTMLElement | null
  activeId: string
  activeIndex: number
}
```

### 0.3 演示应用从核心包消费的能力

| 能力 | 用途 |
|------|------|
| `activeId` / `activeIndex` | 驱动 TOC 当前项高亮与 Tracker 指示器平移。 |
| `isActive(id)` | 控制目录项的 `Active` 类与 `aria-current`。 |
| `setActive(id)` | 用户点击目录项时标记本次滚动由目标触发，屏蔽普通滚动算法直到滚动结束。 |
| `overlayHeight` 选项 | 告诉核心包顶部固定遮挡高度，用于修正触发线。 |
| `root` 选项 | 切换窗口滚动与容器滚动。 |
| `replaceHash` 选项 | 在滚动过程中同步 URL hash。 |

---

## 1. 演示应用总览

演示应用由**一个顶层布局**、**一个公共头部**、**一个公共侧边栏**以及**四个演示页面**组成。所有页面共享同一套视觉系统，仅在滚动容器形态与目标元素结构上存在差异。

| 页面 | 路由/路径 | 滚动根 | 目标形态 | 核心选项 |
|------|-----------|--------|----------|----------|
| **Window（窗口滚动）** | `/` | `null`（窗口） | 标题 ID 字符串 | `replaceHash: true` |
| **Container（容器滚动）** | `/container` | 自定义容器 ref | 标题 ID 字符串 | `root: containerRef`, `replaceHash: true` |
| **FixedHeader（固定头部）** | `/fixedheader` | `null`（窗口） | 标题 ID 字符串 | `overlayHeight: 60`, `replaceHash: true` |
| **Sections（大区块）** | `/sections` | `null`（窗口） | section 本身 ID 字符串 | `overlayHeight: 60`, `replaceHash: true` |

> 所有页面均**通过 `useActiveScroll` 一个 Hook** 完成激活判定，不在演示应用内自行监听 scroll / ResizeObserver。

---

## 2. 技术栈与依赖

```json
{
  "name": "react-use-active-scroll-demo",
  "private": true,
  "dependencies": {
    "react": "^18.x",
    "react-dom": "^18.x",
    "react-router": "^7.x",
    "animated-scroll-to": "^2.3.0",
    "react-use-active-scroll": "*"
  },
  "devDependencies": {
    "@types/react": "^18.x",
    "@types/react-dom": "^18.x",
    "@vitejs/plugin-react": "^4.x",
    "typescript": "^5.x",
    "vite": "^5.x"
  }
}
```

> `react-use-active-scroll` 在此作为外部依赖出现，**不包含在演示应用代码内**。其实现参见独立的 `react-use-active-scroll` 包。

---

## 3. 全局布局结构

### 3.1 页面根节点

```text
┌──────────────────────────────────────────────┐
│  #root                                       │
│  ┌────────────────────────────────────────┐  │
│  │  Header（顶部导航）                     │  │
│  └────────────────────────────────────────┘  │
│  ┌────────────────────┬───────────────────┐  │
│  │                    │                   │  │
│  │   Main Content     │   Sidebar         │  │
│  │   （页面特定）      │   ├ DemoControls  │  │
│  │                    │   └ TOC           │  │
│  │                    │                   │  │
│  └────────────────────┴───────────────────┘  │
└──────────────────────────────────────────────┘
```

### 3.2 顶层 Wrapper

```tsx
// App.tsx
import { createContext, useMemo, useState } from 'react'
import { Outlet } from 'react-router'
import { Header } from './components/Header'
import type { DemoRadios } from './types'

export const DemoRadiosContext = createContext<DemoRadios | null>(null)

export function App() {
  const [scrollBehavior, setScrollBehavior] = useState<'smooth' | 'auto'>('smooth')
  const [clickType, setClickType] = useState<'native' | 'custom'>('native')

  const value = useMemo<DemoRadios>(
    () => ({ scrollBehavior, setScrollBehavior, clickType, setClickType }),
    [scrollBehavior, clickType]
  )

  return (
    <DemoRadiosContext.Provider value={value}>
      <div className="Wrapper">
        <Header />
        <Outlet />
      </div>
    </DemoRadiosContext.Provider>
  )
}
```

- 最大宽度：`1280px`
- 水平居中：`margin: auto`
- 布局方向：垂直堆叠
- 相对定位：`position: relative`

### 3.3 页面内容区布局

```text
PageLayout
├── Main Content（页面特定）
└── Sidebar
    ├── DemoControls
    └── TOC
```

---

## 4. 视觉设计系统（Design Tokens）

```css
:root {
  --BackgroundColor: #222831;
  --BorderColor: #384a5d;
  --TextPrimary: rgba(255, 255, 255, 0.87);
  --TextMuted: rgba(255, 255, 255, 0.646);
  --AccentColor: #00adb5;
  --AccentBackground: #00adb538;
  --ButtonBg: #393e46;
  --ButtonBgHover: #4a5463;
  --SectionOddBg: rgb(173, 255, 252);
  --SectionEvenBg: rgb(217, 173, 255);

  --SidebarWidth: 200px;
  --HeaderHeight: 60px;
  --BorderRadius: 5px;
  --ContentMaxWidth: 600px;
  --ScrollBehavior: smooth;
}

@media (max-width: 610px) {
  :root {
    --SidebarWidth: 180px;
  }
}
```

---

## 5. TypeScript 类型定义（演示应用自身）

```typescript
// types.ts —— 仅定义演示应用自身的类型
export interface Section {
  id: string
  title: string
  text: string
}

export interface MenuItem {
  label: string
  href: string
}

export interface DemoRadios {
  scrollBehavior: 'smooth' | 'auto'
  setScrollBehavior: (value: 'smooth' | 'auto') => void
  clickType: 'native' | 'custom'
  setClickType: (value: 'native' | 'custom') => void
}

export interface DemoButtons {
  shiftSection: () => void
  pushSection: () => void
}

export interface TOCData {
  menuItems: MenuItem[]
  /** 演示应用透传给核心包 useActiveScroll 的目标集合 */
  targets: string[] | HTMLElement[]
  /** 容器滚动场景下，演示应用持有的容器 ref */
  containerRef?: React.RefObject<HTMLElement | null>
  /** 固定头部场景下，演示应用通过 options 透传的核心包配置 */
  overlayHeight?: number
}
```

> 注意：核心包 `useActiveScroll` 的返回类型由该包导出，演示应用不重新定义。`react-use-active-scroll` 的 `UseActiveScrollReturn` 供 TOC 组件直接消费。

---

## 6. 公共组件

### 6.1 Header（顶部导航）

```tsx
// components/Header.tsx
import { NavLink, useLocation } from 'react-router'

const routes = [
  { path: '/', label: 'Window' },
  { path: '/container', label: 'Container' },
  { path: '/fixedheader', label: 'FixedHeader' },
  { path: '/sections', label: 'Sections' },
]

export function Header() {
  const { pathname } = useLocation()
  const isFixedHeader = pathname === '/fixedheader' || pathname === '/sections'

  return (
    <nav className={isFixedHeader ? 'FixedHeader' : ''}>
      <div>
        {routes.map((route) => (
          <NavLink key={route.path} to={route.path} end>
            {route.label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
```

#### 样式

```css
nav {
  border-bottom: 1px solid var(--BorderColor);
  height: 60px;
  padding: 0 20px;
  display: flex;
  align-items: center;
  background-color: var(--BackgroundColor);
}

nav.FixedHeader {
  position: fixed;
  max-width: 100%;
  width: 1280px;
  z-index: 100;
}

nav > div {
  width: max-content;
  display: grid;
  gap: 30px;
  grid-auto-flow: column;
  overflow: auto;
}

nav a {
  font-weight: 600;
  font-size: 90%;
  text-decoration: none;
  cursor: pointer;
  color: white;
  white-space: nowrap;
}

nav a:hover,
nav a.active {
  border-bottom: 2px solid white;
}
```

### 6.2 PageLayout

```tsx
// components/PageLayout.tsx
import { Sidebar } from './Sidebar'

export function PageLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="PageLayout">
      {children}
      <Sidebar />
    </div>
  )
}
```

```css
.PageLayout {
  display: flex;
  justify-content: space-between;
}
```

### 6.3 Sidebar

```tsx
// components/Sidebar.tsx
import { DemoControls } from './DemoControls'
import { TOC } from './TOC'

export function Sidebar() {
  return (
    <aside>
      <DemoControls />
      <TOC />
    </aside>
  )
}
```

```css
aside {
  display: flex;
  flex-direction: column;
  min-width: 180px;
  border-left: 1px solid var(--BorderColor);
  width: var(--SidebarWidth);
  position: sticky;
  top: 0;
  padding: 10px;
  height: max-content;
}

.FixedHeader ~ div aside,
.FixedHeader ~ .PageLayout aside {
  top: 60px;
}
```

### 6.4 DemoControls（控制面板）

```tsx
// components/DemoControls.tsx
import { useContext, useEffect } from 'react'
import { DemoRadiosContext } from '../App'
import type { DemoButtons } from '../types'

export function DemoControls({ buttons }: { buttons: DemoButtons }) {
  const radios = useContext(DemoRadiosContext)
  if (!radios) throw new Error('DemoControls must be used within DemoRadiosContext')

  const { scrollBehavior, setScrollBehavior, clickType, setClickType } = radios

  useEffect(() => {
    document.documentElement.style.setProperty(
      '--ScrollBehavior',
      clickType === 'custom' ? 'auto' : scrollBehavior
    )
  }, [scrollBehavior, clickType])

  return (
    <div className="Controls">
      <fieldset>
        <legend>Scroll</legend>
        <div>
          <label>
            <input
              type="radio"
              name="clickType"
              value="native"
              checked={clickType === 'native'}
              onChange={() => setClickType('native')}
            />
            Native
          </label>
          <label>
            <input
              type="radio"
              name="clickType"
              value="custom"
              checked={clickType === 'custom'}
              onChange={() => setClickType('custom')}
            />
            Custom JS
          </label>
        </div>
      </fieldset>

      <fieldset disabled={clickType === 'custom'}>
        <legend>scroll-behavior</legend>
        <div>
          <label>
            <input
              type="radio"
              name="scrollBehavior"
              value="auto"
              checked={scrollBehavior === 'auto'}
              onChange={() => setScrollBehavior('auto')}
            />
            auto
          </label>
          <label>
            <input
              type="radio"
              name="scrollBehavior"
              value="smooth"
              checked={scrollBehavior === 'smooth'}
              onChange={() => setScrollBehavior('smooth')}
            />
            smooth
          </label>
        </div>
      </fieldset>

      <div className="Buttons">
        <button onClick={buttons.shiftSection}>Shift</button>
        <button onClick={buttons.pushSection}>Push</button>
      </div>
    </div>
  )
}
```

### 6.5 TOC（目录）—— 演示应用与核心包的唯一协作点

TOC 是演示应用中**唯一**消费 `useActiveScroll` 输出的组件。所有高亮、Tracker 移动、点击处理、滚动行为均通过 `useActiveScroll` 暴露的 API 完成。

```tsx
// components/TOC.tsx
import { useContext, useMemo } from 'react'
import { useLocation } from 'react-router'
import animateScrollTo from 'animated-scroll-to'
import { useActiveScroll } from 'react-use-active-scroll'
import { DemoRadiosContext } from '../App'
import { TOCDataContext } from '../pages/PageShell'

export function TOC() {
  const tocData = useContext(TOCDataContext)
  const radios = useContext(DemoRadiosContext)
  if (!tocData || !radios) throw new Error('TOC must be used within providers')

  const { menuItems, targets, containerRef, overlayHeight = 0 } = tocData
  const { clickType } = radios
  const location = useLocation()

  // ====== 唯一一处调用核心包 Hook ======
  const { activeIndex, activeId, setActive, isActive } = useActiveScroll(targets, {
    root: containerRef,
    overlayHeight,
    replaceHash: true,
  })

  // 测量激活项高度以驱动 Tracker 平移
  const activeItemHeight = useMemo(() => {
    const selector = `a[href="${location.pathname}#${activeId}"]`
    const el = document.querySelector(selector) as HTMLElement | null
    return el?.scrollHeight || 0
  }, [activeId, location.pathname])

  function customScroll(id: string) {
    setActive(id) // 先告诉核心包：本次滚动由目标触发
    const target = document.getElementById(id)
    if (!target) return
    animateScrollTo(target, {
      elementToScroll: containerRef?.current ?? window,
      easing: (x: number) =>
        1 + (1.70158 + 1) * Math.pow(x - 1, 3) + 1.70158 * Math.pow(x - 1, 2),
      maxDuration: 600,
      verticalOffset: -overlayHeight,
      cancelOnUserAction: true,
    })
  }

  function nativeScroll(id: string) {
    setActive(id) // 同样通知核心包，再由浏览器/路由执行 hash 滚动
    const target = document.getElementById(id)
    target?.scrollIntoView({
      behavior:
        clickType === 'custom'
          ? 'auto'
          : (radios?.scrollBehavior as ScrollBehavior),
      block: 'start',
    })
  }

  const handleClick = (id: string) => {
    if (clickType === 'native') nativeScroll(id)
    else customScroll(id)
  }

  return (
    <nav>
      <ul
        style={
          {
            '--ActiveIndex': activeIndex,
            '--ActiveItemHeight': `${activeItemHeight}px`,
          } as React.CSSProperties
        }
      >
        {activeIndex >= 0 && <span className="Tracker" />}
        {menuItems.map((item) => (
          <li key={item.href}>
            <a
              href={`#${item.href}`}
              aria-current={isActive(item.href) ? 'true' : undefined}
              className={isActive(item.href) ? 'Active' : ''}
              onClick={(e) => {
                e.preventDefault()
                handleClick(item.href)
              }}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
```

#### 样式

```css
.Tracker {
  width: calc(100% + 12px);
  height: var(--ActiveItemHeight);
  position: absolute;
  left: -10px;
  right: 10px;
  transform: translateY(calc(var(--ActiveItemHeight) * var(--ActiveIndex)));
  background-color: var(--AccentBackground);
  transition: transform 100ms;
  border-left: 4px solid var(--AccentColor);
  border-radius: 0 5px 5px 0;
}

ul {
  position: relative;
  list-style: none;
  padding: 0;
  margin: 0;
}

li {
  display: flex;
}

li a {
  text-decoration: none;
  transition: color 100ms;
  user-select: none;
  white-space: nowrap;
  color: var(--TextMuted);
  padding: 2.5px 0;
  width: 100%;
}

@media (hover: hover) {
  li a:hover {
    color: white;
  }
}

li a.Active {
  color: white;
}
```

---

## 7. 数据层

### 7.1 useFakeData Hook

```tsx
// hooks/useFakeData.ts —— 演示应用自身的假数据生成
import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Section, MenuItem } from '../types'

function getInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

export function useFakeData(length = 10) {
  const start = parseInt(sessionStorage.getItem('firstNumber') || '0')
  const end = parseInt(sessionStorage.getItem('lastNumber') || '0')
  const parsedLength = end - start + 1

  const isMobile = window.matchMedia('(max-width: 610px)').matches
  const minText = isMobile ? 50 : 80
  const maxText = isMobile ? 100 : 320

  const [sections, setSections] = useState<Section[]>(() =>
    Array.from({ length: parsedLength <= 1 ? length : parsedLength }, (_, index) => ({
      id: `title_${start + index}`,
      title: `${start + index} `.repeat(6).toUpperCase(),
      text: 'Text '.repeat(getInt(minText, maxText)),
    }))
  )

  const firstNum = useMemo(() => parseInt(sections[0]?.title ?? '-1'), [sections])
  const lastNum = useMemo(
    () => parseInt(sections[sections.length - 1]?.title ?? '-1'),
    [sections]
  )

  useEffect(() => {
    sessionStorage.setItem('firstNumber', `${firstNum}`)
    sessionStorage.setItem('lastNumber', `${lastNum}`)
  }, [firstNum, lastNum])

  const menuItems: MenuItem[] = useMemo(
    () => sections.map((item) => ({ label: item.title, href: item.id })),
    [sections]
  )

  const shiftSection = useCallback(() => setSections((prev) => prev.slice(1)), [])

  const pushSection = useCallback(() => {
    setSections((prev) => {
      const lastTitle = parseInt(prev[prev.length - 1]?.title ?? '-1')
      return [
        ...prev,
        {
          id: `title_${lastTitle + 1}`,
          title: `${lastTitle + 1} `.repeat(6).toUpperCase(),
          text: 'Text '.repeat(getInt(50, 100)),
        },
      ]
    })
  }, [])

  return { sections, menuItems, pushSection, shiftSection }
}
```

### 7.2 演示应用页面级 Context

```tsx
// pages/PageShell.tsx
import { createContext } from 'react'
import type { TOCData, DemoButtons } from '../types'

export const TOCDataContext = createContext<TOCData | null>(null)
export const DemoButtonsContext = createContext<DemoButtons | null>(null)
```

---

## 8. 四个演示页面

每个页面的结构高度相似：

```text
1. 调用 useFakeData 获取 sections / menuItems / pushSection / shiftSection
2. 将 menuItems / targets / (overlayHeight | containerRef) 注入 TOCDataContext
3. 将 shiftSection / pushSection 注入 DemoButtonsContext
4. 渲染主内容（main 或 Container div）
5. 渲染 PageLayout 包含 Sidebar
```

### 8.1 Window 页面（窗口滚动）

```tsx
// pages/Window.tsx
import { useMemo } from 'react'
import { useFakeData } from '../hooks/useFakeData'
import { PageLayout } from '../components/PageLayout'
import { TOCDataContext, DemoButtonsContext } from './PageShell'

export function Window() {
  const { sections, menuItems, pushSection, shiftSection } = useFakeData()
  const targets = useMemo(() => sections.map((s) => s.id), [sections])

  return (
    <TOCDataContext.Provider value={{ menuItems, targets }}>
      <DemoButtonsContext.Provider value={{ pushSection, shiftSection }}>
        <PageLayout>
          <main>
            {sections.map((section) => (
              <section key={section.id}>
                <h2 id={section.id}>{section.title}</h2>
                <p>{section.text}</p>
              </section>
            ))}
          </main>
        </PageLayout>
      </DemoButtonsContext.Provider>
    </TOCDataContext.Provider>
  )
}
```

```css
main {
  margin-top: 300px;
  max-width: 600px;
  padding: 0 20px;
}

h2 {
  padding: 40px 0;
  margin: 0;
}

p {
  margin: 0 0 60px 0;
}
```

### 8.2 Container 页面（容器滚动）

```tsx
// pages/Container.tsx
import { useMemo, useRef } from 'react'
import { useFakeData } from '../hooks/useFakeData'
import { PageLayout } from '../components/PageLayout'
import { TOCDataContext, DemoButtonsContext } from './PageShell'

export function Container() {
  const { sections, menuItems, pushSection, shiftSection } = useFakeData()
  const containerRef = useRef<HTMLDivElement>(null)
  const targets = useMemo(() => sections.map((s) => s.id), [sections])

  return (
    <TOCDataContext.Provider value={{ menuItems, targets, containerRef }}>
      <DemoButtonsContext.Provider value={{ pushSection, shiftSection }}>
        <PageLayout>
          <div ref={containerRef} className="Container">
            {sections.map((section) => (
              <section key={section.id}>
                <h2 id={section.id}>{section.title}</h2>
                <p>{section.text}</p>
              </section>
            ))}
          </div>
        </PageLayout>
      </DemoButtonsContext.Provider>
    </TOCDataContext.Provider>
  )
}
```

```css
.Container {
  overflow: auto;
  max-height: calc(100vh - 160px);
  scroll-behavior: var(--ScrollBehavior);
  height: 900px;
  max-width: 600px;
  border: 2px solid var(--BorderColor);
  border-radius: 10px;
  padding: 0 20px;
  margin: 50px 20px;
}
```

### 8.3 FixedHeader 页面（固定头部）

```tsx
// pages/FixedHeader.tsx
import { useMemo } from 'react'
import { useFakeData } from '../hooks/useFakeData'
import { PageLayout } from '../components/PageLayout'
import { TOCDataContext, DemoButtonsContext } from './PageShell'

export function FixedHeader() {
  const { sections, menuItems, pushSection, shiftSection } = useFakeData()
  const targets = useMemo(() => sections.map((s) => s.id), [sections])

  return (
    <TOCDataContext.Provider value={{ menuItems, targets, overlayHeight: 60 }}>
      <DemoButtonsContext.Provider value={{ pushSection, shiftSection }}>
        <PageLayout>
          <main>
            {sections.map((section) => (
              <section key={section.id}>
                <h2 id={section.id}>{section.title}</h2>
                <p>{section.text}</p>
              </section>
            ))}
          </main>
        </PageLayout>
      </DemoButtonsContext.Provider>
    </TOCDataContext.Provider>
  )
}
```

```css
main {
  --HeaderHeight: 60px;
  --HeadingPadding: 40px;
  max-width: 600px;
  margin-top: calc(var(--HeaderHeight) + var(--HeadingPadding));
  padding: 0 20px;
}

h2 {
  scroll-margin-top: var(--HeaderHeight);
  padding: var(--HeadingPadding) 0;
  margin: 0;
}
```

### 8.4 Sections 页面（大区块）

```tsx
// pages/Sections.tsx
import { useMemo } from 'react'
import { useFakeData } from '../hooks/useFakeData'
import { PageLayout } from '../components/PageLayout'
import { TOCDataContext, DemoButtonsContext } from './PageShell'

export function Sections() {
  const { sections, menuItems, pushSection, shiftSection } = useFakeData()
  const targets = useMemo(() => sections.map((s) => s.id), [sections])

  return (
    <TOCDataContext.Provider value={{ menuItems, targets, overlayHeight: 60 }}>
      <DemoButtonsContext.Provider value={{ pushSection, shiftSection }}>
        <PageLayout>
          <main>
            {sections.map((section) => (
              <section key={section.id} id={section.id}>
                {section.title}
              </section>
            ))}
          </main>
        </PageLayout>
      </DemoButtonsContext.Provider>
    </TOCDataContext.Provider>
  )
}
```

```css
main {
  --HeaderHeight: 60px;
  padding: 0 20px;
  max-width: 600px;
  width: 100%;
  margin-top: var(--HeaderHeight);
}

section {
  height: 600px;
  background-color: var(--SectionEvenBg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 140%;
  padding: 10px;
  color: var(--BackgroundColor);
  scroll-margin-top: var(--HeaderHeight);
}

section:nth-child(odd) {
  height: 400px;
  background-color: var(--SectionOddBg);
}

@media (max-width: 610px) {
  section {
    height: 400px !important;
  }
  section:nth-child(odd) {
    height: 200px !important;
  }
}
```

---

## 9. React Router 配置

```tsx
// main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router'
import { App } from './App'
import { Window } from './pages/Window'
import { Container } from './pages/Container'
import { FixedHeader } from './pages/FixedHeader'
import { Sections } from './pages/Sections'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Window /> },
      { path: 'container', element: <Container /> },
      { path: 'fixedheader', element: <FixedHeader /> },
      { path: 'sections', element: <Sections /> },
    ],
  },
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)
```

---

## 10. 交互状态汇总

| 场景 | 演示应用行为 | 核心包行为 |
|------|-------------|-----------|
| 页面加载 | 渲染对应页面、注入 TOCDataContext | 根据 hash/边缘/位置初始化激活目标 |
| 用户滚动 | 无任何滚动监听代码 | onScrollDown / onScrollUp 持续更新 `activeId` |
| TOC 高亮 | 通过 `useActiveScroll` 返回的 `isActive` 与 `activeIndex` 渲染 | 输出状态 |
| Tracker 平移 | 读取 `activeIndex` 与 `activeItemHeight` 设置 CSS 变量 | 输出状态 |
| 点击目录链接（Native） | 调 `setActive(id)` + `scrollIntoView` | 屏蔽普通滚动算法直到滚动结束 |
| 点击目录链接（Custom） | 调 `setActive(id)` + `animated-scroll-to` | 同上 |
| 切换 Scroll 类型 | 更新 `clickType`，联动 `--ScrollBehavior` 变量 | 无 |
| 切换 scroll-behavior | 更新 `scrollBehavior` 与 `--ScrollBehavior` 变量 | 无 |
| Shift 按钮 | 调用 `shiftSection`，触发 `sections` 变更 | targets 变化后重新 `prepareTargets` |
| Push 按钮 | 调用 `pushSection`，触发 `sections` 变更 | 同上 |
| 路由切换 | 切换页面与 TOCData 注入 | 组件卸载清理、重新挂载初始化 |

---

## 11. 复刻检查清单

- [ ] 初始化 React + TypeScript + Vite 项目，包名 `react-use-active-scroll-demo`。
- [ ] 安装依赖：`react-router`、`animated-scroll-to`、`react-use-active-scroll`。
- [ ] 配置全局 Design Tokens 与基础样式。
- [ ] 实现 `App` 组件与 `DemoRadiosContext`。
- [ ] 实现 `Header` 组件，支持固定定位与当前态。
- [ ] 实现 `PageLayout` 与 `Sidebar` 组件。
- [ ] 实现 `DemoControls`：Scroll 类型、scroll-behavior、Shift/Push 按钮。
- [ ] 实现 `useFakeData` Hook 与 `sessionStorage` 持久化。
- [ ] 实现 `TOC`：仅一处调用 `useActiveScroll`，其余均为渲染与点击转发。
- [ ] 实现 `Window` 页面：窗口滚动、标题 ID 目标。
- [ ] 实现 `Container` 页面：自定义滚动容器 + 容器 ref。
- [ ] 实现 `FixedHeader` 页面：固定头部 + `overlayHeight: 60`。
- [ ] 实现 `Sections` 页面：大尺寸色块目标、奇偶样式、移动端适配。
- [ ] 配置 React Router 与 hash 滚动处理。
- [ ] 验证 Shift/Push 后目录与目标集合同步更新。
- [ ] 验证 TOC 是唯一与核心包交互的组件，页面与 Header/DemoControls 均不直接接触 `useActiveScroll`。
