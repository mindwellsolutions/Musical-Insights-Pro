/**
 * Direct smplr test - minimal reproduction
 * Run this in the browser console to test smplr directly
 */

import { Soundfont } from 'smplr';

async function testSmplrDirect() {
  console.log('🎵 Testing smplr directly...\n');

  // Create AudioContext
  const context = new AudioContext();
  console.log(`AudioContext state: ${context.state}`);
  
  // Resume context (required for autoplay policy)
  await context.resume();
  console.log(`AudioContext resumed: ${context.state}`);

  // Create Soundfont
  console.log('Creating Soundfont...');
  const piano = new Soundfont(context, {
    instrument: 'acoustic_grand_piano',
  });

  // Wait for load
  console.log('Loading samples...');
  await piano.load;
  console.log('✅ Samples loaded!');

  // Check output
  console.log('Piano output:', piano.output);
  console.log('Context destination:', context.destination);

  // Try to play a note
  console.log('\n🎹 Playing C4 (MIDI 60)...');
  piano.start({ note: 60, velocity: 100 });

  // Wait 2 seconds
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Stop the note
  piano.stop({ stopId: 60 });
  console.log('✅ Note stopped');

  // Try playing a chord
  console.log('\n🎹 Playing C major chord...');
  const chord = [60, 64, 67]; // C, E, G
  chord.forEach(note => {
    piano.start({ note, velocity: 100 });
  });

  await new Promise(resolve => setTimeout(resolve, 2000));

  chord.forEach(note => {
    piano.stop({ stopId: note });
  });
  console.log('✅ Chord stopped');

  console.log('\n✅ Test complete!');
  console.log('Did you hear sound? If not, check:');
  console.log('1. System volume');
  console.log('2. Browser permissions');
  console.log('3. Audio output device');
}

// Export for browser console
if (typeof window !== 'undefined') {
  (window as any).testSmplrDirect = testSmplrDirect;
  console.log('Run: testSmplrDirect()');
}

export { testSmplrDirect };

