import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, FileText, CheckSquare } from 'lucide-react';
import { useAppState } from '../../store';
import { useTranslation } from '../../i18n';
import type { Task, WorkLog } from '../../types';

interface SearchResult {
  type: 'task' | 'worklog';
  id: string;
  title: string;
  subtitle?: string;
  data: Task | WorkLog;
}

export default function SearchBar() {
  const { state, dispatch } = useAppState();
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setQuery('');
    dispatch({ type: 'SET_SEARCH_QUERY', payload: '' });
  }, [dispatch]);

  // Cmd/Ctrl + K to open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
        setTimeout(() => inputRef.current?.focus(), 50);
      }
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose]);

  // Click outside to close
  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        handleClose();
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen, handleClose]);

  const results = useMemo<SearchResult[]>(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const taskResults: SearchResult[] = state.tasks
      .filter(t => t.title.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q))
      .slice(0, 5)
      .map(t => ({
        type: 'task' as const,
        id: t.id,
        title: t.title,
        subtitle: t.description,
        data: t,
      }));

    const worklogResults: SearchResult[] = state.workLogs
      .filter(l => l.content.toLowerCase().includes(q))
      .slice(0, 5)
      .map(l => ({
        type: 'worklog' as const,
        id: l.id,
        title: l.content,
        subtitle: l.date,
        data: l,
      }));

    return [...taskResults, ...worklogResults];
  }, [query, state.tasks, state.workLogs]);

  const handleQueryChange = useCallback((value: string) => {
    setQuery(value);
    dispatch({ type: 'SET_SEARCH_QUERY', payload: value });
  }, [dispatch]);

  const handleResultClick = useCallback((result: SearchResult) => {
    if (result.type === 'task') {
      dispatch({ type: 'SET_VIEW', payload: 'home' });
    } else {
      dispatch({ type: 'SET_VIEW', payload: 'worklog' });
    }
    handleClose();
  }, [dispatch, handleClose]);

  return (
    <div ref={containerRef} className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => { setIsOpen(true); setTimeout(() => inputRef.current?.focus(), 50); }}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs text-text-sub hover:bg-warm-dark/50 transition-colors"
      >
        <Search size={14} />
        <span className="hidden sm:inline">{t('search.placeholder')}</span>
        <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-warm-dark/30 rounded text-[10px] font-mono">
          ⌘K
        </kbd>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-1 w-80 sm:w-96 bg-white rounded-2xl border border-warm-dark/50 shadow-lg z-50 overflow-hidden"
          >
            {/* Search input */}
            <div className="flex items-center gap-2 px-3 py-2.5 border-b border-warm-dark/30">
              <Search size={16} className="text-text-sub shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => handleQueryChange(e.target.value)}
                placeholder={t('search.placeholder')}
                className="flex-1 text-sm text-text-main bg-transparent outline-none placeholder:text-text-sub/50"
              />
              {query && (
                <button onClick={() => handleQueryChange('')} className="text-text-sub hover:text-text-main">
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Results */}
            {query.trim() && (
              <div className="max-h-64 overflow-auto py-1">
                {results.length > 0 ? (
                  results.map(result => (
                    <button
                      key={`${result.type}-${result.id}`}
                      onClick={() => handleResultClick(result)}
                      className="w-full flex items-start gap-2.5 px-3 py-2 hover:bg-warm-dark/30 transition-colors text-left"
                    >
                      {result.type === 'task' ? (
                        <CheckSquare size={14} className="text-primary mt-0.5 shrink-0" />
                      ) : (
                        <FileText size={14} className="text-mint mt-0.5 shrink-0" />
                      )}
                      <div className="min-w-0">
                        <p className="text-sm text-text-main truncate">{result.title}</p>
                        {result.subtitle && (
                          <p className="text-xs text-text-sub truncate">{result.subtitle}</p>
                        )}
                      </div>
                      <span className="text-[10px] text-text-sub/60 shrink-0 mt-0.5">
                        {result.type === 'task' ? t('search.tasks') : t('search.workLogs')}
                      </span>
                    </button>
                  ))
                ) : (
                  <div className="px-3 py-4 text-center text-sm text-text-sub">
                    {t('search.noResults')}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
