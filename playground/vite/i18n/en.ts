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
	},
	threshold: {
		triggerLine: "trigger line",
		firstTargetLine: "first-target line",
		lastTargetLine: "last-target line",
		offscreenLeft: "(offscreen left)",
		offscreenTop: "(offscreen top)",
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
