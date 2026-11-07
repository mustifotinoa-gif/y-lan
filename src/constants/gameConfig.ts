import { Difficulty, DifficultyConfig, FoodType, MarketPowerConfig, MarketPowerId, MarketRarity, PlaytimeRewardConfig } from '../types/game';

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
    aiIntelligenceLabel: 'Acemi Zeka (Yavaş, Sakin, Tehlikesiz)',
    aiAggression: 0.05,
    aiAvoidanceDistance: 65,
    aiRayCount: 3,
    aiPredictiveCutoff: 0.0,
    aiBoostChance: 0.0,
    aiTurnSpeed: 3.4,
    aiPoisonAwareness: 0.2,
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
    aiIntelligenceLabel: 'Çaylak Zeka (Yiyecek Peşinde, Düşük Refleks)',
    aiAggression: 0.15,
    aiAvoidanceDistance: 80,
    aiRayCount: 5,
    aiPredictiveCutoff: 0.1,
    aiBoostChance: 0.05,
    aiTurnSpeed: 3.8,
    aiPoisonAwareness: 0.4,
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
    aiIntelligenceLabel: 'Dengeli Zeka (Manevra Yapar, Engellerden Kaçar)',
    aiAggression: 0.35,
    aiAvoidanceDistance: 105,
    aiRayCount: 7,
    aiPredictiveCutoff: 0.35,
    aiBoostChance: 0.20,
    aiTurnSpeed: 4.6,
    aiPoisonAwareness: 0.65,
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
    aiIntelligenceLabel: 'Taktiksel Avcı (Ön Kesme Hamleleri, Çevik Savunma)',
    aiAggression: 0.55,
    aiAvoidanceDistance: 125,
    aiRayCount: 7,
    aiPredictiveCutoff: 0.65,
    aiBoostChance: 0.40,
    aiTurnSpeed: 5.3,
    aiPoisonAwareness: 0.80,
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
    aiIntelligenceLabel: 'Kıdemli Yırtıcı (Tahmin Odaklı Önleme, Turbo Hücum)',
    aiAggression: 0.72,
    aiAvoidanceDistance: 145,
    aiRayCount: 9,
    aiPredictiveCutoff: 0.95,
    aiBoostChance: 0.55,
    aiTurnSpeed: 6.0,
    aiPoisonAwareness: 0.90,
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
    aiIntelligenceLabel: 'Usta Suikastçı (Kıskaç & Kuşatma Taktikleri, Seri Refleks)',
    aiAggression: 0.84,
    aiAvoidanceDistance: 160,
    aiRayCount: 9,
    aiPredictiveCutoff: 1.2,
    aiBoostChance: 0.70,
    aiTurnSpeed: 6.6,
    aiPoisonAwareness: 0.95,
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
    aiIntelligenceLabel: 'Apex Siber Zeka (Kusursuz Ön Sezi, Zehre Sıkıştırma)',
    aiAggression: 0.92,
    aiAvoidanceDistance: 175,
    aiRayCount: 11,
    aiPredictiveCutoff: 1.4,
    aiBoostChance: 0.80,
    aiTurnSpeed: 7.2,
    aiPoisonAwareness: 1.0,
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
    aiIntelligenceLabel: 'Kıyamet Bot Zekası (8 Botluk Acımasız Sürü, Hatasız Manevra)',
    aiAggression: 0.98,
    aiAvoidanceDistance: 190,
    aiRayCount: 11,
    aiPredictiveCutoff: 1.6,
    aiBoostChance: 0.90,
    aiTurnSpeed: 7.8,
    aiPoisonAwareness: 1.0,
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
  TIME_FREEZE: {
    label: 'Zaman Durdurma (10 Saniye)',
    color: '#38bdf8',
    durationMs: 10000,
    icon: 'Hourglass',
    description: '10 saniyeliğine tüm botları dondurur!',
  },
};

export const SNAKE_SKINS = {
  SKIN_DEFAULT: {
    id: 'SKIN_DEFAULT' as const,
    name: 'Siber Zümrüt',
    price: 0,
    description: 'Klasik neon siber zümrüt yılan görünümü',
    headColor: '#a5f3fc',
    bodyColor1: '#00e5ff',
    bodyColor2: '#10b981',
    glowColor: 'rgba(0, 229, 255, 0.6)',
    unlockedByDefault: true,
  },
  SKIN_TURKISH: {
    id: 'SKIN_TURKISH' as const,
    name: 'Ay-Yıldız Neon',
    price: 1500,
    description: 'Kırmızı ve beyaz hilal parıltılı milli tema',
    headColor: '#ffffff',
    bodyColor1: '#ef4444',
    bodyColor2: '#ffffff',
    glowColor: 'rgba(239, 68, 68, 0.7)',
  },
  SKIN_GOLD: {
    id: 'SKIN_GOLD' as const,
    name: 'Altın Ejderha',
    price: 2500,
    description: 'Saf altın pullar ve kraliyet parıltısı',
    headColor: '#fef08a',
    bodyColor1: '#f59e0b',
    bodyColor2: '#d97706',
    glowColor: 'rgba(245, 158, 11, 0.75)',
  },
  SKIN_GOKBORU: {
    id: 'SKIN_GOKBORU' as const,
    name: 'Gökbörü Kurt',
    price: 3500,
    description: 'Bozkır kurdu turkuaz mavisi ve buz aurası',
    headColor: '#bae6fd',
    bodyColor1: '#0284c7',
    bodyColor2: '#0369a1',
    glowColor: 'rgba(2, 132, 199, 0.7)',
  },
  SKIN_GALAXY: {
    id: 'SKIN_GALAXY' as const,
    name: 'Kozmik Galaksi',
    price: 4500,
    description: 'Nebula moru ve parıldayan yıldız tozu',
    headColor: '#f5d0fe',
    bodyColor1: '#c026d3',
    bodyColor2: '#7e22ce',
    glowColor: 'rgba(192, 38, 211, 0.75)',
  },
  SKIN_VOLCANO: {
    id: 'SKIN_VOLCANO' as const,
    name: 'Volkanik Kor',
    price: 6000,
    description: 'Erimiş lav ateşi ve akkor kor enerjisi',
    headColor: '#fed7aa',
    bodyColor1: '#f97316',
    bodyColor2: '#dc2626',
    glowColor: 'rgba(249, 115, 22, 0.8)',
  },
  SKIN_SHADOW_RED: {
    id: 'SKIN_SHADOW_RED' as const,
    name: 'Siyah-Kırmızı Çizgi',
    price: 0,
    description: '1 Saat Oynama Hediyesi: Mat siyah gövde üzerinde neon kırmızı siber şeritler',
    headColor: '#27272a',
    bodyColor1: '#09090b',
    bodyColor2: '#ef4444',
    glowColor: 'rgba(239, 68, 68, 0.85)',
  },
};

export const PLAYTIME_REWARDS: PlaytimeRewardConfig[] = [
  {
    id: 'REWARD_5M',
    label: '5 Dakika',
    requiredSeconds: 5 * 60, // 300 saniye
    rewardType: 'COINS',
    rewardValue: 50,
    title: '50 Coin Ödülü',
    description: 'İlk 5 dakikanı tamamladın! Kasanıza anında 50 Coin eklenir.',
    badge: '🪙 +50 Coin',
  },
  {
    id: 'REWARD_15M',
    label: '15 Dakika',
    requiredSeconds: 15 * 60, // 900 saniye
    rewardType: 'DOUBLE_POINTS_10M',
    rewardValue: 10 * 60 * 1000, // 10 dakika (600.000 ms)
    title: '10 Dakika 2x Çift Puan',
    description: '15 dakika oynadın! Tam 10 dakika boyunca yenen tüm yemlerden 2 kat skor kazanırsın.',
    badge: '🔥 10dk 2x Puan',
  },
  {
    id: 'REWARD_30M',
    label: '30 Dakika',
    requiredSeconds: 30 * 60, // 1800 saniye
    rewardType: 'COINS',
    rewardValue: 200,
    title: '200 Coin Ödülü',
    description: 'Yarım saatlik usta yılan oyunu! Kasanıza anında 200 Coin aktarılır.',
    badge: '🪙 +200 Coin',
  },
  {
    id: 'REWARD_1H',
    label: '1 Saat',
    requiredSeconds: 60 * 60, // 3600 saniye
    rewardType: 'SKIN',
    rewardValue: 'SKIN_SHADOW_RED',
    title: 'Bedava Siyah-Kırmızı Çizgi Kostümü',
    description: 'Tam 1 saat oynadın! Efsanevi mat siyah ve neon kırmızı şeritli kostüm hediye edildi.',
    badge: '🎨 Bedava Kostüm',
  },
  {
    id: 'REWARD_90M',
    label: '1 Saat 30 Dakika',
    requiredSeconds: 90 * 60, // 5400 saniye
    rewardType: 'COINS',
    rewardValue: 789,
    title: '789 Coin Ödülü',
    description: '90 dakikalık siber mücadele! Kasanıza tam 789 Coin aktarılır.',
    badge: '🪙 +789 Coin',
  },
  {
    id: 'REWARD_2H',
    label: '2 Saat',
    requiredSeconds: 120 * 60, // 7200 saniye
    rewardType: 'COINS',
    rewardValue: 2300,
    title: '2.300 Coin Süper Ödülü',
    description: 'İki saatlik efsanevi sadakat ödülü! Kasanıza devasa 2.300 Coin eklenir.',
    badge: '🪙 +2.300 Coin',
  },
];

export const MARKET_ROTATION_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes

export const MARKET_POWERS: Record<MarketPowerId, MarketPowerConfig> = {
  MYTHIC_CLONING: {
    id: 'MYTHIC_CLONING',
    name: 'Mitolojik Klonlama (3 Klon)',
    rarity: 'MYTHIC',
    chancePercent: 0.01,
    chanceLabel: '%0.01',
    price: 200000,
    description: 'Arenada yanınızda 3 sadık klon yılan çıkarır! Hem çoklu hem tek oyunculuda çalışır. Klonlar ölünce içinden hiçbir şey çıkmaz.',
    badgeLabel: 'Mitolojik Güç (Kırmızı)',
    tagColor: 'from-red-600 via-rose-600 to-red-500',
  },
  MYTHIC_HEARTS: {
    id: 'MYTHIC_HEARTS',
    name: 'Mitolojik Sonsuz Kalp (10 Can)',
    rarity: 'MYTHIC',
    chancePercent: 0.01,
    chanceLabel: '%0.01',
    price: 300000,
    description: 'Yılanınıza devasa 10 Tam Kalp verir! Maksimum can kapasitesini 10 kalbe çıkarır ve anında fuller.',
    badgeLabel: 'Mitolojik Güç (Kırmızı)',
    tagColor: 'from-red-600 via-rose-600 to-red-500',
  },
  TIME_FREEZE: {
    id: 'TIME_FREEZE',
    name: 'Zaman Durdurma (10 Saniye)',
    rarity: 'LEGENDARY',
    chancePercent: 0.1,
    chanceLabel: '%0.1',
    price: 10000,
    description: '10 saniyeliğine arenadaki tüm botları kaskatı dondurur. [G] tuşu ile kullanılır. 150sn bekleme süresi.',
    badgeLabel: 'Efsanevi Güç (Sarı)',
    tagColor: 'from-yellow-400 via-amber-400 to-yellow-500',
  },
  SUPER_TURBO: {
    id: 'SUPER_TURBO',
    name: 'Süper Turbo Sprint',
    rarity: 'LEGENDARY',
    chancePercent: 0.1,
    chanceLabel: '%0.1',
    price: 5000,
    description: 'Sadece marketten açılabilir! Turbo sprint yeteneğini kazandırır. Stamina %70 daha yavaş tükenir, 2 kat hızlı dolar ve neon altın hız izi bırakır!',
    badgeLabel: 'Efsanevi Güç (Sarı)',
    tagColor: 'from-yellow-400 via-amber-400 to-yellow-500',
  },
  MEGA_LAHMACUN: {
    id: 'MEGA_LAHMACUN',
    name: 'Mega Lahmacun Ziyafeti',
    rarity: 'EPIC',
    chancePercent: 30.0,
    chanceLabel: '%30.0',
    price: 350,
    description: 'Arenada bonus dev lahmacunlar çıkarır ve her yenen yemekte ekstra +%15 kitle uzaması kazandırır.',
    badgeLabel: 'Epik Güç (Mor)',
    tagColor: 'from-purple-600 via-fuchsia-600 to-purple-500',
  },
  MAGNET_VORTEX: {
    id: 'MAGNET_VORTEX',
    name: 'Mıknatıs Girdabı',
    rarity: 'RARE',
    chancePercent: 34.9,
    chanceLabel: '%34.9',
    price: 500,
    description: 'Kalıcı manyetik çekim alanı: Sahadaki tüm parıltılı enerji kürelerini otomatik olarak yılanınıza doğru çeker.',
    badgeLabel: 'Nadir Güç (Mavi)',
    tagColor: 'from-blue-600 via-sky-500 to-blue-500',
  },
  CYBER_SHIELD: {
    id: 'CYBER_SHIELD',
    name: 'Siber Kalkan Zırhı',
    rarity: 'RARE',
    chancePercent: 35.0,
    chanceLabel: '%35.0',
    price: 750,
    description: 'Kalıcı koruma zırhı: Zehirli baloncuklardan gelen hasarları %50 soğurur ve canınızı korur.',
    badgeLabel: 'Nadir Güç (Mavi)',
    tagColor: 'from-blue-600 via-sky-500 to-blue-500',
  },
  GODLY_TELEPORT: {
    id: 'GODLY_TELEPORT',
    name: 'Tanrısal Işınlanma (2 Hak)',
    rarity: 'GODLY',
    chancePercent: 0.001,
    chanceLabel: '%000,1',
    price: 500000,
    description: 'İki kez haritada istediğiniz herhangi bir noktaya anında ışınlanın! Ekrana tıklayarak veya [X] tuşuyla hedef belirleyip ışınlanabilirsiniz. Işınlanma anında 2 saniye tam hasar almazlık sağlar.',
    badgeLabel: 'Tanrısal Güç (Lâcivert)',
    tagColor: 'from-blue-950 via-indigo-950 to-blue-900',
  },
};

// Exact user rarity color mapping:
// Godly: Lâcivert | Mythic: Kırmızı | Legendary: Sarı | Epic: Mor | Rare: Mavi | Common: Yeşil
export const RARITY_CONFIGS: Record<
  MarketRarity,
  {
    name: string;
    color: string;
    textColor: string;
    bgColor: string;
    borderColor: string;
    borderActive: string;
    glow: string;
    badgeBg: string;
    chanceLabel: string;
  }
> = {
  GODLY: {
    name: 'Tanrısal',
    color: '#1e3a8a', // Lâcivert (Navy Blue)
    textColor: 'text-indigo-300',
    bgColor: 'bg-indigo-950/70',
    borderColor: 'border-blue-700/80',
    borderActive: 'border-blue-500',
    glow: 'shadow-[0_0_35px_rgba(30,58,138,0.7)]',
    badgeBg: 'bg-gradient-to-r from-blue-950 via-indigo-950 to-blue-900 text-blue-200 border border-blue-500/60 shadow-indigo-950/60 font-black',
    chanceLabel: '%000,1',
  },
  MYTHIC: {
    name: 'Mitolojik',
    color: '#ef4444', // Kırmızı
    textColor: 'text-red-400',
    bgColor: 'bg-red-950/40',
    borderColor: 'border-red-500/70',
    borderActive: 'border-red-500',
    glow: 'shadow-[0_0_30px_rgba(239,68,68,0.45)]',
    badgeBg: 'bg-gradient-to-r from-red-600 via-rose-600 to-red-500 text-white shadow-red-500/40',
    chanceLabel: '%0.01',
  },
  LEGENDARY: {
    name: 'Efsanevi',
    color: '#eab308', // Sarı
    textColor: 'text-yellow-300',
    bgColor: 'bg-yellow-950/30',
    borderColor: 'border-yellow-400/70',
    borderActive: 'border-yellow-400',
    glow: 'shadow-[0_0_25px_rgba(234,179,8,0.4)]',
    badgeBg: 'bg-gradient-to-r from-yellow-500 via-amber-400 to-yellow-600 text-slate-950 font-black shadow-yellow-500/30',
    chanceLabel: '%0.1',
  },
  EPIC: {
    name: 'Epik',
    color: '#a855f7', // Mor
    textColor: 'text-purple-300',
    bgColor: 'bg-purple-950/30',
    borderColor: 'border-purple-500/70',
    borderActive: 'border-purple-500',
    glow: 'shadow-[0_0_20px_rgba(168,85,247,0.35)]',
    badgeBg: 'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow-purple-500/30',
    chanceLabel: '%30.0',
  },
  RARE: {
    name: 'Nadir',
    color: '#3b82f6', // Mavi
    textColor: 'text-blue-300',
    bgColor: 'bg-blue-950/30',
    borderColor: 'border-blue-500/70',
    borderActive: 'border-blue-500',
    glow: 'shadow-[0_0_15px_rgba(59,130,246,0.3)]',
    badgeBg: 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-blue-500/25',
    chanceLabel: '%34.9',
  },
  COMMON: {
    name: 'Yaygın',
    color: '#22c55e', // Yeşil
    textColor: 'text-emerald-300',
    bgColor: 'bg-emerald-950/30',
    borderColor: 'border-emerald-500/70',
    borderActive: 'border-emerald-500',
    glow: 'shadow-[0_0_15px_rgba(34,197,94,0.25)]',
    badgeBg: 'bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-emerald-500/25',
    chanceLabel: '%35.0',
  },
};
