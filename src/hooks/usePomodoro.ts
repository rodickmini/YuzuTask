import { useState, useEffect, useCallback, useRef } from 'react';
import { useAppState } from '../store';
import type { PomodoroSession, WorkLog } from '../types';
import { useTranslation } from '../i18n';
import * as storage from '../utils/storage';
import { showToast } from '../components/ui/Toast';
import { toISODateString } from '../utils/date';

// Persisted state shape (matches storage.ts PomodoroState)
interface SavedState {
  isRunning: boolean;
  isPaused: boolean;
  startedAt: number;
  pausedRemaining?: number;
  totalSeconds: number;
  taskId?: string;
  completedCount: number;
  isBreak: boolean;
}

export function usePomodoro() {
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
  const [restored, setRestored] = useState(false);

  // Sync with settings changes when timer is idle
  useEffect(() => {
    if (!isRunning) {
      const seconds = settings.pomodoroFocusMinutes * 60;
      setTotalSeconds(seconds);
      setRemainingSeconds(seconds);
    }
  }, [settings.pomodoroFocusMinutes, isRunning]);

  const intervalRef = useRef<number | null>(null);
  const startedAtRef = useRef<number>(0);

  // Persist state to storage
  const persist = useCallback(async (partial: Partial<SavedState>) => {
    const prev = await storage.getPomodoroState();
    await storage.savePomodoroState({ ...prev, ...partial } as SavedState);
  }, []);

  const stopInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const completeFocus = useCallback(async () => {
    stopInterval();
    setIsRunning(false);
    setIsPaused(false);
    await storage.savePomodoroState(null);

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
    dispatch({ type: 'SET_POMODORO_SESSIONS', payload: [...sessions, session] });

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
        await storage.saveWorkLogs([...state.workLogs, log]);
      }
    }

    const newCount = completedCount + 1;
    setCompletedCount(newCount);

    const breakMinutes = newCount % settings.longBreakInterval === 0
      ? settings.longBreakMinutes
      : settings.pomodoroBreakMinutes;

    setIsBreak(true);
    setTotalSeconds(breakMinutes * 60);
    setRemainingSeconds(breakMinutes * 60);
    showToast(t('pomodoro.focusDone'));
  }, [selectedTaskId, settings, state.tasks, state.workLogs, completedCount, dispatch, stopInterval, t]);

  const completeBreak = useCallback(async () => {
    stopInterval();
    setIsBreak(false);
    setIsRunning(false);
    setIsPaused(false);
    setTotalSeconds(settings.pomodoroFocusMinutes * 60);
    setRemainingSeconds(settings.pomodoroFocusMinutes * 60);
    await storage.savePomodoroState(null);
    showToast(t('pomodoro.breakDone'));
  }, [settings.pomodoroFocusMinutes, stopInterval, t]);

  // Restore state from storage on mount
  useEffect(() => {
    (async () => {
      const saved = await storage.getPomodoroState() as SavedState | null;
      if (!saved || !saved.isRunning) {
        setRestored(true);
        return;
      }

      // Calculate real remaining seconds based on elapsed time
      if (saved.isPaused && saved.pausedRemaining != null) {
        // Paused: remaining is stored exactly
        setIsRunning(true);
        setIsPaused(true);
        setIsBreak(saved.isBreak);
        setRemainingSeconds(saved.pausedRemaining);
        setTotalSeconds(saved.totalSeconds);
        setCompletedCount(saved.completedCount);
        setSelectedTaskId(saved.taskId);
        startedAtRef.current = saved.startedAt;
      } else {
        // Running: calculate elapsed
        const elapsed = Math.floor((Date.now() - saved.startedAt) / 1000);
        const remaining = saved.totalSeconds - elapsed;
        if (remaining <= 0) {
          // Timer expired while tab was closed — just reset
          await storage.savePomodoroState(null);
        } else {
          setIsRunning(true);
          setIsPaused(false);
          setIsBreak(saved.isBreak);
          setRemainingSeconds(remaining);
          setTotalSeconds(saved.totalSeconds);
          setCompletedCount(saved.completedCount);
          setSelectedTaskId(saved.taskId);
          startedAtRef.current = saved.startedAt;
        }
      }
      setRestored(true);
    })();
  }, []);

  // Global interval — runs at top level, survives tab switches
  useEffect(() => {
    if (!restored) return;
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
    } else {
      stopInterval();
    }
    return () => stopInterval();
  }, [isRunning, isPaused, isBreak, restored, completeFocus, completeBreak, stopInterval]);

  const setTaskStatus = useCallback(async (taskId: string | undefined, status: 'todo' | 'in_progress') => {
    if (!taskId) return;
    const task = state.tasks.find(t => t.id === taskId);
    if (!task || task.status === 'done') return;
    const updated = { ...task, status };
    dispatch({ type: 'UPDATE_TASK', payload: updated });
    const tasks = state.tasks.map(t => t.id === taskId ? updated : t);
    await storage.saveTasks(tasks);
  }, [state.tasks, dispatch]);

  const startTimer = useCallback(() => {
    const now = Date.now();
    startedAtRef.current = now;
    setIsRunning(true);
    setIsPaused(false);
    setTaskStatus(selectedTaskId, 'in_progress');
    persist({
      isRunning: true,
      isPaused: false,
      startedAt: now,
      totalSeconds,
      taskId: selectedTaskId,
      completedCount,
      isBreak: false,
    });
  }, [totalSeconds, selectedTaskId, completedCount, persist, setTaskStatus]);

  const togglePause = useCallback(() => {
    setIsPaused(prev => {
      const next = !prev;
      if (next) {
        // Pausing — save exact remaining
        persist({ isPaused: true, pausedRemaining: remainingSeconds });
      } else {
        // Resuming — update startedAt so elapsed calc is correct
        const now = Date.now();
        startedAtRef.current = now;
        persist({ isPaused: false, startedAt: now });
      }
      return next;
    });
  }, [remainingSeconds, persist]);

  const resetTimer = useCallback(async () => {
    stopInterval();
    setIsRunning(false);
    setIsPaused(false);
    setIsBreak(false);
    setTaskStatus(selectedTaskId, 'todo');
    setTotalSeconds(settings.pomodoroFocusMinutes * 60);
    setRemainingSeconds(settings.pomodoroFocusMinutes * 60);
    await storage.savePomodoroState(null);
  }, [settings.pomodoroFocusMinutes, selectedTaskId, stopInterval, setTaskStatus]);

  const progress = totalSeconds > 0 ? (totalSeconds - remainingSeconds) / totalSeconds : 0;

  return {
    isRunning,
    isPaused,
    isBreak,
    remainingSeconds,
    totalSeconds,
    completedCount,
    selectedTaskId,
    setSelectedTaskId,
    progress,
    startTimer,
    togglePause,
    resetTimer,
  };
}