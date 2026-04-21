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
  newTaskPosition: 'top' | 'bottom';
}

export type AppView = 'home' | 'worklog' | 'weekly' | 'footprint' | 'settings' | 'trash';

export interface DeletedItem {
  id: string;
  type: 'task' | 'worklog';
  data: Task | WorkLog;
  deletedAt: string;
}

export const DEFAULT_SETTINGS: UserSettings = {
  pomodoroFocusMinutes: 25,
  pomodoroBreakMinutes: 5,
  longBreakMinutes: 15,
  longBreakInterval: 4,
  weeklyReport: {
    enabled: true,
    dayOfWeek: 5,
    time: '08:00',
    template: `{{t:report.weekTitle}}
================

{{t:report.completedSection}}
{{completedItems}}

{{t:report.inProgressSection}}
{{inProgressItems}}

{{t:report.nextWeekSection}}
{{nextWeekPlan}}

{{t:report.blockersSection}}
{{blockers}}`,
    dateRange: 'mon-sun',
  },
  customTags: ['tag.work', 'tag.dev', 'tag.meeting', 'tag.doc', 'tag.comm', 'tag.learn', 'tag.life'],
  newTaskPosition: 'top',
};

export const PRIORITY_CONFIG = {
  high: { label: 'task.priorityHigh', color: 'bg-accent', textColor: 'text-accent' },
  medium: { label: 'task.priorityMedium', color: 'bg-cream', textColor: 'text-cream' },
  low: { label: 'task.priorityLow', color: 'bg-mint', textColor: 'text-mint' },
} as const;
