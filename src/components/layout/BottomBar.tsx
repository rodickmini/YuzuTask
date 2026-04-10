import { motion } from 'framer-motion';
import { Settings, FileText, BookOpen, Home, CalendarDays } from 'lucide-react';
import { useAppState } from '../../store';
import { useTranslation } from '../../i18n';
import type { AppView } from '../../types';

const navItems: { view: AppView; icon: typeof Home; labelKey: string }[] = [
  { view: 'home', icon: Home, labelKey: 'nav.home' },
  { view: 'worklog', icon: BookOpen, labelKey: 'nav.worklog' },
  { view: 'weekly', icon: FileText, labelKey: 'nav.weekly' },
  { view: 'footprint', icon: CalendarDays, labelKey: 'nav.footprint' },
  { view: 'settings', icon: Settings, labelKey: 'nav.settings' },
];

export default function BottomBar() {
  const { state, dispatch } = useAppState();
  const { t } = useTranslation();

  return (
    <motion.footer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="flex items-center justify-center gap-2 px-8 py-3"
    >
      {navItems.map(({ view, icon: Icon, labelKey }) => {
        const isActive = state.currentView === view;
        return (
          <motion.button
            key={view}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => dispatch({ type: 'SET_VIEW', payload: view })}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl text-sm font-medium transition-all duration-200 ${
              isActive
                ? 'bg-primary text-white shadow-soft'
                : 'text-text-sub hover:bg-warm-dark'
            }`}
          >
            <Icon size={16} />
            <span>{t(labelKey)}</span>
          </motion.button>
        );
      })}
    </motion.footer>
  );
}
