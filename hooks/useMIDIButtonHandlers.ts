'use client';

/**
 * MIDI Button Handlers Hook
 * Listens for MIDI button presses and triggers corresponding webapp actions.
 * Shows premium top-right toasts with section/selection info and NOTE_COLORS squares.
 */

import { useEffect, useCallback, useRef } from 'react';
import { useMIDIPedal } from '@/components/midi/MIDIContext';
import { findButtonByMIDIMessage } from '@/lib/midi/midiUtils';
import { MIDIButtonAction } from '@/lib/midi/midiTypes';
import { useMIDISelection, MIDISectionId } from '@/contexts/MIDISelectionContext';
import { NOTE_COLORS } from '@/lib/musicTheory';
import { toast } from 'sonner';

// ── Human-readable section names ──────────────────────────────────────────────

const SECTION_DISPLAY_NAMES: Record<string, string> = {
  'key-select': 'Key Select',
  'scale-mode-select': 'Scale Mode',
  'compatible-scales': 'Compatible Scales',
  'triads': 'Triads',
  'manual-selection': 'Manual Selection',
  'chord-neighborhood': 'Chord Neighborhood',
  'triad-tabs': 'Triad Tabs',
  'progression-degrees': 'Progression Degrees',
};

function getSectionName(id: MIDISectionId): string {
  return SECTION_DISPLAY_NAMES[id] ?? id;
}

// ── Note square renderer (inline SVG-like div) ────────────────────────────────

function noteSquareHtml(note: string): string {
  const color = NOTE_COLORS[note] ?? '#6b7280';
  return `<span style="display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;border-radius:5px;background:${color};color:#fff;font-size:10px;font-weight:700;flex-shrink:0;line-height:1;">${note}</span>`;
}

// ── Toast helpers ─────────────────────────────────────────────────────────────

/** Extract note/key from a selection string if it starts with a known note */
function extractNote(str: string): string | null {
  // Check sharp/flat two-char notes first, then single-char
  const twoChar = str.slice(0, 2);
  if (NOTE_COLORS[twoChar]) return twoChar;
  const oneChar = str.slice(0, 1);
  if (NOTE_COLORS[oneChar]) return oneChar;
  return null;
}

function showSectionToast(newId: MIDISectionId, prevId: MIDISectionId | null, direction: 'next' | 'prev') {
  const arrow = direction === 'next' ? '→' : '←';
  const newName = getSectionName(newId);
  const prevName = prevId ? getSectionName(prevId) : null;

  toast(
    // Sonner accepts React nodes via JSX — but we're in a .ts file, so use the message + description pattern
    newName,
    {
      description: prevName ? `Previously: ${prevName}` : undefined,
      duration: 2200,
      position: 'top-right',
      style: {
        background: 'rgba(14,14,22,0.97)',
        border: '1px solid rgba(255,255,255,0.10)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
        borderRadius: 12,
        color: '#fff',
      },
      icon: arrow === '→' ? '⏭' : '⏮',
    }
  );
}

function showItemChangeToast(sectionId: MIDISectionId, prev: string | null, next: string) {
  const sectionName = getSectionName(sectionId);
  const prevNote = prev ? extractNote(prev) : null;
  const nextNote = extractNote(next);

  // Build HTML string for the description line
  const prevPart = prev
    ? `<span style="opacity:0.45;font-size:11px;">${prevNote ? noteSquareHtml(prevNote) + ' ' : ''}${prev}</span> <span style="opacity:0.5;">→</span> `
    : '';
  const nextPart = `<span style="font-size:13px;font-weight:600;">${nextNote ? noteSquareHtml(nextNote) + ' ' : ''}${next}</span>`;

  toast(sectionName, {
    description: `${prevPart}${nextPart}` as unknown as string,
    duration: 2000,
    position: 'top-right',
    style: {
      background: 'rgba(14,14,22,0.97)',
      border: '1px solid rgba(255,255,255,0.10)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
      borderRadius: 12,
      color: '#fff',
    },
    icon: '🎵',
  });
}

// ── Real-time scroll helper ────────────────────────────────────────────────────

function scrollToSection(sectionId: MIDISectionId) {
  // Sections should have data-midi-section-id attribute on their container
  const el = document.querySelector(`[data-midi-section-id="${sectionId}"]`);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

// ── Interface ─────────────────────────────────────────────────────────────────

interface MIDIButtonHandlersCallbacks {
  onPrev?: () => void;
  onNext?: () => void;
  onScaleLeft?: () => void;
  onScaleRight?: () => void;
  onItemLeft?: () => void;
  onItemRight?: () => void;
}

// ── Main hook ─────────────────────────────────────────────────────────────────

/**
 * Hook to handle MIDI button presses and trigger webapp actions.
 * Subscribes to section/item change events to show premium toasts.
 */
export function useMIDIButtonHandlers(callbacks: MIDIButtonHandlersCallbacks) {
  const { config, isConnected, lastMIDIMessage } = useMIDIPedal();
  const {
    dispatchItemNav, nextSection, prevSection,
    onSectionChange, onItemChange, pedalSwitchingMode,
  } = useMIDISelection();

  // Use refs to avoid re-creating effect when callbacks change
  const callbacksRef = useRef(callbacks);
  useEffect(() => { callbacksRef.current = callbacks; }, [callbacks]);

  // Keep context methods in refs to avoid stale closures
  const dispatchItemNavRef = useRef(dispatchItemNav);
  const nextSectionRef = useRef(nextSection);
  const prevSectionRef = useRef(prevSection);
  const pedalModeRef = useRef(pedalSwitchingMode);
  useEffect(() => {
    dispatchItemNavRef.current = dispatchItemNav;
    nextSectionRef.current = nextSection;
    prevSectionRef.current = prevSection;
    pedalModeRef.current = pedalSwitchingMode;
  }, [dispatchItemNav, nextSection, prevSection, pedalSwitchingMode]);

  // Subscribe to section change events — show toast + optionally scroll
  useEffect(() => {
    const unsub = onSectionChange((newId, prevId) => {
      showSectionToast(newId, prevId, 'next'); // toast for both next/prev — direction encoded in icon
      if (pedalModeRef.current === 'realtime') {
        setTimeout(() => scrollToSection(newId), 50); // slight delay for state to settle
      }
    });
    return unsub;
  }, [onSectionChange]);

  // Subscribe to item change events — show toast with key/note squares
  useEffect(() => {
    const unsub = onItemChange((sectionId, prev, next) => {
      showItemChangeToast(sectionId, prev, next);
    });
    return unsub;
  }, [onItemChange]);

  // Debounce state to prevent double-triggers
  const lastTriggerTime = useRef<Record<string, number>>({});
  const DEBOUNCE_MS = 200;

  const handleAction = useCallback((action: MIDIButtonAction) => {
    const now = Date.now();
    if (now - (lastTriggerTime.current[action] || 0) < DEBOUNCE_MS) return;
    lastTriggerTime.current[action] = now;

    console.log('[MIDI Handlers] Executing action:', action);

    switch (action) {
      // ── Next Section / Last Section — cycle the MIDI-focused section ──────
      case 'prev':
        nextSectionRef.current();
        callbacksRef.current.onPrev?.();
        break;
      case 'next':
        prevSectionRef.current();
        callbacksRef.current.onNext?.();
        break;
      // ── Switch Left / Right — navigate within the currently focused section ──
      case 'scale-left':
        dispatchItemNavRef.current('left');
        callbacksRef.current.onScaleLeft?.();
        break;
      case 'scale-right':
        dispatchItemNavRef.current('right');
        callbacksRef.current.onScaleRight?.();
        break;
      case 'item-left':
        dispatchItemNavRef.current('left');
        break;
      case 'item-right':
        dispatchItemNavRef.current('right');
        break;
      case 'section-left':
      case 'section-right':
      case 'none':
        break;
    }
  }, []);

  useEffect(() => {
    if (!lastMIDIMessage || !isConnected || !config.enabled) return;
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

