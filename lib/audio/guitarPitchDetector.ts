/**
 * Guitar-Optimized Pitch Detection Engine
 * Uses Pitchy (McLeod Pitch Method) which is specifically designed for musical instruments
 * MPM is superior to YIN for guitar signals with complex harmonics
 */

import { DetectedNote, PitchDetectorConfig, AudioProcessingState } from '@/types/audio';
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
  } catch (err) {
    console.error('Failed to load Pitchy:', err);
    throw new Error('Failed to initialize Pitchy pitch detection library');
  }
}

/**
 * Guitar-optimized configuration for Pitchy
 */
const GUITAR_CONFIG: PitchDetectorConfig = {
  sampleRate: 44100,
  bufferSize: 4096,  // Larger buffer for low guitar frequencies (E2 = 82Hz)
  minFrequency: 70,  // Low E on guitar (82Hz) with some margin
  maxFrequency: 1200, // High notes on guitar
};

export class GuitarPitchDetector {
  private config: PitchDetectorConfig;
  private state: AudioProcessingState;
  private detector: any = null;
  private animationFrameId: number | null = null;
  private onNoteDetected: ((note: DetectedNote) => void) | null = null;
  private inputBuffer: Float32Array;
  private minClarity: number = 0.70; // Pitchy clarity threshold (0-1) - lowered for guitar

  constructor(config: Partial<PitchDetectorConfig> = {}) {
    this.config = { ...GUITAR_CONFIG, ...config };
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
   * Start guitar pitch detection using Pitchy (McLeod Pitch Method)
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

      if (deviceIdOrStream instanceof MediaStream) {
        stream = deviceIdOrStream;
        shouldCloseStream = false;
        console.log('🎸 Guitar Pitch Detector: Using existing MediaStream');
      } else {
        const constraints: MediaStreamConstraints = {
          audio: {
            deviceId: deviceIdOrStream ? { exact: deviceIdOrStream } : undefined,
            echoCancellation: false,
            noiseSuppression: false,
            autoGainControl: false,
          },
        };
        stream = await navigator.mediaDevices.getUserMedia(constraints);
        console.log('🎸 Guitar Pitch Detector: Created new MediaStream');
      }

      this.state.mediaStream = stream;
      this.state.audioContext = new AudioContext();
      const actualSampleRate = this.state.audioContext.sampleRate;
      this.config.sampleRate = actualSampleRate;

      // Create Pitchy detector instance
      this.detector = PitchDetector.forFloat32Array(this.config.bufferSize);

      // Create analyser node with larger FFT for better low-frequency resolution
      this.state.analyserNode = this.state.audioContext.createAnalyser();
      this.state.analyserNode.fftSize = this.config.bufferSize;
      this.state.analyserNode.smoothingTimeConstant = 0.3; // Less smoothing for guitar transients

      // Create source node
      this.state.sourceNode = this.state.audioContext.createMediaStreamSource(stream);

      // Add high-pass filter to remove rumble below 60Hz
      const highPassFilter = this.state.audioContext.createBiquadFilter();
      highPassFilter.type = 'highpass';
      highPassFilter.frequency.value = 60;
      highPassFilter.Q.value = 0.7;

      // Connect: source -> highpass -> analyser
      this.state.sourceNode.connect(highPassFilter);
      highPassFilter.connect(this.state.analyserNode);

      this.onNoteDetected = onNoteDetected;
      (this.state as any).shouldCloseStream = shouldCloseStream;
      this.state.isProcessing = true;
      this.processAudio();

    } catch (err) {
      console.error('Error starting guitar pitch detection:', err);
      await this.stop();
      throw err;
    }
  }

  /**
   * Stop pitch detection and clean up
   */
  async stop(): Promise<void> {
    this.state.isProcessing = false;

    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    if (this.state.sourceNode) {
      this.state.sourceNode.disconnect();
      this.state.sourceNode = null;
    }

    if (this.state.analyserNode) {
      this.state.analyserNode.disconnect();
      this.state.analyserNode = null;
    }

    const shouldCloseStream = (this.state as any).shouldCloseStream !== false;
    if (this.state.mediaStream && shouldCloseStream) {
      console.log('🎸 Guitar Pitch Detector: Stopping MediaStream tracks');
      this.state.mediaStream.getTracks().forEach(track => track.stop());
    } else if (this.state.mediaStream) {
      console.log('🎸 Guitar Pitch Detector: Not stopping MediaStream tracks (shared stream)');
    }
    this.state.mediaStream = null;

    if (this.state.audioContext) {
      await this.state.audioContext.close();
      this.state.audioContext = null;
    }

    this.onNoteDetected = null;
  }

  /**
   * Calculate RMS (Root Mean Square) for noise gating
   */
  private calculateRMS(buffer: Float32Array): number {
    let sum = 0;
    for (let i = 0; i < buffer.length; i++) {
      sum += buffer[i] * buffer[i];
    }
    return Math.sqrt(sum / buffer.length);
  }

  /**
   * Process audio and detect pitch using Pitchy (McLeod Pitch Method)
   */
  private processAudio = (): void => {
    if (!this.state.isProcessing || !this.state.analyserNode || !this.detector) {
      return;
    }

    // Get time domain data
    this.state.analyserNode.getFloatTimeDomainData(this.inputBuffer);

    // Noise gate - ignore weak signals
    const rms = this.calculateRMS(this.inputBuffer);
    const noiseGateThreshold = 0.005; // Lowered for guitar (was 0.01)

    if (rms < noiseGateThreshold) {
      // Signal too weak - skip detection
      if (this.onNoteDetected) {
        this.onNoteDetected({ note: null, frequency: null, confidence: 0 });
      }
      this.animationFrameId = requestAnimationFrame(this.processAudio);
      return;
    }

    // Detect pitch using Pitchy (McLeod Pitch Method)
    // Returns [frequency, clarity] where clarity is 0-1
    const [frequency, clarity] = this.detector.findPitch(this.inputBuffer, this.config.sampleRate);

    // Process detected frequency
    if (
      frequency &&
      clarity >= this.minClarity &&
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

  isActive(): boolean {
    return this.state.isProcessing;
  }
}
