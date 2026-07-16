/**
 * MIDI Pedal Integration Types
 * Defines all TypeScript interfaces and types for MIDI functionality
 */

/**
 * Available MIDI button actions that can be mapped to pedal buttons
 */
export type MIDIButtonAction =
  | 'prev'           // Manual Selection Previous
  | 'next'           // Manual Selection Next
  | 'scale-left'     // Compatible Scales Navigate Left
  | 'scale-right'    // Compatible Scales Navigate Right
  | 'item-left'      // Navigate items left within the MIDI-active section
  | 'item-right'     // Navigate items right within the MIDI-active section
  | 'section-left'   // Cycle MIDI-active section left (future)
  | 'section-right'  // Cycle MIDI-active section right (future)
  | 'none';          // No action assigned

/**
 * MIDI message type (Control Change, Note, Program Change, SysEx, or Unknown)
 */
export type MIDIMessageType = 'cc' | 'note' | 'program' | 'sysex' | 'unknown';

/**
 * Configuration for a single MIDI button
 */
export interface MIDIButtonConfig {
  /** Unique identifier for this button */
  id: string;

  /** Control Change number (0-127) if using CC messages */
  ccNumber?: number;

  /** Note number (0-127) if using Note messages */
  noteNumber?: number;

  /** Program number (0-127) if using Program Change messages */
  programNumber?: number;

  /** MIDI channel (1-16) */
  channel: number;

  /** Message type (CC, Note, or Program) */
  messageType: MIDIMessageType;

  /** Action to perform when button is pressed */
  action: MIDIButtonAction;

  /** User-friendly label for this button */
  label: string;

  /** Whether this button is enabled */
  enabled: boolean;

  /** Raw MIDI data bytes for exact matching (supports any length message) */
  rawMidiData?: number[];
}

/**
 * Complete MIDI pedal configuration
 */
export interface MIDIPedalConfig {
  /** MIDI device ID (from Web MIDI API) */
  deviceId: string | null;
  
  /** User-friendly device name */
  deviceName: string | null;
  
  /** Array of button configurations (typically 4-8 buttons) */
  buttons: MIDIButtonConfig[];
  
  /** Whether MIDI pedal integration is enabled */
  enabled: boolean;
  
  /** Last updated timestamp */
  lastUpdated?: number;
}

/**
 * MIDI device information
 */
export interface MIDIDeviceInfo {
  /** Device ID from Web MIDI API */
  id: string;
  
  /** Device name */
  name: string;
  
  /** Manufacturer name */
  manufacturer: string;
  
  /** Whether device is currently connected */
  connected: boolean;
  
  /** Device state */
  state: 'connected' | 'disconnected';
}

/**
 * MIDI Context State
 */
export interface MIDIContextState {
  /** Current MIDI configuration */
  config: MIDIPedalConfig;

  /** Whether a MIDI device is currently connected */
  isConnected: boolean;

  /** List of available MIDI input devices */
  availableDevices: MIDIDeviceInfo[];

  /** Currently selected MIDI input device */
  selectedDevice: MIDIDeviceInfo | null;

  /** Whether button learning mode is active */
  isLearning: boolean;

  /** ID of button currently being learned */
  learningButtonId: string | null;

  /** Last MIDI message received (for debugging/learning) */
  lastMIDIMessage: MIDIMessageData | null;

  /** Whether button detection mode is active */
  isDetectingButtons: boolean;

  /** Update configuration */
  updateConfig: (config: Partial<MIDIPedalConfig>) => void;

  /** Select a MIDI device by ID */
  selectDevice: (deviceId: string) => void;

  /** Start learning mode for a button */
  startLearning: (buttonId: string) => void;

  /** Stop learning mode */
  stopLearning: () => void;

  /** Reset configuration to defaults */
  resetConfig: () => void;

  /** Save configuration to localStorage */
  saveConfig: () => void;

  /** Start button detection mode */
  startDetectingButtons: () => void;

  /** Stop button detection mode */
  stopDetectingButtons: () => void;

  /** Remove a button by ID */
  removeButtonById: (buttonId: string) => void;

  /** Clear all button action mappings (set to 'none') */
  clearMappings: () => void;

  /** Clear all detected buttons */
  clearAllButtons: () => void;
}

/**
 * MIDI message data
 */
export interface MIDIMessageData {
  /** Message type */
  type: MIDIMessageType;
  
  /** Control Change number or Note number */
  number: number;
  
  /** Value (0-127) */
  value: number;
  
  /** MIDI channel (1-16) */
  channel: number;
  
  /** Timestamp */
  timestamp: number;
}

/**
 * Action labels for UI display
 */
export const MIDI_ACTION_LABELS: Record<MIDIButtonAction, string> = {
  'prev': 'Manual Selection: Previous',
  'next': 'Manual Selection: Next',
  'scale-left': 'Compatible Scales: Navigate Left',
  'scale-right': 'Compatible Scales: Navigate Right',
  'item-left': 'Active Section: Item Left',
  'item-right': 'Active Section: Item Right',
  'section-left': 'Cycle Section: Left',
  'section-right': 'Cycle Section: Right',
  'none': 'No Action',
};

/**
 * MIDI Profile for saving/loading configurations
 */
export interface MIDIProfile {
  id: string;
  name: string;
  deviceName: string;
  config: MIDIPedalConfig;
  createdAt: number;
  updatedAt: number;
}

/**
 * Default MIDI configuration
 * Starts with empty buttons array - buttons are detected dynamically
 */
export const DEFAULT_MIDI_CONFIG: MIDIPedalConfig = {
  deviceId: null,
  deviceName: null,
  enabled: false,
  buttons: [], // Empty - buttons are detected when user presses them
};

