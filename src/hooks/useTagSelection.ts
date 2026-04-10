import { useState } from 'react';

export function useTagSelection(initial: string[] = []) {
  const [selectedTags, setSelectedTags] = useState<string[]>(initial);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const resetTags = () => setSelectedTags(initial);

  return { selectedTags, toggleTag, resetTags, setSelectedTags };
}
