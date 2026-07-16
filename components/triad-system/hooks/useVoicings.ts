'use client';

/**
 * Hook for managing triad voicings
 */

import { useMemo } from 'react';
import {
  buildTriad,
  findAllVoicings,
  filterVoicingsByZone,
  filterVoicingsByCAGEDShape,
  getPentatonicForMajorKey,
  getPentatonicForMinorKey
} from '@/lib/music-theory';
import type {
  TriadVoicing,
  PentatonicScale,
  StringSet,
  Inversion,
  Zone,
  PitchClass,
  ScaleMode,
  TriadQuality,
  CAGEDShape
} from '@/lib/music-theory/types';

interface UseVoicingsOptions {
  key: PitchClass;
  mode: ScaleMode;
  quality: TriadQuality;
  stringSets: StringSet[];
  inversions: Inversion[];
  currentZone: Zone | null;
  selectedCAGEDShapes?: CAGEDShape[];
  showCAGEDShapes?: boolean;
  fretRange?: [number, number];
}

export function useVoicings({
  key,
  mode,
  quality,
  stringSets,
  inversions,
  currentZone,
  selectedCAGEDShapes = ['C', 'A', 'G', 'E', 'D'],
  showCAGEDShapes = false,
  fretRange = [0, 15]
}: UseVoicingsOptions) {
  // Build the triad
  const triad = useMemo(() => {
    return buildTriad(key, quality);
  }, [key, quality]);

  // Get pentatonic scale for the key
  const pentatonicScale = useMemo((): PentatonicScale => {
    if (mode === 'major') {
      return getPentatonicForMajorKey(key);
    } else {
      return getPentatonicForMinorKey(key);
    }
  }, [key, mode]);

  // Generate all voicings
  const allVoicings = useMemo(() => {
    return findAllVoicings(triad, stringSets, inversions, fretRange);
  }, [triad, stringSets, inversions, fretRange]);

  // Filter by current zone if set
  const zoneFilteredVoicings = useMemo(() => {
    if (!currentZone) return allVoicings;
    return filterVoicingsByZone(allVoicings, currentZone);
  }, [allVoicings, currentZone]);

  // Filter by CAGED shapes if enabled
  const filteredVoicings = useMemo(() => {
    if (!showCAGEDShapes || selectedCAGEDShapes.length === 0) {
      return zoneFilteredVoicings;
    }

    // Apply CAGED filtering - a voicing matches if it's in a zone with any of the selected shapes
    let cagedFiltered: TriadVoicing[] = [];
    for (const shape of selectedCAGEDShapes) {
      const shapeVoicings = filterVoicingsByCAGEDShape(zoneFilteredVoicings, shape);
      cagedFiltered = [...cagedFiltered, ...shapeVoicings];
    }

    // Remove duplicates (voicings that match multiple shapes)
    const uniqueVoicings = Array.from(
      new Map(cagedFiltered.map(v => [v.voicingId, v])).values()
    );

    return uniqueVoicings;
  }, [zoneFilteredVoicings, showCAGEDShapes, selectedCAGEDShapes]);

  // Group voicings by string set
  const voicingsByStringSet = useMemo(() => {
    const groups: Record<StringSet, TriadVoicing[]> = {
      '123': [],
      '234': [],
      '345': [],
      '456': []
    };

    for (const voicing of filteredVoicings) {
      groups[voicing.stringSet].push(voicing);
    }

    return groups;
  }, [filteredVoicings]);

  // Group voicings by inversion
  const voicingsByInversion = useMemo(() => {
    const groups: Record<Inversion, TriadVoicing[]> = {
      'root': [],
      'first': [],
      'second': []
    };

    for (const voicing of filteredVoicings) {
      groups[voicing.inversion].push(voicing);
    }

    return groups;
  }, [filteredVoicings]);

  // Get voicing count
  const voicingCount = filteredVoicings.length;

  return {
    triad,
    pentatonicScale,
    allVoicings,
    filteredVoicings,
    voicingsByStringSet,
    voicingsByInversion,
    voicingCount
  };
}

