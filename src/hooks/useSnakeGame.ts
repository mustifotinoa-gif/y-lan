import { useState, useEffect, useRef, useCallback } from 'react';
import {
  ARENA_RADIUS,
  ARENA_SIZE,
  BOT_CONFIGS,
  BOT_KILL_BONUS,
  BOT_RESPAWN_DELAY_SEC,
  COMBO_WINDOW_MS,
  DEFAULT_FOOD_COUNT,
  DIFFICULTIES,
  FOOD_CATALOG,
  INVULNERABLE_DURATION_MS,
  MAX_LIVES,
  POWER_UP_CONFIG,
  SEGMENT_RADIUS,
  SEGMENT_SPACING,
  SNAKE_SKINS,
} from '../constants/gameConfig';
import { sound } from '../services/audio';
import { getBestScore, getHighScores, isHighScore, saveHighScore } from '../services/storage';
import {
  ActivePowerUp,
  BotSnake,
  Difficulty,
  FloatingText,
  FoodItem,
  FoodType,
  GameState,
  HighScoreEntry,
  LiveStandingItem,
  Particle,
  Point,
  PowerUpItem,
  PowerUpType,
  SnakeSkinId,
  UpgradeLevels,
  GameMode,
  CloneSnake,
  MarketPowerId,
  MarketRarity,
  PlaytimeRewardId,
  SummonCrateType,
  SummonResultItem,
} from '../types/game';
import {
  MARKET_POWERS,
  MARKET_ROTATION_INTERVAL_MS,
  PLAYTIME_REWARDS,
} from '../constants/gameConfig';
import { multiplayer, RemoteHumanPlayer, ChatMessage } from '../services/multiplayer';

// Engine state structure kept in a ref for zero-garbage 120 FPS RAF performance
interface GameEngineState {
  playerX: number;
  playerY: number;
  playerAngle: number;
  playerTargetAngle: number;
  playerBody: Point[];
  playerLength: number;
  playerGrowthPending: number;
  isBoosting: boolean;
  boostStamina: number; // 0 - 100
  foods: FoodItem[];
  bots: BotSnake[];
  particles: Particle[];
  floatingTexts: FloatingText[];
  powerUps: PowerUpItem[];
  activePowerUps: ActivePowerUp[];
  lives: number;
  score: number;
  combo: number;
  comboExpiry: number;
  foodEatenCount: number;
  lahmacunEatenCount: number;
  botKillsCount: number;
  isInvulnerable: boolean;
  invulnerableUntil: number;
  durationSeconds: number;
  lastTime: number;
  timeFreezeRemainingMs: number;
  timeFreezeCooldownMs: number;
  selectedSkin: SnakeSkinId;
  clones: CloneSnake[];
}

export function useSnakeGame() {
  const [gameState, setGameState] = useState<GameState>('TITLE');
  const [difficulty, setDifficulty] = useState<Difficulty>('NORMAL');
  const [lives, setLives] = useState<number>(MAX_LIVES);
  const [score, setScore] = useState<number>(0);
  const [length, setLength] = useState<number>(18);
  const [combo, setCombo] = useState<number>(1);
  const [comboExpiry, setComboExpiry] = useState<number>(0);
  const [botKillsCount, setBotKillsCount] = useState<number>(0);
  const [durationSeconds, setDurationSeconds] = useState<number>(0);
  const [isInvulnerable, setIsInvulnerable] = useState<boolean>(false);
  const [isShaking, setIsShaking] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(() => sound.getMuted());
  const [highScores, setHighScores] = useState<HighScoreEntry[]>(() => getHighScores());
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState<boolean>(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState<boolean>(false);
  const [currentFps, setCurrentFps] = useState<number>(120);
  const [playerRank, setPlayerRank] = useState<number>(1);
  const [totalSnakes, setTotalSnakes] = useState<number>(4);
  const [boostStaminaPercent, setBoostStaminaPercent] = useState<number>(100);
  const [isBoosting, setIsBoosting] = useState<boolean>(false);
  const [activePowerUps, setActivePowerUps] = useState<ActivePowerUp[]>([]);
  const [liveStandings, setLiveStandings] = useState<LiveStandingItem[]>([]);

  // Coins persistent state
  const [coins, setCoins] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('cybersnake_coins_v3');
      return saved ? Number(saved) : 50; // 50 welcome coins!
    } catch {
      return 50;
    }
  });

  // Upgrades persistent state
  const [upgrades, setUpgrades] = useState<UpgradeLevels>(() => {
    try {
      const saved = localStorage.getItem('cybersnake_upgrades_v3');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      healthLevel: 0,
      speedLevel: 0,
      agilityLevel: 0,
      coinMasteryLevel: 0,
    };
  });

  // Time Freeze (Zaman Durdurma) persistent state
  const [timeFreezeCharges, setTimeFreezeCharges] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('cybersnake_time_freeze_charges');
      return saved ? Number(saved) : 0; // 0 initial charges - must be bought in market for 10.000 coins
    } catch {
      return 0;
    }
  });

  const [timeFreezeRemainingMs, setTimeFreezeRemainingMs] = useState<number>(0);
  const [timeFreezeCooldownMs, setTimeFreezeCooldownMs] = useState<number>(0);

  // Snake Skin selection persistent state
  const [selectedSkin, setSelectedSkin] = useState<SnakeSkinId>(() => {
    try {
      const saved = localStorage.getItem('cybersnake_selected_skin') as SnakeSkinId;
      return saved && SNAKE_SKINS[saved] ? saved : 'SKIN_DEFAULT';
    } catch {
      return 'SKIN_DEFAULT';
    }
  });

  const [unlockedSkins, setUnlockedSkins] = useState<SnakeSkinId[]>(() => {
    try {
      const saved = localStorage.getItem('cybersnake_unlocked_skins');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return ['SKIN_DEFAULT'];
  });

  // Tactical Market Items persistent state (One-time purchases)
  const [hasMegaLahmacun, setHasMegaLahmacun] = useState<boolean>(() => {
    try {
      return localStorage.getItem('cybersnake_item_mega_lahmacun') === 'true';
    } catch {
      return false;
    }
  });

  const [hasMagnetVortex, setHasMagnetVortex] = useState<boolean>(() => {
    try {
      return localStorage.getItem('cybersnake_item_magnet_vortex') === 'true';
    } catch {
      return false;
    }
  });

  const [hasCyberShield, setHasCyberShield] = useState<boolean>(() => {
    try {
      return localStorage.getItem('cybersnake_item_cyber_shield') === 'true';
    } catch {
      return false;
    }
  });

  // Mythic Cloning (200.000 Coin, 3 Clones in Solo & Multiplayer)
  const [hasCloning, setHasCloning] = useState<boolean>(() => {
    try {
      return localStorage.getItem('cybersnake_item_mythic_cloning') === 'true';
    } catch {
      return false;
    }
  });

  // Mythic Titan Hearts (300.000 Coin, 10 Tam Kalp Kapasitesi)
  const [hasMythicHearts, setHasMythicHearts] = useState<boolean>(() => {
    try {
      return localStorage.getItem('cybersnake_item_mythic_hearts') === 'true';
    } catch {
      return false;
    }
  });

  // Legendary Super Turbo Sprint (5.000 Coin, 70% stamina saving, 2x recharge)
  const [hasLegendaryTurbo, setHasLegendaryTurbo] = useState<boolean>(() => {
    try {
      return localStorage.getItem('cybersnake_item_legendary_turbo') === 'true';
    } catch {
      return false;
    }
  });

  // Godly Teleport (500.000 Coin or 000,1% drop, 2x Teleport anywhere on map + 2s invulnerability)
  const [hasGodlyTeleport, setHasGodlyTeleport] = useState<boolean>(() => {
    try {
      return localStorage.getItem('cybersnake_item_godly_teleport') === 'true';
    } catch {
      return false;
    }
  });

  const [teleportCharges, setTeleportCharges] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('cybersnake_teleport_charges');
      if (saved !== null) return parseInt(saved, 10);
      return localStorage.getItem('cybersnake_item_godly_teleport') === 'true' ? 2 : 0;
    } catch {
      return 0;
    }
  });

  // 10-Minute Market Rotation Timer & Active Powers
  const [rotationTimeLeftMs, setRotationTimeLeftMs] = useState<number>(() => {
    const epoch = Math.floor(Date.now() / MARKET_ROTATION_INTERVAL_MS);
    return (epoch + 1) * MARKET_ROTATION_INTERVAL_MS - Date.now();
  });

  // Infinite Inventory of Acquired Powers (Sonsuz Alan / Kapasite: ∞)
  const [inventory, setInventory] = useState<MarketPowerId[]>(() => {
    try {
      const saved = localStorage.getItem('cybersnake_infinite_inventory');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    // Seed with starter powers or previously purchased powers
    const initial: MarketPowerId[] = ['MEGA_LAHMACUN', 'MAGNET_VORTEX'];
    if (localStorage.getItem('cybersnake_item_godly_teleport') === 'true' && !initial.includes('GODLY_TELEPORT')) initial.push('GODLY_TELEPORT');
    if (localStorage.getItem('cybersnake_item_mythic_cloning') === 'true' && !initial.includes('MYTHIC_CLONING')) initial.push('MYTHIC_CLONING');
    if (localStorage.getItem('cybersnake_item_mythic_hearts') === 'true' && !initial.includes('MYTHIC_HEARTS')) initial.push('MYTHIC_HEARTS');
    if ((parseInt(localStorage.getItem('cybersnake_time_freeze_charges') || '0', 10)) > 0 && !initial.includes('TIME_FREEZE')) initial.push('TIME_FREEZE');
    if (localStorage.getItem('cybersnake_item_legendary_turbo') === 'true' && !initial.includes('SUPER_TURBO')) initial.push('SUPER_TURBO');
    if (localStorage.getItem('cybersnake_item_cyber_shield') === 'true' && !initial.includes('CYBER_SHIELD')) initial.push('CYBER_SHIELD');
    return initial;
  });

  // Up to 5 Active Powers Selected (5 Tane Güç Yuvası)
  const [activeLoadout, setActiveLoadout] = useState<MarketPowerId[]>(() => {
    try {
      const saved = localStorage.getItem('cybersnake_active_loadout');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed.slice(0, 5);
      }
    } catch {}
    const defaultSlots: MarketPowerId[] = ['MEGA_LAHMACUN', 'MAGNET_VORTEX'];
    if (localStorage.getItem('cybersnake_item_godly_teleport') === 'true' && defaultSlots.length < 5) defaultSlots.push('GODLY_TELEPORT');
    if (localStorage.getItem('cybersnake_item_mythic_cloning') === 'true' && defaultSlots.length < 5 && !defaultSlots.includes('MYTHIC_CLONING')) defaultSlots.push('MYTHIC_CLONING');
    if (localStorage.getItem('cybersnake_item_mythic_hearts') === 'true' && defaultSlots.length < 5 && !defaultSlots.includes('MYTHIC_HEARTS')) defaultSlots.push('MYTHIC_HEARTS');
    if ((parseInt(localStorage.getItem('cybersnake_time_freeze_charges') || '0', 10)) > 0 && defaultSlots.length < 5 && !defaultSlots.includes('TIME_FREEZE')) defaultSlots.push('TIME_FREEZE');
    if (localStorage.getItem('cybersnake_item_legendary_turbo') === 'true' && defaultSlots.length < 5 && !defaultSlots.includes('SUPER_TURBO')) defaultSlots.push('SUPER_TURBO');
    return defaultSlots.slice(0, 5);
  });

  const activeLoadoutRef = useRef<MarketPowerId[]>(activeLoadout);
  useEffect(() => {
    activeLoadoutRef.current = activeLoadout;
    try {
      localStorage.setItem('cybersnake_active_loadout', JSON.stringify(activeLoadout));
    } catch {}
  }, [activeLoadout]);

  useEffect(() => {
    try {
      localStorage.setItem('cybersnake_infinite_inventory', JSON.stringify(inventory));
    } catch {}
  }, [inventory]);

  // 24-Hour Daily Reset Constant (86,400,000 ms = 24 saat)
  const DAILY_RESET_INTERVAL_MS = 24 * 60 * 60 * 1000;

  // 24-Hour Daily Reset Timestamp (Her 24 Saatte Bir Hediyeler Sıfırlanıp Yenilenir)
  const [lastDailyResetTime, setLastDailyResetTime] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('cybersnake_playtime_last_reset_time');
      if (saved) {
        const val = parseInt(saved, 10);
        if (!isNaN(val) && val > 0) return val;
      }
    } catch {}
    const now = Date.now();
    try {
      localStorage.setItem('cybersnake_playtime_last_reset_time', String(now));
    } catch {}
    return now;
  });

  // Total Playtime in Seconds (Ana menüde ve oyunda sürekli birikir)
  const [totalPlaytimeSeconds, setTotalPlaytimeSeconds] = useState<number>(() => {
    try {
      const savedReset = localStorage.getItem('cybersnake_playtime_last_reset_time');
      const resetTime = savedReset ? parseInt(savedReset, 10) : Date.now();
      if (Date.now() - resetTime >= 24 * 60 * 60 * 1000) {
        return 0;
      }
      const saved = localStorage.getItem('cybersnake_total_playtime_seconds');
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  });

  // Claimed Playtime Rewards (Alınan Dakikalık Hediyeler - 24 Saatte Bir Yenilenir)
  const [claimedRewards, setClaimedRewards] = useState<string[]>(() => {
    try {
      const savedReset = localStorage.getItem('cybersnake_playtime_last_reset_time');
      const resetTime = savedReset ? parseInt(savedReset, 10) : Date.now();
      if (Date.now() - resetTime >= 24 * 60 * 60 * 1000) {
        return [];
      }
      const saved = localStorage.getItem('cybersnake_claimed_playtime_rewards');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Continuous Playtime Accumulation (Ticks on Title Screen / Main Menu & In-Game) + 24-Hour Reset Check
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      let currentReset = lastDailyResetTime;
      try {
        const saved = localStorage.getItem('cybersnake_playtime_last_reset_time');
        if (saved) {
          const val = parseInt(saved, 10);
          if (!isNaN(val) && val > 0) currentReset = val;
        }
      } catch {}

      // Her 24 saatte bir hediyeleri sıfırla ve yeniden aç!
      if (now - currentReset >= DAILY_RESET_INTERVAL_MS) {
        const newReset = now;
        setLastDailyResetTime(newReset);
        setTotalPlaytimeSeconds(0);
        setClaimedRewards([]);
        try {
          localStorage.setItem('cybersnake_playtime_last_reset_time', String(newReset));
          localStorage.setItem('cybersnake_total_playtime_seconds', '0');
          localStorage.setItem('cybersnake_claimed_playtime_rewards', '[]');
        } catch {}
      } else {
        // Ana menüde dururken de süre devam eder (her saniye +1)
        setTotalPlaytimeSeconds((prev) => {
          const next = prev + 1;
          if (next % 5 === 0) {
            try {
              localStorage.setItem('cybersnake_total_playtime_seconds', String(next));
            } catch {}
          }
          return next;
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lastDailyResetTime]);

  // Multiplayer Game Mode State
  const [gameMode, setGameMode] = useState<GameMode>('MULTIPLAYER');
  const [roomId, setRoomId] = useState<string>('GLOBAL');
  const [playerName, setPlayerName] = useState<string>(() => {
    try {
      return localStorage.getItem('cybersnake_player_name') || 'Mustafa Kemal';
    } catch {
      return 'Mustafa Kemal';
    }
  });
  const [remotePlayers, setRemotePlayers] = useState<RemoteHumanPlayer[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [multiplayerPing, setMultiplayerPing] = useState<number>(24);

  // Calculate maximum lives with health upgrade (or 10 Full Hearts if Mythic Hearts is equipped!)
  const isMythicHeartsEquipped = hasMythicHearts && activeLoadout.includes('MYTHIC_HEARTS');
  const maxPossibleLives = isMythicHeartsEquipped
    ? 10.0
    : Math.min(
        5.0,
        MAX_LIVES + upgrades.healthLevel * 0.5 + (upgrades.healthLevel === 3 ? 0.5 : 0)
      );

  useEffect(() => {
    if (hasMythicHearts && activeLoadout.includes('MYTHIC_HEARTS')) {
      if (engineRef.current.lives < 10.0) {
        engineRef.current.lives = 10.0;
        setLives(10.0);
      }
    }
  }, [hasMythicHearts, activeLoadout]);

  // Engine state reference for 120 FPS continuous physics
  const engineRef = useRef<GameEngineState>({
    playerX: ARENA_SIZE / 2,
    playerY: ARENA_SIZE / 2,
    playerAngle: 0,
    playerTargetAngle: 0,
    playerBody: [],
    playerLength: 18,
    playerGrowthPending: 0,
    isBoosting: false,
    boostStamina: 100,
    foods: [],
    bots: [],
    particles: [],
    floatingTexts: [],
    powerUps: [],
    activePowerUps: [],
    lives: maxPossibleLives,
    score: 0,
    combo: 1,
    comboExpiry: 0,
    foodEatenCount: 0,
    lahmacunEatenCount: 0,
    botKillsCount: 0,
    isInvulnerable: false,
    invulnerableUntil: 0,
    durationSeconds: 0,
    lastTime: performance.now(),
    timeFreezeRemainingMs: 0,
    timeFreezeCooldownMs: 0,
    selectedSkin: 'SKIN_DEFAULT',
    clones: [],
  });

  // Coin updates
  const updateCoins = useCallback((delta: number) => {
    setCoins((prev) => {
      const updated = Math.max(0, Number((prev + delta).toFixed(1)));
      try {
        localStorage.setItem('cybersnake_coins_v3', String(updated));
      } catch {}
      return updated;
    });
  }, []);

  // Add particles directly into engine state
  const addEngineParticles = useCallback((x: number, y: number, color: string, count: number = 16) => {
    const arr: Particle[] = [];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 40 + Math.random() * 120;
      arr.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        size: 3 + Math.random() * 4,
        alpha: 1,
        life: 0,
        maxLife: 0.35 + Math.random() * 0.25,
      });
    }
    engineRef.current.particles.push(...arr);
  }, []);

  // Add floating text
  const addEngineFloatingText = useCallback((x: number, y: number, text: string, color: string = '#00e5ff') => {
    engineRef.current.floatingTexts.push({
      id: `ft-${Date.now()}-${Math.random()}`,
      x,
      y,
      text,
      color,
      alpha: 1,
      life: 0,
    });
  }, []);

  // Buy upgrade logic
  const buyUpgrade = useCallback(
    (type: keyof UpgradeLevels): boolean => {
      const COSTS: Record<keyof UpgradeLevels, number[]> = {
        healthLevel: [45, 90, 150],
        speedLevel: [35, 70, 120],
        agilityLevel: [40, 80, 140],
        coinMasteryLevel: [50, 100],
      };

      const currentLvl = upgrades[type];
      const costArr = COSTS[type];
      if (currentLvl >= costArr.length) {
        addEngineFloatingText(
          engineRef.current.playerX,
          engineRef.current.playerY - 30,
          '⚠️ Zaten satın aldınız!',
          '#f59e0b'
        );
        return false;
      }

      const cost = costArr[currentLvl];
      if (coins < cost) return false;

      updateCoins(-cost);
      sound.playGoldenApple();

      setUpgrades((prev) => {
        const updated = { ...prev, [type]: prev[type] + 1 };
        try {
          localStorage.setItem('cybersnake_upgrades_v3', JSON.stringify(updated));
        } catch {}
        return updated;
      });

      if (type === 'healthLevel') {
        const nextMax = Math.min(5.0, maxPossibleLives + 0.5);
        engineRef.current.lives = Math.min(nextMax, engineRef.current.lives + 1.0);
        setLives(engineRef.current.lives);
      }

      return true;
    },
    [coins, upgrades, maxPossibleLives, updateCoins, addEngineFloatingText]
  );

  // 10,000 Coin Time Freeze purchase (single purchase limit as requested)
  const buyTimeFreeze = useCallback((): boolean => {
    const PRICE = 10000;
    if (timeFreezeCharges > 0) {
      addEngineFloatingText(
        engineRef.current.playerX,
        engineRef.current.playerY - 30,
        '⚠️ Zaten satın aldınız!',
        '#f59e0b'
      );
      return false;
    }

    if (coins < PRICE) return false;

    updateCoins(-PRICE);
    sound.playPowerUp();

    setTimeFreezeCharges(1);
    setInventory((prev) => (prev.includes('TIME_FREEZE') ? prev : [...prev, 'TIME_FREEZE']));
    setActiveLoadout((prev) => (prev.includes('TIME_FREEZE') || prev.length >= 5 ? prev : [...prev, 'TIME_FREEZE']));
    try {
      localStorage.setItem('cybersnake_time_freeze_charges', '1');
    } catch {}

    addEngineFloatingText(
      engineRef.current.playerX,
      engineRef.current.playerY - 30,
      '⏳ ZAMAN DURDURMA ALINDI! (10 Saniye)',
      '#38bdf8'
    );
    return true;
  }, [coins, timeFreezeCharges, updateCoins, addEngineFloatingText]);

  // Buy tactical one-time market items with rarities
  const buyTacticalItem = useCallback(
    (itemId: MarketPowerId): boolean => {
      if (itemId === 'MYTHIC_CLONING') {
        if (hasCloning) {
          addEngineFloatingText(engineRef.current.playerX, engineRef.current.playerY - 30, '⚠️ Zaten satın aldınız!', '#ef4444');
          return false;
        }
        if (coins < 200000) return false;
        updateCoins(-200000);
        sound.playPowerUp();
        setHasCloning(true);
        setInventory((prev) => (prev.includes('MYTHIC_CLONING') ? prev : [...prev, 'MYTHIC_CLONING']));
        setActiveLoadout((prev) => (prev.includes('MYTHIC_CLONING') || prev.length >= 5 ? prev : [...prev, 'MYTHIC_CLONING']));
        try { localStorage.setItem('cybersnake_item_mythic_cloning', 'true'); } catch {}
        addEngineFloatingText(engineRef.current.playerX, engineRef.current.playerY - 30, '🔴 MİTOLOJİK KLONLAMA ALINDI! (3 Klon Sahada)', '#ef4444');
        return true;
      }

      if (itemId === 'MYTHIC_HEARTS') {
        if (hasMythicHearts) {
          addEngineFloatingText(engineRef.current.playerX, engineRef.current.playerY - 30, '⚠️ Zaten satın aldınız!', '#ef4444');
          return false;
        }
        if (coins < 300000) return false;
        updateCoins(-300000);
        sound.playPowerUp();
        setHasMythicHearts(true);
        setInventory((prev) => (prev.includes('MYTHIC_HEARTS') ? prev : [...prev, 'MYTHIC_HEARTS']));
        setActiveLoadout((prev) => (prev.includes('MYTHIC_HEARTS') || prev.length >= 5 ? prev : [...prev, 'MYTHIC_HEARTS']));
        try { localStorage.setItem('cybersnake_item_mythic_hearts', 'true'); } catch {}
        engineRef.current.lives = 10.0;
        setLives(10.0);
        addEngineFloatingText(engineRef.current.playerX, engineRef.current.playerY - 30, '🔴 MİTOLOJİK 10 KALP ALINDI! (300.000 Coin)', '#ef4444');
        return true;
      }

      if (itemId === 'SUPER_TURBO') {
        if (hasLegendaryTurbo) {
          addEngineFloatingText(engineRef.current.playerX, engineRef.current.playerY - 30, '⚠️ Zaten satın aldınız!', '#eab308');
          return false;
        }
        if (coins < 5000) return false;
        updateCoins(-5000);
        sound.playPowerUp();
        setHasLegendaryTurbo(true);
        setInventory((prev) => (prev.includes('SUPER_TURBO') ? prev : [...prev, 'SUPER_TURBO']));
        setActiveLoadout((prev) => (prev.includes('SUPER_TURBO') || prev.length >= 5 ? prev : [...prev, 'SUPER_TURBO']));
        try { localStorage.setItem('cybersnake_item_legendary_turbo', 'true'); } catch {}
        addEngineFloatingText(engineRef.current.playerX, engineRef.current.playerY - 30, '🟡 EFSANEVİ SÜPER TURBO ALINDI! (%70 Tasarruf)', '#eab308');
        return true;
      }

      if (itemId === 'TIME_FREEZE') {
        return buyTimeFreeze();
      }

      if (itemId === 'MEGA_LAHMACUN') {
        if (hasMegaLahmacun) {
          addEngineFloatingText(engineRef.current.playerX, engineRef.current.playerY - 30, '⚠️ Zaten satın aldınız!', '#a855f7');
          return false;
        }
        if (coins < 350) return false;
        updateCoins(-350);
        sound.playGoldenApple();
        setHasMegaLahmacun(true);
        setInventory((prev) => (prev.includes('MEGA_LAHMACUN') ? prev : [...prev, 'MEGA_LAHMACUN']));
        setActiveLoadout((prev) => (prev.includes('MEGA_LAHMACUN') || prev.length >= 5 ? prev : [...prev, 'MEGA_LAHMACUN']));
        try { localStorage.setItem('cybersnake_item_mega_lahmacun', 'true'); } catch {}
        addEngineFloatingText(engineRef.current.playerX, engineRef.current.playerY - 30, '🟣 EPİK MEGA LAHMACUN ZİYAFETİ ALINDI!', '#a855f7');
        return true;
      }

      if (itemId === 'MAGNET_VORTEX') {
        if (hasMagnetVortex) {
          addEngineFloatingText(engineRef.current.playerX, engineRef.current.playerY - 30, '⚠️ Zaten satın aldınız!', '#3b82f6');
          return false;
        }
        if (coins < 500) return false;
        updateCoins(-500);
        sound.playGoldenApple();
        setHasMagnetVortex(true);
        setInventory((prev) => (prev.includes('MAGNET_VORTEX') ? prev : [...prev, 'MAGNET_VORTEX']));
        setActiveLoadout((prev) => (prev.includes('MAGNET_VORTEX') || prev.length >= 5 ? prev : [...prev, 'MAGNET_VORTEX']));
        try { localStorage.setItem('cybersnake_item_magnet_vortex', 'true'); } catch {}
        addEngineFloatingText(engineRef.current.playerX, engineRef.current.playerY - 30, '🔵 NADİR MIKNATIS GİRDABI ALINDI!', '#3b82f6');
        return true;
      }

      if (itemId === 'CYBER_SHIELD') {
        if (hasCyberShield) {
          addEngineFloatingText(engineRef.current.playerX, engineRef.current.playerY - 30, '⚠️ Zaten satın aldınız!', '#3b82f6');
          return false;
        }
        if (coins < 750) return false;
        updateCoins(-750);
        sound.playPowerUp();
        setHasCyberShield(true);
        setInventory((prev) => (prev.includes('CYBER_SHIELD') ? prev : [...prev, 'CYBER_SHIELD']));
        setActiveLoadout((prev) => (prev.includes('CYBER_SHIELD') || prev.length >= 5 ? prev : [...prev, 'CYBER_SHIELD']));
        try { localStorage.setItem('cybersnake_item_cyber_shield', 'true'); } catch {}
        addEngineFloatingText(engineRef.current.playerX, engineRef.current.playerY - 30, '🔵 NADİR SİBER KALKAN ALINDI!', '#3b82f6');
        return true;
      }

      if (itemId === 'GODLY_TELEPORT') {
        if (hasGodlyTeleport && teleportCharges >= 2) {
          addEngineFloatingText(engineRef.current.playerX, engineRef.current.playerY - 30, '⚠️ Zaten 2 Tanrısal Işınlanma hakkınız var!', '#1e3a8a');
          return false;
        }
        if (coins < 500000) return false;
        updateCoins(-500000);
        sound.playPowerUp();
        setHasGodlyTeleport(true);
        setTeleportCharges(2);
        setInventory((prev) => (prev.includes('GODLY_TELEPORT') ? prev : [...prev, 'GODLY_TELEPORT']));
        setActiveLoadout((prev) => (prev.includes('GODLY_TELEPORT') || prev.length >= 5 ? prev : [...prev, 'GODLY_TELEPORT']));
        try {
          localStorage.setItem('cybersnake_item_godly_teleport', 'true');
          localStorage.setItem('cybersnake_teleport_charges', '2');
        } catch {}
        addEngineFloatingText(engineRef.current.playerX, engineRef.current.playerY - 30, '🌌 TANRISAL IŞINLANMA ALINDI! (2 Hak)', '#38bdf8');
        return true;
      }

      return false;
    },
    [coins, hasCloning, hasMythicHearts, hasLegendaryTurbo, hasMegaLahmacun, hasMagnetVortex, hasCyberShield, hasGodlyTeleport, teleportCharges, updateCoins, buyTimeFreeze, addEngineFloatingText]
  );

  // Tanrısal Işınlanma (Godly Teleport - 2 Hak, Lâcivert Aura, 2s Hasar Almazlık, Multiplayer Sync)
  const activateTeleport = useCallback((targetX?: number, targetY?: number): boolean => {
    if (!activeLoadoutRef.current.includes('GODLY_TELEPORT') && !hasGodlyTeleport) {
      addEngineFloatingText(
        engineRef.current.playerX,
        engineRef.current.playerY - 30,
        '⚠️ Tanrısal Işınlanma kuşanılı değil veya henüz çıkarılmadı!',
        '#1e3a8a'
      );
      return false;
    }

    if (teleportCharges <= 0) {
      addEngineFloatingText(
        engineRef.current.playerX,
        engineRef.current.playerY - 30,
        '⚠️ Işınlanma hakkınız tükendi! (2/2 kullanıldı)',
        '#f59e0b'
      );
      return false;
    }

    const eng = engineRef.current;
    const center = ARENA_SIZE / 2;

    let destX = targetX;
    let destY = targetY;

    if (destX === undefined || destY === undefined) {
      // Warp 450 units forward in current heading direction
      const angle = eng.playerAngle;
      destX = eng.playerX + Math.cos(angle) * 450;
      destY = eng.playerY + Math.sin(angle) * 450;
    }

    // Clamp within arena boundaries
    const distFromCenter = Math.hypot(destX - center, destY - center);
    const maxSafeR = ARENA_RADIUS - 100;
    if (distFromCenter > maxSafeR) {
      const angle = Math.atan2(destY - center, destX - center);
      destX = center + Math.cos(angle) * maxSafeR;
      destY = center + Math.sin(angle) * maxSafeR;
    }

    // 1. Origin particle burst (Lâcivert + Cyan)
    addEngineParticles(eng.playerX, eng.playerY, '#1e3a8a', 45);
    addEngineParticles(eng.playerX, eng.playerY, '#38bdf8', 25);
    sound.playPowerUp();

    // 2. Reposition player
    eng.playerX = destX;
    eng.playerY = destY;

    // 3. Smoothly align body segments behind head
    const angle = eng.playerAngle;
    for (let i = 0; i < eng.playerBody.length; i++) {
      eng.playerBody[i] = {
        x: destX - Math.cos(angle) * (i + 1) * SEGMENT_SPACING,
        y: destY - Math.sin(angle) * (i + 1) * SEGMENT_SPACING,
      };
    }

    // 4. Destination celestial particle burst
    addEngineParticles(destX, destY, '#1e3a8a', 50);
    addEngineParticles(destX, destY, '#60a5fa', 30);

    // 5. Grant 2 seconds invulnerability
    eng.isInvulnerable = true;
    eng.invulnerableUntil = Date.now() + 2000;
    setIsInvulnerable(true);

    // 6. Decrement charges
    const nextCharges = Math.max(0, teleportCharges - 1);
    setTeleportCharges(nextCharges);
    try {
      localStorage.setItem('cybersnake_teleport_charges', String(nextCharges));
    } catch {}

    addEngineFloatingText(
      destX,
      destY - 40,
      `🌌 TANRISAL IŞINLANMA! (Kalan: ${nextCharges})`,
      '#38bdf8'
    );

    // 7. Multiplayer sync
    if (gameMode === 'MULTIPLAYER') {
      multiplayer.sendUpdate({
        x: destX,
        y: destY,
        angle: eng.playerAngle,
        score: eng.score,
        length: eng.playerLength,
        body: eng.playerBody,
        isBoosting: eng.isBoosting,
        isAlive: true,
      });
    }

    return true;
  }, [hasGodlyTeleport, teleportCharges, addEngineParticles, addEngineFloatingText, gameMode]);

  // Skibidi Tower Defense Summon Unit Engine:
  // Standart Kutu: 1x = 100 Coin, 10x = 900 Coin
  // Mitolojik Kutu: 1x = 900 Coin, 10x = 8.000 Coin
  const summonCrate = useCallback(
    (crateType: SummonCrateType, count: 1 | 10): SummonResultItem[] | null => {
      const cost =
        crateType === 'MYTHIC_CRATE'
          ? count === 1
            ? 900
            : 8000
          : count === 1
          ? 100
          : 900;
      if (coins < cost) {
        addEngineFloatingText(
          engineRef.current.playerX,
          engineRef.current.playerY - 30,
          `⚠️ Yetersiz Coin! (${cost.toLocaleString('tr-TR')} Coin gerekli)`,
          '#f59e0b'
        );
        return null;
      }

      updateCoins(-cost);
      sound.playPowerUp();

      const results: SummonResultItem[] = [];

      for (let i = 0; i < count; i++) {
        const rand = Math.random();
        let pulledPowerId: MarketPowerId | null = null;
        let rarity: MarketRarity = 'COMMON';
        let name = '';
        let description = '';
        let compensationCoins = 0;

        if (crateType === 'MYTHIC_CRATE') {
          // Mythic Kutu Oranları (User requested: mythic ve godlynin şansı 00,2 000,2 olsun):
          // Godly (%000,2) = 0.0002
          // Mythic (%00,2) = 0.002
          // Legendary = 0.01
          // Epic = 0.40
          // Rare = 0.30
          // Common = Kalan
          if (rand < 0.0002) {
            pulledPowerId = 'GODLY_TELEPORT';
            rarity = 'GODLY';
          } else if (rand < 0.0022) {
            pulledPowerId = Math.random() < 0.5 ? 'MYTHIC_HEARTS' : 'MYTHIC_CLONING';
            rarity = 'MYTHIC';
          } else if (rand < 0.0122) {
            pulledPowerId = Math.random() < 0.5 ? 'TIME_FREEZE' : 'SUPER_TURBO';
            rarity = 'LEGENDARY';
          } else if (rand < 0.4122) {
            pulledPowerId = 'MEGA_LAHMACUN';
            rarity = 'EPIC';
          } else if (rand < 0.7122) {
            pulledPowerId = Math.random() < 0.5 ? 'MAGNET_VORTEX' : 'CYBER_SHIELD';
            rarity = 'RARE';
          } else {
            rarity = 'COMMON';
          }
        } else {
          // Standart Kutu Oranları (User requested: godly 000,1, mythic 00,1, efsanevi 0.1, epik 30, nadir 34.9, yaygın 35):
          if (rand < 0.0001) {
            pulledPowerId = 'GODLY_TELEPORT';
            rarity = 'GODLY';
          } else if (rand < 0.0011) {
            pulledPowerId = Math.random() < 0.5 ? 'MYTHIC_CLONING' : 'MYTHIC_HEARTS';
            rarity = 'MYTHIC';
          } else if (rand < 0.0111) {
            pulledPowerId = Math.random() < 0.5 ? 'TIME_FREEZE' : 'SUPER_TURBO';
            rarity = 'LEGENDARY';
          } else if (rand < 0.3111) {
            pulledPowerId = 'MEGA_LAHMACUN';
            rarity = 'EPIC';
          } else if (rand < 0.6601) {
            pulledPowerId = Math.random() < 0.5 ? 'MAGNET_VORTEX' : 'CYBER_SHIELD';
            rarity = 'RARE';
          } else {
            rarity = 'COMMON';
          }
        }

        if (pulledPowerId) {
          const cfg = MARKET_POWERS[pulledPowerId];
          name = cfg.name;
          description = cfg.description;
          const isOwned = inventory.includes(pulledPowerId);

          if (!isOwned) {
            // Add new power to infinite inventory
            setInventory((prev) => (prev.includes(pulledPowerId!) ? prev : [...prev, pulledPowerId!]));
            setActiveLoadout((prev) => (prev.includes(pulledPowerId!) || prev.length >= 5 ? prev : [...prev, pulledPowerId!]));

            if (pulledPowerId === 'GODLY_TELEPORT') {
              setHasGodlyTeleport(true);
              setTeleportCharges(2);
              try {
                localStorage.setItem('cybersnake_item_godly_teleport', 'true');
                localStorage.setItem('cybersnake_teleport_charges', '2');
              } catch {}
            } else if (pulledPowerId === 'MYTHIC_HEARTS') {
              setHasMythicHearts(true);
              engineRef.current.lives = 10.0;
              setLives(10.0);
              try { localStorage.setItem('cybersnake_item_mythic_hearts', 'true'); } catch {}
            } else if (pulledPowerId === 'MYTHIC_CLONING') {
              setHasCloning(true);
              try { localStorage.setItem('cybersnake_item_mythic_cloning', 'true'); } catch {}
            } else if (pulledPowerId === 'TIME_FREEZE') {
              setTimeFreezeCharges((prev) => prev + 1);
            } else if (pulledPowerId === 'SUPER_TURBO') {
              setHasLegendaryTurbo(true);
              try { localStorage.setItem('cybersnake_item_legendary_turbo', 'true'); } catch {}
            } else if (pulledPowerId === 'MEGA_LAHMACUN') {
              setHasMegaLahmacun(true);
              try { localStorage.setItem('cybersnake_item_mega_lahmacun', 'true'); } catch {}
            } else if (pulledPowerId === 'MAGNET_VORTEX') {
              setHasMagnetVortex(true);
              try { localStorage.setItem('cybersnake_item_magnet_vortex', 'true'); } catch {}
            } else if (pulledPowerId === 'CYBER_SHIELD') {
              setHasCyberShield(true);
              try { localStorage.setItem('cybersnake_item_cyber_shield', 'true'); } catch {}
            }

            results.push({
              id: `pull-${Date.now()}-${i}-${Math.random()}`,
              powerId: pulledPowerId,
              name,
              rarity,
              isNew: true,
              description,
            });
          } else {
            // Already owned -> give bonus compensation coins or extra charges!
            if (pulledPowerId === 'GODLY_TELEPORT') {
              setTeleportCharges((prev) => Math.min(4, prev + 2));
              compensationCoins = 5000;
              updateCoins(compensationCoins);
            } else if (pulledPowerId === 'TIME_FREEZE') {
              setTimeFreezeCharges((prev) => prev + 1);
              compensationCoins = 250;
              updateCoins(compensationCoins);
            } else if (pulledPowerId === 'MYTHIC_HEARTS' || pulledPowerId === 'MYTHIC_CLONING') {
              compensationCoins = 2000;
              updateCoins(compensationCoins);
            } else if (pulledPowerId === 'SUPER_TURBO') {
              compensationCoins = 500;
              updateCoins(compensationCoins);
            } else {
              compensationCoins = 150;
              updateCoins(compensationCoins);
            }

            results.push({
              id: `pull-${Date.now()}-${i}-${Math.random()}`,
              powerId: pulledPowerId,
              name,
              rarity,
              isNew: false,
              compensationCoins,
              description: `Zaten sahipsiniz! +${compensationCoins} Coin telafisi verildi.`,
            });
          }
        } else {
          // Common Drop
          const coinReward = 60 + Math.floor(Math.random() * 90);
          updateCoins(coinReward);
          results.push({
            id: `pull-${Date.now()}-${i}-${Math.random()}`,
            name: `Siber Coin Paketi (+${coinReward} Coin)`,
            rarity: 'COMMON',
            isNew: true,
            compensationCoins: coinReward,
            description: `Kasanıza anında +${coinReward} Coin eklendi!`,
          });
        }
      }

      return results;
    },
    [coins, inventory, updateCoins]
  );

  // Claim a Playtime Milestone Reward (Dakikalık Hediye Alma)
  const claimPlaytimeReward = useCallback(
    (rewardId: PlaytimeRewardId): boolean => {
      const config = PLAYTIME_REWARDS.find((r) => r.id === rewardId);
      if (!config) return false;

      if (totalPlaytimeSeconds < config.requiredSeconds) {
        addEngineFloatingText(
          engineRef.current.playerX,
          engineRef.current.playerY - 30,
          '⚠️ Henüz gereken süreye ulaşmadınız!',
          '#f59e0b'
        );
        return false;
      }

      if (claimedRewards.includes(rewardId)) {
        addEngineFloatingText(
          engineRef.current.playerX,
          engineRef.current.playerY - 30,
          '✓ Bu ödülü zaten aldınız!',
          '#10b981'
        );
        return false;
      }

      if (config.rewardType === 'COINS') {
        const amount = config.rewardValue as number;
        updateCoins(amount);
        sound.playGoldenApple();
        addEngineFloatingText(
          engineRef.current.playerX,
          engineRef.current.playerY - 30,
          `🎁 +${amount.toLocaleString('tr-TR')} COİN HEDİYESİ ALINDI!`,
          '#f59e0b'
        );
      } else if (config.rewardType === 'DOUBLE_POINTS_10M') {
        const durationMs = 10 * 60 * 1000;
        engineRef.current.activePowerUps = engineRef.current.activePowerUps.filter(
          (p) => p.type !== 'DOUBLE_POINTS'
        );
        engineRef.current.activePowerUps.push({
          type: 'DOUBLE_POINTS',
          remainingMs: durationMs,
          totalMs: durationMs,
        });
        setActivePowerUps([...engineRef.current.activePowerUps]);
        sound.playPowerUp();
        addEngineFloatingText(
          engineRef.current.playerX,
          engineRef.current.playerY - 30,
          '🔥 10 DAKİKA 2X PUAN AKTİF EDİLDİ!',
          '#ec4899'
        );
      } else if (config.rewardType === 'SKIN') {
        const skinId = config.rewardValue as SnakeSkinId;
        setUnlockedSkins((prev) => {
          if (prev.includes(skinId)) return prev;
          const updated = [...prev, skinId];
          try {
            localStorage.setItem('cybersnake_unlocked_skins', JSON.stringify(updated));
          } catch {}
          return updated;
        });
        setSelectedSkin(skinId);
        try {
          localStorage.setItem('cybersnake_selected_skin', skinId);
        } catch {}
        sound.playPowerUp();
        addEngineFloatingText(
          engineRef.current.playerX,
          engineRef.current.playerY - 30,
          '🎨 SİYAH-KIRMIZI ÇİZGİ KOSTÜMÜ HEDİYE EDİLDİ & KUŞANILDI!',
          '#ef4444'
        );
      }

      setClaimedRewards((prev) => {
        const updated = [...prev, rewardId];
        try {
          localStorage.setItem('cybersnake_claimed_playtime_rewards', JSON.stringify(updated));
        } catch {}
        return updated;
      });

      return true;
    },
    [totalPlaytimeSeconds, claimedRewards, updateCoins, addEngineFloatingText]
  );

  // Equip a power to one of the 5 active slots
  const equipPower = useCallback(
    (powerId: MarketPowerId): boolean => {
      if (activeLoadout.includes(powerId)) return true;
      if (activeLoadout.length >= 5) {
        addEngineFloatingText(
          engineRef.current.playerX,
          engineRef.current.playerY - 30,
          '⚠️ 5 Güç Yuvası Dolu! Önce bir gücü çıkarın.',
          '#f59e0b'
        );
        return false;
      }
      sound.playPowerUp();
      setActiveLoadout((prev) => [...prev, powerId]);
      addEngineFloatingText(
        engineRef.current.playerX,
        engineRef.current.playerY - 30,
        `✓ ${MARKET_POWERS[powerId]?.name || powerId} Kuşanıldı! (${activeLoadout.length + 1}/5)`,
        '#10b981'
      );
      return true;
    },
    [activeLoadout, addEngineFloatingText]
  );

  // Unequip a power from active loadout
  const unequipPower = useCallback(
    (powerId: MarketPowerId) => {
      setActiveLoadout((prev) => prev.filter((id) => id !== powerId));
      sound.playEat(1);
      addEngineFloatingText(
        engineRef.current.playerX,
        engineRef.current.playerY - 30,
        `✕ ${MARKET_POWERS[powerId]?.name || powerId} Çıkarıldı`,
        '#94a3b8'
      );
    },
    [addEngineFloatingText]
  );

  // Toggle power equip/unequip
  const toggleEquipPower = useCallback(
    (powerId: MarketPowerId): boolean => {
      if (activeLoadout.includes(powerId)) {
        unequipPower(powerId);
        return false;
      } else {
        return equipPower(powerId);
      }
    },
    [activeLoadout, equipPower, unequipPower]
  );

  const isPowerActive = useCallback(
    (powerId: MarketPowerId): boolean => {
      return activeLoadout.includes(powerId);
    },
    [activeLoadout]
  );

  // Helper to spawn random point in circular arena
  const getRandomArenaPoint = useCallback((margin: number = 100): Point => {
    const center = ARENA_SIZE / 2;
    const maxR = ARENA_RADIUS - margin;
    const r = Math.sqrt(Math.random()) * maxR;
    const theta = Math.random() * Math.PI * 2;
    return {
      x: center + Math.cos(theta) * r,
      y: center + Math.sin(theta) * r,
    };
  }, []);

  // Create a food item respecting difficulty poison probability
  const createFoodItem = useCallback(
    (pos: Point, forceType?: FoodType, currentDiff?: Difficulty): FoodItem => {
      const activeDiff = currentDiff || difficulty;
      let chosenType: FoodType = forceType || 'CHERRY';

      if (!forceType) {
        const poisonChance = DIFFICULTIES[activeDiff]?.poisonRate ?? 0.12;
        const rand = Math.random();
        if (rand < poisonChance) {
          // 60% Green Poison (-0.5 can), 40% Purple Poison (-1.0 can)
          chosenType = Math.random() < 0.6 ? 'GREEN_POISON' : 'PURPLE_POISON';
        } else {
          const subRand = Math.random();
          if (subRand < 0.30) chosenType = 'CHERRY';
          else if (subRand < 0.52) chosenType = 'CYBER_BERRY';
          else if (subRand < 0.70) chosenType = 'ENERGY_CORE';
          else if (subRand < 0.85) chosenType = 'LAHMACUN'; // Expands 5x!
          else chosenType = 'GOLDEN_APPLE'; // Expands 2x!
        }
      }

      const meta = FOOD_CATALOG[chosenType];
      return {
        id: `food-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        x: pos.x,
        y: pos.y,
        type: chosenType,
        points: meta.points,
        color: meta.color,
        growth: meta.growth,
        damage: meta.damage,
        radius: meta.radius,
      };
    },
    [difficulty]
  );

  // Activate 10-second Time Freeze with 150-second cooldown! (Solo mode only)
  const activateTimeFreeze = useCallback((): boolean => {
    // User request: No time freeze in multiplayer mode!
    if (gameMode === 'MULTIPLAYER') {
      addEngineFloatingText(
        engineRef.current.playerX,
        engineRef.current.playerY - 30,
        '⚠️ Çok oyunculu modda Zaman Durdurma kapalıdır!',
        '#f59e0b'
      );
      return false;
    }

    if (!activeLoadoutRef.current.includes('TIME_FREEZE')) {
      addEngineFloatingText(
        engineRef.current.playerX,
        engineRef.current.playerY - 30,
        '⚠️ Zaman Dondurma aktif 5 güç yuvanızda kuşanılı değil!',
        '#f59e0b'
      );
      return false;
    }

    if (timeFreezeCharges <= 0) {
      addEngineFloatingText(
        engineRef.current.playerX,
        engineRef.current.playerY - 30,
        '🛒 Zaman Durdurma için Marketi açın! (U)',
        '#38bdf8'
      );
      return false;
    }

    if (engineRef.current.timeFreezeRemainingMs > 0) return false;

    if (engineRef.current.timeFreezeCooldownMs > 0) {
      const secLeft = Math.ceil(engineRef.current.timeFreezeCooldownMs / 1000);
      addEngineFloatingText(
        engineRef.current.playerX,
        engineRef.current.playerY - 30,
        `⏳ Bekleme Süresi: ${secLeft} sn sonra tekrar kullanılabilir!`,
        '#f59e0b'
      );
      return false;
    }

    // Activate freeze for 10 seconds!
    engineRef.current.timeFreezeRemainingMs = 10000;
    // 150-second cooldown as requested!
    engineRef.current.timeFreezeCooldownMs = 150000;
    setTimeFreezeRemainingMs(10000);
    setTimeFreezeCooldownMs(150000);
    sound.playTimeFreeze();

    addEngineFloatingText(
      engineRef.current.playerX,
      engineRef.current.playerY - 35,
      '⏳ ZAMAN 10 SANİYELİĞİNE DURDU! (150s Bekleme Süresi)',
      '#38bdf8'
    );
    addEngineParticles(engineRef.current.playerX, engineRef.current.playerY, '#38bdf8', 45);
    return true;
  }, [timeFreezeCharges, gameMode, addEngineFloatingText, addEngineParticles]);

  // Skin purchase and equip
  const buySkin = useCallback((skinId: SnakeSkinId): boolean => {
    const skin = SNAKE_SKINS[skinId];
    if (!skin) return false;
    if (unlockedSkins.includes(skinId)) {
      addEngineFloatingText(
        engineRef.current.playerX,
        engineRef.current.playerY - 30,
        '⚠️ Zaten satın aldınız!',
        '#f59e0b'
      );
      setSelectedSkin(skinId);
      engineRef.current.selectedSkin = skinId;
      try {
        localStorage.setItem('cybersnake_selected_skin', skinId);
      } catch {}
      return false;
    }

    if (coins < skin.price) return false;

    updateCoins(-skin.price);
    sound.playGoldenApple();

    const updatedUnlocked = [...unlockedSkins, skinId];
    setUnlockedSkins(updatedUnlocked);
    setSelectedSkin(skinId);
    engineRef.current.selectedSkin = skinId;

    try {
      localStorage.setItem('cybersnake_unlocked_skins', JSON.stringify(updatedUnlocked));
      localStorage.setItem('cybersnake_selected_skin', skinId);
    } catch {}

    return true;
  }, [coins, unlockedSkins, updateCoins]);

  const equipSkin = useCallback((skinId: SnakeSkinId) => {
    if (!unlockedSkins.includes(skinId)) return;
    setSelectedSkin(skinId);
    engineRef.current.selectedSkin = skinId;
    try {
      localStorage.setItem('cybersnake_selected_skin', skinId);
    } catch {}
  }, [unlockedSkins]);

  // Initialize Bots: Safely placed inside arena and oriented inward
  const initBots = useCallback((diff: Difficulty): BotSnake[] => {
    const count = DIFFICULTIES[diff]?.botCount ?? 3;
    const center = ARENA_SIZE / 2;
    return BOT_CONFIGS.slice(0, count).map((cfg, idx) => {
      // Safely spawn bots distributed inside the arena circle, well away from border
      const spawnRadius = 350 + (idx * 110) % (ARENA_RADIUS - 450);
      const spawnAngle = (idx / Math.max(1, count)) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
      const headX = center + Math.cos(spawnAngle) * spawnRadius;
      const headY = center + Math.sin(spawnAngle) * spawnRadius;

      // Heading towards the center with small random deviation
      const angle = Math.atan2(center - headY, center - headX) + (Math.random() - 0.5) * 0.4;
      const initialBody: Point[] = [];
      for (let i = 0; i < cfg.initialLength; i++) {
        initialBody.push({
          x: headX - Math.cos(angle) * i * SEGMENT_SPACING,
          y: headY - Math.sin(angle) * i * SEGMENT_SPACING,
        });
      }
      return {
        id: cfg.id,
        name: cfg.name,
        color: cfg.color,
        headColor: cfg.headColor,
        body: initialBody,
        angle,
        targetAngle: angle,
        score: Math.floor(cfg.initialLength * 15),
        length: cfg.initialLength,
        isAlive: true,
        isBoosting: false,
        respawnInSeconds: 0,
        growthPending: 0,
      };
    });
  }, []);

  // Listen to remote multiplayer events
  useEffect(() => {
    const unsubPlayers = multiplayer.onPlayersChange((players) => {
      setRemotePlayers(players);
    });
    const unsubChat = multiplayer.onChat((msg) => {
      setChatMessages((prev) => [...prev.slice(-15), msg]);
    });
    const unsubKill = multiplayer.onKill((killEvent) => {
      addEngineFloatingText(
        killEvent.x,
        killEvent.y - 20,
        `💥 ${killEvent.killerName} avladı: ${killEvent.victimName}!`,
        '#f43f5e'
      );
    });

    const pingCheckInterval = setInterval(() => {
      setMultiplayerPing(multiplayer.getPing());
    }, 1500);

    return () => {
      unsubPlayers();
      unsubChat();
      unsubKill();
      clearInterval(pingCheckInterval);
    };
  }, [addEngineFloatingText]);

  // Start new game (supports Solo and Live Multiplayer Arena)
  const startGame = useCallback(
    (
      selectedDiff?: Difficulty,
      mode: GameMode = gameMode,
      targetRoom: string = roomId,
      targetName: string = playerName
    ) => {
      const diff = selectedDiff || difficulty;
      setDifficulty(diff);
      setGameMode(mode);
      setRoomId(targetRoom);
      setPlayerName(targetName);

      try {
        localStorage.setItem('cybersnake_player_name', targetName);
      } catch {}

      if (mode === 'MULTIPLAYER') {
        multiplayer.connect(targetRoom, targetName, selectedSkin);
      } else {
        multiplayer.disconnect();
      }

      const center = ARENA_SIZE / 2;
      const initialPlayerBody: Point[] = [];
      const startAngle = 0;
      const initialLength = 18;
      for (let i = 0; i < initialLength; i++) {
        initialPlayerBody.push({
          x: center - i * SEGMENT_SPACING,
          y: center,
        });
      }

      // In multiplayer mode: ZERO BOTS (sadece gerçek oyuncular). In solo mode: smart bots active.
      const initialBots = mode === 'MULTIPLAYER' ? [] : initBots(diff);

      const initialFoods: FoodItem[] = [];
      for (let i = 0; i < DEFAULT_FOOD_COUNT; i++) {
        const p = getRandomArenaPoint();
        initialFoods.push(createFoodItem(p, undefined, diff));
      }

      // Mythic 3 Clones (spawned in both solo and multiplayer if equipped in the 5 loadout slots)
      const isCloningEquipped = hasCloning && activeLoadoutRef.current.includes('MYTHIC_CLONING');
      const initialClones: CloneSnake[] = isCloningEquipped
        ? [
            {
              id: 'clone-1',
              name: 'Klon #1',
              body: Array.from({ length: 14 }).map((_, i) => ({
                x: center - (i + 1) * SEGMENT_SPACING - 35,
                y: center - 35,
              })),
              angle: startAngle,
              isAlive: true,
              length: 14,
              offsetAngle: -0.55,
              offsetDist: 42,
            },
            {
              id: 'clone-2',
              name: 'Klon #2',
              body: Array.from({ length: 14 }).map((_, i) => ({
                x: center - (i + 1) * SEGMENT_SPACING + 35,
                y: center + 35,
              })),
              angle: startAngle,
              isAlive: true,
              length: 14,
              offsetAngle: 0.55,
              offsetDist: 42,
            },
            {
              id: 'clone-3',
              name: 'Klon #3',
              body: Array.from({ length: 14 }).map((_, i) => ({
                x: center - (i + 2) * SEGMENT_SPACING,
                y: center,
              })),
              angle: startAngle,
              isAlive: true,
              length: 14,
              offsetAngle: Math.PI,
              offsetDist: 55,
            },
          ]
        : [];

      // Initialize engine ref state
      engineRef.current = {
        playerX: center,
        playerY: center,
        playerAngle: startAngle,
        playerTargetAngle: startAngle,
        playerBody: initialPlayerBody,
        playerLength: initialLength,
        playerGrowthPending: 0,
        isBoosting: false,
        boostStamina: 100,
        foods: initialFoods,
        bots: initialBots,
        particles: [],
        floatingTexts: [],
        powerUps: [],
        activePowerUps: [],
        lives: maxPossibleLives,
        score: 0,
        combo: 1,
        comboExpiry: 0,
        foodEatenCount: 0,
        lahmacunEatenCount: 0,
        botKillsCount: 0,
        isInvulnerable: false,
        invulnerableUntil: 0,
        durationSeconds: 0,
        lastTime: performance.now(),
        timeFreezeRemainingMs: 0,
        timeFreezeCooldownMs: 0,
        selectedSkin: selectedSkin,
        clones: initialClones,
      };

      setLives(maxPossibleLives);
      setScore(0);
      setLength(initialLength);
      setCombo(1);
      setComboExpiry(0);
      setBotKillsCount(0);
      setDurationSeconds(0);
      setIsInvulnerable(false);
      setBoostStaminaPercent(100);
      setIsBoosting(false);
      setActivePowerUps([]);
      setTimeFreezeRemainingMs(0);

      setGameState('PLAYING');
      sound.playClick();
    },
    [
      difficulty,
      gameMode,
      roomId,
      playerName,
      maxPossibleLives,
      initBots,
      getRandomArenaPoint,
      createFoodItem,
      selectedSkin,
    ]
  );

  const restartGame = useCallback(() => {
    startGame(difficulty, gameMode, roomId, playerName);
  }, [startGame, difficulty, gameMode, roomId, playerName]);

  // Return to menu functionality
  const goToMenu = useCallback(() => {
    setGameState('TITLE');
    multiplayer.disconnect();
    sound.playClick();
  }, []);

  const sendChatMessage = useCallback(
    (text: string) => {
      multiplayer.sendChat(text, playerName);
    },
    [playerName]
  );

  // Steering angle input from mouse, joystick or keyboard
  const setSteerAngle = useCallback((angle: number) => {
    engineRef.current.playerTargetAngle = angle;
  }, []);

  const lastTurboWarnRef = useRef<number>(0);

  // Turbo boost trigger (Only available if purchased from Market!)
  const setBoosting = useCallback(
    (boosting: boolean) => {
      const isTurboUnlocked = hasLegendaryTurbo && activeLoadoutRef.current.includes('SUPER_TURBO');

      if (boosting) {
        if (!isTurboUnlocked) {
          engineRef.current.isBoosting = false;
          setIsBoosting(false);

          const now = performance.now();
          if (now - lastTurboWarnRef.current > 3000) {
            lastTurboWarnRef.current = now;
            if (!hasLegendaryTurbo) {
              addEngineFloatingText(
                engineRef.current.playerX,
                engineRef.current.playerY - 30,
                '🔒 Turbo Kilitli! Markette Efsanevi Turbo satın alın (5.000 Coin)',
                '#eab308'
              );
            } else {
              addEngineFloatingText(
                engineRef.current.playerX,
                engineRef.current.playerY - 30,
                '⚠️ Turbo kuşanılı değil! Envanterden 5 aktif güç arasına ekleyin.',
                '#eab308'
              );
            }
          }
          return;
        }

        engineRef.current.isBoosting = true;
        setIsBoosting(true);
      } else {
        engineRef.current.isBoosting = false;
        setIsBoosting(false);
      }
    },
    [hasLegendaryTurbo, addEngineFloatingText]
  );

  // Collision with Bot Body or Arena Boundary
  const handlePlayerDamage = useCallback(
    (cause: string) => {
      const now = performance.now();
      if (engineRef.current.isInvulnerable || now < engineRef.current.invulnerableUntil) {
        return;
      }

      sound.playDamage();
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 350);

      // Agility upgrade damage mitigation
      let rawDamage = 1.0;
      if (upgrades.agilityLevel === 1) rawDamage *= 0.8;
      else if (upgrades.agilityLevel === 2) rawDamage *= 0.5;
      else if (upgrades.agilityLevel >= 3) rawDamage *= 0.3;

      const damageAmount = Number(rawDamage.toFixed(2));
      const nextLives = Math.max(0, Number((engineRef.current.lives - damageAmount).toFixed(2)));
      engineRef.current.lives = nextLives;
      setLives(nextLives);

      addEngineParticles(engineRef.current.playerX, engineRef.current.playerY, '#ff0055', 25);
      addEngineFloatingText(
        engineRef.current.playerX,
        engineRef.current.playerY - 20,
        `-${damageAmount} KALP (${cause})!`,
        '#ff0055'
      );

      if (nextLives <= 0) {
        setGameState('GAME_OVER');
        sound.playGameOver();
        return;
      }

      // 2 seconds invulnerability shield
      engineRef.current.isInvulnerable = true;
      engineRef.current.invulnerableUntil = now + INVULNERABLE_DURATION_MS;
      setIsInvulnerable(true);

      setTimeout(() => {
        engineRef.current.isInvulnerable = false;
        setIsInvulnerable(false);
      }, INVULNERABLE_DURATION_MS);
    },
    [upgrades.agilityLevel, addEngineParticles, addEngineFloatingText]
  );

  // Eliminate Bot: Drops its whole body as glowing BOT_REMAINS food trail!
  const eliminateBot = useCallback(
    (botId: string, killedByPlayer: boolean = true) => {
      const bot = engineRef.current.bots.find((b) => b.id === botId);
      if (!bot || !bot.isAlive) return;

      const head = bot.body[0] || { x: 0, y: 0 };
      sound.playBotEliminated();
      addEngineParticles(head.x, head.y, bot.color, 30);

      if (killedByPlayer) {
        engineRef.current.score += BOT_KILL_BONUS;
        engineRef.current.botKillsCount += 1;
        setScore(engineRef.current.score);
        setBotKillsCount(engineRef.current.botKillsCount);

        const coinGain = upgrades.coinMasteryLevel > 0 ? 35 : 20;
        updateCoins(coinGain);
        addEngineFloatingText(
          head.x,
          head.y - 25,
          `🔥 BOT İMHA! +${BOT_KILL_BONUS} (+${coinGain} 🪙)`,
          '#fbbf24'
        );
      }

      // Convert body segments into BOT_REMAINS food items (strictly clamped inside arena boundaries)
      const center = ARENA_SIZE / 2;
      const droppedRemains: FoodItem[] = bot.body.map((seg, idx) => {
        const segDist = Math.hypot(seg.x - center, seg.y - center);
        let remainX = seg.x + (Math.random() - 0.5) * 8;
        let remainY = seg.y + (Math.random() - 0.5) * 8;
        if (segDist >= ARENA_RADIUS - 30) {
          const ang = Math.atan2(seg.y - center, seg.x - center);
          remainX = center + Math.cos(ang) * (ARENA_RADIUS - 40);
          remainY = center + Math.sin(ang) * (ARENA_RADIUS - 40);
        }
        return {
          id: `remains-${Date.now()}-${idx}-${Math.random()}`,
          x: remainX,
          y: remainY,
          type: 'BOT_REMAINS' as const,
          points: 30,
          color: '#a855f7',
          growth: 1,
          radius: 9,
        };
      });

      engineRef.current.foods.push(...droppedRemains);

      bot.isAlive = false;
      bot.body = [];
      bot.respawnInSeconds = BOT_RESPAWN_DELAY_SEC;
    },
    [addEngineParticles, addEngineFloatingText, updateCoins, upgrades.coinMasteryLevel]
  );

  // High Refresh Rate 120 FPS Direct Physics Engine Loop
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();
    let frameCount = 0;
    let fpsSampleTime = performance.now();
    let uiThrottleTime = performance.now();
    let secondTimerTime = performance.now();
    let lastMultiplayerSendTime = 0;

    const loop = (now: number) => {
      // Calculate delta time capped at 33ms to avoid spiral of death
      const dt = Math.min(0.033, (now - lastTime) / 1000);
      lastTime = now;

      // FPS Measurement
      frameCount++;
      if (now - fpsSampleTime >= 500) {
        const measured = Math.round((frameCount * 1000) / (now - fpsSampleTime));
        setCurrentFps(Math.min(120, Math.max(60, measured)));
        frameCount = 0;
        fpsSampleTime = now;
      }

      const eng = engineRef.current;

      if (gameState === 'PLAYING') {
        const diffCfg = DIFFICULTIES[difficulty];

        // 1. Player Movement & Physics
        // Turning speed (boosted by Agility level: base 5.5 rad/s up to 9.0 rad/s)
        const turnSpeed = (5.5 + upgrades.agilityLevel * 1.2) * dt;
        let angleDiff = eng.playerTargetAngle - eng.playerAngle;
        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
        while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
        eng.playerAngle += Math.max(-turnSpeed, Math.min(turnSpeed, angleDiff));

        // Speed calculation (boosted by Speed upgrade and Turbo boost)
        const baseSpeed = diffCfg.baseSpeed * (1 + upgrades.speedLevel * 0.15);
        let actualSpeed = baseSpeed;

        const isTurboEquipped = hasLegendaryTurbo && activeLoadoutRef.current.includes('SUPER_TURBO');

        if (isTurboEquipped && eng.isBoosting && eng.boostStamina > 5) {
          const turboMultiplier = 2.25;
          const drainRate = 8; // 70% stamina savings with legendary turbo!
          actualSpeed = baseSpeed * turboMultiplier;
          eng.boostStamina = Math.max(0, eng.boostStamina - drainRate * dt);

          // Drop glowing boost particles behind tail (golden for legendary turbo!)
          if (Math.random() < 0.45 && eng.playerBody.length > 2) {
            const tail = eng.playerBody[eng.playerBody.length - 1];
            const sparkColor = '#facc15';
            addEngineParticles(tail.x, tail.y, sparkColor, 2);
          }
        } else {
          if (!isTurboEquipped) {
            eng.isBoosting = false;
          }
          // Regenerate boost stamina (2x faster with legendary turbo)
          const rechargeRate = isTurboEquipped ? 44 : 22;
          eng.boostStamina = Math.min(100, eng.boostStamina + rechargeRate * dt);
        }

        // Move Player Head
        eng.playerX += Math.cos(eng.playerAngle) * actualSpeed * dt;
        eng.playerY += Math.sin(eng.playerAngle) * actualSpeed * dt;

        // Arena Circular Boundary Constraint
        const center = ARENA_SIZE / 2;
        const distFromCenter = Math.hypot(eng.playerX - center, eng.playerY - center);
        if (distFromCenter > ARENA_RADIUS - SEGMENT_RADIUS) {
          // Bounded bounce & damage
          handlePlayerDamage('ARENA SINIRI');
          const normalAngle = Math.atan2(eng.playerY - center, eng.playerX - center);
          eng.playerX = center + Math.cos(normalAngle) * (ARENA_RADIUS - SEGMENT_RADIUS - 5);
          eng.playerY = center + Math.sin(normalAngle) * (ARENA_RADIUS - SEGMENT_RADIUS - 5);
        }

        // Update Player Body Segments (Inverse Kinematics distance constraint)
        if (eng.playerBody.length > 0) {
          eng.playerBody[0] = { x: eng.playerX, y: eng.playerY };
          for (let i = 1; i < eng.playerBody.length; i++) {
            const prev = eng.playerBody[i - 1];
            const curr = eng.playerBody[i];
            const dx = prev.x - curr.x;
            const dy = prev.y - curr.y;
            const dist = Math.hypot(dx, dy);
            if (dist > SEGMENT_SPACING) {
              const scale = SEGMENT_SPACING / dist;
              curr.x = prev.x - dx * scale;
              curr.y = prev.y - dy * scale;
            }
          }
        }

        // 1.B) Update Mythic Clones (if present and alive in Solo or Multiplayer)
        if (eng.clones && eng.clones.length > 0) {
          eng.clones.forEach((clone) => {
            if (!clone.isAlive || clone.body.length === 0) return;

            // Target position based on player's position and flank offset
            const targetX = eng.playerX + Math.cos(eng.playerAngle + clone.offsetAngle) * clone.offsetDist;
            const targetY = eng.playerY + Math.sin(eng.playerAngle + clone.offsetAngle) * clone.offsetDist;

            const cHead = clone.body[0];
            const cdx = targetX - cHead.x;
            const cdy = targetY - cHead.y;
            const cdist = Math.hypot(cdx, cdy);
            const targetAngle = Math.atan2(cdy, cdx);

            let diffAngle = targetAngle - clone.angle;
            while (diffAngle > Math.PI) diffAngle -= Math.PI * 2;
            while (diffAngle < -Math.PI) diffAngle += Math.PI * 2;
            clone.angle += diffAngle * Math.min(1, 10 * dt);

            const cloneSpeed = Math.min(cdist * 7, actualSpeed * 1.2);
            cHead.x += Math.cos(clone.angle) * cloneSpeed * dt;
            cHead.y += Math.sin(clone.angle) * cloneSpeed * dt;

            // Clone body inverse kinematics
            for (let b = 1; b < clone.body.length; b++) {
              const prev = clone.body[b - 1];
              const curr = clone.body[b];
              const bdx = prev.x - curr.x;
              const bdy = prev.y - curr.y;
              const bdist = Math.hypot(bdx, bdy);
              if (bdist > SEGMENT_SPACING) {
                const scale = SEGMENT_SPACING / bdist;
                curr.x = prev.x - bdx * scale;
                curr.y = prev.y - bdy * scale;
              }
            }

            // Boundary collision check for clone
            const cDistFromCenter = Math.hypot(cHead.x - center, cHead.y - center);
            if (cDistFromCenter > ARENA_RADIUS - SEGMENT_RADIUS) {
              // USER MANDATE: "mythic klonlardan birisi ölünce için hiç birşey çıkmasın"
              clone.isAlive = false;
              addEngineParticles(cHead.x, cHead.y, '#ef4444', 28);
              addEngineFloatingText(cHead.x, cHead.y - 20, '⚠️ Klon İmha Oldu! (Sıfır Düşüş)', '#ef4444');
            }

            // Bot collision check for clone head:
            for (let b = 0; b < eng.bots.length; b++) {
              const bot = eng.bots[b];
              if (!bot.isAlive) continue;
              for (let segIdx = 0; segIdx < bot.body.length; segIdx++) {
                const bSeg = bot.body[segIdx];
                if (Math.hypot(cHead.x - bSeg.x, cHead.y - bSeg.y) < SEGMENT_RADIUS * 1.6) {
                  // Clone died by colliding with bot! USER MANDATE: "içinden hiçbir şey çıkmasın"
                  clone.isAlive = false;
                  addEngineParticles(cHead.x, cHead.y, '#ef4444', 32);
                  addEngineFloatingText(cHead.x, cHead.y - 20, '💥 Klon Yok Edildi! (Sıfır Düşüş)', '#ef4444');
                  break;
                }
              }
              if (!clone.isAlive) break;
            }
          });
        }

        // Handle Player Growth queue
        if (eng.playerGrowthPending > 0 && eng.playerBody.length > 1) {
          const lastSeg = eng.playerBody[eng.playerBody.length - 1];
          eng.playerBody.push({ ...lastSeg });
          eng.playerLength += 1;
          eng.playerGrowthPending -= 1;
        }

        // In Multiplayer mode, broadcast our live snake position to the server (~22Hz)
        if (gameMode === 'MULTIPLAYER' && now - lastMultiplayerSendTime >= 45) {
          lastMultiplayerSendTime = now;
          multiplayer.sendUpdate({
            x: eng.playerX,
            y: eng.playerY,
            angle: eng.playerAngle,
            body: eng.playerBody,
            length: eng.playerLength,
            score: eng.score,
            isBoosting: eng.isBoosting,
            isAlive: eng.lives > 0,
          });
        }

        // 2. Tactical Magnetic Suction (If Mıknatıs Girdabı is equipped or power-up active)
        const isMagnetEquipped = hasMagnetVortex && activeLoadoutRef.current.includes('MAGNET_VORTEX');
        const hasActiveMagnet = isMagnetEquipped || eng.activePowerUps.some((p) => p.type === 'MAGNET');
        if (hasActiveMagnet) {
          const magnetRadius = isMagnetEquipped && eng.activePowerUps.some((p) => p.type === 'MAGNET') ? 220 : isMagnetEquipped ? 120 : 160;
          for (let m = 0; m < eng.foods.length; m++) {
            const food = eng.foods[m];
            if (food.type === 'GREEN_POISON' || food.type === 'PURPLE_POISON') continue;
            const d = Math.hypot(eng.playerX - food.x, eng.playerY - food.y);
            if (d < magnetRadius && d > 12) {
              const pull = ((magnetRadius - d) / magnetRadius) * 280 * dt;
              food.x += ((eng.playerX - food.x) / d) * pull;
              food.y += ((eng.playerY - food.y) / d) * pull;
            }
          }
        }

        // 3. Player Food Collisions
        for (let i = eng.foods.length - 1; i >= 0; i--) {
          const f = eng.foods[i];
          const dist = Math.hypot(eng.playerX - f.x, eng.playerY - f.y);
          const eatDist = SEGMENT_RADIUS + (f.radius || 8);

          if (dist < eatDist) {
            // Food eaten!
            if (f.type === 'GREEN_POISON' || f.type === 'PURPLE_POISON') {
              sound.playPoison();
              setIsShaking(true);
              setTimeout(() => setIsShaking(false), 250);

              let damage = f.type === 'GREEN_POISON' ? 0.5 : 1.0;
              if (upgrades.agilityLevel === 1) damage *= 0.8;
              else if (upgrades.agilityLevel === 2) damage *= 0.5;
              else if (upgrades.agilityLevel >= 3) damage *= 0.3;

              const isShieldEquipped = hasCyberShield && activeLoadoutRef.current.includes('CYBER_SHIELD');
              if (isShieldEquipped) damage *= 0.5; // Siber Kalkan reduces poison damage by 50%!

              damage = Number(damage.toFixed(2));
              eng.lives = Math.max(0, Number((eng.lives - damage).toFixed(2)));
              setLives(eng.lives);

              const color = f.type === 'GREEN_POISON' ? '#84cc16' : '#c026d3';
              addEngineParticles(f.x, f.y, color, 24);
              addEngineFloatingText(
                f.x,
                f.y - 15,
                f.type === 'GREEN_POISON'
                  ? `-${damage} KALP (YEŞİL ZEHİR!)`
                  : `-${damage} KALP (MOR ZEHİR!)`,
                color
              );

              if (eng.lives <= 0) {
                setGameState('GAME_OVER');
                sound.playGameOver();
              }
            } else {
              // Normal & Special foods
              const isCombo = now < eng.comboExpiry;
              eng.combo = isCombo ? eng.combo + 1 : 1;
              eng.comboExpiry = now + COMBO_WINDOW_MS;

              const hasDouble = eng.activePowerUps.some((p) => p.type === 'DOUBLE_POINTS');
              const earned = Math.round(
                f.points * eng.combo * (hasDouble ? 2 : 1) * diffCfg.scoreMultiplier
              );
              eng.score += earned;
              eng.foodEatenCount += 1;

              if (f.type === 'LAHMACUN') {
                sound.playGoldenApple();
                addEngineParticles(f.x, f.y, '#ea580c', 22);

                const baseCoin =
                  upgrades.coinMasteryLevel === 1
                    ? 6.0
                    : upgrades.coinMasteryLevel === 2
                    ? 8.0
                    : 4.5;
                updateCoins(baseCoin);

                eng.lahmacunEatenCount += 1;
                if (eng.lahmacunEatenCount % 10 === 0) {
                  const bonusCoins = 45;
                  updateCoins(bonusCoins);
                  addEngineFloatingText(
                    f.x,
                    f.y - 20,
                    `🔥 10 LAHMACUN BONUSU! +${bonusCoins} COIN!`,
                    '#fbbf24'
                  );
                } else {
                  addEngineFloatingText(
                    f.x,
                    f.y - 15,
                    `+${earned} LAHMACUN! (+5 UZAMA · +${baseCoin}🪙)`,
                    '#ea580c'
                  );
                }
                const isLahmacunEquipped = hasMegaLahmacun && activeLoadoutRef.current.includes('MEGA_LAHMACUN');
                eng.playerGrowthPending += isLahmacunEquipped ? 6 : 5; // +20% bonus length with equipped Mega Lahmacun!
              } else if (f.type === 'GOLDEN_APPLE') {
                sound.playGoldenApple();
                addEngineParticles(f.x, f.y, '#f59e0b', 20);
                updateCoins(3.0);
                addEngineFloatingText(f.x, f.y - 15, `+${earned} ALTIN ELMA! (+2 · +3🪙)`, '#f59e0b');
                eng.playerGrowthPending += 2; // +2 length
              } else {
                sound.playEat(eng.combo);
                addEngineParticles(f.x, f.y, f.color, 12);
                if (f.type === 'ENERGY_CORE') updateCoins(1.5);
                else if (f.type === 'BOT_REMAINS') updateCoins(2.0);
                addEngineFloatingText(f.x, f.y - 12, `+${earned}`, f.color);
                eng.playerGrowthPending += 1;
              }
            }

            // Remove eaten food and spawn replacement
            eng.foods.splice(i, 1);
            eng.foods.push(createFoodItem(getRandomArenaPoint(), undefined, difficulty));
          }
        }

        // Handle 10-Second Time Freeze Countdown
        const isTimeFrozen = eng.timeFreezeRemainingMs > 0;
        if (isTimeFrozen) {
          eng.timeFreezeRemainingMs = Math.max(0, eng.timeFreezeRemainingMs - dt * 1000);
        }

        // Handle 150-Second Time Freeze Cooldown
        if (eng.timeFreezeCooldownMs > 0) {
          eng.timeFreezeCooldownMs = Math.max(0, eng.timeFreezeCooldownMs - dt * 1000);
        }

        // 3. Bot Movement & Snake.io Combat AI
        if (isTimeFrozen) {
          // BOTS ARE COMPLETELY FROZEN IN SOLID ICE!
          // They cannot move or steer. Touching any part of a frozen bot shatters and eliminates it!
          eng.bots.forEach((bot) => {
            if (!bot.isAlive || bot.body.length === 0) return;
            for (let s = 0; s < bot.body.length; s++) {
              const seg = bot.body[s];
              if (Math.hypot(eng.playerX - seg.x, eng.playerY - seg.y) < SEGMENT_RADIUS * 2.2) {
                eliminateBot(bot.id, true);
                break;
              }
            }
          });
        } else {
          eng.bots.forEach((bot) => {
            if (!bot.isAlive || bot.body.length === 0) return;

            const bHead = bot.body[0];
            const distToPlayer = Math.hypot(eng.playerX - bHead.x, eng.playerY - bHead.y);

            // A) DESIRED TARGET EVALUATION (Tactical Food Seeking vs Predatory Interception)
            let desiredTargetX = center;
            let desiredTargetY = center;
            let highestTargetScore = -Infinity;

            // 1. Food Evaluation with Tactical Value Weighting
            eng.foods.forEach((f) => {
              const isPoison = f.type === 'GREEN_POISON' || f.type === 'PURPLE_POISON';
              if (isPoison) {
                // High difficulty bots with high poison awareness actively filter out poison
                if (Math.random() < diffCfg.aiPoisonAwareness) return;
              }

              const d = Math.hypot(f.x - bHead.x, f.y - bHead.y);
              if (d > 750) return;

              let typeWeight = 1.0;
              if (f.type === 'BOT_REMAINS') typeWeight = 3.5;
              else if (f.type === 'LAHMACUN') typeWeight = 3.0;
              else if (f.type === 'GOLDEN_APPLE') typeWeight = 2.5;
              else if (f.type === 'ENERGY_CORE') typeWeight = 2.0;

              const score = (1000 / (d + 20)) * typeWeight;
              if (score > highestTargetScore) {
                highestTargetScore = score;
                desiredTargetX = f.x;
                desiredTargetY = f.y;
              }
            });

            // 2. Predatory Player Interception (Snake.io Cut-Off Tactic)
            // As difficulty increases, bots prioritize intercepting and cutting off the player
            const shouldHuntPlayer =
              diffCfg.aiAggression > 0.15 &&
              distToPlayer < 650 &&
              !eng.isInvulnerable;

            let isHunting = false;
            if (shouldHuntPlayer) {
              const playerSpd = eng.isBoosting ? diffCfg.baseSpeed * 1.85 : diffCfg.baseSpeed;
              const leadTime = diffCfg.aiPredictiveCutoff * Math.min(1.2, distToPlayer / 260);

              // Calculate predicted intercept point ahead of player's head
              const interceptX = eng.playerX + Math.cos(eng.playerAngle) * playerSpd * leadTime;
              const interceptY = eng.playerY + Math.sin(eng.playerAngle) * playerSpd * leadTime;

              // Check if intercept point is within arena boundaries
              const distFromCenter = Math.hypot(interceptX - center, interceptY - center);
              if (distFromCenter < ARENA_RADIUS - 120) {
                const huntScore = (1000 / (distToPlayer + 50)) * (diffCfg.aiAggression * 4.0);
                if (huntScore > highestTargetScore) {
                  desiredTargetX = interceptX;
                  desiredTargetY = interceptY;
                  isHunting = true;
                }
              }
            }

            // B) MULTI-WHISKER RAYCASTING CONTEXT STEERING (Obstacle & Crash Avoidance)
            // Cast sensory rays across an angular fan around current heading
            const baseTargetAngle = Math.atan2(desiredTargetY - bHead.y, desiredTargetX - bHead.x);
            const rayCount = diffCfg.aiRayCount;
            const maxSpread = Math.PI * 0.75; // 135-degree scan arc
            const avoidDist = diffCfg.aiAvoidanceDistance;

            let bestAngle = baseTargetAngle;
            let bestAngleScore = -Infinity;

            for (let r = 0; r < rayCount; r++) {
              const offsetAngle = rayCount > 1
                ? -maxSpread / 2 + (r / (rayCount - 1)) * maxSpread
                : 0;
              const testAngle = bot.angle + offsetAngle;

              // Sample point along this sensory whisker
              const sampleX = bHead.x + Math.cos(testAngle) * avoidDist;
              const sampleY = bHead.y + Math.sin(testAngle) * avoidDist;

              // 1. Goal alignment score (desire to face target)
              let rayScore = Math.cos(testAngle - baseTargetAngle) * 35;

              // 2. Arena wall avoidance (Heavily penalize heading towards border)
              const sampleDistCenter = Math.hypot(sampleX - center, sampleY - center);
              if (sampleDistCenter > ARENA_RADIUS - 70) {
                rayScore -= 10000; // Immediate fatal obstacle
              } else if (sampleDistCenter > ARENA_RADIUS - 180) {
                rayScore -= 1500 * ((sampleDistCenter - (ARENA_RADIUS - 180)) / 110);
              }

              // 3. Player body collision avoidance (Bots avoid hitting player's body and dying!)
              for (let s = 1; s < eng.playerBody.length; s += 2) {
                const seg = eng.playerBody[s];
                const d = Math.hypot(sampleX - seg.x, sampleY - seg.y);
                if (d < SEGMENT_RADIUS * 2.2) {
                  rayScore -= 5000; // Fatal collision danger!
                } else if (d < avoidDist) {
                  rayScore -= (avoidDist - d) * 12;
                }
              }

              // 4. Other bot bodies avoidance
              eng.bots.forEach((other) => {
                if (other.id === bot.id || !other.isAlive) return;
                for (let s = 1; s < other.body.length; s += 2) {
                  const seg = other.body[s];
                  const d = Math.hypot(sampleX - seg.x, sampleY - seg.y);
                  if (d < SEGMENT_RADIUS * 2.2) {
                    rayScore -= 5000;
                  } else if (d < avoidDist) {
                    rayScore -= (avoidDist - d) * 8;
                  }
                }
              });

              // 5. Own body avoidance (Long bots don't eat their own tail/coils)
              if (bot.body.length > 8) {
                for (let s = 6; s < bot.body.length; s += 3) {
                  const seg = bot.body[s];
                  const d = Math.hypot(sampleX - seg.x, sampleY - seg.y);
                  if (d < SEGMENT_RADIUS * 2.2) {
                    rayScore -= 4000;
                  } else if (d < avoidDist * 0.7) {
                    rayScore -= (avoidDist * 0.7 - d) * 10;
                  }
                }
              }

              // 6. Poison food avoidance
              if (diffCfg.aiPoisonAwareness > 0.3) {
                eng.foods.forEach((f) => {
                  if (f.type !== 'GREEN_POISON' && f.type !== 'PURPLE_POISON') return;
                  const d = Math.hypot(sampleX - f.x, sampleY - f.y);
                  if (d < 35) {
                    rayScore -= diffCfg.aiPoisonAwareness * 600;
                  }
                });
              }

              if (rayScore > bestAngleScore) {
                bestAngleScore = rayScore;
                bestAngle = testAngle;
              }
            }

            // C) TACTICAL TURBO SPRINT / BOOST
            // High difficulty bots tactically boost to execute cut-off kills or escape
            let isBotBoosting = false;
            if (diffCfg.aiBoostChance > 0 && Math.random() < diffCfg.aiBoostChance) {
              if (isHunting && distToPlayer < 280 && distToPlayer > 60) {
                isBotBoosting = true;
              } else if (bestAngleScore < -100) {
                // Trapped or cornered -> emergency turbo sprint
                isBotBoosting = true;
              }
            }
            bot.isBoosting = isBotBoosting;

            // D) SMOOTH STEERING TO BEST ANGLE
            bot.targetAngle = bestAngle;
            let bAngleDiff = bot.targetAngle - bot.angle;
            while (bAngleDiff > Math.PI) bAngleDiff -= Math.PI * 2;
            while (bAngleDiff < -Math.PI) bAngleDiff += Math.PI * 2;

            const bTurnRate = diffCfg.aiTurnSpeed * dt;
            bot.angle += Math.max(-bTurnRate, Math.min(bTurnRate, bAngleDiff));

            // E) MOVE BOT HEAD
            const bCurrentSpeed = isBotBoosting
              ? diffCfg.botSpeed * 1.55
              : diffCfg.botSpeed;

            const nextHeadX = bHead.x + Math.cos(bot.angle) * bCurrentSpeed * dt;
            const nextHeadY = bHead.y + Math.sin(bot.angle) * bCurrentSpeed * dt;

            // Spawn boost sparks when bot is sprinting
            if (isBotBoosting && Math.random() < 0.25) {
              addEngineParticles(bHead.x, bHead.y, bot.headColor, 1);
            }

            // 1. Check if Bot hits Arena Circular Boundary (Sınıra değince ölsünler kuralı)
            const botDistFromCenter = Math.hypot(nextHeadX - center, nextHeadY - center);
            if (botDistFromCenter >= ARENA_RADIUS - SEGMENT_RADIUS) {
              // Bot hit the arena boundary -> EXPLODES & DIES IMMEDIATELY!
              eliminateBot(bot.id, false);
              addEngineParticles(nextHeadX, nextHeadY, bot.color, 25);
              addEngineFloatingText(
                nextHeadX,
                nextHeadY - 20,
                `⚡ ${bot.name.toUpperCase()} SINIRA ÇARPTI!`,
                '#ef4444'
              );
              return;
            }

          // Check if Bot crashes into Player Body (Snake.io core rule: BOT EXPLODES!)
          let botCrashedIntoPlayer = false;
          for (let s = 1; s < eng.playerBody.length; s++) {
            const seg = eng.playerBody[s];
            if (Math.hypot(nextHeadX - seg.x, nextHeadY - seg.y) < SEGMENT_RADIUS * 1.5) {
              botCrashedIntoPlayer = true;
              break;
            }
          }

          if (botCrashedIntoPlayer) {
            eliminateBot(bot.id, true);
            return;
          }

          // Check if Bot crashes into another Bot's Body
          let botCrashedIntoOtherBot = false;
          eng.bots.forEach((other) => {
            if (other.id === bot.id || !other.isAlive) return;
            for (let s = 1; s < other.body.length; s++) {
              const seg = other.body[s];
              if (Math.hypot(nextHeadX - seg.x, nextHeadY - seg.y) < SEGMENT_RADIUS * 1.5) {
                botCrashedIntoOtherBot = true;
                break;
              }
            }
          });

          if (botCrashedIntoOtherBot) {
            eliminateBot(bot.id, false);
            return;
          }

          // Move bot body
          bot.body[0] = { x: nextHeadX, y: nextHeadY };
          for (let s = 1; s < bot.body.length; s++) {
            const prev = bot.body[s - 1];
            const curr = bot.body[s];
            const dx = prev.x - curr.x;
            const dy = prev.y - curr.y;
            const dist = Math.hypot(dx, dy);
            if (dist > SEGMENT_SPACING) {
              const scale = SEGMENT_SPACING / dist;
              curr.x = prev.x - dx * scale;
              curr.y = prev.y - dy * scale;
            }
          }

          // Bot eats food
          for (let fIdx = eng.foods.length - 1; fIdx >= 0; fIdx--) {
            const f = eng.foods[fIdx];
            if (Math.hypot(nextHeadX - f.x, nextHeadY - f.y) < SEGMENT_RADIUS + (f.radius || 8)) {
              if (f.type !== 'GREEN_POISON' && f.type !== 'PURPLE_POISON') {
                sound.playBotEat();
                bot.score += f.points;
                bot.growthPending += f.growth;
              }
              eng.foods.splice(fIdx, 1);
              eng.foods.push(createFoodItem(getRandomArenaPoint(), undefined, difficulty));
              break;
            }
          }

          if (bot.growthPending > 0 && bot.body.length > 1) {
            const last = bot.body[bot.body.length - 1];
            bot.body.push({ ...last });
            bot.length += 1;
            bot.growthPending -= 1;
          }
        });
        }

        // 4. Check if Player's Head hits a Bot's Body (only in solo mode when not frozen)
        if (!isTimeFrozen) {
          if (gameMode !== 'MULTIPLAYER') {
            eng.bots.forEach((bot) => {
              if (!bot.isAlive) return;
              for (let s = 1; s < bot.body.length; s++) {
                const seg = bot.body[s];
                if (Math.hypot(eng.playerX - seg.x, eng.playerY - seg.y) < SEGMENT_RADIUS * 1.5) {
                  handlePlayerDamage(`BOT GÖVDESİ (${bot.name})`);
                  break;
                }
              }
            });
          }

          // 4b. Check if Player's Head hits a Remote Human Player's Body
          if (gameMode === 'MULTIPLAYER') {
            const remotes = multiplayer.getRemotePlayers();
            for (const rp of remotes) {
              if (!rp.isAlive || !rp.body || rp.body.length < 2) continue;
              for (let s = 1; s < rp.body.length; s++) {
                const seg = rp.body[s];
                if (Math.hypot(eng.playerX - seg.x, eng.playerY - seg.y) < SEGMENT_RADIUS * 1.5) {
                  handlePlayerDamage(`GERÇEK OYUNCU (${rp.name})`);
                  break;
                }
              }
            }
          }
        }

        // 4c. Check if a Remote Human Player's Head hits OUR Player's Body (We cut them off!)
        if (gameMode === 'MULTIPLAYER') {
          const remotes = multiplayer.getRemotePlayers();
          for (const rp of remotes) {
            if (!rp.isAlive || !rp.body || rp.body.length === 0) continue;
            const rHead = rp.body[0] || { x: rp.x, y: rp.y };
            for (let s = 1; s < eng.playerBody.length; s++) {
              const mySeg = eng.playerBody[s];
              if (Math.hypot(rHead.x - mySeg.x, rHead.y - mySeg.y) < SEGMENT_RADIUS * 1.5) {
                multiplayer.sendKill(rp.id, rp.name, multiplayer.getMyPlayerId() || 'me', playerName, rHead.x, rHead.y);
                sound.playBotKill();
                updateCoins(35);
                eng.score += 350;
                eng.playerGrowthPending += 10;
                eng.botKillsCount += 1;
                setBotKillsCount(eng.botKillsCount);
                addEngineParticles(rHead.x, rHead.y, '#f59e0b', 35);
                addEngineFloatingText(rHead.x, rHead.y - 35, `👑 GERÇEK OYUNCU AVLANDI: ${rp.name}! +350 PUAN!`, '#f59e0b');
                break;
              }
            }
          }
        }

        // 5. Magnet Power-up pull
        const hasMagnet = eng.activePowerUps.some((p) => p.type === 'MAGNET');
        if (hasMagnet) {
          eng.foods.forEach((f) => {
            const dist = Math.hypot(eng.playerX - f.x, eng.playerY - f.y);
            if (dist < 400 && dist > SEGMENT_RADIUS) {
              const pullAngle = Math.atan2(eng.playerY - f.y, eng.playerX - f.x);
              f.x += Math.cos(pullAngle) * 350 * dt;
              f.y += Math.sin(pullAngle) * 350 * dt;
            }
          });
        }
      }

      // Update Particles
      for (let pIdx = eng.particles.length - 1; pIdx >= 0; pIdx--) {
        const p = eng.particles[pIdx];
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.life += dt;
        p.alpha = Math.max(0, 1 - p.life / p.maxLife);
        if (p.life >= p.maxLife) {
          eng.particles.splice(pIdx, 1);
        }
      }

      // Update Floating Texts
      for (let tIdx = eng.floatingTexts.length - 1; tIdx >= 0; tIdx--) {
        const t = eng.floatingTexts[tIdx];
        t.y -= 25 * dt;
        t.life += dt;
        t.alpha = Math.max(0, 1 - t.life / 0.85);
        if (t.life >= 0.85) {
          eng.floatingTexts.splice(tIdx, 1);
        }
      }

      // Second Timer (Duration, Bot Respawns, Power-up decay)
      if (now - secondTimerTime >= 1000) {
        secondTimerTime = now;
        if (gameState === 'PLAYING') {
          eng.durationSeconds += 1;
          setDurationSeconds(eng.durationSeconds);

          // Bot Respawns (Only in Solo mode, never in Multiplayer)
          if (gameMode !== 'MULTIPLAYER') {
            eng.bots.forEach((bot) => {
              if (bot.isAlive) return;
              if (bot.respawnInSeconds > 1) {
                bot.respawnInSeconds -= 1;
              } else {
                const center = ARENA_SIZE / 2;
                const p = getRandomArenaPoint(380); // Spawn well away from boundary
                const angleToCenter = Math.atan2(center - p.y, center - p.x);
                const angle = angleToCenter + (Math.random() - 0.5) * 0.5; // Heading inward
                const respawnBody: Point[] = [];
                const startLen = 14;
                for (let i = 0; i < startLen; i++) {
                  respawnBody.push({
                    x: p.x - Math.cos(angle) * i * SEGMENT_SPACING,
                    y: p.y - Math.sin(angle) * i * SEGMENT_SPACING,
                  });
                }
                bot.isAlive = true;
                bot.body = respawnBody;
                bot.angle = angle;
                bot.targetAngle = angle;
                bot.length = startLen;
                bot.respawnInSeconds = 0;
              }
            });
          }

          // Power-up durations
          eng.activePowerUps = eng.activePowerUps
            .map((pu) => ({ ...pu, remainingMs: pu.remainingMs - 1000 }))
            .filter((pu) => pu.remainingMs > 0);
          setActivePowerUps([...eng.activePowerUps]);
        }
      }

      // Throttled UI State Dispatch (10 times/second)
      // This completely stops React GC thrashing and eliminates stutter!
      if (now - uiThrottleTime >= 100) {
        uiThrottleTime = now;

        setScore(eng.score);
        setLength(eng.playerLength);
        setBoostStaminaPercent(eng.boostStamina);
        setCombo(eng.combo);
        setTimeFreezeRemainingMs(Math.round(eng.timeFreezeRemainingMs));
        setTimeFreezeCooldownMs(Math.round(eng.timeFreezeCooldownMs));

        // Calculate Arena Rankings (Snake.io leaderboard)
        const remoteStandings: LiveStandingItem[] = (gameMode === 'MULTIPLAYER' ? multiplayer.getRemotePlayers() : []).map((rp) => ({
          name: rp.name,
          score: rp.score,
          color: '#f43f5e',
          isPlayer: false,
          isRealHuman: true,
          isAlive: rp.isAlive,
          length: rp.length,
        }));

        const botStandings: LiveStandingItem[] = gameMode === 'MULTIPLAYER'
          ? []
          : eng.bots.map((b) => ({
              name: b.name,
              score: b.score,
              color: b.color,
              isPlayer: false,
              isRealHuman: false,
              isAlive: b.isAlive,
              length: b.length,
            }));

        const standings: LiveStandingItem[] = [
          {
            name: playerName ? `${playerName} (Sen)` : 'Sen',
            score: eng.score,
            color: '#00e5ff',
            isPlayer: true,
            isRealHuman: true,
            isAlive: true,
            length: eng.playerLength,
          },
          ...remoteStandings,
          ...botStandings,
        ].sort((a, b) => b.score - a.score);

        setLiveStandings(standings);
        const myRank = standings.findIndex((s) => s.isPlayer) + 1;
        setPlayerRank(myRank > 0 ? myRank : 1);
        setTotalSnakes(standings.length);
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [
    gameState,
    difficulty,
    gameMode,
    playerName,
    upgrades,
    handlePlayerDamage,
    eliminateBot,
    addEngineParticles,
    addEngineFloatingText,
    createFoodItem,
    getRandomArenaPoint,
    updateCoins,
  ]);

  // Keyboard controls listener (Smooth steering + Spacebar Turbo Boost)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      if (e.key === ' ' || e.code === 'Space') {
        if (gameState === 'PLAYING') {
          // Space held = Turbo Boost!
          setBoosting(true);
        } else if (gameState === 'PAUSED') {
          setGameState('PLAYING');
          sound.playClick();
        }
        return;
      }

      if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
        if (gameState === 'PLAYING') {
          setGameState('PAUSED');
          sound.playClick();
        } else if (gameState === 'PAUSED') {
          setGameState('PLAYING');
          sound.playClick();
        }
        return;
      }

      if (e.key === 'r' || e.key === 'R') {
        if (gameState === 'PLAYING' || gameState === 'PAUSED') {
          restartGame();
        }
        return;
      }

      if (e.key === 'm' || e.key === 'M') {
        const nextMute = sound.toggleMute();
        setIsMuted(nextMute);
        return;
      }

      if (e.key === 'u' || e.key === 'U') {
        setIsUpgradeModalOpen((prev) => !prev);
        return;
      }

      if (e.key === 'g' || e.key === 'G' || e.key === 't' || e.key === 'T') {
        if (gameState === 'PLAYING') {
          activateTimeFreeze();
        }
        return;
      }

      if (e.key === 'x' || e.key === 'X') {
        if (gameState === 'PLAYING') {
          activateTeleport();
        }
        return;
      }

      if (gameState !== 'PLAYING') return;

      // WASD / Arrow directional heading
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        engineRef.current.playerTargetAngle = 0;
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        engineRef.current.playerTargetAngle = Math.PI / 2;
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        engineRef.current.playerTargetAngle = Math.PI;
      } else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        engineRef.current.playerTargetAngle = -Math.PI / 2;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.code === 'Space') {
        setBoosting(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState, restartGame, setBoosting, activateTimeFreeze, activateTeleport]);

  // 10-minute market rotation countdown effect
  useEffect(() => {
    const timer = setInterval(() => {
      const epoch = Math.floor(Date.now() / MARKET_ROTATION_INTERVAL_MS);
      const timeLeft = (epoch + 1) * MARKET_ROTATION_INTERVAL_MS - Date.now();
      setRotationTimeLeftMs(Math.max(0, timeLeft));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Submit high score
  const submitHighScore = useCallback(
    (playerName: string) => {
      saveHighScore(
        playerName,
        score,
        length,
        durationSeconds,
        difficulty
      );
      setHighScores(getHighScores());
    },
    [score, length, durationSeconds, difficulty]
  );

  return {
    gameState,
    difficulty,
    lives,
    maxPossibleLives,
    score,
    length,
    combo,
    comboExpiry,
    botKillsCount,
    durationSeconds,
    isInvulnerable,
    isShaking,
    isMuted,
    highScores,
    bestScore: getBestScore(),
    isNewRecord: isHighScore(score),
    isLeaderboardOpen,
    isUpgradeModalOpen,
    coins,
    upgrades,
    timeFreezeCharges,
    timeFreezeRemainingMs,
    timeFreezeCooldownMs,
    selectedSkin,
    unlockedSkins,
    currentFps,
    playerRank,
    totalSnakes,
    boostStaminaPercent,
    isBoosting,
    activePowerUps,
    liveStandings,
    engineRef,
    gameMode,
    setGameMode,
    roomId,
    setRoomId,
    playerName,
    setPlayerName,
    remotePlayers,
    chatMessages,
    sendChatMessage,
    multiplayerPing,
    startGame,
    restartGame,
    goToMenu,
    setSteerAngle,
    setBoosting,
    buyUpgrade,
    buyTimeFreeze,
    activateTimeFreeze,
    hasGodlyTeleport,
    teleportCharges,
    activateTeleport,
    summonCrate,
    buySkin,
    equipSkin,
    hasMegaLahmacun,
    hasMagnetVortex,
    hasCyberShield,
    hasCloning,
    hasMythicHearts,
    hasLegendaryTurbo,
    isTurboUnlocked: hasLegendaryTurbo && activeLoadout.includes('SUPER_TURBO'),
    rotationTimeLeftMs,
    currentRotationCycle: Math.floor(Date.now() / MARKET_ROTATION_INTERVAL_MS),
    inventory,
    activeLoadout,
    equipPower,
    unequipPower,
    toggleEquipPower,
    isPowerActive,
    buyTacticalItem,
    submitHighScore,
    totalPlaytimeSeconds,
    claimedRewards,
    claimPlaytimeReward,
    lastDailyResetTime,
    setIsLeaderboardOpen,
    setIsUpgradeModalOpen,
    togglePause: () => {
      if (gameState === 'PLAYING') setGameState('PAUSED');
      else if (gameState === 'PAUSED') setGameState('PLAYING');
      sound.playClick();
    },
    toggleMute: () => {
      const nextMute = sound.toggleMute();
      setIsMuted(nextMute);
    },
  };
}
