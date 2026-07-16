/**
 * Triad Database Loader
 * Loads and provides access to the pre-generated triad database
 */

import { TriadType } from './triad-theory';
import { TriadPosition } from './triad-positions';

export interface TriadDatabaseEntry {
  rootNote: string;
  triadType: TriadType;
  symbol: string;
  notes: string[];
  positions: TriadPosition[];
}

export interface TriadDatabase {
  version: string;
  generatedAt: string;
  triads: TriadDatabaseEntry[];
}

let cachedDatabase: TriadDatabase | null = null;

/**
 * Load the triad database
 */
export async function loadTriadDatabase(): Promise<TriadDatabase> {
  if (cachedDatabase) {
    return cachedDatabase;
  }

  try {
    const response = await fetch('/data/triads/triad-database.json');
    if (!response.ok) {
      throw new Error(`Failed to load triad database: ${response.statusText}`);
    }
    
    cachedDatabase = await response.json();
    return cachedDatabase!;
  } catch (error) {
    console.error('Error loading triad database:', error);
    throw error;
  }
}

/**
 * Get a specific triad from the database
 */
export async function getTriad(
  rootNote: string,
  triadType: TriadType
): Promise<TriadDatabaseEntry | null> {
  const database = await loadTriadDatabase();
  return database.triads.find(
    (t) => t.rootNote === rootNote && t.triadType === triadType
  ) || null;
}

/**
 * Get all triads for a specific root note
 */
export async function getTriadsForRoot(
  rootNote: string
): Promise<TriadDatabaseEntry[]> {
  const database = await loadTriadDatabase();
  return database.triads.filter((t) => t.rootNote === rootNote);
}

/**
 * Get all triads of a specific type
 */
export async function getTriadsOfType(
  triadType: TriadType
): Promise<TriadDatabaseEntry[]> {
  const database = await loadTriadDatabase();
  return database.triads.filter((t) => t.triadType === triadType);
}

/**
 * Clear the cached database (useful for testing or reloading)
 */
export function clearTriadDatabaseCache(): void {
  cachedDatabase = null;
}

