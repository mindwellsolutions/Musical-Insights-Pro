/**
 * Music Theory Database Loader
 * Handles loading and caching of JSON music theory databases
 */

import { KeyDatabase, KeyIndex, NormalizedKeyName, DatabasePaths } from './types';

// Re-export KeyDatabase for external use
export type { KeyDatabase } from './types';

/**
 * In-memory cache for loaded databases
 */
const databaseCache = new Map<string, KeyDatabase>();
const indexCache = new Map<string, KeyIndex>();

/**
 * Normalize key name to match file naming convention
 * Examples: "A" → "a", "A#" → "a-sharp", "Bb" → "a-sharp"
 */
export function normalizeKeyName(key: string): NormalizedKeyName {
  const normalized = key.trim().toLowerCase();
  
  // Handle sharp keys
  if (normalized === 'a#' || normalized === 'bb') return 'a-sharp';
  if (normalized === 'c#' || normalized === 'db') return 'c-sharp';
  if (normalized === 'd#' || normalized === 'eb') return 'd-sharp';
  if (normalized === 'f#' || normalized === 'gb') return 'f-sharp';
  if (normalized === 'g#' || normalized === 'ab') return 'g-sharp';
  
  // Handle natural keys
  if (normalized === 'a') return 'a';
  if (normalized === 'b') return 'b';
  if (normalized === 'c') return 'c';
  if (normalized === 'd') return 'd';
  if (normalized === 'e') return 'e';
  if (normalized === 'f') return 'f';
  if (normalized === 'g') return 'g';
  
  // Default fallback
  console.warn(`Unknown key: ${key}, defaulting to 'a'`);
  return 'a';
}

/**
 * Get database file paths for a given key
 */
export function getDatabasePaths(key: string): DatabasePaths {
  const normalizedKey = normalizeKeyName(key);

  // Handle special cases for inconsistent file naming
  let indexPath = `/music-theory/${normalizedKey}-key-scale-index.json`;
  let completePath = `/music-theory/${normalizedKey}-key-complete-database.json`;

  // E key has different index file name
  if (normalizedKey === 'e') {
    indexPath = `/music-theory/${normalizedKey}-key-scales-index.json`;
  }

  // D key has backup file name
  if (normalizedKey === 'd') {
    completePath = `/music-theory/${normalizedKey}-key-complete-database-backup.json`;
  }

  return {
    indexPath,
    completePath,
  };
}

/**
 * Load key index from JSON file
 */
export async function loadKeyIndex(key: string): Promise<KeyIndex | null> {
  const normalizedKey = normalizeKeyName(key);
  const cacheKey = `index-${normalizedKey}`;
  
  // Check cache first
  if (indexCache.has(cacheKey)) {
    return indexCache.get(cacheKey)!;
  }
  
  try {
    const paths = getDatabasePaths(key);
    const response = await fetch(paths.indexPath);
    
    if (!response.ok) {
      console.error(`Failed to load index for key ${key}: ${response.statusText}`);
      return null;
    }
    
    const data: KeyIndex = await response.json();
    
    // Cache the result
    indexCache.set(cacheKey, data);
    
    return data;
  } catch (error) {
    console.error(`Error loading index for key ${key}:`, error);
    return null;
  }
}

/**
 * Load complete key database from JSON file
 */
export async function loadKeyDatabase(key: string): Promise<KeyDatabase | null> {
  const normalizedKey = normalizeKeyName(key);
  const cacheKey = `database-${normalizedKey}`;
  
  // Check cache first
  if (databaseCache.has(cacheKey)) {
    return databaseCache.get(cacheKey)!;
  }
  
  try {
    const paths = getDatabasePaths(key);
    const response = await fetch(paths.completePath);
    
    if (!response.ok) {
      console.error(`Failed to load database for key ${key}: ${response.statusText}`);
      return null;
    }
    
    const data: KeyDatabase = await response.json();
    
    // Cache the result
    databaseCache.set(cacheKey, data);
    
    return data;
  } catch (error) {
    console.error(`Error loading database for key ${key}:`, error);
    return null;
  }
}

/**
 * Get scale data for a specific scale within a key
 */
export async function getScaleData(
  key: string,
  scaleDbKey: string
): Promise<import('./types').ScaleData | null> {
  const database = await loadKeyDatabase(key);
  
  if (!database) {
    return null;
  }
  
  const scaleData = database.scales[scaleDbKey];
  
  if (!scaleData) {
    console.warn(`Scale ${scaleDbKey} not found in ${key} database`);
    return null;
  }
  
  return scaleData;
}

/**
 * Get compatible scales for a specific key and scale
 */
export async function getCompatibleScalesForScale(
  key: string,
  scaleDbKey: string
): Promise<import('./types').CompatibleScale[]> {
  const scaleData = await getScaleData(key, scaleDbKey);
  
  if (!scaleData) {
    return [];
  }
  
  return scaleData.compatibleScales;
}

/**
 * Get all available scales for a key
 */
export async function getAvailableScales(key: string): Promise<string[]> {
  const index = await loadKeyIndex(key);
  
  if (!index) {
    return [];
  }
  
  return index.scaleIndex.map(entry => entry.scalesArrayKey);
}

/**
 * Get scales by family
 */
export async function getScalesByFamily(
  key: string,
  family: string
): Promise<string[]> {
  const index = await loadKeyIndex(key);
  
  if (!index || !index.scalesByFamily[family]) {
    return [];
  }
  
  return index.scalesByFamily[family];
}

/**
 * Get scales by quality
 */
export async function getScalesByQuality(
  key: string,
  quality: string
): Promise<string[]> {
  const index = await loadKeyIndex(key);
  
  if (!index || !index.scalesByQuality[quality]) {
    return [];
  }
  
  return index.scalesByQuality[quality];
}

/**
 * Clear all caches (useful for development/testing)
 */
export function clearCache(): void {
  databaseCache.clear();
  indexCache.clear();
}

/**
 * Preload databases for all keys (optional performance optimization)
 */
export async function preloadAllDatabases(): Promise<void> {
  const keys: NormalizedKeyName[] = [
    'a', 'a-sharp', 'b', 'c', 'c-sharp', 'd', 'd-sharp',
    'e', 'f', 'f-sharp', 'g', 'g-sharp'
  ];
  
  const promises = keys.map(key => loadKeyDatabase(key));
  await Promise.all(promises);
  
  console.log('All music theory databases preloaded');
}

