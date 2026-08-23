'use client';

/**
 * MIDI Context Provider
 * Manages MIDI device connections, configuration, and state.
 *
 * Hybrid approach:
 * - Device enumeration: useMIDIInputs from @react-midi/hooks (proven reliable
 *   for Bluetooth MIDI on Windows/Chrome — the library's MIDIProvider owns the
 *   requestMIDIAccess call and handles onstatechange reactively).
 * - Message handling: our own onmidimessage listener wired directly to the
 *   selected MIDIInput so that Program Change (0xC0) and all other message
 *   types work, without the library's CC/Note-only filter.
 */

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from 'react';
import { useMIDIInputs } from '@react-midi/hooks';

// Local alias for the library's Input type (not exported from the public API)
type MIDILibInput = { id: string; name: string; manufacturer: string; onmidimessage: ((m: { data: number[] }) => void) | null };
import {
  MIDIContextState,
  MIDIPedalConfig,
  MIDIDeviceInfo,
  MIDIMessageData,
  DEFAULT_MIDI_CONFIG,
} from '@/lib/midi/midiTypes';
import {
  loadMIDIConfig,
  saveMIDIConfig,
  parseMIDIMessage,
  formatDeviceName,
  createButtonFromMessage,
  removeButton,
  clearAllButtonMappings,
} from '@/lib/midi/midiUtils';

const MIDIContext = createContext<MIDIContextState | null>(null);

interface MIDIContextProviderProps {
  children: ReactNode;
}

export function MIDIContextProvider({ children }: MIDIContextProviderProps) {
  const [config, setConfig] = useState<MIDIPedalConfig>(DEFAULT_MIDI_CONFIG);
  const [isLearning, setIsLearning] = useState(false);
  const [learningButtonId, setLearningButtonId] = useState<string | null>(null);
  const [lastMIDIMessage, setLastMIDIMessage] = useState<MIDIMessageData | null>(null);
  const [isDetectingButtons, setIsDetectingButtons] = useState(false);
  const [isRefreshingDevices, setIsRefreshingDevices] = useState(false);

  // Library provides reactive device enumeration — this is what worked in the ref project.
  // The MIDIProvider parent owns requestMIDIAccess and onstatechange.
  const { inputs, selectInput, selectedInputId: librarySelectedId } = useMIDIInputs();
  const [selectedInputId, setSelectedInputId] = useState<string | null>(null);

  // Stable refs so callbacks never capture stale state
  const isLearningRef = useRef(false);
  const learningButtonIdRef = useRef<string | null>(null);
  const learningStartTime = useRef<number>(0);
  const activeInputRef = useRef<MIDILibInput | null>(null);

  // Keep refs in sync with state
  useEffect(() => { isLearningRef.current = isLearning; }, [isLearning]);
  useEffect(() => { learningButtonIdRef.current = learningButtonId; }, [learningButtonId]);

  // ---------------------------------------------------------------------------
  // Core MIDI message handler — wired directly to the selected MIDIInput.
  // The library's Input.onmidimessage passes a MIDIMessage = { data: number[] }.
  // ---------------------------------------------------------------------------
  const handleMIDIMessage = useCallback((message: { data: number[] }) => {
    const data = message.data;
    if (!data) return;

    const parsed = parseMIDIMessage(data);
    if (!parsed || parsed.type === 'unknown') return;

    const messageData: MIDIMessageData = {
      type: parsed.type,
      number: parsed.number,
      value: parsed.value,
      channel: parsed.channel,
      timestamp: Date.now(),
    };

    // Always update last message (shows in Config modal status area)
    setLastMIDIMessage(messageData);
    console.log('[MIDI] Message:', parsed.type, parsed.number, 'ch', parsed.channel, 'val', parsed.value);

    // --- Learning mode ---
    const isValidForDetection =
      parsed.type === 'cc' ||
      parsed.type === 'program' ||
      (parsed.type === 'note' && parsed.value > 0);

    const isNewEnough = messageData.timestamp > learningStartTime.current;

    if (isLearningRef.current && learningButtonIdRef.current && isValidForDetection && isNewEnough) {
      const actionToAssign = learningButtonIdRef.current;
      console.log('[MIDI] ✅ Learning: assigning', parsed.type, parsed.number, '→', actionToAssign);

      setConfig(prev => {
        const existingButton = prev.buttons.find(b => {
          if (parsed.rawData && b.rawMidiData && b.rawMidiData.length > 0) {
            const rawMatch = parsed.rawData.length === b.rawMidiData.length &&
              parsed.rawData.every((byte, idx) => byte === b.rawMidiData![idx]);
            if (rawMatch) return true;
          }
          if (b.messageType !== parsed.type || b.channel !== parsed.channel) return false;
          if (parsed.type === 'cc' && b.ccNumber === parsed.number) return true;
          if (parsed.type === 'note' && b.noteNumber === parsed.number) return true;
          if (parsed.type === 'program' && b.programNumber === parsed.number) return true;
          return false;
        });

        let updatedButtons;
        if (existingButton) {
          updatedButtons = prev.buttons.map(button => {
            if (button.id === existingButton.id) return { ...button, action: actionToAssign as any, enabled: true };
            if (button.action === actionToAssign) return { ...button, action: 'none' as any };
            return button;
          });
        } else {
          const newButton = createButtonFromMessage(parsed.type, parsed.number, parsed.channel, prev.buttons.length, parsed.rawData);
          updatedButtons = prev.buttons.map(b =>
            b.action === actionToAssign ? { ...b, action: 'none' as any } : b
          );
          updatedButtons.push({ ...newButton, action: actionToAssign as any });
        }

        const newConfig = { ...prev, buttons: updatedButtons };
        saveMIDIConfig(newConfig);
        return newConfig;
      });

      setIsLearning(false);
      setLearningButtonId(null);
      learningStartTime.current = 0;
      console.log('[MIDI] ✅ Assignment complete');
    }

    // --- Runtime dispatch (non-learning): handled by useMIDIButtonHandlers via context ---
    // The MIDISelectionContext reads config and reacts; we just need the message in state.
    // For runtime action dispatch we expose lastMIDIMessage + config via context value.
  }, []);

  // ---------------------------------------------------------------------------
  // Wire/unwire our own onmidimessage listener to the selected MIDIInput.
  // We use the raw MIDIInput from the library's inputs array (not MIDIAccess)
  // so we capture ALL message types including Program Change (0xC0).
  // ---------------------------------------------------------------------------
  const wireInput = useCallback((inputId: string | null) => {
    // Remove listener from previous input
    if (activeInputRef.current) {
      activeInputRef.current.onmidimessage = null;
      activeInputRef.current = null;
    }

    if (!inputId) return;

    // Find the raw MIDIInput from the library's inputs array
    const rawInput = inputs.find(i => i.id === inputId);
    if (!rawInput) {
      console.warn('[MIDI] wireInput: input not found for id', inputId);
      return;
    }

    rawInput.onmidimessage = handleMIDIMessage;
    activeInputRef.current = rawInput;
    console.log('[MIDI] 🔌 Listener wired to:', rawInput.name);
  }, [inputs, handleMIDIMessage]);

  // ---------------------------------------------------------------------------
  // Convert library inputs to our MIDIDeviceInfo format
  // ---------------------------------------------------------------------------
  const availableDevices: MIDIDeviceInfo[] = inputs.map(input => ({
    id: input.id,
    name: input.name || 'Unknown Device',
    manufacturer: input.manufacturer || '',
    connected: true, // If it's in the library's inputs array, it's connected
    state: 'connected' as const,
  }));

  // ---------------------------------------------------------------------------
  // Load config on mount
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const localConfig = loadMIDIConfig();
    setConfig({
      ...localConfig,
      enabled: localConfig.deviceId && localConfig.buttons.length > 0 ? true : localConfig.enabled,
    });
  }, []);

  // ---------------------------------------------------------------------------
  // Auto-select device when inputs list changes (library handles enumeration)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (inputs.length === 0) return;
    console.log('[MIDI] Inputs updated — available:', inputs.map(i => i.name));

    const savedConfig = loadMIDIConfig();

    setSelectedInputId(prev => {
      // Keep current selection if still present
      if (prev && inputs.find(i => i.id === prev)) return prev;
      // Restore saved device
      if (savedConfig.deviceId) {
        const found = inputs.find(i => i.id === savedConfig.deviceId);
        if (found) {
          selectInput(found.id);
          console.log('[MIDI] Auto-selected saved device:', found.name);
          return found.id;
        }
      }
      // Auto-select if only one device
      if (inputs.length === 1) {
        selectInput(inputs[0].id);
        console.log('[MIDI] Auto-selected only device:', inputs[0].name);
        return inputs[0].id;
      }
      return prev;
    });
  }, [inputs, selectInput]);

  // Re-wire listener when selected input changes
  useEffect(() => {
    wireInput(selectedInputId);
  }, [selectedInputId, wireInput]);

  // Log config changes
  useEffect(() => {
    console.log('[MIDI Context] Config:', {
      enabled: config.enabled,
      deviceId: config.deviceId,
      buttonsCount: config.buttons.length,
    });
  }, [config]);

  const selectedDevice = availableDevices.find(d => d.id === selectedInputId) || null;
  const isConnected = !!selectedInputId && availableDevices.some(d => d.id === selectedInputId && d.connected);

  // Update configuration
  const updateConfig = useCallback((updates: Partial<MIDIPedalConfig>) => {
    setConfig(prev => {
      const newConfig = { ...prev, ...updates };
      console.log('[MIDI Context] Updating config:', newConfig);
      saveMIDIConfig(newConfig);
      return newConfig;
    });
  }, []);

  // Select device — tells library + updates our selectedInputId + saves config
  const selectDevice = useCallback((deviceId: string) => {
    const device = availableDevices.find(d => d.id === deviceId);
    if (!device) return;
    selectInput(deviceId);       // library tracks selection for useMIDIMessage
    setSelectedInputId(deviceId); // our state drives wireInput via useEffect
    updateConfig({
      deviceId: device.id,
      deviceName: formatDeviceName(device.name, device.manufacturer),
      enabled: true,
    });
  }, [availableDevices, selectInput, updateConfig]);

  // Start learning mode
  const startLearning = useCallback((buttonId: string) => {
    console.log('[MIDI] 🎯 Starting learning mode for action:', buttonId);
    // Set the learning start time to NOW - only messages after this will be processed
    learningStartTime.current = Date.now();
    console.log('[MIDI] Learning start time set to:', learningStartTime.current);
    setIsLearning(true);
    setLearningButtonId(buttonId);
    setLastMIDIMessage(null);
  }, []);

  // Stop learning mode
  const stopLearning = useCallback(() => {
    console.log('[MIDI] ⛔ Manually stopping learning mode');
    setIsLearning(false);
    setLearningButtonId(null);
    learningStartTime.current = 0;
  }, []);

  // Reset configuration
  const resetConfig = useCallback(() => {
    setConfig(DEFAULT_MIDI_CONFIG);
    saveMIDIConfig(DEFAULT_MIDI_CONFIG);
  }, []);

  // Save configuration
  const saveConfig = useCallback(() => {
    saveMIDIConfig(config);
  }, [config]);

  // Start button detection mode
  const startDetectingButtons = useCallback(() => {
    setIsDetectingButtons(true);
    setLastMIDIMessage(null);
  }, []);

  // Stop button detection mode
  const stopDetectingButtons = useCallback(() => {
    setIsDetectingButtons(false);
  }, []);

  // Remove a button
  const removeButtonById = useCallback((buttonId: string) => {
    setConfig(prev => ({
      ...prev,
      buttons: removeButton(prev.buttons, buttonId),
    }));
  }, []);

  // Clear all button mappings
  const clearMappings = useCallback(() => {
    setConfig(prev => ({
      ...prev,
      buttons: clearAllButtonMappings(prev.buttons),
    }));
  }, []);

  // Clear all detected buttons
  const clearAllButtons = useCallback(() => {
    setConfig(prev => ({
      ...prev,
      buttons: [],
    }));
  }, []);

  // Refresh MIDI devices.
  // The library's MIDIProvider already owns requestMIDIAccess and onstatechange,
  // so "refresh" means: force a new requestMIDIAccess call to wake Chrome's MIDI
  // subsystem, then let the library re-populate inputs via its own onstatechange.
  // We briefly show a spinner for UX feedback.
  const refreshDevices = useCallback(async () => {
    if (typeof navigator === 'undefined' || !('requestMIDIAccess' in navigator)) {
      console.warn('[MIDI] Web MIDI API not supported in this browser');
      return;
    }

    setIsRefreshingDevices(true);
    console.log('[MIDI] 🔄 Refresh triggered — current inputs:', inputs.map(i => i.name));

    try {
      // Calling requestMIDIAccess again wakes Chrome's MIDI stack and triggers
      // onstatechange in the library's MIDIProvider if new devices appear.
      await navigator.requestMIDIAccess();
      console.log('[MIDI] ✅ requestMIDIAccess re-called — library will update inputs via onstatechange');
    } catch (err) {
      console.error('[MIDI] ❌ requestMIDIAccess failed on refresh:', err);
    }

    // Give the library a moment to fire onstatechange and update its inputs state
    await new Promise(r => setTimeout(r, 800));
    setIsRefreshingDevices(false);
  }, [inputs]);

  const value: MIDIContextState = {
    config,
    isConnected,
    availableDevices,
    selectedDevice,
    isLearning,
    learningButtonId,
    lastMIDIMessage,
    updateConfig,
    selectDevice,
    startLearning,
    stopLearning,
    resetConfig,
    saveConfig,
    isDetectingButtons,
    startDetectingButtons,
    stopDetectingButtons,
    removeButtonById,
    clearMappings,
    clearAllButtons,
    refreshDevices,
    isRefreshingDevices,
  };

  return <MIDIContext.Provider value={value}>{children}</MIDIContext.Provider>;
}

/**
 * Hook to use MIDI context
 */
export function useMIDIPedal(): MIDIContextState {
  const context = useContext(MIDIContext);
  if (!context) {
    throw new Error('useMIDIPedal must be used within MIDIContextProvider');
  }
  return context;
}

