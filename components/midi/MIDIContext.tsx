'use client';

/**
 * MIDI Context Provider
 * Manages MIDI device connections, configuration, and state
 */

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from 'react';
import { useMIDIInputs, useMIDIMessage } from '@react-midi/hooks';
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
  buttonExists,
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
  const [learningButtonId, setLearningButtonId] = useState<string | null>(null); // Now stores action name when learning
  const [lastMIDIMessage, setLastMIDIMessage] = useState<MIDIMessageData | null>(null);
  const [isDetectingButtons, setIsDetectingButtons] = useState(false);

  // Track when learning mode started to ignore old messages
  const learningStartTime = useRef<number>(0);

  // Track the actual midiMessage object reference to detect truly new messages
  const lastMidiMessageRef = useRef<any>(null);

  // Use react-midi-hooks to get MIDI inputs
  const { inputs, selectInput, selectedInputId } = useMIDIInputs();
  const midiMessage = useMIDIMessage();

  // Load configuration from localStorage and server on mount
  useEffect(() => {
    const loadConfig = async () => {
      // First, load from localStorage (immediate)
      const localConfig = loadMIDIConfig();
      console.log('[MIDI Context] Loaded config from localStorage:', localConfig);

      // If there's a device and buttons configured, ensure enabled is true
      let configToSet = {
        ...localConfig,
        enabled: localConfig.deviceId && localConfig.buttons.length > 0 ? true : localConfig.enabled,
      };

      console.log('[MIDI Context] Setting config with enabled:', configToSet.enabled);
      setConfig(configToSet);

      // Then, try to load from server (may override localStorage)
      try {
        const response = await fetch('/api/midi/config');
        if (response.ok) {
          const data = await response.json();
          if (data.config) {
            console.log('[MIDI Context] Loaded config from server:', data.config);
            configToSet = {
              ...data.config,
              enabled: data.config.deviceId && data.config.buttons.length > 0 ? true : data.config.enabled,
            };
            setConfig(configToSet);
            // Also save to localStorage to keep them in sync
            saveMIDIConfig(configToSet);
          }
        }
      } catch (error) {
        console.error('[MIDI Context] Error loading config from server:', error);
      }

      // If there's a saved device ID, try to select it
      if (configToSet.deviceId && inputs.length > 0) {
        const device = inputs.find(input => input.id === configToSet.deviceId);
        if (device) {
          selectInput(configToSet.deviceId);
        }
      }
    };

    loadConfig();
  }, [inputs, selectInput]);

  // Log config changes
  useEffect(() => {
    console.log('[MIDI Context] Config state changed:', {
      enabled: config.enabled,
      deviceId: config.deviceId,
      deviceName: config.deviceName,
      buttonsCount: config.buttons.length,
      buttons: config.buttons,
    });
  }, [config]);

  // Convert Web MIDI API inputs to our device info format
  // Note: @react-midi/hooks Input type doesn't have a 'state' property
  // We assume all inputs in the array are connected
  const availableDevices: MIDIDeviceInfo[] = inputs.map(input => ({
    id: input.id,
    name: input.name || 'Unknown Device',
    manufacturer: input.manufacturer || '',
    connected: true, // If it's in the inputs array, it's connected
    state: 'connected' as const,
  }));

  // Get currently selected device
  const selectedDevice = availableDevices.find(d => d.id === selectedInputId) || null;

  // Check if connected (if we have a selected input ID and it exists in inputs)
  const isConnected = selectedInputId !== null && inputs.some(i => i.id === selectedInputId);

  // Process incoming MIDI messages
  useEffect(() => {
    if (!midiMessage) return;

    // Check if this is the same message object we already processed
    // This prevents re-processing when useEffect re-runs due to dependency changes
    if (midiMessage === lastMidiMessageRef.current) {
      console.log('[MIDI] ⚠️ Skipping - same message object reference (useEffect re-run)');
      return;
    }

    // This is a truly new message - update the reference
    lastMidiMessageRef.current = midiMessage;
    console.log('[MIDI] 🆕 New message object detected');
    console.log('[MIDI] Raw message received:', midiMessage.data);

    const parsed = parseMIDIMessage(midiMessage.data);
    console.log('[MIDI] Parsed message:', parsed);

    if (!parsed || parsed.type === 'unknown') {
      console.log('[MIDI] Message ignored - unknown type');
      return;
    }

    const messageData: MIDIMessageData = {
      type: parsed.type,
      number: parsed.number,
      value: parsed.value,
      channel: parsed.channel,
      timestamp: Date.now(),
    };

    // Always update last message for debugging
    setLastMIDIMessage(messageData);
    console.log('[MIDI] Message data:', messageData);

    // If in learning mode, assign the MIDI message to the action being learned
    // Accept CC, Note On (value > 0), and Program Change messages
    const isValidForDetection =
      parsed.type === 'cc' ||
      parsed.type === 'program' ||
      (parsed.type === 'note' && parsed.value > 0);

    // Only process messages that arrived AFTER learning mode started
    const isNewMessage = messageData.timestamp > learningStartTime.current;

    // Debug logging for learning mode
    if (isLearning && learningButtonId) {
      console.log('[MIDI] Learning mode check:', {
        isLearning,
        learningButtonId,
        isValidForDetection,
        isNewMessage,
        messageTimestamp: messageData.timestamp,
        learningStartTime: learningStartTime.current,
        willProcess: isValidForDetection && isNewMessage
      });
    }

    if (isLearning && learningButtonId && isValidForDetection && isNewMessage) {
      const actionToAssign = learningButtonId; // learningButtonId now contains the action name
      console.log('[MIDI] ✅ PROCESSING MESSAGE - Learning mode active for action:', actionToAssign);

      setConfig(prev => {
        // Check if this exact MIDI message is already assigned to a different action
        const existingButton = prev.buttons.find(b => {
          // First check raw data match if available
          if (parsed.rawData && b.rawMidiData && b.rawMidiData.length > 0) {
            const rawMatch = parsed.rawData.length === b.rawMidiData.length &&
              parsed.rawData.every((byte, idx) => byte === b.rawMidiData![idx]);
            if (rawMatch) return true;
          }

          // Fallback to parsed message matching
          if (b.messageType !== parsed.type || b.channel !== parsed.channel) return false;
          if (parsed.type === 'cc' && b.ccNumber === parsed.number) return true;
          if (parsed.type === 'note' && b.noteNumber === parsed.number) return true;
          if (parsed.type === 'program' && b.programNumber === parsed.number) return true;
          return false;
        });

        let updatedButtons;

        if (existingButton) {
          // Update existing button with new action
          console.log('[MIDI] Updating existing button with new action');
          updatedButtons = prev.buttons.map(button => {
            if (button.id === existingButton.id) {
              return {
                ...button,
                action: actionToAssign as any,
                enabled: true,
              };
            }
            // If another button had this action, clear it
            if (button.action === actionToAssign) {
              return {
                ...button,
                action: 'none' as any,
              };
            }
            return button;
          });
        } else {
          // Create new button for this action
          console.log('[MIDI] Creating new button for action');
          const newButton = createButtonFromMessage(
            parsed.type,
            parsed.number,
            parsed.channel,
            prev.buttons.length,
            parsed.rawData
          );

          // Clear any existing button with this action
          updatedButtons = prev.buttons.map(b =>
            b.action === actionToAssign ? { ...b, action: 'none' as any } : b
          );

          // Add new button with the action
          updatedButtons.push({
            ...newButton,
            action: actionToAssign as any,
          });
        }

        const newConfig = {
          ...prev,
          buttons: updatedButtons,
        };

        // Auto-save the configuration after learning
        console.log('[MIDI] Saving configuration after learning...');
        saveMIDIConfig(newConfig);

        return newConfig;
      });

      // Stop learning after capturing
      console.log('[MIDI] ✅ Stopping learning mode - assignment complete');
      setIsLearning(false);
      setLearningButtonId(null);
      learningStartTime.current = 0; // Reset the timestamp
      console.log('[MIDI] Action assigned and saved successfully');
    }
  }, [midiMessage, isLearning, learningButtonId, isDetectingButtons]);

  // Update configuration
  const updateConfig = useCallback((updates: Partial<MIDIPedalConfig>) => {
    setConfig(prev => {
      const newConfig = { ...prev, ...updates };
      console.log('[MIDI Context] Updating config:', newConfig);
      saveMIDIConfig(newConfig);
      return newConfig;
    });
  }, []);

  // Select device
  const selectDevice = useCallback((deviceId: string) => {
    selectInput(deviceId);
    const device = availableDevices.find(d => d.id === deviceId);
    if (device) {
      updateConfig({
        deviceId: device.id,
        deviceName: formatDeviceName(device.name, device.manufacturer),
        enabled: true,
      });
    }
  }, [selectInput, availableDevices, updateConfig]);

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

