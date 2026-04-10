import React, { createContext, useContext, useReducer, useEffect, useCallback, type ReactNode } from 'react';
import type { Task, WorkLog, UserSettings, AppView } from '../types';
import { DEFAULT_SETTINGS } from '../types';
import * as storage from '../utils/storage';

interface AppState {
  tasks: Task[];
  workLogs: WorkLog[];
  settings: UserSettings;
  currentView: AppView;
  isLoading: boolean;
}

type Action =
  | { type: 'SET_TASKS'; payload: Task[] }
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: Task }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'SET_WORKLOGS'; payload: WorkLog[] }
  | { type: 'ADD_WORKLOG'; payload: WorkLog }
  | { type: 'DELETE_WORKLOG'; payload: string }
  | { type: 'SET_SETTINGS'; payload: UserSettings }
  | { type: 'SET_VIEW'; payload: AppView }
  | { type: 'SET_LOADING'; payload: boolean };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_TASKS':
      return { ...state, tasks: action.payload };
    case 'ADD_TASK':
      return { ...state, tasks: [...state.tasks, action.payload] };
    case 'UPDATE_TASK':
      return { ...state, tasks: state.tasks.map(t => t.id === action.payload.id ? action.payload : t) };
    case 'DELETE_TASK':
      return { ...state, tasks: state.tasks.filter(t => t.id !== action.payload) };
    case 'SET_WORKLOGS':
      return { ...state, workLogs: action.payload };
    case 'ADD_WORKLOG':
      return { ...state, workLogs: [...state.workLogs, action.payload] };
    case 'DELETE_WORKLOG':
      return { ...state, workLogs: state.workLogs.filter(l => l.id !== action.payload) };
    case 'SET_SETTINGS':
      return { ...state, settings: action.payload };
    case 'SET_VIEW':
      return { ...state, currentView: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
}

const initialState: AppState = {
  tasks: [],
  workLogs: [],
  settings: DEFAULT_SETTINGS,
  currentView: 'home',
  isLoading: true,
};

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  refreshTasks: () => Promise<void>;
  refreshWorkLogs: () => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const refreshTasks = useCallback(async () => {
    const tasks = await storage.getTasks();
    dispatch({ type: 'SET_TASKS', payload: tasks });
  }, []);

  const refreshWorkLogs = useCallback(async () => {
    const logs = await storage.getWorkLogs();
    dispatch({ type: 'SET_WORKLOGS', payload: logs });
  }, []);

  useEffect(() => {
    (async () => {
      const [tasks, workLogs, settings] = await Promise.all([
        storage.getTasks(),
        storage.getWorkLogs(),
        storage.getSettings(),
      ]);
      dispatch({ type: 'SET_TASKS', payload: tasks });
      dispatch({ type: 'SET_WORKLOGS', payload: workLogs });
      dispatch({ type: 'SET_SETTINGS', payload: settings });
      dispatch({ type: 'SET_LOADING', payload: false });
    })();
  }, []);

  return (
    <AppContext.Provider value={{ state, dispatch, refreshTasks, refreshWorkLogs }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppState() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppState must be used within AppProvider');
  return ctx;
}
