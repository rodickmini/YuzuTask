import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, Minus, Trash2 } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useAppState } from '../../store';
import { useTranslation } from '../../i18n';
import * as storage from '../../utils/storage';
import { getTagSidebarColor } from '../../constants';
import { useConfirm } from '../../hooks/useConfirm';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

function SortableTagItem({ tag, isActive, displayName, count, tagColor, onSelect }: {
  tag: string;
  isActive: boolean;
  displayName: string;
  count: number;
  tagColor: string;
  onSelect: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: tag });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const itemClass = `group w-full flex items-center gap-2.5 pl-2.5 pr-3 py-[6px] rounded-md text-[13px] leading-tight transition-colors cursor-pointer ${
    isActive
      ? 'bg-primary/25 text-primary-dark font-medium'
      : 'text-text-main/70 hover:bg-black/[0.05]'
  }`;

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <div {...listeners} onClick={onSelect} className={itemClass} role="button" tabIndex={0}>
        <span className={`text-xs font-bold shrink-0 ${tagColor}`}>#</span>
        <span className="flex-1 truncate">{displayName}</span>
        <span className="text-[11px] text-text-sub/40 tabular-nums">{count}</span>
      </div>
    </div>
  );
}

export default function TagSidebar() {
  const { state, dispatch } = useAppState();
  const { t } = useTranslation();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newTag, setNewTag] = useState('');

  const { confirm, ConfirmDialog } = useConfirm();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const allTags = useMemo(() => {
    const taskTagSet = new Set<string>();
    state.tasks.forEach(task => task.tags.forEach(tag => taskTagSet.add(tag)));
    const customSet = new Set(state.settings.customTags);
    const extra = Array.from(taskTagSet).filter(tag => !customSet.has(tag));
    return [...state.settings.customTags, ...extra];
  }, [state.tasks, state.settings.customTags]);

  const tagCounts = useMemo(() => {
    const counts = new Map<string, number>();
    state.tasks.filter(t => t.status !== 'done').forEach(task => {
      task.tags.forEach(tag => {
        counts.set(tag, (counts.get(tag) || 0) + 1);
      });
    });
    return counts;
  }, [state.tasks]);

  const totalCount = state.tasks.filter(t => t.status !== 'done').length;
  const untaggedCount = state.tasks.filter(t => t.status !== 'done' && t.tags.length === 0).length;

  const updateTags = async (nextTags: string[]) => {
    const settings = { ...state.settings, customTags: nextTags };
    dispatch({ type: 'SET_SETTINGS', payload: settings });
    await storage.saveSettings(settings);
  };

  const addTag = () => {
    const trimmed = newTag.trim();
    if (trimmed && !state.settings.customTags.includes(trimmed)) {
      updateTags([...state.settings.customTags, trimmed]);
    }
    setNewTag('');
    setShowAddDialog(false);
  };

  const removeSelectedTag = async () => {
    const tag = state.selectedTag;
    if (!tag) return;

    const affectedTasks = state.tasks.filter(t => t.tags.includes(tag));
    if (affectedTasks.length > 0) {
      const displayName = tag.startsWith('tag.') ? t(tag, tag.replace('tag.', '')) : tag;
      const confirmed = await confirm({
        title: t('sidebar.deleteTag'),
        message: t('sidebar.deleteTagConfirm', { tag: displayName, count: affectedTasks.length }),
        variant: 'danger',
      });
      if (!confirmed) return;
    }

    const nextCustomTags = state.settings.customTags.filter(t => t !== tag);
    const settings = { ...state.settings, customTags: nextCustomTags };
    dispatch({ type: 'SET_SETTINGS', payload: settings });
    await storage.saveSettings(settings);

    if (affectedTasks.length > 0) {
      const updatedTasks = state.tasks.map(task =>
        task.tags.includes(tag) ? { ...task, tags: task.tags.filter(t => t !== tag) } : task
      );
      dispatch({ type: 'SET_TASKS', payload: updatedTasks });
      await storage.saveTasks(updatedTasks);
    }

    dispatch({ type: 'SET_SELECTED_TAG', payload: null });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = state.settings.customTags.indexOf(active.id as string);
    const newIndex = state.settings.customTags.indexOf(over.id as string);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = [...state.settings.customTags];
    const [moved] = reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, moved);
    updateTags(reordered);
  };

  const customTagSet = useMemo(() => new Set(state.settings.customTags), [state.settings.customTags]);

  const itemClass = (isActive: boolean) =>
    `group w-full flex items-center gap-2.5 pl-2.5 pr-3 py-[6px] rounded-md text-[13px] leading-tight transition-colors ${
      isActive
        ? 'bg-primary/25 text-primary-dark font-medium'
        : 'text-text-main/70 hover:bg-black/[0.05]'
    }`;

  const hasSelectedTag = state.selectedTag !== null;

  return (
    <div className="flex flex-col h-full select-none pt-2">
      {/* All Tasks filter */}
      <div className="pl-2 pr-4 pt-2 pb-1">
        <button
          onClick={() => dispatch({ type: 'SET_SELECTED_TAG', payload: null })}
          className={itemClass(state.selectedTag === null)}
        >
          <span className="flex-1 text-left">{t('sidebar.allTasks')}</span>
          <span className="text-[11px] text-text-sub/40 tabular-nums">{totalCount}</span>
        </button>
      </div>

      {/* Section: Tags */}
      <div className="pl-4 pr-4 pt-3 pb-1.5">
        <span className="text-[11px] font-semibold text-text-sub/60 uppercase tracking-wider">
          {t('sidebar.tags')}
        </span>
      </div>

      <div className="flex-1 overflow-auto pl-2 pr-4 space-y-[1px]">
        {untaggedCount > 0 && (
          <button
            onClick={() => dispatch({ type: 'SET_SELECTED_TAG', payload: '__untagged__' })}
            className={itemClass(state.selectedTag === '__untagged__')}
          >
            <span className="flex-1 text-left">{t('sidebar.untagged')}</span>
            <span className="text-[11px] text-text-sub/40 tabular-nums">{untaggedCount}</span>
          </button>
        )}
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={state.settings.customTags} strategy={verticalListSortingStrategy}>
            {allTags.map(tag => {
              const isActive = state.selectedTag === tag;
              const tagColor = getTagSidebarColor(tag);
              const displayName = tag.startsWith('tag.') ? t(tag, tag.replace('tag.', '')) : tag;
              const count = tagCounts.get(tag) || 0;

              if (customTagSet.has(tag)) {
                return (
                  <SortableTagItem
                    key={tag}
                    tag={tag}
                    isActive={isActive}
                    displayName={displayName}
                    count={count}
                    tagColor={tagColor}
                    onSelect={() => dispatch({ type: 'SET_SELECTED_TAG', payload: tag })}
                  />
                );
              }

              return (
                <div
                  key={tag}
                  onClick={() => dispatch({ type: 'SET_SELECTED_TAG', payload: tag })}
                  className={itemClass(isActive)}
                  role="button"
                  tabIndex={0}
                >
                  <span className={`text-xs font-bold shrink-0 ${tagColor}`}>#</span>
                  <span className="flex-1 truncate">{displayName}</span>
                  <span className="text-[11px] text-text-sub/40 tabular-nums">{count}</span>
                </div>
              );
            })}
          </SortableContext>
        </DndContext>
      </div>

      {/* Trash entry */}
      <div className="pl-2 pr-4 pt-2">
        <button
          onClick={() => dispatch({ type: 'SET_SELECTED_TAG', payload: '__trash__' })}
          className={`w-full flex items-center gap-2 pl-2.5 pr-3 py-[5px] rounded-md text-[12px] leading-tight transition-colors ${
            state.selectedTag === '__trash__'
              ? 'bg-primary/25 text-primary-dark font-medium'
              : 'text-text-sub/60 hover:bg-black/[0.05]'
          }`}
        >
          <Trash2 size={13} />
          <span className="flex-1 text-left">{t('trash.title')}</span>
          {state.trash.length > 0 && (
            <span className="text-[11px] text-text-sub/40 tabular-nums">{state.trash.length}</span>
          )}
        </button>
      </div>

      {/* Bottom action buttons */}
      <div className="pl-2 pr-4 pb-2 flex items-center gap-3">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => { setNewTag(''); setShowAddDialog(true); }}
          className="p-1.5 text-text-sub/50 hover:text-primary transition-colors"
          title={t('sidebar.addTag')}
        >
          <Plus size={16} />
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={removeSelectedTag}
          disabled={!hasSelectedTag}
          className={`p-1.5 transition-colors ${
            hasSelectedTag
              ? 'text-text-sub/50 hover:text-accent'
              : 'text-text-sub/20 cursor-not-allowed'
          }`}
          title={t('sidebar.deleteTag')}
        >
          <Minus size={16} />
        </motion.button>
      </div>

      {/* Add tag dialog */}
      <Modal
        isOpen={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        title={t('sidebar.addTagTitle')}
      >
        <div className="space-y-4">
          <input
            autoFocus
            value={newTag}
            onChange={e => setNewTag(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') addTag(); }}
            placeholder={t('sidebar.addTagPlaceholder')}
            className="w-full px-3 py-2 bg-white border border-warm-dark rounded-xl text-sm outline-none focus:border-primary"
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowAddDialog(false)}>{t('sidebar.addTagCancel')}</Button>
            <Button onClick={addTag}>{t('sidebar.addTagConfirm')}</Button>
          </div>
        </div>
      </Modal>
      <ConfirmDialog />
    </div>
  );
}
