import type { WorkLog, DeletedItem } from '../types';
import type { Action } from '../store';
import * as storage from '../utils/storage';
import { showToast } from '../components/ui/Toast';
import i18n from '../i18n';

const t = (key: string) => i18n.t(key);

interface ServiceContext {
  dispatch: React.Dispatch<Action>;
  workLogs: WorkLog[];
  trash: DeletedItem[];
}

export async function addWorkLog(ctx: ServiceContext, log: WorkLog): Promise<void> {
  ctx.dispatch({ type: 'ADD_WORKLOG', payload: log });
  const logs = [...ctx.workLogs, log];
  await storage.saveWorkLogs(logs);
  showToast(t('worklog.added'));
}

export async function updateWorkLog(ctx: ServiceContext, log: WorkLog): Promise<void> {
  ctx.dispatch({ type: 'UPDATE_WORKLOG', payload: log });
  const logs = ctx.workLogs.map(l => l.id === log.id ? log : l);
  await storage.saveWorkLogs(logs);
  showToast(t('worklog.updated'));
}

export async function deleteWorkLog(ctx: ServiceContext, id: string): Promise<void> {
  const log = ctx.workLogs.find(l => l.id === id);
  if (!log) return;

  const trashItem: DeletedItem = { id: log.id, type: 'worklog', data: log, deletedAt: new Date().toISOString() };
  ctx.dispatch({ type: 'MOVE_TO_TRASH', payload: trashItem });
  const updatedTrash = [trashItem, ...ctx.trash];
  await storage.saveTrash(updatedTrash);

  ctx.dispatch({ type: 'DELETE_WORKLOG', payload: id });
  const logs = ctx.workLogs.filter(l => l.id !== id);
  await storage.saveWorkLogs(logs);
  showToast(t('worklog.deleted'));
}
