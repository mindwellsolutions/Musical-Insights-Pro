import { Soundfont } from 'smplr';
import * as Tone from 'tone';
import { ChordInstance, InstrumentType } from './types';

export interface AudioEngineOptions {
  instrument?: InstrumentType;
  kit?: 'MusyngKite' | 'FluidR3_GM';
  volume?: number;
  outputDeviceId?: string;
}

/**
 * Enhanced audio engine using smplr for realistic chord playback
 */
export class ChordProgressionAudioEngineSmplr {
  private context: AudioContext;
  private sampler: any | null = null;
  private currentInstrument: InstrumentType = 'piano';
  private kit: 'MusyngKite' | 'FluidR3_GM' = 'MusyngKite';
  private isInitialized = false;
  private scheduledChords: Map<string, number[]> = new Map();
  private volume = 100;
  private isMuted = false;
  private outputDeviceId: string | undefined;

  constructor(context: AudioContext, options: AudioEngineOptions = {}) {
    this.context = context;
    this.currentInstrument = options.instrument || 'piano';
    this.kit = options.kit || 'MusyngKite';
    this.volume = options.volume || 100;
    this.outputDeviceId = options.outputDeviceId;
  }

  /**
   * Initialize smplr sampler
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    const instrumentMap: Record<InstrumentType, string> = {
      piano: 'acoustic_grand_piano',
      guitar: 'acoustic_guitar_nylon',
      strings: 'string_ensemble_1',
      brass: 'trumpet',
      synth: 'synth_strings_1',
    };

    const instrumentName = instrumentMap[this.currentInstrument] || 'acoustic_grand_piano';

    console.log(`🎹 Initializing ${instrumentName}...`);
    console.log(`   AudioContext state: ${this.context.state}`);
    console.log(`   AudioContext sampleRate: ${this.context.sampleRate}Hz`);

    // Create smplr Soundfont sampler
    this.sampler = new Soundfont(this.context, {
      instrument: instrumentName,
      kit: this.kit,
    });

    // Wait for samples to load
    console.log(`   Loading samples...`);
    await this.sampler.load;
    console.log(`   ✅ Samples loaded!`);

    // Check if sampler has output
    if (this.sampler.output) {
      console.log(`   ✅ Sampler has output node`);
      this.sampler.output.setVolume(this.volume);
      console.log(`   ✅ Volume set to ${this.volume}`);
    } else {
      console.warn(`   ⚠️  Sampler has NO output node!`);
    }

    this.isInitialized = true;
    console.log(`✅ Audio engine initialized: ${instrumentName}, volume: ${this.volume}`);
  }

  /**
   * Convert note name to MIDI number
   */
  private noteToMidi(noteName: string): number {
    const noteMap: Record<string, number> = {
      'C': 60, 'C#': 61, 'Db': 61,
      'D': 62, 'D#': 63, 'Eb': 63,
      'E': 64,
      'F': 65, 'F#': 66, 'Gb': 66,
      'G': 67, 'G#': 68, 'Ab': 68,
      'A': 69, 'A#': 70, 'Bb': 70,
      'B': 71,
    };

    // If already a number, return it
    if (!isNaN(Number(noteName))) {
      return Number(noteName);
    }

    return noteMap[noteName] || 60; // Default to middle C
  }

  /**
   * Play a chord (array of notes)
   */
  private playChord(notes: string[], time: number, durationBeats: number): void {
    if (!this.sampler || this.isMuted) return;

    // Convert duration from beats to seconds
    const bpm = this.getBPM();
    const durationSeconds = (durationBeats / bpm) * 60;

    console.log(`🎵 Playing chord:`, notes, `at time:`, time, `duration:`, durationSeconds, 's');

    // smplr can play multiple notes simultaneously
    notes.forEach(note => {
      const midiNote = this.noteToMidi(note);

      // Start the note
      this.sampler.start({
        note: midiNote,  // Use MIDI note number
        time,
        velocity: 100,  // Full velocity for clear sound
      });

      // Schedule the note to stop after duration
      this.sampler.stop({
        note: midiNote,
        time: time + durationSeconds,
      });
    });
  }

  /**
   * Play a chord immediately (for preview)
   * Plays the notes right now without scheduling
   */
  private playChordImmediate(notes: string[], durationSeconds: number): void {
    if (!this.sampler || this.isMuted) return;

    const now = this.context.currentTime;
    console.log(`🎵 Playing chord immediately:`, notes, `duration:`, durationSeconds, 's');

    notes.forEach(note => {
      const midiNote = this.noteToMidi(note);

      // Play the note immediately
      this.sampler.start({
        note: midiNote,
        time: now,
        velocity: 100,
      });

      // Stop after duration
      this.sampler.stop({
        note: midiNote,
        time: now + durationSeconds,
      });
    });
  }

  /**
   * Play a sequence of chords for preview (no Transport scheduling)
   * Plays chords in sequence with a small pause between each
   */
  async playPreview(chords: ChordInstance[], bpm: number = 120): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    // Resume AudioContext if needed
    if (this.context.state === 'suspended') {
      await this.context.resume();
    }

    // Start Tone.js
    await Tone.start();

    console.log(`🎹 Playing preview of ${chords.length} chords at ${bpm} BPM`);

    // Calculate timing
    const beatDuration = 60 / bpm; // seconds per beat
    const chordDuration = 1.8; // Play each chord for 1.8 seconds
    const pauseDuration = 0.2; // 0.2 second pause between chords

    // Play each chord in sequence
    for (let i = 0; i < chords.length; i++) {
      const chord = chords[i];
      const delay = i * (chordDuration + pauseDuration) * 1000; // Convert to milliseconds

      setTimeout(() => {
        this.playChordImmediate(chord.notes, chordDuration);
      }, delay);
    }
  }

  /**
   * Start playback
   */
  async play(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    // Resume AudioContext (required for browser autoplay policy)
    if (this.context.state === 'suspended') {
      await this.context.resume();
    }

    // Start Tone.js (required for user interaction)
    await Tone.start();

    console.log(`▶️ Starting playback - Context state: ${this.context.state}, Transport state: ${Tone.getTransport().state}`);

    // Start the transport
    Tone.getTransport().start();
  }

  /**
   * Pause playback
   */
  pause(): void {
    Tone.getTransport().pause();
  }

  /**
   * Stop playback and reset
   */
  stop(): void {
    Tone.getTransport().stop();
    Tone.getTransport().position = 0;
    this.stopAllNotes();
  }

  /**
   * Stop all currently playing notes
   */
  private stopAllNotes(): void {
    if (this.sampler) {
      this.sampler.stop();
    }
  }

  /**
   * Seek to specific time (in beats)
   */
  seek(beats: number): void {
    const seconds = (beats / this.getBPM()) * 60;
    Tone.getTransport().seconds = seconds;
  }

  /**
   * Get current playback time in beats
   */
  getCurrentTime(): number {
    const seconds = Tone.getTransport().seconds;
    const bpm = this.getBPM();
    return (seconds / 60) * bpm;
  }

  /**
   * Set BPM
   */
  setBPM(bpm: number): void {
    Tone.getTransport().bpm.value = bpm;
  }

  /**
   * Get current BPM
   */
  private getBPM(): number {
    return Tone.getTransport().bpm.value;
  }

  /**
   * Change instrument
   */
  async setInstrument(instrument: InstrumentType): Promise<void> {
    this.currentInstrument = instrument;
    this.isInitialized = false;
    await this.initialize();
  }

  /**
   * Set volume (0-1 range)
   */
  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume)) * 127;
    if (this.sampler && this.sampler.output && !this.isMuted) {
      this.sampler.output.setVolume(this.volume);
    }
  }

  /**
   * Mute or unmute audio
   */
  setMuted(muted: boolean): void {
    this.isMuted = muted;
    if (this.sampler && this.sampler.output) {
      this.sampler.output.setVolume(muted ? 0 : this.volume);
    }
  }

  /**
   * Set audio output device
   */
  async setOutputDevice(deviceId: string | undefined): Promise<void> {
    this.outputDeviceId = deviceId;

    // If deviceId is provided, we need to set the sink on the AudioContext
    if (deviceId && this.context && 'setSinkId' in this.context) {
      try {
        await (this.context as any).setSinkId(deviceId);
        console.log('Audio output device changed to:', deviceId);
      } catch (error) {
        console.error('Failed to set audio output device:', error);
        throw error;
      }
    }
  }

  /**
   * Get current output device ID
   */
  getOutputDevice(): string | undefined {
    return this.outputDeviceId;
  }

  /**
   * Load a chord progression for playback
   */
  async loadProgression(chords: ChordInstance[], bpm: number): Promise<void> {
    console.log(`📋 Loading ${chords.length} chords for playback at ${bpm} BPM`);

    // Initialize if needed
    if (!this.isInitialized) {
      await this.initialize();
    }

    // Set BPM
    this.setBPM(bpm);

    // Clear any previously scheduled chords
    this.clearScheduledChords();

    // Schedule each chord
    chords.forEach((chord, index) => {
      if (!chord.notes || chord.notes.length === 0) {
        console.warn(`⚠️  Chord ${index} has no notes, skipping`);
        return;
      }

      // Convert startTime (beats) to Tone.js time format
      const bars = Math.floor(chord.startTime / 4);
      const beats = chord.startTime % 4;
      const timeString = `${bars}:${beats}:0`;

      console.log(`   Scheduling chord ${index}: ${chord.chordSymbol} at ${timeString} (${chord.startTime} beats)`);

      // Schedule the chord to play at the specified time
      const eventId = Tone.getTransport().schedule((time) => {
        this.playChord(chord.notes, time, chord.duration);
      }, timeString);

      // Store the event ID for later cleanup
      if (!this.scheduledChords.has(chord.id)) {
        this.scheduledChords.set(chord.id, []);
      }
      this.scheduledChords.get(chord.id)!.push(eventId);
    });

    console.log(`✅ Loaded ${chords.length} chords for playback`);
  }

  /**
   * Clear all scheduled chords
   */
  private clearScheduledChords(): void {
    this.scheduledChords.forEach(eventIds => {
      eventIds.forEach(id => Tone.getTransport().clear(id));
    });
    this.scheduledChords.clear();
  }

  /**
   * Cleanup resources
   */
  dispose(): void {
    this.clearScheduledChords();
    this.stopAllNotes();
    Tone.getTransport().stop();
    Tone.getTransport().cancel();
  }
}

