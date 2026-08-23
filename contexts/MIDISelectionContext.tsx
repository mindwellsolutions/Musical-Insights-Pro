'use client';

/**
 * MIDI Selection Context
 *
 * Two-level model:
 *   1. enabledSectionIds — sections the user has toggled ON with the MIDI icon.
 *      These are the sections that will be cycled through by Next/Last Section.
 *      Persisted to localStorage so the user's choices survive page reloads.
 *   2. activeSectionId  — the section currently focused (receives item-left /
 *      item-right). Cycles only through enabled sections.
 *
 * Usage:
 *   <MIDISelectionProvider>...</MIDISelectionProvider>
 *
 *   const { activeSectionId, enabledSectionIds, toggleEnabled, nextSection, prevSection } = useMIDISelection();
 */

import React, { createContext, useContext, useState, useCallback, useRef, useEffect, ReactNode } from 'react';

// ── Types ────────────────────────────────────────────────────────────────────

export type MIDISectionId =
  | 'key-select'
  | 'scale-mode-select'
  | 'compatible-scales'
  | 'triads'
  | 'manual-selection'
  | 'chord-neighborhood'
  | 'triad-tabs'
  | 'progression-degrees'
  | string;

export interface SectionCallbacks {
  onLeft: () => void;
  onRight: () => void;
}

/** Saved profile: just a name + the set of enabled section IDs */
export interface MIDISectionProfile {
  id: string;
  name: string;
  enabledIds: MIDISectionId[];
  createdAt: number;
}

export type PedalSwitchingMode = 'passive' | 'realtime';

/** Called when section cycling changes the active section */
export type SectionChangeListener = (newSectionId: MIDISectionId, prevSectionId: MIDISectionId | null) => void;

/** Called when a section's item-left/right navigation selects a new value */
export type ItemChangeListener = (sectionId: MIDISectionId, prev: string | null, next: string) => void;

interface MIDISelectionContextValue {
  // ── active focus (cycling target) ──────────────────────────────────────────
  activeSectionId: MIDISectionId | null;
  setActiveSectionId: (id: MIDISectionId | null) => void;

  // ── enabled set (which sections the user wants cycled) ────────────────────
  enabledSectionIds: Set<MIDISectionId>;
  toggleEnabled: (id: MIDISectionId) => void;
  isSectionEnabled: (id: MIDISectionId) => boolean;

  // ── section cycling via Next/Last Section pedal buttons ──────────────────
  nextSection: () => MIDISectionId | null;
  prevSection: () => MIDISectionId | null;

  // ── callbacks (item-left / item-right within the active section) ──────────
  registerCallbacks: (id: MIDISectionId, callbacks: SectionCallbacks) => void;
  unregisterCallbacks: (id: MIDISectionId) => void;
  dispatchItemNav: (direction: 'left' | 'right') => void;

  // ── registration order (used for cycling) ─────────────────────────────────
  registerSectionOrder: (id: MIDISectionId) => void;
  unregisterSectionOrder: (id: MIDISectionId) => void;

  // ── section change listeners (for toasts, scroll, etc.) ───────────────────
  onSectionChange: (listener: SectionChangeListener) => () => void;

  // ── item change reporting (sections call this after nav to report new value) ─
  reportItemChange: (sectionId: MIDISectionId, prev: string | null, next: string) => void;
  onItemChange: (listener: ItemChangeListener) => () => void;

  // ── pedal switching view mode ──────────────────────────────────────────────
  pedalSwitchingMode: PedalSwitchingMode;
  setPedalSwitchingMode: (mode: PedalSwitchingMode) => void;

  // ── profile save/load ─────────────────────────────────────────────────────
  sectionProfiles: MIDISectionProfile[];
  saveProfile: (name: string) => void;
  loadProfile: (profileId: string) => void;
  deleteProfile: (profileId: string) => void;
}

// ── localStorage helpers ──────────────────────────────────────────────────────

const ENABLED_KEY = 'midi-section-enabled-ids';
const PROFILES_KEY = 'midi-section-profiles';

function loadEnabledIds(): Set<MIDISectionId> {
  try {
    const raw = localStorage.getItem(ENABLED_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as MIDISectionId[]);
  } catch { return new Set(); }
}

function saveEnabledIds(ids: Set<MIDISectionId>) {
  try { localStorage.setItem(ENABLED_KEY, JSON.stringify([...ids])); } catch { /* ignore */ }
}

function loadProfiles(): MIDISectionProfile[] {
  try {
    const raw = localStorage.getItem(PROFILES_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as MIDISectionProfile[];
  } catch { return []; }
}

function saveProfiles(profiles: MIDISectionProfile[]) {
  try { localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles)); } catch { /* ignore */ }
}

// ── Context ───────────────────────────────────────────────────────────────────

const MIDISelectionContext = createContext<MIDISelectionContextValue | null>(null);

// ── Provider ──────────────────────────────────────────────────────────────────

export function MIDISelectionProvider({ children }: { children: ReactNode }) {
  const [activeSectionId, setActiveSectionIdState] = useState<MIDISectionId | null>(null);
  const [enabledSectionIds, setEnabledSectionIds] = useState<Set<MIDISectionId>>(new Set());
  const [sectionProfiles, setSectionProfiles] = useState<MIDISectionProfile[]>([]);
  const [pedalSwitchingMode, setPedalSwitchingModeState] = useState<PedalSwitchingMode>('passive');

  // Canonical cycling order — determines the sequence of Next/Last Section pedal steps.
  // Sections not in this list fall back to registration (DOM) order at the tail.
  const CANONICAL_ORDER: MIDISectionId[] = [
    'key-select',
    'scale-mode-select',
    'triads',
    'compatible-scales',
  ];

  // Registered section IDs (still tracked so we know what is mounted)
  const registeredOrder = useRef<MIDISectionId[]>([]);
  // Ref-count per section so duplicate toggles (hidden + visible) don't evict each other
  const registrationCount = useRef<Map<MIDISectionId, number>>(new Map());
  const callbacksMap = useRef<Map<MIDISectionId, SectionCallbacks>>(new Map());
  // Listener sets for section/item change events
  const sectionChangeListeners = useRef<Set<SectionChangeListener>>(new Set());
  const itemChangeListeners = useRef<Set<ItemChangeListener>>(new Set());
  // Ref to keep activeSectionId accessible synchronously in nextSection/prevSection
  const activeSectionIdRef = useRef<MIDISectionId | null>(null);
  useEffect(() => { activeSectionIdRef.current = activeSectionId; }, [activeSectionId]);

  // Load persisted state on mount (client-only)
  useEffect(() => {
    setEnabledSectionIds(loadEnabledIds());
    setSectionProfiles(loadProfiles());
  }, []);

  // ── Registration ───────────────────────────────────────────────────────────

  const registerSectionOrder = useCallback((id: MIDISectionId) => {
    const count = (registrationCount.current.get(id) ?? 0) + 1;
    registrationCount.current.set(id, count);
    if (!registeredOrder.current.includes(id)) {
      registeredOrder.current = [...registeredOrder.current, id];
    }
  }, []);

  const unregisterSectionOrder = useCallback((id: MIDISectionId) => {
    const count = (registrationCount.current.get(id) ?? 1) - 1;
    registrationCount.current.set(id, count);
    // Only remove from order when the last instance unmounts
    if (count <= 0) {
      registrationCount.current.delete(id);
      registeredOrder.current = registeredOrder.current.filter(s => s !== id);
      setActiveSectionIdState(prev => (prev === id ? null : prev));
    }
  }, []);

  const registerCallbacks = useCallback((id: MIDISectionId, callbacks: SectionCallbacks) => {
    callbacksMap.current.set(id, callbacks);
  }, []);

  const unregisterCallbacks = useCallback((id: MIDISectionId) => {
    // Only delete if no other instance is still registered
    const count = registrationCount.current.get(id) ?? 0;
    if (count <= 0) {
      callbacksMap.current.delete(id);
    }
  }, []);

  // ── Enabled toggle ─────────────────────────────────────────────────────────

  const toggleEnabled = useCallback((id: MIDISectionId) => {
    setEnabledSectionIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        // If this was the active section, clear it
        setActiveSectionIdState(cur => (cur === id ? null : cur));
      } else {
        next.add(id);
      }
      saveEnabledIds(next);
      return next;
    });
  }, []);

  const isSectionEnabled = useCallback((id: MIDISectionId) => {
    return enabledSectionIds.has(id);
  }, [enabledSectionIds]);

  const setActiveSectionId = useCallback((id: MIDISectionId | null) => {
    setActiveSectionIdState(id);
  }, []);

  // ── Section cycling ────────────────────────────────────────────────────────

  /**
   * Returns the ordered list of enabled section IDs.
   * Uses CANONICAL_ORDER for the known sections, then appends any additional
   * registered+enabled sections that aren't in the canonical list.
   * A section does NOT need to be currently mounted (registered) to appear —
   * it only needs to be enabled. Callbacks are still required for item-nav.
   */
  const getEnabledOrdered = useCallback((): MIDISectionId[] => {
    const enabled = enabledSectionIds;
    // 1. Canonical slots that are enabled (regardless of mount state)
    const canonical = CANONICAL_ORDER.filter(id => enabled.has(id));
    // 2. Any extra registered+enabled sections not in the canonical list
    const extras = registeredOrder.current.filter(
      id => enabled.has(id) && !CANONICAL_ORDER.includes(id)
    );
    return [...canonical, ...extras];
  }, [enabledSectionIds]); // eslint-disable-line react-hooks/exhaustive-deps

  const nextSection = useCallback((): MIDISectionId | null => {
    const ordered = getEnabledOrdered();
    if (ordered.length === 0) return null;
    const prev = activeSectionIdRef.current;
    const newId = (!prev || !ordered.includes(prev))
      ? ordered[0]
      : ordered[(ordered.indexOf(prev) + 1) % ordered.length];
    setActiveSectionIdState(newId);
    // Fire section change listeners and optionally scroll to section (realtime mode)
    sectionChangeListeners.current.forEach(fn => fn(newId, prev));
    return newId;
  }, [getEnabledOrdered]);

  const prevSection = useCallback((): MIDISectionId | null => {
    const ordered = getEnabledOrdered();
    if (ordered.length === 0) return null;
    const prev = activeSectionIdRef.current;
    const newId = (!prev || !ordered.includes(prev))
      ? ordered[ordered.length - 1]
      : ordered[(ordered.indexOf(prev) - 1 + ordered.length) % ordered.length];
    setActiveSectionIdState(newId);
    sectionChangeListeners.current.forEach(fn => fn(newId, prev));
    return newId;
  }, [getEnabledOrdered]);

  // ── Item nav dispatch ──────────────────────────────────────────────────────

  const dispatchItemNav = useCallback((direction: 'left' | 'right') => {
    const activeId = activeSectionId;
    if (!activeId) return;
    const cb = callbacksMap.current.get(activeId);
    if (!cb) return;
    if (direction === 'left') cb.onLeft();
    else cb.onRight();
  }, [activeSectionId]);

  // ── Listener registration ─────────────────────────────────────────────────

  const onSectionChange = useCallback((listener: SectionChangeListener) => {
    sectionChangeListeners.current.add(listener);
    return () => { sectionChangeListeners.current.delete(listener); };
  }, []);

  const reportItemChange = useCallback((sectionId: MIDISectionId, prev: string | null, next: string) => {
    itemChangeListeners.current.forEach(fn => fn(sectionId, prev, next));
  }, []);

  const onItemChange = useCallback((listener: ItemChangeListener) => {
    itemChangeListeners.current.add(listener);
    return () => { itemChangeListeners.current.delete(listener); };
  }, []);

  const setPedalSwitchingMode = useCallback((mode: PedalSwitchingMode) => {
    setPedalSwitchingModeState(mode);
  }, []);

  // ── Profile management ─────────────────────────────────────────────────────

  const saveProfile = useCallback((name: string) => {
    const profile: MIDISectionProfile = {
      id: `${Date.now()}`,
      name: name.trim(),
      enabledIds: [...enabledSectionIds],
      createdAt: Date.now(),
    };
    setSectionProfiles(prev => {
      const next = [...prev, profile];
      saveProfiles(next);
      return next;
    });
  }, [enabledSectionIds]);

  const loadProfile = useCallback((profileId: string) => {
    const profile = sectionProfiles.find(p => p.id === profileId);
    if (!profile) return;
    const next = new Set<MIDISectionId>(profile.enabledIds);
    setEnabledSectionIds(next);
    saveEnabledIds(next);
    setActiveSectionIdState(null);
  }, [sectionProfiles]);

  const deleteProfile = useCallback((profileId: string) => {
    setSectionProfiles(prev => {
      const next = prev.filter(p => p.id !== profileId);
      saveProfiles(next);
      return next;
    });
  }, []);

  return (
    <MIDISelectionContext.Provider
      value={{
        activeSectionId,
        setActiveSectionId,
        enabledSectionIds,
        toggleEnabled,
        isSectionEnabled,
        nextSection,
        prevSection,
        registerCallbacks,
        unregisterCallbacks,
        dispatchItemNav,
        registerSectionOrder,
        unregisterSectionOrder,
        onSectionChange,
        reportItemChange,
        onItemChange,
        pedalSwitchingMode,
        setPedalSwitchingMode,
        sectionProfiles,
        saveProfile,
        loadProfile,
        deleteProfile,
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
