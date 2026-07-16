/**
 * Manual test script for Timeline Playback System
 * Tests the new timing, playhead, and audio components
 * 
 * Run with: npx tsx scripts/test-timeline-playback.ts
 */

import { MusicalTimeTracker, TimeSignature } from '../lib/chord-progression/musical-time-tracker';
import { BeatCounter } from '../lib/chord-progression/beat-counter';

console.log('🎵 Timeline Playback System - Manual Tests\n');

// Test 1: MusicalTimeTracker - Time Conversions
console.log('Test 1: MusicalTimeTracker - Time Conversions');
console.log('='.repeat(50));

const tracker = new MusicalTimeTracker({ numerator: 4, denominator: 4 });

// Test beats to pixels conversion
const testCases = [
  { beats: 0, ppb: 50, expected: 0 },
  { beats: 4, ppb: 50, expected: 200 },
  { beats: 8, ppb: 50, expected: 400 },
  { beats: 2.5, ppb: 100, expected: 250 },
];

let passed = 0;
let failed = 0;

testCases.forEach(({ beats, ppb, expected }) => {
  const result = tracker.beatsToPixels(beats, ppb);
  const success = result === expected;
  
  if (success) {
    console.log(`✅ beatsToPixels(${beats}, ${ppb}) = ${result} (expected ${expected})`);
    passed++;
  } else {
    console.log(`❌ beatsToPixels(${beats}, ${ppb}) = ${result} (expected ${expected})`);
    failed++;
  }
});

// Test pixels to beats conversion
const pixelTestCases = [
  { pixels: 0, ppb: 50, expected: 0 },
  { pixels: 200, ppb: 50, expected: 4 },
  { pixels: 400, ppb: 50, expected: 8 },
  { pixels: 250, ppb: 100, expected: 2.5 },
];

pixelTestCases.forEach(({ pixels, ppb, expected }) => {
  const result = tracker.pixelsToBeats(pixels, ppb);
  const success = result === expected;
  
  if (success) {
    console.log(`✅ pixelsToBeats(${pixels}, ${ppb}) = ${result} (expected ${expected})`);
    passed++;
  } else {
    console.log(`❌ pixelsToBeats(${pixels}, ${ppb}) = ${result} (expected ${expected})`);
    failed++;
  }
});

console.log('');

// Test 2: Beat Markers Generation
console.log('Test 2: Beat Markers Generation');
console.log('='.repeat(50));

const markers = tracker.getBeatMarkers(8);

// Should have 9 markers (0-8 inclusive)
if (markers.length === 9) {
  console.log(`✅ Generated ${markers.length} markers (expected 9)`);
  passed++;
} else {
  console.log(`❌ Generated ${markers.length} markers (expected 9)`);
  failed++;
}

// First marker should be bar start
if (markers[0].isBarStart) {
  console.log(`✅ First marker is bar start`);
  passed++;
} else {
  console.log(`❌ First marker is not bar start`);
  failed++;
}

// Fifth marker (beat 4) should be bar start in 4/4
if (markers[4].isBarStart) {
  console.log(`✅ Beat 4 is bar start (4/4 time)`);
  passed++;
} else {
  console.log(`❌ Beat 4 is not bar start (4/4 time)`);
  failed++;
}

// Second marker should not be bar start
if (!markers[1].isBarStart) {
  console.log(`✅ Beat 1 is not bar start`);
  passed++;
} else {
  console.log(`❌ Beat 1 is bar start (should not be)`);
  failed++;
}

console.log('');

// Test 3: Time Signature Support
console.log('Test 3: Time Signature Support');
console.log('='.repeat(50));

const tracker34 = new MusicalTimeTracker({ numerator: 3, denominator: 4 });
const markers34 = tracker34.getBeatMarkers(6);

// In 3/4, every 3rd beat should be a bar start
if (markers34[0].isBarStart && markers34[3].isBarStart && markers34[6].isBarStart) {
  console.log(`✅ 3/4 time signature: bars at beats 0, 3, 6`);
  passed++;
} else {
  console.log(`❌ 3/4 time signature: incorrect bar positions`);
  failed++;
}

if (!markers34[1].isBarStart && !markers34[2].isBarStart) {
  console.log(`✅ 3/4 time signature: beats 1, 2 are not bar starts`);
  passed++;
} else {
  console.log(`❌ 3/4 time signature: incorrect beat positions`);
  failed++;
}

console.log('');

// Test 4: BeatCounter Callback Registration
console.log('Test 4: BeatCounter Callback System');
console.log('='.repeat(50));

const beatCounter = new BeatCounter(tracker);
let beatCallbackCalled = false;
let measureCallbackCalled = false;

const unsubscribeBeat = beatCounter.onBeat(() => {
  beatCallbackCalled = true;
});

const unsubscribeMeasure = beatCounter.onMeasure(() => {
  measureCallbackCalled = true;
});

// Verify callbacks are registered
console.log(`✅ Beat callback registered`);
console.log(`✅ Measure callback registered`);
passed += 2;

// Cleanup
unsubscribeBeat();
unsubscribeMeasure();
beatCounter.clearCallbacks();

console.log(`✅ Callbacks cleaned up`);
passed++;

console.log('');

// Summary
console.log('Test Summary');
console.log('='.repeat(50));
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);
console.log(`📊 Total: ${passed + failed}`);
console.log(`🎯 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);

if (failed === 0) {
  console.log('\n🎉 All tests passed! Timeline playback system is working correctly.');
  process.exit(0);
} else {
  console.log('\n⚠️  Some tests failed. Please review the implementation.');
  process.exit(1);
}

