'use client';

/**
 * Nearby Progression Chords Component
 * Displays chords from the song progression in horizontal scrollable format
 * Matches the Nearby Diatonic Chords UI from the Triads & CAGED screen
 */

import React, { useMemo, useState } from 'react';
import { ThemeConfig } from '@/lib/themes';
import { ChordInstance } from '@/lib/chord-progression/types';
import { TriadPosition } from '@/lib/triad-positions';
import { NOTE_COLORS } from '@/lib/musicTheory';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';

interface ChordInZone {
  chord: ChordInstance;
  isPlayableInZone: boolean;
  positionsInZone: TriadPosition[];
  allPositions: TriadPosition[];
}

interface NearbyProgressionChordsProps {
  theme: ThemeConfig;
  allChords: ChordInstance[];
  chordsInZone: ChordInZone[];
  selectedChord: ChordInstance | null;
  selectedTriadPosition: TriadPosition | null;
  currentCAGEDZone: string;
  onChordSelect: (chord: ChordInstance, position: TriadPosition) => void;
}

export default function NearbyProgressionChords({
  theme,
  allChords,
  chordsInZone,
  selectedChord,
  selectedTriadPosition,
  currentCAGEDZone,
  onChordSelect,
}: NearbyProgressionChordsProps) {
  // This component is now empty - chord cards removed as they duplicate timeline chords
  // Navigation arrows moved to TriadFretboard component
  return null;
}


