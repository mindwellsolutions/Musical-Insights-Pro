/**
 * Key Detection Engine
 * Manages real-time musical key detection using Essentia.js
 *
 * Architecture:
 * - AudioWorklet captures audio in real-time
 * - Essentia.js analyzer runs in main thread (import() not allowed in WorkletGlobalScope)
 * - Audio data is sent from worklet to main thread for analysis
 */

import { AudioDeviceManager } from './audioDeviceManager';
import { EssentiaAnalyzer } from './essentiaAnalyzer';

export interface KeyDetectionResult {
  key: string;
  scale: 'major' | 'minor';
  confidence: number;
  rawKey: string;
  timestamp: number;
}

export interface KeyDetectionEngineOptions {
  onKeyDetected?: (result: KeyDetectionResult) => void;
  onError?: (error: Error) => void;
  onInitialized?: () => void;
  debounceMs?: number;
  minConfidence?: number;
  bufferDuration?: number; // Duration in seconds for audio buffer analysis
}

export class KeyDetectionEngine {
  private audioDeviceManager: AudioDeviceManager;
  private audioWorkletNode: AudioWorkletNode | null = null;
  private essentiaAnalyzer: EssentiaAnalyzer | null = null;
  private isRunning: boolean = false;
  private lastDetectedKey: string | null = null;
  private lastDetectionTime: number = 0;
  private debounceTimer: NodeJS.Timeout | null = null;

  constructor(
    audioDeviceManager: AudioDeviceManager,
    private options: KeyDetectionEngineOptions = {}
  ) {
    this.audioDeviceManager = audioDeviceManager;
    this.options = {
      debounceMs: 100, // Wait 100ms before reporting a new key (faster updates)
      minConfidence: 0.25, // Lower confidence threshold to detect more keys
      ...options,
    };
  }
  
  /**
   * Initialize the key detection engine
   */
  async initialize(): Promise<void> {
    try {
      const audioContext = await this.audioDeviceManager.initializeAudioContext();

      if (!audioContext) {
        throw new Error('Failed to initialize audio context');
      }

      // Initialize Essentia.js analyzer in main thread
      this.essentiaAnalyzer = new EssentiaAnalyzer();
      await this.essentiaAnalyzer.waitForInitialization();

      // Load the AudioWorklet module (for audio capture only)
      await audioContext.audioWorklet.addModule('/audio-worklets/essentia-key-detector.js');

      // Create AudioWorklet node
      this.audioWorkletNode = new AudioWorkletNode(
        audioContext,
        'essentia-key-detector-processor'
      );

      // Set up message handling
      this.audioWorkletNode.port.onmessage = (event) => {
        this.handleWorkletMessage(event.data);
      };

      // Send sample rate to worklet
      this.audioWorkletNode.port.postMessage({
        type: 'setSampleRate',
        sampleRate: audioContext.sampleRate,
      });

      // Send buffer duration to worklet if specified
      if (this.options.bufferDuration) {
        this.audioWorkletNode.port.postMessage({
          type: 'setBufferDuration',
          duration: this.options.bufferDuration,
        });
      }

      console.log('Key detection engine initialized');
    } catch (error) {
      console.error('Failed to initialize key detection engine:', error);
      if (this.options.onError) {
        this.options.onError(error as Error);
      }
      throw error;
    }
  }
  
  /**
   * Start key detection
   */
  async start(deviceId?: string): Promise<void> {
    try {
      if (this.isRunning) {
        console.warn('Key detection is already running');
        return;
      }
      
      // Initialize if not already done
      if (!this.audioWorkletNode) {
        await this.initialize();
      }
      
      // Start audio input
      const sourceNode = await this.audioDeviceManager.startAudioInput(deviceId);
      
      if (!this.audioWorkletNode) {
        throw new Error('AudioWorklet node not initialized');
      }
      
      const audioContext = this.audioDeviceManager.getAudioContext();
      if (!audioContext) {
        throw new Error('Audio context not available');
      }
      
      // Connect audio graph: source -> worklet (no playback to prevent feedback loop)
      sourceNode.connect(this.audioWorkletNode);
      // DO NOT connect to destination - we only want to analyze, not play back the audio
      
      this.isRunning = true;
      console.log('Key detection started');
    } catch (error) {
      console.error('Failed to start key detection:', error);
      if (this.options.onError) {
        this.options.onError(error as Error);
      }
      throw error;
    }
  }
  
  /**
   * Update buffer duration
   */
  setBufferDuration(duration: number): void {
    this.options.bufferDuration = duration;
    if (this.audioWorkletNode) {
      this.audioWorkletNode.port.postMessage({
        type: 'setBufferDuration',
        duration: duration,
      });
      console.log(`Buffer duration updated to ${duration} seconds`);
    }
  }

  /**
   * Stop key detection
   */
  async stop(): Promise<void> {
    try {
      if (!this.isRunning) {
        return;
      }

      // Clear debounce timer
      if (this.debounceTimer) {
        clearTimeout(this.debounceTimer);
        this.debounceTimer = null;
      }

      // Disconnect audio worklet
      if (this.audioWorkletNode) {
        this.audioWorkletNode.disconnect();
      }

      // Stop audio input
      await this.audioDeviceManager.stopAudioInput();

      this.isRunning = false;
      this.lastDetectedKey = null;

      console.log('Key detection stopped');
    } catch (error) {
      console.error('Failed to stop key detection:', error);
      if (this.options.onError) {
        this.options.onError(error as Error);
      }
    }
  }
  
  /**
   * Handle messages from the AudioWorklet
   */
  private async handleWorkletMessage(data: any): Promise<void> {
    switch (data.type) {
      case 'initialized':
        console.log('Audio capture initialized:', data.version);
        if (this.options.onInitialized) {
          this.options.onInitialized();
        }
        break;

      case 'audioData':
        // Process audio data with Essentia.js in main thread
        await this.processAudioData(data.audioData, data.sampleRate);
        break;

      case 'error':
        console.error('AudioWorklet error:', data.message);
        if (this.options.onError) {
          this.options.onError(new Error(data.message));
        }
        break;

      default:
        console.warn('Unknown message type from AudioWorklet:', data.type);
    }
  }

  /**
   * Process audio data with Essentia.js
   */
  private async processAudioData(audioData: Float32Array, sampleRate: number): Promise<void> {
    if (!this.essentiaAnalyzer) {
      console.warn('Essentia analyzer not initialized');
      return;
    }

    try {
      const detection = await this.essentiaAnalyzer.detectKey(audioData);

      if (detection) {
        // Add timestamp
        const result: KeyDetectionResult = {
          ...detection,
          timestamp: Date.now()
        };

        this.handleKeyDetection(result);
      }
    } catch (error) {
      console.error('Error processing audio data:', error);
      if (this.options.onError) {
        this.options.onError(error as Error);
      }
    }
  }
  
  /**
   * Handle key detection result - report every detection (every 1 second)
   */
  private handleKeyDetection(result: KeyDetectionResult): void {
    // Filter by minimum confidence
    if (result.confidence < (this.options.minConfidence || 0)) {
      console.log('Key detection below confidence threshold:', result.key, 'Confidence:', result.confidence.toFixed(2));
      return;
    }

    // Always report the detection (every 1 second from worklet)
    // This ensures the UI updates in real-time as the key changes
    this.reportKeyDetection(result);
  }
  
  /**
   * Report key detection to callback
   */
  private reportKeyDetection(result: KeyDetectionResult): void {
    this.lastDetectedKey = result.key;
    this.lastDetectionTime = Date.now();
    
    console.log('Key detected:', result.key, 'Confidence:', result.confidence.toFixed(2));
    
    if (this.options.onKeyDetected) {
      this.options.onKeyDetected(result);
    }
  }
  
  /**
   * Check if detection is running
   */
  isDetectionRunning(): boolean {
    return this.isRunning;
  }
  
  /**
   * Get last detected key
   */
  getLastDetectedKey(): string | null {
    return this.lastDetectedKey;
  }
  
  /**
   * Cleanup and release resources
   */
  async cleanup(): Promise<void> {
    await this.stop();

    if (this.audioWorkletNode) {
      this.audioWorkletNode.port.onmessage = null;
      this.audioWorkletNode = null;
    }

    if (this.essentiaAnalyzer) {
      this.essentiaAnalyzer.destroy();
      this.essentiaAnalyzer = null;
    }
  }
}

