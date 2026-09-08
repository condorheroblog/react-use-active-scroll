![npm](https://img.shields.io/npm/v/react-use-active-scroll?color=46c119)

# React Use Active Scroll

[Live Demo](https://condorheroblog.github.io/react-use-active-scroll/)

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
- Mutate the DOM or inject styles
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
		root: null, // scrolling element, window root by default
		overlayHeight: 0, // fixed overlay height in px
		minWidth: 0, // only track when viewport width >= minWidth
		hash: "off", // sync URL hash: "off" | "replace" | "push"
		edges: { first: true, last: true }, // edge activation strategy
		offset: 0, // boundary offset, number or { toStart, toEnd }
	});

	return <nav>{/* ... */}</nav>;
}
```

| Property      | Type                                                | Default                       | Description                                                                                                                                                                       |
| ------------- | --------------------------------------------------- | ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| edges         | `Edges`                                             | `{ first: true, last: true }` | Activation strategy for the first/last target. `true` always activates the edge target once reached the top/bottom even if not intersecting. A `number` allows "no active target": the first target activates early when within that distance of the trigger line; the last target deactivates after its bottom passes the line by that distance. |
| hash          | `'off' \| 'replace' \| 'push'`                      | `'off'`                       | Sync URL hash while scrolling. `replace` updates the current history entry, `push` creates a new one. The first target is skipped if `edges.first` is `true`.                       |
| offset        | `number \| Offset`                                  | `{ toStart: 0, toEnd: 0 }`    | Boundary offset in px per scroll direction (`toStart` when scrolling up, `toEnd` when scrolling down). A single number applies to both. Tweak to "anticipate" or "delay" target detection. |
| root          | `HTMLElement \| null` \| `RefObject<HTMLElement \| null>` | null                          | Scrolling element. Set it only if your content **is not scrolled** by the window. If _null_, defaults to the document root.                                                        |
| overlayHeight | `number`                                            | 0                             | Height in px of any **CSS fixed** content overlapping the top of your scrolling area (e.g. fixed header). Must be paired with [`scroll-margin-top`](#fixed-header) on your targets.   |
| minWidth      | `number`                                            | 0                             | Only enable listeners when the viewport is at least this wide. Useful when hiding the sidebar with `display: none` on small screens.                                               |

## Return Value

| Name        | Type                                         | Description                                                                 |
| ----------- | -------------------------------------------- | --------------------------------------------------------------------------- |
| setActive   | `(target: string \| HTMLElement) => void`    | Include it in your click handler to ensure adaptive behavior.               |
| isActive    | `(target: string \| HTMLElement) => boolean` | Whether the given ID or element is currently active.                        |
| activeEl    | `HTMLElement \| null`                        | The active target element.                                                  |
| activeId    | `string`                                     | The active target ID, an empty string when inactive.                        |
| activeIndex | `number`                                     | Index of the active target in offset order, `-1` when inactive.             |

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

If a fixed header overlaps the top of the scrolling area, set its height via `overlayHeight` and pair it with `scroll-margin-top` so clicked targets don't hide underneath:

```tsx
export function Sidebar() {
	const { activeId } = useActiveScroll(ids, { overlayHeight: 64 });

	return <nav>{/* ... */}</nav>;
}
```

```css
h2 {
	scroll-margin-top: 64px;
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
