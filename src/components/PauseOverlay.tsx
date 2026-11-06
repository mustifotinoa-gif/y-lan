import React from 'react';
import { Play, RotateCcw, Home, ShoppingBag, Music, VolumeX } from 'lucide-react';
import { MusicTrack, music } from '../services/music';

interface PauseOverlayProps {
  onResume: () => void;
  onRestart: () => void;
  onGoToMenu: () => void;
  onOpenShop?: () => void;
  currentTrack?: MusicTrack;
  onToggleMusic?: () => void;
}

export const PauseOverlay: React.FC<PauseOverlayProps> = ({
  onResume,
  onRestart,
  onGoToMenu,
  onOpenShop,
  currentTrack,
  onToggleMusic,
}) => {
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/80 backdrop-blur-md rounded-2xl animate-fade-in">
      <div className="text-center p-6 max-w-xs w-full bg-slate-900/90 border border-slate-800 rounded-2xl shadow-2xl">
        <h3 className="text-2xl font-bold tracking-tight text-cyan-300 mb-1">
          Oyun Duraklatıldı
        </h3>
        <p className="text-xs text-slate-400 mb-5">
          Hazır olduğunuzda devam edebilir, markete gidebilir veya menüye dönebilirsiniz
        </p>

        <div className="flex flex-col gap-2.5">
          <button
            onClick={onResume}
            className="w-full py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 active:scale-95 shadow-lg shadow-cyan-500/20 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-slate-950" />
            <span>Devam Et (Space)</span>
          </button>

          {onOpenShop && (
            <button
              onClick={onOpenShop}
              className="w-full py-2.5 px-4 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4 text-amber-400" />
              <span>🛒 Siber Market (Zamanı Dondur)</span>
            </button>
          )}
          
          <button
            onClick={onRestart}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors flex items-center justify-center gap-2 active:scale-95 border border-slate-700 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Yeniden Başlat (R)</span>
          </button>

          {onToggleMusic && (
            <button
              onClick={onToggleMusic}
              className={`w-full py-2 px-4 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2 active:scale-95 border cursor-pointer ${
                currentTrack === 'OFF'
                  ? 'bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 border-rose-500/40'
                  : 'bg-slate-850 hover:bg-slate-800 text-cyan-300 border-slate-700'
              }`}
            >
              {currentTrack === 'OFF' ? (
                <>
                  <VolumeX className="w-3.5 h-3.5 text-rose-400" />
                  <span>Müziği Aç (N)</span>
                </>
              ) : (
                <>
                  <Music className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                  <span>Müziği Kapat (N)</span>
                </>
              )}
            </button>
          )}

          <button
            onClick={onGoToMenu}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800/60 hover:bg-rose-950/40 text-slate-300 hover:text-rose-300 text-xs font-medium transition-colors flex items-center justify-center gap-2 border border-slate-800 hover:border-rose-800/40 cursor-pointer"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Ana Menüye Dön</span>
          </button>
        </div>
      </div>
    </div>
  );
};
