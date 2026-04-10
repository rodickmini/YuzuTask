import { motion } from 'framer-motion';
import { AppProvider, useAppState } from '../store';
import Header from '../components/layout/Header';
import BottomBar from '../components/layout/BottomBar';
import TaskList from '../components/task/TaskList';
import PomodoroTimer from '../components/pomodoro/PomodoroTimer';
import WorkLogList from '../components/worklog/WorkLogList';
import WeeklyReport from '../components/weekly/WeeklyReport';
import SettingsPage from '../components/settings/SettingsPage';
import Toast from '../components/ui/Toast';

function MainContent() {
  const { state } = useAppState();

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

  return (
    <div className="h-full flex flex-col">
      <Header />

      <motion.main
        className="flex-1 min-h-0 px-8 py-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        {state.currentView === 'home' && (
          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4 h-full">
            {/* Left: Pomodoro */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-3xl shadow-card p-5 h-fit"
            >
              <PomodoroTimer />
            </motion.div>

            {/* Right: Tasks */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-3xl shadow-card p-5 h-full min-h-0"
            >
              <TaskList />
            </motion.div>
          </div>
        )}

        {state.currentView === 'worklog' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-card p-5 h-full min-h-0"
          >
            <WorkLogList />
          </motion.div>
        )}

        {state.currentView === 'weekly' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-card p-5 h-full min-h-0"
          >
            <WeeklyReport />
          </motion.div>
        )}

        {state.currentView === 'settings' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="h-full overflow-auto"
          >
            <SettingsPage />
          </motion.div>
        )}
      </motion.main>

      <BottomBar />
    </div>
  );
}

export default function NewTab() {
  return (
    <AppProvider>
      <MainContent />
      <Toast />
    </AppProvider>
  );
}
