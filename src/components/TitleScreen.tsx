import React, { useState } from 'react';
import {
  Play,
  Trophy,
  Heart,
  Zap,
  Sparkles,
  Compass,
  Coins,
  Skull,
  Crown,
  Flame,
  ArrowRight,
  ShoppingBag,
  Hourglass,
  Users,
  UserCheck,
  Globe,
  Bot,
  Radio,
  Gamepad2,
  ShieldAlert,
  Bug,
  Mail,
} from 'lucide-react';
import { Difficulty, HighScoreEntry, GameMode } from '../types/game';
import { DIFFICULTIES } from '../constants/gameConfig';

interface TitleScreenProps {
  onStartGame: (mode: GameMode, roomId?: string, playerName?: string) => void;
  onOpenLeaderboard: () => void;
  onOpenShop: () => void;
  onOpenRules?: () => void;
  onOpenReportBug?: () => void;
  onOpenInbox?: () => void;
  unreadBugReportsCount?: number;
  selectedDifficulty: Difficulty;
  onChangeDifficulty: (diff: Difficulty) => void;
  highScore: number;
  coins: number;
  highScores?: HighScoreEntry[];
  gameMode?: GameMode;
  onChangeGameMode?: (mode: GameMode) => void;
  playerName?: string;
  onChangePlayerName?: (name: string) => void;
  roomId?: string;
  onChangeRoomId?: (roomId: string) => void;
  onlinePlayerCount?: number;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  onStartGame,
  onOpenLeaderboard,
  onOpenShop,
  onOpenRules,
  onOpenReportBug,
  onOpenInbox,
  unreadBugReportsCount = 0,
  selectedDifficulty,
  onChangeDifficulty,
  highScore,
  coins,
  highScores = [],
  gameMode = 'MULTIPLAYER',
  onChangeGameMode,
  playerName = 'Mustafa Kemal',
  onChangePlayerName,
  roomId = 'GLOBAL',
  onChangeRoomId,
  onlinePlayerCount = 1,
}) => {
  const [localMode, setLocalMode] = useState<GameMode>(gameMode);
  const [localName, setLocalName] = useState<string>(playerName);
  const [localRoom, setLocalRoom] = useState<string>(roomId);

  const topRecord = highScores.length > 0 ? highScores[0] : null;
  const topScoresList = highScores.slice(0, 5);

  const handleModeChange = (mode: GameMode) => {
    setLocalMode(mode);
    if (onChangeGameMode) onChangeGameMode(mode);
  };

  const handleNameChange = (val: string) => {
    setLocalName(val);
    if (onChangePlayerName) onChangePlayerName(val);
  };

  const handleRoomChange = (val: string) => {
    setLocalRoom(val);
    if (onChangeRoomId) onChangeRoomId(val);
  };

  const handleStart = () => {
    onStartGame(localMode, localRoom, localName);
  };

  return (
    <div className="w-full flex flex-col items-center p-2 sm:p-5 md:p-6 animate-fade-in select-none max-w-6xl mx-auto">
      {/* Mobile-Only High Score Banner */}
      <div className="w-full lg:hidden mb-4 p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/20 via-slate-900 to-slate-900 border-2 border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.2)] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 shadow-md">
            <Trophy className="w-6 h-6 fill-slate-950" />
          </div>
          <div className="text-left">
            <div className="text-[10px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1">
              <Crown className="w-3 h-3 text-amber-300" />
              <span>EN YÜKSEK SKOR</span>
            </div>
            <div className="text-2xl font-black text-white font-mono leading-none drop-shadow">
              {highScore.toLocaleString('tr-TR')}
              <span className="text-xs font-bold text-amber-400 ml-1">PUAN</span>
            </div>
          </div>
        </div>
        <button
          onClick={onOpenLeaderboard}
          className="px-3 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition-all active:scale-95 cursor-pointer"
        >
          Sıralama 🏆
        </button>
      </div>

      {/* Main 2-Column Wide Grid Layout */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (7 of 12 cols): Title, Mode Switcher, Config, Start */}
        <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left">
          {/* Top Status Badges */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5 mb-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Snake.io Arenası · 120 FPS</span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold font-mono">
              <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>Gerçek İnsanlar & Online Sunucu</span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold font-mono">
              <Coins className="w-3.5 h-3.5 text-amber-400" />
              <span>{coins.toLocaleString('tr-TR')} Coin</span>
            </div>
          </div>

          {/* User Requested Exact Title & Subtitle */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white mb-1 drop-shadow-[0_0_25px_rgba(34,211,238,0.3)]">
            MUSTAFA KEMAL
          </h1>
          <div className="text-lg sm:text-2xl font-extrabold uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-emerald-400 to-amber-300 mb-3 drop-shadow-[0_0_12px_rgba(16,185,129,0.4)]">
            Yılan Oyunu
          </div>

          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mb-4 leading-relaxed">
            Snake.io tarzı 360° serbest yönlendirme, gerçek zamanlı çok oyunculu sunucu, Lahmacun (+5 uzama & coin), zehirli baloncuklar, zaman dondurma ve canlı arena kapışmaları!
          </p>

          {/* OYUN MODU SEÇİMİ (GERÇEK OYUNCULAR vs TEK OYUNCULU) */}
          <div className="w-full mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Gamepad2 className="w-4 h-4 text-cyan-400" />
                <span>Oyun Modunu Seçin:</span>
              </span>
              <span className="text-[11px] text-cyan-400 font-mono font-bold">
                {localMode === 'MULTIPLAYER' ? '🌐 Gerçek Oyuncular Aktif' : '🤖 Çevrimdışı Bot Arenası'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Option 1: Canlı Çok Oyunculu (Gerçek İnsanlar) */}
              <button
                type="button"
                onClick={() => handleModeChange('MULTIPLAYER')}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                  localMode === 'MULTIPLAYER'
                    ? 'bg-gradient-to-br from-emerald-950/70 via-slate-900 to-slate-950 border-emerald-400 text-white shadow-[0_0_25px_rgba(16,185,129,0.3)] ring-1 ring-emerald-400'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400">
                      <Globe className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-white">Çok Oyunculu</h3>
                      <p className="text-[10px] text-emerald-300 font-mono font-semibold">Sıfır Bot · Yalnızca Gerçek İnsanlar</p>
                    </div>
                  </div>
                  <span className="flex h-2.5 w-2.5 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-2 leading-snug">
                  Bot olmadan yalnızca gerçek insan oyuncularla aynı arenada yarışın, kapışın ve sohbet edin.
                </p>
              </button>

              {/* Option 2: Tek Oyunculu & Botlar */}
              <button
                type="button"
                onClick={() => handleModeChange('SOLO')}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                  localMode === 'SOLO'
                    ? 'bg-gradient-to-br from-cyan-950/70 via-slate-900 to-slate-950 border-cyan-400 text-white shadow-[0_0_25px_rgba(6,182,212,0.3)] ring-1 ring-cyan-400'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-white">Tek Oyunculu</h3>
                      <p className="text-[10px] text-cyan-300 font-mono font-semibold">Akıllı Bot Arenası</p>
                    </div>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 mt-2 leading-snug">
                  8 kademeli yapay zeka seviyeleriyle antrenman yapın ve yüksek skor rekoru kırın.
                </p>
              </button>
            </div>
          </div>

          {/* MULTIPLAYER ROOM & NAME SETTINGS (When Multiplayer mode active) */}
          {localMode === 'MULTIPLAYER' && (
            <div className="w-full p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-950 border border-emerald-500/40 mb-4 text-left">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
                <span className="text-xs font-bold uppercase text-emerald-300 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-emerald-400" />
                  <span>Çok Oyunculu Oda Ayarları</span>
                </span>
                <span className="text-[11px] font-mono text-emerald-400 font-bold bg-emerald-500/15 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                  🟢 Sunucu Hazır (Port 3000)
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                    Oyuncu Takma Adınız:
                  </label>
                  <input
                    type="text"
                    maxLength={16}
                    value={localName}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="Mustafa Kemal"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 focus:border-emerald-400 text-white font-mono text-xs outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                    Arena Oda Kodu:
                  </label>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      maxLength={12}
                      value={localRoom}
                      onChange={(e) => handleRoomChange(e.target.value.toUpperCase())}
                      placeholder="GLOBAL"
                      className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 focus:border-emerald-400 text-white font-mono text-xs uppercase outline-none transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => handleRoomChange('GLOBAL')}
                      className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-[10px] font-mono text-slate-300 font-bold border border-slate-700"
                    >
                      Genel
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-2.5 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Diğer arkadaşlarınızla aynı oda kodunu girerek aynı arenada kapışabilirsiniz!</span>
              </div>
            </div>
          )}

          {/* 8 DIFFICULTY LEVELS SELECTOR (For Solo mode or offline bots) */}
          <div className="w-full mb-4 text-left">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <span>Zorluk Seviyesi (8 Kademe):</span>
              </span>
              <span className="text-[10px] sm:text-[11px] text-cyan-400 font-mono font-bold">
                🧠 Zorluk arttıkça botlar daha akıllı manevra yapar!
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(Object.keys(DIFFICULTIES) as Difficulty[]).map((diff) => {
                const cfg = DIFFICULTIES[diff];
                const isSelected = selectedDifficulty === diff;
                return (
                  <button
                    key={diff}
                    type="button"
                    onClick={() => onChangeDifficulty(diff)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-cyan-500/15 border-cyan-400 text-white shadow-[0_0_12px_rgba(6,182,212,0.3)] ring-1 ring-cyan-400'
                        : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs">{cfg.label}</span>
                      <span className="font-mono text-[10px] text-cyan-400 font-bold">x{cfg.scoreMultiplier}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-1 font-mono">
                      <span>{cfg.botCount} Bot</span>
                      <span>·</span>
                      <span className="text-rose-400">%{Math.round(cfg.poisonRate * 100)} Zehir</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Active AI Intelligence Banner (Solo) vs Zero Bot Alert (Multiplayer) */}
            <div className="mt-2 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] flex items-center justify-between">
              {localMode === 'MULTIPLAYER' ? (
                <>
                  <span className="text-emerald-400 font-semibold">🛡️ Çok Oyunculu Kuralı:</span>
                  <span className="text-emerald-300 font-bold font-mono">
                    Sıfır Bot · Adil PvP (Zaman Durdurma Kapalı)
                  </span>
                </>
              ) : (
                <>
                  <span className="text-slate-400">Aktif Bot Zekası:</span>
                  <span className="text-cyan-300 font-bold font-mono">
                    🧠 {DIFFICULTIES[selectedDifficulty].aiIntelligenceLabel}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Action Buttons: Start Game & Cyber Market */}
          <div className="w-full flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleStart}
              className={`flex-1 py-4 px-6 rounded-2xl font-black text-sm uppercase tracking-wider shadow-lg transition-all flex items-center justify-center gap-2.5 active:scale-[0.99] cursor-pointer ${
                localMode === 'MULTIPLAYER'
                  ? 'bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 text-slate-950 shadow-emerald-500/30'
                  : 'bg-gradient-to-r from-cyan-500 via-emerald-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 shadow-cyan-500/25'
              }`}
            >
              <Play className="w-5 h-5 fill-slate-950" />
              <span>
                {localMode === 'MULTIPLAYER'
                  ? '🌐 Gerçek Oyuncularla Arenaya Gir'
                  : '🎮 Tek Oyunculu Arenaya Gir'}
              </span>
            </button>

            <button
              onClick={onOpenShop}
              className="py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-sm uppercase tracking-wider shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2 active:scale-[0.99] cursor-pointer"
            >
              <ShoppingBag className="w-5 h-5 fill-slate-950" />
              <span>🛒 Siber Market (Zamanı Dondur)</span>
            </button>
          </div>

          {/* Controls Info Footer & Rules Button */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 mt-3.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-1">
                <Compass className="w-3.5 h-3.5 text-cyan-400" />
                <span>Fare / Dokunmatik / Joystick</span>
              </span>
              <span>·</span>
              <span>Space / Dokun: Turbo</span>
              <span>·</span>
              <span>G: Zaman Durdur</span>
              <span>·</span>
              <span>U: Market</span>
              <span>·</span>
              <span>N: Müzik Kapat</span>
            </div>

            <div className="flex flex-wrap items-center gap-2 ml-auto">
              {onOpenReportBug && (
                <button
                  type="button"
                  onClick={onOpenReportBug}
                  className="px-2.5 py-1 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 hover:text-amber-200 text-[11px] font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Bug className="w-3.5 h-3.5 text-amber-400" />
                  <span>🐛 Hata Bildir</span>
                </button>
              )}

              {onOpenInbox && (
                <button
                  type="button"
                  onClick={onOpenInbox}
                  className="relative px-2.5 py-1 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-300 hover:text-cyan-200 text-[11px] font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Mail className="w-3.5 h-3.5 text-cyan-400" />
                  <span>📬 Posta Kutusu</span>
                  {unreadBugReportsCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white font-mono text-[9px] font-black animate-pulse">
                      {unreadBugReportsCount}
                    </span>
                  )}
                </button>
              )}

              {onOpenRules && (
                <button
                  type="button"
                  onClick={onOpenRules}
                  className="px-3 py-1 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-500/50 hover:border-red-400 text-red-300 hover:text-white text-[11px] font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                  <span>📜 Oyun Kuralları</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Column (Side Panel - 5 of 12 cols): High Score, Market Highlight, Tactics */}
        <div className="lg:col-span-5 flex flex-col gap-4 w-full">
          {/* Main En Yüksek Skor Hero Showcase Card */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-amber-500/15 via-slate-900/95 to-slate-950 border-2 border-amber-500/40 p-5 sm:p-6 shadow-[0_0_35px_rgba(245,158,11,0.2)] text-left">
            {/* Ambient Background Glow */}
            <div className="absolute -top-12 -right-12 w-36 h-36 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />

            {/* Header Badge */}
            <div className="flex items-center justify-between mb-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[11px] font-black uppercase tracking-wider">
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                <span>EN YÜKSEK SKOR</span>
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Kişisel Rekor
              </span>
            </div>

            {/* Huge High Score Display */}
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-4xl sm:text-5xl font-black font-mono text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-500 drop-shadow-[0_0_20px_rgba(251,191,36,0.4)]">
                {highScore.toLocaleString('tr-TR')}
              </span>
              <span className="text-sm font-extrabold text-amber-400/90 tracking-wider">
                PUAN
              </span>
            </div>

            {/* Top Scorer Details if available */}
            {topRecord && (
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 mb-3.5 text-xs">
                <div className="flex items-center justify-between text-slate-300 mb-1">
                  <span className="font-bold flex items-center gap-1 text-amber-300">
                    <Trophy className="w-3.5 h-3.5" />
                    {topRecord.playerName}
                  </span>
                  <span className="font-mono text-[10px] text-slate-500">{topRecord.date}</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>Uzunluk: <strong className="text-cyan-400">{topRecord.length}</strong></span>
                  <span>Süre: <strong className="text-slate-200">{Math.floor(topRecord.durationSeconds / 60)}d {topRecord.durationSeconds % 60}s</strong></span>
                  <span className="text-emerald-400 font-bold">{DIFFICULTIES[topRecord.difficulty]?.label || topRecord.difficulty}</span>
                </div>
              </div>
            )}

            {/* Hall of Fame / Top 5 List */}
            <div className="space-y-1.5 mb-4">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center justify-between px-1">
                <span>Salonun En İyileri (Top 5)</span>
                <span className="text-amber-400 font-mono text-[10px]">Puan</span>
              </div>

              {topScoresList.map((entry, index) => {
                const isFirst = index === 0;
                return (
                  <div
                    key={entry.id || index}
                    className={`flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-mono transition-colors ${
                      isFirst
                        ? 'bg-amber-500/10 border border-amber-500/30 text-amber-200'
                        : 'bg-slate-900/60 border border-slate-800/60 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-4 text-center font-bold ${isFirst ? 'text-amber-400' : 'text-slate-500'}`}>
                        {index + 1}.
                      </span>
                      <span className="truncate max-w-[120px] font-sans font-medium">
                        {entry.playerName}
                      </span>
                    </div>
                    <span className="font-bold text-amber-400 tabular-nums">
                      {entry.score.toLocaleString('tr-TR')}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Full Leaderboard Button */}
            <button
              onClick={onOpenLeaderboard}
              className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-amber-500/30 hover:border-amber-500/60 text-amber-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-98 cursor-pointer"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>Tüm Liderlik Tablosunu Gör</span>
              <ArrowRight className="w-3.5 h-3.5 text-amber-400 ml-1" />
            </button>
          </div>

          {/* Quick Market Showcase Card featuring 10s Time Freeze for 10.000 Coins */}
          <div
            onClick={onOpenShop}
            className="p-4 rounded-3xl bg-gradient-to-r from-cyan-950/70 via-slate-900 to-slate-900 border-2 border-cyan-500/40 hover:border-cyan-400 text-left cursor-pointer transition-all hover:scale-[1.01] shadow-lg group"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-black uppercase text-cyan-300 flex items-center gap-1.5">
                <Hourglass className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                <span>Markette Efsanevi Güç</span>
              </span>
              <span className="text-[10px] font-mono font-bold text-amber-300 bg-amber-500/15 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                10.000 Coin
              </span>
            </div>
            <div className="text-xs font-black text-white group-hover:text-cyan-300 transition-colors flex items-center justify-between">
              <span>⏳ 10 Saniye Zaman Durdurma & Kostümler</span>
              <ArrowRight className="w-4 h-4 text-cyan-400 group-hover:translate-x-1 transition-transform shrink-0 ml-2" />
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5 leading-snug">
              Arenadaki botları buz kütlesine çevirip parçalayarak devasa yemek toplayın.
            </p>
          </div>

          {/* Pro Tips / High Score Tactics Card */}
          <div className="p-4 rounded-3xl bg-slate-900/70 border border-slate-800/80 text-left text-xs">
            <div className="flex items-center gap-1.5 font-bold text-slate-200 text-xs mb-2.5">
              <Flame className="w-4 h-4 text-orange-400" />
              <span>Rekor Kırma & Canlı Savaş Taktikleri</span>
            </div>
            <ul className="space-y-2 text-[11px] text-slate-400">
              <li className="flex items-start gap-2">
                <span className="text-amber-400 font-bold">🌯</span>
                <span><strong>Lahmacunları Topla:</strong> Her biri +5 boy uzatır, 10 tanede +45 ekstra coin verir.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">👤</span>
                <span><strong>Gerçek Oyuncular:</strong> Arenada üstünde 👤 simgesi olan yılanlar gerçek insanlardır!</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 font-bold">⚡</span>
                <span><strong>Ön Kesme:</strong> Turbo ile rakiplerin önünü kes, sana çarptıklarında patlarlar!</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-400 font-bold">☠</span>
                <span><strong>Zehirden Kaçın:</strong> Yeşil zehir -0.5, mor zehir -1 tam kalp götürür.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
