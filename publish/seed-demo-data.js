// YuzuTask 示例数据填充脚本
// 使用方法：在 YuzuTask 新标签页打开 DevTools → Console，粘贴运行

(async function seedDemoData() {
  const now = new Date();
  const today = now.toISOString().split('T')[0];

  // 日期辅助函数
  function daysAgo(n) {
    const d = new Date(now);
    d.setDate(d.getDate() - n);
    return d.toISOString().split('T')[0];
  }
  function timeOnDay(daysBack, hour, min = 0) {
    const d = new Date(now);
    d.setDate(d.getDate() - daysBack);
    d.setHours(hour, min, 0, 0);
    return d.toISOString();
  }
  function genId() { return Date.now().toString(36) + Math.random().toString(36).substring(2, 9); }

  // ========== 任务 ==========
  const tasks = [
    // 今天 — 进行中
    { id: genId(), title: '完成首页改版设计稿', priority: 'high', tags: ['tag.work', 'tag.dev'], status: 'in_progress', estimatedMinutes: 120, dueDate: today, createdAt: timeOnDay(0, 9, 0), order: 0 },
    { id: genId(), title: 'Review PR #142 用户认证模块', priority: 'high', tags: ['tag.work', 'tag.dev'], status: 'todo', estimatedMinutes: 45, dueDate: today, createdAt: timeOnDay(0, 9, 10), order: 1 },
    { id: genId(), title: '写本周周报', priority: 'medium', tags: ['tag.work', 'tag.doc'], status: 'todo', estimatedMinutes: 30, dueDate: today, createdAt: timeOnDay(0, 9, 20), order: 2 },
    { id: genId(), title: '整理产品需求文档 v2', priority: 'medium', tags: ['tag.work', 'tag.doc'], status: 'todo', estimatedMinutes: 60, dueDate: daysAgo(1), createdAt: timeOnDay(1, 14, 0), order: 3 },
    { id: genId(), title: '学习 Three.js 基础', priority: 'low', tags: ['tag.learn'], status: 'todo', estimatedMinutes: 90, dueDate: daysAgo(3), createdAt: timeOnDay(3, 20, 0), order: 4 },
    { id: genId(), title: '去超市买水果和酸奶', priority: 'low', tags: ['tag.life'], status: 'todo', createdAt: timeOnDay(0, 10, 0), order: 5 },

    // 今天 — 已完成
    { id: genId(), title: '晨会 — 同步本周迭代进度', priority: 'medium', tags: ['tag.work', 'tag.meeting'], status: 'done', estimatedMinutes: 30, createdAt: timeOnDay(0, 9, 30), completedAt: timeOnDay(0, 10, 0), order: 6 },
    { id: genId(), title: '修复登录页面样式错位', priority: 'high', tags: ['tag.work', 'tag.dev'], status: 'done', estimatedMinutes: 20, createdAt: timeOnDay(0, 10, 5), completedAt: timeOnDay(0, 10, 45), order: 7 },
    { id: genId(), title: '回复客户邮件', priority: 'medium', tags: ['tag.work', 'tag.comm'], status: 'done', estimatedMinutes: 15, createdAt: timeOnDay(0, 10, 50), completedAt: timeOnDay(0, 11, 5), order: 8 },

    // 昨天 — 已完成
    { id: genId(), title: '完成 API 接口对接', priority: 'high', tags: ['tag.work', 'tag.dev'], status: 'done', estimatedMinutes: 180, createdAt: timeOnDay(1, 9, 0), completedAt: timeOnDay(1, 12, 0), order: 9 },
    { id: genId(), title: '产品评审会', priority: 'high', tags: ['tag.work', 'tag.meeting'], status: 'done', estimatedMinutes: 60, createdAt: timeOnDay(1, 14, 0), completedAt: timeOnDay(1, 15, 0), order: 10 },
    { id: genId(), title: '更新组件库文档', priority: 'medium', tags: ['tag.work', 'tag.doc'], status: 'done', estimatedMinutes: 45, createdAt: timeOnDay(1, 15, 30), completedAt: timeOnDay(1, 16, 15), order: 11 },
    { id: genId(), title: '跑步 30 分钟', priority: 'low', tags: ['tag.life'], status: 'done', estimatedMinutes: 30, createdAt: timeOnDay(1, 19, 0), completedAt: timeOnDay(1, 19, 30), order: 12 },

    // 2 天前
    { id: genId(), title: '重构数据存储层', priority: 'high', tags: ['tag.work', 'tag.dev'], status: 'done', estimatedMinutes: 240, createdAt: timeOnDay(2, 9, 0), completedAt: timeOnDay(2, 13, 0), order: 13 },
    { id: genId(), title: '设计周报模板', priority: 'medium', tags: ['tag.work', 'tag.doc'], status: 'done', estimatedMinutes: 40, createdAt: timeOnDay(2, 14, 0), completedAt: timeOnDay(2, 14, 40), order: 14 },
    { id: genId(), title: '阅读《设计模式》第 5 章', priority: 'low', tags: ['tag.learn'], status: 'done', estimatedMinutes: 60, createdAt: timeOnDay(2, 20, 0), completedAt: timeOnDay(2, 21, 0), order: 15 },

    // 3 天前
    { id: genId(), title: '用户反馈系统原型', priority: 'high', tags: ['tag.work', 'tag.dev'], status: 'done', createdAt: timeOnDay(3, 9, 30), completedAt: timeOnDay(3, 12, 0), order: 16 },
    { id: genId(), title: '团队 1v1 周会', priority: 'medium', tags: ['tag.work', 'tag.meeting'], status: 'done', estimatedMinutes: 30, createdAt: timeOnDay(3, 14, 0), completedAt: timeOnDay(3, 14, 30), order: 17 },

    // 4-5 天前
    { id: genId(), title: '搭建 CI/CD 流水线', priority: 'high', tags: ['tag.work', 'tag.dev'], status: 'done', createdAt: timeOnDay(4, 10, 0), completedAt: timeOnDay(4, 16, 0), order: 18 },
    { id: genId(), title: '写单元测试 — 支付模块', priority: 'medium', tags: ['tag.work', 'tag.dev'], status: 'done', createdAt: timeOnDay(5, 9, 0), completedAt: timeOnDay(5, 11, 30), order: 19 },
    { id: genId(), title: '学习 Rust 入门教程', priority: 'low', tags: ['tag.learn'], status: 'done', estimatedMinutes: 120, createdAt: timeOnDay(5, 20, 0), completedAt: timeOnDay(5, 22, 0), order: 20 },

    // 6-7 天前（上周）
    { id: genId(), title: '上线 v1.2.0 版本', priority: 'high', tags: ['tag.work', 'tag.dev'], status: 'done', createdAt: timeOnDay(6, 10, 0), completedAt: timeOnDay(6, 11, 30), order: 21 },
    { id: genId(), title: '做晚餐 — 咖喱饭', priority: 'low', tags: ['tag.life'], status: 'done', createdAt: timeOnDay(6, 18, 0), completedAt: timeOnDay(6, 19, 0), order: 22 },
    { id: genId(), title: '客户需求对齐会', priority: 'high', tags: ['tag.work', 'tag.meeting'], status: 'done', createdAt: timeOnDay(7, 10, 0), completedAt: timeOnDay(7, 11, 0), order: 23 },

    // 10-14 天前（更早的活动）
    { id: genId(), title: '数据库迁移脚本编写', priority: 'high', tags: ['tag.work', 'tag.dev'], status: 'done', createdAt: timeOnDay(10, 9, 0), completedAt: timeOnDay(10, 12, 0), order: 24 },
    { id: genId(), title: '整理办公桌', priority: 'low', tags: ['tag.life'], status: 'done', createdAt: timeOnDay(12, 15, 0), completedAt: timeOnDay(12, 15, 30), order: 25 },
    { id: genId(), title: '技术分享会 — 微前端实践', priority: 'medium', tags: ['tag.work', 'tag.meeting', 'tag.learn'], status: 'done', createdAt: timeOnDay(14, 14, 0), completedAt: timeOnDay(14, 15, 30), order: 26 },
  ];

  // ========== 工作记录 ==========
  const workLogs = [
    // 今天
    { id: genId(), content: '完成登录页面样式修复，调整了响应式断点和表单对齐', tags: ['tag.work', 'tag.dev'], durationMinutes: 40, date: today, relatedTaskId: tasks[7].id, createdAt: timeOnDay(0, 10, 45) },
    { id: genId(), content: '回复客户关于数据导出功能的邮件咨询', tags: ['tag.work', 'tag.comm'], durationMinutes: 15, date: today, createdAt: timeOnDay(0, 11, 5) },

    // 昨天
    { id: genId(), content: '对接用户认证、订单查询、数据统计三个 API 接口', tags: ['tag.work', 'tag.dev'], durationMinutes: 180, date: daysAgo(1), relatedTaskId: tasks[9].id, createdAt: timeOnDay(1, 12, 0) },
    { id: genId(), content: '参加产品评审会，讨论 Q2 路线图和优先级排序', tags: ['tag.work', 'tag.meeting'], durationMinutes: 60, date: daysAgo(1), relatedTaskId: tasks[10].id, createdAt: timeOnDay(1, 15, 0) },
    { id: genId(), content: '更新 Button、Modal、Toast 组件的使用文档', tags: ['tag.work', 'tag.doc'], durationMinutes: 45, date: daysAgo(1), relatedTaskId: tasks[11].id, createdAt: timeOnDay(1, 16, 15) },

    // 2 天前
    { id: genId(), content: '将 localStorage 迁移到 IndexedDB，提升大数据量性能', tags: ['tag.work', 'tag.dev'], durationMinutes: 240, date: daysAgo(2), relatedTaskId: tasks[13].id, createdAt: timeOnDay(2, 13, 0) },
    { id: genId(), content: '设计周报模板，支持自定义段落和变量占位符', tags: ['tag.work', 'tag.doc'], durationMinutes: 40, date: daysAgo(2), relatedTaskId: tasks[14].id, createdAt: timeOnDay(2, 14, 40) },
    { id: genId(), content: '阅读《设计模式》策略模式和观察者模式章节', tags: ['tag.learn'], durationMinutes: 60, date: daysAgo(2), relatedTaskId: tasks[15].id, createdAt: timeOnDay(2, 21, 0) },

    // 3 天前
    { id: genId(), content: '完成用户反馈系统的表单组件和提交逻辑', tags: ['tag.work', 'tag.dev'], durationMinutes: 150, date: daysAgo(3), relatedTaskId: tasks[16].id, createdAt: timeOnDay(3, 12, 0) },

    // 4 天前
    { id: genId(), content: '配置 GitHub Actions，实现自动构建和部署到测试环境', tags: ['tag.work', 'tag.dev'], durationMinutes: 360, date: daysAgo(4), relatedTaskId: tasks[18].id, createdAt: timeOnDay(4, 16, 0) },

    // 5 天前
    { id: genId(), content: '为支付模块编写 32 个单元测试用例，覆盖率提升到 87%', tags: ['tag.work', 'tag.dev'], durationMinutes: 150, date: daysAgo(5), relatedTaskId: tasks[19].id, createdAt: timeOnDay(5, 11, 30) },
    { id: genId(), content: '学习 Rust 所有权、借用和生命周期基础概念', tags: ['tag.learn'], durationMinutes: 120, date: daysAgo(5), relatedTaskId: tasks[20].id, createdAt: timeOnDay(5, 22, 0) },

    // 7 天前
    { id: genId(), content: '与客户对齐 v2.0 的核心需求，确认优先级排序', tags: ['tag.work', 'tag.meeting'], durationMinutes: 60, date: daysAgo(7), relatedTaskId: tasks[23].id, createdAt: timeOnDay(7, 11, 0) },
  ];

  // ========== 番茄钟记录 ==========
  const pomodoroSessions = [
    // 今天
    { id: genId(), taskId: tasks[7].id, startedAt: timeOnDay(0, 10, 5), endedAt: timeOnDay(0, 10, 30), durationMinutes: 25, type: 'focus' },
    { id: genId(), startedAt: timeOnDay(0, 10, 30), endedAt: timeOnDay(0, 10, 35), durationMinutes: 5, type: 'break' },
    { id: genId(), taskId: tasks[7].id, startedAt: timeOnDay(0, 10, 35), endedAt: timeOnDay(0, 11, 0), durationMinutes: 25, type: 'focus' },
    { id: genId(), startedAt: timeOnDay(0, 11, 0), endedAt: timeOnDay(0, 11, 5), durationMinutes: 5, type: 'break' },

    // 昨天
    { id: genId(), taskId: tasks[9].id, startedAt: timeOnDay(1, 9, 0), endedAt: timeOnDay(1, 9, 25), durationMinutes: 25, type: 'focus' },
    { id: genId(), startedAt: timeOnDay(1, 9, 25), endedAt: timeOnDay(1, 9, 30), durationMinutes: 5, type: 'break' },
    { id: genId(), taskId: tasks[9].id, startedAt: timeOnDay(1, 9, 30), endedAt: timeOnDay(1, 9, 55), durationMinutes: 25, type: 'focus' },
    { id: genId(), taskId: tasks[9].id, startedAt: timeOnDay(1, 10, 20), endedAt: timeOnDay(1, 10, 45), durationMinutes: 25, type: 'focus' },
    { id: genId(), taskId: tasks[11].id, startedAt: timeOnDay(1, 15, 30), endedAt: timeOnDay(1, 15, 55), durationMinutes: 25, type: 'focus' },

    // 2 天前
    { id: genId(), taskId: tasks[13].id, startedAt: timeOnDay(2, 9, 0), endedAt: timeOnDay(2, 9, 25), durationMinutes: 25, type: 'focus' },
    { id: genId(), taskId: tasks[13].id, startedAt: timeOnDay(2, 9, 30), endedAt: timeOnDay(2, 9, 55), durationMinutes: 25, type: 'focus' },
    { id: genId(), taskId: tasks[13].id, startedAt: timeOnDay(2, 10, 20), endedAt: timeOnDay(2, 10, 45), durationMinutes: 25, type: 'focus' },
    { id: genId(), taskId: tasks[15].id, startedAt: timeOnDay(2, 20, 10), endedAt: timeOnDay(2, 20, 35), durationMinutes: 25, type: 'focus' },

    // 4 天前
    { id: genId(), taskId: tasks[18].id, startedAt: timeOnDay(4, 10, 0), endedAt: timeOnDay(4, 10, 25), durationMinutes: 25, type: 'focus' },
    { id: genId(), taskId: tasks[18].id, startedAt: timeOnDay(4, 10, 30), endedAt: timeOnDay(4, 10, 55), durationMinutes: 25, type: 'focus' },
    { id: genId(), taskId: tasks[18].id, startedAt: timeOnDay(4, 11, 20), endedAt: timeOnDay(4, 11, 45), durationMinutes: 25, type: 'focus' },
    { id: genId(), taskId: tasks[18].id, startedAt: timeOnDay(4, 13, 0), endedAt: timeOnDay(4, 13, 25), durationMinutes: 25, type: 'focus' },

    // 5 天前
    { id: genId(), taskId: tasks[19].id, startedAt: timeOnDay(5, 9, 0), endedAt: timeOnDay(5, 9, 25), durationMinutes: 25, type: 'focus' },
    { id: genId(), taskId: tasks[19].id, startedAt: timeOnDay(5, 9, 30), endedAt: timeOnDay(5, 9, 55), durationMinutes: 25, type: 'focus' },
    { id: genId(), taskId: tasks[20].id, startedAt: timeOnDay(5, 20, 10), endedAt: timeOnDay(5, 20, 35), durationMinutes: 25, type: 'focus' },
    { id: genId(), taskId: tasks[20].id, startedAt: timeOnDay(5, 20, 40), endedAt: timeOnDay(5, 21, 5), durationMinutes: 25, type: 'focus' },
  ];

  // ========== 设置 ==========
  const settings = {
    pomodoroFocusMinutes: 25,
    pomodoroBreakMinutes: 5,
    longBreakMinutes: 15,
    longBreakInterval: 4,
    weeklyReport: {
      enabled: true,
      dayOfWeek: 5,
      time: '08:00',
      template: '{{t:report.weekTitle}}\n================\n\n{{t:report.completedSection}}\n{{completedItems}}\n\n{{t:report.inProgressSection}}\n{{inProgressItems}}\n\n{{t:report.nextWeekSection}}\n{{nextWeekPlan}}\n\n{{t:report.blockersSection}}\n{{blockers}}',
      dateRange: 'mon-sun',
    },
    customTags: ['tag.work', 'tag.dev', 'tag.meeting', 'tag.doc', 'tag.comm', 'tag.learn', 'tag.life'],
    newTaskPosition: 'top',
  };

  // ========== Pet State ==========
  const petState = {
    foodCount: 8,
    satiety: 72,
    lastFeedAt: timeOnDay(0, 11, 0),
    lastDecayAt: timeOnDay(0, 9, 0),
  };

  // ========== 写入 ==========
  await chrome.storage.local.set({
    yuzutask_tasks: tasks,
    yuzutask_worklogs: workLogs,
    yuzutask_pomodoro_sessions: pomodoroSessions,
    yuzutask_settings: settings,
    yuzutask_pet_state: petState,
  });

  console.log('✅ 示例数据已填充完成！');
  console.log(`   📋 任务: ${tasks.length} 条（${tasks.filter(t => t.status === 'done').length} 已完成 / ${tasks.filter(t => t.status === 'in_progress').length} 进行中 / ${tasks.filter(t => t.status === 'todo').length} 待办）`);
  console.log(`   📝 工作记录: ${workLogs.length} 条`);
  console.log(`   🍅 番茄钟: ${pomodoroSessions.length} 条`);
  console.log('   💡 刷新页面即可看到数据');

  // 自动刷新
  location.reload();
})();
