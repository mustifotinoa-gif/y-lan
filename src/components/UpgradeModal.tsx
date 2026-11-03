import React from 'react';
import { X, Heart, Zap, Shield, Coins, Sparkles, Check, ArrowUpRight } from 'lucide-react';
import { UpgradeLevels } from '../types/game';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  coins: number;
  upgrades: UpgradeLevels;
  onBuyUpgrade: (type: keyof UpgradeLevels) => boolean;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({
  isOpen,
  onClose,
  coins,
  upgrades,
  onBuyUpgrade,
}) => {
  if (!isOpen) return null;

  const UPGRADE_DATA = [
    {
      id: 'healthLevel' as const,
      title: 'Kalp & Can Kapasitesi',
      icon: Heart,
      color: 'text-rose-400',
      borderColor: 'border-rose-500/30',
      bgColor: 'bg-rose-500/10',
      currentLevel: upgrades.healthLevel,
      maxLevel: 3,
      levels: [
        { cost: 45, desc: 'Max Can 3.5 Kalbe çıkar ve +0.5 can yeniler' },
        { cost: 90, desc: 'Max Can 4.0 Kalbe çıkar ve +1.0 can yeniler' },
        { cost: 150, desc: 'Max Can 5.0 Kalbe çıkar ve canları fuller!' },
      ],
    },
    {
      id: 'speedLevel' as const,
      title: 'Hız & Çevik Turbo',
      icon: Zap,
      color: 'text-cyan-400',
      borderColor: 'border-cyan-500/30',
      bgColor: 'bg-cyan-500/10',
      currentLevel: upgrades.speedLevel,
      maxLevel: 3,
      levels: [
        { cost: 35, desc: 'Temel hareket hızı ve tepki süresi +%10 çevikleşir' },
        { cost: 70, desc: 'Ani dönüş hassasiyeti ve hız +%20 artar' },
        { cost: 120, desc: 'Maksimum siber hız +%35 artış' },
      ],
    },
    {
      id: 'agilityLevel' as const,
      title: 'Esneklik & Zehir Direnci',
      icon: Shield,
      color: 'text-lime-400',
      borderColor: 'border-lime-500/30',
      bgColor: 'bg-lime-500/10',
      currentLevel: upgrades.agilityLevel,
      maxLevel: 3,
      levels: [
        { cost: 40, desc: 'Dar alanlarda esnek manevra kabiliyeti kazandırır' },
        { cost: 80, desc: 'Zehir direnci: Yeşil zehir 0.5 yerine sadece 0.25 can götürür!' },
        { cost: 140, desc: 'Yüksek direnç: Mor zehir 1 yerine 0.5 can götürür!' },
      ],
    },
    {
      id: 'coinMasteryLevel' as const,
      title: 'Lahmacun & Coin Bereketi',
      icon: Coins,
      color: 'text-amber-400',
      borderColor: 'border-amber-500/30',
      bgColor: 'bg-amber-500/10',
      currentLevel: upgrades.coinMasteryLevel,
      maxLevel: 2,
      levels: [
        { cost: 50, desc: 'Lahmacun başına +6 Coin (10 Lahmacun = 60 Coin!)' },
        { cost: 100, desc: 'Lahmacun başına +8 Coin ve bot avlarında 2 kat coin!' },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl bg-slate-900 border border-cyan-500/30 rounded-2xl shadow-2xl shadow-cyan-950/60 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Siber Yetenek & Geliştirme Mağazası
              </h2>
              <p className="text-xs text-slate-400">
                Kazandığınız coinler ile can, hız ve esnekliğinizi artırın
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 font-mono font-bold text-xs">
              <Coins className="w-4 h-4 text-amber-400" />
              <span className="tabular-nums">{coins.toLocaleString('tr-TR')}</span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Kapat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Upgrade Cards List */}
        <div className="p-4 sm:p-6 space-y-3.5 overflow-y-auto flex-1">
          {UPGRADE_DATA.map((upg) => {
            const isMax = upg.currentLevel >= upg.maxLevel;
            const nextLevelData = !isMax ? upg.levels[upg.currentLevel] : null;
            const canAfford = nextLevelData ? coins >= nextLevelData.cost : false;
            const Icon = upg.icon;

            return (
              <div
                key={upg.id}
                className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
              >
                {/* Left Info */}
                <div className="flex items-start gap-3 flex-1">
                  <div className={`p-2.5 rounded-xl ${upg.bgColor} border ${upg.borderColor} ${upg.color} shrink-0 mt-0.5 sm:mt-0`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-slate-100">{upg.title}</h3>
                      <div className="flex gap-1">
                        {Array.from({ length: upg.maxLevel }).map((_, i) => (
                          <div
                            key={i}
                            className={`w-2 h-2 rounded-full ${
                              i < upg.currentLevel ? 'bg-cyan-400 shadow-[0_0_6px_rgba(6,182,212,0.8)]' : 'bg-slate-800'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      {isMax
                        ? 'Maksimum seviyeye ulaşıldı!'
                        : nextLevelData?.desc}
                    </p>
                  </div>
                </div>

                {/* Right Action Button */}
                <div className="shrink-0 self-end sm:self-center">
                  {isMax ? (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>Maksimum</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      disabled={!canAfford}
                      onClick={() => onBuyUpgrade(upg.id)}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                        canAfford
                          ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/25 active:scale-95'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                      }`}
                    >
                      <Coins className="w-3.5 h-3.5" />
                      <span>{nextLevelData?.cost} Coin</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400">
          <span>Yemek toplayarak ve bot avlayarak coin biriktirebilirsiniz.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold transition-colors"
          >
            Tamam
          </button>
        </div>
      </div>
    </div>
  );
};
