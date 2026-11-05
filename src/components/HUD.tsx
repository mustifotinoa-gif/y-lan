import React, { useState } from 'react';
import {
  Heart,
  Volume2,
  VolumeX,
  Pause,
  Play,
  Trophy,
  RotateCcw,
  Zap,
  Skull,
  Users,
  ChevronDown,
  ChevronUp,
  Home,
  ShoppingBag,
  Hourglass,
  Lock,
} from 'lucide-react';
import { POWER_UP_CONFIG } from '../constants/gameConfig';
import { ActivePowerUp, LiveStandingItem } from '../types/game';

interface HUDProps {
  score: number;
  highScore: number;
  length: number;
  lives: number;
  maxLives: number;
  combo: number;
  comboTimeLeftPercent: number;
  botKillsCount: number;
  coins: number;
  playerRank: number;
  totalSnakes: number;
  boostStaminaPercent: number;
  isBoosting: boolean;
  activePowerUps: ActivePowerUp[];
  liveStandings: LiveStandingItem[];
  isPaused: boolean;
  isMuted: boolean;
  timeFreezeCharges?: number;
  timeFreezeRemainingMs?: number;
  timeFreezeCooldownMs?: number;
  isMultiplayer?: boolean;
  onActivateTimeFreeze?: () => void;
  isTurboUnlocked?: boolean;
  onTogglePause: () => void;
  onToggleMute: () => void;
  onOpenLeaderboard: () => void;
  onOpenShop: () => void;
  onRestart: () => void;
  onGoToMenu: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  score,
  highScore,
  length,
  lives,
  maxLives,
  combo,
  comboTimeLeftPercent,
  botKillsCount,
  coins,
  playerRank,
  totalSnakes,
  boostStaminaPercent,
  isBoosting,
  activePowerUps,
  liveStandings,
  isPaused,
  isMuted,
  timeFreezeCharges = 0,
  timeFreezeRemainingMs = 0,
  timeFreezeCooldownMs = 0,
  isMultiplayer = false,
  onActivateTimeFreeze,
  isTurboUnlocked = false,
  onTogglePause,
  onToggleMute,
  onOpenLeaderboard,
  onOpenShop,
  onRestart,
  onGoToMenu,
}) => {
  const [showStandings, setShowStandings] = useState(false);

  const heartCount = Math.ceil(maxLives);

  return (
    <div className="w-full max-w-[840px] mx-auto mb-2 flex flex-col gap-1.5 select-none">
      {/* Top Metrics Row */}
      <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-800 shadow-xl">
        {/* Lives Display with Half-Heart Support */}
        <div className="flex items-center gap-1.5 shrink-0" title={`Kalan Can: ${lives.toFixed(1)} / ${maxLives}`}>
          <div className="flex items-center gap-0.5 flex-wrap max-w-[150px] sm:max-w-none">
            {Array.from({ length: heartCount }).map((_, index) => {
              const isFull = lives >= index + 1;
              const isHalf = !isFull && lives >= index + 0.5;
              const sizeCls = heartCount > 5 ? 'w-3 h-3 sm:w-4 sm:h-4' : 'w-4 h-4 sm:w-5 sm:h-5';

              return (
                <div key={index} className={`relative ${sizeCls} flex items-center justify-center`}>
                  <Heart className={`${sizeCls} text-slate-800 fill-slate-900/60`} />

                  {isFull && (
                    <Heart className={`absolute inset-0 ${sizeCls} text-rose-500 fill-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.8)] scale-100 transition-transform`} />
                  )}

                  {isHalf && (
                    <div className="absolute inset-0 overflow-hidden w-1.5 sm:w-2">
                      <Heart className={`w-3 h-3 sm:w-4 sm:h-4 text-rose-500 fill-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.8)] max-w-none`} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <span className="font-mono text-xs font-bold text-rose-400 tabular-nums ml-0.5">
            {lives.toFixed(lives % 1 === 0 ? 0 : 1)}
          </span>
        </div>

        {/* Snake.io Rank Badge */}
        <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold">
          <span className="text-[10px] text-cyan-400/70 font-sans">SIRA</span>
          <span>#{playerRank}</span>
          <span className="text-[10px] text-slate-400">/{totalSnakes}</span>
        </div>

        {/* Score & Length */}
        <div className="flex items-center gap-2.5 text-center">
          <div className="flex flex-col">
            <span className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold">Skor</span>
            <span className="font-mono text-lg sm:text-xl font-extrabold tracking-tight text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.4)] tabular-nums">
              {score.toLocaleString('tr-TR')}
            </span>
          </div>

          <div className="hidden xs:flex flex-col text-left border-l border-slate-800 pl-2">
            <span className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold">Kitle</span>
            <span className="font-mono text-xs font-bold text-emerald-400 tabular-nums">
              {length}
            </span>
          </div>

          {combo > 1 && (
            <div className="flex flex-col items-center">
              <span className="text-[9px] uppercase font-bold text-amber-400 animate-pulse">
                x{combo} Kombo
              </span>
              <div className="w-8 h-1 bg-slate-800 rounded-full overflow-hidden mt-0.5">
                <div
                  className="h-full bg-amber-400 transition-all duration-75"
                  style={{ width: `${comboTimeLeftPercent}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Coins */}
        <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold">
          <span>🪙</span>
          <span>{coins.toFixed(0)}</span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Time Freeze Trigger / Status Button (Solo Mode Only) */}
          {!isMultiplayer && (
            <button
              onClick={() => {
                if (timeFreezeRemainingMs <= 0) {
                  if (timeFreezeCharges > 0 && onActivateTimeFreeze) {
                    onActivateTimeFreeze();
                  } else {
                    onOpenShop();
                  }
                }
              }}
              title={
                timeFreezeRemainingMs > 0
                  ? `Zaman Dondu: ${(timeFreezeRemainingMs / 1000).toFixed(1)}s`
                  : timeFreezeCooldownMs > 0
                  ? `⏳ Bekleme Süresi: ${Math.ceil(timeFreezeCooldownMs / 1000)}s sonra hazır!`
                  : timeFreezeCharges > 0
                  ? `Zamanı Dondur (10s) - [G] veya [T] tuşuna basın`
                  : 'Zaman Durdurma Markette! (10.000 Coin)'
              }
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-mono font-bold transition-all active:scale-95 cursor-pointer ${
                timeFreezeRemainingMs > 0
                  ? 'bg-cyan-400 text-slate-950 shadow-[0_0_12px_rgba(34,211,238,0.8)] animate-pulse'
                  : timeFreezeCooldownMs > 0
                  ? 'bg-amber-500/15 text-amber-300 border border-amber-500/40 opacity-90'
                  : timeFreezeCharges > 0
                  ? 'bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-400/60 shadow-[0_0_8px_rgba(6,182,212,0.3)]'
                  : 'bg-slate-800/80 hover:bg-slate-800 text-slate-400 border border-slate-700/60'
              }`}
            >
              <Hourglass className={`w-3.5 h-3.5 ${timeFreezeRemainingMs > 0 ? 'animate-spin text-slate-950' : timeFreezeCooldownMs > 0 ? 'text-amber-400 animate-pulse' : timeFreezeCharges > 0 ? 'text-cyan-400' : 'text-slate-400'}`} />
              {timeFreezeRemainingMs > 0 ? (
                <span className="font-extrabold text-[11px]">{(timeFreezeRemainingMs / 1000).toFixed(1)}s</span>
              ) : timeFreezeCooldownMs > 0 ? (
                <span className="font-bold text-[10px] text-amber-300">{Math.ceil(timeFreezeCooldownMs / 1000)}s</span>
              ) : timeFreezeCharges > 0 ? (
                <span className="text-[11px] text-cyan-300">[G] HAZIR</span>
              ) : (
                <span className="text-[11px]">MARKET</span>
              )}
            </button>
          )}

          {/* Shop Button */}
          <button
            onClick={onOpenShop}
            title="Geliştirme Marketi (U)"
            className="p-1.5 rounded-lg text-amber-400 hover:text-amber-300 hover:bg-amber-500/15 transition-colors border border-amber-500/20"
          >
            <ShoppingBag className="w-4 h-4" />
          </button>

          {/* Pause Button */}
          <button
            onClick={onTogglePause}
            title={isPaused ? 'Devam Et (Space)' : 'Duraklat (Space)'}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            {isPaused ? <Play className="w-4 h-4 text-emerald-400 fill-emerald-400" /> : <Pause className="w-4 h-4" />}
          </button>

          {/* Mute Button */}
          <button
            onClick={onToggleMute}
            title={isMuted ? 'Sesi Aç (M)' : 'Sesi Kapat (M)'}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-slate-300" />}
          </button>

          {/* Leaderboard Button */}
          <button
            onClick={onOpenLeaderboard}
            title="Lider Tablosu"
            className="p-1.5 rounded-lg text-slate-300 hover:text-amber-400 hover:bg-slate-800 transition-colors"
          >
            <Trophy className="w-4 h-4 text-amber-400/90" />
          </button>

          {/* Restart Button */}
          <button
            onClick={onRestart}
            title="Yeniden Başlat (R)"
            className="p-1.5 rounded-lg text-slate-300 hover:text-rose-400 hover:bg-slate-800 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Ana Menüye Gitme Button (User explicit request: menüye gitme olsun) */}
          <button
            onClick={onGoToMenu}
            title="Ana Menüye Dön"
            className="p-1.5 rounded-lg text-slate-300 hover:text-cyan-400 hover:bg-slate-800 transition-colors border border-slate-700/60"
          >
            <Home className="w-4 h-4 text-cyan-400" />
          </button>
        </div>
      </div>

      {/* Turbo Boost & Power-ups Sub-row */}
      <div className="flex items-center justify-between gap-2 px-3 py-1 rounded-lg bg-slate-950/60 border border-slate-800/80 text-[11px]">
        {/* Boost Energy Bar */}
        <div className="flex items-center gap-2 flex-1 max-w-[240px]">
          {isTurboUnlocked ? (
            <>
              <span className={`font-mono text-[10px] font-bold ${isBoosting ? 'text-amber-400 animate-pulse' : 'text-slate-400'}`}>
                ⚡ TURBO (Space)
              </span>
              <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-75 ${
                    isBoosting ? 'bg-gradient-to-r from-amber-400 to-rose-500' : 'bg-cyan-400'
                  }`}
                  style={{ width: `${boostStaminaPercent}%` }}
                />
              </div>
            </>
          ) : (
            <button
              onClick={onOpenShop}
              className="flex items-center gap-1.5 text-[10px] font-bold text-amber-400 hover:text-amber-300 transition-colors cursor-pointer px-2 py-0.5 rounded-lg bg-amber-500/15 border border-amber-500/30 shadow-sm"
              title="Turbo kilitli. Markette Efsanevi Turbo (5.000 Coin) satın alarak açın!"
            >
              <Lock className="w-3 h-3 text-amber-400" />
              <span>Turbo Kilitli (Markette 5.000 🪙)</span>
            </button>
          )}
        </div>

        {/* Bot Kills Badge */}
        {botKillsCount > 0 && (
          <div className="flex items-center gap-1 text-rose-400 font-mono font-bold">
            <Skull className="w-3 h-3" />
            <span>{botKillsCount} Bot İmha</span>
          </div>
        )}

        {/* Active Power-up Badges */}
        <div className="flex items-center gap-1.5">
          {activePowerUps.map((pu) => {
            const cfg = POWER_UP_CONFIG[pu.type];
            return (
              <span
                key={pu.type}
                className="px-1.5 py-0.5 rounded text-[10px] font-bold font-mono border"
                style={{
                  color: cfg.color,
                  borderColor: `${cfg.color}40`,
                  backgroundColor: `${cfg.color}15`,
                }}
              >
                {cfg.label} ({(pu.remainingMs / 1000).toFixed(0)}s)
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
};
