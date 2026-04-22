import { useEffect, useCallback } from 'react';
import type { AppView } from '../types';

interface KeyboardShortcutsConfig {
  onNavigate: (view: AppView) => void;
  onNewTask: () => void;
  onToggleSidebar: () => void;
}

export function useKeyboardShortcuts({ onNavigate, onNewTask, onToggleSidebar }: KeyboardShortcutsConfig) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Ignore when typing in an input/textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
        return;
      }

      // Cmd/Ctrl + N: New task
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault();
        onNewTask();
        return;
      }

      // Number keys for navigation (no modifier)
      if (!e.metaKey && !e.ctrlKey && !e.altKey) {
        const viewMap: Record<string, AppView> = {
          '1': 'home',
          '2': 'worklog',
          '3': 'weekly',
          '4': 'footprint',
          '5': 'settings',
        };
        const view = viewMap[e.key];
        if (view) {
          onNavigate(view);
          return;
        }

        // B: Toggle sidebar
        if (e.key === 'b') {
          onToggleSidebar();
          return;
        }
      }
    },
    [onNavigate, onNewTask, onToggleSidebar],
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}
