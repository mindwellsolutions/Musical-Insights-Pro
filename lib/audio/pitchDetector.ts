/**
 * Pitch Detection Engine
 * Uses Web Audio API and pitchfinder (YIN algorithm) for real-time pitch detection
 */

import { DetectedNote, PitchDetectorConfig, AudioProcessingState } from '@/types/audio';
import { frequencyToNoteName } from './frequencyToNote';

// Dynamic import for pitchfinder (client-side only)
let Pitchfinder: any = null;

/**
 * Initialize pitchfinder library
 */
async function initializePitchfinder() {
  if (Pitchfinder) return;

  try {
    Pitchfinder = (await import('pitchfinder')).default;
  } catch (err) {
    console.error('Failed to load pitchfinder:', err);
    throw new Error('Failed to initialize pitch detection library');
  }
}

/**
 * Default pitch detector configuration
 * Optimized for guitar detection with complex harmonic content
 */
const DEFAULT_CONFIG: PitchDetectorConfig = {
  sampleRate: 44100,
  bufferSize: 4096,  // Larger buffer for better low-frequency detection (guitar E2 = 82Hz)
  minFrequency: 40,  // E1 (bass guitar low E)
  maxFrequency: 1200, // D#6 (high guitar notes)
};

/**
 * PitchDetector class
 * Manages Web Audio API and pitch detection
 */
export class PitchDetector {
  private config: PitchDetectorConfig;
  private state: AudioProcessingState;
  private detector: any;
  private animationFrameId: number | null = null;
  private onNoteDetected: ((note: DetectedNote) => void) | null = null;
  private debugMode: boolean = false;
  private debugCounter: number = 0;

  constructor(config: Partial<PitchDetectorConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.state = {
      audioContext: null,
      mediaStream: null,
      analyserNode: null,
      sourceNode: null,
      isProcessing: false,
    };
  }

  /**
   * Enable debug logging (logs every 30 frames to avoid spam)
   */
  enableDebug(enabled: boolean = true): void {
    this.debugMode = enabled;
    console.log(`PitchDetector debug mode: ${enabled ? 'ON' : 'OFF'}`);
  }

  /**
   * Start pitch detection with specified audio device or existing stream
   * @param deviceIdOrStream - Either a device ID string or an existing MediaStream
   * @param onNoteDetected - Callback for detected notes
   */
  async start(deviceIdOrStream: string | MediaStream, onNoteDetected: (note: DetectedNote) => void): Promise<void> {
    if (this.state.isProcessing) {
      await this.stop();
    }

    try {
      // Initialize pitchfinder
      await initializePitchfinder();

      let stream: MediaStream;
      let shouldCloseStream = true;

      // Check if we received an existing MediaStream or a device ID
      if (deviceIdOrStream instanceof MediaStream) {
        // Use existing stream (don't close it when stopping)
        stream = deviceIdOrStream;
        shouldCloseStream = false;
        console.log('PitchDetector: Using existing MediaStream');
      } else {
        // Request audio stream from specified device
        const constraints: MediaStreamConstraints = {
          audio: {
            deviceId: deviceIdOrStream ? { exact: deviceIdOrStream } : undefined,
            echoCancellation: false,
            noiseSuppression: false,
            autoGainControl: false,
          },
        };

        stream = await navigator.mediaDevices.getUserMedia(constraints);
        console.log('PitchDetector: Created new MediaStream for device:', deviceIdOrStream);
      }

      this.state.mediaStream = stream;

      // Create audio context - use default sample rate instead of forcing 44100
      this.state.audioContext = new AudioContext();
      const actualSampleRate = this.state.audioContext.sampleRate;

      // Update config to use actual sample rate
      this.config.sampleRate = actualSampleRate;

      // Create analyser node with guitar-optimized settings
      this.state.analyserNode = this.state.audioContext.createAnalyser();
      this.state.analyserNode.fftSize = this.config.bufferSize;
      this.state.analyserNode.smoothingTimeConstant = 0.3; // Less smoothing for guitar transients

      // Create source node from media stream
      this.state.sourceNode = this.state.audioContext.createMediaStreamSource(stream);

      // Add a high-pass filter to remove low-frequency noise (below 60Hz)
      // This helps with guitar detection by removing rumble and handling noise
      const highPassFilter = this.state.audioContext.createBiquadFilter();
      highPassFilter.type = 'highpass';
      highPassFilter.frequency.value = 60; // Cut below 60Hz
      highPassFilter.Q.value = 0.7;

      // Connect: source -> highpass filter -> analyser
      this.state.sourceNode.connect(highPassFilter);
      highPassFilter.connect(this.state.analyserNode);

      // Initialize YIN detector with guitar-optimized settings
      // YIN is better for guitar than autocorrelation due to harmonic handling
      if (!Pitchfinder || !Pitchfinder.YIN) {
        throw new Error('Pitchfinder.YIN not available');
      }

      this.detector = Pitchfinder.YIN({
        sampleRate: actualSampleRate,
        threshold: 0.15, // Higher threshold for guitar (less false positives from harmonics)
        probabilityThreshold: 0.1, // Additional filtering
      });

      // Set callback
      this.onNoteDetected = onNoteDetected;

      // Store whether we should close the stream on stop
      (this.state as any).shouldCloseStream = shouldCloseStream;

      // Start processing
      this.state.isProcessing = true;
      this.processAudio();
    } catch (err) {
      console.error('Error starting pitch detection:', err);
      await this.stop();
      throw err;
    }
  }

  /**
   * Stop pitch detection and clean up resources
   */
  async stop(): Promise<void> {
    this.state.isProcessing = false;

    // Cancel animation frame
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    // Disconnect and close audio nodes
    if (this.state.sourceNode) {
      this.state.sourceNode.disconnect();
      this.state.sourceNode = null;
    }

    if (this.state.analyserNode) {
      this.state.analyserNode.disconnect();
      this.state.analyserNode = null;
    }

    // Stop media stream tracks ONLY if we created the stream ourselves
    const shouldCloseStream = (this.state as any).shouldCloseStream !== false;
    if (this.state.mediaStream && shouldCloseStream) {
      console.log('PitchDetector: Stopping MediaStream tracks (we created it)');
      this.state.mediaStream.getTracks().forEach(track => track.stop());
    } else if (this.state.mediaStream) {
      console.log('PitchDetector: Not stopping MediaStream tracks (shared stream)');
    }
    this.state.mediaStream = null;

    // Close audio context
    if (this.state.audioContext) {
      await this.state.audioContext.close();
      this.state.audioContext = null;
    }

    this.onNoteDetected = null;
  }

  /**
   * Calculate RMS (Root Mean Square) of audio buffer
   * Used for noise gating - ignore signals below threshold
   */
  private calculateRMS(buffer: Float32Array): number {
    let sum = 0;
    for (let i = 0; i < buffer.length; i++) {
      sum += buffer[i] * buffer[i];
    }
    return Math.sqrt(sum / buffer.length);
  }

  /**
   * Process audio and detect pitch in real-time
   * Optimized for guitar with noise gating and harmonic filtering
   */
  private processAudio = (): void => {
    if (!this.state.isProcessing || !this.state.analyserNode || !this.detector) {
      return;
    }

    // Get time domain data
    const bufferLength = this.state.analyserNode.fftSize;
    const buffer = new Float32Array(bufferLength);
    this.state.analyserNode.getFloatTimeDomainData(buffer);

    // Calculate RMS for noise gating
    const rms = this.calculateRMS(buffer);
    const noiseGateThreshold = 0.01; // Ignore signals below this RMS level

    // Debug logging (every 30 frames to avoid spam)
    if (this.debugMode && this.debugCounter++ % 30 === 0) {
      console.log(`[PitchDetector] RMS: ${rms.toFixed(4)}, Threshold: ${noiseGateThreshold}`);
    }

    // If signal is too weak, don't try to detect pitch
    if (rms < noiseGateThreshold) {
      if (this.onNoteDetected) {
        this.onNoteDetected({
          note: null,
          frequency: null,
          confidence: 0,
        });
      }
      this.animationFrameId = requestAnimationFrame(this.processAudio);
      return;
    }

    // Detect pitch using YIN algorithm
    let frequency: number | null = null;
    try {
      frequency = this.detector(buffer);

      // Debug logging
      if (this.debugMode && this.debugCounter % 30 === 0) {
        console.log(`[PitchDetector] Detected frequency: ${frequency ? frequency.toFixed(2) + ' Hz' : 'null'}`);
      }
    } catch (err) {
      console.error('Error in YIN detector:', err);
    }

    // Process detected frequency with validation
    if (frequency && frequency >= this.config.minFrequency && frequency <= this.config.maxFrequency) {
      // Additional validation: Check if frequency is reasonable for guitar
      // Guitar range: E2 (82.41 Hz) to E6 (1318.51 Hz)
      // We're being more permissive with the range to catch all notes

      const note = frequencyToNoteName(frequency);

      // Calculate confidence based on RMS (stronger signal = higher confidence)
      const confidence = Math.min(1.0, rms * 20); // Scale RMS to 0-1 range

      const detectedNote: DetectedNote = {
        note,
        frequency,
        confidence,
      };

      if (this.onNoteDetected) {
        this.onNoteDetected(detectedNote);
      }
    } else {
      // No valid pitch detected
      if (this.onNoteDetected) {
        this.onNoteDetected({
          note: null,
          frequency: null,
          confidence: 0,
        });
      }
    }

    // Continue processing
    this.animationFrameId = requestAnimationFrame(this.processAudio);
  };

  /**
   * Check if detector is currently processing
   */
  isActive(): boolean {
    return this.state.isProcessing;
  }
}

