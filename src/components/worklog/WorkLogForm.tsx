import { useState } from 'react';
import { motion } from 'framer-motion';
import type { WorkLog } from '../../types';
import Input from '../ui/Input';
import Button from '../ui/Button';
import TagSelector from '../ui/TagSelector';
import { cardIn } from '../ui/animations';
import { useTagSelection } from '../../hooks/useTagSelection';
import { generateId } from '../../utils/storage';
import { toISODateString } from '../../utils/date';

interface WorkLogFormProps {
  tags: string[];
  onSave: (log: WorkLog) => void;
  onCancel: () => void;
}

export default function WorkLogForm({ tags, onSave, onCancel }: WorkLogFormProps) {
  const [content, setContent] = useState('');
  const [durationMinutes, setDurationMinutes] = useState('');
  const { selectedTags, toggleTag } = useTagSelection();
  const [date, setDate] = useState(toISODateString(new Date()));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    const log: WorkLog = {
      id: generateId(),
      content: content.trim(),
      tags: selectedTags,
      durationMinutes: parseInt(durationMinutes) || 30,
      date,
      createdAt: new Date().toISOString(),
    };
    onSave(log);
  };

  return (
    <motion.form
      variants={cardIn}
      initial="initial"
      animate="animate"
      onSubmit={handleSubmit}
      className="space-y-3"
    >
      <textarea
        placeholder="记录一下你做了什么..."
        value={content}
        onChange={e => setContent(e.target.value)}
        autoFocus
        className="w-full px-3 py-2 bg-white border border-warm-dark rounded-xl text-sm text-text-main placeholder:text-text-sub/50 outline-none transition-all focus:border-primary focus:shadow-soft resize-none h-20"
      />

      <div className="flex gap-3">
        <div className="flex-1">
          <Input
            label="时长(分钟)"
            type="number"
            placeholder="30"
            value={durationMinutes}
            onChange={e => setDurationMinutes(e.target.value)}
          />
        </div>
        <div className="flex-1">
          <Input
            label="日期"
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
          />
        </div>
      </div>

      <TagSelector tags={tags} selectedTags={selectedTags} onToggle={toggleTag} />

      <div className="flex justify-end gap-2 pt-1">
        <Button variant="ghost" type="button" onClick={onCancel}>取消</Button>
        <Button type="submit">记录</Button>
      </div>
    </motion.form>
  );
}
