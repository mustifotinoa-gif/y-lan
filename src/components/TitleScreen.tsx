import React from 'react';
import { Play, Trophy, Heart, Zap, Sparkles, Compass, Coins, Skull } from 'lucide-react';
import { Difficulty } from '../types/game';
import { DIFFICULTIES } from '../constants/gameConfig';

interface TitleScreenProps {
  onStartGame: () => void;
  onOpenLeaderboard: () => void;
  selectedDifficulty: Difficulty;
  onChangeDifficulty: (diff: Difficulty) => void;
  highScore: number;
  coins: number;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  onStartGame,
  onOpenLeaderboard,
  selectedDifficulty,
  onChangeDifficulty,
  highScore,
  coins,
}) => {
  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center text-center p-4 sm:p-6 animate-fade-in select-none">
      {/* Top Badges */}
      <div className="flex items-center gap-2.5 mb-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold tracking-wider uppercase">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Snake.io Arenası · 120 FPS</span>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold font-mono">
          <Coins className="w-3.5 h-3.5 text-amber-400" />
          <span>{coins.toLocaleString('tr-TR')} Coin</span>
        </div>
      </div>

      {/* Main Title & Subtitle Requested by User:
          "oyunun adı Mustafa kemal mustafa kemalin altınada yılan oyunu yazsın" */}
      <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-white mb-1 drop-shadow-[0_0_25px_rgba(34,211,238,0.3)]">
        MUSTAFA KEMAL
      </h1>
      <div className="text-base sm:text-lg font-extrabold uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400 mb-4 drop-shadow-[0_0_10px_rgba(16,185,129,0.4)]">
        Yılan Oyunu
      </div>

      <p className="text-xs sm:text-sm text-slate-400 max-w-lg mb-5">
        Snake.io tarzı akıcı 360° hareket, fare/dokunmatik yönlendirme, Turbo Hızlanma, Lahmacun (+5 uzama & coin), zehirli baloncuklar ve canlı arena liderlik tablosu.
      </p>

      {/* 3 Core Highlights */}
      <div className="grid grid-cols-3 gap-2.5 w-full mb-5">
        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-left">
          <Heart className="w-5 h-5 text-rose-500 mb-1.5" />
          <h4 className="text-xs font-bold text-slate-200">3 Can & Zehir</h4>
          <p className="text-[11px] text-slate-400 mt-0.5">Yeşil -0.5, Mor -1 kalp (baloncuklu)</p>
        </div>
        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-left">
          <Coins className="w-5 h-5 text-amber-400 mb-1.5" />
          <h4 className="text-xs font-bold text-slate-200">Lahmacun & Coin</h4>
          <p className="text-[11px] text-slate-400 mt-0.5">+5 Uzama & 10 Lahmacun = 45 Coin</p>
        </div>
        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-left">
          <Skull className="w-5 h-5 text-purple-400 mb-1.5" />
          <h4 className="text-xs font-bold text-slate-200">Snake.io Bot Avı</h4>
          <p className="text-[11px] text-slate-400 mt-0.5">Botların önünü kes, patlasınlar!</p>
        </div>
      </div>

      {/* 8 Difficulty Levels Selector */}
      <div className="w-full mb-5 text-left">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Zorluk Seviyesi (8 Kademe):
          </span>
          <span className="text-[11px] text-slate-500 font-mono">
            Zorluk arttıkça botlar & zehirler çoğalır
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
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'bg-cyan-500/15 border-cyan-400 text-white shadow-[0_0_12px_rgba(6,182,212,0.3)] ring-1 ring-cyan-400'
                    : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs">{cfg.label}</span>
                  <span className="font-mono text-[10px] text-cyan-400 font-semibold">x{cfg.scoreMultiplier}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-1 font-mono">
                  <span>{cfg.botCount} Bot</span>
                  <span>·</span>
                  <span className="text-rose-400">%{Math.round(cfg.poisonRate * 100)} Zehir</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Power-up & Food Legend */}
      <div className="w-full p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 mb-5 text-left text-xs">
        <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 block mb-2">
          Özel Yiyecek & Zehir Rehberi:
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
          <div className="flex items-center gap-1.5 text-amber-300">
            <span className="text-base">🌯</span>
            <span><strong>Lahmacun:</strong> +5 Uzama & Coin</span>
          </div>
          <div className="flex items-center gap-1.5 text-yellow-300">
            <span className="text-base">⭐</span>
            <span><strong>Altın Elma:</strong> +2 Uzama (+35)</span>
          </div>
          <div className="flex items-center gap-1.5 text-lime-400">
            <span className="text-base">☠</span>
            <span><strong>Yeşil Zehir:</strong> -0.5 Kalp (Baloncuklu)</span>
          </div>
          <div className="flex items-center gap-1.5 text-purple-400">
            <span className="text-base">💀</span>
            <span><strong>Mor Zehir:</strong> -1.0 Tam Kalp</span>
          </div>
          <div className="flex items-center gap-1.5 text-cyan-300">
            <span className="text-base">⚡</span>
            <span><strong>Bot Kalıntısı:</strong> +30 Puan</span>
          </div>
          <div className="flex items-center gap-1.5 text-rose-300">
            <span className="text-base">🧲</span>
            <span><strong>Mıknatıs & 2X:</strong> Siber Güçler</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="w-full flex flex-col sm:flex-row gap-3">
        <button
          onClick={onStartGame}
          className="flex-1 py-3.5 px-6 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-extrabold text-sm uppercase tracking-wider shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center gap-2 active:scale-[0.99]"
        >
          <Play className="w-5 h-5 fill-slate-950" />
          <span>Arenaya Gir</span>
        </button>

        <button
          onClick={onOpenLeaderboard}
          className="py-3.5 px-6 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 font-semibold text-sm transition-colors flex items-center justify-center gap-2"
        >
          <Trophy className="w-4 h-4 text-amber-400" />
          <span>Liderlik Tablosu ({highScore} Puan)</span>
        </button>
      </div>

      {/* Controls Info Footer */}
      <div className="flex items-center justify-center gap-3 text-xs text-slate-500 mt-5">
        <span className="flex items-center gap-1">
          <Compass className="w-3.5 h-3.5" />
          <span>Fare İmleci / Dokunmatik / WASD</span>
        </span>
        <span>·</span>
        <span>Space: Turbo Hızlanma</span>
        <span>·</span>
        <span>U: Market</span>
        <span>·</span>
        <span>Z: Zoom</span>
      </div>
    </div>
  );
};
