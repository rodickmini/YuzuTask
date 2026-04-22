# YuzuTask 项目问题分析与优化建议

> 分析日期：2026-04-22
> 角色视角：资深产品经理 + Tech Leader

---

## 一、工程化基础设施（P0 - 阻塞级）

### 1. 完全缺失质量保障体系

- **无测试框架**：`package.json` 中没有 Vitest/Jest 等测试依赖，核心业务逻辑（番茄钟计时、数据存储、周报生成）零测试覆盖
- **无 Lint/Format**：没有 ESLint、Prettier 配置，代码风格全靠自律，多人协作时会迅速腐化
- **无预提交钩子**：没有 husky + lint-staged，脏代码可以直接入库
- **无 CI/CD**：没有 GitHub Actions 等自动化流程

### 2. 缺少构建脚本完整性

- `package.json` 只有 `dev`、`build`、`preview` 三个命令，缺少 `lint`、`test`、`type-check` 等脚本

---

## 二、架构设计问题（P0/P1）

### 1. 组件层职责混乱——UI/业务/持久化三层耦合

`src/components/task/TaskList.tsx` 中，组件直接调用 `storage.saveTasks()`，同时操作 `dispatch` 和存储层。这意味着：

- 换存储方案（比如换成 IndexedDB）需要改每个组件
- 无法单独测试 UI 逻辑
- **建议**：抽取 Service 层或在自定义 Hook 中封装 dispatch + storage 的联动

### 2. 番茄钟状态双轨维护

`src/hooks/usePomodoro.ts` 用了 8 个独立 `useState`，同时又需要和全局 store 中的 state 同步（PomodoroSession、WorkLog、PetState）。

`completeFocus` 函数（第74-125行）一个回调内执行了 **6 个副作用**：

1. 停定时器
2. 存 session
3. 写 worklog
4. 更新 pet
5. 发 toast
6. 设 alarm

任何一步失败都会导致数据不一致，且没有事务回滚。

### 3. 全局 State 过于扁平

`src/store/index.tsx` 将 tasks、workLogs、pomodoroSessions、petState、trash、settings 全部放在同一个 Context 中，任何字段变化都会导致所有消费组件重渲染。

**建议**：按领域拆分多个 Context 或引入状态选择器。

---

## 三、代码质量问题（P1）

### 1. 严重的代码重复

`src/components/weekly/WeeklyReport.tsx` 中"获取本周一日期"的逻辑**复制粘贴了 3 次**（第107-112行、121-126行、137-142行），完全相同的代码块。应提取为工具函数。

```typescript
// 重复 3 次的代码
const now = new Date();
const day = now.getDay();
const mondayOffset = day === 0 ? -6 : 1 - day;
const monday = new Date(now);
monday.setDate(now.getDate() + mondayOffset);
monday.setHours(0, 0, 0, 0);
```

### 2. 标签颜色配置重复定义

- `src/components/ui/Tag.tsx` 定义了 `TAG_COLORS`（带背景色样式）
- `src/components/layout/TagSidebar.tsx` 又定义了一套不同格式的 `TAG_COLORS`（纯文字色样式）

修改标签颜色需要改两个地方，极易遗漏。

### 3. 魔法数字散落

| 魔法数字 | 位置 | 说明 |
|---|---|---|
| `20` | `store/index.tsx` L90 | 宠物喂食加 20 饱腹度 |
| `2` | `usePomodoro.ts` L122 | 完成番茄钟奖励 2 个食物 |
| `30` | `storage.ts` / `TrashView.tsx` | 垃圾箱 30 天自动清理 |
| `100` | `store/index.tsx` L90 | 饱腹度上限 100 |

这些策略值应集中到常量配置文件。

---

## 四、性能问题（P1）

### 1. 无效重渲染

`src/components/layout/TagSidebar.tsx` 的 `tagCounts` 依赖 `state.tasks`，但只关心未完成任务的标签计数。任何任务的任何字段变化（比如改个标题）都会触发重算。

### 2. Footprint 页面的 timeline 构建

`src/components/footprint/FootprintPage.tsx` 对 tasks、workLogs、pomodoroSessions 三个数组同时遍历并创建 JSX 元素，数据量大时会有性能压力，且 JSX 作为 useMemo 的值不利于 React 的协调优化。

### 3. 鼓励语每次创建新对象

`PomodoroTimer.tsx` L27 每次 `isRunning` 变化都从 i18n 取回整个数组并 `returnObjects: true`，可以缓存。

---

## 五、产品功能缺陷（P1/P2）

### 1. 数据安全风险

- **无数据导出/备份**：所有数据全存在 `chrome.storage.local`，用户卸载扩展即丢失全部数据
- **无数据加密**：敏感信息明文存储
- **无数据迁移方案**：类型结构变更时无版本号和迁移逻辑

### 2. 功能短板

- **无搜索**：只能按标签筛选，无法搜索任务标题/描述
- **工作记录不可编辑**：只能删除重建
- **无快捷键体系**：仅 Esc 关闭侧边栏，缺少键盘快捷操作
- **任务无手动拖拽排序 UI**：类型定义中有 `order` 字段，虽引入了 `@dnd-kit`，排序功能不确定是否完善
- **无撤销操作**：删除、状态变更等操作不可逆（虽有回收站，但没有 undo/redo）

### 3. 交互体验不足

- 删除时使用浏览器原生 `confirm()`，而非应用内确认弹窗，体验突兀
- 大量数据加载时无骨架屏/Loading 状态
- 周报生成后的编辑不能保存

---

## 六、国际化问题（P2）

### 1. 硬编码中文

`src/components/ui/PetMascot.tsx` 中宠物气泡对话、饱腹度等文案存在硬编码中文字符串，未走 i18n。

### 2. 语言切换闪烁

`src/i18n/index.ts` 初始化时异步加载语言设置，页面可能先显示默认语言再切换，造成闪烁。

---

## 七、优化建议优先级排序

| 优先级 | 类别 | 建议 |
|---|---|---|
| **P0** | 工程化 | 引入 ESLint + Prettier + husky + lint-staged |
| **P0** | 工程化 | 引入 Vitest，覆盖核心逻辑（番茄钟、存储、周报生成） |
| **P0** | 架构 | 抽取 Service 层，将 storage 操作从组件中剥离 |
| **P1** | 架构 | 拆分全局 Context 或引入 selector 机制减少重渲染 |
| **P1** | 代码质量 | 消除重复代码（周报日期计算、标签颜色配置等） |
| **P1** | 代码质量 | 魔法数字集中管理为常量配置 |
| **P1** | 产品 | 增加数据导出/导入功能（JSON/CSV） |
| **P1** | 产品 | 增加全局搜索功能 |
| **P1** | 健壮性 | `completeFocus` 增加错误处理和部分回滚机制 |
| **P2** | 产品 | 工作记录支持编辑 |
| **P2** | 产品 | 增加快捷键体系 |
| **P2** | 体验 | 原生 confirm 替换为应用内确认弹窗 |
| **P2** | 国际化 | 补全 PetMascot 等组件的 i18n 覆盖 |
| **P2** | 性能 | 优化 FootprintPage timeline 构建，分页或虚拟滚动 |
