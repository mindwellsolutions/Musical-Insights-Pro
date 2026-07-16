'use client';

/**
 * Timeline Playback System Integration Test Page
 * Tests the complete playback system in the browser
 */

import { useState, useEffect } from 'react';
import { useTimelinePlayback } from '@/hooks/chord-progression/useTimelinePlayback';
import { ChordInstance } from '@/lib/chord-progression/types';
import PlaybackCursor from '@/components/chord-progression/PlaybackCursor';
import { Button } from '@/components/ui/button';

export default function TestPlaybackPage() {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [testChords, setTestChords] = useState<ChordInstance[]>([]);

  // Create test chord progression
  useEffect(() => {
    const chords: ChordInstance[] = [
      {
        id: '1',
        chordSymbol: 'C',
        chordQuality: 'maj',
        notes: ['C4', 'E4', 'G4'],
        rootNote: 'C',
        startTime: 0,
        duration: 4,
        position: 0,
        width: 100,
        color: '#3b82f6',
        voicingIndex: 0,
      },
      {
        id: '2',
        chordSymbol: 'Am',
        chordQuality: 'min',
        notes: ['A3', 'C4', 'E4'],
        rootNote: 'A',
        startTime: 4,
        duration: 4,
        position: 400,
        width: 100,
        color: '#10b981',
        voicingIndex: 0,
      },
      {
        id: '3',
        chordSymbol: 'F',
        chordQuality: 'maj',
        notes: ['F3', 'A3', 'C4'],
        rootNote: 'F',
        startTime: 8,
        duration: 4,
        position: 800,
        width: 100,
        color: '#f59e0b',
        voicingIndex: 0,
      },
      {
        id: '4',
        chordSymbol: 'G',
        chordQuality: 'maj',
        notes: ['G3', 'B3', 'D4'],
        rootNote: 'G',
        startTime: 12,
        duration: 4,
        position: 1200,
        width: 100,
        color: '#ef4444',
        voicingIndex: 0,
      },
    ];
    setTestChords(chords);
  }, []);

  const {
    playbackState,
    selectedInstrument,
    setSelectedInstrument,
    volume,
    setVolume,
    midiEnabled,
    setMidiEnabled,
    audioOutputDevice,
    setAudioOutputDevice,
    availableDevices,
    isLoading,
    play,
    pause,
    stop,
    replay,
  } = useTimelinePlayback(testChords, 120, 50);

  const addResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const runTests = async () => {
    setTestResults([]);
    addResult('🧪 Starting integration tests...');

    // Test 1: Play functionality
    addResult('Test 1: Testing play functionality...');
    await play();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (playbackState.isPlaying) {
      addResult('✅ Play works - playback started');
    } else {
      addResult('❌ Play failed - playback did not start');
    }

    // Test 2: Pause functionality
    addResult('Test 2: Testing pause functionality...');
    pause();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (!playbackState.isPlaying) {
      addResult('✅ Pause works - playback paused');
    } else {
      addResult('❌ Pause failed - playback still running');
    }

    // Test 3: Stop functionality
    addResult('Test 3: Testing stop functionality...');
    stop();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (playbackState.currentTime === 0) {
      addResult('✅ Stop works - position reset to 0');
    } else {
      addResult('❌ Stop failed - position not reset');
    }

    // Test 4: Replay functionality
    addResult('Test 4: Testing replay functionality...');
    await replay();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (playbackState.isPlaying) {
      addResult('✅ Replay works - playback restarted');
    } else {
      addResult('❌ Replay failed - playback did not restart');
    }

    stop();
    addResult('🎉 All integration tests completed!');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Timeline Playback System - Integration Tests</h1>
        
        {/* Test Controls */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Controls</h2>
          <div className="flex gap-4 mb-4">
            <Button onClick={runTests} disabled={isLoading}>
              Run All Tests
            </Button>
            <Button onClick={play} disabled={isLoading}>Play</Button>
            <Button onClick={pause}>Pause</Button>
            <Button onClick={stop}>Stop</Button>
            <Button onClick={replay} disabled={isLoading}>Replay</Button>
          </div>
          
          {isLoading && <p className="text-yellow-400">⏳ Loading audio samples...</p>}
        </div>

        {/* Playback State */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Playback State</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Status:</span>{' '}
              <span className={playbackState.isPlaying ? 'text-green-400' : 'text-gray-300'}>
                {playbackState.isPlaying ? '▶️ Playing' : '⏸️ Stopped'}
              </span>
            </div>
            <div>
              <span className="text-gray-400">Current Time:</span>{' '}
              <span className="text-blue-400">{playbackState.currentTime.toFixed(2)} beats</span>
            </div>
            <div>
              <span className="text-gray-400">Position:</span>{' '}
              <span className="text-blue-400">{playbackState.playbackPosition.toFixed(0)}px</span>
            </div>
            <div>
              <span className="text-gray-400">Instrument:</span>{' '}
              <span className="text-purple-400">{selectedInstrument}</span>
            </div>
            <div>
              <span className="text-gray-400">Volume:</span>{' '}
              <span className="text-blue-400">{volume}%</span>
            </div>
            <div>
              <span className="text-gray-400">MIDI Enabled:</span>{' '}
              <span className={midiEnabled ? 'text-green-400' : 'text-red-400'}>
                {midiEnabled ? '✅ Yes' : '❌ No'}
              </span>
            </div>
            <div className="col-span-2">
              <span className="text-gray-400">Audio Output:</span>{' '}
              <span className="text-blue-400">
                {audioOutputDevice === 'default'
                  ? 'Default System Output'
                  : availableDevices.find(d => d.deviceId === audioOutputDevice)?.label || 'Unknown Device'}
              </span>
            </div>
            <div className="col-span-2">
              <span className="text-gray-400">Available Devices:</span>{' '}
              <span className="text-blue-400">{availableDevices.length} found</span>
            </div>
          </div>
        </div>

        {/* Visual Playhead Test */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Visual Playhead Test</h2>
          <div className="relative h-32 bg-gray-700 rounded overflow-hidden">
            <PlaybackCursor
              position={playbackState.playbackPosition}
              height={128}
              isPlaying={playbackState.isPlaying}
            />
            {/* Timeline markers */}
            {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(beat => (
              <div
                key={beat}
                className="absolute top-0 h-full w-px bg-gray-600"
                style={{ left: beat * 50 }}
              >
                <span className="absolute top-2 left-1 text-xs text-gray-400">{beat}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Test Results */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Test Results</h2>
          <div className="bg-gray-900 rounded p-4 max-h-96 overflow-y-auto font-mono text-sm">
            {testResults.length === 0 ? (
              <p className="text-gray-500">Click "Run All Tests" to start testing...</p>
            ) : (
              testResults.map((result, i) => (
                <div key={i} className="mb-1">{result}</div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

