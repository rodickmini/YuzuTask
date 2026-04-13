import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '../../i18n';
import { getGreeting, formatTime } from '../../utils/date';
import { usePomodoroContext } from '../../hooks/PomodoroContext';

function PomodoroIndicator() {
  const { isRunning, isPaused, isBreak, remainingSeconds } = usePomodoroContext();

  if (!isRunning) return null;

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const timeStr = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
        isPaused
          ? 'bg-cream/60 text-amber-700'
          : isBreak
          ? 'bg-mint/40 text-emerald-700'
          : 'bg-primary/15 text-primary-dark'
      }`}
    >
      <span>{isBreak ? '☕' : isPaused ? '⏸' : '🍅'}</span>
      <span className="tabular-nums">{timeStr}</span>
    </motion.div>
  );
}

export default function Header() {
  const { t, i18n } = useTranslation();
  const [time, setTime] = useState(new Date());
  const [greeting, setGreeting] = useState(getGreeting());

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setTime(now);
      setGreeting(getGreeting());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    document.title = t('brand.title');
  }, [i18n.language, t]);

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="flex items-center justify-between px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-2"
    >
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <img src="/icons/icon-48.png" alt="" className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg" />
        <span className="text-base sm:text-lg font-semibold text-primary tracking-wide whitespace-nowrap">{t('brand.name')}</span>
        <span className="text-warm-dark hidden sm:inline">·</span>
        <motion.span
          className="text-xl sm:text-2xl"
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
        >
          {greeting.emoji}
        </motion.span>
        <span className="text-sm sm:text-lg text-text-main font-medium truncate">{greeting.text}</span>
      </div>
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <PomodoroIndicator />
        <motion.div
          className="text-xl sm:text-2xl lg:text-3xl font-light text-text-main tabular-nums tracking-wider"
          key={formatTime(time)}
        >
          {formatTime(time)}
        </motion.div>
      </div>
    </motion.header>
  );
}