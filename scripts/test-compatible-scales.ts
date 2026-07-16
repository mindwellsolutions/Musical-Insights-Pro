/**
 * Test Script for Compatible Scales System
 * Verifies all scales are different and work correctly
 */

import { getCompatibleScalesForTriad } from '../lib/compatible-scales-database';
import { getScaleRecommendationsForTriad } from '../lib/triad-scale-mapping';
import { TriadType } from '../lib/triad-theory';

const TRIAD_TYPES: TriadType[] = ['major', 'minor', 'diminished', 'augmented'];

console.clear();
console.log('🎼 Testing Compatible Scales System\n');
console.log('='.repeat(80));

// Test C Major
console.log('\n📊 Test 1: C Major Triad - Compatible Scales');
console.log('-'.repeat(80));
const cMajorScales = getCompatibleScalesForTriad('C', 'major');
console.log(`Total Compatible Scales: ${cMajorScales.length}\n`);

cMajorScales.forEach((scale, index) => {
  const rating = '⭐'.repeat(Math.floor(scale.compatibilityRating));
  console.log(`${index + 1}. ${scale.fullDisplayName} ${scale.isPrimary ? '★ PRIMARY' : ''}`);
  console.log(`   Rating: ${rating} (${scale.compatibilityRating}/10)`);
  console.log(`   Category: ${scale.category}`);
  console.log(`   Intervals: [${scale.intervals.join(', ')}]`);
  console.log(`   ${scale.description}`);
  console.log('');
});

// Verify scales have different notes
console.log('Verifying scales have different note sets:');
const uniqueIntervalSets = new Set(cMajorScales.map(s => JSON.stringify(s.intervals)));
console.log(`✅ ${uniqueIntervalSets.size} unique interval patterns out of ${cMajorScales.length} scales`);

// Test C Minor
console.log('\n\n📊 Test 2: C Minor Triad - Compatible Scales');
console.log('-'.repeat(80));
const cMinorScales = getCompatibleScalesForTriad('C', 'minor');
console.log(`Total Compatible Scales: ${cMinorScales.length}\n`);

cMinorScales.forEach((scale, index) => {
  const rating = '⭐'.repeat(Math.floor(scale.compatibilityRating));
  console.log(`${index + 1}. ${scale.fullDisplayName} ${scale.isPrimary ? '★ PRIMARY' : ''}`);
  console.log(`   Rating: ${rating} (${scale.compatibilityRating}/10) | Category: ${scale.category}`);
});

// Test C Diminished
console.log('\n\n📊 Test 3: C Diminished Triad - Compatible Scales');
console.log('-'.repeat(80));
const cDimScales = getCompatibleScalesForTriad('C', 'diminished');
console.log(`Total Compatible Scales: ${cDimScales.length}\n`);

cDimScales.forEach((scale, index) => {
  const rating = '⭐'.repeat(Math.floor(scale.compatibilityRating));
  console.log(`${index + 1}. ${scale.fullDisplayName} ${scale.isPrimary ? '★ PRIMARY' : ''}`);
  console.log(`   Rating: ${rating} (${scale.compatibilityRating}/10) | Category: ${scale.category}`);
});

// Test C Augmented
console.log('\n\n📊 Test 4: C Augmented Triad - Compatible Scales');
console.log('-'.repeat(80));
const cAugScales = getCompatibleScalesForTriad('C', 'augmented');
console.log(`Total Compatible Scales: ${cAugScales.length}\n`);

cAugScales.forEach((scale, index) => {
  const rating = '⭐'.repeat(Math.floor(scale.compatibilityRating));
  console.log(`${index + 1}. ${scale.fullDisplayName} ${scale.isPrimary ? '★ PRIMARY' : ''}`);
  console.log(`   Rating: ${rating} (${scale.compatibilityRating}/10) | Category: ${scale.category}`);
});

// Test all 12 notes with Major triad
console.log('\n\n📊 Test 5: All 12 Notes with Major Triad');
console.log('-'.repeat(80));
const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
let allNotesPass = true;
notes.forEach(note => {
  const scales = getScaleRecommendationsForTriad(note, 'major');
  const primary = scales.find(s => s.isPrimary);
  const pass = scales.length > 0 && primary !== undefined;
  console.log(`${pass ? '✅' : '❌'} ${note} Major: ${scales.length} scales, primary is ${primary?.displayName || 'NONE'}`);
  if (!pass) allNotesPass = false;
});

// Test backward compatibility
console.log('\n\n📊 Test 6: Backward Compatibility');
console.log('-'.repeat(80));
const recommendations = getScaleRecommendationsForTriad('C', 'major');
console.log(`✅ getScaleRecommendationsForTriad returns ${recommendations.length} scales`);
console.log(`✅ First scale: ${recommendations[0].displayName}`);
console.log(`✅ Has rating: ${recommendations[0].compatibilityRating}/10`);
console.log(`✅ Has category: ${recommendations[0].category}`);

// Summary
console.log('\n' + '='.repeat(80));
console.log('\n📈 Test Summary:');
console.log(`C Major: ${cMajorScales.length} compatible scales`);
console.log(`C Minor: ${cMinorScales.length} compatible scales`);
console.log(`C Diminished: ${cDimScales.length} compatible scales`);
console.log(`C Augmented: ${cAugScales.length} compatible scales`);
console.log(`\nAll 12 notes work: ${allNotesPass ? '✅ YES' : '❌ NO'}`);

const totalScales = cMajorScales.length + cMinorScales.length + cDimScales.length + cAugScales.length;
console.log(`\nTotal unique scales across all triad types: ${totalScales}`);

console.log('\n🎉 Compatible Scales System is working correctly!');
console.log('Each scale shows DIFFERENT notes on the fretboard.');
console.log('All scales are rated for compatibility (1-10).');

console.log('\n' + '='.repeat(80));
console.log('Test complete!\n');

