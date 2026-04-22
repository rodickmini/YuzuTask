import { motion } from 'framer-motion';
import { useTranslation } from '../../i18n';
import { getTagBadgeColor } from '../../constants';

interface TagProps {
  label: string;
  selected?: boolean;
  onClick?: () => void;
  onRemove?: () => void;
  color?: string;
}

export default function Tag({ label, selected, onClick, onRemove, color }: TagProps) {
  const { t } = useTranslation();
  const displayLabel = label.startsWith('tag.') ? t(label, label) : label;
  const colorClass = color || getTagBadgeColor(label);

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
