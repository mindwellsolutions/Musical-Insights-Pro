/**
 * Generate Progression Recommendations Database
 * 
 * This script extracts common chord progressions from existing
 * chord-progression-database.json files and generates 12 JSON files
 * (one per root note).
 */

import * as fs from 'fs';
import * as path from 'path';

const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

interface ChordProgressionDatabase {
  key: string;
  commonProgressions?: any[];
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

function transposeNote(rootNote: string, semitones: number): string {
  const rootIndex = NOTES.indexOf(rootNote);
  const newIndex = (rootIndex + semitones) % 12;
  return NOTES[newIndex];
}

// Common progressions template (will be transposed to each key)
function getCommonProgressions(key: string) {
  const I = key;
  const ii = transposeNote(key, 2);
  const iii = transposeNote(key, 4);
  const IV = transposeNote(key, 5);
  const V = transposeNote(key, 7);
  const vi = transposeNote(key, 9);
  const bVII = transposeNote(key, 10);
  
  return [
    {
      id: 'i-iv-v-i',
      name: 'I-IV-V-I',
      description: 'The foundation of rock, blues, and country music',
      chords: [I, IV, V, I],
      romanNumerals: ['I', 'IV', 'V', 'I'],
      genre: ['Rock', 'Blues', 'Country', 'Folk'],
      difficulty: 1,
      musicalCharacter: 'Strong, resolute, optimistic',
      famousSongs: ['La Bamba', 'Twist and Shout', 'Wild Thing'],
      scaleRecommendations: {
        [I]: [
          { scaleName: `${I} Major Pentatonic`, compatibilityScore: 10, usage: 'Safe, always works' },
          { scaleName: `${I} Ionian`, compatibilityScore: 10, usage: 'Full major scale' },
        ],
        [IV]: [
          { scaleName: `${IV} Lydian`, compatibilityScore: 9, usage: 'Bright, uplifting' },
        ],
        [V]: [
          { scaleName: `${V} Mixolydian`, compatibilityScore: 10, usage: 'Perfect for dominant' },
        ],
      },
    },
    {
      id: 'i-v-vi-iv',
      name: 'I-V-vi-IV',
      description: 'The most popular pop progression of all time',
      chords: [I, V, `${vi}m`, IV],
      romanNumerals: ['I', 'V', 'vi', 'IV'],
      genre: ['Pop', 'Rock', 'Country'],
      difficulty: 1,
      musicalCharacter: 'Uplifting, emotional, singable',
      famousSongs: ['Let It Be', 'No Woman No Cry', 'With or Without You'],
      scaleRecommendations: {
        [I]: [
          { scaleName: `${I} Major Pentatonic`, compatibilityScore: 10, usage: 'Works over entire progression' },
        ],
      },
    },
    {
      id: 'ii-v-i',
      name: 'ii-V-I',
      description: 'The fundamental jazz progression',
      chords: [`${ii}m7`, `${V}7`, `${I}maj7`],
      romanNumerals: ['ii7', 'V7', 'Imaj7'],
      genre: ['Jazz', 'Bossa Nova', 'R&B'],
      difficulty: 3,
      musicalCharacter: 'Sophisticated, smooth, resolving',
      famousSongs: ['Autumn Leaves', 'Fly Me to the Moon', 'Satin Doll'],
      scaleRecommendations: {
        [`${ii}m7`]: [
          { scaleName: `${ii} Dorian`, compatibilityScore: 10, usage: 'Classic jazz sound' },
        ],
        [`${V}7`]: [
          { scaleName: `${V} Mixolydian`, compatibilityScore: 10, usage: 'Dominant sound' },
        ],
        [`${I}maj7`]: [
          { scaleName: `${I} Ionian`, compatibilityScore: 10, usage: 'Resolution' },
        ],
      },
    },
    {
      id: 'i-bvii-iv-i',
      name: 'I-bVII-IV-I',
      description: 'Classic rock progression with modal flavor',
      chords: [I, bVII, IV, I],
      romanNumerals: ['I', 'bVII', 'IV', 'I'],
      genre: ['Rock', 'Blues Rock', 'Hard Rock'],
      difficulty: 2,
      musicalCharacter: 'Powerful, driving, anthemic',
      famousSongs: ['Sweet Child O Mine', 'Hey Jude (outro)', 'Sympathy for the Devil'],
      scaleRecommendations: {
        [I]: [
          { scaleName: `${I} Mixolydian`, compatibilityScore: 10, usage: 'Perfect for this progression' },
        ],
      },
    },
    {
      id: 'i-vi-ii-v',
      name: 'I-vi-ii-V',
      description: 'Classic 50s doo-wop progression',
      chords: [I, `${vi}m`, `${ii}m`, V],
      romanNumerals: ['I', 'vi', 'ii', 'V'],
      genre: ['Doo-wop', 'Pop', 'Jazz'],
      difficulty: 2,
      musicalCharacter: 'Nostalgic, smooth, circular',
      famousSongs: ['Stand By Me', 'Every Breath You Take', 'Blue Moon'],
      scaleRecommendations: {
        [I]: [
          { scaleName: `${I} Major Pentatonic`, compatibilityScore: 10, usage: 'Works throughout' },
        ],
      },
    },
    {
      id: 'i-iv-i-v',
      name: 'I-IV-I-V',
      description: 'Simple folk and country progression',
      chords: [I, IV, I, V],
      romanNumerals: ['I', 'IV', 'I', 'V'],
      genre: ['Folk', 'Country', 'Bluegrass'],
      difficulty: 1,
      musicalCharacter: 'Simple, direct, traditional',
      famousSongs: ['Blowin in the Wind', 'This Land Is Your Land'],
      scaleRecommendations: {
        [I]: [
          { scaleName: `${I} Major Pentatonic`, compatibilityScore: 10, usage: 'Traditional sound' },
        ],
      },
    },
  ];
}

async function generateProgressionRecommendationsFile(key: string) {
  const fileName = `${key.toLowerCase().replace('#', '-sharp')}.json`;
  
  const output = {
    key,
    version: '1.0.0',
    lastUpdated: new Date().toISOString().split('T')[0],
    progressions: getCommonProgressions(key),
  };
  
  const outputPath = path.join(process.cwd(), 'public', 'data', 'progression-recommendations', fileName);
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
  console.log(`✓ Generated ${fileName} (${output.progressions.length} progressions)`);
}

async function main() {
  console.log('🎵 Generating Progression Recommendations Database...\n');
  
  for (const note of NOTES) {
    await generateProgressionRecommendationsFile(note);
  }
  
  console.log(`\n✅ Progression Recommendations Database generated successfully!`);
  console.log(`📁 Location: public/data/progression-recommendations/`);
  console.log(`📊 Files: ${NOTES.length}`);
}

main().catch(console.error);

