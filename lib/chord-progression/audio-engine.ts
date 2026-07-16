/**
 * Tone.js audio playback engine for Chord Progression Builder
 */

// Dynamic import for Tone.js to avoid SSR issues
let Tone: typeof import('tone') | null = null;

// Only import Tone.js on client side
if (typeof window !== 'undefined') {
  import('tone').then((module) => {
    Tone = module;
  });
}

import { ChordInstance, InstrumentType } from './types';

export class ChordProgressionAudioEngine {
  private synth: any | null = null;
  private part: any | null = null;
  private currentInstrument: InstrumentType = 'piano';
  private isInitialized = false;

  constructor() {
    // Only initialize on client side
    if (typeof window !== 'undefined') {
      this.initializeSynth();
    }
  }

  /**
   * Initialize Tone.js synthesizer based on selected instrument
   */
  private async initializeSynth() {
    if (!Tone) {
      // Wait for Tone.js to load
      const module = await import('tone');
      Tone = module;
    }

    if (this.synth) {
      this.synth.dispose();
    }

    if (this.currentInstrument === 'piano') {
      // Piano: Clean, bright tone
      this.synth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'sine' },
        envelope: {
          attack: 0.005,
          decay: 0.1,
          sustain: 0.3,
          release: 1,
        },
      }).toDestination();
      this.synth.volume.value = -8;
    } else if (this.currentInstrument === 'guitar') {
      // Guitar: Warmer, plucked tone
      this.synth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'triangle' },
        envelope: {
          attack: 0.01,
          decay: 0.2,
          sustain: 0.2,
          release: 1.5,
        },
      }).toDestination();
      this.synth.volume.value = -10;
    }

    this.isInitialized = true;
  }

  /**
   * Set instrument type and reinitialize synth
   */
  public async setInstrument(instrument: InstrumentType) {
    this.currentInstrument = instrument;
    await this.initializeSynth();
  }

  /**
   * Load chord progression into Tone.js Part
   */
  public async loadProgression(chords: ChordInstance[], bpm: number) {
    if (!Tone) {
      const module = await import('tone');
      Tone = module;
    }

    Tone.getTransport().bpm.value = bpm;

    if (this.part) {
      this.part.dispose();
    }

    // Convert ChordInstance to Tone.js events
    const events = chords.map(chord => ({
      time: `${chord.startTime}n`,      // 'n' = note value (beats)
      duration: `${chord.duration}n`,
      notes: chord.notes.map(note => note + '4'), // Add octave
    }));

    // Create Tone.Part for scheduled playback
    this.part = new Tone.Part((time, event) => {
      this.synth?.triggerAttackRelease(event.notes, event.duration, time);
    }, events);

    // Calculate total duration for looping
    const totalDuration = this.getTotalDuration(chords);
    this.part.loop = true;
    this.part.loopEnd = `${totalDuration}n`;
  }

  /**
   * Start playback
   */
  public async play() {
    if (!Tone) {
      const module = await import('tone');
      Tone = module;
    }

    if (!this.isInitialized) {
      await Tone.start();
      this.isInitialized = true;
    }
    Tone.getTransport().start();
    this.part?.start(0);
  }

  /**
   * Pause playback
   */
  public async pause() {
    if (!Tone) return;
    Tone.getTransport().pause();
  }

  /**
   * Stop playback and reset to start
   */
  public async stop() {
    if (!Tone) return;
    Tone.getTransport().stop();
    Tone.getTransport().position = 0;
  }

  /**
   * Seek to specific time (in beats)
   */
  public async seek(beats: number) {
    if (!Tone) return;
    Tone.getTransport().position = `${beats}n`;
  }

  /**
   * Get current playback position (in beats)
   */
  public getCurrentTime(): number {
    if (!Tone) return 0;
    const position = Tone.getTransport().position;
    // Parse "bars:beats:sixteenths" format
    const positionStr = position.toString();
    const [bars, beats, sixteenths] = positionStr.split(':').map(Number);
    return (bars || 0) * 4 + (beats || 0) + (sixteenths || 0) / 4; // Assuming 4/4 time
  }

  /**
   * Set BPM
   */
  public async setBPM(bpm: number) {
    if (!Tone) return;
    Tone.getTransport().bpm.value = bpm;
  }

  /**
   * Calculate total duration of progression
   */
  private getTotalDuration(chords: ChordInstance[]): number {
    if (chords.length === 0) return 0;
    const lastChord = chords[chords.length - 1];
    return lastChord.startTime + lastChord.duration;
  }

  /**
   * Clean up resources
   */
  public dispose() {
    this.part?.dispose();
    this.synth?.dispose();
    if (Tone) {
      Tone.getTransport().stop();
    }
  }
}

