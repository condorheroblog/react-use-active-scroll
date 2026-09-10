# React Use Active Scroll

<p align="center">
  <img src="https://condorheroblog.github.io/react-use-active-scroll/logo.svg" alt="React Use Active Scroll logo" width="96" />
</p>

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![bundle][bundle-src]][bundle-href]
[![JSDocs][jsdocs-src]][jsdocs-href]
[![License][license-src]][license-href]

Live Demo: https://condorheroblog.github.io/react-use-active-scroll/

A React hook that tracks the currently active section while scrolling. Ideal for TOC and sidebar link highlighting.

## Why?

The [Intersection Observer](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API) API makes it hard, if not impossible, to:

- Highlight a clicked link even if it will never intersect
- Always highlight the first/last link once the top/bottom of the page is reached
- Get consistent results regardless of scroll speed
- Immediately highlight links on click or hash navigation when smooth scrolling is enabled

**React Use Active Scroll** implements a custom scroll observer that adapts to any scroll behavior — CSS `scroll-behavior`, `scrollIntoView` or JS animation libraries — and always returns the "correct" active target.

### What it doesn't do

- Scroll to targets
- Mutate the DOM or inject styles (the opt-in [`debug`](#debug-overlay-trigger-lines) overlay is the single exception, and only when you render its node)
- Require or configure hash navigation

## Installation

```bash
npm i react-use-active-scroll
# pnpm add react-use-active-scroll
# yarn add react-use-active-scroll
```

## Quick Start

```tsx
import { useActiveScroll } from "react-use-active-scroll";

const sections = [
	{ id: "introduction", title: "Introduction" },
	{ id: "quick-start", title: "Quick Start" },
	{ id: "api", title: "API" },
];

export function App() {
	const { activeId, setActive } = useActiveScroll(sections.map(s => s.id));

	return (
		<>
			<main>
				{sections.map(s => (
					<section key={s.id}>
						<h2 id={s.id}>{s.title}</h2>
						<p>{/* ... */}</p>
					</section>
				))}
			</main>

			<nav>
				{sections.map(s => (
					<a
						key={s.id}
						href={`#${s.id}`}
						className={activeId === s.id ? "active" : ""}
						onClick={() => setActive(s.id)}
					>
						{s.title}
					</a>
				))}
			</nav>
		</>
	);
}
```

Add smooth scrolling somewhere in your global CSS:

```css
html {
	scroll-behavior: smooth; /* or 'auto' */
}
```

> [!TIP]
> Always call `setActive(id)` in your click handler: it makes highlighting immediate and consistent regardless of scroll speed or easing.

## Targets

Targets accept an array of IDs, an array of elements, or a ref holding either:

```ts
const byId = ["introduction", "quick-start"];
const byEl = [headingEl1, headingEl2];
const byRef = targetsRef; // useful when targets mount later
```

## Options

```tsx
export function Sidebar() {
	const { activeId } = useActiveScroll(targets, {
		direction: "vertical", // scroll axis: "vertical" | "horizontal"
		root: null, // scrolling element, window root by default
		overlay: 0, // fixed overlay size along the scroll axis, in px
		mediaQuery: "", // CSS media query gate, e.g. "(min-width: 768px)"
		hash: "off", // sync URL hash: "off" | "replace" | "push"
		edges: { first: true, last: true }, // edge activation strategy
		offset: 0, // boundary offset, number or { toStart, toEnd }
		debug: false, // render trigger-line devtools: false | true | { label, className }
	});

	return <nav>{/* ... */}</nav>;
}
```

| Property  | Type                                                     | Default                      | Description                                                                                                                                                                       |
| --------- | -------------------------------------------------------- | ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| direction | `'vertical' \| 'horizontal'`                             | `'vertical'`                 | Scroll axis to track. `'horizontal'` watches `scrollLeft` instead of `scrollTop` (RTL is not supported yet).                                                                        |
| edges     | `Edges`                                                  | `{ first: true, last: true }` | Activation strategy for the first/last target. `true` always activates the edge target once reached the start/end even if not intersecting. A `number` allows "no active target": the first target activates early when within that distance of the trigger line; the last target deactivates after its end passes the line by that distance. |
| hash      | `'off' \| 'replace' \| 'push'`                           | `'off'`                      | Sync URL hash while scrolling. `replace` updates the current history entry, `push` creates a new one. The first target is skipped if `edges.first` is `true`.                       |
| offset    | `number \| Offset`                                       | `{ toStart: 0, toEnd: 0 }`   | Boundary offset in px per scroll direction (`toStart` when scrolling towards the start, `toEnd` towards the end). A single number applies to both. Tweak to "anticipate" or "delay" target detection. |
| root      | `HTMLElement \| null` \| `RefObject<HTMLElement \| null>` | null                         | Scrolling element. Set it only if your content **is not scrolled** by the window. If _null_, defaults to the document root.                                                        |
| overlay   | `number`                                                 | 0                            | Size in px of any **CSS fixed** content overlapping the start of your scrolling area along the scroll axis — a fixed header (vertical) or a fixed side panel (horizontal). Must be paired with `scroll-margin-top` / `scroll-margin-left` on your targets. |
| mediaQuery | `string`                                                | `''`                         | A CSS media query, e.g. `'(min-width: 768px)'`; listeners are enabled only while it matches the viewport. Useful when hiding the sidebar with `display: none` on small screens. An invalid query is ignored (with a console warning) and listeners stay always enabled; the same applies when it is omitted. |
| debug      | `boolean \| DebugOptions`                               | `false`                      | Renders a [trigger-line debug overlay](#debug-overlay-trigger-lines). `true` enables it; an object accepts `label` (show text labels, default `true`) and `className` (extra class on the overlay wrapper). Render the returned `devtools` node yourself. Colors are themed via CSS variables. |

## Return Value

| Name        | Type                                         | Description                                                                 |
| ----------- | -------------------------------------------- | --------------------------------------------------------------------------- |
| setActive   | `(target: string \| HTMLElement) => void`    | Include it in your click handler to ensure adaptive behavior.               |
| isActive    | `(target: string \| HTMLElement) => boolean` | Whether the given ID or element is currently active.                        |
| activeEl    | `HTMLElement \| null`                        | The active target element.                                                  |
| activeId    | `string`                                     | The active target ID, an empty string when inactive.                        |
| activeIndex | `number`                                     | Index of the active target in offset order, `-1` when inactive.             |
| devtools    | `ReactNode`                                  | Trigger-line debug overlay node, `null` unless `debug` is enabled. Render it anywhere for window scrolling, or as a sibling of the scroll container inside a `position: relative` wrapper for container scrolling. |

## Recipes

### Scrolling container

```tsx
export function Layout() {
	const containerRef = useRef<HTMLDivElement>(null);

	const { activeId } = useActiveScroll(ids, { root: containerRef });

	return (
		<div ref={containerRef} className="scroll-container">
			{/* sections */}
		</div>
	);
}
```

```css
.scroll-container {
	overflow-y: auto;
	scroll-behavior: smooth;
}
```

### Fixed header

If a fixed header overlaps the top of the scrolling area, set its height via `overlay` and pair it with `scroll-margin-top` so clicked targets don't hide underneath:

```tsx
export function Sidebar() {
	const { activeId } = useActiveScroll(ids, { overlay: 64 });

	return <nav>{/* ... */}</nav>;
}
```

```css
h2 {
	scroll-margin-top: 64px;
}
```

### Horizontal scrolling

Set `direction: "horizontal"` to track a horizontally scrolling container. Fixed overlays on the left use the same `overlay` option (their width), paired with `scroll-margin-left`:

```tsx
export function Sidebar() {
	const { activeId } = useActiveScroll(ids, {
		root: containerRef,
		direction: "horizontal",
	});

	return <nav>{/* ... */}</nav>;
}
```

```css
.scroll-container {
	display: flex;
	overflow-x: auto;
	scroll-behavior: smooth;
}
```

### Fine-tuning activation

```tsx
export function Sidebar() {
	// Allow "no active target": the first activates 120px before crossing the
	// trigger line, the last deactivates 160px after its bottom passes it
	const { activeId } = useActiveScroll(ids, {
		edges: { first: 120, last: 160 },
		offset: { toStart: 50, toEnd: 100 }, // per-direction boundary offset
		hash: "replace", // keep the URL hash in sync while scrolling
	});

	return <nav>{/* ... */}</nav>;
}
```

### Debug overlay (trigger lines)

Set `debug: true` and render the returned `devtools` node to visualize the exact trigger lines used by the activation algorithm — handy while tuning `overlay`, `offset`, and `edges`:

```tsx
export function Sidebar() {
	const { activeId, devtools } = useActiveScroll(ids, { debug: true });

	return (
		<>
			{/* ... */}
			{devtools}
		</>
	);
}
```

- **Window scrolling:** `devtools` is `position: fixed`, so you can render it anywhere in the tree.
- **Container scrolling:** render it as a sibling of the scroll container, inside a `position: relative` wrapper:

```tsx
<div style={{ position: "relative" }}>
	<div ref={containerRef} style={{ overflow: "auto" }}>
		{/* sections */}
	</div>
	{devtools}
</div>
```

**Reading the lines.** Dashed lines are the directional trigger lines: `↓` / `→` scroll toward the end (`offset.toEnd`), `↑` / `←` scroll toward the start (`offset.toStart`). Dotted lines are the first/last edge-offset lines and only appear when `edges.first` / `edges.last` are numbers (or `false`). Coincident lines are merged into one label, and every label shows its position in px from the root border-box. A line beyond the start edge (negative position) is shown as a pinned `off-screen` marker.

Pass an object to tweak the overlay — `debug: { label: false }` hides the labels, `debug: { className: "my-debug" }` adds a class to the overlay wrapper. Colors and stacking are themed through CSS custom properties (inline styles with fallbacks — no stylesheet is injected):

| CSS variable        | Default   | Used for                          |
| ------------------- | --------- | --------------------------------- |
| `--uas-debug-line`  | `#22d3ee` | Directional trigger lines/labels  |
| `--uas-debug-edge`  | `#f59e0b` | First/last edge lines/labels      |
| `--uas-debug-bg`    | `#ffffff` | Label background                  |
| `--uas-debug-z-index` | `9999`  | Overlay stacking order            |

### Server-side rendering

The hook only activates after hydration. Render the first link as active on the server to avoid a flash:

```tsx
export function Sidebar({ ids }: { ids: string[] }) {
	const [mounted, setMounted] = useState(false);
	useEffect(() => setMounted(true), []);

	const { activeId } = useActiveScroll(ids);
	const currentId = mounted ? activeId : ids[0];

	return <nav>{/* render links, highlight currentId */}</nav>;
}
```

## License

[MIT](https://github.com/condorheroblog/react-use-active-scroll/blob/main/LICENSE) License © 2026-Present [Condor Hero](https://github.com/condorheroblog)


<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/react-use-active-scroll?style=flat&colorA=080f12&colorB=1fa669
[npm-version-href]: https://npmx.dev/package/react-use-active-scroll
[npm-downloads-src]: https://img.shields.io/npm/dm/react-use-active-scroll?style=flat&colorA=080f12&colorB=1fa669
[npm-downloads-href]: https://npmx.dev/package/react-use-active-scroll
[bundle-src]: https://img.shields.io/bundlephobia/minzip/react-use-active-scroll?style=flat&colorA=080f12&colorB=1fa669&label=minzip
[bundle-href]: https://bundlephobia.com/result?p=react-use-active-scroll
[license-src]: https://img.shields.io/github/license/condorheroblog/react-use-active-scroll.svg?style=flat&colorA=080f12&colorB=1fa669
[license-href]: https://github.com/condorheroblog/react-use-active-scroll/blob/main/LICENSE
[jsdocs-src]: https://img.shields.io/badge/jsdocs-reference-080f12?style=flat&colorA=080f12&colorB=1fa669
[jsdocs-href]: https://www.jsdocs.io/package/react-use-active-scroll
