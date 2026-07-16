/**
 * MIDI Utility Functions
 * Helper functions for MIDI message parsing, device management, and configuration
 */

import { MIDIPedalConfig, MIDIButtonConfig, MIDIDeviceInfo, DEFAULT_MIDI_CONFIG, MIDIButtonAction } from './midiTypes';

/**
 * localStorage key for MIDI configuration
 */
export const MIDI_CONFIG_STORAGE_KEY = 'midi-pedal-config';

/**
 * Parse MIDI message to extract type, number, value, and channel
 * Accepts both Uint8Array (Web MIDI API) and number[] (@react-midi/hooks)
 * Supports ANY length MIDI messages (1-byte, 2-byte, 3-byte, SysEx, etc.)
 */
export function parseMIDIMessage(data: Uint8Array | number[]): {
  type: 'cc' | 'note' | 'program' | 'sysex' | 'unknown';
  number: number;
  value: number;
  channel: number;
  rawData: number[];
} | null {
  if (!data || data.length < 1) return null;

  // Convert to number array for consistent handling
  const rawData = Array.from(data);
  const status = rawData[0];

  // System Exclusive (SysEx) messages (0xF0-0xF7)
  if (status >= 0xf0) {
    return {
      type: 'sysex',
      number: status,
      value: 127,
      channel: 0,
      rawData,
    };
  }

  // For channel messages, extract channel from status byte
  const statusType = status & 0xf0; // Upper 4 bits
  const channel = (status & 0x0f) + 1; // Lower 4 bits, 1-indexed

  // Program Change (0xC0-0xCF) - 2 bytes
  // Many MIDI pedals use Program Change messages for button presses
  if (statusType === 0xc0) {
    return {
      type: 'program',
      number: rawData[1] ?? 0, // Program number (0-127)
      value: 127, // Treat as button press (always "on")
      channel,
      rawData,
    };
  }

  // Channel Pressure/Aftertouch (0xD0-0xDF) - 2 bytes
  if (statusType === 0xd0) {
    return {
      type: 'cc', // Treat as CC for compatibility
      number: 128, // Use a special CC number for channel pressure
      value: rawData[1] ?? 0,
      channel,
      rawData,
    };
  }

  // Control Change (0xB0-0xBF) - 3 bytes
  if (statusType === 0xb0 && rawData.length >= 3) {
    return {
      type: 'cc',
      number: rawData[1],
      value: rawData[2],
      channel,
      rawData,
    };
  }

  // Note On (0x90-0x9F) - 3 bytes
  if (statusType === 0x90 && rawData.length >= 3) {
    return {
      type: 'note',
      number: rawData[1],
      value: rawData[2], // velocity
      channel,
      rawData,
    };
  }

  // Note Off (0x80-0x8F) - 3 bytes - treat as note with velocity 0
  if (statusType === 0x80 && rawData.length >= 3) {
    return {
      type: 'note',
      number: rawData[1],
      value: 0,
      channel,
      rawData,
    };
  }

  // Unknown message type - still capture raw data
  return {
    type: 'unknown',
    number: 0,
    value: 0,
    channel,
    rawData,
  };
}

/**
 * Format device name for display
 */
export function formatDeviceName(name: string, manufacturer?: string): string {
  if (!name) return 'Unknown Device';
  
  // Remove manufacturer prefix if it's redundant
  if (manufacturer && name.toLowerCase().startsWith(manufacturer.toLowerCase())) {
    return name;
  }
  
  return manufacturer ? `${manufacturer} ${name}` : name;
}

/**
 * Load MIDI configuration from localStorage
 */
export function loadMIDIConfig(): MIDIPedalConfig {
  if (typeof window === 'undefined') return DEFAULT_MIDI_CONFIG;

  try {
    const stored = localStorage.getItem(MIDI_CONFIG_STORAGE_KEY);
    if (!stored) return DEFAULT_MIDI_CONFIG;

    const parsed = JSON.parse(stored) as MIDIPedalConfig;
    
    // Validate and merge with defaults to ensure all fields exist
    return {
      ...DEFAULT_MIDI_CONFIG,
      ...parsed,
      buttons: parsed.buttons?.length > 0 
        ? parsed.buttons 
        : DEFAULT_MIDI_CONFIG.buttons,
    };
  } catch (error) {
    console.error('Error loading MIDI config from localStorage:', error);
    return DEFAULT_MIDI_CONFIG;
  }
}

/**
 * Save MIDI configuration to localStorage
 */
export function saveMIDIConfig(config: MIDIPedalConfig): void {
  if (typeof window === 'undefined') return;

  try {
    const toSave = {
      ...config,
      lastUpdated: Date.now(),
    };
    console.log('[MIDI] Saving config to localStorage:', toSave);
    localStorage.setItem(MIDI_CONFIG_STORAGE_KEY, JSON.stringify(toSave));
    console.log('[MIDI] Config saved successfully');
  } catch (error) {
    console.error('Error saving MIDI config to localStorage:', error);
  }
}

/**
 * Validate MIDI button configuration
 */
export function validateButtonConfig(button: MIDIButtonConfig): boolean {
  // Must have either CC number or Note number
  if (button.ccNumber === undefined && button.noteNumber === undefined) {
    return false;
  }

  // Channel must be 1-16
  if (button.channel < 1 || button.channel > 16) {
    return false;
  }

  // CC/Note number must be 0-127
  if (button.ccNumber !== undefined && (button.ccNumber < 0 || button.ccNumber > 127)) {
    return false;
  }
  if (button.noteNumber !== undefined && (button.noteNumber < 0 || button.noteNumber > 127)) {
    return false;
  }

  return true;
}

/**
 * Check if two button configs have conflicting MIDI messages
 */
export function hasButtonConflict(button1: MIDIButtonConfig, button2: MIDIButtonConfig): boolean {
  if (!button1.enabled || !button2.enabled) return false;
  if (button1.channel !== button2.channel) return false;
  if (button1.messageType !== button2.messageType) return false;

  if (button1.messageType === 'cc' && button1.ccNumber === button2.ccNumber) {
    return true;
  }

  if (button1.messageType === 'note' && button1.noteNumber === button2.noteNumber) {
    return true;
  }

  if (button1.messageType === 'program' && button1.programNumber === button2.programNumber) {
    return true;
  }

  return false;
}

/**
 * Compare two MIDI raw data arrays for exact match
 */
export function midiDataMatches(data1: number[], data2: number[]): boolean {
  if (data1.length !== data2.length) return false;
  return data1.every((byte, index) => byte === data2[index]);
}

/**
 * Find button configuration by MIDI message
 * Supports both parsed message matching and raw data matching for maximum compatibility
 */
export function findButtonByMIDIMessage(
  buttons: MIDIButtonConfig[],
  type: 'cc' | 'note' | 'program' | 'sysex' | 'unknown',
  number: number,
  channel: number,
  rawData?: number[]
): MIDIButtonConfig | null {
  return buttons.find(button => {
    if (!button.enabled) return false;

    // First, try raw data matching if available (most accurate)
    if (rawData && button.rawMidiData && button.rawMidiData.length > 0) {
      if (midiDataMatches(rawData, button.rawMidiData)) {
        return true;
      }
    }

    // Fallback to parsed message matching
    if (button.channel !== channel) return false;
    if (button.messageType !== type) return false;

    if (type === 'cc' && button.ccNumber === number) return true;
    if (type === 'note' && button.noteNumber === number) return true;
    if (type === 'program' && button.programNumber === number) return true;

    return false;
  }) || null;
}

/**
 * Count enabled buttons in configuration
 */
export function countEnabledButtons(config: MIDIPedalConfig): number {
  return config.buttons.filter(b => b.enabled).length;
}

/**
 * Check if Web MIDI API is supported
 */
export function isMIDISupported(): boolean {
  return typeof navigator !== 'undefined' && 'requestMIDIAccess' in navigator;
}

/**
 * Get user-friendly error message for MIDI errors
 */
export function getMIDIErrorMessage(error: Error): string {
  if (error.name === 'SecurityError') {
    return 'MIDI access was denied. Please check your browser permissions.';
  }
  if (error.name === 'NotSupportedError') {
    return 'Web MIDI API is not supported in this browser. Please use Chrome, Edge, or Opera.';
  }
  return `MIDI Error: ${error.message}`;
}

/**
 * Generate a unique button ID from MIDI message parameters
 */
export function generateButtonId(
  type: 'cc' | 'note' | 'program' | 'sysex' | 'unknown',
  number: number,
  channel: number
): string {
  return `${type}-${number}-ch${channel}-${Date.now()}`;
}

/**
 * Check if a button with the same MIDI parameters already exists
 */
export function buttonExists(
  buttons: MIDIButtonConfig[],
  type: 'cc' | 'note' | 'program' | 'sysex' | 'unknown',
  number: number,
  channel: number,
  rawData?: number[]
): boolean {
  return buttons.some(button => {
    // Check raw data match first if available
    if (rawData && button.rawMidiData && button.rawMidiData.length > 0) {
      if (midiDataMatches(rawData, button.rawMidiData)) {
        return true;
      }
    }

    // Fallback to parsed message matching
    if (button.channel !== channel || button.messageType !== type) return false;
    if (type === 'cc' && button.ccNumber === number) return true;
    if (type === 'note' && button.noteNumber === number) return true;
    if (type === 'program' && button.programNumber === number) return true;
    return false;
  });
}

/**
 * Create a new button configuration from MIDI message
 */
export function createButtonFromMessage(
  type: 'cc' | 'note' | 'program' | 'sysex' | 'unknown',
  number: number,
  channel: number,
  buttonIndex: number,
  rawData?: number[]
): MIDIButtonConfig {
  const id = generateButtonId(type, number, channel);
  let label: string;

  if (type === 'cc') {
    label = `CC ${number} (Ch ${channel})`;
  } else if (type === 'note') {
    label = `Note ${number} (Ch ${channel})`;
  } else if (type === 'program') {
    label = `Program ${number} (Ch ${channel})`;
  } else if (type === 'sysex') {
    label = `SysEx (${rawData?.length || 0} bytes)`;
  } else {
    label = `MIDI (${rawData?.length || 0} bytes)`;
  }

  return {
    id,
    channel,
    messageType: type === 'sysex' || type === 'unknown' ? 'program' : type, // Fallback to program for unknown types
    ccNumber: type === 'cc' ? number : undefined,
    noteNumber: type === 'note' ? number : undefined,
    programNumber: type === 'program' ? number : undefined,
    action: 'none',
    label,
    enabled: true,
    rawMidiData: rawData ? Array.from(rawData) : undefined,
  };
}

/**
 * Get actions that are already assigned to buttons
 */
export function getAssignedActions(buttons: MIDIButtonConfig[]): Set<string> {
  return new Set(
    buttons
      .filter(b => b.action !== 'none')
      .map(b => b.action)
  );
}

/**
 * Get available actions for a specific button (excluding actions assigned to other buttons)
 */
export function getAvailableActionsForButton(
  buttons: MIDIButtonConfig[],
  currentButtonId: string
): string[] {
  const assignedActions = new Set(
    buttons
      .filter(b => b.id !== currentButtonId && b.action !== 'none')
      .map(b => b.action)
  );

  return (['none', 'prev', 'next', 'scale-left', 'scale-right', 'item-left', 'item-right', 'section-left', 'section-right'] as MIDIButtonAction[]).filter(
    action => !assignedActions.has(action)
  );
}

/**
 * Check if an action is already assigned to another button
 */
export function isActionAssigned(
  buttons: MIDIButtonConfig[],
  action: string,
  excludeButtonId?: string
): boolean {
  return buttons.some(
    b => b.action === action && b.action !== 'none' && b.id !== excludeButtonId
  );
}

/**
 * Remove a button by ID
 */
export function removeButton(
  buttons: MIDIButtonConfig[],
  buttonId: string
): MIDIButtonConfig[] {
  return buttons.filter(b => b.id !== buttonId);
}

/**
 * Clear all button mappings (reset to 'none')
 */
export function clearAllButtonMappings(
  buttons: MIDIButtonConfig[]
): MIDIButtonConfig[] {
  return buttons.map(b => ({ ...b, action: 'none' }));
}

