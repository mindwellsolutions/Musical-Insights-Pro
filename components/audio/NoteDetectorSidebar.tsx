'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronDown, Music2, Mic } from 'lucide-react';
import { GuitarPitchDetector } from '@/lib/audio/guitarPitchDetector';
import { DetectedNote } from '@/types/audio';
import { ThemeConfig } from '@/lib/themes';
import GuitarTuner from './GuitarTuner';
import { getAudioDeviceManager } from '@/lib/audio/audioDeviceManager';

interface NoteDetectorSidebarProps {
  theme: ThemeConfig;
  enabled?: boolean;
  onDetectedNoteChange?: (note: string | null, frequency: number | null) => void;
  liveNotesGlowEnabled?: boolean;
  onLiveNotesGlowChange?: (enabled: boolean) => void;
  liveNotesGlowDuration?: number;
  onLiveNotesGlowDurationChange?: (duration: number) => void;
  circleOf5thsGlowDuration?: number;
  onCircleOf5thsGlowDurationChange?: (duration: number) => void;
}

export function NoteDetectorSidebar({
  theme,
  enabled = false,
  onDetectedNoteChange,
  liveNotesGlowEnabled = false,
  onLiveNotesGlowChange,
  liveNotesGlowDuration = 1000,
  onLiveNotesGlowDurationChange,
  circleOf5thsGlowDuration = 1000,
  onCircleOf5thsGlowDurationChange,
}: NoteDetectorSidebarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isTunerExpanded, setIsTunerExpanded] = useState(false);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [hasPermission, setHasPermission] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [currentNote, setCurrentNote] = useState<DetectedNote>({
    note: null,
    frequency: null,
    confidence: 0,
  });
  const [error, setError] = useState<string | null>(null);
  const [isDeviceDropdownOpen, setIsDeviceDropdownOpen] = useState(false);

  const pitchDetectorRef = useRef<GuitarPitchDetector | null>(null);
  const onDetectedNoteChangeRef = useRef(onDetectedNoteChange);

  // Keep the ref updated with the latest callback
  useEffect(() => {
    onDetectedNoteChangeRef.current = onDetectedNoteChange;
  }, [onDetectedNoteChange]);

  // Initialize guitar pitch detector
  useEffect(() => {
    pitchDetectorRef.current = new GuitarPitchDetector();
    return () => {
      if (pitchDetectorRef.current) {
        pitchDetectorRef.current.stop();
      }
    };
  }, []);

  // Request permission and enumerate devices
  const requestPermissionAndEnumerateDevices = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      setHasPermission(true);
      await enumerateDevices();
    } catch (err) {
      console.error('Error requesting microphone permission:', err);
      setError('Microphone permission denied');
      setHasPermission(false);
    }
  };

  // Enumerate devices
  const enumerateDevices = async () => {
    try {
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const audioInputs = allDevices.filter(device => device.kind === 'audioinput');
      setDevices(audioInputs);
      if (audioInputs.length > 0 && !selectedDeviceId) {
        setSelectedDeviceId(audioInputs[0].deviceId);
      }
    } catch (err) {
      console.error('Error enumerating devices:', err);
      setError('Failed to enumerate audio devices');
    }
  };

  // Check permission on mount
  useEffect(() => {
    const checkPermission = async () => {
      try {
        const result = await navigator.permissions.query({ name: 'microphone' as PermissionName });
        if (result.state === 'granted') {
          setHasPermission(true);
          await enumerateDevices();
        }
      } catch (err) {
        console.log('Permission API not supported');
      }
    };
    checkPermission();
  }, []);

  // Stable callback for note detection that doesn't cause re-renders
  const handleNoteDetected = useCallback((note: DetectedNote) => {
    setCurrentNote(note);
    // Use the ref to call the latest callback without causing dependency issues
    if (onDetectedNoteChangeRef.current) {
      onDetectedNoteChangeRef.current(note.note, note.frequency);
    }
  }, []);

  // Auto start/stop detection when enabled prop changes
  useEffect(() => {
    const autoStartStop = async () => {
      if (enabled && !isActive && hasPermission && selectedDeviceId) {
        try {
          setError(null);

          // Try to get the shared audio stream from the key detection system
          const audioDeviceManager = getAudioDeviceManager();
          const sharedStream = audioDeviceManager?.getMediaStream();

          if (sharedStream && sharedStream.active) {
            // Use the shared stream from key detection
            console.log('Note Detector (auto-start): Using shared audio stream from key detection');
            await pitchDetectorRef.current?.start(sharedStream, handleNoteDetected);
          } else {
            // Create our own stream
            console.log('Note Detector (auto-start): Creating new audio stream for device:', selectedDeviceId);
            await pitchDetectorRef.current?.start(selectedDeviceId, handleNoteDetected);
          }

          setIsActive(true);
        } catch (err) {
          console.error('Error starting detection:', err);
          setError('Failed to start detection');
          setIsActive(false);
        }
      } else if (!enabled && isActive) {
        pitchDetectorRef.current?.stop();
        setIsActive(false);
        setCurrentNote({ note: null, frequency: null, confidence: 0 });
      }
    };
    autoStartStop();
    // handleNoteDetected is stable (useCallback with no deps), so it's safe to omit from dependencies
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, isActive, hasPermission, selectedDeviceId]);

  // Start detection
  const handleStart = async () => {
    if (!selectedDeviceId) {
      setError('Please select an audio input device');
      return;
    }

    try {
      setError(null);

      // Try to get the shared audio stream from the key detection system
      const audioDeviceManager = getAudioDeviceManager();
      const sharedStream = audioDeviceManager?.getMediaStream();

      if (sharedStream && sharedStream.active) {
        // Use the shared stream from key detection
        console.log('Note Detector: Using shared audio stream from key detection');
        await pitchDetectorRef.current?.start(sharedStream, handleNoteDetected);
      } else {
        // Create our own stream
        console.log('Note Detector: Creating new audio stream for device:', selectedDeviceId);
        await pitchDetectorRef.current?.start(selectedDeviceId, handleNoteDetected);
      }

      setIsActive(true);
    } catch (err) {
      console.error('Error starting detection:', err);
      setError('Failed to start detection');
      setIsActive(false);
    }
  };

  // Stop detection
  const handleStop = () => {
    pitchDetectorRef.current?.stop();
    setIsActive(false);
    setCurrentNote({ note: null, frequency: null, confidence: 0 });
  };

  const getStatusText = (): string => {
    if (!isActive) return 'Not Active';
    if (currentNote.note) return 'Detecting';
    return 'Listening...';
  };

  const getStatusColor = (): string => {
    if (!isActive) return theme.textSecondary;
    if (currentNote.note) return '#22c55e';
    return '#eab308';
  };

  return (
    <div
      className="rounded-lg p-4 mt-4"
      style={{
        background: theme.bgTertiary,
        border: `1px solid ${theme.border}`,
      }}
    >
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <Music2 className="h-5 w-5" style={{ color: theme.textSecondary }} />
          <h3 className="text-sm font-semibold" style={{ color: theme.textPrimary }}>
            Note Detector
          </h3>
        </div>

        {/* Circle of 5ths Glow Duration Input */}
        {onCircleOf5thsGlowDurationChange && (
          <div className="flex items-center gap-2">
            <span className="text-xs" style={{ color: theme.textSecondary }}>Circle:</span>
            <input
              type="number"
              value={circleOf5thsGlowDuration}
              onChange={(e) => {
                const value = parseInt(e.target.value);
                if (!isNaN(value) && value >= 100 && value <= 5000) {
                  onCircleOf5thsGlowDurationChange(value);
                }
              }}
              min="100"
              max="5000"
              step="100"
              className="w-16 px-2 py-1 text-xs rounded border text-center"
              style={{
                background: theme.bgTertiary,
                color: theme.textPrimary,
                border: `1px solid ${theme.border}`,
              }}
            />
            <span className="text-xs" style={{ color: theme.textSecondary }}>ms</span>
          </div>
        )}
      </div>

      {/* Audio Device Selector */}
      {!hasPermission ? (
        <button
          onClick={requestPermissionAndEnumerateDevices}
          className="w-full py-2 px-4 rounded-lg text-sm font-medium transition-all mb-3"
          style={{
            background: theme.bgSecondary,
            color: theme.textPrimary,
            border: `1px solid ${theme.border}`,
          }}
        >
          <Mic className="inline-block w-4 h-4 mr-2" />
          Enable Microphone
        </button>
      ) : (
        <div className="relative mb-3">
          <button
            onClick={() => setIsDeviceDropdownOpen(!isDeviceDropdownOpen)}
            className="w-full py-2 px-4 rounded-lg text-sm font-medium transition-all text-left flex items-center justify-between"
            style={{
              background: theme.bgSecondary,
              color: theme.textPrimary,
              border: `1px solid ${theme.border}`,
            }}
          >
            <span className="truncate">
              {devices.find(d => d.deviceId === selectedDeviceId)?.label || 'Select Device'}
            </span>
            <ChevronDown
              className="w-4 h-4 transition-transform flex-shrink-0"
              style={{
                transform: isDeviceDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)'
              }}
            />
          </button>
          {isDeviceDropdownOpen && (
            <div
              className="absolute top-full left-0 right-0 mt-1 rounded-lg overflow-hidden z-50 max-h-48 overflow-y-auto"
              style={{
                background: theme.bgSecondary,
                border: `1px solid ${theme.border}`,
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
              }}
            >
              {devices.map((device) => (
                <button
                  key={device.deviceId}
                  onClick={() => {
                    setSelectedDeviceId(device.deviceId);
                    setIsDeviceDropdownOpen(false);
                  }}
                  className="w-full py-2 px-4 text-sm font-medium transition-all text-left"
                  style={{
                    background: selectedDeviceId === device.deviceId ? theme.buttonPrimary : 'transparent',
                    color: selectedDeviceId === device.deviceId ? '#ffffff' : theme.textPrimary,
                    borderBottom: `1px solid ${theme.border}`,
                  }}
                  onMouseEnter={(e) => {
                    if (selectedDeviceId !== device.deviceId) {
                      e.currentTarget.style.background = theme.bgTertiary;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedDeviceId !== device.deviceId) {
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  <span className="truncate block">{device.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Start/Stop Buttons */}
      <div className="flex gap-2 mb-3">
        <button
          onClick={handleStart}
          disabled={isActive || !hasPermission}
          className="flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: isActive ? theme.bgSecondary : 'linear-gradient(135deg, #22c55e, #16a34a)',
            color: isActive ? theme.textSecondary : '#ffffff',
            border: `1px solid ${isActive ? theme.border : '#16a34a'}`,
          }}
        >
          Start
        </button>
        <button
          onClick={handleStop}
          disabled={!isActive}
          className="flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: !isActive ? theme.bgSecondary : 'linear-gradient(135deg, #ef4444, #dc2626)',
            color: !isActive ? theme.textSecondary : '#ffffff',
            border: `1px solid ${!isActive ? theme.border : '#dc2626'}`,
          }}
        >
          Stop
        </button>
      </div>

      {/* Live Notes Glow Checkbox */}
      {onLiveNotesGlowChange && (
        <div
          className="w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-all mb-3"
          style={{
            background: theme.bgSecondary,
            color: theme.textPrimary,
            border: `1px solid ${theme.border}`,
          }}
        >
          {/* Checkbox */}
          <button
            onClick={() => onLiveNotesGlowChange(!liveNotesGlowEnabled)}
            className="flex items-center gap-3 flex-1"
          >
            <div
              className="w-4 h-4 rounded border-2 flex items-center justify-center transition-all flex-shrink-0"
              style={{
                borderColor: liveNotesGlowEnabled ? '#f59e0b' : theme.border,
                background: liveNotesGlowEnabled ? '#f59e0b' : 'transparent',
              }}
            >
              {liveNotesGlowEnabled && (
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <span className="text-sm font-medium">Live Notes Glow</span>
          </button>

          {/* Duration Input */}
          {onLiveNotesGlowDurationChange && (
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={liveNotesGlowDuration}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  if (!isNaN(value) && value >= 100 && value <= 5000) {
                    onLiveNotesGlowDurationChange(value);
                  }
                }}
                min="100"
                max="5000"
                step="100"
                className="w-16 px-2 py-1 text-xs rounded border text-center"
                style={{
                  background: theme.bgTertiary,
                  color: theme.textPrimary,
                  border: `1px solid ${theme.border}`,
                }}
                onClick={(e) => e.stopPropagation()}
              />
              <span className="text-xs" style={{ color: theme.textSecondary }}>ms</span>
            </div>
          )}
        </div>
      )}

      {/* Expandable Note/Frequency Display */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full py-2 px-4 rounded-lg text-sm font-medium transition-all text-left flex items-center justify-between"
        style={{
          background: theme.bgSecondary,
          color: theme.textPrimary,
          border: `1px solid ${theme.border}`,
        }}
      >
        <span>Show Detection</span>
        <ChevronDown
          className="w-4 h-4 transition-transform"
          style={{
            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'
          }}
        />
      </button>

      {/* Expanded Detection Display */}
      {isExpanded && (
        <div
          className="mt-3 p-4 rounded-lg"
          style={{
            background: theme.bgSecondary,
            border: `1px solid ${theme.border}`,
          }}
        >
          {/* Status */}
          <div className="flex items-center justify-center gap-2 mb-4">
            <div
              className="h-2 w-2 rounded-full transition-all"
              style={{
                background: getStatusColor(),
                animation: currentNote.note && isActive ? 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' : 'none',
              }}
            />
            <span className="text-xs font-medium" style={{ color: theme.textSecondary }}>
              {getStatusText()}
            </span>
          </div>

          {/* Note Display */}
          <div
            className="flex items-center justify-center rounded-lg mb-3"
            style={{
              background: theme.bgTertiary,
              border: `2px solid ${currentNote.note && isActive ? '#22c55e' : theme.border}`,
              height: '120px',
            }}
          >
            <div
              className="text-5xl font-bold transition-all"
              style={{
                color: currentNote.note && isActive ? theme.textPrimary : theme.textSecondary,
              }}
            >
              {currentNote.note || '--'}
            </div>
          </div>

          {/* Frequency Display */}
          <div className="text-center">
            <p className="text-xs font-medium mb-1" style={{ color: theme.textSecondary }}>
              Frequency
            </p>
            <p
              className="text-lg font-mono"
              style={{
                color: currentNote.frequency && isActive ? theme.textPrimary : theme.textSecondary,
              }}
            >
              {currentNote.frequency ? `${currentNote.frequency.toFixed(2)} Hz` : '--'}
            </p>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div
          className="mt-3 p-2 rounded text-xs"
          style={{
            background: 'rgba(239, 68, 68, 0.1)',
            color: '#ef4444',
            border: '1px solid rgba(239, 68, 68, 0.3)',
          }}
        >
          {error}
        </div>
      )}

      {/* Tuner Section */}
      <button
        onClick={() => setIsTunerExpanded(!isTunerExpanded)}
        className="w-full flex items-center justify-between py-2 px-4 rounded-lg text-sm font-medium transition-all mt-3"
        style={{
          background: theme.bgSecondary,
          color: theme.textPrimary,
          border: `1px solid ${theme.border}`,
        }}
      >
        <span>Tuner</span>
        <ChevronDown
          className="w-4 h-4 transition-transform"
          style={{
            transform: isTunerExpanded ? 'rotate(180deg)' : 'rotate(0deg)'
          }}
        />
      </button>

      {/* Expanded Tuner Display */}
      {isTunerExpanded && (
        <div
          className="mt-3 rounded-lg overflow-hidden"
          style={{
            background: theme.bgSecondary,
            border: `1px solid ${theme.border}`,
          }}
        >
          <GuitarTuner
            theme={theme}
            frequency={currentNote.frequency}
            note={currentNote.note}
          />
        </div>
      )}
    </div>
  );
}


