/**
 * @zh 演示应用自身类型定义。
 * @en Type definitions for the demo app itself.
 */

export interface Section {
	id: string
	title: string
	text: string
}

export interface MenuItem {
	label: string
	href: string
}

/** @zh 滚动方向，对应核心包 direction 选项 @en Scroll direction, corresponding to the core direction option */
export type Direction = "vertical" | "horizontal";

/** @zh 滚动根模式：window（窗口滚动，root 缺省）或 container（容器滚动，root 指向容器） @en Scroll root mode: window (root omitted) or container (root points to the container) */
export type RootMode = "window" | "container";

/** @zh URL hash 同步方式，对应核心包 hash 选项 @en URL hash sync mode, corresponding to the core hash option */
export type HashMode = "off" | "replace" | "push";

/** @zh 目录点击滚动方式（演示层行为，非核心包配置）：native 浏览器原生 / custom JS 动画 @en TOC click-scroll method (demo-level behavior, not a core option): native browser / custom JS animation */
export type ClickType = "native" | "custom";

/** @zh 原生滚动行为，对应 CSS scroll-behavior @en Native scroll behavior, corresponding to CSS scroll-behavior */
export type ScrollBehaviorMode = "smooth" | "auto";

/**
 * @zh 边缘激活策略模式：
 * - force：传 true，到达滚动起点/终点时强制激活首/尾目标
 * - number：传数字，关闭强制激活并允许"无激活"，按距离提前/延后判定
 * @en Edge activation strategy mode:
 * - force: pass true, force-activate the first/last target at the scroll start/end
 * - number: pass a number, disable forced activation, allow "no active", judge by distance
 */
export type EdgeMode = "force" | "number";

/**
 * @zh 统一演示页的全部配置状态。
 * 核心包配置项（direction / root / overlay / edges / offset / mediaQuery / hash）
 * 与演示层行为（点击滚动方式、目标集合增删）统一收进配置面板。
 * @en All configuration state for the unified demo page.
 * Core options (direction / root / overlay / edges / offset / mediaQuery / hash)
 * and demo-level behavior (click-scroll method, target set mutations) are all
 * collected into the configuration panel.
 */
export interface DemoConfig {
	direction: Direction
	rootMode: RootMode
	/** @zh 是否渲染演示用固定遮挡物并启用 overlay 选项 @en Whether to render the demo fixed overlay and enable the overlay option */
	overlayEnabled: boolean
	/** @zh 演示遮挡物尺寸（纵向为高度，横向为宽度） @en Demo overlay size (height for vertical, width for horizontal) */
	overlaySize: number
	edgesFirstMode: EdgeMode
	edgesFirstValue: number
	edgesLastMode: EdgeMode
	edgesLastValue: number
	offsetToStart: number
	offsetToEnd: number
	mediaQueryEnabled: boolean
	mediaQuery: string
	hash: HashMode
	clickType: ClickType
	scrollBehavior: ScrollBehaviorMode
}

/** @zh 配置更新函数 @en Config update function */
export type UpdateConfig = <K extends keyof DemoConfig>(key: K, value: DemoConfig[K]) => void;
