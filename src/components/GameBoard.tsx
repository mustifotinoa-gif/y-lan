import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  ARENA_RADIUS,
  ARENA_SIZE,
  FOOD_CATALOG,
  SEGMENT_RADIUS,
} from '../constants/gameConfig';
import { FoodItem, LiveStandingItem } from '../types/game';
import { Maximize2, Minimize2, Zap, Crown } from 'lucide-react';

interface GameBoardProps {
  engineRef: React.MutableRefObject<any>;
  theme?: 'dark' | 'light';
  isBoosting: boolean;
  onSteerAngle: (angle: number) => void;
  onBoostStart: () => void;
  onBoostEnd: () => void;
  liveStandings: LiveStandingItem[];
  playerRank: number;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  engineRef,
  theme = 'dark',
  isBoosting,
  onSteerAngle,
  onBoostStart,
  onBoostEnd,
  liveStandings,
  playerRank,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isZoomedOut, setIsZoomedOut] = useState(false);

  // Mouse & Pointer Steering
  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const pointerScreenX = e.clientX - rect.left;
      const pointerScreenY = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const dx = pointerScreenX - centerX;
      const dy = pointerScreenY - centerY;

      if (Math.hypot(dx, dy) > 8) {
        const targetAngle = Math.atan2(dy, dx);
        onSteerAngle(targetAngle);
      }
    },
    [onSteerAngle]
  );

  // Mobile Touch Steering (Single touch steers, 2nd touch boosts!)
  const handleTouchMove = useCallback(
    (e: React.TouchEvent<HTMLCanvasElement>) => {
      if (e.touches.length === 0) return;
      const touch = e.touches[0];
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const touchX = touch.clientX - rect.left;
      const touchY = touch.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const dx = touchX - centerX;
      const dy = touchY - centerY;

      if (Math.hypot(dx, dy) > 8) {
        const targetAngle = Math.atan2(dy, dx);
        onSteerAngle(targetAngle);
      }

      // If 2 or more fingers on screen on mobile, activate Turbo Boost!
      if (e.touches.length >= 2) {
        onBoostStart();
      }
    },
    [onSteerAngle, onBoostStart]
  );

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    handleTouchMove(e);
    if (e.touches.length >= 2) {
      onBoostStart();
    }
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length < 2) {
      onBoostEnd();
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (e.button === 2 || e.shiftKey) {
      onBoostStart();
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (e.button === 2 || e.shiftKey) {
      onBoostEnd();
    }
  };

  // Toggle zoom with Z key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'z' || e.key === 'Z') {
        setIsZoomedOut((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  // 120 FPS High-Performance Rendering Loop (zero React state overhead)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let animId: number;
    let bubbleTime = 0;

    const render = () => {
      const eng = engineRef.current;
      if (!eng) {
        animId = requestAnimationFrame(render);
        return;
      }

      bubbleTime += 0.04;

      // Handle DPI and Resizing
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const width = rect.width;
      const height = rect.height;

      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);

      // Camera view setup: Player is centered on screen
      const zoom = isZoomedOut ? 0.45 : 0.85;
      const camX = eng.playerX;
      const camY = eng.playerY;

      // World to Screen transformation
      const toScreenX = (wx: number) => (wx - camX) * zoom + width / 2;
      const toScreenY = (wy: number) => (wy - camY) * zoom + height / 2;

      // 1. Draw Arena Background (Dark or Light Theme)
      ctx.fillStyle = theme === 'light' ? '#f8fafc' : '#06070b';
      ctx.fillRect(0, 0, width, height);

      // 2. Draw Cyber Hexagonal / Grid Lines
      ctx.save();
      ctx.strokeStyle = theme === 'light' ? 'rgba(148, 163, 184, 0.25)' : 'rgba(30, 41, 59, 0.35)';
      ctx.lineWidth = 1;

      const gridSize = 70;
      const offsetX = toScreenX(0) % (gridSize * zoom);
      const offsetY = toScreenY(0) % (gridSize * zoom);

      ctx.beginPath();
      for (let x = offsetX; x < width; x += gridSize * zoom) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      for (let y = offsetY; y < height; y += gridSize * zoom) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();
      ctx.restore();

      // 3. Draw Arena Circular Boundary
      const centerScreenX = toScreenX(ARENA_SIZE / 2);
      const centerScreenY = toScreenY(ARENA_SIZE / 2);
      const screenRadius = ARENA_RADIUS * zoom;

      ctx.save();
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.7)';
      ctx.lineWidth = 6 * zoom;
      ctx.shadowColor = '#00e5ff';
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.arc(centerScreenX, centerScreenY, screenRadius, 0, Math.PI * 2);
      ctx.stroke();

      // Outer Danger Ring
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
      ctx.lineWidth = 2 * zoom;
      ctx.beginPath();
      ctx.arc(centerScreenX, centerScreenY, screenRadius + 12 * zoom, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // 4. Draw Food Items with Halo & User's Floating Poison Bubbles
      eng.foods.forEach((f: FoodItem) => {
        const sx = toScreenX(f.x);
        const sy = toScreenY(f.y);

        // Viewport culling
        if (sx < -40 || sx > width + 40 || sy < -40 || sy > height + 40) return;

        const meta = FOOD_CATALOG[f.type] || FOOD_CATALOG.CHERRY;
        const rad = (f.radius || 8) * zoom;

        // Glowing Aura
        ctx.save();
        ctx.shadowColor = meta.color;
        ctx.shadowBlur = 10;
        ctx.fillStyle = meta.color;
        ctx.beginPath();
        ctx.arc(sx, sy, rad, 0, Math.PI * 2);
        ctx.fill();

        // Inner Core highlight
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(sx - rad * 0.25, sy - rad * 0.25, rad * 0.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Specific Food Symbols (Lahmacun, Golden Apple, Poison, Remains)
        if (meta.symbol) {
          ctx.save();
          ctx.font = `${Math.round(rad * 1.5)}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(meta.symbol, sx, sy);
          ctx.restore();
        }

        // USER REQUEST 2, 3, 4:
        // "zehirli olanlar etrafından küçük yeşil parçacıklar çıksın küçük baloncuklar"
        // "mor olan zehirli yiyecek ise 1 kalp götürsün, yeşil zehir yarım kalp"
        if (f.type === 'GREEN_POISON' || f.type === 'PURPLE_POISON') {
          const isGreen = f.type === 'GREEN_POISON';
          const bubbleColor = isGreen ? 'rgba(132, 204, 22, ' : 'rgba(192, 38, 211, ';

          // Draw 4 orbiting and floating animated bubbles around each poison spore
          for (let b = 0; b < 4; b++) {
            const bPhase = bubbleTime * 2.5 + b * 1.57;
            const bDist = (rad + 6 + Math.sin(bPhase) * 6) * zoom;
            const bx = sx + Math.cos(bPhase) * bDist;
            const by = sy - (bDist * 0.6) - ((bubbleTime * 12 + b * 5) % 18) * zoom;
            const bRadius = (2.2 + Math.sin(bPhase * 1.5) * 1.2) * zoom;
            const bAlpha = Math.max(0.1, 0.85 - (((bubbleTime * 12 + b * 5) % 18) / 18));

            ctx.save();
            ctx.fillStyle = `${bubbleColor}${bAlpha})`;
            ctx.beginPath();
            ctx.arc(bx, by, Math.max(1, bRadius), 0, Math.PI * 2);
            ctx.fill();
            // Tiny bubble gleam
            ctx.fillStyle = `rgba(255, 255, 255, ${bAlpha * 0.8})`;
            ctx.beginPath();
            ctx.arc(bx - bRadius * 0.3, by - bRadius * 0.3, Math.max(0.5, bRadius * 0.35), 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }
        }
      });

      // 5. Draw Bot Snakes (Snake.io Style: Glossy 3D rounded segments + expressive eyes)
      eng.bots.forEach((bot: any) => {
        if (!bot.isAlive || bot.body.length === 0) return;

        const body = bot.body;
        const segRad = SEGMENT_RADIUS * zoom;

        // Draw body from tail to head
        for (let i = body.length - 1; i >= 0; i--) {
          const pt = body[i];
          const sx = toScreenX(pt.x);
          const sy = toScreenY(pt.y);

          if (sx < -30 || sx > width + 30 || sy < -30 || sy > height + 30) continue;

          // Segment gradient for 3D tubular look
          const grad = ctx.createRadialGradient(
            sx - segRad * 0.3,
            sy - segRad * 0.3,
            segRad * 0.1,
            sx,
            sy,
            segRad
          );
          grad.addColorStop(0, bot.headColor);
          grad.addColorStop(0.7, bot.color);
          grad.addColorStop(1, '#020617');

          ctx.save();
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(sx, sy, segRad, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
          ctx.lineWidth = 1.2 * zoom;
          ctx.stroke();
          ctx.restore();
        }

        // Bot Head with Animated Eyes
        const bHead = body[0];
        const hx = toScreenX(bHead.x);
        const hy = toScreenY(bHead.y);

        // Expressive eyes looking towards bot.angle
        const eyeOffset = segRad * 0.55;
        const eyeAngle1 = bot.angle + Math.PI / 3;
        const eyeAngle2 = bot.angle - Math.PI / 3;

        const e1x = hx + Math.cos(eyeAngle1) * eyeOffset;
        const e1y = hy + Math.sin(eyeAngle1) * eyeOffset;
        const e2x = hx + Math.cos(eyeAngle2) * eyeOffset;
        const e2y = hy + Math.sin(eyeAngle2) * eyeOffset;

        const eyeRad = segRad * 0.45;
        const pupilRad = eyeRad * 0.5;

        // White sclera
        ctx.save();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(e1x, e1y, eyeRad, 0, Math.PI * 2);
        ctx.arc(e2x, e2y, eyeRad, 0, Math.PI * 2);
        ctx.fill();

        // Dark pupils looking forward
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(
          e1x + Math.cos(bot.angle) * (eyeRad * 0.35),
          e1y + Math.sin(bot.angle) * (eyeRad * 0.35),
          pupilRad,
          0,
          Math.PI * 2
        );
        ctx.arc(
          e2x + Math.cos(bot.angle) * (eyeRad * 0.35),
          e2y + Math.sin(bot.angle) * (eyeRad * 0.35),
          pupilRad,
          0,
          Math.PI * 2
        );
        ctx.fill();
        ctx.restore();

        // Bot Name Tag
        ctx.save();
        ctx.font = `bold ${Math.max(10, Math.round(11 * zoom))}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 4;
        ctx.fillText(bot.name, hx, hy - segRad - 6 * zoom);
        ctx.restore();
      });

      // 6. Draw Player Snake (Mustafa Kemal / Player Snake)
      const pBody = eng.playerBody;
      const pRad = SEGMENT_RADIUS * zoom;

      // Draw segments from tail to head
      for (let i = pBody.length - 1; i >= 0; i--) {
        const pt = pBody[i];
        const sx = toScreenX(pt.x);
        const sy = toScreenY(pt.y);

        // 3D Tubular Gradient (Cyber Cyan to Emerald)
        const grad = ctx.createRadialGradient(
          sx - pRad * 0.3,
          sy - pRad * 0.3,
          pRad * 0.1,
          sx,
          sy,
          pRad
        );

        if (i === 0) {
          grad.addColorStop(0, '#a5f3fc');
          grad.addColorStop(0.6, '#00e5ff');
          grad.addColorStop(1, '#0e7490');
        } else if (i % 2 === 0) {
          grad.addColorStop(0, '#67e8f9');
          grad.addColorStop(0.6, '#06b6d4');
          grad.addColorStop(1, '#083344');
        } else {
          grad.addColorStop(0, '#6ee7b7');
          grad.addColorStop(0.6, '#10b981');
          grad.addColorStop(1, '#064e3b');
        }

        ctx.save();
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(sx, sy, pRad, 0, Math.PI * 2);
        ctx.fill();

        // Segment Cyber Ring
        ctx.strokeStyle = isBoosting ? 'rgba(251, 191, 36, 0.7)' : 'rgba(255, 255, 255, 0.35)';
        ctx.lineWidth = 1.3 * zoom;
        ctx.stroke();
        ctx.restore();
      }

      // Player Head with Expressive Eyes & Turbo Glow
      const pHx = toScreenX(eng.playerX);
      const pHy = toScreenY(eng.playerY);

      // Boost Aura
      if (eng.isBoosting) {
        ctx.save();
        ctx.shadowColor = '#fbbf24';
        ctx.shadowBlur = 25;
        ctx.strokeStyle = 'rgba(251, 191, 36, 0.8)';
        ctx.lineWidth = 3 * zoom;
        ctx.beginPath();
        ctx.arc(pHx, pHy, pRad * 1.35, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // Invulnerability Shield
      if (eng.isInvulnerable) {
        ctx.save();
        const shieldPulse = Math.sin(bubbleTime * 8) * 0.2 + 0.8;
        ctx.strokeStyle = `rgba(0, 229, 255, ${shieldPulse})`;
        ctx.fillStyle = `rgba(0, 229, 255, 0.15)`;
        ctx.lineWidth = 3 * zoom;
        ctx.beginPath();
        ctx.arc(pHx, pHy, pRad * 1.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }

      // Player Eyes (Large, expressive, tracking playerAngle)
      const pEyeOffset = pRad * 0.58;
      const pEyeAngle1 = eng.playerAngle + Math.PI / 3;
      const pEyeAngle2 = eng.playerAngle - Math.PI / 3;

      const pe1x = pHx + Math.cos(pEyeAngle1) * pEyeOffset;
      const pe1y = pHy + Math.sin(pEyeAngle1) * pEyeOffset;
      const pe2x = pHx + Math.cos(pEyeAngle2) * pEyeOffset;
      const pe2y = pHy + Math.sin(pEyeAngle2) * pEyeOffset;

      const pEyeRad = pRad * 0.5;
      const pPupilRad = pEyeRad * 0.52;

      ctx.save();
      // Outer White Eye Sclera
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#00e5ff';
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(pe1x, pe1y, pEyeRad, 0, Math.PI * 2);
      ctx.arc(pe2x, pe2y, pEyeRad, 0, Math.PI * 2);
      ctx.fill();

      // Pupils looking in heading direction
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(
        pe1x + Math.cos(eng.playerAngle) * (pEyeRad * 0.35),
        pe1y + Math.sin(eng.playerAngle) * (pEyeRad * 0.35),
        pPupilRad,
        0,
        Math.PI * 2
      );
      ctx.arc(
        pe2x + Math.cos(eng.playerAngle) * (pEyeRad * 0.35),
        pe2y + Math.sin(eng.playerAngle) * (pEyeRad * 0.35),
        pPupilRad,
        0,
        Math.PI * 2
      );
      ctx.fill();

      // Eye Gleam (cute white highlight)
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(pe1x - pEyeRad * 0.2, pe1y - pEyeRad * 0.2, pPupilRad * 0.4, 0, Math.PI * 2);
      ctx.arc(pe2x - pEyeRad * 0.2, pe2y - pEyeRad * 0.2, pPupilRad * 0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Player Label
      ctx.save();
      ctx.font = `bold ${Math.max(11, Math.round(12 * zoom))}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillStyle = '#22d3ee';
      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 5;
      ctx.fillText('Sen (Mustafa Kemal)', pHx, pHy - pRad - 8 * zoom);
      ctx.restore();

      // 7. Draw Particles
      eng.particles.forEach((p: any) => {
        const px = toScreenX(p.x);
        const py = toScreenY(p.y);
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(px, py, p.size * zoom, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // 8. Draw Floating Texts
      eng.floatingTexts.forEach((ft: any) => {
        const tx = toScreenX(ft.x);
        const ty = toScreenY(ft.y);
        ctx.save();
        ctx.globalAlpha = ft.alpha;
        ctx.font = `bold ${Math.round(13 * zoom)}px monospace`;
        ctx.textAlign = 'center';
        ctx.fillStyle = ft.color;
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 4;
        ctx.fillText(ft.text, tx, ty);
        ctx.restore();
      });

      // 9. Draw Tactical Radar Mini-Map in Bottom-Right
      const radarSize = 100;
      const radarPadding = 16;
      const rx = width - radarSize - radarPadding;
      const ry = height - radarSize - radarPadding;

      ctx.save();
      // Radar Background
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(rx + radarSize / 2, ry + radarSize / 2, radarSize / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      const radarScale = (radarSize / 2) / ARENA_RADIUS;
      const rCenterX = rx + radarSize / 2;
      const rCenterY = ry + radarSize / 2;

      // Draw Bot Dots on Radar
      eng.bots.forEach((bot: any) => {
        if (!bot.isAlive || bot.body.length === 0) return;
        const bdx = (bot.body[0].x - ARENA_SIZE / 2) * radarScale;
        const bdy = (bot.body[0].y - ARENA_SIZE / 2) * radarScale;
        ctx.fillStyle = bot.color;
        ctx.beginPath();
        ctx.arc(rCenterX + bdx, rCenterY + bdy, 2.5, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw Player Dot & Direction Arrow on Radar
      const pdx = (eng.playerX - ARENA_SIZE / 2) * radarScale;
      const pdy = (eng.playerY - ARENA_SIZE / 2) * radarScale;
      ctx.fillStyle = '#00e5ff';
      ctx.shadowColor = '#00e5ff';
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(rCenterX + pdx, rCenterY + pdy, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [engineRef, theme, isZoomedOut, isBoosting]);

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-[4/3] max-w-[620px] max-h-[580px] mx-auto rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-black select-none touch-none"
      onContextMenu={(e) => e.preventDefault()}
    >
      <canvas
        ref={canvasRef}
        onPointerMove={handlePointerMove}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        className="w-full h-full block cursor-crosshair touch-none"
      />

      {/* Snake.io Style Top-Right Live Arena Leaderboard */}
      <div className="absolute top-2.5 right-2.5 z-20 pointer-events-none flex flex-col gap-1 p-2 rounded-xl bg-slate-950/80 backdrop-blur-md border border-slate-800/80 shadow-lg text-[11px] font-mono min-w-[130px]">
        <div className="flex items-center justify-between pb-1 mb-0.5 border-b border-slate-800 text-slate-400 font-sans font-bold text-[10px] uppercase tracking-wider">
          <span className="flex items-center gap-1">
            <Crown className="w-3 h-3 text-amber-400" />
            <span>Liderler</span>
          </span>
          <span className="text-cyan-400 font-mono">#{playerRank}</span>
        </div>

        {liveStandings.slice(0, 5).map((snake, idx) => (
          <div
            key={snake.name}
            className={`flex items-center justify-between gap-2 px-1 rounded ${
              snake.isPlayer
                ? 'bg-cyan-500/20 text-cyan-300 font-bold'
                : 'text-slate-300'
            }`}
          >
            <span className="truncate max-w-[75px] flex items-center gap-1">
              {idx === 0 && <Crown className="w-2.5 h-2.5 text-amber-400 shrink-0" />}
              <span>{idx + 1}. {snake.isPlayer ? 'Sen' : snake.name}</span>
            </span>
            <span className="tabular-nums text-[10px] text-slate-400">
              {snake.score}
            </span>
          </div>
        ))}
      </div>

      {/* Camera Zoom Toggle Button in Bottom-Left */}
      <div className="absolute bottom-3 left-3 z-20 flex items-center gap-2">
        <button
          onClick={() => setIsZoomedOut((z) => !z)}
          title="Kamera Yakınlaştır / Uzaklaştır (Z)"
          className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 backdrop-blur-md border border-slate-700/80 text-cyan-400 shadow-md transition-colors flex items-center gap-1.5 text-xs font-semibold"
        >
          {isZoomedOut ? (
            <>
              <Minimize2 className="w-3.5 h-3.5" />
              <span>Görüş: Geniş (Z)</span>
            </>
          ) : (
            <>
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Görüş: Yakın (Z)</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
