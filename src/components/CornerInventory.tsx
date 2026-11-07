import React, { useState } from 'react';
import {
  Backpack,
  X,
  Sparkles,
  Check,
  Zap,
  Hourglass,
  Users,
  Flame,
  Magnet,
  ShieldCheck,
  ShoppingBag,
  Plus,
  Info,
  Layers,
  ChevronUp,
  ChevronDown,
  Heart,
  Crosshair,
} from 'lucide-react';
import { MarketPowerId, MarketRarity } from '../types/game';
import { MARKET_POWERS, RARITY_CONFIGS } from '../constants/gameConfig';

interface CornerInventoryProps {
  inventory: MarketPowerId[];
  activeLoadout: MarketPowerId[]; // Max 5 items
  onEquipPower: (id: MarketPowerId) => boolean;
  onUnequipPower: (id: MarketPowerId) => void;
  onToggleEquipPower: (id: MarketPowerId) => boolean;
  onOpenShop?: () => void;
  onActivateTimeFreeze?: () => boolean;
  onActivateTeleport?: () => boolean;
  teleportCharges?: number;
  isMultiplayer?: boolean;
}

export const CornerInventory: React.FC<CornerInventoryProps> = ({
  inventory = [],
  activeLoadout = [],
  onEquipPower,
  onUnequipPower,
  onToggleEquipPower,
  onOpenShop,
  onActivateTimeFreeze,
  onActivateTeleport,
  teleportCharges = 0,
  isMultiplayer = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [filterRarity, setFilterRarity] = useState<MarketRarity | 'ALL'>('ALL');

  // Helper to render appropriate icon per power
  const renderPowerIcon = (id: MarketPowerId, className = 'w-4 h-4') => {
    switch (id) {
      case 'GODLY_TELEPORT':
        return <Crosshair className={`${className} text-cyan-300 animate-pulse`} />;
      case 'MYTHIC_CLONING':
        return <Users className={`${className} text-red-400`} />;
      case 'MYTHIC_HEARTS':
        return <Heart className={`${className} text-red-500 fill-red-500 animate-pulse`} />;
      case 'TIME_FREEZE':
        return <Hourglass className={`${className} text-yellow-300`} />;
      case 'SUPER_TURBO':
        return <Zap className={`${className} text-yellow-300`} />;
      case 'MEGA_LAHMACUN':
        return <Flame className={`${className} text-purple-400`} />;
      case 'MAGNET_VORTEX':
        return <Magnet className={`${className} text-blue-400`} />;
      case 'CYBER_SHIELD':
        return <ShieldCheck className={`${className} text-blue-400`} />;
      default:
        return <Sparkles className={`${className} text-cyan-400`} />;
    }
  };

  // 5 Active Slots array (length 5)
  const slots: (MarketPowerId | null)[] = Array.from({ length: 5 }).map(
    (_, i) => activeLoadout[i] || null
  );

  // Filtered inventory list
  const filteredInventory = inventory.filter((id) => {
    if (filterRarity === 'ALL') return true;
    const cfg = MARKET_POWERS[id];
    return cfg?.rarity === filterRarity;
  });

  return (
    <>
      {/* 1. KÜÇÜK KÖŞE ENVANTER DOKU (5 GÜÇ YUVASI & BUTON) */}
      <div className="fixed bottom-3 right-3 sm:bottom-4 sm:right-4 z-30 select-none">
        <div className="flex flex-col items-end gap-1.5">
          {/* Main Corner Bar */}
          <div className="flex items-center gap-1.5 p-1.5 sm:p-2 rounded-2xl bg-slate-950/90 backdrop-blur-md border border-cyan-500/40 shadow-[0_0_20px_rgba(6,182,212,0.25)]">
            {/* Header / Toggle Button */}
            <button
              onClick={() => setIsOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-950 to-slate-900 border border-cyan-400/50 hover:border-cyan-400 text-white text-xs font-black transition-all hover:scale-105 active:scale-95 shadow-md cursor-pointer"
              title="Sonsuz Güç Envanterini Aç (5 Güç Seçebilirsiniz)"
            >
              <div className="p-1 rounded-lg bg-cyan-500/20 text-cyan-300">
                <Backpack className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              </div>
              <div className="text-left hidden xs:block">
                <div className="text-[11px] font-black leading-tight text-cyan-300">
                  ENVANTER
                </div>
                <div className="text-[9px] font-mono text-slate-400">
                  {activeLoadout.length}/5 Aktif · {inventory.length}/∞
                </div>
              </div>
            </button>

            {/* 5 Active Power Slots Bar */}
            <div className="flex items-center gap-1 sm:gap-1.5 px-1">
              {slots.map((powerId, idx) => {
                const config = powerId ? MARKET_POWERS[powerId] : null;
                const rarityCfg = config ? RARITY_CONFIGS[config.rarity] : null;

                if (config && rarityCfg) {
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        if (powerId === 'GODLY_TELEPORT' && onActivateTeleport) {
                          onActivateTeleport();
                        } else if (powerId === 'TIME_FREEZE' && onActivateTimeFreeze && !isMultiplayer) {
                          onActivateTimeFreeze();
                        } else {
                          setIsOpen(true);
                        }
                      }}
                      className={`relative w-8 h-8 sm:w-9 sm:h-9 rounded-xl border flex items-center justify-center transition-all hover:scale-110 active:scale-95 cursor-pointer ${rarityCfg.borderColor} ${rarityCfg.bgColor} ${rarityCfg.glow}`}
                      title={`${idx + 1}. Yuva: ${config.name} (${rarityCfg.name}) · Çıkarmak veya değiştirmek için tıklayın`}
                    >
                      {renderPowerIcon(config.id, 'w-4 h-4 sm:w-4.5 sm:h-4.5')}
                      {/* Slot number badge */}
                      <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-slate-900 border border-slate-700 text-[8px] font-mono font-black flex items-center justify-center text-slate-300">
                        {idx + 1}
                      </span>
                    </button>
                  );
                }

                // Empty Slot Placeholder
                return (
                  <button
                    key={idx}
                    onClick={() => setIsOpen(true)}
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl border border-dashed border-slate-700/80 hover:border-cyan-400/70 bg-slate-900/60 flex items-center justify-center text-slate-500 hover:text-cyan-400 transition-all hover:scale-105 cursor-pointer group"
                    title={`${idx + 1}. Boş Yuva · Envanterden güç seçmek için tıklayın`}
                  >
                    <Plus className="w-3.5 h-3.5 group-hover:scale-125 transition-transform" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 2. SONSUZ GÜÇ ENVANTERİ MODAL / PANELİ */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md animate-fade-in select-none">
          <div className="relative w-full max-w-3xl bg-slate-900 border-2 border-cyan-500/50 rounded-2xl sm:rounded-3xl shadow-[0_0_60px_rgba(6,182,212,0.35)] overflow-hidden flex flex-col h-[88vh] max-h-[720px]">
            {/* Header */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-slate-800 bg-slate-950/90 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 shadow-sm">
                  <Backpack className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
                      SONSUZ GÜÇ ENVANTERİ
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-mono font-bold border border-cyan-500/40">
                      KAPASİTE: ∞ (SONSUZ)
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    5 Adet Güç Seçebilirsiniz · Seçtiğiniz 5 güç arenada yılanınızda aktif olur
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                aria-label="Kapat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 5 AKTİF KUŞANILAN GÜÇ YUVALARI (LOADOUT SLOTS) */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800 shrink-0">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-black text-white tracking-wide">
                    AKTİF 5 GÜÇ YUVASI
                  </span>
                  <span className="text-[11px] font-mono font-bold text-amber-300 bg-amber-500/15 px-2 py-0.5 rounded-full border border-amber-500/30">
                    {activeLoadout.length} / 5 SEÇİLİ
                  </span>
                </div>
                {activeLoadout.length === 5 && (
                  <span className="text-[10px] text-emerald-400 font-mono font-bold">
                    ✓ Tüm yuvalar dolu
                  </span>
                )}
              </div>

              {/* 5 Slot Display Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                {slots.map((powerId, idx) => {
                  const config = powerId ? MARKET_POWERS[powerId] : null;
                  const rarityCfg = config ? RARITY_CONFIGS[config.rarity] : null;

                  if (config && rarityCfg) {
                    return (
                      <div
                        key={idx}
                        className={`relative p-2.5 rounded-xl border flex flex-col justify-between gap-1.5 ${rarityCfg.borderColor} ${rarityCfg.bgColor} ${rarityCfg.glow} transition-all`}
                      >
                        <div className="flex items-start justify-between gap-1">
                          <div className="flex items-center gap-1.5 min-w-0">
                            {renderPowerIcon(config.id, 'w-4 h-4 shrink-0')}
                            <span className="text-[11px] font-black text-white truncate">
                              {config.name}
                            </span>
                          </div>
                          <button
                            onClick={() => onUnequipPower(config.id)}
                            className="p-1 rounded-md bg-slate-900/80 hover:bg-red-500/30 hover:text-red-300 text-slate-400 transition-colors shrink-0 cursor-pointer"
                            title="Yuvadan Çıkar"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>

                        <div className="flex items-center justify-between text-[9px] font-mono">
                          <span className={`font-black ${rarityCfg.textColor}`}>
                            {rarityCfg.name}
                          </span>
                          <span className="text-slate-400">
                            [Slot #{idx + 1}]
                          </span>
                        </div>
                      </div>
                    );
                  }

                  // Empty Slot
                  return (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl border border-dashed border-slate-700/80 bg-slate-950/40 flex flex-col items-center justify-center text-center gap-1 text-slate-500"
                    >
                      <Plus className="w-4 h-4 text-slate-600" />
                      <span className="text-[10px] font-bold">
                        Slot #{idx + 1} Boş
                      </span>
                      <span className="text-[9px] text-slate-600">
                        Güç Seçin
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Rarity Filter Tabs */}
            <div className="flex items-center gap-1.5 px-4 sm:px-6 py-2 border-b border-slate-800 bg-slate-950/40 overflow-x-auto shrink-0">
              <span className="text-[11px] text-slate-400 font-bold mr-1 shrink-0">
                Filtre:
              </span>
              {[
                { id: 'ALL', label: 'Tümü' },
                { id: 'MYTHIC', label: '🔴 Mitolojik (%0.01)' },
                { id: 'LEGENDARY', label: '🟡 Efsanevi (%0.1)' },
                { id: 'EPIC', label: '🟣 Epik (%30.0)' },
                { id: 'RARE', label: '🔵 Nadir (%34.9)' },
                { id: 'COMMON', label: '🟢 Yaygın (%35.0)' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilterRarity(tab.id as any)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    filterRarity === tab.id
                      ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/25'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* INFINITE INVENTORY ITEMS GRID (SONSUZ DEPOLAMA) */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>
                  Sahip Olduğunuz Güçler ({filteredInventory.length} adet):
                </span>
                <span className="font-mono text-cyan-400 text-[11px]">
                  Kapasite Sınırı Yoktur (∞)
                </span>
              </div>

              {filteredInventory.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col items-center justify-center gap-2">
                  <Backpack className="w-8 h-8 text-slate-600 mb-1" />
                  <p className="text-sm font-bold text-slate-300">
                    Bu filtrede envanterinizde güç bulunmuyor.
                  </p>
                  <p className="text-xs text-slate-400 max-w-sm">
                    Siber Marketten yeni mitolojik, efsanevi, epik ve nadir güçler satın alarak sonsuz envanterinize ekleyebilirsiniz.
                  </p>
                  {onOpenShop && (
                    <button
                      onClick={() => {
                        setIsOpen(false);
                        onOpenShop();
                      }}
                      className="mt-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Siber Markete Git</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {filteredInventory.map((powerId) => {
                    const config = MARKET_POWERS[powerId];
                    if (!config) return null;
                    const rarityCfg = RARITY_CONFIGS[config.rarity];
                    const isEquipped = activeLoadout.includes(powerId);
                    const isLoadoutFull = activeLoadout.length >= 5;

                    return (
                      <div
                        key={powerId}
                        className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                          isEquipped
                            ? `${rarityCfg.borderColor} ${rarityCfg.bgColor} ${rarityCfg.glow} ring-1 ring-cyan-400/50`
                            : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div>
                          {/* Top row: Rarity tag & Status */}
                          <div className="flex items-center justify-between mb-1.5">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${rarityCfg.badgeBg}`}
                            >
                              {rarityCfg.name} ({rarityCfg.chanceLabel} Şans)
                            </span>
                            {isEquipped && (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-black border border-emerald-500/40">
                                ✓ Kuşanıldı
                              </span>
                            )}
                          </div>

                          <div className="flex items-start gap-2.5 mt-1">
                            <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 shrink-0">
                              {renderPowerIcon(config.id, 'w-5 h-5')}
                            </div>
                            <div>
                              <h4 className="font-black text-sm text-white">
                                {config.name}
                              </h4>
                              <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">
                                {config.description}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                          {isEquipped ? (
                            <button
                              type="button"
                              onClick={() => onUnequipPower(powerId)}
                              className="w-full py-1.5 px-3 rounded-xl bg-emerald-500/20 hover:bg-red-500/20 text-emerald-300 hover:text-red-300 border border-emerald-500/40 hover:border-red-500/40 text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Kuşanıldı · Çıkarmak için tıkla</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => onEquipPower(powerId)}
                              disabled={isLoadoutFull}
                              className={`w-full py-1.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md ${
                                !isLoadoutFull
                                  ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 active:scale-95'
                                  : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                              }`}
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>
                                {!isLoadoutFull
                                  ? 'Kuşan (5 Yuvaya Ekle)'
                                  : '5/5 Dolu (Önce birini çıkarın)'}
                              </span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer with Shop Trigger */}
            <div className="px-4 sm:px-6 py-3 border-t border-slate-800 bg-slate-950/90 flex items-center justify-between text-xs text-slate-400 shrink-0">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-cyan-400" />
                <span>
                  Envanter alanı <strong>sonsuzdur</strong>. Dilediğiniz kadar güç saklayabilir, 5 tanesini seçebilirsiniz.
                </span>
              </div>

              <div className="flex items-center gap-2">
                {onOpenShop && (
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      onOpenShop();
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Market</span>
                  </button>
                )}

                <button
                  onClick={() => setIsOpen(false)}
                  className="px-5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition-colors cursor-pointer"
                >
                  Kapat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
