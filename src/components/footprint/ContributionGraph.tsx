import { useMemo, useState } from 'react';
import { format, subDays, addDays } from 'date-fns';
import { enUS, zhCN, ja } from 'date-fns/locale';
import { useTranslation } from '../../i18n';
import type { Task, WorkLog, PomodoroSession } from '../../types';

interface ContributionGraphProps {
  data: {
    tasks: Task[];
    workLogs: WorkLog[];
    pomodoroSessions: PomodoroSession[];
  };
  onDateClick: (date: Date) => void;
  selectedDate?: Date;
}

interface DayData {
  date: Date;
  score: number;
}

const CELL = 10;
const GAP = 2;
const STEP = CELL + GAP;

export default function ContributionGraph({ data, onDateClick, selectedDate }: ContributionGraphProps) {
  const { i18n, t } = useTranslation();
  const [hoveredDate, setHoveredDate] = useState<DayData | null>(null);

  const { tasks, workLogs, pomodoroSessions } = data;

  const getLocale = () => {
    if (i18n.language.startsWith('zh')) return zhCN;
    if (i18n.language.startsWith('ja')) return ja;
    return enUS;
  };

  // Score map for past 365 days
  const scoreMap = useMemo(() => {
    const map = new Map<string, number>();
    const now = new Date();
    const startDate = subDays(now, 364);

    for (let i = 0; i < 365; i++) {
      map.set(format(addDays(startDate, i), 'yyyy-MM-dd'), 0);
    }

    for (const task of tasks) {
      if (!task.completedAt) continue;
      const k = format(new Date(task.completedAt), 'yyyy-MM-dd');
      if (map.has(k)) map.set(k, (map.get(k) ?? 0) + 1);
    }
    for (const log of workLogs) {
      if (map.has(log.date)) map.set(log.date, (map.get(log.date) ?? 0) + 1);
    }
    for (const s of pomodoroSessions) {
      const k = format(new Date(s.startedAt), 'yyyy-MM-dd');
      if (map.has(k)) map.set(k, (map.get(k) ?? 0) + 1);
    }

    return map;
  }, [tasks, workLogs, pomodoroSessions]);

  // Build 53-week grid
  const { columns, monthLabels } = useMemo(() => {
    const now = new Date();
    const todayDow = now.getDay();
    const todayRow = todayDow === 0 ? 6 : todayDow - 1;

    const currentMonday = new Date(now);
    currentMonday.setDate(now.getDate() - todayRow);

    const cols: DayData[][] = [];
    for (let w = 0; w < 53; w++) {
      const monday = new Date(currentMonday);
      monday.setDate(currentMonday.getDate() - w * 7);
      const rowCount = w === 0 ? todayRow + 1 : 7;
      const week: DayData[] = [];
      for (let d = 0; d < rowCount; d++) {
        const day = addDays(monday, d);
        week.push({ date: day, score: scoreMap.get(format(day, 'yyyy-MM-dd')) ?? 0 });
      }
      cols.unshift(week);
    }

    const labels: { text: string; x: number }[] = [];
    let lastMonth = -1;
    cols.forEach((week, colIdx) => {
      const ref = week.length > 2 ? week[2].date : week[week.length - 1].date;
      const m = ref.getMonth();
      if (m !== lastMonth) {
        labels.push({ text: format(ref, 'MMM', { locale: getLocale() }), x: colIdx });
        lastMonth = m;
      }
    });

    return { columns: cols, monthLabels: labels };
  }, [scoreMap, i18n.language]);

  const getColor = (score: number) => {
    if (score === 0) return 'bg-[#ebedf0]';
    if (score <= 2) return 'bg-[#ace5f7]';
    if (score <= 4) return 'bg-[#68b8e0]';
    if (score <= 6) return 'bg-[#2a8fc4]';
    return 'bg-[#0e6fa0]';
  };

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const selectedStr = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '';

  // Weekday labels at rows 0,2,4 (Mon, Wed, Fri)
  const weekdayLabels = useMemo(() => {
    const locale = getLocale();
    const now = new Date();
    const dow = now.getDay();
    const monOff = dow === 0 ? -6 : 1 - dow;
    return [0, 2, 4].map(row => {
      const d = addDays(now, monOff + row);
      return { row, text: format(d, 'EE', { locale }) };
    });
  }, [i18n.language]);

  // Total activities this year for header
  const totalActivities = useMemo(() => {
    let sum = 0;
    scoreMap.forEach(v => { sum += v; });
    return sum;
  }, [scoreMap]);

  return (
    <div>
      {/* Header line */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-text-sub">
          {totalActivities} {t('footprint.activities')} {t('footprint.inTheYear')}
        </span>
      </div>

      {/* Graph wrapper — centered */}
      <div className="flex justify-center overflow-x-auto">
        <div className="inline-flex flex-col">
          {/* Month labels */}
          <div className="relative mb-1" style={{ marginLeft: 22, height: 14 }}>
            {monthLabels.map((label, idx) => (
              <span
                key={idx}
                className="absolute text-[10px] text-text-sub/60 whitespace-nowrap"
                style={{ left: label.x * STEP }}
              >
                {label.text}
              </span>
            ))}
          </div>

          <div className="flex">
            {/* Weekday labels — positioned at exact row heights */}
            <div className="relative flex-shrink-0" style={{ width: 20 }}>
              {weekdayLabels.map(({ row, text }) => (
                <span
                  key={row}
                  className="absolute text-[10px] text-text-sub/50 leading-none text-right w-full"
                  style={{ top: row * STEP, lineHeight: `${CELL}px` }}
                >
                  {text}
                </span>
              ))}
            </div>

            {/* Grid */}
            <div className="flex" style={{ gap: GAP }}>
              {columns.map((week, colIdx) => (
                <div key={colIdx} className="flex flex-col" style={{ gap: GAP }}>
                  {week.map((dayData, rowIdx) => {
                    const dateStr = format(dayData.date, 'yyyy-MM-dd');
                    const isToday = dateStr === todayStr;
                    const isSelected = dateStr === selectedStr;

                    return (
                      <button
                        key={rowIdx}
                        onClick={() => onDateClick(dayData.date)}
                        onMouseEnter={() => setHoveredDate(dayData)}
                        onMouseLeave={() => setHoveredDate(null)}
                        className={`rounded-[2px] cursor-pointer transition-all ${getColor(dayData.score)} ${
                          isSelected ? 'ring-2 ring-accent ring-offset-1 scale-[1.3]' : 'hover:scale-125 hover:brightness-110'
                        } ${isToday && !isSelected ? 'ring-1 ring-primary/40' : ''}`}
                        style={{ width: CELL, height: CELL }}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Legend — bottom-right, aligned with grid right edge */}
          <div className="flex justify-end mt-2">
            <div className="flex items-center gap-0.5">
              <span className="text-[10px] text-text-sub/50 mr-0.5">{t('footprint.less')}</span>
              {['#ebedf0', '#ace5f7', '#68b8e0', '#2a8fc4', '#0e6fa0'].map((color, i) => (
                <div
                  key={i}
                  className="rounded-[2px]"
                  style={{ width: CELL, height: CELL, backgroundColor: color }}
                />
              ))}
              <span className="text-[10px] text-text-sub/50 ml-0.5">{t('footprint.more')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tooltip */}
      <div className="text-[10px] text-text-sub h-4 mt-2">
        {hoveredDate
          ? `${format(hoveredDate.date, 'yyyy-MM-dd', { locale: getLocale() })} — ${
              hoveredDate.score === 0 ? t('footprint.noActivity') : `${hoveredDate.score} ${t('footprint.activities')}`
            }`
          : ''}
      </div>
    </div>
  );
}