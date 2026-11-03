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
  UpgradeLevels,
} from '../types/game';

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

  // Calculate maximum lives with health upgrade
  const maxPossibleLives = Math.min(
    5.0,
    MAX_LIVES + upgrades.healthLevel * 0.5 + (upgrades.healthLevel === 3 ? 0.5 : 0)
  );

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
      if (currentLvl >= costArr.length) return false;

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
    [coins, upgrades, maxPossibleLives, updateCoins]
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

  // Initialize Bots
  const initBots = useCallback((diff: Difficulty): BotSnake[] => {
    const count = DIFFICULTIES[diff]?.botCount ?? 3;
    return BOT_CONFIGS.slice(0, count).map((cfg) => {
      const initialBody: Point[] = [];
      const angle = Math.random() * Math.PI * 2;
      for (let i = 0; i < cfg.initialLength; i++) {
        initialBody.push({
          x: cfg.initialX - Math.cos(angle) * i * SEGMENT_SPACING,
          y: cfg.initialY - Math.sin(angle) * i * SEGMENT_SPACING,
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

  // Start new game
  const startGame = useCallback(
    (selectedDiff?: Difficulty) => {
      const diff = selectedDiff || difficulty;
      setDifficulty(diff);

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

      const initialBots = initBots(diff);

      const initialFoods: FoodItem[] = [];
      for (let i = 0; i < DEFAULT_FOOD_COUNT; i++) {
        const p = getRandomArenaPoint();
        initialFoods.push(createFoodItem(p, undefined, diff));
      }

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

      setGameState('PLAYING');
      sound.playClick();
    },
    [difficulty, maxPossibleLives, initBots, getRandomArenaPoint, createFoodItem]
  );

  const restartGame = useCallback(() => {
    startGame(difficulty);
  }, [startGame, difficulty]);

  // Return to menu functionality (user request: "menüye gitme olsun")
  const goToMenu = useCallback(() => {
    setGameState('TITLE');
    sound.playClick();
  }, []);

  // Steering angle input from mouse, joystick or keyboard
  const setSteerAngle = useCallback((angle: number) => {
    engineRef.current.playerTargetAngle = angle;
  }, []);

  // Turbo boost trigger
  const setBoosting = useCallback((boosting: boolean) => {
    engineRef.current.isBoosting = boosting;
    setIsBoosting(boosting);
  }, []);

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

      // Convert body segments into BOT_REMAINS food items
      const droppedRemains: FoodItem[] = bot.body.map((seg, idx) => ({
        id: `remains-${Date.now()}-${idx}-${Math.random()}`,
        x: seg.x + (Math.random() - 0.5) * 8,
        y: seg.y + (Math.random() - 0.5) * 8,
        type: 'BOT_REMAINS' as const,
        points: 30,
        color: '#a855f7',
        growth: 1,
        radius: 9,
      }));

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

        if (eng.isBoosting && eng.boostStamina > 5) {
          actualSpeed = baseSpeed * 1.85;
          eng.boostStamina = Math.max(0, eng.boostStamina - 28 * dt);

          // Drop glowing boost particles behind tail
          if (Math.random() < 0.4 && eng.playerBody.length > 2) {
            const tail = eng.playerBody[eng.playerBody.length - 1];
            addEngineParticles(tail.x, tail.y, '#00e5ff', 1);
          }
        } else {
          // Regenerate boost stamina
          eng.boostStamina = Math.min(100, eng.boostStamina + 22 * dt);
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

        // Handle Player Growth queue
        if (eng.playerGrowthPending > 0 && eng.playerBody.length > 1) {
          const lastSeg = eng.playerBody[eng.playerBody.length - 1];
          eng.playerBody.push({ ...lastSeg });
          eng.playerLength += 1;
          eng.playerGrowthPending -= 1;
        }

        // 2. Player Food Collisions
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
                eng.playerGrowthPending += 5; // +5 length
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

        // 3. Bot Movement & Snake.io Combat AI
        eng.bots.forEach((bot) => {
          if (!bot.isAlive || bot.body.length === 0) return;

          const bHead = bot.body[0];

          // Find target: nearest non-poison food, or try to cut off player if aggressive
          let targetX = center;
          let targetY = center;
          let minDist = Infinity;

          eng.foods.forEach((f) => {
            if (f.type === 'GREEN_POISON' || f.type === 'PURPLE_POISON') return;
            const d = Math.hypot(f.x - bHead.x, f.y - bHead.y);
            if (d < minDist) {
              minDist = d;
              targetX = f.x;
              targetY = f.y;
            }
          });

          // Avoid arena wall
          const botDistCenter = Math.hypot(bHead.x - center, bHead.y - center);
          if (botDistCenter > ARENA_RADIUS - 200) {
            targetX = center;
            targetY = center;
          }

          // Smooth turning towards target
          bot.targetAngle = Math.atan2(targetY - bHead.y, targetX - bHead.x);
          let bAngleDiff = bot.targetAngle - bot.angle;
          while (bAngleDiff > Math.PI) bAngleDiff -= Math.PI * 2;
          while (bAngleDiff < -Math.PI) bAngleDiff += Math.PI * 2;
          const bTurn = 4.8 * dt;
          bot.angle += Math.max(-bTurn, Math.min(bTurn, bAngleDiff));

          const bSpeed = diffCfg.botSpeed;
          const nextHeadX = bHead.x + Math.cos(bot.angle) * bSpeed * dt;
          const nextHeadY = bHead.y + Math.sin(bot.angle) * bSpeed * dt;

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

        // 4. Check if Player's Head hits a Bot's Body
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

          // Bot Respawns
          eng.bots.forEach((bot) => {
            if (bot.isAlive) return;
            if (bot.respawnInSeconds > 1) {
              bot.respawnInSeconds -= 1;
            } else {
              const p = getRandomArenaPoint(300);
              const angle = Math.random() * Math.PI * 2;
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

        // Calculate Arena Rankings (Snake.io leaderboard)
        const standings: LiveStandingItem[] = [
          {
            name: 'Sen',
            score: eng.score,
            color: '#00e5ff',
            isPlayer: true,
            isAlive: true,
            length: eng.playerLength,
          },
          ...eng.bots.map((b) => ({
            name: b.name,
            score: b.score,
            color: b.color,
            isPlayer: false,
            isAlive: b.isAlive,
            length: b.length,
          })),
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
  }, [gameState, restartGame, setBoosting]);

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
    currentFps,
    playerRank,
    totalSnakes,
    boostStaminaPercent,
    isBoosting,
    activePowerUps,
    liveStandings,
    engineRef,
    startGame,
    restartGame,
    goToMenu,
    setSteerAngle,
    setBoosting,
    buyUpgrade,
    submitHighScore,
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
