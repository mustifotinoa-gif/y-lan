import React, { useState } from 'react';
import {
  Gift,
  X,
  Check,
  Lock,
  Sparkles,
  Flame,
  Coins,
  Palette,
  Timer,
  ChevronRight,
  Award,
  RefreshCw,
} from 'lucide-react';
import { PLAYTIME_REWARDS } from '../constants/gameConfig';
import { PlaytimeRewardId } from '../types/game';

interface PlaytimeRewardsWidgetProps {
  totalPlaytimeSeconds: number;
  claimedRewards: string[];
  onClaimReward: (rewardId: PlaytimeRewardId) => boolean;
  lastDailyResetTime?: number;
}

export const PlaytimeRewardsWidget: React.FC<PlaytimeRewardsWidgetProps> = ({
  totalPlaytimeSeconds = 0,
  claimedRewards = [],
  onClaimReward,
  lastDailyResetTime,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Calculate available unclaimed rewards count
  const availableCount = PLAYTIME_REWARDS.filter(
    (r) => totalPlaytimeSeconds >= r.requiredSeconds && !claimedRewards.includes(r.id)
  ).length;

  // 24-Hour Reset Countdown
  const now = Date.now();
  const resetEpoch = (lastDailyResetTime || now) + 24 * 60 * 60 * 1000;
  const timeUntilResetSeconds = Math.max(0, Math.floor((resetEpoch - now) / 1000));

  // Format MM:SS or HH:MM:SS
  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs}s ${mins.toString().padStart(2, '0')}dk`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatCountdown = (diffSeconds: number) => {
    if (diffSeconds <= 0) return 'Hazır!';
    const hrs = Math.floor(diffSeconds / 3600);
    const mins = Math.floor((diffSeconds % 3600) / 60);
    const secs = diffSeconds % 60;
    if (hrs > 0) {
      return `${hrs}s ${mins}dk kaldı`;
    }
    if (mins > 0) {
      return `${mins}dk ${secs}sn kaldı`;
    }
    return `${secs}sn kaldı`;
  };

  // Find next unclaimed milestone for quick status
  const nextMilestone = PLAYTIME_REWARDS.find(
    (r) => !claimedRewards.includes(r.id)
  );

  return (
    <>
      {/* 1. KÖŞE FLOATING TETİKLEYİCİ BUTONU (SOL ALT KÖŞE) */}
      <div className="fixed bottom-3 left-3 sm:bottom-4 sm:left-4 z-30 select-none">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className={`group flex items-center gap-2 p-1.5 sm:p-2 rounded-2xl backdrop-blur-md border transition-all hover:scale-105 active:scale-95 shadow-xl cursor-pointer ${
            availableCount > 0
              ? 'bg-gradient-to-r from-amber-950/90 via-slate-900 to-red-950/90 border-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.45)] ring-1 ring-amber-400/80 animate-pulse'
              : 'bg-slate-950/90 border-slate-800 hover:border-slate-700 shadow-[0_0_15px_rgba(0,0,0,0.5)]'
          }`}
          title="Ana menüde ve oyunda süre durmaksızın devam eder · Her 24 saatte bir hediyeler yenilenir!"
        >
          {/* Glowing Gift Icon */}
          <div
            className={`p-2 rounded-xl flex items-center justify-center text-white shrink-0 ${
              availableCount > 0
                ? 'bg-gradient-to-br from-amber-400 to-rose-500 shadow-md shadow-amber-500/50'
                : 'bg-gradient-to-br from-slate-800 to-slate-900 text-slate-300'
            }`}
          >
            <Gift className={`w-4 h-4 sm:w-5 sm:h-5 ${availableCount > 0 ? 'animate-bounce' : ''}`} />
          </div>

          {/* Text & Timer Info */}
          <div className="text-left pr-1.5">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] sm:text-xs font-black tracking-tight text-white flex items-center gap-1">
                <span>HEDİYELER</span>
                {availableCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 font-black text-[9px] uppercase tracking-wider shadow-sm animate-pulse">
                    {availableCount} HAZIR!
                  </span>
                )}
              </span>
            </div>
            <div className="flex items-center gap-1 text-[10px] font-mono text-slate-400">
              <Timer className="w-3 h-3 text-cyan-400" />
              <span>{formatTime(totalPlaytimeSeconds)}</span>
              <span className="text-[9px] text-emerald-400 font-bold ml-0.5 hidden xs:inline">
                · Menüde Aktif
              </span>
            </div>
          </div>
        </button>
      </div>

      {/* 2. DAKİKALIK HEDİYELER MODALI */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fade-in select-none">
          <div className="relative w-full max-w-3xl bg-slate-900 border-2 border-amber-500/50 rounded-2xl sm:rounded-3xl shadow-[0_0_60px_rgba(245,158,11,0.25)] overflow-hidden flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-slate-800 bg-slate-950/90 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-gradient-to-br from-amber-500 via-rose-500 to-cyan-500 text-white shadow-lg shadow-amber-500/30 shrink-0">
                  <Gift className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
                      DAKİKALIK OYNAMA HEDİYELERİ
                    </h3>
                    {availableCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] uppercase shadow-sm">
                        {availableCount} ALINABİLİR
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 hidden sm:block">
                    Ana menüde ve oyunda geçen her dakika sayılır · Her 24 saatte bir tüm hediyeler baştan yenilenir!
                  </p>
                </div>
              </div>

              {/* Right: 24h Countdown & Close */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 font-mono text-[11px] font-bold shadow-inner">
                  <RefreshCw className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                  <span>24S YENİLENME: {formatTime(timeUntilResetSeconds)}</span>
                </div>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                  aria-label="Kapat"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Continuous Menu Ticking Notice Banner */}
            <div className="px-4 sm:px-6 py-2 bg-slate-950 border-b border-slate-800 text-[11px] text-slate-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1">
              <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Ana menüde beklerken de süre kesintisiz akar ve hediyeler dolar!</span>
              </span>
              <span className="text-amber-400/90 font-mono text-[10px]">
                Her 24 saatte süre sıfırlanıp hediyeler tekrar açılır
              </span>
            </div>

            {/* Total Playtime Progress Bar Banner */}
            <div className="px-4 sm:px-6 py-3 bg-gradient-to-r from-amber-950/40 via-slate-950 to-slate-900 border-b border-slate-800 shrink-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs">
                <Timer className="w-4 h-4 text-cyan-400" />
                <span className="text-slate-300">
                  Bugünkü Süreniz: <strong className="text-cyan-300 font-mono text-sm">{formatTime(totalPlaytimeSeconds)}</strong>
                </span>
              </div>

              {nextMilestone && (
                <div className="text-xs font-mono text-amber-300/90 flex items-center gap-1.5 bg-amber-500/10 px-3 py-1 rounded-xl border border-amber-500/30">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>
                    Sıradaki ({nextMilestone.label}):{' '}
                    <strong>
                      {totalPlaytimeSeconds >= nextMilestone.requiredSeconds
                        ? 'HAZIR!'
                        : formatCountdown(nextMilestone.requiredSeconds - totalPlaytimeSeconds)}
                    </strong>
                  </span>
                </div>
              )}
            </div>

            {/* Modal Body: 6 Rewards Grid */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-3 sm:space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {PLAYTIME_REWARDS.map((reward) => {
                  const isClaimed = claimedRewards.includes(reward.id);
                  const isReady = !isClaimed && totalPlaytimeSeconds >= reward.requiredSeconds;
                  const progressPercent = Math.min(
                    100,
                    Math.round((totalPlaytimeSeconds / reward.requiredSeconds) * 100)
                  );
                  const remainingSec = Math.max(0, reward.requiredSeconds - totalPlaytimeSeconds);

                  return (
                    <div
                      key={reward.id}
                      className={`relative overflow-hidden p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                        isReady
                          ? 'bg-gradient-to-br from-amber-950/50 via-slate-950 to-slate-900 border-amber-400/80 shadow-[0_0_25px_rgba(245,158,11,0.25)] ring-1 ring-amber-400/50'
                          : isClaimed
                          ? 'bg-slate-950/60 border-slate-800/80 opacity-80'
                          : 'bg-slate-950/40 border-slate-800'
                      }`}
                    >
                      {/* Top Row: Milestone Label & Status Badge */}
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-200 font-mono font-bold text-[10px] border border-slate-700">
                          ⏱️ {reward.label}
                        </span>

                        <span
                          className={`px-2 py-0.5 rounded-full font-black text-[10px] ${
                            isClaimed
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : isReady
                              ? 'bg-amber-400 text-slate-950 font-black animate-pulse shadow-sm'
                              : 'bg-slate-800 text-slate-400 border border-slate-700'
                          }`}
                        >
                          {isClaimed ? '✓ ALINDI' : isReady ? '🎁 HEDİYE HAZIR!' : `%${progressPercent}`}
                        </span>
                      </div>

                      {/* Main Reward Info */}
                      <div className="flex items-start gap-3 my-0.5">
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-md ${
                            reward.rewardType === 'SKIN'
                              ? 'bg-gradient-to-br from-zinc-900 via-neutral-900 to-red-600 text-white border border-red-500/60'
                              : reward.rewardType === 'DOUBLE_POINTS_10M'
                              ? 'bg-gradient-to-br from-pink-500 to-rose-600 text-white'
                              : 'bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950'
                          }`}
                        >
                          {reward.rewardType === 'SKIN' ? (
                            <div className="flex items-center justify-center w-full h-full relative">
                              <Palette className="w-5 h-5 text-red-400 animate-pulse" />
                            </div>
                          ) : reward.rewardType === 'DOUBLE_POINTS_10M' ? (
                            <Flame className="w-6 h-6 text-white animate-pulse" />
                          ) : (
                            <Coins className="w-6 h-6 text-slate-950" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <h4 className="text-sm font-black text-white tracking-tight flex items-center gap-1.5 truncate">
                            <span>{reward.title}</span>
                          </h4>
                          <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">
                            {reward.description}
                          </p>

                          {/* Siyah-Kırmızı Çizgi Kostüm Önizleme Rozeti */}
                          {reward.rewardType === 'SKIN' && (
                            <div className="flex items-center gap-1.5 mt-1.5 p-1 rounded-lg bg-black/60 border border-red-500/30 max-w-fit">
                              <div className="w-3.5 h-3.5 rounded-full bg-[#09090b] border border-red-500 shadow-sm" />
                              <div className="w-3 h-3 rounded-full bg-[#ef4444]" />
                              <div className="w-3 h-3 rounded-full bg-[#09090b]" />
                              <div className="w-3 h-3 rounded-full bg-[#ef4444]" />
                              <span className="text-[9px] font-mono font-bold text-red-300 ml-1">
                                Siyah & Kırmızı Şerit
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Progress Bar (if not yet reached) */}
                      {!isClaimed && !isReady && (
                        <div className="w-full space-y-1">
                          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                            <span>İlerleme: %{progressPercent}</span>
                            <span>{formatCountdown(remainingSec)}</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-cyan-400 to-amber-400 transition-all duration-300"
                              style={{ width: `${progressPercent}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Action Button */}
                      <div className="pt-2 border-t border-slate-800/80">
                        {isClaimed ? (
                          <div className="w-full py-2 rounded-xl bg-emerald-500/15 text-emerald-300 font-bold text-xs flex items-center justify-center gap-1.5 border border-emerald-500/30">
                            <Check className="w-4 h-4 text-emerald-400" />
                            <span>Ödül Alındı</span>
                          </div>
                        ) : isReady ? (
                          <button
                            type="button"
                            onClick={() => onClaimReward(reward.id)}
                            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/30 active:scale-95 cursor-pointer animate-pulse"
                          >
                            <Gift className="w-4 h-4" />
                            <span>HEDİYEYİ AL! ({reward.badge})</span>
                          </button>
                        ) : (
                          <div className="w-full py-2 rounded-xl bg-slate-900 text-slate-500 font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-800 cursor-not-allowed">
                            <Lock className="w-3.5 h-3.5" />
                            <span>{formatCountdown(remainingSec)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-4 sm:px-6 py-3 border-t border-slate-800 bg-slate-950/90 flex items-center justify-between text-xs text-slate-400 shrink-0">
              <span className="hidden sm:inline">
                Süreler oyun sırasında otomatik olarak birikir ve sıfırlanmaz.
              </span>
              <span className="sm:hidden text-[11px] font-mono text-amber-300">
                Toplam: {formatTime(totalPlaytimeSeconds)}
              </span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition-colors cursor-pointer"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
