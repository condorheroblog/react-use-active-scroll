/**
 * @zh 英文翻译资源。默认显示语言。
 * @en English translation resource. The default display language.
 */
export default {
	aria: {
		toggleTheme: "Toggle theme",
		toggleLanguage: "Switch language",
		github: "GitHub repository",
		openToc: "Open config panel",
		closeToc: "Close config panel",
	},
	notFound: {
		title: "Page not found",
		desc: "The page you're looking for doesn't exist or has been moved.",
		back: "Back to home",
	},
	toc: {
		title: "Contents",
	},
	common: {
		fixedOverlay: "Fixed Overlay (overlay: {{px}}px)",
		returnValues: "Return Values",
		localOptions: "Local Options",
	},
	// @zh 旧版演示页（/legacy 路由）使用的翻译键 @en Translation keys used by the legacy demo pages (/legacy route)
	nav: {
		vertical: "Vertical",
		horizontal: "Horizontal",
	},
	container: {
		desc: "Scrolling on this page happens inside the container below; the window itself does not scroll. The root option points to the container ref.",
	},
	overlay: {
		desc: "The fixed bar at the top is {{px}}px tall; the core package counts it into the activation threshold via the overlay option.",
	},
	edgeBoundary: {
		desc: "There is more than one trigger threshold: the dashed <arrow>↓ / ↑ trigger lines</arrow> are the judgment lines when scrolling down / up, and they move with offset.toEnd / toStart; the dotted <edge>first-target line / last-target line</edge> moves with edges.first / last. If nothing is highlighted at the top of the page, drag edges.first to the right to activate the first target early; edges.last is a positive distance, so the last-target line is above the viewport by default — scroll to the trailing whitespace observation area at the bottom of the page to see the last target deactivate late.",
		observation: "Trailing whitespace observation area: keep scrolling down past this area and observe when the last section loses its highlight (the larger edges.last is, the later it deactivates); then scroll back up and observe when it reactivates early.",
	},
	edges: {
		desc: "Toggle edges.first / edges.last, scroll to the very top or bottom of the page, and observe whether the first and last sections are forced active; when disabled, the first and last targets are judged by the normal trigger line, allowing a \"no active\" state.",
	},
	hash: {
		modeOff: "Don't sync URL",
		modeReplace: "Replace current history entry",
		modePush: "Add new history entry",
		desc: "Switch the hash mode and scroll the page to observe the address bar: <replace>replace</replace> replaces the current history entry, so clicking back does not step back section by section; <push>push</push> adds a new history entry for each section, so clicking browser back / forward restores the highlight section by section; <off>off</off> does not sync the URL at all. The first section does not write to the hash when edges.first is true.",
	},
	responsive: {
		desc: "When the viewport width is less than {{px}}px, useActiveScroll automatically stops listening and the TOC no longer highlights; widening the window beyond {{px}}px re-enables it. Try resizing the browser width to observe the change.",
	},
	windowH: {
		desc: "This demo targets the browser window (root defaults to the window): sections are laid out horizontally and stretch the document width, so the window shows a horizontal scrollbar. As you scroll the window to the right (bottom scrollbar / shift + wheel / trackpad swipe), the TOC highlights in sequence. direction: 'horizontal', hash: 'replace'.",
	},
	containerH: {
		desc: "The container enables both horizontal and vertical scrolling: the cards are taller than the container, so the vertical scrollbar is always present. Scrolling the container up and down keeps the TOC highlight unchanged; scrolling left and right advances the highlight — direction: 'horizontal' tracks only the horizontal scroll position.",
	},
	overlayH: {
		desc: "The fixed panel on the left is {{px}}px wide and floats over the horizontal scroll container. The core package counts the panel width into the activation threshold via the overlay option: a section fully obscured by the panel does not activate immediately, but only after crossing the trigger line at the panel's right edge.",
	},
	edgeBoundaryH: {
		desc: "The horizontal version has more than one trigger threshold: the dashed <arrow>→ / ← trigger lines</arrow> are the judgment lines when scrolling right / left, and they move with offset.toEnd / toStart; the dotted <edge>first-target line / last-target line</edge> moves with edges.first / last. If nothing is highlighted at the start, drag edges.first to the right to activate the first target early; edges.last is a positive distance, so the last-target line is to the left of the viewport by default — scroll to the trailing whitespace observation area on the far right to see the last target deactivate late.",
		observation: "Trailing whitespace observation area: keep scrolling right past this area and observe when the last section loses its highlight (the larger edges.last is, the later it deactivates); then scroll back left and observe when it reactivates early.",
	},
	edgesH: {
		desc: "Toggle edges.first / edges.last, scroll the container to the far left or far right, and observe whether the first and last sections are forced active; when disabled, the first and last targets are judged by the normal trigger line, allowing a \"no active\" state.",
	},
	hashH: {
		desc: "Switch the hash mode and scroll the container horizontally to observe the address bar: <replace>replace</replace> replaces the current history entry, so back does not step back section by section; <push>push</push> adds a new history entry for each section, so clicking browser back / forward restores the highlight section by section (the browser also scrolls the container back to the corresponding section); <off>off</off> does not sync the URL at all.",
	},
	responsiveH: {
		desc: "This page sets mediaQuery: {{query}}. When the query does not match (viewport width below 768px), useActiveScroll automatically stops listening and the TOC no longer highlights; widening the window so the query matches again re-enables it. Try resizing the browser width to observe the change.",
	},

	panel: {
		title: "Configuration",
		codeTitle: "Live call code",
		codeDefault: "all options are at their defaults",
		demoTag: "demo-only",
		activeBadge: "active",
		intro:
			"This is the single demo page: scroll the content below and the contents on the right highlight automatically. Every useActiveScroll option lives in the configuration panel on the right, grouped and applied instantly; options that deviate from their defaults show usage notes and their current effect, and the corresponding call code is generated live at the bottom of the panel.",
		observation:
			"Trailing whitespace observation area: when edges.first / edges.last are numbers, keep scrolling past this area and watch when the last target loses its highlight (the larger the value, the later it deactivates), then scroll back and watch it reactivate early.",
		direction: {
			hint: "The scroll axis the hook tracks: vertical tracks scrollY (default), horizontal tracks scrollLeft.",
			vertical: "Vertical",
			horizontal: "Horizontal",
			active:
				"direction: 'horizontal' tracks only the horizontal scroll position (scrollLeft); vertical scrolling does not change the highlight, and RTL is not supported yet. The whole demo switches to a horizontal layout — scroll with the bottom scrollbar, Shift + wheel, or a trackpad swipe.",
		},
		root: {
			hint: "Where the scroll listener is bound: the window (root omitted / null) or a custom scroll container (pass a RefObject / element).",
			window: "Window",
			container: "Container",
			active:
				"With root pointing at a scroll container, listening is bound to the container's internal scroll and the window itself does not scroll; TOC click-scroll also positions inside the container, which renders its own threshold reference lines.",
		},
		overlay: {
			enable: "Render a fixed overlay",
			size: "Overlay size",
			hint: "Size in px of the fixed overlay on the start side of the scroll axis: top height for vertical, left width for horizontal; defaults to 0.",
			active:
				"overlay counts the fixed obstruction into the activation threshold: a target fully covered by the overlay does not activate until it crosses the trigger line at the overlay's edge; TOC click-positioning also leaves room for the overlay.",
			headerNote: "In vertical window mode the app's 59px top nav is itself a fixed overlay and is counted automatically.",
		},
		edges: {
			force: "Force true",
			number: "Number",
			hint: "Edge strategy for the first/last target: true (default) force-activates at the scroll start/end; a number disables forced activation and allows \"no active\".",
			active:
				"With numbers the edge targets are judged by distance: the first target activates early when it is that distance from the trigger line (a negative value delays it), and the last target deactivates after its end crosses the trigger line by that distance. Scroll to the trailing observation area to see the late deactivation.",
		},
		offset: {
			hint: "Scroll boundary offset in px: toStart applies when scrolling toward the start, toEnd toward the end; passing a number shares it across both directions. The threshold lines move accordingly.",
			active:
				"offset fine-tunes the trigger line position: positive values activate targets later (the line moves away from the scroll start), negative values activate them earlier. Watch the dashed trigger lines and the highlight timing.",
		},
		mediaQuery: {
			enable: "Enable media-query gating",
			hint: "A CSS media query string, e.g. (min-width: 768px): listeners are enabled only while it matches; an invalid query disables gating (always enabled).",
			active:
				"When mediaQuery matches, the contents highlight normally; when it does not match, the hook automatically stops listening and highlighting. Typical use: enable scroll highlighting on desktop only, disable it on mobile.",
			matchBadge: "Query matches: listening enabled",
			noMatchBadge: "Query does not match: listening paused",
			invalidBadge: "Invalid syntax: gating ignored",
		},
		hash: {
			hint: "How to sync the URL hash while scrolling; the first section is not written to the hash when edges.first is true.",
			off: "Don't sync URL",
			replace: "Replace history entry",
			push: "Add history entry",
			activeReplace:
				"hash: 'replace' uses history.replaceState to replace the current history entry: the address bar follows the highlight, but browser back does not step back section by section.",
			activePush:
				"hash: 'push' uses history.pushState to add a history entry for each section: browser back / forward restores the highlight section by section.",
		},
		scroll: {
			label: "Click-scroll method",
			hint: "How clicking a contents link scrolls to the target (demo-level behavior, not a hook option): native uses the browser's scrollIntoView / anchor, custom uses a JS animation library.",
			clickType: "Scroll implementation",
			native: "Native",
			custom: "Custom JS",
			behavior: "scroll-behavior",
			smooth: "smooth",
			auto: "auto",
		},
		targets: {
			label: "Target set (targets)",
			hint: "targets accepts an array of ID strings, an array of elements, or a Ref containing either; currently {{count}} targets. After adding/removing targets the hook recomputes positions via ResizeObserver.",
			shift: "Shift (remove first)",
			push: "Push (append one)",
		},
		values: {
			title: "Return Values",
		},
	},
};
