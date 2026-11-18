import { AgeGroup, AppPersistedState, CustomPhotoCard } from '../types/app';

const STORAGE_KEY = 'fala_melhor_infantil_state_v1';
const DB_NAME = 'FalaMelhorLocalDB';
const STORE_NAME = 'custom_photos';

export function getTodayISO(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function ageToGroup(age: number): AgeGroup {
  if (age <= 4) return '2-4';
  if (age <= 7) return '5-7';
  return '8-12';
}

function generateChildAccountId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `child_${crypto.randomUUID().replace(/-/g, '').slice(0, 12)}`;
  }
  return `child_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`;
}

export function createDefaultState(): AppPersistedState {
  const today = getTodayISO();
  return {
    themeId: 'sol-dourado',
    profile: {
      childAccountId: generateChildAccountId(),
      name: 'Pequeno Explorador',
      age: 5,
      ageGroup: '5-7',
      avatarId: 'tuca',
      selectedModules: [
        'first-words',
        'alphabet',
        'pronunciation',
        'oral-motor',
        'animal-sounds',
        'daily-phrases',
        'games',
        'stories',
      ],
      parentPin: '1234',
      lgpdConsentAccepted: false,
      lgpdConsentDate: null,
      notificationsEnabled: false,
      cameraAuthorized: false,
    },
    audio: {
      rate: 1.0,
      volume: 0.9,
      subtitlesEnabled: true,
    },
    progress: {
      starsTotal: 0,
      todayStars: 0,
      lastActiveDate: today,
      participationDays: [today],
      totalMinutesUsed: 0,
      activitiesCompleted: 0,
      practicedWords: [],
      exploredLetters: [],
      gamesCompleted: 0,
      storiesRead: [],
      oralExercisesDone: 0,
      practicedPronunciationIds: [],
      practicedAnimals: [],
      practicedPhraseIds: [],
      favoritePhraseIds: [],
      exploredPhraseCategories: [],
      gamesProgress: {},
      history: [],
    },
  };
}

export function loadPersistedState(): AppPersistedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createDefaultState();
    const parsed = JSON.parse(raw) as Partial<AppPersistedState>;
    const defaults = createDefaultState();
    const today = getTodayISO();

    const progress = {
      ...defaults.progress,
      ...(parsed.progress || {}),
      practicedPronunciationIds: Array.isArray(parsed.progress?.practicedPronunciationIds)
        ? parsed.progress.practicedPronunciationIds
        : [],
      practicedAnimals: Array.isArray(parsed.progress?.practicedAnimals)
        ? parsed.progress.practicedAnimals
        : [],
      practicedPhraseIds: Array.isArray(parsed.progress?.practicedPhraseIds)
        ? parsed.progress.practicedPhraseIds
        : [],
      favoritePhraseIds: Array.isArray(parsed.progress?.favoritePhraseIds)
        ? parsed.progress.favoritePhraseIds
        : [],
      exploredPhraseCategories: Array.isArray(parsed.progress?.exploredPhraseCategories)
        ? parsed.progress.exploredPhraseCategories
        : [],
      gamesProgress:
        parsed.progress?.gamesProgress &&
        typeof parsed.progress.gamesProgress === 'object' &&
        !Array.isArray(parsed.progress.gamesProgress)
          ? parsed.progress.gamesProgress
          : {},
    };

    if (progress.lastActiveDate !== today) {
      progress.todayStars = 0;
      progress.lastActiveDate = today;
    }
    if (!progress.participationDays.includes(today)) {
      progress.participationDays = [...progress.participationDays, today];
    }

    const mergedProfile = {
      ...defaults.profile,
      ...(parsed.profile || {}),
      childAccountId: parsed.profile?.childAccountId || defaults.profile.childAccountId,
    };

    return {
      themeId: parsed.themeId || defaults.themeId,
      profile: mergedProfile,
      audio: { ...defaults.audio, ...(parsed.audio || {}) },
      progress,
    };
  } catch {
    return createDefaultState();
  }
}

export function savePersistedState(state: AppPersistedState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage quota warnings gracefully
  }
}

function openPhotosDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function getCustomPhotos(): Promise<CustomPhotoCard[]> {
  try {
    const db = await openPhotosDB();
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => resolve((req.result as CustomPhotoCard[]) || []);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return [];
  }
}

export async function saveCustomPhoto(card: CustomPhotoCard): Promise<void> {
  const db = await openPhotosDB();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put(card);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function deleteCustomPhoto(id: string): Promise<void> {
  const db = await openPhotosDB();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function clearAllUserData(): Promise<AppPersistedState> {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
  try {
    const db = await openPhotosDB();
    await new Promise<void>((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  } catch {
    // ignore
  }
  const fresh = createDefaultState();
  savePersistedState(fresh);
  return fresh;
}
