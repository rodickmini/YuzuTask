import type { WorkLog, Task, WeeklyReportConfig } from '../types';
import { format, parseISO } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { getWeekDays, toISODateString, formatDuration } from './date';

export function generateWeeklyReport(
  workLogs: WorkLog[],
  tasks: Task[],
  config: WeeklyReportConfig,
  referenceDate: Date = new Date()
): string {
  const weekDays = getWeekDays(referenceDate, config.dateRange);
  const weekStart = toISODateString(weekDays[0]);
  const weekEnd = toISODateString(weekDays[weekDays.length - 1]);

  // Filter logs and tasks for this week
  const weekLogs = workLogs.filter(log => log.date >= weekStart && log.date <= weekEnd);
  const weekTasks = tasks.filter(t => {
    const created = t.createdAt.substring(0, 10);
    return created >= weekStart && created <= weekEnd;
  });

  const completedTasks = weekTasks.filter(t => t.status === 'done');
  const inProgressTasks = weekTasks.filter(t => t.status === 'in_progress' || t.status === 'todo');

  // Group logs by date
  const logsByDate = new Map<string, WorkLog[]>();
  weekLogs.forEach(log => {
    const existing = logsByDate.get(log.date) || [];
    existing.push(log);
    logsByDate.set(log.date, existing);
  });

  // Build completed items section
  let completedItems = '';
  if (completedTasks.length > 0) {
    completedItems = completedTasks
      .map(t => `  - ${t.title}${t.tags.length > 0 ? ` (${t.tags.map(tag => '#' + tag).join(' ')})` : ''}`)
      .join('\n');
  } else {
    completedItems = '  （暂无已完成任务）';
  }

  // Build in progress section
  let inProgressItems = '';
  if (inProgressTasks.length > 0) {
    inProgressItems = inProgressTasks
      .map(t => `  - ${t.title} [${t.status === 'in_progress' ? '进行中' : '待办'}]`)
      .join('\n');
  } else {
    inProgressItems = '  （暂无进行中任务）';
  }

  // Build work log summary by day
  const dailySummary = weekDays
    .filter(day => logsByDate.has(toISODateString(day)))
    .map(day => {
      const dateStr = toISODateString(day);
      const dayLabel = format(parseISO(dateStr), 'M月d日 EEEE', { locale: zhCN });
      const logs = logsByDate.get(dateStr) || [];
      const totalMinutes = logs.reduce((sum, l) => sum + l.durationMinutes, 0);
      const items = logs.map(l => `    - ${l.content} (${formatDuration(l.durationMinutes)})`).join('\n');
      return `  ${dayLabel}（共 ${formatDuration(totalMinutes)}）\n${items}`;
    })
    .join('\n\n');

  // Replace template placeholders
  let report = config.template;
  report = report.replace('{{completedItems}}', completedItems);
  report = report.replace('{{inProgressItems}}', inProgressItems);
  report = report.replace('{{nextWeekPlan}}', '  （待补充）');
  report = report.replace('{{blockers}}', '  （暂无）');

  // Add daily log section if there's data
  if (dailySummary) {
    report += `\n\n五、每日工作明细：\n${dailySummary}`;
  }

  // Add summary stats
  const totalMinutes = weekLogs.reduce((sum, l) => sum + l.durationMinutes, 0);
  report += `\n\n--- 统计 ---\n本周共记录 ${formatDuration(totalMinutes)}，完成 ${completedTasks.length} 项任务`;

  return report;
}
