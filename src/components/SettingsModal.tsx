import React, { useState } from 'react';
import {
  X,
  Moon,
  Sun,
  Music,
  Zap,
  Volume2,
  VolumeX,
  Sliders,
  Check,
  Play,
  Square,
  Shuffle,
  Dices,
  Flame,
  Sparkles,
} from 'lucide-react';
import { MusicTrack, TRACK_LIST, music, MusicCategory } from '../services/music';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: (newTheme: 'dark' | 'light') => void;
  currentTrack: MusicTrack;
  onSelectTrack: (track: MusicTrack) => void;
  onRandomTrack: () => void;
  musicVolume: number;
  onVolumeChange: (vol: number) => void;
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
  onRandomTrack,
  musicVolume,
  onVolumeChange,
  isMuted,
  onToggleMute,
  fps,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | MusicCategory>('ALL');
  const [isShuffleOn, setIsShuffleOn] = useState<boolean>(() => music.isShuffleEnabled());

  if (!isOpen) return null;

  const isPlaying = music.getIsPlaying();

  const handleTogglePlayMusic = () => {
    if (isPlaying) {
      music.stop();
    } else {
      if (currentTrack === 'OFF') {
        onSelectTrack('PHONK_DRIFT');
      } else {
        music.start();
      }
    }
  };

  const handleToggleShuffle = () => {
    const next = music.toggleShuffle();
    setIsShuffleOn(next);
  };

  // Filter 20 tracks by selected category
  const filteredTracks = TRACK_LIST.filter((t) => {
    if (t.id === 'OFF') return true;
    if (selectedCategory === 'ALL') return true;
    return t.category === selectedCategory;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-cyan-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-slate-800 dark:text-slate-100 max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold tracking-tight">Oyun & Müzik Ayarları</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">20 Özel Müzik, Rastgele Çalma ve Tema</p>
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

        {/* Scrollable Body */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto">
          {/* 1. Background Theme (Siyah / Beyaz) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Arka Plan Teması:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onToggleTheme('dark')}
                className={`p-2.5 rounded-xl border flex items-center justify-between transition-all ${
                  theme === 'dark'
                    ? 'bg-slate-950 border-cyan-400 text-white shadow-[0_0_12px_rgba(6,182,212,0.3)] ring-1 ring-cyan-400'
                    : 'bg-slate-100 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
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
                className={`p-2.5 rounded-xl border flex items-center justify-between transition-all ${
                  theme === 'light'
                    ? 'bg-white border-cyan-500 text-slate-900 shadow-md ring-1 ring-cyan-500'
                    : 'bg-slate-100 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Sun className="w-4 h-4 text-amber-500" />
                  <div className="text-left">
                    <div className="font-bold text-xs text-slate-900 dark:text-slate-200">Beyaz (Aydınlık)</div>
                    <div className="text-[10px] text-slate-500">Net ve sade</div>
                  </div>
                </div>
                {theme === 'light' && <Check className="w-4 h-4 text-cyan-500" />}
              </button>
            </div>
          </div>

          {/* 2. Music Player Controls & Quick Random Shuffle */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-cyan-500/10 via-slate-900 to-amber-500/10 border border-slate-700/80">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Music className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-black uppercase tracking-wider text-slate-200">
                  Müzik Kontrolleri (20 Şarkı)
                </span>
              </div>

              {/* Play / Stop Button */}
              <button
                type="button"
                onClick={handleTogglePlayMusic}
                className="flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 transition-all active:scale-95"
              >
                {isPlaying ? (
                  <>
                    <Square className="w-3.5 h-3.5 fill-cyan-400" />
                    <span>Durdur</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-cyan-400" />
                    <span>Müziği Başlat</span>
                  </>
                )}
              </button>
            </div>

            {/* Random Play & Shuffle Bar */}
            <div className="grid grid-cols-2 gap-2 mt-2">
              {/* Rastgele Çal (Instant Random Track) */}
              <button
                type="button"
                onClick={onRandomTrack}
                className="py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 border border-amber-500/40 text-amber-300 font-extrabold text-xs flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95 cursor-pointer"
              >
                <Dices className="w-4 h-4 text-amber-400 animate-spin-slow" />
                <span>🎲 Rastgele Çal</span>
              </button>

              {/* Shuffle Mode Toggle */}
              <button
                type="button"
                onClick={handleToggleShuffle}
                className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  isShuffleOn
                    ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                    : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Shuffle className="w-3.5 h-3.5" />
                <span>Karışık: {isShuffleOn ? 'Açık' : 'Kapalı'}</span>
              </button>
            </div>

            {/* Volume Slider */}
            <div className="mt-3 pt-2.5 border-t border-slate-800/80">
              <div className="flex items-center justify-between text-xs mb-1 font-semibold text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Ses Seviyesi</span>
                </span>
                <span className="font-mono text-cyan-400 text-xs">%{Math.round(musicVolume * 100)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={musicVolume}
                onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
              />
            </div>
          </div>

          {/* 3. Category Filter Tabs */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Müzik Listesi (20 Parça):
              </label>
              <span className="text-[11px] font-mono text-cyan-400 font-bold">
                {filteredTracks.length - (filteredTracks.some((t) => t.id === 'OFF') ? 1 : 0)} Parça
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5 mb-2.5">
              {[
                { id: 'ALL', label: 'Tümü (20)' },
                { id: 'PHONK', label: '🔥 Phonk (5)' },
                { id: 'ROCK', label: '🎸 Rock (5)' },
                { id: 'CHILL', label: '🌿 Sakin (5)' },
                { id: 'SYNTH', label: '⚡ Synth (5)' },
              ].map((cat) => {
                const isCatActive = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id as 'ALL' | MusicCategory)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                      isCatActive
                        ? 'bg-cyan-500 text-slate-950 shadow-sm shadow-cyan-500/30'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-white'
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>

            {/* 20 Tracks Grid (Scrollable List) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
              {filteredTracks.map((track) => {
                const isSelected = currentTrack === track.id;
                const isOff = track.id === 'OFF';

                return (
                  <button
                    key={track.id}
                    type="button"
                    onClick={() => onSelectTrack(track.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all relative ${
                      isSelected
                        ? 'bg-cyan-500/15 border-cyan-400 text-cyan-900 dark:text-cyan-200 ring-1 ring-cyan-400 font-bold shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                        : 'bg-slate-50 dark:bg-slate-950/70 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5 font-bold truncate pr-2">
                        {isOff ? (
                          <span className="text-slate-500">🚫</span>
                        ) : (
                          <Music className={`w-3.5 h-3.5 ${isSelected ? 'text-cyan-400 animate-pulse' : 'text-slate-400'}`} />
                        )}
                        <span className="truncate">{track.label}</span>
                      </span>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {track.bpm > 0 && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800/80 text-cyan-400 border border-slate-700">
                            {track.bpm} BPM
                          </span>
                        )}
                        {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                      </div>
                    </div>

                    <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 line-clamp-1">
                      {track.description}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Performance & SFX */}
          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">120 FPS</span>
              </div>
              <span className="font-mono text-xs font-bold text-emerald-500">{fps} FPS</span>
            </div>

            <button
              type="button"
              onClick={onToggleMute}
              className={`p-2.5 rounded-xl border flex items-center justify-between text-xs font-medium transition-colors ${
                !isMuted
                  ? 'bg-cyan-500/10 border-cyan-400 text-cyan-600 dark:text-cyan-300'
                  : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'
              }`}
            >
              <span className="flex items-center gap-1.5">
                {!isMuted ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-rose-400" />}
                <span>Ses (SFX)</span>
              </span>
              <span className="font-bold">{!isMuted ? 'Açık' : 'Kapalı'}</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 sm:px-6 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-400 font-medium">
            Şu an: <strong className="text-cyan-400">{music.getTrackInfo().label}</strong>
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-md shadow-cyan-600/20 active:scale-95"
          >
            Tamam
          </button>
        </div>
      </div>
    </div>
  );
};
