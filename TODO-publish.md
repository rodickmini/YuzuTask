# YuzuTask 上架 Google 扩展商店 TODO

## 上架前准备

- [x] **隐私政策页面** — `publish/privacy-policy.html` 已完成（需上线到可访问 URL）
- [x] **完善 manifest.json** — 已补充 homepage_url、确认所有字段齐全
- [x] **商店描述** — `publish/store-listing.md` 已完成，中/英/日三语
- [x] **构建验证** — `npm run build` 产物结构完整，可直接打包
- [ ] **隐私政策上线** — 需要部署到 GitHub Pages 或其他可访问 URL
- [x] **应用商店截图（5 张）** — `publish/screenshots/` 已完成，1280x800 PNG
  1. 1Todos.png — 任务清单主界面
  2. 2Docs.png — 工作记录
  3. 3Report.png — 周报生成
  4. 4Footprint.png — 足迹记录
  5. 5Settings.png — 设置页面
- [ ] **宣传 Banner（可选）** — 440x280 小图 / 920x680 大图 / 1400x560 横幅
- [ ] **注册 Google 开发者账号** — 一次性 $5 美元

## 还需要你手动操作的事项

### 1. 隐私政策上线
在 GitHub 仓库 Settings → Pages 中启用，或将 `publish/privacy-policy.html` 放到 `docs/` 目录并启用 GitHub Pages。
目标 URL 类似：`https://rodickmini.github.io/YuzuTask/privacy-policy.html`

### 2. 注册开发者账号
访问 https://chrome.google.com/webstore/devconsole 注册，支付 $5。

## 获客计划

- [ ] **小红书发帖** — "我做了一个日系风新标签页工具"
- [ ] **即刻 / V2EX 发帖** — 面向开发者和效率工具爱好者
- [ ] **GitHub 开源** — README 写好看，附截图和安装说明
- [ ] **日语社区推广** — Qiita / Twitter，日系风格在日本有天然好感

## 目标

1000 个同频用户
