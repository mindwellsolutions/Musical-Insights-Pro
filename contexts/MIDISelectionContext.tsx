'use client';

/**
 * MIDI Selection Context
 *
 * Tracks which UI section is currently "MIDI-active" (i.e., will respond to
 * item-left / item-right pedal presses). Only one section can be active at a
 * time across the entire webapp — radio behaviour.
 *
 * Usage:
 *   // Provider: wrap app root (see app/layout.tsx or page.tsx)
 *   <MIDISelectionProvider>...</MIDISelectionProvider>
 *
 *   // Consumer: inside any controllable section
 *   const { activeSectionId, setActiveSectionId } = useMIDISelection();
 */

import React, { createContext, useContext, useState, useCallback, useRef, ReactNode } from 'react';

// ── Types ────────────────────────────────────────────────────────────────────

export type MIDISectionId =
  | 'compatible-scales'
  | 'triads'
  | 'manual-selection'
  | 'chord-neighborhood'
  | 'triad-tabs'
  | string; // allow custom section IDs from future feature areas

export interface SectionCallbacks {
  onLeft: () => void;
  onRight: () => void;
}

interface MIDISelectionContextValue {
  /** ID of the section currently claiming MIDI control, or null if none */
  activeSectionId: MIDISectionId | null;
  /** Set a section as active (pass null to deactivate all) */
  setActiveSectionId: (id: MIDISectionId | null) => void;
  /** Toggle: if the given id is already active, deactivate; else activate */
  toggleSectionId: (id: MIDISectionId) => void;
  /**
   * Register callbacks for a section so the MIDI handler can route
   * item-left / item-right to them when that section is active.
   */
  registerCallbacks: (id: MIDISectionId, callbacks: SectionCallbacks) => void;
  /** Remove callbacks when a section unmounts */
  unregisterCallbacks: (id: MIDISectionId) => void;
  /**
   * Dispatch an item navigation action to the currently active section.
   * Called by useMIDIButtonHandlers when it receives item-left / item-right.
   */
  dispatchItemNav: (direction: 'left' | 'right') => void;
}

// ── Context ───────────────────────────────────────────────────────────────────

const MIDISelectionContext = createContext<MIDISelectionContextValue | null>(null);

// ── Provider ──────────────────────────────────────────────────────────────────

export function MIDISelectionProvider({ children }: { children: ReactNode }) {
  const [activeSectionId, setActiveSectionIdState] = useState<MIDISectionId | null>(null);
  const callbacksMap = useRef<Map<MIDISectionId, SectionCallbacks>>(new Map());

  const setActiveSectionId = useCallback((id: MIDISectionId | null) => {
    setActiveSectionIdState(id);
  }, []);

  const toggleSectionId = useCallback((id: MIDISectionId) => {
    setActiveSectionIdState(prev => (prev === id ? null : id));
  }, []);

  const registerCallbacks = useCallback((id: MIDISectionId, callbacks: SectionCallbacks) => {
    callbacksMap.current.set(id, callbacks);
  }, []);

  const unregisterCallbacks = useCallback((id: MIDISectionId) => {
    callbacksMap.current.delete(id);
    // If the deregistering section was active, clear the active selection
    setActiveSectionIdState(prev => (prev === id ? null : prev));
  }, []);

  const dispatchItemNav = useCallback((direction: 'left' | 'right') => {
    const activeId = activeSectionId;
    if (!activeId) return;
    const cb = callbacksMap.current.get(activeId);
    if (!cb) return;
    if (direction === 'left') cb.onLeft();
    else cb.onRight();
  }, [activeSectionId]);

  return (
    <MIDISelectionContext.Provider
      value={{
        activeSectionId,
        setActiveSectionId,
        toggleSectionId,
        registerCallbacks,
        unregisterCallbacks,
        dispatchItemNav,
      }}
    >
      {children}
    </MIDISelectionContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useMIDISelection(): MIDISelectionContextValue {
  const ctx = useContext(MIDISelectionContext);
  if (!ctx) {
    throw new Error('useMIDISelection must be used inside <MIDISelectionProvider>');
  }
  return ctx;
}
