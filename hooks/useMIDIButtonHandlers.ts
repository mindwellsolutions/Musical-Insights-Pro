'use client';

/**
 * MIDI Button Handlers Hook
 * Listens for MIDI button presses and triggers corresponding webapp actions
 */

import { useEffect, useCallback, useRef } from 'react';
import { useMIDIPedal } from '@/components/midi/MIDIContext';
import { findButtonByMIDIMessage } from '@/lib/midi/midiUtils';
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
  const { config, isConnected, lastMIDIMessage } = useMIDIPedal();
  const { dispatchItemNav, nextSection, prevSection } = useMIDISelection();

  // Use refs to avoid re-creating effect when callbacks change
  const callbacksRef = useRef(callbacks);
  useEffect(() => {
    callbacksRef.current = callbacks;
  }, [callbacks]);

  // Keep context methods in refs to avoid stale closures
  const dispatchItemNavRef = useRef(dispatchItemNav);
  const nextSectionRef = useRef(nextSection);
  const prevSectionRef = useRef(prevSection);
  useEffect(() => {
    dispatchItemNavRef.current = dispatchItemNav;
    nextSectionRef.current = nextSection;
    prevSectionRef.current = prevSection;
  }, [dispatchItemNav, nextSection, prevSection]);

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
      // ── Next Section / Last Section — cycle the MIDI-focused section ──────
      case 'prev':
        // "Next Section" — advance to the next enabled section
        console.log('[MIDI Handlers] Next Section');
        nextSectionRef.current();
        // Also call legacy onPrev for backward-compat callers that still bind it
        callbacksRef.current.onPrev?.();
        break;
      case 'next':
        // "Last Section" — go back to previous enabled section
        console.log('[MIDI Handlers] Last Section');
        prevSectionRef.current();
        callbacksRef.current.onNext?.();
        break;
      // ── Switch Left / Right — navigate within the currently focused section ──
      case 'scale-left':
        console.log('[MIDI Handlers] Switch Left → dispatchItemNav(left)');
        dispatchItemNavRef.current('left');
        callbacksRef.current.onScaleLeft?.();
        break;
      case 'scale-right':
        console.log('[MIDI Handlers] Switch Right → dispatchItemNav(right)');
        dispatchItemNavRef.current('right');
        callbacksRef.current.onScaleRight?.();
        break;
      // ── item-left / item-right — same as scale-left/right (alternate mapping) ──
      case 'item-left':
        console.log('[MIDI Handlers] item-left → dispatchItemNav(left)');
        dispatchItemNavRef.current('left');
        break;
      case 'item-right':
        console.log('[MIDI Handlers] item-right → dispatchItemNav(right)');
        dispatchItemNavRef.current('right');
        break;
      case 'section-left':
      case 'section-right':
        // Legacy placeholders — covered by prev/next now
        break;
      case 'none':
        break;
    }
  }, []);

  // Listen for MIDI messages and trigger actions.
  // lastMIDIMessage is set by MIDIContext whenever the wired input fires —
  // it is already parsed MIDIMessageData so no re-parsing needed here.
  useEffect(() => {
    if (!lastMIDIMessage) return;
    if (!isConnected) return;
    if (!config.enabled) return;

    // Only trigger on button press (value > 0), not release
    if (lastMIDIMessage.value === 0) return;

    const button = findButtonByMIDIMessage(
      config.buttons,
      lastMIDIMessage.type,
      lastMIDIMessage.number,
      lastMIDIMessage.channel,
    );

    console.log('[MIDI Handlers] Button match:', button?.action ?? 'none');

    if (button && button.enabled && button.action !== 'none') {
      handleAction(button.action);
    }
  }, [lastMIDIMessage, isConnected, config, handleAction]);
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

