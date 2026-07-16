'use client';

/**
 * MIDI Button Handlers Hook
 * Listens for MIDI button presses and triggers corresponding webapp actions
 */

import { useEffect, useCallback, useRef } from 'react';
import { useMIDIMessage } from '@react-midi/hooks';
import { useMIDIPedal } from '@/components/midi/MIDIContext';
import { parseMIDIMessage, findButtonByMIDIMessage } from '@/lib/midi/midiUtils';
import { MIDIButtonAction, MIDI_ACTION_LABELS } from '@/lib/midi/midiTypes';
import { useMIDISelection } from '@/contexts/MIDISelectionContext';
import { toast } from 'sonner';

interface MIDIButtonHandlersCallbacks {
  onPrev?: () => void;
  onNext?: () => void;
  onScaleLeft?: () => void;
  onScaleRight?: () => void;
  onItemLeft?: () => void;
  onItemRight?: () => void;
}

/**
 * Hook to handle MIDI button presses and trigger webapp actions
 */
export function useMIDIButtonHandlers(callbacks: MIDIButtonHandlersCallbacks) {
  const { config, isConnected } = useMIDIPedal();
  const midiMessage = useMIDIMessage();
  const { dispatchItemNav } = useMIDISelection();
  
  // Use refs to avoid re-creating effect when callbacks change
  const callbacksRef = useRef(callbacks);
  useEffect(() => {
    callbacksRef.current = callbacks;
  }, [callbacks]);

  // Keep dispatchItemNav in a ref to avoid stale closures in handleAction
  const dispatchItemNavRef = useRef(dispatchItemNav);
  useEffect(() => {
    dispatchItemNavRef.current = dispatchItemNav;
  }, [dispatchItemNav]);

  // Debounce state to prevent double-triggers
  const lastTriggerTime = useRef<Record<string, number>>({});
  const DEBOUNCE_MS = 200; // 200ms debounce

  const handleAction = useCallback((action: MIDIButtonAction) => {
    const now = Date.now();
    const lastTime = lastTriggerTime.current[action] || 0;

    // Debounce: ignore if triggered too recently
    if (now - lastTime < DEBOUNCE_MS) {
      return;
    }

    lastTriggerTime.current[action] = now;

    // Show toast notification
    const actionLabel = MIDI_ACTION_LABELS[action];
    toast.success(`MIDI: ${actionLabel}`, {
      duration: 1000,
    });

    // Execute the appropriate callback
    console.log('[MIDI Handlers] Executing action:', action);

    switch (action) {
      case 'prev':
        console.log('[MIDI Handlers] Calling onPrev, exists:', !!callbacksRef.current.onPrev);
        callbacksRef.current.onPrev?.();
        break;
      case 'next':
        console.log('[MIDI Handlers] Calling onNext, exists:', !!callbacksRef.current.onNext);
        callbacksRef.current.onNext?.();
        break;
      case 'scale-left':
        console.log('[MIDI Handlers] Calling onScaleLeft, exists:', !!callbacksRef.current.onScaleLeft);
        callbacksRef.current.onScaleLeft?.();
        break;
      case 'scale-right':
        console.log('[MIDI Handlers] Calling onScaleRight, exists:', !!callbacksRef.current.onScaleRight);
        callbacksRef.current.onScaleRight?.();
        break;
      case 'item-left':
        console.log('[MIDI Handlers] Dispatching item-left to active section');
        dispatchItemNavRef.current('left');
        break;
      case 'item-right':
        console.log('[MIDI Handlers] Dispatching item-right to active section');
        dispatchItemNavRef.current('right');
        break;
      case 'section-left':
      case 'section-right':
        // Future: cycle active section
        break;
      case 'none':
        // No action
        break;
    }
  }, []);

  // Listen for MIDI messages and trigger actions
  useEffect(() => {
    if (!midiMessage) return;

    console.log('[MIDI Handlers] Message received:', {
      isConnected,
      configEnabled: config.enabled,
      buttonsCount: config.buttons.length,
      midiMessage: midiMessage.data
    });

    if (!isConnected) {
      console.log('[MIDI Handlers] Not connected, ignoring message');
      return;
    }

    if (!config.enabled) {
      console.log('[MIDI Handlers] Config not enabled, ignoring message');
      return;
    }

    const parsed = parseMIDIMessage(midiMessage.data);
    console.log('[MIDI Handlers] Parsed message:', parsed);

    if (!parsed) {
      console.log('[MIDI Handlers] Failed to parse message, ignoring');
      return;
    }

    // Only trigger on button press (value > 0), not release
    // Allow unknown types through since they might be valid button presses
    if (parsed.value === 0) {
      console.log('[MIDI Handlers] Button release (value=0), ignoring');
      return;
    }

    // Find button configuration matching this MIDI message
    // Pass raw data for exact matching
    const button = findButtonByMIDIMessage(
      config.buttons,
      parsed.type,
      parsed.number,
      parsed.channel,
      parsed.rawData
    );

    console.log('[MIDI Handlers] Button found:', button);

    if (button && button.enabled && button.action !== 'none') {
      console.log('[MIDI Handlers] ✅ Triggering action:', button.action);
      handleAction(button.action);
    } else {
      console.log('[MIDI Handlers] ❌ No action to trigger:', {
        buttonFound: !!button,
        buttonEnabled: button?.enabled,
        buttonAction: button?.action
      });
    }
  }, [midiMessage, isConnected, config, handleAction]);
}

/**
 * Hook to get MIDI button handler callbacks
 * This is a convenience hook that returns the callback structure
 */
export function useMIDIButtonCallbacks() {
  const callbacks = useRef<MIDIButtonHandlersCallbacks>({});
  
  const setCallback = useCallback((action: keyof MIDIButtonHandlersCallbacks, callback: () => void) => {
    callbacks.current[action] = callback;
  }, []);

  const getCallbacks = useCallback(() => callbacks.current, []);

  return { setCallback, getCallbacks };
}

