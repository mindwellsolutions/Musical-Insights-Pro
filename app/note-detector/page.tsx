'use client';

import React, { useState, useEffect, useRef } from 'react';
import { AudioDeviceSelector } from '@/components/audio/AudioDeviceSelector';
import { NoteDisplay } from '@/components/audio/NoteDisplay';
import { PitchDetector } from '@/lib/audio/pitchDetector';
import { DetectedNote } from '@/types/audio';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Play, Square, AlertCircle, Info } from 'lucide-react';

/**
 * Note Detector Page
 * Real-time guitar/bass note detection using Web Audio API
 */
export default function NoteDetectorPage() {
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [isActive, setIsActive] = useState(false);
  const [currentNote, setCurrentNote] = useState<DetectedNote>({
    note: null,
    frequency: null,
    confidence: 0,
  });
  const [error, setError] = useState<string | null>(null);

  const pitchDetectorRef = useRef<PitchDetector | null>(null);

  /**
   * Initialize pitch detector on mount
   */
  useEffect(() => {
    pitchDetectorRef.current = new PitchDetector();

    return () => {
      // Cleanup on unmount
      if (pitchDetectorRef.current) {
        pitchDetectorRef.current.stop();
      }
    };
  }, []);

  /**
   * Handle device selection
   */
  const handleDeviceSelect = (deviceId: string) => {
    setSelectedDeviceId(deviceId);
    setError(null);
  };

  /**
   * Start pitch detection
   */
  const handleStart = async () => {
    if (!selectedDeviceId) {
      setError('Please select an audio input device first.');
      return;
    }

    if (!pitchDetectorRef.current) {
      setError('Pitch detector not initialized.');
      return;
    }

    try {
      setError(null);
      await pitchDetectorRef.current.start(selectedDeviceId, handleNoteDetected);
      setIsActive(true);
    } catch (err) {
      console.error('Error starting pitch detection:', err);
      setError('Failed to start pitch detection. Please check your audio device and permissions.');
      setIsActive(false);
    }
  };

  /**
   * Stop pitch detection
   */
  const handleStop = async () => {
    if (!pitchDetectorRef.current) return;

    try {
      await pitchDetectorRef.current.stop();
      setIsActive(false);
      setCurrentNote({
        note: null,
        frequency: null,
        confidence: 0,
      });
    } catch (err) {
      console.error('Error stopping pitch detection:', err);
      setError('Failed to stop pitch detection.');
    }
  };

  /**
   * Handle detected note callback
   */
  const handleNoteDetected = (note: DetectedNote) => {
    setCurrentNote(note);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold">Real-Time Note Detector</h1>
          <p className="text-muted-foreground">
            Detect musical notes from your guitar or bass in real-time
          </p>
        </div>

        {/* Info Alert */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            This feature works simultaneously with your DAW (e.g., Reaper). Select your audio interface input and start detecting notes.
          </AlertDescription>
        </Alert>

        {/* Device Selection Card */}
        <Card>
          <CardHeader>
            <CardTitle>Audio Input Setup</CardTitle>
            <CardDescription>
              Select the audio input device where your guitar or bass is connected
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <AudioDeviceSelector
              onDeviceSelect={handleDeviceSelect}
              selectedDeviceId={selectedDeviceId}
            />

            {/* Control Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={handleStart}
                disabled={!selectedDeviceId || isActive}
                className="flex-1"
              >
                <Play className="mr-2 h-4 w-4" />
                Start Detection
              </Button>
              <Button
                onClick={handleStop}
                disabled={!isActive}
                variant="destructive"
                className="flex-1"
              >
                <Square className="mr-2 h-4 w-4" />
                Stop Detection
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Note Display */}
        <NoteDisplay
          note={currentNote.note}
          frequency={currentNote.frequency}
          isActive={isActive}
        />

        {/* Technical Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Technical Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>• <strong>Algorithm:</strong> YIN pitch detection (via pitchfinder library)</p>
            <p>• <strong>Frequency Range:</strong> 40 Hz - 1200 Hz (E1 to D#6)</p>
            <p>• <strong>Sample Rate:</strong> 44.1 kHz</p>
            <p>• <strong>Buffer Size:</strong> 4096 samples</p>
            <p>• <strong>Latency:</strong> ~50ms typical</p>
            <p>• <strong>Note Display:</strong> Flat notation (Bb, Db, Eb, Gb, Ab)</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

