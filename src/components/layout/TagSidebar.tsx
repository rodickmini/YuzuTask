import { useMemo } from 'react';
import { useAppState } from '../../store';
import { useTranslation } from '../../i18n';

const TAG_COLORS: Record<string, string> = {
  'tag.work': 'text-[#5A9BAC]',
  'tag.dev': 'text-[#6DB885]',
  'tag.meeting': 'text-[#E0A060]',
  'tag.doc': 'text-[#D08080]',
  'tag.comm': 'text-purple-500',
  'tag.learn': 'text-blue-500',
  'tag.life': 'text-pink-500',
};

export default function TagSidebar() {
  const { state, dispatch } = useAppState();
  const { t } = useTranslation();

  const allTags = useMemo(() => {
    const tagSet = new Set(state.settings.customTags);
    state.tasks.forEach(task => task.tags.forEach(tag => tagSet.add(tag)));
    return Array.from(tagSet);
  }, [state.tasks, state.settings.customTags]);

  const tagCounts = useMemo(() => {
    const counts = new Map<string, number>();
    state.tasks.forEach(task => {
      task.tags.forEach(tag => {
        counts.set(tag, (counts.get(tag) || 0) + 1);
      });
    });
    return counts;
  }, [state.tasks]);

  const totalCount = state.tasks.length;

  const itemClass = (isActive: boolean) =>
    `w-full flex items-center gap-2.5 pl-2.5 pr-5 py-[6px] rounded-md text-[13px] leading-tight transition-colors ${
      isActive
        ? 'bg-primary/25 text-primary-dark font-medium'
        : 'text-text-main/70 hover:bg-black/[0.05]'
    }`;

  return (
    <div className="flex flex-col h-full select-none pt-2">
      {/* All Tasks filter (no section header) */}
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
        {allTags.map(tag => {
          const isActive = state.selectedTag === tag;
          const tagColor = TAG_COLORS[tag] || 'text-gray-400';
          const displayName = tag.startsWith('tag.') ? t(tag, tag.replace('tag.', '')) : tag;
          const count = tagCounts.get(tag) || 0;

          return (
            <button
              key={tag}
              onClick={() => dispatch({ type: 'SET_SELECTED_TAG', payload: tag })}
              className={itemClass(isActive)}
            >
              <span className={`text-xs font-bold shrink-0 ${tagColor}`}>#</span>
              <span className="flex-1 text-left truncate">{displayName}</span>
              <span className="text-[11px] text-text-sub/40 tabular-nums">{count}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
