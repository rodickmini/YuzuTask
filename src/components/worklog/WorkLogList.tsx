import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Clock, Calendar } from 'lucide-react';
import type { WorkLog } from '../../types';
import WorkLogForm from './WorkLogForm';
import CalendarView from './CalendarView';
import Tag from '../ui/Tag';
import Modal from '../ui/Modal';
import { cardIn, expandCollapse, fadeIn } from '../ui/animations';
import { useAppState } from '../../store';
import * as storage from '../../utils/storage';
import { showToast } from '../ui/Toast';
import { formatDuration, formatRelativeDate } from '../../utils/date';
import { useTranslation } from 'react-i18next';

export default function WorkLogList() {
  const { state, dispatch } = useAppState();
  const { t } = useTranslation();
  const [showForm, setShowForm] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const allTags = useMemo(() => {
    const tagSet = new Set(state.settings.customTags);
    state.workLogs.forEach(l => l.tags.forEach(tag => tagSet.add(tag)));
    return Array.from(tagSet);
  }, [state.workLogs, state.settings.customTags]);

  const filteredLogs = useMemo(() => {
    let logs = [...state.workLogs].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    if (selectedDate) {
      logs = logs.filter(l => l.date === selectedDate);
    }
    return logs;
  }, [state.workLogs, selectedDate]);

  const groupedLogs = useMemo(() => {
    const groups = new Map<string, WorkLog[]>();
    filteredLogs.forEach(log => {
      const existing = groups.get(log.date) || [];
      existing.push(log);
      groups.set(log.date, existing);
    });
    return Array.from(groups.entries()).sort((a, b) => b[0].localeCompare(a[0]));
  }, [filteredLogs]);

  const handleSave = async (log: WorkLog) => {
    dispatch({ type: 'ADD_WORKLOG', payload: log });
    const logs = [...state.workLogs, log];
    await storage.saveWorkLogs(logs);
    setShowForm(false);
    showToast(t('worklog.added'));
  };

  const handleDelete = async (id: string) => {
    dispatch({ type: 'DELETE_WORKLOG', payload: id });
    const logs = state.workLogs.filter(l => l.id !== id);
    await storage.saveWorkLogs(logs);
    showToast(t('worklog.deleted'));
  };

  const todayMinutes = state.workLogs
    .filter(l => l.date === new Date().toISOString().slice(0, 10))
    .reduce((sum, l) => sum + l.durationMinutes, 0);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-text-main flex items-center gap-1.5">
          <span className="text-base">📝</span> {t('worklog.title')}
          <span className="text-xs text-text-sub font-normal">
            {t('worklog.today')} {formatDuration(todayMinutes)}
          </span>
        </h3>
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCalendar(!showCalendar)}
            className={`p-2 rounded-xl text-text-sub transition-colors ${showCalendar ? 'bg-primary text-white' : 'hover:bg-warm-dark'}`}
          >
            <Calendar size={16} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1 px-3 py-1.5 bg-mint text-white rounded-xl text-xs font-medium shadow-soft hover:bg-mint/90 transition-colors"
          >
            <Plus size={14} /> {t('worklog.record')}
          </motion.button>
        </div>
      </div>

      {/* Calendar (toggle) */}
      <AnimatePresence>
        {showCalendar && (
          <motion.div
            variants={expandCollapse}
            initial="initial"
            animate="animate"
            exit="exit"
            className="mb-3 overflow-hidden"
          >
            <CalendarView
              workLogs={state.workLogs}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Date filter indicator */}
      {selectedDate && (
        <motion.div
          variants={fadeIn}
          initial="initial"
          animate="animate"
          className="flex items-center gap-2 mb-2 text-xs"
        >
          <span className="text-text-sub">{t('worklog.filter')}</span>
          <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-full">{formatRelativeDate(selectedDate)}</span>
          <button
            onClick={() => setSelectedDate(null)}
            className="text-text-sub hover:text-primary"
          >
            ✕ {t('worklog.clearFilter')}
          </button>
        </motion.div>
      )}

      {/* Log list */}
      <div className="flex-1 overflow-auto space-y-4 pr-1">
        {groupedLogs.map(([date, logs]) => (
          <div key={date}>
            <div className="text-xs font-medium text-text-sub mb-2 flex items-center gap-1">
              <Clock size={12} />
              {formatRelativeDate(date)}
              <span className="text-text-sub/50">
                · {formatDuration(logs.reduce((s, l) => s + l.durationMinutes, 0))}
              </span>
            </div>
            <div className="space-y-2">
              <AnimatePresence>
                {logs.map(log => (
                  <motion.div
                    key={log.id}
                    layout
                    variants={cardIn}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="group flex items-start gap-3 p-3 rounded-2xl border border-warm-dark/50"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-text-main">{log.content}</p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-xs text-text-sub">
                          {formatDuration(log.durationMinutes)}
                        </span>
                        {log.tags.map(tag => (
                          <Tag key={tag} label={tag} />
                        ))}
                      </div>
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDelete(log.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-accent/10 transition-all"
                    >
                      <Trash2 size={14} className="text-text-sub hover:text-accent" />
                    </motion.button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        ))}

        {groupedLogs.length === 0 && (
          <motion.div
            variants={fadeIn}
            initial="initial"
            animate="animate"
            className="text-center text-text-sub text-sm py-8"
          >
            <p className="text-2xl mb-2">📚</p>
            <p>{selectedDate ? t('worklog.emptyDay') : t('worklog.emptyState')}</p>
          </motion.div>
        )}
      </div>

      {/* Add form modal */}
      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title={t('worklog.addWorkLog')}
      >
        <WorkLogForm
          tags={allTags}
          onSave={handleSave}
          onCancel={() => setShowForm(false)}
        />
      </Modal>
    </div>
  );
}
