/**
 * Client-only wrapper for Tone.js audio engine
 * This file ensures Tone.js is only loaded on the client side
 * Using Tone.js v14.7.77 (no AudioWorklet issues)
 */

'use client';

import { ChordInstance, InstrumentType } from './types';

// Dynamic import for Tone.js to avoid SSR issues
let Tone: typeof import('tone') | null = null;

export class ChordProgressionAudioEngine {
  private synth: any | null = null;
  private part: any | null = null;
  private currentInstrument: InstrumentType = 'piano';
  private isInitialized = false;

  constructor() {
    // Only initialize on client side
    if (typeof window !== 'undefined') {
      this.loadTone();
    }
  }

  /**
   * Dynamically load Tone.js module
   */
  private async loadTone() {
    if (Tone) return;

    try {
      const module = await import('tone');
      Tone = module;
      await this.initializeSynth();
    } catch (error) {
      console.error('Failed to load Tone.js:', error);
    }
  }

  /**
   * Initialize Tone.js synthesizer based on selected instrument
   * Note: This creates audio nodes but doesn't start AudioContext
   */
  private async initializeSynth() {
    if (!Tone) {
      await this.loadTone();
      if (!Tone) return;
    }

    try {
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
    } catch (error) {
      console.error('Failed to initialize synth:', error);
    }
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
      await this.loadTone();
      if (!Tone) return;
    }

    // Validate chords array
    if (!chords || chords.length === 0) {
      console.warn('No chords to load');
      return;
    }

    Tone.Transport.bpm.value = bpm;

    if (this.part) {
      this.part.dispose();
    }

    // Convert ChordInstance to Tone.js events with validation
    const events = chords
      .filter(chord => chord && chord.notes && Array.isArray(chord.notes))
      .map(chord => ({
        time: `${chord.startTime}n`,
        duration: `${chord.duration}n`,
        notes: chord.notes.map(note => note + '4'),
      }));

    if (events.length === 0) {
      console.warn('No valid chord events to play');
      return;
    }

    // Create Tone.Part for scheduled playback
    this.part = new Tone.Part((time: number, event: any) => {
      this.synth?.triggerAttackRelease(event.notes, event.duration, time);
    }, events);

    // Calculate total duration for looping
    const totalDuration = this.getTotalDuration(chords);
    this.part.loop = true;
    this.part.loopEnd = `${totalDuration}n`;
  }

  /**
   * Start playback
   * This must be called from a user gesture (click, tap, etc.)
   */
  public async play() {
    if (!Tone) {
      await this.loadTone();
      if (!Tone) return;
    }

    try {
      // Start AudioContext - this MUST be called from a user gesture
      if (!this.isInitialized) {
        await Tone.start();
        this.isInitialized = true;
        console.log('AudioContext started successfully');
      }

      // Ensure synth is initialized
      if (!this.synth) {
        await this.initializeSynth();
      }

      Tone.Transport.start();
      this.part?.start(0);
    } catch (error) {
      console.error('Failed to start audio playback:', error);
      throw error;
    }
  }

  /**
   * Pause playback
   */
  public async pause() {
    if (!Tone) return;
    Tone.Transport.pause();
  }

  /**
   * Stop playback and reset to start
   */
  public async stop() {
    if (!Tone) return;
    Tone.Transport.stop();
    Tone.Transport.position = 0;
  }

  /**
   * Seek to specific time (in beats)
   */
  public async seek(beats: number) {
    if (!Tone) return;
    Tone.Transport.position = `${beats}n`;
  }

  /**
   * Get current playback position (in beats)
   */
  public getCurrentTime(): number {
    if (!Tone) return 0;
    const position = Tone.Transport.position;
    // Parse "bars:beats:sixteenths" format
    const positionStr = position.toString();
    const [bars, beats, sixteenths] = positionStr.split(':').map(Number);
    return (bars || 0) * 4 + (beats || 0) + (sixteenths || 0) / 4;
  }

  /**
   * Set BPM
   */
  public async setBPM(bpm: number) {
    if (!Tone) return;
    Tone.Transport.bpm.value = bpm;
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
      Tone.Transport.stop();
    }
  }
}


