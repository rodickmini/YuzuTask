import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getGreeting, formatTime } from '../../utils/date';

export default function Header() {
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
      <motion.div
        className="text-3xl font-light text-text-main tabular-nums tracking-wider"
        key={formatTime(time)}
      >
        {formatTime(time)}
      </motion.div>
    </motion.header>
  );
}
