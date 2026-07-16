'use client';

/**
 * Key Detection Panel Component
 * Main integration component that manages the entire key detection system
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import AudioInputSelector from './AudioInputSelector';
import { AudioDeviceManager, AudioDevice, getAudioDeviceManager } from '@/lib/audio/audioDeviceManager';
import { KeyDetectionEngine, KeyDetectionResult } from '@/lib/audio/keyDetectionEngine';
import { getCompatibleScales, ScaleCompatibilityRating } from '@/lib/musicalCompatibility';
import { Theme } from '@/lib/themes';

interface KeyDetectionPanelProps {
  theme: Theme;
  autoRecommendation?: boolean;
  autoSwitchFretboard?: boolean;
  onScaleChange?: (rootNote: string, scaleName: string, chordTones: string[], guideTones: string[]) => void;
  onDetectedKeyChange?: (key: string | null, confidence: number, isListening: boolean) => void;
  onCompatibleScalesChange?: (scales: ScaleCompatibilityRating[]) => void;
  onSelectedScaleChange?: (scale: ScaleCompatibilityRating | null) => void;
  onDetectionStateChange?: (isDetecting: boolean) => void;
  onStartDetectionReady?: (startFn: () => Promise<void>) => void;
  onStopDetectionReady?: (stopFn: () => Promise<void>) => void;
}

export default function KeyDetectionPanel({
  theme,
  autoRecommendation: autoRecommendationProp = false,
  autoSwitchFretboard: autoSwitchFretboardProp = false,
  onScaleChange,
  onDetectedKeyChange,
  onCompatibleScalesChange,
  onSelectedScaleChange,
  onDetectionStateChange,
  onStartDetectionReady,
  onStopDetectionReady,
}: KeyDetectionPanelProps) {
  // Audio device state
  const [devices, setDevices] = useState<AudioDevice[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [bufferDuration, setBufferDuration] = useState<number>(15); // Default 15 seconds
  
  // Key detection state
  const [detectedKey, setDetectedKey] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<number>(0);
  const [isListening, setIsListening] = useState<boolean>(false);

  // Use props for auto recommendation state (controlled component)
  const autoRecommendation = autoRecommendationProp;
  const autoSwitchFretboard = autoSwitchFretboardProp;

  // Scale compatibility state
  const [compatibleScales, setCompatibleScales] = useState<ScaleCompatibilityRating[]>([]);
  const [selectedScale, setSelectedScale] = useState<ScaleCompatibilityRating | null>(null);

  // Store callbacks in refs to avoid dependency issues
  const onCompatibleScalesChangeRef = useRef(onCompatibleScalesChange);
  const onSelectedScaleChangeRef = useRef(onSelectedScaleChange);
  const onScaleChangeRef = useRef(onScaleChange);

  // Update refs when callbacks change
  useEffect(() => {
    onCompatibleScalesChangeRef.current = onCompatibleScalesChange;
    onSelectedScaleChangeRef.current = onSelectedScaleChange;
    onScaleChangeRef.current = onScaleChange;
  }, [onCompatibleScalesChange, onSelectedScaleChange, onScaleChange]);

  // Managers
  const audioDeviceManagerRef = useRef<AudioDeviceManager | null>(null);
  const keyDetectionEngineRef = useRef<KeyDetectionEngine | null>(null);
  
  /**
   * Initialize audio device manager
   */
  useEffect(() => {
    audioDeviceManagerRef.current = getAudioDeviceManager({
      sampleRate: 44100,
      channelCount: 1,
      echoCancellation: false,
      noiseSuppression: false,
      autoGainControl: false,
    });

    // Don't load devices on mount - wait for user interaction
    // This prevents automatic permission requests

    // Cleanup on unmount
    return () => {
      if (keyDetectionEngineRef.current) {
        keyDetectionEngineRef.current.cleanup();
      }
      if (audioDeviceManagerRef.current) {
        audioDeviceManagerRef.current.cleanup();
      }
    };
  }, []);
  
  /**
   * Load available audio devices
   */
  const loadDevices = async () => {
    try {
      if (!audioDeviceManagerRef.current) return;
      
      const availableDevices = await audioDeviceManagerRef.current.getAudioInputDevices();
      setDevices(availableDevices);
      
      // Auto-select first device if none selected
      if (availableDevices.length > 0 && !selectedDeviceId) {
        setSelectedDeviceId(availableDevices[0].deviceId);
      }
    } catch (error) {
      console.error('Failed to load audio devices:', error);
      alert('Failed to access audio devices. Please grant microphone permission.');
    }
  };
  
  /**
   * Handle key detection callback
   */
  const handleKeyDetected = useCallback(async (result: KeyDetectionResult) => {
    console.log('Key detected:', result);

    // Update the display
    setDetectedKey(result.key);
    setConfidence(result.confidence);
    setIsListening(false); // Analysis complete

    // Notify parent of key change
    if (onDetectedKeyChange) {
      onDetectedKeyChange(result.key, result.confidence, false);
    }

    // If auto recommendation is enabled, fetch compatible scales
    if (autoRecommendation) {
      const scales = getCompatibleScales(result.key, 12, 4);
      console.log('Compatible scales fetched:', scales.length);
      setCompatibleScales(scales);

      // Notify parent of compatible scales change
      if (onCompatibleScalesChangeRef.current) {
        onCompatibleScalesChangeRef.current(scales);
      }

      // If auto switch fretboard is enabled, select the top scale
      if (autoSwitchFretboard && scales.length > 0) {
        const topScale = scales[0];
        setSelectedScale(topScale);

        // Notify parent of selected scale change
        if (onSelectedScaleChangeRef.current) {
          onSelectedScaleChangeRef.current(topScale);
        }

        // Notify parent component to update fretboard
        if (onScaleChangeRef.current) {
          onScaleChangeRef.current(
            topScale.rootNote,
            topScale.scaleName,
            topScale.chordTones,
            topScale.guideTones
          );
        }
      }
    } else {
      // Clear compatible scales if auto recommendation is off
      setCompatibleScales([]);
      setSelectedScale(null);

      if (onCompatibleScalesChangeRef.current) {
        onCompatibleScalesChangeRef.current([]);
      }
      if (onSelectedScaleChangeRef.current) {
        onSelectedScaleChangeRef.current(null);
      }
    }

    // Set listening state back to true after a brief delay to show "analyzing" again
    setTimeout(() => {
      setIsListening(true);
      if (onDetectedKeyChange) {
        onDetectedKeyChange(result.key, result.confidence, true);
      }
    }, 500);
  }, [autoRecommendation, autoSwitchFretboard, onDetectedKeyChange]);
  
  /**
   * Start key detection
   */
  const startDetection = useCallback(async () => {
    try {
      if (!audioDeviceManagerRef.current) {
        alert('Audio device manager not initialized.');
        return;
      }

      // Load devices if not already loaded (this will request permission)
      if (devices.length === 0) {
        await loadDevices();
      }

      if (!selectedDeviceId) {
        alert('Please select an audio input device first.');
        return;
      }

      // Create key detection engine if not exists
      if (!keyDetectionEngineRef.current) {
        keyDetectionEngineRef.current = new KeyDetectionEngine(
          audioDeviceManagerRef.current,
          {
            onKeyDetected: handleKeyDetected,
            onError: (error) => {
              console.error('Key detection error:', error);
              alert('Key detection error: ' + error.message);
              setIsDetecting(false);
            },
            onInitialized: () => {
              console.log('Key detection engine initialized');
            },
            debounceMs: 500,
            minConfidence: 0.3,
            bufferDuration: bufferDuration,
          }
        );
      } else {
        // Update buffer duration if engine already exists
        keyDetectionEngineRef.current.setBufferDuration(bufferDuration);
      }

      // Start detection
      await keyDetectionEngineRef.current.start(selectedDeviceId);
      setIsDetecting(true);
      setIsListening(true); // Start listening for audio

      // Notify parent of detection state change
      if (onDetectionStateChange) {
        onDetectionStateChange(true);
      }

      // Notify parent immediately that we're listening (show "Analyzing..." in UI)
      if (onDetectedKeyChange) {
        onDetectedKeyChange(null, 0, true);
      }
    } catch (error) {
      console.error('Failed to start detection:', error);
      alert('Failed to start key detection: ' + (error as Error).message);
    }
  }, [selectedDeviceId, bufferDuration, handleKeyDetected, onDetectionStateChange, onDetectedKeyChange, devices.length]);
  
  /**
   * Stop key detection
   */
  const stopDetection = useCallback(async () => {
    try {
      if (keyDetectionEngineRef.current) {
        await keyDetectionEngineRef.current.stop();
      }
      setIsDetecting(false);
      setIsListening(false);

      // Notify parent of detection state change
      if (onDetectionStateChange) {
        onDetectionStateChange(false);
      }

      // Notify parent that we've stopped listening
      if (onDetectedKeyChange) {
        onDetectedKeyChange(detectedKey, confidence, false);
      }
    } catch (error) {
      console.error('Failed to stop detection:', error);
    }
  }, [detectedKey, confidence, onDetectionStateChange, onDetectedKeyChange]);

  // Expose start/stop functions to parent
  useEffect(() => {
    if (onStartDetectionReady) {
      onStartDetectionReady(startDetection);
    }
    if (onStopDetectionReady) {
      onStopDetectionReady(stopDetection);
    }
  }, [onStartDetectionReady, onStopDetectionReady, startDetection, stopDetection]);

  /**
   * Handle scale selection
   */
  const handleScaleSelect = useCallback((scale: ScaleCompatibilityRating) => {
    setSelectedScale(scale);

    // Notify parent of selected scale change
    if (onSelectedScaleChangeRef.current) {
      onSelectedScaleChangeRef.current(scale);
    }

    // Notify parent component
    if (onScaleChangeRef.current) {
      onScaleChangeRef.current(
        scale.rootNote,
        scale.scaleName,
        scale.chordTones,
        scale.guideTones
      );
    }
  }, []);

  /**
   * Effect: Fetch compatible scales when autoRecommendation changes or key is detected
   */
  useEffect(() => {
    if (autoRecommendation && detectedKey) {
      // Fetch compatible scales when enabled
      const scales = getCompatibleScales(detectedKey, 12, 4);
      setCompatibleScales(scales);

      if (onCompatibleScalesChangeRef.current) {
        onCompatibleScalesChangeRef.current(scales);
      }

      // If auto switch is enabled, select the top scale
      if (autoSwitchFretboard && scales.length > 0) {
        const topScale = scales[0];
        setSelectedScale(topScale);

        if (onSelectedScaleChangeRef.current) {
          onSelectedScaleChangeRef.current(topScale);
        }

        if (onScaleChangeRef.current) {
          onScaleChangeRef.current(
            topScale.rootNote,
            topScale.scaleName,
            topScale.chordTones,
            topScale.guideTones
          );
        }
      }
    } else if (!autoRecommendation) {
      // Only clear scales when auto recommendation is explicitly disabled
      // Don't clear when there's just no detected key yet
      setCompatibleScales([]);
      setSelectedScale(null);

      if (onCompatibleScalesChangeRef.current) {
        onCompatibleScalesChangeRef.current([]);
      }
      if (onSelectedScaleChangeRef.current) {
        onSelectedScaleChangeRef.current(null);
      }
    }
  }, [autoRecommendation, autoSwitchFretboard, detectedKey]);
  
  return (
    <div>
      <AudioInputSelector
        devices={devices}
        selectedDeviceId={selectedDeviceId}
        isDetecting={isDetecting}
        bufferDuration={bufferDuration}
        onDeviceSelect={setSelectedDeviceId}
        onStartDetection={startDetection}
        onStopDetection={stopDetection}
        onRefreshDevices={loadDevices}
        onBufferDurationChange={setBufferDuration}
        theme={theme}
      />
    </div>
  );
}

// Export internal state getters for parent components
export function useKeyDetectionState() {
  return {
    detectedKey: null,
    confidence: 0,
    isListening: false,
    autoRecommendation: false,
    autoSwitchFretboard: false,
    compatibleScales: [],
    selectedScale: null,
  };
}

