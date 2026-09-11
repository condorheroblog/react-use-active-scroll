/**
 * @zh 演示页可调参数（既包含 useActiveScroll 的全部选项，也包含少量演示内容开关）。
 * @en Tunable parameters for the demo (all useActiveScroll options plus a few
 * demo-content switches).
 */
export interface DemoConfig {
	// @zh 起点一侧固定遮挡物宽度（横向即左侧），单位 px @en Width of the fixed overlay on the start side (the left side for horizontal), in px
	overlay: number
	// @zh 朝滚动终点方向的边界偏移 @en Boundary offset when scrolling toward the end
	offsetToEnd: number
	// @zh 朝滚动起点方向的边界偏移 @en Boundary offset when scrolling toward the start
	offsetToStart: number
	// @zh 首个目标：强制激活（true）或按距离提前激活 @en First target: forced activation (true) or early activation by distance
	firstMode: "force" | "distance"
	firstDistance: number
	// @zh 末个目标：强制激活（true）或越过触发线后按距离解除 @en Last target: forced activation (true) or deactivation by distance after crossing the line
	lastMode: "force" | "distance"
	lastDistance: number
	// @zh URL hash 同步方式 @en URL hash sync mode
	hash: "off" | "replace" | "push"
	// @zh 是否渲染触发线调试覆盖层 @en Whether to render the trigger-line debug overlay
	debug: boolean
	// @zh 覆盖层是否显示文字标签 @en Whether the overlay shows text labels
	debugLabel: boolean
	// @zh 是否启用媒体查询门控 @en Whether the media-query gate is enabled
	mediaEnabled: boolean
	mediaQuery: string
	// @zh 演示卡片数量 @en Number of demo cards
	sectionCount: number
	// @zh 点击导航时是否平滑滚动 @en Whether clicking the nav scrolls smoothly
	smoothScroll: boolean
}

export const DEFAULT_CONFIG: DemoConfig = {
	overlay: 0,
	offsetToEnd: 0,
	offsetToStart: 0,
	firstMode: "force",
	firstDistance: 120,
	lastMode: "force",
	lastDistance: 160,
	hash: "off",
	debug: true,
	debugLabel: true,
	mediaEnabled: false,
	mediaQuery: "(min-width: 900px)",
	sectionCount: 8,
	smoothScroll: true,
};
