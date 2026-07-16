/**
 * Audio Engine Debug Test
 * Tests the smplr audio engine to diagnose why MIDI isn't playing
 */

import { Soundfont } from 'smplr';
import * as Tone from 'tone';

async function testAudioEngine() {
  console.log('🎵 Audio Engine Debug Test\n');
  console.log('='.repeat(50));

  // Test 1: Check if AudioContext is available
  console.log('\n✅ Test 1: AudioContext availability');
  if (typeof AudioContext === 'undefined') {
    console.error('❌ AudioContext is not available!');
    return;
  }
  console.log('✅ AudioContext is available');

  // Test 2: Create AudioContext
  console.log('\n✅ Test 2: Creating AudioContext');
  const context = new AudioContext();
  console.log(`✅ AudioContext created - State: ${context.state}`);
  console.log(`   Sample Rate: ${context.sampleRate}Hz`);
  console.log(`   Destination: ${context.destination.channelCount} channels`);

  // Test 3: Resume AudioContext (required for user interaction)
  console.log('\n✅ Test 3: Resuming AudioContext');
  await context.resume();
  console.log(`✅ AudioContext resumed - State: ${context.state}`);

  // Test 4: Check Tone.js
  console.log('\n✅ Test 4: Tone.js initialization');
  console.log(`   Tone.js version: ${Tone.version}`);
  console.log(`   Transport state: ${Tone.getTransport().state}`);
  console.log(`   Context state: ${Tone.getContext().state}`);

  // Test 5: Create smplr Soundfont
  console.log('\n✅ Test 5: Creating smplr Soundfont');
  try {
    const sampler = new Soundfont(context, {
      instrument: 'acoustic_grand_piano',
      kit: 'MusyngKite',
    });

    console.log('✅ Soundfont created, waiting for samples to load...');
    await sampler.load;
    console.log('✅ Samples loaded successfully!');

    // Test 6: Play a single note
    console.log('\n✅ Test 6: Playing test note (C4)');
    sampler.start({ note: 60, velocity: 100 }); // C4
    console.log('✅ Note triggered - You should hear a piano note!');

    await new Promise(resolve => setTimeout(resolve, 2000));
    sampler.stop({ stopId: 60 });
    console.log('✅ Note stopped');

    // Test 7: Play a chord
    console.log('\n✅ Test 7: Playing test chord (C major)');
    const chord = [60, 64, 67]; // C, E, G
    chord.forEach(note => {
      sampler.start({ note, velocity: 100 });
    });
    console.log('✅ Chord triggered - You should hear a C major chord!');

    await new Promise(resolve => setTimeout(resolve, 2000));
    chord.forEach(note => {
      sampler.stop({ stopId: note });
    });
    console.log('✅ Chord stopped');

    // Test 8: Check volume
    console.log('\n✅ Test 8: Volume control');
    if (sampler.output) {
      console.log('✅ Sampler has output node');
      sampler.output.setVolume(127);
      console.log('✅ Volume set to maximum (127)');
    } else {
      console.error('❌ Sampler has no output node!');
    }

    // Test 9: Play with Tone.js Transport
    console.log('\n✅ Test 9: Playing with Tone.js Transport');
    Tone.getTransport().bpm.value = 120;
    Tone.getTransport().start();
    
    // Schedule a chord
    Tone.getTransport().schedule((time) => {
      console.log('✅ Transport scheduled event triggered');
      chord.forEach(note => {
        sampler.start({ note, velocity: 100, time });
      });
      
      Tone.getTransport().schedule(() => {
        chord.forEach(note => {
          sampler.stop({ stopId: note });
        });
      }, time + 1);
    }, '+0.1');

    await new Promise(resolve => setTimeout(resolve, 3000));
    Tone.getTransport().stop();
    Tone.getTransport().cancel();
    console.log('✅ Transport test complete');

    // Test 10: Check audio routing
    console.log('\n✅ Test 10: Audio routing check');
    console.log(`   Context destination: ${context.destination.channelCount} channels`);
    console.log(`   Context state: ${context.state}`);
    
    if ('sinkId' in context) {
      console.log(`   Sink ID: ${(context as any).sinkId || 'default'}`);
    } else {
      console.log('   ⚠️  setSinkId not supported in this browser');
    }

    console.log('\n' + '='.repeat(50));
    console.log('🎉 All tests completed!');
    console.log('\nIf you heard sounds, the audio engine is working.');
    console.log('If you did NOT hear sounds, check:');
    console.log('  1. System volume is up');
    console.log('  2. Browser has permission to play audio');
    console.log('  3. Correct audio output device is selected');
    console.log('  4. No browser extensions blocking audio');
    
  } catch (error) {
    console.error('❌ Error during audio test:', error);
  }

  // Cleanup
  await context.close();
}

// Run the test
testAudioEngine().catch(console.error);

