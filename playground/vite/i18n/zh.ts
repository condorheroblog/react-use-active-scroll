/**
 * @zh 中文翻译资源。用户在设置中切换语言后启用。
 * @en Chinese translation resource. Activated after the user switches language in settings.
 */
export default {
	aria: {
		toggleTheme: "切换主题",
		toggleLanguage: "切换语言",
		github: "GitHub 仓库",
		openToc: "打开配置面板",
		closeToc: "关闭配置面板",
	},
	notFound: {
		title: "页面不存在",
		desc: "您访问的页面不存在或已被移动。",
		back: "返回首页",
	},
	toc: {
		title: "目录",
	},
	common: {
		fixedOverlay: "固定遮挡物 (overlay: {{px}}px)",
	},
	threshold: {
		triggerLine: "触发线",
		firstTargetLine: "首目标线",
		lastTargetLine: "尾目标线",
		offscreenLeft: "（视口外左侧）",
		offscreenTop: "（视口外上方）",
	},
	panel: {
		title: "配置面板",
		codeTitle: "当前调用代码",
		codeDefault: "全部选项均为默认值",
		demoTag: "演示行为",
		activeBadge: "已启用",
		intro:
			"这是唯一的演示页面：滚动下方内容，右侧目录会随滚动位置自动高亮。useActiveScroll 的全部配置项都收进了右侧配置面板，按分组展示、调整即时生效；偏离默认值的配置会显示用法说明与当前效果，面板底部实时生成对应的调用代码。",
		observation:
			"尾部留白观察区：当 edges.first / edges.last 使用数字时，持续滚动经过本区域，观察最后一个目标何时取消高亮（值越大取消得越晚），再反向滚动观察它何时提前恢复。",
		direction: {
			hint: "选择 Hook 跟踪的滚动轴：纵向跟踪 scrollY（默认），横向跟踪 scrollLeft。",
			vertical: "纵向 vertical",
			horizontal: "横向 horizontal",
			active:
				"direction: 'horizontal' 时只跟踪横向滚动位置（scrollLeft），纵向滚动不改变高亮，暂不支持 RTL；切换后整个演示内容会变为横向排布，请用底部滚动条 / Shift + 滚轮 / 触控板横扫滚动。",
		},
		root: {
			hint: "滚动监听绑定的目标：窗口（root 缺省 / 传 null）或自定义滚动容器（传入 RefObject / 元素）。",
			window: "窗口 window",
			container: "容器 container",
			active:
				"root 传入滚动容器后，监听绑定到容器内部滚动，窗口本身不滚动；目录点击滚动也会定位到容器内，容器上还会渲染独立的阈值参考线。",
		},
		overlay: {
			enable: "渲染固定遮挡物",
			size: "遮挡物尺寸",
			hint: "沿滚动轴起点一侧固定遮挡物的尺寸（px）：纵向为顶部高度，横向为左侧宽度，默认 0。",
			active:
				"overlay 把固定遮挡物计入激活阈值：目标被遮挡物完全遮住时不会激活，越过遮挡物边缘的触发线后才高亮；点击目录定位时同样会为遮挡物留出空间。",
			headerNote: "窗口纵向滚动时，顶部 59px 应用导航栏本身就是固定遮挡物，已自动计入 overlay。",
		},
		edges: {
			force: "强制 true",
			number: "数字 number",
			hint: "首 / 尾目标的边缘策略：true（默认）到达滚动起点 / 终点时强制激活；数字则关闭强制激活并允许“无激活”。",
			active:
				"传数字后首尾目标按距离判定：首目标距触发线该距离时提前激活（负值为延后），尾目标末端越过触发线该距离后解除高亮。滚动到尾部留白观察区可以看到延迟取消高亮的效果。",
		},
		offset: {
			hint: "滚动边界偏移（px）：toStart 作用于朝起点滚动，toEnd 作用于朝终点滚动；直接传数字时两个方向共用。阈值参考线会随之移动。",
			active:
				"offset 微调触发线位置：正值让目标更晚激活（触发线远离滚动起点），负值让目标更早激活。观察虚线触发线与高亮切换时机的变化。",
		},
		mediaQuery: {
			enable: "启用媒体查询门控",
			hint: "CSS 媒体查询字符串，如 (min-width: 768px)：仅在查询匹配期间启用滚动监听；语法非法时门控不生效（始终启用）。",
			active:
				"mediaQuery 匹配时目录正常高亮；不匹配时 Hook 自动停止监听、目录暂停高亮。典型用法：只在桌面端启用滚动高亮，移动端关闭。",
			matchBadge: "查询匹配中：监听已启用",
			noMatchBadge: "查询未匹配：监听已暂停",
			invalidBadge: "语法非法：门控被忽略",
		},
		hash: {
			hint: "滚动过程中同步 URL hash 的方式；首段在 edges.first 为 true 时不写入 hash。",
			off: "不同步 URL",
			replace: "替换历史记录",
			push: "新增历史记录",
			activeReplace:
				"hash: 'replace' 用 history.replaceState 替换当前历史记录：地址栏随高亮更新，但点击浏览器后退不会逐段回退。",
			activePush:
				"hash: 'push' 用 history.pushState 为每个段落新增历史记录：浏览器后退 / 前进可以逐段恢复高亮。",
		},
		scroll: {
			label: "点击滚动方式",
			hint: "点击目录链接后如何滚动到目标（演示层行为，不是 Hook 配置）：native 用浏览器 scrollIntoView / 锚点，custom 用 JS 动画库。",
			clickType: "滚动实现",
			native: "Native",
			custom: "Custom JS",
			behavior: "scroll-behavior",
			smooth: "smooth",
			auto: "auto",
		},
		targets: {
			label: "目标集合 targets",
			hint: "targets 接受 ID 字符串数组 / 元素数组 / 包含数组的 Ref，当前共 {{count}} 个目标。动态增删后 Hook 通过 ResizeObserver 自动重算位置。",
			shift: "Shift 删除首项",
			push: "Push 追加一项",
		},
		values: {
			title: "返回值 Return Values",
		},
	},
};
