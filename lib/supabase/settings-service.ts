/**
 * Settings Service
 * Handles user settings CRUD operations with Supabase
 */

import { createClient } from '@/lib/supabase/client-ssr';

export interface UserSettings {
  // Display Settings
  theme: string;
  note_notation: 'sharp' | 'flat';

  // Fretboard Settings
  root_note: string;
  scale_name: string;
  string_count: 6 | 7;
  tuning_name: string;
  is_inverted: boolean;

  // Visual Settings
  chord_highlight_color: string;
  guide_tones_color: string;
  show_chord_tones: boolean;
  show_guide_tones: boolean;
  show_chord_glow: boolean;
  fret_dot_color: string;
  show_middle_dots: boolean;

  // Audio Detection Settings
  auto_recommendation: boolean;
  auto_switch_fretboard: boolean;

  // Focus Mode Settings
  focus_mode: boolean;
  focus_mode_position: { x: number; y: number };

  // Selected Notes
  selected_chord_notes: string[] | null;
  selected_guide_tones: string[] | null;

  // Onboarding Guide Settings
  show_guide_at_start: boolean;

  // Fretboard Width Setting (20–100, default 50)
  fret_width: number;
}

export const DEFAULT_SETTINGS: UserSettings = {
  theme: 'dark',
  note_notation: 'flat',
  root_note: 'B',
  scale_name: 'Aeolian',
  string_count: 6,
  tuning_name: 'Standard',
  is_inverted: true,
  chord_highlight_color: '#fbbf24',
  guide_tones_color: '#ec4899',
  show_chord_tones: true,
  show_guide_tones: true,
  show_chord_glow: false,
  fret_dot_color: '#9ca3af',
  show_middle_dots: false,
  auto_recommendation: false,
  auto_switch_fretboard: false,
  focus_mode: false,
  focus_mode_position: { x: 0, y: 0 },
  selected_chord_notes: null,
  selected_guide_tones: null,
  show_guide_at_start: true,
  fret_width: 50,
};

/**
 * Load user settings from Supabase
 */
export async function loadUserSettings(userId: string): Promise<UserSettings> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error || !data) {
    return DEFAULT_SETTINGS;
  }

  return {
    theme: data.theme,
    note_notation: data.note_notation ?? 'flat',
    root_note: data.root_note,
    scale_name: data.scale_name,
    string_count: data.string_count,
    tuning_name: data.tuning_name,
    is_inverted: data.is_inverted,
    chord_highlight_color: data.chord_highlight_color,
    guide_tones_color: data.guide_tones_color,
    show_chord_tones: data.show_chord_tones,
    show_guide_tones: data.show_guide_tones,
    show_chord_glow: data.show_chord_glow,
    fret_dot_color: data.fret_dot_color,
    show_middle_dots: data.show_middle_dots,
    auto_recommendation: data.auto_recommendation,
    auto_switch_fretboard: data.auto_switch_fretboard,
    focus_mode: data.focus_mode,
    focus_mode_position: data.focus_mode_position,
    selected_chord_notes: data.selected_chord_notes,
    selected_guide_tones: data.selected_guide_tones,
    show_guide_at_start: data.show_guide_at_start ?? true,
    fret_width: data.fret_width ?? 50,
  };
}

/**
 * Save user settings to Supabase
 */
export async function saveUserSettings(userId: string, settings: Partial<UserSettings>): Promise<boolean> {
  const supabase = createClient();
  
  const { error } = await supabase
    .from('user_settings')
    .upsert({
      user_id: userId,
      ...settings,
    }, {
      onConflict: 'user_id',
    });

  return !error;
}

/**
 * Initialize user settings (create default settings for new user)
 */
export async function initializeUserSettings(userId: string): Promise<boolean> {
  const supabase = createClient();
  
  const { error } = await supabase
    .from('user_settings')
    .insert({
      user_id: userId,
      ...DEFAULT_SETTINGS,
    });

  // Ignore error if settings already exist
  if (error && error.code !== '23505') {
    return false;
  }

  return true;
}

