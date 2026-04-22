import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Trash2, AlertTriangle } from 'lucide-react';
import { useAppState } from '../../store';
import { useTranslation } from '../../i18n';
import * as trashService from '../../services/trashService';
import { listItem, fadeIn } from '../ui/animations';
import { TRASH_CONFIG } from '../../constants';
import { useConfirm } from '../../hooks/useConfirm';
import type { Task, WorkLog } from '../../types';
import type React from 'react';

export default function TrashView({ sidebarToggleButton }: { sidebarToggleButton?: React.ReactNode }) {
  const { state, dispatch } = useAppState();
  const { t } = useTranslation();

  const taskItems = useMemo(() => state.trash.filter(i => i.type === 'task'), [state.trash]);
  const workLogItems = useMemo(() => state.trash.filter(i => i.type === 'worklog'), [state.trash]);

  const getDaysRemaining = (deletedAt: string) => {
    const days = TRASH_CONFIG.AUTO_PURGE_DAYS - Math.floor((Date.now() - new Date(deletedAt).getTime()) / (24 * 60 * 60 * 1000));
    return Math.max(0, days);
  };

  const { confirm, ConfirmDialog } = useConfirm();

  const serviceCtx = { dispatch, tasks: state.tasks, workLogs: state.workLogs, trash: state.trash };

  const handleRestore = async (item: typeof state.trash[number]) => {
    const name = item.type === 'task' ? (item.data as Task).title : (item.data as WorkLog).content;
    const confirmed = await confirm({ title: t('trash.restore'), message: t('trash.confirmRestore', { name }) });
    if (!confirmed) return;
    await trashService.restoreItem(serviceCtx, item);
  };

  const handlePermanentDelete = async (id: string) => {
    const item = state.trash.find(i => i.id === id);
    if (!item) return;
    const name = item.type === 'task' ? (item.data as Task).title : (item.data as WorkLog).content;
    const confirmed = await confirm({ title: t('trash.permanentDelete'), message: t('trash.confirmPermanentDelete', { name }), variant: 'danger' });
    if (!confirmed) return;
    await trashService.permanentDelete(serviceCtx, id);
  };

  const handleEmptyTrash = async () => {
    const confirmed = await confirm({ title: t('trash.emptyTrash'), message: t('trash.confirmEmptyTrash'), variant: 'danger' });
    if (!confirmed) return;
    await trashService.emptyTrash(serviceCtx);
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
          {sidebarToggleButton}
          {t('trash.title')}
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
      <ConfirmDialog />
    </div>
  );
}
