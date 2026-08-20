// 中文翻译字典
// key 为英文原文，value 为中文译文；未收录的 key 由 t() 自动 fallback 到英文原文
// 随各阶段逐步补充
export const zh: Record<string, string> = {
	// 顶栏 / 项目菜单
	"Exit project": "退出项目",
	"Shortcuts": "快捷键",
	"Language": "语言",
	"Project thumbnail": "项目缩略图",
	"Failed to rename project": "重命名项目失败",
	"Failed to delete project": "删除项目失败",
	"Please try again": "请重试",

	// 主题切换
	"Light": "浅色",
	"Dark": "深色",

	// 导出
	"Export": "导出",
	"Export project": "导出项目",
	"Exporting project": "正在导出项目",
	"Export failed": "导出失败",
	"Unknown error occurred": "发生未知错误",
	"Format": "格式",
	"Quality": "质量",
	"Audio": "音频",
	"Cancel": "取消",
	"Copy": "复制",
	"Retry": "重试",
	"MP4 (H.264) - Better compatibility": "MP4 (H.264) - 兼容性更好",
	"WebM (VP9) - Smaller file size": "WebM (VP9) - 文件更小",
	"Low - Smallest file size": "低 - 文件最小",
	"Medium - Balanced": "中 - 均衡",
	"High - Recommended": "高 - 推荐",
	"Very high - Largest file size": "非常高 - 文件最大",
	"Include audio in export": "导出包含音频",

	// 快捷键分类
	"playback": "播放",
	"navigation": "导航",
	"editing": "编辑",
	"selection": "选择",
	"history": "历史",
	"timeline": "时间轴",
	"controls": "控制",
	"assets": "素材",

	// 快捷键动作
	"Play/Pause": "播放/暂停",
	"Stop playback": "停止播放",
	"Frame step backward": "逐帧后退",
	"Frame step forward": "逐帧前进",
	"Seek backward 1 second": "后退 1 秒",
	"Seek forward 1 second": "前进 1 秒",
	"Jump backward 5 seconds": "后退 5 秒",
	"Jump forward 5 seconds": "前进 5 秒",
	"Go to timeline start": "跳转到时间轴开头",
	"Go to timeline end": "跳转到时间轴末尾",
	"Undo": "撤销",
	"Redo": "重做",
	"Copy selected elements": "复制选中元素",
	"Duplicate selected element": "创建元素副本",
	"Paste elements at playhead": "在播放头处粘贴元素",
	"Delete current selection": "删除当前选中",
	"Select all elements": "全选元素",
	"Deselect all elements": "取消全选",
	"Show/hide selected elements": "显示/隐藏选中元素",
	"Mute/unmute selected elements": "静音/取消静音选中元素",
	"Split elements at playhead": "在播放头处分割元素",
	"Split and remove left": "分割并移除左侧",
	"Split and remove right": "分割并移除右侧",
	"Toggle bookmark at playhead": "在播放头处切换书签",
	"Toggle snapping": "切换吸附",
	"Toggle ripple editing": "切换涟漪编辑",
	"Extract or recover source audio": "提取或恢复源音频",
	"Remove media asset": "移除媒体素材",
	"Remove media assets": "移除媒体素材",
	"Cancel current interaction": "取消当前交互",

	// 快捷键对话框
	"Keyboard shortcuts": "键盘快捷键",
	"Reset to default": "恢复默认",
	"or": "或",
	"Press any key combination...": "按下任意组合键...",
	"Click to edit shortcut": "点击编辑快捷键",
	'Key "{key}" is already bound to "{action}"': '按键 "{key}" 已绑定到 "{action}"',

	// 新手引导
	"Welcome to OpenCut Beta! 🎉": "欢迎使用 OpenCut 测试版！🎉",
	"⚠️ This is a super early beta!": "⚠️ 这是非常早期的测试版！",
	"🦋 Have fun testing!": "🦋 测试愉快！",
	"OpenCut Onboarding": "OpenCut 新手引导",
	"You're among the first to try OpenCut - the fully open source CapCut alternative.":
		"你是首批试用 OpenCut 的用户——它是完全开源的剪映替代品。",
	"Next": "下一步",
	"There's still a ton of things to do to make this editor amazing.":
		"要让这个编辑器变得出色，还有很多工作要做。",
	"A lot of features are still missing. We're working hard to build them out!":
		"很多功能还在开发中，我们正在努力完善！",
	"If you're curious, check out our roadmap [here](https://opencut.app/roadmap)":
		"如果你好奇，可以[在这里](https://opencut.app/roadmap)查看我们的路线图。",
	"Join our [Discord]({discord}), chat with cool people and share feedback to help make OpenCut the best editor ever.":
		"加入我们的 [Discord]({discord})，和有趣的人交流、分享反馈，一起把 OpenCut 打造成最好的编辑器。",
	"Finish": "完成",

	// 时间轴工具栏
	"Split element": "分割元素",
	"Split left": "分割左侧",
	"Split right": "分割右侧",
	"Duplicate element": "创建元素副本",
	"Freeze frame (coming soon)": "冻结帧（即将推出）",
	"Delete element": "删除元素",
	"Add bookmark": "添加书签",
	"Remove bookmark": "移除书签",
	"Open graph editor": "打开图表编辑器",
	"Auto snapping": "自动吸附",
	"Ripple editing": "涟漪编辑",
	"No Scene": "无场景",
	"Extract audio": "提取音频",
	"Recover audio": "恢复音频",

	// 场景视图
	"Scenes": "场景",
	"Select scenes ({count})": "选择场景（{count}）",
	"Select scenes to delete": "选择要删除的场景",
	"Switch between scenes in your project": "在项目中切换场景",
	"Select": "选择",
	"Delete ({count})": "删除（{count}）",
	"No scenes available": "没有可用场景",
	"Failed to delete scene": "删除场景失败",
	"Delete Scenes": "删除场景",
	"Are you sure you want to delete 1 scene? This action cannot be undone.":
		"确定要删除 1 个场景吗？此操作无法撤销。",
	"Are you sure you want to delete {count} scenes? This action cannot be undone.":
		"确定要删除 {count} 个场景吗？此操作无法撤销。",
	"Delete": "删除",

	// 时间轴元素右键菜单
	"Split": "分割",
	"Duplicate": "创建副本",
	"Collapse keyframes": "折叠关键帧",
	"Expand keyframes": "展开关键帧",
	"Reveal media": "在媒体库中显示",
	"Replace media": "替换媒体",
	"Mute": "静音",
	"Unmute": "取消静音",
	"Show": "显示",
	"Hide": "隐藏",
	"Delete {count} elements": "删除 {count} 个元素",
	"Delete text": "删除文本",
	"Delete clip": "删除片段",
	"Left": "左",
	"Right": "右",
	"{side} resize handle": "{side} 侧调整手柄",
	"Select keyframe": "选择关键帧",

	// 资源面板 tab
	"Media": "媒体",
	"Sounds": "声音",
	"Text": "文本",
	"Stickers": "贴纸",
	"Effects": "特效",
	"Transitions": "转场",
	"Captions": "字幕",
	"Adjustment": "调整",
	"Settings": "设置",

	// 媒体库
	"Assets": "素材",
	"No active project": "没有活动项目",
	"Delete {count} items": "删除 {count} 个项目",
	"Export clips": "导出片段",
	"Video": "视频",
	"Unknown": "未知",
	"Switch to list view": "切换到列表视图",
	"Switch to grid view": "切换到网格视图",
	"Name": "名称",
	"Type": "类型",
	"Duration": "时长",
	"File size": "文件大小",
	"Sort by {sortBy} ({order})": "按 {sortBy} 排序（{order}）",
	"name": "名称",
	"type": "类型",
	"duration": "时长",
	"size": "大小",
	"ascending": "升序",
	"descending": "降序",
	"Import": "导入",

	// 项目设置
	"Project info": "项目信息",
	"Background": "背景",
	"Frame rate": "帧率",
	"Select a frame rate": "选择帧率",
	"Aspect ratio": "宽高比",
	"Custom": "自定义",
	"Canvas width": "画布宽度",
	"Canvas height": "画布高度",
	"Pick a custom background color": "选择自定义背景颜色",
	"Blur": "模糊",

	// 属性面板 tab
	"Transform": "变换",
	"Blending": "混合",
	"Speed": "速度",
	"Masks": "蒙版",
	"Graphic": "图形",
	"{count} elements selected": "已选择 {count} 个元素",
	"Toggle {param} keyframe": "切换 {param} 关键帧",

	// 项目列表页
	"Grid view": "网格视图",
	"List view": "列表视图",
	"Select all": "全选",
	"Created": "创建时间",
	"Modified": "修改时间",
	"Sort {order}": "排序（{order}）",
	"Search...": "搜索...",
	"New project": "新建项目",
	"New": "新建",
	"Rename": "重命名",
	"Info": "信息",
	"Project menu": "项目菜单",
	"Failed to create project": "创建项目失败",
	"No results found": "未找到结果",
	'Your search for "{query}" did not return any results.':
		'搜索 "{query}" 没有返回任何结果。',
	"Clear search": "清除搜索",
	"No projects yet": "还没有项目",
	"Start creating your first project. Import media, edit, and export your videos. All privately.":
		"开始创建你的第一个项目。导入媒体、编辑并导出视频，全程本地私有。",
	"Create your first project": "创建你的第一个项目",
	"Home": "首页",
	"All projects": "全部项目",

	// 项目对话框
	"Rename project": "重命名项目",
	"New name": "新名称",
	"Enter a new name": "输入新名称",
	"Delete '{name}'?": "删除 \"{name}\"？",
	"Delete {count} projects?": "删除 {count} 个项目？",
	"Warning": "警告",
	'This will permanently delete "{name}" and all associated files.':
		'这将永久删除 "{name}" 及其所有关联文件。',
	"This will permanently delete {count} projects and all associated files.":
		"这将永久删除 {count} 个项目及其所有关联文件。",
	'Type "DELETE" to confirm': '输入 "DELETE" 以确认',
	"Delete project": "删除项目",
	"Project ID": "项目 ID",
	"Close": "关闭",
	"Done": "完成",

	// 反馈
	"Thoughts, bugs, ideas...": "想法、bug、建议...",

	// 营销页 - 导航
	"Roadmap": "路线图",
	"Contributors": "贡献者",
	"Sponsors": "赞助者",
	"Blog": "博客",
	"Changelog": "更新日志",
	"Privacy": "隐私政策",
	"Terms of use": "使用条款",
	"Brand": "品牌",
	"About": "关于",
	"Projects": "项目",
	"Resources": "资源",
	"Company": "公司",
	"Copy SVG": "复制 SVG",
	"Download SVG": "下载 SVG",
	"Brand assets": "品牌资源",
	"Close menu": "关闭菜单",

	// 营销页 - 首页 Hero
	"The open source": "开源",
	"Video editor": "视频编辑器",
	"A simple but powerful video editor that gets the job done. Works on any platform.":
		"一款简单却强大的视频编辑器，跨平台可用，帮你高效完成工作。",
	"Try early beta": "体验早期测试版",

	// 营销页 - 页脚
	"The privacy-first video editor that feels simple to use.":
		"注重隐私、简单易用的视频编辑器。",
	"All Rights Reserved": "保留所有权利",

	// 营销页 - 贡献
	"Start contributing": "开始贡献",
	"Report issues": "报告问题",

	// 营销页 - sponsors
	"Support OpenCut and help us build the future of privacy-first video editing.":
		"支持 OpenCut，与我们共建注重隐私的视频编辑未来。",

	// 营销页 - roadmap
	"What's coming next for OpenCut (last updated: {date})":
		"OpenCut 的下一步计划（最后更新：{date}）",
	"Want to help?": "想帮忙吗？",
	"OpenCut is open source and built by the community. Every contribution, no matter how small, helps us build the best free video editor possible.":
		"OpenCut 是开源项目，由社区共同构建。每一份贡献，无论多小，都在帮我们打造最好的免费视频编辑器。",
	"Start": "起点",
	"This is where it all started. Repository created, initial project structure, and the vision for a free, open-source video editor. [Check out the first tweet](https://x.com/mazeincoding/status/1936706642512388188) to see where it started.":
		"一切从这里开始。仓库创建、初始项目结构，以及打造一款免费、开源视频编辑器的愿景。[查看第一条推文](https://x.com/mazeincoding/status/1936706642512388188)，了解它的起点。",
	"Core UI": "核心界面",
	"Build the foundation - main layout, header, sidebar, timeline container, and basic component structure. Not all functionality yet, but the UI framework that everything else builds on.":
		"打好基础——主布局、顶栏、侧边栏、时间轴容器和基础组件结构。功能尚未齐全，但这是后续一切所依赖的界面框架。",
	"Essential functionality": "核心功能",
	"Everything that makes a video editor **useful**. Timeline interactivity, storage, effects, transitions, etc.":
		"让视频编辑器真正**实用**的一切：时间轴交互、存储、特效、转场等。",
	"Native app (mobile/desktop)": "原生应用（移动端/桌面端）",
	"Native OpenCut apps for Mac, Windows, Linux, and iOS/Android.":
		"面向 Mac、Windows、Linux 以及 iOS/Android 的 OpenCut 原生应用。",
	"Completed": "已完成",
	"In progress": "进行中",
	"Not started": "未开始",

	// 营销页 - changelog
	"See what's new in OpenCut": "查看 OpenCut 的新变化",
	"Features": "功能",
	"Improvements": "改进",
	"Fixes": "修复",
	"Breaking Changes": "破坏性变更",
	"Technical details": "技术细节",
	"Copy as markdown": "以 Markdown 复制",
	"Copied!": "已复制！",
	"Copy markdown": "复制 Markdown",
	"Dismiss": "关闭",
	"See full changelog": "查看完整更新日志",

	// 营销页 - brand
	"Download OpenCut brand assets for use in your projects.":
		"下载 OpenCut 品牌资源，用于你的项目。",
	"Read the brand guidelines.": "阅读品牌使用规范。",
	"Download all": "下载全部",
	"Usage": "使用规范",
	"What's not allowed": "禁止事项",
	"Symbol": "符号",
	"Lockup": "组合标识",

	// 编辑器剩余界面
	"Send feedback": "发送反馈",
	"It's empty here": "空空如也",
	"Click an element on the timeline to edit its properties":
		"点击时间轴上的元素以编辑其属性",
	"Processing your files ({percent}%)": "正在处理文件（{percent}%）",
	"Drag and drop videos, photos, and audio files here":
		"拖放视频、图片和音频文件到这里",
	"Fit": "适配",
};
