import { useState, useMemo, useDeferredValue, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Clock, Pencil, FileText, Eye, Search } from 'lucide-react';
import type { WorkLog } from '../../types';
import MarkdownPreview from './MarkdownPreview';
import Tag from '../ui/Tag';
import Input from '../ui/Input';
import Button from '../ui/Button';
import TagSelector from '../ui/TagSelector';
import { listItem, fadeIn, fadeInUp } from '../ui/animations';
import { useAppState } from '../../store';
import * as worklogService from '../../services/worklogService';
import { formatDuration, formatRelativeDate, toISODateString } from '../../utils/date';
import { generateId } from '../../utils/storage';
import { useTranslation } from 'react-i18next';
import { useTagSelection } from '../../hooks/useTagSelection';

/** Extract a display title from markdown content (first heading or first line) */
function extractTitle(content: string): string {
  if (!content.trim()) return '';
  const lines = content.trim().split('\n');
  for (const line of lines) {
    const heading = line.match(/^#+\s+(.+)/);
    if (heading) return heading[1].trim();
  }
  // fallback: first non-empty line, truncated
  const first = lines[0].trim();
  return first.length > 60 ? first.slice(0, 60) + '…' : first;
}

/** Extract a short preview snippet (skip headings, take first paragraph text) */
function extractSnippet(content: string): string {
  if (!content.trim()) return '';
  const lines = content.trim().split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || /^#+\s/.test(trimmed)) continue;
    return trimmed.length > 80 ? trimmed.slice(0, 80) + '…' : trimmed;
  }
  return '';
}

// ─── Inline Editor Panel ───────────────────────────────────────────────

interface DocEditorProps {
  log: WorkLog;
  tags: string[];
  onSave: (log: WorkLog) => void;
  onCancel: () => void;
}

function DocEditor({ log, tags, onSave, onCancel }: DocEditorProps) {
  const { t } = useTranslation();
  const [content, setContent] = useState(log.content);
  const [durationMinutes, setDurationMinutes] = useState(log.durationMinutes?.toString() || '');
  const [date, setDate] = useState(log.date || toISODateString(new Date()));
  const { selectedTags, toggleTag } = useTagSelection(log.tags);
  const [showPreview, setShowPreview] = useState(false);
  const deferredContent = useDeferredValue(content);

  const handleSave = () => {
    if (!content.trim()) return;
    onSave({
      ...log,
      content: content.trim(),
      tags: selectedTags,
      durationMinutes: parseInt(durationMinutes) || 0,
      date,
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-3 shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPreview(false)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${!showPreview ? 'bg-primary text-white' : 'text-text-sub hover:bg-warm-dark'}`}
          >
            <Pencil size={12} /> {t('worklog.editing')}
          </button>
          <button
            onClick={() => setShowPreview(true)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${showPreview ? 'bg-primary text-white' : 'text-text-sub hover:bg-warm-dark'}`}
          >
            <Eye size={12} /> {t('worklog.preview')}
          </button>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={onCancel}>{t('worklog.cancel')}</Button>
          <Button onClick={handleSave}>{t('worklog.save')}</Button>
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 min-h-0 mb-3">
        {showPreview ? (
          <div className="h-full bg-white border border-warm-dark/50 rounded-2xl overflow-hidden">
            <MarkdownPreview content={deferredContent} />
          </div>
        ) : (
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder={t('worklog.editorPlaceholder')}
            autoFocus
            className="w-full h-full px-4 py-3 bg-white border border-warm-dark rounded-2xl text-sm text-text-main placeholder:text-text-sub/40 outline-none transition-all focus:border-primary focus:shadow-soft resize-none font-mono leading-relaxed"
          />
        )}
      </div>

      {/* Meta fields */}
      <div className="flex items-center gap-3 pt-2 border-t border-warm-dark/50 shrink-0">
        <div className="w-24">
          <Input
            label={t('worklog.duration')}
            type="number"
            placeholder="0"
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
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────

export default function WorkLogList() {
  const { state, dispatch } = useAppState();
  const { t } = useTranslation();

  // Selected doc ID & editing state
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const allTags = useMemo(() => {
    const tagSet = new Set(state.settings.customTags);
    state.workLogs.forEach(l => l.tags.forEach(tag => tagSet.add(tag)));
    return Array.from(tagSet);
  }, [state.workLogs, state.settings.customTags]);

  const filteredLogs = useMemo(() => {
    let logs = [...state.workLogs].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const q = (searchQuery || state.searchQuery || '').toLowerCase();
    if (q) {
      logs = logs.filter(l => l.content.toLowerCase().includes(q));
    }
    return logs;
  }, [state.workLogs, searchQuery, state.searchQuery]);

  const selectedLog = useMemo(
    () => state.workLogs.find(l => l.id === selectedId) ?? null,
    [state.workLogs, selectedId],
  );

  const serviceCtx = { dispatch, workLogs: state.workLogs, trash: state.trash };

  const handleSave = useCallback(async (log: WorkLog) => {
    const isNew = !state.workLogs.find(l => l.id === log.id);
    if (isNew) {
      await worklogService.addWorkLog(serviceCtx, log);
    } else {
      await worklogService.updateWorkLog(serviceCtx, log);
    }
    setEditingId(null);
    setSelectedId(log.id);
  }, [state.workLogs, serviceCtx]);

  const handleDelete = useCallback(async (id: string) => {
    await worklogService.deleteWorkLog(serviceCtx, id);
    if (selectedId === id) {
      setSelectedId(null);
      setEditingId(null);
    }
  }, [serviceCtx, selectedId]);

  const handleNewDoc = useCallback(() => {
    const newLog: WorkLog = {
      id: generateId(),
      content: '',
      tags: [],
      durationMinutes: 0,
      date: toISODateString(new Date()),
      createdAt: new Date().toISOString(),
    };
    // We don't persist yet — save on explicit save
    setSelectedId(newLog.id);
    setEditingId(newLog.id);
    // Temporarily add to state so editor can work with it
    dispatch({ type: 'ADD_WORKLOG', payload: newLog });
  }, [dispatch]);

  const handleCancelEdit = useCallback(() => {
    // If the doc being edited is new (empty content), remove it
    if (editingId) {
      const log = state.workLogs.find(l => l.id === editingId);
      if (log && !log.content.trim()) {
        dispatch({ type: 'DELETE_WORKLOG', payload: editingId });
        setSelectedId(null);
      }
    }
    setEditingId(null);
  }, [editingId, state.workLogs, dispatch]);

  return (
    <div className="h-full flex gap-0 overflow-hidden">
      {/* ── Left: Document List ── */}
      <div className="w-[260px] shrink-0 flex flex-col border-r border-warm-dark/30 h-full">
        {/* Header */}
        <div className="px-3 pt-3 pb-2 shrink-0">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-text-main flex items-center gap-1.5">
              <span className="text-base">📄</span> {t('worklog.title')}
            </h3>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleNewDoc}
              className="flex items-center gap-1 px-2.5 py-1 bg-mint text-white rounded-lg text-xs font-medium shadow-soft hover:bg-mint/90 transition-colors"
            >
              <Plus size={12} /> {t('worklog.record')}
            </motion.button>
          </div>
          {/* Search */}
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-sub/50" />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={t('worklog.filter').replace('：', '').replace(':', '')}
              className="w-full pl-8 pr-3 py-1.5 bg-warm-dark/30 border border-transparent rounded-lg text-xs text-text-main placeholder:text-text-sub/50 outline-none focus:border-primary/30 transition-colors"
            />
          </div>
        </div>

        {/* Doc list */}
        <div className="flex-1 overflow-auto px-1.5 pb-2">
          <AnimatePresence>
            {filteredLogs.map(log => {
              const title = extractTitle(log.content) || t('worklog.untitled');
              const snippet = extractSnippet(log.content);
              const isActive = selectedId === log.id;

              return (
                <motion.div
                  key={log.id}
                  variants={listItem}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  onClick={() => {
                    setSelectedId(log.id);
                    setEditingId(null);
                  }}
                  className={`group cursor-pointer px-3 py-2.5 mx-0.5 mb-0.5 rounded-xl transition-colors ${
                    isActive
                      ? 'bg-primary/10 border border-primary/20'
                      : 'hover:bg-warm-dark/50 border border-transparent'
                  }`}
                >
                  <div className="flex items-start justify-between gap-1">
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm font-medium truncate ${isActive ? 'text-primary' : 'text-text-main'}`}>
                        {title}
                      </p>
                      {snippet && (
                        <p className="text-xs text-text-sub/70 truncate mt-0.5">{snippet}</p>
                      )}
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-[10px] text-text-sub/50">
                          {formatRelativeDate(log.date)}
                        </span>
                        {log.durationMinutes > 0 && (
                          <span className="text-[10px] text-text-sub/50 flex items-center gap-0.5">
                            <Clock size={9} /> {formatDuration(log.durationMinutes)}
                          </span>
                        )}
                      </div>
                      {log.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {log.tags.slice(0, 3).map(tag => (
                            <Tag key={tag} label={tag} />
                          ))}
                        </div>
                      )}
                    </div>
                    {/* Quick actions */}
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-all shrink-0 mt-0.5">
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={e => { e.stopPropagation(); handleDelete(log.id); }}
                        className="p-1 rounded-lg hover:bg-accent/10"
                      >
                        <Trash2 size={12} className="text-text-sub hover:text-accent" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {filteredLogs.length === 0 && (
            <motion.div
              variants={fadeIn}
              initial="initial"
              animate="animate"
              className="text-center text-text-sub text-sm py-8"
            >
              <p className="text-2xl mb-2">📚</p>
              <p>{t('worklog.emptyState')}</p>
            </motion.div>
          )}
        </div>
      </div>

      {/* ── Right: Document Detail / Editor ── */}
      <div className="flex-1 min-w-0 flex flex-col h-full">
        <AnimatePresence mode="wait">
          {selectedLog ? (
            editingId === selectedLog.id ? (
              /* Editing mode */
              <motion.div
                key={`edit-${selectedLog.id}`}
                variants={fadeInUp}
                initial="initial"
                animate="animate"
                className="flex-1 min-h-0 p-4"
              >
                <DocEditor
                  key={selectedLog.id}
                  log={selectedLog}
                  tags={allTags}
                  onSave={handleSave}
                  onCancel={handleCancelEdit}
                />
              </motion.div>
            ) : (
              /* Preview mode */
              <motion.div
                key={`preview-${selectedLog.id}`}
                variants={fadeIn}
                initial="initial"
                animate="animate"
                className="flex-1 min-h-0 flex flex-col"
              >
                {/* Detail header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-warm-dark/30 shrink-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText size={16} className="text-primary shrink-0" />
                    <span className="text-sm font-semibold text-text-main truncate">
                      {extractTitle(selectedLog.content) || t('worklog.untitled')}
                    </span>
                    <span className="text-xs text-text-sub/50 shrink-0">
                      {formatRelativeDate(selectedLog.date)}
                    </span>
                    {selectedLog.durationMinutes > 0 && (
                      <span className="text-xs text-text-sub/50 flex items-center gap-0.5 shrink-0">
                        <Clock size={10} /> {formatDuration(selectedLog.durationMinutes)}
                      </span>
                    )}
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setEditingId(selectedLog.id)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-xs font-medium hover:bg-primary/20 transition-colors"
                  >
                    <Pencil size={12} /> {t('worklog.editWorkLog')}
                  </motion.button>
                </div>

                {/* Tags */}
                {selectedLog.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 px-4 pt-2 shrink-0">
                    {selectedLog.tags.map(tag => (
                      <Tag key={tag} label={tag} />
                    ))}
                  </div>
                )}

                {/* Markdown preview */}
                <div className="flex-1 min-h-0 overflow-auto">
                  <MarkdownPreview content={selectedLog.content} />
                </div>
              </motion.div>
            )
          ) : (
            /* Empty state */
            <motion.div
              key="empty"
              variants={fadeIn}
              initial="initial"
              animate="animate"
              className="flex-1 flex flex-col items-center justify-center text-text-sub"
            >
              <FileText size={48} className="text-text-sub/20 mb-3" />
              <p className="text-sm">{t('worklog.selectDoc')}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
