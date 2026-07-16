/**
 * Service layer for Chord Recommendations System
 * Handles data loading, caching, and business logic
 */

import { ChordRecommendations, RecommendedChord } from './types';

// Cache for loaded data
const recommendationsCache = new Map<string, ChordRecommendations>();

/**
 * Normalize key name for file path
 * Examples: "C" -> "c", "C#" -> "c-sharp", "Db" -> "c-sharp", "B" -> "b"
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
 * Normalize scale name for file path
 * Examples: "Ionian" -> "ionian", "Major Pentatonic" -> "majorpentatonic"
 * Handles common scale name variations and word order
 */
export function normalizeScaleName(scale: string): string {
  const normalized = scale
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/\(.*?\)/g, '') // Remove parentheses
    .replace(/-/g, '');

  // Map common scale name variations to their file names
  const scaleNameMap: Record<string, string> = {
    // Pentatonic variations
    'pentatonicminor': 'minorpentatonic',
    'pentatonicmajor': 'majorpentatonic',
    'minorpent': 'minorpentatonic',
    'majorpent': 'majorpentatonic',

    // Harmonic/Melodic variations
    'minorharmonic': 'harmonicminor',
    'minormelodic': 'melodicminor',

    // Mode names (already correct, but adding for completeness)
    'major': 'ionian',
    'minor': 'aeolian',
    'naturalminor': 'aeolian',
  };

  return scaleNameMap[normalized] || normalized;
}

/**
 * Get file path for chord recommendations
 */
export function getChordRecommendationsPath(key: string, scale: string): string {
  const normalizedKey = normalizeKeyName(key);
  const normalizedScale = normalizeScaleName(scale);
  return `/data/chord-recommendations/${normalizedKey}-${normalizedScale}.json`;
}

/**
 * Load chord recommendations for a key-scale combination
 */
export async function loadChordRecommendations(
  key: string,
  scale: string
): Promise<ChordRecommendations | null> {
  const cacheKey = `${key}-${scale}`;
  
  // Check cache first
  if (recommendationsCache.has(cacheKey)) {
    return recommendationsCache.get(cacheKey)!;
  }

  try {
    const path = getChordRecommendationsPath(key, scale);
    const response = await fetch(path);
    
    if (!response.ok) {
      console.error(`Failed to load chord recommendations for ${key} ${scale}`);
      return null;
    }

    const data: ChordRecommendations = await response.json();
    recommendationsCache.set(cacheKey, data);
    return data;
  } catch (error) {
    console.error(`Error loading chord recommendations for ${key} ${scale}:`, error);
    return null;
  }
}

/**
 * Get all recommended chords for a key-scale combination
 */
export async function getAllRecommendedChords(
  key: string,
  scale: string
): Promise<{
  diatonic: RecommendedChord[];
  extended: RecommendedChord[];
  modalInterchange: RecommendedChord[];
}> {
  const recommendations = await loadChordRecommendations(key, scale);
  
  if (!recommendations) {
    return {
      diatonic: [],
      extended: [],
      modalInterchange: [],
    };
  }

  return {
    diatonic: recommendations.diatonicChords,
    extended: recommendations.extendedChords,
    modalInterchange: recommendations.modalInterchangeChords,
  };
}

/**
 * Get diatonic chords only
 */
export async function getDiatonicChords(
  key: string,
  scale: string
): Promise<RecommendedChord[]> {
  const recommendations = await loadChordRecommendations(key, scale);
  return recommendations?.diatonicChords || [];
}

/**
 * Get extended chords only
 */
export async function getExtendedChords(
  key: string,
  scale: string
): Promise<RecommendedChord[]> {
  const recommendations = await loadChordRecommendations(key, scale);
  return recommendations?.extendedChords || [];
}

/**
 * Get modal interchange chords only
 */
export async function getModalInterchangeChords(
  key: string,
  scale: string
): Promise<RecommendedChord[]> {
  const recommendations = await loadChordRecommendations(key, scale);
  return recommendations?.modalInterchangeChords || [];
}

/**
 * Clear all caches (useful for testing or manual refresh)
 */
export function clearCache(): void {
  recommendationsCache.clear();
}

