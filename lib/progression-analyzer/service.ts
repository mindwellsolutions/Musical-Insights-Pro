/**
 * Service layer for Progression Analyzer and Recommendations System
 * Handles data loading, caching, and progression analysis logic
 */

import {
  ProgressionRecommendations,
  ChordProgression,
  ProgressionAnalysis,
  DynamicRecommendationContext,
  ScaleRecommendation,
} from './types';

// Cache for loaded data
const progressionsCache = new Map<string, ProgressionRecommendations>();

/**
 * Normalize key name for file path
 * Examples: "A" → "a", "A#" → "a-sharp", "Bb" → "a-sharp", "B" → "b"
 */
export function normalizeKeyName(key: string): string {
  const normalized = key.trim().toUpperCase();

  // Map all keys to their normalized file names
  const keyMap: Record<string, string> = {
    'A': 'a',
    'A#': 'a-sharp',
    'BB': 'a-sharp',
    'B': 'b',
    'C': 'c',
    'C#': 'c-sharp',
    'DB': 'c-sharp',
    'D': 'd',
    'D#': 'd-sharp',
    'EB': 'd-sharp',
    'E': 'e',
    'F': 'f',
    'F#': 'f-sharp',
    'GB': 'f-sharp',
    'G': 'g',
    'G#': 'g-sharp',
    'AB': 'g-sharp',
  };

  return keyMap[normalized] || normalized.toLowerCase();
}

/**
 * Load progression recommendations for a key
 */
export async function loadProgressionRecommendations(
  key: string
): Promise<ProgressionRecommendations | null> {
  // Check cache first
  if (progressionsCache.has(key)) {
    return progressionsCache.get(key)!;
  }

  try {
    const normalizedKey = normalizeKeyName(key);
    const response = await fetch(`/data/progression-recommendations/${normalizedKey}.json`);
    
    if (!response.ok) {
      console.error(`Failed to load progression recommendations for ${key}`);
      return null;
    }

    const data: ProgressionRecommendations = await response.json();
    progressionsCache.set(key, data);
    return data;
  } catch (error) {
    console.error(`Error loading progression recommendations for ${key}:`, error);
    return null;
  }
}

/**
 * Get all progressions for a key
 */
export async function getProgressions(key: string): Promise<ChordProgression[]> {
  const recommendations = await loadProgressionRecommendations(key);
  return recommendations?.progressions || [];
}

/**
 * Filter progressions by genre
 */
export async function getProgressionsByGenre(
  key: string,
  genre: string
): Promise<ChordProgression[]> {
  const progressions = await getProgressions(key);
  return progressions.filter(p => p.genre.includes(genre));
}

/**
 * Filter progressions by difficulty
 */
export async function getProgressionsByDifficulty(
  key: string,
  difficulty: number
): Promise<ChordProgression[]> {
  const progressions = await getProgressions(key);
  return progressions.filter(p => p.difficulty === difficulty);
}

/**
 * Analyze a chord progression from the "Add to Song" list
 */
export async function analyzeProgression(
  context: DynamicRecommendationContext
): Promise<ProgressionAnalysis | null> {
  const { songList, currentPosition, key } = context;

  if (songList.length === 0 || currentPosition < 0 || currentPosition >= songList.length) {
    return null;
  }

  const currentChord = songList[currentPosition];
  const previousChords = songList.slice(0, currentPosition);

  // Get next chord suggestions based on common progressions
  const progressions = await getProgressions(key);
  const nextChordSuggestions = getNextChordSuggestions(
    currentChord,
    previousChords,
    progressions
  );

  // Get compatible scales for current chord
  const compatibleScales = getCompatibleScalesForChord(currentChord, progressions);

  return {
    currentChord,
    currentIndex: currentPosition,
    totalChords: songList.length,
    previousChords,
    nextChordSuggestions,
    compatibleScales,
    progressionType: identifyProgressionType(songList.slice(0, currentPosition + 1)),
    musicalContext: generateMusicalContext(currentChord, previousChords),
  };
}

/**
 * Get next chord suggestions based on common progressions
 */
function getNextChordSuggestions(
  currentChord: string,
  previousChords: string[],
  progressions: ChordProgression[]
): string[] {
  const suggestions = new Set<string>();

  for (const progression of progressions) {
    const currentIndex = progression.chords.indexOf(currentChord);
    if (currentIndex !== -1 && currentIndex < progression.chords.length - 1) {
      suggestions.add(progression.chords[currentIndex + 1]);
    }
  }

  return Array.from(suggestions).slice(0, 5); // Return top 5 suggestions
}

/**
 * Get compatible scales for a chord from progression data
 */
function getCompatibleScalesForChord(
  chord: string,
  progressions: ChordProgression[]
): ScaleRecommendation[] {
  for (const progression of progressions) {
    if (progression.scaleRecommendations[chord]) {
      return progression.scaleRecommendations[chord];
    }
  }
  return [];
}

/**
 * Identify progression type (e.g., "I-IV-V", "ii-V-I")
 */
function identifyProgressionType(chords: string[]): string {
  if (chords.length < 2) return 'Unknown';
  return `${chords.length}-chord progression`;
}

/**
 * Generate musical context description
 */
function generateMusicalContext(currentChord: string, previousChords: string[]): string {
  if (previousChords.length === 0) {
    return `Starting with ${currentChord}`;
  }
  return `Progressing from ${previousChords[previousChords.length - 1]} to ${currentChord}`;
}

/**
 * Clear all caches
 */
export function clearCache(): void {
  progressionsCache.clear();
}

