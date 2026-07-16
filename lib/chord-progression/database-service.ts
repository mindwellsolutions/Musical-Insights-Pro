/**
 * Database service for chord progression persistence
 */

import { createClient } from '@/lib/supabase/client-ssr';
import { ChordInstance, ScaleModeInstance, VerseData } from './types';

export interface ChordProgressionProject {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

/**
 * Save a complete project with all verses and chords
 */
export async function saveProject(
  name: string,
  description: string,
  verses: VerseData[],
  tags?: string[]
): Promise<{ success: boolean; projectId?: string; error?: string }> {
  try {
    const supabase = createClient();

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return { success: false, error: 'User not authenticated' };
    }

    // Create project
    const { data: project, error: projectError } = await supabase
      .from('chord_progression_projects')
      .insert({
        user_id: user.id,
        name,
        description,
        tags: tags || [],
      })
      .select()
      .single();

    if (projectError || !project) {
      return { success: false, error: projectError?.message || 'Failed to create project' };
    }

    // Save all verses
    for (let i = 0; i < verses.length; i++) {
      const verse = verses[i];
      
      const { data: verseData, error: verseError } = await supabase
        .from('chord_progression_verses')
        .insert({
          project_id: project.id,
          name: verse.name,
          key: verse.key,
          bpm: verse.bpm,
          time_signature: verse.timeSignature,
          ai_scale_vision_text: verse.aiScaleVisionText || null,
          ai_scale_recommendations: verse.aiScaleRecommendations || [],
          order_index: i,
        })
        .select()
        .single();

      if (verseError || !verseData) {
        return { success: false, error: verseError?.message || 'Failed to save verse' };
      }

      // Save chord instances
      if (verse.chordProgression.length > 0) {
        const chordInstances = verse.chordProgression.map((chord, idx) => ({
          verse_id: verseData.id,
          chord_symbol: chord.chordSymbol,
          chord_quality: chord.chordQuality,
          notes: chord.notes,
          root_note: chord.rootNote,
          start_time: chord.startTime,
          duration: chord.duration,
          position: chord.position,
          width: chord.width,
          color: chord.color,
          voicing_index: chord.voicingIndex,
          order_index: idx,
        }));

        const { error: chordsError } = await supabase
          .from('chord_instances')
          .insert(chordInstances);

        if (chordsError) {
          return { success: false, error: chordsError.message };
        }
      }

      // Save scale/mode instances
      if (verse.scaleModeAssignments.length > 0) {
        const scaleModeInstances = verse.scaleModeAssignments.map(sm => ({
          verse_id: verseData.id,
          chord_id: sm.chordId,
          root_note: sm.rootNote,
          scale_name: sm.scaleName,
          start_time: sm.startTime,
          duration: sm.duration,
          position: sm.position,
          width: sm.width,
          compatibility_score: sm.compatibilityScore,
        }));

        const { error: scalesError } = await supabase
          .from('scale_mode_instances')
          .insert(scaleModeInstances);

        if (scalesError) {
          return { success: false, error: scalesError.message };
        }
      }
    }

    return { success: true, projectId: project.id };
  } catch (error) {
    console.error('Error saving project:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Load a project by ID
 */
export async function loadProject(projectId: string): Promise<{
  success: boolean;
  project?: ChordProgressionProject;
  verses?: VerseData[];
  error?: string;
}> {
  try {
    const supabase = createClient();

    // Load project
    const { data: project, error: projectError } = await supabase
      .from('chord_progression_projects')
      .select('*')
      .eq('id', projectId)
      .single();

    if (projectError || !project) {
      return { success: false, error: projectError?.message || 'Project not found' };
    }

    // Load verses
    const { data: versesData, error: versesError } = await supabase
      .from('chord_progression_verses')
      .select('*')
      .eq('project_id', projectId)
      .order('order_index');

    if (versesError) {
      return { success: false, error: versesError.message };
    }

    const verses: VerseData[] = [];

    for (const verseData of versesData || []) {
      // Load chords for this verse
      const { data: chords, error: chordsError } = await supabase
        .from('chord_instances')
        .select('*')
        .eq('verse_id', verseData.id)
        .order('order_index');

      if (chordsError) {
        return { success: false, error: chordsError.message };
      }

      // Load scale/modes for this verse
      const { data: scaleModes, error: scaleModesError } = await supabase
        .from('scale_mode_instances')
        .select('*')
        .eq('verse_id', verseData.id);

      if (scaleModesError) {
        return { success: false, error: scaleModesError.message };
      }

      verses.push({
        id: verseData.id,
        name: verseData.name,
        key: verseData.key,
        bpm: verseData.bpm,
        timeSignature: verseData.time_signature,
        createdAt: verseData.created_at,
        updatedAt: verseData.updated_at,
        aiScaleVisionText: verseData.ai_scale_vision_text || undefined,
        aiScaleRecommendations: verseData.ai_scale_recommendations || [],
        chordProgression: (chords || []).map(c => ({
          id: c.id,
          chordSymbol: c.chord_symbol,
          chordQuality: c.chord_quality,
          notes: c.notes,
          rootNote: c.root_note,
          startTime: parseFloat(c.start_time),
          duration: parseFloat(c.duration),
          position: parseFloat(c.position),
          width: parseFloat(c.width),
          color: c.color,
          voicingIndex: c.voicing_index,
        })),
        scaleModeAssignments: (scaleModes || []).map(sm => ({
          id: sm.id,
          chordId: sm.chord_id,
          rootNote: sm.root_note,
          scaleName: sm.scale_name,
          startTime: parseFloat(sm.start_time),
          duration: parseFloat(sm.duration),
          position: parseFloat(sm.position),
          width: parseFloat(sm.width),
          compatibilityScore: sm.compatibility_score,
        })),
      });
    }

    return { success: true, project, verses };
  } catch (error) {
    console.error('Error loading project:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Get all projects for the current user
 */
export async function getUserProjects(): Promise<{
  success: boolean;
  projects?: ChordProgressionProject[];
  error?: string;
}> {
  try {
    const supabase = createClient();

    const { data: projects, error } = await supabase
      .from('chord_progression_projects')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, projects: projects || [] };
  } catch (error) {
    console.error('Error fetching projects:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Update an existing project
 */
export async function updateProject(
  projectId: string,
  name: string,
  description: string,
  verses: VerseData[],
  tags?: string[]
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient();

    // Update project metadata
    const { error: updateError } = await supabase
      .from('chord_progression_projects')
      .update({
        name,
        description,
        tags: tags || [],
        updated_at: new Date().toISOString(),
      })
      .eq('id', projectId);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    // Delete existing verses and their children (cascade will handle chords/scales)
    const { error: deleteError } = await supabase
      .from('chord_progression_verses')
      .delete()
      .eq('project_id', projectId);

    if (deleteError) {
      return { success: false, error: deleteError.message };
    }

    // Re-insert all verses (similar to save logic)
    for (let i = 0; i < verses.length; i++) {
      const verse = verses[i];

      const { data: verseData, error: verseError } = await supabase
        .from('chord_progression_verses')
        .insert({
          project_id: projectId,
          name: verse.name,
          key: verse.key,
          bpm: verse.bpm,
          time_signature: verse.timeSignature,
          ai_scale_vision_text: verse.aiScaleVisionText || null,
          ai_scale_recommendations: verse.aiScaleRecommendations || [],
          order_index: i,
        })
        .select()
        .single();

      if (verseError || !verseData) {
        return { success: false, error: verseError?.message || 'Failed to update verse' };
      }

      // Save chord instances
      if (verse.chordProgression.length > 0) {
        const chordInstances = verse.chordProgression.map((chord, idx) => ({
          verse_id: verseData.id,
          chord_symbol: chord.chordSymbol,
          chord_quality: chord.chordQuality,
          notes: chord.notes,
          root_note: chord.rootNote,
          start_time: chord.startTime,
          duration: chord.duration,
          position: chord.position,
          width: chord.width,
          color: chord.color,
          voicing_index: chord.voicingIndex,
          order_index: idx,
        }));

        const { error: chordsError } = await supabase
          .from('chord_instances')
          .insert(chordInstances);

        if (chordsError) {
          return { success: false, error: chordsError.message };
        }
      }

      // Save scale/mode instances
      if (verse.scaleModeAssignments.length > 0) {
        const scaleModeInstances = verse.scaleModeAssignments.map(sm => ({
          verse_id: verseData.id,
          chord_id: sm.chordId,
          root_note: sm.rootNote,
          scale_name: sm.scaleName,
          start_time: sm.startTime,
          duration: sm.duration,
          position: sm.position,
          width: sm.width,
          compatibility_score: sm.compatibilityScore,
        }));

        const { error: scalesError } = await supabase
          .from('scale_mode_instances')
          .insert(scaleModeInstances);

        if (scalesError) {
          return { success: false, error: scalesError.message };
        }
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Error updating project:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Delete a project
 */
export async function deleteProject(projectId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const supabase = createClient();

    const { error } = await supabase
      .from('chord_progression_projects')
      .delete()
      .eq('id', projectId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting project:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

