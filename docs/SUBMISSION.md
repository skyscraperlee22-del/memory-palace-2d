# 记忆宫殿 · 作品报名资料

1. **发布地区：** 中国大陆

2. **作品名称：** 记忆宫殿 Memory Palace

3. **作品属性 / Project type：** 空间应用 / Spatial App（PICO 2D 窗口，学习与效率工具）

4. **一句话简介：** 在空间里搭建记忆宫殿，把知识和待办绑定到物体，让每个物体成为记忆的入口。

5. **作品简介：** 记忆宫殿是一款面向 PICO 的 2D 窗口空间记忆应用。用户可以创建不同主题的楼层，从居家、办公、校园、商场与走廊分类中布置场景，为物体关联知识笔记或带日期时间的待办。借助空间线索和楼层记录看板回顾内容，把零散信息整理为可定位、可联想的个人知识空间。应用采用柔和的低多边形视觉，数据保存在本机。

6. **类型标签：** PICO、空间计算、2D 窗口、记忆训练、知识管理、学习工具、效率工具

7. **Icon（应用图标）：** [下载 icon.png（1254 × 1254）](https://github.com/skyscraperlee22-del/memory-palace-2d/releases/download/v1.0.1/icon.png)

8. **海报：** [下载 poster.png（1536 × 1024）](https://github.com/skyscraperlee22-del/memory-palace-2d/releases/download/v1.0/poster.png)。AI 生成的产品概念海报。

9. **截图或演示视频：** [PICO 实际窗口截图](https://github.com/skyscraperlee22-del/memory-palace-2d/releases/download/v1.0/screenshot-pico-window.png)、[示例空间截图](https://github.com/skyscraperlee22-del/memory-palace-2d/releases/download/v1.0/screenshot-demo-floor.png)、[记录看板截图](https://github.com/skyscraperlee22-del/memory-palace-2d/releases/download/v1.0/screenshot-demo-overview.png)。后两张由同一运行包在浏览器中使用合成示例数据拍摄。

10. **功能特性：** 多楼层创建、重命名与切换；分类物体库；物体摆放、移动、90° 旋转、锁定与删除；一个物体关联多条知识笔记或带日期时间的待办；按楼层与模型分类颜色回顾记录；本机数据持久保存。

11. **技术栈：** Kotlin、PICO Spatial SDK 0.13.3、SpatialUI / Planar WindowContainer、Android WebView、React、Three.js、WebSpatial、GLB 模型、localStorage、Gradle 8.13。保留 APK 默认由 WebActivity 加载页面，工程同时保留 SpatialUI 窗口入口。Android 工程可构建；前端提供该版本的可运行编译产物，准确对应的 React 原始源码尚未恢复。

12. **项目 GitHub URL：** https://github.com/skyscraperlee22-del/memory-palace-2d

13. **Commit ID：** 使用 [v1.0.1 发布页](https://github.com/skyscraperlee22-del/memory-palace-2d/releases/tag/v1.0.1) 正文中列出的完整 Commit ID；该 ID 同时填写在发布附件 `SUBMISSION.md` 中。

14. **仓库权限：** 公开 / Public

15. **Deploy Key：** 不适用（公开仓库，无需填写）

16. **AI IDE：** Codex

17. **使用的 AI 模型：** GPT-6（Codex，本次整理与发布）；此前开发使用的具体模型版本未记录。海报使用 OpenAI 图像生成工具。

18. **版本号：** 1.0.1（versionCode 2）

19. **版本公告：** v1.0.1 将系统应用名称修正为「记忆宫殿」，更换为拱门书本图标，并移除旧模板 3D 图标配置。支持同签名覆盖升级。保留 2D 窗口版的楼层、物体、笔记、待办和记录看板功能。

20. **队友名字：** 无

## 安装包与校验

[下载记忆宫殿 v1.0.1 APK](https://github.com/skyscraperlee22-del/memory-palace-2d/releases/download/v1.0.1/MemoryPalace-2D-v1.0.1.apk) · [v1.0.1 发布页](https://github.com/skyscraperlee22-del/memory-palace-2d/releases/tag/v1.0.1) · [素材来源说明](../media/README.md)

APK SHA-256：`3e07e4d1a19ff1246701f23ec62ef45ea12c374e0e25bb8d3f4db170ddfe79d4`。

根目录直接提供完整 Gradle 工程与 Wrapper。2026-10-16 已移除 2D 窗口未使用的 `editor-asset` 模板模块的构建引用，避免要求构建服务器安装本机 Spatial Editor。Debug / Release 均已在不设置 `PICO_HOME` 的干净源码导出目录构建通过，运行资源与原版一致。平台如有“构建执行目录”字段，填写 `.`（仓库根目录）。

原始 v1.0 标签保留最初发布快照；本次提交请使用 v1.0.1 发布页及附件列出的完整 Commit ID，以获得已修正名称与图标的安装包。
