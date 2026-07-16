/**
 * Frequency to Note Conversion Utility
 * Converts Hz frequency to musical note names with flat notation
 */

// Note names using flat notation (Bb, Db, Eb, Gb, Ab) for display
const NOTE_NAMES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

// A4 reference frequency (440 Hz standard)
const A4_FREQUENCY = 440;
const A4_MIDI_NUMBER = 69;

/**
 * Convert frequency in Hz to MIDI note number
 * Formula: n = 12 × log₂(f / 440) + 69
 * 
 * @param frequency - Frequency in Hz
 * @returns MIDI note number (0-127)
 */
export function frequencyToMidiNote(frequency: number): number {
  if (frequency <= 0) return 0;
  return Math.round(12 * Math.log2(frequency / A4_FREQUENCY) + A4_MIDI_NUMBER);
}

/**
 * Convert MIDI note number to note name
 * 
 * @param midiNote - MIDI note number (0-127)
 * @returns Note name (e.g., "C", "Db", "A", "Bb")
 */
export function midiNoteToNoteName(midiNote: number): string {
  const noteIndex = midiNote % 12;
  return NOTE_NAMES[noteIndex];
}

/**
 * Convert MIDI note number to note name with octave
 * 
 * @param midiNote - MIDI note number (0-127)
 * @returns Note name with octave (e.g., "C4", "Db5", "A2")
 */
export function midiNoteToNoteNameWithOctave(midiNote: number): string {
  const noteName = midiNoteToNoteName(midiNote);
  const octave = Math.floor(midiNote / 12) - 1;
  return `${noteName}${octave}`;
}

/**
 * Convert frequency to note name (without octave)
 * 
 * @param frequency - Frequency in Hz
 * @returns Note name (e.g., "C", "Db", "A", "Bb")
 */
export function frequencyToNoteName(frequency: number): string {
  if (frequency <= 0) return '';
  const midiNote = frequencyToMidiNote(frequency);
  return midiNoteToNoteName(midiNote);
}

/**
 * Convert frequency to note name with octave
 * 
 * @param frequency - Frequency in Hz
 * @returns Note name with octave (e.g., "C4", "Db5", "A2")
 */
export function frequencyToNoteNameWithOctave(frequency: number): string {
  if (frequency <= 0) return '';
  const midiNote = frequencyToMidiNote(frequency);
  return midiNoteToNoteNameWithOctave(midiNote);
}

/**
 * Calculate the difference in cents between a frequency and the nearest note
 * Positive = sharp, Negative = flat
 * 
 * @param frequency - Frequency in Hz
 * @returns Cents deviation from nearest note (-50 to +50)
 */
export function frequencyToCents(frequency: number): number {
  if (frequency <= 0) return 0;
  
  const midiNote = 12 * Math.log2(frequency / A4_FREQUENCY) + A4_MIDI_NUMBER;
  const nearestMidiNote = Math.round(midiNote);
  const cents = (midiNote - nearestMidiNote) * 100;
  
  return cents;
}

/**
 * Check if a frequency is within tolerance (±5 cents) of a note
 * 
 * @param frequency - Frequency in Hz
 * @param tolerance - Tolerance in cents (default: 5)
 * @returns True if within tolerance
 */
export function isFrequencyInTune(frequency: number, tolerance: number = 5): boolean {
  const cents = Math.abs(frequencyToCents(frequency));
  return cents <= tolerance;
}

/**
 * Get the expected frequency for a given MIDI note
 * 
 * @param midiNote - MIDI note number (0-127)
 * @returns Frequency in Hz
 */
export function midiNoteToFrequency(midiNote: number): number {
  return A4_FREQUENCY * Math.pow(2, (midiNote - A4_MIDI_NUMBER) / 12);
}

/**
 * Get guitar string tuning frequencies (standard tuning)
 * E2, A2, D3, G3, B3, E4
 */
export const GUITAR_STANDARD_TUNING = {
  E2: midiNoteToFrequency(40), // 82.41 Hz
  A2: midiNoteToFrequency(45), // 110.00 Hz
  D3: midiNoteToFrequency(50), // 146.83 Hz
  G3: midiNoteToFrequency(55), // 196.00 Hz
  B3: midiNoteToFrequency(59), // 246.94 Hz
  E4: midiNoteToFrequency(64), // 329.63 Hz
};

/**
 * Get bass guitar string tuning frequencies (standard tuning)
 * E1, A1, D2, G2
 */
export const BASS_STANDARD_TUNING = {
  E1: midiNoteToFrequency(28), // 41.20 Hz
  A1: midiNoteToFrequency(33), // 55.00 Hz
  D2: midiNoteToFrequency(38), // 73.42 Hz
  G2: midiNoteToFrequency(43), // 98.00 Hz
};

