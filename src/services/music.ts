/**
 * Web Audio API based Generative Interactive Music Engine
 * Zero external MP3/audio file dependencies - 100% reliable and hermetic
 * Supports: Phonk (Drift Phonk), Cyber Rock, and Sakin (Neon Chillwave)
 */

export type MusicTrack = 'PHONK' | 'ROCK' | 'CHILL' | 'OFF';

export interface TrackInfo {
  id: MusicTrack;
  label: string;
  genre: string;
  bpm: number;
}

export const TRACK_LIST: TrackInfo[] = [
  { id: 'PHONK', label: 'Cyber Phonk', genre: 'Drift Phonk & 808 Bass', bpm: 140 },
  { id: 'ROCK', label: 'Siber Rock', genre: 'Synth Rock & Riff', bpm: 155 },
  { id: 'CHILL', label: 'Sakin Lofi', genre: 'Neon Chillwave & Lofi', bpm: 90 },
  { id: 'OFF', label: 'Müzik Kapalı', genre: 'Sessiz', bpm: 0 },
];

class MusicEngine {
  private ctx: AudioContext | null = null;
  private currentTrack: MusicTrack = 'PHONK';
  private isPlaying: boolean = false;
  private intervalId: number | null = null;
  private step: number = 0;
  private masterGain: GainNode | null = null;

  constructor() {
    try {
      const saved = localStorage.getItem('cybersnake_music_track');
      if (saved && (saved === 'PHONK' || saved === 'ROCK' || saved === 'CHILL' || saved === 'OFF')) {
        this.currentTrack = saved as MusicTrack;
      }
    } catch {}
  }

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(0.12, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public getTrack(): MusicTrack {
    return this.currentTrack;
  }

  public setTrack(track: MusicTrack) {
    this.currentTrack = track;
    try {
      localStorage.setItem('cybersnake_music_track', track);
    } catch {}

    if (this.isPlaying) {
      this.stop();
      if (track !== 'OFF') {
        this.start();
      }
    }
  }

  public nextTrack(): MusicTrack {
    const ids: MusicTrack[] = ['PHONK', 'ROCK', 'CHILL', 'OFF'];
    const currIdx = ids.indexOf(this.currentTrack);
    const nextIdx = (currIdx + 1) % ids.length;
    this.setTrack(ids[nextIdx]);
    return ids[nextIdx];
  }

  public start() {
    if (this.currentTrack === 'OFF') return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    if (this.intervalId) {
      clearInterval(this.intervalId);
    }

    this.isPlaying = true;
    this.step = 0;

    const track = TRACK_LIST.find((t) => t.id === this.currentTrack) || TRACK_LIST[0];
    const stepDurationMs = (60 / track.bpm / 4) * 1000; // 16th note steps

    this.intervalId = window.setInterval(() => {
      this.playStep();
      this.step = (this.step + 1) % 32;
    }, stepDurationMs);
  }

  public stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isPlaying = false;
  }

  private playStep() {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;

    if (this.currentTrack === 'PHONK') {
      this.stepPhonk(now);
    } else if (this.currentTrack === 'ROCK') {
      this.stepRock(now);
    } else if (this.currentTrack === 'CHILL') {
      this.stepChill(now);
    }
  }

  // --- 1. DRIFT PHONK: 808 Distorted Bass + Cowbell Riff ---
  private stepPhonk(now: number) {
    const s = this.step;

    // 808 Kick & Sub Bass (every 4 steps, syncopated on 10, 14)
    if (s % 4 === 0 || s === 10 || s === 26) {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(38, now + 0.18);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      osc.connect(gain);
      gain.connect(this.masterGain!);
      osc.start(now);
      osc.stop(now + 0.2);
    }

    // Snare / Clap on beat 4 and 12
    if (s === 4 || s === 12 || s === 20 || s === 28) {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.exponentialRampToValueAtTime(70, now + 0.1);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

      osc.connect(gain);
      gain.connect(this.masterGain!);
      osc.start(now);
      osc.stop(now + 0.1);
    }

    // Iconic Phonk Cowbell / Synth Lead (Pentatonic Minor)
    // Notes: C5 (523), D#5 (622), F5 (698), G5 (784), A#5 (932)
    const cowbellMelody: Record<number, number> = {
      0: 622,
      2: 698,
      4: 784,
      7: 622,
      8: 523,
      10: 698,
      12: 784,
      14: 932,
      16: 784,
      18: 698,
      20: 622,
      24: 523,
      28: 784,
    };

    if (cowbellMelody[s]) {
      const freq = cowbellMelody[s];
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

      osc.connect(gain);
      gain.connect(this.masterGain!);
      osc.start(now);
      osc.stop(now + 0.14);
    }
  }

  // --- 2. CYBER ROCK: Power Chords & Driving Riff ---
  private stepRock(now: number) {
    const s = this.step;

    // Rock Kick & Snare
    if (s % 8 === 0) {
      // Kick
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.15);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc.connect(gain);
      gain.connect(this.masterGain!);
      osc.start(now);
      osc.stop(now + 0.15);
    } else if (s % 8 === 4) {
      // Snare
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.12);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.connect(gain);
      gain.connect(this.masterGain!);
      osc.start(now);
      osc.stop(now + 0.12);
    }

    // Driving Rock Sawtooth Bass / Power Riff
    // Chords: E2 (82.4), G2 (98), A2 (110), C3 (130.8)
    const rootNotes = [82.4, 82.4, 98.0, 110.0];
    const chordIndex = Math.floor(s / 8) % 4;
    const baseFreq = rootNotes[chordIndex];

    if (s % 2 === 0) {
      const osc1 = this.ctx!.createOscillator();
      const osc2 = this.ctx!.createOscillator(); // 5th power interval
      const gain = this.ctx!.createGain();

      osc1.type = 'sawtooth';
      osc2.type = 'sawtooth';
      osc1.frequency.setValueAtTime(baseFreq, now);
      osc2.frequency.setValueAtTime(baseFreq * 1.498, now); // Fifth

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.masterGain!);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.11);
      osc2.stop(now + 0.11);
    }
  }

  // --- 3. SAKİN (CHILLWAVE / NEON LOFI): Dreamy & Peaceful ---
  private stepChill(now: number) {
    const s = this.step;

    // Gentle heartbeat kick on beat 0 and 16
    if (s === 0 || s === 16) {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(90, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.3);
      gain.gain.setValueAtTime(0.22, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);
      osc.connect(gain);
      gain.connect(this.masterGain!);
      osc.start(now);
      osc.stop(now + 0.32);
    }

    // Dreamy Warm Electric Piano Chords (every 8 steps)
    // Cmaj7 (261, 329, 392, 493), Am7 (220, 261, 329, 392), Fmaj7 (174, 220, 261, 329), G6 (196, 246, 293, 392)
    const chords = [
      [261.63, 329.63, 392.0, 493.88], // Cmaj7
      [220.0, 261.63, 329.63, 392.0],  // Am7
      [174.61, 220.0, 261.63, 329.63], // Fmaj7
      [196.0, 246.94, 293.66, 392.0],  // G6
    ];

    if (s % 8 === 0) {
      const chordIdx = Math.floor(s / 8) % chords.length;
      const notes = chords[chordIdx];

      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.02);

        gain.gain.setValueAtTime(0.05, now + idx * 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.02 + 0.65);

        osc.connect(gain);
        gain.connect(this.masterGain!);
        osc.start(now + idx * 0.02);
        osc.stop(now + idx * 0.02 + 0.65);
      });
    }
  }
}

export const music = new MusicEngine();
