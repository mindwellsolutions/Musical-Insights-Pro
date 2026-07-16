/**
 * Database service for nearby chord progression persistence
 */

import { createClient } from '@/lib/supabase/client-ssr';
import { NearbyChord } from '@/lib/music-theory/neighborhood';
import { ChordVoicing } from '@/lib/chord-voicings';

export interface SavedNearbyProgression {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  progression_data: {
    chords: SavedNearbyChord[];
    anchorChord?: {
      rootNote: string;
      quality: string;
    };
  };
  created_at: string;
  updated_at: string;
}

export interface SavedNearbyChord {
  rootNote: string;
  quality: string;
  degree: string;
  function: string;
  distance: number;
  commonTones: number;
  commonToneNotes: string[];
  selectedVoicingIndex?: number;
  voicingData?: ChordVoicing; // Store the actual voicing data
  chordSymbol?: string;
  chordNotes?: string[];
}

/**
 * Save a nearby chord progression
 */
export async function saveNearbyProgression(
  name: string,
  description: string,
  chords: NearbyChord[]
): Promise<{ success: boolean; progressionId?: string; error?: string }> {
  try {
    const supabase = createClient();

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return { success: false, error: 'User not authenticated' };
    }

    // Prepare progression data - extract only serializable data
    const savedChords: SavedNearbyChord[] = chords.map(chord => ({
      rootNote: chord.rootNote,
      quality: chord.quality,
      degree: chord.degree,
      function: chord.function,
      distance: chord.distance,
      commonTones: chord.commonTones,
      commonToneNotes: chord.commonToneNotes,
      selectedVoicingIndex: (chord as any).selectedVoicingIndex,
      voicingData: (chord as any).selectedVoicing,
      chordSymbol: (chord as any).chordSymbol,
      chordNotes: (chord as any).chordNotes,
    }));

    const progressionData = {
      chords: savedChords,
    };

    // Insert into database
    const { data, error } = await supabase
      .from('nearby_chord_progressions')
      .insert({
        user_id: user.id,
        name,
        description,
        progression_data: progressionData,
      })
      .select()
      .single();

    if (error || !data) {
      return { success: false, error: error?.message || 'Failed to save progression' };
    }

    return { success: true, progressionId: data.id };
  } catch (error) {
    console.error('Error saving nearby progression:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Update an existing nearby chord progression
 */
export async function updateNearbyProgression(
  progressionId: string,
  name: string,
  description: string,
  chords: NearbyChord[]
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient();

    // Prepare progression data
    const savedChords: SavedNearbyChord[] = chords.map(chord => ({
      rootNote: chord.rootNote,
      quality: chord.quality,
      degree: chord.degree,
      function: chord.function,
      distance: chord.distance,
      commonTones: chord.commonTones,
      commonToneNotes: chord.commonToneNotes,
      selectedVoicingIndex: (chord as any).selectedVoicingIndex,
      voicingData: (chord as any).selectedVoicing,
      chordSymbol: (chord as any).chordSymbol,
      chordNotes: (chord as any).chordNotes,
    }));

    const progressionData = {
      chords: savedChords,
    };

    // Update in database
    const { error } = await supabase
      .from('nearby_chord_progressions')
      .update({
        name,
        description,
        progression_data: progressionData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', progressionId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error updating nearby progression:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Get all saved progressions for the current user
 */
export async function getUserNearbyProgressions(): Promise<{
  success: boolean;
  progressions?: SavedNearbyProgression[];
  error?: string;
}> {
  try {
    const supabase = createClient();

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return { success: false, error: 'User not authenticated' };
    }

    // Fetch progressions
    const { data, error } = await supabase
      .from('nearby_chord_progressions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, progressions: data || [] };
  } catch (error) {
    console.error('Error fetching nearby progressions:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Load a specific progression by ID
 */
export async function loadNearbyProgression(
  progressionId: string
): Promise<{
  success: boolean;
  progression?: SavedNearbyProgression;
  error?: string;
}> {
  try {
    const supabase = createClient();

    const { data, error } = await supabase
      .from('nearby_chord_progressions')
      .select('*')
      .eq('id', progressionId)
      .single();

    if (error || !data) {
      return { success: false, error: error?.message || 'Progression not found' };
    }

    return { success: true, progression: data };
  } catch (error) {
    console.error('Error loading nearby progression:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Delete a progression
 */
export async function deleteNearbyProgression(
  progressionId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient();

    const { error } = await supabase
      .from('nearby_chord_progressions')
      .delete()
      .eq('id', progressionId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting nearby progression:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

