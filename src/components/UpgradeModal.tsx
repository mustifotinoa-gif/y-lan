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
  Magnet,
  ShieldCheck,
  Info,
  Users,
  Flame,
  Award,
  Layers,
  RefreshCw,
  Gift,
} from 'lucide-react';
import { UpgradeLevels, SnakeSkinId, MarketPowerId } from '../types/game';
import { SNAKE_SKINS, MARKET_POWERS, RARITY_CONFIGS } from '../constants/gameConfig';

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
  hasCloning?: boolean;
  hasMythicHearts?: boolean;
  hasLegendaryTurbo?: boolean;
  rotationTimeLeftMs?: number;
  currentRotationCycle?: number;
  onBuyTacticalItem?: (itemId: MarketPowerId) => boolean;
  activeLoadout?: MarketPowerId[];
  onToggleEquipPower?: (id: MarketPowerId) => boolean;
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
  hasCloning = false,
  hasMythicHearts = false,
  hasLegendaryTurbo = false,
  rotationTimeLeftMs = 600000,
  currentRotationCycle = 0,
  onBuyTacticalItem,
  activeLoadout = [],
  onToggleEquipPower,
}) => {
  const [activeTab, setActiveTab] = useState<MarketTab>('powers');
  const [bannerViewMode, setBannerViewMode] = useState<'banner' | 'all'>('banner');

  if (!isOpen) return null;

  const isRotationCycleB = ((currentRotationCycle || 0) % 2 === 1);

  // Format MM:SS for 10-minute rotation
  const formatCountdown = (ms: number) => {
    if (ms <= 0) return '00:00';
    const totalSecs = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSecs / 60);
    const seconds = totalSecs % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

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
      <div className="relative w-full max-w-4xl bg-slate-900 border-2 border-cyan-500/40 rounded-2xl sm:rounded-3xl shadow-[0_0_60px_rgba(6,182,212,0.3)] overflow-hidden flex flex-col h-[92vh] max-h-[780px]">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-slate-800 bg-slate-950/90 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-br from-red-500/20 via-yellow-500/20 to-cyan-500/20 border border-yellow-500/40 text-amber-300">
              <ShoppingBag className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                  SİBER MARKET & NADİRLİK MERKEZİ
                </h2>
                <span className="hidden xs:inline-block px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-[10px] font-mono font-black border border-red-500/40">
                  NADİRLİK AKTİF
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Mitolojik Klonlama (%0.01), Efsanevi Zaman Dondurma (%0.1), Turbo ve Kostümler
              </p>
            </div>
          </div>

          {/* Right Header: Coins & Close */}
          <div className="flex items-center gap-2">
            {/* Current Coins Badge */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-300 font-mono font-bold text-xs shadow-sm">
              <Coins className="w-4 h-4 text-amber-400" />
              <span className="tabular-nums">{coins.toLocaleString('tr-TR')}</span>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
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
                ? 'border-red-500 text-red-400 shadow-[0_2px_10px_rgba(239,68,68,0.3)]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4 text-red-400" />
            <span>🔥 Güçler & Nadirlik Marketi</span>
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
                ? 'border-cyan-400 text-cyan-300 shadow-[0_2px_10px_rgba(6,182,212,0.3)]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Palette className="w-4 h-4 text-cyan-400" />
            <span>🎨 Yılan Kostümleri</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {/* TAB 1: GÜÇLER & NADİRLİK MARKETİ */}
          {activeTab === 'powers' && (
            <div className="space-y-4">
              {/* KÖŞEDEKİ NADİRLİK & YÜZDELİK SEVİYE TABLOSU + 10 DAKİKADA BİR ROTASYON BİLGİSİ */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-700/80 shadow-xl">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 pb-2.5 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                      <Award className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-black text-white tracking-wide">
                        🎲 GÜÇ NADİRLİK SEVİYELERİ & ŞANS ORANLARI
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        10 dakikada bir güçler değişir · Skibidi Tower Defense summon banner rotasyonu
                      </p>
                    </div>
                  </div>

                  {/* 10 Dakika Sayaç Rozeti */}
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-cyan-950/80 border border-cyan-500/50 text-cyan-300 font-mono text-xs font-black shadow-inner">
                    <Hourglass className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                    <span>DÖNGÜ: {formatCountdown(rotationTimeLeftMs)}</span>
                  </div>
                </div>

                {/* 5 Renkli Nadirlik Kartı (Kırmızı, Sarı, Mor, Mavi, Yeşil) */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-2.5">
                  {/* Mitolojik (Kırmızı) */}
                  <div className="p-2.5 rounded-xl bg-red-950/40 border border-red-500/60 shadow-[0_0_15px_rgba(239,68,68,0.2)] flex items-center gap-2">
                    <div className="w-3.5 h-3.5 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,1)] shrink-0 animate-pulse" />
                    <div className="min-w-0">
                      <span className="text-[11px] font-black text-red-400 block leading-tight truncate">
                        Mitolojik (Kırmızı)
                      </span>
                      <span className="text-[10px] text-red-200 font-mono font-black">
                        %0.01 Şans
                      </span>
                    </div>
                  </div>

                  {/* Efsanevi (Sarı) */}
                  <div className="p-2.5 rounded-xl bg-yellow-950/40 border border-yellow-400/60 shadow-[0_0_15px_rgba(234,179,8,0.2)] flex items-center gap-2">
                    <div className="w-3.5 h-3.5 rounded-full bg-yellow-400 shadow-[0_0_10px_rgba(234,179,8,1)] shrink-0 animate-pulse" />
                    <div className="min-w-0">
                      <span className="text-[11px] font-black text-yellow-300 block leading-tight truncate">
                        Efsanevi (Sarı)
                      </span>
                      <span className="text-[10px] text-yellow-200 font-mono font-black">
                        %0.1 Şans
                      </span>
                    </div>
                  </div>

                  {/* Epik (Mor) */}
                  <div className="p-2.5 rounded-xl bg-purple-950/40 border border-purple-500/60 shadow-[0_0_15px_rgba(168,85,247,0.2)] flex items-center gap-2">
                    <div className="w-3.5 h-3.5 rounded-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,1)] shrink-0" />
                    <div className="min-w-0">
                      <span className="text-[11px] font-black text-purple-300 block leading-tight truncate">
                        Epik (Mor)
                      </span>
                      <span className="text-[10px] text-purple-200 font-mono font-black">
                        %30.0 Şans
                      </span>
                    </div>
                  </div>

                  {/* Nadir (Mavi) */}
                  <div className="p-2.5 rounded-xl bg-blue-950/40 border border-blue-500/60 shadow-[0_0_15px_rgba(59,130,246,0.2)] flex items-center gap-2">
                    <div className="w-3.5 h-3.5 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,1)] shrink-0" />
                    <div className="min-w-0">
                      <span className="text-[11px] font-black text-blue-300 block leading-tight truncate">
                        Nadir (Mavi)
                      </span>
                      <span className="text-[10px] text-blue-200 font-mono font-black">
                        %34.9 Şans
                      </span>
                    </div>
                  </div>

                  {/* Yaygın (Yeşil) */}
                  <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/60 shadow-[0_0_15px_rgba(34,197,94,0.2)] flex items-center gap-2 col-span-2 sm:col-span-1">
                    <div className="w-3.5 h-3.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(34,197,94,1)] shrink-0" />
                    <div className="min-w-0">
                      <span className="text-[11px] font-black text-emerald-300 block leading-tight truncate">
                        Yaygın (Yeşil)
                      </span>
                      <span className="text-[10px] text-emerald-200 font-mono font-black">
                        %35.0 Şans
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* SKİBİDİ TOWER DEFENSE SUMMON BANNER TOGGLE */}
              <div className="flex items-center justify-between gap-2 p-1.5 rounded-xl bg-slate-950 border border-slate-800">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setBannerViewMode('banner')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                      bannerViewMode === 'banner'
                        ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-md shadow-red-500/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-900'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>🔥 Aktif Skibidi Summon Bannerı</span>
                  </button>
                  <button
                    onClick={() => setBannerViewMode('all')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                      bannerViewMode === 'all'
                        ? 'bg-cyan-600 text-white shadow-md shadow-cyan-500/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-900'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5 text-cyan-300" />
                    <span>📚 Tüm Güçler & Gelecek Banner</span>
                  </button>
                </div>

                <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-mono font-bold text-slate-400 pr-2">
                  <RefreshCw className="w-3 h-3 text-cyan-400 animate-spin" />
                  <span>
                    Rotasyon: {isRotationCycleB ? 'DÖNGÜ B (Sonsuz Kalp)' : 'DÖNGÜ A (Klonlama)'}
                  </span>
                </div>
              </div>

              {/* ------------------------------------------------------------- */}
              {/* MOD 1: AKTİF SKİBİDİ SUMMON BANNER GÖRÜNÜMÜ (10 DAKİKALIK) */}
              {/* ------------------------------------------------------------- */}
              {bannerViewMode === 'banner' && (
                <div className="space-y-4">
                  {/* BANNER HEADER */}
                  <div className="p-3 rounded-xl bg-gradient-to-r from-red-950/70 via-slate-900 to-amber-950/70 border border-red-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-base sm:text-lg">📢</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs sm:text-sm font-black text-white">
                            {isRotationCycleB
                              ? '⭐ SKİBİDİ BANNER B: MİTOLOJİK SONSUZ KALP & SÜPER TURBO'
                              : '⭐ SKİBİDİ BANNER A: MİTOLOJİK KLONLAMA & ZAMAN DONDURMA'}
                          </h4>
                          <span className="px-2 py-0.5 rounded-full bg-red-600 text-white text-[9px] font-mono font-black animate-pulse">
                            AKTİF SUMMON
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-300">
                          Bu 10 dakikalık döngünün öne çıkan summon birimleri aşağıdadır. Süre bitince diğer banner aktifleşir!
                        </p>
                      </div>
                    </div>

                    <div className="text-[11px] font-mono font-bold text-amber-300 bg-black/60 px-2.5 py-1 rounded-lg border border-amber-500/30">
                      ⏳ Sıradaki Değişim: {formatCountdown(rotationTimeLeftMs)}
                    </div>
                  </div>

                  {/* 1. ÖNE ÇIKAN MİTOLOJİK GÜÇ (KLONLAMA VEYA SONSUZ KALP) */}
                  {!isRotationCycleB ? (
                    /* DÖNGÜ A: MİTOLOJİK KLONLAMA (200.000 Coin) */
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-950/90 via-slate-900 to-black border-2 border-red-500/90 p-4 sm:p-5 shadow-[0_0_35px_rgba(239,68,68,0.4)]">
                      <div className="absolute -top-10 -right-10 w-44 h-44 bg-red-600/20 rounded-full blur-3xl pointer-events-none" />

                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-start gap-3.5">
                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500 via-rose-600 to-red-800 flex items-center justify-center text-white shadow-lg shadow-red-500/50 shrink-0">
                            <Users className="w-7 h-7 text-white animate-pulse" />
                          </div>

                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="px-2.5 py-0.5 rounded-full bg-red-600 text-white font-black text-[10px] uppercase tracking-wider shadow-sm shadow-red-600/50">
                                🔴 MİTOLOJİK GÜÇ (%0.01)
                              </span>
                              <span className="text-[10px] text-red-300 font-mono font-bold bg-red-500/20 px-2 py-0.5 rounded-full border border-red-500/40">
                                3 Canlı Klon · Sıfır Düşüş
                              </span>
                              <span className="text-[10px] text-white font-mono font-bold bg-slate-800 px-2 py-0.5 rounded-full">
                                Tek & Çoklu Oyunculu
                              </span>
                            </div>

                            <h3 className="text-lg sm:text-xl font-black text-red-400 mt-1.5 tracking-tight flex items-center gap-2">
                              <span>MİTOLOJİK KLONLAMA (3 KLON)</span>
                            </h3>

                            <p className="text-xs text-slate-200 mt-1 max-w-lg leading-relaxed">
                              Arenada yanınızda sizi koruyan ve düşmanların önünü kesen <strong className="text-red-400">3 adet sadık klon yılan</strong> çıkarır! Hem tek hem çoklu oyunculuda aktiftir.
                            </p>

                            <div className="flex items-center gap-1.5 mt-2 text-[11px] text-red-300/90 font-mono font-bold bg-red-950/50 p-1.5 rounded-lg border border-red-500/30">
                              <Info className="w-3.5 h-3.5 text-red-400 shrink-0" />
                              <span>KURAL: Klonlardan biri ölürse veya botlara çarparsa içinden hiçbir şey düşmez!</span>
                            </div>
                          </div>
                        </div>

                        {/* Buy / Owned Status */}
                        <div className="shrink-0 w-full sm:w-auto flex flex-col items-end gap-1.5">
                          {hasCloning ? (
                            <div className="w-full sm:w-auto px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm">
                              <Check className="w-4 h-4 text-emerald-400" />
                              <span>✓ Zaten satın aldınız!</span>
                            </div>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() => onBuyTacticalItem && onBuyTacticalItem('MYTHIC_CLONING')}
                                disabled={coins < 200000}
                                className={`w-full sm:w-auto px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-xl cursor-pointer ${
                                  coins >= 200000
                                    ? 'bg-gradient-to-r from-red-600 via-rose-600 to-red-500 hover:from-red-500 hover:to-rose-500 text-white shadow-red-600/40 active:scale-95'
                                    : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-80'
                                }`}
                              >
                                <Coins className="w-4 h-4 text-amber-300" />
                                <span>200.000 Coin ile Satın Al</span>
                                <ArrowUpRight className="w-4 h-4" />
                              </button>
                              {coins < 200000 && (
                                <span className="text-[10px] text-red-400 font-mono text-center sm:text-right w-full">
                                  Bakiye: {coins.toLocaleString('tr-TR')} / 200.000 Coin
                                </span>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* DÖNGÜ B: MİTOLOJİK SONSUZ KALP (300.000 Coin - 10 CAN) */
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-950/90 via-slate-900 to-black border-2 border-red-500/90 p-4 sm:p-5 shadow-[0_0_35px_rgba(239,68,68,0.4)]">
                      <div className="absolute -top-10 -right-10 w-44 h-44 bg-rose-600/20 rounded-full blur-3xl pointer-events-none" />

                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-start gap-3.5">
                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500 via-red-600 to-rose-800 flex items-center justify-center text-white shadow-lg shadow-rose-500/50 shrink-0">
                            <Heart className="w-7 h-7 text-white fill-white animate-pulse" />
                          </div>

                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="px-2.5 py-0.5 rounded-full bg-red-600 text-white font-black text-[10px] uppercase tracking-wider shadow-sm shadow-red-600/50">
                                🔴 MİTOLOJİK GÜÇ (%0.01)
                              </span>
                              <span className="text-[10px] text-rose-300 font-mono font-bold bg-rose-500/20 px-2 py-0.5 rounded-full border border-rose-500/40">
                                10 Tam Kalp Kapasitesi · Anında Full Can
                              </span>
                              <span className="text-[10px] text-white font-mono font-bold bg-slate-800 px-2 py-0.5 rounded-full">
                                Skibidi Rotasyon Birimi
                              </span>
                            </div>

                            <h3 className="text-lg sm:text-xl font-black text-rose-400 mt-1.5 tracking-tight flex items-center gap-2">
                              <span>MİTOLOJİK SONSUZ KALP (10 CAN)</span>
                            </h3>

                            <p className="text-xs text-slate-200 mt-1 max-w-lg leading-relaxed">
                              Yılanınıza <strong className="text-rose-400">tam 10 Kalp (Can) Kapasitesi</strong> kazandırır ve canınızı derhal 10 kalbe fuller! Zehirlere ve bot çarpmalarına karşı mutlak dayanıklılık sağlar.
                            </p>

                            <div className="flex items-center gap-1.5 mt-2 text-[11px] text-rose-300/90 font-mono font-bold bg-red-950/50 p-1.5 rounded-lg border border-red-500/30">
                              <Info className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                              <span>ÖZELLİK: Köşe envanterinden kuşanıldığında devasa 10 kalplik sağlık barı etkinleşir!</span>
                            </div>
                          </div>
                        </div>

                        {/* Buy / Owned Status */}
                        <div className="shrink-0 w-full sm:w-auto flex flex-col items-end gap-1.5">
                          {hasMythicHearts ? (
                            <div className="w-full sm:w-auto px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm">
                              <Check className="w-4 h-4 text-emerald-400" />
                              <span>✓ Zaten satın aldınız!</span>
                            </div>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() => onBuyTacticalItem && onBuyTacticalItem('MYTHIC_HEARTS')}
                                disabled={coins < 300000}
                                className={`w-full sm:w-auto px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-xl cursor-pointer ${
                                  coins >= 300000
                                    ? 'bg-gradient-to-r from-red-600 via-rose-600 to-red-500 hover:from-red-500 hover:to-rose-500 text-white shadow-red-600/40 active:scale-95'
                                    : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-80'
                                }`}
                              >
                                <Coins className="w-4 h-4 text-amber-300" />
                                <span>300.000 Coin ile Satın Al</span>
                                <ArrowUpRight className="w-4 h-4" />
                              </button>
                              {coins < 300000 && (
                                <span className="text-[10px] text-red-400 font-mono text-center sm:text-right w-full">
                                  Bakiye: {coins.toLocaleString('tr-TR')} / 300.000 Coin
                                </span>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 2. DÖNGÜNÜN ÖNE ÇIKAN DİĞER GÜÇLERİ (EFSANEVİ + EPİK + NADİR) */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                    {/* Öne Çıkan Efsanevi Birim: Döngü A ise Zaman Dondurma, Döngü B ise Turbo */}
                    {!isRotationCycleB ? (
                      /* ZAMAN DONDURMA (10sn) - Efsanevi Sarı */
                      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-yellow-950/60 via-slate-900 to-slate-950 border-2 border-yellow-400/80 p-4 shadow-[0_0_25px_rgba(234,179,8,0.25)] flex flex-col justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-yellow-400 via-amber-400 to-yellow-600 flex items-center justify-center text-slate-950 shadow-md shadow-yellow-500/40 shrink-0">
                            <Hourglass className="w-5 h-5 text-slate-950 font-black animate-pulse" />
                          </div>

                          <div>
                            <div className="flex flex-wrap items-center gap-1.5 mb-1">
                              <span className="px-2 py-0.5 rounded-full bg-yellow-400 text-slate-950 font-black text-[9px] uppercase tracking-wider">
                                🟡 EFSANEVİ (%0.1)
                              </span>
                              <span className="text-[9px] text-yellow-300 font-mono font-bold bg-yellow-500/20 px-1.5 py-0.5 rounded border border-yellow-500/30">
                                10sn Süre
                              </span>
                            </div>
                            <h4 className="text-xs sm:text-sm font-black text-yellow-300 tracking-tight">
                              ZAMAN DURDURMA (10 SANİYE)
                            </h4>
                            <p className="text-[11px] text-slate-300 mt-1 leading-snug">
                              Botları 10sn kaskatı dondurur. [G] tuşuyla kullanılır.
                            </p>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-800">
                          {timeFreezeCharges > 0 ? (
                            <div className="w-full py-2 rounded-xl bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40 flex items-center justify-center gap-1.5 text-xs shadow-sm">
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span>✓ Zaten satın aldınız!</span>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-1 text-xs font-mono font-black text-yellow-300">
                                <Coins className="w-3.5 h-3.5 text-yellow-400" />
                                <span>10.000 Coin</span>
                              </div>
                              <button
                                type="button"
                                disabled={coins < 10000}
                                onClick={() => onBuyTimeFreeze()}
                                className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1 cursor-pointer ${
                                  coins >= 10000
                                    ? 'bg-yellow-400 hover:bg-yellow-300 text-slate-950 shadow-md shadow-yellow-500/30 active:scale-95'
                                    : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                                }`}
                              >
                                <span>Satın Al</span>
                                <ArrowUpRight className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      /* SÜPER TURBO SPRİNT - Efsanevi Sarı */
                      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-yellow-950/60 via-slate-900 to-slate-950 border-2 border-yellow-400/80 p-4 shadow-[0_0_25px_rgba(234,179,8,0.25)] flex flex-col justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-yellow-400 via-amber-400 to-yellow-600 flex items-center justify-center text-slate-950 shadow-md shadow-yellow-500/40 shrink-0">
                            <Zap className="w-5 h-5 text-slate-950 font-black animate-pulse" />
                          </div>

                          <div>
                            <div className="flex flex-wrap items-center gap-1.5 mb-1">
                              <span className="px-2 py-0.5 rounded-full bg-yellow-400 text-slate-950 font-black text-[9px] uppercase tracking-wider">
                                🟡 EFSANEVİ (%0.1)
                              </span>
                              <span className="text-[9px] text-yellow-300 font-mono font-bold bg-yellow-500/20 px-1.5 py-0.5 rounded border border-yellow-500/30">
                                2x Hızlı Dolum
                              </span>
                            </div>
                            <h4 className="text-xs sm:text-sm font-black text-yellow-300 tracking-tight">
                              SÜPER TURBO SPRİNT
                            </h4>
                            <p className="text-[11px] text-slate-300 mt-1 leading-snug">
                              Turbo sprint yeteneğini açar! Stamina %70 yavaş biter.
                            </p>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-800">
                          {hasLegendaryTurbo ? (
                            <div className="w-full py-2 rounded-xl bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40 flex items-center justify-center gap-1.5 text-xs shadow-sm">
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span>✓ Zaten satın aldınız!</span>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-1 text-xs font-mono font-black text-yellow-300">
                                <Coins className="w-3.5 h-3.5 text-yellow-400" />
                                <span>5.000 Coin</span>
                              </div>
                              <button
                                type="button"
                                disabled={coins < 5000}
                                onClick={() => onBuyTacticalItem && onBuyTacticalItem('SUPER_TURBO')}
                                className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1 cursor-pointer ${
                                  coins >= 5000
                                    ? 'bg-yellow-400 hover:bg-yellow-300 text-slate-950 shadow-md shadow-yellow-500/30 active:scale-95'
                                    : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                                }`}
                              >
                                <span>Satın Al</span>
                                <ArrowUpRight className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Mega Lahmacun Ziyafeti - Epik Mor */}
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-950/60 via-slate-950 to-slate-900 border-2 border-purple-500/80 shadow-[0_0_20px_rgba(168,85,247,0.25)] flex flex-col justify-between gap-3">
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="px-2 py-0.5 rounded-full bg-purple-600 text-white font-black text-[9px] uppercase tracking-wider">
                            🟣 EPİK (%30.0)
                          </span>
                          {hasMegaLahmacun && (
                            <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[9px] font-mono font-bold">
                              Aktif
                            </span>
                          )}
                        </div>
                        <div className="flex items-start gap-2.5">
                          <div className="p-2 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-300 shrink-0">
                            <Flame className="w-4 h-4 text-purple-400" />
                          </div>
                          <div>
                            <h4 className="font-black text-xs text-purple-300">Mega Lahmacun Ziyafeti</h4>
                            <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">
                              Bonus dev lahmacunlar çıkarır, ekstra +%15 hızlı uzama sağlar.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-800">
                        {hasMegaLahmacun ? (
                          <div className="w-full py-2 rounded-xl bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40 flex items-center justify-center gap-1.5 text-xs shadow-sm">
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span>✓ Zaten satın aldınız!</span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1 text-xs font-mono font-black text-purple-300">
                              <Coins className="w-3.5 h-3.5 text-purple-400" />
                              <span>350 Coin</span>
                            </div>
                            <button
                              type="button"
                              disabled={coins < 350}
                              onClick={() => onBuyTacticalItem && onBuyTacticalItem('MEGA_LAHMACUN')}
                              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1 cursor-pointer ${
                                coins >= 350
                                  ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-600/30 active:scale-95'
                                  : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                              }`}
                            >
                              <span>Satın Al</span>
                              <ArrowUpRight className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Öne Çıkan Nadir Birim: Döngü A ise Mıknatıs, Döngü B ise Siber Kalkan */}
                    {!isRotationCycleB ? (
                      /* MIKNATIS GİRDABI (500 Coin) */
                      <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-950/60 via-slate-950 to-slate-900 border-2 border-blue-500/80 shadow-[0_0_20px_rgba(59,130,246,0.25)] flex flex-col justify-between gap-3">
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white font-black text-[9px] uppercase tracking-wider">
                              🔵 NADİR (%34.9)
                            </span>
                            {hasMagnetVortex && (
                              <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[9px] font-mono font-bold">
                                Aktif
                              </span>
                            )}
                          </div>
                          <div className="flex items-start gap-2.5">
                            <div className="p-2 rounded-xl bg-blue-500/20 border border-blue-500/40 text-blue-300 shrink-0">
                              <Magnet className="w-4 h-4 text-blue-400" />
                            </div>
                            <div>
                              <h4 className="font-black text-xs text-blue-300">Mıknatıs Girdabı</h4>
                              <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">
                                Sahadaki tüm enerji kürelerini otomatik olarak yılanınıza çeker.
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-800">
                          {hasMagnetVortex ? (
                            <div className="w-full py-2 rounded-xl bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40 flex items-center justify-center gap-1.5 text-xs shadow-sm">
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span>✓ Zaten satın aldınız!</span>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-1 text-xs font-mono font-black text-blue-300">
                                <Coins className="w-3.5 h-3.5 text-blue-400" />
                                <span>500 Coin</span>
                              </div>
                              <button
                                type="button"
                                disabled={coins < 500}
                                onClick={() => onBuyTacticalItem && onBuyTacticalItem('MAGNET_VORTEX')}
                                className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1 cursor-pointer ${
                                  coins >= 500
                                    ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/30 active:scale-95'
                                    : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                                }`}
                              >
                                <span>Satın Al</span>
                                <ArrowUpRight className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      /* SİBER KALKAN ZIRHI (750 Coin) */
                      <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-950/60 via-slate-950 to-slate-900 border-2 border-blue-500/80 shadow-[0_0_20px_rgba(59,130,246,0.25)] flex flex-col justify-between gap-3">
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white font-black text-[9px] uppercase tracking-wider">
                              🔵 NADİR (%35.0)
                            </span>
                            {hasCyberShield && (
                              <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[9px] font-mono font-bold">
                                Aktif
                              </span>
                            )}
                          </div>
                          <div className="flex items-start gap-2.5">
                            <div className="p-2 rounded-xl bg-blue-500/20 border border-blue-500/40 text-blue-300 shrink-0">
                              <ShieldCheck className="w-4 h-4 text-blue-400" />
                            </div>
                            <div>
                              <h4 className="font-black text-xs text-blue-300">Siber Kalkan Zırhı</h4>
                              <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">
                                Zehirli baloncuklardan gelen hasarları %50 soğurur ve canınızı korur.
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-800">
                          {hasCyberShield ? (
                            <div className="w-full py-2 rounded-xl bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40 flex items-center justify-center gap-1.5 text-xs shadow-sm">
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span>✓ Zaten satın aldınız!</span>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-1 text-xs font-mono font-black text-blue-300">
                                <Coins className="w-3.5 h-3.5 text-blue-400" />
                                <span>750 Coin</span>
                              </div>
                              <button
                                type="button"
                                disabled={coins < 750}
                                onClick={() => onBuyTacticalItem && onBuyTacticalItem('CYBER_SHIELD')}
                                className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1 cursor-pointer ${
                                  coins >= 750
                                    ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/30 active:scale-95'
                                    : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                                }`}
                              >
                                <span>Satın Al</span>
                                <ArrowUpRight className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* GELECEK ROTASYON ÖNİZLEMESİ (NEXT BANNER PREVIEW) */}
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">⏳</span>
                      <span className="text-slate-300">
                        <strong className="text-cyan-400">Gelecek Banner ({formatCountdown(rotationTimeLeftMs)} sonra): </strong>
                        {!isRotationCycleB ? (
                          <span className="text-slate-400">
                            🔴 Mitolojik Sonsuz Kalp (10 Can) · 🟡 Süper Turbo Sprint · 🔵 Siber Kalkan
                          </span>
                        ) : (
                          <span className="text-slate-400">
                            🔴 Mitolojik Klonlama (3 Klon) · 🟡 Zaman Dondurma (10sn) · 🔵 Mıknatıs Girdabı
                          </span>
                        )}
                      </span>
                    </div>

                    <button
                      onClick={() => setBannerViewMode('all')}
                      className="text-cyan-400 hover:text-cyan-300 font-bold underline cursor-pointer text-[11px] shrink-0"
                    >
                      Hepsini Gör & Satın Al
                    </button>
                  </div>
                </div>
              )}

              {/* ------------------------------------------------------------- */}
              {/* MOD 2: TÜM GÜÇLER ARŞİVİ (HER İKİ MİTOLOJİK VE TÜM EFSANEVİLER) */}
              {/* ------------------------------------------------------------- */}
              {bannerViewMode === 'all' && (
                <div className="space-y-4">
                  <div className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <span>🔴 MİTOLOJİK BİRİMLER (2 ADET)</span>
                  </div>

                  {/* MİTOLOJİK 1: MİTOLOJİK KLONLAMA (200.000 Coin) */}
                  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-950/80 via-slate-900 to-black border-2 border-red-500/80 p-4 shadow-[0_0_25px_rgba(239,68,68,0.3)]">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 to-rose-700 flex items-center justify-center text-white shrink-0">
                          <Users className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-full bg-red-600 text-white font-black text-[9px] uppercase">
                              🔴 MİTOLOJİK (%0.01)
                            </span>
                            <span className="text-[10px] text-red-300 font-mono font-bold">
                              3 Klon · Sıfır Düşüş
                            </span>
                          </div>
                          <h4 className="text-base font-black text-red-400 mt-1">
                            Mitolojik Klonlama (3 Klon)
                          </h4>
                          <p className="text-xs text-slate-300 mt-0.5">
                            Arenada sizi koruyan 3 sadık klon yılan çıkarır. Tek & Çoklu oyunculuda aktiftir.
                          </p>
                        </div>
                      </div>

                      <div className="shrink-0 w-full sm:w-auto">
                        {hasCloning ? (
                          <div className="px-4 py-2.5 rounded-xl bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40 flex items-center justify-center gap-1.5 text-xs shadow-sm">
                            <Check className="w-4 h-4 text-emerald-400" />
                            <span>✓ Zaten satın aldınız!</span>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onBuyTacticalItem && onBuyTacticalItem('MYTHIC_CLONING')}
                            disabled={coins < 200000}
                            className={`w-full sm:w-auto px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                              coins >= 200000
                                ? 'bg-red-600 hover:bg-red-500 text-white shadow-md active:scale-95'
                                : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                            }`}
                          >
                            <Coins className="w-4 h-4 text-amber-300" />
                            <span>200.000 Coin ile Satın Al</span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* MİTOLOJİK 2: MİTOLOJİK SONSUZ KALP (300.000 Coin) */}
                  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-950/80 via-slate-900 to-black border-2 border-red-500/80 p-4 shadow-[0_0_25px_rgba(239,68,68,0.3)]">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-red-700 flex items-center justify-center text-white shrink-0">
                          <Heart className="w-6 h-6 text-white fill-white animate-pulse" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-full bg-red-600 text-white font-black text-[9px] uppercase">
                              🔴 MİTOLOJİK (%0.01)
                            </span>
                            <span className="text-[10px] text-rose-300 font-mono font-bold">
                              10 Tam Kalp Kapasitesi
                            </span>
                          </div>
                          <h4 className="text-base font-black text-rose-400 mt-1">
                            Mitolojik Sonsuz Kalp (10 Can)
                          </h4>
                          <p className="text-xs text-slate-300 mt-0.5">
                            Yılana tam 10 Kalp Kapasitesi verir ve canı fuller. Zehir ve bot çarpışmalarına karşı aşırı dayanıklılık sağlar.
                          </p>
                        </div>
                      </div>

                      <div className="shrink-0 w-full sm:w-auto">
                        {hasMythicHearts ? (
                          <div className="px-4 py-2.5 rounded-xl bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40 flex items-center justify-center gap-1.5 text-xs shadow-sm">
                            <Check className="w-4 h-4 text-emerald-400" />
                            <span>✓ Zaten satın aldınız!</span>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onBuyTacticalItem && onBuyTacticalItem('MYTHIC_HEARTS')}
                            disabled={coins < 300000}
                            className={`w-full sm:w-auto px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                              coins >= 300000
                                ? 'bg-red-600 hover:bg-red-500 text-white shadow-md active:scale-95'
                                : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                            }`}
                          >
                            <Coins className="w-4 h-4 text-amber-300" />
                            <span>300.000 Coin ile Satın Al</span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-xs font-black text-slate-400 uppercase tracking-wider pt-2 flex items-center gap-1.5">
                    <span>🟡 EFSANEVİ BİRİMLER (2 ADET)</span>
                  </div>

                  {/* 2 Efsanevi Yan Yana */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {/* Zaman Dondurma */}
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-yellow-950/60 via-slate-900 to-slate-950 border-2 border-yellow-400/80 flex flex-col justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-yellow-400 flex items-center justify-center text-slate-950 shrink-0">
                          <Hourglass className="w-5 h-5 text-slate-950 font-black" />
                        </div>
                        <div>
                          <span className="px-2 py-0.5 rounded-full bg-yellow-400 text-slate-950 font-black text-[9px]">
                            🟡 EFSANEVİ (%0.1)
                          </span>
                          <h4 className="font-black text-sm text-yellow-300 mt-1">Zaman Durdurma (10sn)</h4>
                          <p className="text-[11px] text-slate-300">Botları dondurur, [G] tuşuyla kullanılır.</p>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-800">
                        {timeFreezeCharges > 0 ? (
                          <div className="w-full py-2 rounded-xl bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40 flex items-center justify-center gap-1.5 text-xs">
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span>✓ Zaten satın aldınız!</span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-mono font-bold text-yellow-300">10.000 Coin</span>
                            <button
                              type="button"
                              disabled={coins < 10000}
                              onClick={() => onBuyTimeFreeze()}
                              className="px-3.5 py-1.5 rounded-xl text-xs font-black bg-yellow-400 text-slate-950 cursor-pointer"
                            >
                              Satın Al
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Süper Turbo Sprint */}
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-yellow-950/60 via-slate-900 to-slate-950 border-2 border-yellow-400/80 flex flex-col justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-yellow-400 flex items-center justify-center text-slate-950 shrink-0">
                          <Zap className="w-5 h-5 text-slate-950 font-black" />
                        </div>
                        <div>
                          <span className="px-2 py-0.5 rounded-full bg-yellow-400 text-slate-950 font-black text-[9px]">
                            🟡 EFSANEVİ (%0.1)
                          </span>
                          <h4 className="font-black text-sm text-yellow-300 mt-1">Süper Turbo Sprint</h4>
                          <p className="text-[11px] text-slate-300">Turbo yeteneğini açar. Stamina 2x hızlı dolar.</p>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-800">
                        {hasLegendaryTurbo ? (
                          <div className="w-full py-2 rounded-xl bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40 flex items-center justify-center gap-1.5 text-xs">
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span>✓ Zaten satın aldınız!</span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-mono font-bold text-yellow-300">5.000 Coin</span>
                            <button
                              type="button"
                              disabled={coins < 5000}
                              onClick={() => onBuyTacticalItem && onBuyTacticalItem('SUPER_TURBO')}
                              className="px-3.5 py-1.5 rounded-xl text-xs font-black bg-yellow-400 text-slate-950 cursor-pointer"
                            >
                              Satın Al
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-xs font-black text-slate-400 uppercase tracking-wider pt-2 flex items-center gap-1.5">
                    <span>🟣 EPİK & 🔵 NADİR BİRİMLER (3 ADET)</span>
                  </div>

                  {/* 3 Epik & Nadir Yan Yana */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    {/* Mega Lahmacun */}
                    <div className="p-3.5 rounded-2xl bg-gradient-to-br from-purple-950/60 via-slate-950 to-slate-900 border-2 border-purple-500/80 flex flex-col justify-between gap-2.5">
                      <div>
                        <span className="px-2 py-0.5 rounded-full bg-purple-600 text-white font-black text-[9px]">
                          🟣 EPİK (%30.0)
                        </span>
                        <h4 className="font-black text-xs text-purple-300 mt-1">Mega Lahmacun</h4>
                        <p className="text-[11px] text-slate-300 mt-0.5">Bonus lahmacunlar çıkarır.</p>
                      </div>
                      <div className="pt-2 border-t border-slate-800">
                        {hasMegaLahmacun ? (
                          <div className="w-full py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 font-bold text-xs flex items-center justify-center gap-1">
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span>✓ Zaten satın aldınız!</span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-mono font-bold text-purple-300">350 Coin</span>
                            <button
                              type="button"
                              disabled={coins < 350}
                              onClick={() => onBuyTacticalItem && onBuyTacticalItem('MEGA_LAHMACUN')}
                              className="px-3 py-1 rounded-xl text-xs font-black bg-purple-600 text-white"
                            >
                              Satın Al
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Mıknatıs Girdabı */}
                    <div className="p-3.5 rounded-2xl bg-gradient-to-br from-blue-950/60 via-slate-950 to-slate-900 border-2 border-blue-500/80 flex flex-col justify-between gap-2.5">
                      <div>
                        <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white font-black text-[9px]">
                          🔵 NADİR (%34.9)
                        </span>
                        <h4 className="font-black text-xs text-blue-300 mt-1">Mıknatıs Girdabı</h4>
                        <p className="text-[11px] text-slate-300 mt-0.5">Enerji kürelerini çeker.</p>
                      </div>
                      <div className="pt-2 border-t border-slate-800">
                        {hasMagnetVortex ? (
                          <div className="w-full py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 font-bold text-xs flex items-center justify-center gap-1">
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span>✓ Zaten satın aldınız!</span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-mono font-bold text-blue-300">500 Coin</span>
                            <button
                              type="button"
                              disabled={coins < 500}
                              onClick={() => onBuyTacticalItem && onBuyTacticalItem('MAGNET_VORTEX')}
                              className="px-3 py-1 rounded-xl text-xs font-black bg-blue-600 text-white"
                            >
                              Satın Al
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Siber Kalkan */}
                    <div className="p-3.5 rounded-2xl bg-gradient-to-br from-blue-950/60 via-slate-950 to-slate-900 border-2 border-blue-500/80 flex flex-col justify-between gap-2.5">
                      <div>
                        <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white font-black text-[9px]">
                          🔵 NADİR (%35.0)
                        </span>
                        <h4 className="font-black text-xs text-blue-300 mt-1">Siber Kalkan</h4>
                        <p className="text-[11px] text-slate-300 mt-0.5">Zehir hasarını %50 azaltır.</p>
                      </div>
                      <div className="pt-2 border-t border-slate-800">
                        {hasCyberShield ? (
                          <div className="w-full py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 font-bold text-xs flex items-center justify-center gap-1">
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span>✓ Zaten satın aldınız!</span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-mono font-bold text-blue-300">750 Coin</span>
                            <button
                              type="button"
                              disabled={coins < 750}
                              onClick={() => onBuyTacticalItem && onBuyTacticalItem('CYBER_SHIELD')}
                              className="px-3 py-1 rounded-xl text-xs font-black bg-blue-600 text-white"
                            >
                              Satın Al
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
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
                      ) : skin.id === 'SKIN_SHADOW_RED' ? (
                        <div className="w-full py-2 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm">
                          <Gift className="w-4 h-4 text-amber-400" />
                          <span>1 Saat Oynama Hediyesi 🎁</span>
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
            🔴 Mitolojik: Kırmızı (%0.01) · 🟡 Efsanevi: Sarı (%0.1) · 🟣 Epik: Mor (%30) · 🔵 Nadir: Mavi (%35)
          </span>
          <span className="sm:hidden text-[11px] font-mono text-cyan-300">
            ⏳ Rotasyon: {formatCountdown(rotationTimeLeftMs)}
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
