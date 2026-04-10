import { useState } from 'react';
import { motion } from 'framer-motion';
import type { Task } from '../../types';
import Input from '../ui/Input';
import Button from '../ui/Button';
import Tag from '../ui/Tag';
import { generateId } from '../../utils/storage';

interface TaskFormProps {
  task?: Task;
  tags: string[];
  onSave: (task: Task) => void;
  onCancel: () => void;
}

export default function TaskForm({ task, tags, onSave, onCancel }: TaskFormProps) {
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [priority, setPriority] = useState<Task['priority']>(task?.priority || 'medium');
  const [selectedTags, setSelectedTags] = useState<string[]>(task?.tags || []);
  const [estimatedMinutes, setEstimatedMinutes] = useState(task?.estimatedMinutes?.toString() || '');
  const [dueDate, setDueDate] = useState(task?.dueDate || '');

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const now = new Date().toISOString();
    const newTask: Task = {
      id: task?.id || generateId(),
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      tags: selectedTags,
      status: task?.status || 'todo',
      estimatedMinutes: estimatedMinutes ? parseInt(estimatedMinutes) : undefined,
      dueDate: dueDate || undefined,
      createdAt: task?.createdAt || now,
      completedAt: task?.completedAt,
      order: task?.order ?? Date.now(),
    };
    onSave(newTask);
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="space-y-4"
    >
      <Input
        placeholder="任务名称..."
        value={title}
        onChange={e => setTitle(e.target.value)}
        autoFocus
      />

      <textarea
        placeholder="描述（可选）"
        value={description}
        onChange={e => setDescription(e.target.value)}
        className="w-full px-3 py-2 bg-white border border-warm-dark rounded-xl text-sm text-text-main placeholder:text-text-sub/50 outline-none transition-all focus:border-primary focus:shadow-soft resize-none h-16"
      />

      {/* Priority */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-text-sub">优先级：</span>
        {(['low', 'medium', 'high'] as const).map(p => (
          <motion.button
            key={p}
            type="button"
            whileTap={{ scale: 0.9 }}
            onClick={() => setPriority(p)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
              priority === p
                ? p === 'high' ? 'bg-accent text-white'
                  : p === 'medium' ? 'bg-cream text-amber-700'
                  : 'bg-mint text-emerald-700'
                : 'bg-warm-dark text-text-sub'
            }`}
          >
            {p === 'high' ? '高' : p === 'medium' ? '中' : '低'}
          </motion.button>
        ))}
      </div>

      {/* Tags */}
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

      {/* Duration & Due date */}
      <div className="flex gap-3">
        <div className="flex-1">
          <Input
            label="预计时长(分钟)"
            type="number"
            placeholder="30"
            value={estimatedMinutes}
            onChange={e => setEstimatedMinutes(e.target.value)}
          />
        </div>
        <div className="flex-1">
          <Input
            label="截止日期"
            type="date"
            value={dueDate}
            onChange={e => setDueDate(e.target.value)}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="ghost" type="button" onClick={onCancel}>取消</Button>
        <Button type="submit">{task ? '保存' : '添加'}</Button>
      </div>
    </motion.form>
  );
}
