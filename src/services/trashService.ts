import type { Task, WorkLog, DeletedItem } from '../types';
import type { Action } from '../store';
import * as storage from '../utils/storage';
import { showToast } from '../components/ui/Toast';
import i18n from '../i18n';

const t = (key: string) => i18n.t(key);

interface ServiceContext {
  dispatch: React.Dispatch<Action>;
  tasks: Task[];
  workLogs: WorkLog[];
  trash: DeletedItem[];
}

export async function restoreItem(ctx: ServiceContext, item: DeletedItem): Promise<void> {
  if (item.type === 'task') {
    const task = item.data as Task;
    if (!ctx.tasks.find(t => t.id === task.id)) {
      ctx.dispatch({ type: 'ADD_TASK', payload: task });
      const updated = [...ctx.tasks, task];
      await storage.saveTasks(updated);
    }
  } else {
    const log = item.data as WorkLog;
    if (!ctx.workLogs.find(l => l.id === log.id)) {
      ctx.dispatch({ type: 'ADD_WORKLOG', payload: log });
      const updated = [...ctx.workLogs, log];
      await storage.saveWorkLogs(updated);
    }
  }

  ctx.dispatch({ type: 'RESTORE_FROM_TRASH', payload: item.id });
  const updatedTrash = ctx.trash.filter(i => i.id !== item.id);
  await storage.saveTrash(updatedTrash);
  showToast(t('trash.restored'));
}

export async function permanentDelete(ctx: ServiceContext, id: string): Promise<void> {
  ctx.dispatch({ type: 'PERMANENT_DELETE', payload: id });
  const updatedTrash = ctx.trash.filter(i => i.id !== id);
  await storage.saveTrash(updatedTrash);
  showToast(t('trash.permanentlyDeleted'));
}

export async function emptyTrash(ctx: ServiceContext): Promise<void> {
  ctx.dispatch({ type: 'EMPTY_TRASH' });
  await storage.saveTrash([]);
  showToast(t('trash.emptied'));
}
