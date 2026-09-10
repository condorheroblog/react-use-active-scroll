/**
 * @zh 英文翻译资源。默认显示语言。
 * @en English translation resource. The default display language.
 */
export default {
	aria: {
		toggleTheme: "Toggle theme",
		toggleLanguage: "Switch language",
		github: "GitHub repository",
		openToc: "Open contents",
		closeToc: "Close contents",
	},
	nav: {
		vertical: "Vertical",
		horizontal: "Horizontal",
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
		returnValues: "Return Values",
		localOptions: "Local Options",
		fixedOverlay: "Fixed Overlay (overlay: {{px}}px)",
	},
	threshold: {
		triggerLine: "trigger line",
		firstTargetLine: "first-target line",
		lastTargetLine: "last-target line",
		offscreenLeft: "(offscreen left)",
		offscreenTop: "(offscreen top)",
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
};
