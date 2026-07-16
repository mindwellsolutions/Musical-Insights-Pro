import * as Tone from 'tone';

export interface PlayheadState {
  position: number;      // Current position in pixels
  beats: number;         // Current position in beats
  isPlaying: boolean;
  velocity: number;      // Pixels per second (for interpolation)
}

export type PlayheadUpdateCallback = (state: PlayheadState) => void;

/**
 * Smooth playhead animation using RAF and Transport.seconds
 */
export class PlayheadAnimator {
  private rafId: number | null = null;
  private isRunning = false;
  private pixelsPerBeat: number;
  private bpm: number;
  private lastUpdateTime = 0;
  private lastPosition = 0;
  private callbacks: Set<PlayheadUpdateCallback> = new Set();
  private maxBeats: number | null = null;

  constructor(pixelsPerBeat: number, bpm: number) {
    this.pixelsPerBeat = pixelsPerBeat;
    this.bpm = bpm;
  }

  /**
   * Start animation loop
   */
  start(): void {
    if (this.isRunning) return;

    this.isRunning = true;
    this.lastUpdateTime = performance.now();
    this.lastPosition = this.getCurrentPixelPosition();
    this.animate();
  }

  /**
   * Stop animation loop
   */
  stop(): void {
    this.isRunning = false;
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  /**
   * Main animation loop
   */
  private animate = (): void => {
    if (!this.isRunning) return;

    const now = performance.now();
    const deltaTime = (now - this.lastUpdateTime) / 1000; // Convert to seconds

    // Get authoritative position from Tone.Transport
    const transportSeconds = Tone.getTransport().seconds;
    const beatsPerSecond = this.bpm / 60;
    const currentBeats = transportSeconds * beatsPerSecond;

    const targetPosition = currentBeats * this.pixelsPerBeat;

    // Calculate velocity for smooth interpolation
    const positionDelta = targetPosition - this.lastPosition;
    const velocity = positionDelta / deltaTime;

    // Linear interpolation for smooth movement
    // Use small lerp factor to smooth out any jitter
    const lerpFactor = 0.3;
    const interpolatedPosition = this.lastPosition + (positionDelta * lerpFactor);

    const state: PlayheadState = {
      position: interpolatedPosition,
      beats: currentBeats,
      isPlaying: Tone.getTransport().state === 'started',
      velocity,
    };

    // Notify all callbacks
    this.callbacks.forEach(cb => cb(state));

    // Update tracking variables
    this.lastUpdateTime = now;
    this.lastPosition = interpolatedPosition;

    // Check if we've reached the max beats (end of last chord) AFTER updating position
    // This ensures the playhead visually reaches the end of the last chord block
    if (this.maxBeats !== null && currentBeats >= this.maxBeats) {
      // Stop playback when reaching the end
      Tone.getTransport().stop();
      this.stop();

      // Send final update at the max position
      const finalState: PlayheadState = {
        position: this.maxBeats * this.pixelsPerBeat,
        beats: this.maxBeats,
        isPlaying: false,
        velocity: 0,
      };
      this.callbacks.forEach(cb => cb(finalState));
      return;
    }

    // Schedule next frame
    this.rafId = requestAnimationFrame(this.animate);
  };

  /**
   * Get current pixel position from Transport
   */
  private getCurrentPixelPosition(): number {
    const transportSeconds = Tone.getTransport().seconds;
    const beatsPerSecond = this.bpm / 60;
    const currentBeats = transportSeconds * beatsPerSecond;
    return currentBeats * this.pixelsPerBeat;
  }

  /**
   * Register callback for playhead updates
   */
  onUpdate(callback: PlayheadUpdateCallback): () => void {
    this.callbacks.add(callback);
    return () => this.callbacks.delete(callback);
  }

  /**
   * Update pixels per beat (zoom level changed)
   */
  setPixelsPerBeat(ppb: number): void {
    this.pixelsPerBeat = ppb;
  }

  /**
   * Update BPM
   */
  setBPM(bpm: number): void {
    this.bpm = bpm;
  }

  /**
   * Seek to specific position
   */
  seekToPixels(pixels: number): void {
    const beats = pixels / this.pixelsPerBeat;
    const seconds = (beats / this.bpm) * 60;
    Tone.getTransport().seconds = seconds;
    this.lastPosition = pixels;
  }

  /**
   * Set maximum beats (end of last chord)
   */
  setMaxBeats(maxBeats: number | null): void {
    this.maxBeats = maxBeats;
  }

  /**
   * Clear all callbacks
   */
  clearCallbacks(): void {
    this.callbacks.clear();
  }
}

