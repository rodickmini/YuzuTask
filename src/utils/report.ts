import type { WorkLog, Task, WeeklyReportConfig } from '../types';
import { format, parseISO } from 'date-fns';
import i18n from '../i18n';
import { getWeekDays, toISODateString, formatDuration, getDateFnsLocale, getDateFormat } from './date';

export function generateWeeklyReport(
  workLogs: WorkLog[],
  tasks: Task[],
  config: WeeklyReportConfig,
  referenceDate: Date = new Date()
): string {
  const t = i18n.t.bind(i18n);
  const locale = getDateFnsLocale();

  const weekDays = getWeekDays(referenceDate, config.dateRange);
  const weekStart = toISODateString(weekDays[0]);
  const weekEnd = toISODateString(weekDays[weekDays.length - 1]);

  // Filter logs and tasks for this week
  const weekLogs = workLogs.filter(log => log.date >= weekStart && log.date <= weekEnd);
  const weekTasks = tasks.filter(task => {
    const created = task.createdAt.substring(0, 10);
    return created >= weekStart && created <= weekEnd;
  });

  const completedTasks = weekTasks.filter(task => task.status === 'done');
  const inProgressTasks = weekTasks.filter(task => task.status === 'in_progress' || task.status === 'todo');

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
      .map(task => `  - ${task.title}${task.tags.length > 0 ? ` (${task.tags.map(tag => '#' + tag).join(' ')})` : ''}`)
      .join('\n');
  } else {
    completedItems = `  ${t('report.noCompleted')}`;
  }

  // Build in progress section
  let inProgressItems = '';
  if (inProgressTasks.length > 0) {
    inProgressItems = inProgressTasks
      .map(task => `  - ${task.title} [${task.status === 'in_progress' ? t('task.inProgress') : t('task.todo')}]`)
      .join('\n');
  } else {
    inProgressItems = `  ${t('report.noInProgress')}`;
  }

  // Build work log summary by day
  const dailySummary = weekDays
    .filter(day => logsByDate.has(toISODateString(day)))
    .map(day => {
      const dateStr = toISODateString(day);
      const dayLabel = format(parseISO(dateStr), getDateFormat(), { locale });
      const logs = logsByDate.get(dateStr) || [];
      const totalMinutes = logs.reduce((sum, l) => sum + l.durationMinutes, 0);
      const items = logs.map(l => `    - ${l.content} (${formatDuration(l.durationMinutes)})`).join('\n');
      return `  ${dayLabel}${t('report.dayTotal', { duration: formatDuration(totalMinutes) })}\n${items}`;
    })
    .join('\n\n');

  // Resolve i18n placeholders in template
  let report = config.template;
  report = report.replace(/\{\{t:([\w.]+)\}\}/g, (_, key) => t(key));

  // Replace data placeholders
  report = report.replace('{{completedItems}}', completedItems);
  report = report.replace('{{inProgressItems}}', inProgressItems);
  report = report.replace('{{nextWeekPlan}}', `  ${t('report.toBeFilled')}`);
  report = report.replace('{{blockers}}', `  ${t('report.none')}`);

  // Add daily log section if there's data
  if (dailySummary) {
    report += `\n\n${t('report.dailyDetailSection')}\n${dailySummary}`;
  }

  // Add summary stats
  const totalMinutes = weekLogs.reduce((sum, l) => sum + l.durationMinutes, 0);
  report += `\n\n${t('report.statsHeader')}\n${t('report.totalRecorded')} ${formatDuration(totalMinutes)}，${completedTasks.length} ${t('report.tasksCompleted')}`;

  return report;
}
