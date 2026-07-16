/**
 * Essentia.js Analyzer
 * Runs Essentia.js key detection in the main thread
 *
 * This is loaded in the main thread (not AudioWorklet) because
 * import() is disallowed in WorkletGlobalScope
 */

export interface KeyDetectionResult {
  key: string;
  scale: 'major' | 'minor';
  confidence: number;
  rawKey: string;
}

export class EssentiaAnalyzer {
  private essentia: any = null;
  private Essentia: any = null;
  private isInitialized: boolean = false;
  private initPromise: Promise<void> | null = null;

  constructor() {
    // Start initialization but don't wait for it
    this.initPromise = this.initialize();
  }

  /**
   * Initialize Essentia.js by loading from CDN
   * Uses script injection to avoid Next.js bundling issues
   */
  private async initialize(): Promise<void> {
    // Only run in browser
    if (typeof window === 'undefined') {
      console.warn('Essentia.js can only be initialized in browser');
      return;
    }

    try {
      // Load Essentia.js from CDN by injecting a script tag
      // This avoids Next.js trying to bundle the external module
      await this.loadEssentiaFromCDN();

      // Access the global Essentia objects
      const win = window as any;
      if (!win.EssentiaExtractor || !win.EssentiaModule) {
        throw new Error('EssentiaExtractor failed to load from CDN');
      }

      // Create EssentiaExtractor instance with WASM module (already initialized)
      // EssentiaExtractor provides high-level feature extraction methods like KeyExtractor
      this.essentia = new win.EssentiaExtractor(win.EssentiaModule);
      this.isInitialized = true;
      console.log('EssentiaExtractor initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Essentia.js analyzer:', error);
      throw error;
    }
  }

  /**
   * Load Essentia.js from CDN using script injection
   * Uses the web build which is designed for browser use
   */
  private loadEssentiaFromCDN(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Check if already loaded
      if ((window as any).EssentiaExtractor && (window as any).EssentiaModule) {
        resolve();
        return;
      }

      // Load WASM module first
      const wasmScript = document.createElement('script');
      wasmScript.src = 'https://cdn.jsdelivr.net/npm/essentia.js@0.1.3/dist/essentia-wasm.web.js';
      wasmScript.onload = () => {
        // WASM module loaded, now load Essentia core
        // Use a Blob URL to avoid template literal parsing issues
        const moduleCode = [
          'import Essentia from "https://cdn.jsdelivr.net/npm/essentia.js@0.1.3/dist/essentia.js-core.es.js";',
          'import EssentiaExtractor from "https://cdn.jsdelivr.net/npm/essentia.js@0.1.3/dist/essentia.js-extractor.es.js";',
          '',
          'if (typeof EssentiaWASM !== "undefined") {',
          '  EssentiaWASM().then(wasmModule => {',
          '    window.Essentia = Essentia;',
          '    window.EssentiaExtractor = EssentiaExtractor;',
          '    window.EssentiaModule = wasmModule;',
          '    window.essentiaLoaded = true;',
          '  }).catch(err => {',
          '    console.error("Failed to initialize WASM:", err);',
          '    window.essentiaLoadError = err;',
          '  });',
          '} else {',
          '  window.essentiaLoadError = "EssentiaWASM not found";',
          '}'
        ].join('\n');

        const blob = new Blob([moduleCode], { type: 'text/javascript' });
        const blobUrl = URL.createObjectURL(blob);

        const coreScript = document.createElement('script');
        coreScript.type = 'module';
        coreScript.src = blobUrl;

        coreScript.onload = () => {
          // Clean up blob URL after script loads
          URL.revokeObjectURL(blobUrl);
        };

        coreScript.onerror = () => {
          URL.revokeObjectURL(blobUrl);
          reject(new Error('Failed to load Essentia core from CDN'));
        };

        document.head.appendChild(coreScript);
      };

      wasmScript.onerror = () => {
        reject(new Error('Failed to load Essentia WASM from CDN'));
      };

      // Wait for initialization
      const checkLoaded = setInterval(() => {
        const win = window as any;
        if (win.essentiaLoaded) {
          clearInterval(checkLoaded);
          resolve();
        } else if (win.essentiaLoadError) {
          clearInterval(checkLoaded);
          reject(new Error('WASM initialization failed: ' + win.essentiaLoadError));
        }
      }, 100);

      // Timeout after 10 seconds
      setTimeout(() => {
        clearInterval(checkLoaded);
        reject(new Error('Timeout loading Essentia.js from CDN'));
      }, 10000);

      // Start loading
      document.head.appendChild(wasmScript);
    });
  }

  /**
   * Wait for initialization to complete
   */
  async waitForInitialization(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    // Wait for the initialization promise
    if (this.initPromise) {
      await this.initPromise;
    }

    if (!this.isInitialized) {
      throw new Error('Essentia.js initialization failed');
    }
  }

  /**
   * Detect musical key from audio data
   *
   * This method replicates the exact approach from the working reference project:
   * 1. Downsamples audio to 16kHz (Essentia's KeyExtractor works best at 16kHz)
   * 2. Uses KeyExtractor with 'bgate' profile (best for general music)
   * 3. Returns key, scale, and strength
   */
  async detectKey(audioData: Float32Array): Promise<KeyDetectionResult | null> {
    if (!this.isInitialized || !this.essentia) {
      console.warn('Essentia.js not initialized yet');
      return null;
    }

    try {
      // Check if we have enough audio data (at least 2 seconds for reliable key detection)
      const originalSampleRate = 44100;
      if (audioData.length < 88200) { // 2 seconds at 44.1kHz
        console.warn('Not enough audio data for key detection. Need at least 2 seconds, got',
                     (audioData.length / originalSampleRate).toFixed(2), 'seconds');
        return null;
      }

      const durationSeconds = (audioData.length / originalSampleRate).toFixed(2);
      console.log(`🎵 Analyzing ${durationSeconds} seconds of audio (${audioData.length} samples)`);

      // Step 1: Downsample to 16kHz (Essentia's KeyExtractor is optimized for 16kHz)
      const targetSampleRate = 16000;
      const downsampledAudio = this.downsampleAudio(audioData, originalSampleRate, targetSampleRate);
      console.log(`Downsampled from ${originalSampleRate}Hz to ${targetSampleRate}Hz: ${downsampledAudio.length} samples`);

      // Step 2: Convert to Essentia VectorFloat
      const audioVector = this.essentia.arrayToVector(downsampledAudio);

      // Step 3: Use KeyExtractor with the EXACT parameters from the working reference project
      // Reference: .ref/key-working-ref-project/src/main.js line 83
      // KeyExtractor(signal, averageDetuningCorrection, frameSize, hopSize, hpcpSize,
      //              maxFrequency, maximumSpectralPeaks, minFrequency, pcpThreshold,
      //              profileType, sampleRate, spectralPeaksThreshold, tuningFrequency,
      //              weightType, windowType)
      const keyDetection = this.essentia.KeyExtractor(
        audioVector,
        true,        // averageDetuningCorrection
        4096,        // frameSize
        4096,        // hopSize
        12,          // hpcpSize - 12 bins (1 per semitone)
        3500,        // maxFrequency - analyze up to 3.5kHz
        60,          // maximumSpectralPeaks
        25,          // minFrequency
        0.2,         // pcpThreshold - CRITICAL: 0.2 (not 0.00001)
        'bgate',     // profileType - 'bgate' profile (best for general music)
        16000,       // sampleRate - CRITICAL: 16kHz (not 44.1kHz)
        0.0001,      // spectralPeaksThreshold
        440,         // tuningFrequency
        'cosine',    // weightType
        'hann'       // windowType - 'hann' (not 'blackmanharris92')
      );

      // Extract key and scale from KeyExtractor result
      const detectedKey = keyDetection.key;
      const detectedScale = keyDetection.scale;
      const strength = keyDetection.strength;

      // Format key name to match reference project display
      // Reference displays as "C major" or "A minor"
      const keyName = `${detectedKey} ${detectedScale}`;

      console.log(`✅ Key detected: ${keyName} with confidence ${strength.toFixed(3)}`);

      // Clean up Essentia vectors to prevent memory leaks
      if (audioVector && audioVector.delete) {
        audioVector.delete();
      }

      return {
        key: keyName,
        scale: detectedScale,
        confidence: strength,
        rawKey: detectedKey
      };

    } catch (error) {
      console.error('Error detecting key:', error);
      return null;
    }
  }

  /**
   * Downsample audio array from one sample rate to another
   * This replicates the downsampleArray function from the reference project
   * Reference: .ref/key-working-ref-project/src/audioUtils.js
   */
  private downsampleAudio(audioIn: Float32Array, sampleRateIn: number, sampleRateOut: number): Float32Array {
    if (sampleRateOut === sampleRateIn) {
      return audioIn;
    }

    const sampleRateRatio = sampleRateIn / sampleRateOut;
    const newLength = Math.round(audioIn.length / sampleRateRatio);
    const result = new Float32Array(newLength);
    let offsetResult = 0;
    let offsetAudioIn = 0;

    console.log(`Downsampling to ${sampleRateOut} Hz...`);
    while (offsetResult < result.length) {
      const nextOffsetAudioIn = Math.round((offsetResult + 1) * sampleRateRatio);
      let accum = 0;
      let count = 0;
      for (let i = offsetAudioIn; i < nextOffsetAudioIn && i < audioIn.length; i++) {
        accum += audioIn[i];
        count++;
      }
      result[offsetResult] = accum / count;
      offsetResult++;
      offsetAudioIn = nextOffsetAudioIn;
    }

    return result;
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    if (this.essentia && this.essentia.delete) {
      this.essentia.delete();
    }
    this.essentia = null;
    this.isInitialized = false;
  }
}

