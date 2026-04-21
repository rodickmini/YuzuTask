import React, { createContext, useContext, useReducer, useEffect, useCallback, useMemo, type ReactNode } from 'react';
import type { Task, WorkLog, PomodoroSession, UserSettings, AppView, DeletedItem } from '../types';
import { DEFAULT_SETTINGS } from '../types';
import * as storage from '../utils/storage';
import * as petStorage from '../utils/petStorage';
import type { PetState } from '../utils/petStorage';

const DEFAULT_PET_STATE: PetState = {
  foodCount: 3,
  satiety: 80,
  lastFeedAt: new Date().toISOString(),
  lastDecayAt: new Date().toISOString(),
};

interface AppState {
  tasks: Task[];
  workLogs: WorkLog[];
  pomodoroSessions: PomodoroSession[];
  settings: UserSettings;
  currentView: AppView;
  isLoading: boolean;
  error: string | null;
  petState: PetState;
  selectedTag: string | null;
  isSidebarVisible: boolean;
  trash: DeletedItem[];
}

export type Action =
  | { type: 'SET_TASKS'; payload: Task[] }
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: Task }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'SET_WORKLOGS'; payload: WorkLog[] }
  | { type: 'ADD_WORKLOG'; payload: WorkLog }
  | { type: 'DELETE_WORKLOG'; payload: string }
  | { type: 'SET_POMODORO_SESSIONS'; payload: PomodoroSession[] }
  | { type: 'SET_SETTINGS'; payload: UserSettings }
  | { type: 'SET_VIEW'; payload: AppView }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_PET_STATE'; payload: PetState }
  | { type: 'ADD_FOOD'; payload: number }
  | { type: 'FEED_PET' }
  | { type: 'SET_SELECTED_TAG'; payload: string | null }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'SET_TRASH'; payload: DeletedItem[] }
  | { type: 'MOVE_TO_TRASH'; payload: DeletedItem }
  | { type: 'RESTORE_FROM_TRASH'; payload: string }
  | { type: 'PERMANENT_DELETE'; payload: string }
  | { type: 'EMPTY_TRASH' };

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
    case 'SET_POMODORO_SESSIONS':
      return { ...state, pomodoroSessions: action.payload };
    case 'SET_SETTINGS':
      return { ...state, settings: action.payload };
    case 'SET_VIEW':
      return { ...state, currentView: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_PET_STATE':
      return { ...state, petState: action.payload };
    case 'ADD_FOOD':
      return { ...state, petState: { ...state.petState, foodCount: state.petState.foodCount + action.payload } };
    case 'FEED_PET':
      if (state.petState.foodCount <= 0) return state;
      return {
        ...state,
        petState: {
          ...state.petState,
          foodCount: state.petState.foodCount - 1,
          satiety: Math.min(100, state.petState.satiety + 20),
          lastFeedAt: new Date().toISOString(),
        },
      };
    case 'SET_SELECTED_TAG':
      return { ...state, selectedTag: action.payload };
    case 'TOGGLE_SIDEBAR':
      return { ...state, isSidebarVisible: !state.isSidebarVisible };
    case 'SET_TRASH':
      return { ...state, trash: action.payload };
    case 'MOVE_TO_TRASH':
      return { ...state, trash: [action.payload, ...state.trash] };
    case 'RESTORE_FROM_TRASH':
      return { ...state, trash: state.trash.filter(item => item.id !== action.payload) };
    case 'PERMANENT_DELETE':
      return { ...state, trash: state.trash.filter(item => item.id !== action.payload) };
    case 'EMPTY_TRASH':
      return { ...state, trash: [] };
    default:
      return state;
  }
}

const initialState: AppState = {
  tasks: [],
  workLogs: [],
  pomodoroSessions: [],
  settings: DEFAULT_SETTINGS,
  currentView: 'home',
  isLoading: true,
  error: null,
  petState: DEFAULT_PET_STATE,
  selectedTag: null,
  isSidebarVisible: true,
  trash: [],
};

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  refreshTasks: () => Promise<void>;
  refreshWorkLogs: () => Promise<void>;
  refreshPomodoroSessions: () => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const refreshTasks = useCallback(async () => {
    try {
      const tasks = await storage.getTasks();
      dispatch({ type: 'SET_TASKS', payload: tasks });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to refresh tasks' });
    }
  }, []);

  const refreshWorkLogs = useCallback(async () => {
    try {
      const logs = await storage.getWorkLogs();
      dispatch({ type: 'SET_WORKLOGS', payload: logs });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to refresh work logs' });
    }
  }, []);

  const refreshPomodoroSessions = useCallback(async () => {
    try {
      const sessions = await storage.getPomodoroSessions();
      dispatch({ type: 'SET_POMODORO_SESSIONS', payload: sessions });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to refresh pomodoro sessions' });
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const [tasks, workLogs, settings, pomodoroSessions, loadedPetState, trash] = await Promise.all([
          storage.getTasks(),
          storage.getWorkLogs(),
          storage.getSettings(),
          storage.getPomodoroSessions(),
          petStorage.getPetState(),
          storage.purgeExpiredTrash(),
        ]);
        dispatch({ type: 'SET_TASKS', payload: tasks });
        dispatch({ type: 'SET_WORKLOGS', payload: workLogs });
        dispatch({ type: 'SET_SETTINGS', payload: settings });
        dispatch({ type: 'SET_POMODORO_SESSIONS', payload: pomodoroSessions });
        dispatch({ type: 'SET_PET_STATE', payload: loadedPetState });
        dispatch({ type: 'SET_TRASH', payload: trash });
      } catch (err) {
        dispatch({ type: 'SET_ERROR', payload: 'Failed to load data' });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    })();
  }, []);

  const contextValue = useMemo<AppContextType>(
    () => ({ state, dispatch, refreshTasks, refreshWorkLogs, refreshPomodoroSessions }),
    [state, dispatch, refreshTasks, refreshWorkLogs, refreshPomodoroSessions],
  );

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppState() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppState must be used within AppProvider');
  return ctx;
}
