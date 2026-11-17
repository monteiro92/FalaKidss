export type AgeGroup = '2-4' | '5-7' | '8-12';

export type ThemeId = 'sol-dourado' | 'ceu-azul' | 'jardim-verde' | 'lavanda-suave';

export type AppSection =
  | 'home'
  | 'activities'
  | 'first-words'
  | 'alphabet'
  | 'pronunciation'
  | 'oral-motor'
  | 'animal-sounds'
  | 'daily-phrases'
  | 'games'
  | 'stories'
  | 'camera'
  | 'parents';

export interface ChildProfile {
  childAccountId?: string;
  name: string;
  age: number;
  ageGroup: AgeGroup;
  avatarId: 'tuca' | 'sol' | 'patinho' | 'estrela';
  selectedModules: string[];
  parentPin: string;
  lgpdConsentAccepted: boolean;
  lgpdConsentDate: string | null;
  notificationsEnabled: boolean;
  cameraAuthorized: boolean;
}

export interface AudioSettings {
  rate: number; // 0.7 | 1.0 | 1.2
  volume: number; // 0 to 1
  subtitlesEnabled: boolean;
}

export interface ActivityHistoryItem {
  id: string;
  module: string;
  title: string;
  timestamp: string;
  starsEarned: number;
}

export interface ProgressState {
  starsTotal: number;
  todayStars: number;
  lastActiveDate: string;
  participationDays: string[];
  totalMinutesUsed: number;
  activitiesCompleted: number;
  practicedWords: string[];
  exploredLetters: string[];
  gamesCompleted: number;
  storiesRead: string[];
  oralExercisesDone: number;
  practicedPronunciationIds: string[];
  practicedAnimals: string[];
  practicedPhraseIds: string[];
  favoritePhraseIds: string[];
  exploredPhraseCategories: string[];
  history: ActivityHistoryItem[];
}

export interface CustomPhotoCard {
  id: string;
  label: string;
  category: 'objeto' | 'alimento' | 'familiar' | 'brinquedo' | 'lugar';
  dataUrl: string;
  createdAt: string;
}

export interface AppPersistedState {
  themeId: ThemeId;
  profile: ChildProfile;
  audio: AudioSettings;
  progress: ProgressState;
}
