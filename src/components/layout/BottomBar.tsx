import { motion } from 'framer-motion';
import { Settings, FileText, BookOpen, Home } from 'lucide-react';
import { useAppState } from '../../store';
import type { AppView } from '../../types';

const navItems: { view: AppView; icon: typeof Home; label: string }[] = [
  { view: 'home', icon: Home, label: '首页' },
  { view: 'worklog', icon: BookOpen, label: '记录' },
  { view: 'weekly', icon: FileText, label: '周报' },
  { view: 'settings', icon: Settings, label: '设置' },
];

export default function BottomBar() {
  const { state, dispatch } = useAppState();

  return (
    <motion.footer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="flex items-center justify-center gap-2 px-8 py-3"
    >
      {navItems.map(({ view, icon: Icon, label }) => {
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
            <span>{label}</span>
          </motion.button>
        );
      })}
    </motion.footer>
  );
}
