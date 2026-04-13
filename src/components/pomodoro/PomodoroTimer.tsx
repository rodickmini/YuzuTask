import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, ChevronDown } from 'lucide-react';
import { useAppState } from '../../store';
import { usePomodoroContext } from '../../hooks/PomodoroContext';
import { useTranslation } from '../../i18n';

export default function PomodoroTimer() {
  const { state } = useAppState();
  const { t } = useTranslation();
  const {
    isRunning, isPaused, isBreak,
    remainingSeconds, completedCount,
    progress, selectedTaskId, setSelectedTaskId,
    startTimer, togglePause, resetTimer,
  } = usePomodoroContext();

  const activeTasks = state.tasks.filter(t => t.status !== 'done');

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;

  const [encouragement, setEncouragement] = useState('');

  useEffect(() => {
    if (isRunning && !isPaused) {
      const list = t('encouragements', { returnObjects: true }) as string[];
      setEncouragement(list[Math.floor(Math.random() * list.length)]);
    }
  }, [isRunning, isPaused, t]);

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
      <AnimatePresence>
        {!isRunning && !isBreak && activeTasks.length > 0 && (
          <motion.div
            key="task-selector"
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="relative w-full overflow-hidden"
          >
            <select
              value={selectedTaskId || ''}
              onChange={e => setSelectedTaskId(e.target.value || undefined)}
              className="w-full px-3 py-2 pr-8 bg-white border border-warm-dark rounded-xl text-xs text-text-main outline-none appearance-none transition-colors focus:border-primary"
            >
              <option value="">{t('pomodoro.selectTask')}</option>
              {activeTasks.map(task => (
                <option key={task.id} value={task.id}>{task.title}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-sub/50 pointer-events-none" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Timer circle */}
      <div className="relative w-48 h-48 mb-4">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 180 180">
          <circle
            cx="90" cy="90" r={radius}
            fill="none"
            stroke="var(--color-warm-dark)"
            strokeWidth="8"
          />
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
          <motion.span
            key={isRunning ? 'running' : 'idle'}
            initial={{ opacity: 0.5, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="text-4xl font-light text-text-main tabular-nums tracking-wider"
          >
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </motion.span>
          {isRunning && !isPaused && !isBreak && (
            <motion.p
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
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
      </div>

      {/* Empty state message */}
      <AnimatePresence>
        {!isRunning && completedCount === 0 && (
          <motion.p
            key="empty-state"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.3 }}
            className="text-xs text-text-sub mb-4 text-center"
          >
            {t('pomodoro.emptyState')}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Controls */}
      <div className="flex items-center gap-3">
        <AnimatePresence mode="wait">
          {!isRunning ? (
            <motion.button
              key="start-btn"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={startTimer}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-primary text-white rounded-2xl text-sm font-medium shadow-soft hover:bg-primary-dark transition-colors"
            >
              <Play size={16} />
              {isBreak ? t('pomodoro.startBreak') : t('pomodoro.startFocus')}
            </motion.button>
          ) : (
            <motion.div
              key="running-btns"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="flex items-center gap-3"
            >
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
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}