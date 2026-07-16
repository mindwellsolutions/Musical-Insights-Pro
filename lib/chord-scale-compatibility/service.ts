/**
 * Service layer for Chord-Scale Compatibility System
 * Handles data loading, caching, and business logic
 */

import {
  ChordScaleCompatibility,
  ChordScaleIndex,
  CompatibleScale,
} from './types';

// Cache for loaded data
const compatibilityCache = new Map<string, ChordScaleCompatibility>();
let indexCache: ChordScaleIndex | null = null;

/**
 * Load the master index of chord types
 */
export async function loadChordScaleIndex(): Promise<ChordScaleIndex | null> {
  if (indexCache) {
    return indexCache;
  }

  try {
    const response = await fetch('/data/chord-scale-compatibility/index.json');
    if (!response.ok) {
      console.error('Failed to load chord-scale index');
      return null;
    }

    indexCache = await response.json();
    return indexCache;
  } catch (error) {
    console.error('Error loading chord-scale index:', error);
    return null;
  }
}

/**
 * Parse chord symbol to extract quality
 * Examples: "Cmaj7" -> "major7", "Dm7" -> "minor7", "G7" -> "dominant7"
 */
export function parseChordQuality(chordSymbol: string): string | null {
  // Remove root note (first 1-2 characters)
  const rootMatch = chordSymbol.match(/^[A-G][#b]?/);
  if (!rootMatch) return null;

  const suffix = chordSymbol.slice(rootMatch[0].length);

  // Map suffixes to quality names
  const qualityMap: Record<string, string> = {
    '': 'major',
    'm': 'minor',
    'min': 'minor',
    '°': 'diminished',
    'dim': 'diminished',
    '+': 'augmented',
    'aug': 'augmented',
    'maj7': 'major7',
    'M7': 'major7',
    'm7': 'minor7',
    'min7': 'minor7',
    '7': 'dominant7',
    'dom7': 'dominant7',
    '°7': 'diminished7',
    'dim7': 'diminished7',
    'm7♭5': 'half-diminished7',
    'ø7': 'half-diminished7',
    'maj9': 'major9',
    'M9': 'major9',
    'm9': 'minor9',
    '9': 'dominant9',
    'maj11': 'major11',
    'm11': 'minor11',
    '11': 'dominant11',
    'maj13': 'major13',
    'm13': 'minor13',
    '13': 'dominant13',
    'sus2': 'sus2',
    'sus4': 'sus4',
    '6': 'major6',
    'm6': 'minor6',
    'add9': 'add9',
    'madd9': 'minor-add9',
  };

  return qualityMap[suffix] || null;
}

/**
 * Load chord-scale compatibility data for a specific chord quality
 */
export async function loadChordScaleCompatibility(
  quality: string
): Promise<ChordScaleCompatibility | null> {
  // Check cache first
  if (compatibilityCache.has(quality)) {
    return compatibilityCache.get(quality)!;
  }

  try {
    const response = await fetch(`/data/chord-scale-compatibility/${quality}.json`);
    if (!response.ok) {
      console.error(`Failed to load chord-scale compatibility for ${quality}`);
      return null;
    }

    const data: ChordScaleCompatibility = await response.json();
    compatibilityCache.set(quality, data);
    return data;
  } catch (error) {
    console.error(`Error loading chord-scale compatibility for ${quality}:`, error);
    return null;
  }
}

/**
 * Get compatible scales for a chord symbol
 */
export async function getCompatibleScales(
  chordSymbol: string
): Promise<CompatibleScale[]> {
  const quality = parseChordQuality(chordSymbol);
  if (!quality) {
    console.error(`Could not parse chord quality from: ${chordSymbol}`);
    return [];
  }

  const compatibility = await loadChordScaleCompatibility(quality);
  if (!compatibility) {
    return [];
  }

  return compatibility.compatibleScales;
}

/**
 * Get chord quality display name
 */
export async function getChordQualityDisplayName(
  chordSymbol: string
): Promise<string> {
  const quality = parseChordQuality(chordSymbol);
  if (!quality) return 'Unknown';

  const compatibility = await loadChordScaleCompatibility(quality);
  return compatibility?.displayName || 'Unknown';
}

/**
 * Clear all caches (useful for testing or manual refresh)
 */
export function clearCache(): void {
  compatibilityCache.clear();
  indexCache = null;
}

