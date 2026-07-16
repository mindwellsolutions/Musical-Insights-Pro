/**
 * MIDI Service
 * Handles MIDI configuration and profiles CRUD operations with Supabase
 */

import { createClient } from '@/lib/supabase/client-ssr';
import { MIDIPedalConfig, MIDIProfile } from '@/lib/midi/midiTypes';

/**
 * Load user MIDI configuration from Supabase
 */
export async function loadMIDIConfig(userId: string): Promise<MIDIPedalConfig | null> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('user_midi_config')
    .select('active_config')
    .eq('user_id', userId)
    .single();

  if (error || !data || !data.active_config) {
    return null;
  }

  return data.active_config as MIDIPedalConfig;
}

/**
 * Save user MIDI configuration to Supabase
 */
export async function saveMIDIConfig(userId: string, config: MIDIPedalConfig): Promise<boolean> {
  const supabase = createClient();
  
  const { error } = await supabase
    .from('user_midi_config')
    .upsert({
      user_id: userId,
      active_config: config,
    }, {
      onConflict: 'user_id',
    });

  return !error;
}

/**
 * Load user MIDI profiles from Supabase
 */
export async function loadMIDIProfiles(userId: string): Promise<MIDIProfile[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('user_midi_profiles')
    .select('*')
    .eq('user_id', userId)
    .order('created_at_timestamp', { ascending: true });

  if (error || !data) {
    return [];
  }

  return data.map(row => ({
    id: row.profile_id,
    name: row.name,
    deviceName: (row.config as MIDIPedalConfig).deviceName || 'Unknown Device',
    config: row.config as MIDIPedalConfig,
    createdAt: row.created_at_timestamp,
    updatedAt: row.updated_at_timestamp,
  }));
}

/**
 * Save a MIDI profile to Supabase
 */
export async function saveMIDIProfile(userId: string, profile: MIDIProfile): Promise<boolean> {
  const supabase = createClient();
  
  const { error } = await supabase
    .from('user_midi_profiles')
    .upsert({
      user_id: userId,
      profile_id: profile.id,
      name: profile.name,
      config: profile.config,
      created_at_timestamp: profile.createdAt,
      updated_at_timestamp: profile.updatedAt,
    }, {
      onConflict: 'user_id,profile_id',
    });

  return !error;
}

/**
 * Delete a MIDI profile from Supabase
 */
export async function deleteMIDIProfile(userId: string, profileId: string): Promise<boolean> {
  const supabase = createClient();
  
  const { error } = await supabase
    .from('user_midi_profiles')
    .delete()
    .eq('user_id', userId)
    .eq('profile_id', profileId);

  return !error;
}

/**
 * Load manual selections from Supabase
 */
export async function loadManualSelections(userId: string): Promise<any[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('user_manual_selections')
    .select('*')
    .eq('user_id', userId)
    .order('timestamp', { ascending: true });

  if (error || !data) {
    return [];
  }

  return data.map(row => ({
    key: row.key,
    scaleName: row.scale_name,
    timestamp: row.timestamp,
  }));
}

/**
 * Save manual selections to Supabase
 */
export async function saveManualSelections(userId: string, selections: any[]): Promise<boolean> {
  const supabase = createClient();
  
  // Delete existing selections
  await supabase
    .from('user_manual_selections')
    .delete()
    .eq('user_id', userId);

  // Insert new selections
  if (selections.length > 0) {
    const { error } = await supabase
      .from('user_manual_selections')
      .insert(
        selections.map(sel => ({
          user_id: userId,
          key: sel.key,
          scale_name: sel.scaleName,
          timestamp: sel.timestamp,
        }))
      );

    return !error;
  }

  return true;
}

