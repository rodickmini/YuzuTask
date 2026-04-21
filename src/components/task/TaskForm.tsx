import { useState } from 'react';
import { motion } from 'framer-motion';
import type { Task } from '../../types';
import { PRIORITY_CONFIG } from '../../types';
import Input from '../ui/Input';
import Button from '../ui/Button';
import TagSelector from '../ui/TagSelector';
import { fadeInUp } from '../ui/animations';
import { useTagSelection } from '../../hooks/useTagSelection';
import { generateId } from '../../utils/storage';
import { useTranslation } from '../../i18n';

interface TaskFormProps {
  task?: Task;
  tags: string[];
  defaultTags?: string[];
  onSave: (task: Task) => void;
  onCancel: () => void;
}

export default function TaskForm({ task, tags, defaultTags, onSave, onCancel }: TaskFormProps) {
  const { t } = useTranslation();
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [priority, setPriority] = useState<Task['priority']>(task?.priority || 'medium');
  const { selectedTags, toggleTag } = useTagSelection(task?.tags || defaultTags || []);
  const [estimatedMinutes, setEstimatedMinutes] = useState(task?.estimatedMinutes?.toString() || '');
  const [dueDate, setDueDate] = useState(task?.dueDate || '');

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
      variants={fadeInUp}
      initial="initial"
      animate="animate"
      onSubmit={handleSubmit}
      className="space-y-4"
    >
      <Input
        placeholder={t('task.titlePlaceholder')}
        value={title}
        onChange={e => setTitle(e.target.value)}
        autoFocus
      />

      <textarea
        placeholder={t('task.descriptionPlaceholder')}
        value={description}
        onChange={e => setDescription(e.target.value)}
        className="w-full px-3 py-2 bg-white border border-warm-dark rounded-xl text-sm text-text-main placeholder:text-text-sub/50 outline-none transition-all focus:border-primary focus:shadow-soft resize-none h-16"
      />

      {/* Priority */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-text-sub">{t('task.priority')}</span>
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
            {t(PRIORITY_CONFIG[p].label)}
          </motion.button>
        ))}
      </div>

      {/* Tags */}
      <TagSelector tags={tags} selectedTags={selectedTags} onToggle={toggleTag} />

      {/* Duration & Due date */}
      <div className="flex gap-3">
        <div className="flex-1">
          <Input
            label={t('task.estimatedDuration')}
            type="number"
            placeholder="30"
            value={estimatedMinutes}
            onChange={e => setEstimatedMinutes(e.target.value)}
          />
        </div>
        <div className="flex-1">
          <Input
            label={t('task.dueDate')}
            type="date"
            value={dueDate}
            onChange={e => setDueDate(e.target.value)}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="ghost" type="button" onClick={onCancel}>{t('task.cancel')}</Button>
        <Button type="submit">{task ? t('task.save') : t('task.add')}</Button>
      </div>
    </motion.form>
  );
}
