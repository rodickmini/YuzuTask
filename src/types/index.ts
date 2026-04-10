// 任务
export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: 'high' | 'medium' | 'low';
  tags: string[];
  status: 'todo' | 'in_progress' | 'done';
  estimatedMinutes?: number;
  dueDate?: string;
  createdAt: string;
  completedAt?: string;
  order: number;
}

// 工作记录
export interface WorkLog {
  id: string;
  content: string;
  tags: string[];
  durationMinutes: number;
  date: string;
  relatedTaskId?: string;
  createdAt: string;
}

// 番茄钟记录
export interface PomodoroSession {
  id: string;
  taskId?: string;
  startedAt: string;
  endedAt: string;
  durationMinutes: number;
  type: 'focus' | 'break';
}

// 周报配置
export interface WeeklyReportConfig {
  enabled: boolean;
  dayOfWeek: number;
  time: string;
  template: string;
  dateRange: 'mon-sun' | 'sun-sat';
}

// 用户设置
export interface UserSettings {
  pomodoroFocusMinutes: number;
  pomodoroBreakMinutes: number;
  longBreakMinutes: number;
  longBreakInterval: number;
  weeklyReport: WeeklyReportConfig;
  customTags: string[];
}

export type AppView = 'home' | 'worklog' | 'weekly' | 'settings';

export const DEFAULT_SETTINGS: UserSettings = {
  pomodoroFocusMinutes: 25,
  pomodoroBreakMinutes: 5,
  longBreakMinutes: 15,
  longBreakInterval: 4,
  weeklyReport: {
    enabled: true,
    dayOfWeek: 5,
    time: '08:00',
    template: `本周工作总结
================

一、本周完成事项：
{{completedItems}}

二、进行中的工作：
{{inProgressItems}}

三、下周计划：
{{nextWeekPlan}}

四、需要协调的事项：
{{blockers}}`,
    dateRange: 'mon-sun',
  },
  customTags: ['工作', '开发', '会议', '文档', '沟通', '学习', '生活'],
};

export const PRIORITY_CONFIG = {
  high: { label: '高', color: 'bg-accent', textColor: 'text-accent' },
  medium: { label: '中', color: 'bg-cream', textColor: 'text-cream' },
  low: { label: '低', color: 'bg-mint', textColor: 'text-mint' },
} as const;

export const ENCOURAGEMENTS = [
  '专注中，你真棒~',
  '加油鸭，马上就好啦！',
  '静下心来，一切都会好的',
  '每一步都算数哦~',
  '深呼吸，你可以的！',
  '专注是一种超能力~',
  '今天也是元气满满的一天',
  '慢慢来，比较快~',
];
