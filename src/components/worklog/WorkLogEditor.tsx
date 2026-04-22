import { useState, useDeferredValue } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import type { WorkLog } from '../../types';
import Input from '../ui/Input';
import Button from '../ui/Button';
import TagSelector from '../ui/TagSelector';
import MarkdownPreview from './MarkdownPreview';
import { fadeInUp } from '../ui/animations';
import { useTagSelection } from '../../hooks/useTagSelection';
import { generateId } from '../../utils/storage';
import { toISODateString } from '../../utils/date';
import { useTranslation } from '../../i18n';

interface WorkLogEditorProps {
  initialData?: WorkLog;
  tags: string[];
  onSave: (log: WorkLog) => void;
  onBack: () => void;
}

export default function WorkLogEditor({ initialData, tags, onSave, onBack }: WorkLogEditorProps) {
  const { t } = useTranslation();
  const [content, setContent] = useState(initialData?.content || '');
  const [durationMinutes, setDurationMinutes] = useState(initialData?.durationMinutes?.toString() || '');
  const [date, setDate] = useState(initialData?.date || toISODateString(new Date()));
  const { selectedTags, toggleTag } = useTagSelection(initialData?.tags);

  const deferredContent = useDeferredValue(content);

  const handleSave = () => {
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
    <motion.div
      variants={fadeInUp}
      initial="initial"
      animate="animate"
      className="flex flex-col h-full"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-text-sub hover:text-text-main transition-colors"
        >
          <ArrowLeft size={16} />
          <span className="text-xs">{t('worklog.back')}</span>
        </button>
        <h3 className="text-sm font-semibold text-text-main">
          {initialData ? t('worklog.editWorkLog') : t('worklog.addWorkLog')}
        </h3>
        <Button onClick={handleSave}>{t('worklog.save')}</Button>
      </div>

      {/* Split pane */}
      <div className="flex-1 min-h-0 flex gap-3 mb-3">
        {/* Editor */}
        <div className="flex-1 relative">
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder={t('worklog.editorPlaceholder')}
            autoFocus
            className="w-full h-full px-4 py-3 bg-white border border-warm-dark rounded-2xl text-sm text-text-main placeholder:text-text-sub/40 outline-none transition-all focus:border-primary focus:shadow-soft resize-none font-mono leading-relaxed"
          />
        </div>
        {/* Preview */}
        <div className="flex-1 bg-white border border-warm-dark/50 rounded-2xl overflow-hidden">
          <MarkdownPreview content={deferredContent} />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center gap-3 pt-2 border-t border-warm-dark/50">
        <div className="w-24">
          <Input
            label={t('worklog.duration')}
            type="number"
            placeholder="30"
            value={durationMinutes}
            onChange={e => setDurationMinutes(e.target.value)}
          />
        </div>
        <div className="w-36">
          <Input
            label={t('worklog.date')}
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
          />
        </div>
        <div className="flex-1">
          <TagSelector tags={tags} selectedTags={selectedTags} onToggle={toggleTag} />
        </div>
      </div>
    </motion.div>
  );
}
