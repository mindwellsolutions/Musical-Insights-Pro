/**
 * Timeline calculation utilities for Chord Progression Builder
 */

import { ZoomLevel, ChordInstance } from './types';

/**
 * Available zoom levels
 */
export const ZOOM_LEVELS: ZoomLevel[] = [
  { pixelsPerBeat: 20, label: '25%' },
  { pixelsPerBeat: 40, label: '50%' },
  { pixelsPerBeat: 60, label: '75%' },
  { pixelsPerBeat: 80, label: '100%' },
  { pixelsPerBeat: 100, label: '125%' },
  { pixelsPerBeat: 120, label: '150%' },
  { pixelsPerBeat: 160, label: '200%' },
];

/**
 * Default zoom level (100%)
 */
export const DEFAULT_ZOOM_LEVEL = ZOOM_LEVELS[3]; // 80 pixels per beat

/**
 * Snap value to nearest grid point
 */
export function snapToGrid(value: number, gridSize: number, enabled: boolean = true): number {
  if (!enabled) return value;
  return Math.round(value / gridSize) * gridSize;
}

/**
 * Convert pixels to beats
 */
export function pixelsToBeats(pixels: number, pixelsPerBeat: number): number {
  return pixels / pixelsPerBeat;
}

/**
 * Convert beats to pixels
 */
export function beatsToPixels(beats: number, pixelsPerBeat: number): number {
  return beats * pixelsPerBeat;
}

/**
 * Calculate timeline width based on total duration
 */
export function calculateTimelineWidth(totalBeats: number, pixelsPerBeat: number): number {
  // Add extra space at the end (4 beats)
  return (totalBeats + 4) * pixelsPerBeat;
}

/**
 * Get beat markers for time ruler
 */
export function getBeatMarkers(totalBeats: number, beatsPerBar: number = 4): Array<{
  beat: number;
  isBarStart: boolean;
  label: string;
}> {
  const markers: Array<{ beat: number; isBarStart: boolean; label: string }> = [];
  
  for (let beat = 0; beat <= totalBeats; beat++) {
    const isBarStart = beat % beatsPerBar === 0;
    const barNumber = Math.floor(beat / beatsPerBar) + 1;
    const beatInBar = (beat % beatsPerBar) + 1;
    
    markers.push({
      beat,
      isBarStart,
      label: isBarStart ? `${barNumber}` : `${beatInBar}`,
    });
  }
  
  return markers;
}

/**
 * Calculate snap tolerance in pixels
 */
export function getSnapTolerance(pixelsPerBeat: number): number {
  // 10% of a beat, minimum 5px, maximum 15px
  return Math.max(5, Math.min(15, pixelsPerBeat * 0.1));
}

/**
 * Find nearest snap point
 */
export function findNearestSnapPoint(
  position: number,
  snapInterval: number,
  tolerance: number
): number | null {
  const nearestSnap = Math.round(position / snapInterval) * snapInterval;
  const distance = Math.abs(position - nearestSnap);
  
  return distance <= tolerance ? nearestSnap : null;
}

/**
 * Format time as MM:SS
 */
export function formatTime(beats: number, bpm: number): string {
  const seconds = (beats / bpm) * 60;
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Calculate playback position from time
 */
export function calculatePlaybackPosition(
  currentTime: number,
  pixelsPerBeat: number
): number {
  return currentTime * pixelsPerBeat;
}

/**
 * Parse Tone.js position string to beats
 * Format: "bars:beats:sixteenths"
 */
export function parseTonePosition(position: string, beatsPerBar: number = 4): number {
  const parts = position.split(':').map(Number);
  const bars = parts[0] || 0;
  const beats = parts[1] || 0;
  const sixteenths = parts[2] || 0;
  
  return bars * beatsPerBar + beats + sixteenths / 4;
}

/**
 * Convert beats to Tone.js position string
 */
export function beatsToTonePosition(beats: number, beatsPerBar: number = 4): string {
  const bars = Math.floor(beats / beatsPerBar);
  const remainingBeats = beats % beatsPerBar;
  const wholeBeat = Math.floor(remainingBeats);
  const sixteenths = Math.round((remainingBeats - wholeBeat) * 4);
  
  return `${bars}:${wholeBeat}:${sixteenths}`;
}

/**
 * Get grid snap intervals (in beats)
 */
export const SNAP_INTERVALS = {
  QUARTER: 0.25,   // 1/4 beat (sixteenth note)
  HALF: 0.5,       // 1/2 beat (eighth note)
  ONE: 1,          // 1 beat (quarter note)
  TWO: 2,          // 2 beats (half note)
  FOUR: 4,         // 4 beats (whole note/bar)
};

/**
 * Get default snap interval based on zoom level
 */
export function getDefaultSnapInterval(pixelsPerBeat: number): number {
  if (pixelsPerBeat >= 100) return SNAP_INTERVALS.QUARTER;
  if (pixelsPerBeat >= 60) return SNAP_INTERVALS.HALF;
  return SNAP_INTERVALS.ONE;
}

/**
 * Calculate total duration of a chord progression
 */
export function getTotalDuration(chords: ChordInstance[]): number {
  if (chords.length === 0) return 0;

  const lastChord = chords.reduce((latest, chord) => {
    const endTime = chord.startTime + chord.duration;
    const latestEndTime = latest.startTime + latest.duration;
    return endTime > latestEndTime ? chord : latest;
  }, chords[0]);

  return lastChord.startTime + lastChord.duration;
}
