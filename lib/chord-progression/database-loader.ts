/**
 * Database loader for chord progression databases
 */

import { GenreProgressionDatabase } from './types';

/**
 * Load genre progressions database
 * This will be created in Phase 4
 */
export async function loadGenreProgressions(): Promise<GenreProgressionDatabase> {
  try {
    const response = await fetch('/music-theory/chord-progressions/genre-progressions-database.json');
    if (!response.ok) {
      throw new Error('Failed to load genre progressions database');
    }
    return await response.json();
  } catch (error) {
    console.error('Error loading genre progressions:', error);
    // Return empty database as fallback
    return {
      version: '1.0.0',
      lastUpdated: new Date().toISOString(),
      genres: {},
    };
  }
}

/**
 * Load key-specific chord progression database
 */
export async function loadKeyProgressions(key: string): Promise<any> {
  try {
    const normalizedKey = key.toLowerCase().replace('#', '-sharp');
    const response = await fetch(`/music-theory/chord-progressions/${normalizedKey}-chord-progression-database.json`);
    if (!response.ok) {
      throw new Error(`Failed to load ${key} chord progression database`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error loading ${key} progressions:`, error);
    return null;
  }
}

/**
 * Cache for loaded databases
 */
const databaseCache = new Map<string, any>();

/**
 * Load database with caching
 */
export async function loadDatabaseWithCache(key: string): Promise<any> {
  if (databaseCache.has(key)) {
    return databaseCache.get(key);
  }
  
  const data = await loadKeyProgressions(key);
  if (data) {
    databaseCache.set(key, data);
  }
  
  return data;
}

/**
 * Clear database cache
 */
export function clearDatabaseCache() {
  databaseCache.clear();
}

