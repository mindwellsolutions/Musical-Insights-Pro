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
  // Real MIDIAccess from the browser — needed to reach actual MIDIInput objects
  // (the library's inputs array contains plain wrapper objects, not real MIDIInputs,
  // so setting onmidimessage on them is a no-op).
  const midiAccessRef = useRef<MIDIAccess | null>(null);
  const activeInputRef = useRef<MIDIInput | null>(null);

  // Keep refs in sync with state
  useEffect(() => { isLearningRef.current = isLearning; }, [isLearning]);
  useEffect(() => { learningButtonIdRef.current = learningButtonId; }, [learningButtonId]);

  // selectedInputId ref so the MIDIAccess callback can re-wire without stale closure
  const selectedInputIdRef = useRef<string | null>(null);
  useEffect(() => { selectedInputIdRef.current = selectedInputId; }, [selectedInputId]);

  // ---------------------------------------------------------------------------
  // Acquire real MIDIAccess on mount so wireInput can reach real MIDIInput objects.
  // The library's MIDIProvider also calls requestMIDIAccess — Chrome returns the
  // same singleton MIDIAccess object for all callers, so there is no conflict.
  // After acquiring, immediately wire any already-selected input (timing gap fix).
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (typeof navigator === 'undefined' || !('requestMIDIAccess' in navigator)) return;
    navigator.requestMIDIAccess({ sysex: false }).then(access => {
      midiAccessRef.current = access;
      console.log('[MIDI] Real MIDIAccess acquired, inputs:', Array.from(access.inputs.values()).map(i => i.name));
      // If a device was already selected before MIDIAccess resolved, wire it now
      if (selectedInputIdRef.current) {
        const realInput = access.inputs.get(selectedInputIdRef.current);
        if (realInput) {
          realInput.addEventListener('midimessage', handleMIDIMessage as EventListener);
          activeInputRef.current = realInput;
          console.log('[MIDI] 🔌 Retroactively wired to:', realInput.name);
        }
      }
    }).catch(err => {
      console.error('[MIDI] Failed to acquire MIDIAccess:', err);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------------------------------------------------------------------------
  // Core MIDI message handler — wired to the real MIDIInput via addEventListener.
  // Uses MIDIMessageEvent from the Web MIDI API.
  // ---------------------------------------------------------------------------
  const handleMIDIMessage = useCallback((event: MIDIMessageEvent) => {
    const data = event.data;
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
  // Wire/unwire our listener to the REAL MIDIInput from browser MIDIAccess.
  // The library's inputs array contains plain wrapper objects — setting
  // onmidimessage on them is a no-op. We must use midiAccessRef.inputs.get(id)
  // to reach the actual browser MIDIInput and use addEventListener on it.
  // ---------------------------------------------------------------------------
  const wireInput = useCallback((inputId: string | null) => {
    // Remove listener from previous real input
    if (activeInputRef.current) {
      activeInputRef.current.removeEventListener('midimessage', handleMIDIMessage as EventListener);
      activeInputRef.current = null;
    }

    if (!inputId) return;

    // Must have real MIDIAccess to find the real MIDIInput
    if (!midiAccessRef.current) {
      console.warn('[MIDI] wireInput: MIDIAccess not yet available, will retry when it arrives');
      return;
    }

    const realInput = midiAccessRef.current.inputs.get(inputId);
    if (!realInput) {
      console.warn('[MIDI] wireInput: real MIDIInput not found for id', inputId);
      return;
    }

    realInput.addEventListener('midimessage', handleMIDIMessage as EventListener);
    activeInputRef.current = realInput;
    console.log('[MIDI] 🔌 Listener wired to real MIDIInput:', realInput.name);
  }, [handleMIDIMessage]);

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
  // Auto-select device when inputs list changes (library handles enumeration).
  // selectInput must be called OUTSIDE any state updater to avoid the React
  // "setState during render" error (updating another component while rendering).
  // Also auto-enables config when a device is selected so that the section
  // toggles are clickable on a fresh deployment (empty localStorage → enabled=false).
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (inputs.length === 0) return;
    console.log('[MIDI] Inputs updated — available:', inputs.map(i => i.name));

    const savedConfig = loadMIDIConfig();

    // Determine which ID to select (pure computation, no side effects)
    setSelectedInputId(prev => {
      // Keep current selection if still present
      if (prev && inputs.find(i => i.id === prev)) return prev;
      // Restore saved device
      if (savedConfig.deviceId) {
        const found = inputs.find(i => i.id === savedConfig.deviceId);
        if (found) return found.id;
      }
      // Auto-select if only one device
      if (inputs.length === 1) return inputs[0].id;
      return prev;
    });
  }, [inputs]);

  // Auto-enable config whenever a device becomes selected.
  // On a fresh deployment localStorage is empty so config.enabled = false even
  // though a device is connected. This effect flips it to true automatically.
  useEffect(() => {
    if (!selectedInputId) return;
    setConfig(prev => {
      if (prev.enabled) return prev; // already enabled, no-op
      const updated = { ...prev, enabled: true };
      saveMIDIConfig(updated);
      console.log('[MIDI] Auto-enabled config because device is selected:', selectedInputId);
      return updated;
    });
  }, [selectedInputId]);

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

