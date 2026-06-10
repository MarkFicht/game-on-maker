export interface PlayerData {
  uid: string;
  score: number;
  level: number;
  updatedAt: number;
}

export interface GameSettings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  vibrationEnabled: boolean;
  language: 'pl' | 'en';
}

export interface LeaderboardEntry {
  uid: string;
  displayName: string;
  score: number;
  updatedAt: number;
}

export const DEFAULT_PLAYER_DATA: Omit<PlayerData, 'uid'> = {
  score: 0,
  level: 1,
  updatedAt: 0,
};

export const DEFAULT_SETTINGS: GameSettings = {
  soundEnabled: true,
  musicEnabled: true,
  vibrationEnabled: true,
  language: 'pl',
};
