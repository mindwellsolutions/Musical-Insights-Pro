/**
 * Audio Worklet Processor for Real-Time Audio Capture
 * This worklet captures audio and sends it to main thread for Essentia.js analysis
 *
 * Note: We can't load Essentia.js here because import() is disallowed in WorkletGlobalScope
 * So we just capture audio and send it to the main thread for processing
 */

class EssentiaKeyDetectorProcessor extends AudioWorkletProcessor {
  constructor() {
    super();

    this.isInitialized = true; // Simple audio capture is always ready
    this.sampleRate = 44100; // Will be updated from actual sample rate
    this.bufferDurationSeconds = 5; // Default 5 seconds, can be updated from main thread
    this.bufferSize = this.sampleRate * this.bufferDurationSeconds; // Calculate buffer size
    this.audioBuffer = [];
    this.sampleCounter = 0;

    // Notify main thread that we're ready
    this.port.postMessage({
      type: 'initialized',
      version: 'audio-capture-1.0'
    });

    // Listen for messages from main thread
    this.port.onmessage = (event) => {
      if (event.data.type === 'setSampleRate') {
        this.sampleRate = event.data.sampleRate;
        this.bufferSize = this.sampleRate * this.bufferDurationSeconds;
      } else if (event.data.type === 'setBufferDuration') {
        this.bufferDurationSeconds = event.data.duration;
        this.bufferSize = this.sampleRate * this.bufferDurationSeconds;
        // Clear existing buffer when duration changes
        this.audioBuffer = [];
        this.sampleCounter = 0;
        console.log(`Buffer duration set to ${this.bufferDurationSeconds} seconds (${this.bufferSize} samples)`);
      }
    };
  }
  

  
  /**
   * Process audio input
   * This is called automatically by the Web Audio API for each audio block
   */
  process(inputs, outputs, parameters) {
    const input = inputs[0];

    if (!input || !input[0]) {
      return true; // Keep processor alive
    }

    const inputChannel = input[0];

    // Accumulate audio samples into buffer
    for (let i = 0; i < inputChannel.length; i++) {
      this.audioBuffer.push(inputChannel[i]);
    }

    // Check if we've accumulated the full buffer duration of audio
    if (this.audioBuffer.length >= this.bufferSize) {
      // Create a buffer with EXACTLY the specified duration of audio
      const analysisBuffer = new Float32Array(this.audioBuffer.slice(0, this.bufferSize));

      // Send the complete audio buffer to main thread for Essentia.js KeyExtractor analysis
      this.port.postMessage({
        type: 'audioData',
        audioData: analysisBuffer,
        sampleRate: this.sampleRate,
        bufferDuration: this.bufferDurationSeconds
      });

      // Clear the buffer and start collecting the next buffer
      this.audioBuffer = [];
      this.sampleCounter = 0;

      console.log(`Sent ${this.bufferDurationSeconds}-second audio buffer (${this.bufferSize} samples) for key detection analysis`);
    }

    // Pass through audio (optional - for monitoring)
    const output = outputs[0];
    if (output && output[0]) {
      output[0].set(inputChannel);
    }

    return true; // Keep processor alive
  }
}

// Register the processor
registerProcessor('essentia-key-detector-processor', EssentiaKeyDetectorProcessor);

