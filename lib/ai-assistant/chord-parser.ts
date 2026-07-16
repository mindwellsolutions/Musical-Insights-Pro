/**
 * AI Music Theory Assistant - Chord Parser
 * 
 * Converts AI chord recommendations to fretboard visualization data
 */

import { AIChordRecommendation } from './types';
import { calculateChordVoicings, ChordVoicing } from '@/lib/chord-voicings';
import { NOTES } from '@/lib/musicTheory';

/**
 * Fretboard chord data for visualization
 */
export interface FretboardChordData {
  rootNote: string;
  chordName: string;
  notes: string[];
  quality: string;
  voicings: ChordVoicing[];
}

/**
 * Parse AI chord recommendation to fretboard data
 */
export function parseAIChordToFretboard(
  aiChord: AIChordRecommendation,
  tuning: string[]
): FretboardChordData {
  // Validate root note
  if (!NOTES.includes(aiChord.rootNote)) {
    throw new Error(`Invalid root note: ${aiChord.rootNote}`);
  }

  // Validate notes
  if (!aiChord.notes || aiChord.notes.length === 0) {
    throw new Error('Invalid chord: no notes provided');
  }

  // Calculate chord voicings
  const voicings = calculateChordVoicings(
    aiChord.notes,
    aiChord.rootNote,
    tuning,
    12
  );

  return {
    rootNote: aiChord.rootNote,
    chordName: aiChord.chordName,
    notes: aiChord.notes,
    quality: aiChord.quality,
    voicings,
  };
}

/**
 * Get the best voicing for display (usually the first one)
 */
export function getBestVoicing(chordData: FretboardChordData): ChordVoicing | null {
  if (chordData.voicings.length === 0) {
    return null;
  }
  
  // Return the first voicing (usually the most common/easiest)
  return chordData.voicings[0];
}

/**
 * Get all voicings sorted by difficulty
 */
export function getVoicingsByDifficulty(chordData: FretboardChordData): ChordVoicing[] {
  return [...chordData.voicings].sort((a, b) => a.difficulty - b.difficulty);
}

