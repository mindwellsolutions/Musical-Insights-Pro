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
  // applyDevices — update state and auto-wire the selected device
  // ---------------------------------------------------------------------------
  const applyDevices = useCallback((devices: MIDIDeviceInfo[]) => {
    setAvailableDevices(devices);
    const savedConfig = loadMIDIConfig();

    setSelectedInputId(prev => {
      // Keep current selection if still present
      if (prev && devices.find(d => d.id === prev)) {
        wireInput(prev);
        return prev;
      }
      // Restore saved device
      if (savedConfig.deviceId) {
        const found = devices.find(d => d.id === savedConfig.deviceId);
        if (found) {
          wireInput(found.id);
          console.log('[MIDI] Auto-selected saved device:', found.name);
          return found.id;
        }
      }
      // Auto-select single device
      if (devices.length === 1) {
        wireInput(devices[0].id);
        console.log('[MIDI] Auto-selected only device:', devices[0].name);
        return devices[0].id;
      }
      return prev;
    });
  }, [wireInput]);

  // ---------------------------------------------------------------------------
  // Initialize MIDI access on mount.
  // Bluetooth MIDI on Windows/Chrome: inputs map is often empty immediately
  // after requestMIDIAccess resolves. We retry every 500ms for up to 5s so
  // paired BT devices are picked up without manual intervention.
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (typeof navigator === 'undefined' || !('requestMIDIAccess' in navigator)) return;

    let cancelled = false;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;
    let retryCount = 0;
    const MAX_RETRIES = 10; // 10 × 500ms = 5 seconds total

    const scanNow = () => {
      if (cancelled || !midiAccessRef.current) return;
      const devices = buildDeviceList(midiAccessRef.current);
      console.log(`[MIDI] Scan #${retryCount}: found ${devices.length} device(s):`, devices.map(d => d.name));
      applyDevices(devices);

      // Keep retrying if we haven't found any devices yet
      if (devices.length === 0 && retryCount < MAX_RETRIES) {
        retryCount++;
        retryTimer = setTimeout(scanNow, 500);
      }
    };

    const init = async () => {
      try {
        const access = await navigator.requestMIDIAccess({ sysex: false });
        if (cancelled) return;

        midiAccessRef.current = access;

        // onstatechange fires on BT connect/disconnect — always re-scan
        access.onstatechange = (e: Event) => {
          if (cancelled) return;
          const port = (e as MIDIConnectionEvent).port;
          console.log('[MIDI] onstatechange:', port?.name, port?.state, port?.type);
          // Small delay: Chrome fires this before the input is available in the map
          setTimeout(() => {
            if (cancelled || !midiAccessRef.current) return;
            const updated = buildDeviceList(midiAccessRef.current);
            console.log('[MIDI] Post-statechange scan:', updated.map(d => d.name));
            applyDevices(updated);
          }, 150);
        };

        // Initial scan + retry loop
        scanNow();

        // Load config into state
        setConfig(() => {
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
    return () => {
      cancelled = true;
      if (retryTimer) clearTimeout(retryTimer);
    };
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

  // Refresh MIDI devices — re-requests access and retries until devices appear.
  // Uses the same retry loop as init (up to 5s) for Bluetooth devices.
  const refreshDevices = useCallback(async () => {
    if (typeof navigator === 'undefined' || !('requestMIDIAccess' in navigator)) {
      console.warn('[MIDI] Web MIDI API not supported in this browser');
      return;
    }

    setIsRefreshingDevices(true);
    console.log('[MIDI] 🔄 Refreshing MIDI device list...');

    let retryCount = 0;
    const MAX_RETRIES = 10;

    const tryScan = async (): Promise<void> => {
      try {
        // Always re-request — Chrome returns the same MIDIAccess object but
        // the inputs map may have been updated since we last checked
        const access = await navigator.requestMIDIAccess({ sysex: false });
        midiAccessRef.current = access;

        // Keep onstatechange live
        access.onstatechange = (e: Event) => {
          const port = (e as MIDIConnectionEvent).port;
          console.log('[MIDI] onstatechange (refresh):', port?.name, port?.state);
          setTimeout(() => {
            if (!midiAccessRef.current) return;
            applyDevices(buildDeviceList(midiAccessRef.current));
          }, 150);
        };

        const devices = buildDeviceList(access);
        console.log(`[MIDI] ✅ Refresh scan #${retryCount}: found ${devices.length} device(s):`, devices.map(d => d.name));
        applyDevices(devices);

        if (devices.length === 0 && retryCount < MAX_RETRIES) {
          retryCount++;
          await new Promise(r => setTimeout(r, 500));
          return tryScan();
        }
      } catch (error) {
        console.error('[MIDI] ❌ Failed to refresh MIDI devices:', error);
      } finally {
        if (retryCount >= MAX_RETRIES || (midiAccessRef.current && buildDeviceList(midiAccessRef.current).length > 0)) {
          setIsRefreshingDevices(false);
        }
      }
    };

    await tryScan();
    setIsRefreshingDevices(false);
  }, [buildDeviceList, applyDevices]);

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

