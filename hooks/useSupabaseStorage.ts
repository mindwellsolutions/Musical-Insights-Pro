/**
 * useSupabaseStorage Hook
 * Drop-in replacement for useLocalStorage that uses Supabase for persistence
 * Maintains the same API for backward compatibility
 * Now with React Query integration for optimal caching and instant loads
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client-ssr';
import { normalizeScaleNameFromDisplay } from '@/lib/music-theory-database/scale-mapping';
import { normalizeNoteFromDisplay } from '@/lib/musicTheory';
import { queryKeys } from '@/lib/react-query/query-client';

const DEBOUNCE_DELAY = 1000; // 1 second debounce for saves

// Map of localStorage keys to Supabase column names
const KEY_TO_COLUMN_MAP: Record<string, string> = {
  // Core settings
  'guitar-app-theme': 'theme',
  'guitar-app-root-note': 'root_note',
  'guitar-app-scale-name': 'scale_name',
  'guitar-app-string-count': 'string_count',
  'guitar-app-tuning-name': 'tuning_name',
  'guitar-app-is-inverted': 'is_inverted',

  // Chord and guide tone settings
  'guitar-app-selected-chord-notes': 'selected_chord_notes',
  'guitar-app-selected-guide-tones': 'selected_guide_tones',
  'guitar-app-chord-highlight-color': 'chord_highlight_color',
  'guitar-app-guide-tones-color': 'guide_tones_color',
  'guitar-app-show-chord-tones': 'show_chord_tones',
  'guitar-app-show-guide-tones': 'show_guide_tones',
  'guitar-app-show-chord-glow': 'show_chord_glow',

  // Fretboard display settings
  'guitar-app-fret-dot-color': 'fret_dot_color',
  'guitar-app-show-middle-dots': 'show_middle_dots',
  'guitar-app-fret-count': 'fret_count',
  'guitar-app-color-guide-enabled': 'color_guide_enabled',
  'guitar-app-glow-opacity': 'glow_opacity',
  'guitar-app-show-white-border': 'show_white_border',
  'guitar-app-only-chord-tones': 'only_chord_tones',
  'guitar-app-selected-chord-tone-types': 'selected_chord_tone_types',

  // Auto features
  'guitar-app-auto-recommendation': 'auto_recommendation',
  'guitar-app-auto-switch-fretboard': 'auto_switch_fretboard',
  'guitar-app-focus-mode': 'focus_mode',
  'guitar-app-focus-mode-position': 'focus_mode_position',

  // Circle of 5ths settings
  'guitar-app-show-circle-of-5ths': 'show_circle_of_5ths',
  'guitar-app-circle-of-5ths-position': 'circle_of_5ths_position',
  'guitar-app-circle-of-5ths-offset': 'circle_of_5ths_offset',
  'circle-of-5ths-collapsed': 'circle_of_5ths_collapsed',
  'guitar-app-circle-fretboard-glow': 'circle_fretboard_glow',
  'guitar-app-circle-fretboard-glow-color': 'circle_fretboard_glow_color',
  'guitar-app-circle-fretboard-glow-opacity': 'circle_fretboard_glow_opacity',
  'guitar-app-circle-fretboard-glow-width': 'circle_fretboard_glow_width',
  'guitar-app-circle-glow-duration': 'circle_of_5ths_glow_duration',

  // Harmonization
  'guitar-app-harmonization': 'harmonization',

  // Onboarding and UI preferences
  'guitar-app-show-guide-at-start': 'show_guide_at_start',
  'note-notation-preference': 'note_notation',

  // CAGED settings
  'guitar-app-show-caged-guide': 'show_caged_guide',
  'guitar-app-caged-brightness': 'caged_brightness',
  'guitar-app-show-pentatonic-caged-guide': 'show_pentatonic_caged_guide',

  // Triad settings
  'guitar-app-selected-triad-root': 'selected_triad_root',
  'guitar-app-selected-triad-type': 'selected_triad_type',
  'guitar-app-selected-triad-inversion': 'selected_triad_inversion',
  'guitar-app-selected-triad-caged-shapes': 'selected_triad_caged_shapes',
  'guitar-app-show-triads-on-scale-fretboard': 'show_triads_on_scale_fretboard',

  // Nearby diatonic chord settings
  'guitar-app-show-all-nearby-chords': 'show_all_nearby_chords',
  'guitar-app-is-chord-neighborhood-expanded': 'is_chord_neighborhood_expanded',
  'guitar-app-selected-nearby-chords': 'selected_nearby_chords',
  'guitar-app-reordered-nearby-chords': 'reordered_nearby_chords',

  // Skill level
  'guitar-app-skill-level': 'skill_level',

  // Pentatonic mode settings
  'guitar-app-show-pentatonic-mode': 'show_pentatonic_mode',
  'guitar-app-fretboard-order': 'fretboard_order',
  'guitar-app-pentatonic-header-collapsed': 'is_pentatonic_header_collapsed',
  'guitar-app-triad-scale-index': 'selected_scale_index',

  // Note detector settings
  'guitar-app-note-detector-enabled': 'note_detector_enabled',
  'guitar-app-live-notes-glow-enabled': 'live_notes_glow_enabled',
  'guitar-app-live-notes-glow-duration': 'live_notes_glow_duration',

  // Chord progression exploration state
  'guitar-app-chord-progression-state': 'chord_progression_state',
};

export function useSupabaseStorage<T>(key: string, defaultValue: T): [T, (value: T) => void, (value: T) => void] {
  const queryClient = useQueryClient();
  const [userId, setUserId] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  // When true, the next cache-update effect cycle is skipped (used by setValueDisplayOnly)
  const skipCacheUpdateRef = useRef(false);
  const supabase = createClient();

  // ALWAYS use defaultValue for initial state to prevent hydration mismatch
  // We'll load from cache/database after mount
  const [value, setValue] = useState<T>(defaultValue);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Update localStorage cache whenever value changes for instant future loads
  useEffect(() => {
    if (!isClient) return;

    // Skip cache update when called from setValueDisplayOnly (e.g. AI assistant suggestions)
    if (skipCacheUpdateRef.current) {
      skipCacheUpdateRef.current = false;
      return;
    }

    try {
      const localStorageKey = `cache-${key}`;
      localStorage.setItem(localStorageKey, JSON.stringify(value));
    } catch (error) {
      // Ignore localStorage errors
    }
  }, [value, key, isClient]);

  // Load value on mount
  useEffect(() => {
    if (!isClient || isLoaded) return;

    async function loadValue() {
      try {
        // First, try to load from localStorage cache for instant render
        let cachedValue: T | null = null;
        try {
          const localStorageKey = `cache-${key}`;
          const cached = localStorage.getItem(localStorageKey);
          if (cached) {
            cachedValue = JSON.parse(cached) as T;
            setValue(cachedValue);
            if (key === 'guitar-app-root-note' || key === 'guitar-app-scale-name') {
              console.log(`📦 Cache loaded ${key}:`, cachedValue, '(default was:', defaultValue, ')');
            }
          }
        } catch (error) {
          // Ignore localStorage errors
        }

        const { data: { user }, error: authError } = await supabase.auth.getUser();

        // Silently handle auth errors (user not logged in)
        if (authError) {
          setIsLoaded(true);
          return;
        }

        if (user) {
          setUserId(user.id);

          // Check if this is a user_settings key
          const columnName = KEY_TO_COLUMN_MAP[key];

          if (columnName) {
            // Load from user_settings table
            const { data, error } = await supabase
              .from('user_settings')
              .select(columnName)
              .eq('user_id', user.id)
              .single();

            if (!error && data && data[columnName as keyof typeof data] !== undefined) {
              let loadedValue = data[columnName as keyof typeof data] as T;

              // CRITICAL: Normalize root_note values to sharp notation after loading
              // This ensures database values are always in sharp notation (A#, C#, etc.)
              // even if flat notation (Bb, Db, etc.) was somehow stored
              if (columnName === 'root_note' && typeof loadedValue === 'string') {
                const normalizedValue = normalizeNoteFromDisplay(loadedValue);
                if (key === 'guitar-app-root-note') {
                  console.log(`🔍 Database loaded ${key}:`, loadedValue, '→ normalized:', normalizedValue, '(default was:', defaultValue, ')');
                }
                loadedValue = normalizedValue as T;
              }
              // CRITICAL: Normalize scale_name values to database format after loading
              // This ensures "Aeolian (Natural Minor)" → "Aeolian", "Ionian (Major)" → "Ionian"
              else if (columnName === 'scale_name' && typeof loadedValue === 'string') {
                const normalizedValue = normalizeScaleNameFromDisplay(loadedValue);
                if (key === 'guitar-app-scale-name') {
                  console.log(`🔍 Database loaded ${key}:`, loadedValue, '→ normalized:', normalizedValue, '(default was:', defaultValue, ')');
                }
                loadedValue = normalizedValue as T;
              }
              else if (key === 'guitar-app-root-note' || key === 'guitar-app-scale-name') {
                console.log(`🔍 Database loaded ${key}:`, loadedValue, '(default was:', defaultValue, ')');
              }

              // CRITICAL: Cache takes precedence over database
              // Only use database value if cache is empty (user hasn't set anything yet)
              // This prevents database from overwriting user's current session selections
              if (cachedValue !== null) {
                // Cache exists, keep it and ignore database (cache is more recent)
                if (key === 'guitar-app-root-note' || key === 'guitar-app-scale-name') {
                  console.log(`✅ Cache exists for ${key}, ignoring database value. Cache:`, cachedValue, 'Database:', loadedValue);
                }
              } else {
                // No cache, use database value
                if (key === 'guitar-app-root-note' || key === 'guitar-app-scale-name') {
                  console.log(`✅ No cache for ${key}, using database value:`, loadedValue);
                }
                setValue(loadedValue);
              }
            } else if (error && key === 'guitar-app-root-note') {
              console.log(`⚠️ Error loading ${key} from database:`, error, 'Keeping cached/default value');
            }
          } else if (key === 'guitar-app-manual-selections') {
            // Load manual selections
            const { data, error } = await supabase
              .from('user_manual_selections')
              .select('*')
              .eq('user_id', user.id)
              .order('timestamp', { ascending: true });

            if (!error && data) {
              const selections = data.map(row => ({
                key: row.key,
                scaleName: row.scale_name,
                timestamp: row.timestamp,
              }));
              setValue(selections as T);
            }
          } else if (key === 'midi-pedal-config') {
            // Load MIDI config
            const { data, error } = await supabase
              .from('user_midi_config')
              .select('active_config')
              .eq('user_id', user.id)
              .single();

            if (!error && data && data.active_config) {
              setValue(data.active_config as T);
            }
          }
        }
      } catch (error) {
        // Only log unexpected errors, not auth failures
        if (error && typeof error === 'object' && 'status' in error && error.status !== 400) {
          console.error(`Error loading ${key}:`, error);
        }
      } finally {
        setIsLoaded(true);
      }
    }

    loadValue();
  }, [key, isClient, isLoaded, supabase]);

  // Debounced save function
  const debouncedSave = useCallback(async (newValue: T) => {
    if (!userId) return;

    try {
      const columnName = KEY_TO_COLUMN_MAP[key];

      if (columnName) {
        // CRITICAL: Normalize root_note values to sharp notation before saving
        // This ensures database always stores sharp notation (A#, C#, etc.)
        // even if flat notation (Bb, Db, etc.) is passed in
        let valueToSave = newValue;
        if (columnName === 'root_note' && typeof newValue === 'string') {
          valueToSave = normalizeNoteFromDisplay(newValue) as T;
          console.log(`💾 Saving ${key}: "${newValue}" → normalized: "${valueToSave}"`);
        }
        // CRITICAL: Normalize scale_name values to database format before saving
        // This ensures "Aeolian (Natural Minor)" → "Aeolian", "Ionian (Major)" → "Ionian"
        else if (columnName === 'scale_name' && typeof newValue === 'string') {
          valueToSave = normalizeScaleNameFromDisplay(newValue) as T;
          console.log(`💾 Saving ${key}: "${newValue}" → normalized: "${valueToSave}"`);
        }

        // Save to user_settings table
        await supabase
          .from('user_settings')
          .upsert({
            user_id: userId,
            [columnName]: valueToSave,
          }, {
            onConflict: 'user_id',
          });

        // Invalidate React Query cache to trigger refetch
        queryClient.invalidateQueries({ queryKey: queryKeys.userSettings(userId) });
      } else if (key === 'guitar-app-manual-selections') {
        // Save manual selections
        const selections = newValue as any[];

        // Delete existing selections
        await supabase
          .from('user_manual_selections')
          .delete()
          .eq('user_id', userId);

        // Insert new selections
        if (selections && selections.length > 0) {
          await supabase
            .from('user_manual_selections')
            .insert(
              selections.map((sel: any) => ({
                user_id: userId,
                // CRITICAL: Normalize key to sharp notation before saving
                key: normalizeNoteFromDisplay(sel.key),
                scale_name: sel.scaleName,
                timestamp: sel.timestamp,
              }))
            );
        }

        // Invalidate React Query cache
        queryClient.invalidateQueries({ queryKey: queryKeys.userManualSelections(userId) });
      } else if (key === 'midi-pedal-config') {
        // Save MIDI config
        await supabase
          .from('user_midi_config')
          .upsert({
            user_id: userId,
            active_config: newValue,
          }, {
            onConflict: 'user_id',
          });

        // Invalidate React Query cache
        queryClient.invalidateQueries({ queryKey: queryKeys.userMidiConfig(userId) });
      }
    } catch (error) {
      console.error(`Error saving ${key}:`, error);
    }
  }, [userId, key, supabase, queryClient]);

  // Update value with debounced save
  const updateValue = useCallback((newValue: T) => {
    // Optimistic update
    setValue(newValue);

    if (!userId) return;

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set new timeout
    saveTimeoutRef.current = setTimeout(() => {
      debouncedSave(newValue);
    }, DEBOUNCE_DELAY);
  }, [userId, debouncedSave]);

  /**
   * Display-only setter: updates React state for the current session only.
   * Does NOT update the localStorage cache and does NOT save to Supabase.
   * Use this for transient overrides (e.g. AI assistant suggestions) that
   * should not be persisted across page reloads.
   */
  const setValueDisplayOnly = useCallback((newValue: T) => {
    skipCacheUpdateRef.current = true;
    setValue(newValue);
    // Intentionally no debouncedSave call
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return [value, updateValue, setValueDisplayOnly];
}

