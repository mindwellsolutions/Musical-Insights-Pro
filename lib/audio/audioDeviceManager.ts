/**
 * Audio Device Manager
 * Manages audio input devices (microphone, system audio) for key detection
 */

export interface AudioDevice {
  deviceId: string;
  label: string;
  kind: MediaDeviceKind | 'audiooutput';
  groupId: string;
  isSystemAudio?: boolean; // Flag for system audio loopback
}

export interface AudioDeviceManagerOptions {
  sampleRate?: number;
  channelCount?: number;
  echoCancellation?: boolean;
  noiseSuppression?: boolean;
  autoGainControl?: boolean;
}

export class AudioDeviceManager {
  private audioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;
  private devices: AudioDevice[] = [];
  
  constructor(private options: AudioDeviceManagerOptions = {}) {
    this.options = {
      sampleRate: 44100,
      channelCount: 1,
      echoCancellation: false,
      noiseSuppression: false,
      autoGainControl: false,
      ...options,
    };
  }
  
  /**
   * Initialize audio context
   */
  async initializeAudioContext(): Promise<AudioContext> {
    if (this.audioContext) {
      return this.audioContext;
    }

    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;

    if (!AudioContextClass) {
      throw new Error('Web Audio API is not supported in this browser');
    }

    this.audioContext = new AudioContextClass({
      sampleRate: this.options.sampleRate,
    });

    // Resume context if suspended (required by some browsers)
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }

    return this.audioContext;
  }

  /**
   * Request microphone permission
   * This should be called from a user interaction (button click, etc.)
   */
  async requestMicrophonePermission(): Promise<boolean> {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.warn('getUserMedia not supported');
        return false;
      }

      // Request permission by getting a stream and immediately stopping it
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (error) {
      console.error('Microphone permission denied:', error);
      return false;
    }
  }

  /**
   * Get list of available audio input devices
   * Note: This will only return device labels if permission has been granted
   */
  async getAudioInputDevices(): Promise<AudioDevice[]> {
    try {
      // Check if mediaDevices API is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
        console.warn('MediaDevices API not available. This may be due to:');
        console.warn('- Running in non-secure context (use HTTPS or localhost)');
        console.warn('- Browser does not support getUserMedia');
        console.warn('- Permissions blocked by browser settings');

        // Return empty array with system audio options only
        return [
          {
            deviceId: 'system-audio-set-source',
            label: 'System Audio - Set Source',
            kind: 'audioinput',
            groupId: '',
            isSystemAudio: true,
          },
          {
            deviceId: 'system-audio-last-source',
            label: 'System Audio - Last Source',
            kind: 'audioinput',
            groupId: '',
            isSystemAudio: true,
          },
        ];
      }

      // Get all devices (without requesting permission)
      // Note: Device labels will be empty until permission is granted
      const devices = await navigator.mediaDevices.enumerateDevices();

      // Filter for audio input devices
      this.devices = devices
        .filter(device => device.kind === 'audioinput')
        .map(device => ({
          deviceId: device.deviceId,
          label: device.label || `Microphone ${device.deviceId.slice(0, 8)}`,
          kind: device.kind,
          groupId: device.groupId,
          isSystemAudio: false,
        }));

      // Add system audio loopback options
      // Option 1: Set Source - User selects which window/screen to capture
      this.devices.unshift({
        deviceId: 'system-audio-set-source',
        label: 'System Audio Output (Set Source)',
        kind: 'audioinput',
        groupId: 'system',
        isSystemAudio: true,
      });

      // Option 2: All Audio - Captures all system audio without user selection
      this.devices.unshift({
        deviceId: 'system-audio-all',
        label: 'System Audio Output (All Audio)',
        kind: 'audioinput',
        groupId: 'system',
        isSystemAudio: true,
      });

      return this.devices;
    } catch (error) {
      console.error('Error getting audio devices:', error);

      // Return system audio options as fallback
      return [
        {
          deviceId: 'system-audio-set-source',
          label: 'System Audio - Set Source',
          kind: 'audioinput',
          groupId: '',
          isSystemAudio: true,
        },
        {
          deviceId: 'system-audio-last-source',
          label: 'System Audio - Last Source',
          kind: 'audioinput',
          groupId: '',
          isSystemAudio: true,
        },
      ];
    }
  }
  
  /**
   * Start audio input from a specific device
   */
  async startAudioInput(deviceId?: string): Promise<MediaStreamAudioSourceNode> {
    try {
      // Initialize audio context
      const audioContext = await this.initializeAudioContext();

      // Stop any existing stream
      await this.stopAudioInput();

      // Check if system audio loopback is requested (Set Source)
      if (deviceId === 'system-audio-set-source') {
        return await this.startSystemAudioCapture(audioContext, true);
      }

      // Check if system audio all is requested (All Audio)
      if (deviceId === 'system-audio-all') {
        return await this.startSystemAudioCapture(audioContext, false);
      }

      // Check if mediaDevices API is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('MediaDevices API not available. Please use HTTPS or localhost.');
      }

      // Get media stream from microphone
      const constraints: MediaStreamConstraints = {
        audio: {
          deviceId: deviceId ? { exact: deviceId } : undefined,
          channelCount: this.options.channelCount,
          echoCancellation: this.options.echoCancellation,
          noiseSuppression: this.options.noiseSuppression,
          autoGainControl: this.options.autoGainControl,
          sampleRate: this.options.sampleRate,
        },
        video: false,
      };

      this.mediaStream = await navigator.mediaDevices.getUserMedia(constraints);

      // Create source node
      this.sourceNode = audioContext.createMediaStreamSource(this.mediaStream);

      return this.sourceNode;
    } catch (error) {
      console.error('Error starting audio input:', error);
      throw new Error('Failed to start audio input. Please check your microphone permissions.');
    }
  }

  /**
   * Start system audio capture using getDisplayMedia
   * This captures the audio from the system output (what the user hears)
   * @param audioContext - The audio context to use
   * @param requireUserSelection - If true, prompts user to select window/screen. If false, captures all system audio.
   */
  private async startSystemAudioCapture(audioContext: AudioContext, requireUserSelection: boolean = true): Promise<MediaStreamAudioSourceNode> {
    try {
      // Use getDisplayMedia to capture system audio
      // NOTE: getDisplayMedia() REQUIRES video to be requested (cannot be false)
      // We request video but will only use the audio track
      const displayMediaConstraints: DisplayMediaStreamOptions = {
        video: requireUserSelection ? true : { displaySurface: 'monitor' as any }, // REQUIRED: getDisplayMedia must request video
        audio: {
          channelCount: this.options.channelCount,
          echoCancellation: false, // Don't cancel echo for system audio
          noiseSuppression: false, // Don't suppress noise for system audio
          autoGainControl: false, // Don't adjust gain for system audio
          sampleRate: this.options.sampleRate,
          // For "All Audio" mode, try to capture system audio directly
          ...(requireUserSelection ? {} : {
            systemAudio: 'include' as any,
            surfaceSwitching: 'exclude' as any,
            selfBrowserSurface: 'exclude' as any,
          }),
        } as any, // Cast to any because TypeScript types may not include all audio constraints
      };

      this.mediaStream = await navigator.mediaDevices.getDisplayMedia(displayMediaConstraints);

      // Check if audio track exists
      const audioTracks = this.mediaStream.getAudioTracks();
      if (audioTracks.length === 0) {
        throw new Error('No audio track in system audio capture. Please select "Share audio" when prompted.');
      }

      // Stop the video track since we only need audio
      const videoTracks = this.mediaStream.getVideoTracks();
      videoTracks.forEach(track => track.stop());

      console.log('System audio capture started successfully');

      // Create source node from the audio track
      this.sourceNode = audioContext.createMediaStreamSource(this.mediaStream);

      return this.sourceNode;
    } catch (error) {
      console.error('Error starting system audio capture:', error);
      throw new Error('Failed to capture system audio. Please select "Share audio" when prompted and ensure you select a tab/window that is playing audio.');
    }
  }
  
  /**
   * Stop audio input
   */
  async stopAudioInput(): Promise<void> {
    // Stop all tracks in the media stream
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }
    
    // Disconnect source node
    if (this.sourceNode) {
      this.sourceNode.disconnect();
      this.sourceNode = null;
    }
  }
  
  /**
   * Get current audio context
   */
  getAudioContext(): AudioContext | null {
    return this.audioContext;
  }
  
  /**
   * Get current media stream
   */
  getMediaStream(): MediaStream | null {
    return this.mediaStream;
  }
  
  /**
   * Get current source node
   */
  getSourceNode(): MediaStreamAudioSourceNode | null {
    return this.sourceNode;
  }
  
  /**
   * Check if audio input is active
   */
  isActive(): boolean {
    return this.mediaStream !== null && this.sourceNode !== null;
  }
  
  /**
   * Get audio level (for visual feedback)
   */
  async getAudioLevel(): Promise<number> {
    if (!this.audioContext || !this.sourceNode) {
      return 0;
    }
    
    // Create analyser node
    const analyser = this.audioContext.createAnalyser();
    analyser.fftSize = 256;
    
    this.sourceNode.connect(analyser);
    
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(dataArray);
    
    // Calculate average level
    const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
    
    // Disconnect analyser
    this.sourceNode.disconnect(analyser);
    
    return average / 255; // Normalize to 0-1
  }
  
  /**
   * Cleanup and release resources
   */
  async cleanup(): Promise<void> {
    await this.stopAudioInput();
    
    if (this.audioContext) {
      await this.audioContext.close();
      this.audioContext = null;
    }
    
    this.devices = [];
  }
}

/**
 * Create a singleton instance for global use
 */
let globalAudioDeviceManager: AudioDeviceManager | null = null;

export function getAudioDeviceManager(options?: AudioDeviceManagerOptions): AudioDeviceManager {
  if (!globalAudioDeviceManager) {
    globalAudioDeviceManager = new AudioDeviceManager(options);
  }
  return globalAudioDeviceManager;
}

export function resetAudioDeviceManager(): void {
  if (globalAudioDeviceManager) {
    globalAudioDeviceManager.cleanup();
    globalAudioDeviceManager = null;
  }
}

