/**
 * Generate Chord-Scale Compatibility Database
 * 
 * This script extracts chord-scale compatibility data from existing
 * chord-progression-database.json files and generates 25 JSON files:
 * - 1 index.json (master index)
 * - 24 chord quality files (major.json, minor.json, etc.)
 */

import * as fs from 'fs';
import * as path from 'path';

// Chord quality definitions
const CHORD_QUALITIES = [
  { quality: 'major', displayName: 'Major', suffix: '', intervals: [0, 4, 7] },
  { quality: 'minor', displayName: 'Minor', suffix: 'm', intervals: [0, 3, 7] },
  { quality: 'diminished', displayName: 'Diminished', suffix: '°', intervals: [0, 3, 6] },
  { quality: 'augmented', displayName: 'Augmented', suffix: '+', intervals: [0, 4, 8] },
  { quality: 'major7', displayName: 'Major 7th', suffix: 'maj7', intervals: [0, 4, 7, 11] },
  { quality: 'minor7', displayName: 'Minor 7th', suffix: 'm7', intervals: [0, 3, 7, 10] },
  { quality: 'dominant7', displayName: 'Dominant 7th', suffix: '7', intervals: [0, 4, 7, 10] },
  { quality: 'diminished7', displayName: 'Diminished 7th', suffix: '°7', intervals: [0, 3, 6, 9] },
  { quality: 'half-diminished7', displayName: 'Half-Diminished 7th', suffix: 'm7♭5', intervals: [0, 3, 6, 10] },
  { quality: 'major9', displayName: 'Major 9th', suffix: 'maj9', intervals: [0, 4, 7, 11, 14] },
  { quality: 'minor9', displayName: 'Minor 9th', suffix: 'm9', intervals: [0, 3, 7, 10, 14] },
  { quality: 'dominant9', displayName: 'Dominant 9th', suffix: '9', intervals: [0, 4, 7, 10, 14] },
  { quality: 'major11', displayName: 'Major 11th', suffix: 'maj11', intervals: [0, 4, 7, 11, 14, 17] },
  { quality: 'minor11', displayName: 'Minor 11th', suffix: 'm11', intervals: [0, 3, 7, 10, 14, 17] },
  { quality: 'dominant11', displayName: 'Dominant 11th', suffix: '11', intervals: [0, 4, 7, 10, 14, 17] },
  { quality: 'major13', displayName: 'Major 13th', suffix: 'maj13', intervals: [0, 4, 7, 11, 14, 17, 21] },
  { quality: 'minor13', displayName: 'Minor 13th', suffix: 'm13', intervals: [0, 3, 7, 10, 14, 17, 21] },
  { quality: 'dominant13', displayName: 'Dominant 13th', suffix: '13', intervals: [0, 4, 7, 10, 14, 17, 21] },
  { quality: 'sus2', displayName: 'Suspended 2nd', suffix: 'sus2', intervals: [0, 2, 7] },
  { quality: 'sus4', displayName: 'Suspended 4th', suffix: 'sus4', intervals: [0, 5, 7] },
  { quality: 'major6', displayName: 'Major 6th', suffix: '6', intervals: [0, 4, 7, 9] },
  { quality: 'minor6', displayName: 'Minor 6th', suffix: 'm6', intervals: [0, 3, 7, 9] },
  { quality: 'add9', displayName: 'Add 9', suffix: 'add9', intervals: [0, 4, 7, 14] },
  { quality: 'minor-add9', displayName: 'Minor Add 9', suffix: 'madd9', intervals: [0, 3, 7, 14] },
];

const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

interface ChordProgressionDatabase {
  key: string;
  chords: Record<string, any>;
}

async function loadChordProgressionDatabase(key: string): Promise<ChordProgressionDatabase | null> {
  const normalizedKey = key.toLowerCase().replace('#', '-sharp');
  const filePath = path.join(process.cwd(), 'music-theory', 'chord-progressions', `${normalizedKey}-chord-progression-database.json`);
  
  try {
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Failed to load ${filePath}:`, error);
    return null;
  }
}

function extractCompatibleScales(chordData: any) {
  if (!chordData.scaleCompatibility || !Array.isArray(chordData.scaleCompatibility)) {
    return [];
  }

  return chordData.scaleCompatibility.map((scale: any) => ({
    scaleName: scale.scaleName || '',
    scaleDbKey: scale.scaleDbKey || '',
    compatibilityScore: scale.compatibilityScore || 5,
    relationship: scale.relationship || '',
    musicalContext: scale.rationale || scale.recommendedUse || '',
    chordTones: scale.chordToneAlignment?.chordTones || [],
    tensions: scale.chordToneAlignment?.tensions || [],
    avoidNotes: scale.chordToneAlignment?.avoidNotes || [],
    musicGenreRecommendations: extractGenres(scale.recommendedUse || ''),
    difficultyLevel: scale.difficultyLevel || 3,
    commonUse: scale.recommendedUse || '',
    famousExamples: scale.voiceLeadingTips || '',
  }));
}

function extractGenres(text: string): string {
  const genres = ['Jazz', 'Rock', 'Blues', 'Pop', 'Classical', 'Country', 'Folk', 'R&B', 'Soul', 'Funk', 'Fusion'];
  const found = genres.filter(genre => text.includes(genre));
  return found.length > 0 ? found.join(', ') : 'General';
}

async function generateChordQualityFile(quality: any) {
  const compatibleScalesMap = new Map<string, any[]>();

  // Load all chord progression databases
  for (const note of NOTES) {
    const db = await loadChordProgressionDatabase(note);
    if (!db) continue;

    // Find chords matching this quality
    for (const [chordSymbol, chordData] of Object.entries(db.chords)) {
      if (chordData.quality === quality.quality) {
        const scales = extractCompatibleScales(chordData);
        if (scales.length > 0) {
          // Merge scales (use first occurrence as template)
          for (const scale of scales) {
            const key = scale.scaleDbKey;
            if (!compatibleScalesMap.has(key)) {
              compatibleScalesMap.set(key, scale);
            }
          }
        }
      }
    }
  }

  const compatibleScales = Array.from(compatibleScalesMap.values())
    .sort((a: any, b: any) => b.compatibilityScore - a.compatibilityScore);

  const output = {
    chordQuality: quality.quality,
    displayName: quality.displayName,
    suffix: quality.suffix,
    version: '1.0.0',
    lastUpdated: new Date().toISOString().split('T')[0],
    description: `${quality.displayName} chord compatibility data`,
    intervals: quality.intervals,
    compatibleScales,
  };

  const outputPath = path.join(process.cwd(), 'public', 'data', 'chord-scale-compatibility', `${quality.quality}.json`);
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
  console.log(`✓ Generated ${quality.quality}.json (${compatibleScales.length} scales)`);
}

async function generateIndexFile() {
  const index = {
    version: '1.0.0',
    lastUpdated: new Date().toISOString().split('T')[0],
    chordTypes: CHORD_QUALITIES.map(q => ({
      quality: q.quality,
      displayName: q.displayName,
      suffix: q.suffix,
      file: `${q.quality}.json`,
      examples: NOTES.slice(0, 7).map(note => `${note}${q.suffix}`),
    })),
  };

  const outputPath = path.join(process.cwd(), 'public', 'data', 'chord-scale-compatibility', 'index.json');
  fs.writeFileSync(outputPath, JSON.stringify(index, null, 2));
  console.log('✓ Generated index.json');
}

async function main() {
  console.log('🎵 Generating Chord-Scale Compatibility Database...\n');

  // Generate index
  await generateIndexFile();

  // Generate each chord quality file
  for (const quality of CHORD_QUALITIES) {
    await generateChordQualityFile(quality);
  }

  console.log('\n✅ Chord-Scale Compatibility Database generated successfully!');
  console.log(`📁 Location: public/data/chord-scale-compatibility/`);
  console.log(`📊 Files: ${CHORD_QUALITIES.length + 1} (1 index + ${CHORD_QUALITIES.length} chord qualities)`);
}

main().catch(console.error);

