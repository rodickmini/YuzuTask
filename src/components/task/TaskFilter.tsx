import { useState } from 'react';
import { motion } from 'framer-motion';
import Tag from '../ui/Tag';
import { expandCollapse } from '../ui/animations';

interface TaskFilterProps {
  tags: string[];
  selectedTags: string[];
  onTagToggle: (tag: string) => void;
  statusFilter: 'all' | 'todo' | 'in_progress' | 'done';
  onStatusChange: (status: 'all' | 'todo' | 'in_progress' | 'done') => void;
}

const statusOptions = [
  { value: 'all' as const, label: '全部' },
  { value: 'todo' as const, label: '待办' },
  { value: 'in_progress' as const, label: '进行中' },
  { value: 'done' as const, label: '已完成' },
];

export default function TaskFilter({ tags, selectedTags, onTagToggle, statusFilter, onStatusChange }: TaskFilterProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="space-y-2">
      {/* Status filter */}
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
            {opt.label}
          </motion.button>
        ))}
      </div>

      {/* Tag filter */}
      {tags.length > 0 && (
        <div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-text-sub hover:text-primary transition-colors mb-1"
          >
            {expanded ? '收起标签 ▲' : '按标签筛选 ▼'}
          </button>
          {expanded && (
            <motion.div
              variants={expandCollapse}
              initial="initial"
              animate="animate"
              className="flex flex-wrap gap-1.5"
            >
              {tags.map(tag => (
                <Tag
                  key={tag}
                  label={tag}
                  selected={selectedTags.includes(tag)}
                  onClick={() => onTagToggle(tag)}
                />
              ))}
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}
