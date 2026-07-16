'use client';

/**
 * Hook for managing fretboard display data
 * Converts triad system data to fretboard-compatible format
 */

import { useMemo } from 'react';
import { useTriadSystem } from '../TriadSystemContext';
import { useVoicings } from './useVoicings';
import {
  voicingsToNotePositions,
  pentatonicToGhostNotes,
  embellishmentsToConnections,
  deduplicateNotePositions,
  findEmbellishments,
  findChordNeighborhood,
  calculateVoiceLeading,
  getCAGEDOverlayZones
} from '@/lib/music-theory';
import type { NotePosition } from '@/lib/musicTheory';
import type { CAGEDOverlayZone } from '@/lib/music-theory';

export function useFretboardData() {
  const { state } = useTriadSystem();
  
  // Get voicings data
  const voicingsData = useVoicings({
    key: state.selectedKey.pitchClass,
    mode: state.selectedMode,
    quality: state.selectedQuality,
    stringSets: state.selectedStringSets,
    inversions: state.selectedInversions,
    currentZone: state.currentZone,
    selectedCAGEDShapes: state.selectedCAGEDShapes,
    showCAGEDShapes: state.viewToggles.showCAGEDShapes
  });

  // Convert voicings to note positions
  const triadNotePositions = useMemo(() => {
    return voicingsToNotePositions(
      voicingsData.filteredVoicings,
      state.twoNoteMode
    );
  }, [voicingsData.filteredVoicings, state.twoNoteMode]);

  // Convert pentatonic scale to ghost notes
  const pentatonicGhostNotes = useMemo(() => {
    if (!state.viewToggles.showPentatonic) return [];
    
    return pentatonicToGhostNotes(
      voicingsData.pentatonicScale,
      state.currentZone || undefined
    );
  }, [
    voicingsData.pentatonicScale,
    state.currentZone,
    state.viewToggles.showPentatonic
  ]);

  // Find embellishments for selected voicing
  const embellishments = useMemo(() => {
    if (!state.viewToggles.showEmbellishments || !state.selectedVoicing) {
      return [];
    }

    return findEmbellishments(
      state.selectedVoicing,
      voicingsData.pentatonicScale,
      3 // max distance
    );
  }, [
    state.selectedVoicing,
    voicingsData.pentatonicScale,
    state.viewToggles.showEmbellishments
  ]);

  // Convert embellishments to connections
  const embellishmentConnections = useMemo(() => {
    if (!state.viewToggles.showEmbellishments) return [];
    return embellishmentsToConnections(embellishments);
  }, [embellishments, state.viewToggles.showEmbellishments]);

  // Find chord neighborhood for selected voicing
  const neighborhood = useMemo(() => {
    if (!state.viewToggles.showNeighborhood || !state.selectedVoicing) {
      return null;
    }

    return findChordNeighborhood(
      state.selectedVoicing,
      voicingsData.allVoicings,
      state.selectedKey.pitchClass,
      state.selectedMode,
      5 // max distance
    );
  }, [
    state.selectedVoicing,
    voicingsData.allVoicings,
    state.selectedKey.pitchClass,
    state.selectedMode,
    state.viewToggles.showNeighborhood
  ]);

  // Calculate voice leading for progression
  const voiceLeadingConnections = useMemo(() => {
    if (!state.viewToggles.showVoiceLeading || !state.currentProgression) {
      return [];
    }

    const connections = [];
    const chords = state.currentProgression.chords;
    
    for (let i = 0; i < chords.length - 1; i++) {
      if (chords[i].suggestedVoicing && chords[i + 1].suggestedVoicing) {
        const connection = calculateVoiceLeading(
          chords[i].suggestedVoicing!,
          chords[i + 1].suggestedVoicing!
        );
        connections.push(connection);
      }
    }

    return connections;
  }, [state.currentProgression, state.viewToggles.showVoiceLeading]);

  // Combine all note positions
  const allNotePositions = useMemo(() => {
    const combined: NotePosition[] = [
      ...triadNotePositions,
      ...pentatonicGhostNotes
    ];

    return deduplicateNotePositions(combined);
  }, [triadNotePositions, pentatonicGhostNotes]);

  // Get triad notes for highlighting
  const triadNotes = useMemo(() => {
    return voicingsData.triad.notes.map(n => n.name);
  }, [voicingsData.triad]);

  // Get CAGED overlay zones if enabled
  const cagedOverlayZones = useMemo(() => {
    if (!state.viewToggles.showCAGEDShapes) return [];
    return getCAGEDOverlayZones(state.selectedCAGEDShapes);
  }, [state.viewToggles.showCAGEDShapes, state.selectedCAGEDShapes]);

  return {
    // Note positions
    allNotePositions,
    triadNotePositions,
    pentatonicGhostNotes,

    // Triad data
    triadNotes,
    triad: voicingsData.triad,

    // Voicings
    voicings: voicingsData.filteredVoicings,
    selectedVoicing: state.selectedVoicing,

    // Embellishments
    embellishments,
    embellishmentConnections,

    // Neighborhood
    neighborhood,

    // Voice leading
    voiceLeadingConnections,

    // CAGED overlay
    cagedOverlayZones,

    // View state
    viewToggles: state.viewToggles,
    twoNoteMode: state.twoNoteMode
  };
}

