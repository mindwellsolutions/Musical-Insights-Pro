/**
 * Mode Database Loader
 * Loads mode data from music-theory JSON database files
 * Integrates with existing music theory database structure
 */

import { loadKeyDatabase, KeyDatabase } from './music-theory-database/loader';
import { calculateScalePositions, NotePosition } from './musicTheory';
import { TriadType } from './triad-theory';
import { getCompatibleModesForTriad, ModeCompatibility } from './mode-compatibility-database';

export interface ModeData {
  rootNote: string;
  modeName: string;
  displayName: string;
  notePositions: NotePosition[];
  intervals: number[];
  quality: string;
  scaleDbKey: string;
}

// Cache for loaded mode data to improve performance
const modeDataCache = new Map<string, ModeData>();

/**
 * Generate cache key for mode data
 */
function getCacheKey(rootNote: string, scaleDbKey: string, tuning: string[]): string {
  return `${rootNote}-${scaleDbKey}-${tuning.join(',')}`;
}

/**
 * Load mode data from music theory database
 * @param rootNote - The root note (e.g., 'C', 'D', 'F#')
 * @param scaleDbKey - The scale database key (e.g., 'Ionian', 'Dorian')
 * @param tuning - Guitar tuning array (e.g., ['E', 'A', 'D', 'G', 'B', 'E'])
 * @returns ModeData object or null if not found
 */
export async function loadModeFromDatabase(
  rootNote: string,
  scaleDbKey: string,
  tuning: string[]
): Promise<ModeData | null> {
  // Check cache first
  const cacheKey = getCacheKey(rootNote, scaleDbKey, tuning);
  if (modeDataCache.has(cacheKey)) {
    return modeDataCache.get(cacheKey)!;
  }

  try {
    // Load the key database
    const database = await loadKeyDatabase(rootNote);
    if (!database) {
      console.error(`[Mode Loader] Failed to load database for key: ${rootNote}`);
      return null;
    }

    // Get scale data from database
    const scaleData = database.scales[scaleDbKey];
    if (!scaleData) {
      console.error(`[Mode Loader] Scale ${scaleDbKey} not found in ${rootNote} database`);
      return null;
    }

    // Calculate note positions for fretboard
    const notePositions = calculateScalePositions(
      rootNote,
      scaleDbKey,
      tuning
    );

    // Create mode data object
    const modeData: ModeData = {
      rootNote,
      modeName: scaleDbKey,
      displayName: scaleData.sourceScale?.name || `${rootNote} ${scaleDbKey}`,
      notePositions,
      intervals: scaleData.sourceScale?.intervals || [],
      quality: scaleData.sourceScale?.quality || 'major',
      scaleDbKey
    };

    // Cache the result
    modeDataCache.set(cacheKey, modeData);

    return modeData;
  } catch (error) {
    console.error(`[Mode Loader] Error loading mode ${scaleDbKey} for ${rootNote}:`, error);
    return null;
  }
}

/**
 * Load all compatible modes for a triad
 * @param rootNote - The root note of the triad
 * @param triadType - The triad type (major, minor, diminished, augmented)
 * @param tuning - Guitar tuning array
 * @returns Array of ModeData objects
 */
export async function loadCompatibleModesForTriad(
  rootNote: string,
  triadType: TriadType,
  tuning: string[]
): Promise<ModeData[]> {
  // Get compatible modes from database
  const compatibleModes = getCompatibleModesForTriad(rootNote, triadType);

  // Load all modes in parallel
  const modeDataPromises = compatibleModes.map(mode =>
    loadModeFromDatabase(rootNote, mode.scaleDbKey, tuning)
  );

  const results = await Promise.all(modeDataPromises);

  // Filter out null results
  return results.filter((mode): mode is ModeData => mode !== null);
}

/**
 * Preload modes for a triad to improve performance
 * Call this when user selects a new triad to cache the data
 */
export async function preloadModesForTriad(
  rootNote: string,
  triadType: TriadType,
  tuning: string[]
): Promise<void> {
  await loadCompatibleModesForTriad(rootNote, triadType, tuning);
}

/**
 * Clear the mode data cache
 * Useful when tuning changes or to free memory
 */
export function clearModeCache(): void {
  modeDataCache.clear();
}

/**
 * Get cache statistics for debugging
 */
export function getModeCacheStats(): { size: number; keys: string[] } {
  return {
    size: modeDataCache.size,
    keys: Array.from(modeDataCache.keys())
  };
}

