import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// Types matching our database structure
interface CompatibleScale {
  scaleName: string;
  compatibilityScore: number;
  relationship: string;
  rationale: string;
  musicalContext: string;
  musicGenreRecommendations: string;
  recommendedUse: string;
  targetNotes: {
    chordTones: string[];
    guideTones: string[];
  };
  difficultyLevel: number;
}

interface ScaleData {
  compatibleScales: CompatibleScale[];
}

interface KeyDatabase {
  key: string;
  scales: Record<string, ScaleData>;
}

// Cache for loaded databases
const databaseCache = new Map<string, KeyDatabase>();

/**
 * Normalize key name to match file naming convention
 * Examples: "A" → "a", "A#" → "a-sharp", "Bb" → "a-sharp", "B" → "b"
 */
function normalizeKeyName(key: string): string {
  const normalized = key.trim().toUpperCase();

  // Map all keys to their normalized file names
  // Note: Some database files use flat names (bb) instead of sharp names (a-sharp)
  const keyMap: Record<string, string> = {
    'A': 'a',
    'A#': 'bb',  // Database file is bb-key-complete-database.json
    'BB': 'bb',  // Database file is bb-key-complete-database.json
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
 * Load database from file system
 */
async function loadKeyDatabase(key: string): Promise<KeyDatabase | null> {
  const normalizedKey = normalizeKeyName(key);

  console.log(`[API] Loading database for key: "${key}" → normalized: "${normalizedKey}"`);

  // Check cache first
  if (databaseCache.has(normalizedKey)) {
    console.log(`[API] Cache hit for key: "${normalizedKey}"`);
    return databaseCache.get(normalizedKey)!;
  }

  try {
    const fileName = `${normalizedKey}-key-complete-database.json`;
    const filePath = path.join(process.cwd(), 'music-theory', fileName);
    console.log(`[API] Attempting to load file: ${filePath}`);

    const fileContent = await fs.readFile(filePath, 'utf-8');
    const database = JSON.parse(fileContent) as KeyDatabase;

    console.log(`[API] Successfully loaded database for key: "${normalizedKey}"`);

    // Cache the database
    databaseCache.set(normalizedKey, database);

    return database;
  } catch (error) {
    console.error(`[API] Failed to load database for key "${key}" (normalized: "${normalizedKey}"):`, error);
    return null;
  }
}

/**
 * API Route Handler
 * GET /api/compatible-scales?key=B&scale=Blues&limit=12&minScore=4
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const key = searchParams.get('key');
    const scale = searchParams.get('scale');
    const limit = parseInt(searchParams.get('limit') || '12');
    const minScore = parseInt(searchParams.get('minScore') || '4');

    if (!key || !scale) {
      return NextResponse.json(
        { error: 'Missing required parameters: key and scale' },
        { status: 400 }
      );
    }

    // Load the database for the specified key
    const database = await loadKeyDatabase(key);

    if (!database) {
      return NextResponse.json(
        { error: `Database not found for key: ${key}` },
        { status: 404 }
      );
    }

    // Get the scale data
    const scaleData = database.scales[scale];

    if (!scaleData) {
      return NextResponse.json(
        { error: `Scale "${scale}" not found in ${key} key database` },
        { status: 404 }
      );
    }
    
    // Filter and limit compatible scales
    const compatibleScales = scaleData.compatibleScales
      .filter(s => s.compatibilityScore >= minScore)
      .slice(0, limit)
      .map(s => {
        // Extract root note from scaleName (e.g., "B Minor Pentatonic" → "B")
        const scaleNameParts = s.scaleName.split(' ');
        const scaleRoot = scaleNameParts[0];
        const scaleNameWithoutRoot = scaleNameParts.slice(1).join(' ');

        return {
          scaleName: scaleNameWithoutRoot || s.scaleName,
          rootNote: scaleRoot,
          compatibilityScore: s.compatibilityScore,
          harmonicRelationship: s.relationship,
          recommendedUse: s.recommendedUse,
          chordTones: s.targetNotes || [],
          guideTones: [], // Database doesn't have separate guide tones
          musicalContext: s.musicalContext,
          genreRecommendations: s.musicGenreRecommendations,
          rationale: s.rationale,
          difficultyLevel: s.difficultyLevel,
        };
      });
    
    return NextResponse.json({
      key,
      scale,
      compatibleScales,
      totalCount: scaleData.compatibleScales.length,
    });
    
  } catch (error) {
    console.error('Error in compatible-scales API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

