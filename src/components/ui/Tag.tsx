import { motion } from 'framer-motion';

interface TagProps {
  label: string;
  selected?: boolean;
  onClick?: () => void;
  onRemove?: () => void;
  color?: string;
}

const TAG_COLORS: Record<string, string> = {
  '工作': 'bg-primary-light/40 text-primary-dark',
  '开发': 'bg-mint-light/40 text-emerald-700',
  '会议': 'bg-cream-light/40 text-amber-700',
  '文档': 'bg-accent-light/40 text-rose-600',
  '沟通': 'bg-purple-100 text-purple-600',
  '学习': 'bg-blue-100 text-blue-600',
  '生活': 'bg-pink-100 text-pink-600',
};

export default function Tag({ label, selected, onClick, onRemove, color }: TagProps) {
  const colorClass = color || TAG_COLORS[label] || 'bg-warm-dark text-text-sub';

  return (
    <motion.span
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer select-none ${colorClass} ${selected ? 'ring-2 ring-primary/30' : ''}`}
    >
      #{label}
      {onRemove && (
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          className="ml-0.5 hover:text-text-main"
        >
          ×
        </button>
      )}
    </motion.span>
  );
}
