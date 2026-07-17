'use client';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import Fretboard from '@/components/Fretboard';
import ControlPanel from '@/components/ControlPanel';
import ChordProgressions from '@/components/ChordProgressions';
import Header from '@/components/Header';
import CircleOf5ths from '@/components/CircleOf5ths';
import HarmonizationTabs from '@/components/HarmonizationTabs';
import ChordToneProgressionCarousel from '@/components/ChordToneProgressionCarousel';
import { AudioSidebar } from '@/components/AudioSidebar';
import CompatibleScalesSection from '@/components/audio/CompatibleScalesSection';
import OnboardingGuide from '@/components/OnboardingGuide';
import ChordRecommendations from '@/components/ChordRecommendations';
import ChordProgressionRecommendations from '@/components/ChordProgressionRecommendations';
import DynamicRecommendationPanel from '@/components/DynamicRecommendationPanel';
import ErrorBoundary from '@/components/ErrorBoundary';
import MusicTheoryTabs from '@/components/MusicTheoryTabs';
import AIAssistantSidebar from '@/components/ai-assistant/AIAssistantSidebar';
import { CustomProgressionsTab } from '@/components/custom-progressions/CustomProgressionsTab';
import { IntervalStep } from '@/lib/custom-progressions/types';
import { calculateScalePositions, calculateCombinedScalePositions, TUNINGS, NOTES, getScaleNotes, getTonicChordTones, getGuideTones, CHORD_TONE_COLORS, NOTE_COLORS } from '@/lib/musicTheory';
import { Theme, themes, FretboardTheme, fretboardThemes } from '@/lib/themes';
import { useSupabaseStorage } from '@/hooks/useSupabaseStorage';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { calculateLiveNotePositions, calculateExactLiveNotePosition, LiveNotePosition } from '@/lib/audio/liveNoteDetection';
import { ScaleCompatibilityRating, getCompatibleScales } from '@/lib/musicalCompatibility';
import { getCompatibleScalesFromDatabase } from '@/lib/music-theory-database/compatibility-service';
import { dbScaleNameToIntervalsKey } from '@/lib/music-theory-database/scale-mapping';
import { ManualSelection } from '@/components/ManualSelectionList';
import { useMIDIButtonHandlers } from '@/hooks/useMIDIButtonHandlers';
import { FretboardScaleData } from '@/lib/ai-assistant/types';
import { TriadInversion, CAGEDShape } from '@/lib/triad-theory';
import { useCAGED, type NoteName, type ChordQuality, type CAGEDShapeName } from '@/lib/caged';
import { NotePosition } from '@/lib/musicTheory';
import { ZONE_DEFINITIONS } from '@/lib/music-theory/constants';
import {
  getScaleRecommendationsForTriad,
  getScaleNameForTriad,
  getScaleKeyForTriad,
  getPrimaryScaleForTriad,
  getModeRootNote
} from '@/lib/triad-scale-mapping';
import {
  findNearbyChords,
  findAllDiatonicChordsWithNearestVoicings,
  convertToAnchorVoicing,
  anchorVoicingToNotePositions,
  getCAGEDRegionsForVoicing,
  type AnchorVoicing,
  type NearbyChord,
} from '@/lib/music-theory/neighborhood';
import ChordNeighborhoodPanel from '@/components/chord-neighborhood/ChordNeighborhoodPanel';
import NearbyChordLegend from '@/components/chord-neighborhood/NearbyChordLegend';
import ChordProgressionModal from '@/components/chord-neighborhood/ChordProgressionModal';
import SelectedChordInfo from '@/components/chord-neighborhood/SelectedChordInfo';
import { getChordSymbol } from '@/lib/music-theory/neighborhood/diatonic';
import TriadPositionsCard from '@/components/TriadPositionsCard';
import TabbedSettingsCard from '@/components/TabbedSettingsCard';
import ChordProgressionNavigator from '@/components/ChordProgressionNavigator';
import AddChordToNeighborhood from '@/components/chord-neighborhood/AddChordToNeighborhood';
import ChordDiagramSidebar from '@/components/chord-neighborhood/ChordDiagramSidebar';
import UnifiedRightSidebar from '@/components/chord-neighborhood/UnifiedRightSidebar';
import SaveProgressionDialog from '@/components/chord-neighborhood/SaveProgressionDialog';
import LoadProgressionDialog from '@/components/chord-neighborhood/LoadProgressionDialog';
import OverlappingChordsContainer from '@/components/overlapping-chords/OverlappingChordsContainer';
import ChordBrowserSidebar from '@/components/overlapping-chords/ChordBrowserSidebar';
import { findChordsInCagedArea, findChordsInScale } from '@/lib/music-theory/overlapping-chords/chord-finder';
import { OverlappingChord, OverlapType } from '@/lib/music-theory/overlapping-chords/types';
import { assignChordColors } from '@/lib/music-theory/overlapping-chords/color-manager';
import FretZoneChordHUD from '@/components/fretboard-zone-chords/FretZoneChordHUD';
import { ChordProgression } from '@/lib/progression-analyzer/types';
import { ProgressionChordSelections } from '@/lib/music-theory/progression-interval-chords/types';
import { buildProgressionFilterPositions, buildStepViewPositions, buildAllChordsViewPositions } from '@/lib/progressionFretboardUtils';
import { computeDiatonicTriads, computeTriadMembership } from '@/lib/music-theory/triad-membership';
import type { DiatonicTriad } from '@/lib/music-theory/triad-membership/types';
import { TriadFocusSelector } from '@/components/scale-triads/TriadFocusSelector';
import { normalizeNoteToSharp } from '@/lib/triad-theory';
import { useNoteDisplay } from '@/hooks/useNoteDisplay';
import { SliderResetButton } from '@/components/shared/SliderResetButton';

// Degree → display color for the chord-tone progression pattern indicator
const PATTERN_DEGREE_COLORS: Record<string, string> = {
  '1': CHORD_TONE_COLORS.root,
  '3': CHORD_TONE_COLORS.third,
  '5': CHORD_TONE_COLORS.fifth,
  '7': CHORD_TONE_COLORS.seventh,
};

// Color palette for nearby chords when showing all
const NEARBY_CHORD_COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#8b5cf6', // violet
];

export default function Home() {
  const { getNoteDisplayName } = useNoteDisplay();
  const [currentTheme, setCurrentTheme] = useSupabaseStorage<Theme>('guitar-app-theme', 'dark');
  const [rootNote, setRootNote, setRootNoteDisplayOnly] = useSupabaseStorage('guitar-app-root-note', 'B');
  const [scaleName, setScaleName, setScaleNameDisplayOnly] = useSupabaseStorage('guitar-app-scale-name', 'Aeolian');
  const [stringCount, setStringCount] = useSupabaseStorage<6 | 7>('guitar-app-string-count', 6);
  const [tuningName, setTuningName] = useSupabaseStorage('guitar-app-tuning-name', 'Standard');
  const [isInverted, setIsInverted] = useSupabaseStorage('guitar-app-is-inverted', true);
  const [selectedChordNotes, setSelectedChordNotes] = useSupabaseStorage<string[] | null>('guitar-app-selected-chord-notes', null);
  const [selectedGuideTones, setSelectedGuideTones] = useSupabaseStorage<string[] | null>('guitar-app-selected-guide-tones', null);
  const [chordHighlightColor, setChordHighlightColor] = useSupabaseStorage('guitar-app-chord-highlight-color', '#fbbf24');
  const [guideTonesColor, setGuideTonesColor] = useSupabaseStorage('guitar-app-guide-tones-color', '#ec4899');
  const [showChordTones, setShowChordTones] = useSupabaseStorage('guitar-app-show-chord-tones', true);
  const [showGuideTones, setShowGuideTones] = useSupabaseStorage('guitar-app-show-guide-tones', true);
  const [showChordGlow, setShowChordGlow] = useSupabaseStorage('guitar-app-show-chord-glow', true);
  const [colorGuideEnabled, setColorGuideEnabled] = useSupabaseStorage('guitar-app-color-guide-enabled', true);
  const [glowOpacity, setGlowOpacity] = useSupabaseStorage('guitar-app-glow-opacity', 40);
  const [showWhiteBorder, setShowWhiteBorder] = useSupabaseStorage('guitar-app-show-white-border', false);
  const [fretDotColor, setFretDotColor] = useSupabaseStorage('guitar-app-fret-dot-color', '#9ca3af');
  const [showMiddleDots, setShowMiddleDots] = useSupabaseStorage('guitar-app-show-middle-dots', false);
  const [fretCount, setFretCount] = useSupabaseStorage('guitar-app-fret-count', 24);
  const [fretWidth, setFretWidth] = useSupabaseStorage('guitar-app-fret-width', 50);
  const [onlyChordTones, setOnlyChordTones] = useSupabaseStorage('guitar-app-only-chord-tones', false);
  const [selectedChordToneTypes, setSelectedChordToneTypes] = useSupabaseStorage<('root' | 'third' | 'fifth' | 'seventh')[]>(
    'guitar-app-selected-chord-tone-types',
    ['root', 'third', 'fifth', 'seventh']
  );
  // All Intervals mode
  const [allIntervalsMode, setAllIntervalsMode] = useSupabaseStorage('guitar-app-all-intervals-mode', false);
  const [selectedIntervalDegrees, setSelectedIntervalDegrees] = useSupabaseStorage<number[]>(
    'guitar-app-selected-interval-degrees',
    [0, 1, 2, 3, 4, 5, 6]
  );

  // Triad system state
  const [showTriadMode, setShowTriadMode] = useLocalStorage('guitar-app-show-triad-mode', false);
  const [triadData, setTriadData] = useState<any>(null);
  const [fretboardData, setFretboardData] = useState<any>(null);
  const [selectedTriadInversion, setSelectedTriadInversion] = useSupabaseStorage<TriadInversion>('guitar-app-selected-triad-inversion', 'root');
  const [selectedTriadCAGEDShapes, setSelectedTriadCAGEDShapes] = useSupabaseStorage<CAGEDShape[]>('guitar-app-selected-triad-caged-shapes', ['C', 'A', 'G', 'E', 'D']);
  const [showCAGEDGuide, setShowCAGEDGuide] = useSupabaseStorage('guitar-app-show-caged-guide', false);
  const [cagedBrightness, setCAGEDBrightness] = useSupabaseStorage('guitar-app-caged-brightness', 100);

  // ── Triads in Scale / Triad Focus Mode state ──────────────────────────────
  const [showTriadArcBands, setShowTriadArcBands] = useState(false);
  const [triadFocusOn, setTriadFocusOn] = useState(false);
  const [selectedFocusDegree, setSelectedFocusDegree] = useState<string>('I');
  // Per key+scale memory: remember last selected degree when returning to a scale
  const [triadFocusMemory, setTriadFocusMemory] = useState<Record<string, string>>({});
  // Background (non-triad) note appearance controls
  const [nonTriadOpacity, setNonTriadOpacity] = useState(30);   // 0-100
  const [nonTriadColorMode, setNonTriadColorMode] = useLocalStorage('guitar-app-non-triad-color-mode', true); // false=Interval, true=Monocolor; defaults to Monocolor
  const [showRootNoteHighlight, setShowRootNoteHighlight] = useLocalStorage('guitar-app-show-root-note-highlight', false);
  const [show7thNoteHighlight, setShow7thNoteHighlight] = useLocalStorage('guitar-app-show-7th-note-highlight', false);
  // ───────────────────────────────────────────────────────────────────────────

  // Individual Notes mode state - shows all positions of a single note on the fretboard
  const [showIndividualNotes, setShowIndividualNotes] = useLocalStorage('guitar-app-show-individual-notes', false);

  // Overlapping Chords state
  const [overlappingChordsEnabled, setOverlappingChordsEnabled] = useLocalStorage('guitar-app-overlapping-chords-enabled', false);
  const [overlappingDisplayMode, setOverlappingDisplayMode] = useLocalStorage<'caged' | 'scale'>('guitar-app-overlapping-display-mode', 'caged');
  const [overlappingCriteria, setOverlappingCriteria] = useLocalStorage<'all' | 'two-or-more'>('guitar-app-overlapping-criteria', 'all');
  const [overlappingCAGEDShapes, setOverlappingCAGEDShapes] = useLocalStorage<CAGEDShape[]>('guitar-app-overlapping-caged-shapes', ['C', 'A', 'G', 'E', 'D']);
  const [overlappingScalePositions, setOverlappingScalePositions] = useLocalStorage<number[]>('guitar-app-overlapping-scale-positions', []);
  const [selectedOverlappingChords, setSelectedOverlappingChords] = useLocalStorage<any[]>('guitar-app-selected-overlapping-chords', []);
  const [hoveredOverlappingChord, setHoveredOverlappingChord] = useState<any | null>(null);

  // Triad type state (root note now comes from Select Key & Scale's manualKey)
  const [selectedTriadType, setSelectedTriadType] = useSupabaseStorage<'major' | 'minor' | 'diminished' | 'augmented'>('guitar-app-selected-triad-type', 'major');

  // Pentatonic mode state
  const [showPentatonicMode, setShowPentatonicMode] = useSupabaseStorage('guitar-app-show-pentatonic-mode', false);
  const [showPentatonicCAGEDGuide, setShowPentatonicCAGEDGuide] = useSupabaseStorage('guitar-app-show-pentatonic-caged-guide', false);
  const [fretboardOrder, setFretboardOrder] = useSupabaseStorage<'triads-top' | 'pentatonics-top'>('guitar-app-fretboard-order', 'triads-top');
  const [isPentatonicHeaderCollapsed, setIsPentatonicHeaderCollapsed] = useSupabaseStorage('guitar-app-pentatonic-header-collapsed', false);
  const [selectedScaleIndex, setSelectedScaleIndex] = useSupabaseStorage('guitar-app-triad-scale-index', 0);
  const [showTriadsOnScaleFretboard, setShowTriadsOnScaleFretboard] = useSupabaseStorage('guitar-app-show-triads-on-scale-fretboard', false);
  const [showOctaveNotes, setShowOctaveNotes] = useSupabaseStorage('guitar-app-show-octave-notes', true);

  // Chord Neighborhood state
  const [chordNeighborhoodState, setChordNeighborhoodState] = useState<{
    anchorVoicing: any | null;
    nearbyChords: any[];
    anchorVoicings: any[];
    activeAnchorIndex: number;
    nearbyChordsByAnchor: any[][];
    selectedOverlay: any | null;
    isPanelVisible: boolean;
    searchRange: { min: number; max: number };
    selectionMode: 'triads' | 'chords';
    isChordDiagramSidebarVisible: boolean;
    progressionChords: any[];
  }>({
    anchorVoicing: null,
    nearbyChords: [],
    anchorVoicings: [],
    activeAnchorIndex: 0,
    nearbyChordsByAnchor: [],
    selectedOverlay: null,
    isPanelVisible: false,
    searchRange: { min: 2, max: 6 },
    selectionMode: 'triads',
    isChordDiagramSidebarVisible: false,
    progressionChords: [],
  });

  // Hover state for anchor voicing tabs
  const [hoveredAnchorVoicing, setHoveredAnchorVoicing] = useState<any | null>(null);

  // State for anchor position navigation
  const [allAnchorPositions, setAllAnchorPositions] = useState<any[]>([]);
  const [currentAnchorPositionIndex, setCurrentAnchorPositionIndex] = useState<number>(0);
  const [showFretboardArrows, setShowFretboardArrows] = useState<boolean>(true);

  // Show All Chords state
  const [showAllNearbyChords, setShowAllNearbyChords] = useState(false);

  // Selected chords for multi-chord display (the progression buttons to show)
  const [selectedNearbyChords, setSelectedNearbyChords] = useState<NearbyChord[]>([]);

  // Enabled chords for fretboard display (which chords from the progression are visible on fretboard)
  const [enabledNearbyChords, setEnabledNearbyChords] = useState<NearbyChord[]>([]);

  // Reordered chords for chord progression
  const [reorderedNearbyChords, setReorderedNearbyChords] = useState<NearbyChord[]>([]);

  // Chord Neighborhood panel expand/collapse state (hidden by default)
  const [isChordNeighborhoodExpanded, setIsChordNeighborhoodExpanded] = useState(false);

  // Chord Progression Modal state
  const [isChordProgressionModalOpen, setIsChordProgressionModalOpen] = useState(false);

  // Chord Progression Sidebar state (right sidebar)
  const [isChordProgressionSidebarOpen, setIsChordProgressionSidebarOpen] = useState(false);

  // Save/Load Progression Dialog state
  const [isSaveProgressionDialogOpen, setIsSaveProgressionDialogOpen] = useState(false);
  const [isLoadProgressionDialogOpen, setIsLoadProgressionDialogOpen] = useState(false);
  const [currentProgressionId, setCurrentProgressionId] = useState<string | undefined>(undefined);
  const [currentProgressionName, setCurrentProgressionName] = useState<string | undefined>(undefined);
  const [currentProgressionDescription, setCurrentProgressionDescription] = useState<string | undefined>(undefined);

  // Unified Right Sidebar state - combines Chord Diagrams and Explore Progressions
  const [unifiedSidebarTab, setUnifiedSidebarTab] = useState<'diagrams' | 'explore'>('diagrams');

  // Shared chord progression recommendations state (persists between modal and sidebar)
  const [sharedProgressionRecommendations, setSharedProgressionRecommendations] = useState<any[]>([]);
  const [sharedProgressionPrompt, setSharedProgressionPrompt] = useState('');
  const [sharedProgressionComplexity, setSharedProgressionComplexity] = useState(5);
  const [sharedProgressionLength, setSharedProgressionLength] = useState(4);
  const [sharedProgressionNumRecommendations, setSharedProgressionNumRecommendations] = useState(4);
  const [sharedProgressionShowFilters, setSharedProgressionShowFilters] = useState(false);

  // Shared note ring opacity state (0-100)
  const [sharedNoteRingOpacity, setSharedNoteRingOpacity] = useSupabaseStorage('guitar-app-shared-note-ring-opacity', 60);

  // Overlapping chords state
  const [overlappingChordsData, setOverlappingChordsData] = useState<any>(null);

  // ─── Feature 0 + A: Progression Filter & Chord Selector State ───────────────
  const [selectedProgression, setSelectedProgression] = useState<ChordProgression | null>(null);
  const [progressionChordSelections, setProgressionChordSelections] = useState<ProgressionChordSelections>({});
  const [progressionViewMode, setProgressionViewMode] = useState<'step' | 'all'>('step');
  const [progressionCurrentSlot, setProgressionCurrentSlot] = useState(0);
  // Separate glow brightness for progression highlight (20–200, default 100)
  const [progressionGlowBrightness, setProgressionGlowBrightness] = useState(100);
  // Feature B: zone-highlighted chord notes (ephemeral, not persisted)
  const [zoneHighlightedChordNotes, setZoneHighlightedChordNotes] = useState<string[] | null>(null);

  // Chord progression state persistence
  const [chordProgressionState, setChordProgressionState] = useSupabaseStorage<any>('guitar-app-chord-progression-state', null);
  const [hasRestoredProgression, setHasRestoredProgression] = useState(false);

  // Load chord progression state on mount (only AI recommendations, not selected chords)
  useEffect(() => {
    // Only restore if:
    // 1. We have saved state
    // 2. Root note and triad type match
    // 3. We haven't already restored this session
    if (chordProgressionState &&
        chordProgressionState.rootNote === rootNote &&
        chordProgressionState.triadType === selectedTriadType &&
        !hasRestoredProgression) {

      // Restore ONLY the AI recommendations and settings
      // DO NOT restore selectedNearbyChords or reorderedNearbyChords
      // The user needs to click "Use This Progression" again to load chords onto fretboard
      if (chordProgressionState.sharedProgressionRecommendations) {
        setSharedProgressionRecommendations(chordProgressionState.sharedProgressionRecommendations);
      }
      if (chordProgressionState.sharedProgressionPrompt) {
        setSharedProgressionPrompt(chordProgressionState.sharedProgressionPrompt);
      }
      if (chordProgressionState.sharedProgressionComplexity !== undefined) {
        setSharedProgressionComplexity(chordProgressionState.sharedProgressionComplexity);
      }
      if (chordProgressionState.sharedProgressionLength !== undefined) {
        setSharedProgressionLength(chordProgressionState.sharedProgressionLength);
      }
      if (chordProgressionState.sharedProgressionNumRecommendations !== undefined) {
        setSharedProgressionNumRecommendations(chordProgressionState.sharedProgressionNumRecommendations);
      }

      setHasRestoredProgression(true);
      console.log('🎵 Restored chord progression recommendations for', rootNote, selectedTriadType);
    }
  }, [chordProgressionState, rootNote, selectedTriadType, hasRestoredProgression]);

  // Save chord progression state whenever it changes
  useEffect(() => {
    // Only save if we have selected chords (meaning user has used a progression)
    if (selectedNearbyChords.length > 0) {
      const stateToSave = {
        rootNote,
        triadType: selectedTriadType,
        selectedNearbyChords,
        reorderedNearbyChords,
        sharedProgressionRecommendations,
        sharedProgressionPrompt,
        sharedProgressionComplexity,
        sharedProgressionLength,
        sharedProgressionNumRecommendations,
        timestamp: new Date().toISOString(),
      };

      setChordProgressionState(stateToSave);
      console.log('💾 Saved chord progression state for', rootNote, selectedTriadType);
    }
  }, [
    rootNote,
    selectedTriadType,
    selectedNearbyChords,
    reorderedNearbyChords,
    sharedProgressionRecommendations,
    sharedProgressionPrompt,
    sharedProgressionComplexity,
    sharedProgressionLength,
    sharedProgressionNumRecommendations,
    setChordProgressionState,
  ]);

  // Memoize triad callbacks to prevent infinite loops
  const handleTriadDataChange = useCallback((data: any) => {
    setTriadData(data);
    // Update selected inversion from TriadTab
    if (data?.selectedInversion) {
      setSelectedTriadInversion(data.selectedInversion);
    }
  }, []);

  const handleFretboardDataChange = useCallback((data: any) => {
    setFretboardData(data);
  }, []);

  // Filter nearby chords to show only diatonic chords (for display)
  // Keep all chords in state for AI matching, but filter for UI display
  // Also include chromatic chords that are part of selected progressions
  const displayedNearbyChords = useMemo(() => {
    return chordNeighborhoodState.nearbyChords.filter(chord => {
      // Always show diatonic chords
      if (chord.function !== 'Chromatic') return true;

      // Also show chromatic chords that are in the selected progression
      return selectedNearbyChords.some(selected =>
        selected.rootNote === chord.rootNote && selected.quality === chord.quality
      );
    });
  }, [chordNeighborhoodState.nearbyChords, selectedNearbyChords]);

  // Compute which chords to save - matches what ChordProgressionNavigator displays
  const chordsToSave = useMemo(() => {
    if (chordNeighborhoodState.selectionMode === 'chords') {
      return chordNeighborhoodState.progressionChords;
    }
    return selectedNearbyChords.length > 0 ? selectedNearbyChords : displayedNearbyChords;
  }, [chordNeighborhoodState.selectionMode, chordNeighborhoodState.progressionChords, selectedNearbyChords, displayedNearbyChords]);

  // Handler for clicking on a triad voicing to set as anchor
  const handleTriadVoicingClick = useCallback((position: any, allPositions?: any[]) => {
    if (!position || !showTriadMode) return;

    // Determine the key mode from the selected triad type
    const keyMode = selectedTriadType === 'minor' ? 'minor' : 'major';

    // Get ALL possible positions for this chord (for navigation)
    const { getAllTriadPositions: getAllPositions } = require('@/lib/music-theory/neighborhood');
    const allAvailablePositions = getAllPositions(position.rootNote, position.triadType);

    // Find the index of the clicked position in the full list
    const clickedIndex = allAvailablePositions.findIndex((pos: any) =>
      pos.fretPosition === position.fretPosition &&
      pos.stringSet.toString() === position.stringPositions.map((sp: any) => sp.stringIndex).toString() &&
      pos.inversion === position.inversion
    );

    // Store all positions and current index for navigation
    setAllAnchorPositions(allAvailablePositions);
    setCurrentAnchorPositionIndex(clickedIndex >= 0 ? clickedIndex : 0);

    // If multiple positions are provided, handle all of them with tabs
    if (allPositions && allPositions.length > 1) {
      const anchorVoicings = allPositions.map(pos => convertToAnchorVoicing(pos));
      // Use comprehensive chord finder that includes ALL diatonic chords across all qualities
      // Pass the actual key (rootNote and keyMode) to get correct diatonic chord degrees
      const nearbyChordsByAnchor = anchorVoicings.map(anchor =>
        findAllDiatonicChordsWithNearestVoicings(anchor, rootNote, keyMode)
      );

      setChordNeighborhoodState({
        ...chordNeighborhoodState,
        anchorVoicing: anchorVoicings[0], // Set first as primary for backward compatibility
        nearbyChords: nearbyChordsByAnchor[0], // Set first as primary for backward compatibility
        anchorVoicings,
        activeAnchorIndex: 0,
        nearbyChordsByAnchor,
        selectedOverlay: null,
        isPanelVisible: true,
      });

      // Enable all diatonic chords by default when panel opens
      const diatonicChords = nearbyChordsByAnchor[0].filter(chord =>
        ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'].includes(chord.degree)
      );
      setEnabledNearbyChords(diatonicChords);
      setShowAllNearbyChords(true);
    } else {
      // Single position - existing logic
      const anchorVoicing = convertToAnchorVoicing(position);
      // Use comprehensive chord finder that includes ALL diatonic chords across all qualities
      // Pass the actual key (rootNote and keyMode) to get correct diatonic chord degrees
      const nearbyChords = findAllDiatonicChordsWithNearestVoicings(anchorVoicing, rootNote, keyMode);

      console.log('🎸 Generated nearby chords for anchor:', anchorVoicing);
      console.log('🎸 Actual key:', rootNote, keyMode);
      console.log('🎸 Total nearby chords found:', nearbyChords.length);
      console.log('🎸 Nearby chords:', nearbyChords.map(nc => `${nc.rootNote}${nc.quality === 'major' ? '' : nc.quality === 'minor' ? 'm' : nc.quality === 'diminished' ? 'dim' : 'aug'} (${nc.function})`));

      setChordNeighborhoodState({
        ...chordNeighborhoodState,
        anchorVoicing,
        nearbyChords,
        anchorVoicings: [anchorVoicing],
        activeAnchorIndex: 0,
        nearbyChordsByAnchor: [nearbyChords],
        selectedOverlay: null,
        isPanelVisible: true,
      });

      // Enable all diatonic chords by default when panel opens
      const diatonicChords = nearbyChords.filter(chord =>
        ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'].includes(chord.degree)
      );
      setEnabledNearbyChords(diatonicChords);
      setShowAllNearbyChords(true);
    }
  }, [showTriadMode, chordNeighborhoodState, rootNote, selectedTriadType]);

  // Handler for Show All toggle - controls all individual toggle switches
  const handleShowAllChordsChange = useCallback((show: boolean) => {
    setShowAllNearbyChords(show);

    if (show) {
      // Turn ON all chord toggle switches (including non-diatonic chords from progressions)
      // Use displayedNearbyChords which includes all chords currently shown
      setEnabledNearbyChords(displayedNearbyChords);
    } else {
      // Turn OFF all toggle switches
      setEnabledNearbyChords([]);
    }
  }, [displayedNearbyChords]);

  // Handler for clicking on a nearby chord button
  const handleNearbyChordClick = useCallback((nearbyChord: NearbyChord | null) => {
    // If a specific chord is clicked (not null) and Show All is enabled, turn off Show All
    if (nearbyChord !== null && showAllNearbyChords) {
      setShowAllNearbyChords(false);
    }

    // If clearing the overlay (Back to Triads) and we have enabled chords from a progression,
    // turn on Show All to display all enabled chords
    if (nearbyChord === null && enabledNearbyChords.length > 0) {
      setShowAllNearbyChords(true);
    }

    setChordNeighborhoodState(prev => ({
      ...prev,
      selectedOverlay: prev.selectedOverlay?.degree === nearbyChord?.degree ? null : nearbyChord,
    }));
  }, [showAllNearbyChords, enabledNearbyChords.length]);

  // Handler for changing selection mode (triads vs chords)
  const handleSelectionModeChange = useCallback((mode: 'triads' | 'chords') => {
    setChordNeighborhoodState(prev => ({
      ...prev,
      selectionMode: mode,
    }));
  }, []);

  // Calculate available overlapping chords
  const availableOverlappingChords = useMemo(() => {
    if (!overlappingChordsEnabled) return [];

    // Map UI criteria to algorithm overlap type
    const overlapType: OverlapType = overlappingCriteria === 'all' ? 'complete' : 'partial';

    if (overlappingDisplayMode === 'caged') {
      if (overlappingCAGEDShapes.length === 0) return [];

      // Get CAGED positions from triad positions
      const cagedPositions: Record<CAGEDShape, number> = {
        C: 0, A: 0, G: 0, E: 0, D: 0
      };

      return findChordsInCagedArea(
        overlappingCAGEDShapes,
        cagedPositions,
        overlapType,
        stringCount
      );
    } else {
      // Scale mode
      if (overlappingScalePositions.length === 0) return [];

      // Calculate tuning inside the useMemo to avoid reference error
      const tuning = TUNINGS[stringCount][tuningName as keyof typeof TUNINGS[typeof stringCount]];

      return findChordsInScale(
        rootNote,
        scaleName,
        overlappingScalePositions,
        overlapType,
        stringCount,
        tuning
      );
    }
  }, [
    overlappingChordsEnabled,
    overlappingDisplayMode,
    overlappingCriteria,
    overlappingCAGEDShapes,
    overlappingScalePositions,
    rootNote,
    scaleName,
    stringCount,
    tuningName,
  ]);

  // Handler for overlapping chord selection
  const handleOverlappingChordClick = useCallback((chord: OverlappingChord) => {
    const isSelected = selectedOverlappingChords.some(
      (c: OverlappingChord) => c.rootNote === chord.rootNote && c.quality === chord.quality
    );

    let newSelected: OverlappingChord[];
    if (isSelected) {
      newSelected = selectedOverlappingChords.filter(
        (c: OverlappingChord) => !(c.rootNote === chord.rootNote && c.quality === chord.quality)
      );
    } else {
      newSelected = [...selectedOverlappingChords, { ...chord, isSelected: true }];
    }

    // Assign colors to selected chords
    const colorAssignments = assignChordColors(newSelected);
    const coloredChords = newSelected.map((c, i) => ({
      ...c,
      color: colorAssignments[i].color,
    }));

    setSelectedOverlappingChords(coloredChords);
  }, [selectedOverlappingChords]);

  // Handler for clearing all overlapping chord selections
  const handleClearAllOverlappingChords = useCallback(() => {
    setSelectedOverlappingChords([]);
  }, []);

  // Handler for voicing change
  const handleVoicingChange = useCallback((chordIndex: number, voicingIndex: number, voicing: any) => {
    // Update selectedNearbyChords if it's being used
    setSelectedNearbyChords(prev => {
      if (prev.length > 0 && prev[chordIndex]) {
        const updated = [...prev];
        updated[chordIndex] = {
          ...updated[chordIndex],
          selectedVoicingIndex: voicingIndex,
          // Store the actual selected voicing object directly
          selectedVoicing: voicing,
        };
        return updated;
      }
      return prev;
    });

    // Update nearbyChords in state if selectedNearbyChords is empty (showing all diatonic chords)
    setChordNeighborhoodState(prev => {
      const updatedChords = [...prev.progressionChords];
      if (updatedChords[chordIndex]) {
        updatedChords[chordIndex] = {
          ...updatedChords[chordIndex],
          selectedVoicingIndex: voicingIndex,
          // Store the actual selected voicing object directly
          selectedVoicing: voicing,
        };
      }

      // Also update nearbyChords if this chord exists there
      const updatedNearbyChords = prev.nearbyChords.map(chord => {
        const matchingChord = updatedChords[chordIndex];
        if (matchingChord &&
            chord.rootNote === matchingChord.rootNote &&
            chord.quality === matchingChord.quality) {
          return {
            ...chord,
            selectedVoicingIndex: voicingIndex,
            selectedVoicing: voicing,
          };
        }
        return chord;
      });

      return {
        ...prev,
        progressionChords: updatedChords,
        nearbyChords: updatedNearbyChords,
      };
    });
  }, []);

  // Handler for deleting a chord from progression
  const handleChordDelete = useCallback((chordIndex: number) => {
    setChordNeighborhoodState(prev => {
      const updatedChords = prev.progressionChords.filter((_, i) => i !== chordIndex);
      return {
        ...prev,
        progressionChords: updatedChords,
      };
    });
  }, []);

  // Handler for adding a chord to progression
  const [isAddChordModalOpen, setIsAddChordModalOpen] = useState(false);

  const handleAddChord = useCallback(() => {
    setIsAddChordModalOpen(true);
  }, []);

  const handleChordAdd = useCallback((chord: any) => {
    setChordNeighborhoodState(prev => ({
      ...prev,
      progressionChords: [...prev.progressionChords, chord],
    }));
  }, []);

  const handleOpenChordSelector = useCallback(() => {
    setIsAddChordModalOpen(true);
  }, []);

  const handleToggleChordDiagramSidebar = useCallback(() => {
    setChordNeighborhoodState(prev => {
      // If sidebar is already open, just switch to diagrams tab
      if (prev.isChordDiagramSidebarVisible) {
        setUnifiedSidebarTab('diagrams');
        return prev; // No state change needed, just tab switch
      }

      // If sidebar is closed, open it and set tab to diagrams
      setUnifiedSidebarTab('diagrams');
      return {
        ...prev,
        isChordDiagramSidebarVisible: true,
      };
    });
  }, []);

  const handleToggleExploreSidebar = useCallback(() => {
    setChordNeighborhoodState(prev => {
      // If sidebar is already open, just switch to explore tab
      if (prev.isChordDiagramSidebarVisible) {
        setUnifiedSidebarTab('explore');
        return prev; // No state change needed, just tab switch
      }

      // If sidebar is closed, open it and set tab to explore
      setUnifiedSidebarTab('explore');
      return {
        ...prev,
        isChordDiagramSidebarVisible: true,
      };
    });
  }, []);

  const handleCloseUnifiedSidebar = useCallback(() => {
    setChordNeighborhoodState(prev => ({
      ...prev,
      isChordDiagramSidebarVisible: false,
    }));
  }, []);

  // Handlers for save/load progression
  const handleSaveProgression = useCallback(() => {
    setIsSaveProgressionDialogOpen(true);
  }, []);

  const handleLoadProgression = useCallback(() => {
    setIsLoadProgressionDialogOpen(true);
  }, []);

  const handleSaveProgressionSuccess = useCallback((progressionId: string, progressionName: string, progressionDescription: string) => {
    setCurrentProgressionId(progressionId);
    setCurrentProgressionName(progressionName);
    setCurrentProgressionDescription(progressionDescription);
  }, []);

  const handleLoadProgressionSuccess = useCallback((progressionId: string, chords: NearbyChord[], progressionName: string, progressionDescription: string) => {
    // Set the loaded progression as the selected chords
    setSelectedNearbyChords(chords);
    setEnabledNearbyChords(chords);

    // Update current progression info
    setCurrentProgressionId(progressionId);
    setCurrentProgressionName(progressionName);
    setCurrentProgressionDescription(progressionDescription);

    // Clear any selected overlay
    setChordNeighborhoodState(prev => ({
      ...prev,
      selectedOverlay: null,
    }));
  }, []);

  // Handlers for navigating through anchor positions
  const handleAnchorPositionPrevious = useCallback(() => {
    if (allAnchorPositions.length === 0) return;

    const newIndex = currentAnchorPositionIndex <= 0
      ? allAnchorPositions.length - 1
      : currentAnchorPositionIndex - 1;

    setCurrentAnchorPositionIndex(newIndex);

    // Update the anchor voicing and nearby chords
    const newAnchorVoicing = allAnchorPositions[newIndex];
    const keyMode = selectedTriadType === 'minor' ? 'minor' : 'major';
    const nearbyChords = findAllDiatonicChordsWithNearestVoicings(newAnchorVoicing, rootNote, keyMode);

    setChordNeighborhoodState(prev => ({
      ...prev,
      anchorVoicing: newAnchorVoicing,
      nearbyChords,
      anchorVoicings: [newAnchorVoicing],
      nearbyChordsByAnchor: [nearbyChords],
      selectedOverlay: null, // Clear overlay when changing anchor
    }));

    // Update enabled chords
    const diatonicChords = nearbyChords.filter(chord =>
      ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'].includes(chord.degree)
    );
    setEnabledNearbyChords(diatonicChords);
  }, [allAnchorPositions, currentAnchorPositionIndex, selectedTriadType, rootNote]);

  const handleAnchorPositionNext = useCallback(() => {
    if (allAnchorPositions.length === 0) return;

    const newIndex = currentAnchorPositionIndex >= allAnchorPositions.length - 1
      ? 0
      : currentAnchorPositionIndex + 1;

    setCurrentAnchorPositionIndex(newIndex);

    // Update the anchor voicing and nearby chords
    const newAnchorVoicing = allAnchorPositions[newIndex];
    const keyMode = selectedTriadType === 'minor' ? 'minor' : 'major';
    const nearbyChords = findAllDiatonicChordsWithNearestVoicings(newAnchorVoicing, rootNote, keyMode);

    setChordNeighborhoodState(prev => ({
      ...prev,
      anchorVoicing: newAnchorVoicing,
      nearbyChords,
      anchorVoicings: [newAnchorVoicing],
      nearbyChordsByAnchor: [nearbyChords],
      selectedOverlay: null, // Clear overlay when changing anchor
    }));

    // Update enabled chords
    const diatonicChords = nearbyChords.filter(chord =>
      ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'].includes(chord.degree)
    );
    setEnabledNearbyChords(diatonicChords);
  }, [allAnchorPositions, currentAnchorPositionIndex, selectedTriadType, rootNote]);

  // When toggle switches are used (enabledNearbyChords changes), clear the single chord overlay
  // so that all enabled chords are displayed instead of just the single overlay
  useEffect(() => {
    if (enabledNearbyChords.length > 0 && chordNeighborhoodState.selectedOverlay) {
      setChordNeighborhoodState(prev => ({
        ...prev,
        selectedOverlay: null,
      }));
      // Also turn on Show All to display all enabled chords
      setShowAllNearbyChords(true);
    }
  }, [enabledNearbyChords.length, chordNeighborhoodState.selectedOverlay]);

  // Handler for reordering nearby chords via drag-and-drop
  const handleChordsReorder = useCallback((reordered: NearbyChord[]) => {
    setReorderedNearbyChords(reordered);
    // Update the chordNeighborhoodState with the reordered chords
    setChordNeighborhoodState(prev => ({
      ...prev,
      nearbyChords: reordered,
    }));
  }, []);

  // Sync progressionChords with the chords displayed in the colorful buttons
  // This ensures the Chord Diagrams sidebar shows the correct chords
  // Priority: selectedNearbyChords (if any), otherwise displayedNearbyChords
  useEffect(() => {
    const chordsToDisplay = selectedNearbyChords.length > 0
      ? selectedNearbyChords
      : displayedNearbyChords;

    setChordNeighborhoodState(prev => ({
      ...prev,
      progressionChords: chordsToDisplay,
    }));
  }, [selectedNearbyChords, displayedNearbyChords]);

  // Generate note positions for selected nearby chords
  const allNearbyChordPositions = useMemo(() => {
    // Use enabledNearbyChords if any are enabled (from progression with toggles),
    // otherwise fall back to showAllNearbyChords behavior (showing only diatonic chords)
    const chordsToDisplay = enabledNearbyChords.length > 0
      ? enabledNearbyChords
      : (showAllNearbyChords && chordNeighborhoodState.isPanelVisible ? displayedNearbyChords : []);

    if (chordsToDisplay.length === 0) {
      return [];
    }

    // Determine which list to use for color indexing (matches ChordProgressionNavigator logic)
    // If we have selected chords (from progression), use that list for color assignment
    // Otherwise use displayedNearbyChords
    const colorReferenceList = selectedNearbyChords.length > 0 ? selectedNearbyChords : displayedNearbyChords;

    // First, collect all positions with their chord colors
    interface PositionKey {
      stringIndex: number;
      fretNumber: number;
      note: string;
    }

    const positionMap = new Map<string, { position: NotePosition; colors: string[] }>();

    chordsToDisplay.forEach((chord) => {
      // Find the index of this chord in the color reference list to get consistent color with buttons
      // Match by both degree and rootNote to handle chromatic chords correctly
      const index = colorReferenceList.findIndex(c => c.degree === chord.degree && c.rootNote === chord.rootNote);
      const color = NEARBY_CHORD_COLORS[index % NEARBY_CHORD_COLORS.length];
      const chordPositions = anchorVoicingToNotePositions(chord.nearestVoicing);

      chordPositions.forEach(pos => {
        // Create a unique key for this position
        const key = `${pos.stringIndex}-${pos.fretNumber}-${pos.note}`;

        if (positionMap.has(key)) {
          // This position already exists - add this chord's color to the array
          const existing = positionMap.get(key)!;
          if (!existing.colors.includes(color)) {
            existing.colors.push(color);
          }
        } else {
          // New position - create entry with this chord's color
          positionMap.set(key, {
            position: pos,
            colors: [color],
          });
        }
      });
    });

    // Convert map to array, setting sharedChordColors for each position
    const positions: NotePosition[] = [];
    positionMap.forEach(({ position, colors }) => {
      positions.push({
        ...position,
        sharedChordColors: colors,
        // Keep customColor for backward compatibility (use first color)
        customColor: colors[0],
      });
    });

    return positions;
  }, [enabledNearbyChords, showAllNearbyChords, chordNeighborhoodState.isPanelVisible, displayedNearbyChords, selectedNearbyChords]);

  // Handler for overlapping chords fretboard data changes
  const handleOverlappingChordsFretboardDataChange = useCallback((data: any) => {
    setOverlappingChordsData(data);
  }, []);

  // Handler for closing the neighborhood panel
  const handleCloseNeighborhoodPanel = useCallback(() => {
    setChordNeighborhoodState(prev => ({
      ...prev,
      isPanelVisible: false,
      anchorVoicing: null,
      nearbyChords: [],
      anchorVoicings: [],
      activeAnchorIndex: 0,
      nearbyChordsByAnchor: [],
      selectedOverlay: null,
    }));
  }, []);

  // Handler for changing active anchor tab
  const handleActiveAnchorChange = useCallback((index: number) => {
    setChordNeighborhoodState(prev => ({
      ...prev,
      activeAnchorIndex: index,
      anchorVoicing: prev.anchorVoicings[index] || prev.anchorVoicing,
      nearbyChords: prev.nearbyChordsByAnchor[index] || prev.nearbyChords,
      selectedOverlay: null, // Clear overlay when switching tabs
    }));
  }, []);

  // Calculate position counts for triad UI
  const positionCountsByInversion = useMemo(() => {
    if (!triadData?.triadData?.positions) return { root: 0, first: 0, second: 0 };
    const counts: Record<TriadInversion, number> = { root: 0, first: 0, second: 0 };
    (['root', 'first', 'second'] as const).forEach((inversion) => {
      counts[inversion] = triadData.triadData.positions.filter(
        (p: any) => p.inversion === inversion
      ).length;
    });
    return counts;
  }, [triadData]);

  const positionCountsByShape = useMemo(() => {
    if (!triadData?.triadData?.positions) return { C: 0, A: 0, G: 0, E: 0, D: 0 };
    const counts: Record<CAGEDShape, number> = { C: 0, A: 0, G: 0, E: 0, D: 0 };
    (['C', 'A', 'G', 'E', 'D'] as const).forEach((shape) => {
      counts[shape] = triadData.triadData.positions.filter(
        (p: any) => p.cagedShape === shape
      ).length;
    });
    return counts;
  }, [triadData]);

  // Audio detection state
  const [detectedKey, setDetectedKey] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<number>(0);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isDetecting, setIsDetecting] = useState<boolean>(false);
  const [autoRecommendation, setAutoRecommendation] = useLocalStorage('guitar-app-auto-recommendation', false);
  const [autoSwitchFretboard, setAutoSwitchFretboard] = useLocalStorage('guitar-app-auto-switch-fretboard', false);
  const [compatibleScales, setCompatibleScales] = useState<ScaleCompatibilityRating[]>([]);
  const [selectedScale, setSelectedScale] = useState<ScaleCompatibilityRating | null>(null);

  // Store start/stop detection functions
  const [startDetectionFn, setStartDetectionFn] = useState<(() => Promise<void>) | null>(null);
  const [stopDetectionFn, setStopDetectionFn] = useState<(() => Promise<void>) | null>(null);

  // Manual key/scale selection state
  const [manualKey, setManualKey] = useState<string | null>(null);
  const [manualScaleName, setManualScaleName] = useState<string | null>(null);
  const [isManualMode, setIsManualMode] = useState<boolean>(false);

  // Manual selection list state
  const [manualSelections, setManualSelections] = useLocalStorage<ManualSelection[]>('guitar-app-manual-selections', []);
  const [currentSelectionIndex, setCurrentSelectionIndex] = useState<number>(-1);

  // Focus mode state
  const [isFocusMode, setIsFocusMode] = useLocalStorage('guitar-app-focus-mode', false);
  const [focusModePosition, setFocusModePosition] = useLocalStorage('guitar-app-focus-mode-position', { x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Normal mode horizontal fretboard position (resets to 0 on each page load)
  const [fretboardHorizontalOffset, setFretboardHorizontalOffset] = useState(0);

  // MIDI navigation handler refs
  const midiScaleLeftHandler = useRef<(() => void) | null>(null);
  const midiScaleRightHandler = useRef<(() => void) | null>(null);

  // Audio sidebar state — auto-open if navigated from another page via AppSettingsButton
  const [isAudioSidebarExpanded, setIsAudioSidebarExpanded] = useState(() => {
    if (typeof window !== 'undefined' && sessionStorage.getItem('openAudioSidebar') === '1') {
      sessionStorage.removeItem('openAudioSidebar');
      return true;
    }
    return false;
  });

  // AI Assistant state
  const [isAIAssistantExpanded, setIsAIAssistantExpanded] = useState(false);

  // Onboarding guide state
  const [showGuideAtStart, setShowGuideAtStart] = useSupabaseStorage('guitar-app-show-guide-at-start', true);
  const [showGuide, setShowGuide] = useState(false);
  // Track whether the guide opened the sidebar so we can restore state on close
  const guideOpenedSidebarRef = useRef(false);

  // Chord-Scale Recommendation System state
  const [showChordRecommendations, setShowChordRecommendations] = useState(false);
  const [showProgressionRecommendations, setShowProgressionRecommendations] = useState(false);

  // Circle of 5ths state - hidden by default
  const [showCircleOf5ths, setShowCircleOf5ths] = useSupabaseStorage('guitar-app-show-circle-of-5ths', false);
  const [circleOf5thsPosition, setCircleOf5thsPosition] = useSupabaseStorage<'left' | 'right' | 'below'>('guitar-app-circle-of-5ths-position', 'left');

  // Circle of 5ths Fretboard Visualization state
  const [showCircleFretboardGlow, setShowCircleFretboardGlow] = useSupabaseStorage('guitar-app-circle-fretboard-glow', false);
  const [circleFretboardGlowColor, setCircleFretboardGlowColor] = useSupabaseStorage('guitar-app-circle-fretboard-glow-color', '#667eea');
  const [circleFretboardGlowOpacity, setCircleFretboardGlowOpacity] = useSupabaseStorage('guitar-app-circle-fretboard-glow-opacity', 60);
  const [circleFretboardGlowWidth, setCircleFretboardGlowWidth] = useSupabaseStorage('guitar-app-circle-fretboard-glow-width', 20);

  // Colorful Strings state
  const [showColorfulStrings, setShowColorfulStrings] = useLocalStorage('guitar-app-show-colorful-strings', false);
  const [stringBrightness, setStringBrightness] = useLocalStorage('guitar-app-string-brightness', 100);

  // Fretboard Theme state
  const [fretboardTheme, setFretboardTheme] = useLocalStorage<FretboardTheme>('guitar-app-fretboard-theme', 'classic');

  // Note Detector state
  const [noteDetectorEnabled, setNoteDetectorEnabled] = useSupabaseStorage('guitar-app-note-detector-enabled', false);
  const [detectedNote, setDetectedNote] = useState<string | null>(null);
  const [detectedFrequency, setDetectedFrequency] = useState<number | null>(null);
  const [liveNotesGlowEnabled, setLiveNotesGlowEnabled] = useSupabaseStorage('guitar-app-live-notes-glow-enabled', false);
  const [liveNotesGlowDuration, setLiveNotesGlowDuration] = useSupabaseStorage('guitar-app-live-notes-glow-duration', 1000);
  const [circleOf5thsGlowDuration, setCircleOf5thsGlowDuration] = useSupabaseStorage('guitar-app-circle-glow-duration', 1000);

  // Harmonization state
  const [selectedHarmonization, setSelectedHarmonization] = useSupabaseStorage<'original' | '3rds' | '5ths' | '6ths' | '7ths'>('guitar-app-harmonization', 'original');

  // Harmonization panel tab: 'harmonization' | 'recommended' | 'custom'
  type HarmonizationTabKey = 'harmonization' | 'recommended' | 'custom';
  const [harmonizationTab, setHarmonizationTab] = useSupabaseStorage<HarmonizationTabKey>('guitar-app-harmonization-tab', 'harmonization');
  // Keep carousel state for the 'recommended' tab
  const [selectedChordTonePattern, setSelectedChordTonePattern] = useState<import('@/components/ChordToneProgressionCarousel').ProgressionPattern | null>(null);
  const [patternGlowBrightness, setPatternGlowBrightness] = useState(100);
  const [patternBgNotesOpacity, setPatternBgNotesOpacity] = useLocalStorage('guitar-app-pattern-bg-notes-opacity', 70);
  // Bg notes opacity when chord tones are highlighted (no pattern/progression active)
  const [chordToneBgNotesOpacity, setChordToneBgNotesOpacity] = useLocalStorage('guitar-app-chord-tone-bg-notes-opacity', 70);
  // Custom Progressions — lifted state drives fretboard highlights in real-time
  const [customProgressionSequence, setCustomProgressionSequence] = useState<IntervalStep[]>([]);
  const [customProgressionGlowBrightness, setCustomProgressionGlowBrightness] = useState(80);

  // Progression pill drag state — null = default position (fret 12 center)
  const [progressionPillLeftPx, setProgressionPillLeftPx] = useState<number | null>(null);
  const [isDraggingProgressionPill, setIsDraggingProgressionPill] = useState(false);
  const progressionPillContainerRef = useRef<HTMLDivElement>(null);
  const progressionPillDragRef = useRef<{ startX: number; startPx: number } | null>(null);
  // Ref to the scale fretboard wrapper — used to calculate fret 12 pixel offset
  const scaleFretboardRef = useRef<HTMLDivElement>(null);

  // Circle of 5ths horizontal offset state (for below position)
  const [circleOf5thsHorizontalOffset, setCircleOf5thsHorizontalOffset] = useSupabaseStorage('guitar-app-circle-of-5ths-offset', 0);
  const [isDraggingCircleOf5ths, setIsDraggingCircleOf5ths] = useState(false);
  const circleOf5thsDragStartX = useRef(0);
  const circleOf5thsStartOffset = useRef(0);

  // Convert triad type to CAGED quality
  const cagedQuality = useMemo((): ChordQuality => {
    const qualityMap: Record<string, ChordQuality> = {
      'major': 'major',
      'minor': 'minor',
      'diminished': 'diminished',
      'augmented': 'augmented',
    };
    return qualityMap[selectedTriadType] || 'major';
  }, [selectedTriadType]);

  // Calculate CAGED regions using the hook at top level
  const cagedData = useCAGED({
    rootNote: (manualKey || rootNote) as NoteName,
    quality: cagedQuality,
    maxFret: 24,
    enabledShapes: selectedTriadCAGEDShapes as CAGEDShapeName[],
  });

  // Filter regions based on triad mode and CAGED guide visibility
  const cagedRegions = useMemo(() => {
    if (!showTriadMode || !showCAGEDGuide) {
      return [];
    }
    return cagedData.filteredRegions;
  }, [showTriadMode, showCAGEDGuide, cagedData.filteredRegions]);

  // Calculate CAGED regions for pentatonic fretboard
  const pentatonicCAGEDData = useCAGED({
    rootNote: (manualKey || rootNote) as NoteName,
    quality: cagedQuality,
    maxFret: 24,
    enabledShapes: selectedTriadCAGEDShapes as CAGEDShapeName[],
  });

  const pentatonicCAGEDRegions = useMemo(() => {
    if (!showTriadMode || !showPentatonicMode || !showCAGEDGuide) {
      return [];
    }
    return pentatonicCAGEDData.filteredRegions;
  }, [showTriadMode, showPentatonicMode, showCAGEDGuide, pentatonicCAGEDData.filteredRegions]);

  // Initialize manual mode from persisted rootNote and scaleName on mount
  const [hasInitialized, setHasInitialized] = useState(false);
  useEffect(() => {
    // Only initialize once when rootNote and scaleName are loaded from localStorage
    if (!hasInitialized && rootNote && scaleName) {
      setManualKey(rootNote);
      setManualScaleName(scaleName);
      setIsManualMode(true);
      setDetectedKey(`${rootNote} ${scaleName}`);
      setHasInitialized(true);

      // Load compatible scales for the persisted selection
      getCompatibleScalesFromDatabase(rootNote, scaleName, 12, 4)
        .then(scales => {
          setCompatibleScales(scales);
        })
        .catch(error => {
          console.error('Error loading compatible scales from database:', error);
          // Fallback to algorithmic method if database fails
          const manualKeyString = `${rootNote} Major`;
          const scales = getCompatibleScales(manualKeyString, 12, 4);
          setCompatibleScales(scales);
        });
    }
  }, [rootNote, scaleName, hasInitialized]); // React to rootNote and scaleName changes, but only initialize once

  // Reset scale index to primary (0) when triad type changes
  useEffect(() => {
    setSelectedScaleIndex(0);
  }, [selectedTriadType]);

  // Update chord tones to tonic chord whenever key or scale changes
  useEffect(() => {
    // Get tonic chord tones (root, third, fifth, seventh) for the current key/scale
    const tonicChordTones = getTonicChordTones(rootNote, scaleName);

    // Determine the quality for guide tones
    // For minor scales, use minor quality; for major scales, use major quality
    const scaleNameLower = scaleName.toLowerCase();
    const isMinorScale = scaleNameLower.includes('minor') ||
                         scaleNameLower.includes('aeolian') ||
                         scaleNameLower.includes('dorian') ||
                         scaleNameLower.includes('phrygian') ||
                         scaleNameLower.includes('locrian');

    const quality = isMinorScale ? 'min7' : 'maj7';
    const tonicGuideTones = getGuideTones(rootNote, quality);

    // Update the selected chord notes to show tonic chord
    setSelectedChordNotes(tonicChordTones);
    setSelectedGuideTones(tonicGuideTones);
    // setSelectedChordNotes and setSelectedGuideTones are now stable from useLocalStorage
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rootNote, scaleName]);

  // Clear custom progression sequence when key or scale changes (stale degrees no longer valid)
  useEffect(() => {
    setCustomProgressionSequence([]);
  }, [rootNote, scaleName]);

  // Show guide on first load if enabled.
  // Read localStorage cache synchronously so the 500 ms delay never races against the
  // async Supabase load that would otherwise always see the default value of `true`.
  useEffect(() => {
    try {
      const cached = localStorage.getItem('cache-guitar-app-show-guide-at-start');
      if (cached !== null && JSON.parse(cached) === false) return; // user clicked "never show again"
    } catch {}
    const timer = setTimeout(() => {
      setShowGuide(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []); // Only run on mount

  // Handle guide close — restore sidebar state if guide opened it
  const handleGuideClose = useCallback(() => {
    if (guideOpenedSidebarRef.current) {
      setIsAudioSidebarExpanded(false);
      guideOpenedSidebarRef.current = false;
    }
    setShowGuide(false);
  }, []);

  // Handle never show again — same restore logic
  const handleNeverShowAgain = useCallback(() => {
    if (guideOpenedSidebarRef.current) {
      setIsAudioSidebarExpanded(false);
      guideOpenedSidebarRef.current = false;
    }
    // Write directly to localStorage cache so the guard in the startup useEffect
    // fires synchronously on the very next page load (before Supabase resolves).
    try { localStorage.setItem('cache-guitar-app-show-guide-at-start', 'false'); } catch {}
    // Persist to Supabase via the hook setter (which uses the current userId).
    setShowGuideAtStart(false);
    // Belt-and-suspenders: also write directly to Supabase in case userId
    // hasn't resolved yet inside the hook's debounced closure.
    import('@/lib/supabase/client-ssr').then(({ createClient }) => {
      const supabase = createClient();
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (user) {
          supabase.from('user_settings').upsert(
            { user_id: user.id, show_guide_at_start: false },
            { onConflict: 'user_id' }
          );
        }
      });
    });
    setShowGuide(false);
  }, [setShowGuideAtStart]);

  // Handle show guide manually
  const handleShowGuide = useCallback(() => {
    setShowGuide(true);
  }, []);

  // Handle scale load from AI Assistant
  const handleLoadScaleFromAI = useCallback((scaleData: FretboardScaleData) => {
    // Update the fretboard display only — do NOT persist to cache/DB so the user's
    // manually-saved key & scale are preserved across page reloads.
    setRootNoteDisplayOnly(scaleData.rootNote);
    setScaleNameDisplayOnly(scaleData.scaleName);

    // Update chord tones and guide tones
    setSelectedChordNotes(scaleData.chordTones);
    setSelectedGuideTones(scaleData.guideTones);

    // Switch to manual mode
    setIsManualMode(true);
    setManualKey(scaleData.rootNote);
    setManualScaleName(scaleData.scaleName);
    setDetectedKey(`${scaleData.rootNote} ${scaleData.scaleName}`);

    // Load compatible scales for the new selection
    getCompatibleScalesFromDatabase(scaleData.rootNote, scaleData.scaleName, 12, 4)
      .then(scales => {
        setCompatibleScales(scales);
      })
      .catch(error => {
        console.error('Error loading compatible scales from database:', error);
        const manualKeyString = `${scaleData.rootNote} Major`;
        const scales = getCompatibleScales(manualKeyString, 12, 4);
        setCompatibleScales(scales);
      });
  }, [setRootNoteDisplayOnly, setScaleNameDisplayOnly, setSelectedChordNotes, setSelectedGuideTones]);

  /**
   * Get Circle of Fifths neighbor notes for the current key
   * Returns the notes immediately to the left and right in the Circle of Fifths
   */
  const getCircleOf5thsNeighbors = useCallback((key: string): string[] => {
    const CIRCLE_KEYS = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'C#', 'G#', 'D#', 'A#', 'F'];
    const index = CIRCLE_KEYS.indexOf(key);

    if (index === -1) return [];

    const leftIndex = (index - 1 + 12) % 12;
    const rightIndex = (index + 1) % 12;

    return [CIRCLE_KEYS[leftIndex], CIRCLE_KEYS[rightIndex]];
  }, []);

  // Calculate Circle of Fifths neighbor notes for current key
  const circleNeighborNotes = useMemo(() => {
    return getCircleOf5thsNeighbors(rootNote);
  }, [rootNote, getCircleOf5thsNeighbors]);

  // Handle guide step changes — open AudioSidebar for MIDI step, close for all others
  const handleGuideStepChange = useCallback((stepId: string) => {
    if (stepId === 'midi-status') {
      // Open the sidebar only if it wasn't already open before the guide
      if (!isAudioSidebarExpanded) {
        guideOpenedSidebarRef.current = true;
        setIsAudioSidebarExpanded(true);
      }
    } else {
      // Close sidebar if guide opened it (any non-MIDI step)
      if (guideOpenedSidebarRef.current) {
        setIsAudioSidebarExpanded(false);
        guideOpenedSidebarRef.current = false;
      }
    }

    // When showing compatible scales step, ensure a key/scale is selected
    if (stepId === 'compatible-scales') {
      if (!detectedKey || !selectedScale) {
        setDetectedKey('C');
        setSelectedScale(null);
        setIsManualMode(true);
      }
    }
  }, [isAudioSidebarExpanded, detectedKey, selectedScale]);

  /**
   * Handle compatible scales change - prevent clearing if scales are valid
   */
  const handleCompatibleScalesChange = useCallback((scales: ScaleCompatibilityRating[]) => {
    console.log('Compatible scales change:', scales.length);
    // Only update if we have scales, or if we're explicitly clearing (auto-recommendation off)
    if (scales.length > 0 || !autoRecommendation) {
      setCompatibleScales(scales);
    }
    // If scales is empty but auto-recommendation is on, keep the existing scales
  }, [autoRecommendation]);

  /**
   * Handle scale change from audio detection
   */
  const handleScaleChangeFromAudio = useCallback((
    rootNote: string,
    scaleName: string,
    chordTones: string[],
    guideTones: string[]
  ) => {
    setRootNote(rootNote);
    setScaleName(scaleName);
  }, [setRootNote, setScaleName]);

  /**
   * Handle detected key change
   */
  const handleDetectedKeyChange = useCallback((
    key: string | null,
    conf: number,
    listening: boolean
  ) => {
    setDetectedKey(key);
    setConfidence(conf);
    setIsListening(listening);

    // Exit manual mode when detection starts/detects a key
    if (key && listening) {
      setIsManualMode(false);
      setManualKey(null);
      setManualScaleName(null);
    }
  }, []);

  /**
   * Handle scale selection from compatible scales
   */
  const handleScaleSelectFromCompatible = useCallback((scale: ScaleCompatibilityRating) => {
    // Convert database scale name to EXTENDED_SCALE_INTERVALS key
    // Database returns "Minor Pentatonic", we need "Pentatonic Minor" for the fretboard
    const intervalsKey = dbScaleNameToIntervalsKey(scale.scaleName);

    console.log(`[Scale Select] Database scale: "${scale.scaleName}" → Intervals key: "${intervalsKey}"`);

    setSelectedScale(scale);
    setRootNote(scale.rootNote);
    setScaleName(intervalsKey); // Use the converted scale name for fretboard
    // Update chord tones and guide tones from the selected scale
    setSelectedChordNotes(scale.chordTones);
    setSelectedGuideTones(scale.guideTones);
    // Setters from useLocalStorage are now stable with useCallback
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Handle detection state change
   */
  const handleDetectionStateChange = useCallback((detecting: boolean) => {
    setIsDetecting(detecting);
  }, []);

  /**
   * Handle start detection ready
   */
  const handleStartDetectionReady = useCallback((startFn: () => Promise<void>) => {
    setStartDetectionFn(() => startFn);
  }, []);

  /**
   * Handle stop detection ready
   */
  const handleStopDetectionReady = useCallback((stopFn: () => Promise<void>) => {
    setStopDetectionFn(() => stopFn);
  }, []);

  /**
   * Handle manual key/scale selection
   */
  const handleManualKeyScaleChange = useCallback(async (key: string | null, scale: string | null) => {
    setManualKey(key);
    setManualScaleName(scale);

    // If both key and scale are selected, enter manual mode
    if (key && scale) {
      setIsManualMode(true);

      // Stop detection if running
      if (isDetecting && stopDetectionFn) {
        await stopDetectionFn();
      }

      // Generate compatible scales from the music theory database
      try {
        const scales = await getCompatibleScalesFromDatabase(key, scale, 12, 4);
        setCompatibleScales(scales);
      } catch (error) {
        console.error('Error loading compatible scales from database:', error);
        // Fallback to algorithmic method if database fails
        const manualKeyString = `${key} Major`;
        const scales = getCompatibleScales(manualKeyString, 12, 4);
        setCompatibleScales(scales);
      }

      // Set the detected key to show the manually selected key and scale
      setDetectedKey(`${key} ${scale}`);

      // Update the fretboard to show the manually selected scale
      setRootNote(key);
      setScaleName(scale);
    } else {
      setIsManualMode(false);
      // Clear compatible scales if not in manual mode
      if (!key || !scale) {
        setCompatibleScales([]);
        setDetectedKey(null);
      }
    }
    // Setters from useLocalStorage are now stable with useCallback
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDetecting, stopDetectionFn]);

  /**
   * Handle adding current manual selection to list
   */
  const handleAddToList = useCallback(() => {
    if (!manualKey || !manualScaleName) return;

    const newSelection: ManualSelection = {
      id: `${Date.now()}-${Math.random()}`,
      key: manualKey,
      scaleName: manualScaleName,
    };

    setManualSelections([...manualSelections, newSelection]);
    setCurrentSelectionIndex(manualSelections.length); // Set to the newly added item
  }, [manualKey, manualScaleName, manualSelections]);

  /**
   * Handle removing a selection from the list
   */
  const handleRemoveFromList = useCallback((index: number) => {
    const newSelections = manualSelections.filter((_, i) => i !== index);
    setManualSelections(newSelections);

    // Adjust current index if needed
    if (currentSelectionIndex >= newSelections.length) {
      setCurrentSelectionIndex(newSelections.length - 1);
    } else if (currentSelectionIndex === index && newSelections.length > 0) {
      // If we removed the current selection, select the previous one or the first one
      const newIndex = index > 0 ? index - 1 : 0;
      setCurrentSelectionIndex(newIndex);

      // Update the manual selection to the new current item
      if (newSelections[newIndex]) {
        handleManualKeyScaleChange(newSelections[newIndex].key, newSelections[newIndex].scaleName);
      }
    } else if (newSelections.length === 0) {
      setCurrentSelectionIndex(-1);
      handleManualKeyScaleChange(null, null);
    }
  }, [manualSelections, currentSelectionIndex, handleManualKeyScaleChange]);

  /**
   * Handle moving a selection up in the list
   */
  const handleMoveSelectionUp = useCallback((index: number) => {
    if (index === 0) return;

    const newSelections = [...manualSelections];
    [newSelections[index - 1], newSelections[index]] = [newSelections[index], newSelections[index - 1]];
    setManualSelections(newSelections);

    // Update current index if it was affected
    if (currentSelectionIndex === index) {
      setCurrentSelectionIndex(index - 1);
    } else if (currentSelectionIndex === index - 1) {
      setCurrentSelectionIndex(index);
    }
  }, [manualSelections, currentSelectionIndex]);

  /**
   * Handle moving a selection down in the list
   */
  const handleMoveSelectionDown = useCallback((index: number) => {
    if (index === manualSelections.length - 1) return;

    const newSelections = [...manualSelections];
    [newSelections[index], newSelections[index + 1]] = [newSelections[index + 1], newSelections[index]];
    setManualSelections(newSelections);

    // Update current index if it was affected
    if (currentSelectionIndex === index) {
      setCurrentSelectionIndex(index + 1);
    } else if (currentSelectionIndex === index + 1) {
      setCurrentSelectionIndex(index);
    }
  }, [manualSelections, currentSelectionIndex]);

  /**
   * Handle selecting a specific item from the list
   */
  const handleSelectFromList = useCallback((index: number) => {
    if (index < 0 || index >= manualSelections.length) return;

    setCurrentSelectionIndex(index);
    const selection = manualSelections[index];
    handleManualKeyScaleChange(selection.key, selection.scaleName);
  }, [manualSelections, handleManualKeyScaleChange]);

  /**
   * Handle navigating to previous selection
   */
  const handleNavigatePrevious = useCallback(() => {
    console.log('[Navigation] handleNavigatePrevious called, selections:', manualSelections.length, 'currentIndex:', currentSelectionIndex);

    if (manualSelections.length === 0) {
      console.log('[Navigation] No selections, returning');
      return;
    }

    const newIndex = currentSelectionIndex <= 0
      ? manualSelections.length - 1
      : currentSelectionIndex - 1;

    console.log('[Navigation] Navigating to index:', newIndex);
    handleSelectFromList(newIndex);
  }, [manualSelections, currentSelectionIndex, handleSelectFromList]);

  /**
   * Handle navigating to next selection
   */
  const handleNavigateNext = useCallback(() => {
    console.log('[Navigation] handleNavigateNext called, selections:', manualSelections.length, 'currentIndex:', currentSelectionIndex);

    if (manualSelections.length === 0) {
      console.log('[Navigation] No selections, returning');
      return;
    }

    const newIndex = currentSelectionIndex >= manualSelections.length - 1
      ? 0
      : currentSelectionIndex + 1;

    console.log('[Navigation] Navigating to index:', newIndex);
    handleSelectFromList(newIndex);
  }, [manualSelections, currentSelectionIndex, handleSelectFromList]);

  /**
   * Handle clearing all selections
   */
  const handleClearAllSelections = useCallback(() => {
    setManualSelections([]);
    setCurrentSelectionIndex(-1);
    handleManualKeyScaleChange(null, null);
  }, [handleManualKeyScaleChange]);

  /**
   * Circle of 5ths horizontal drag handlers
   */
  const handleCircleOf5thsDragStart = (e: React.MouseEvent) => {
    setIsDraggingCircleOf5ths(true);
    circleOf5thsDragStartX.current = e.clientX;
    circleOf5thsStartOffset.current = circleOf5thsHorizontalOffset;
  };

  const handleCircleOf5thsMouseMove = useCallback((e: MouseEvent) => {
    if (!isDraggingCircleOf5ths) return;
    const deltaX = e.clientX - circleOf5thsDragStartX.current;
    setCircleOf5thsHorizontalOffset(circleOf5thsStartOffset.current + deltaX);
  }, [isDraggingCircleOf5ths, setCircleOf5thsHorizontalOffset]);

  const handleCircleOf5thsMouseUp = useCallback(() => {
    setIsDraggingCircleOf5ths(false);
  }, []);

  useEffect(() => {
    if (isDraggingCircleOf5ths) {
      window.addEventListener('mousemove', handleCircleOf5thsMouseMove);
      window.addEventListener('mouseup', handleCircleOf5thsMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleCircleOf5thsMouseMove);
        window.removeEventListener('mouseup', handleCircleOf5thsMouseUp);
      };
    }
  }, [isDraggingCircleOf5ths, handleCircleOf5thsMouseMove, handleCircleOf5thsMouseUp]);

  /**
   * Keyboard navigation for manual selection list (Up/Down arrows)
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle arrow keys when in manual mode and list has items
      if (!isManualMode || manualSelections.length === 0) return;

      // Check if user is typing in an input/textarea/select
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
        return;
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        handleNavigatePrevious();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        handleNavigateNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isManualMode, manualSelections.length, handleNavigatePrevious, handleNavigateNext]);

  /**
   * Keyboard navigation for Nearby Diatonic Chords (Left/Right arrows)
   */
  useEffect(() => {
    const handleNearbyChordKeyDown = (e: KeyboardEvent) => {
      // Only handle when chord neighborhood is visible and has chords
      if (!chordNeighborhoodState.isPanelVisible || chordNeighborhoodState.nearbyChords.length === 0) return;

      // Check if user is typing in an input/textarea/select
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
        return;
      }

      const currentIndex = chordNeighborhoodState.nearbyChords.findIndex(
        c => c.degree === chordNeighborhoodState.selectedOverlay?.degree
      );

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        // Navigate to previous chord (or last if at beginning)
        const prevIndex = currentIndex <= 0 ? chordNeighborhoodState.nearbyChords.length - 1 : currentIndex - 1;
        handleNearbyChordClick(chordNeighborhoodState.nearbyChords[prevIndex]);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        // Navigate to next chord (or first if at end)
        const nextIndex = currentIndex >= chordNeighborhoodState.nearbyChords.length - 1 ? 0 : currentIndex + 1;
        handleNearbyChordClick(chordNeighborhoodState.nearbyChords[nextIndex]);
      }
    };

    window.addEventListener('keydown', handleNearbyChordKeyDown);
    return () => window.removeEventListener('keydown', handleNearbyChordKeyDown);
  }, [chordNeighborhoodState.isPanelVisible, chordNeighborhoodState.nearbyChords, chordNeighborhoodState.selectedOverlay, handleNearbyChordClick]);

  // Handlers for MIDI nearby chord navigation
  const handleMIDINearbyChordPrev = useCallback(() => {
    if (!chordNeighborhoodState.isPanelVisible || chordNeighborhoodState.nearbyChords.length === 0) return;

    const currentIndex = chordNeighborhoodState.nearbyChords.findIndex(
      c => c.degree === chordNeighborhoodState.selectedOverlay?.degree
    );
    const prevIndex = currentIndex <= 0 ? chordNeighborhoodState.nearbyChords.length - 1 : currentIndex - 1;
    handleNearbyChordClick(chordNeighborhoodState.nearbyChords[prevIndex]);
  }, [chordNeighborhoodState.isPanelVisible, chordNeighborhoodState.nearbyChords, chordNeighborhoodState.selectedOverlay, handleNearbyChordClick]);

  const handleMIDINearbyChordNext = useCallback(() => {
    if (!chordNeighborhoodState.isPanelVisible || chordNeighborhoodState.nearbyChords.length === 0) return;

    const currentIndex = chordNeighborhoodState.nearbyChords.findIndex(
      c => c.degree === chordNeighborhoodState.selectedOverlay?.degree
    );
    const nextIndex = currentIndex >= chordNeighborhoodState.nearbyChords.length - 1 ? 0 : currentIndex + 1;
    handleNearbyChordClick(chordNeighborhoodState.nearbyChords[nextIndex]);
  }, [chordNeighborhoodState.isPanelVisible, chordNeighborhoodState.nearbyChords, chordNeighborhoodState.selectedOverlay, handleNearbyChordClick]);

  // MIDI Button Handlers - Must be after navigation handlers are defined
  // When chord neighborhood is visible, use nearby chord navigation for scale-left/right
  // Otherwise, use the default scale navigation
  useMIDIButtonHandlers({
    onPrev: handleNavigatePrevious,
    onNext: handleNavigateNext,
    onScaleLeft: chordNeighborhoodState.isPanelVisible && chordNeighborhoodState.nearbyChords.length > 0
      ? handleMIDINearbyChordPrev
      : () => midiScaleLeftHandler.current?.(),
    onScaleRight: chordNeighborhoodState.isPanelVisible && chordNeighborhoodState.nearbyChords.length > 0
      ? handleMIDINearbyChordNext
      : () => midiScaleRightHandler.current?.(),
  });

  const baseTheme = themes[currentTheme];
  const selectedFretboardTheme = fretboardThemes[fretboardTheme];

  // Merge base theme with selected fretboard theme
  const theme = {
    ...baseTheme,
    fretboardBg: selectedFretboardTheme.fretboardBg,
    fretboardFret: selectedFretboardTheme.fretboardFret,
    fretboardString: selectedFretboardTheme.fretboardString,
    fretMarker: selectedFretboardTheme.fretMarker,
  };

  const tuning = TUNINGS[stringCount][tuningName as keyof typeof TUNINGS[typeof stringCount]];

  // Calculate scale note positions for triad (pentatonic for major/minor, other scales for dim/aug)
  const triadScaleNotePositions = useMemo((): NotePosition[] => {
    if (!showTriadMode || !showPentatonicMode) {
      return [];
    }

    // Get the appropriate scale for this triad type
    const scaleKey = getScaleKeyForTriad(manualKey || rootNote, selectedTriadType, selectedScaleIndex);

    // Get the root note for the selected mode (each mode has a different root note)
    const modeRootNote = getModeRootNote(manualKey || rootNote, selectedTriadType, selectedScaleIndex);

    // Use the existing calculateScalePositions function with the mode's root note
    const allScalePositions = calculateScalePositions(
      modeRootNote,
      scaleKey,
      tuning,
      24
    );

    // Filter scale notes based on selected CAGED shapes when chord neighborhood panel is NOT visible
    // This allows users to control which scale notes are shown by selecting/deselecting CAGED shapes
    if (!chordNeighborhoodState.isPanelVisible && showCAGEDGuide && pentatonicCAGEDData.filteredRegions.length > 0) {
      // Filter scale positions to only show notes within the selected CAGED shape regions
      const baseFiltered = allScalePositions.filter(pos => {
        return pentatonicCAGEDData.filteredRegions.some(region =>
          pos.fretNumber >= region.startFret && pos.fretNumber <= region.endFret
        );
      });

      // Add octave duplicates if enabled
      let octaveDuplicates: NotePosition[] = [];
      if (showOctaveNotes) {
        const seenPositions = new Set<string>();
        baseFiltered.forEach(pos => {
          seenPositions.add(`${pos.stringIndex}-${pos.fretNumber}`);
        });

        baseFiltered.forEach(basePos => {
          // Try +12 frets (higher octave)
          const higherOctaveFret = basePos.fretNumber + 12;
          if (higherOctaveFret <= 24) {
            const posKey = `${basePos.stringIndex}-${higherOctaveFret}`;
            if (!seenPositions.has(posKey)) {
              const existingPos = allScalePositions.find(
                p => p.stringIndex === basePos.stringIndex && p.fretNumber === higherOctaveFret
              );
              if (existingPos) {
                octaveDuplicates.push(existingPos);
                seenPositions.add(posKey);
              }
            }
          }

          // Try -12 frets (lower octave)
          const lowerOctaveFret = basePos.fretNumber - 12;
          if (lowerOctaveFret >= 0) {
            const posKey = `${basePos.stringIndex}-${lowerOctaveFret}`;
            if (!seenPositions.has(posKey)) {
              const existingPos = allScalePositions.find(
                p => p.stringIndex === basePos.stringIndex && p.fretNumber === lowerOctaveFret
              );
              if (existingPos) {
                octaveDuplicates.push(existingPos);
                seenPositions.add(posKey);
              }
            }
          }
        });
      }

      return [...baseFiltered, ...octaveDuplicates];
    }

    // Filter scale notes based on nearby chord selection
    // This filtering applies when the chord neighborhood panel is visible and a chord is selected
    if (chordNeighborhoodState.isPanelVisible) {
      // Collect all CAGED regions to filter by (from nearby chords)
      const matchingRegions: any[] = [];

      // Case 1: Single nearby chord is selected (Show All is OFF, no enabled chords from progression)
      if (chordNeighborhoodState.selectedOverlay && !showAllNearbyChords && enabledNearbyChords.length === 0) {
        const nearbyChord = chordNeighborhoodState.selectedOverlay;
        const voicing = nearbyChord.nearestVoicing;

        // Get the computed CAGED regions for this voicing
        if (voicing) {
          console.log('🎸 Nearby chord selected:', nearbyChord.degree, nearbyChord.rootNote);
          console.log('🎸 Voicing frets:', voicing.frets);
          const regions = getCAGEDRegionsForVoicing(voicing);
          console.log('🎸 CAGED regions:', regions.map(r => `${r.shapeName} (${r.startFret}-${r.endFret})`));
          matchingRegions.push(...regions);
        }
      }
      // Case 2: Enabled chords from progression (with toggle switches) - show scale notes in CAGED areas of enabled chords
      else if (enabledNearbyChords.length > 0) {
        // Collect all voicings from enabled chords
        const enabledVoicings = enabledNearbyChords
          .map(chord => chord.nearestVoicing)
          .filter(v => v !== null);

        // Get CAGED regions for all enabled voicings
        for (const voicing of enabledVoicings) {
          const regions = getCAGEDRegionsForVoicing(voicing);
          matchingRegions.push(...regions);
        }
      }
      // Case 3: Show All is enabled - show scale notes in all CAGED areas where nearby chords appear
      else if (showAllNearbyChords && chordNeighborhoodState.nearbyChords.length > 0) {
        // Collect all voicings from displayed nearby chords (diatonic only)
        const allVoicings = displayedNearbyChords
          .map(chord => chord.nearestVoicing)
          .filter(v => v !== null);

        // Get CAGED regions for all voicings
        for (const voicing of allVoicings) {
          const regions = getCAGEDRegionsForVoicing(voicing);
          matchingRegions.push(...regions);
        }
      }

      // If we have matching regions, filter the scale positions and add octave duplicates (if enabled)
      if (matchingRegions.length > 0) {
        console.log('🎸 Total matching regions:', matchingRegions.length);

        // First, get the base filtered positions (filtered by nearby chord regions)
        let baseFiltered = allScalePositions.filter(pos => {
          // Check if this position falls within any of the matching CAGED regions
          return matchingRegions.some(region =>
            pos.fretNumber >= region.startFret && pos.fretNumber <= region.endFret
          );
        });

        // ADDITIONAL FILTER: Apply CAGED shape filtering if CAGED guide is enabled and shapes are deselected
        // This ensures that deselected CAGED shapes hide scale notes even in nearby chord view mode
        if (showCAGEDGuide && pentatonicCAGEDData.filteredRegions.length > 0) {
          baseFiltered = baseFiltered.filter(pos => {
            // Check if this position falls within any of the selected CAGED shape regions
            return pentatonicCAGEDData.filteredRegions.some(region =>
              pos.fretNumber >= region.startFret && pos.fretNumber <= region.endFret
            );
          });
        }

        // Only add octave-shifted versions if showOctaveNotes is enabled
        let octaveDuplicates: NotePosition[] = [];

        if (showOctaveNotes) {
          const seenPositions = new Set<string>(); // Track unique positions to avoid duplicates

          // Add base positions to seen set
          baseFiltered.forEach(pos => {
            seenPositions.add(`${pos.stringIndex}-${pos.fretNumber}`);
          });

          // For each base position, try to add octave shifts (±12 frets)
          baseFiltered.forEach(basePos => {
            // Try adding +12 frets (higher octave)
            const higherOctaveFret = basePos.fretNumber + 12;
            if (higherOctaveFret <= 24) {
              const posKey = `${basePos.stringIndex}-${higherOctaveFret}`;
              if (!seenPositions.has(posKey)) {
                // Check if this octave-shifted position exists in allScalePositions
                const existingPos = allScalePositions.find(
                  p => p.stringIndex === basePos.stringIndex && p.fretNumber === higherOctaveFret
                );
                if (existingPos) {
                  octaveDuplicates.push(existingPos);
                  seenPositions.add(posKey);
                }
              }
            }

            // Try adding -12 frets (lower octave)
            const lowerOctaveFret = basePos.fretNumber - 12;
            if (lowerOctaveFret >= 0) {
              const posKey = `${basePos.stringIndex}-${lowerOctaveFret}`;
              if (!seenPositions.has(posKey)) {
                // Check if this octave-shifted position exists in allScalePositions
                const existingPos = allScalePositions.find(
                  p => p.stringIndex === basePos.stringIndex && p.fretNumber === lowerOctaveFret
                );
                if (existingPos) {
                  octaveDuplicates.push(existingPos);
                  seenPositions.add(posKey);
                }
              }
            }
          });
        }

        const finalPositions = [...baseFiltered, ...octaveDuplicates];
        console.log('🎸 Filtered scale positions:', baseFiltered.length, 'base +', octaveDuplicates.length, 'octave duplicates =', finalPositions.length, 'total out of', allScalePositions.length);
        return finalPositions;
      }
    }

    return allScalePositions;
  }, [showTriadMode, showPentatonicMode, manualKey, rootNote, selectedTriadType, selectedScaleIndex, tuning, chordNeighborhoodState.isPanelVisible, chordNeighborhoodState.selectedOverlay, chordNeighborhoodState.nearbyChords, showAllNearbyChords, enabledNearbyChords, displayedNearbyChords, showOctaveNotes, showCAGEDGuide, pentatonicCAGEDData.filteredRegions]);

  // Calculate individual note positions - shows all instances of the root note on the fretboard
  const individualNotePositions = useMemo((): NotePosition[] => {
    if (!showIndividualNotes || showTriadMode) {
      return [];
    }

    const positions: NotePosition[] = [];
    const targetNote = manualKey || rootNote;
    const targetNoteIndex = NOTES.indexOf(targetNote);

    // Find all positions of the target note across all strings and frets
    tuning.forEach((openNote, stringIndex) => {
      const openNoteIndex = NOTES.indexOf(openNote);

      for (let fret = 0; fret <= 24; fret++) {
        const noteIndex = (openNoteIndex + fret) % 12;

        if (noteIndex === targetNoteIndex) {
          positions.push({
            stringIndex,
            fretNumber: fret,
            note: targetNote,
            isRoot: true, // All instances are the root note
          });
        }
      }
    });

    return positions;
  }, [showIndividualNotes, showTriadMode, manualKey, rootNote, tuning]);

  // Calculate combined note positions (original + harmony notes)
  const notePositions = useMemo(() => {
    // If Individual Notes mode is active, show only those positions
    if (showIndividualNotes && !showTriadMode && individualNotePositions.length > 0) {
      return individualNotePositions;
    }

    const allPositions = calculateCombinedScalePositions(
      rootNote,
      scaleName,
      tuning,
      selectedHarmonization,
      24
    );

    // Filter to only chord tones if onlyChordTones is enabled
    if (onlyChordTones) {
      const chordTones = getTonicChordTones(rootNote, scaleName);
      return allPositions.filter(pos => chordTones.includes(pos.note));
    }

    return allPositions;
  }, [showIndividualNotes, showTriadMode, individualNotePositions, rootNote, scaleName, tuning, selectedHarmonization, onlyChordTones]);

  // ── Triad Arc Band & Focus Mode — base derived state ──────────────────────
  // Diatonic triads for current key+scale — pure function, tiny
  const diatonicTriads = useMemo(
    () => computeDiatonicTriads(rootNote, scaleName),
    [rootNote, scaleName]
  );

  // Triad membership map — only computed when a triad feature is active
  const triadMembershipMap = useMemo(
    () => (showTriadArcBands || triadFocusOn)
      ? computeTriadMembership(diatonicTriads)
      : {},
    [diatonicTriads, showTriadArcBands, triadFocusOn]
  );

  // Focused triad object
  const focusTriad = useMemo((): DiatonicTriad | null => {
    if (!triadFocusOn) return null;
    return diatonicTriads.find(t => t.degree === selectedFocusDegree)
      ?? diatonicTriads[0]
      ?? null;
  }, [triadFocusOn, selectedFocusDegree, diatonicTriads]);
  // ───────────────────────────────────────────────────────────────────────────

  // ─── Progression-aware fretboard base positions (Features 0 + A) ─────────────
  // Priority: Feature A step (with selections) → Feature A all (with selections) → Feature 0 filter → baseline
  const progressionBasePositions = useMemo(() => {
    if (!selectedProgression) return notePositions;
    // Only use step/all view when the user has made explicit chord selections via the interval selector
    const hasSelections = Object.keys(progressionChordSelections).length > 0;
    if (progressionViewMode === 'step' && hasSelections) {
      return buildStepViewPositions(notePositions, progressionChordSelections, progressionCurrentSlot, selectedProgression);
    }
    if (progressionViewMode === 'all' && hasSelections) {
      return buildAllChordsViewPositions(notePositions, progressionChordSelections, selectedProgression);
    }
    // Default: highlight all progression chord notes with vivid per-chord ring colors
    return buildProgressionFilterPositions(notePositions, selectedProgression);
  }, [selectedProgression, progressionViewMode, progressionCurrentSlot, progressionChordSelections, notePositions]);

  // Derive actual note names from a selected chord-tone pattern's degrees (1, 3, 5, 7)
  const patternHighlightNotes = useMemo((): string[] | null => {
    if (!selectedChordTonePattern) return null;
    const allChordTones = getTonicChordTones(rootNote, scaleName); // [root, third, fifth, seventh]
    const DEGREE_INDEX: Record<string, number> = { '1': 0, '3': 1, '5': 2, '7': 3 };
    const notes = new Set<string>();
    selectedChordTonePattern.steps.forEach(step => {
      if (step.type === 'tone') {
        const idx = DEGREE_INDEX[step.degree];
        if (idx !== undefined && allChordTones[idx]) notes.add(allChordTones[idx]);
      }
    });
    return notes.size > 0 ? Array.from(notes) : null;
  }, [selectedChordTonePattern, rootNote, scaleName]);

  // Derive highlight notes from custom progression steps — union of all triad notes in the sequence
  const customHighlightNotes = useMemo((): string[] | null => {
    if (harmonizationTab !== 'custom') return null;
    if (!customProgressionSequence.length) return null;
    const notes = new Set<string>();
    customProgressionSequence.forEach(step => {
      const triad = diatonicTriads.find(t => t.degreeIndex === step.degreeIndex);
      if (triad) triad.notes.forEach(n => notes.add(n));
    });
    return notes.size > 0 ? Array.from(notes) : null;
  }, [harmonizationTab, customProgressionSequence, diatonicTriads]);

  // Compute the effective chord notes passed to fretboards —
  // In All Intervals mode: filtered scale notes ordered from root
  // In Chord Tones mode: the standard selectedChordNotes
  const activeChordNotes = useMemo(() => {
    if (!allIntervalsMode) return selectedChordNotes;
    const scaleNotes = getScaleNotes(rootNote, scaleName);
    return scaleNotes.filter((_, idx) => selectedIntervalDegrees.includes(idx));
  }, [allIntervalsMode, rootNote, scaleName, selectedIntervalDegrees, selectedChordNotes]);

  // Calculate note positions for hovered anchor voicing (for white glow effect)
  const hoveredAnchorPositions = useMemo(() => {
    if (!hoveredAnchorVoicing) return [];

    // Convert anchor voicing to note positions with white glow
    const positions = anchorVoicingToNotePositions(hoveredAnchorVoicing);

    // Add white glow color to each position with high opacity for visibility
    return positions.map(pos => ({
      ...pos,
      customColor: '#ffffff',
      sharedChordColors: ['#ffffff'], // Use sharedChordColors for better glow rendering
      isHoveredAnchor: true, // Special flag for hover state
    }));
  }, [hoveredAnchorVoicing]);

  // Combine regular note positions with nearby chord positions when "Show All" is enabled
  // Uses progressionBasePositions as the base so Feature 0/A apply first
  const combinedNotePositions = useMemo(() => {
    let positions = progressionBasePositions;

    if (showAllNearbyChords && allNearbyChordPositions.length > 0) {
      positions = allNearbyChordPositions;
    }

    // Add hovered anchor positions on top with white glow
    if (hoveredAnchorPositions.length > 0) {
      const positionMap = new Map<string, NotePosition>();
      positions.forEach(pos => { positionMap.set(`${pos.stringIndex}-${pos.fretNumber}`, pos); });
      hoveredAnchorPositions.forEach(pos => { positionMap.set(`${pos.stringIndex}-${pos.fretNumber}`, pos); });
      return Array.from(positionMap.values());
    }

    return positions;
  }, [showAllNearbyChords, allNearbyChordPositions, progressionBasePositions, hoveredAnchorPositions]);

  // ── Triad Arc Band — attach membership to combinedNotePositions ────────────
  // Placed after combinedNotePositions so it can depend on it cleanly.
  const fretboardPositionsWithTriads = useMemo(() => {
    if (!showTriadArcBands && !triadFocusOn) return combinedNotePositions;
    return combinedNotePositions.map(p => ({
      ...p,
      triadMembership: triadMembershipMap[normalizeNoteToSharp(p.note)] ?? [],
    }));
  }, [combinedNotePositions, triadMembershipMap, showTriadArcBands, triadFocusOn]);
  // ───────────────────────────────────────────────────────────────────────────

  // Calculate overlay note positions when a nearby chord is selected
  const overlayNotePositions = useMemo(() => {
    if (!chordNeighborhoodState.selectedOverlay) return null;

    // Get the nearest voicing of the selected chord
    const nearestVoicing = chordNeighborhoodState.selectedOverlay.nearestVoicing;

    // Convert to note positions
    return anchorVoicingToNotePositions(nearestVoicing);
  }, [chordNeighborhoodState.selectedOverlay]);

  // Determine which note positions to show on the triad fretboard
  const displayedTriadNotePositions = useMemo(() => {
    // Priority 1: If an overlay is selected, show only the overlay (single chord mode)
    if (overlayNotePositions && !enabledNearbyChords.length) {
      return overlayNotePositions;
    }
    // Priority 2: If enabled chords exist (toggle switches are on), show those
    if (enabledNearbyChords.length > 0 && allNearbyChordPositions.length > 0) {
      return allNearbyChordPositions;
    }
    // Priority 3: If selected chords exist (via progression), show those
    if (selectedNearbyChords.length > 0 && allNearbyChordPositions.length > 0) {
      return allNearbyChordPositions;
    }
    // Priority 4: If "Show All" is enabled, show all nearby chords with colors
    if (showAllNearbyChords && allNearbyChordPositions.length > 0) {
      return allNearbyChordPositions;
    }
    // Otherwise show the regular triad positions
    return triadData?.notePositions || [];
  }, [enabledNearbyChords.length, selectedNearbyChords, showAllNearbyChords, allNearbyChordPositions, overlayNotePositions, triadData?.notePositions]);

  // Determine which triad notes to highlight
  const displayedTriadNotes = useMemo(() => {
    // Priority 1: If an overlay is selected and no enabled chords, show only the overlay chord's notes
    if (chordNeighborhoodState.selectedOverlay && !enabledNearbyChords.length) {
      const voicing = chordNeighborhoodState.selectedOverlay.nearestVoicing;
      return voicing.notes;
    }
    // Priority 2: If enabled chords exist (toggle switches are on), collect notes from those chords
    if (enabledNearbyChords.length > 0) {
      const allNotes: string[] = [];
      enabledNearbyChords.forEach(chord => {
        chord.nearestVoicing.notes.forEach((note: string) => {
          if (!allNotes.includes(note)) {
            allNotes.push(note);
          }
        });
      });
      return allNotes;
    }
    // Priority 3: If selected chords exist (via progression), collect notes from those chords
    if (selectedNearbyChords.length > 0) {
      const allNotes: string[] = [];
      selectedNearbyChords.forEach(chord => {
        chord.nearestVoicing.notes.forEach((note: string) => {
          if (!allNotes.includes(note)) {
            allNotes.push(note);
          }
        });
      });
      return allNotes;
    }
    // Priority 4: If "Show All" is enabled, collect all notes from all nearby chords
    if (showAllNearbyChords && chordNeighborhoodState.nearbyChords.length > 0) {
      const allNotes: string[] = [];
      chordNeighborhoodState.nearbyChords.forEach(chord => {
        chord.nearestVoicing.notes.forEach((note: string) => {
          if (!allNotes.includes(note)) {
            allNotes.push(note);
          }
        });
      });
      return allNotes;
    }
    // Otherwise show the regular triad notes
    return triadData?.triadNotes || [];
  }, [enabledNearbyChords, selectedNearbyChords, showAllNearbyChords, chordNeighborhoodState.nearbyChords, chordNeighborhoodState.selectedOverlay, triadData?.triadNotes]);

  // Calculate live note positions for real-time detection
  // NEW: Use frequency-based detection for exact position
  const liveNotePositions = useMemo(() => {
    if (!liveNotesGlowEnabled || !detectedNote) return [];

    const scaleNotes = getScaleNotes(rootNote, scaleName);

    // Use frequency-based detection if frequency is available
    if (detectedFrequency) {
      const exactPosition = calculateExactLiveNotePosition(
        detectedNote,
        detectedFrequency,
        tuning,
        tuningName,
        scaleNotes
      );

      // Return single position as array (or empty array if no match)
      return exactPosition ? [exactPosition] : [];
    }

    // Fallback to note-based detection (shows all instances of the note)
    return calculateLiveNotePositions(detectedNote, tuning, scaleNotes, 24);
  }, [detectedNote, detectedFrequency, tuning, tuningName, rootNote, scaleName, liveNotesGlowEnabled]);

  const handleStringCountChange = (count: 6 | 7) => {
    setStringCount(count);
    setTuningName('Standard');
  };

  const handleChordSelect = (notes: string[] | null, guideTones: string[] | null = null) => {
    setSelectedChordNotes(notes);
    setSelectedGuideTones(guideTones);
  };

  // Handle CAGED Guide toggle - automatically enable Pentatonic Mode when CAGED Guide is turned ON
  const handleCAGEDGuideChange = useCallback((enabled: boolean) => {
    setShowCAGEDGuide(enabled);

    // Automatically enable Pentatonic Mode when CAGED Guide is turned ON
    // This ensures the dual fretboard display appears for all users
    if (enabled && showTriadMode) {
      setShowPentatonicMode(true);
    }
  }, [showTriadMode, setShowCAGEDGuide, setShowPentatonicMode]);

  // Handle Overlapping Chords toggle - automatically enable Triads & CAGED when turned ON
  const handleOverlappingChordsChange = useCallback((enabled: boolean) => {
    setOverlappingChordsEnabled(enabled);

    // Automatically enable Triads & CAGED mode when Overlapping Chords is turned ON
    if (enabled && !showTriadMode) {
      setShowTriadMode(true);
      // Also enable Pentatonic Mode for dual fretboard display
      setShowPentatonicMode(true);
    }
  }, [showTriadMode, setOverlappingChordsEnabled, setShowTriadMode, setShowPentatonicMode]);

  // Handle Triads & CAGED toggle - automatically disable Overlapping Chords when turned OFF
  const handleTriadModeChange = useCallback((enabled: boolean) => {
    setShowTriadMode(enabled);

    // Automatically disable Overlapping Chords when Triads & CAGED is turned OFF
    if (!enabled && overlappingChordsEnabled) {
      setOverlappingChordsEnabled(false);
    }

    // When turning OFF Triads & CAGED, clear all chord neighborhood state
    // This ensures nearby chords don't remain visible on the fretboard
    if (!enabled) {
      // Switch fretboard order back to pentatonics/scale view
      setFretboardOrder('pentatonics-top');

      // Reset chord neighborhood state to initial values
      setChordNeighborhoodState({
        anchorVoicing: null,
        nearbyChords: [],
        anchorVoicings: [],
        activeAnchorIndex: 0,
        nearbyChordsByAnchor: [],
        selectedOverlay: null,
        isPanelVisible: false,
        searchRange: { min: 2, max: 6 },
        selectionMode: 'triads',
        isChordDiagramSidebarVisible: false,
        progressionChords: [],
      });

      // Clear all nearby chord related states
      setShowAllNearbyChords(false);
      setSelectedNearbyChords([]);
      setEnabledNearbyChords([]);
      setReorderedNearbyChords([]);
      setAllAnchorPositions([]);
      setCurrentAnchorPositionIndex(0);
      setHoveredAnchorVoicing(null);
    } else {
      // When turning ON Triads & CAGED, switch to triads view
      setFretboardOrder('triads-top');
    }
  }, [overlappingChordsEnabled, setShowTriadMode, setOverlappingChordsEnabled, setFretboardOrder]);

  // ── Triad Arc Band & Focus Mode handlers ───────────────────────────────────

  // When key or scale changes, restore last selected triad degree for that key+scale
  useEffect(() => {
    const memKey = `${rootNote}-${scaleName}`;
    const remembered = triadFocusMemory[memKey];
    if (remembered && diatonicTriads.some(t => t.degree === remembered)) {
      setSelectedFocusDegree(remembered);
    } else {
      setSelectedFocusDegree('I');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rootNote, scaleName]);

  const handleFocusDegreeSelect = useCallback((degree: string) => {
    setSelectedFocusDegree(degree);
    const memKey = `${rootNote}-${scaleName}`;
    setTriadFocusMemory(prev => ({ ...prev, [memKey]: degree }));
  }, [rootNote, scaleName]);

  const handleFocusPrevious = useCallback(() => {
    if (diatonicTriads.length === 0) return;
    const idx = diatonicTriads.findIndex(t => t.degree === selectedFocusDegree);
    const prev = diatonicTriads[(idx - 1 + diatonicTriads.length) % diatonicTriads.length];
    handleFocusDegreeSelect(prev.degree);
  }, [diatonicTriads, selectedFocusDegree, handleFocusDegreeSelect]);

  const handleFocusNext = useCallback(() => {
    if (diatonicTriads.length === 0) return;
    const idx = diatonicTriads.findIndex(t => t.degree === selectedFocusDegree);
    const next = diatonicTriads[(idx + 1) % diatonicTriads.length];
    handleFocusDegreeSelect(next.degree);
  }, [diatonicTriads, selectedFocusDegree, handleFocusDegreeSelect]);

  // Keyboard navigation for Triad Focus Mode (Arrow keys + 1–7)
  useEffect(() => {
    if (!triadFocusOn) return;
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (document.activeElement as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.key === 'ArrowRight') { e.preventDefault(); handleFocusNext(); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); handleFocusPrevious(); }
      else if (e.key >= '1' && e.key <= '7') {
        const idx = parseInt(e.key) - 1;
        if (diatonicTriads[idx]) handleFocusDegreeSelect(diatonicTriads[idx].degree);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [triadFocusOn, handleFocusNext, handleFocusPrevious, handleFocusDegreeSelect, diatonicTriads]);
  // ───────────────────────────────────────────────────────────────────────────

  // Position the progression pill centered over the fretboard's actual rendered width
  // the first time a pattern or custom sequence is shown (not the whole page width).
  useEffect(() => {
    const pillActive = selectedChordTonePattern || customHighlightNotes;
    if (!pillActive) return;
    const rafId = requestAnimationFrame(() => {
      setProgressionPillLeftPx(prev => {
        if (prev !== null) return prev; // User has manually dragged — keep their position
        if (!progressionPillContainerRef.current || !scaleFretboardRef.current) return null;
        // Find the actual fretboard board element (the inline-block that hugs its content width),
        // regardless of exact DOM nesting, so this stays correct if Fretboard's markup changes.
        const fretboardDiv = scaleFretboardRef.current.querySelector<HTMLElement>('.inline-block');
        if (!fretboardDiv) return null;
        const fretboardRect = fretboardDiv.getBoundingClientRect();
        const containerRect = progressionPillContainerRef.current.getBoundingClientRect();
        // Center of the fretboard, expressed as a left offset within the pill's container
        // (the pill itself uses transform: translate(-50%, -50%), so `left` = its center point).
        return (fretboardRect.left + fretboardRect.width / 2) - containerRect.left;
      });
    });
    return () => cancelAnimationFrame(rafId);
  }, [selectedChordTonePattern, customHighlightNotes]);

  // Reset pill position when switching harmonization tabs so the pill re-anchors at fret 12
  useEffect(() => {
    setProgressionPillLeftPx(null);
  }, [harmonizationTab]);

  /**
   * Handle scale selection from chord-scale recommendations
   */
  const handleScaleSelectFromChordRecommendation = useCallback((scaleName: string) => {
    // Convert scale name to the format expected by the fretboard
    const intervalsKey = dbScaleNameToIntervalsKey(scaleName);
    setScaleName(intervalsKey);
  }, [setScaleName]);

  /**
   * Handle chord selection from chord recommendations (Scale → Chord)
   */
  const handleChordSelectFromRecommendations = useCallback((notes: string[] | null) => {
    setSelectedChordNotes(notes);
    setSelectedGuideTones(null); // Clear guide tones when selecting from recommendations
  }, [setSelectedChordNotes, setSelectedGuideTones]);

  /** Feature 0 + A: Handle progression card select/deselect */
  const handleProgressionSelect = useCallback((progression: ChordProgression | null) => {
    setSelectedProgression(progression);
    // Always reset chord selections when switching/clearing progressions
    setProgressionChordSelections({});
    setProgressionViewMode('step');
    setProgressionCurrentSlot(0);
  }, []);

  /** Feature A: Handle chord selection changes from ProgressionIntervalChordSelector */
  const handleProgressionChordSelectionsChange = useCallback(
    (selections: ProgressionChordSelections, viewMode: 'step' | 'all', currentSlot: number) => {
      setProgressionChordSelections(selections);
      setProgressionViewMode(viewMode);
      setProgressionCurrentSlot(currentSlot);
    },
    []
  );

  /**
   * Handle dragging fretboard in Focus Mode
   */
  const handleFocusModeMouseDown = useCallback((e: React.MouseEvent) => {
    if (!isFocusMode) return;
    setIsDragging(true);
    setDragStart({
      x: e.clientX - focusModePosition.x,
      y: e.clientY - focusModePosition.y,
    });
  }, [isFocusMode, focusModePosition]);

  const handleFocusModeMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !isFocusMode) return;
    setFocusModePosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  }, [isDragging, isFocusMode, dragStart]);

  const handleFocusModeMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  /**
   * Handle horizontal dragging of fretboard in normal mode
   */
  const [isDraggingHorizontal, setIsDraggingHorizontal] = useState(false);
  const [horizontalDragStart, setHorizontalDragStart] = useState(0);

  const handleHorizontalDragStart = useCallback((e: React.MouseEvent) => {
    if (isFocusMode) return;
    setIsDraggingHorizontal(true);
    setHorizontalDragStart(e.clientX - fretboardHorizontalOffset);
  }, [isFocusMode, fretboardHorizontalOffset]);

  const handleHorizontalDragMove = useCallback((e: React.MouseEvent) => {
    if (!isDraggingHorizontal || isFocusMode) return;
    const newOffset = e.clientX - horizontalDragStart;
    setFretboardHorizontalOffset(newOffset);
  }, [isDraggingHorizontal, isFocusMode, horizontalDragStart]);

  const handleHorizontalDragEnd = useCallback(() => {
    setIsDraggingHorizontal(false);
  }, []);

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: theme.bgPrimary }}
      onMouseMove={isDraggingHorizontal ? handleHorizontalDragMove : undefined}
      onMouseUp={isDraggingHorizontal ? handleHorizontalDragEnd : undefined}
      onMouseLeave={isDraggingHorizontal ? handleHorizontalDragEnd : undefined}
    >
      {/* Audio Detection Sidebar - Hidden in Focus Mode */}
      {!isFocusMode && (
        <AudioSidebar
          theme={theme}
          currentTheme={currentTheme}
          onThemeChange={setCurrentTheme}
          autoRecommendation={autoRecommendation}
          autoSwitchFretboard={autoSwitchFretboard}
          onScaleChange={handleScaleChangeFromAudio}
          onDetectedKeyChange={handleDetectedKeyChange}
          onCompatibleScalesChange={handleCompatibleScalesChange}
          onSelectedScaleChange={setSelectedScale}
          onDetectionStateChange={handleDetectionStateChange}
          onStartDetectionReady={handleStartDetectionReady}
          onStopDetectionReady={handleStopDetectionReady}
          isExpanded={isAudioSidebarExpanded}
          onToggleExpanded={() => setIsAudioSidebarExpanded(!isAudioSidebarExpanded)}
          hideToggleButton
          showGuideAtStart={showGuideAtStart}
          onShowGuideAtStartChange={setShowGuideAtStart}
          onShowGuide={handleShowGuide}
          circleOf5thsPosition={circleOf5thsPosition}
          onCircleOf5thsPositionChange={setCircleOf5thsPosition}
          fretboardTheme={fretboardTheme}
          onFretboardThemeChange={setFretboardTheme}
          noteDetectorEnabled={noteDetectorEnabled}
          onDetectedNoteChange={(note, frequency) => {
            setDetectedNote(note);
            setDetectedFrequency(frequency);
          }}
          liveNotesGlowEnabled={liveNotesGlowEnabled}
          onLiveNotesGlowChange={setLiveNotesGlowEnabled}
          liveNotesGlowDuration={liveNotesGlowDuration}
          onLiveNotesGlowDurationChange={setLiveNotesGlowDuration}
          circleOf5thsGlowDuration={circleOf5thsGlowDuration}
          onCircleOf5thsGlowDurationChange={setCircleOf5thsGlowDuration}
          stringCount={stringCount}
          onStringCountChange={handleStringCountChange}
          tuningName={tuningName}
          onTuningChange={setTuningName}
          isInverted={isInverted}
          onInvertToggle={() => setIsInverted(!isInverted)}
          fretDotColor={fretDotColor}
          onFretDotColorChange={setFretDotColor}
          showMiddleDots={showMiddleDots}
          onShowMiddleDotsChange={setShowMiddleDots}
          fretCount={fretCount}
          onFretCountChange={setFretCount}
          showColorfulStrings={showColorfulStrings}
          onShowColorfulStringsChange={setShowColorfulStrings}
          stringBrightness={stringBrightness}
          onStringBrightnessChange={setStringBrightness}
          fretWidth={fretWidth}
          onFretWidthChange={setFretWidth}
        />
      )}



      {/* Header - Hidden in Focus Mode */}
      {!isFocusMode && (
        <Header
        currentTheme={currentTheme}
        onThemeChange={setCurrentTheme}
        theme={theme}
        rootNote={rootNote}
        scaleName={scaleName}
        stringCount={stringCount}
        tuningName={tuningName}
        isInverted={isInverted}
        fretDotColor={fretDotColor}
        showMiddleDots={showMiddleDots}
        onStringCountChange={handleStringCountChange}
        onTuningChange={setTuningName}
        onInvertToggle={() => setIsInverted(!isInverted)}
        onFretDotColorChange={setFretDotColor}
        onShowMiddleDotsChange={setShowMiddleDots}
        detectedKey={detectedKey}
        confidence={confidence}
        isListening={isListening}
        isDetecting={isDetecting}
        autoRecommendation={autoRecommendation}
        autoSwitchFretboard={autoSwitchFretboard}
        onAutoRecommendationChange={setAutoRecommendation}
        onAutoSwitchFretboardChange={setAutoSwitchFretboard}
        onStartDetection={startDetectionFn || undefined}
        onStopDetection={stopDetectionFn || undefined}
        manualKey={manualKey}
        manualScaleName={manualScaleName}
        onManualKeyScaleChange={handleManualKeyScaleChange}
        isManualMode={isManualMode}
        manualSelections={manualSelections}
        currentSelectionIndex={currentSelectionIndex}
        onAddToList={handleAddToList}
        onRemoveFromList={handleRemoveFromList}
        onMoveSelectionUp={handleMoveSelectionUp}
        onMoveSelectionDown={handleMoveSelectionDown}
        onSelectFromList={handleSelectFromList}
        onNavigatePrevious={handleNavigatePrevious}
        onNavigateNext={handleNavigateNext}
        onClearAllSelections={handleClearAllSelections}
        chordTones={selectedScale?.chordTones || []}
        guideTones={selectedScale?.guideTones || []}
        selectedChordNotes={selectedChordNotes}
        selectedGuideTones={selectedGuideTones}
        chordHighlightColor={chordHighlightColor}
        guideTonesColor={guideTonesColor}
        showChordTones={showChordTones}
        showGuideTones={showGuideTones}
        showChordGlow={showChordGlow}
        colorGuideEnabled={colorGuideEnabled}
        glowOpacity={glowOpacity}
        showWhiteBorder={showWhiteBorder}
        onChordHighlightColorChange={setChordHighlightColor}
        onGuideTonesColorChange={setGuideTonesColor}
        onShowChordTonesChange={setShowChordTones}
        onShowGuideTonesChange={setShowGuideTones}
        onShowChordGlowChange={setShowChordGlow}
        onColorGuideEnabledChange={setColorGuideEnabled}
        onGlowOpacityChange={setGlowOpacity}
        onShowWhiteBorderChange={setShowWhiteBorder}
        isFocusMode={isFocusMode}
        onFocusModeChange={setIsFocusMode}
        onToggleSettings={() => setIsAudioSidebarExpanded(!isAudioSidebarExpanded)}
        onShowGuide={handleShowGuide}
        showGuideAtStart={showGuideAtStart}
        onShowGuideAtStartChange={setShowGuideAtStart}
        showCircleOf5ths={showCircleOf5ths}
        onShowCircleOf5thsChange={setShowCircleOf5ths}
        circleOf5thsPosition={circleOf5thsPosition}
        onCircleOf5thsPositionChange={setCircleOf5thsPosition}
        detectedNote={detectedNote}
        showCircleFretboardGlow={showCircleFretboardGlow}
        onShowCircleFretboardGlowChange={setShowCircleFretboardGlow}
        circleFretboardGlowColor={circleFretboardGlowColor}
        onCircleFretboardGlowColorChange={setCircleFretboardGlowColor}
        circleFretboardGlowOpacity={circleFretboardGlowOpacity}
        onCircleFretboardGlowOpacityChange={setCircleFretboardGlowOpacity}
        circleFretboardGlowWidth={circleFretboardGlowWidth}
        onCircleFretboardGlowWidthChange={setCircleFretboardGlowWidth}
        circleOf5thsGlowDuration={circleOf5thsGlowDuration}
        showColorfulStrings={showColorfulStrings}
        onShowColorfulStringsChange={setShowColorfulStrings}
        stringBrightness={stringBrightness}
        onStringBrightnessChange={setStringBrightness}
        noteDetectorEnabled={noteDetectorEnabled}
        onNoteDetectorEnabledChange={setNoteDetectorEnabled}
        onlyChordTones={onlyChordTones}
        onOnlyChordTonesChange={setOnlyChordTones}
        selectedChordToneTypes={selectedChordToneTypes}
        onSelectedChordToneTypesChange={setSelectedChordToneTypes}
        allIntervalsMode={allIntervalsMode}
        onAllIntervalsModeChange={setAllIntervalsMode}
        selectedIntervalDegrees={selectedIntervalDegrees}
        onSelectedIntervalDegreesChange={setSelectedIntervalDegrees}
        showTriadMode={showTriadMode}
        onTriadModeChange={handleTriadModeChange}
        onTriadDataChange={handleTriadDataChange}
        onFretboardDataChange={handleFretboardDataChange}
        selectedTriadInversion={selectedTriadInversion}
        onTriadInversionChange={setSelectedTriadInversion}
        showCAGEDGuide={showCAGEDGuide}
        onCAGEDGuideChange={handleCAGEDGuideChange}
        cagedBrightness={cagedBrightness}
        onCAGEDBrightnessChange={setCAGEDBrightness}
        selectedTriadCAGEDShapes={selectedTriadCAGEDShapes}
        onTriadCAGEDShapesChange={setSelectedTriadCAGEDShapes}
        positionCountsByInversion={positionCountsByInversion}
        positionCountsByShape={positionCountsByShape}
        onTriadTypeChange={setSelectedTriadType}
        overlappingChordsEnabled={overlappingChordsEnabled}
        onOverlappingChordsChange={handleOverlappingChordsChange}
        showIndividualNotes={showIndividualNotes}
        onIndividualNotesChange={setShowIndividualNotes}
        showPentatonicMode={showPentatonicMode}
        onPentatonicModeChange={setShowPentatonicMode}
        isPentatonicHeaderCollapsed={isPentatonicHeaderCollapsed}
        onPentatonicHeaderCollapsedChange={setIsPentatonicHeaderCollapsed}
        fretboardOrder={fretboardOrder}
        onFretboardOrderChange={setFretboardOrder}
        selectedTriadType={selectedTriadType}
        progressionsOpen={harmonizationTab === 'recommended'}
        onProgressionsOpenChange={(open) => setHarmonizationTab(open ? 'recommended' : 'harmonization')}
      />
      )}

      {/* Floating Exit Focus Mode Button - Only visible in Focus Mode */}
      {isFocusMode && (
        <button
          onClick={() => setIsFocusMode(false)}
          className="fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg text-sm font-medium transition-all hover:opacity-90"
          style={{
            background: '#ef4444',
            color: '#ffffff',
            border: '1px solid #dc2626',
          }}
          title="Exit Focus Mode"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6 6 18"/>
            <path d="m6 6 12 12"/>
          </svg>
          Exit Focus Mode
        </button>
      )}

      <div
        className="flex-1 overflow-auto"
        onMouseMove={isFocusMode ? handleFocusModeMouseMove : undefined}
        onMouseUp={isFocusMode ? handleFocusModeMouseUp : undefined}
        onMouseLeave={isFocusMode ? handleFocusModeMouseUp : undefined}
      >
        <div className="flex gap-4 p-8">
          <div
            className="flex-1"
            style={isFocusMode ? {
              position: 'fixed',
              left: `${focusModePosition.x}px`,
              top: `${focusModePosition.y}px`,
              cursor: isDragging ? 'grabbing' : 'grab',
              zIndex: 40,
            } : {
              transform: `translateX(${fretboardHorizontalOffset}px)`,
            }}
            onMouseDown={isFocusMode ? handleFocusModeMouseDown : undefined}
          >
            {/* Harmonization + Progressions — unified tabbed card above fretboard */}
            {!isFocusMode && !showTriadMode && (
              <div
                className="rounded-xl mb-4"
                style={{
                  background: theme.bgSecondary,
                  border: `1px solid ${theme.border}`,
                }}
              >
                {/* Tab header */}
                <div
                  className="flex items-center gap-1 px-3 pt-2 pb-0"
                  style={{ borderBottom: `1px solid ${theme.border}` }}
                >
                  {([
                    { key: 'harmonization' as const, label: 'Harmonization', icon: (
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                      </svg>
                    )},
                    { key: 'recommended' as const, label: 'Recommended Progressions', icon: (
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    )},
                    { key: 'custom' as const, label: 'Custom Progressions', icon: (
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    )},
                  ] as { key: 'harmonization' | 'recommended' | 'custom'; label: string; icon: React.ReactNode }[]).map(({ key, label, icon }) => {
                    const isActive = harmonizationTab === key;
                    return (
                      <button
                        key={key}
                        onClick={() => setHarmonizationTab(key)}
                        className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t-lg transition-all relative"
                        style={{
                          background: isActive ? theme.bgPrimary : 'transparent',
                          color: isActive ? theme.accentPrimary : theme.textSecondary,
                          borderTop: isActive ? `2px solid ${theme.accentPrimary}` : '2px solid transparent',
                          borderLeft: isActive ? `1px solid ${theme.border}` : '1px solid transparent',
                          borderRight: isActive ? `1px solid ${theme.border}` : '1px solid transparent',
                          marginBottom: isActive ? '-1px' : 0,
                        }}
                      >
                        {icon}
                        {label}
                      </button>
                    );
                  })}
                </div>

                {/* Tab body */}
                <div className="p-3">
                  {harmonizationTab === 'harmonization' && (
                    <HarmonizationTabs
                      theme={theme}
                      currentKey={rootNote}
                      currentScale={scaleName}
                      selectedHarmonization={selectedHarmonization}
                      onHarmonizationChange={setSelectedHarmonization}
                      isEmbedded
                    />
                  )}
                  {harmonizationTab === 'recommended' && (
                    <ChordToneProgressionCarousel
                      theme={theme}
                      selectedPatternId={selectedChordTonePattern?.id ?? null}
                      onPatternSelect={setSelectedChordTonePattern}
                      glowBrightness={patternGlowBrightness}
                      onGlowBrightnessChange={setPatternGlowBrightness}
                    />
                  )}
                  {harmonizationTab === 'custom' && (
                    <CustomProgressionsTab
                      theme={theme}
                      currentKey={rootNote}
                      currentScale={scaleName}
                      diatonicDegrees={diatonicTriads}
                      sequence={customProgressionSequence}
                      onSequenceChange={setCustomProgressionSequence}
                    />
                  )}
                </div>
              </div>
            )}

            {/* Dual Fretboard Display for Pentatonic Mode */}
            {showTriadMode && showPentatonicMode ? (
              <div className="flex gap-4">
                {/* Fretboards Container */}
                <div className="space-y-6" style={{ flex: '1 1 auto' }}>
                  {/* First Fretboard */}
                  <div data-guide="fretboard">
                    <div className="mb-2 flex flex-col gap-2">
                      {/* Triads Info and Controls */}
                      <div className="flex flex-col gap-2">
                        {/* Top row: Chord text, Triad Positions, and Nearby Chords Navigator */}
                        <div className="flex items-center gap-3 flex-wrap">
                          {/* Triads Key/Type */}
                          <span className="text-sm font-semibold px-3 py-1 rounded" style={{
                            background: theme.bgTertiary,
                            color: theme.textPrimary,
                            border: `1px solid ${theme.border}`,
                          }}>
                            {fretboardOrder === 'triads-top'
                              ? chordNeighborhoodState.selectedOverlay
                                ? `Nearby Chord: ${chordNeighborhoodState.selectedOverlay.degree} - ${chordNeighborhoodState.selectedOverlay.rootNote}${chordNeighborhoodState.selectedOverlay.quality === 'major' ? '' : chordNeighborhoodState.selectedOverlay.quality === 'minor' ? 'm' : chordNeighborhoodState.selectedOverlay.quality === 'diminished' ? 'dim' : 'aug'}`
                                : `Triads - ${manualKey || rootNote} ${selectedTriadType === 'major' ? 'Major' : selectedTriadType === 'minor' ? 'Minor' : selectedTriadType === 'diminished' ? 'Diminished' : 'Augmented'}`
                              : getScaleNameForTriad(manualKey || rootNote, selectedTriadType, selectedScaleIndex)}
                          </span>

                          {/* Triad Positions - Always show for triads fretboard */}
                          {fretboardOrder === 'triads-top' && (
                            <TriadPositionsCard
                              theme={theme}
                              selectedInversion={selectedTriadInversion}
                              onInversionChange={setSelectedTriadInversion}
                              positionCountsByInversion={positionCountsByInversion}
                            />
                          )}

                          {/* Chord Progression Navigator - Show when chord neighborhood panel is visible */}
                          {fretboardOrder === 'triads-top' && chordNeighborhoodState.isPanelVisible && chordNeighborhoodState.nearbyChords.length > 0 && (
                            <div className="ml-6">
                              <ChordProgressionNavigator
                                theme={theme}
                                nearbyChords={displayedNearbyChords}
                                selectedChord={chordNeighborhoodState.selectedOverlay}
                                onChordSelect={handleNearbyChordClick}
                                chordColors={NEARBY_CHORD_COLORS}
                                showAllChords={showAllNearbyChords}
                                onShowAllChordsChange={handleShowAllChordsChange}
                                isPanelExpanded={chordNeighborhoodState.isChordDiagramSidebarVisible && unifiedSidebarTab === 'explore'}
                                onTogglePanel={handleToggleExploreSidebar}
                                selectedChords={chordNeighborhoodState.selectionMode === 'chords' ? chordNeighborhoodState.progressionChords : selectedNearbyChords}
                                onSelectedChordsChange={setSelectedNearbyChords}
                                enabledChords={enabledNearbyChords}
                                onEnabledChordsChange={setEnabledNearbyChords}
                                onExploreProgressions={() => setIsChordProgressionModalOpen(true)}
                                onChordsReorder={handleChordsReorder}
                                showAllDiatonicButton={selectedNearbyChords.length > 0}
                                onShowAllDiatonic={() => {
                                  // Clear the progression and show all diatonic chords
                                  setSelectedNearbyChords([]);
                                  setEnabledNearbyChords([]);
                                  setShowAllNearbyChords(true);
                                  // Clear any selected overlay
                                  setChordNeighborhoodState(prev => ({
                                    ...prev,
                                    selectedOverlay: null,
                                  }));
                                }}
                                onBackToTriads={() => {
                                  // Close the nearby diatonic chords panel entirely
                                  setChordNeighborhoodState(prev => ({
                                    ...prev,
                                    isPanelVisible: false,
                                    selectedOverlay: null,
                                  }));
                                  setSelectedNearbyChords([]);
                                  setEnabledNearbyChords([]);
                                  setShowAllNearbyChords(false);
                                }}
                                onVoicingChange={handleVoicingChange}
                                onChordDelete={handleChordDelete}
                                onAddChord={handleAddChord}
                                showChordDiagrams={chordNeighborhoodState.isChordDiagramSidebarVisible}
                                onShowChordDiagramsChange={handleToggleChordDiagramSidebar}
                                onSaveProgression={handleSaveProgression}
                                onLoadProgression={handleLoadProgression}
                              />
                            </div>
                          )}

                          {/* Notification - Show when Chord Neighborhood is NOT visible */}
                          {fretboardOrder === 'triads-top' && !chordNeighborhoodState.isPanelVisible && (
                            <div
                              className="px-4 py-3 rounded-lg flex items-center gap-3 shadow-lg animate-pulse"
                              style={{
                                background: `linear-gradient(135deg, ${theme.accentPrimary}25, ${theme.accentPrimary}15)`,
                                border: `2px solid ${theme.accentPrimary}`,
                                boxShadow: `0 0 20px ${theme.accentPrimary}40`,
                              }}
                            >
                              <span className="text-2xl">👆</span>
                              <div className="flex flex-col gap-0.5">
                                <span
                                  className="text-sm font-bold"
                                  style={{ color: theme.textPrimary }}
                                >
                                  Click on any chord/triad to discover nearby chords!
                                </span>
                                <span
                                  className="text-xs"
                                  style={{ color: theme.textSecondary }}
                                >
                                  See which diatonic chords are within easy reach
                                </span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Bottom row: Selected Chord Info - Show when Chord Neighborhood is visible */}
                        {fretboardOrder === 'triads-top' && chordNeighborhoodState.isPanelVisible && chordNeighborhoodState.anchorVoicing && (
                          <SelectedChordInfo
                            theme={theme}
                            anchorVoicing={chordNeighborhoodState.anchorVoicing}
                            anchorSymbol={getChordSymbol(chordNeighborhoodState.anchorVoicing.rootNote, chordNeighborhoodState.anchorVoicing.quality)}
                            currentPositionIndex={currentAnchorPositionIndex}
                            totalPositions={allAnchorPositions.length}
                            onNavigatePrevious={handleAnchorPositionPrevious}
                            onNavigateNext={handleAnchorPositionNext}
                            showFretboardArrows={showFretboardArrows}
                            onShowFretboardArrowsChange={setShowFretboardArrows}
                          />
                        )}
                      </div>
                    </div>
                    <Fretboard
                    stringCount={stringCount}
                    tuning={tuning}
                    notePositions={fretboardOrder === 'triads-top' ? combinedNotePositions : triadScaleNotePositions}
                    theme={theme}
                    isInverted={isInverted}
                    fretDotColor={fretDotColor}
                    showMiddleDots={showMiddleDots}
                    selectedChordNotes={activeChordNotes}
                    selectedGuideTones={allIntervalsMode ? null : selectedGuideTones}
                    chordHighlightColor={chordHighlightColor}
                    guideTonesColor={guideTonesColor}
                    showChordTones={showChordTones}
                    showGuideTones={allIntervalsMode ? false : showGuideTones}
                    showChordGlow={showChordGlow}
                    colorGuideEnabled={allIntervalsMode ? true : colorGuideEnabled}
                    glowOpacity={glowOpacity}
                    showWhiteBorder={showWhiteBorder}
                    selectedHarmonization={selectedHarmonization}
                    showColorfulStrings={showColorfulStrings}
                    stringBrightness={stringBrightness}
                    liveNotePositions={liveNotePositions}
                    liveNotesGlowEnabled={liveNotesGlowEnabled}
                    onChordHighlightColorChange={setChordHighlightColor}
                    onGuideTonesColorChange={setGuideTonesColor}
                    onShowChordTonesChange={setShowChordTones}
                    onShowGuideTonesChange={setShowGuideTones}
                    onShowChordGlowChange={setShowChordGlow}
                    circleOf5thsGlowEnabled={showCircleFretboardGlow}
                    circleOf5thsGlowColor={circleFretboardGlowColor}
                    circleOf5thsGlowOpacity={circleFretboardGlowOpacity}
                    circleOf5thsGlowWidth={circleFretboardGlowWidth}
                    circleOf5thsNeighborNotes={circleNeighborNotes}
                    selectedChordToneTypes={selectedChordToneTypes}
                    allIntervalsMode={allIntervalsMode}
                    rootNoteForIntervals={rootNote}
                    showTriadMode={fretboardOrder === 'triads-top'}
                    triadNotes={fretboardOrder === 'triads-top' ? displayedTriadNotes : []}
                    triadPositions={fretboardOrder === 'triads-top' ? displayedTriadNotePositions : []}
                    triadFullPositions={fretboardOrder === 'triads-top' ? (triadData?.triadData?.positions || []) : []}
                    onTriadVoicingClick={fretboardOrder === 'triads-top' ? handleTriadVoicingClick : undefined}
                    highlightedZone={null}
                    cagedRegions={fretboardOrder === 'triads-top' ? cagedRegions : pentatonicCAGEDRegions}
                    showCAGEDOverlay={showCAGEDGuide}
                    cagedBrightness={cagedBrightness}
                    sharedNoteRingOpacity={selectedProgression ? progressionGlowBrightness : sharedNoteRingOpacity}
                    fretCount={fretCount}
                    fretWidth={fretWidth}
                    showNavigationArrows={fretboardOrder === 'triads-top' && showFretboardArrows && chordNeighborhoodState.isPanelVisible}
                    anchorChordPositions={fretboardOrder === 'triads-top' && chordNeighborhoodState.anchorVoicing
                      ? chordNeighborhoodState.anchorVoicing.stringSet.map((string: number, index: number) => ({
                          string,
                          fret: chordNeighborhoodState.anchorVoicing!.frets[index],
                          note: chordNeighborhoodState.anchorVoicing!.notes[index]
                        }))
                      : []}
                    onNavigatePrevious={handleAnchorPositionPrevious}
                    onNavigateNext={handleAnchorPositionNext}
                  />
                  </div>

                {/* Second Fretboard */}
                <div data-guide="fretboard">
                  {/* Scale Selector and Controls */}
                  <div className="mb-3 flex flex-col gap-2">
                    {/* Scale Name and Controls - Left aligned */}
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-sm font-semibold px-3 py-1 rounded" style={{
                        background: theme.bgTertiary,
                        color: theme.textPrimary,
                        border: `1px solid ${theme.border}`,
                      }}>
                        {fretboardOrder === 'pentatonics-top'
                          ? `Triads - ${manualKey || rootNote} ${selectedTriadType === 'major' ? 'Major' : selectedTriadType === 'minor' ? 'Minor' : selectedTriadType === 'diminished' ? 'Diminished' : 'Augmented'}`
                          : getScaleNameForTriad(manualKey || rootNote, selectedTriadType, selectedScaleIndex)}
                      </span>

                      {/* Compatible Scales Selector - Shows all compatible scales with ratings */}
                      {fretboardOrder === 'triads-top' && (() => {
                        const scaleOptions = getScaleRecommendationsForTriad(manualKey || rootNote, selectedTriadType);
                        return scaleOptions.length > 1 ? (
                          <select
                            value={selectedScaleIndex}
                            onChange={(e) => setSelectedScaleIndex(Number(e.target.value))}
                            className="px-2 py-1 rounded text-xs font-medium transition-all"
                            style={{
                              background: theme.bgTertiary,
                              color: theme.textPrimary,
                              border: `1px solid ${theme.border}`,
                            }}
                            title="Select compatible scale - each shows different notes"
                          >
                            {scaleOptions.map((option, index) => (
                              <option key={index} value={index}>
                                {option.displayName} {option.isPrimary ? '★' : ''} ({option.compatibilityRating}/10)
                              </option>
                            ))}
                          </select>
                        ) : null;
                      })()}

                      {/* Display Octave Notes Toggle for Scale Fretboard */}
                      {fretboardOrder === 'triads-top' && (
                        <div className="flex items-center gap-2 px-3 py-1 rounded" style={{
                          background: theme.bgTertiary,
                          border: `1px solid ${theme.border}`,
                        }}>
                          <span className="text-xs font-semibold" style={{ color: theme.textPrimary }}>
                            Display Octave Notes
                          </span>
                          <button
                            onClick={() => setShowOctaveNotes(!showOctaveNotes)}
                            className="relative inline-flex h-6 w-11 items-center rounded-full transition-all shadow-sm"
                            style={{
                              background: showOctaveNotes ? theme.accentPrimary : '#4b5563',
                              border: `2px solid ${showOctaveNotes ? theme.accentPrimary : '#6b7280'}`,
                            }}
                            title={showOctaveNotes ? 'Hide Octave Notes' : 'Show Octave Notes'}
                          >
                            <span
                              className="inline-block h-5 w-5 transform rounded-full transition-transform shadow-md"
                              style={{
                                background: '#ffffff',
                                transform: showOctaveNotes ? 'translateX(20px)' : 'translateX(2px)',
                              }}
                            />
                          </button>
                        </div>
                      )}

                      {/* Show Triads Toggle for Scale Fretboard */}
                      {fretboardOrder === 'triads-top' && (
                        <div className="flex items-center gap-2 px-3 py-1 rounded" style={{
                          background: theme.bgTertiary,
                          border: `1px solid ${theme.border}`,
                        }}>
                          <span className="text-xs font-semibold" style={{ color: theme.textPrimary }}>
                            Show Triads
                          </span>
                          <button
                            onClick={() => setShowTriadsOnScaleFretboard(!showTriadsOnScaleFretboard)}
                            className="relative inline-flex h-6 w-11 items-center rounded-full transition-all shadow-sm"
                            style={{
                              background: showTriadsOnScaleFretboard ? theme.accentPrimary : '#4b5563',
                              border: `2px solid ${showTriadsOnScaleFretboard ? theme.accentPrimary : '#6b7280'}`,
                            }}
                            title={showTriadsOnScaleFretboard ? 'Hide Triads' : 'Show Triads'}
                          >
                            <span
                              className="inline-block h-5 w-5 transform rounded-full transition-transform shadow-md"
                              style={{
                                background: '#ffffff',
                                transform: showTriadsOnScaleFretboard ? 'translateX(20px)' : 'translateX(2px)',
                              }}
                            />
                          </button>
                        </div>
                      )}

                      {/* Scale Description - Moved to the right of CAGED toggle */}
                      {fretboardOrder === 'triads-top' && (() => {
                        const scaleOptions = getScaleRecommendationsForTriad(manualKey || rootNote, selectedTriadType);
                        const currentScale = scaleOptions[selectedScaleIndex] || scaleOptions[0];
                        return currentScale ? (
                          <div className="text-xs px-3 py-1 rounded max-w-md" style={{
                            background: theme.bgTertiary,
                            color: theme.textSecondary,
                            border: `1px solid ${theme.border}`,
                          }}>
                            {currentScale.description}
                          </div>
                        ) : null;
                      })()}
                    </div>
                  </div>
                  <Fretboard
                    stringCount={stringCount}
                    tuning={tuning}
                    notePositions={fretboardOrder === 'pentatonics-top' ? notePositions : triadScaleNotePositions}
                    theme={theme}
                    isInverted={isInverted}
                    fretDotColor={fretDotColor}
                    showMiddleDots={showMiddleDots}
                    selectedChordNotes={activeChordNotes}
                    selectedGuideTones={allIntervalsMode ? null : selectedGuideTones}
                    chordHighlightColor={chordHighlightColor}
                    guideTonesColor={guideTonesColor}
                    showChordTones={showChordTones}
                    showGuideTones={allIntervalsMode ? false : showGuideTones}
                    showChordGlow={showChordGlow}
                    colorGuideEnabled={allIntervalsMode ? true : colorGuideEnabled}
                    glowOpacity={glowOpacity}
                    showWhiteBorder={showWhiteBorder}
                    selectedHarmonization={selectedHarmonization}
                    showColorfulStrings={showColorfulStrings}
                    stringBrightness={stringBrightness}
                    liveNotePositions={liveNotePositions}
                    liveNotesGlowEnabled={liveNotesGlowEnabled}
                    onChordHighlightColorChange={setChordHighlightColor}
                    onGuideTonesColorChange={setGuideTonesColor}
                    onShowChordTonesChange={setShowChordTones}
                    onShowGuideTonesChange={setShowGuideTones}
                    onShowChordGlowChange={setShowChordGlow}
                    circleOf5thsGlowEnabled={showCircleFretboardGlow}
                    circleOf5thsGlowColor={circleFretboardGlowColor}
                    circleOf5thsGlowOpacity={circleFretboardGlowOpacity}
                    circleOf5thsGlowWidth={circleFretboardGlowWidth}
                    circleOf5thsNeighborNotes={circleNeighborNotes}
                    selectedChordToneTypes={selectedChordToneTypes}
                    allIntervalsMode={allIntervalsMode}
                    rootNoteForIntervals={rootNote}
                    showTriadMode={fretboardOrder === 'pentatonics-top' || (fretboardOrder === 'triads-top' && showTriadsOnScaleFretboard)}
                    triadNotes={fretboardOrder === 'pentatonics-top' ? displayedTriadNotes : (showTriadsOnScaleFretboard ? (triadData?.triadNotes || []) : [])}
                    triadPositions={fretboardOrder === 'pentatonics-top' ? displayedTriadNotePositions : (showTriadsOnScaleFretboard ? (triadData?.notePositions || []) : [])}
                    triadFullPositions={fretboardOrder === 'pentatonics-top' ? (triadData?.triadData?.positions || []) : (showTriadsOnScaleFretboard ? (triadData?.triadData?.positions || []) : [])}
                    onTriadVoicingClick={fretboardOrder === 'pentatonics-top' ? handleTriadVoicingClick : undefined}
                    showTriadRingsOnScale={fretboardOrder === 'triads-top' && showTriadsOnScaleFretboard}
                    highlightedZone={null}
                    cagedRegions={fretboardOrder === 'pentatonics-top' ? cagedRegions : pentatonicCAGEDRegions}
                    showCAGEDOverlay={showCAGEDGuide}
                    cagedBrightness={cagedBrightness}
                    fretCount={fretCount}
                    fretWidth={fretWidth}
                  />
                </div>
                </div>

                {/* Chord Neighborhood Panel - Positioned to the right of both fretboards */}
                {fretboardOrder === 'triads-top' && chordNeighborhoodState.isPanelVisible && isChordNeighborhoodExpanded && (
                  <div className="w-[400px] flex-shrink-0">
                    <ChordNeighborhoodPanel
                      theme={theme}
                      anchorVoicing={chordNeighborhoodState.anchorVoicing}
                      nearbyChords={chordNeighborhoodState.nearbyChords}
                      anchorVoicings={chordNeighborhoodState.anchorVoicings}
                      activeAnchorIndex={chordNeighborhoodState.activeAnchorIndex}
                      nearbyChordsByAnchor={chordNeighborhoodState.nearbyChordsByAnchor}
                      onActiveAnchorChange={handleActiveAnchorChange}
                      onAnchorHover={setHoveredAnchorVoicing}
                      selectedOverlay={chordNeighborhoodState.selectedOverlay}
                      onNearbyChordClick={handleNearbyChordClick}
                      onClose={handleCloseNeighborhoodPanel}
                      showAllChords={showAllNearbyChords}
                      onShowAllChordsChange={handleShowAllChordsChange}
                      chordColors={NEARBY_CHORD_COLORS}
                      selectionMode={chordNeighborhoodState.selectionMode}
                      onSelectionModeChange={handleSelectionModeChange}
                      onOpenChordSelector={handleOpenChordSelector}
                    />
                  </div>
                )}

                {/* Chord Progression Explorer Sidebar - Now handled by UnifiedRightSidebar */}
              </div>
            ) : (
              /* Single Fretboard Display */
              <div className="flex gap-4">
                <div style={{ flex: '1 1 auto' }} data-guide="fretboard">
                  {/* Fretboard Title with Triad Positions, Switch to Triads Button and Legend */}
                  {showTriadMode && (
                    <div className="mb-2 flex flex-col gap-2">
                      {/* Triads Info and Controls - Split into left and right sections */}
                      <div className="flex items-center justify-between gap-3">
                        {/* Left Section - Labels and Info */}
                        <div className="flex flex-col gap-2">
                          {/* Top row: Chord text, Triad Positions, and Notification */}
                          <div className="flex items-center gap-3 flex-wrap">
                            {/* Triads Key/Type */}
                            <span className="text-sm font-semibold px-3 py-1 rounded" style={{
                              background: theme.bgTertiary,
                              color: theme.textPrimary,
                              border: `1px solid ${theme.border}`,
                            }}>
                              {chordNeighborhoodState.selectedOverlay
                                ? `Nearby Chord: ${chordNeighborhoodState.selectedOverlay.degree} - ${chordNeighborhoodState.selectedOverlay.rootNote}${chordNeighborhoodState.selectedOverlay.quality === 'major' ? '' : chordNeighborhoodState.selectedOverlay.quality === 'minor' ? 'm' : chordNeighborhoodState.selectedOverlay.quality === 'diminished' ? 'dim' : 'aug'}`
                                : `Triads - ${manualKey || rootNote} ${selectedTriadType === 'major' ? 'Major' : selectedTriadType === 'minor' ? 'Minor' : selectedTriadType === 'diminished' ? 'Diminished' : 'Augmented'}`}
                            </span>

                            {/* Triad Positions - Always show */}
                            <TriadPositionsCard
                              theme={theme}
                              selectedInversion={selectedTriadInversion}
                              onInversionChange={setSelectedTriadInversion}
                              positionCountsByInversion={positionCountsByInversion}
                            />

                            {/* Notification - Show when Chord Neighborhood is NOT visible */}
                            {!chordNeighborhoodState.isPanelVisible && (
                              <div
                                className="px-4 py-3 rounded-lg flex items-center gap-3 shadow-lg animate-pulse"
                                style={{
                                  background: `linear-gradient(135deg, ${theme.accentPrimary}25, ${theme.accentPrimary}15)`,
                                  border: `2px solid ${theme.accentPrimary}`,
                                  boxShadow: `0 0 20px ${theme.accentPrimary}40`,
                                }}
                              >
                                <span className="text-2xl">👆</span>
                                <div className="flex flex-col gap-0.5">
                                  <span
                                    className="text-sm font-bold"
                                    style={{ color: theme.textPrimary }}
                                  >
                                    Click on any chord/triad to discover nearby chords!
                                  </span>
                                  <span
                                    className="text-xs"
                                    style={{ color: theme.textSecondary }}
                                  >
                                    See which diatonic chords are within easy reach
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Bottom row: Selected Chord Info - Show when Chord Neighborhood is visible */}
                          {chordNeighborhoodState.isPanelVisible && chordNeighborhoodState.anchorVoicing && (
                            <SelectedChordInfo
                              theme={theme}
                              anchorVoicing={chordNeighborhoodState.anchorVoicing}
                              anchorSymbol={getChordSymbol(chordNeighborhoodState.anchorVoicing.rootNote, chordNeighborhoodState.anchorVoicing.quality)}
                              currentPositionIndex={currentAnchorPositionIndex}
                              totalPositions={allAnchorPositions.length}
                              onNavigatePrevious={handleAnchorPositionPrevious}
                              onNavigateNext={handleAnchorPositionNext}
                              showFretboardArrows={showFretboardArrows}
                              onShowFretboardArrowsChange={setShowFretboardArrows}
                            />
                          )}
                        </div>

                        {/* Right Section - Nearby Chords Navigator */}
                        <div className="flex items-center gap-3 flex-shrink-0">
                          {/* Chord Progression Navigator - Show when chord neighborhood panel is visible */}
                          {chordNeighborhoodState.isPanelVisible && chordNeighborhoodState.nearbyChords.length > 0 && (
                            <ChordProgressionNavigator
                              theme={theme}
                              nearbyChords={displayedNearbyChords}
                              selectedChord={chordNeighborhoodState.selectedOverlay}
                              onChordSelect={handleNearbyChordClick}
                              chordColors={NEARBY_CHORD_COLORS}
                              showAllChords={showAllNearbyChords}
                              onShowAllChordsChange={handleShowAllChordsChange}
                              isPanelExpanded={chordNeighborhoodState.isChordDiagramSidebarVisible && unifiedSidebarTab === 'explore'}
                              onTogglePanel={handleToggleExploreSidebar}
                              selectedChords={chordNeighborhoodState.selectionMode === 'chords' ? chordNeighborhoodState.progressionChords : selectedNearbyChords}
                              onSelectedChordsChange={setSelectedNearbyChords}
                              enabledChords={enabledNearbyChords}
                              onEnabledChordsChange={setEnabledNearbyChords}
                              onExploreProgressions={() => setIsChordProgressionModalOpen(true)}
                              onChordsReorder={handleChordsReorder}
                              showAllDiatonicButton={selectedNearbyChords.length > 0}
                              onShowAllDiatonic={() => {
                                // Clear the progression and show all diatonic chords
                                setSelectedNearbyChords([]);
                                setEnabledNearbyChords([]);
                                setShowAllNearbyChords(true);
                                // Clear any selected overlay
                                setChordNeighborhoodState(prev => ({
                                  ...prev,
                                  selectedOverlay: null,
                                }));
                              }}
                              onBackToTriads={() => {
                                // Close the nearby diatonic chords panel entirely
                                setChordNeighborhoodState(prev => ({
                                  ...prev,
                                  isPanelVisible: false,
                                  selectedOverlay: null,
                                }));
                                setSelectedNearbyChords([]);
                                setEnabledNearbyChords([]);
                                setShowAllNearbyChords(false);
                              }}
                              onVoicingChange={handleVoicingChange}
                              onChordDelete={handleChordDelete}
                              onAddChord={handleAddChord}
                              showChordDiagrams={chordNeighborhoodState.isChordDiagramSidebarVisible}
                              onShowChordDiagramsChange={handleToggleChordDiagramSidebar}
                              onSaveProgression={handleSaveProgression}
                              onLoadProgression={handleLoadProgression}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Feature 0 — Active Progression Filter Badge + Glow Slider */}
                  {selectedProgression && (
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold"
                        style={{ background: `${theme.accentPrimary}20`, border: `1px solid ${theme.accentPrimary}`, color: theme.accentPrimary }}>
                        <span>🎵 {selectedProgression.name}</span>
                        <button
                          onClick={() => handleProgressionSelect(null)}
                          className="ml-1 hover:opacity-70 transition-opacity"
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: 0, lineHeight: 1 }}
                          title="Clear progression filter"
                        >
                          ✕
                        </button>
                      </div>
                      {/* Glow brightness slider */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium" style={{ color: theme.textSecondary }}>✨ Glow</span>
                        <input
                          type="range"
                          min={20}
                          max={200}
                          step={5}
                          value={progressionGlowBrightness}
                          onChange={(e) => setProgressionGlowBrightness(parseInt(e.target.value))}
                          style={{ width: '100px', accentColor: theme.accentPrimary, cursor: 'pointer' }}
                          title={`Progression highlight glow: ${progressionGlowBrightness}%`}
                        />
                        <span className="text-xs font-mono w-9 text-right" style={{ color: theme.textSecondary }}>{progressionGlowBrightness}%</span>
                      </div>
                    </div>
                  )}

                  {/* Feature B — Fret Zone Chord HUD */}
                  {rootNote && scaleName && (
                    <FretZoneChordHUD
                      currentKey={rootNote}
                      currentScale={scaleName}
                      stringCount={stringCount}
                      fretCount={fretCount}
                      theme={theme}
                      onChordHighlight={setZoneHighlightedChordNotes}
                    />
                  )}

                  {/* ── Triads in Scale Controls ── */}
                  {rootNote && scaleName && (
                    <div className="flex flex-col gap-2 mb-3" style={{ maxWidth: 820 }}>
                      {/* Row 1: Triads in Scale toggle + optional chord-tone glow slider */}
                      <div className="flex items-center gap-4 flex-wrap">
                        {/* Triads in Scale toggle → activates Triad Focus mode directly */}
                        <label className="flex items-center gap-2 cursor-pointer select-none" style={{ fontSize: 13, color: theme.textPrimary }}>
                          <div
                            onClick={() => {
                              const next = !showTriadArcBands;
                              setShowTriadArcBands(next);
                              setTriadFocusOn(next);
                            }}
                            style={{
                              width: 38, height: 20, borderRadius: 10,
                              background: showTriadArcBands ? theme.accentPrimary : theme.bgTertiary,
                              border: `1px solid ${theme.border}`,
                              position: 'relative', cursor: 'pointer', transition: 'background 150ms',
                            }}
                          >
                            <div style={{
                              position: 'absolute', top: 2,
                              left: showTriadArcBands ? 18 : 2,
                              width: 14, height: 14, borderRadius: 7,
                              background: '#fff', transition: 'left 150ms',
                            }} />
                          </div>
                          <span style={{ fontWeight: 500 }}>Triads in Scale</span>
                        </label>

                        {/* Glow slider — shown when a chord tone pattern is active */}
                        {selectedChordTonePattern && (
                          <>
                            <div style={{ width: 1, height: 20, background: theme.border, flexShrink: 0 }} />
                            <div className="flex items-center gap-2" style={{ flexShrink: 0 }}>
                              <span style={{ fontSize: 13, fontWeight: 600, color: theme.textSecondary, whiteSpace: 'nowrap', letterSpacing: '0.01em' }}>✦ Glow</span>
                              <div style={{
                                position: 'relative',
                                display: 'flex',
                                alignItems: 'center',
                                width: 100,
                                height: 24,
                                borderRadius: 12,
                                background: `rgba(0,0,0,0.35)`,
                                border: `1px solid ${selectedChordTonePattern.genreColor}40`,
                                boxShadow: `inset 0 1px 3px rgba(0,0,0,0.4), 0 0 8px ${selectedChordTonePattern.genreColor}20`,
                                padding: '0 8px',
                              }}>
                                <div style={{
                                  position: 'absolute',
                                  left: 8, right: 8,
                                  top: '50%', transform: 'translateY(-50%)',
                                  height: 4, borderRadius: 2,
                                  background: `linear-gradient(to right, ${selectedChordTonePattern.genreColor} 0%, ${selectedChordTonePattern.genreColor} ${patternGlowBrightness}%, rgba(255,255,255,0.12) ${patternGlowBrightness}%, rgba(255,255,255,0.12) 100%)`,
                                  boxShadow: `0 0 6px ${selectedChordTonePattern.genreColor}60`,
                                  pointerEvents: 'none',
                                }} />
                                <input
                                  type="range"
                                  min={0} max={100} step={5}
                                  value={patternGlowBrightness}
                                  onChange={(e) => setPatternGlowBrightness(parseInt(e.target.value))}
                                  title={`Pattern highlight glow: ${patternGlowBrightness}%`}
                                  style={{ position: 'relative', width: '100%', height: '100%', opacity: 0, cursor: 'pointer', zIndex: 1, margin: 0 }}
                                />
                              </div>
                              <span style={{ fontSize: 11, fontFamily: 'monospace', color: selectedChordTonePattern.genreColor, fontWeight: 700, minWidth: 34, textShadow: `0 0 8px ${selectedChordTonePattern.genreColor}80` }}>{patternGlowBrightness}%</span>
                              <SliderResetButton onReset={() => setPatternGlowBrightness(100)} theme={theme} label="Reset glow to 100%" />
                            </div>

                            {/* Bg Notes opacity — only when Triads in Scale is off */}
                            {!showTriadArcBands && (
                              <>
                                <div style={{ width: 1, height: 20, background: theme.border, flexShrink: 0 }} />
                                <span style={{ fontSize: 12, color: theme.textSecondary, fontWeight: 500, whiteSpace: 'nowrap' }}>Bg Notes:</span>
                                <div className="flex items-center gap-2" style={{ flexShrink: 0 }}>
                                  <span style={{ fontSize: 11, color: theme.textSecondary, whiteSpace: 'nowrap' }}>Opacity</span>
                                  <div style={{
                                    position: 'relative',
                                    display: 'flex',
                                    alignItems: 'center',
                                    width: 90,
                                    height: 24,
                                    borderRadius: 12,
                                    background: 'rgba(0,0,0,0.35)',
                                    border: `1px solid ${theme.border}`,
                                    boxShadow: `inset 0 1px 3px rgba(0,0,0,0.4)`,
                                    padding: '0 8px',
                                  }}>
                                    <div style={{
                                      position: 'absolute',
                                      left: 8, right: 8,
                                      top: '50%', transform: 'translateY(-50%)',
                                      height: 4, borderRadius: 2,
                                      background: `linear-gradient(to right, ${theme.accentPrimary} 0%, ${theme.accentPrimary} ${patternBgNotesOpacity}%, rgba(255,255,255,0.12) ${patternBgNotesOpacity}%, rgba(255,255,255,0.12) 100%)`,
                                      pointerEvents: 'none',
                                    }} />
                                    <input
                                      type="range"
                                      min={0} max={100} step={5}
                                      value={patternBgNotesOpacity}
                                      onChange={(e) => setPatternBgNotesOpacity(parseInt(e.target.value))}
                                      title={`Background note opacity: ${patternBgNotesOpacity}%`}
                                      style={{ position: 'relative', width: '100%', height: '100%', opacity: 0, cursor: 'pointer', zIndex: 1, margin: 0 }}
                                    />
                                  </div>
                                  <span style={{ fontSize: 11, fontFamily: 'monospace', color: theme.textSecondary, minWidth: 30 }}>{patternBgNotesOpacity}%</span>
                                  <SliderResetButton onReset={() => setPatternBgNotesOpacity(70)} theme={theme} label="Reset bg notes opacity to 70%" />
                                </div>
                              </>
                            )}
                          </>
                        )}

                        {/* Glow slider — shown when a custom progression has steps */}
                        {customHighlightNotes && (
                          <>
                            <div style={{ width: 1, height: 20, background: theme.border, flexShrink: 0 }} />
                            <div className="flex items-center gap-2" style={{ flexShrink: 0 }}>
                              <span style={{ fontSize: 13, fontWeight: 600, color: theme.textSecondary, whiteSpace: 'nowrap', letterSpacing: '0.01em' }}>✦ Glow</span>
                              <div style={{
                                position: 'relative',
                                display: 'flex',
                                alignItems: 'center',
                                width: 100,
                                height: 24,
                                borderRadius: 12,
                                background: `rgba(0,0,0,0.35)`,
                                border: `1px solid ${theme.accentPrimary}40`,
                                boxShadow: `inset 0 1px 3px rgba(0,0,0,0.4), 0 0 8px ${theme.accentPrimary}20`,
                                padding: '0 8px',
                              }}>
                                <div style={{
                                  position: 'absolute',
                                  left: 8, right: 8,
                                  top: '50%', transform: 'translateY(-50%)',
                                  height: 4, borderRadius: 2,
                                  background: `linear-gradient(to right, ${theme.accentPrimary} 0%, ${theme.accentPrimary} ${customProgressionGlowBrightness}%, rgba(255,255,255,0.12) ${customProgressionGlowBrightness}%, rgba(255,255,255,0.12) 100%)`,
                                  boxShadow: `0 0 6px ${theme.accentPrimary}60`,
                                  pointerEvents: 'none',
                                }} />
                                <input
                                  type="range"
                                  min={0} max={100} step={5}
                                  value={customProgressionGlowBrightness}
                                  onChange={(e) => setCustomProgressionGlowBrightness(parseInt(e.target.value))}
                                  title={`Custom progression glow: ${customProgressionGlowBrightness}%`}
                                  style={{ position: 'relative', width: '100%', height: '100%', opacity: 0, cursor: 'pointer', zIndex: 1, margin: 0 }}
                                />
                              </div>
                              <span style={{ fontSize: 11, fontFamily: 'monospace', color: theme.accentPrimary, fontWeight: 700, minWidth: 34, textShadow: `0 0 8px ${theme.accentPrimary}80` }}>{customProgressionGlowBrightness}%</span>
                              <SliderResetButton onReset={() => setCustomProgressionGlowBrightness(80)} theme={theme} label="Reset glow to 80%" />
                            </div>
                          </>
                        )}

                        {/* Bg Notes opacity for chord tones — shown when chord tones are active, no pattern/custom/zone override, triads off */}
                        {showChordTones && !selectedChordTonePattern && !customHighlightNotes && !zoneHighlightedChordNotes && !showTriadArcBands && (
                          <>
                            <div style={{ width: 1, height: 20, background: theme.border, flexShrink: 0 }} />
                            <span style={{ fontSize: 12, color: theme.textSecondary, fontWeight: 500, whiteSpace: 'nowrap' }}>Bg Notes:</span>
                            <div className="flex items-center gap-2" style={{ flexShrink: 0 }}>
                              <span style={{ fontSize: 11, color: theme.textSecondary, whiteSpace: 'nowrap' }}>Opacity</span>
                              <div style={{
                                position: 'relative',
                                display: 'flex',
                                alignItems: 'center',
                                width: 90,
                                height: 24,
                                borderRadius: 12,
                                background: 'rgba(0,0,0,0.35)',
                                border: `1px solid ${theme.border}`,
                                boxShadow: `inset 0 1px 3px rgba(0,0,0,0.4)`,
                                padding: '0 8px',
                              }}>
                                <div style={{
                                  position: 'absolute',
                                  left: 8, right: 8,
                                  top: '50%', transform: 'translateY(-50%)',
                                  height: 4, borderRadius: 2,
                                  background: `linear-gradient(to right, ${theme.accentPrimary} 0%, ${theme.accentPrimary} ${chordToneBgNotesOpacity}%, rgba(255,255,255,0.12) ${chordToneBgNotesOpacity}%, rgba(255,255,255,0.12) 100%)`,
                                  pointerEvents: 'none',
                                }} />
                                <input
                                  type="range"
                                  min={0} max={100} step={5}
                                  value={chordToneBgNotesOpacity}
                                  onChange={(e) => setChordToneBgNotesOpacity(parseInt(e.target.value))}
                                  title={`Background note opacity: ${chordToneBgNotesOpacity}%`}
                                  style={{ position: 'relative', width: '100%', height: '100%', opacity: 0, cursor: 'pointer', zIndex: 1, margin: 0 }}
                                />
                              </div>
                              <span style={{ fontSize: 11, fontFamily: 'monospace', color: theme.textSecondary, minWidth: 30 }}>{chordToneBgNotesOpacity}%</span>
                              <SliderResetButton onReset={() => setChordToneBgNotesOpacity(70)} theme={theme} label="Reset bg notes opacity to 70%" />
                            </div>
                          </>
                        )}

                        {/* Background notes opacity + B&W/Colors — same row as toggle, shown when active */}
                        {showTriadArcBands && (
                          <>
                            <div style={{ width: 1, height: 20, background: theme.border, flexShrink: 0 }} />
                            <span style={{ fontSize: 12, color: theme.textSecondary, fontWeight: 500, whiteSpace: 'nowrap' }}>Bg Notes:</span>
                            <div className="flex items-center gap-2" style={{ flexShrink: 0 }}>
                              <span style={{ fontSize: 11, color: theme.textSecondary, whiteSpace: 'nowrap' }}>Opacity</span>
                              <div style={{
                                position: 'relative',
                                display: 'flex',
                                alignItems: 'center',
                                width: 90,
                                height: 24,
                                borderRadius: 12,
                                background: 'rgba(0,0,0,0.35)',
                                border: `1px solid ${theme.border}`,
                                boxShadow: `inset 0 1px 3px rgba(0,0,0,0.4)`,
                                padding: '0 8px',
                              }}>
                                <div style={{
                                  position: 'absolute',
                                  left: 8, right: 8,
                                  top: '50%', transform: 'translateY(-50%)',
                                  height: 4, borderRadius: 2,
                                  background: `linear-gradient(to right, ${theme.accentPrimary} 0%, ${theme.accentPrimary} ${nonTriadOpacity}%, rgba(255,255,255,0.12) ${nonTriadOpacity}%, rgba(255,255,255,0.12) 100%)`,
                                  pointerEvents: 'none',
                                }} />
                                <input
                                  type="range"
                                  min={0} max={100} step={5}
                                  value={nonTriadOpacity}
                                  onChange={(e) => setNonTriadOpacity(parseInt(e.target.value))}
                                  title={`Background note opacity: ${nonTriadOpacity}%`}
                                  style={{ position: 'relative', width: '100%', height: '100%', opacity: 0, cursor: 'pointer', zIndex: 1, margin: 0 }}
                                />
                              </div>
                              <span style={{ fontSize: 11, fontFamily: 'monospace', color: theme.textSecondary, minWidth: 30 }}>{nonTriadOpacity}%</span>
                              <SliderResetButton onReset={() => setNonTriadOpacity(30)} theme={theme} label="Reset non-triad opacity to 30%" />
                            </div>
                            <div style={{
                              display: 'flex',
                              borderRadius: 8,
                              border: `1px solid ${theme.border}`,
                              overflow: 'hidden',
                              flexShrink: 0,
                            }}>
                              <button
                                onClick={() => setNonTriadColorMode(false)}
                                style={{
                                  padding: '4px 10px',
                                  fontSize: 11,
                                  fontWeight: !nonTriadColorMode ? 700 : 500,
                                  background: !nonTriadColorMode ? theme.accentPrimary : theme.bgTertiary,
                                  color: !nonTriadColorMode ? '#fff' : theme.textSecondary,
                                  border: 'none',
                                  cursor: 'pointer',
                                  transition: 'all 150ms',
                                  whiteSpace: 'nowrap',
                                }}
                                title="Interval: triad note borders use interval colors (Root=Red, 3rd=Gold, 5th=Green, 7th=Lavender)"
                              >Interval</button>
                              <button
                                onClick={() => setNonTriadColorMode(true)}
                                style={{
                                  padding: '4px 10px',
                                  fontSize: 11,
                                  fontWeight: nonTriadColorMode ? 700 : 500,
                                  background: nonTriadColorMode ? theme.accentPrimary : theme.bgTertiary,
                                  color: nonTriadColorMode ? '#fff' : theme.textSecondary,
                                  border: 'none',
                                  borderLeft: `1px solid ${theme.border}`,
                                  cursor: 'pointer',
                                  transition: 'all 150ms',
                                  whiteSpace: 'nowrap',
                                }}
                                title="Monocolor: triad note borders use the note's own color"
                              >Monocolor</button>
                            </div>
                            {/* Root Note & 7th highlight checkboxes */}
                            <div style={{ width: 1, height: 20, background: theme.border, flexShrink: 0 }} />
                            {[
                              { label: 'Key', key: 'root', checked: showRootNoteHighlight as boolean, set: setShowRootNoteHighlight, color: '#E85555' },
                              { label: '7th', key: '7th', checked: show7thNoteHighlight as boolean, set: setShow7thNoteHighlight, color: '#A07ED4' },
                            ].map(({ label, key, checked, set, color }) => (
                              <label
                                key={key}
                                style={{ display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer', flexShrink: 0, userSelect: 'none' }}
                                title={`Highlight all ${label} notes in the forefront with ${color === '#E85555' ? 'Red' : 'Purple'}`}
                              >
                                <span
                                  onClick={() => set(!checked)}
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: 16,
                                    height: 16,
                                    borderRadius: 5,
                                    border: `2px solid ${checked ? color : theme.border}`,
                                    background: checked ? color : 'transparent',
                                    transition: 'all 150ms',
                                    cursor: 'pointer',
                                    flexShrink: 0,
                                  }}
                                >
                                  {checked && (
                                    <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                                      <path d="M1 3.5L3.5 6L8 1" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                  )}
                                </span>
                                <span style={{ fontSize: 11, color: checked ? color : theme.textSecondary, fontWeight: checked ? 600 : 400, whiteSpace: 'nowrap', transition: 'color 150ms' }}>{label}</span>
                              </label>
                            ))}
                          </>
                        )}
                      </div>

                      {/* Rows 2–3: shown when Triads in Scale is active */}
                      {showTriadArcBands && diatonicTriads.length > 0 && (
                        <>
                          {/* Row 2: Triad degree selector strip */}
                          <TriadFocusSelector
                            available={diatonicTriads}
                            selectedDegree={selectedFocusDegree}
                            onSelect={handleFocusDegreeSelect}
                            onPrevious={handleFocusPrevious}
                            onNext={handleFocusNext}
                            theme={theme}
                          />

                        </>
                      )}
                    </div>
                  )}
                  {/* ─────────────────────────────────────────── */}

                  {/* Combined row: triad notes (left) + draggable progression pill (center) */}
                  {((showTriadArcBands && !!focusTriad) || !!selectedChordTonePattern || !!customHighlightNotes) && (
                    <div
                      ref={progressionPillContainerRef}
                      style={{
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'flex-end',
                        gap: 10,
                        paddingLeft: 2,
                        flexWrap: 'wrap',
                        minHeight: 50,
                        marginBottom: 4,
                        flexShrink: 0,
                      }}
                    >
                      {/* Triad notes: color-coded Root / 3rd / 5th circles */}
                      {showTriadArcBands && focusTriad && (
                        <>
                          <span style={{ fontSize: 12, color: theme.textSecondary, fontWeight: 500, whiteSpace: 'nowrap', paddingBottom: 4 }}>
                            Notes in{' '}
                            <span style={{ color: focusTriad.color, fontWeight: 700 }}>{focusTriad.degree}</span>:
                          </span>
                          {['Root', '3rd', '5th'].map((role, i) => {
                            const note = focusTriad.notes[i];
                            if (!note) return null;
                            return (
                              <div key={`${note}-${i}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                                <div style={{
                                  width: 34,
                                  height: 34,
                                  borderRadius: '50%',
                                  backgroundColor: NOTE_COLORS[note] ?? '#6b7280',
                                  border: `2px solid ${focusTriad.color}`,
                                  boxShadow: `0 0 10px ${NOTE_COLORS[note] ?? '#6b7280'}55, 0 0 5px ${focusTriad.color}70`,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: '#fff',
                                  fontSize: 11,
                                  fontWeight: 700,
                                  textShadow: '0 1px 3px rgba(0,0,0,0.9)',
                                  flexShrink: 0,
                                  transition: 'all 150ms ease-out',
                                }}>
                                  {getNoteDisplayName(note)}
                                </div>
                                <span style={{ fontSize: 9, color: theme.textSecondary, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                                  {role}
                                </span>
                              </div>
                            );
                          })}
                        </>
                      )}

                      {/* Progression pill — absolutely positioned, draggable horizontally */}
                      {selectedChordTonePattern && (
                        <div
                          style={{
                            position: 'absolute',
                            left: progressionPillLeftPx !== null ? `${progressionPillLeftPx}px` : '50%',
                            top: '50%',
                            transform: 'translate(-50%, -50%)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 8,
                            padding: '6px 12px 6px 8px',
                            borderRadius: 10,
                            background: `${selectedChordTonePattern.genreColor}15`,
                            border: `1px solid ${selectedChordTonePattern.genreColor}50`,
                            boxShadow: `0 0 14px ${selectedChordTonePattern.genreColor}25`,
                            cursor: isDraggingProgressionPill ? 'grabbing' : 'grab',
                            userSelect: 'none',
                            touchAction: 'none',
                            whiteSpace: 'nowrap',
                            zIndex: 2,
                          }}
                          title="Drag to reposition above any fret"
                          onPointerDown={(e) => {
                            e.preventDefault();
                            (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
                            const containerWidth = progressionPillContainerRef.current?.offsetWidth ?? 0;
                            const currentLeft = progressionPillLeftPx !== null ? progressionPillLeftPx : containerWidth * 0.5;
                            progressionPillDragRef.current = { startX: e.clientX, startPx: currentLeft };
                            setIsDraggingProgressionPill(true);
                          }}
                          onPointerMove={(e) => {
                            if (!progressionPillDragRef.current || !progressionPillContainerRef.current) return;
                            const containerWidth = progressionPillContainerRef.current.offsetWidth;
                            const delta = e.clientX - progressionPillDragRef.current.startX;
                            const newLeft = Math.max(0, Math.min(containerWidth, progressionPillDragRef.current.startPx + delta));
                            setProgressionPillLeftPx(newLeft);
                          }}
                          onPointerUp={() => {
                            progressionPillDragRef.current = null;
                            setIsDraggingProgressionPill(false);
                          }}
                        >
                          {/* Drag grip indicator */}
                          <svg width="10" height="16" viewBox="0 0 10 16" fill="none" style={{ opacity: 0.35, flexShrink: 0 }}>
                            <circle cx="3" cy="3" r="1.5" fill={selectedChordTonePattern.genreColor} />
                            <circle cx="7" cy="3" r="1.5" fill={selectedChordTonePattern.genreColor} />
                            <circle cx="3" cy="8" r="1.5" fill={selectedChordTonePattern.genreColor} />
                            <circle cx="7" cy="8" r="1.5" fill={selectedChordTonePattern.genreColor} />
                            <circle cx="3" cy="13" r="1.5" fill={selectedChordTonePattern.genreColor} />
                            <circle cx="7" cy="13" r="1.5" fill={selectedChordTonePattern.genreColor} />
                          </svg>
                          {/* Genre dot */}
                          <div style={{
                            width: 8, height: 8, borderRadius: '50%',
                            background: selectedChordTonePattern.genreColor,
                            boxShadow: `0 0 6px ${selectedChordTonePattern.genreColor}`,
                            flexShrink: 0,
                          }} />
                          {/* Title */}
                          <span style={{ fontSize: 13, fontWeight: 700, color: selectedChordTonePattern.genreColor }}>
                            {selectedChordTonePattern.title}
                          </span>
                          {/* Separator */}
                          <span style={{ color: theme.textSecondary, opacity: 0.3, fontSize: 13 }}>·</span>
                          {/* Steps */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            {selectedChordTonePattern.steps.map((step, i) => (
                              <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                {i > 0 && (
                                  <span style={{ color: theme.textSecondary, opacity: 0.65, fontSize: 15, fontWeight: 600, lineHeight: 1 }}>→</span>
                                )}
                                {step.type === 'tone' ? (
                                  <span
                                    style={{
                                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                      borderRadius: 6, fontWeight: 700, color: '#fff',
                                      background: PATTERN_DEGREE_COLORS[step.degree],
                                      boxShadow: `0 0 8px ${PATTERN_DEGREE_COLORS[step.degree]}99`,
                                      minWidth: 28, height: 28,
                                      fontSize: 13, padding: '0 5px',
                                    }}
                                  >
                                    {step.degree}
                                  </span>
                                ) : (
                                  <span
                                    style={{
                                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                      borderRadius: 6,
                                      background: theme.bgSecondary,
                                      border: `1px solid ${theme.border}`,
                                      color: theme.textSecondary,
                                      minWidth: 38, height: 28,
                                      fontSize: 11, padding: '0 5px',
                                      whiteSpace: 'nowrap',
                                    }}
                                  >
                                    Other
                                  </span>
                                )}
                              </span>
                            ))}
                          </div>
                          {/* Deselect button */}
                          <button
                            onPointerDown={(e) => e.stopPropagation()}
                            onClick={() => { setSelectedChordTonePattern(null); setProgressionPillLeftPx(null); }}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: selectedChordTonePattern.genreColor, padding: 0, opacity: 0.45, fontSize: 13, lineHeight: 1, marginLeft: 2 }}
                            title="Deselect pattern"
                          >
                            ✕
                          </button>
                        </div>
                      )}

                      {/* Custom Progression pill — shown in real-time as the user builds their progression */}
                      {customHighlightNotes && customProgressionSequence.length > 0 && (
                        <div
                          style={{
                            position: 'absolute',
                            left: progressionPillLeftPx !== null ? `${progressionPillLeftPx}px` : '50%',
                            top: '50%',
                            transform: 'translate(-50%, -50%)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 8,
                            padding: '6px 12px 6px 8px',
                            borderRadius: 10,
                            background: `${theme.accentPrimary}12`,
                            border: `1px solid ${theme.accentPrimary}45`,
                            boxShadow: `0 0 14px ${theme.accentPrimary}22`,
                            cursor: isDraggingProgressionPill ? 'grabbing' : 'grab',
                            userSelect: 'none',
                            touchAction: 'none',
                            whiteSpace: 'nowrap',
                            zIndex: 2,
                          }}
                          title="Drag to reposition above any fret"
                          onPointerDown={(e) => {
                            e.preventDefault();
                            (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
                            const containerWidth = progressionPillContainerRef.current?.offsetWidth ?? 0;
                            const currentLeft = progressionPillLeftPx !== null ? progressionPillLeftPx : containerWidth * 0.5;
                            progressionPillDragRef.current = { startX: e.clientX, startPx: currentLeft };
                            setIsDraggingProgressionPill(true);
                          }}
                          onPointerMove={(e) => {
                            if (!progressionPillDragRef.current || !progressionPillContainerRef.current) return;
                            const containerWidth = progressionPillContainerRef.current.offsetWidth;
                            const delta = e.clientX - progressionPillDragRef.current.startX;
                            const newLeft = Math.max(0, Math.min(containerWidth, progressionPillDragRef.current.startPx + delta));
                            setProgressionPillLeftPx(newLeft);
                          }}
                          onPointerUp={() => {
                            progressionPillDragRef.current = null;
                            setIsDraggingProgressionPill(false);
                          }}
                        >
                          {/* Drag grip */}
                          <svg width="10" height="16" viewBox="0 0 10 16" fill="none" style={{ opacity: 0.35, flexShrink: 0 }}>
                            <circle cx="3" cy="3" r="1.5" fill={theme.accentPrimary} />
                            <circle cx="7" cy="3" r="1.5" fill={theme.accentPrimary} />
                            <circle cx="3" cy="8" r="1.5" fill={theme.accentPrimary} />
                            <circle cx="7" cy="8" r="1.5" fill={theme.accentPrimary} />
                            <circle cx="3" cy="13" r="1.5" fill={theme.accentPrimary} />
                            <circle cx="7" cy="13" r="1.5" fill={theme.accentPrimary} />
                          </svg>
                          {/* Label */}
                          <span style={{ fontSize: 12, fontWeight: 700, color: theme.accentPrimary, letterSpacing: '0.03em' }}>
                            🎼 My Progression
                          </span>
                          {/* Separator */}
                          <span style={{ color: theme.textSecondary, opacity: 0.3, fontSize: 13 }}>·</span>
                          {/* Degree steps colored by triad palette */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            {customProgressionSequence.map((step, i) => (
                              <span key={step.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                {i > 0 && (
                                  <span style={{ color: theme.textSecondary, opacity: 0.65, fontSize: 15, fontWeight: 600, lineHeight: 1 }}>→</span>
                                )}
                                <span style={{
                                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                  borderRadius: 6, fontWeight: 700, color: '#fff',
                                  background: step.color,
                                  boxShadow: `0 0 8px ${step.color}99`,
                                  minWidth: 30, height: 26,
                                  fontSize: 12, padding: '0 6px',
                                }}>
                                  {step.degree}
                                </span>
                              </span>
                            ))}
                          </div>
                          {/* Clear button */}
                          <button
                            onPointerDown={(e) => e.stopPropagation()}
                            onClick={() => { setCustomProgressionSequence([]); setProgressionPillLeftPx(null); }}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: theme.accentPrimary, padding: 0, opacity: 0.45, fontSize: 13, lineHeight: 1, marginLeft: 2 }}
                            title="Clear progression"
                          >
                            ✕
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  <div ref={scaleFretboardRef}>
                  <Fretboard
                  stringCount={stringCount}
                  tuning={tuning}
                  notePositions={fretboardPositionsWithTriads}
                  theme={theme}
                  isInverted={isInverted}
                  fretDotColor={fretDotColor}
                  showMiddleDots={showMiddleDots}
                  selectedChordNotes={customHighlightNotes ?? patternHighlightNotes ?? zoneHighlightedChordNotes ?? activeChordNotes}
                  selectedGuideTones={(customHighlightNotes || patternHighlightNotes) ? null : (allIntervalsMode ? null : selectedGuideTones)}
                  chordHighlightColor={chordHighlightColor}
                  guideTonesColor={guideTonesColor}
                  showChordTones={(customHighlightNotes || patternHighlightNotes) ? true : showChordTones}
                  showGuideTones={(customHighlightNotes || patternHighlightNotes) ? false : (allIntervalsMode ? false : showGuideTones)}
                  showChordGlow={(customHighlightNotes || patternHighlightNotes) ? true : showChordGlow}
                  colorGuideEnabled={(customHighlightNotes || patternHighlightNotes) ? true : (allIntervalsMode ? true : colorGuideEnabled)}
                  glowOpacity={customHighlightNotes ? customProgressionGlowBrightness : patternHighlightNotes ? patternGlowBrightness : glowOpacity}
                  patternHighlightRootNote={(customHighlightNotes || patternHighlightNotes) ? rootNote : undefined}
                  showWhiteBorder={showWhiteBorder}
                  selectedHarmonization={selectedHarmonization}
                  showColorfulStrings={showColorfulStrings}
                  stringBrightness={stringBrightness}
                  liveNotePositions={liveNotePositions}
                  liveNotesGlowEnabled={liveNotesGlowEnabled}
                  onChordHighlightColorChange={setChordHighlightColor}
                  onGuideTonesColorChange={setGuideTonesColor}
                  onShowChordTonesChange={setShowChordTones}
                  onShowGuideTonesChange={setShowGuideTones}
                  onShowChordGlowChange={setShowChordGlow}
                  circleOf5thsGlowEnabled={showCircleFretboardGlow}
                  circleOf5thsGlowColor={circleFretboardGlowColor}
                  circleOf5thsGlowOpacity={circleFretboardGlowOpacity}
                  circleOf5thsGlowWidth={circleFretboardGlowWidth}
                  circleOf5thsNeighborNotes={circleNeighborNotes}
                  selectedChordToneTypes={selectedChordToneTypes}
                  allIntervalsMode={allIntervalsMode}
                  rootNoteForIntervals={rootNote}
                  showTriadMode={showTriadMode}
                  triadNotes={displayedTriadNotes}
                  triadPositions={displayedTriadNotePositions}
                  triadFullPositions={triadData?.triadData?.positions || []}
                  onTriadVoicingClick={showTriadMode ? handleTriadVoicingClick : undefined}
                  highlightedZone={null}
                  cagedRegions={cagedRegions}
                  showCAGEDOverlay={showTriadMode && showCAGEDGuide}
                  cagedBrightness={cagedBrightness}
                  sharedNoteRingOpacity={selectedProgression ? progressionGlowBrightness : sharedNoteRingOpacity}
                  fretCount={fretCount}
                  fretWidth={fretWidth}
                  showTriadArcBands={showTriadArcBands}
                  triadFocusOn={triadFocusOn}
                  focusTriad={focusTriad}
                  nonTriadOpacity={nonTriadOpacity}
                  nonTriadColorMode={nonTriadColorMode}
                  showRootNoteHighlight={showTriadArcBands && (showRootNoteHighlight as boolean)}
                  show7thNoteHighlight={showTriadArcBands && (show7thNoteHighlight as boolean)}
                  highlightKeyNote={showTriadArcBands && (showRootNoteHighlight as boolean) ? (manualKey || rootNote) : undefined}
                  patternBgNotesOpacity={
                    patternHighlightNotes && !showTriadArcBands ? patternBgNotesOpacity :
                    !patternHighlightNotes && !customHighlightNotes && !zoneHighlightedChordNotes && showChordTones && !showTriadArcBands ? chordToneBgNotesOpacity :
                    100
                  }
                />
                  </div>{/* end scaleFretboardRef wrapper */}
                </div>

                {/* Chord Progression Explorer Sidebar - Now handled by UnifiedRightSidebar */}
              </div>
            )}

          {/* Horizontal Fretboard Drag Handle - Below 12th Fret in Normal Mode */}
          {!isFocusMode && (
            <div className="relative mt-4" style={{ height: '32px' }}>
              <button
                onMouseDown={handleHorizontalDragStart}
                className="absolute hover:opacity-90 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2"
                style={{
                  left: '850px', // Position below 12th fret: 30px padding + 40px (fret 0) + (12 * 70px) - 60px (half button width)
                  background: theme.buttonPrimary,
                  borderRadius: '8px',
                  width: '120px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                  cursor: isDraggingHorizontal ? 'grabbing' : 'grab',
                  opacity: 1,
                }}
                title="Drag to adjust fretboard horizontal position"
                aria-label="Drag fretboard horizontally"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="9" cy="12" r="1"/>
                  <circle cx="9" cy="5" r="1"/>
                  <circle cx="9" cy="19" r="1"/>
                  <circle cx="15" cy="12" r="1"/>
                  <circle cx="15" cy="5" r="1"/>
                  <circle cx="15" cy="19" r="1"/>
                </svg>
                <span style={{ color: 'white', fontSize: '14px', fontWeight: '500' }}>
                  Drag to Move
                </span>
              </button>
            </div>
          )}

          {/* Circle of 5ths - Below Position with Drag Handle */}
          {!isFocusMode && showCircleOf5ths && circleOf5thsPosition === 'below' && (
            <>
              <div
                className="mt-6"
                style={{
                  transform: `translateX(${circleOf5thsHorizontalOffset}px)`,
                }}
              >
                <div className="flex justify-center">
                  <CircleOf5ths
                    theme={theme}
                    currentKey={rootNote}
                    currentScale={manualScaleName || scaleName}
                    detectedNote={detectedNote}
                    onKeySelect={(key) => {
                      // Update entire webapp with selected key while keeping current scale/mode
                      handleManualKeyScaleChange(key, manualScaleName || scaleName);
                    }}
                    onScaleSelect={(scale) => {
                      // Update entire webapp with selected scale while keeping current key
                      handleManualKeyScaleChange(manualKey || rootNote, scale);
                    }}
                    glowDuration={circleOf5thsGlowDuration}
                    showFretboardGlow={showCircleFretboardGlow}
                    onShowFretboardGlowChange={setShowCircleFretboardGlow}
                    fretboardGlowColor={circleFretboardGlowColor}
                    onFretboardGlowColorChange={setCircleFretboardGlowColor}
                    fretboardGlowOpacity={circleFretboardGlowOpacity}
                    onFretboardGlowOpacityChange={setCircleFretboardGlowOpacity}
                    fretboardGlowWidth={circleFretboardGlowWidth}
                    onFretboardGlowWidthChange={setCircleFretboardGlowWidth}
                  />
                </div>
              </div>

              {/* Circle of 5ths Horizontal Drag Handle */}
              <div className="relative mt-4" style={{ height: '32px' }}>
                <button
                  onMouseDown={handleCircleOf5thsDragStart}
                  className="absolute hover:opacity-90 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2"
                  style={{
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                    borderRadius: '8px',
                    width: '180px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                    cursor: isDraggingCircleOf5ths ? 'grabbing' : 'grab',
                    opacity: 1,
                  }}
                  title="Drag to adjust Circle of 5ths horizontal position"
                  aria-label="Drag Circle of 5ths horizontally"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="9" cy="12" r="1"/>
                    <circle cx="9" cy="5" r="1"/>
                    <circle cx="9" cy="19" r="1"/>
                    <circle cx="15" cy="12" r="1"/>
                    <circle cx="15" cy="5" r="1"/>
                    <circle cx="15" cy="19" r="1"/>
                  </svg>
                  <span style={{ color: 'white', fontSize: '14px', fontWeight: '500' }}>
                    Drag Circle of 5ths
                  </span>
                </button>
              </div>
            </>
          )}
        </div>
        </div>

        {/* Music Theory Tabs - Hidden in Focus Mode and Triad Mode */}
        {!isFocusMode && !showTriadMode && ((autoRecommendation && detectedKey) || isManualMode) && rootNote && scaleName && (
          <div className="px-8 pb-8" data-guide="compatible-scales">
            <ErrorBoundary theme={theme}>
              <MusicTheoryTabs
                detectedKey={detectedKey || ''}
                compatibleScales={compatibleScales}
                selectedScale={selectedScale}
                onScaleSelect={handleScaleSelectFromCompatible}
                confidence={confidence}
                isManualMode={isManualMode}
                onMIDINavigateLeft={(handler) => {
                  midiScaleLeftHandler.current = handler;
                }}
                onMIDINavigateRight={(handler) => {
                  midiScaleRightHandler.current = handler;
                }}
                currentKey={rootNote}
                currentScale={scaleName}
                selectedChordNotes={selectedChordNotes}
                onChordSelect={handleChordSelectFromRecommendations}
                tuning={tuning}
                stringCount={stringCount}
                onProgressionSelect={handleProgressionSelect}
                onChordSelectionsChange={handleProgressionChordSelectionsChange}
                selectedProgressionId={selectedProgression?.id ?? null}
                currentTheme={currentTheme}
                theme={theme}
              />
            </ErrorBoundary>
          </div>
        )}

        {/* Overlapping Chords Feature - Hidden in Focus Mode and Triad Mode */}
        {!isFocusMode && !showTriadMode && rootNote && scaleName && (
          <div className="px-8 pb-8">
            <ErrorBoundary theme={theme}>
              <OverlappingChordsContainer
                theme={theme}
                currentKey={rootNote}
                currentScale={scaleName}
                stringCount={stringCount}
                tuning={tuning}
                onFretboardDataChange={handleOverlappingChordsFretboardDataChange}
              />
            </ErrorBoundary>
          </div>
        )}

        {/* Dynamic Recommendation Panel - Shows when navigating manual selections */}
        {!isFocusMode && manualSelections.length > 0 && currentSelectionIndex >= 0 && (
          <div className="px-8 pb-8">
            <ErrorBoundary theme={theme}>
              <DynamicRecommendationPanel
                theme={theme}
                manualSelections={manualSelections}
                currentSelectionIndex={currentSelectionIndex}
                currentKey={rootNote}
                currentScaleName={scaleName}
                onChordSelect={handleChordSelectFromRecommendations}
                onScaleSelect={handleScaleSelectFromChordRecommendation}
              />
            </ErrorBoundary>
          </div>
        )}

        {/* All other sections - Hidden in Focus Mode */}
        {/* Chord Library and Select Scale & Key sections are now hidden */}
      </div>

      {/* Onboarding Guide Overlay */}
      {showGuide && (
        <OnboardingGuide
          theme={theme}
          onClose={handleGuideClose}
          onNeverShowAgain={handleNeverShowAgain}
          onStepChange={handleGuideStepChange}
        />
      )}

      {/* AI Music Theory Assistant - Hidden in Focus Mode */}
      {!isFocusMode && (
        <AIAssistantSidebar
          theme={theme}
          isExpanded={isAIAssistantExpanded}
          onToggle={() => setIsAIAssistantExpanded(!isAIAssistantExpanded)}
          currentKey={rootNote}
          currentScale={scaleName}
          tuning={tuning}
          onLoadScale={handleLoadScaleFromAI}
        />
      )}

      {/* Chord Progression Modal - Popup version */}
      <ChordProgressionModal
        isOpen={isChordProgressionModalOpen}
        onClose={() => setIsChordProgressionModalOpen(false)}
        rootNote={rootNote}
        triadType={selectedTriadType}
        nearbyChords={chordNeighborhoodState.nearbyChords}
        onUseProgression={(orderedChords) => {
          // Set the progression chords as selected
          setReorderedNearbyChords(orderedChords);
          setSelectedNearbyChords(orderedChords);
          setEnabledNearbyChords(orderedChords); // Initialize all chords as enabled
          // Clear any selected overlay chord
          setChordNeighborhoodState(prev => ({
            ...prev,
            selectedOverlay: null,
            // DO NOT replace nearbyChords - keep the full list for future AI matching
          }));
        }}
        sharedRecommendations={sharedProgressionRecommendations}
        onSharedRecommendationsChange={setSharedProgressionRecommendations}
        sharedPrompt={sharedProgressionPrompt}
        onSharedPromptChange={setSharedProgressionPrompt}
        sharedComplexity={sharedProgressionComplexity}
        onSharedComplexityChange={setSharedProgressionComplexity}
        sharedLength={sharedProgressionLength}
        onSharedLengthChange={setSharedProgressionLength}
        sharedNumRecommendations={sharedProgressionNumRecommendations}
        onSharedNumRecommendationsChange={setSharedProgressionNumRecommendations}
        sharedShowFilters={sharedProgressionShowFilters}
        onSharedShowFiltersChange={setSharedProgressionShowFilters}
        onRootNoteChange={setRootNote}
        onTriadTypeChange={setSelectedTriadType}
      />

      {/* Add Chord to Neighborhood Modal */}
      <AddChordToNeighborhood
        open={isAddChordModalOpen}
        onOpenChange={setIsAddChordModalOpen}
        currentKey={rootNote}
        onChordAdd={handleChordAdd}
      />

      {/* Save Progression Dialog */}
      <SaveProgressionDialog
        open={isSaveProgressionDialogOpen}
        onOpenChange={setIsSaveProgressionDialogOpen}
        chords={chordsToSave}
        currentProgressionId={currentProgressionId}
        currentProgressionName={currentProgressionName}
        currentProgressionDescription={currentProgressionDescription}
        onSaveSuccess={handleSaveProgressionSuccess}
      />

      {/* Load Progression Dialog */}
      <LoadProgressionDialog
        open={isLoadProgressionDialogOpen}
        onOpenChange={setIsLoadProgressionDialogOpen}
        onLoadSuccess={handleLoadProgressionSuccess}
      />

      {/* Unified Right Sidebar - Combines Chord Diagrams and Explore Progressions */}
      {!overlappingChordsEnabled && (
        <UnifiedRightSidebar
          theme={theme}
          isVisible={chordNeighborhoodState.isChordDiagramSidebarVisible}
          onClose={handleCloseUnifiedSidebar}
          progressionChords={chordNeighborhoodState.progressionChords}
          tuning={tuning}
          stringCount={tuning.length}
          rootNote={rootNote}
          triadType={selectedTriadType}
          nearbyChords={chordNeighborhoodState.nearbyChords}
          onUseProgression={(orderedChords) => {
            handleChordsReorder(orderedChords);
            setSelectedNearbyChords(orderedChords);
          }}
          defaultTab={unifiedSidebarTab}
        />
      )}

      {/* Chord Browser Sidebar - For Overlapping Chords */}
      {overlappingChordsEnabled && (
        <ChordBrowserSidebar
          theme={theme}
          availableChords={availableOverlappingChords}
          selectedChords={selectedOverlappingChords}
          hoveredChord={hoveredOverlappingChord}
          onChordHover={setHoveredOverlappingChord}
          onChordClick={handleOverlappingChordClick}
          onClearAll={handleClearAllOverlappingChords}
        />
      )}
    </div>
  );
}
