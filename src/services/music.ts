/**
 * Web Audio API based Generative Interactive Music Engine
 * Zero external MP3/audio file dependencies - 100% reliable, offline and hermetic.
 *
 * Features:
 * - 20 Diverse Musical Tracks across 4 Genres: Phonk, Rock, Sakin (Chill), and Synth/Elektronik
 * - Shuffle & Random Track Generation ("20 tane müzik ekle rastgele")
 * - Chris Wilson's Web Audio Lookahead Precision Scheduler (no setInterval drift)
 * - Automatic user-gesture AudioContext resume & mobile unlock
 * - Volume control with persistent storage
 */

export type MusicCategory = 'PHONK' | 'ROCK' | 'CHILL' | 'SYNTH';

export type MusicTrack =
  // Phonk & 808 Bass (5 Tracks)
  | 'PHONK_DRIFT'
  | 'PHONK_BRAZIL'
  | 'PHONK_MEMPHIS'
  | 'PHONK_TOKYO'
  | 'PHONK_HYPER'
  // Rock & Metal (5 Tracks)
  | 'ROCK_CYBER'
  | 'ROCK_METAL'
  | 'ROCK_SPACE'
  | 'ROCK_RETRO'
  | 'ROCK_OVERDRIVE'
  // Sakin & Chill Lofi (5 Tracks)
  | 'CHILL_LOFI'
  | 'CHILL_VAPOR'
  | 'CHILL_DREAM'
  | 'CHILL_COFFEE'
  | 'CHILL_ZEN'
  // Elektronik & Synthwave (5 Tracks)
  | 'SYNTH_DARKSYNTH'
  | 'SYNTH_OUTRUN'
  | 'SYNTH_RAVE'
  | 'SYNTH_CHIP'
  | 'SYNTH_GLITCH'
  // Off
  | 'OFF';

export interface TrackInfo {
  id: MusicTrack;
  label: string;
  category: MusicCategory | 'OFF';
  genre: string;
  bpm: number;
  description: string;
}

export const TRACK_LIST: TrackInfo[] = [
  // --- 1. PHONK (5 Tracks) ---
  {
    id: 'PHONK_DRIFT',
    label: 'Cyber Drift',
    category: 'PHONK',
    genre: 'Drift Phonk & 808 Bass',
    bpm: 140,
    description: 'Ağır 808 bas vuruşları ve klasik drift cowbell melodisi',
  },
  {
    id: 'PHONK_BRAZIL',
    label: 'Rio Funk Phonk',
    category: 'PHONK',
    genre: 'Favela Funk & Agresif 808',
    bpm: 136,
    description: 'Hızlı senkoplu funk ritmi ve derin bas vuruşları',
  },
  {
    id: 'PHONK_MEMPHIS',
    label: 'Memphis Midnight',
    category: 'PHONK',
    genre: 'Karanlık Tape Phonk',
    bpm: 130,
    description: 'Karanlık yeraltı atmosferi ve sert cowbell riffleri',
  },
  {
    id: 'PHONK_TOKYO',
    label: 'Tokyo Neon Slide',
    category: 'PHONK',
    genre: 'Tokyo Sokak Drifti',
    bpm: 145,
    description: 'Yüksek tempolu gece yarısı sokak yarışı melodisi',
  },
  {
    id: 'PHONK_HYPER',
    label: 'Hyper Boost Phonk',
    category: 'PHONK',
    genre: 'Ultra Hızlı Siber Phonk',
    bpm: 152,
    description: 'Maksimum adrenalin, hiper tempolu bas ve zil patlamaları',
  },

  // --- 2. ROCK (5 Tracks) ---
  {
    id: 'ROCK_CYBER',
    label: 'Siber Punk Rock',
    category: 'ROCK',
    genre: 'Synth Rock & Power Riff',
    bpm: 155,
    description: 'Distortion power-chord akorları ve tempolu davul ritmi',
  },
  {
    id: 'ROCK_METAL',
    label: 'Heavy Mecha Metal',
    category: 'ROCK',
    genre: 'Endüstriyel Siber Metal',
    bpm: 165,
    description: 'Hızlı çift kros vuruşları ve agresif metal bas riffleri',
  },
  {
    id: 'ROCK_SPACE',
    label: 'Galaktik Rock',
    category: 'ROCK',
    genre: 'Uzay Synth Rock',
    bpm: 142,
    description: 'Uzay temalı synth solos ve dinamik bas yürüyüşü',
  },
  {
    id: 'ROCK_RETRO',
    label: '80s Arcade Rock',
    category: 'ROCK',
    genre: 'Klasik Arcade Rock',
    bpm: 148,
    description: 'Nostaljik atari salonu elektro gitar enerjisi',
  },
  {
    id: 'ROCK_OVERDRIVE',
    label: 'Overdrive Surge',
    category: 'ROCK',
    genre: 'Yüksek Voltaj Rock',
    bpm: 160,
    description: 'Kesintisiz overdrive ve sert elektro bas akışı',
  },

  // --- 3. SAKİN & CHILL (5 Tracks) ---
  {
    id: 'CHILL_LOFI',
    label: 'Sakin Gece Lofi',
    category: 'CHILL',
    genre: 'Neon Chillwave & Lofi',
    bpm: 88,
    description: 'Rahatlatıcı sıcak piyano akorları ve huzurlu ritim',
  },
  {
    id: 'CHILL_VAPOR',
    label: 'Vaporwave Sunset',
    category: 'CHILL',
    genre: 'Nostaljik Mor Gün Batımı',
    bpm: 80,
    description: 'Yavaş, süzülen rüya benzeri synth dalgaları',
  },
  {
    id: 'CHILL_DREAM',
    label: 'Rüya Dalgaları',
    category: 'CHILL',
    genre: 'Huzurlu Ambiyans & Arpej',
    bpm: 84,
    description: 'Dingin arpejler ve derin meditatif bas tonları',
  },
  {
    id: 'CHILL_COFFEE',
    label: 'Siber Kafe',
    category: 'CHILL',
    genre: 'Akıcı Lofi Jazz Akorları',
    bpm: 92,
    description: 'Rahat kahve molası havası ve yumuşak vuruşlar',
  },
  {
    id: 'CHILL_ZEN',
    label: 'Zen Bahçesi',
    category: 'CHILL',
    genre: 'Meditatif Doğa & Dinginlik',
    bpm: 75,
    description: 'Stresten arındıran yavaş, derin ve sakinleştirici melodiler',
  },

  // --- 4. ELEKTRONİK & SYNTHWAVE (5 Tracks) ---
  {
    id: 'SYNTH_DARKSYNTH',
    label: 'Cyberpunk 2077',
    category: 'SYNTH',
    genre: 'Karanlık Darksynth',
    bpm: 138,
    description: 'Karanlık testere baslar ve fütüristik siber vurgular',
  },
  {
    id: 'SYNTH_OUTRUN',
    label: 'Neon Outrun',
    category: 'SYNTH',
    genre: '80ler Retro Synthwave',
    bpm: 128,
    description: 'Neon otoyolunda gece sürüşü hissi veren analog arpej',
  },
  {
    id: 'SYNTH_RAVE',
    label: 'Siberian Rave',
    category: 'SYNTH',
    genre: 'Yüksek Enerjili Rave & Dans',
    bpm: 148,
    description: 'Dört dörtlük sert kroslar ve parıldayan dans synthleri',
  },
  {
    id: 'SYNTH_CHIP',
    label: '8-Bit Retro Blast',
    category: 'SYNTH',
    genre: 'Nostaljik Çip & Chiptune',
    bpm: 144,
    description: 'Efsanevi Gameboy ve arcade tarzı neşeli 8-bit melodiler',
  },
  {
    id: 'SYNTH_GLITCH',
    label: 'Glitch Matrix',
    category: 'SYNTH',
    genre: 'Fütüristik Glitch Hop',
    bpm: 132,
    description: 'Karmaşık siber ritimler ve yüksek teknolojili ses efektleri',
  },

  // --- OFF ---
  {
    id: 'OFF',
    label: 'Müzik Kapalı',
    category: 'OFF',
    genre: 'Sessiz Mod',
    bpm: 0,
    description: 'Arka plan müziği tamamen kapalı',
  },
];

// Helper to sanitize legacy track IDs from localStorage
function sanitizeTrackId(id: string | null): MusicTrack {
  if (!id) return 'PHONK_DRIFT';
  // Legacy aliases
  if (id === 'PHONK') return 'PHONK_DRIFT';
  if (id === 'ROCK') return 'ROCK_CYBER';
  if (id === 'CHILL') return 'CHILL_LOFI';
  const found = TRACK_LIST.find((t) => t.id === id);
  return found ? (id as MusicTrack) : 'PHONK_DRIFT';
}

class MusicEngine {
  private ctx: AudioContext | null = null;
  private currentTrack: MusicTrack = 'PHONK_DRIFT';
  private masterGain: GainNode | null = null;
  private volume: number = 0.45; // Default audible volume (0 - 1)
  private isRunning: boolean = false;
  private isShuffle: boolean = false;

  // Precision lookahead scheduler variables
  private timerId: number | null = null;
  private nextNoteTime: number = 0;
  private current16thNote: number = 0;
  private measureCount: number = 0;
  private readonly lookaheadMs: number = 25.0; // How frequently scheduler runs (ms)
  private readonly scheduleAheadTimeSec: number = 0.12; // How far ahead to schedule audio (sec)

  constructor() {
    try {
      const savedTrack = localStorage.getItem('cybersnake_music_track');
      this.currentTrack = sanitizeTrackId(savedTrack);

      const savedVol = localStorage.getItem('cybersnake_music_volume');
      if (savedVol !== null) {
        const v = parseFloat(savedVol);
        if (!isNaN(v) && v >= 0 && v <= 1) {
          this.volume = v;
        }
      }

      const savedShuffle = localStorage.getItem('cybersnake_music_shuffle');
      if (savedShuffle !== null) {
        this.isShuffle = savedShuffle === 'true';
      }
    } catch {}

    // Register global unlock listeners on any user touch/click/key
    this.setupGlobalUnlock();
  }

  private setupGlobalUnlock() {
    if (typeof window === 'undefined') return;

    const unlock = () => {
      this.ensureAudioContext();
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
    };

    window.addEventListener('pointerdown', unlock, { passive: true, once: false });
    window.addEventListener('touchstart', unlock, { passive: true, once: false });
    window.addEventListener('keydown', unlock, { passive: true, once: false });
  }

  public ensureAudioContext(): AudioContext | null {
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public getTrack(): MusicTrack {
    return this.currentTrack;
  }

  public getTrackInfo(): TrackInfo {
    return TRACK_LIST.find((t) => t.id === this.currentTrack) || TRACK_LIST[0];
  }

  public getVolume(): number {
    return this.volume;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    try {
      localStorage.setItem('cybersnake_music_volume', String(this.volume));
    } catch {}

    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
  }

  public isShuffleEnabled(): boolean {
    return this.isShuffle;
  }

  public toggleShuffle(): boolean {
    this.isShuffle = !this.isShuffle;
    try {
      localStorage.setItem('cybersnake_music_shuffle', String(this.isShuffle));
    } catch {}
    return this.isShuffle;
  }

  private lastActiveTrack: MusicTrack = 'PHONK_DRIFT';

  public setTrack(track: MusicTrack) {
    if (track !== 'OFF') {
      this.lastActiveTrack = track;
    }
    this.currentTrack = track;
    try {
      localStorage.setItem('cybersnake_music_track', track);
    } catch {}

    if (track === 'OFF') {
      this.stop();
    } else {
      this.start();
    }
  }

  public isMusicOff(): boolean {
    return this.currentTrack === 'OFF';
  }

  /**
   * Toggles background music between OFF and the previous/active track
   */
  public toggleMusic(): MusicTrack {
    if (this.currentTrack !== 'OFF') {
      this.lastActiveTrack = this.currentTrack;
      this.setTrack('OFF');
      return 'OFF';
    } else {
      const restored =
        this.lastActiveTrack && this.lastActiveTrack !== 'OFF' ? this.lastActiveTrack : 'PHONK_DRIFT';
      this.setTrack(restored);
      return restored;
    }
  }

  /**
   * Randomly pick a new track from the 20 available tracks (excluding OFF)
   */
  public playRandomTrack(): MusicTrack {
    const validTracks = TRACK_LIST.filter((t) => t.id !== 'OFF');
    // Filter out current track to ensure a different one is selected
    const candidates = validTracks.filter((t) => t.id !== this.currentTrack);
    const pool = candidates.length > 0 ? candidates : validTracks;
    const randomIdx = Math.floor(Math.random() * pool.length);
    const chosen = pool[randomIdx].id;
    this.setTrack(chosen);
    return chosen;
  }

  public nextTrack(): MusicTrack {
    if (this.isShuffle) {
      return this.playRandomTrack();
    }
    const ids = TRACK_LIST.map((t) => t.id);
    const currIdx = ids.indexOf(this.currentTrack);
    const nextIdx = (currIdx + 1) % ids.length;
    const next = ids[nextIdx];
    this.setTrack(next);
    return next;
  }

  public prevTrack(): MusicTrack {
    const ids = TRACK_LIST.map((t) => t.id);
    const currIdx = ids.indexOf(this.currentTrack);
    const prevIdx = (currIdx - 1 + ids.length) % ids.length;
    const prev = ids[prevIdx];
    this.setTrack(prev);
    return prev;
  }

  public start() {
    if (this.currentTrack === 'OFF') return;

    this.ensureAudioContext();
    if (!this.ctx || !this.masterGain) return;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    if (this.isRunning) {
      return;
    }

    this.isRunning = true;
    this.current16thNote = 0;
    this.measureCount = 0;
    this.nextNoteTime = this.ctx.currentTime + 0.05;

    this.scheduler();
  }

  public stop() {
    if (this.timerId !== null) {
      window.clearTimeout(this.timerId);
      this.timerId = null;
    }
    this.isRunning = false;
  }

  public getIsPlaying(): boolean {
    return this.isRunning && this.currentTrack !== 'OFF';
  }

  /**
   * Lookahead Scheduler
   */
  private scheduler = () => {
    if (!this.isRunning || !this.ctx) return;

    while (this.nextNoteTime < this.ctx.currentTime + this.scheduleAheadTimeSec) {
      this.scheduleNote(this.current16thNote, this.nextNoteTime);
      this.advanceNote();
    }

    this.timerId = window.setTimeout(this.scheduler, this.lookaheadMs);
  };

  private advanceNote() {
    const track = this.getTrackInfo();
    const bpm = track.bpm || 140;
    const secondsPer16th = 60.0 / bpm / 4.0;

    this.nextNoteTime += secondsPer16th;
    this.current16thNote = (this.current16thNote + 1) % 32;

    if (this.current16thNote === 0) {
      this.measureCount++;
      // Auto-shuffle to next random track every 8 measures (approx. 15-20 seconds) if shuffle is on
      if (this.isShuffle && this.measureCount % 8 === 0) {
        this.playRandomTrack();
      }
    }
  }

  private scheduleNote(step: number, time: number) {
    if (!this.ctx || !this.masterGain) return;

    const track = this.currentTrack;

    // PHONK TRACKS
    if (track.startsWith('PHONK_')) {
      this.playPhonkStyle(track, step, time);
    }
    // ROCK TRACKS
    else if (track.startsWith('ROCK_')) {
      this.playRockStyle(track, step, time);
    }
    // CHILL TRACKS
    else if (track.startsWith('CHILL_')) {
      this.playChillStyle(track, step, time);
    }
    // SYNTH TRACKS
    else if (track.startsWith('SYNTH_')) {
      this.playSynthStyle(track, step, time);
    }
  }

  // ==========================================
  // 1. PHONK FAMILY (5 Variations)
  // ==========================================
  private playPhonkStyle(track: MusicTrack, s: number, time: number) {
    const ctx = this.ctx!;
    const dest = this.masterGain!;

    // 808 Kick & Sub Pattern
    let kickSteps = [0, 4, 8, 12, 16, 20, 24, 28];
    if (track === 'PHONK_BRAZIL') {
      // Syncopated Favela baquetada groove: 0, 3, 6, 10, 12, 16, 19, 22, 26
      kickSteps = [0, 3, 6, 10, 12, 16, 19, 22, 26];
    } else if (track === 'PHONK_HYPER') {
      kickSteps = [0, 2, 4, 8, 10, 12, 14, 16, 18, 20, 24, 26, 28, 30];
    } else if (track === 'PHONK_MEMPHIS') {
      kickSteps = [0, 6, 12, 16, 22, 28];
    }

    if (kickSteps.includes(s)) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';

      const startFreq = track === 'PHONK_HYPER' ? 170 : 145;
      const endFreq = track === 'PHONK_MEMPHIS' ? 36 : 42;
      osc.frequency.setValueAtTime(startFreq, time);
      osc.frequency.exponentialRampToValueAtTime(endFreq, time + 0.16);

      gain.gain.setValueAtTime(0.55, time);
      gain.gain.linearRampToValueAtTime(0.001, time + 0.22);

      osc.connect(gain);
      gain.connect(dest);
      osc.start(time);
      osc.stop(time + 0.22);
    }

    // Snare / Clap
    if (s === 4 || s === 12 || s === 20 || s === 28) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, time);
      osc.frequency.exponentialRampToValueAtTime(90, time + 0.12);

      gain.gain.setValueAtTime(0.35, time);
      gain.gain.linearRampToValueAtTime(0.001, time + 0.12);

      osc.connect(gain);
      gain.connect(dest);
      osc.start(time);
      osc.stop(time + 0.12);
    }

    // Hi-hats
    if (s % 2 === 1) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(track === 'PHONK_HYPER' ? 9000 : 7500, time);

      gain.gain.setValueAtTime(0.08, time);
      gain.gain.linearRampToValueAtTime(0.001, time + 0.04);

      osc.connect(gain);
      gain.connect(dest);
      osc.start(time);
      osc.stop(time + 0.04);
    }

    // Melody: Distinct Cowbell or Lead for each Phonk track
    let melody: Record<number, number> = {};

    if (track === 'PHONK_DRIFT') {
      melody = { 0: 659, 2: 784, 4: 880, 7: 784, 8: 659, 10: 587, 12: 659, 14: 880, 16: 1046, 18: 880, 20: 784, 24: 587, 28: 784 };
    } else if (track === 'PHONK_BRAZIL') {
      melody = { 0: 784, 3: 880, 6: 987, 8: 880, 11: 784, 14: 659, 16: 784, 19: 880, 22: 987, 24: 1174, 28: 987 };
    } else if (track === 'PHONK_MEMPHIS') {
      melody = { 0: 523, 4: 622, 6: 698, 8: 622, 12: 523, 16: 698, 20: 784, 24: 622, 28: 523 };
    } else if (track === 'PHONK_TOKYO') {
      melody = { 0: 698, 2: 830, 4: 1046, 6: 830, 8: 698, 10: 622, 12: 698, 16: 1046, 20: 1244, 24: 1046, 28: 830 };
    } else if (track === 'PHONK_HYPER') {
      melody = { 0: 880, 2: 1046, 4: 1174, 6: 1318, 8: 1174, 10: 1046, 12: 880, 16: 1318, 20: 1568, 24: 1174, 28: 880 };
    }

    if (melody[s]) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(melody[s], time);

      gain.gain.setValueAtTime(0.32, time);
      gain.gain.linearRampToValueAtTime(0.001, time + 0.16);

      osc.connect(gain);
      gain.connect(dest);
      osc.start(time);
      osc.stop(time + 0.16);
    }
  }

  // ==========================================
  // 2. ROCK FAMILY (5 Variations)
  // ==========================================
  private playRockStyle(track: MusicTrack, s: number, time: number) {
    const ctx = this.ctx!;
    const dest = this.masterGain!;

    // Kick pattern
    const isMetal = track === 'ROCK_METAL';
    const kickHit = isMetal
      ? s % 2 === 0 // Double bass drumming
      : s === 0 || s === 6 || s === 8 || s === 14 || s === 16 || s === 22 || s === 24 || s === 30;

    if (kickHit) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(170, time);
      osc.frequency.exponentialRampToValueAtTime(45, time + 0.14);

      gain.gain.setValueAtTime(isMetal ? 0.42 : 0.5, time);
      gain.gain.linearRampToValueAtTime(0.001, time + 0.15);

      osc.connect(gain);
      gain.connect(dest);
      osc.start(time);
      osc.stop(time + 0.15);
    }

    // Snare
    if (s === 4 || s === 12 || s === 20 || s === 28) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(isMetal ? 380 : 340, time);
      osc.frequency.exponentialRampToValueAtTime(80, time + 0.15);

      gain.gain.setValueAtTime(0.4, time);
      gain.gain.linearRampToValueAtTime(0.001, time + 0.15);

      osc.connect(gain);
      gain.connect(dest);
      osc.start(time);
      osc.stop(time + 0.15);
    }

    // Power chord progressions
    let chordProg = [82.4, 82.4, 98.0, 110.0]; // E -> G -> A
    if (track === 'ROCK_SPACE') {
      chordProg = [110.0, 130.8, 146.8, 164.8]; // A -> C -> D -> E
    } else if (track === 'ROCK_RETRO') {
      chordProg = [130.8, 98.0, 110.0, 87.3]; // C -> G -> Am -> F
    } else if (track === 'ROCK_OVERDRIVE') {
      chordProg = [73.4, 82.4, 98.0, 110.0]; // D -> E -> G -> A
    }

    const chordIndex = Math.floor(s / 8) % chordProg.length;
    const rootFreq = chordProg[chordIndex];

    if (s % 2 === 0) {
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sawtooth';
      osc2.type = 'sawtooth';

      osc1.frequency.setValueAtTime(rootFreq, time);
      osc2.frequency.setValueAtTime(rootFreq * 1.4983, time); // 5th power interval

      gain.gain.setValueAtTime(0.24, time);
      gain.gain.linearRampToValueAtTime(0.001, time + 0.12);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(dest);
      osc1.start(time);
      osc2.start(time);
      osc1.stop(time + 0.12);
      osc2.stop(time + 0.12);
    }
  }

  // ==========================================
  // 3. CHILL & SAKİNLEŞTİRİCİ FAMILY (5 Completely Rebuilt Tracks)
  // ==========================================
  private playChillStyle(track: MusicTrack, s: number, time: number) {
    const ctx = this.ctx!;
    const dest = this.masterGain!;

    // A. Soft, Warm, Cozy Drums (No harsh clicks)
    // Minimalist mellow kick on 0 and 16 (for ZEN, no harsh kick - only gentle ambient pulse)
    if (track !== 'CHILL_ZEN' && (s === 0 || s === 16)) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(80, time);
      osc.frequency.exponentialRampToValueAtTime(35, time + 0.22);

      // Soft attack to eliminate digital click
      gain.gain.setValueAtTime(0.001, time);
      gain.gain.linearRampToValueAtTime(0.28, time + 0.02);
      gain.gain.linearRampToValueAtTime(0.001, time + 0.26);

      osc.connect(gain);
      gain.connect(dest);
      osc.start(time);
      osc.stop(time + 0.26);
    }

    // Soft tape brush / gentle rim on beat 8 and 24
    if (track !== 'CHILL_ZEN' && (s === 8 || s === 24)) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(190, time);
      osc.frequency.exponentialRampToValueAtTime(60, time + 0.12);

      gain.gain.setValueAtTime(0.001, time);
      gain.gain.linearRampToValueAtTime(0.14, time + 0.02);
      gain.gain.linearRampToValueAtTime(0.001, time + 0.15);

      osc.connect(gain);
      gain.connect(dest);
      osc.start(time);
      osc.stop(time + 0.15);
    }

    // Soft vinyl shaker on odd steps (s % 4 === 2) for subtle cozy rhythm
    if (track === 'CHILL_LOFI' || track === 'CHILL_COFFEE') {
      if (s % 4 === 2) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(3200, time);

        gain.gain.setValueAtTime(0.001, time);
        gain.gain.linearRampToValueAtTime(0.025, time + 0.01);
        gain.gain.linearRampToValueAtTime(0.001, time + 0.06);

        osc.connect(gain);
        gain.connect(dest);
        osc.start(time);
        osc.stop(time + 0.06);
      }
    }

    // B. Chord Progressions & Harmonies (Rich, lush, beautiful voicings)
    // 32-step loop = 4 chords per progression (8 steps per chord)
    let chordProg: { root: number; notes: number[] }[] = [];

    if (track === 'CHILL_LOFI') {
      // Warm Cmaj9 -> Am9 -> Dm9 -> G13 (Soulful Lofi)
      chordProg = [
        { root: 65.41, notes: [261.63, 329.63, 392.00, 493.88, 587.33] }, // Cmaj9 (C3 bass, C4, E4, G4, B4, D5)
        { root: 55.00, notes: [220.00, 261.63, 329.63, 392.00, 493.88] }, // Am9 (A2 bass, A3, C4, E4, G4, B4)
        { root: 73.42, notes: [293.66, 349.23, 440.00, 523.25, 659.25] }, // Dm9 (D3 bass, D4, F4, A4, C5, E5)
        { root: 49.00, notes: [196.00, 246.94, 329.63, 392.00, 440.00] }, // G13 (G2 bass, G3, B3, E4, G4, A4)
      ];
    } else if (track === 'CHILL_VAPOR') {
      // Nostalgic Vaporwave: Abmaj7 -> Fm9 -> Dbmaj7 -> Eb7
      chordProg = [
        { root: 51.91, notes: [207.65, 261.63, 311.13, 392.00] }, // Abmaj7
        { root: 43.65, notes: [174.61, 207.65, 261.63, 311.13] }, // Fm9
        { root: 69.30, notes: [277.18, 349.23, 415.30, 523.25] }, // Dbmaj7
        { root: 77.78, notes: [311.13, 392.00, 466.16, 554.37] }, // Eb7
      ];
    } else if (track === 'CHILL_DREAM') {
      // Ethereal Bells & Dream Waves: Dmaj9 -> Bm11 -> Gmaj9 -> Asus4
      chordProg = [
        { root: 73.42, notes: [293.66, 369.99, 440.00, 554.37] }, // Dmaj9
        { root: 61.74, notes: [246.94, 293.66, 369.99, 440.00] }, // Bm11
        { root: 49.00, notes: [196.00, 246.94, 293.66, 369.99] }, // Gmaj9
        { root: 55.00, notes: [220.00, 293.66, 329.63, 440.00] }, // Asus4
      ];
    } else if (track === 'CHILL_COFFEE') {
      // Cozy Cafe Jazz: Fmaj7 -> Em7 -> Dm9 -> Cmaj7
      chordProg = [
        { root: 87.31, notes: [174.61, 220.00, 261.63, 329.63] }, // Fmaj7
        { root: 82.41, notes: [164.81, 196.00, 246.94, 293.66] }, // Em7
        { root: 73.42, notes: [146.83, 174.61, 220.00, 261.63] }, // Dm9
        { root: 65.41, notes: [130.81, 164.81, 196.00, 246.94] }, // Cmaj7
      ];
    } else {
      // CHILL_ZEN: Meditative Singing Bowl Chimes (Gsus2 -> Fsus2 -> Dm7 -> Em7)
      chordProg = [
        { root: 49.00, notes: [196.00, 293.66, 392.00, 440.00, 587.33] }, // Gsus2
        { root: 43.65, notes: [174.61, 261.63, 349.23, 392.00, 523.25] }, // Fsus2
        { root: 36.71, notes: [146.83, 220.00, 293.66, 349.23, 440.00] }, // Dm7
        { root: 41.20, notes: [164.81, 246.94, 329.63, 392.00, 493.88] }, // Em7
      ];
    }

    const chordIndex = Math.floor(s / 8) % chordProg.length;
    const currentChord = chordProg[chordIndex];

    // C. Continuous Warm Low-Passed Chord Pad (Sustains seamlessly across steps!)
    // Trigger chord pad every 8 steps with a smooth 1.8s decay that overlaps into the next chord
    if (s % 8 === 0) {
      // Dedicated warm low-pass filter to remove digital harshness
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(track === 'CHILL_ZEN' ? 850 : 1100, time);
      filter.Q.setValueAtTime(1.0, time);
      filter.connect(dest);

      // Play each note of the chord with a soft attack & smooth sustain
      currentChord.notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        // Sine and gentle triangle blend for warm vintage electric piano feel
        osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
        const noteStartTime = time + idx * 0.025; // Gentle strum
        osc.frequency.setValueAtTime(freq, noteStartTime);

        // Soft attack (no pops!) + long velvety sustain (1.6s)
        gain.gain.setValueAtTime(0.0001, noteStartTime);
        gain.gain.linearRampToValueAtTime(0.07, noteStartTime + 0.12);
        gain.gain.linearRampToValueAtTime(0.04, noteStartTime + 0.8);
        gain.gain.linearRampToValueAtTime(0.0001, noteStartTime + 1.6);

        osc.connect(gain);
        gain.connect(filter);

        osc.start(noteStartTime);
        osc.stop(noteStartTime + 1.6);
      });

      // Warm Round Sub Bassline Note following root
      const bassOsc = ctx.createOscillator();
      const bassGain = ctx.createGain();
      bassOsc.type = 'sine';
      bassOsc.frequency.setValueAtTime(currentChord.root, time);

      bassGain.gain.setValueAtTime(0.0001, time);
      bassGain.gain.linearRampToValueAtTime(0.22, time + 0.08);
      bassGain.gain.linearRampToValueAtTime(0.12, time + 0.9);
      bassGain.gain.linearRampToValueAtTime(0.0001, time + 1.5);

      bassOsc.connect(bassGain);
      bassGain.connect(dest);
      bassOsc.start(time);
      bassOsc.stop(time + 1.5);
    }

    // D. Soft Melodic Piano / Bell Droplets (Interleaved on step 2, 4, 6, etc.)
    // Ensures continuous soothing melody instead of awkward silence between chords!
    const melodyMap: Record<number, number> = {
      2: currentChord.notes[1] * 2, // Octave above
      4: currentChord.notes[3] || currentChord.notes[2],
      6: currentChord.notes[2] * 2,
      10: currentChord.notes[0] * 2,
      12: currentChord.notes[currentChord.notes.length - 1],
      14: currentChord.notes[1] * 2,
      18: currentChord.notes[3] || currentChord.notes[2],
      20: currentChord.notes[2] * 2,
      22: currentChord.notes[1] * 2,
      26: currentChord.notes[0] * 2,
      28: currentChord.notes[2],
      30: currentChord.notes[currentChord.notes.length - 1],
    };

    if (melodyMap[s]) {
      const freq = melodyMap[s];
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine'; // Pure soothing sine droplet
      osc.frequency.setValueAtTime(freq, time);

      // Very soft, bell-like decay
      gain.gain.setValueAtTime(0.0001, time);
      gain.gain.linearRampToValueAtTime(0.065, time + 0.03);
      gain.gain.linearRampToValueAtTime(0.0001, time + 0.45);

      osc.connect(gain);
      gain.connect(dest);
      osc.start(time);
      osc.stop(time + 0.45);
    }
  }

  // ==========================================
  // 4. SYNTH & ELEKTRONİK FAMILY (5 Variations)
  // ==========================================
  private playSynthStyle(track: MusicTrack, s: number, time: number) {
    const ctx = this.ctx!;
    const dest = this.masterGain!;

    // 4-on-the-floor electro kick
    if (s % 4 === 0) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = track === 'SYNTH_CHIP' ? 'square' : 'sine';
      osc.frequency.setValueAtTime(160, time);
      osc.frequency.exponentialRampToValueAtTime(45, time + 0.12);

      gain.gain.setValueAtTime(0.5, time);
      gain.gain.linearRampToValueAtTime(0.001, time + 0.14);

      osc.connect(gain);
      gain.connect(dest);
      osc.start(time);
      osc.stop(time + 0.14);
    }

    // Offbeat Hi-hat (2, 6, 10, 14, 18, 22, 26, 30)
    if (s % 4 === 2) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(9500, time);

      gain.gain.setValueAtTime(0.12, time);
      gain.gain.linearRampToValueAtTime(0.001, time + 0.06);

      osc.connect(gain);
      gain.connect(dest);
      osc.start(time);
      osc.stop(time + 0.06);
    }

    // Melodies & Arpeggios
    let synthMelody: Record<number, number> = {};

    if (track === 'SYNTH_DARKSYNTH') {
      // Menacing cyberpunk bass arpeggio (C minor / Eb / G)
      const notes = [130.8, 155.6, 196.0, 261.6];
      const note = notes[s % notes.length];
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(note, time);

      gain.gain.setValueAtTime(0.25, time);
      gain.gain.linearRampToValueAtTime(0.001, time + 0.1);

      osc.connect(gain);
      gain.connect(dest);
      osc.start(time);
      osc.stop(time + 0.1);
      return;
    } else if (track === 'SYNTH_OUTRUN') {
      // Classic 80s outrun lead
      synthMelody = { 0: 440, 2: 554, 4: 659, 6: 880, 8: 659, 10: 554, 12: 440, 16: 659, 20: 880, 24: 1108, 28: 880 };
    } else if (track === 'SYNTH_RAVE') {
      // Fast euro rave synth stabs
      synthMelody = { 0: 587, 3: 587, 6: 698, 8: 880, 11: 880, 14: 698, 16: 587, 19: 587, 22: 698, 24: 1046, 28: 880 };
    } else if (track === 'SYNTH_CHIP') {
      // 8-Bit Chiptune Arp
      const scale = [523, 659, 784, 1046];
      const note = scale[s % scale.length];
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(note, time);

      gain.gain.setValueAtTime(0.18, time);
      gain.gain.linearRampToValueAtTime(0.001, time + 0.08);

      osc.connect(gain);
      gain.connect(dest);
      osc.start(time);
      osc.stop(time + 0.08);
      return;
    } else if (track === 'SYNTH_GLITCH') {
      synthMelody = { 0: 440, 4: 880, 7: 659, 10: 1318, 14: 554, 16: 440, 20: 987, 24: 784, 28: 1174 };
    }

    if (synthMelody[s]) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(synthMelody[s], time);

      gain.gain.setValueAtTime(0.28, time);
      gain.gain.linearRampToValueAtTime(0.001, time + 0.14);

      osc.connect(gain);
      gain.connect(dest);
      osc.start(time);
      osc.stop(time + 0.14);
    }
  }
}

export const music = new MusicEngine();
