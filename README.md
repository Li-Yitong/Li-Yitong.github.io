# Yitong Li / 李艺通 — Personal Academic Website

面向 GitHub Pages 的静态个人学术主页，无框架、无需构建。首页以肖像、姓名、教育背景、研究方向和学术账号为主，支持中英文切换、论文筛选、移动端导航和可暂停的交互研究图形。

## 预览

直接打开 `index.html`，或在本目录运行 `python -m http.server 8765`，访问 `http://127.0.0.1:8765/`。复制邮箱在 HTTPS / localhost 下使用剪贴板，其他环境显示邮箱供手动复制。

## GitHub Pages

目标仓库为 `Li-Yitong/Li-Yitong.github.io`。将本目录内容置于仓库根目录，在 Settings → Pages 中选择 Deploy from a branch，分支 `main`，目录 `/ (root)`，保存后等待部署完成。

入口为 `index.html`，保留 `.nojekyll`。所有静态资源使用相对路径，也可用于项目型 Pages。部署方式参考 [GitHub 官方说明](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)。

## 编辑

- `index.html`：个人资料、论文、教育背景、荣誉及活动。
- `style.css`：基础视觉与响应式样式。
- `profile.css`：肖像首页、履历及个人主页样式。
- `site.js`：语言、导航、筛选、复制与动效偏好。
- `scene.js`：概念性研究图形，支持拖动视角与暂停。
- `assets/`：本人肖像、论文框架图、会议照片。

带 `data-en` / `data-zh` 的普通文本元素提供双语内容。论文原文标题与作者保留英文。已发表和预印本分别标注；不把投稿视为录用。

## 资料依据

- [ORCID 0009-0000-7119-8278](https://orcid.org/0009-0000-7119-8278)：与 SpinSoft 和 Neural Networks 论文出版元数据交叉核验。
- [电子科技大学官方报道](https://news.uestc.edu.cn/info/1007/9735.htm)：本科2021级、自动化工程学院、保研上海交通大学。
- [Neural Networks 论文](https://doi.org/10.1016/j.neunet.2024.106799)：卷181，文章106799，2025年；线上发表为2024年10月。
- 本科与硕士教育、国家奖学金和研究生学业一等奖学金依据本人提供资料。
- 纽娲实习：正式岗位为研发部算法实习生，入职日期为2026年8月1日；当前主页写2026.08至今，依据本人实习通知与专业实践材料。
- 商飞工程实践：2025.09–2026.06，参与上海交通大学与商飞合作项目，负责机械臂运动规划与精细操作控制，开展阶段性验证；依据本人确认和既有项目脱敏总结。

没有加入未核实的 Google Scholar / OpenReview 同名账号。公开目录不包含成绩单、身份证明、经济困难材料或内部项目文档。
