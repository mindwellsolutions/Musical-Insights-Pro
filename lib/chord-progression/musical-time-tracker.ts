import * as Tone from 'tone';

export interface MusicalPosition {
  bars: number;        // Current bar (1-indexed)
  beats: number;       // Current beat within bar (1-indexed)
  sixteenths: number;  // Current sixteenth note within beat
  totalBeats: number;  // Total beats from start
  seconds: number;     // Absolute time in seconds
  ticks: number;       // Tone.js ticks (PPQ * 4 * bars + ...)
}

export interface TimeSignature {
  numerator: number;   // Beats per measure (e.g., 4 in 4/4)
  denominator: number; // Note value per beat (e.g., 4 in 4/4)
}

export interface BeatMarker {
  beat: number;
  bar: number;
  beatInBar: number;
  isBarStart: boolean;
  label: string;
}

export class MusicalTimeTracker {
  private transport: typeof Tone.Transport;
  private timeSignature: TimeSignature;
  private ppq: number; // Pulses Per Quarter note (Tone.js default: 192)

  constructor(timeSignature: TimeSignature = { numerator: 4, denominator: 4 }) {
    this.transport = Tone.getTransport();
    this.timeSignature = timeSignature;
    this.ppq = this.transport.PPQ;
    
    // Set time signature in Tone.js
    this.transport.timeSignature = timeSignature.numerator;
  }

  /**
   * Get current musical position with all formats
   */
  getCurrentPosition(): MusicalPosition {
    const position = this.transport.position;
    const seconds = this.transport.seconds;
    const ticks = this.transport.ticks;
    
    // Parse "bars:beats:sixteenths" format
    const parts = position.toString().split(':').map(Number);
    const bars = parts[0] || 0;
    const beats = parts[1] || 0;
    const sixteenths = parts[2] || 0;
    
    // Calculate total beats from start
    const totalBeats = bars * this.timeSignature.numerator + beats + (sixteenths / 4);
    
    return {
      bars: bars + 1,  // Convert to 1-indexed for display
      beats: beats + 1, // Convert to 1-indexed for display
      sixteenths,
      totalBeats,
      seconds,
      ticks
    };
  }

  /**
   * Convert beats to pixels for timeline rendering
   */
  beatsToPixels(beats: number, pixelsPerBeat: number): number {
    return beats * pixelsPerBeat;
  }

  /**
   * Convert pixels to beats for seeking
   */
  pixelsToBeats(pixels: number, pixelsPerBeat: number): number {
    return pixels / pixelsPerBeat;
  }

  /**
   * Get beat markers for timeline ruler
   */
  getBeatMarkers(totalBeats: number): BeatMarker[] {
    const markers: BeatMarker[] = [];
    const beatsPerMeasure = this.timeSignature.numerator;
    
    for (let beat = 0; beat <= totalBeats; beat++) {
      const bar = Math.floor(beat / beatsPerMeasure);
      const beatInBar = beat % beatsPerMeasure;
      const isBarStart = beatInBar === 0;
      
      markers.push({
        beat,
        bar: bar + 1,  // 1-indexed
        beatInBar: beatInBar + 1,  // 1-indexed
        isBarStart,
        label: isBarStart ? `${bar + 1}` : `${beatInBar + 1}`,
      });
    }
    
    return markers;
  }

  /**
   * Schedule callback at specific musical time
   */
  scheduleAt(time: string | number, callback: (time: number) => void): number {
    return this.transport.schedule(callback, time);
  }

  /**
   * Clear scheduled event
   */
  clearScheduled(eventId: number): void {
    this.transport.clear(eventId);
  }

  setBPM(bpm: number): void {
    this.transport.bpm.value = bpm;
  }

  setTimeSignature(numerator: number, denominator: number): void {
    this.timeSignature = { numerator, denominator };
    this.transport.timeSignature = numerator;
  }
}

