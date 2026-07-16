/**
 * Test script for comprehensive chord voicing system
 * Validates music theory accuracy and completeness
 */

import { getComprehensiveChordVoicings } from '../lib/enhanced-chord-voicings-database';
import { COMPREHENSIVE_CHORD_QUALITIES, ALL_ROOT_NOTES } from '../lib/comprehensive-chord-definitions';

console.log('🎸 Testing Comprehensive Chord Voicing System\n');
console.log('='.repeat(60));

// Test 1: Verify all categories are present
console.log('\n📋 Test 1: Category Coverage');
console.log('-'.repeat(60));

const testRoot = 'C';
const database = getComprehensiveChordVoicings(testRoot);

console.log(`Root Note: ${testRoot}`);
console.log(`Total Voicings: ${database.totalVoicings}`);
console.log(`Categories Found: ${database.byCategory.length}`);

database.byCategory.forEach(category => {
  console.log(`\n  ${category.category}:`);
  category.chordQualities.forEach(quality => {
    console.log(`    ✓ ${quality.displayName}: ${quality.voicings.length} voicings`);
  });
});

// Test 2: Verify voicing descriptions
console.log('\n\n📝 Test 2: Voicing Descriptions');
console.log('-'.repeat(60));

const triadCategory = database.byCategory.find(c => c.category === 'Triads');
if (triadCategory) {
  const majorQuality = triadCategory.chordQualities.find(q => q.quality === 'major');
  if (majorQuality && majorQuality.voicings.length > 0) {
    const sampleVoicing = majorQuality.voicings[0];
    console.log(`Sample Voicing: ${sampleVoicing.name}`);
    console.log(`Description: ${sampleVoicing.description || 'N/A'}`);
    console.log(`Emotional Quality: ${sampleVoicing.emotionalQuality || 'N/A'}`);
    console.log(`CAGED Shape: ${sampleVoicing.cagedShape || 'N/A'}`);
  }
}

// Test 3: Verify all root notes work
console.log('\n\n🎵 Test 3: All Root Notes');
console.log('-'.repeat(60));

let totalVoicingsAllRoots = 0;
const rootNoteResults: { root: string; voicings: number }[] = [];

for (const rootNote of ALL_ROOT_NOTES) {
  const db = getComprehensiveChordVoicings(rootNote);
  totalVoicingsAllRoots += db.totalVoicings;
  rootNoteResults.push({ root: rootNote, voicings: db.totalVoicings });
}

console.log('Root Note Voicing Counts:');
rootNoteResults.forEach(result => {
  console.log(`  ${result.root.padEnd(3)}: ${result.voicings} voicings`);
});

console.log(`\nTotal Voicings Across All Roots: ${totalVoicingsAllRoots}`);

// Test 4: Verify extended chords
console.log('\n\n🎹 Test 4: Extended Chords');
console.log('-'.repeat(60));

const extendedCategory = database.byCategory.find(c => c.category === 'Extended');
if (extendedCategory) {
  console.log(`Extended chord types: ${extendedCategory.chordQualities.length}`);
  extendedCategory.chordQualities.forEach(quality => {
    const voicingCount = quality.voicings.length;
    const status = voicingCount > 0 ? '✓' : '✗';
    console.log(`  ${status} ${quality.displayName}: ${voicingCount} voicings`);
  });
}

// Test 5: Verify altered chords
console.log('\n\n🎸 Test 5: Altered Chords');
console.log('-'.repeat(60));

const alteredCategory = database.byCategory.find(c => c.category === 'Altered');
if (alteredCategory) {
  console.log(`Altered chord types: ${alteredCategory.chordQualities.length}`);
  alteredCategory.chordQualities.forEach(quality => {
    const voicingCount = quality.voicings.length;
    const status = voicingCount > 0 ? '✓' : '✗';
    console.log(`  ${status} ${quality.displayName}: ${voicingCount} voicings`);
  });
}

// Test 6: Music theory validation
console.log('\n\n🎼 Test 6: Music Theory Validation');
console.log('-'.repeat(60));

const qualityTests = [
  { quality: 'major', expectedIntervals: [0, 4, 7] },
  { quality: 'minor', expectedIntervals: [0, 3, 7] },
  { quality: 'dominant7', expectedIntervals: [0, 4, 7, 10] },
  { quality: '7#9', expectedIntervals: [0, 4, 7, 10, 15] },
];

qualityTests.forEach(test => {
  const qualityDef = COMPREHENSIVE_CHORD_QUALITIES.find(q => q.quality === test.quality);
  if (qualityDef) {
    const intervalsMatch = JSON.stringify(qualityDef.intervals) === JSON.stringify(test.expectedIntervals);
    const status = intervalsMatch ? '✓' : '✗';
    console.log(`  ${status} ${qualityDef.displayName}: ${qualityDef.intervals.join(', ')}`);
  }
});

// Summary
console.log('\n\n' + '='.repeat(60));
console.log('📊 SUMMARY');
console.log('='.repeat(60));
console.log(`✓ Total Categories: ${database.byCategory.length}`);
console.log(`✓ Total Chord Qualities: ${COMPREHENSIVE_CHORD_QUALITIES.length}`);
console.log(`✓ Total Root Notes: ${ALL_ROOT_NOTES.length}`);
console.log(`✓ Voicings for ${testRoot}: ${database.totalVoicings}`);
console.log(`✓ Estimated Total Voicings: ${totalVoicingsAllRoots}`);
console.log('\n✅ All tests completed!\n');

// Export for use in other scripts
export { database, totalVoicingsAllRoots };

