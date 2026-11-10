import React, { useEffect, useState, useRef } from 'react';
import { Sparkles, Zap, Flame, ShieldAlert, FastForward, Lock, Unlock, Crosshair } from 'lucide-react';
import { SummonCrateType, SummonResultItem } from '../types/game';
import { sound } from '../services/audio';
import { ThreeCyberCrate } from './ThreeCyberCrate';

interface CyberCrateAnimationProps {
  isOpen: boolean;
  crateType: SummonCrateType;
  count: 1 | 10;
  results: SummonResultItem[];
  onComplete: () => void;
  onSkip: () => void;
}

type AnimationStage = 'SCANNING' | 'OVERLOAD' | 'BURST' | 'FINISHED';

export const CyberCrateAnimation: React.FC<CyberCrateAnimationProps> = ({
  isOpen,
  crateType,
  count,
  results,
  onComplete,
  onSkip,
}) => {
  const [stage, setStage] = useState<AnimationStage>('SCANNING');
  const [scanProgress, setScanProgress] = useState<number>(0);
  const [sparkParticles, setSparkParticles] = useState<Array<{ id: number; x: number; y: number; vx: number; vy: number; color: string; size: number }>>([]);
  const hasTriggeredBurstSound = useRef(false);

  const hasGodly = results.some((r) => r.rarity === 'GODLY');
  const hasMythic = results.some((r) => r.rarity === 'MYTHIC');
  const isMythicCrate = crateType === 'MYTHIC_CRATE';

  // Primary Neon Color Themes
  const primaryNeon = hasGodly
    ? '#38bdf8' // Celestial Cyan
    : isMythicCrate || hasMythic
    ? '#ef4444' // Neon Crimson
    : '#00e5ff'; // Cyber Cyan

  const glowNeon = hasGodly
    ? 'rgba(30, 58, 138, 0.9)' // Lâcivert Navy
    : isMythicCrate || hasMythic
    ? 'rgba(239, 68, 68, 0.85)' // Mythic Crimson
    : 'rgba(0, 229, 255, 0.75)'; // Electric Cyan

  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
  const onSkipRef = useRef(onSkip);
  onSkipRef.current = onSkip;

  // Timeline orchestration
  useEffect(() => {
    if (!isOpen) {
      setStage('SCANNING');
      setScanProgress(0);
      hasTriggeredBurstSound.current = false;
      return;
    }

    sound.playCrateCharging();

    // Stage 1: Progress scan (0 to 1000ms)
    const scanInterval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(scanInterval);
          return 100;
        }
        return prev + 14;
      });
    }, 80);

    // Stage 2: Overload & Shake (1000ms to 2000ms)
    const tOverload = setTimeout(() => {
      setStage('OVERLOAD');
    }, 1000);

    // Stage 3: Burst Explosion (2000ms to 4000ms)
    const tBurst = setTimeout(() => {
      setStage('BURST');
      if (!hasTriggeredBurstSound.current) {
        hasTriggeredBurstSound.current = true;
        sound.playCrateBurst(hasGodly, hasMythic);
      }
    }, 2000);

    // Stage 4: Finish & Show Cards (at 4000ms)
    const tFinish = setTimeout(() => {
      setStage('FINISHED');
      onCompleteRef.current();
    }, 4000);

    return () => {
      clearInterval(scanInterval);
      clearTimeout(tOverload);
      clearTimeout(tBurst);
      clearTimeout(tFinish);
    };
  }, [isOpen, hasGodly, hasMythic]);

  // Generate glowing sparks during overload
  useEffect(() => {
    if (stage !== 'OVERLOAD' && stage !== 'BURST') return;

    const interval = setInterval(() => {
      const pColor = hasGodly
        ? (Math.random() < 0.6 ? '#1e3a8a' : '#38bdf8')
        : isMythicCrate
        ? (Math.random() < 0.7 ? '#ef4444' : '#fbbf24')
        : '#00e5ff';

      const newSparks = Array.from({ length: stage === 'BURST' ? 12 : 5 }).map((_, i) => ({
        id: Date.now() + Math.random() + i,
        x: 50 + (Math.random() - 0.5) * 40,
        y: 50 + (Math.random() - 0.5) * 30,
        vx: (Math.random() - 0.5) * 16,
        vy: -Math.random() * 14 - 3,
        color: pColor,
        size: Math.random() * 4 + 2,
      }));

      setSparkParticles((prev) => [...prev.slice(-40), ...newSparks]);
    }, 80);

    return () => clearInterval(interval);
  }, [stage, hasGodly, isMythicCrate]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-70 flex items-center justify-center bg-black/95 backdrop-blur-xl animate-fade-in select-none overflow-hidden">
      {/* 1. Cyberpunk Synthwave Neon Grid Floor */}
      <div className="absolute inset-0 pointer-events-none opacity-35 bg-[radial-gradient(#1e3a8a_1px,transparent_1px)] [background-size:24px_24px]" />
      <div
        className="absolute inset-x-0 bottom-0 h-72 pointer-events-none opacity-40 bg-gradient-to-t from-cyan-950/40 via-red-950/20 to-transparent"
        style={{
          perspective: '600px',
          backgroundImage:
            'linear-gradient(to right, rgba(0,229,255,0.15) 1px, transparent 1px), linear-gradient(to bottom, rgba(239,68,68,0.15) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          transform: 'rotateX(55deg) translateY(60px)',
        }}
      />

      {/* Top Cyber HUD Bar */}
      <div className="absolute top-4 inset-x-4 sm:inset-x-8 flex items-center justify-between z-20">
        <div className="flex items-center gap-2">
          <div className="px-2.5 py-1 rounded-lg bg-slate-900/90 border border-slate-700 text-xs font-mono font-bold flex items-center gap-2 shadow-lg">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-slate-300">
              {isMythicCrate ? '🔴 PROTOKOL: MİTOLOJİK BOYUT KUTUSU' : '📦 PROTOKOL: STANDART SİBER SANDIK'}
            </span>
            <span className="text-cyan-400 font-black">[{count}x SUMMON]</span>
          </div>
        </div>

        {/* Skip Animation Button */}
        <button
          onClick={onSkip}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border-2 border-cyan-400/80 hover:border-cyan-300 text-cyan-300 font-mono font-black text-xs transition-all active:scale-95 shadow-[0_0_15px_rgba(6,182,212,0.4)] cursor-pointer"
        >
          <FastForward className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span>⚡ ATLA (SKIP)</span>
        </button>
      </div>

      {/* Scanline CRT Overlay */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] opacity-40 z-10" />

      {/* Central Cyber Crate Visual Container */}
      <div className="relative flex flex-col items-center justify-center z-20 max-w-lg w-full px-4">
        {/* Stage Status Display */}
        <div className="mb-6 text-center space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/70 border border-slate-700/80 backdrop-blur-md shadow-lg">
            {stage === 'SCANNING' && <Lock className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />}
            {stage === 'OVERLOAD' && <Flame className="w-3.5 h-3.5 text-red-400 animate-bounce" />}
            {stage === 'BURST' && <Unlock className="w-3.5 h-3.5 text-amber-300 animate-spin" />}
            <span
              className="text-xs font-mono font-black uppercase tracking-wider"
              style={{ color: primaryNeon }}
            >
              {stage === 'SCANNING' && `BİYOMETRİK ŞİFRE ÇÖZÜLÜYOR (${scanProgress}%)`}
              {stage === 'OVERLOAD' && '⚠️ KUANTUM ÇEKİRDEĞİ AŞIRI YÜKLENDİ!'}
              {stage === 'BURST' && (hasGodly ? '🌌 TANRISAL LÂCİVERT ENERJİ PATLAMASI!' : hasMythic ? '🔴 MİTOLOJİK GÜÇ SALINDI!' : '⚡ SİBER ENERJİ SERBEST KALDI!')}
            </span>
          </div>

          <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight drop-shadow-[0_0_20px_rgba(255,255,255,0.4)]">
            {isMythicCrate ? 'MİTOLOJİK SİBER SANDIK AÇILIYOR' : 'SİBER STANDART SANDIK AÇILIYOR'}
          </h3>

          {/* Biometric Scan Progress Bar */}
          <div className="w-64 sm:w-80 h-2 bg-slate-950 rounded-full border border-slate-800 overflow-hidden mx-auto mt-2 p-0.5">
            <div
              className="h-full rounded-full transition-all duration-150"
              style={{
                width: `${scanProgress}%`,
                backgroundColor: primaryNeon,
                boxShadow: `0 0 12px ${primaryNeon}`,
              }}
            />
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* REAL 3D PROCEDURAL WEBGL CYBER CHEST (THREE.JS)              */}
        {/* ------------------------------------------------------------- */}
        <div className="relative w-full max-w-lg h-72 sm:h-84 flex items-center justify-center my-1">
          {/* Radial Neon Backlight Aura */}
          <div
            className={`absolute inset-0 rounded-full blur-3xl pointer-events-none transition-all duration-700 ${
              stage === 'BURST'
                ? 'opacity-90 scale-125'
                : stage === 'OVERLOAD'
                ? 'opacity-70 scale-110'
                : 'opacity-40 scale-95'
            }`}
            style={{
              background: `radial-gradient(circle, ${glowNeon} 0%, transparent 70%)`,
            }}
          />

          {/* 3D WebGL Canvas */}
          <ThreeCyberCrate
            stage={stage}
            crateType={crateType}
            hasGodly={hasGodly}
            hasMythic={hasMythic}
            scanProgress={scanProgress}
          />

          {/* Radial Shockwave Rings during Burst */}
          {stage === 'BURST' && (
            <div className="absolute inset-4 rounded-full border-4 border-cyan-300 animate-ping pointer-events-none" />
          )}

          {/* Floating Neon Sparks / Steam Embers */}
          {sparkParticles.map((sp) => (
            <div
              key={sp.id}
              className="absolute pointer-events-none rounded-full animate-ping"
              style={{
                left: `${sp.x}%`,
                top: `${sp.y}%`,
                width: `${sp.size}px`,
                height: `${sp.size}px`,
                backgroundColor: sp.color,
                boxShadow: `0 0 10px ${sp.color}`,
              }}
            />
          ))}
        </div>

        {/* Bottom Ambient Cyber Runes & Quick Reveal Action */}
        <div className="mt-4 flex flex-col items-center gap-2">
          {stage === 'BURST' ? (
            <button
              onClick={onSkip}
              className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 text-white font-mono font-black text-xs uppercase tracking-wider shadow-[0_0_25px_rgba(239,68,68,0.7)] animate-bounce cursor-pointer flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-yellow-200 animate-spin" />
              <span>KARTLARI GÖRÜNTÜLE ➔</span>
            </button>
          ) : (
            <div className="flex items-center justify-center gap-3 text-[11px] font-mono text-slate-400">
              <span className="flex items-center gap-1 text-cyan-400 font-bold">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>DECRYPT: 0x9F_VAULT</span>
              </span>
              <span>·</span>
              <span>ÇEKİRDEK: AKTİF</span>
              <span>·</span>
              <span className="text-amber-400 font-black">
                {hasGodly ? '🌌 TANRISAL ANOMALİ!' : isMythicCrate ? '🔴 MİTOLOJİK FREKANS' : '⚡ SİBER ALAN'}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
