import React from 'react';
import { X, Moon, Sun, Music, Zap, Volume2, VolumeX, Sliders, Check } from 'lucide-react';
import { MusicTrack, TRACK_LIST } from '../services/music';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: (newTheme: 'dark' | 'light') => void;
  currentTrack: MusicTrack;
  onSelectTrack: (track: MusicTrack) => void;
  isMuted: boolean;
  onToggleMute: () => void;
  fps: number;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  theme,
  onToggleTheme,
  currentTrack,
  onSelectTrack,
  isMuted,
  onToggleMute,
  fps,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-cyan-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-slate-800 dark:text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold tracking-tight">Oyun Ayarları</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Görsel tema, müzik ve performans</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Kapat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-5">
          {/* 1. Theme Setting (Beyaz veya Siyah) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Arka Plan Teması:
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => onToggleTheme('dark')}
                className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                  theme === 'dark'
                    ? 'bg-slate-950 border-cyan-400 text-white shadow-[0_0_12px_rgba(6,182,212,0.3)] ring-1 ring-cyan-400'
                    : 'bg-slate-100 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Moon className="w-4 h-4 text-cyan-400" />
                  <div className="text-left">
                    <div className="font-bold text-xs text-white">Siyah (Karanlık)</div>
                    <div className="text-[10px] text-slate-400">Siberpunk neon</div>
                  </div>
                </div>
                {theme === 'dark' && <Check className="w-4 h-4 text-cyan-400" />}
              </button>

              <button
                type="button"
                onClick={() => onToggleTheme('light')}
                className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                  theme === 'light'
                    ? 'bg-white border-cyan-500 text-slate-900 shadow-md ring-1 ring-cyan-500'
                    : 'bg-slate-100 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Sun className="w-4 h-4 text-amber-500" />
                  <div className="text-left">
                    <div className="font-bold text-xs text-slate-900 dark:text-slate-200">Beyaz (Aydınlık)</div>
                    <div className="text-[10px] text-slate-500">Net ve aydınlık</div>
                  </div>
                </div>
                {theme === 'light' && <Check className="w-4 h-4 text-cyan-500" />}
              </button>
            </div>
          </div>

          {/* 2. Background Music Setting (Phonk, Rock, Sakin Lofi) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Arka Plan Müziği:
            </label>
            <div className="grid grid-cols-2 gap-2">
              {TRACK_LIST.map((track) => {
                const isSelected = currentTrack === track.id;
                return (
                  <button
                    key={track.id}
                    type="button"
                    onClick={() => onSelectTrack(track.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-cyan-500/15 border-cyan-400 text-cyan-900 dark:text-cyan-200 ring-1 ring-cyan-400 font-bold'
                        : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span>{track.label}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                    </div>
                    <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 line-clamp-1">
                      {track.genre}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Performance & 120 FPS / Frequency Display */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Zap className="w-5 h-5 text-amber-500" />
              <div>
                <div className="font-bold text-xs text-slate-900 dark:text-slate-100">120 FPS & Yüksek Frekans</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">Ultra akıcı ekran yenileme aktif</div>
              </div>
            </div>
            <div className="flex items-center gap-2 font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{fps} FPS</span>
            </div>
          </div>

          {/* 4. Sound FX Setting */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Ses Efektleri (SFX)</span>
            <button
              type="button"
              onClick={onToggleMute}
              className={`p-2 rounded-xl border flex items-center gap-1.5 text-xs font-medium transition-colors ${
                !isMuted
                  ? 'bg-cyan-500/15 border-cyan-400 text-cyan-600 dark:text-cyan-300'
                  : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'
              }`}
            >
              {!isMuted ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-rose-400" />}
              <span>{!isMuted ? 'Açık' : 'Kapalı'}</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-md shadow-cyan-600/20"
          >
            Kaydet ve Kapat
          </button>
        </div>
      </div>
    </div>
  );
};
