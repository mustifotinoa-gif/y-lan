import { Difficulty, HighScoreEntry } from '../types/game';

const STORAGE_KEY = 'cybersnake_highscores_v1';

const DEFAULT_SCORES: HighScoreEntry[] = [
  {
    id: 'seed-1',
    playerName: 'NeoViper',
    score: 3450,
    length: 48,
    durationSeconds: 184,
    difficulty: 'HARD',
    date: '2026-11-01',
  },
  {
    id: 'seed-2',
    playerName: 'CyberPhantom',
    score: 2820,
    length: 39,
    durationSeconds: 152,
    difficulty: 'NORMAL',
    date: '2026-11-02',
  },
  {
    id: 'seed-3',
    playerName: 'GlitchRunner',
    score: 2190,
    length: 32,
    durationSeconds: 128,
    difficulty: 'NORMAL',
    date: '2026-11-02',
  },
  {
    id: 'seed-4',
    playerName: 'MatrixWorm',
    score: 1640,
    length: 26,
    durationSeconds: 104,
    difficulty: 'EASY',
    date: '2026-11-03',
  },
  {
    id: 'seed-5',
    playerName: 'KiraSynth',
    score: 1250,
    length: 22,
    durationSeconds: 88,
    difficulty: 'EASY',
    date: '2026-11-03',
  },
];

export function getHighScores(): HighScoreEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SCORES));
      return DEFAULT_SCORES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.sort((a, b) => b.score - a.score);
    }
    return DEFAULT_SCORES;
  } catch {
    return DEFAULT_SCORES;
  }
}

export function saveHighScore(
  playerName: string,
  score: number,
  length: number,
  durationSeconds: number,
  difficulty: Difficulty
): HighScoreEntry[] {
  const current = getHighScores();
  const cleanName = playerName.trim() || 'Anonim Yılan';
  const newEntry: HighScoreEntry = {
    id: `score-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    playerName: cleanName.slice(0, 16),
    score,
    length,
    durationSeconds,
    difficulty,
    date: new Date().toISOString().split('T')[0],
  };

  const updated = [...current, newEntry]
    .sort((a, b) => b.score - a.score)
    .slice(0, 15); // Top 15

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }

  return updated;
}

export function getBestScore(): number {
  const scores = getHighScores();
  return scores.length > 0 ? scores[0].score : 0;
}

export function isHighScore(score: number): boolean {
  if (score <= 0) return false;
  const scores = getHighScores();
  if (scores.length < 10) return true;
  return score > scores[scores.length - 1].score;
}

export function resetHighScoresToDefault(): HighScoreEntry[] {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SCORES));
  } catch {
    // ignore
  }
  return DEFAULT_SCORES;
}
