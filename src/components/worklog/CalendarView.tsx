import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { format, isSameDay, addWeeks, subWeeks } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { WorkLog } from '../../types';
import { useState } from 'react';

interface CalendarViewProps {
  workLogs: WorkLog[];
  selectedDate: string | null;
  onSelectDate: (date: string | null) => void;
}

export default function CalendarView({ workLogs, selectedDate, onSelectDate }: CalendarViewProps) {
  const [weekOffset, setWeekOffset] = useState(0);

  const weekDays = useMemo(() => {
    const now = new Date();
    const ref = weekOffset > 0 ? addWeeks(now, weekOffset) : weekOffset < 0 ? subWeeks(now, Math.abs(weekOffset)) : now;
    const day = ref.getDay();
    const monday = new Date(ref);
    monday.setDate(ref.getDate() - ((day + 6) % 7));

    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d;
    });
  }, [weekOffset]);

  const logsByDate = useMemo(() => {
    const map = new Map<string, number>();
    workLogs.forEach(log => {
      map.set(log.date, (map.get(log.date) || 0) + log.durationMinutes);
    });
    return map;
  }, [workLogs]);

  const today = new Date();

  return (
    <div className="bg-white rounded-2xl p-3 shadow-card">
      {/* Navigation */}
      <div className="flex items-center justify-between mb-2">
        <button onClick={() => setWeekOffset(prev => prev - 1)} className="p-1 rounded-lg hover:bg-warm-dark">
          <ChevronLeft size={16} className="text-text-sub" />
        </button>
        <span className="text-xs font-medium text-text-main">
          {format(weekDays[0], 'M月d日', { locale: zhCN })} - {format(weekDays[6], 'M月d日', { locale: zhCN })}
        </span>
        <button onClick={() => setWeekOffset(prev => prev + 1)} className="p-1 rounded-lg hover:bg-warm-dark">
          <ChevronRight size={16} className="text-text-sub" />
        </button>
      </div>

      {/* Days */}
      <div className="grid grid-cols-7 gap-1">
        {weekDays.map(day => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const minutes = logsByDate.get(dateStr) || 0;
          const isToday = isSameDay(day, today);
          const isSelected = selectedDate === dateStr;

          return (
            <motion.button
              key={dateStr}
              whileTap={{ scale: 0.9 }}
              onClick={() => onSelectDate(isSelected ? null : dateStr)}
              className={`flex flex-col items-center py-2 px-1 rounded-xl transition-colors ${
                isSelected
                  ? 'bg-primary text-white'
                  : isToday
                  ? 'bg-primary/10 text-primary'
                  : 'hover:bg-warm-dark text-text-main'
              }`}
            >
              <span className="text-[10px] opacity-60">
                {format(day, 'EEE', { locale: zhCN })}
              </span>
              <span className={`text-sm font-medium ${isToday ? 'text-primary' : ''}`}>
                {format(day, 'd')}
              </span>
              {minutes > 0 && (
                <div className={`w-1.5 h-1.5 rounded-full mt-0.5 ${
                  isSelected ? 'bg-white' : 'bg-mint'
                }`} />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
