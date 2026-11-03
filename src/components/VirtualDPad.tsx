import React, { useRef, useState } from 'react';
import { Zap, ShoppingBag } from 'lucide-react';

interface VirtualControlsProps {
  onSteerAngle: (angle: number) => void;
  onBoostStart: () => void;
  onBoostEnd: () => void;
  onOpenShop: () => void;
  isBoosting: boolean;
}

export const VirtualDPad: React.FC<VirtualControlsProps> = ({
  onSteerAngle,
  onBoostStart,
  onBoostEnd,
  onOpenShop,
  isBoosting,
}) => {
  const joystickRef = useRef<HTMLDivElement | null>(null);
  const [knobPos, setKnobPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!joystickRef.current) return;
    const touch = e.touches[0];
    const rect = joystickRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = touch.clientX - centerX;
    const dy = touch.clientY - centerY;
    const dist = Math.hypot(dx, dy);
    const maxRadius = 45;

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

  return (
    <div className="w-full max-w-[620px] mx-auto mt-2 flex items-center justify-between px-4 select-none touch-none">
      {/* 360° Analog Joystick on the left */}
      <div
        ref={joystickRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        className="relative w-28 h-28 rounded-full bg-slate-900/80 border-2 border-slate-700/80 backdrop-blur-md flex items-center justify-center shadow-lg"
      >
        <div className="absolute inset-2 rounded-full border border-dashed border-slate-700/50" />
        <div
          className={`w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 shadow-md transition-transform duration-75 flex items-center justify-center ${
            isDragging ? 'scale-110 shadow-cyan-500/50' : 'opacity-80'
          }`}
          style={{
            transform: `translate(${knobPos.x}px, ${knobPos.y}px)`,
          }}
        >
          <div className="w-4 h-4 rounded-full bg-slate-950/40" />
        </div>
      </div>

      {/* Action Buttons on the right: Turbo Boost & Shop */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenShop}
          className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-300 flex items-center justify-center shadow-md active:scale-95"
          title="Market"
        >
          <ShoppingBag className="w-5 h-5" />
        </button>

        {/* Big Turbo Sprint Button */}
        <button
          onTouchStart={(e) => {
            e.preventDefault();
            onBoostStart();
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            onBoostEnd();
          }}
          onMouseDown={onBoostStart}
          onMouseUp={onBoostEnd}
          className={`w-20 h-20 rounded-full flex flex-col items-center justify-center font-bold text-xs uppercase tracking-wider transition-all shadow-xl active:scale-95 ${
            isBoosting
              ? 'bg-gradient-to-br from-amber-400 to-rose-500 text-slate-950 scale-105 shadow-rose-500/40'
              : 'bg-slate-900/90 border-2 border-amber-500/60 text-amber-400 hover:bg-slate-800'
          }`}
        >
          <Zap className="w-6 h-6 fill-current mb-0.5" />
          <span>TURBO</span>
        </button>
      </div>
    </div>
  );
};
