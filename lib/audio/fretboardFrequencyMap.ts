/**
 * Fretboard Frequency Map
 * Generates and manages frequency mappings for all fret positions on a guitar
 */

import { NOTES, TUNINGS, getNoteAtFret } from '../musicTheory';
import { midiNoteToFrequency, frequencyToMidiNote } from './frequencyToNote';

/**
 * Represents a specific fret position with its frequency
 */
export interface FretPosition {
  stringIndex: number;      // 0-based index (0 = lowest string in standard orientation)
  stringName: string;       // Open string note name (e.g., 'E', 'A', 'D')
  fretNumber: number;       // 0-24
  note: string;             // Note name at this position (e.g., 'E', 'A#', 'Db')
  frequency: number;        // Exact frequency in Hz
  midiNote: number;         // MIDI note number (0-127)
}

/**
 * Frequency map for a specific guitar tuning
 */
export interface FrequencyMap {
  tuningName: string;
  stringCount: 6 | 7;
  tuning: string[];
  positions: FretPosition[];
  frequencyIndex: Map<number, FretPosition[]>; // Frequency bucket (rounded to Hz) → positions
}

/**
 * Calculate the frequency of a note at a specific fret
 * Formula: frequency = openStringFrequency × 2^(fret/12)
 * 
 * @param openStringNote - The note of the open string (e.g., 'E', 'A')
 * @param fretNumber - The fret number (0-24)
 * @returns Frequency in Hz
 */
export function calculateFretFrequency(openStringNote: string, fretNumber: number): number {
  // Normalize note name (convert flats to sharps for consistency)
  const normalizedNote = openStringNote.replace('b', '#');
  
  // Get base MIDI note for the open string
  // Standard tuning: E2(40), A2(45), D3(50), G3(55), B3(59), E4(64)
  const noteToMidiBase: { [key: string]: number } = {
    'E': 40,   // E2
    'A': 45,   // A2
    'D': 50,   // D3
    'G': 55,   // G3
    'B': 59,   // B3 (or 35 for 7-string B1)
    'F': 53,   // F3
    'C': 48,   // C3
    // Sharps
    'D#': 51,  // D#3
    'G#': 44,  // G#2
    'C#': 49,  // C#3
    'F#': 54,  // F#3
    'A#': 46,  // A#2
  };

  const baseMidiNote = noteToMidiBase[normalizedNote] || 40; // Default to E2
  const midiNote = baseMidiNote + fretNumber;
  
  return midiNoteToFrequency(midiNote);
}

/**
 * Generate frequency map for a specific tuning
 * 
 * @param tuning - Array of open string notes (e.g., ['E', 'A', 'D', 'G', 'B', 'E'])
 * @param tuningName - Name of the tuning (e.g., 'Standard', 'Drop D')
 * @param maxFrets - Maximum number of frets (default 24)
 * @returns Complete frequency map
 */
export function generateFrequencyMap(
  tuning: string[],
  tuningName: string,
  maxFrets: number = 24
): FrequencyMap {
  const positions: FretPosition[] = [];
  const frequencyIndex = new Map<number, FretPosition[]>();

  // Generate positions for each string
  tuning.forEach((openStringNote, stringIndex) => {
    for (let fret = 0; fret <= maxFrets; fret++) {
      const note = getNoteAtFret(openStringNote, fret);
      const frequency = calculateFretFrequency(openStringNote, fret);
      const midiNote = frequencyToMidiNote(frequency);

      const position: FretPosition = {
        stringIndex,
        stringName: openStringNote,
        fretNumber: fret,
        note,
        frequency,
        midiNote,
      };

      positions.push(position);

      // Add to frequency index (bucket by rounded Hz for fast lookup)
      const bucket = Math.round(frequency);
      if (!frequencyIndex.has(bucket)) {
        frequencyIndex.set(bucket, []);
      }
      frequencyIndex.get(bucket)!.push(position);
    }
  });

  return {
    tuningName,
    stringCount: tuning.length as 6 | 7,
    tuning,
    positions,
    frequencyIndex,
  };
}

/**
 * Find all fret positions within a frequency tolerance
 * 
 * @param frequencyMap - The frequency map to search
 * @param targetFrequency - The frequency to match
 * @param tolerance - Tolerance in Hz (default 15)
 * @returns Array of matching positions
 */
export function findPositionsByFrequency(
  frequencyMap: FrequencyMap,
  targetFrequency: number,
  tolerance: number = 15
): FretPosition[] {
  const candidates: FretPosition[] = [];
  const minFreq = targetFrequency - tolerance;
  const maxFreq = targetFrequency + tolerance;

  // Search frequency buckets within range
  const minBucket = Math.floor(minFreq);
  const maxBucket = Math.ceil(maxFreq);

  for (let bucket = minBucket; bucket <= maxBucket; bucket++) {
    const positions = frequencyMap.frequencyIndex.get(bucket);
    if (positions) {
      // Filter positions within exact tolerance
      const matches = positions.filter(pos => 
        pos.frequency >= minFreq && pos.frequency <= maxFreq
      );
      candidates.push(...matches);
    }
  }

  return candidates;
}

/**
 * Cache for frequency maps to avoid regeneration
 */
const frequencyMapCache = new Map<string, FrequencyMap>();

/**
 * Get or generate frequency map for a tuning
 * Uses caching to avoid regenerating maps
 *
 * @param tuning - Array of open string notes
 * @param tuningName - Name of the tuning
 * @param stringCount - Number of strings (6 or 7)
 * @returns Frequency map
 */
export function getFrequencyMap(
  tuning: string[],
  tuningName: string,
  stringCount: 6 | 7
): FrequencyMap {
  const cacheKey = `${stringCount}-${tuningName}-${tuning.join(',')}`;

  if (!frequencyMapCache.has(cacheKey)) {
    const map = generateFrequencyMap(tuning, tuningName);
    frequencyMapCache.set(cacheKey, map);
  }

  return frequencyMapCache.get(cacheKey)!;
}

/**
 * Clear the frequency map cache
 * Useful for testing or memory management
 */
export function clearFrequencyMapCache(): void {
  frequencyMapCache.clear();
}

/**
 * Get all available tunings and their frequency maps
 *
 * @param stringCount - Number of strings (6 or 7)
 * @returns Map of tuning name to frequency map
 */
export function getAllFrequencyMaps(stringCount: 6 | 7): Map<string, FrequencyMap> {
  const maps = new Map<string, FrequencyMap>();
  const tunings = TUNINGS[stringCount];

  Object.entries(tunings).forEach(([tuningName, tuning]) => {
    const map = getFrequencyMap(tuning, tuningName, stringCount);
    maps.set(tuningName, map);
  });

  return maps;
}

