import React, { useState, useEffect } from 'react';
import { GameBoard } from './components/GameBoard';
import { HUD } from './components/HUD';
import { VirtualDPad } from './components/VirtualDPad';
import { TitleScreen } from './components/TitleScreen';
import { GameOverModal } from './components/GameOverModal';
import { LeaderboardModal } from './components/LeaderboardModal';
import { UpgradeModal } from './components/UpgradeModal';
import { CornerInventory } from './components/CornerInventory';
import { PlaytimeRewardsWidget } from './components/PlaytimeRewardsWidget';
import { GameRulesModal } from './components/GameRulesModal';
import { SettingsModal } from './components/SettingsModal';
import { PauseOverlay } from './components/PauseOverlay';
import { BugReportModal } from './components/BugReportModal';
import { DeveloperInboxModal } from './components/DeveloperInboxModal';
import { bugReportsService } from './services/bugReports';
import { useSnakeGame } from './hooks/useSnakeGame';
import { resetHighScoresToDefault } from './services/storage';
import { music, MusicTrack } from './services/music';
import { Trophy, HelpCircle, X, Settings, Coins, Music, Zap, Home, Dices, Shuffle, ShieldAlert, Volume2, VolumeX, Bug, Mail } from 'lucide-react';
import { Difficulty, GameMode } from './types/game';

export default function App() {
  const {
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
    bestScore,
    isNewRecord,
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
    timeFreezeCharges,
    timeFreezeRemainingMs,
    timeFreezeCooldownMs,
    selectedSkin,
    unlockedSkins,
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
    buySkin,
    equipSkin,
    hasMegaLahmacun,
    hasMagnetVortex,
    hasCyberShield,
    hasCloning,
    hasMythicHearts,
    hasLegendaryTurbo,
    isTurboUnlocked,
    rotationTimeLeftMs,
    currentRotationCycle,
    inventory,
    activeLoadout,
    equipPower,
    unequipPower,
    toggleEquipPower,
    buyTacticalItem,
    submitHighScore,
    totalPlaytimeSeconds,
    claimedRewards,
    claimPlaytimeReward,
    lastDailyResetTime,
    setIsLeaderboardOpen,
    setIsUpgradeModalOpen,
    togglePause,
    toggleMute,
  } = useSnakeGame();

  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('NORMAL');
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);
  const [isBugReportOpen, setIsBugReportOpen] = useState(false);
  const [isDeveloperInboxOpen, setIsDeveloperInboxOpen] = useState(false);
  const [unreadBugReportsCount, setUnreadBugReportsCount] = useState<number>(0);
  const [pendingStartArgs, setPendingStartArgs] = useState<{ mode: GameMode; room?: string; name?: string } | null>(null);

  // Poll unread bug reports count
  useEffect(() => {
    let isMounted = true;
    const fetchCount = async () => {
      try {
        const data = await bugReportsService.getReports();
        if (isMounted) {
          setUnreadBugReportsCount(data.unreadCount);
        }
      } catch {}
    };
    fetchCount();
    const interval = setInterval(fetchCount, 15000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleAcceptRulesAndStart = () => {
    setIsRulesModalOpen(false);
    if (pendingStartArgs) {
      music.ensureAudioContext();
      startGame(selectedDifficulty, pendingStartArgs.mode, pendingStartArgs.room, pendingStartArgs.name);
      setPendingStartArgs(null);
    }
  };
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      const saved = localStorage.getItem('cybersnake_theme_v1');
      return saved === 'light' ? 'light' : 'dark';
    } catch {
      return 'dark';
    }
  });

  const [currentTrack, setCurrentTrack] = useState<MusicTrack>(() => music.getTrack());
  const [musicVolume, setMusicVolume] = useState<number>(() => music.getVolume());

  const handleToggleMusic = () => {
    const next = music.toggleMusic();
    setCurrentTrack(next);
    if (gameState === 'PLAYING' && engineRef.current) {
      engineRef.current.floatingTexts.push({
        id: `ft-${Date.now()}-${Math.random()}`,
        x: engineRef.current.playerX,
        y: engineRef.current.playerY - 30,
        text: next === 'OFF' ? '🔇 MÜZİK KAPATILDI' : `🎵 MÜZİK: ${music.getTrackInfo().label.toUpperCase()}`,
        color: next === 'OFF' ? '#ef4444' : '#22d3ee',
        alpha: 1,
        life: 0,
      });
    }
  };

  // Keyboard shortcut [N] to toggle background music on/off anytime
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }
      if (e.key === 'n' || e.key === 'N') {
        handleToggleMusic();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, currentTrack]);

  // Apply dark / light theme to document element
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
    try {
      localStorage.setItem('cybersnake_theme_v1', theme);
    } catch {}
  }, [theme]);

  // Handle background music playing state
  useEffect(() => {
    if (gameState === 'PLAYING') {
      music.start();
    } else if (gameState === 'PAUSED' || gameState === 'GAME_OVER') {
      music.stop();
    }
  }, [gameState]);

  const handleToggleTheme = (newTheme: 'dark' | 'light') => {
    setTheme(newTheme);
  };

  const handleSelectTrack = (track: MusicTrack) => {
    setCurrentTrack(track);
    music.setTrack(track);
  };

  const handleRandomTrack = () => {
    const chosen = music.playRandomTrack();
    setCurrentTrack(chosen);
  };

  const handleVolumeChange = (vol: number) => {
    setMusicVolume(vol);
    music.setVolume(vol);
  };

  const handleResetScores = () => {
    resetHighScoresToDefault();
  };

  const comboTimeLeftPercent = Math.max(
    0,
    Math.min(100, ((comboExpiry - Date.now()) / 4000) * 100)
  );

  return (
    <div
      className={`min-h-screen flex flex-col font-sans select-none overflow-x-hidden transition-colors duration-200 ${
        theme === 'dark' ? 'bg-[#06070b] text-slate-100' : 'bg-slate-100 text-slate-900'
      }`}
    >
      {/* Top Bar Header */}
      <header
        className={`flex items-center justify-between gap-3 px-3 sm:px-6 py-2.5 border-b sticky top-0 z-40 backdrop-blur-md transition-colors ${
          theme === 'dark' ? 'border-slate-800/80 bg-slate-950/90' : 'border-slate-200 bg-white/90 shadow-sm'
        }`}
      >
        {/* User requested name branding: "Mustafa Kemal" and underneath "Yılan Oyunu" */}
        <div
          onClick={goToMenu}
          className="cursor-pointer flex flex-col items-start leading-tight group"
          title="Ana Menüye Dön"
        >
          <div className="flex items-center gap-1.5 text-base sm:text-lg font-black tracking-tight whitespace-nowrap">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] group-hover:scale-125 transition-transform" />
            <span className="text-white group-hover:text-cyan-400 transition-colors">MUSTAFA KEMAL</span>
          </div>
          <span className="text-[10px] sm:text-[11px] font-bold text-cyan-400 uppercase tracking-widest pl-4">
            Yılan Oyunu
          </span>
        </div>

        {/* Navigation Links for Desktop */}
        <nav className="hidden md:flex items-center gap-4 text-xs font-semibold text-slate-400">
          <button
            onClick={() => setIsHelpOpen(true)}
            className="hover:text-cyan-400 transition-colors cursor-pointer"
          >
            Nasıl Oynanır?
          </button>
          <button
            onClick={() => {
              setPendingStartArgs(null);
              setIsRulesModalOpen(true);
            }}
            className="hover:text-red-400 transition-colors cursor-pointer flex items-center gap-1 text-slate-300"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
            <span>Oyun Kuralları</span>
          </button>
          <button
            onClick={() => setIsUpgradeModalOpen(true)}
            className="hover:text-amber-400 transition-colors cursor-pointer flex items-center gap-1"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Market & Geliştirme</span>
          </button>
          <button
            onClick={() => setIsLeaderboardOpen(true)}
            className="hover:text-amber-400 transition-colors cursor-pointer flex items-center gap-1"
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>Liderlik Tablosu</span>
          </button>
          <span className="font-mono text-[11px] text-emerald-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            {currentFps} FPS
          </span>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Coins Badge & Shop Trigger */}
          <button
            onClick={() => setIsUpgradeModalOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold font-mono rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 hover:bg-amber-500/25 transition-all shadow-sm active:scale-95"
            title="Siber Mağaza: Hız, Kalp, Esneklik"
          >
            <Coins className="w-3.5 h-3.5" />
            <span>{coins.toLocaleString('tr-TR')}</span>
          </button>

          {/* Music Toggle */}
          <button
            onClick={() => {
              const next = music.nextTrack();
              setCurrentTrack(next);
            }}
            className="px-2.5 py-1.5 rounded-xl border border-slate-700/80 bg-slate-900 text-slate-300 hover:text-cyan-400 transition-colors active:scale-95 flex items-center gap-1.5"
            title={`Müzik: ${music.getTrackInfo().label} (${music.getTrackInfo().genre})`}
            aria-label="Müzik Değiştir"
          >
            <Music className={`w-3.5 h-3.5 ${currentTrack !== 'OFF' ? 'text-cyan-400 animate-pulse' : 'text-slate-500'}`} />
            <span className="text-[11px] font-bold hidden sm:inline text-slate-300 truncate max-w-[95px]">
              {music.getTrackInfo().label}
            </span>
          </button>

          {/* Quick Turn Off / On Music Button */}
          <button
            onClick={handleToggleMusic}
            className={`px-2 py-1.5 rounded-xl border transition-colors active:scale-95 flex items-center gap-1 text-[11px] font-bold ${
              currentTrack === 'OFF'
                ? 'border-rose-500/50 bg-rose-500/15 text-rose-300 hover:bg-rose-500/25'
                : 'border-slate-700/80 bg-slate-900 text-slate-400 hover:text-white'
            }`}
            title={currentTrack === 'OFF' ? 'Müziği Başlat (N)' : 'Müziği Kapat (N)'}
            aria-label="Müziği Aç veya Kapat"
          >
            {currentTrack === 'OFF' ? (
              <>
                <VolumeX className="w-3.5 h-3.5 text-rose-400" />
                <span className="hidden xl:inline text-rose-400 font-mono">Müzik Kapalı</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden xl:inline text-slate-400 font-mono">Kapat</span>
              </>
            )}
          </button>

          {/* Quick Random Music (20 Şarkı Arasından Rastgele) */}
          <button
            onClick={handleRandomTrack}
            className="px-2 py-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 transition-colors active:scale-95 flex items-center gap-1"
            title="20 Müzik Arasından Rastgele Çal"
            aria-label="Rastgele Müzik"
          >
            <Dices className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[11px] font-bold hidden md:inline">Rastgele</span>
          </button>

          {/* Settings Button */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 rounded-xl border border-slate-700/80 bg-slate-900 text-slate-300 hover:text-cyan-400 transition-colors active:scale-95 cursor-pointer"
            title="Ayarlar (Tema, Müzik, SFX)"
            aria-label="Ayarlar"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Hata & Bug Bildir Butonu */}
          <button
            onClick={() => setIsBugReportOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 hover:bg-amber-500/25 transition-all shadow-sm active:scale-95 cursor-pointer"
            title="Hata & Bug Bildir (Yapımcıya İlet)"
          >
            <Bug className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden xl:inline">Hata Bildir</span>
          </button>

          {/* Geliştirici Özel Posta Kutusu (mustifotinoa@gmail.com) */}
          <button
            onClick={() => setIsDeveloperInboxOpen(true)}
            className="relative flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/25 transition-all shadow-sm active:scale-95 cursor-pointer"
            title="Geliştirici Posta Kutusu (mustifotinoa@gmail.com)"
          >
            <Mail className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Posta Kutusu</span>
            {unreadBugReportsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white font-mono text-[9px] font-black animate-pulse shadow-md">
                {unreadBugReportsCount}
              </span>
            )}
          </button>

          {/* Menüye Gitme Butonu (User explicit request: menüye gitme olsun) */}
          {gameState !== 'TITLE' && (
            <button
              onClick={goToMenu}
              className="px-2.5 py-1.5 text-xs font-bold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all flex items-center gap-1 border border-slate-700/80 active:scale-95"
              title="Ana Menüye Git"
            >
              <Home className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Menü</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Content Viewport - Expanded container for wide title screen */}
      <main className={`flex-1 flex flex-col items-center justify-center p-2 sm:p-4 w-full mx-auto ${gameState === 'TITLE' ? 'max-w-6xl' : 'max-w-4xl'}`}>
        {gameState === 'TITLE' ? (
          <TitleScreen
            onStartGame={(mode, room, name) => {
              setPendingStartArgs({ mode, room, name });
              setIsRulesModalOpen(true);
            }}
            onOpenRules={() => {
              setPendingStartArgs(null);
              setIsRulesModalOpen(true);
            }}
            onOpenReportBug={() => setIsBugReportOpen(true)}
            onOpenInbox={() => setIsDeveloperInboxOpen(true)}
            unreadBugReportsCount={unreadBugReportsCount}
            onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
            onOpenShop={() => setIsUpgradeModalOpen(true)}
            selectedDifficulty={selectedDifficulty}
            onChangeDifficulty={setSelectedDifficulty}
            highScore={bestScore}
            coins={coins}
            highScores={highScores}
            gameMode={gameMode}
            onChangeGameMode={setGameMode}
            playerName={playerName}
            onChangePlayerName={setPlayerName}
            roomId={roomId}
            onChangeRoomId={setRoomId}
            onlinePlayerCount={remotePlayers.length + 1}
          />
        ) : (
          <div className="w-full flex flex-col items-center">
            {/* Top HUD */}
            <HUD
              score={score}
              highScore={bestScore}
              length={length}
              lives={lives}
              maxLives={maxPossibleLives}
              combo={combo}
              comboTimeLeftPercent={comboTimeLeftPercent}
              botKillsCount={botKillsCount}
              coins={coins}
              playerRank={playerRank}
              totalSnakes={totalSnakes}
              boostStaminaPercent={boostStaminaPercent}
              isBoosting={isBoosting}
              activePowerUps={activePowerUps}
              liveStandings={liveStandings}
              isPaused={gameState === 'PAUSED'}
              isMuted={isMuted}
              currentTrack={currentTrack}
              onToggleMusic={handleToggleMusic}
              timeFreezeCharges={timeFreezeCharges}
              timeFreezeRemainingMs={timeFreezeRemainingMs}
              timeFreezeCooldownMs={timeFreezeCooldownMs}
              isMultiplayer={gameMode === 'MULTIPLAYER'}
              onActivateTimeFreeze={activateTimeFreeze}
              isTurboUnlocked={isTurboUnlocked}
              onTogglePause={togglePause}
              onToggleMute={toggleMute}
              onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
              onOpenShop={() => setIsUpgradeModalOpen(true)}
              onOpenReportBug={() => setIsBugReportOpen(true)}
              onRestart={restartGame}
              onGoToMenu={goToMenu}
            />

            {/* Game Canvas Board */}
            <div className={`relative w-full max-w-[840px] ${isShaking ? 'animate-screen-shake' : ''}`}>
              <GameBoard
                engineRef={engineRef}
                theme={theme}
                isBoosting={isBoosting}
                onSteerAngle={setSteerAngle}
                onBoostStart={() => setBoosting(true)}
                onBoostEnd={() => setBoosting(false)}
                liveStandings={liveStandings}
                playerRank={playerRank}
                remotePlayers={remotePlayers}
                isMultiplayer={gameMode === 'MULTIPLAYER'}
                chatMessages={chatMessages}
                onSendChatMessage={sendChatMessage}
              />

              {/* Pause Overlay with Go to Menu & Market */}
              {gameState === 'PAUSED' && (
                <PauseOverlay
                  onResume={togglePause}
                  onRestart={restartGame}
                  onGoToMenu={goToMenu}
                  onOpenShop={() => setIsUpgradeModalOpen(true)}
                  currentTrack={currentTrack}
                  onToggleMusic={handleToggleMusic}
                />
              )}
            </div>

            {/* Mobile Touch Virtual Controls (360° Joystick + Turbo Sprint + Time Freeze) */}
            <VirtualDPad
              onSteerAngle={setSteerAngle}
              onBoostStart={() => setBoosting(true)}
              onBoostEnd={() => setBoosting(false)}
              onOpenShop={() => setIsUpgradeModalOpen(true)}
              isBoosting={isBoosting}
              timeFreezeCharges={timeFreezeCharges}
              timeFreezeRemainingMs={timeFreezeRemainingMs}
              timeFreezeCooldownMs={timeFreezeCooldownMs}
              isMultiplayer={gameMode === 'MULTIPLAYER'}
              onActivateTimeFreeze={activateTimeFreeze}
              isTurboUnlocked={isTurboUnlocked}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-2.5 px-4 border-t border-slate-800 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between max-w-4xl mx-auto w-full">
        <span>Mustafa Kemal - Yılan Oyunu &copy; {new Date().getFullYear()}</span>
        <div className="flex items-center gap-3 mt-1 sm:mt-0 text-[11px]">
          <span>Müzik: {music.getTrackInfo().label}</span>
          <span>·</span>
          <span>U: Market</span>
          <span>·</span>
          <span>G / T: Zaman Durdur (10s)</span>
          <span>·</span>
          <span className="text-emerald-400 font-mono">120 FPS</span>
        </div>
      </footer>

      {/* Game Over Modal with Go to Menu & Market */}
      <GameOverModal
        isOpen={gameState === 'GAME_OVER'}
        score={score}
        highScore={bestScore}
        length={length}
        foodCount={0}
        durationSeconds={durationSeconds}
        difficulty={difficulty}
        isNewRecord={isNewRecord}
        onSaveScore={submitHighScore}
        onPlayAgain={restartGame}
        onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
        onOpenShop={() => setIsUpgradeModalOpen(true)}
        onGoToMenu={goToMenu}
      />

      {/* High Score Leaderboard Modal */}
      <LeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
        scores={highScores}
        onResetScores={handleResetScores}
      />

      {/* Siber Market & Mağaza Modal (Zaman Durdurma, Kalıcı Güçler, Kostümler) */}
      <UpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        coins={coins}
        upgrades={upgrades}
        onBuyUpgrade={buyUpgrade}
        timeFreezeCharges={timeFreezeCharges}
        onBuyTimeFreeze={buyTimeFreeze}
        selectedSkin={selectedSkin}
        unlockedSkins={unlockedSkins}
        onBuySkin={buySkin}
        onEquipSkin={equipSkin}
        hasMegaLahmacun={hasMegaLahmacun}
        hasMagnetVortex={hasMagnetVortex}
        hasCyberShield={hasCyberShield}
        hasCloning={hasCloning}
        hasMythicHearts={hasMythicHearts}
        hasLegendaryTurbo={hasLegendaryTurbo}
        rotationTimeLeftMs={rotationTimeLeftMs}
        currentRotationCycle={currentRotationCycle}
        onBuyTacticalItem={buyTacticalItem}
        activeLoadout={activeLoadout}
        onToggleEquipPower={toggleEquipPower}
      />

      {/* Küçük Köşe Envanteri (5 Aktif Güç Yuvası & Sonsuz Depolama) */}
      <CornerInventory
        inventory={inventory}
        activeLoadout={activeLoadout}
        onEquipPower={equipPower}
        onUnequipPower={unequipPower}
        onToggleEquipPower={toggleEquipPower}
        onOpenShop={() => setIsUpgradeModalOpen(true)}
        onActivateTimeFreeze={activateTimeFreeze}
        isMultiplayer={gameMode === 'MULTIPLAYER'}
      />

      {/* Sol Köşe: Dakikalık Hediyeler & Oynama Süresi Ödülleri (Ana menüde de akar & 24 saatte bir yenilenir) */}
      <PlaytimeRewardsWidget
        totalPlaytimeSeconds={totalPlaytimeSeconds}
        claimedRewards={claimedRewards}
        onClaimReward={claimPlaytimeReward}
        lastDailyResetTime={lastDailyResetTime}
      />

      {/* Settings Modal (Siyah/Beyaz Tema, 20 Müzik, Rastgele, SFX, 120 FPS) */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        currentTrack={currentTrack}
        onSelectTrack={handleSelectTrack}
        onRandomTrack={handleRandomTrack}
        musicVolume={musicVolume}
        onVolumeChange={handleVolumeChange}
        isMuted={isMuted}
        onToggleMute={toggleMute}
        fps={currentFps}
      />

      {/* Siber Arena Oyun Kuralları Modalı (Hack Yasak, Bug Bildir, Saygılı Konuş, Başlama Onayı) */}
      <GameRulesModal
        isOpen={isRulesModalOpen}
        onClose={() => {
          setIsRulesModalOpen(false);
          setPendingStartArgs(null);
        }}
        onAcceptAndStart={handleAcceptRulesAndStart}
        isStartingGame={Boolean(pendingStartArgs)}
      />

      {/* Hata Bildir Modalı (Direkt mustifotinoa@gmail.com) */}
      <BugReportModal
        isOpen={isBugReportOpen}
        onClose={() => {
          setIsBugReportOpen(false);
          bugReportsService.getReports().then((d) => setUnreadBugReportsCount(d.unreadCount));
        }}
        playerName={playerName}
        gameMode={gameMode}
        onOpenInbox={() => setIsDeveloperInboxOpen(true)}
      />

      {/* Geliştirici Özel Posta Kutusu (mustifotinoa@gmail.com) */}
      <DeveloperInboxModal
        isOpen={isDeveloperInboxOpen}
        onClose={() => {
          setIsDeveloperInboxOpen(false);
          bugReportsService.getReports().then((d) => setUnreadBugReportsCount(d.unreadCount));
        }}
        onOpenReportBug={() => setIsBugReportOpen(true)}
      />

      {/* Rules & Help Modal */}
      {isHelpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 text-left text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="font-bold text-base text-cyan-300">Mustafa Kemal - Oyun Mekanikleri</h3>
              <button
                onClick={() => setIsHelpOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                <strong className="text-amber-400 block mb-0.5">🌯 Lahmacun (+5 Uzama & Coin):</strong>
                Yılanı tek seferde 5 boğum uzatır. Her 10 lahmacunda +45 bonus coin kazandırır!
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                <strong className="text-lime-400 block mb-0.5">☠ Yeşil Zehir & 💀 Mor Zehir:</strong>
                Yeşil zehirli yiyecekler -0.5 kalp götürür ve etrafında küçük yeşil baloncuklar saçar. Mor zehir ise -1.0 tam kalp götürür!
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                <strong className="text-purple-400 block mb-0.5">⚡ Snake.io Bot Avı:</strong>
                Turbo ile botların önünü kesip size çarpmalarını sağlarsanız botlar patlar ve içlerinden bolca yemek saçılır!
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                <strong className="text-cyan-400 block mb-0.5">📱 Mobil & Bilgisayar Kontrolleri:</strong>
                Telefonda ekrana dokunarak veya joystick ile yön verin, Turbo butonuna basarak hızlanın. Bilgisayarda fare veya WASD/Ok tuşları ve Space ile oynayın.
              </div>
            </div>

            <button
              onClick={() => setIsHelpOpen(false)}
              className="mt-4 w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors"
            >
              Anladım
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
