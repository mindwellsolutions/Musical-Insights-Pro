/**
 * Pitchy-based Pitch Detection Engine
 * Uses the McLeod Pitch Method (MPM) which is specifically designed for musical instruments
 * Better for guitar detection than YIN algorithm
 */

import { DetectedNote, AudioProcessingState } from '@/types/audio';
import { frequencyToNoteName } from './frequencyToNote';

// Pitchy will be dynamically imported (ESM-only)
let PitchDetector: any = null;

/**
 * Initialize Pitchy library (client-side only)
 */
async function initializePitchy() {
  if (PitchDetector) return;

  try {
    const pitchy = await import('pitchy');
    PitchDetector = pitchy.PitchDetector;
    console.log('Pitchy library loaded successfully');
  } catch (err) {
    console.error('Failed to load Pitchy:', err);
    throw new Error('Failed to initialize Pitchy pitch detection library');
  }
}

/**
 * Configuration for Pitchy-based pitch detection
 * Optimized for guitar signals
 */
interface PitchyDetectorConfig {
  sampleRate: number;
  bufferSize: number;      // Input buffer size for analysis
  minClarity: number;      // Minimum clarity threshold (0-1)
  minFrequency: number;    // Minimum frequency to detect (Hz)
  maxFrequency: number;    // Maximum frequency to detect (Hz)
}

/**
 * Default configuration optimized for guitar
 */
const DEFAULT_CONFIG: PitchyDetectorConfig = {
  sampleRate: 44100,
  bufferSize: 4096,        // Larger buffer for better low-frequency detection (guitar E2 = 82.41 Hz)
  minClarity: 0.85,        // Higher threshold to filter out noise (MPM clarity is more reliable)
  minFrequency: 70,        // Below low E on guitar (82.41 Hz) with some margin
  maxFrequency: 1500,      // Above high notes on guitar with harmonics
};

/**
 * PitchyDetector class
 * Manages Web Audio API and Pitchy pitch detection
 */
export class PitchyDetector {
  private config: PitchyDetectorConfig;
  private state: AudioProcessingState;
  private detector: any;
  private animationFrameId: number | null = null;
  private onNoteDetected: ((note: DetectedNote) => void) | null = null;
  private inputBuffer: Float32Array;

  constructor(config: Partial<PitchyDetectorConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.state = {
      audioContext: null,
      mediaStream: null,
      analyserNode: null,
      sourceNode: null,
      isProcessing: false,
    };
    this.inputBuffer = new Float32Array(this.config.bufferSize);
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
      // Initialize Pitchy
      await initializePitchy();

      let stream: MediaStream;
      let shouldCloseStream = true;

      // Check if we received an existing MediaStream or a device ID
      if (deviceIdOrStream instanceof MediaStream) {
        stream = deviceIdOrStream;
        shouldCloseStream = false;
        console.log('PitchyDetector: Using existing MediaStream');
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
        console.log('PitchyDetector: Created new MediaStream for device:', deviceIdOrStream);
      }

      this.state.mediaStream = stream;

      // Create audio context
      this.state.audioContext = new AudioContext();
      const actualSampleRate = this.state.audioContext.sampleRate;

      // Update config to use actual sample rate
      this.config.sampleRate = actualSampleRate;

      // Create Pitchy detector instance
      // Use Float32Array for better performance
      this.detector = PitchDetector.forFloat32Array(this.config.bufferSize);
      console.log(`PitchyDetector initialized: buffer=${this.config.bufferSize}, sampleRate=${actualSampleRate}`);

      // Create analyser node
      this.state.analyserNode = this.state.audioContext.createAnalyser();
      this.state.analyserNode.fftSize = this.config.bufferSize;
      this.state.analyserNode.smoothingTimeConstant = 0.3; // Less smoothing for faster response

      // Create source node from media stream
      this.state.sourceNode = this.state.audioContext.createMediaStreamSource(stream);
      this.state.sourceNode.connect(this.state.analyserNode);

      // Set callback
      this.onNoteDetected = onNoteDetected;

      // Store whether we should close the stream on stop
      (this.state as any).shouldCloseStream = shouldCloseStream;

      // Start processing
      this.state.isProcessing = true;
      this.processAudio();
    } catch (err) {
      console.error('Error starting Pitchy pitch detection:', err);
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
      console.log('PitchyDetector: Stopping MediaStream tracks (we created it)');
      this.state.mediaStream.getTracks().forEach(track => track.stop());
    } else if (this.state.mediaStream) {
      console.log('PitchyDetector: Not stopping MediaStream tracks (shared stream)');
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
   * Process audio and detect pitch in real-time using Pitchy (MPM algorithm)
   */
  private processAudio = (): void => {
    if (!this.state.isProcessing || !this.state.analyserNode || !this.detector) {
      return;
    }

    // Get time domain data
    this.state.analyserNode.getFloatTimeDomainData(this.inputBuffer);

    // Detect pitch using Pitchy (McLeod Pitch Method)
    // Returns [frequency, clarity] where clarity is 0-1
    const [frequency, clarity] = this.detector.findPitch(this.inputBuffer, this.config.sampleRate);

    // Process detected frequency
    if (
      frequency &&
      clarity >= this.config.minClarity &&
      frequency >= this.config.minFrequency &&
      frequency <= this.config.maxFrequency
    ) {
      const note = frequencyToNoteName(frequency);
      const detectedNote: DetectedNote = {
        note,
        frequency,
        confidence: clarity, // Pitchy provides clarity (0-1)
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

