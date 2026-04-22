import type { Task, WorkLog, PomodoroSession, UserSettings, DeletedItem } from '../types';
import { DEFAULT_SETTINGS } from '../types';
import { TRASH_CONFIG } from '../constants';

const KEYS = {
  TASKS: 'yuzutask_tasks',
  WORKLOGS: 'yuzutask_worklogs',
  POMODORO_SESSIONS: 'yuzutask_pomodoro_sessions',
  SETTINGS: 'yuzutask_settings',
  POMODORO_STATE: 'yuzutask_pomodoro_state',
  TRASH: 'yuzutask_trash',
} as const;

function isChromeStorage(): boolean {
  return typeof chrome !== 'undefined' && !!chrome.storage?.local;
}

class StorageError extends Error {
  cause?: unknown;
  constructor(key: string, operation: string, cause?: unknown) {
    super(`Storage ${operation} failed for key "${key}"`);
    this.name = 'StorageError';
    this.cause = cause;
  }
}

async function get<T>(key: string, defaultValue: T): Promise<T> {
  if (!isChromeStorage()) {
    console.error(`[storage] chrome.storage.local not available — cannot read "${key}"`);
    return defaultValue;
  }
  try {
    const result = await chrome.storage.local.get(key);
    return result[key] ?? defaultValue;
  } catch (err) {
    console.error(`[storage] Failed to read "${key}":`, err);
    return defaultValue;
  }
}

async function set<T>(key: string, value: T): Promise<void> {
  if (!isChromeStorage()) {
    throw new StorageError(key, 'write', 'chrome.storage.local not available');
  }
  try {
    await chrome.storage.local.set({ [key]: value });
  } catch (err) {
    throw new StorageError(key, 'write', err);
  }
}

// Tasks
export async function getTasks(): Promise<Task[]> {
  return get<Task[]>(KEYS.TASKS, []);
}

export async function saveTasks(tasks: Task[]): Promise<void> {
  return set(KEYS.TASKS, tasks);
}

// WorkLogs
export async function getWorkLogs(): Promise<WorkLog[]> {
  return get<WorkLog[]>(KEYS.WORKLOGS, []);
}

export async function saveWorkLogs(logs: WorkLog[]): Promise<void> {
  return set(KEYS.WORKLOGS, logs);
}

// Pomodoro Sessions
export async function getPomodoroSessions(): Promise<PomodoroSession[]> {
  return get<PomodoroSession[]>(KEYS.POMODORO_SESSIONS, []);
}

export async function savePomodoroSessions(sessions: PomodoroSession[]): Promise<void> {
  return set(KEYS.POMODORO_SESSIONS, sessions);
}

// Settings
export async function getSettings(): Promise<UserSettings> {
  return get<UserSettings>(KEYS.SETTINGS, DEFAULT_SETTINGS);
}

export async function saveSettings(settings: UserSettings): Promise<void> {
  return set(KEYS.SETTINGS, settings);
}

// Pomodoro running state (for persistence across new tab closures)
export interface PomodoroState {
  isRunning: boolean;
  isPaused: boolean;
  startedAt: number; // timestamp
  pausedRemaining?: number; // remaining seconds when paused
  totalSeconds: number;
  taskId?: string;
  completedCount: number;
}

export async function getPomodoroState(): Promise<PomodoroState | null> {
  return get<PomodoroState | null>(KEYS.POMODORO_STATE, null);
}

export async function savePomodoroState(state: PomodoroState | null): Promise<void> {
  return set(KEYS.POMODORO_STATE, state);
}

// Trash (Recently Deleted)
export async function getTrash(): Promise<DeletedItem[]> {
  return get<DeletedItem[]>(KEYS.TRASH, []);
}

export async function saveTrash(items: DeletedItem[]): Promise<void> {
  return set(KEYS.TRASH, items);
}

export async function purgeExpiredTrash(): Promise<DeletedItem[]> {
  const items = await getTrash();
  const cutoff = Date.now() - TRASH_CONFIG.AUTO_PURGE_DAYS * 24 * 60 * 60 * 1000;
  const remaining = items.filter(item => new Date(item.deletedAt).getTime() > cutoff);
  if (remaining.length !== items.length) {
    await saveTrash(remaining);
  }
  return remaining;
}

// Clear all YuzuTask data
export async function clearAll(): Promise<void> {
  if (!isChromeStorage()) {
    throw new StorageError('*', 'clear', 'chrome.storage.local not available');
  }
  try {
    await chrome.storage.local.clear();
  } catch (err) {
    throw new StorageError('*', 'clear', err);
  }
}

// ID generator
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}
