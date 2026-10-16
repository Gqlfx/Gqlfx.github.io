# 归去来凤兮 · 个人主页

一个纯静态的个人网页：简约自然、圆润有质感、动效流畅，支持浅色 / 深色双主题。
零框架、零构建、零外部 JS 依赖，可直接双击打开，也可一键部署到 GitHub Pages。

## 文件结构

```
personal-site/
├── index.html      页面结构（语义化 HTML5）
├── styles.css      样式（CSS 变量 + 双主题 + 响应式）
├── script.js       交互（原生 JS：主题切换 / 滚动显现 / 导航高亮 / QQ 复制）
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

## 部署到 GitHub Pages（交作业第 2、3 步）

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

## 替换指南（交作业前改这里）

所有需要改的地方都在代码里留了 `【替换】` 注释，全局搜索即可定位：

| 要改什么 | 怎么找 | 出现在几处 |
|---|---|---|
| 邮箱 | 搜索 `aikken150` | 2 处（Hero「联系我」按钮 + 联系区按钮） |
| QQ 号 | 搜索 `1005622697` | 2 处（按钮文字 + `data-qq` 属性） |
| GitHub 链接 | 搜索 `Gqlfx` | 3 处（Hero、联系区、og:url） |
| 昵称 | 搜索 `归去来凤兮` | 标题、导航、页脚 |
| 真名 | 搜索 `宋宇强` | 关于我、页脚、meta author |
| 头像文字 | 搜索 `avatar` 附近的「归」 | 2 处（Hero 大头像 + 导航小头像） |
| og:url / og:image | `<head>` 内 | 各 1 处，部署后换成真实地址 |

改完后刷新浏览器即可看到效果，不需要重新构建。

## 功能与设计说明

- **双主题**：默认跟随系统深浅设置，也可点导航栏右侧的太阳 / 月亮按钮切换，选择会记住
- **动效**：滚动进入视口时元素依次淡入上移，卡片悬停微抬升；全部尊重系统「减少动态效果」设置
- **响应式**：手机 / 平板 / 桌面三档，移动端优先
- **字体**：Google Fonts（Noto Serif SC 标题 + Inter/Noto Sans SC 正文），加载失败自动降级为系统字体，不裂版
- **无外部图片**：头像、装饰全部为 CSS / SVG 生成，离线、断网都不裂图
- **可访问性**：语义化标签、跳转主内容链接、键盘可聚焦、aria 标注

## 隐私提醒

- QQ 号和邮箱是公开可见的，如收到骚扰可随时删掉联系区对应按钮
- 页面上只放 GitHub 主页链接、不展示具体仓库，避免不必要的暴露

## 后续可以加

- `og-image.png`（社交分享缩略图，建议 1200×630，放在仓库根目录即可自动生效）
- 有了真实作品后，在「学习轨迹」下方加「项目」区，直接把占位卡片换成真内容
