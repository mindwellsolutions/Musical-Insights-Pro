/**
 * Frequency to Fretboard Position Matcher
 * Matches detected frequencies to exact fret positions on the guitar
 */

import { FretPosition, findPositionsByFrequency, getFrequencyMap } from './fretboardFrequencyMap';

/**
 * Result of frequency-to-position matching
 */
export interface FretPositionMatch {
  stringIndex: number;
  fretNumber: number;
  note: string;
  frequency: number;
  detectedFrequency: number;
  confidence: number;       // 0.0 to 1.0
  frequencyDifference: number; // Hz difference from expected
}

/**
 * Configuration for position matching
 */
export interface PositionMatcherConfig {
  tolerance: number;        // Frequency tolerance in Hz (default: 15)
  minConfidence: number;    // Minimum confidence to return a match (default: 0.5)
  useStringWeighting: boolean; // Apply string probability weighting (default: true)
  useHarmonicFiltering: boolean; // Filter harmonic overtones (default: true)
}

const DEFAULT_CONFIG: PositionMatcherConfig = {
  tolerance: 15,
  minConfidence: 0.5,
  useStringWeighting: true,
  useHarmonicFiltering: true,
};

/**
 * Calculate string probability based on frequency range
 * Higher probability for strings whose typical range includes this frequency
 * 
 * @param frequency - Detected frequency in Hz
 * @param stringIndex - String index (0 = lowest string)
 * @param stringCount - Total number of strings (6 or 7)
 * @returns Probability score (0.0 to 1.0)
 */
function getStringProbability(
  frequency: number,
  stringIndex: number,
  stringCount: 6 | 7
): number {
  // Define expected frequency ranges for each string (standard tuning)
  // These are the typical playing ranges, not absolute limits
  const stringRanges6String = [
    { min: 80, max: 180, optimal: 110 },   // String 0 (Low E) - E2 to F#3
    { min: 100, max: 240, optimal: 150 },  // String 1 (A) - A2 to B3
    { min: 140, max: 320, optimal: 200 },  // String 2 (D) - D3 to E4
    { min: 190, max: 420, optimal: 280 },  // String 3 (G) - G3 to G#4
    { min: 240, max: 520, optimal: 350 },  // String 4 (B) - B3 to C5
    { min: 320, max: 680, optimal: 470 },  // String 5 (High E) - E4 to E5
  ];

  const stringRanges7String = [
    { min: 60, max: 130, optimal: 85 },    // String 0 (Low B) - B1 to C3
    ...stringRanges6String,
  ];

  const ranges = stringCount === 7 ? stringRanges7String : stringRanges6String;
  const range = ranges[stringIndex];

  if (!range) return 0.5; // Default probability

  // If frequency is outside the range, low probability
  if (frequency < range.min || frequency > range.max) {
    return 0.1;
  }

  // Calculate probability based on distance from optimal frequency
  const distanceFromOptimal = Math.abs(frequency - range.optimal);
  const rangeSize = range.max - range.min;
  
  // Closer to optimal = higher probability
  const probability = Math.max(0.3, 1 - (distanceFromOptimal / rangeSize));
  
  return probability;
}

/**
 * Calculate confidence score for a position match
 * 
 * @param detectedFreq - Detected frequency in Hz
 * @param position - Candidate fret position
 * @param allCandidates - All candidate positions
 * @param config - Matcher configuration
 * @returns Confidence score (0.0 to 1.0)
 */
function calculateConfidence(
  detectedFreq: number,
  position: FretPosition,
  allCandidates: FretPosition[],
  config: PositionMatcherConfig
): number {
  // 1. Frequency match score (60% weight)
  const freqDiff = Math.abs(detectedFreq - position.frequency);
  const freqScore = Math.max(0, 1 - (freqDiff / config.tolerance));

  // 2. String probability weight (30% weight)
  let stringWeight = 0.5; // Default
  if (config.useStringWeighting) {
    stringWeight = getStringProbability(
      detectedFreq,
      position.stringIndex,
      allCandidates.length > 6 ? 7 : 6
    );
  }

  // 3. Uniqueness bonus (10% weight)
  // Fewer candidates = higher confidence
  const uniquenessBonus = allCandidates.length === 1 ? 1.0 : 1 / Math.sqrt(allCandidates.length);

  // Combined score
  const confidence = (freqScore * 0.6) + (stringWeight * 0.3) + (uniquenessBonus * 0.1);

  return Math.min(1.0, Math.max(0.0, confidence));
}

/**
 * Check if a frequency might be a harmonic overtone
 * Harmonics occur at 2x, 3x, 4x the fundamental frequency
 * 
 * @param frequency - Frequency to check
 * @param candidates - All candidate positions
 * @returns True if likely a harmonic
 */
function isLikelyHarmonic(frequency: number, candidates: FretPosition[]): boolean {
  // Check if there's a candidate at half the frequency (fundamental)
  const fundamentalFreq = frequency / 2;
  const hasFundamental = candidates.some(pos => 
    Math.abs(pos.frequency - fundamentalFreq) < 10
  );

  return hasFundamental;
}

/**
 * Find the best matching fret position for a detected frequency
 * 
 * @param frequency - Detected frequency in Hz
 * @param tuning - Current guitar tuning
 * @param tuningName - Name of the tuning
 * @param stringCount - Number of strings (6 or 7)
 * @param config - Matcher configuration (optional)
 * @returns Best matching position or null if no good match
 */
export function findBestFretPosition(
  frequency: number,
  tuning: string[],
  tuningName: string,
  stringCount: 6 | 7,
  config: Partial<PositionMatcherConfig> = {}
): FretPositionMatch | null {
  const fullConfig = { ...DEFAULT_CONFIG, ...config };

  // Get frequency map for current tuning
  const frequencyMap = getFrequencyMap(tuning, tuningName, stringCount);

  // Find all candidate positions within tolerance
  let candidates = findPositionsByFrequency(frequencyMap, frequency, fullConfig.tolerance);

  if (candidates.length === 0) {
    return null; // No matches found
  }

  // Filter harmonics if enabled
  if (fullConfig.useHarmonicFiltering && isLikelyHarmonic(frequency, candidates)) {
    // This might be a harmonic - try to find the fundamental
    const fundamentalFreq = frequency / 2;
    const fundamentalCandidates = findPositionsByFrequency(
      frequencyMap,
      fundamentalFreq,
      fullConfig.tolerance
    );

    if (fundamentalCandidates.length > 0) {
      // Use fundamental instead
      candidates = fundamentalCandidates;
      frequency = fundamentalFreq;
    }
  }

  // Calculate confidence for each candidate
  const scoredCandidates = candidates.map(position => ({
    position,
    confidence: calculateConfidence(frequency, position, candidates, fullConfig),
    frequencyDifference: Math.abs(frequency - position.frequency),
  }));

  // Sort by confidence (highest first)
  scoredCandidates.sort((a, b) => b.confidence - a.confidence);

  // Get best match
  const best = scoredCandidates[0];

  // Check if confidence meets minimum threshold
  if (best.confidence < fullConfig.minConfidence) {
    return null; // Confidence too low
  }

  // Return the best match
  return {
    stringIndex: best.position.stringIndex,
    fretNumber: best.position.fretNumber,
    note: best.position.note,
    frequency: best.position.frequency,
    detectedFrequency: frequency,
    confidence: best.confidence,
    frequencyDifference: best.frequencyDifference,
  };
}

/**
 * Position history tracker for context-aware matching
 */
class PositionHistory {
  private history: FretPositionMatch[] = [];
  private maxHistory: number = 5;

  add(position: FretPositionMatch): void {
    this.history.push(position);
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    }
  }

  getRecent(): FretPositionMatch[] {
    return [...this.history];
  }

  clear(): void {
    this.history = [];
  }

  /**
   * Get the most likely string based on recent playing history
   */
  getMostLikelyString(): number | null {
    if (this.history.length === 0) return null;

    // Count string occurrences
    const stringCounts = new Map<number, number>();
    this.history.forEach(pos => {
      const count = stringCounts.get(pos.stringIndex) || 0;
      stringCounts.set(pos.stringIndex, count + 1);
    });

    // Find most common string
    let maxCount = 0;
    let mostLikelyString: number | null = null;
    stringCounts.forEach((count, stringIndex) => {
      if (count > maxCount) {
        maxCount = count;
        mostLikelyString = stringIndex;
      }
    });

    return mostLikelyString;
  }
}

// Global position history instance
const positionHistory = new PositionHistory();

/**
 * Find best fret position with context awareness
 * Uses playing history to improve accuracy when multiple positions are possible
 *
 * @param frequency - Detected frequency in Hz
 * @param tuning - Current guitar tuning
 * @param tuningName - Name of the tuning
 * @param stringCount - Number of strings (6 or 7)
 * @param config - Matcher configuration (optional)
 * @returns Best matching position or null if no good match
 */
export function findBestFretPositionWithContext(
  frequency: number,
  tuning: string[],
  tuningName: string,
  stringCount: 6 | 7,
  config: Partial<PositionMatcherConfig> = {}
): FretPositionMatch | null {
  const match = findBestFretPosition(frequency, tuning, tuningName, stringCount, config);

  if (match) {
    // Add to history
    positionHistory.add(match);
  }

  return match;
}

/**
 * Clear position history
 * Useful when changing tunings or starting a new session
 */
export function clearPositionHistory(): void {
  positionHistory.clear();
}

/**
 * Get position history for debugging or analysis
 */
export function getPositionHistory(): FretPositionMatch[] {
  return positionHistory.getRecent();
}

