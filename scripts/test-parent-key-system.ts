/**
 * Test Script for Parent Key System
 * Verifies that all 7 modes are correctly generated for each triad type
 */

import { getModesForTriad, getParentKey, transposeNote } from '../lib/parent-key-calculator';
import { getCompatibleModesForTriad } from '../lib/mode-compatibility-database';
import { TriadType } from '../lib/triad-theory';

const TRIAD_TYPES: TriadType[] = ['major', 'minor', 'diminished', 'augmented'];

console.clear();
console.log('🎼 Testing Parent Key System\n');
console.log('='.repeat(80));

// Test C Major
console.log('\n📊 Test 1: C Major Triad');
console.log('-'.repeat(80));
const cMajorParent = getParentKey('C', 'major');
console.log(`Parent Key: ${cMajorParent} Major`);
const cMajorModes = getModesForTriad('C', 'major');
console.log('\nExpected 7 Modes:');
console.log('1. C Ionian ★');
console.log('2. D Dorian');
console.log('3. E Phrygian');
console.log('4. F Lydian');
console.log('5. G Mixolydian');
console.log('6. A Aeolian');
console.log('7. B Locrian');
console.log('\nActual Modes:');
cMajorModes.forEach((mode, index) => {
  console.log(`${index + 1}. ${mode.displayName} ${mode.isPrimary ? '★' : ''}`);
});

// Verify
const expectedCMajor = ['C Ionian', 'D Dorian', 'E Phrygian', 'F Lydian', 'G Mixolydian', 'A Aeolian', 'B Locrian'];
const actualCMajor = cMajorModes.map(m => m.displayName);
const cMajorPass = JSON.stringify(expectedCMajor) === JSON.stringify(actualCMajor);
console.log(`\n${cMajorPass ? '✅ PASS' : '❌ FAIL'}: C Major modes are correct`);

// Test C Minor
console.log('\n\n📊 Test 2: C Minor Triad');
console.log('-'.repeat(80));
const cMinorParent = getParentKey('C', 'minor');
console.log(`Parent Key: ${cMinorParent} Major (C is the 6th degree)`);
const cMinorModes = getModesForTriad('C', 'minor');
console.log('\nExpected 7 Modes:');
console.log('1. Eb Ionian (D# Ionian)');
console.log('2. F Dorian');
console.log('3. G Phrygian');
console.log('4. Ab Lydian (G# Lydian)');
console.log('5. Bb Mixolydian (A# Mixolydian)');
console.log('6. C Aeolian ★');
console.log('7. D Locrian');
console.log('\nActual Modes:');
cMinorModes.forEach((mode, index) => {
  console.log(`${index + 1}. ${mode.displayName} ${mode.isPrimary ? '★' : ''}`);
});

// Verify parent key is Eb (D#)
const cMinorPass = cMinorParent === 'D#' && cMinorModes.length === 7 && cMinorModes[5].isPrimary;
console.log(`\n${cMinorPass ? '✅ PASS' : '❌ FAIL'}: C Minor parent key is Eb Major and Aeolian is primary`);

// Test C Diminished
console.log('\n\n📊 Test 3: C Diminished Triad');
console.log('-'.repeat(80));
const cDimParent = getParentKey('C', 'diminished');
console.log(`Parent Key: ${cDimParent} Major (C is the 7th degree)`);
const cDimModes = getModesForTriad('C', 'diminished');
console.log('\nExpected 7 Modes:');
console.log('1. Db Ionian (C# Ionian)');
console.log('2. Eb Dorian (D# Dorian)');
console.log('3. F Phrygian');
console.log('4. Gb Lydian (F# Lydian)');
console.log('5. Ab Mixolydian (G# Mixolydian)');
console.log('6. Bb Aeolian (A# Aeolian)');
console.log('7. C Locrian ★');
console.log('\nActual Modes:');
cDimModes.forEach((mode, index) => {
  console.log(`${index + 1}. ${mode.displayName} ${mode.isPrimary ? '★' : ''}`);
});

// Verify parent key is Db (C#)
const cDimPass = cDimParent === 'C#' && cDimModes.length === 7 && cDimModes[6].isPrimary;
console.log(`\n${cDimPass ? '✅ PASS' : '❌ FAIL'}: C Diminished parent key is Db Major and Locrian is primary`);

// Test C Augmented
console.log('\n\n📊 Test 4: C Augmented Triad');
console.log('-'.repeat(80));
const cAugParent = getParentKey('C', 'augmented');
console.log(`Parent Key: ${cAugParent} (Augmented is not diatonic, uses C as base)`);
const cAugModes = getModesForTriad('C', 'augmented');
console.log('\nActual Modes:');
cAugModes.forEach((mode, index) => {
  console.log(`${index + 1}. ${mode.displayName} ${mode.isPrimary ? '★' : ''}`);
});

const cAugPass = cAugModes.length === 7;
console.log(`\n${cAugPass ? '✅ PASS' : '❌ FAIL'}: C Augmented has 7 modes`);

// Test all 12 notes with Major triad
console.log('\n\n📊 Test 5: All 12 Notes with Major Triad');
console.log('-'.repeat(80));
const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
let allNotesPass = true;
notes.forEach(note => {
  const modes = getCompatibleModesForTriad(note, 'major');
  const pass = modes.length === 7 && modes[0].rootNote === note && modes[0].isPrimary;
  console.log(`${pass ? '✅' : '❌'} ${note} Major: ${modes.length} modes, primary is ${modes[0].displayName}`);
  if (!pass) allNotesPass = false;
});

console.log(`\n${allNotesPass ? '✅ PASS' : '❌ FAIL'}: All 12 notes work with Major triad`);

// Summary
console.log('\n' + '='.repeat(80));
console.log('\n📈 Test Summary:');
const totalTests = 5;
const passedTests = [cMajorPass, cMinorPass, cDimPass, cAugPass, allNotesPass].filter(Boolean).length;
console.log(`Total Tests: ${totalTests}`);
console.log(`Passed: ${passedTests} ✅`);
console.log(`Failed: ${totalTests - passedTests} ❌`);
console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

if (passedTests === totalTests) {
  console.log('\n🎉 All tests passed! The parent key system is working correctly.');
} else {
  console.log('\n⚠️  Some tests failed. Please review the errors above.');
}

console.log('\n' + '='.repeat(80));
console.log('Test complete!\n');

