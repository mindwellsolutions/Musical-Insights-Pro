/**
 * Type definitions for audio-related functionality
 */

/**
 * Audio device information
 */
export interface AudioDevice {
  deviceId: string;
  label: string;
  kind: MediaDeviceKind;
  groupId: string;
}

/**
 * Detected note information
 */
export interface DetectedNote {
  note: string | null;
  frequency: number | null;
  confidence: number;
}

/**
 * Pitch detection configuration
 */
export interface PitchDetectorConfig {
  sampleRate: number;
  bufferSize: number;
  minFrequency: number;
  maxFrequency: number;
}

/**
 * Audio device selector component props
 */
export interface AudioDeviceSelectorProps {
  onDeviceSelect: (deviceId: string) => void;
  selectedDeviceId?: string;
  className?: string;
}

/**
 * Note display component props
 */
export interface NoteDisplayProps {
  note: string | null;
  frequency: number | null;
  isActive: boolean;
  className?: string;
}

/**
 * Pitch detector hook return type
 */
export interface UsePitchDetectorReturn {
  note: string | null;
  frequency: number | null;
  isActive: boolean;
  startDetection: (deviceId: string) => Promise<void>;
  stopDetection: () => void;
  error: string | null;
}

/**
 * Audio processing state
 */
export interface AudioProcessingState {
  audioContext: AudioContext | null;
  mediaStream: MediaStream | null;
  analyserNode: AnalyserNode | null;
  sourceNode: MediaStreamAudioSourceNode | null;
  isProcessing: boolean;
}

