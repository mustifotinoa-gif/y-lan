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
  Crosshair,
  Compass,
  RotateCw,
} from 'lucide-react';
import { UpgradeLevels, SnakeSkinId, MarketPowerId, SummonCrateType, SummonResultItem, MarketRarity } from '../types/game';
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
  hasGodlyTeleport?: boolean;
  teleportCharges?: number;
  rotationTimeLeftMs?: number;
  currentRotationCycle?: number;
  onBuyTacticalItem?: (itemId: MarketPowerId) => boolean;
  activeLoadout?: MarketPowerId[];
  onToggleEquipPower?: (id: MarketPowerId) => boolean;
  onSummonCrate?: (crateType: SummonCrateType, count: 1 | 10) => SummonResultItem[] | null;
}

type MarketTab = 'summon' | 'powers' | 'upgrades' | 'skins';

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
  hasGodlyTeleport = false,
  teleportCharges = 0,
  rotationTimeLeftMs = 600000,
  currentRotationCycle = 0,
  onBuyTacticalItem,
  activeLoadout = [],
  onToggleEquipPower,
  onSummonCrate,
}) => {
  const [activeTab, setActiveTab] = useState<MarketTab>('summon');
  const [activeCrate, setActiveCrate] = useState<SummonCrateType>('STANDARD');
  const [bannerViewMode, setBannerViewMode] = useState<'banner' | 'all'>('banner');
  const [isSummoning, setIsSummoning] = useState(false);
  const [summonResults, setSummonResults] = useState<SummonResultItem[] | null>(null);

  if (!isOpen) return null;

  const isRotationCycleB = (currentRotationCycle || 0) % 2 === 1;

  // Format MM:SS for 10-minute rotation
  const formatCountdown = (ms: number) => {
    if (ms <= 0) return '00:00';
    const totalSecs = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSecs / 60);
    const seconds = totalSecs % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const cost1x = activeCrate === 'MYTHIC_CRATE' ? 900 : 100;
  const cost10x = activeCrate === 'MYTHIC_CRATE' ? 8000 : 900;

  const handleSummon = (count: 1 | 10) => {
    if (!onSummonCrate) return;
    const cost = count === 1 ? cost1x : cost10x;
    if (coins < cost) return;

    setIsSummoning(true);
    setTimeout(() => {
      const results = onSummonCrate(activeCrate, count);
      setIsSummoning(false);
      if (results && results.length > 0) {
        setSummonResults(results);
      }
    }, 450);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-5xl bg-slate-900 border-2 border-cyan-500/40 rounded-2xl sm:rounded-3xl shadow-[0_0_60px_rgba(6,182,212,0.3)] overflow-hidden flex flex-col h-[92vh] max-h-[820px]">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-slate-800 bg-slate-950/95 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-950 border border-blue-500/50 text-blue-300 shadow-[0_0_15px_rgba(30,58,138,0.5)]">
              <Sparkles className="w-5 h-5 text-blue-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base md:text-lg font-black text-white tracking-tight flex items-center gap-1.5">
                  <span>SKİBİDİ SUMMON ALANI & SİBER MARKET</span>
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-blue-950 text-blue-300 text-[10px] font-mono font-black border border-blue-600/60 shadow-[0_0_10px_rgba(30,58,138,0.5)]">
                  TANRISAL: LÂCİVERT
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Skibidi Tower Defense summon sandıkları · Standart: 100 / 900 Coin · Mitolojik: 900 / 8.000 Coin
              </p>
            </div>
          </div>

          {/* Right Header: Coins & Close */}
          <div className="flex items-center gap-2">
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
        <div className="flex items-center border-b border-slate-800 bg-slate-950/60 px-3 sm:px-6 pt-2 gap-1.5 shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('summon')}
            className={`flex items-center gap-2 pb-2.5 px-3 border-b-2 text-xs font-black transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'summon'
                ? 'border-blue-500 text-blue-300 shadow-[0_2px_12px_rgba(30,58,138,0.6)]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Compass className="w-4 h-4 text-blue-400 animate-spin" />
            <span>🎲 Skibidi Summon Alanı</span>
            <span className="px-1.5 py-0.2 rounded-full bg-blue-900/60 text-blue-200 text-[9px] font-mono border border-blue-500/40">
              {activeCrate === 'MYTHIC_CRATE' ? '900 / 8.000 Coin' : '100 / 900 Coin'}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('powers')}
            className={`flex items-center gap-2 pb-2.5 px-3 border-b-2 text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'powers'
                ? 'border-red-500 text-red-400 shadow-[0_2px_10px_rgba(239,68,68,0.3)]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4 text-red-400" />
            <span>🔥 Taktiksel Güçler & Doğrudan Al</span>
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
        <div className="p-3 sm:p-5 overflow-y-auto flex-1 space-y-4">
          {/* ========================================================================= */}
          {/* TAB 1: SKİBİDİ TOWER DEFENSE SUMMON ALANI                                 */}
          {/* ========================================================================= */}
          {activeTab === 'summon' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
              {/* SOL / YAN ŞANS PANELİ ("Yanda şansları yazsın") */}
              <div className="lg:col-span-4 p-3.5 rounded-2xl bg-slate-950/90 border border-slate-800 flex flex-col justify-between gap-3 shadow-xl">
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <div className="flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-amber-400" />
                      <h4 className="text-xs font-black text-white tracking-wide uppercase">
                        Şans Oranları (Drop Rates)
                      </h4>
                    </div>
                    <span className="text-[10px] font-mono text-cyan-400 font-bold">
                      {activeCrate === 'STANDARD' ? 'Standart (100/900)' : 'Mitolojik (900/8.000)'}
                    </span>
                  </div>

                  {/* Kutu Seçim Sekmeleri */}
                  <div className="grid grid-cols-2 gap-1.5 my-2.5 p-1 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-bold">
                    <button
                      onClick={() => setActiveCrate('STANDARD')}
                      className={`py-1.5 rounded-lg transition-all text-center cursor-pointer ${
                        activeCrate === 'STANDARD'
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      📦 Standart Kutu
                    </button>
                    <button
                      onClick={() => setActiveCrate('MYTHIC_CRATE')}
                      className={`py-1.5 rounded-lg transition-all text-center cursor-pointer ${
                        activeCrate === 'MYTHIC_CRATE'
                          ? 'bg-gradient-to-r from-red-600 via-rose-600 to-indigo-900 text-white shadow-md'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      ✨ Mitolojik Kutu
                    </button>
                  </div>

                  {/* YANDAKİ ŞANS ORANLARI LİSTESİ */}
                  <div className="space-y-1.5">
                    {/* 1. Tanrısal (Godly) - Lâcivert (#1e3a8a) */}
                    <div className="p-2.5 rounded-xl bg-gradient-to-r from-blue-950 via-indigo-950 to-blue-900 border-2 border-blue-600 shadow-[0_0_18px_rgba(30,58,138,0.7)] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3.5 h-3.5 rounded-full bg-blue-600 shadow-[0_0_10px_rgba(30,58,138,1)] animate-ping" />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-black text-blue-200 uppercase tracking-tight">
                              🌌 Tanrısal (Lâcivert)
                            </span>
                            <span className="px-1.5 py-0.2 rounded bg-blue-900/80 text-[8px] font-mono text-cyan-200 border border-blue-500/50">
                              2 Işınlanma
                            </span>
                          </div>
                          <span className="text-[10px] text-blue-300 block font-sans">
                            Tanrısal Işınlanma Yeteneği
                          </span>
                        </div>
                      </div>
                      <span className="text-xs font-mono font-black text-cyan-200 bg-black/60 px-2 py-0.5 rounded-md border border-blue-500/50">
                        {activeCrate === 'STANDARD' ? '%000,1' : '%000,2'}
                      </span>
                    </div>

                    {/* 2. Mitolojik (Mythic) - Kırmızı */}
                    <div className="p-2 rounded-xl bg-red-950/40 border border-red-500/60 shadow-[0_0_12px_rgba(239,68,68,0.25)] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,1)] animate-pulse" />
                        <div>
                          <span className="text-[11px] font-black text-red-400 block leading-tight">
                            🔴 Mitolojik (Kırmızı)
                          </span>
                          <span className="text-[9px] text-red-200">
                            10 Sonsuz Kalp / 3 Klon
                          </span>
                        </div>
                      </div>
                      <span className="text-xs font-mono font-black text-red-300 bg-black/40 px-2 py-0.5 rounded-md border border-red-500/30">
                        {activeCrate === 'STANDARD' ? '%00,1' : '%00,2'}
                      </span>
                    </div>

                    {/* 3. Efsanevi (Legendary) - Sarı */}
                    <div className="p-2 rounded-xl bg-yellow-950/30 border border-yellow-400/50 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-400 shadow-[0_0_6px_rgba(234,179,8,1)]" />
                        <div>
                          <span className="text-[11px] font-black text-yellow-300 block leading-tight">
                            🟡 Efsanevi (Sarı)
                          </span>
                          <span className="text-[9px] text-yellow-200/80">
                            Zaman Durdurma / Süper Turbo
                          </span>
                        </div>
                      </div>
                      <span className="text-xs font-mono font-black text-yellow-200 bg-black/40 px-2 py-0.5 rounded-md border border-yellow-500/30">
                        {activeCrate === 'STANDARD' ? '%0.1' : '%1.0'}
                      </span>
                    </div>

                    {/* 4. Epik (Epic) - Mor */}
                    <div className="p-2 rounded-xl bg-purple-950/30 border border-purple-500/40 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                        <div>
                          <span className="text-[11px] font-black text-purple-300 block leading-tight">
                            🟣 Epik (Mor)
                          </span>
                          <span className="text-[9px] text-purple-200/80">
                            Mega Lahmacun Ziyafeti
                          </span>
                        </div>
                      </div>
                      <span className="text-xs font-mono font-bold text-purple-200 bg-black/40 px-2 py-0.5 rounded-md border border-purple-500/30">
                        {activeCrate === 'STANDARD' ? '%30.0' : '%40.0'}
                      </span>
                    </div>

                    {/* 5. Nadir (Rare) - Mavi */}
                    <div className="p-2 rounded-xl bg-blue-950/30 border border-blue-500/40 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                        <div>
                          <span className="text-[11px] font-black text-blue-300 block leading-tight">
                            🔵 Nadir (Mavi)
                          </span>
                          <span className="text-[9px] text-blue-200/80">
                            Mıknatıs Girdabı / Siber Kalkan
                          </span>
                        </div>
                      </div>
                      <span className="text-xs font-mono font-bold text-blue-200 bg-black/40 px-2 py-0.5 rounded-md border border-blue-500/30">
                        {activeCrate === 'STANDARD' ? '%34.9' : '%30.0'}
                      </span>
                    </div>

                    {/* 6. Yaygın (Common) - Yeşil */}
                    <div className="p-2 rounded-xl bg-emerald-950/30 border border-emerald-500/40 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                        <div>
                          <span className="text-[11px] font-black text-emerald-300 block leading-tight">
                            🟢 Yaygın (Yeşil)
                          </span>
                          <span className="text-[9px] text-emerald-200/80">
                            Siber Coin / Enerji Paketi
                          </span>
                        </div>
                      </div>
                      <span className="text-xs font-mono font-bold text-emerald-200 bg-black/40 px-2 py-0.5 rounded-md border border-emerald-500/30">
                        {activeCrate === 'STANDARD' ? '%35.0' : '%28.8'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 10 Dakikalık Değişim Bildirimi */}
                <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-[10px] text-slate-400 flex items-center gap-2">
                  <Hourglass className="w-3.5 h-3.5 text-cyan-400 shrink-0 animate-spin" />
                  <span>Döngü Sıradaki Değişim: {formatCountdown(rotationTimeLeftMs)}</span>
                </div>
              </div>

              {/* SAĞ / ORTA: SKİBİDİ TOWER DEFENSE SUMMON SAHNESİ */}
              <div className="lg:col-span-8 flex flex-col justify-between gap-3 p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/80 border-2 border-indigo-500/40 shadow-2xl relative overflow-hidden">
                {/* Glow Background Runes */}
                <div className="absolute -top-16 -right-16 w-64 h-64 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-red-600/15 rounded-full blur-3xl pointer-events-none" />

                {/* Summon Header */}
                <div className="flex items-center justify-between relative z-10">
                  <div>
                    <span className="text-[10px] font-mono font-black uppercase tracking-wider text-cyan-400 px-2 py-0.5 rounded-md bg-cyan-950 border border-cyan-500/40">
                      SKIBIDI TOWER DEFENSE SUMMON PORTAL
                    </span>
                    <h3 className="text-lg sm:text-xl font-black text-white mt-1 flex items-center gap-2">
                      <span>{activeCrate === 'STANDARD' ? 'STANDART SİBER SANDIK' : 'MİTOLOJİK BOYUT SANDIĞI'}</span>
                    </h3>
                  </div>

                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-mono font-bold text-amber-300">
                    <Coins className="w-4 h-4 text-amber-400" />
                    <span>{coins.toLocaleString('tr-TR')} Coin</span>
                  </div>
                </div>

                {/* Pedestal / Showcase Card */}
                <div className="relative my-2 p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-blue-950/40 via-slate-950/90 to-black border border-blue-500/50 shadow-[0_0_35px_rgba(30,58,138,0.4)] flex flex-col items-center justify-center text-center">
                  {/* Cosmic Portal Ring */}
                  <div className="relative w-28 h-28 sm:w-32 sm:h-32 mb-3 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-2 border-dashed border-blue-500/60 animate-spin" style={{ animationDuration: '8s' }} />
                    <div className="absolute inset-2 rounded-full border border-indigo-400/40 animate-ping" style={{ animationDuration: '3s' }} />
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-blue-950 via-indigo-950 to-blue-900 border-2 border-blue-400 flex flex-col items-center justify-center shadow-[0_0_30px_rgba(30,58,138,0.9)]">
                      <Crosshair className="w-8 h-8 text-blue-300 animate-pulse" />
                      <span className="text-[9px] font-mono font-black text-cyan-200 mt-0.5">GODLY</span>
                    </div>
                  </div>

                  {/* Top Featured Godly & Mythic Showcase */}
                  <div className="max-w-md space-y-1">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-blue-950 via-indigo-950 to-blue-900 border border-blue-500 text-blue-200 text-[10px] font-black uppercase tracking-wider shadow-sm">
                      <span>🌌 TANRISAL GÜÇ (LÂCİVERT): IŞINLANMA</span>
                    </div>
                    <h4 className="text-sm sm:text-base font-black text-white">
                      İki Kez İstediğiniz Yere Anında Işınlanın!
                    </h4>
                    <p className="text-xs text-slate-300 max-w-sm">
                      Haritanın herhangi bir noktasına [X] tuşuyla veya dokunarak 2 kez ışınlanın. 2 saniye tam hasar almazlık sağlar!
                    </p>
                  </div>

                  {/* Current Status Pill */}
                  <div className="mt-3 flex items-center gap-2">
                    {hasGodlyTeleport ? (
                      <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/40 flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Kasanızda Var · Kalan Hak: {teleportCharges}/2</span>
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full bg-blue-950/80 text-blue-300 text-xs font-mono font-bold border border-blue-600/60">
                        Şans: {activeCrate === 'STANDARD' ? '%000,1' : '%000,2'}
                      </span>
                    )}
                  </div>
                </div>

                {/* 1x ve 10x KUTU AÇMA BUTONLARI (Standart: 100/900, Mitolojik: 900/8.000 Coin) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800 relative z-10">
                  {/* 1 Kutu Aç (Standart: 100 Coin, Mitolojik: 900 Coin) */}
                  <button
                    type="button"
                    disabled={coins < cost1x || isSummoning}
                    onClick={() => handleSummon(1)}
                    className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-95 ${
                      coins >= cost1x && !isSummoning
                        ? 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-cyan-500/30 border border-cyan-400/60'
                        : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-60'
                    }`}
                  >
                    <Sparkles className="w-4 h-4 text-cyan-200" />
                    <span>1 Kutu Aç</span>
                    <span className="font-mono bg-black/40 px-2 py-0.5 rounded-md text-amber-300 border border-amber-500/30">
                      {cost1x.toLocaleString('tr-TR')} Coin
                    </span>
                  </button>

                  {/* 10 Kutu Aç (Standart: 900 Coin, Mitolojik: 8.000 Coin) */}
                  <button
                    type="button"
                    disabled={coins < cost10x || isSummoning}
                    onClick={() => handleSummon(10)}
                    className={`relative py-3 px-4 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-95 ${
                      coins >= cost10x && !isSummoning
                        ? 'bg-gradient-to-r from-amber-500 via-orange-600 to-red-600 hover:from-amber-400 hover:to-red-500 text-white shadow-red-500/30 border border-amber-400/60 animate-pulse'
                        : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-60'
                    }`}
                  >
                    <div className="absolute -top-2.5 right-3 px-2 py-0.2 rounded-full bg-emerald-500 text-slate-950 font-black text-[9px] shadow-sm uppercase tracking-wider">
                      {activeCrate === 'MYTHIC_CRATE' ? '1.000 COİN TASARRUF!' : '%10 İNDİRİM!'}
                    </div>
                    <Flame className="w-4 h-4 text-amber-200" />
                    <span>10 Kutu Aç</span>
                    <span className="font-mono bg-black/40 px-2 py-0.5 rounded-md text-amber-300 border border-amber-500/30">
                      {cost10x.toLocaleString('tr-TR')} Coin
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SUMMON SONUÇLARI REVEAL MODALI                                            */}
          {/* ========================================================================= */}
          {summonResults && (
            <div className="fixed inset-0 z-60 flex items-center justify-center p-3 bg-black/90 backdrop-blur-md animate-fade-in">
              <div className="relative w-full max-w-2xl bg-slate-950 border-2 border-cyan-400/80 rounded-3xl p-5 shadow-[0_0_60px_rgba(6,182,212,0.4)] flex flex-col max-h-[85vh] overflow-hidden">
                {/* Result Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-400 animate-spin" />
                    <h3 className="text-base font-black text-white uppercase tracking-tight">
                      🎉 SUMMON SONUÇLARI ({summonResults.length} Kutu)
                    </h3>
                  </div>
                  <button
                    onClick={() => setSummonResults(null)}
                    className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Cards Grid */}
                <div className="overflow-y-auto py-4 grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
                  {summonResults.map((item, idx) => {
                    const rarityCfg = RARITY_CONFIGS[item.rarity];
                    return (
                      <div
                        key={idx}
                        className={`p-3.5 rounded-2xl border-2 flex flex-col justify-between gap-2 shadow-lg transition-transform hover:scale-[1.02] ${rarityCfg.borderColor} ${rarityCfg.bgColor} ${rarityCfg.glow}`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${rarityCfg.badgeBg}`}>
                              {item.rarity === 'GODLY' ? '🌌 TANRISAL (LÂCİVERT)' : `${rarityCfg.name}`}
                            </span>
                            {item.isNew ? (
                              <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-mono font-black text-[9px] border border-emerald-500/40">
                                YENİ!
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono font-bold text-[9px]">
                                +{item.compensationCoins} Coin
                              </span>
                            )}
                          </div>
                          <h4 className={`text-sm font-black ${rarityCfg.textColor}`}>
                            {item.name}
                          </h4>
                          <p className="text-[11px] text-slate-300 mt-1 leading-snug">
                            {item.description}
                          </p>
                        </div>

                        <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                          <span>{item.powerId ? 'Kuşanılabilir Güç' : 'Hediye Ödül'}</span>
                          <span className="text-emerald-400 font-bold">✓ Envantere Eklendi</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={coins < cost1x}
                      onClick={() => handleSummon(1)}
                      className="px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-black text-xs transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                    >
                      Tekrar 1 Aç ({cost1x.toLocaleString('tr-TR')} Coin)
                    </button>
                    <button
                      type="button"
                      disabled={coins < cost10x}
                      onClick={() => handleSummon(10)}
                      className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-red-600 text-white font-black text-xs transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                    >
                      Tekrar 10 Aç ({cost10x.toLocaleString('tr-TR')} Coin)
                    </button>
                  </div>

                  <button
                    onClick={() => setSummonResults(null)}
                    className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs cursor-pointer"
                  >
                    Tamam
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: TAKTİKSEL GÜÇLER & DOĞRUDAN SATIN AL (ARŞİV)                       */}
          {/* ========================================================================= */}
          {activeTab === 'powers' && (
            <div className="space-y-4">
              {/* Tanrısal Birim Showcase: GODLY_TELEPORT (Lâcivert) */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-950 via-slate-900 to-black border-2 border-blue-600 p-4 sm:p-5 shadow-[0_0_35px_rgba(30,58,138,0.7)]">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-950 via-indigo-950 to-blue-900 border-2 border-blue-400 flex items-center justify-center text-white shadow-lg shadow-blue-900/50 shrink-0">
                      <Crosshair className="w-7 h-7 text-cyan-300 animate-pulse" />
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-blue-950 text-blue-200 border border-blue-500 font-black text-[10px] uppercase tracking-wider">
                          🌌 TANRISAL GÜÇ (LÂCİVERT - %000,1)
                        </span>
                        <span className="text-[10px] text-cyan-300 font-mono font-bold bg-blue-900/40 px-2 py-0.5 rounded-full border border-blue-500/40">
                          2 Kez Işınlanma · 2s Hasar Almazlık
                        </span>
                      </div>

                      <h3 className="text-lg sm:text-xl font-black text-cyan-200 mt-1.5 tracking-tight">
                        TANRISAL IŞINLANMA (2 HAK)
                      </h3>

                      <p className="text-xs text-slate-200 mt-1 max-w-lg leading-relaxed">
                        Haritanın herhangi bir noktasına [X] tuşuyla 2 kez anında ışınlanın. Işınlanma sırasında etrafa göksel lâcivert parçacık aurası yayılır ve 2 saniye boyunca ölümsüzlük kazanırsınız.
                      </p>
                    </div>
                  </div>

                  {/* Buy / Owned Status */}
                  <div className="shrink-0 w-full sm:w-auto flex flex-col items-end gap-1.5">
                    {hasGodlyTeleport ? (
                      <div className="w-full sm:w-auto px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm">
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span>✓ Zaten satın aldınız! ({teleportCharges}/2 Hak)</span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onBuyTacticalItem && onBuyTacticalItem('GODLY_TELEPORT')}
                        disabled={coins < 500000}
                        className={`w-full sm:w-auto px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg ${
                          coins >= 500000
                            ? 'bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-800 hover:from-blue-800 hover:to-indigo-800 text-cyan-200 border border-blue-400 shadow-blue-900/60 active:scale-95'
                            : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-60'
                        }`}
                      >
                        <Coins className="w-4 h-4 text-amber-300" />
                        <span>500.000 Coin ile Doğrudan Al</span>
                        <ArrowUpRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Mitolojik Klonlama & Mitolojik Sonsuz Kalp */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {/* Mitolojik Klonlama */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-red-950/80 via-slate-900 to-black border-2 border-red-500/80 flex flex-col justify-between gap-3 shadow-md">
                  <div>
                    <span className="px-2 py-0.5 rounded-full bg-red-600 text-white font-black text-[9px] uppercase">
                      🔴 MİTOLOJİK (%0.01)
                    </span>
                    <h4 className="text-base font-black text-red-400 mt-1">Mitolojik Klonlama (3 Klon)</h4>
                    <p className="text-xs text-slate-300 mt-1">Arenada sizi koruyan 3 sadık klon yılan çıkarır.</p>
                  </div>
                  <div className="pt-2 border-t border-slate-800">
                    {hasCloning ? (
                      <div className="py-2 text-center rounded-xl bg-emerald-500/20 text-emerald-300 font-bold text-xs">
                        ✓ Zaten satın aldınız!
                      </div>
                    ) : (
                      <button
                        onClick={() => onBuyTacticalItem && onBuyTacticalItem('MYTHIC_CLONING')}
                        disabled={coins < 200000}
                        className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs disabled:opacity-50"
                      >
                        200.000 Coin ile Al
                      </button>
                    )}
                  </div>
                </div>

                {/* Mitolojik Sonsuz Kalp */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-red-950/80 via-slate-900 to-black border-2 border-red-500/80 flex flex-col justify-between gap-3 shadow-md">
                  <div>
                    <span className="px-2 py-0.5 rounded-full bg-red-600 text-white font-black text-[9px] uppercase">
                      🔴 MİTOLOJİK (%0.01)
                    </span>
                    <h4 className="text-base font-black text-rose-400 mt-1">Mitolojik Sonsuz Kalp (10 Can)</h4>
                    <p className="text-xs text-slate-300 mt-1">10 Tam Kalp Kapasitesi verir ve canları fuller.</p>
                  </div>
                  <div className="pt-2 border-t border-slate-800">
                    {hasMythicHearts ? (
                      <div className="py-2 text-center rounded-xl bg-emerald-500/20 text-emerald-300 font-bold text-xs">
                        ✓ Zaten satın aldınız!
                      </div>
                    ) : (
                      <button
                        onClick={() => onBuyTacticalItem && onBuyTacticalItem('MYTHIC_HEARTS')}
                        disabled={coins < 300000}
                        className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs disabled:opacity-50"
                      >
                        300.000 Coin ile Al
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: KALICI GELİŞTİRMELER                                               */}
          {/* ========================================================================= */}
          {activeTab === 'upgrades' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {UPGRADE_DATA.map((item) => {
                const IconComponent = item.icon;
                const isMax = item.currentLevel >= item.maxLevel;
                const nextLevelConfig = !isMax ? item.levels[item.currentLevel] : null;
                const canAfford = nextLevelConfig ? coins >= nextLevelConfig.cost : false;

                return (
                  <div
                    key={item.id}
                    className={`p-4 rounded-2xl bg-slate-950/70 border ${item.borderColor} flex flex-col justify-between gap-3 shadow-md`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className={`p-2 rounded-xl ${item.bgColor}`}>
                            <IconComponent className={`w-5 h-5 ${item.color}`} />
                          </div>
                          <div>
                            <h4 className="font-bold text-sm text-white">{item.title}</h4>
                            <span className="text-[11px] font-mono text-slate-400">
                              Seviye: {item.currentLevel}/{item.maxLevel}
                            </span>
                          </div>
                        </div>
                      </div>

                      {nextLevelConfig && (
                        <p className="text-xs text-slate-300 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                          {nextLevelConfig.desc}
                        </p>
                      )}
                    </div>

                    <div className="pt-2 border-t border-slate-800">
                      {isMax ? (
                        <div className="py-2 text-center rounded-xl bg-emerald-500/20 text-emerald-300 font-bold text-xs">
                          Maksimum Seviye!
                        </div>
                      ) : (
                        <button
                          type="button"
                          disabled={!canAfford}
                          onClick={() => onBuyUpgrade(item.id)}
                          className={`w-full py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                            canAfford
                              ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-black shadow-md'
                              : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                          }`}
                        >
                          <Coins className="w-3.5 h-3.5" />
                          <span>{nextLevelConfig?.cost} Coin ile Yükselt</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: KOSTÜMLER                                                          */}
          {/* ========================================================================= */}
          {activeTab === 'skins' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
              {skinList.map((skin) => {
                const isOwned = unlockedSkins.includes(skin.id);
                const isEquipped = selectedSkin === skin.id;
                const canAfford = coins >= skin.price;

                return (
                  <div
                    key={skin.id}
                    className={`p-4 rounded-2xl bg-slate-950/70 border flex flex-col justify-between gap-3 ${
                      isEquipped ? 'border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)]' : 'border-slate-800'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-sm text-white">{skin.name}</h4>
                        {isEquipped && (
                          <span className="px-2 py-0.5 rounded-full bg-cyan-400/20 text-cyan-300 font-bold text-[10px]">
                            Aktif
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 my-2 p-2 rounded-xl bg-slate-900 border border-slate-800">
                        <div className="w-5 h-5 rounded-full" style={{ backgroundColor: skin.headColor }} />
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: skin.bodyColor1 }} />
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: skin.bodyColor2 }} />
                      </div>

                      <p className="text-xs text-slate-400 leading-snug">{skin.description}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-800">
                      {isEquipped ? (
                        <div className="py-2 text-center rounded-xl bg-cyan-500/20 text-cyan-300 font-bold text-xs">
                          Kullanımda
                        </div>
                      ) : isOwned ? (
                        <button
                          type="button"
                          onClick={() => onEquipSkin && onEquipSkin(skin.id)}
                          className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold"
                        >
                          Kuşan
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={!canAfford}
                          onClick={() => onBuySkin && onBuySkin(skin.id)}
                          className="w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black disabled:opacity-50"
                        >
                          {skin.price.toLocaleString('tr-TR')} Coin ile Aç
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
        <div className="px-4 sm:px-6 py-2.5 border-t border-slate-800 bg-slate-950/95 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <span className="hidden sm:inline">
            🌌 Tanrısal: Lâcivert (%000,1) · 🔴 Mitolojik: Kırmızı (%00,1) · 🟡 Efsanevi (%0.1)
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
