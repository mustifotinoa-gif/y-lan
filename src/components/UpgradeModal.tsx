import React, { useState } from 'react';
import {
  X,
  Heart,
  Zap,
  Shield,
  Coins,
  Sparkles,
  Check,
  ArrowUpRight,
  Hourglass,
  Palette,
  ShoppingBag,
  Flame,
  Magnet,
  ShieldCheck,
  Info,
} from 'lucide-react';
import { UpgradeLevels, SnakeSkinId } from '../types/game';
import { SNAKE_SKINS } from '../constants/gameConfig';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  coins: number;
  upgrades: UpgradeLevels;
  onBuyUpgrade: (type: keyof UpgradeLevels) => boolean;
  timeFreezeCharges: number;
  onBuyTimeFreeze: () => boolean;
  selectedSkin?: SnakeSkinId;
  unlockedSkins?: SnakeSkinId[];
  onBuySkin?: (skinId: SnakeSkinId) => boolean;
  onEquipSkin?: (skinId: SnakeSkinId) => void;
  hasMegaLahmacun?: boolean;
  hasMagnetVortex?: boolean;
  hasCyberShield?: boolean;
  onBuyTacticalItem?: (itemId: 'MEGA_LAHMACUN' | 'MAGNET_VORTEX' | 'CYBER_SHIELD') => boolean;
}

type MarketTab = 'powers' | 'upgrades' | 'skins';

export const UpgradeModal: React.FC<UpgradeModalProps> = ({
  isOpen,
  onClose,
  coins,
  upgrades,
  onBuyUpgrade,
  timeFreezeCharges = 0,
  onBuyTimeFreeze,
  selectedSkin = 'SKIN_DEFAULT',
  unlockedSkins = ['SKIN_DEFAULT'],
  onBuySkin,
  onEquipSkin,
  hasMegaLahmacun = false,
  hasMagnetVortex = false,
  hasCyberShield = false,
  onBuyTacticalItem,
}) => {
  const [activeTab, setActiveTab] = useState<MarketTab>('powers');

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

  const skinList = Object.values(SNAKE_SKINS);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-4xl bg-slate-900 border-2 border-cyan-500/40 rounded-2xl sm:rounded-3xl shadow-[0_0_60px_rgba(6,182,212,0.3)] overflow-hidden flex flex-col h-[90vh] max-h-[760px]">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-slate-800 bg-slate-950/90 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-500/20 to-amber-500/20 border border-cyan-500/40 text-cyan-300">
              <ShoppingBag className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                  SİBER MARKET & MAĞAZA
                </h2>
                <span className="hidden xs:inline-block px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-mono font-bold border border-cyan-500/40">
                  v2.0
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Zaman Durdurma, Efsanevi Yetenekler ve Özel Yılan Kostümleri
              </p>
            </div>
          </div>

          {/* Right Header: Coins & Close */}
          <div className="flex items-center gap-2">
            {/* Current Coins Badge */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-300 font-mono font-bold text-xs">
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

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-slate-800 bg-slate-950/50 px-3 sm:px-6 pt-2 gap-2 shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('powers')}
            className={`flex items-center gap-2 pb-2.5 px-3 border-b-2 text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'powers'
                ? 'border-cyan-400 text-cyan-300 shadow-[0_2px_10px_rgba(6,182,212,0.3)]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Hourglass className="w-4 h-4 text-cyan-400" />
            <span>⏳ Efsanevi Güçler (Zaman Durdurma)</span>
          </button>

          <button
            onClick={() => setActiveTab('upgrades')}
            className={`flex items-center gap-2 pb-2.5 px-3 border-b-2 text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'upgrades'
                ? 'border-amber-400 text-amber-300 shadow-[0_2px_10px_rgba(245,158,11,0.3)]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-4 h-4 text-amber-400" />
            <span>⚡ Kalıcı Geliştirmeler</span>
          </button>

          <button
            onClick={() => setActiveTab('skins')}
            className={`flex items-center gap-2 pb-2.5 px-3 border-b-2 text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'skins'
                ? 'border-rose-400 text-rose-300 shadow-[0_2px_10px_rgba(244,63,94,0.3)]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Palette className="w-4 h-4 text-rose-400" />
            <span>🎨 Yılan Kostümleri</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {/* TAB 1: EFSANEVİ GÜÇLER & ZAMAN DURDURMA */}
          {activeTab === 'powers' && (
            <div className="space-y-4">
              {/* FEATURED: ZAMAN DURDURMA (10 SANİYE) - 10.000 COIN */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-950/80 via-slate-900 to-slate-950 border-2 border-cyan-400/70 p-4 sm:p-5 shadow-[0_0_35px_rgba(6,182,212,0.3)]">
                {/* Background Chrono Ring */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-cyan-500/15 rounded-full blur-2xl pointer-events-none" />

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-slate-950 shadow-lg shadow-cyan-500/40 shrink-0">
                      <Hourglass className="w-7 h-7 text-white fill-white animate-pulse" />
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full bg-cyan-400/20 border border-cyan-400/40 text-cyan-300 text-[10px] font-black uppercase tracking-wider">
                          Efsanevi Eşya
                        </span>
                        <span className="text-[10px] text-amber-300 font-mono font-bold bg-amber-500/15 px-2 py-0.5 rounded-full border border-amber-500/30">
                          Süre: 10sn · Bekleme: 150sn
                        </span>
                        <span className="text-[10px] text-emerald-300 font-mono font-bold bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/30">
                          {timeFreezeCharges > 0 ? '✓ Sahipsiniz' : 'Satın Alınabilir'}
                        </span>
                      </div>

                      <h3 className="text-lg sm:text-xl font-black text-white mt-1 tracking-tight">
                        ZAMAN DURDURMA (10 SANİYE)
                      </h3>

                      <p className="text-xs text-slate-300 mt-1 max-w-md leading-relaxed">
                        Arenadaki tüm botları <strong className="text-cyan-300">10 saniye</strong> boyunca kaskatı buz kütlesine çevirir. Donmuş botlar hareket edemez, siz ise üzerlerine sürerek onları tek dokunuşla parçalayabilirsiniz!
                      </p>

                      <div className="flex items-center gap-2 mt-2 text-[11px] text-cyan-400/90 font-mono">
                        <Info className="w-3.5 h-3.5" />
                        <span>Kullanım: Oyun içinde <strong>[G]</strong> tuşuna basın. Kullandıktan sonra <strong>150 saniye</strong> bekleme süresi vardır.</span>
                      </div>
                    </div>
                  </div>

                  {/* Buy Button / Already Purchased Status */}
                  <div className="shrink-0 w-full sm:w-auto flex flex-col items-end gap-1.5">
                    {timeFreezeCharges > 0 ? (
                      <div className="flex flex-col items-end gap-1 w-full sm:w-auto">
                        <button
                          type="button"
                          disabled
                          className="w-full sm:w-auto px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 cursor-default shadow-sm"
                        >
                          <Check className="w-4 h-4 text-emerald-400" />
                          <span>Zaten Satın Aldınız!</span>
                        </button>
                        <span className="text-[10px] text-emerald-400 font-mono text-center sm:text-right w-full font-bold">
                          ✓ Sahipsiniz (Oyun içinde [G] ile kullanın · 150s bekleme)
                        </span>
                      </div>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => onBuyTimeFreeze()}
                          disabled={coins < 10000}
                          className={`w-full sm:w-auto px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-xl cursor-pointer ${
                            coins >= 10000
                              ? 'bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 hover:from-cyan-300 hover:to-teal-300 text-slate-950 shadow-cyan-500/30 active:scale-95'
                              : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-80'
                          }`}
                        >
                          <Coins className="w-4 h-4" />
                          <span>10.000 Coin ile Satın Al</span>
                          <ArrowUpRight className="w-4 h-4" />
                        </button>
                        {coins < 10000 && (
                          <span className="text-[10px] text-amber-400 font-mono text-center sm:text-right w-full">
                            Yetersiz bakiye! Arenada yemek toplayarak ve düşmanları avlayarak 10.000 coin biriktirin.
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Extra Market Consumables / Tactical items */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Mega Lahmacun */}
                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <div className="p-2 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400 shrink-0">
                      <Coins className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-xs text-white">Mega Lahmacun Ziyafeti</h4>
                        {hasMegaLahmacun && (
                          <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[9px] font-mono font-bold">
                            Aktif
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                        Arenada bonus lahmacunlar yaratır ve her yemekte +%15 ekstra uzama kazandırır.
                      </p>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-800/80">
                    {hasMegaLahmacun ? (
                      <div className="w-full py-2 px-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm">
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span>Zaten satın aldınız!</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1 text-xs font-mono font-bold text-amber-300">
                          <Coins className="w-3.5 h-3.5 text-amber-400" />
                          <span>350 Coin</span>
                        </div>
                        <button
                          type="button"
                          disabled={coins < 350}
                          onClick={() => onBuyTacticalItem && onBuyTacticalItem('MEGA_LAHMACUN')}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                            coins >= 350
                              ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-black shadow-md shadow-amber-500/20 active:scale-95'
                              : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                          }`}
                        >
                          <span>Satın Al</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Mıknatıs Girdabı */}
                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <div className="p-2 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-400 shrink-0">
                      <Magnet className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-xs text-white">Mıknatıs Girdabı</h4>
                        {hasMagnetVortex && (
                          <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[9px] font-mono font-bold">
                            Aktif
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                        Kalıcı manyetik çekim alanı: Sahadaki tüm küreleri doğrudan yılanınıza doğru çeker.
                      </p>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-800/80">
                    {hasMagnetVortex ? (
                      <div className="w-full py-2 px-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm">
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span>Zaten satın aldınız!</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1 text-xs font-mono font-bold text-amber-300">
                          <Coins className="w-3.5 h-3.5 text-amber-400" />
                          <span>500 Coin</span>
                        </div>
                        <button
                          type="button"
                          disabled={coins < 500}
                          onClick={() => onBuyTacticalItem && onBuyTacticalItem('MAGNET_VORTEX')}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                            coins >= 500
                              ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-black shadow-md shadow-amber-500/20 active:scale-95'
                              : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                          }`}
                        >
                          <span>Satın Al</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Siber Kalkan */}
                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <div className="p-2 rounded-lg bg-teal-500/15 border border-teal-500/30 text-teal-400 shrink-0">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-xs text-white">Siber Kalkan</h4>
                        {hasCyberShield && (
                          <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[9px] font-mono font-bold">
                            Aktif
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                        Kalıcı koruma zırhı: Zehir hasarlarını %50 soğurur ve canınızı korur.
                      </p>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-800/80">
                    {hasCyberShield ? (
                      <div className="w-full py-2 px-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm">
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span>Zaten satın aldınız!</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1 text-xs font-mono font-bold text-amber-300">
                          <Coins className="w-3.5 h-3.5 text-amber-400" />
                          <span>750 Coin</span>
                        </div>
                        <button
                          type="button"
                          disabled={coins < 750}
                          onClick={() => onBuyTacticalItem && onBuyTacticalItem('CYBER_SHIELD')}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                            coins >= 750
                              ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-black shadow-md shadow-amber-500/20 active:scale-95'
                              : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                          }`}
                        >
                          <span>Satın Al</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: KALICI GELİŞTİRMELER */}
          {activeTab === 'upgrades' && (
            <div className="space-y-3">
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
                                className={`w-2.5 h-2.5 rounded-full ${
                                  i < upg.currentLevel ? 'bg-cyan-400 shadow-[0_0_6px_rgba(6,182,212,0.8)]' : 'bg-slate-800'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                          {isMax ? 'Maksimum seviyeye ulaşıldı!' : nextLevelData?.desc}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 self-end sm:self-center">
                      {isMax ? (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
                          <Check className="w-4 h-4 text-emerald-400" />
                          <span>Zaten satın aldınız!</span>
                        </div>
                      ) : (
                        <button
                          type="button"
                          disabled={!canAfford}
                          onClick={() => onBuyUpgrade(upg.id)}
                          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
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
          )}

          {/* TAB 3: YILAN KOSTÜMLERİ & SKİNLER */}
          {activeTab === 'skins' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {skinList.map((skin) => {
                const isOwned = unlockedSkins.includes(skin.id);
                const isEquipped = selectedSkin === skin.id;
                const canAfford = coins >= skin.price;

                return (
                  <div
                    key={skin.id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                      isEquipped
                        ? 'bg-cyan-950/40 border-cyan-400/80 shadow-[0_0_20px_rgba(6,182,212,0.25)] ring-1 ring-cyan-400'
                        : isOwned
                        ? 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                        : 'bg-slate-950/40 border-slate-800/60 opacity-90'
                    }`}
                  >
                    <div>
                      {/* Top Row: Skin Name & Status */}
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
                          <span>{skin.name}</span>
                        </h4>
                        {isEquipped && (
                          <span className="px-2 py-0.5 rounded-full bg-cyan-400/20 text-cyan-300 font-bold text-[10px] border border-cyan-400/40">
                            Aktif
                          </span>
                        )}
                      </div>

                      {/* Skin Visual Color Preview Bar */}
                      <div className="flex items-center gap-1.5 my-2.5 p-2 rounded-xl bg-slate-900 border border-slate-800">
                        {/* 4 Snake Segment Preview Circles */}
                        <div
                          className="w-5 h-5 rounded-full shadow-md"
                          style={{ backgroundColor: skin.headColor }}
                        />
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: skin.bodyColor1 }}
                        />
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: skin.bodyColor2 }}
                        />
                        <div
                          className="w-4 h-4 rounded-full border border-white/40"
                          style={{ backgroundColor: skin.headColor }}
                        />
                        <span className="text-[10px] text-slate-400 ml-auto font-mono">
                          {skin.name}
                        </span>
                      </div>

                      <p className="text-xs text-slate-400 leading-snug">
                        {skin.description}
                      </p>
                    </div>

                    {/* Action Button */}
                    <div className="pt-2 border-t border-slate-800/80">
                      {isEquipped ? (
                        <div className="w-full py-2 rounded-xl bg-cyan-500/20 text-cyan-300 text-xs font-bold flex items-center justify-center gap-1.5 border border-cyan-500/30 shadow-sm">
                          <Check className="w-4 h-4 text-cyan-400" />
                          <span>Zaten satın aldınız! (Kullanımda)</span>
                        </div>
                      ) : isOwned ? (
                        <div className="flex flex-col gap-1.5 w-full">
                          <div className="w-full py-1.5 rounded-xl bg-emerald-500/15 text-emerald-300 text-xs font-bold flex items-center justify-center gap-1.5 border border-emerald-500/30">
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Zaten satın aldınız!</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => onEquipSkin && onEquipSkin(skin.id)}
                            className="w-full py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all active:scale-95 cursor-pointer border border-slate-700"
                          >
                            Kostümü Kuşan
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          disabled={!canAfford}
                          onClick={() => onBuySkin && onBuySkin(skin.id)}
                          className={`w-full py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                            canAfford
                              ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-black shadow-md shadow-amber-500/25 active:scale-95'
                              : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                          }`}
                        >
                          <Coins className="w-3.5 h-3.5" />
                          <span>{skin.price.toLocaleString('tr-TR')} Coin ile Aç</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 py-3 border-t border-slate-800 bg-slate-950/90 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <span className="hidden sm:inline">
            Zaman durdurmayı tek oyunculuda <strong className="text-cyan-300">[G]</strong> tuşu veya butonla dilediğiniz an açabilirsiniz.
          </span>
          <span className="sm:hidden text-[11px]">
            Zaman Durdurma: 10sn / 150sn Bekleme [G]
          </span>
          <button
            onClick={onClose}
            className="px-5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition-colors cursor-pointer"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
};
