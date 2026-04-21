import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';
import type { Task, DeletedItem } from '../../types';
import TaskItem from './TaskItem';
import TaskForm from './TaskForm';
import TaskFilter, { type SortBy } from './TaskFilter';
import Modal from '../ui/Modal';
import { fadeIn } from '../ui/animations';
import { useAppState } from '../../store';
import * as storage from '../../utils/storage';
import * as petStorage from '../../utils/petStorage';
import { showToast } from '../ui/Toast';
import { toISODateString } from '../../utils/date';
import { useTranslation } from '../../i18n';

export default function TaskList({ sidebarToggleButton }: { sidebarToggleButton?: React.ReactNode }) {
  const { t } = useTranslation();
  const { state, dispatch } = useAppState();
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>();
  const [statusFilter, setStatusFilter] = useState<'all' | 'todo' | 'in_progress' | 'done'>('all');
  const [sortBy, setSortBy] = useState<SortBy>('createdAt');

  const allTags = useMemo(() => {
    const tagSet = new Set(state.settings.customTags);
    state.tasks.forEach(t => t.tags.forEach(tag => tagSet.add(tag)));
    return Array.from(tagSet);
  }, [state.tasks, state.settings.customTags]);

  const priorityWeight = { high: 3, medium: 2, low: 1 };

  const filteredTasks = useMemo(() => {
    return state.tasks
      .filter(t => {
        if (statusFilter !== 'all' && t.status !== statusFilter) return false;
        if (state.selectedTag && !t.tags.includes(state.selectedTag)) return false;
        return true;
      })
      .sort((a, b) => {
        // Done items at bottom unless filtering by done
        if (statusFilter !== 'done') {
          if (a.status === 'done' && b.status !== 'done') return 1;
          if (a.status !== 'done' && b.status === 'done') return -1;
        }
        switch (sortBy) {
          case 'priority':
            return priorityWeight[b.priority] - priorityWeight[a.priority];
          case 'dueDate': {
            const aDate = a.dueDate || '9999-99-99';
            const bDate = b.dueDate || '9999-99-99';
            return aDate.localeCompare(bDate);
          }
          case 'createdAt':
            return b.createdAt.localeCompare(a.createdAt);
          default:
            return 0;
        }
      });
  }, [state.tasks, statusFilter, state.selectedTag, sortBy]);

  const todayTasks = filteredTasks.filter(t =>
    t.status !== 'done' && (!t.dueDate || t.dueDate >= toISODateString(new Date()))
  );
  const doneTasks = filteredTasks.filter(t => t.status === 'done');

  const handleSave = async (task: Task) => {
    const isNew = !state.tasks.find(t => t.id === task.id);
    if (isNew) {
      // Determine order based on user preference
      const adjustedTask = { ...task };
      if (state.settings.newTaskPosition === 'top') {
        const minOrder = state.tasks.length > 0
          ? Math.min(...state.tasks.map(t => t.order))
          : Date.now();
        adjustedTask.order = minOrder - 1;
      }
      dispatch({ type: 'ADD_TASK', payload: adjustedTask });
      const updated = [...state.tasks, adjustedTask];
      await storage.saveTasks(updated);
      showToast(t('task.added'));
    } else {
      dispatch({ type: 'UPDATE_TASK', payload: task });
      const updated = state.tasks.map(t => t.id === task.id ? task : t);
      await storage.saveTasks(updated);
      showToast(t('task.updated'));
    }
    setShowForm(false);
    setEditingTask(undefined);
  };

  const handleToggle = async (task: Task) => {
    const isDone = task.status === 'done';
    const updated: Task = {
      ...task,
      status: isDone ? 'todo' : 'done',
      completedAt: isDone ? undefined : new Date().toISOString(),
    };
    dispatch({ type: 'UPDATE_TASK', payload: updated });
    const tasks = state.tasks.map(t => t.id === task.id ? updated : t);
    await storage.saveTasks(tasks);
    if (!isDone) {
      showToast(t('task.done'));
      dispatch({ type: 'ADD_FOOD', payload: 1 });
      const updated = await petStorage.awardFood(1, state.petState);
      await petStorage.savePetState(updated);
      showToast('+1 粮食', 'info');
    }
  };

  const handleDelete = async (id: string) => {
    const task = state.tasks.find(t => t.id === id);
    if (!task) return;

    // Move to trash
    const trashItem: DeletedItem = { id: task.id, type: 'task', data: task, deletedAt: new Date().toISOString() };
    dispatch({ type: 'MOVE_TO_TRASH', payload: trashItem });
    const updatedTrash = [trashItem, ...state.trash];
    await storage.saveTrash(updatedTrash);

    // Remove from active tasks
    dispatch({ type: 'DELETE_TASK', payload: id });
    const tasks = state.tasks.filter(t => t.id !== id);
    await storage.saveTasks(tasks);
    showToast(t('task.deleted'));
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-text-main flex items-center gap-1.5">
          {sidebarToggleButton}
          {state.selectedTag
            ? (state.selectedTag.startsWith('tag.') ? t(state.selectedTag, state.selectedTag.replace('tag.', '')) : state.selectedTag)
            : t('sidebar.allTasks')}
          <span className="text-xs text-text-sub font-normal">({todayTasks.length})</span>
        </h3>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => { setEditingTask(undefined); setShowForm(true); }}
          className="flex items-center gap-1 px-3 py-1.5 bg-primary text-white rounded-xl text-xs font-medium shadow-soft hover:bg-primary-dark transition-colors"
        >
          <Plus size={14} /> {t('task.add')}
        </motion.button>
      </div>

      <TaskFilter
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />

      <div className="flex-1 overflow-auto mt-3 space-y-2 pr-1">
        <AnimatePresence mode="popLayout">
          {todayTasks.map(task => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={handleToggle}
              onDelete={handleDelete}
              onClick={task => { setEditingTask(task); setShowForm(true); }}
            />
          ))}
        </AnimatePresence>

        {doneTasks.length > 0 && (
          <>
            <div className="text-xs text-text-sub py-1 px-1 mt-2">{t('task.completed')} ({doneTasks.length})</div>
            <AnimatePresence mode="popLayout">
              {doneTasks.map(task => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggle={handleToggle}
                  onDelete={handleDelete}
                  onClick={task => { setEditingTask(task); setShowForm(true); }}
                />
              ))}
            </AnimatePresence>
          </>
        )}

        {filteredTasks.length === 0 && (
          <motion.div
            variants={fadeIn}
            initial="initial"
            animate="animate"
            className="text-center text-text-sub text-sm py-8"
          >
            <p className="text-2xl mb-2">🌱</p>
            <p>{t('task.emptyState')}</p>
          </motion.div>
        )}
      </div>

      <Modal
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditingTask(undefined); }}
        title={editingTask ? t('task.editTask') : t('task.addTask')}
      >
        <TaskForm
          task={editingTask}
          tags={allTags}
          defaultTags={state.selectedTag ? [state.selectedTag] : undefined}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditingTask(undefined); }}
        />
      </Modal>
    </div>
  );
}
