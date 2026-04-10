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
  useTranslation();
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

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="flex items-center justify-between px-8 pt-6 pb-2"
    >
      <div className="flex items-center gap-3">
        <motion.span
          className="text-2xl"
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
        >
          {greeting.emoji}
        </motion.span>
        <span className="text-lg text-text-main font-medium">{greeting.text}</span>
      </div>
      <div className="flex items-center gap-3">
        <PomodoroIndicator />
        <motion.div
          className="text-3xl font-light text-text-main tabular-nums tracking-wider"
          key={formatTime(time)}
        >
          {formatTime(time)}
        </motion.div>
      </div>
    </motion.header>
  );
}