import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpDown, ChevronDown } from 'lucide-react';
import { useTranslation } from '../../i18n';

export type SortBy = 'priority' | 'createdAt' | 'dueDate';

interface TaskFilterProps {
  statusFilter: 'all' | 'todo' | 'in_progress' | 'done';
  onStatusChange: (status: 'all' | 'todo' | 'in_progress' | 'done') => void;
  sortBy: SortBy;
  onSortChange: (sortBy: SortBy) => void;
}

const statusOptions = [
  { value: 'all' as const, labelKey: 'task.filter.all' },
  { value: 'todo' as const, labelKey: 'task.filter.todo' },
  { value: 'in_progress' as const, labelKey: 'task.filter.inProgress' },
  { value: 'done' as const, labelKey: 'task.filter.done' },
];

const sortOptions: { value: SortBy; labelKey: string }[] = [
  { value: 'priority', labelKey: 'task.sort.priority' },
  { value: 'createdAt', labelKey: 'task.sort.createdAt' },
  { value: 'dueDate', labelKey: 'task.sort.dueDate' },
];

export default function TaskFilter({ statusFilter, onStatusChange, sortBy, onSortChange }: TaskFilterProps) {
  const { t } = useTranslation();
  const [showSortMenu, setShowSortMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showSortMenu) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowSortMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showSortMenu]);

  return (
    <div className="flex items-center justify-between">
      {/* Status filters */}
      <div className="flex items-center gap-1.5">
        {statusOptions.map(opt => (
          <motion.button
            key={opt.value}
            whileTap={{ scale: 0.95 }}
            onClick={() => onStatusChange(opt.value)}
            className={`px-3 py-1 rounded-xl text-xs font-medium transition-colors ${
              statusFilter === opt.value
                ? 'bg-primary text-white'
                : 'bg-warm-dark text-text-sub hover:text-text-main'
            }`}
          >
            {t(opt.labelKey)}
          </motion.button>
        ))}
      </div>

      {/* Sort selector */}
      <div className="relative" ref={menuRef}>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowSortMenu(prev => !prev)}
          className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-text-sub hover:bg-warm-dark transition-colors"
        >
          <ArrowUpDown size={12} />
          <span>{t(`task.sort.${sortBy}`)}</span>
          <ChevronDown size={10} className={`transition-transform ${showSortMenu ? 'rotate-180' : ''}`} />
        </motion.button>

        {showSortMenu && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-soft-lg border border-warm-dark/50 py-1 z-10 min-w-[120px]"
          >
            {sortOptions.map(opt => (
              <button
                key={opt.value}
                onClick={() => { onSortChange(opt.value); setShowSortMenu(false); }}
                className={`w-full px-3 py-1.5 text-left text-xs transition-colors ${
                  sortBy === opt.value
                    ? 'text-primary font-medium bg-primary/5'
                    : 'text-text-main hover:bg-warm-dark/50'
                }`}
              >
                {t(opt.labelKey)}
              </button>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
