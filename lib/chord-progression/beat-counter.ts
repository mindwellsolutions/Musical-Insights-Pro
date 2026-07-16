import { MusicalTimeTracker, MusicalPosition } from './musical-time-tracker';

export type BeatCallback = (beat: number, time: number) => void;
export type MeasureCallback = (measure: number, time: number) => void;

/**
 * Precise beat and measure counter using Tone.Transport scheduling
 */
export class BeatCounter {
  private tracker: MusicalTimeTracker;
  private beatCallbacks: Set<BeatCallback> = new Set();
  private measureCallbacks: Set<MeasureCallback> = new Set();
  private scheduledEvents: number[] = [];
  private isActive = false;

  constructor(tracker: MusicalTimeTracker) {
    this.tracker = tracker;
  }

  /**
   * Start counting beats and measures
   */
  start(totalBeats: number): void {
    if (this.isActive) {
      this.stop();
    }

    this.isActive = true;
    const beatsPerMeasure = this.tracker['timeSignature'].numerator;

    // Schedule beat callbacks
    for (let beat = 0; beat <= totalBeats; beat++) {
      const eventId = this.tracker.scheduleAt(`0:${beat}`, (time) => {
        this.beatCallbacks.forEach(cb => cb(beat, time));

        // Trigger measure callback on first beat of measure
        if (beat % beatsPerMeasure === 0) {
          const measure = Math.floor(beat / beatsPerMeasure);
          this.measureCallbacks.forEach(cb => cb(measure, time));
        }
      });
      this.scheduledEvents.push(eventId);
    }
  }

  /**
   * Stop counting and clear all scheduled events
   */
  stop(): void {
    this.scheduledEvents.forEach(id => this.tracker.clearScheduled(id));
    this.scheduledEvents = [];
    this.isActive = false;
  }

  /**
   * Register callback for every beat
   */
  onBeat(callback: BeatCallback): () => void {
    this.beatCallbacks.add(callback);
    return () => this.beatCallbacks.delete(callback);
  }

  /**
   * Register callback for every measure
   */
  onMeasure(callback: MeasureCallback): () => void {
    this.measureCallbacks.add(callback);
    return () => this.measureCallbacks.delete(callback);
  }

  /**
   * Clear all callbacks
   */
  clearCallbacks(): void {
    this.beatCallbacks.clear();
    this.measureCallbacks.clear();
  }
}

