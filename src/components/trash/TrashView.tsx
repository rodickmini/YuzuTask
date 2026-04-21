import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Trash2, AlertTriangle, ArrowLeft } from 'lucide-react';
import { useAppState } from '../../store';
import { useTranslation } from '../../i18n';
import * as storage from '../../utils/storage';
import { showToast } from '../ui/Toast';
import { listItem, fadeIn } from '../ui/animations';
import type { Task, WorkLog } from '../../types';

export default function TrashView() {
  const { state, dispatch } = useAppState();
  const { t } = useTranslation();

  const taskItems = useMemo(() => state.trash.filter(i => i.type === 'task'), [state.trash]);
  const workLogItems = useMemo(() => state.trash.filter(i => i.type === 'worklog'), [state.trash]);

  const getDaysRemaining = (deletedAt: string) => {
    const days = 30 - Math.floor((Date.now() - new Date(deletedAt).getTime()) / (24 * 60 * 60 * 1000));
    return Math.max(0, days);
  };

  const handleRestore = async (item: typeof state.trash[number]) => {
    const name = item.type === 'task' ? (item.data as Task).title : (item.data as WorkLog).content;
    if (!confirm(t('trash.confirmRestore', { name }))) return;

    // Restore item to active list
    if (item.type === 'task') {
      const task = item.data as Task;
      // Only restore if not already present
      if (!state.tasks.find(t => t.id === task.id)) {
        dispatch({ type: 'ADD_TASK', payload: task });
        const updated = [...state.tasks, task];
        await storage.saveTasks(updated);
      }
    } else {
      const log = item.data as WorkLog;
      if (!state.workLogs.find(l => l.id === log.id)) {
        dispatch({ type: 'ADD_WORKLOG', payload: log });
        const updated = [...state.workLogs, log];
        await storage.saveWorkLogs(updated);
      }
    }

    // Remove from trash
    dispatch({ type: 'RESTORE_FROM_TRASH', payload: item.id });
    const updatedTrash = state.trash.filter(i => i.id !== item.id);
    await storage.saveTrash(updatedTrash);
    showToast(t('trash.restored'));
  };

  const handlePermanentDelete = async (id: string) => {
    const item = state.trash.find(i => i.id === id);
    if (!item) return;
    const name = item.type === 'task' ? (item.data as Task).title : (item.data as WorkLog).content;
    if (!confirm(t('trash.confirmPermanentDelete', { name }))) return;

    dispatch({ type: 'PERMANENT_DELETE', payload: id });
    const updatedTrash = state.trash.filter(i => i.id !== id);
    await storage.saveTrash(updatedTrash);
    showToast(t('trash.permanentlyDeleted'));
  };

  const handleEmptyTrash = async () => {
    if (!confirm(t('trash.confirmEmptyTrash'))) return;

    dispatch({ type: 'EMPTY_TRASH' });
    await storage.saveTrash([]);
    showToast(t('trash.emptied'));
  };

  const renderItem = (item: typeof state.trash[number]) => {
    const days = getDaysRemaining(item.deletedAt);
    const name = item.type === 'task' ? (item.data as Task).title : (item.data as WorkLog).content;

    return (
      <motion.div
        key={item.id}
        variants={listItem}
        initial="initial"
        animate="animate"
        exit="exit"
        className="group flex items-center gap-3 p-3 rounded-2xl border border-warm-dark/50"
      >
        <div className="flex-1 min-w-0">
          <p className="text-sm text-text-main truncate">{name}</p>
          <p className="text-xs text-text-sub mt-0.5">
            {t('trash.daysRemaining', { days })}
          </p>
        </div>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => handleRestore(item)}
          className="p-1.5 rounded-lg hover:bg-mint/10 transition-colors"
          title={t('trash.restore')}
        >
          <RotateCcw size={14} className="text-mint" />
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => handlePermanentDelete(item.id)}
          className="p-1.5 rounded-lg hover:bg-accent/10 transition-colors"
          title={t('trash.permanentDelete')}
        >
          <Trash2 size={14} className="text-text-sub/60 hover:text-accent" />
        </motion.button>
      </motion.div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-text-main flex items-center gap-1.5">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => dispatch({ type: 'SET_VIEW', payload: 'home' })}
            className="p-1 -ml-1 rounded-lg hover:bg-black/[0.05] transition-colors"
          >
            <ArrowLeft size={16} className="text-text-sub" />
          </motion.button>
          <span className="text-base">🗑️</span> {t('trash.title')}
          <span className="text-xs text-text-sub font-normal">({state.trash.length})</span>
        </h3>
        {state.trash.length > 0 && (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleEmptyTrash}
            className="flex items-center gap-1 px-3 py-1.5 text-xs text-accent hover:bg-accent/10 rounded-xl transition-colors"
          >
            <AlertTriangle size={12} />
            {t('trash.emptyTrash')}
          </motion.button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto space-y-4 pr-1">
        {state.trash.length === 0 ? (
          <motion.div variants={fadeIn} initial="initial" animate="animate" className="text-center text-text-sub text-sm py-12">
            <p className="text-2xl mb-2">🗑️</p>
            <p>{t('trash.empty')}</p>
          </motion.div>
        ) : (
          <>
            {/* Deleted Tasks */}
            {taskItems.length > 0 && (
              <div>
                <div className="text-xs font-medium text-text-sub mb-2">{t('trash.tasks')} ({taskItems.length})</div>
                <div className="space-y-2">
                  <AnimatePresence>
                    {taskItems.map(renderItem)}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {/* Deleted Work Logs */}
            {workLogItems.length > 0 && (
              <div>
                <div className="text-xs font-medium text-text-sub mb-2">{t('trash.workLogs')} ({workLogItems.length})</div>
                <div className="space-y-2">
                  <AnimatePresence>
                    {workLogItems.map(renderItem)}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
