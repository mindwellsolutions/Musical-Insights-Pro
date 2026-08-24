/**
 * MIDI Section Toggle Service
 * Persists per-user MIDI section toggle states to Supabase.
 *
 * Fallback chain:
 *   1. Supabase (when user is authenticated) — source of truth across devices.
 *   2. localStorage (anonymous visitors)      — survives page reloads only.
 *
 * Default: ALL four canonical sections are ON for every new user.
 */

import { createClient } from '@/lib/supabase/client-ssr';
import type { MIDISectionId } from '@/contexts/MIDISelectionContext';

export const DEFAULT_ENABLED_IDS: MIDISectionId[] = [
  'key-select',
  'scale-mode-select',
  'triads',
  'compatible-scales',
];

const LS_KEY = 'midi-section-enabled-ids';

// ── localStorage helpers (anonymous fallback) ─────────────────────────────────

export function loadEnabledIdsFromStorage(): Set<MIDISectionId> {
  try {
    const raw = localStorage.getItem(LS_KEY);
    // null → first visit → return the full default set (all ON)
    if (raw === null) return new Set(DEFAULT_ENABLED_IDS);
    return new Set(JSON.parse(raw) as MIDISectionId[]);
  } catch {
    return new Set(DEFAULT_ENABLED_IDS);
  }
}

export function saveEnabledIdsToStorage(ids: Set<MIDISectionId>) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify([...ids]));
  } catch { /* ignore quota errors */ }
}

// ── Supabase helpers (authenticated users) ────────────────────────────────────

/**
 * Load the user's saved toggle state from Supabase.
 * Returns null when the user has no row yet (first visit) — caller should
 * treat null as "use defaults" and immediately upsert the defaults.
 */
export async function loadEnabledIdsFromDB(
  userId: string,
): Promise<Set<MIDISectionId> | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('user_midi_section_toggles')
    .select('enabled_ids')
    .eq('user_id', userId)
    .single();

  if (error || !data) return null;

  try {
    const ids = data.enabled_ids as MIDISectionId[];
    return new Set(ids);
  } catch {
    return null;
  }
}

/**
 * Upsert the user's toggle state to Supabase.
 * Also mirrors to localStorage so the next cold render before auth resolves
 * shows the correct state.
 */
export async function saveEnabledIdsToDB(
  userId: string,
  ids: Set<MIDISectionId>,
): Promise<boolean> {
  // Always mirror to localStorage for fast initial render
  saveEnabledIdsToStorage(ids);

  const supabase = createClient();
  const { error } = await supabase
    .from('user_midi_section_toggles')
    .upsert(
      { user_id: userId, enabled_ids: [...ids] },
      { onConflict: 'user_id' },
    );

  if (error) {
    console.warn('[MIDISection] Failed to persist toggle state:', error.message);
  }
  return !error;
}

/**
 * Seed defaults for a brand-new user (no row exists yet).
 * Inserts all four canonical sections as ON.
 */
export async function seedDefaultToggleState(userId: string): Promise<void> {
  await saveEnabledIdsToDB(userId, new Set(DEFAULT_ENABLED_IDS));
}
