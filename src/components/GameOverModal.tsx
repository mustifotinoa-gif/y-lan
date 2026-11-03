import React, { useState } from 'react';
import { Trophy, RotateCcw, Award, CheckCircle2, ArrowRight, Home } from 'lucide-react';
import { Difficulty } from '../types/game';

interface GameOverModalProps {
  isOpen: boolean;
  score: number;
  highScore: number;
  length: number;
  foodCount: number;
  durationSeconds: number;
  difficulty: Difficulty;
  isNewRecord: boolean;
  onSaveScore: (playerName: string) => void;
  onPlayAgain: () => void;
  onOpenLeaderboard: () => void;
  onGoToMenu: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  isOpen,
  score,
  highScore,
  length,
  durationSeconds,
  isNewRecord,
  onSaveScore,
  onPlayAgain,
  onOpenLeaderboard,
  onGoToMenu,
}) => {
  const [playerName, setPlayerName] = useState('');
  const [hasSaved, setHasSaved] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim()) return;
    onSaveScore(playerName.trim());
    setHasSaved(true);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}dk ${secs}sn`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-rose-500/40 rounded-2xl shadow-2xl shadow-rose-950/60 overflow-hidden text-center p-6 sm:p-8">
        {/* Neon Game Over Header */}
        <div className="inline-flex p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-500 mb-3">
          <Trophy className="w-8 h-8" />
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-1">
          Oyun Sona Erdi
        </h2>
        <p className="text-xs text-slate-400 mb-5">Can haklarınız tükendi veya arenada elendiniz</p>

        {isNewRecord && (
          <div className="mb-5 py-2 px-3 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-semibold flex items-center justify-center gap-2 animate-bounce">
            <Award className="w-4 h-4 text-amber-400" />
            <span>Tebrikler! Yeni Kişisel Rekor Kırdınız!</span>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6 text-left">
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="text-[11px] text-slate-400 uppercase tracking-wider block font-medium">Toplam Skor</span>
            <span className="font-mono text-2xl font-bold text-cyan-400 tabular-nums">
              {score.toLocaleString('tr-TR')}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="text-[11px] text-slate-400 uppercase tracking-wider block font-medium">En Yüksek</span>
            <span className="font-mono text-2xl font-bold text-slate-200 tabular-nums">
              {Math.max(score, highScore).toLocaleString('tr-TR')}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="text-[11px] text-slate-400 uppercase tracking-wider block font-medium">Yılan Uzunluğu</span>
            <span className="font-mono text-lg font-semibold text-emerald-400 tabular-nums">
              {length} kitle
            </span>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="text-[11px] text-slate-400 uppercase tracking-wider block font-medium">Hayatta Kalma</span>
            <span className="font-mono text-lg font-semibold text-amber-400 tabular-nums">
              {formatDuration(durationSeconds)}
            </span>
          </div>
        </div>

        {/* Name Input Form for High Score */}
        {!hasSaved ? (
          <form onSubmit={handleSubmit} className="mb-6 text-left">
            <label htmlFor="player-name-input" className="block text-xs font-medium text-slate-300 mb-1.5">
              Skorunu Liderlik Tablosuna Kaydet:
            </label>
            <div className="flex gap-2">
              <input
                id="player-name-input"
                type="text"
                maxLength={16}
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Takma Adınız (Örn: SiberAvcı)"
                className="flex-1 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
              />
              <button
                type="submit"
                disabled={!playerName.trim()}
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-1 shrink-0"
              >
                <span>Kaydet</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        ) : (
          <div className="mb-6 py-2 px-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Skorunuz Liderlik Tablosuna Eklendi!</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-2.5">
          <button
            onClick={onPlayAgain}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-bold text-sm uppercase tracking-wider shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center gap-2 active:scale-[0.99]"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Tekrar Oyna</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onOpenLeaderboard}
              className="py-2.5 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 font-medium text-xs transition-colors flex items-center justify-center gap-1.5 border border-slate-700/60"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>Lider Tablosu</span>
            </button>

            <button
              onClick={onGoToMenu}
              className="py-2.5 px-3 rounded-xl bg-slate-800/50 hover:bg-slate-800 text-slate-300 font-medium text-xs transition-colors flex items-center justify-center gap-1.5 border border-slate-700/60"
            >
              <Home className="w-3.5 h-3.5 text-cyan-400" />
              <span>Ana Menü</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
