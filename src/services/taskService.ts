import type { Task, DeletedItem } from '../types';
import type { Action } from '../store';
import * as storage from '../utils/storage';
import * as petStorage from '../utils/petStorage';
import type { PetState } from '../utils/petStorage';
import { showToast } from '../components/ui/Toast';
import i18n from '../i18n';

const t = (key: string) => i18n.t(key);

interface ServiceContext {
  dispatch: React.Dispatch<Action>;
  tasks: Task[];
  trash: DeletedItem[];
  settings: { newTaskPosition: 'top' | 'bottom' };
  petState: PetState;
}

export async function addTask(ctx: ServiceContext, task: Task): Promise<void> {
  const adjustedTask = { ...task };
  if (ctx.settings.newTaskPosition === 'top') {
    const minOrder = ctx.tasks.length > 0
      ? Math.min(...ctx.tasks.map(t => t.order))
      : Date.now();
    adjustedTask.order = minOrder - 1;
  }
  ctx.dispatch({ type: 'ADD_TASK', payload: adjustedTask });
  const updated = [...ctx.tasks, adjustedTask];
  await storage.saveTasks(updated);
  showToast(t('task.added'));
}

export async function updateTask(ctx: ServiceContext, task: Task): Promise<void> {
  ctx.dispatch({ type: 'UPDATE_TASK', payload: task });
  const updated = ctx.tasks.map(t => t.id === task.id ? task : t);
  await storage.saveTasks(updated);
  showToast(t('task.updated'));
}

export async function toggleTask(ctx: ServiceContext, task: Task): Promise<void> {
  const isDone = task.status === 'done';
  const updated: Task = {
    ...task,
    status: isDone ? 'todo' : 'done',
    completedAt: isDone ? undefined : new Date().toISOString(),
  };
  ctx.dispatch({ type: 'UPDATE_TASK', payload: updated });
  const tasks = ctx.tasks.map(t => t.id === task.id ? updated : t);
  await storage.saveTasks(tasks);
  if (!isDone) {
    showToast(t('task.done'));
    ctx.dispatch({ type: 'ADD_FOOD', payload: 1 });
    const updatedPet = await petStorage.awardFood(1, ctx.petState);
    await petStorage.savePetState(updatedPet);
    showToast('+1 🍖', 'info');
  }
}

export async function deleteTask(ctx: ServiceContext, id: string): Promise<void> {
  const task = ctx.tasks.find(t => t.id === id);
  if (!task) return;

  const trashItem: DeletedItem = { id: task.id, type: 'task', data: task, deletedAt: new Date().toISOString() };
  ctx.dispatch({ type: 'MOVE_TO_TRASH', payload: trashItem });
  const updatedTrash = [trashItem, ...ctx.trash];
  await storage.saveTrash(updatedTrash);

  ctx.dispatch({ type: 'DELETE_TASK', payload: id });
  const tasks = ctx.tasks.filter(t => t.id !== id);
  await storage.saveTasks(tasks);
  showToast(t('task.deleted'));
}
