/**
 * Generate comprehensive chord tones database for all chord types
 * Used for real-time fretboard updates during playback
 */

import * as fs from 'fs';
import * as path from 'path';

const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

interface ChordQualityDefinition {
  quality: string;
  suffix: string;
  intervals: number[];
  displayName: string;
}

// All chord qualities from the Add Chord modal and musicTheory.ts
const CHORD_QUALITIES: ChordQualityDefinition[] = [
  // Triads
  { quality: 'major', suffix: '', intervals: [0, 4, 7], displayName: 'Major' },
  { quality: 'minor', suffix: 'm', intervals: [0, 3, 7], displayName: 'Minor' },
  { quality: 'diminished', suffix: 'dim', intervals: [0, 3, 6], displayName: 'Diminished' },
  { quality: 'augmented', suffix: 'aug', intervals: [0, 4, 8], displayName: 'Augmented' },
  
  // 7th Chords
  { quality: 'major7', suffix: 'maj7', intervals: [0, 4, 7, 11], displayName: 'Major 7th' },
  { quality: 'minor7', suffix: 'm7', intervals: [0, 3, 7, 10], displayName: 'Minor 7th' },
  { quality: 'dominant7', suffix: '7', intervals: [0, 4, 7, 10], displayName: 'Dominant 7th' },
  { quality: 'diminished7', suffix: 'dim7', intervals: [0, 3, 6, 9], displayName: 'Diminished 7th' },
  { quality: 'half-diminished7', suffix: 'm7b5', intervals: [0, 3, 6, 10], displayName: 'Half-Diminished 7th' },
  { quality: 'augmented7', suffix: 'aug7', intervals: [0, 4, 8, 10], displayName: 'Augmented 7th' },
  
  // Extended Chords
  { quality: 'major9', suffix: 'maj9', intervals: [0, 4, 7, 11, 14], displayName: 'Major 9th' },
  { quality: 'minor9', suffix: 'm9', intervals: [0, 3, 7, 10, 14], displayName: 'Minor 9th' },
  { quality: 'dominant9', suffix: '9', intervals: [0, 4, 7, 10, 14], displayName: 'Dominant 9th' },
  { quality: 'major11', suffix: 'maj11', intervals: [0, 4, 7, 11, 14, 17], displayName: 'Major 11th' },
  { quality: 'minor11', suffix: 'm11', intervals: [0, 3, 7, 10, 14, 17], displayName: 'Minor 11th' },
  { quality: 'dominant11', suffix: '11', intervals: [0, 4, 7, 10, 14, 17], displayName: 'Dominant 11th' },
  { quality: 'major13', suffix: 'maj13', intervals: [0, 4, 7, 11, 14, 17, 21], displayName: 'Major 13th' },
  { quality: 'minor13', suffix: 'm13', intervals: [0, 3, 7, 10, 14, 17, 21], displayName: 'Minor 13th' },
  { quality: 'dominant13', suffix: '13', intervals: [0, 4, 7, 10, 14, 17, 21], displayName: 'Dominant 13th' },
  
  // Sus Chords
  { quality: 'sus2', suffix: 'sus2', intervals: [0, 2, 7], displayName: 'Suspended 2nd' },
  { quality: 'sus4', suffix: 'sus4', intervals: [0, 5, 7], displayName: 'Suspended 4th' },
  
  // Add Chords
  { quality: '6', suffix: '6', intervals: [0, 4, 7, 9], displayName: 'Major 6th' },
  { quality: 'minor6', suffix: 'm6', intervals: [0, 3, 7, 9], displayName: 'Minor 6th' },
  { quality: 'add9', suffix: 'add9', intervals: [0, 4, 7, 14], displayName: 'Add 9' },
  { quality: 'minor-add9', suffix: 'madd9', intervals: [0, 3, 7, 14], displayName: 'Minor Add 9' },
];

function getChordToneLabels(intervals: number[]): Record<string, string> {
  const labels: Record<string, string> = {};
  const intervalNames = ['root', 'third', 'fifth', 'seventh', 'ninth', 'eleventh', 'thirteenth'];
  
  intervals.forEach((interval, index) => {
    if (index < intervalNames.length) {
      labels[intervalNames[index]] = '';
    }
  });
  
  return labels;
}

function generateChordEntry(rootNote: string, qualityDef: ChordQualityDefinition) {
  const rootIndex = NOTES.indexOf(rootNote);
  const notes = qualityDef.intervals.map(interval => NOTES[(rootIndex + interval) % 12]);
  const chordSymbol = rootNote + qualityDef.suffix;
  
  const chordTones: Record<string, string> = {
    root: notes[0],
  };
  
  if (notes.length > 1) chordTones.third = notes[1];
  if (notes.length > 2) chordTones.fifth = notes[2];
  if (notes.length > 3) chordTones.seventh = notes[3];
  if (notes.length > 4) chordTones.ninth = notes[4];
  if (notes.length > 5) chordTones.eleventh = notes[5];
  if (notes.length > 6) chordTones.thirteenth = notes[6];
  
  return {
    symbol: chordSymbol,
    rootNote,
    quality: qualityDef.quality,
    displayName: `${rootNote} ${qualityDef.displayName}`,
    notes,
    intervals: qualityDef.intervals,
    chordTones,
  };
}

async function generateDatabase() {
  console.log('🎵 Generating Chord Tones Database...\n');
  
  const database: any = {
    version: '1.0.0',
    lastUpdated: new Date().toISOString().split('T')[0],
    description: 'Comprehensive chord tones database for real-time fretboard updates',
    chords: {},
  };
  
  let count = 0;
  
  // Generate for all root notes and qualities
  for (const rootNote of NOTES) {
    for (const qualityDef of CHORD_QUALITIES) {
      const entry = generateChordEntry(rootNote, qualityDef);
      database.chords[entry.symbol] = entry;
      count++;
    }
  }
  
  // Create output directory
  const outputDir = path.join(process.cwd(), 'public', 'data', 'chord-tones');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Write database file
  const outputPath = path.join(outputDir, 'chord-tones-database.json');
  fs.writeFileSync(outputPath, JSON.stringify(database, null, 2));
  
  console.log(`✅ Generated ${count} chord entries`);
  console.log(`📁 Saved to: ${outputPath}`);
  console.log(`\n📊 Statistics:`);
  console.log(`   - Root notes: ${NOTES.length}`);
  console.log(`   - Chord qualities: ${CHORD_QUALITIES.length}`);
  console.log(`   - Total chords: ${count}`);
}

// Run the generator
generateDatabase().catch(console.error);

