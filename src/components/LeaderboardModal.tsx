import React, { useState } from 'react';
import { Trophy, X, Medal, RotateCcw } from 'lucide-react';
import { Difficulty, HighScoreEntry } from '../types/game';
import { DIFFICULTIES } from '../constants/gameConfig';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  scores: HighScoreEntry[];
  onResetScores: () => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  isOpen,
  onClose,
  scores,
  onResetScores,
}) => {
  const [filterDifficulty, setFilterDifficulty] = useState<'ALL' | Difficulty>('ALL');

  if (!isOpen) return null;

  const filteredScores = filterDifficulty === 'ALL'
    ? scores
    : scores.filter((s) => s.difficulty === filterDifficulty);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}dk ${secs}sn`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl max-h-[90vh] flex flex-col bg-slate-900 border border-cyan-500/30 rounded-2xl shadow-2xl shadow-cyan-950/60 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100 tracking-tight">Siber Şampiyonlar Liderlik Tablosu</h2>
              <p className="text-xs text-slate-400">En yüksek puanlar ve rekor kayıtları</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
            aria-label="Kapat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Difficulty Filter Tabs */}
        <div className="flex items-center gap-1.5 px-6 py-3 bg-slate-950/40 border-b border-slate-800 overflow-x-auto">
          <button
            onClick={() => setFilterDifficulty('ALL')}
            className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              filterDifficulty === 'ALL'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            Tüm Skorlar
          </button>
          {(Object.keys(DIFFICULTIES) as Difficulty[]).map((diff) => (
            <button
              key={diff}
              onClick={() => setFilterDifficulty(diff)}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                filterDifficulty === diff
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {DIFFICULTIES[diff].label}
            </button>
          ))}
        </div>

        {/* Scores Table */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-2">
          {filteredScores.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-sm">
              Bu kategoride henüz kayıtlı skor bulunmuyor.
            </div>
          ) : (
            filteredScores.map((item, idx) => {
              const isTop3 = idx < 3 && filterDifficulty === 'ALL';
              let badgeColor = 'text-slate-400';
              if (idx === 0 && filterDifficulty === 'ALL') badgeColor = 'text-amber-400';
              else if (idx === 1 && filterDifficulty === 'ALL') badgeColor = 'text-slate-300';
              else if (idx === 2 && filterDifficulty === 'ALL') badgeColor = 'text-amber-600';

              return (
                <div
                  key={item.id}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                    idx === 0 && filterDifficulty === 'ALL'
                      ? 'bg-amber-500/10 border-amber-500/30'
                      : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  {/* Rank & Name */}
                  <div className="flex items-center gap-3">
                    <span className={`w-6 text-center font-mono font-bold text-sm ${badgeColor}`}>
                      {isTop3 ? (
                        <Medal className="w-5 h-5 mx-auto" />
                      ) : (
                        `#${idx + 1}`
                      )}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-100 text-sm">{item.playerName}</span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          · {item.difficulty ? DIFFICULTIES[item.difficulty]?.label : 'Normal'}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        <span>{item.length} boğum</span>
                        <span className="mx-1">/</span>
                        <span>{formatDuration(item.durationSeconds || 0)}</span>
                        <span className="mx-1">/</span>
                        <span>{item.date}</span>
                      </div>
                    </div>
                  </div>

                  {/* Score */}
                  <div className="text-right">
                    <span className="font-mono text-base sm:text-lg font-bold text-cyan-400 tabular-nums">
                      {item.score.toLocaleString('tr-TR')}
                    </span>
                    <span className="block text-[10px] uppercase tracking-wider text-slate-400">Puan</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-800 bg-slate-950/70 text-xs">
          <button
            onClick={onResetScores}
            className="flex items-center gap-1.5 text-slate-400 hover:text-rose-400 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Varsayılan Skorlara Dön</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium transition-colors"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
};
