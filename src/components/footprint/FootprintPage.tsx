import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Clock, Coffee } from 'lucide-react';
import { useAppState } from '../../store';
import { format, subDays } from 'date-fns';
import { formatRelativeDate, formatDuration } from '../../utils/date';
import { useTranslation } from '../../i18n';
import Tag from '../ui/Tag';
import ContributionGraph from './ContributionGraph';
import { fadeIn, listItem } from '../ui/animations';

export default function FootprintPage() {
  const { state } = useAppState();
  const { t } = useTranslation();

  // Find the most recent day with activity
  const lastActiveDate = useMemo(() => {
    const dates = new Set<string>();
    state.tasks
      .filter(t => t.completedAt)
      .forEach(t => dates.add(format(new Date(t.completedAt!), 'yyyy-MM-dd')));
    state.workLogs.forEach(l => dates.add(l.date));
    state.pomodoroSessions.forEach(s =>
      dates.add(format(new Date(s.startedAt), 'yyyy-MM-dd'))
    );

    if (dates.size === 0) return null;
    const sorted = Array.from(dates).sort().reverse();
    return new Date(sorted[0]);
  }, [state.tasks, state.workLogs, state.pomodoroSessions]);

  const [selectedDate, setSelectedDate] = useState<Date | null>(lastActiveDate);

  // Statistics for the past year
  const stats = useMemo(() => {
    const yearAgo = format(subDays(new Date(), 364), 'yyyy-MM-dd');

    const completedTasks = state.tasks.filter(t =>
      t.completedAt && format(new Date(t.completedAt!), 'yyyy-MM-dd') >= yearAgo
    );

    const activeDays = new Set<string>();
    completedTasks.forEach(t => activeDays.add(format(new Date(t.completedAt!), 'yyyy-MM-dd')));
    state.workLogs
      .filter(l => l.date >= yearAgo)
      .forEach(l => activeDays.add(l.date));

    let streak = 0;
    let currentStreak = 0;
    const sorted = Array.from(activeDays).sort();
    for (let i = 0; i < sorted.length; i++) {
      if (i === 0) { currentStreak = 1; continue; }
      const diff = (new Date(sorted[i]).getTime() - new Date(sorted[i - 1]).getTime()) / 86400000;
      if (diff === 1) { currentStreak++; }
      else { streak = Math.max(streak, currentStreak); currentStreak = 1; }
    }
    streak = Math.max(streak, currentStreak);

    return { activeDays: activeDays.size, streak, totalTasks: completedTasks.length };
  }, [state.tasks, state.workLogs]);

  // Build timeline for selected date, sorted by time desc
  const timeline = useMemo(() => {
    if (!selectedDate) return [];
    const dateStr = format(selectedDate, 'yyyy-MM-dd');

    const items: { timestamp: number; time: string; el: JSX.Element }[] = [];

    // Completed tasks — use completedAt
    state.tasks
      .filter(t => t.completedAt && format(new Date(t.completedAt!), 'yyyy-MM-dd') === dateStr)
      .forEach(task => {
        const dt = new Date(task.completedAt!);
        const ts = dt.getTime();
        items.push({
          timestamp: ts,
          time: format(dt, 'HH:mm'),
          el: (
            <div key={task.id} className="flex items-start gap-2">
              <Check size={14} className="text-mint mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-text-main">{task.title}</p>
                {task.tags.length > 0 && (
                  <div className="flex gap-1 mt-1 flex-wrap">
                    {task.tags.map(tag => <Tag key={tag} label={tag} />)}
                  </div>
                )}
              </div>
            </div>
          ),
        });
      });

    // Work logs — use createdAt
    state.workLogs
      .filter(l => l.date === dateStr)
      .forEach(log => {
        const dt = new Date(log.createdAt);
        const ts = dt.getTime();
        items.push({
          timestamp: ts,
          time: format(dt, 'HH:mm'),
          el: (
            <div key={log.id} className="flex items-start gap-2">
              <Clock size={14} className="text-cream mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-text-main">{log.content}</p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="text-xs text-text-sub">{formatDuration(log.durationMinutes)}</span>
                  {log.tags.map(tag => <Tag key={tag} label={tag} />)}
                </div>
              </div>
            </div>
          ),
        });
      });

    // Pomodoro sessions — use startedAt
    state.pomodoroSessions
      .filter(s => format(new Date(s.startedAt), 'yyyy-MM-dd') === dateStr)
      .forEach(session => {
        const dt = new Date(session.startedAt);
        const ts = dt.getTime();
        items.push({
          timestamp: ts,
          time: format(dt, 'HH:mm'),
          el: (
            <div key={session.id} className="flex items-center gap-2">
              <Coffee size={14} className="text-primary flex-shrink-0" />
              <div className="flex-1">
                <span className="text-sm text-text-main">
                  {session.type === 'focus' ? t('pomodoro.focusComplete') : t('pomodoro.breakTitle')}
                </span>
                <span className="text-xs text-text-sub ml-2">{formatDuration(session.durationMinutes)}</span>
              </div>
            </div>
          ),
        });
      });

    // Sort by timestamp descending (most recent first)
    items.sort((a, b) => b.timestamp - a.timestamp);
    return items;
  }, [selectedDate, state.tasks, state.workLogs, state.pomodoroSessions, t]);

  return (
    <div className="h-full flex flex-col">
      {/* Stats */}
      <motion.div variants={fadeIn} initial="initial" animate="animate" className="mb-3">
        <div className="flex items-center gap-1.5 mb-2">
          <span className="text-base">👣</span>
          <h3 className="text-sm font-semibold text-text-main">{t('footprint.title')}</h3>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-2xl border border-warm-dark/50 p-2.5 text-center">
            <div className="text-xl font-light text-primary">{stats.activeDays}</div>
            <div className="text-[10px] text-text-sub">{t('footprint.activeDays')}</div>
          </div>
          <div className="bg-white rounded-2xl border border-warm-dark/50 p-2.5 text-center">
            <div className="text-xl font-light text-mint">{stats.streak}</div>
            <div className="text-[10px] text-text-sub">{t('footprint.streak')}</div>
          </div>
          <div className="bg-white rounded-2xl border border-warm-dark/50 p-2.5 text-center">
            <div className="text-xl font-light text-cream">{stats.totalTasks}</div>
            <div className="text-[10px] text-text-sub">{t('footprint.totalTasks')}</div>
          </div>
        </div>
      </motion.div>

      {/* Graph */}
      <motion.div variants={fadeIn} initial="initial" animate="animate" className="mb-3">
        <div className="bg-white rounded-3xl border border-warm-dark/50 p-4">
          <ContributionGraph
            data={{
              tasks: state.tasks,
              workLogs: state.workLogs,
              pomodoroSessions: state.pomodoroSessions,
            }}
            onDateClick={setSelectedDate}
            selectedDate={selectedDate || undefined}
          />
        </div>
      </motion.div>

      {/* Timeline detail — inline below graph */}
      <AnimatePresence mode="wait">
        {selectedDate && (
          <motion.div
            key={format(selectedDate, 'yyyy-MM-dd')}
            variants={fadeIn}
            initial="initial"
            animate="animate"
            exit={{ opacity: 0, height: 0 }}
            className="flex-1 min-h-0 overflow-auto"
          >
            <div className="p-3">
              {/* Date header */}
              <div className="mb-3">
                <h4 className="text-sm font-medium text-text-main">
                  {formatRelativeDate(format(selectedDate, 'yyyy-MM-dd'))}
                </h4>
              </div>

              {timeline.length > 0 ? (
                <div className="space-y-2">
                  {timeline.map((item, idx) => (
                    <motion.div
                      key={idx}
                      variants={listItem}
                      initial="initial"
                      animate="animate"
                      className="flex gap-3 p-2 bg-warm-dark/30 rounded-xl"
                    >
                      <span className="text-xs text-text-sub/60 w-10 flex-shrink-0 pt-0.5 tabular-nums">
                        {item.time}
                      </span>
                      <div className="flex-1 min-w-0">{item.el}</div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-text-sub text-sm">{t('footprint.noData')}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}