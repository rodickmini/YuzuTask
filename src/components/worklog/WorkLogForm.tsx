import { useState } from 'react';
import { motion } from 'framer-motion';
import type { WorkLog } from '../../types';
import Input from '../ui/Input';
import Button from '../ui/Button';
import TagSelector from '../ui/TagSelector';
import { fadeInUp } from '../ui/animations';
import { useTagSelection } from '../../hooks/useTagSelection';
import { generateId } from '../../utils/storage';
import { toISODateString } from '../../utils/date';
import { useTranslation } from 'react-i18next';

interface WorkLogFormProps {
  tags: string[];
  initialData?: WorkLog;
  onSave: (log: WorkLog) => void;
  onCancel: () => void;
}

export default function WorkLogForm({ tags, initialData, onSave, onCancel }: WorkLogFormProps) {
  const { t } = useTranslation();
  const [content, setContent] = useState(initialData?.content || '');
  const [durationMinutes, setDurationMinutes] = useState(initialData?.durationMinutes?.toString() || '');
  const { selectedTags, toggleTag } = useTagSelection(initialData?.tags);
  const [date, setDate] = useState(initialData?.date || toISODateString(new Date()));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    const log: WorkLog = {
      id: initialData?.id || generateId(),
      content: content.trim(),
      tags: selectedTags,
      durationMinutes: parseInt(durationMinutes) || 30,
      date,
      relatedTaskId: initialData?.relatedTaskId,
      createdAt: initialData?.createdAt || new Date().toISOString(),
    };
    onSave(log);
  };

  return (
    <motion.form
      variants={fadeInUp}
      initial="initial"
      animate="animate"
      onSubmit={handleSubmit}
      className="space-y-3"
    >
      <textarea
        placeholder={t('worklog.contentPlaceholder')}
        value={content}
        onChange={e => setContent(e.target.value)}
        autoFocus
        className="w-full px-3 py-2 bg-white border border-warm-dark rounded-xl text-sm text-text-main placeholder:text-text-sub/50 outline-none transition-all focus:border-primary focus:shadow-soft resize-none h-20"
      />

      <div className="flex gap-3">
        <div className="flex-1">
          <Input
            label={t('worklog.duration')}
            type="number"
            placeholder="30"
            value={durationMinutes}
            onChange={e => setDurationMinutes(e.target.value)}
          />
        </div>
        <div className="flex-1">
          <Input
            label={t('worklog.date')}
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
          />
        </div>
      </div>

      <TagSelector tags={tags} selectedTags={selectedTags} onToggle={toggleTag} />

      <div className="flex justify-end gap-2 pt-1">
        <Button variant="ghost" type="button" onClick={onCancel}>{t('worklog.cancel')}</Button>
        <Button type="submit">{t('worklog.record')}</Button>
      </div>
    </motion.form>
  );
}
