import { createContext, useContext, type ReactNode } from 'react';
import { usePomodoro } from './usePomodoro';

type PomodoroContextType = ReturnType<typeof usePomodoro>;

const PomodoroContext = createContext<PomodoroContextType | null>(null);

export function PomodoroProvider({ children }: { children: ReactNode }) {
  const pomodoro = usePomodoro();
  return (
    <PomodoroContext.Provider value={pomodoro}>
      {children}
    </PomodoroContext.Provider>
  );
}

export function usePomodoroContext() {
  const ctx = useContext(PomodoroContext);
  if (!ctx) throw new Error('usePomodoroContext must be used within PomodoroProvider');
  return ctx;
}