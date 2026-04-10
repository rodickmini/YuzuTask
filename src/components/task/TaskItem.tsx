import { motion } from 'framer-motion';
import { Check, Trash2, Clock, AlertCircle } from 'lucide-react';
import type { Task } from '../../types';
import { PRIORITY_CONFIG } from '../../types';
import Tag from '../ui/Tag';
import { cardIn } from '../ui/animations';
import { formatRelativeDate, formatDuration } from '../../utils/date';

interface TaskItemProps {
  task: Task;
  onToggle: (task: Task) => void;
  onDelete: (id: string) => void;
  onClick: (task: Task) => void;
}

export default function TaskItem({ task, onToggle, onDelete, onClick }: TaskItemProps) {
  const isDone = task.status === 'done';
  const priorityConfig = PRIORITY_CONFIG[task.priority];

  return (
    <motion.div
      layout
      variants={cardIn}
      initial="initial"
      animate="animate"
      exit="exit"
      whileHover={{ scale: 1.01 }}
      className={`group flex items-start gap-3 p-3 bg-white rounded-2xl shadow-card cursor-pointer transition-opacity duration-300 ${
        isDone ? 'opacity-50' : ''
      }`}
      onClick={() => onClick(task)}
    >
      {/* Checkbox */}
      <motion.button
        whileTap={{ scale: 0.8 }}
        onClick={(e) => { e.stopPropagation(); onToggle(task); }}
        className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
          isDone
            ? 'bg-primary border-primary'
            : `border-warm-dark hover:border-primary ${priorityConfig.color.replace('bg-', 'border-')}`
        }`}
      >
        {isDone && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 15 }}
          >
            <Check size={12} className="text-white" />
          </motion.div>
        )}
      </motion.button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <motion.span
            className={`text-sm font-medium truncate ${isDone ? 'line-through text-text-sub' : 'text-text-main'}`}
            animate={{ opacity: isDone ? 0.6 : 1 }}
            transition={{ duration: 0.3 }}
          >
            {task.title}
          </motion.span>
          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${priorityConfig.color}`} />
        </div>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          {task.tags.map(tag => (
            <Tag key={tag} label={tag} />
          ))}
          {task.estimatedMinutes && (
            <span className="flex items-center gap-0.5 text-xs text-text-sub">
              <Clock size={10} />
              {formatDuration(task.estimatedMinutes)}
            </span>
          )}
          {task.dueDate && (
            <span className="flex items-center gap-0.5 text-xs text-text-sub">
              <AlertCircle size={10} />
              {formatRelativeDate(task.dueDate)}
            </span>
          )}
        </div>
      </div>

      {/* Delete */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}
        className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-accent/10 transition-all"
      >
        <Trash2 size={14} className="text-text-sub hover:text-accent" />
      </motion.button>
    </motion.div>
  );
}
