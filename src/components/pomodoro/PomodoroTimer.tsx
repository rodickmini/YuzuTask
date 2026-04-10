import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { useAppState } from '../../store';
import type { PomodoroSession, WorkLog } from '../../types';
import { useTranslation } from '../../i18n';
import * as storage from '../../utils/storage';
import { showToast } from '../ui/Toast';
import { toISODateString } from '../../utils/date';

export default function PomodoroTimer() {
  const { state, dispatch } = useAppState();
  const { t } = useTranslation();
  const { settings } = state;

  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(settings.pomodoroFocusMinutes * 60);
  const [totalSeconds, setTotalSeconds] = useState(settings.pomodoroFocusMinutes * 60);
  const [completedCount, setCompletedCount] = useState(0);
  const [selectedTaskId, setSelectedTaskId] = useState<string | undefined>();
  const [encouragement, setEncouragement] = useState('');

  const intervalRef = useRef<number | null>(null);
  const startedAtRef = useRef<number>(0);

  const activeTasks = state.tasks.filter(t => t.status !== 'done');

  // Pick random encouragement
  useEffect(() => {
    const encouragements = t('encouragements', { returnObjects: true }) as string[];
    const idx = Math.floor(Math.random() * encouragements.length);
    setEncouragement(encouragements[idx]);
  }, [isRunning, t]);

  const stopTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const completeFocus = useCallback(async () => {
    stopTimer();
    setIsRunning(false);
    setIsPaused(false);

    // Record pomodoro session
    const session: PomodoroSession = {
      id: storage.generateId(),
      taskId: selectedTaskId,
      startedAt: new Date(startedAtRef.current).toISOString(),
      endedAt: new Date().toISOString(),
      durationMinutes: settings.pomodoroFocusMinutes,
      type: 'focus',
    };
    const sessions = await storage.getPomodoroSessions();
    await storage.savePomodoroSessions([...sessions, session]);

    // Auto-create work log if task selected
    if (selectedTaskId) {
      const task = state.tasks.find(t => t.id === selectedTaskId);
      if (task) {
        const log: WorkLog = {
          id: storage.generateId(),
          content: `${t('pomodoro.focusComplete')}${task.title}`,
          tags: task.tags,
          durationMinutes: settings.pomodoroFocusMinutes,
          date: toISODateString(new Date()),
          relatedTaskId: selectedTaskId,
          createdAt: new Date().toISOString(),
        };
        dispatch({ type: 'ADD_WORKLOG', payload: log });
        const logs = [...state.workLogs, log];
        await storage.saveWorkLogs(logs);
      }
    }

    const newCount = completedCount + 1;
    setCompletedCount(newCount);

    // Start break
    const breakMinutes = newCount % settings.longBreakInterval === 0
      ? settings.longBreakMinutes
      : settings.pomodoroBreakMinutes;

    setIsBreak(true);
    setTotalSeconds(breakMinutes * 60);
    setRemainingSeconds(breakMinutes * 60);
    showToast(t('pomodoro.focusDone'));
  }, [selectedTaskId, settings, state.tasks, state.workLogs, completedCount, dispatch, stopTimer]);

  const completeBreak = useCallback(() => {
    stopTimer();
    setIsBreak(false);
    setIsRunning(false);
    setIsPaused(false);
    setTotalSeconds(settings.pomodoroFocusMinutes * 60);
    setRemainingSeconds(settings.pomodoroFocusMinutes * 60);
    showToast(t('pomodoro.breakDone'));
  }, [settings.pomodoroFocusMinutes, stopTimer]);

  useEffect(() => {
    if (isRunning && !isPaused) {
      intervalRef.current = window.setInterval(() => {
        setRemainingSeconds(prev => {
          if (prev <= 1) {
            if (isBreak) {
              completeBreak();
            } else {
              completeFocus();
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => stopTimer();
  }, [isRunning, isPaused, isBreak, completeFocus, completeBreak, stopTimer]);

  const startTimer = () => {
    startedAtRef.current = Date.now();
    setIsRunning(true);
    setIsPaused(false);
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  const resetTimer = () => {
    stopTimer();
    setIsRunning(false);
    setIsPaused(false);
    setIsBreak(false);
    setTotalSeconds(settings.pomodoroFocusMinutes * 60);
    setRemainingSeconds(settings.pomodoroFocusMinutes * 60);
  };

  const progress = totalSeconds > 0 ? (totalSeconds - remainingSeconds) / totalSeconds : 0;
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;

  // Circle radius and circumference for progress ring
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress * circumference);

  return (
    <div className="flex flex-col items-center">
      <h3 className="text-sm font-semibold text-text-main flex items-center gap-1.5 mb-4">
        <span className="text-base">🍅</span>
        {isBreak ? t('pomodoro.breakTitle') : t('pomodoro.title')}
      </h3>

      {/* Task selector */}
      {!isRunning && !isBreak && activeTasks.length > 0 && (
        <select
          value={selectedTaskId || ''}
          onChange={e => setSelectedTaskId(e.target.value || undefined)}
          className="w-full px-3 py-2 mb-4 bg-white border border-warm-dark rounded-xl text-xs text-text-main outline-none focus:border-primary"
        >
          <option value="">{t('pomodoro.selectTask')}</option>
          {activeTasks.map(t => (
            <option key={t.id} value={t.id}>{t.title}</option>
          ))}
        </select>
      )}

      {/* Timer circle */}
      <div className="relative w-48 h-48 mb-4">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 180 180">
          {/* Background circle */}
          <circle
            cx="90" cy="90" r={radius}
            fill="none"
            stroke="var(--color-warm-dark)"
            strokeWidth="8"
          />
          {/* Progress circle */}
          <motion.circle
            cx="90" cy="90" r={radius}
            fill="none"
            stroke={isBreak ? 'var(--color-mint)' : 'var(--color-primary)'}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.5, ease: 'linear' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-light text-text-main tabular-nums tracking-wider">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </span>
          {isRunning && !isPaused && !isBreak && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs text-text-sub mt-1"
            >
              {encouragement}
            </motion.p>
          )}
        </div>
      </div>

      {/* Completed count */}
      <div className="flex items-center gap-1 mb-4">
        {Array.from({ length: Math.min(completedCount, 8) }).map((_, i) => (
          <motion.span
            key={i}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: i * 0.1, type: 'spring' }}
            className="text-sm"
          >
            🍅
          </motion.span>
        ))}
        {completedCount > 8 && (
          <span className="text-xs text-text-sub">+{completedCount - 8}</span>
        )}
        {completedCount === 0 && (
          <span className="text-xs text-text-sub">{t('pomodoro.emptyState')}</span>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        {!isRunning ? (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={startTimer}
            className="flex items-center gap-1.5 px-5 py-2.5 bg-primary text-white rounded-2xl text-sm font-medium shadow-soft hover:bg-primary-dark transition-colors"
          >
            <Play size={16} />
            {isBreak ? t('pomodoro.startBreak') : t('pomodoro.startFocus')}
          </motion.button>
        ) : (
          <>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={togglePause}
              className="flex items-center gap-1.5 px-4 py-2 bg-cream text-amber-700 rounded-2xl text-sm font-medium shadow-soft"
            >
              {isPaused ? <Play size={16} /> : <Pause size={16} />}
              {isPaused ? t('pomodoro.resume') : t('pomodoro.pause')}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={resetTimer}
              className="p-2 rounded-xl bg-warm-dark text-text-sub hover:text-text-main transition-colors"
            >
              <RotateCcw size={16} />
            </motion.button>
          </>
        )}
      </div>
    </div>
  );
}
