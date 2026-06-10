import AsyncStorage from '@react-native-async-storage/async-storage';
import { GameSettings, PlayerData, DEFAULT_SETTINGS, DEFAULT_PLAYER_DATA } from './storageTypes';

const KEYS = {
  PLAYER: 'player_data',
  SETTINGS: 'game_settings',
} as const;

export async function loadLocalPlayerData(uid: string): Promise<PlayerData> {
  const raw = await AsyncStorage.getItem(`${KEYS.PLAYER}_${uid}`);
  if (!raw) return { ...DEFAULT_PLAYER_DATA, uid, updatedAt: 0 };
  return JSON.parse(raw) as PlayerData;
}

export async function saveLocalPlayerData(data: PlayerData): Promise<void> {
  await AsyncStorage.setItem(`${KEYS.PLAYER}_${data.uid}`, JSON.stringify(data));
}

export async function loadLocalSettings(): Promise<GameSettings> {
  const raw = await AsyncStorage.getItem(KEYS.SETTINGS);
  if (!raw) return { ...DEFAULT_SETTINGS };
  return { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<GameSettings>) };
}

export async function saveLocalSettings(settings: GameSettings): Promise<void> {
  await AsyncStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
}
