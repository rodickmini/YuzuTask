import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';
import type { Task } from '../../types';
import TaskItem from './TaskItem';
import TaskForm from './TaskForm';
import TaskFilter from './TaskFilter';
import Modal from '../ui/Modal';
import { fadeIn } from '../ui/animations';
import { useAppState } from '../../store';
import * as storage from '../../utils/storage';
import { showToast } from '../ui/Toast';
import { toISODateString } from '../../utils/date';
import { useTranslation } from '../../i18n';

export default function TaskList() {
  const { t } = useTranslation();
  const { state, dispatch } = useAppState();
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>();
  const [statusFilter, setStatusFilter] = useState<'all' | 'todo' | 'in_progress' | 'done'>('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const allTags = useMemo(() => {
    const tagSet = new Set(state.settings.customTags);
    state.tasks.forEach(t => t.tags.forEach(tag => tagSet.add(tag)));
    return Array.from(tagSet);
  }, [state.tasks, state.settings.customTags]);

  const filteredTasks = useMemo(() => {
    return state.tasks
      .filter(t => {
        if (statusFilter !== 'all' && t.status !== statusFilter) return false;
        if (selectedTags.length > 0 && !selectedTags.some(tag => t.tags.includes(tag))) return false;
        return true;
      })
      .sort((a, b) => {
        // Done items at bottom
        if (a.status === 'done' && b.status !== 'done') return 1;
        if (a.status !== 'done' && b.status === 'done') return -1;
        return a.order - b.order;
      });
  }, [state.tasks, statusFilter, selectedTags]);

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
    }
  };

  const handleDelete = async (id: string) => {
    dispatch({ type: 'DELETE_TASK', payload: id });
    const tasks = state.tasks.filter(t => t.id !== id);
    await storage.saveTasks(tasks);
    showToast(t('task.deleted'));
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-text-main flex items-center gap-1.5">
          <span className="text-base">📋</span> {t('task.todayTodo')}
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
        tags={allTags}
        selectedTags={selectedTags}
        onTagToggle={tag => setSelectedTags(prev =>
          prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
        )}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
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
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditingTask(undefined); }}
        />
      </Modal>
    </div>
  );
}
