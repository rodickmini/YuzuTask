import { motion } from 'framer-motion';
import { useTranslation } from '../../i18n';

interface TagProps {
  label: string;
  selected?: boolean;
  onClick?: () => void;
  onRemove?: () => void;
  color?: string;
}

const TAG_COLORS: Record<string, string> = {
  'tag.work': 'bg-primary-light/40 text-primary-dark',
  'tag.dev': 'bg-mint-light/40 text-emerald-700',
  'tag.meeting': 'bg-cream-light/40 text-amber-700',
  'tag.doc': 'bg-accent-light/40 text-rose-600',
  'tag.comm': 'bg-purple-100 text-purple-600',
  'tag.learn': 'bg-blue-100 text-blue-600',
  'tag.life': 'bg-pink-100 text-pink-600',
};

export default function Tag({ label, selected, onClick, onRemove, color }: TagProps) {
  const { t } = useTranslation();
  const displayLabel = label.startsWith('tag.') ? t(label, label) : label;
  const colorClass = color || TAG_COLORS[label] || 'bg-warm-dark text-text-sub';

  return (
    <motion.span
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer select-none ${colorClass} ${selected ? 'ring-2 ring-primary/30' : ''}`}
    >
      #{displayLabel}
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
