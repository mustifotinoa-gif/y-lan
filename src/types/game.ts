export type GameState = 'TITLE' | 'PLAYING' | 'PAUSED' | 'GAME_OVER';

export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export interface Point {
  x: number;
  y: number;
}

export type FoodType =
  | 'CHERRY'
  | 'CYBER_BERRY'
  | 'ENERGY_CORE'
  | 'BOT_REMAINS'
  | 'GREEN_POISON'   // Takes 0.5 heart, green bubbles
  | 'PURPLE_POISON'  // Takes 1.0 heart, purple bubbles
  | 'LAHMACUN'       // Grows 5x
  | 'GOLDEN_APPLE';   // Grows 2x

export interface FoodItem {
  id: string;
  x: number;
  y: number;
  type: FoodType;
  points: number;
  color: string;
  growth: number;
  damage?: number; // 0.5 for green poison, 1.0 for purple poison
  radius?: number;
}

export interface BotSnake {
  id: string;
  name: string;
  color: string;
  headColor: string;
  body: Point[];
  angle: number;
  targetAngle: number;
  score: number;
  length: number;
  isAlive: boolean;
  isBoosting: boolean;
  respawnInSeconds: number;
  growthPending: number;
}

export type PowerUpType = 'MAGNET' | 'SLOW' | 'DOUBLE_POINTS' | 'GOLDEN_APPLE' | 'TIME_FREEZE';

export type SnakeSkinId =
  | 'SKIN_DEFAULT'
  | 'SKIN_TURKISH'
  | 'SKIN_GOLD'
  | 'SKIN_GOKBORU'
  | 'SKIN_GALAXY'
  | 'SKIN_VOLCANO'
  | 'SKIN_SHADOW_RED';

export type PlaytimeRewardId =
  | 'REWARD_5M'
  | 'REWARD_15M'
  | 'REWARD_30M'
  | 'REWARD_1H'
  | 'REWARD_90M'
  | 'REWARD_2H';

export interface PlaytimeRewardConfig {
  id: PlaytimeRewardId;
  label: string;
  requiredSeconds: number;
  rewardType: 'COINS' | 'DOUBLE_POINTS_10M' | 'SKIN';
  rewardValue: number | SnakeSkinId;
  title: string;
  description: string;
  badge: string;
}

export interface SnakeSkinConfig {
  id: SnakeSkinId;
  name: string;
  price: number;
  description: string;
  headColor: string;
  bodyColor1: string;
  bodyColor2: string;
  glowColor: string;
  unlockedByDefault?: boolean;
}

export interface PowerUpItem {
  id: string;
  x: number;
  y: number;
  type: PowerUpType;
  expiresAt: number;
}

export interface ActivePowerUp {
  type: PowerUpType;
  remainingMs: number;
  totalMs: number;
}

export interface UpgradeLevels {
  healthLevel: number;     // 0-3: Increases max lives up to 5 and grants extra life
  speedLevel: number;      // 0-3: Increases turn responsiveness & base/turbo speed
  agilityLevel: number;    // 0-3: Increases snake turning agility & adds poison damage reduction
  coinMasteryLevel: number; // 0-2: Increases coins earned from Lahmacun and other foods
}

export type Difficulty =
  | 'ULTRA_EASY'
  | 'EASY'
  | 'NORMAL'
  | 'MEDIUM_HARD'
  | 'HARD'
  | 'VERY_HARD'
  | 'INCREDIBLE_HARD'
  | 'IMPOSSIBLE';

export interface DifficultyConfig {
  label: string;
  sublabel: string;
  initialSpeedMs: number;
  baseSpeed: number;
  botSpeed: number;
  scoreMultiplier: number;
  botCount: number;
  poisonRate: number; // probability of poison food appearing
  aiIntelligenceLabel: string;
  aiAggression: number;
  aiAvoidanceDistance: number;
  aiRayCount: number;
  aiPredictiveCutoff: number;
  aiBoostChance: number;
  aiTurnSpeed: number;
  aiPoisonAwareness: number;
}

export interface HighScoreEntry {
  id: string;
  playerName: string;
  score: number;
  length: number;
  durationSeconds: number;
  difficulty: Difficulty;
  date: string;
}

export interface FloatingText {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  alpha: number;
  life: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  life: number;
  maxLife: number;
}

export interface LiveStandingItem {
  name: string;
  score: number;
  color: string;
  isPlayer: boolean;
  isAlive: boolean;
  length: number;
  isRealHuman?: boolean;
}

export type GameMode = 'SOLO' | 'MULTIPLAYER';

export type MarketRarity = 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY' | 'MYTHIC' | 'GODLY';

export type MarketPowerId =
  | 'TIME_FREEZE'
  | 'SUPER_TURBO'
  | 'MEGA_LAHMACUN'
  | 'MAGNET_VORTEX'
  | 'CYBER_SHIELD'
  | 'MYTHIC_CLONING'
  | 'MYTHIC_HEARTS'
  | 'GODLY_TELEPORT';

export type SummonCrateType = 'STANDARD' | 'MYTHIC_CRATE';

export interface MarketPowerConfig {
  id: MarketPowerId;
  name: string;
  rarity: MarketRarity;
  chancePercent: number;
  chanceLabel: string;
  price: number;
  description: string;
  badgeLabel: string;
  tagColor: string;
}

export interface CloneSnake {
  id: string;
  name: string;
  body: Point[];
  angle: number;
  isAlive: boolean;
  length: number;
  offsetAngle: number;
  offsetDist: number;
}

export interface SummonResultItem {
  id: string;
  powerId?: MarketPowerId;
  name: string;
  rarity: MarketRarity;
  isNew: boolean;
  compensationCoins?: number;
  description: string;
}
