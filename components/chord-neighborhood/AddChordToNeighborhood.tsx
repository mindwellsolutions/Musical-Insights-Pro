'use client';

/**
 * Add Chord to Neighborhood Modal
 * Wraps the Song Builder's AddChordModal for use in the neighborhood system
 */

import { useState } from 'react';
import AddChordModal from '@/components/chord-progression/AddChordModal';
import { NearbyChord } from '@/lib/music-theory/neighborhood';
import { calculateChordVoicings } from '@/lib/chord-voicings';
import { getChordTones } from '@/lib/musicTheory';

interface AddChordToNeighborhoodProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentKey: string;
  onChordAdd: (chord: NearbyChord) => void;
}

export default function AddChordToNeighborhood({
  open,
  onOpenChange,
  currentKey,
  onChordAdd,
}: AddChordToNeighborhoodProps) {
  const handleChordSelect = (chordSymbol: string, duration: number) => {
    // Parse the chord symbol to extract root note and quality
    const parseChordSymbol = (symbol: string): { rootNote: string; quality: string } => {
      // Match root note (C, C#, Db, etc.)
      const rootMatch = symbol.match(/^([A-G][#b]?)/);
      if (!rootMatch) return { rootNote: 'C', quality: 'major' };
      
      const rootNote = rootMatch[1];
      const suffix = symbol.slice(rootNote.length);
      
      // Determine quality from suffix
      let quality = 'major';
      if (suffix.includes('dim')) quality = 'diminished';
      else if (suffix.includes('aug')) quality = 'augmented';
      else if (suffix.includes('m') || suffix.includes('min')) quality = 'minor';
      
      return { rootNote, quality };
    };

    const { rootNote, quality } = parseChordSymbol(chordSymbol);
    
    // Get chord tones
    const chordNotes = getChordTones(rootNote, quality as any);
    
    // Calculate voicings
    const voicings = calculateChordVoicings(chordNotes, rootNote, ['E', 'A', 'D', 'G', 'B', 'E'], 15);
    
    // Create a NearbyChord object
    const nearbyChord: NearbyChord = {
      rootNote,
      quality: quality as any,
      degree: chordSymbol, // Use the full symbol as the degree for now
      function: 'Custom',
      distance: 0,
      commonTones: 0,
      commonToneNotes: [],
      nearestVoicing: {
        rootNote,
        quality: quality as any,
        stringSet: [1, 2, 3],
        inversion: 'root',
        fretPosition: 0,
        frets: [],
        notes: chordNotes,
      },
      allVoicings: [],
      chordVoicings: voicings,
      selectedVoicingIndex: 0,
      chordSymbol,
      chordNotes,
    };
    
    onChordAdd(nearbyChord);
    onOpenChange(false);
  };

  return (
    <AddChordModal
      open={open}
      onOpenChange={onOpenChange}
      currentKey={currentKey}
      onChordSelect={handleChordSelect}
    />
  );
}

