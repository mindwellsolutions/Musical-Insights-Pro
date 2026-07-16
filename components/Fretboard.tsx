'use client';

import { useMemo, useState } from 'react';
import { NotePosition, NOTE_COLORS, ALL_INTERVAL_COLORS } from '@/lib/musicTheory';
import { ThemeConfig } from '@/lib/themes';
import { LiveNotePosition } from '@/lib/audio/liveNoteDetection';
import { useNoteDisplay } from '@/hooks/useNoteDisplay';
import type { ShapeRegion } from '@/lib/caged';
import { CAGEDFretboardOverlay } from './CAGEDFretboardOverlay';
import { normalizeNoteToSharp } from '@/lib/triad-theory';
import { TriadArcBandSegments } from './scale-triads/TriadArcBandSegments';
import type { DiatonicTriad } from '@/lib/music-theory/triad-membership/types';

interface FretboardProps {
  stringCount: 6 | 7;
  tuning: string[];
  notePositions: NotePosition[];
  theme: ThemeConfig;
  isInverted?: boolean;
  fretDotColor?: string;
  showMiddleDots?: boolean;
  selectedChordNotes?: string[] | null;
  selectedGuideTones?: string[] | null;
  chordHighlightColor?: string;
  guideTonesColor?: string;
  showChordTones?: boolean;
  showGuideTones?: boolean;
  showChordGlow?: boolean;
  colorGuideEnabled?: boolean;
  glowOpacity?: number;
  showWhiteBorder?: boolean;
  selectedHarmonization?: 'original' | '3rds' | '5ths' | '6ths' | '7ths';
  showColorfulStrings?: boolean;
  stringBrightness?: number;
  liveNotePositions?: LiveNotePosition[];
  liveNotesGlowEnabled?: boolean;
  onChordHighlightColorChange?: (color: string) => void;
  onGuideTonesColorChange?: (color: string) => void;
  onShowChordTonesChange?: (show: boolean) => void;
  onShowGuideTonesChange?: (show: boolean) => void;
  onShowChordGlowChange?: (show: boolean) => void;
  // Circle of Fifths visualization props
  circleOf5thsGlowEnabled?: boolean;
  circleOf5thsGlowColor?: string;
  circleOf5thsGlowOpacity?: number;
  circleOf5thsGlowWidth?: number;
  circleOf5thsNeighborNotes?: string[];
  // Individual chord tone type selection
  selectedChordToneTypes?: ('root' | 'third' | 'fifth' | 'seventh')[];
  // All Intervals mode
  allIntervalsMode?: boolean;
  rootNoteForIntervals?: string;
  // Triad mode props
  showTriadMode?: boolean;
  triadNotes?: string[];
  triadPositions?: any[];
  sharedNoteRingOpacity?: number; // Opacity for shared note outer rings (0-100)
  triadFullPositions?: any[]; // Full TriadPosition objects for click handling
  onTriadVoicingClick?: (position: any, allPositions?: any[]) => void;
  showTriadRingsOnScale?: boolean; // Show triad notes as rings on top of scale notes
  // Zone highlighting
  highlightedZone?: { startFret: number; endFret: number } | null;
  // CAGED overlay
  cagedRegions?: ShapeRegion[];
  showCAGEDOverlay?: boolean;
  cagedBrightness?: number;
  // Fret count
  fretCount?: number;
  // Navigation arrows for chord neighborhood
  showNavigationArrows?: boolean;
  anchorChordPositions?: Array<{ string: number; fret: number; note: string }>;
  onNavigatePrevious?: () => void;
  onNavigateNext?: () => void;
  // Fret marker visibility controls
  showTopFretDots?: boolean;
  showTopFretNumbers?: boolean;
  showBottomFretDots?: boolean;
  showBottomFretNumbers?: boolean;
  // Voicing outline groups: draw rounded SVG rects around each chord voicing cluster
  voicingOutlineGroups?: Array<{ color: string; label: string; positions: { stringIndex: number; fretIndex: number }[] }>;
  // Generic note click: fires when a custom-color note (chords mode) is clicked
  onNoteClick?: (notePosition: NotePosition) => void;
  // ── Triad Arc Band (Feature 1) ──────────────────────────────────────────────
  showTriadArcBands?: boolean;          // master toggle; default false
  // (triadMembership lives on NotePosition.triadMembership — no extra prop needed)
  // ── Triad Focus Mode (Feature 2) ────────────────────────────────────────────
  triadFocusOn?: boolean;               // spotlight mode active; default false
  focusTriad?: DiatonicTriad | null;    // which triad is spotlighted
  showTriadFocusLines?: boolean;        // optional dashed SVG lines; default false
  // ── Non-triad background note appearance ────────────────────────────────────
  nonTriadOpacity?: number;             // 0–100; how visible background notes are; default 30
  nonTriadColorMode?: boolean;          // false = B&W (desaturate), true = full NOTE_COLORS; default false
  // ── Pattern highlight root override ─────────────────────────────────────────
  // When set, this note is used as root for chord-tone color hierarchy instead of selectedChordNotes[0].
  // Required when selectedChordNotes contains only non-root pattern notes (e.g. degree 3 + 7 only).
  patternHighlightRootNote?: string;
  // ── Bg notes opacity when a chord-tone pattern is active (Triads in Scale off) ─
  patternBgNotesOpacity?: number;       // 0–100; dims scale notes NOT in selectedChordNotes; default 100 (no dim)
}

const FRET_MARKERS = [3, 5, 7, 9, 12, 15, 17, 19, 21, 24];
const DOUBLE_MARKERS = [12, 24];

// Colorful string colors indexed by physical string position (tuning array index)
// tuning[0] = low E (6th string), tuning[5] = high E (1st string)
// Regular mode: index 0 = top string (low E) = Red, index 5 = bottom string (high E) = Purple
// Inverted mode: string order flips, so colors flip with them
const STRING_COLORS = [
  '#ef4444', // Red   - string 0 (low E, 6th string)
  '#eab308', // Yellow - string 1 (A, 5th string)
  '#3b82f6', // Blue   - string 2 (D, 4th string)
  '#f97316', // Orange - string 3 (G, 3rd string)
  '#22c55e', // Green  - string 4 (B, 2nd string)
  '#9333ea', // Purple - string 5 (high E, 1st string)
  '#ec4899', // Pink   - string 6 (B, 7th string)
];

// Chord tone hierarchy colors
const CHORD_TONE_COLORS = {
  root: '#E85555',    // Red
  third: '#F5BC3C',   // Yellow/Gold
  fifth: '#5DB572',   // Green
  seventh: '#A07ED4', // Purple
};

// Helper function to get interval color for All Intervals mode
// Maps any note to a color based on its semitone distance from the root
const CHROMATIC_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
function getAllIntervalColor(note: string, rootNote: string): string {
  const normalizedRoot = normalizeNoteToSharp(rootNote);
  const normalizedNote = normalizeNoteToSharp(note);
  const rootIndex = CHROMATIC_NOTES.indexOf(normalizedRoot);
  const noteIndex = CHROMATIC_NOTES.indexOf(normalizedNote);
  if (rootIndex === -1 || noteIndex === -1) return '#6b7280';
  const semitone = (noteIndex - rootIndex + 12) % 12;
  return ALL_INTERVAL_COLORS[semitone] ?? '#6b7280';
}

// Helper function to determine chord tone type (Root, Third, Fifth, Seventh)
// Returns the color for the chord tone based on its musical function
function getChordToneColor(note: string, chordNotes: string[], rootNote?: string): string | null {
  if (!chordNotes || chordNotes.length === 0) return null;

  const noteIndex = chordNotes.indexOf(note);
  if (noteIndex === -1) return null;

  // If we have a root note specified, use it to determine the actual chord tone function
  if (rootNote) {
    const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    // Normalize flat notes to sharp equivalents
    const normalizedRoot = normalizeNoteToSharp(rootNote);
    const normalizedNote = normalizeNoteToSharp(note);
    const rootIndex = NOTES.indexOf(normalizedRoot);
    const currentNoteIndex = NOTES.indexOf(normalizedNote);

    if (rootIndex === -1 || currentNoteIndex === -1) {
      // Fallback to position-based if notes not found
      return getColorByPosition(noteIndex);
    }

    // Calculate interval from root
    const interval = (currentNoteIndex - rootIndex + 12) % 12;

    // Map interval to chord tone type
    switch (interval) {
      case 0:
        return CHORD_TONE_COLORS.root;
      case 3:
      case 4:
        return CHORD_TONE_COLORS.third; // Minor or major third
      case 7:
        return CHORD_TONE_COLORS.fifth; // Perfect fifth
      case 6:
        return CHORD_TONE_COLORS.fifth; // Diminished fifth (still a fifth)
      case 8:
        return CHORD_TONE_COLORS.fifth; // Augmented fifth (still a fifth)
      case 10:
      case 11:
        return CHORD_TONE_COLORS.seventh; // Minor or major seventh
      case 9:
        return CHORD_TONE_COLORS.seventh; // Sixth (functions like seventh)
      default:
        // For extensions (9th, 11th, 13th), use position-based coloring
        return getColorByPosition(noteIndex);
    }
  }

  // Fallback to position-based coloring if no root note provided
  return getColorByPosition(noteIndex);
}

// Helper function to get color by array position
function getColorByPosition(position: number): string {
  switch (position) {
    case 0:
      return CHORD_TONE_COLORS.root;
    case 1:
      return CHORD_TONE_COLORS.third;
    case 2:
      return CHORD_TONE_COLORS.fifth;
    case 3:
      return CHORD_TONE_COLORS.seventh;
    default:
      // For extended chords (9th, 11th, 13th), cycle through colors
      const colorKeys = ['root', 'third', 'fifth', 'seventh'] as const;
      return CHORD_TONE_COLORS[colorKeys[position % 4]];
  }
}

// Helper function to determine chord tone type from interval
function getChordToneType(note: string, chordNotes: string[], rootNote: string): 'root' | 'third' | 'fifth' | 'seventh' | null {
  const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  // Normalize flat notes to sharp equivalents
  const normalizedRoot = normalizeNoteToSharp(rootNote);
  const normalizedNote = normalizeNoteToSharp(note);
  const rootIndex = NOTES.indexOf(normalizedRoot);
  const currentNoteIndex = NOTES.indexOf(normalizedNote);

  if (rootIndex === -1 || currentNoteIndex === -1) {
    // Fallback to position-based
    const position = chordNotes.indexOf(note);
    if (position === 0) return 'root';
    if (position === 1) return 'third';
    if (position === 2) return 'fifth';
    if (position === 3) return 'seventh';
    return null;
  }

  const interval = (currentNoteIndex - rootIndex + 12) % 12;

  switch (interval) {
    case 0:
      return 'root';
    case 3:
    case 4:
      return 'third';
    case 6:
    case 7:
    case 8:
      return 'fifth';
    case 9:
    case 10:
    case 11:
      return 'seventh';
    default:
      return null;
  }
}

// Helper function to adjust color brightness
// brightness: 0-100 (0 = black, 100 = original color)
function adjustColorBrightness(hexColor: string, brightness: number): string {
  // Convert hex to RGB
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Adjust brightness (0-100 scale)
  const factor = brightness / 100;
  const newR = Math.round(r * factor);
  const newG = Math.round(g * factor);
  const newB = Math.round(b * factor);

  // Convert back to hex
  const toHex = (n: number) => {
    const hex = n.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(newR)}${toHex(newG)}${toHex(newB)}`;
}

export default function Fretboard({
  stringCount,
  tuning,
  notePositions,
  theme,
  isInverted = false,
  fretDotColor,
  showMiddleDots = false,
  selectedChordNotes = null,
  selectedGuideTones = null,
  chordHighlightColor = '#fbbf24',
  guideTonesColor = '#ec4899',
  showChordTones = true,
  showGuideTones = true,
  showChordGlow = false,
  colorGuideEnabled = false,
  glowOpacity = 40,
  showWhiteBorder = false,
  selectedHarmonization = 'original',
  showColorfulStrings = false,
  stringBrightness = 100,
  liveNotePositions = [],
  selectedChordToneTypes = ['root', 'third', 'fifth', 'seventh'],
  allIntervalsMode = false,
  rootNoteForIntervals = 'C',
  liveNotesGlowEnabled = false,
  onChordHighlightColorChange,
  onGuideTonesColorChange,
  onShowChordTonesChange,
  onShowGuideTonesChange,
  onShowChordGlowChange,
  circleOf5thsGlowEnabled = false,
  circleOf5thsGlowColor = '#667eea',
  circleOf5thsGlowOpacity = 60,
  circleOf5thsGlowWidth = 20,
  circleOf5thsNeighborNotes = [],
  showTriadMode = false,
  triadNotes = [],
  triadPositions = [],
  triadFullPositions = [],
  onTriadVoicingClick,
  showTriadRingsOnScale = false,
  highlightedZone = null,
  cagedRegions = [],
  showCAGEDOverlay = false,
  cagedBrightness = 100,
  sharedNoteRingOpacity = 60,
  fretCount: propFretCount = 24,
  showNavigationArrows = false,
  anchorChordPositions = [],
  onNavigatePrevious,
  onNavigateNext,
  showTopFretDots = true,
  showTopFretNumbers = true,
  showBottomFretDots = true,
  showBottomFretNumbers = true,
  voicingOutlineGroups = [],
  onNoteClick,
  showTriadArcBands = false,
  triadFocusOn = false,
  focusTriad = null,
  showTriadFocusLines = false,
  nonTriadOpacity = 30,
  nonTriadColorMode = false,
  patternHighlightRootNote = undefined,
  patternBgNotesOpacity = 100,
}: FretboardProps) {
  const { getNoteDisplayName } = useNoteDisplay();
  const fretCount = propFretCount;

  // Track all triad positions that share the hovered note (for multi-chord highlighting)
  const [hoveredTriadPositions, setHoveredTriadPositions] = useState<any[]>([]);

  const displayTuning = useMemo(() => {
    return isInverted ? [...tuning].reverse() : tuning;
  }, [tuning, isInverted]);

  // Group notes by position - can have both original and harmony notes at same position
  const noteMap = useMemo(() => {
    const map = new Map<string, NotePosition[]>();
    const positions = showTriadMode && triadPositions.length > 0 ? triadPositions : notePositions;

    positions.forEach(pos => {
      // Filter out notes beyond the fret count
      if (pos.fretNumber > fretCount) return;

      const displayStringIndex = isInverted ? (tuning.length - 1 - pos.stringIndex) : pos.stringIndex;
      const key = `${displayStringIndex}-${pos.fretNumber}`;
      const existing = map.get(key) || [];
      map.set(key, [...existing, pos]);
    });

    return map;
  }, [notePositions, triadPositions, showTriadMode, isInverted, tuning.length, selectedChordNotes, selectedGuideTones, showChordTones, showGuideTones, fretCount]);

  // Create live note map for quick lookup
  const liveNoteMap = useMemo(() => {
    const map = new Map<string, LiveNotePosition>();
    if (liveNotesGlowEnabled && liveNotePositions) {
      liveNotePositions.forEach(pos => {
        // Filter out notes beyond the fret count
        if (pos.fretNumber > fretCount) return;

        const displayStringIndex = isInverted ? (tuning.length - 1 - pos.stringIndex) : pos.stringIndex;
        const key = `${displayStringIndex}-${pos.fretNumber}`;
        map.set(key, pos);
      });
    }
    return map;
  }, [liveNotePositions, liveNotesGlowEnabled, isInverted, tuning.length, fretCount]);

  return (
    <div className="relative w-full overflow-x-auto pb-8">
      {/* CSS Animation for live note pulse */}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.05);
            opacity: 0.9;
          }
        }
      `}</style>
      <div className="inline-block mx-auto">
        <div className="relative" style={{
          background: theme.fretboardBg,
          borderRadius: '12px',
          padding: '40px 20px',
        }}>
          <div className="absolute top-2 left-0 right-0" style={{ color: theme.textSecondary, paddingLeft: '30px', paddingRight: '30px' }}>
            {showTopFretDots && (
              <div className="flex mb-2">
                {Array.from({ length: fretCount + 1 }, (_, i) => (
                  <div
                    key={`top-dots-${i}`}
                    className="flex items-center justify-center"
                    style={{
                      width: i === 0 ? '40px' : '70px',
                      minWidth: i === 0 ? '40px' : '70px',
                      transform: i === 0 ? 'none' : 'translateX(35px)',
                      height: '32px',
                    }}
                  >
                    {FRET_MARKERS.includes(i) && (
                      <div className="flex flex-col gap-2 items-center">
                        <div
                          style={{
                            width: DOUBLE_MARKERS.includes(i) ? '12px' : '16px',
                            height: DOUBLE_MARKERS.includes(i) ? '12px' : '16px',
                            borderRadius: '50%',
                            background: fretDotColor || theme.fretMarker,
                          }}
                        />
                        {DOUBLE_MARKERS.includes(i) && (
                          <div
                            style={{
                              width: '12px',
                              height: '12px',
                              borderRadius: '50%',
                              background: fretDotColor || theme.fretMarker,
                            }}
                          />
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            {showTopFretNumbers && (
              <div className="flex">
                {Array.from({ length: fretCount + 1 }, (_, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-center text-xl font-medium"
                    style={{
                      width: i === 0 ? '40px' : '70px',
                      minWidth: i === 0 ? '40px' : '70px',
                      transform: i === 0 ? 'none' : 'translateX(35px)',
                    }}
                  >
                    {i}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="relative mt-6">
            {/* CAGED Overlay */}
            {showCAGEDOverlay && cagedRegions && cagedRegions.length > 0 && (
              <CAGEDFretboardOverlay
                regions={cagedRegions}
                stringCount={stringCount}
                fretCount={fretCount}
                isInverted={isInverted}
                brightness={cagedBrightness}
              />
            )}

            {displayTuning.map((note, stringIndex) => {
              // Map display stringIndex to the physical string's color.
              // tuning array is ordered [lowE, A, D, G, B, highE] (low → high).
              // Regular mode: displayTuning = tuning, so stringIndex 0 = lowE → colorIndex 0 (Red).
              // Inverted mode: displayTuning is reversed, so stringIndex 0 = highE → colorIndex 5 (Purple).
              const colorIndex = isInverted ? (stringCount - 1 - stringIndex) : stringIndex;
              const baseStringColor = showColorfulStrings ? STRING_COLORS[colorIndex] : theme.fretboardString;
              const stringColor = showColorfulStrings ? adjustColorBrightness(baseStringColor, stringBrightness) : baseStringColor;

              return (
              <div key={stringIndex} className="flex items-center mb-3 last:mb-0">
                <div
                  className="w-8 text-center font-semibold text-sm mr-2"
                  style={{ color: theme.textPrimary }}
                >
                  {getNoteDisplayName(note)}
                </div>

                <div className="relative flex-1 flex items-center">
                  <div
                    className="absolute left-0 right-0"
                    style={{
                      height: `${Math.max(1, 4 - stringIndex * 0.3)}px`,
                      background: stringColor,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      boxShadow: showColorfulStrings ? `0 0 8px ${stringColor}` : 'none',
                    }}
                  />

                  {Array.from({ length: fretCount + 1 }, (_, fretIndex) => {
                    const key = `${stringIndex}-${fretIndex}`;
                    const notesAtPosition = noteMap.get(key) || [];
                    const liveNote = liveNoteMap.get(key);

                    // Check if this fret is in the highlighted zone
                    const isInZone = highlightedZone &&
                      fretIndex >= highlightedZone.startFret &&
                      fretIndex <= highlightedZone.endFret;

                    return (
                      <div
                        key={fretIndex}
                        className="relative flex items-center justify-center"
                        style={{
                          width: fretIndex === 0 ? '40px' : '70px',
                          minWidth: fretIndex === 0 ? '40px' : '70px',
                          height: '44px',
                          background: isInZone ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
                          transition: 'background 200ms ease',
                        }}
                      >
                        {/* Render live note (ghost or regular) if enabled */}
                        {liveNote && liveNotesGlowEnabled && (() => {
                          const isGhostNote = liveNote.isGhostNote;

                          return (
                            <div
                              className="relative z-20 flex items-center justify-center font-semibold text-xs"
                              style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                backgroundColor: isGhostNote ? 'rgba(255, 255, 255, 0.15)' : NOTE_COLORS[liveNote.note],
                                color: isGhostNote ? '#ffffff' : '#ffffff',
                                border: isGhostNote ? '2px solid rgba(255, 255, 255, 0.4)' : '3px solid #f59e0b',
                                boxShadow: isGhostNote
                                  ? '0 0 0 4px rgba(255, 255, 255, 0.1), 0 0 12px rgba(255, 255, 255, 0.3)'
                                  : '0 0 0 6px rgba(245, 158, 11, 0.4), 0 0 16px rgba(245, 158, 11, 0.6), 0 0 24px rgba(245, 158, 11, 0.4)',
                                opacity: isGhostNote ? 0.6 : 1,
                                animation: 'pulse 1.5s ease-in-out infinite',
                              }}
                            >
                              {getNoteDisplayName(liveNote.note)}
                            </div>
                          );
                        })()}

                        {/* Render scale notes (if not covered by live note or if live notes disabled) */}
                        {notesAtPosition.length > 0 && (!liveNote || !liveNotesGlowEnabled) && (() => {
                          // Helper function to convert hex to rgba
                          const hexToRgba = (hex: string | undefined, alpha: number) => {
                            // Safety check: return transparent if hex is undefined or invalid
                            if (!hex || typeof hex !== 'string' || !hex.startsWith('#')) {
                              return `rgba(0, 0, 0, 0)`;
                            }
                            const r = parseInt(hex.slice(1, 3), 16);
                            const g = parseInt(hex.slice(3, 5), 16);
                            const b = parseInt(hex.slice(5, 7), 16);
                            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
                          };

                          // Check if we're in harmonization mode (not 'original')
                          const isHarmonizationMode = selectedHarmonization !== 'original';

                          // Find original and harmony notes at this position
                          const originalNote = notesAtPosition.find(n => !n.isHarmonyNote);
                          const harmonyNotes = notesAtPosition.filter(n => n.isHarmonyNote);

                          // Determine which note to display
                          const notePos = originalNote || notesAtPosition[0];

                          // HOVERED ANCHOR POSITION (special white glow for chord neighborhood hover)
                          if ((notePos as any).isHoveredAnchor) {
                            return (
                              <div
                                className="relative z-20 flex items-center justify-center font-semibold text-xs"
                                style={{
                                  width: '32px',
                                  height: '32px',
                                  borderRadius: '50%',
                                  backgroundColor: '#ffffff',
                                  color: '#000000',
                                  border: '3px solid #ffffff',
                                  boxShadow: '0 0 0 6px rgba(255, 255, 255, 0.8), 0 0 16px rgba(255, 255, 255, 0.9), 0 0 24px rgba(255, 255, 255, 0.6)',
                                }}
                                title={`Hovered Chord: ${getNoteDisplayName(notePos.note)}`}
                              >
                                {getNoteDisplayName(notePos.note)}
                              </div>
                            );
                          }

                          // CUSTOM COLOR OVERLAY (e.g., for nearby chords "Show All" mode)
                          if (notePos.customColor || notePos.sharedChordColors) {
                            // Use sharedChordColors if available, otherwise fall back to customColor
                            const rawChordColors = notePos.sharedChordColors || [notePos.customColor!];
                            // Filter out undefined/null colors to prevent errors
                            const chordColors = rawChordColors.filter((c): c is string => !!c && typeof c === 'string');

                            // If no valid colors, skip this rendering
                            if (chordColors.length === 0) {
                              return null;
                            }

                            const primaryColor = chordColors[0];

                            // Build multi-ring box-shadow for shared notes
                            // Match the style of single-chord notes: thin, semi-transparent rings
                            const ringLayers: string[] = [];

                            // Convert opacity from 0-100 to 0-1 scale
                            const normalizedOpacity = sharedNoteRingOpacity / 100;

                            // Create thin, semi-transparent rings for each chord color
                            chordColors.forEach((color, index) => {
                              const baseOffset = 3; // Start after the 3px border
                              const ringSpacing = 6; // Space between each ring (matches single-chord glow size)
                              const offset = baseOffset + (index * ringSpacing);

                              // Create two layers per ring for better visibility (matching single-chord style)
                              // Inner layer: more opaque, smaller spread
                              ringLayers.push(`0 0 0 ${offset}px ${hexToRgba(color, 0.6 * normalizedOpacity)}`);
                              // Outer layer: less opaque, larger spread for glow effect
                              ringLayers.push(`0 0 ${offset + 6}px ${hexToRgba(color, 0.4 * normalizedOpacity)}`);
                            });

                            const boxShadow = ringLayers.join(', ');

                            return (
                              <div
                                className="relative z-10 flex items-center justify-center font-semibold text-xs transition-transform duration-150"
                                style={{
                                  width: '32px',
                                  height: '32px',
                                  borderRadius: '50%',
                                  backgroundColor: primaryColor,
                                  color: '#ffffff',
                                  border: `3px solid ${primaryColor}`,
                                  boxShadow,
                                  cursor: onNoteClick ? 'pointer' : 'default',
                                }}
                                title={`${getNoteDisplayName(notePos.note)}${chordColors.length > 1 ? ` (shared by ${chordColors.length} chords)` : ''}${onNoteClick ? ' — click to select chord' : ''}`}
                                onClick={() => onNoteClick?.(notePos)}
                              >
                                {getNoteDisplayName(notePos.note)}
                              </div>
                            );
                          }

                          // TRIAD MODE VISUALIZATION
                          if (showTriadMode && triadNotes.length > 0) {
                            const isTriadNote = triadNotes.includes(notePos.note);

                            if (isTriadNote) {
                              // Use the note's true circle color (same as scale/fretboard note colors)
                              const noteColor = NOTE_COLORS[notePos.note] ?? '#6b7280';
                              let chordToneType = '';

                              if (notePos.chordTone === 'root') {
                                chordToneType = 'Root';
                              } else if (notePos.chordTone === 'third') {
                                chordToneType = '3rd';
                              } else if (notePos.chordTone === 'fifth') {
                                chordToneType = '5th';
                              }

                              const borderColor = `3px solid ${noteColor}`;

                              // Find ALL triad positions that contain this note at this string/fret
                              const findAllTriadPositions = () => {
                                if (!triadFullPositions || triadFullPositions.length === 0) return [];

                                // Find all positions that contain this note at this string/fret
                                return triadFullPositions.filter(pos =>
                                  pos.stringPositions?.some((sp: any) =>
                                    sp.stringIndex === notePos.stringIndex &&
                                    sp.fret === notePos.fretNumber
                                  )
                                );
                              };

                              const allTriadPositionsForNote = findAllTriadPositions();
                              const currentTriadPosition = allTriadPositionsForNote[0] || null;

                              // Check if this note is part of any hovered triad
                              const isHovered = hoveredTriadPositions.length > 0 &&
                                allTriadPositionsForNote.some(pos =>
                                  hoveredTriadPositions.some(hovered => hovered.positionIndex === pos.positionIndex)
                                );

                              // Create multi-colored glow rings if this note is part of multiple hovered chords
                              const createMultiColorGlow = () => {
                                if (!isHovered || hoveredTriadPositions.length === 0) {
                                  return `0 0 0 6px ${hexToRgba(noteColor, 0.6)}, 0 0 12px ${hexToRgba(noteColor, 0.4)}`;
                                }

                                // Get colors ONLY for chords that contain THIS EXACT note position
                                // (not just any note in the hovered chords)
                                const hoveredColors: string[] = [];
                                allTriadPositionsForNote.forEach(pos => {
                                  // Check if this position is in the hovered list
                                  const isThisPositionHovered = hoveredTriadPositions.some(
                                    hovered => hovered.positionIndex === pos.positionIndex
                                  );

                                  if (isThisPositionHovered) {
                                    // Get the color for this chord position
                                    const posIndex = pos.positionIndex % 7; // Cycle through 7 colors
                                    const colors = ['#E53E3E', '#DD6B20', '#D69E2E', '#38A169', '#3182CE', '#805AD5', '#D53F8C'];
                                    hoveredColors.push(colors[posIndex]);
                                  }
                                });

                                // Build concentric rings with different colors
                                const rings: string[] = [];
                                hoveredColors.forEach((color, index) => {
                                  const offset = 6 + (index * 6); // Space rings 6px apart
                                  // Two layers per ring for depth
                                  rings.push(`0 0 0 ${offset}px ${hexToRgba(color, 0.6)}`);
                                  rings.push(`0 0 ${offset + 6}px ${hexToRgba(color, 0.4)}`);
                                });

                                return rings.join(', ');
                              };

                              const glowColor = createMultiColorGlow();

                              const handleClick = () => {
                                if (onTriadVoicingClick && allTriadPositionsForNote.length > 0) {
                                  if (allTriadPositionsForNote.length > 1) {
                                    // Pass all positions for multi-chord handling
                                    onTriadVoicingClick(allTriadPositionsForNote[0], allTriadPositionsForNote);
                                  } else {
                                    // Single position
                                    onTriadVoicingClick(allTriadPositionsForNote[0]);
                                  }
                                }
                              };

                              const handleMouseEnter = () => {
                                if (allTriadPositionsForNote.length > 0) {
                                  // Set all triad positions that share this note
                                  setHoveredTriadPositions(allTriadPositionsForNote);
                                }
                              };

                              const handleMouseLeave = () => {
                                setHoveredTriadPositions([]);
                              };

                              // Simple tooltip without the popup details
                              const createTooltipText = () => {
                                return `${getNoteDisplayName(notePos.note)} (${chordToneType})`;
                              };

                              return (
                                <div
                                  className="relative z-10 flex items-center justify-center font-semibold text-xs transition-all duration-200"
                                  style={{
                                    width: isHovered ? '36px' : '32px',
                                    height: isHovered ? '36px' : '32px',
                                    borderRadius: '50%',
                                    backgroundColor: noteColor,
                                    color: '#ffffff',
                                    border: borderColor,
                                    boxShadow: glowColor,
                                    cursor: onTriadVoicingClick ? 'pointer' : 'help',
                                    transform: isHovered ? 'scale(1.1)' : 'scale(1)',
                                  }}
                                  title={createTooltipText()}
                                  onClick={handleClick}
                                  onMouseEnter={handleMouseEnter}
                                  onMouseLeave={handleMouseLeave}
                                >
                                  {getNoteDisplayName(notePos.note)}
                                </div>
                              );
                            }

                            // If not a triad note or not in selected positions, don't show anything
                            return null;
                          }

                          // In harmonization mode, hide chord tones
                          const shouldShowChordTones = !isHarmonizationMode && showChordTones;
                          const shouldShowGuideTones = !isHarmonizationMode && showGuideTones;

                          // Check if note is a chord tone and if its type is selected
                          let isChordTone = shouldShowChordTones && selectedChordNotes && selectedChordNotes.includes(notePos.note);
                          if (isChordTone && selectedChordNotes) {
                            // Use patternHighlightRootNote when provided (pattern mode); otherwise fall back to first chord note
                            const chordRoot = patternHighlightRootNote ?? selectedChordNotes[0];
                            const chordToneType = getChordToneType(notePos.note, selectedChordNotes, chordRoot);
                            if (chordToneType && !selectedChordToneTypes.includes(chordToneType)) {
                              isChordTone = false; // Filter out unselected chord tone types
                            }
                          }

                          const isGuideTone = shouldShowGuideTones && selectedGuideTones && selectedGuideTones.includes(notePos.note);

                          let borderColor = 'none';
                          let glowColor = 'none';

                          // Determine visualization based on mode
                          if (isHarmonizationMode) {
                            // NEW HARMONIZATION VISUALIZATION
                            if (harmonyNotes.length > 0) {
                              // This position has harmony note(s)
                              // Show colored glow circle matching the original note's color
                              const harmonyNote = harmonyNotes[0];
                              const originalNoteForHarmony = harmonyNote.originalNote || harmonyNote.note;
                              const originalColor = NOTE_COLORS[originalNoteForHarmony];

                              // Create glow effect with the original note's color
                              glowColor = `0 0 0 6px ${hexToRgba(originalColor, 0.5)}, 0 0 12px ${hexToRgba(originalColor, 0.4)}, 0 0 20px ${hexToRgba(originalColor, 0.3)}`;
                              borderColor = `3px solid ${originalColor}`;
                            } else if (originalNote) {
                              // Original scale note - show normally
                              if (notePos.isRoot) {
                                borderColor = '2px solid #ffffff';
                                glowColor = '0 0 0 3px rgba(255,255,255,0.3), 0 4px 12px rgba(0,0,0,0.4)';
                              } else {
                                glowColor = '0 2px 8px rgba(0,0,0,0.3)';
                              }
                            }
                          } else if (allIntervalsMode && isChordTone) {
                            // ALL INTERVALS MODE - color each note by its interval from root
                            const intervalColor = getAllIntervalColor(notePos.note, rootNoteForIntervals);
                            const normalizedOpacity = glowOpacity / 100;
                            borderColor = (normalizedOpacity > 0.8 || showWhiteBorder) && showChordGlow
                              ? `1px solid #ffffff`
                              : `4px solid ${intervalColor}`;
                            if (showChordGlow) {
                              if (normalizedOpacity > 0.8 || showWhiteBorder) {
                                glowColor = `0 0 0 1px #ffffff, 0 0 0 8px ${hexToRgba(intervalColor, normalizedOpacity)}`;
                              } else {
                                glowColor = `0 0 0 6px ${hexToRgba(intervalColor, normalizedOpacity)}`;
                              }
                            }
                          } else {
                            // ORIGINAL MODE - Show chord tones and guide tones
                            if (isChordTone && isGuideTone) {
                              // When a note is both chord tone AND guide tone, prioritize chord tone color
                              let chordColor = chordHighlightColor;
                              if (colorGuideEnabled && selectedChordNotes) {
                                const chordRoot = patternHighlightRootNote ?? selectedChordNotes[0];
                                const hierarchyColor = getChordToneColor(notePos.note, selectedChordNotes, chordRoot);
                                if (hierarchyColor) chordColor = hierarchyColor;
                              }
                              const normalizedOpacity = glowOpacity / 100;
                              borderColor = (normalizedOpacity > 0.8 || showWhiteBorder) && showChordGlow ? `1px solid #ffffff` : `4px solid ${chordColor}`;
                              if (showChordGlow) {
                                if (normalizedOpacity > 0.8 || showWhiteBorder) {
                                  glowColor = `0 0 0 1px #ffffff, 0 0 0 8px ${hexToRgba(chordColor, normalizedOpacity)}`;
                                } else {
                                  glowColor = `0 0 0 6px ${hexToRgba(chordColor, normalizedOpacity)}`;
                                }
                              }
                            } else if (isChordTone) {
                              let chordColor = chordHighlightColor;
                              if (colorGuideEnabled && selectedChordNotes) {
                                const chordRoot = patternHighlightRootNote ?? selectedChordNotes[0];
                                const hierarchyColor = getChordToneColor(notePos.note, selectedChordNotes, chordRoot);
                                if (hierarchyColor) chordColor = hierarchyColor;
                              }
                              const normalizedOpacity = glowOpacity / 100;
                              borderColor = (normalizedOpacity > 0.8 || showWhiteBorder) && showChordGlow ? `1px solid #ffffff` : `4px solid ${chordColor}`;
                              if (showChordGlow) {
                                if (normalizedOpacity > 0.8 || showWhiteBorder) {
                                  glowColor = `0 0 0 1px #ffffff, 0 0 0 8px ${hexToRgba(chordColor, normalizedOpacity)}`;
                                } else {
                                  glowColor = `0 0 0 6px ${hexToRgba(chordColor, normalizedOpacity)}`;
                                }
                              }
                            } else if (isGuideTone) {
                              const normalizedOpacity = glowOpacity / 100;
                              borderColor = (normalizedOpacity > 0.8 || showWhiteBorder) && showChordGlow ? `1px solid #ffffff` : `4px solid ${guideTonesColor}`;
                              if (showChordGlow) {
                                if (normalizedOpacity > 0.8 || showWhiteBorder) {
                                  glowColor = `0 0 0 1px #ffffff, 0 0 0 8px ${hexToRgba(guideTonesColor, normalizedOpacity)}`;
                                } else {
                                  glowColor = `0 0 0 6px ${hexToRgba(guideTonesColor, normalizedOpacity)}`;
                                }
                              }
                            } else if (notePos.isRoot) {
                              borderColor = '2px solid #ffffff';
                              glowColor = '0 0 0 3px rgba(255,255,255,0.3), 0 4px 12px rgba(0,0,0,0.4)';
                            } else {
                              glowColor = '0 2px 8px rgba(0,0,0,0.3)';
                            }
                          }

                          // Check if this note is a Circle of Fifths neighbor
                          const isCircleNeighbor = circleOf5thsGlowEnabled &&
                            circleOf5thsNeighborNotes.includes(notePos.note);

                          // Check if this scale note is also a triad note (for showTriadRingsOnScale mode)
                          const isTriadNote = showTriadRingsOnScale && triadNotes && triadNotes.includes(notePos.note);

                          // Determine triad chord tone type for color
                          let triadRingColor = '#E85555'; // Default to root color
                          if (isTriadNote && triadNotes) {
                            const triadNoteIndex = triadNotes.indexOf(notePos.note);
                            if (triadNoteIndex === 0) {
                              triadRingColor = '#E85555'; // Root - Red
                            } else if (triadNoteIndex === 1) {
                              triadRingColor = '#5DB572'; // Third - Green (using 5th color since triads don't have a distinct 3rd)
                            } else if (triadNoteIndex === 2) {
                              triadRingColor = '#5DB572'; // Fifth - Green
                            }
                          }

                          // Layer Circle of Fifths glow on top of chord tone glow if both are enabled
                          let finalBoxShadow = glowColor !== 'none' ? glowColor : '0 2px 8px rgba(0,0,0,0.3)';

                          if (isCircleNeighbor) {
                            const normalizedCircleOpacity = circleOf5thsGlowOpacity / 100;
                            const rgbaColor = hexToRgba(circleOf5thsGlowColor, normalizedCircleOpacity);

                            // If there's already a chord tone glow, layer the Circle of Fifths glow on top
                            if (glowColor !== 'none' && glowColor !== '0 2px 8px rgba(0,0,0,0.3)') {
                              // Append Circle of Fifths glow to existing chord tone glow
                              finalBoxShadow = `${glowColor}, 0 0 ${circleOf5thsGlowWidth}px ${circleOf5thsGlowWidth / 2}px ${rgbaColor}`;
                            } else {
                              // Only Circle of Fifths glow
                              finalBoxShadow = `0 0 0 2px ${circleOf5thsGlowColor}, 0 0 ${circleOf5thsGlowWidth}px ${circleOf5thsGlowWidth / 2}px ${rgbaColor}`;
                            }
                          }

                          // Add triad ring if this is a triad note on a scale fretboard
                          if (isTriadNote) {
                            // Add a colorful ring around the scale note
                            const triadRingGlow = `0 0 0 6px ${hexToRgba(triadRingColor, 0.7)}, 0 0 12px ${hexToRgba(triadRingColor, 0.5)}`;

                            // Layer triad ring on top of existing glows
                            if (finalBoxShadow !== '0 2px 8px rgba(0,0,0,0.3)') {
                              finalBoxShadow = `${finalBoxShadow}, ${triadRingGlow}`;
                            } else {
                              finalBoxShadow = triadRingGlow;
                            }
                          }

                          // ── Triad Arc Band + Focus Mode rendering ──────────────
                          const normalizedNote = normalizeNoteToSharp(notePos.note);

                          // Focus mode: determine if this note is in the spotlighted triad
                          let circleFill = NOTE_COLORS[notePos.note] ?? '#6b7280';
                          let circleOpacity = 1;
                          let circleFilter = 'none';
                          let letterNudge = false;
                          let circleDiameter = notePos.isRoot ? 32 : 28;

                          if (triadFocusOn && focusTriad) {
                            const inFocusTriad = focusTriad.notes.includes(normalizedNote);
                            if (inFocusTriad) {
                              // Keep each note's true identity color (circleFill already set above)
                              // Bump root note size +12%
                              if (normalizedNote === normalizeNoteToSharp(focusTriad.rootNote)) {
                                circleDiameter = 36;
                              }
                              // In Colors mode: overlay a solid triad-degree ring so these notes
                              // stand out clearly against the other colorful non-triad dots
                              if (nonTriadColorMode) {
                                borderColor = `3px solid ${focusTriad.color}`;
                                finalBoxShadow = `0 0 0 4px ${hexToRgba(focusTriad.color, 0.55)}, 0 0 12px ${hexToRgba(focusTriad.color, 0.35)}`;
                              }
                            } else {
                              // Use slider-driven opacity; desaturate in B&W mode, keep colors in Colors mode
                              circleOpacity = nonTriadOpacity / 100;
                              circleFilter = nonTriadColorMode ? 'none' : 'saturate(0) brightness(0.75)';
                            }
                          } else if (showTriadArcBands && (notePos.triadMembership?.length ?? 0) > 0) {
                            letterNudge = true;
                          }

                          // Bg notes dimming when a chord-tone pattern is active (Triads in Scale off)
                          if (!triadFocusOn && patternBgNotesOpacity < 100 && selectedChordNotes && selectedChordNotes.length > 0) {
                            const isInPattern = selectedChordNotes.some(n => normalizeNoteToSharp(n) === normalizedNote);
                            if (!isInPattern) {
                              circleOpacity = patternBgNotesOpacity / 100;
                            }
                          }

                          const circleSize = `${circleDiameter}px`;

                          return (
                            <div
                              className="relative z-10 flex items-center justify-center font-semibold text-xs"
                              style={{
                                width: circleSize,
                                height: circleSize,
                                borderRadius: '50%',
                                backgroundColor: circleFill,
                                color: '#ffffff',
                                textShadow: (triadFocusOn && focusTriad && focusTriad.notes.includes(normalizedNote))
                                  ? '0 1px 3px rgba(0,0,0,0.8)'
                                  : undefined,
                                boxShadow: finalBoxShadow,
                                border: borderColor,
                                opacity: circleOpacity,
                                filter: circleFilter,
                                position: 'relative',
                                overflow: (showTriadArcBands && !triadFocusOn) ? 'hidden' : 'visible',
                                transition: 'all 150ms ease-out',
                              }}
                            >
                              <span style={{ transform: letterNudge ? 'translateY(-3px)' : 'none', display: 'block' }}>
                                {getNoteDisplayName(notePos.note)}
                              </span>
                              {showTriadArcBands && !triadFocusOn && (notePos.triadMembership?.length ?? 0) > 0 && (
                                <TriadArcBandSegments
                                  membership={notePos.triadMembership!}
                                  circleDiameter={circleDiameter}
                                />
                              )}
                            </div>
                          );
                        })()}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
            })}

            {/* Continuous Vertical Fret Lines */}
            <div className="absolute left-0 top-0 bottom-0 pointer-events-none" style={{ paddingLeft: '30px' }}>
              {Array.from({ length: fretCount + 1 }, (_, fretIndex) => {
                if (fretIndex === 0) return null; // Skip the nut
                return (
                  <div
                    key={`fret-line-${fretIndex}`}
                    className="absolute top-0 bottom-0"
                    style={{
                      left: `${40 + (fretIndex - 1) * 70 + 35}px`, // 40px for nut + fret spacing + center offset
                      width: '2px',
                      background: theme.fretboardFret,
                    }}
                  />
                );
              })}
            </div>
          </div>

          {/* Middle Fret Dots */}
          {showMiddleDots && (
            <div className="absolute left-0 right-0 pointer-events-none" style={{ paddingLeft: '30px', paddingRight: '30px', top: '50%', transform: 'translateY(-50%)' }}>
              <div className="flex">
                {Array.from({ length: fretCount + 1 }, (_, i) => (
                  <div
                    key={`middle-dots-${i}`}
                    className="flex items-center justify-center"
                    style={{
                      width: i === 0 ? '40px' : '70px',
                      minWidth: i === 0 ? '40px' : '70px',
                      transform: i === 0 ? 'none' : 'translateX(35px)',
                      height: '32px',
                    }}
                  >
                    {FRET_MARKERS.includes(i) && (
                      <div className="flex flex-col gap-2 items-center">
                        <div
                          style={{
                            width: DOUBLE_MARKERS.includes(i) ? '10px' : '14px',
                            height: DOUBLE_MARKERS.includes(i) ? '10px' : '14px',
                            borderRadius: '50%',
                            background: fretDotColor || theme.fretMarker,
                            opacity: 0.8,
                          }}
                        />
                        {DOUBLE_MARKERS.includes(i) && (
                          <div
                            style={{
                              width: '10px',
                              height: '10px',
                              borderRadius: '50%',
                              background: fretDotColor || theme.fretMarker,
                              opacity: 0.8,
                            }}
                          />
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="absolute left-0 right-0" style={{ paddingLeft: '30px', paddingRight: '30px', bottom: '-32px' }}>
            {showBottomFretDots && (
              <div className="flex mb-2">
                {Array.from({ length: fretCount + 1 }, (_, i) => (
                  <div
                    key={`dots-${i}`}
                    className="flex items-center justify-center"
                    style={{
                      width: i === 0 ? '40px' : '70px',
                      minWidth: i === 0 ? '40px' : '70px',
                      transform: i === 0 ? 'none' : 'translateX(35px)',
                      height: '32px',
                    }}
                  >
                    {FRET_MARKERS.includes(i) && (
                      <div className="flex flex-col gap-2 items-center">
                        <div
                          style={{
                            width: DOUBLE_MARKERS.includes(i) ? '12px' : '16px',
                            height: DOUBLE_MARKERS.includes(i) ? '12px' : '16px',
                            borderRadius: '50%',
                            background: fretDotColor || theme.fretMarker,
                          }}
                        />
                        {DOUBLE_MARKERS.includes(i) && (
                          <div
                            style={{
                              width: '12px',
                              height: '12px',
                              borderRadius: '50%',
                              background: fretDotColor || theme.fretMarker,
                            }}
                          />
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            {showBottomFretNumbers && (
              <div className="flex">
                {Array.from({ length: fretCount + 1 }, (_, i) => (
                  <div
                    key={`numbers-${i}`}
                    className="flex items-center justify-center"
                    style={{
                      width: i === 0 ? '40px' : '70px',
                      minWidth: i === 0 ? '40px' : '70px',
                      transform: i === 0 ? 'none' : 'translateX(35px)',
                    }}
                  >
                    <div className="text-xl font-medium" style={{ color: theme.textSecondary }}>
                      {i}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Voicing Outline SVG Overlay */}
          {voicingOutlineGroups && voicingOutlineGroups.length > 0 && (() => {
            // Grid constants matching the fretboard layout
            const TOP_PAD = 40;
            const LEFT_PAD = 20;
            const STRING_LABEL_W = 40; // w-8(32) + mr-2(8)
            const ROW_H = 56; // 44px cell + 12px mb-3
            const FRET0_W = 40;
            const FRET_W = 70;
            const NOTE_R = 22; // half of max note dot size (32px) + 6px padding

            const noteX = (fretIndex: number): number => {
              if (fretIndex === 0) return LEFT_PAD + STRING_LABEL_W + FRET0_W / 2;
              return LEFT_PAD + STRING_LABEL_W + FRET0_W + (fretIndex - 1) * FRET_W + FRET_W / 2;
            };

            const noteY = (stringIndex: number): number => {
              const displayIdx = isInverted ? (tuning.length - 1 - stringIndex) : stringIndex;
              return TOP_PAD + displayIdx * ROW_H + 22;
            };

            return (
              <svg
                className="absolute inset-0 pointer-events-none"
                style={{ zIndex: 6, overflow: 'visible' }}
                width="100%"
                height="100%"
              >
                {voicingOutlineGroups.map((group, gIdx) => {
                  if (!group.positions || group.positions.length === 0) return null;
                  const xs = group.positions.map(p => noteX(p.fretIndex));
                  const ys = group.positions.map(p => noteY(p.stringIndex));
                  const minX = Math.min(...xs) - NOTE_R;
                  const minY = Math.min(...ys) - NOTE_R;
                  const maxX = Math.max(...xs) + NOTE_R;
                  const maxY = Math.max(...ys) + NOTE_R;
                  const w = maxX - minX;
                  const h = maxY - minY;
                  return (
                    <g key={gIdx}>
                      <rect
                        x={minX} y={minY} width={w} height={h}
                        rx={12} ry={12}
                        fill={`${group.color}14`}
                        stroke={group.color}
                        strokeWidth={2.5}
                        strokeDasharray="6 3"
                        opacity={0.85}
                      />
                      <text
                        x={minX + 8} y={minY - 5}
                        fontSize={11} fontWeight={700}
                        fill={group.color}
                        style={{ fontFamily: 'sans-serif' }}
                      >
                        {group.label}
                      </text>
                    </g>
                  );
                })}
              </svg>
            );
          })()}

          {/* Navigation Arrows Overlay */}
          {showNavigationArrows && anchorChordPositions && anchorChordPositions.length > 0 && onNavigatePrevious && onNavigateNext && (() => {
            // Use the anchor chord positions (displayed scale shape) to determine arrow placement
            // This ensures arrows are positioned relative to the current scale shape, not all fretboard notes
            const shapeNotes = anchorChordPositions.map(pos => ({
              fret: pos.fret,
              string: pos.string
            }));

            // Calculate the actual horizontal pixel position for each note
            const calculateNoteHorizontalPosition = (fret: number) => {
              if (fret === 0) {
                return 40 + 20; // Center of open string area
              }
              return 40 + 40 + (fret - 1) * 70 + 35; // Center of the fret
            };

            // Get horizontal positions of the scale shape notes
            const horizontalPositions = shapeNotes.map(note =>
              calculateNoteHorizontalPosition(note.fret)
            );

            const leftmostPosition = Math.min(...horizontalPositions);
            const rightmostPosition = Math.max(...horizontalPositions);

            // Position arrows with 90px buffer from the scale shape boundaries
            // Subtract 14px (half the arrow width of 28px) to center the arrow
            const leftArrowLeft = leftmostPosition - 90 - 14;
            const rightArrowLeft = rightmostPosition + 90 - 14;

            // Position arrows vertically between strings 3 & 4 (index 2 and 3)
            // String 3 is at index 2, String 4 is at index 3
            const string3Index = isInverted ? (stringCount - 1 - 2) : 2;
            const string4Index = isInverted ? (stringCount - 1 - 3) : 3;
            const string3Top = string3Index * 47 + 22;
            const string4Top = string4Index * 47 + 22;
            const arrowTop = (string3Top + string4Top) / 2; // Center between strings 3 & 4

            return (
              <>
                {/* Left Arrow - Always show, wraps to last position */}
                <button
                  onClick={onNavigatePrevious}
                  className="absolute z-30 transition-all duration-200 hover:opacity-90 group"
                  style={{
                    top: `${arrowTop - 30}px`, // Center the 60px tall button
                    left: `${leftArrowLeft}px`,
                  }}
                  title="Previous chord position (wraps to last)"
                >
                  <div
                    className="flex items-center justify-center shadow-md"
                    style={{
                      width: '28px',
                      height: '60px',
                      borderRadius: '14px',
                      background: 'rgba(100, 116, 139, 0.7)', // Subtle slate gray with transparency
                      border: '1.5px solid rgba(148, 163, 184, 0.5)',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                    }}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="white"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="15 18 9 12 15 6" />
                    </svg>
                  </div>
                </button>

                {/* Right Arrow - Always show, wraps to first position */}
                <button
                  onClick={onNavigateNext}
                  className="absolute z-30 transition-all duration-200 hover:opacity-90 group"
                  style={{
                    top: `${arrowTop - 30}px`, // Center the 60px tall button
                    left: `${rightArrowLeft}px`,
                  }}
                  title="Next chord position (wraps to first)"
                >
                  <div
                    className="flex items-center justify-center shadow-md"
                    style={{
                      width: '28px',
                      height: '60px',
                      borderRadius: '14px',
                      background: 'rgba(100, 116, 139, 0.7)', // Subtle slate gray with transparency
                      border: '1.5px solid rgba(148, 163, 184, 0.5)',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                    }}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="white"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </div>
                </button>
              </>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
