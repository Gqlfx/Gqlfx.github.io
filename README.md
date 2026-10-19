# 归去来凤兮 · 个人主页

一个纯静态的个人网页：暖砂 × 赤陶配色、深褐极光首屏、Bento 卡片网格、藏了一个能输入命令的终端彩蛋，支持浅色 / 深色双主题。
零框架、零构建、零外部 JS 依赖，可直接双击打开，也可一键部署到 GitHub Pages。

## 文件结构

```
personal-site/
├── index.html      页面结构（语义化 HTML5）
├── styles.css      样式（CSS 变量 + 双主题 + 响应式 + 极光/网格）
├── script.js       交互（原生 JS：主题切换 / 滚动显现 / Bento 高光倾斜 / 终端彩蛋）
├── favicon.svg     站点图标（SVG「归」字）
└── README.md       本说明
```

## 本地预览

方式一：直接双击 `index.html` 用浏览器打开（无需任何环境）。
方式二（推荐，行为与线上一致）：

```bash
cd personal-site
python3 -m http.server 8000
# 浏览器访问 http://localhost:8000
```

## 页面里有什么

| 区块 | 内容 |
|---|---|
| Hero | 深褐底 + 暖色极光缓慢流动，大字号标题、渐变昵称、三个入口按钮 |
| 关键词带 | 技术关键词横向滚动 |
| 关于我 | Bento 网格：自我介绍大卡 + 正在学 / 接触过 / 兴趣方向 + 「学编程第 N 天」自动计数 |
| 技能栈 | Bento 网格：C 语言（主攻）/ 其他语言 / 日常工具 / AI 辅助开发，进度条进入视口时展开 |
| 学习轨迹 | 垂直时间线，含一张虚线「计划中」占位卡 |
| AI 探索 | 两件真实的事 + 一张虚线占位卡 |
| 联系 | 邮箱按钮、QQ 点击复制、GitHub |
| **终端彩蛋** | 见下 |

## 终端彩蛋怎么玩

页面里藏了一个迷你终端，三种打开方式：

- 按键盘的 <kbd>`</kbd> 键
- 点导航栏右侧的 **>_ 终端** 按钮
- 点 Hero 里的 **打开终端** 或页脚的提示

关闭方式：<kbd>Esc</kbd>、右上角 <kbd>✕</kbd>、点击终端四周的遮罩，或输入 `quit` / `exit`（会有一句告别）。

可以输入的命令：

| 命令 | 作用 |
|---|---|
| `help` | 列出所有命令 |
| `whoami` | 我是谁 |
| `skills` | 技能栈（带文字进度条） |
| `path` | 学习轨迹 |
| `ai` | AI 探索 |
| `contact` | 联系方式 |
| `github` | 打开我的 GitHub |
| `days` | 学编程第几天了 |
| `game` | **终端游戏厅**（见下） |
| `ls` / `neofetch` / `date` | 站点内容 / 系统信息 / 当前时间 |
| `echo` / `clear` | 复读 / 清屏 |
| `exit` / `quit` / `q` | 关闭终端 |

小细节：`↑` `↓` 翻历史命令，`Tab` 补全命令，输入 `sudo` 或 `rm` 有彩蛋回复。
终端里所有个人信息集中在 `script.js` 顶部的 `INFO` 对象里，改一处即可全站生效。

### 终端游戏厅（`game`）

输入 `game` 打开菜单，`game <编号或名字>` 开始，游戏中 `quit` 退出：

| 游戏 | 命令 | 玩法 |
|---|---|---|
| 猜数字 | `game 1` / `game guess` | 想好 1–100 一个数，直接输入数字猜，范围条实时收窄 |
| 井字棋 | `game 2` / `game ttt` | 你执 X 先行，`move 5` 或直接输 `5` 落子，AI 执 O |
| 扫雷 | `game 3` / `game mine` | 6×6 · 6 雷，`dig b3` 挖开、`flag b3` 标记，第一挖必安全 |
| 生命游戏 | `game 4` / `game life` | 康威生命游戏自动演化，任意输入停止（尊重系统「减少动态效果」设置） |

四个游戏都是纯文本画面，无任何外部依赖；游戏中的输入同样走转义，不存在注入风险。

## 部署到 GitHub Pages

### 方式 A：网页上传（最简单，无需命令行）

1. 登录 GitHub，右上角 **+** → **New repository**
2. 仓库名填写 **`gqlfx.github.io`**（用户名 + `.github.io`，这样访问地址最短）
3. Visibility 选 **Public**，点 **Create repository**
4. 点 **add file** → **Upload files**，把 `index.html`、`styles.css`、`script.js`、`favicon.svg` 一起拖进去
5. 点 **Commit changes**
6. 进入仓库 **Settings** → 左侧 **Pages** → **Source** 选 **Deploy from a branch** → **Branch** 选 `main`、目录 `/(root)` → **Save**
7. 等 1–2 分钟，浏览器打开 **https://gqlfx.github.io** 即可（手机上用流量也能打开）

### 方式 B：命令行

```bash
cd personal-site
git init
git add .
git commit -m "first commit: my personal page"
git branch -M main
git remote add origin https://github.com/Gqlfx/gqlfx.github.io.git
git push -u origin main
# 然后按方式 A 第 6 步开启 Pages
```

> 若仓库名不叫 `gqlfx.github.io`，访问地址会变成 `https://gqlfx.github.io/<仓库名>/`。

## 替换指南（换成你自己的信息）

所有需要改的地方都在代码里留了 `【替换】` 注释，全局搜索即可定位：

| 要改什么 | 怎么找 | 出现在几处 |
|---|---|---|
| 邮箱 | 搜索 `aikken150` | 2 处（Hero「联系我」按钮 + 联系区按钮） |
| QQ 号 | 搜索 `1005622697` | 2 处（按钮文字 + `data-qq` 属性） |
| GitHub 链接 | 搜索 `Gqlfx` | 3 处（Hero、联系区、og:url） |
| 昵称 | 搜索 `归去来凤兮` | 标题、导航、页脚 |
| 真名 | 搜索 `宋宇强` | 关于我、页脚、meta author |
| 头像文字 | 搜索 `avatar` 附近的「归」 | 3 处（Hero 大头像 + 关于我卡 + 导航小头像） |
| 学编程起始日 | 搜索 `data-start` | 1 处（统计卡，改完「第 N 天」自动重算） |
| 终端彩蛋资料 | 改 `script.js` 顶部的 `INFO` 对象 | 1 处 |

改完后刷新浏览器即可看到效果，不需要重新构建。

## 功能与设计说明

- **双主题**：默认跟随系统深浅设置，也可点导航栏右侧的太阳 / 月亮按钮切换，选择会记住
- **动效**：Hero 极光缓慢流动、加载时元素依次入场；滚动进入视口时卡片依次浮现、进度条展开、数字滚动；卡片有鼠标跟随高光与轻微 3D 倾斜；Hero 滚动时轻微视差。全部尊重系统「减少动态效果」设置
- **响应式**：手机 / 平板 / 桌面三档，移动端优先；Bento 网格从 6 列 → 2 列 → 1 列
- **字体**：Google Fonts（Noto Sans SC 标题 + Inter 西文数字 + JetBrains Mono 终端），加载失败自动降级为系统字体，不裂版
- **无外部图片**：头像、极光、点阵、装饰全部为 CSS 生成，离线、断网都不裂图
- **可访问性**：语义化标签、跳转主内容链接、键盘可聚焦、aria 标注、对比度达标
- **性能**：零 JS 依赖、零图片、动画只用 `transform` / `opacity`，首屏加载很快

## 隐私提醒

- QQ 号和邮箱是公开可见的，如收到骚扰可随时删掉联系区对应按钮
- 页面上只放 GitHub 主页链接、不展示具体仓库，避免不必要的暴露

## 后续可以加

- `og-image.png`（社交分享缩略图，建议 1200×630，放在仓库根目录，并取消 `index.html` 里 og:image 那行的注释）
- 有了真实作品后，把「学习轨迹」和「AI 探索」里的虚线占位卡换成真内容，或在终端里加新命令
