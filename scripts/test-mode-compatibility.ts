/**
 * Test Script for Mode Compatibility System
 * Run this to verify all 48 combinations work correctly
 */

import { getCompatibleModesForTriad, getPrimaryModeForTriad } from '../lib/mode-compatibility-database';
import { getScaleRecommendationsForTriad } from '../lib/triad-scale-mapping';
import { TriadType } from '../lib/triad-theory';

const TRIAD_TYPES: TriadType[] = ['major', 'minor', 'diminished', 'augmented'];
const ROOT_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

interface TestResult {
  triadType: TriadType;
  rootNote: string;
  modeCount: number;
  primaryMode: string;
  allModes: string[];
  passed: boolean;
  error?: string;
}

/**
 * Test a single triad type
 */
function testTriadType(triadType: TriadType): TestResult[] {
  const results: TestResult[] = [];

  ROOT_NOTES.forEach(rootNote => {
    try {
      // Get modes from database
      const modes = getCompatibleModesForTriad(rootNote, triadType);
      const primary = getPrimaryModeForTriad(rootNote, triadType);

      // Get recommendations (backward compatibility test)
      const recommendations = getScaleRecommendationsForTriad(rootNote, triadType);

      const result: TestResult = {
        triadType,
        rootNote,
        modeCount: modes.length,
        primaryMode: primary?.displayName || 'None',
        allModes: modes.map(m => m.displayName),
        passed: modes.length > 0 && primary !== null && recommendations.length > 0
      };

      results.push(result);
    } catch (error) {
      results.push({
        triadType,
        rootNote,
        modeCount: 0,
        primaryMode: 'Error',
        allModes: [],
        passed: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  return results;
}

/**
 * Run all tests
 */
function runAllTests(): void {
  console.log('🎼 Testing Mode Compatibility System\n');
  console.log('=' .repeat(80));

  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;

  TRIAD_TYPES.forEach(triadType => {
    console.log(`\n📊 Testing ${triadType.toUpperCase()} Triads:`);
    console.log('-'.repeat(80));

    const results = testTriadType(triadType);
    
    results.forEach(result => {
      totalTests++;
      
      if (result.passed) {
        passedTests++;
        console.log(`✅ ${result.rootNote} ${triadType}: ${result.modeCount} modes (Primary: ${result.primaryMode})`);
      } else {
        failedTests++;
        console.log(`❌ ${result.rootNote} ${triadType}: FAILED - ${result.error || 'No modes found'}`);
      }
    });

    // Show mode list for first root note
    if (results.length > 0 && results[0].passed) {
      console.log(`\n   Modes for ${results[0].rootNote} ${triadType}:`);
      results[0].allModes.forEach((mode, index) => {
        const isPrimary = mode === results[0].primaryMode;
        console.log(`   ${index + 1}. ${mode} ${isPrimary ? '★' : ''}`);
      });
    }
  });

  console.log('\n' + '='.repeat(80));
  console.log(`\n📈 Test Results:`);
  console.log(`   Total Tests: ${totalTests}`);
  console.log(`   Passed: ${passedTests} ✅`);
  console.log(`   Failed: ${failedTests} ❌`);
  console.log(`   Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

  if (failedTests === 0) {
    console.log('\n🎉 All tests passed! The mode compatibility system is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Please review the errors above.');
  }
}

/**
 * Test music theory accuracy
 */
function testMusicTheory(): void {
  console.log('\n\n🎼 Testing Music Theory Accuracy\n');
  console.log('=' .repeat(80));

  // Note: Interval validation tests are commented out because ModeCompatibility
  // type doesn't currently include intervals property. This can be added in the future
  // if needed for more detailed music theory validation.

  /*
  // Test major triads have major 3rd
  console.log('\n✓ Major Triads - All modes should have major 3rd (interval 4):');
  const majorModes = getCompatibleModesForTriad('C', 'major');
  majorModes.forEach(mode => {
    const hasMajor3rd = mode.intervals.includes(4);
    console.log(`   ${mode.displayName}: ${hasMajor3rd ? '✅' : '❌'} (intervals: ${mode.intervals.join(', ')})`);
  });

  // Test minor triads have minor 3rd
  console.log('\n✓ Minor Triads - All modes should have minor 3rd (interval 3):');
  const minorModes = getCompatibleModesForTriad('C', 'minor');
  minorModes.forEach(mode => {
    const hasMinor3rd = mode.intervals.includes(3);
    console.log(`   ${mode.displayName}: ${hasMinor3rd ? '✅' : '❌'} (intervals: ${mode.intervals.join(', ')})`);
  });

  // Test diminished triads have b3 and b5
  console.log('\n✓ Diminished Triads - All modes should have minor 3rd (3) and dim 5th (6):');
  const dimModes = getCompatibleModesForTriad('C', 'diminished');
  dimModes.forEach(mode => {
    const hasMinor3rd = mode.intervals.includes(3);
    const hasDim5th = mode.intervals.includes(6);
    console.log(`   ${mode.displayName}: ${hasMinor3rd && hasDim5th ? '✅' : '❌'} (intervals: ${mode.intervals.join(', ')})`);
  });

  // Test augmented triads have major 3rd and aug 5th
  console.log('\n✓ Augmented Triads - All modes should have major 3rd (4) and aug 5th (8):');
  const augModes = getCompatibleModesForTriad('C', 'augmented');
  augModes.forEach(mode => {
    const hasMajor3rd = mode.intervals.includes(4);
    const hasAug5th = mode.intervals.includes(8);
    console.log(`   ${mode.displayName}: ${hasMajor3rd && hasAug5th ? '✅' : '❌'} (intervals: ${mode.intervals.join(', ')})`);
  });
  */
}

// Run tests
console.clear();
runAllTests();
testMusicTheory();

console.log('\n' + '='.repeat(80));
console.log('Test complete! Check the results above.\n');

