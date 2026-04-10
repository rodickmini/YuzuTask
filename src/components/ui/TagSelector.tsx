import Tag from './Tag';

interface TagSelectorProps {
  tags: string[];
  selectedTags: string[];
  onToggle: (tag: string) => void;
}

export default function TagSelector({ tags, selectedTags, onToggle }: TagSelectorProps) {
  return (
    <div>
      <span className="text-xs text-text-sub mb-1 block">标签：</span>
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
