/**
 * @zh 中文翻译资源。用户在设置中切换语言后启用。
 * @en Chinese translation resource. Activated after the user switches language in settings.
 */
export default {
	aria: {
		toggleTheme: "切换主题",
		toggleLanguage: "切换语言",
		github: "GitHub 仓库",
		openToc: "打开目录",
		closeToc: "关闭目录",
	},
	nav: {
		vertical: "纵向",
		horizontal: "横向",
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
		returnValues: "返回值",
		localOptions: "本地选项",
		fixedOverlay: "固定遮罩 (overlay: {{px}}px)",
	},
	threshold: {
		triggerLine: "触发线",
		firstTargetLine: "首目标线",
		lastTargetLine: "尾目标线",
		offscreenLeft: "（视口外左侧）",
		offscreenTop: "（视口外上方）",
	},
	container: {
		desc: "本页面滚动发生在下方容器内部，window 本身不滚动。root 选项指向容器 ref。",
	},
	overlay: {
		desc: "顶部固定条高度为 {{px}}px，核心包通过 overlay 选项将其纳入激活阈值计算。",
	},
	edgeBoundary: {
		desc: "触发阈值不止一条：虚线 <arrow>↓ / ↑ 触发线</arrow> 分别是向下、向上滚动时的判定线，随 offset.toEnd / toStart 移动；点线 <edge>首目标线 / 尾目标线</edge> 随 edges.first / last 移动。若页面顶部暂无高亮，向右拖动 edges.first 可让首目标提前激活；edges.last 为正距离，尾目标线默认位于视口外上方，滚动到页面底部的留白观察区可看到最后一个目标延迟取消激活。",
		observation: "尾部留白观察区：持续向下滚动经过本区域，观察最后一个 section 何时取消高亮（edges.last 越大，取消得越晚）；再向上滚动，观察它何时提前恢复高亮。",
	},
	edges: {
		desc: "切换 edges.first / edges.last，滚动到页面最顶部或最底部，观察首尾 section 是否被强制激活；关闭后首尾目标按普通触发线判定，允许出现“无激活”状态。",
	},
	hash: {
		modeOff: "不同步 URL",
		modeReplace: "替换当前历史记录",
		modePush: "新增历史记录",
		desc: "切换 hash 模式并滚动页面，观察地址栏变化：<replace>replace</replace> 替换当前历史记录，点击后退不会逐段回退；<push>push</push> 为每个段落新增历史记录，点击浏览器后退 / 前进可逐段恢复高亮；<off>off</off> 完全不同步 URL。首段在 edges.first 为 true 时不写入 hash。",
	},
	responsive: {
		desc: "本页设置 mediaQuery: {{query}}。当查询不匹配（视口宽度小于 768px）时，useActiveScroll 自动停止监听，目录不再高亮；拉宽窗口使查询重新匹配后恢复启用。请尝试调整浏览器宽度观察变化。",
	},
	windowH: {
		desc: "本演示针对浏览器窗口（root 缺省）：section 水平排布撑开文档宽度，窗口出现横向滚动条。向右滚动窗口（底部滚动条 / shift + 滚轮 / 触控板横扫）时目录依次高亮。direction: 'horizontal'，hash: 'replace'。",
	},
	containerH: {
		desc: "容器同时开启横向与纵向滚动：卡片高度超出容器高度，纵向滚动条常驻。上下滚动容器时目录高亮保持不变，左右滚动时才推进高亮——direction: 'horizontal' 只跟踪横向滚动位置。",
	},
	overlayH: {
		desc: "左侧固定面板宽 {{px}}px，悬浮于横向滚动容器之上。核心包通过 overlay 选项将面板宽度纳入激活阈值：完全被面板遮挡的 section 不会立即激活，而是越过面板右缘的触发线后才激活。",
	},
	edgeBoundaryH: {
		desc: "横向版触发阈值不止一条：虚线 <arrow>→ / ← 触发线</arrow> 分别是向右、向左滚动时的判定线，随 offset.toEnd / toStart 移动；点线 <edge>首目标线 / 尾目标线</edge> 随 edges.first / last 移动。若起始处暂无高亮，向右拖动 edges.first 可让首目标提前激活；edges.last 为正距离，尾目标线默认位于视口外左侧，滚动到最右侧的留白观察区可看到最后一个目标延迟取消激活。",
		observation: "尾部留白观察区：持续向右滚动经过本区域，观察最后一个 section 何时取消高亮（edges.last 越大，取消得越晚）；再向左滚动，观察它何时提前恢复高亮。",
	},
	edgesH: {
		desc: "切换 edges.first / edges.last，将容器滚动到最左或最右，观察首尾 section 是否被强制激活；关闭后首尾目标按普通触发线判定，允许出现“无激活”状态。",
	},
	hashH: {
		desc: "切换 hash 模式并横向滚动容器，观察地址栏变化：<replace>replace</replace> 替换当前历史记录，后退不会逐段回退；<push>push</push> 为每个段落新增历史记录，点击浏览器后退 / 前进可逐段恢复高亮（浏览器会同时把容器滚回对应 section）；<off>off</off> 完全不同步 URL。",
	},
	responsiveH: {
		desc: "本页设置 mediaQuery: {{query}}。当查询不匹配（视口宽度小于 768px）时，useActiveScroll 自动停止监听，目录不再高亮；拉宽窗口使查询重新匹配后恢复启用。请尝试调整浏览器宽度观察变化。",
	},
};
