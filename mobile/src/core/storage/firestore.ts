import firestore from '@react-native-firebase/firestore';
import { PlayerData, LeaderboardEntry } from './storageTypes';
import { saveLocalPlayerData, loadLocalPlayerData } from './localStorage';
import { MAX_SCORE, MAX_LEVEL } from '../../config/constants';

const COLLECTIONS = {
  PLAYERS: 'players',
  LEADERBOARD: 'leaderboard',
} as const;

function validatePlayerData(data: Partial<PlayerData>): boolean {
  return (
    typeof data.score === 'number' &&
    data.score >= 0 &&
    data.score <= MAX_SCORE &&
    typeof data.level === 'number' &&
    data.level >= 1 &&
    data.level <= MAX_LEVEL
  );
}

export async function savePlayerProgress(data: PlayerData): Promise<void> {
  if (!validatePlayerData(data)) throw new Error('Nieprawidłowe dane gracza.');
  const payload = { score: data.score, level: data.level, updatedAt: Date.now() };
  // Write to local cache first (offline first)
  await saveLocalPlayerData({ ...data, ...payload });
  // Sync to Firestore in background
  await firestore().collection(COLLECTIONS.PLAYERS).doc(data.uid).set(payload, { merge: true });
}

export async function loadPlayerProgress(uid: string): Promise<PlayerData> {
  // Always serve from local cache first for instant load
  const local = await loadLocalPlayerData(uid);
  try {
    const doc = await firestore().collection(COLLECTIONS.PLAYERS).doc(uid).get();
    if (!!doc.exists) {
      const remote = doc.data() as Omit<PlayerData, 'uid'>;
      // Remote wins if it's newer
      if (remote.updatedAt > local.updatedAt) {
        const merged: PlayerData = { uid, ...remote };
        await saveLocalPlayerData(merged);
        return merged;
      }
    }
  } catch {
    // Network unavailable — return local data silently
  }
  return local;
}

export async function updateLeaderboard(uid: string, displayName: string, score: number): Promise<void> {
  if (score < 0 || score > MAX_SCORE) return;
  const entry: Omit<LeaderboardEntry, 'uid'> = {
    displayName: displayName.slice(0, 32),
    score,
    updatedAt: Date.now(),
  };
  await firestore().collection(COLLECTIONS.LEADERBOARD).doc(uid).set(entry, { merge: true });
}

export async function getTopLeaderboard(limit: number): Promise<LeaderboardEntry[]> {
  const snapshot = await firestore()
    .collection(COLLECTIONS.LEADERBOARD)
    .orderBy('score', 'desc')
    .limit(limit)
    .get();
  return snapshot.docs.map((doc) => ({ uid: doc.id, ...(doc.data() as Omit<LeaderboardEntry, 'uid'>) }));
}
