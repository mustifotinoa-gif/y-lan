import { Difficulty, DifficultyConfig, FoodType } from '../types/game';

// Arena & Physics Dimensions for Snake.io
export const ARENA_SIZE = 2600; // 2600x2600 px expansive arena
export const ARENA_RADIUS = 1250; // Circular or bounded boundary
export const GRID_SIZE = 64; // Used for radar calculations
export const MAX_LIVES = 3.0; // 3 base lives
export const INVULNERABLE_DURATION_MS = 2500;
export const COMBO_WINDOW_MS = 4000;
export const DEFAULT_FOOD_COUNT = 60; // 60 simultaneous glowing food items on arena
export const BOT_RESPAWN_DELAY_SEC = 4;
export const BOT_KILL_BONUS = 150;
export const VIEWPORT_CELLS = 24;

// Segment radii
export const SEGMENT_RADIUS = 13;
export const SEGMENT_SPACING = 8.5;

export const FOOD_CATALOG: Record<
  FoodType,
  { label: string; points: number; color: string; auraColor: string; growth: number; damage?: number; symbol?: string; radius: number }
> = {
  CHERRY: {
    label: 'Neon Elma',
    points: 10,
    color: '#ff0055',
    auraColor: 'rgba(255, 0, 85, 0.45)',
    growth: 1,
    radius: 7,
  },
  CYBER_BERRY: {
    label: 'Siber Meyve',
    points: 15,
    color: '#00e5ff',
    auraColor: 'rgba(0, 229, 255, 0.45)',
    growth: 1,
    radius: 8,
  },
  ENERGY_CORE: {
    label: 'Enerji Çekirdeği',
    points: 25,
    color: '#fbbf24',
    auraColor: 'rgba(251, 191, 36, 0.45)',
    growth: 1,
    symbol: '✦',
    radius: 9,
  },
  BOT_REMAINS: {
    label: 'Bot Parçası',
    points: 30,
    color: '#a855f7',
    auraColor: 'rgba(168, 85, 247, 0.55)',
    growth: 1,
    symbol: '⚡',
    radius: 9,
  },
  GREEN_POISON: {
    label: 'Yeşil Zehir',
    points: -10,
    color: '#84cc16', // Toxic Green
    auraColor: 'rgba(132, 204, 22, 0.65)',
    growth: 0,
    damage: 0.5, // Takes 0.5 heart!
    symbol: '☠',
    radius: 11,
  },
  PURPLE_POISON: {
    label: 'Ölümcül Mor Zehir',
    points: -25,
    color: '#c026d3', // Dark Toxic Purple
    auraColor: 'rgba(192, 38, 211, 0.75)',
    growth: 0,
    damage: 1.0, // Takes 1.0 FULL heart!
    symbol: '💀',
    radius: 12,
  },
  LAHMACUN: {
    label: 'Çıtır Lahmacun',
    points: 50,
    color: '#ea580c', // Crispy Orange Flame
    auraColor: 'rgba(234, 88, 12, 0.7)',
    growth: 5, // Expands snake 5x!
    symbol: '🌯',
    radius: 14,
  },
  GOLDEN_APPLE: {
    label: 'Altın Elma',
    points: 35,
    color: '#f59e0b', // Radiant Gold
    auraColor: 'rgba(245, 158, 11, 0.7)',
    growth: 2, // Expands snake 2x!
    symbol: '⭐',
    radius: 12,
  },
};

export const DIFFICULTIES: Record<Difficulty, DifficultyConfig> = {
  ULTRA_EASY: {
    label: 'Ultra Kolay',
    sublabel: '1 bot, minimum yeşil zehir, sakin öğrenme',
    initialSpeedMs: 160,
    baseSpeed: 175,
    botSpeed: 140,
    scoreMultiplier: 0.8,
    botCount: 1,
    poisonRate: 0.04,
  },
  EASY: {
    label: 'Kolay',
    sublabel: '2 bot, seyrek yeşil zehir ve rahat tempo',
    initialSpeedMs: 140,
    baseSpeed: 195,
    botSpeed: 160,
    scoreMultiplier: 1.0,
    botCount: 2,
    poisonRate: 0.07,
  },
  NORMAL: {
    label: 'Normal',
    sublabel: '3 bot, dengeli yeşil/mor zehirler',
    initialSpeedMs: 115,
    baseSpeed: 215,
    botSpeed: 185,
    scoreMultiplier: 1.5,
    botCount: 3,
    poisonRate: 0.12,
  },
  MEDIUM_HARD: {
    label: 'Orta Zor',
    sublabel: '4 bot, artan mor zehirler ve yüksek tempo',
    initialSpeedMs: 100,
    baseSpeed: 235,
    botSpeed: 205,
    scoreMultiplier: 2.0,
    botCount: 4,
    poisonRate: 0.18,
  },
  HARD: {
    label: 'Zor',
    sublabel: '5 agresif bot, %24 zehir sıklığı ve hızlı arena',
    initialSpeedMs: 85,
    baseSpeed: 255,
    botSpeed: 225,
    scoreMultiplier: 2.5,
    botCount: 5,
    poisonRate: 0.24,
  },
  VERY_HARD: {
    label: 'Çok Zor',
    sublabel: '6 bot amansız avda, %30 ölümcül zehirler',
    initialSpeedMs: 70,
    baseSpeed: 275,
    botSpeed: 245,
    scoreMultiplier: 3.2,
    botCount: 6,
    poisonRate: 0.30,
  },
  INCREDIBLE_HARD: {
    label: 'İnanılmaz Zor',
    sublabel: '7 bot sahada, yıldırım hız ve %36 zehir tehlikesi',
    initialSpeedMs: 58,
    baseSpeed: 295,
    botSpeed: 265,
    scoreMultiplier: 4.2,
    botCount: 7,
    poisonRate: 0.36,
  },
  IMPOSSIBLE: {
    label: 'İmkansız',
    sublabel: '8 bot! Maksimum hız, %44 ölümcül mor/yeşil zehir kaosu',
    initialSpeedMs: 45,
    baseSpeed: 320,
    botSpeed: 290,
    scoreMultiplier: 5.5,
    botCount: 8,
    poisonRate: 0.44,
  },
};

export const BOT_CONFIGS = [
  {
    id: 'bot-1',
    name: 'SiberViper',
    color: '#f97316',
    headColor: '#fbbf24',
    initialX: 500,
    initialY: 500,
    initialLength: 14,
  },
  {
    id: 'bot-2',
    name: 'GölgeNeon',
    color: '#a855f7',
    headColor: '#ec4899',
    initialX: 2100,
    initialY: 2100,
    initialLength: 16,
  },
  {
    id: 'bot-3',
    name: 'GlitchTitan',
    color: '#06b6d4',
    headColor: '#38bdf8',
    initialX: 2100,
    initialY: 500,
    initialLength: 18,
  },
  {
    id: 'bot-4',
    name: 'SiberFantom',
    color: '#ef4444',
    headColor: '#f87171',
    initialX: 500,
    initialY: 2100,
    initialLength: 15,
  },
  {
    id: 'bot-5',
    name: 'MatriksEjderi',
    color: '#10b981',
    headColor: '#34d399',
    initialX: 1300,
    initialY: 450,
    initialLength: 20,
  },
  {
    id: 'bot-6',
    name: 'NeonAzrail',
    color: '#ec4899',
    headColor: '#f472b6',
    initialX: 1300,
    initialY: 2150,
    initialLength: 22,
  },
  {
    id: 'bot-7',
    name: 'KuantumYılanı',
    color: '#eab308',
    headColor: '#fde047',
    initialX: 450,
    initialY: 1300,
    initialLength: 17,
  },
  {
    id: 'bot-8',
    name: 'KaosHidrası',
    color: '#6366f1',
    headColor: '#818cf8',
    initialX: 2150,
    initialY: 1300,
    initialLength: 25,
  },
];

export const POWER_UP_CONFIG = {
  MAGNET: {
    label: 'Manyetik Çekim',
    color: '#00e5ff',
    durationMs: 8000,
    icon: 'Magnet',
    description: 'Tüm yemleri yılana çeker',
  },
  SLOW: {
    label: 'Zaman Yavaşlatma',
    color: '#a855f7',
    durationMs: 7000,
    icon: 'Zap',
    description: 'Yılan hızını geçici yarıya indirir',
  },
  DOUBLE_POINTS: {
    label: '2x Çift Puan',
    color: '#ec4899',
    durationMs: 9000,
    icon: 'Flame',
    description: 'Yenilen tüm yemlerde 2 kat puan',
  },
  GOLDEN_APPLE: {
    label: 'Altın Elma',
    color: '#f59e0b',
    durationMs: 0,
    icon: 'Star',
    description: '+50 Anında Bonus Puan & +2 Uzama',
  },
};
