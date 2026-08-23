'use client';

/**
 * MIDI Context Provider
 * Manages MIDI device connections, configuration, and state.
 *
 * Uses the Web MIDI API directly rather than relying on @react-midi/hooks for
 * message routing. The library's MIDIProvider/useMIDIInputs is kept only for
 * device enumeration; all message handling is wired via our own onmidimessage
 * listeners so that Program Change, SysEx, and Bluetooth MIDI devices work
 * reliably without needing a full page reload.
 */

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from 'react';
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

  // Our own device list — populated directly from navigator.requestMIDIAccess()
  const [availableDevices, setAvailableDevices] = useState<MIDIDeviceInfo[]>([]);
  const [selectedInputId, setSelectedInputId] = useState<string | null>(null);

  // Stable refs so callbacks never capture stale state
  const isLearningRef = useRef(false);
  const learningButtonIdRef = useRef<string | null>(null);
  const learningStartTime = useRef<number>(0);
  const midiAccessRef = useRef<MIDIAccess | null>(null);
  const activeListenerRef = useRef<((e: Event) => void) | null>(null);
  const activeInputRef = useRef<MIDIInput | null>(null);

  // Keep refs in sync with state
  useEffect(() => { isLearningRef.current = isLearning; }, [isLearning]);
  useEffect(() => { learningButtonIdRef.current = learningButtonId; }, [learningButtonId]);

  // ---------------------------------------------------------------------------
  // Core MIDI message handler — wired directly to the selected MIDIInput
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
  // Wire/unwire message listener when selected input changes
  // ---------------------------------------------------------------------------
  const wireInput = useCallback((inputId: string | null) => {
    // Remove listener from previous input
    if (activeInputRef.current && activeListenerRef.current) {
      activeInputRef.current.onmidimessage = null;
      activeListenerRef.current = null;
      activeInputRef.current = null;
    }

    if (!inputId || !midiAccessRef.current) return;

    const input = midiAccessRef.current.inputs.get(inputId);
    if (!input) {
      console.warn('[MIDI] wireInput: input not found for id', inputId);
      return;
    }

    const listener = (e: Event) => handleMIDIMessage(e as MIDIMessageEvent);
    input.onmidimessage = listener;
    activeInputRef.current = input;
    activeListenerRef.current = listener;
    console.log('[MIDI] 🔌 Listener wired to:', input.name);
  }, [handleMIDIMessage]);

  // ---------------------------------------------------------------------------
  // Build device list from a MIDIAccess object
  // ---------------------------------------------------------------------------
  const buildDeviceList = useCallback((access: MIDIAccess): MIDIDeviceInfo[] => {
    const devices: MIDIDeviceInfo[] = [];
    access.inputs.forEach(input => {
      devices.push({
        id: input.id,
        name: input.name || 'Unknown Device',
        manufacturer: input.manufacturer || '',
        connected: input.state === 'connected',
        state: input.state as 'connected' | 'disconnected',
      });
    });
    return devices;
  }, []);

  // ---------------------------------------------------------------------------
  // Initialize MIDI access on mount
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (typeof navigator === 'undefined' || !('requestMIDIAccess' in navigator)) return;

    let cancelled = false;

    const init = async () => {
      try {
        const access = await navigator.requestMIDIAccess({ sysex: false });
        if (cancelled) return;

        midiAccessRef.current = access;
        const devices = buildDeviceList(access);
        setAvailableDevices(devices);
        console.log('[MIDI] Init: found', devices.length, 'device(s):', devices.map(d => d.name));

        // Listen for hot-plug events
        access.onstatechange = () => {
          if (cancelled) return;
          const updated = buildDeviceList(access);
          setAvailableDevices(updated);
          console.log('[MIDI] onstatechange: device list updated', updated.map(d => d.name));

          // Re-wire if our selected device disappeared or reappeared
          setSelectedInputId(prev => {
            if (prev) wireInput(prev);
            return prev;
          });
        };

        // Auto-select saved device from config
        const savedConfig = loadMIDIConfig();
        if (savedConfig.deviceId) {
          const found = devices.find(d => d.id === savedConfig.deviceId);
          if (found) {
            setSelectedInputId(found.id);
            wireInput(found.id);
            console.log('[MIDI] Auto-selected saved device:', found.name);
          }
        } else if (devices.length === 1) {
          // Auto-select if there's exactly one device
          setSelectedInputId(devices[0].id);
          wireInput(devices[0].id);
          console.log('[MIDI] Auto-selected only device:', devices[0].name);
        }

        // Load config into state
        setConfig(prev => {
          const localConfig = loadMIDIConfig();
          return {
            ...localConfig,
            enabled: localConfig.deviceId && localConfig.buttons.length > 0 ? true : localConfig.enabled,
          };
        });
      } catch (err) {
        console.error('[MIDI] requestMIDIAccess failed:', err);
      }
    };

    init();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-wire listener when selectedInputId changes
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

  // Select device — updates our own selectedInputId and wires the listener
  const selectDevice = useCallback((deviceId: string) => {
    const device = availableDevices.find(d => d.id === deviceId);
    if (!device) return;
    setSelectedInputId(deviceId);
    // wireInput is called via the useEffect that watches selectedInputId
    updateConfig({
      deviceId: device.id,
      deviceName: formatDeviceName(device.name, device.manufacturer),
      enabled: true,
    });
  }, [availableDevices, updateConfig]);

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

  // Refresh MIDI devices — re-requests access and updates device list without page reload
  const refreshDevices = useCallback(async () => {
    if (typeof navigator === 'undefined' || !('requestMIDIAccess' in navigator)) {
      console.warn('[MIDI] Web MIDI API not supported in this browser');
      return;
    }

    setIsRefreshingDevices(true);
    console.log('[MIDI] 🔄 Refreshing MIDI device list...');

    try {
      const access = await navigator.requestMIDIAccess({ sysex: false });
      midiAccessRef.current = access;

      const freshDevices = buildDeviceList(access);
      setAvailableDevices(freshDevices);
      console.log('[MIDI] ✅ Found', freshDevices.length, 'device(s):', freshDevices.map(d => d.name));

      // Update onstatechange to use the new access object
      access.onstatechange = () => {
        const updated = buildDeviceList(access);
        setAvailableDevices(updated);
        setSelectedInputId(prev => { if (prev) wireInput(prev); return prev; });
      };

      // Auto-select saved device if now visible, or keep current selection
      setSelectedInputId(prev => {
        const targetId = prev || config.deviceId || null;
        if (targetId) {
          const found = freshDevices.find(d => d.id === targetId);
          if (found) {
            wireInput(found.id);
            return found.id;
          }
        }
        return prev;
      });
    } catch (error) {
      console.error('[MIDI] ❌ Failed to refresh MIDI devices:', error);
    } finally {
      setIsRefreshingDevices(false);
    }
  }, [buildDeviceList, wireInput, config.deviceId]);

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

