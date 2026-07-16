/**
 * Generate Chord Recommendations Database
 * 
 * This script generates chord recommendations for each key-scale combination.
 * Creates 144 JSON files (12 keys × 12 scales/modes).
 */

import * as fs from 'fs';
import * as path from 'path';

const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const SCALES = [
  { name: 'Ionian', quality: 'major', intervals: [0, 2, 4, 5, 7, 9, 11] },
  { name: 'Dorian', quality: 'minor', intervals: [0, 2, 3, 5, 7, 9, 10] },
  { name: 'Phrygian', quality: 'minor', intervals: [0, 1, 3, 5, 7, 8, 10] },
  { name: 'Lydian', quality: 'major', intervals: [0, 2, 4, 6, 7, 9, 11] },
  { name: 'Mixolydian', quality: 'major', intervals: [0, 2, 4, 5, 7, 9, 10] },
  { name: 'Aeolian', quality: 'minor', intervals: [0, 2, 3, 5, 7, 8, 10] },
  { name: 'Locrian', quality: 'diminished', intervals: [0, 1, 3, 5, 6, 8, 10] },
  { name: 'HarmonicMinor', quality: 'minor', intervals: [0, 2, 3, 5, 7, 8, 11] },
  { name: 'MelodicMinor', quality: 'minor', intervals: [0, 2, 3, 5, 7, 9, 11] },
  { name: 'MajorPentatonic', quality: 'major', intervals: [0, 2, 4, 7, 9] },
  { name: 'MinorPentatonic', quality: 'minor', intervals: [0, 3, 5, 7, 10] },
  { name: 'Blues', quality: 'minor', intervals: [0, 3, 5, 6, 7, 10] },
];

function transposeNote(rootNote: string, semitones: number): string {
  const rootIndex = NOTES.indexOf(rootNote);
  const newIndex = (rootIndex + semitones) % 12;
  return NOTES[newIndex];
}

function buildChord(root: string, intervals: number[]): string[] {
  return intervals.map(interval => transposeNote(root, interval));
}

function getChordSymbol(root: string, degree: number, scaleIntervals: number[]): { symbol: string; quality: string; notes: string[] } {
  const chordRoot = transposeNote(root, scaleIntervals[degree - 1]);

  // Calculate intervals for the triad (1st, 3rd, 5th scale degrees from the chord root)
  // degree is 1-indexed (1-7), so we convert to 0-indexed
  const rootIndex = degree - 1;
  const rootInterval = scaleIntervals[rootIndex];

  // Get the 3rd (two scale degrees up from root)
  const thirdIndex = (rootIndex + 2) % scaleIntervals.length;
  let thirdInterval = scaleIntervals[thirdIndex];
  if (thirdInterval <= rootInterval) {
    thirdInterval += 12; // Wrap to next octave
  }
  const third = thirdInterval - rootInterval;

  // Get the 5th (four scale degrees up from root)
  const fifthIndex = (rootIndex + 4) % scaleIntervals.length;
  let fifthInterval = scaleIntervals[fifthIndex];
  if (fifthInterval <= rootInterval) {
    fifthInterval += 12; // Wrap to next octave
  }
  const fifth = fifthInterval - rootInterval;

  let quality = 'major';
  let suffix = '';
  let intervals = [0, 4, 7];

  if (third === 3 && fifth === 7) {
    quality = 'minor';
    suffix = 'm';
    intervals = [0, 3, 7];
  } else if (third === 3 && fifth === 6) {
    quality = 'diminished';
    suffix = '°';
    intervals = [0, 3, 6];
  } else if (third === 4 && fifth === 8) {
    quality = 'augmented';
    suffix = '+';
    intervals = [0, 4, 8];
  }

  return {
    symbol: `${chordRoot}${suffix}`,
    quality,
    notes: buildChord(chordRoot, intervals),
  };
}

function generateDiatonicChords(key: string, scale: any) {
  const degrees = ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'];
  const functions = [
    'Tonic - Home base, resolution',
    'Supertonic - Pre-dominant function',
    'Mediant - Tonic extension',
    'Subdominant - Pre-dominant, sets up dominant',
    'Dominant - Tension, leads to tonic',
    'Submediant - Relative minor/major',
    'Leading tone - Strong pull to tonic',
  ];
  
  return scale.intervals.slice(0, 7).map((_: number, i: number) => {
    const chord = getChordSymbol(key, i + 1, scale.intervals);
    return {
      degree: degrees[i],
      symbol: chord.symbol,
      fullName: `${chord.symbol} ${chord.quality.charAt(0).toUpperCase() + chord.quality.slice(1)}`,
      quality: chord.quality,
      notes: chord.notes,
      function: functions[i],
      commonUse: `Degree ${i + 1} in ${scale.name}`,
      compatibilityScore: i === 0 || i === 3 || i === 4 ? 10 : 8,
    };
  });
}

function generateExtendedChords(key: string, scale: any): any[] {
  const chords: any[] = [];
  
  // Add 7th chords for I, IV, V
  const degrees = [0, 3, 4];
  const romanNumerals = ['Imaj7', 'IVmaj7', 'V7'];
  
  degrees.forEach((deg, idx) => {
    const root = transposeNote(key, scale.intervals[deg]);
    const is7th = deg === 4 && scale.quality === 'major';
    const intervals = is7th ? [0, 4, 7, 10] : [0, 4, 7, 11];
    const suffix = is7th ? '7' : 'maj7';
    
    chords.push({
      degree: romanNumerals[idx],
      symbol: `${root}${suffix}`,
      fullName: `${root} ${is7th ? 'Dominant' : 'Major'} 7th`,
      quality: is7th ? 'dom7' : 'maj7',
      notes: buildChord(root, intervals),
      function: deg === 0 ? 'Tonic with color' : deg === 3 ? 'Subdominant with color' : 'Dominant with tension',
      commonUse: 'Jazz, R&B, sophisticated pop',
      compatibilityScore: 9,
    });
  });
  
  return chords;
}

function generateModalInterchangeChords(key: string, scale: any) {
  // Add some borrowed chords from parallel modes
  const chords = [];
  
  if (scale.quality === 'major') {
    // Borrow from parallel minor
    const bVII = transposeNote(key, 10);
    chords.push({
      degree: 'bVII',
      symbol: bVII,
      fullName: `${bVII} Major`,
      quality: 'major',
      notes: buildChord(bVII, [0, 4, 7]),
      borrowedFrom: `${key} Mixolydian`,
      function: 'Subtonic - creates tension',
      commonUse: 'Rock, blues, modal jazz',
      compatibilityScore: 7,
    });
  }
  
  return chords;
}

async function generateChordRecommendationsFile(key: string, scale: any) {
  const fileName = `${key.toLowerCase().replace('#', '-sharp')}-${scale.name.toLowerCase().replace(/([A-Z])/g, '-$1').toLowerCase()}.json`;
  
  const output = {
    key,
    scale: scale.name,
    quality: scale.quality,
    version: '1.0.0',
    lastUpdated: new Date().toISOString().split('T')[0],
    diatonicChords: generateDiatonicChords(key, scale),
    extendedChords: generateExtendedChords(key, scale),
    modalInterchangeChords: generateModalInterchangeChords(key, scale),
  };
  
  const outputPath = path.join(process.cwd(), 'data', 'chord-recommendations', fileName);
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
  console.log(`✓ Generated ${fileName}`);
}

async function main() {
  console.log('🎵 Generating Chord Recommendations Database...\n');

  let count = 0;
  for (const note of NOTES) {
    for (const scale of SCALES) {
      await generateChordRecommendationsFile(note, scale);
      count++;
    }
  }

  console.log(`\n✅ Chord Recommendations Database generated successfully!`);
  console.log(`📁 Location: data/chord-recommendations/`);
  console.log(`📊 Files: ${count}`);
}

main().catch(console.error);

