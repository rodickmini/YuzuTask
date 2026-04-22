import { useEffect, useCallback, useState } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { PanelLeft, PanelLeftClose } from 'lucide-react';
import { AppProvider, useAppState } from '../store';
import type { AppView } from '../types';
import { PomodoroProvider } from '../hooks/PomodoroContext';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import Header from '../components/layout/Header';
import BottomBar from '../components/layout/BottomBar';
import TagSidebar from '../components/layout/TagSidebar';
import TaskList from '../components/task/TaskList';
import PomodoroTimer from '../components/pomodoro/PomodoroTimer';
import WorkLogList from '../components/worklog/WorkLogList';
import WeeklyReport from '../components/weekly/WeeklyReport';
import FootprintPage from '../components/footprint/FootprintPage';
import SettingsPage from '../components/settings/SettingsPage';
import TrashView from '../components/trash/TrashView';
import Toast from '../components/ui/Toast';
import PetMascot from '../components/ui/PetMascot';
import { staggerContainer, staggerItem, pageTransition } from '../components/ui/animations';

function MainContent() {
  const { state, dispatch } = useAppState();
  const [triggerNewTask, setTriggerNewTask] = useState(0);

  // Esc key to toggle sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        dispatch({ type: 'TOGGLE_SIDEBAR' });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dispatch]);

  const handleNavigate = useCallback(
    (view: AppView) => {
      dispatch({ type: 'SET_VIEW', payload: view });
    },
    [dispatch],
  );

  const handleNewTask = useCallback(() => {
    dispatch({ type: 'SET_VIEW', payload: 'home' });
    setTriggerNewTask(prev => prev + 1);
  }, [dispatch]);

  useKeyboardShortcuts({
    onNavigate: handleNavigate,
    onNewTask: handleNewTask,
    onToggleSidebar: useCallback(() => dispatch({ type: 'TOGGLE_SIDEBAR' }), [dispatch]),
  });

  const toggleSidebar = useCallback(() => dispatch({ type: 'TOGGLE_SIDEBAR' }), [dispatch]);

  if (state.isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  const showSidebar = state.isSidebarVisible && state.currentView === 'home';

  const toggleButton = (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={toggleSidebar}
      className="flex items-center justify-center w-7 h-7 rounded-lg text-text-sub/50 hover:bg-black/[0.05] hover:text-text-sub transition-colors"
      title={state.isSidebarVisible ? 'Hide sidebar' : 'Show sidebar'}
    >
      {state.isSidebarVisible ? <PanelLeftClose size={16} /> : <PanelLeft size={16} />}
    </motion.button>
  );

  return (
    <LayoutGroup>
    <div className="h-full flex flex-col">
      <Header />

      <motion.main
        className="flex-1 min-h-0 px-4 sm:px-6 lg:px-8 py-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <AnimatePresence mode="wait">
        {state.currentView === 'home' && (
          <motion.div
            key="home"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="h-full flex gap-3 sm:gap-4"
          >
            {/* Left + Center: Fused panel (Sidebar + TaskList) */}
            <div className="flex-1 min-w-0 bg-white rounded-2xl sm:rounded-3xl border border-warm-dark/50 flex overflow-hidden relative">
              {/* Sidebar */}
              <AnimatePresence initial={false}>
                {showSidebar && (
                  <motion.div
                    key="sidebar"
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 200, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                    className="hidden md:block shrink-0 overflow-hidden"
                  >
                    <div className="w-[200px] lg:w-[220px] h-full border-r border-warm-dark/30">
                      <TagSidebar />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Task List */}
              <div className="flex-1 min-w-0 p-3 sm:p-5 overflow-auto">
                <TaskList
                  sidebarToggleButton={toggleButton}
                  triggerNewTask={triggerNewTask}
                />
              </div>
            </div>

            {/* Right: Pomodoro + Pet */}
            <motion.div
              variants={staggerItem}
              className="hidden lg:flex lg:flex-col gap-3 w-[240px] shrink-0"
            >
              <div className="bg-white rounded-2xl sm:rounded-3xl border border-warm-dark/50 p-3 sm:p-4 md:shrink-0">
                <PomodoroTimer />
              </div>

              <div className="hidden lg:block">
                <PetMascot />
              </div>
            </motion.div>
          </motion.div>
        )}

        {state.currentView === 'worklog' && (
          <motion.div
            key="worklog"
            variants={pageTransition}
            initial="initial"
            animate="animate"
            exit="exit"
            className="bg-white rounded-3xl border border-warm-dark/50 p-5 h-full min-h-0"
          >
            <WorkLogList />
          </motion.div>
        )}

        {state.currentView === 'weekly' && (
          <motion.div
            key="weekly"
            variants={pageTransition}
            initial="initial"
            animate="animate"
            exit="exit"
            className="bg-white rounded-3xl border border-warm-dark/50 p-5 h-full min-h-0"
          >
            <WeeklyReport />
          </motion.div>
        )}

        {state.currentView === 'footprint' && (
          <motion.div
            key="footprint"
            variants={pageTransition}
            initial="initial"
            animate="animate"
            exit="exit"
            className="bg-white rounded-3xl border border-warm-dark/50 p-5 h-full min-h-0"
          >
            <FootprintPage />
          </motion.div>
        )}

        {state.currentView === 'settings' && (
          <motion.div
            key="settings"
            variants={pageTransition}
            initial="initial"
            animate="animate"
            exit="exit"
            className="h-full overflow-auto"
          >
            <SettingsPage />
          </motion.div>
        )}

        {state.currentView === 'trash' && (
          <motion.div
            key="trash"
            variants={pageTransition}
            initial="initial"
            animate="animate"
            exit="exit"
            className="bg-white rounded-3xl border border-warm-dark/50 p-5 h-full min-h-0"
          >
            <TrashView />
          </motion.div>
        )}
        </AnimatePresence>
      </motion.main>

      <BottomBar />
    </div>
    </LayoutGroup>
  );
}

export default function NewTab() {
  return (
    <AppProvider>
      <PomodoroProvider>
        <MainContent />
        <Toast />
      </PomodoroProvider>
    </AppProvider>
  );
}
