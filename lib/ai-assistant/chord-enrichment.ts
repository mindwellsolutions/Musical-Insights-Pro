/**
 * AI Assistant Chord Enrichment Service
 * 
 * Enriches slim AI chord responses with full chord data from our database.
 * Similar to scale enrichment, this optimizes token usage.
 */

import { AIChordRecommendation, AIChordRecommendationSlim } from './types';
import { NOTES } from '@/lib/musicTheory';

/**
 * Parse chord name to extract root note and quality
 * Examples: "Cmaj7" -> { root: "C", quality: "maj7" }
 *           "Dm7" -> { root: "D", quality: "m7" }
 *           "G7" -> { root: "G", quality: "7" }
 */
export function parseChordName(chordName: string): { root: string; quality: string } | null {
  if (!chordName || chordName.length === 0) {
    return null;
  }

  // Extract root note (first 1-2 characters)
  let root = chordName[0].toUpperCase();
  let qualityStart = 1;

  // Check for sharp or flat
  if (chordName.length > 1 && (chordName[1] === '#' || chordName[1] === 'b')) {
    root += chordName[1];
    qualityStart = 2;
  }

  // Normalize flat to sharp for internal use
  if (root.includes('b')) {
    const flatToSharp: Record<string, string> = {
      'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#'
    };
    root = flatToSharp[root] || root;
  }

  // Validate root note
  if (!NOTES.includes(root)) {
    console.error(`[Chord Enrichment] Invalid root note: ${root} from ${chordName}`);
    return null;
  }

  // Extract quality (everything after root)
  const quality = chordName.substring(qualityStart) || 'major';

  return { root, quality };
}

/**
 * Normalize chord quality to standard format
 */
export function normalizeChordQuality(quality: string): string {
  const qualityMap: Record<string, string> = {
    // Major variants
    '': 'major',
    'M': 'major',
    'maj': 'major',
    'major': 'major',
    
    // Minor variants
    'm': 'minor',
    'min': 'minor',
    'minor': 'minor',
    '-': 'minor',
    
    // Seventh chords
    '7': 'dominant7',
    'dom7': 'dominant7',
    'maj7': 'major7',
    'M7': 'major7',
    'm7': 'minor7',
    'min7': 'minor7',
    '-7': 'minor7',
    'mM7': 'minorMajor7',
    'm(maj7)': 'minorMajor7',
    
    // Diminished
    'dim': 'diminished',
    '°': 'diminished',
    'dim7': 'diminished7',
    '°7': 'diminished7',
    'm7b5': 'halfDiminished',
    'ø': 'halfDiminished',
    'ø7': 'halfDiminished',
    
    // Augmented
    'aug': 'augmented',
    '+': 'augmented',
    
    // Suspended
    'sus2': 'sus2',
    'sus4': 'sus4',
    'sus': 'sus4',
    
    // Extended
    '9': 'dominant9',
    'maj9': 'major9',
    'M9': 'major9',
    'm9': 'minor9',
    'min9': 'minor9',
    '11': 'dominant11',
    '13': 'dominant13',
    
    // Added tones
    'add9': 'add9',
    '6': 'major6',
    'm6': 'minor6',
    'min6': 'minor6',
  };

  return qualityMap[quality] || quality;
}

/**
 * Calculate chord tones from root and quality
 */
export function calculateChordTones(root: string, quality: string): string[] {
  const rootIndex = NOTES.indexOf(root);
  if (rootIndex === -1) {
    return [];
  }

  const normalizedQuality = normalizeChordQuality(quality);
  
  // Interval patterns for different chord qualities (semitones from root)
  const intervalPatterns: Record<string, number[]> = {
    'major': [0, 4, 7],
    'minor': [0, 3, 7],
    'diminished': [0, 3, 6],
    'augmented': [0, 4, 8],
    'sus2': [0, 2, 7],
    'sus4': [0, 5, 7],
    'dominant7': [0, 4, 7, 10],
    'major7': [0, 4, 7, 11],
    'minor7': [0, 3, 7, 10],
    'minorMajor7': [0, 3, 7, 11],
    'diminished7': [0, 3, 6, 9],
    'halfDiminished': [0, 3, 6, 10],
    'dominant9': [0, 4, 7, 10, 14],
    'major9': [0, 4, 7, 11, 14],
    'minor9': [0, 3, 7, 10, 14],
    'dominant11': [0, 4, 7, 10, 14, 17],
    'dominant13': [0, 4, 7, 10, 14, 17, 21],
    'add9': [0, 4, 7, 14],
    'major6': [0, 4, 7, 9],
    'minor6': [0, 3, 7, 9],
  };

  const intervals = intervalPatterns[normalizedQuality] || intervalPatterns['major'];
  
  return intervals.map(interval => NOTES[(rootIndex + interval) % 12]);
}

/**
 * Enrich a slim AI chord recommendation with full data
 *
 * Takes: { chordName, rootNote, rationale, genreContext, difficulty }
 * Returns: Full AIChordRecommendation with notes, quality, voicings
 */
export function enrichChordRecommendation(
  slim: AIChordRecommendationSlim
): AIChordRecommendation | null {
  try {
    // Validate input
    if (!slim.chordName || !slim.rootNote) {
      return null;
    }

    // Parse chord name
    const parsed = parseChordName(slim.chordName);
    if (!parsed) {
      return null;
    }

    const { root, quality } = parsed;
    const normalizedQuality = normalizeChordQuality(quality);

    // Calculate chord tones
    const notes = calculateChordTones(root, quality);
    if (notes.length === 0) {
      return null;
    }

    // Return enriched recommendation
    const enriched: AIChordRecommendation = {
      chordName: slim.chordName,
      rootNote: slim.rootNote,
      rationale: slim.rationale,
      genreContext: slim.genreContext,
      difficulty: slim.difficulty,
      notes,
      quality: normalizedQuality,
      // voicings will be calculated on-demand when needed for display
    };

    return enriched;

  } catch (error) {
    return null;
  }
}

/**
 * Enrich multiple chord recommendations
 * Filters out any that fail enrichment
 */
export function enrichChordRecommendations(
  slimRecommendations: AIChordRecommendationSlim[]
): AIChordRecommendation[] {
  const enriched: AIChordRecommendation[] = [];

  for (const slim of slimRecommendations) {
    const result = enrichChordRecommendation(slim);
    if (result) {
      enriched.push(result);
    }
  }

  return enriched;
}

/**
 * Enrichment statistics
 */
export interface ChordEnrichmentStats {
  total: number;
  successful: number;
  failed: number;
  successRate: number;
  failedChords: string[];
}

/**
 * Get enrichment statistics
 */
export function getChordEnrichmentStats(
  slimRecommendations: AIChordRecommendationSlim[],
  enrichedRecommendations: AIChordRecommendation[]
): ChordEnrichmentStats {
  const total = slimRecommendations.length;
  const successful = enrichedRecommendations.length;
  const failed = total - successful;
  const successRate = total > 0 ? (successful / total) * 100 : 0;

  const failedChords = slimRecommendations
    .filter(slim => !enrichedRecommendations.find(e => e.chordName === slim.chordName))
    .map(slim => slim.chordName);

  return {
    total,
    successful,
    failed,
    successRate,
    failedChords,
  };
}

