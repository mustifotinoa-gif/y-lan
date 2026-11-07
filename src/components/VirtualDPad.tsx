import React, { useRef, useState, useEffect } from 'react';
import { Zap, ShoppingBag, Smartphone, Monitor, Keyboard, MousePointer, Hourglass, Lock, Crosshair } from 'lucide-react';

interface VirtualControlsProps {
  onSteerAngle: (angle: number) => void;
  onBoostStart: () => void;
  onBoostEnd: () => void;
  onOpenShop: () => void;
  isBoosting: boolean;
  timeFreezeCharges?: number;
  timeFreezeRemainingMs?: number;
  timeFreezeCooldownMs?: number;
  isMultiplayer?: boolean;
  onActivateTimeFreeze?: () => void;
  hasGodlyTeleport?: boolean;
  teleportCharges?: number;
  onActivateTeleport?: () => void;
  isTurboUnlocked?: boolean;
}

export const VirtualDPad: React.FC<VirtualControlsProps> = ({
  onSteerAngle,
  onBoostStart,
  onBoostEnd,
  onOpenShop,
  isBoosting,
  timeFreezeCharges = 0,
  timeFreezeRemainingMs = 0,
  timeFreezeCooldownMs = 0,
  isMultiplayer = false,
  onActivateTimeFreeze,
  hasGodlyTeleport = false,
  teleportCharges = 0,
  onActivateTeleport,
  isTurboUnlocked = false,
}) => {
  const joystickRef = useRef<HTMLDivElement | null>(null);
  const [knobPos, setKnobPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  // Auto-detect if device has touch capability
  const [isTouchDevice, setIsTouchDevice] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  });

  // User preference for showing virtual controls (defaults to true on touch devices)
  const [showTouchControls, setShowTouchControls] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('cybersnake_touch_controls');
      if (saved !== null) return saved === 'true';
    } catch {}
    return typeof window !== 'undefined'
      ? 'ontouchstart' in window || navigator.maxTouchPoints > 0 || window.innerWidth < 768
      : true;
  });

  useEffect(() => {
    const checkTouch = () => {
      const touchAvailable = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      setIsTouchDevice(touchAvailable);
    };
    window.addEventListener('resize', checkTouch);
    return () => window.removeEventListener('resize', checkTouch);
  }, []);

  const toggleTouchControls = () => {
    setShowTouchControls((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('cybersnake_touch_controls', String(next));
      } catch {}
      return next;
    });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!joystickRef.current) return;
    const touch = e.touches[0];
    const rect = joystickRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = touch.clientX - centerX;
    const dy = touch.clientY - centerY;
    const dist = Math.hypot(dx, dy);
    const maxRadius = 40;

    const clampedDist = Math.min(dist, maxRadius);
    const angle = Math.atan2(dy, dx);

    setKnobPos({
      x: Math.cos(angle) * clampedDist,
      y: Math.sin(angle) * clampedDist,
    });

    onSteerAngle(angle);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    handleTouchMove(e);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    setKnobPos({ x: 0, y: 0 });
  };

  const triggerHaptic = () => {
    try {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(12);
      }
    } catch {}
  };

  return (
    <div className="w-full max-w-[840px] mx-auto mt-2 flex flex-col gap-1.5 select-none touch-none">
      {/* Device Mode Switcher / Helper Strip */}
      <div className="flex items-center justify-between px-3 py-1 rounded-lg bg-slate-900/60 border border-slate-800/80 text-[11px] text-slate-400">
        {/* Left: Desktop Hotkeys Guide for PC users */}
        <div className="hidden sm:flex items-center gap-3 text-slate-400 font-mono text-[10px]">
          <span className="flex items-center gap-1 text-cyan-400 font-sans font-semibold">
            <MousePointer className="w-3 h-3" />
            <span>Fare: Yönlendir</span>
          </span>
          <span>·</span>
          {isTurboUnlocked ? (
            <span className="flex items-center gap-1 text-amber-400 font-sans font-semibold">
              <Zap className="w-3 h-3" />
              <span>Sol Tık / Space: Turbo</span>
            </span>
          ) : (
            <button
              onClick={onOpenShop}
              className="flex items-center gap-1 text-amber-400/80 font-sans font-semibold hover:text-amber-300 transition-colors cursor-pointer"
              title="Turbo kilitli. Markette satın alın!"
            >
              <Lock className="w-3 h-3 text-amber-400" />
              <span>Turbo: Markette Satılır (5.000 🪙)</span>
            </button>
          )}
          <span>·</span>
          <span className="flex items-center gap-1">
            <Keyboard className="w-3 h-3" />
            <span>WASD: Dönüş</span>
          </span>
          <span>·</span>
          <span>[U] Market</span>
          <span>·</span>
          <span>[Z] Zoom</span>
        </div>

        {/* Mobile quick reminder */}
        <div className="flex sm:hidden items-center gap-1 text-slate-400 text-[10px]">
          <span>📱 Dokunarak veya Joystick ile Yönlendir</span>
        </div>

        {/* Right: Quick Toggle for Virtual Controls on/off */}
        <button
          onClick={toggleTouchControls}
          className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-semibold transition-colors"
          title="Dokunmatik kontrolleri göster veya gizle"
        >
          {showTouchControls ? (
            <>
              <Smartphone className="w-3 h-3 text-cyan-400" />
              <span>Sanal Kontroller: Açık</span>
            </>
          ) : (
            <>
              <Monitor className="w-3 h-3 text-amber-400" />
              <span>Masaüstü Modu (Gizli)</span>
            </>
          )}
        </button>
      </div>

      {/* On-Screen Mobile Virtual Controls (Joystick & Turbo Button) */}
      {showTouchControls && (
        <div className="flex items-center justify-between px-2 sm:px-6 py-1 select-none touch-none">
          {/* 360° Analog Joystick on the left */}
          <div
            ref={joystickRef}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={handleTouchEnd}
            className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-slate-900/85 border-2 border-slate-700/80 backdrop-blur-md flex items-center justify-center shadow-lg active:border-cyan-500/70"
          >
            <div className="absolute inset-2 rounded-full border border-dashed border-slate-700/50" />
            <div
              className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 shadow-md transition-transform duration-75 flex items-center justify-center ${
                isDragging ? 'scale-110 shadow-cyan-500/60 ring-2 ring-cyan-300' : 'opacity-85'
              }`}
              style={{
                transform: `translate(${knobPos.x}px, ${knobPos.y}px)`,
              }}
            >
              <div className="w-3.5 h-3.5 rounded-full bg-slate-950/40" />
            </div>
            <span className="absolute bottom-1 text-[8px] text-slate-500 font-mono font-bold uppercase pointer-events-none">
              YÖN
            </span>
          </div>

          {/* Action Buttons on the right: Turbo Sprint & Shop */}
          <div className="flex items-center gap-3">
            {/* Time Freeze Mobile Button (Solo Mode Only) */}
            {!isMultiplayer && (
              <button
                onClick={() => {
                  triggerHaptic();
                  if (timeFreezeRemainingMs <= 0) {
                    if (timeFreezeCharges > 0 && onActivateTimeFreeze) {
                      onActivateTimeFreeze();
                    } else {
                      onOpenShop();
                    }
                  }
                }}
                className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex flex-col items-center justify-center shadow-md active:scale-95 transition-all cursor-pointer ${
                  timeFreezeRemainingMs > 0
                    ? 'bg-cyan-400 text-slate-950 ring-2 ring-cyan-200 animate-pulse'
                    : timeFreezeCooldownMs > 0
                    ? 'bg-amber-500/15 border-2 border-amber-500/40 text-amber-300 opacity-90'
                    : timeFreezeCharges > 0
                    ? 'bg-cyan-500/20 border-2 border-cyan-400/80 text-cyan-300 shadow-cyan-500/25'
                    : 'bg-slate-900/80 border border-slate-700/80 text-slate-400'
                }`}
                title={
                  timeFreezeCooldownMs > 0
                    ? `Bekleme Süresi: ${Math.ceil(timeFreezeCooldownMs / 1000)}s`
                    : 'Zamanı Dondur (10s) - [G] Tuşu'
                }
              >
                <Hourglass className={`w-4 h-4 mb-0.5 ${timeFreezeRemainingMs > 0 ? 'animate-spin' : timeFreezeCooldownMs > 0 ? 'text-amber-400 animate-pulse' : ''}`} />
                <span className="text-[7.5px] font-mono font-bold">
                  {timeFreezeRemainingMs > 0
                    ? `${(timeFreezeRemainingMs / 1000).toFixed(0)}s`
                    : timeFreezeCooldownMs > 0
                    ? `${Math.ceil(timeFreezeCooldownMs / 1000)}s`
                    : timeFreezeCharges > 0
                    ? 'DONDUR (G)'
                    : 'MARKET'}
                </span>
              </button>
            )}

            {/* Tanrısal Işınlanma Mobile Button (Lâcivert) */}
            {(hasGodlyTeleport || teleportCharges > 0) && onActivateTeleport && (
              <button
                onClick={() => {
                  triggerHaptic();
                  onActivateTeleport();
                }}
                disabled={teleportCharges <= 0}
                className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex flex-col items-center justify-center shadow-md active:scale-95 transition-all cursor-pointer ${
                  teleportCharges > 0
                    ? 'bg-gradient-to-br from-blue-950 via-indigo-950 to-blue-900 border-2 border-blue-500 text-cyan-200 shadow-[0_0_12px_rgba(30,58,138,0.7)]'
                    : 'bg-slate-900/60 border border-slate-800 text-slate-500 cursor-not-allowed opacity-50'
                }`}
                title={`Tanrısal Işınlanma (${teleportCharges}/2)`}
              >
                <Crosshair className={`w-4 h-4 mb-0.5 ${teleportCharges > 0 ? 'text-cyan-300 animate-pulse' : 'text-slate-500'}`} />
                <span className="text-[7.5px] font-mono font-black">
                  {teleportCharges > 0 ? `IŞINLAN (${teleportCharges})` : 'BİTTİ'}
                </span>
              </button>
            )}

            {/* Quick Shop Button */}
            <button
              onClick={onOpenShop}
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-300 flex flex-col items-center justify-center shadow-md active:scale-95 cursor-pointer"
              title="Market (U)"
            >
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 mb-0.5" />
              <span className="text-[8px] font-bold font-mono">MARKET</span>
            </button>

            {/* Big Turbo Sprint Button */}
            {isTurboUnlocked ? (
              <button
                onTouchStart={(e) => {
                  e.preventDefault();
                  triggerHaptic();
                  onBoostStart();
                }}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  onBoostEnd();
                }}
                onTouchCancel={(e) => {
                  e.preventDefault();
                  onBoostEnd();
                }}
                onMouseDown={onBoostStart}
                onMouseUp={onBoostEnd}
                className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full flex flex-col items-center justify-center font-black text-xs uppercase tracking-wider transition-all shadow-xl active:scale-95 cursor-pointer ${
                  isBoosting
                    ? 'bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 text-slate-950 scale-105 shadow-orange-500/50 ring-4 ring-amber-300/60'
                    : 'bg-slate-900/90 border-2 border-amber-500/60 text-amber-400 hover:bg-slate-800'
                }`}
              >
                <Zap className="w-6 h-6 sm:w-7 sm:h-7 fill-current mb-0.5" />
                <span className="text-[10px] sm:text-xs">TURBO</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  triggerHaptic();
                  onOpenShop();
                }}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full flex flex-col items-center justify-center font-black text-xs uppercase tracking-wider transition-all shadow-xl bg-slate-950/90 border-2 border-amber-500/40 text-amber-400/80 hover:bg-slate-900 hover:border-amber-400 active:scale-95 cursor-pointer"
                title="Turbo kilitli! Markette Efsanevi Turbo satın alın (5.000 Coin)"
              >
                <Lock className="w-5 h-5 sm:w-6 sm:h-6 mb-0.5 text-amber-400" />
                <span className="text-[9px] sm:text-[10px] leading-tight font-black">
                  TURBO KİLİTLİ
                </span>
                <span className="text-[7.5px] font-mono text-amber-300 font-bold">
                  5.000 🪙 Market
                </span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
