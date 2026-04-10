import { format, isToday, isTomorrow, isYesterday, startOfWeek, endOfWeek, eachDayOfInterval, parseISO } from 'date-fns';
import { zhCN, enUS, ja } from 'date-fns/locale';
import i18n from '../i18n';

export function getDateFnsLocale() {
  const lang = i18n.language;
  if (lang.startsWith('zh')) return zhCN;
  if (lang.startsWith('ja')) return ja;
  return enUS;
}

function getDateFormat(): string {
  const lang = i18n.language;
  if (lang.startsWith('zh')) return 'M月d日 EEEE';
  if (lang.startsWith('ja')) return 'M月d日(E)';
  return 'MMM d, EEEE';
}

export function formatTime(date: Date): string {
  return format(date, 'HH:mm');
}

export function formatDate(date: Date): string {
  return format(date, getDateFormat(), { locale: getDateFnsLocale() });
}

export function formatRelativeDate(dateStr: string): string {
  const date = parseISO(dateStr);
  if (isToday(date)) return i18n.t('date.today');
  if (isYesterday(date)) return i18n.t('date.yesterday');
  if (isTomorrow(date)) return i18n.t('date.tomorrow');
  return format(date, getDateFormat(), { locale: getDateFnsLocale() });
}

export function getWeekDays(date: Date = new Date(), weekStart: 'mon-sun' | 'sun-sat' = 'mon-sun'): Date[] {
  const start = startOfWeek(date, { weekStartsOn: weekStart === 'mon-sun' ? 1 : 0 });
  const end = endOfWeek(date, { weekStartsOn: weekStart === 'mon-sun' ? 1 : 0 });
  return eachDayOfInterval({ start, end });
}

export function getGreeting(): { text: string; emoji: string } {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 9) return { text: i18n.t('greeting.morning'), emoji: '🌅' };
  if (hour >= 9 && hour < 12) return { text: i18n.t('greeting.forenoon'), emoji: '☀️' };
  if (hour >= 12 && hour < 14) return { text: i18n.t('greeting.noon'), emoji: '🍱' };
  if (hour >= 14 && hour < 18) return { text: i18n.t('greeting.afternoon'), emoji: '💪' };
  if (hour >= 18 && hour < 21) return { text: i18n.t('greeting.evening'), emoji: '🌙' };
  return { text: i18n.t('greeting.night'), emoji: '✨' };
}

export function toISODateString(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}${i18n.t('date.minutes')}`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}${i18n.t('date.hours')}${m}${i18n.t('date.minutes')}` : `${h}${i18n.t('date.hours')}`;
}
