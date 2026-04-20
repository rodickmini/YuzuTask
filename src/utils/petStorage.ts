export interface PetState {
  foodCount: number;
  satiety: number;
  lastFeedAt: string;
  lastDecayAt: string;
}

const KEY = 'yuzutask_pet_state';

const DEFAULT_PET_STATE: PetState = {
  foodCount: 3,
  satiety: 80,
  lastFeedAt: new Date().toISOString(),
  lastDecayAt: new Date().toISOString(),
};

function isChromeStorage(): boolean {
  return typeof chrome !== 'undefined' && !!chrome.storage?.local;
}

async function get<T>(key: string, defaultValue: T): Promise<T> {
  if (!isChromeStorage()) return defaultValue;
  try {
    const result = await chrome.storage.local.get(key);
    return result[key] ?? defaultValue;
  } catch {
    return defaultValue;
  }
}

async function set<T>(key: string, value: T): Promise<void> {
  if (!isChromeStorage()) return;
  try {
    await chrome.storage.local.set({ [key]: value });
  } catch (err) {
    console.error(`[petStorage] Failed to save:`, err);
  }
}

/** Calculate satiety decay since lastDecayAt: -5 per hour, min 0 */
function calcDecay(satiety: number, lastDecayAt: string): { satiety: number; lastDecayAt: string } {
  const elapsed = Date.now() - new Date(lastDecayAt).getTime();
  const hours = elapsed / (1000 * 60 * 60);
  const decay = Math.floor(hours * 5);
  if (decay <= 0) return { satiety, lastDecayAt };
  return {
    satiety: Math.max(0, satiety - decay),
    lastDecayAt: new Date().toISOString(),
  };
}

export async function getPetState(): Promise<PetState> {
  const state = await get<PetState | null>(KEY, null);
  if (!state) return { ...DEFAULT_PET_STATE };
  // Apply offline decay
  const { satiety, lastDecayAt } = calcDecay(state.satiety, state.lastDecayAt);
  return { ...state, satiety, lastDecayAt };
}

export async function savePetState(state: PetState): Promise<void> {
  return set(KEY, state);
}

export async function awardFood(count: number, current: PetState): Promise<PetState> {
  const updated = { ...current, foodCount: current.foodCount + count };
  await savePetState(updated);
  return updated;
}

export async function feedPet(current: PetState): Promise<PetState | null> {
  if (current.foodCount <= 0) return null;
  const updated: PetState = {
    ...current,
    foodCount: current.foodCount - 1,
    satiety: Math.min(100, current.satiety + 20),
    lastFeedAt: new Date().toISOString(),
  };
  await savePetState(updated);
  return updated;
}
