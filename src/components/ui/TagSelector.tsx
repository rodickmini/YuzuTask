import Tag from './Tag';
import { useTranslation } from '../../i18n';

interface TagSelectorProps {
  tags: string[];
  selectedTags: string[];
  onToggle: (tag: string) => void;
}

export default function TagSelector({ tags, selectedTags, onToggle }: TagSelectorProps) {
  const { t } = useTranslation();

  return (
    <div>
      <span className="text-xs text-text-sub mb-1 block">{t('task.tags')}</span>
      <div className="flex flex-wrap gap-1.5">
        {tags.map(tag => (
          <Tag
            key={tag}
            label={tag}
            selected={selectedTags.includes(tag)}
            onClick={() => onToggle(tag)}
          />
        ))}
      </div>
    </div>
  );
}
