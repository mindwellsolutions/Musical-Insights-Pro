/**
 * Chord Tones Database Loader and Utilities
 * Provides access to comprehensive chord tone information for real-time fretboard updates
 */

export interface ChordTonesEntry {
  symbol: string;
  rootNote: string;
  quality: string;
  displayName: string;
  notes: string[];
  intervals: number[];
  chordTones: {
    root: string;
    third?: string;
    fifth?: string;
    seventh?: string;
    ninth?: string;
    eleventh?: string;
    thirteenth?: string;
  };
}

export interface ChordTonesDatabase {
  version: string;
  lastUpdated: string;
  description: string;
  chords: Record<string, ChordTonesEntry>;
}

let cachedDatabase: ChordTonesDatabase | null = null;

/**
 * Load the chord tones database
 */
export async function loadChordTonesDatabase(): Promise<ChordTonesDatabase> {
  if (cachedDatabase) {
    return cachedDatabase;
  }

  try {
    const response = await fetch('/data/chord-tones/chord-tones-database.json');
    if (!response.ok) {
      throw new Error('Failed to load chord tones database');
    }
    cachedDatabase = await response.json();
    return cachedDatabase!;
  } catch (error) {
    console.error('Error loading chord tones database:', error);
    // Return empty database as fallback
    return {
      version: '1.0.0',
      lastUpdated: new Date().toISOString().split('T')[0],
      description: 'Fallback empty database',
      chords: {},
    };
  }
}

/**
 * Get chord tones for a specific chord symbol
 */
export async function getChordTones(chordSymbol: string): Promise<ChordTonesEntry | null> {
  const database = await loadChordTonesDatabase();
  return database.chords[chordSymbol] || null;
}

/**
 * Get all available chord symbols
 */
export async function getAllChordSymbols(): Promise<string[]> {
  const database = await loadChordTonesDatabase();
  return Object.keys(database.chords);
}

/**
 * Search chords by root note
 */
export async function getChordsByRootNote(rootNote: string): Promise<ChordTonesEntry[]> {
  const database = await loadChordTonesDatabase();
  return Object.values(database.chords).filter(chord => chord.rootNote === rootNote);
}

/**
 * Search chords by quality
 */
export async function getChordsByQuality(quality: string): Promise<ChordTonesEntry[]> {
  const database = await loadChordTonesDatabase();
  return Object.values(database.chords).filter(chord => chord.quality === quality);
}

/**
 * Get chord tones as a flat array (for fretboard highlighting)
 */
export function getChordTonesArray(entry: ChordTonesEntry): string[] {
  return entry.notes;
}

/**
 * Get chord tone labels for display
 */
export function getChordToneLabels(entry: ChordTonesEntry): Array<{ note: string; label: string }> {
  const labels: Array<{ note: string; label: string }> = [];
  const { chordTones } = entry;

  if (chordTones.root) labels.push({ note: chordTones.root, label: 'Root' });
  if (chordTones.third) labels.push({ note: chordTones.third, label: '3rd' });
  if (chordTones.fifth) labels.push({ note: chordTones.fifth, label: '5th' });
  if (chordTones.seventh) labels.push({ note: chordTones.seventh, label: '7th' });
  if (chordTones.ninth) labels.push({ note: chordTones.ninth, label: '9th' });
  if (chordTones.eleventh) labels.push({ note: chordTones.eleventh, label: '11th' });
  if (chordTones.thirteenth) labels.push({ note: chordTones.thirteenth, label: '13th' });

  return labels;
}

/**
 * Synchronous version using cached data (use after initial load)
 */
export function getChordTonesSync(chordSymbol: string): ChordTonesEntry | null {
  if (!cachedDatabase) {
    console.warn('Chord tones database not loaded yet. Call loadChordTonesDatabase() first.');
    return null;
  }
  return cachedDatabase.chords[chordSymbol] || null;
}

/**
 * Preload the database (call on app initialization)
 */
export function preloadChordTonesDatabase(): void {
  loadChordTonesDatabase().catch(console.error);
}

