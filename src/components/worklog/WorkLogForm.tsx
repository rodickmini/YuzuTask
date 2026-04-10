import { useState } from 'react';
import { motion } from 'framer-motion';
import type { WorkLog } from '../../types';
import Input from '../ui/Input';
import Button from '../ui/Button';
import Tag from '../ui/Tag';
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
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [date, setDate] = useState(toISODateString(new Date()));

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
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

      <div>
        <span className="text-xs text-text-sub mb-1 block">标签：</span>
        <div className="flex flex-wrap gap-1.5">
          {tags.map(tag => (
            <Tag
              key={tag}
              label={tag}
              selected={selectedTags.includes(tag)}
              onClick={() => toggleTag(tag)}
            />
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-1">
        <Button variant="ghost" type="button" onClick={onCancel}>取消</Button>
        <Button type="submit">记录</Button>
      </div>
    </motion.form>
  );
}
