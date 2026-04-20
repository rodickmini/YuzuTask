import { motion } from 'framer-motion';
import { useTranslation } from '../../i18n';

interface TaskFilterProps {
  statusFilter: 'all' | 'todo' | 'in_progress' | 'done';
  onStatusChange: (status: 'all' | 'todo' | 'in_progress' | 'done') => void;
}

const statusOptions = [
  { value: 'all' as const, labelKey: 'task.filter.all' },
  { value: 'todo' as const, labelKey: 'task.filter.todo' },
  { value: 'in_progress' as const, labelKey: 'task.filter.inProgress' },
  { value: 'done' as const, labelKey: 'task.filter.done' },
];

export default function TaskFilter({ statusFilter, onStatusChange }: TaskFilterProps) {
  const { t } = useTranslation();

  return (
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
  );
}
