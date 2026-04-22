import * as storage from '../utils/storage';
import * as petStorage from '../utils/petStorage';
import type { Task, WorkLog, PomodoroSession, UserSettings, DeletedItem } from '../types';
import type { PetState } from '../utils/petStorage';

interface BackupData {
  version: 1;
  exportedAt: string;
  tasks: Task[];
  workLogs: WorkLog[];
  pomodoroSessions: PomodoroSession[];
  settings: UserSettings;
  petState: PetState;
  trash: DeletedItem[];
}

export async function exportData(): Promise<string> {
  const [tasks, workLogs, pomodoroSessions, settings, petState, trash] = await Promise.all([
    storage.getTasks(),
    storage.getWorkLogs(),
    storage.getPomodoroSessions(),
    storage.getSettings(),
    petStorage.getPetState(),
    storage.getTrash(),
  ]);

  const backup: BackupData = {
    version: 1,
    exportedAt: new Date().toISOString(),
    tasks,
    workLogs,
    pomodoroSessions,
    settings,
    petState,
    trash,
  };

  return JSON.stringify(backup, null, 2);
}

export function triggerDownload(jsonStr: string) {
  const date = new Date().toISOString().slice(0, 10);
  const filename = `yuzutask-backup-${date}.json`;
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function importData(json: string): Promise<void> {
  const data = JSON.parse(json) as BackupData;

  // Basic validation
  if (!data.version || !Array.isArray(data.tasks) || !Array.isArray(data.workLogs)) {
    throw new Error('Invalid backup file format');
  }

  await Promise.all([
    storage.saveTasks(data.tasks),
    storage.saveWorkLogs(data.workLogs),
    storage.savePomodoroSessions(data.pomodoroSessions),
    storage.saveSettings(data.settings),
    petStorage.savePetState(data.petState),
    storage.saveTrash(data.trash || []),
  ]);
}
