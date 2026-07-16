/**
 * AI Music Theory Assistant - Scale Parser
 * 
 * Converts AI scale recommendations to fretboard visualization data
 */

import { calculateScalePositions, getScaleNotes, NOTES, NotePosition } from '@/lib/musicTheory';
import { EXTENDED_SCALE_INTERVALS } from '@/lib/musicalCompatibility';
import { AIScaleRecommendation, FretboardScaleData } from './types';

/**
 * Parse AI scale recommendation to fretboard data
 */
export function parseAIScaleToFretboard(
  aiScale: AIScaleRecommendation,
  tuning: string[]
): FretboardScaleData {
  // Validate root note
  if (!NOTES.includes(aiScale.rootNote)) {
    throw new Error(`Invalid root note: ${aiScale.rootNote}`);
  }

  // Validate intervals
  if (!aiScale.intervals.every(i => i >= 0 && i <= 11)) {
    throw new Error('Invalid intervals: must be 0-11');
  }

  let notePositions: NotePosition[];

  // Check if scale exists in EXTENDED_SCALE_INTERVALS
  if (EXTENDED_SCALE_INTERVALS[aiScale.scaleName]) {
    // Use existing scale calculation
    notePositions = calculateScalePositions(
      aiScale.rootNote,
      aiScale.scaleName,
      tuning
    );
  } else {
    // Custom scale: calculate positions from AI-provided intervals
    notePositions = calculateCustomScalePositions(
      aiScale.rootNote,
      aiScale.intervals,
      tuning
    );
  }

  // Extract chord tones and guide tones
  const chordTones = aiScale.chordTones || [];
  const allNotes = aiScale.noteDegrees?.map(nd => nd.note) || [];
  const guideTones = allNotes.filter(note => !chordTones.includes(note));

  return {
    rootNote: aiScale.rootNote,
    scaleName: aiScale.scaleName,
    notePositions,
    chordTones,
    guideTones,
  };
}

/**
 * Calculate note positions for custom scales (not in EXTENDED_SCALE_INTERVALS)
 */
function calculateCustomScalePositions(
  rootNote: string,
  intervals: number[],
  tuning: string[],
  maxFrets: number = 24
): NotePosition[] {
  const positions: NotePosition[] = [];
  const rootIndex = NOTES.indexOf(rootNote);

  // Calculate scale notes from intervals
  const scaleNotes = intervals.map(interval => NOTES[(rootIndex + interval) % 12]);

  tuning.forEach((openNote, stringIndex) => {
    const openNoteIndex = NOTES.indexOf(openNote);

    for (let fret = 0; fret <= maxFrets; fret++) {
      const noteIndex = (openNoteIndex + fret) % 12;
      const note = NOTES[noteIndex];

      if (scaleNotes.includes(note)) {
        positions.push({
          stringIndex,
          fretNumber: fret,
          note,
          isRoot: note === rootNote,
        });
      }
    }
  });

  return positions;
}

/**
 * Validate AI scale recommendation
 */
export function validateAIScale(scale: AIScaleRecommendation): boolean {
  // Validate required fields
  if (!scale.scaleName || !scale.rootNote || !scale.intervals) {
    return false;
  }

  // Validate root note
  if (!NOTES.includes(scale.rootNote)) {
    return false;
  }

  // Validate intervals
  if (!Array.isArray(scale.intervals) || scale.intervals.length === 0) {
    return false;
  }

  if (!scale.intervals.every(i => typeof i === 'number' && i >= 0 && i <= 11)) {
    return false;
  }

  // Validate note degrees match intervals (if provided)
  if (scale.noteDegrees && scale.noteDegrees.length !== scale.intervals.length) {
    return false;
  }

  return true;
}

/**
 * Get scale notes from AI recommendation
 */
export function getScaleNotesFromAI(scale: AIScaleRecommendation): string[] {
  const rootIndex = NOTES.indexOf(scale.rootNote);
  return scale.intervals.map(interval => NOTES[(rootIndex + interval) % 12]);
}

/**
 * Check if a scale exists in the database
 */
export function isKnownScale(scaleName: string): boolean {
  return scaleName in EXTENDED_SCALE_INTERVALS;
}

/**
 * Get difficulty color for UI display
 */
export function getDifficultyColor(difficulty: number): string {
  if (difficulty <= 3) return '#10b981'; // Green - Easy
  if (difficulty <= 6) return '#f59e0b'; // Orange - Medium
  return '#ef4444'; // Red - Hard
}

/**
 * Get difficulty label
 */
export function getDifficultyLabel(difficulty: number): string {
  if (difficulty <= 3) return 'Beginner';
  if (difficulty <= 6) return 'Intermediate';
  return 'Advanced';
}

