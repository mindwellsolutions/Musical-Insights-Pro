import { NOTES, getNoteAtFret } from '../musicTheory';
import { findBestFretPositionWithContext, FretPositionMatch } from './frequencyPositionMatcher';

/**
 * Represents a live detected note position on the fretboard
 */
export interface LiveNotePosition {
  stringIndex: number;
  fretNumber: number;
  note: string;
  isGhostNote: boolean; // True if note is not in the current scale
  frequency?: number;    // Detected frequency (optional)
  confidence?: number;   // Confidence score 0-1 (optional)
}

/**
 * Calculate exact fret position based on detected frequency
 * This is the NEW frequency-based approach that returns a single position
 *
 * @param detectedNote - The note detected by the pitch detector (e.g., 'A', 'C#', 'Eb')
 * @param detectedFrequency - The detected frequency in Hz
 * @param tuning - Array of open string notes (e.g., ['E', 'A', 'D', 'G', 'B', 'E'])
 * @param tuningName - Name of the tuning (e.g., 'Standard', 'Drop D')
 * @param scaleNotes - Array of notes in the current scale (for ghost note detection)
 * @returns Single LiveNotePosition or null if no match
 */
export function calculateExactLiveNotePosition(
  detectedNote: string | null,
  detectedFrequency: number | null,
  tuning: string[],
  tuningName: string,
  scaleNotes: string[]
): LiveNotePosition | null {
  // If no frequency data, fall back to note-based matching (returns first occurrence)
  if (!detectedFrequency || !detectedNote) {
    return null;
  }

  // Use frequency-based matching to find exact position
  const stringCount = tuning.length as 6 | 7;
  const match = findBestFretPositionWithContext(
    detectedFrequency,
    tuning,
    tuningName,
    stringCount,
    {
      tolerance: 15,        // ±15 Hz tolerance
      minConfidence: 0.5,   // Minimum 50% confidence
      useStringWeighting: true,
      useHarmonicFiltering: true,
    }
  );

  if (!match) {
    return null; // No good match found
  }

  // Normalize the note to use sharp notation (internal format)
  const normalizedNote = detectedNote.replace('b', '#');

  // Check if this note is in the current scale
  const isInScale = scaleNotes.includes(normalizedNote);

  return {
    stringIndex: match.stringIndex,
    fretNumber: match.fretNumber,
    note: match.note,
    isGhostNote: !isInScale,
    frequency: match.detectedFrequency,
    confidence: match.confidence,
  };
}

/**
 * Calculate all fret positions where a detected note can be played
 * across all strings on the fretboard (0-24 frets)
 *
 * LEGACY FUNCTION - Use calculateExactLiveNotePosition for frequency-based detection
 * This function is kept for backward compatibility
 *
 * @param detectedNote - The note detected by the pitch detector (e.g., 'A', 'C#', 'Eb')
 * @param tuning - Array of open string notes (e.g., ['E', 'A', 'D', 'G', 'B', 'E'])
 * @param scaleNotes - Array of notes in the current scale (for ghost note detection)
 * @param maxFrets - Maximum number of frets (default 24)
 * @returns Array of LiveNotePosition objects
 */
export function calculateLiveNotePositions(
  detectedNote: string | null,
  tuning: string[],
  scaleNotes: string[],
  maxFrets: number = 24
): LiveNotePosition[] {
  if (!detectedNote) return [];

  const positions: LiveNotePosition[] = [];

  // Normalize the detected note to use sharp notation (internal format)
  // The pitch detector returns notes like 'A', 'C#', 'D#', etc.
  const normalizedNote = detectedNote.replace('b', '#'); // Convert flats to sharps if needed

  // Check if this note is in the current scale
  const isInScale = scaleNotes.includes(normalizedNote);

  // Find all positions where this note appears on the fretboard
  tuning.forEach((openNote, stringIndex) => {
    for (let fret = 0; fret <= maxFrets; fret++) {
      const noteAtFret = getNoteAtFret(openNote, fret);

      // Check if this fret position matches the detected note
      if (noteAtFret === normalizedNote) {
        positions.push({
          stringIndex,
          fretNumber: fret,
          note: normalizedNote,
          isGhostNote: !isInScale,
        });
      }
    }
  });

  return positions;
}

/**
 * Merge live note positions with existing scale positions for rendering
 * This ensures live notes are highlighted even if they're already in the scale
 * 
 * @param livePositions - Positions of currently detected notes
 * @returns Map of position keys to live note data for quick lookup
 */
export function createLiveNoteMap(
  livePositions: LiveNotePosition[]
): Map<string, LiveNotePosition> {
  const map = new Map<string, LiveNotePosition>();
  
  livePositions.forEach(pos => {
    const key = `${pos.stringIndex}-${pos.fretNumber}`;
    map.set(key, pos);
  });
  
  return map;
}

