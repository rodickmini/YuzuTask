import { format, isToday, isTomorrow, isYesterday, startOfWeek, endOfWeek, eachDayOfInterval, parseISO } from 'date-fns';
import { zhCN } from 'date-fns/locale';

export function formatTime(date: Date): string {
  return format(date, 'HH:mm');
}

export function formatDate(date: Date): string {
  return format(date, 'M月d日 EEEE', { locale: zhCN });
}

export function formatRelativeDate(dateStr: string): string {
  const date = parseISO(dateStr);
  if (isToday(date)) return '今天';
  if (isYesterday(date)) return '昨天';
  if (isTomorrow(date)) return '明天';
  return format(date, 'M月d日 EEEE', { locale: zhCN });
}

export function getWeekDays(date: Date = new Date(), weekStart: 'mon-sun' | 'sun-sat' = 'mon-sun'): Date[] {
  const start = startOfWeek(date, { weekStartsOn: weekStart === 'mon-sun' ? 1 : 0 });
  const end = endOfWeek(date, { weekStartsOn: weekStart === 'mon-sun' ? 1 : 0 });
  return eachDayOfInterval({ start, end });
}

export function getGreeting(): { text: string; emoji: string } {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 9) return { text: '早上好', emoji: '🌅' };
  if (hour >= 9 && hour < 12) return { text: '上午好，今天也要加油鸭~', emoji: '☀️' };
  if (hour >= 12 && hour < 14) return { text: '中午好，记得吃饭哦~', emoji: '🍱' };
  if (hour >= 14 && hour < 18) return { text: '下午好，继续冲鸭~', emoji: '💪' };
  if (hour >= 18 && hour < 21) return { text: '晚上好，辛苦一天啦~', emoji: '🌙' };
  return { text: '夜深了，早点休息吧~', emoji: '✨' };
}

export function toISODateString(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}分钟`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}小时${m}分钟` : `${h}小时`;
}
