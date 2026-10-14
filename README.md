# 记忆宫殿 Memory Palace

在 PICO 的 2D 窗口中搭建属于自己的记忆空间，把知识和待办放到物体上，再沿着熟悉的空间线索回顾。

![记忆宫殿海报](media/poster.png)

[下载 v1.0 APK](https://github.com/skyscraperlee22-del/memory-palace-2d/releases/tag/v1.0) · [20 项报名资料](docs/SUBMISSION.md) · [PICO 实际窗口截图](media/screenshot-pico-window.png) · [示例场景](media/screenshot-demo-floor.png) · [记录看板](media/screenshot-demo-overview.png) · [素材说明](media/README.md)

## 功能

- 创建、重命名和切换楼层，按不同主题组织空间。
- 从居家、办公、校园、商场、走廊分类中选择物体，进行摆放、移动、90° 旋转、锁定和删除。
- 给物体添加多条知识笔记或待办，填写日期与时间，让物体成为信息入口。
- 缩远进入当前楼层的 Memory overview，看板支持楼层切换与模型分类颜色筛选。
- 使用本机 localStorage 保存楼层、物体和笔记，重新打开后继续使用。

## 运行与技术

项目是已确认的 2D 窗口版。Android 宿主采用 Kotlin；页面使用 React、Three.js 和 WebSpatial，3D 模型为 GLB。网页内容随 APK 打包，默认从应用内 appassets 地址加载。

保留两个入口：

| 入口 | 作用 |
| --- | --- |
| `com.example.memorypalace.WebActivity` | 当前保留 APK 的默认启动入口，以 Android WebView 显示页面 |
| `com.example.memorypalace.platform.LaunchActivity` | SpatialUI `DefaultWindowContainer` / Planar WindowContainer 入口，使用 `AndroidView(WebView)` 承载同一页面 |

Spatial SDK BOM 为 0.13.3，Spatial Tools 为 0.13.1，Kotlin 为 2.0.0，AGP 为 8.13.2，Gradle 为 8.13。Android compile/target/min SDK 均为 35，ABI 为 arm64-v8a。版本号 1.0，versionCode 1。

网页前端保留可运行的编译产物和独立 Overview 扩展。与该运行包准确对应的 React 原始源码尚未恢复，因此本仓库不把其他工程的前端源码当作此版本源码。Android 工程可独立构建。

## 构建

安装 Android SDK 35 和 JDK 21，配置 `ANDROID_HOME` 与 `JAVA_HOME` 后运行：

```bash
./gradlew assembleDebug
```

输出为 `app/build/outputs/apk/debug/app-debug.apk`。2026-10-14 已在干净的发布目录完成构建验证。Gradle 构建会访问配置中的 PICO Maven 仓库。不要将本机 `local.properties`、签名密钥或用户数据提交到仓库。

安装、启动保留版本：

```bash
pico-cli app install MemoryPalace-2D-v1.0-debug.apk --device <device-id>
pico-cli app launch com.example.memorypalace --activity .WebActivity --device <device-id>
```

包名与旧版相同；在已有用户数据的设备上安装前请保留用户数据备份，签名不一致时不要通过卸载解决。发布页 APK 为原版保留文件，SHA-256：

```text
c0613f1e23112118f6dc026ccbbe066dcfb133a957a4bc7e4f3ff1459da155d7
```

## 浏览器预览

```bash
python3 -m http.server 5186 --bind 127.0.0.1 --directory app/src/main/assets/memory-palace
```

打开 `http://127.0.0.1:5186/`。浏览器预览和设备 WebView 各自使用独立存储。截图用的合成示例见 `docs/demo-state.json`，不会随安装自动载入。

## 数据与资源

存储键为 `pico-spatial-builder-v3`。用户真实存档不在仓库或 APK 备份中。`docs/runtime-sha256.json` 用于核对本版页面和资源文件。APK 放在 Releases，源码仓库不包含构建缓存。

资源来自本项目已有运行包。Android、PICO SDK、React、Three.js、WebSpatial 等第三方内容受各自许可证与使用条款约束；本仓库未为全部内容声明统一的开源许可证。
