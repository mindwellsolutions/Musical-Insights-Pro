'use client';

import { useState, useEffect, useRef } from 'react';
import { ThemeConfig } from '@/lib/themes';
import { NOTE_COLORS } from '@/lib/musicTheory';
import { getDisplayScaleNames } from '@/lib/musicalCompatibility';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useNoteDisplay } from '@/hooks/useNoteDisplay';
import {
  getMajorKeyChords,
  getMinorKeyChords,
  getCirclePosition,
  getChordSymbol,
  type KeyChord
} from '@/lib/music-theory/circle-of-fifths-chords';

// Normalize note names for comparison (convert flats to sharps)
const normalizeNote = (note: string): string => {
  const flatToSharp: Record<string, string> = {
    'Db': 'C#',
    'Eb': 'D#',
    'Gb': 'F#',
    'Ab': 'G#',
    'Bb': 'A#',
  };
  return flatToSharp[note] || note;
};

interface CircleOf5thsProps {
  theme: ThemeConfig;
  currentKey?: string;
  currentScale?: string;
  detectedNote?: string | null;
  onKeySelect?: (key: string) => void;
  onScaleSelect?: (scale: string) => void;
  glowDuration?: number;
  // Fretboard visualization props
  showFretboardGlow?: boolean;
  onShowFretboardGlowChange?: (show: boolean) => void;
  fretboardGlowColor?: string;
  onFretboardGlowColorChange?: (color: string) => void;
  fretboardGlowOpacity?: number;
  onFretboardGlowOpacityChange?: (opacity: number) => void;
  fretboardGlowWidth?: number;
  onFretboardGlowWidthChange?: (width: number) => void;
  // Compact mode for header placement
  compactMode?: boolean;
  // Hide controls for modal mode
  hideControls?: boolean;
  // Custom size for the circle
  circleSize?: number;
  // Scale factor for note circles (1.0 = default, 1.5 = 50% larger)
  noteCircleScale?: number;
  // Previous section key for highlighting adjacent 5ths
  previousSectionKey?: string | null;
}

type ColorMode = 'notes' | 'relationships' | 'modes';

const CIRCLE_KEYS = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'C#', 'G#', 'D#', 'A#', 'F'];
const RELATIVE_MINORS = ['A', 'E', 'B', 'F#', 'C#', 'G#', 'D#', 'A#', 'F', 'C', 'G', 'D'];

// Relationship colors for harmonic analysis
const RELATIONSHIP_COLORS: Record<string, string> = {
  'tonic': '#22c55e',        // Green - Home
  'dominant': '#ef4444',     // Red - Tension
  'subdominant': '#3b82f6',  // Blue - Pre-dominant
  'relative': '#a855f7',     // Purple - Relative major/minor
  'parallel': '#f59e0b',     // Amber - Parallel major/minor
};

// Mode colors
const MODE_COLORS: Record<string, string> = {
  'major': '#22c55e',        // Green - Bright
  'minor': '#3b82f6',        // Blue - Dark
  'mixolydian': '#f59e0b',   // Amber - Bluesy
  'dorian': '#8b5cf6',       // Purple - Jazz
  'lydian': '#ec4899',       // Pink - Dreamy
  'phrygian': '#ef4444',     // Red - Spanish
  'locrian': '#64748b',      // Slate - Diminished
};

export default function CircleOf5ths({
  theme,
  currentKey = 'C',
  currentScale = 'Ionian (Major)',
  detectedNote = null,
  onKeySelect,
  onScaleSelect,
  glowDuration = 1000,
  showFretboardGlow = false,
  onShowFretboardGlowChange,
  fretboardGlowColor = '#667eea',
  onFretboardGlowColorChange,
  fretboardGlowOpacity = 60,
  onFretboardGlowOpacityChange,
  fretboardGlowWidth = 20,
  onFretboardGlowWidthChange,
  compactMode = false,
  hideControls = false,
  circleSize = 300,
  noteCircleScale = 1.0,
  previousSectionKey = null,
}: CircleOf5thsProps) {
  const { getNoteDisplayName } = useNoteDisplay();
  const [colorMode, setColorMode] = useLocalStorage<ColorMode>('circle-of-5ths-color-mode', 'notes');
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  const [displayedNote, setDisplayedNote] = useState<string | null>(null);
  const glowTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  // Settings expansion state - persisted in localStorage
  const [isSettingsExpanded, setIsSettingsExpanded] = useLocalStorage('circle-of-5ths-settings-expanded', false);
  // Auto-expand by default (changed from true to false), remember state in localStorage
  const [isCollapsed, setIsCollapsed] = useLocalStorage('circle-of-5ths-collapsed', false);
  // In compact mode, collapse fretboard glow and scale/mode sections by default
  const [isFretboardGlowCollapsed, setIsFretboardGlowCollapsed] = useState(compactMode);
  const [isScaleModeCollapsed, setIsScaleModeCollapsed] = useState(compactMode);
  // Scale/Mode filter state - defaults to true (Basic mode) and persists in localStorage
  const [showBasicModesOnly, setShowBasicModesOnly] = useLocalStorage('guitar-app-scale-mode-basic-only', true);

  // State for selected key and its chords
  const [selectedKey, setSelectedKey] = useState<{ note: string; isMajor: boolean } | null>(null);
  const [keyChords, setKeyChords] = useState<KeyChord[]>([]);

  // Chord Display Mode: Traditional (all 7 positions) vs Compact (4,1,5,2,6,3 trick)
  const [chordDisplayMode, setChordDisplayMode] = useLocalStorage<'traditional' | 'compact'>('circle-of-5ths-chord-display-mode', 'traditional');

  // Visual Style: Circles (colorful floating) vs Wedges (connected segments)
  const [visualStyle, setVisualStyle] = useLocalStorage<'circles' | 'wedges'>('circle-of-5ths-visual-style', 'circles');

  // Handle detected note with delay for glow effect
  useEffect(() => {
    if (detectedNote) {
      // Normalize the detected note (convert flats to sharps for comparison)
      const normalized = normalizeNote(detectedNote);
      setDisplayedNote(normalized);

      // Clear any existing timeout
      if (glowTimeoutRef.current) {
        clearTimeout(glowTimeoutRef.current);
      }

      // Set timeout to clear the glow after the specified duration
      glowTimeoutRef.current = setTimeout(() => {
        setDisplayedNote(null);
      }, glowDuration);
    } else {
      // Clear immediately if no note detected
      setDisplayedNote(null);
      if (glowTimeoutRef.current) {
        clearTimeout(glowTimeoutRef.current);
      }
    }

    return () => {
      if (glowTimeoutRef.current) {
        clearTimeout(glowTimeoutRef.current);
      }
    };
  }, [detectedNote, glowDuration]);

  // Get adjacent keys (5ths) for the previous section key
  const getAdjacentKeys = (key: string | null): string[] => {
    if (!key) return [];

    // Normalize the key to match CIRCLE_KEYS format
    const normalizedKey = normalizeNote(key);
    const index = CIRCLE_KEYS.indexOf(normalizedKey);

    if (index === -1) return [];

    // Get the keys on either side (wrapping around the circle)
    const prevIndex = (index - 1 + CIRCLE_KEYS.length) % CIRCLE_KEYS.length;
    const nextIndex = (index + 1) % CIRCLE_KEYS.length;

    return [CIRCLE_KEYS[prevIndex], CIRCLE_KEYS[nextIndex]];
  };

  const adjacentKeys = getAdjacentKeys(previousSectionKey);

  // Handle key selection for chord display
  const handleKeyClick = (key: string, isMajor: boolean) => {
    // If clicking the same key, deselect it
    if (selectedKey?.note === key && selectedKey?.isMajor === isMajor) {
      setSelectedKey(null);
      setKeyChords([]);
    } else {
      // Select new key and calculate its chords
      setSelectedKey({ note: key, isMajor });
      const chords = isMajor ? getMajorKeyChords(key) : getMinorKeyChords(key);
      setKeyChords(chords);
    }

    // Also call the original onKeySelect if provided
    onKeySelect?.(key);
  };

  // Check if a note is highlighted as part of the selected key's chords
  const getChordHighlight = (note: string, isMajor: boolean): { isHighlighted: boolean; position?: number; numeral?: string; showAsMinor?: boolean } => {
    if (!selectedKey) return { isHighlighted: false };

    // Traditional Chord Display: Show all 7 positions in their respective circles
    if (chordDisplayMode === 'traditional') {
      if (selectedKey.isMajor !== isMajor) return { isHighlighted: false };

      const chord = keyChords.find(c => c.rootNote === note);
      if (chord) {
        return { isHighlighted: true, position: chord.position, numeral: chord.numeral };
      }
    } else {
      // Compact Chord Display: Show only positions 4,1,5,2,6,3
      // Only works for major keys
      if (!selectedKey.isMajor) {
        // For minor keys, use traditional display
        if (isMajor) return { isHighlighted: false };
        const chord = keyChords.find(c => c.rootNote === note);
        if (chord) {
          return { isHighlighted: true, position: chord.position, numeral: chord.numeral };
        }
      } else {
        // For major keys in compact mode:
        // Outer circle (major): positions 1, 4, 5
        // Inner circle (minor): positions 2, 3, 6 (shown WITHOUT 'm' suffix)
        const chord = keyChords.find(c => c.rootNote === note);
        if (chord) {
          // Only show positions 1,2,3,4,5,6 (exclude 7 - diminished)
          if (chord.position === 7) return { isHighlighted: false };

          if (isMajor) {
            // Show positions 1, 4, 5 on outer circle
            if (chord.position === 1 || chord.position === 4 || chord.position === 5) {
              return { isHighlighted: true, position: chord.position, numeral: chord.numeral };
            }
          } else {
            // Show positions 2, 3, 6 on inner circle WITHOUT 'm' suffix
            if (chord.position === 2 || chord.position === 3 || chord.position === 6) {
              return { isHighlighted: true, position: chord.position, numeral: chord.numeral, showAsMinor: false };
            }
          }
        }
      }
    }

    return { isHighlighted: false };
  };

  const getKeyColor = (key: string, index: number): string => {
    if (colorMode === 'notes') {
      // Use note colors from musicTheory
      return NOTE_COLORS[key] || '#888888';
    } else if (colorMode === 'relationships') {
      // Show harmonic relationships to current key
      if (key === currentKey) return RELATIONSHIP_COLORS.tonic;
      const currentIndex = CIRCLE_KEYS.indexOf(currentKey);
      const keyIndex = CIRCLE_KEYS.indexOf(key);
      const distance = (keyIndex - currentIndex + 12) % 12;

      if (distance === 7 || distance === 5) return RELATIONSHIP_COLORS.dominant;
      if (distance === 5 || distance === 7) return RELATIONSHIP_COLORS.subdominant;
      if (RELATIVE_MINORS[currentIndex] === key) return RELATIONSHIP_COLORS.relative;

      return '#888888';
    } else {
      // Mode colors
      return MODE_COLORS.major;
    }
  };

  // Calculate dimensions based on circleSize
  // Increased spacing between outer and inner circles for better visibility
  const centerX = circleSize / 2;
  const centerY = circleSize / 2;
  const radius = (circleSize / 300) * 125; // Increased from 120 to 125
  const innerRadius = (circleSize / 300) * 72; // Decreased from 80 to 72 for more spacing

  return (
    <div
      className="flex gap-4"
      style={{
        background: theme.bgSecondary,
        border: `1px solid ${theme.border}`,
        width: 'fit-content',
        maxWidth: '420px',
      }}
    >
      {/* Main Circle Container */}
      <div className="rounded-lg p-4" style={{ width: '100%' }}>
      {/* Header with Title and Settings Toggle */}
      {!hideControls && (
      <div className="mb-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold" style={{ color: theme.textPrimary }}>
            Circle of 5ths
          </h3>

          {/* Settings Dropdown Arrow Button */}
          {!isCollapsed && (
            <button
              onClick={() => setIsSettingsExpanded(!isSettingsExpanded)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all hover:opacity-80"
              style={{
                background: theme.bgTertiary,
                border: `1px solid ${theme.border}`,
                color: theme.textPrimary,
              }}
              title={isSettingsExpanded ? "Hide Settings" : "Show Settings"}
            >
              <span className="text-xs font-medium">Settings</span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  transform: isSettingsExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s ease',
                }}
              >
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>
          )}
        </div>

        {/* Collapsible Settings Area */}
        {!isCollapsed && isSettingsExpanded && (
          <div
            className="p-3 rounded-lg space-y-3"
            style={{
              background: theme.bgTertiary,
              border: `1px solid ${theme.border}`,
            }}
          >
            {/* Note Colors Dropdown */}
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: theme.textSecondary }}>
                Note Colors
              </label>
              <select
                value={colorMode}
                onChange={(e) => setColorMode(e.target.value as ColorMode)}
                className="w-full px-2 py-1.5 rounded text-xs font-medium transition-all"
                style={{
                  background: theme.bgSecondary,
                  color: theme.textPrimary,
                  border: `1px solid ${theme.border}`,
                }}
              >
                <option value="notes">Note Colors</option>
                <option value="relationships">Relationships</option>
              </select>
            </div>

            {/* Chords Display Mode */}
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: theme.textSecondary }}>
                Chords
              </label>
              <div
                className="flex rounded overflow-hidden w-full"
                style={{
                  border: `1px solid ${theme.border}`,
                }}
              >
                <button
                  onClick={() => setChordDisplayMode('traditional')}
                  className="flex-1 px-3 py-1.5 text-xs font-medium transition-all"
                  style={{
                    background: chordDisplayMode === 'traditional' ? theme.accentPrimary : theme.bgSecondary,
                    color: chordDisplayMode === 'traditional' ? '#ffffff' : theme.textPrimary,
                    borderRight: `1px solid ${theme.border}`,
                  }}
                  title="Show all 7 chord positions"
                >
                  Traditional
                </button>
                <button
                  onClick={() => setChordDisplayMode('compact')}
                  className="flex-1 px-3 py-1.5 text-xs font-medium transition-all"
                  style={{
                    background: chordDisplayMode === 'compact' ? theme.accentPrimary : theme.bgSecondary,
                    color: chordDisplayMode === 'compact' ? '#ffffff' : theme.textPrimary,
                  }}
                  title="Show 4,1,5,2,6,3 positions"
                >
                  Compact
                </button>
              </div>
            </div>

            {/* Visual Style */}
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: theme.textSecondary }}>
                Style
              </label>
              <div
                className="flex rounded overflow-hidden w-full"
                style={{
                  border: `1px solid ${theme.border}`,
                }}
              >
                <button
                  onClick={() => setVisualStyle('circles')}
                  className="flex-1 px-3 py-1.5 text-xs font-medium transition-all"
                  style={{
                    background: visualStyle === 'circles' ? theme.accentPrimary : theme.bgSecondary,
                    color: visualStyle === 'circles' ? '#ffffff' : theme.textPrimary,
                    borderRight: `1px solid ${theme.border}`,
                  }}
                  title="Colorful floating circles"
                >
                  Circles
                </button>
                <button
                  onClick={() => setVisualStyle('wedges')}
                  className="flex-1 px-3 py-1.5 text-xs font-medium transition-all"
                  style={{
                    background: visualStyle === 'wedges' ? theme.accentPrimary : theme.bgSecondary,
                    color: visualStyle === 'wedges' ? '#ffffff' : theme.textPrimary,
                  }}
                  title="Connected wedge segments"
                >
                  Wedges
                </button>
              </div>
            </div>

            {/* Fretboard Glow Toggle */}
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: theme.textSecondary }}>
                Fretboard Glow
              </label>
              <div
                className="flex items-center justify-between px-3 py-2 rounded-lg"
                style={{
                  background: showFretboardGlow ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : theme.bgSecondary,
                  border: `1px solid ${showFretboardGlow ? '#667eea' : theme.border}`,
                }}
              >
                <span className="text-xs font-medium" style={{ color: showFretboardGlow ? '#ffffff' : theme.textPrimary }}>
                  {showFretboardGlow ? 'Enabled' : 'Disabled'}
                </span>
                <button
                  onClick={() => onShowFretboardGlowChange?.(!showFretboardGlow)}
                  className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                  style={{
                    background: showFretboardGlow ? '#ffffff' : 'rgba(255,255,255,0.3)',
                  }}
                >
                  <span
                    className="inline-block h-4 w-4 transform rounded-full transition-transform"
                    style={{
                      background: showFretboardGlow ? '#667eea' : '#ffffff',
                      transform: showFretboardGlow ? 'translateX(24px)' : 'translateX(4px)',
                    }}
                  />
                </button>
              </div>
            </div>

            {/* Advanced Fretboard Glow Settings - Show when glow is enabled */}
            {showFretboardGlow && (
              <>
                {/* Glow Color */}
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: theme.textSecondary }}>
                    Glow Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={fretboardGlowColor}
                      onChange={(e) => onFretboardGlowColorChange?.(e.target.value)}
                      className="w-10 h-8 rounded cursor-pointer"
                      style={{
                        border: `1px solid ${theme.border}`,
                      }}
                    />
                    <div
                      className="flex-1 px-2 py-1.5 rounded text-xs font-mono"
                      style={{
                        background: theme.bgSecondary,
                        color: theme.textPrimary,
                        border: `1px solid ${theme.border}`,
                      }}
                    >
                      {fretboardGlowColor}
                    </div>
                  </div>
                </div>

                {/* Opacity Slider */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-medium" style={{ color: theme.textSecondary }}>
                      Opacity
                    </label>
                    <span className="text-xs font-semibold" style={{ color: theme.textPrimary }}>
                      {fretboardGlowOpacity}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={fretboardGlowOpacity}
                    onChange={(e) => onFretboardGlowOpacityChange?.(parseInt(e.target.value))}
                    className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, ${theme.border} 0%, #667eea ${fretboardGlowOpacity}%, ${theme.border} ${fretboardGlowOpacity}%)`,
                    }}
                  />
                </div>

                {/* Glow Width Slider */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-medium" style={{ color: theme.textSecondary }}>
                      Glow Width
                    </label>
                    <span className="text-xs font-semibold" style={{ color: theme.textPrimary }}>
                      {fretboardGlowWidth}px
                    </span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="35"
                    step="1"
                    value={fretboardGlowWidth}
                    onChange={(e) => onFretboardGlowWidthChange?.(parseInt(e.target.value))}
                    className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, ${theme.border} 0%, #667eea ${((fretboardGlowWidth - 5) / 30) * 100}%, ${theme.border} ${((fretboardGlowWidth - 5) / 30) * 100}%)`,
                    }}
                  />
                </div>
              </>
            )}
          </div>
        )}

        {/* View/Collapse Button - Centered on its own line */}
        {isCollapsed ? (
          <div className="flex justify-center">
            <button
              onClick={() => setIsCollapsed(false)}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-medium transition-all hover:opacity-80"
              style={{
                background: theme.buttonPrimary,
                color: '#ffffff',
                border: `1px solid ${theme.buttonPrimary}`,
              }}
              title="Expand Circle of 5ths"
            >
              <span>View</span>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>
          </div>
        ) : (
          <div className="flex justify-center">
            <button
              onClick={() => setIsCollapsed(true)}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-medium transition-all hover:opacity-80"
              style={{
                background: theme.bgTertiary,
                color: theme.textPrimary,
                border: `1px solid ${theme.border}`,
              }}
              title="Collapse Circle of 5ths"
            >
              <span>Hide</span>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="18 15 12 9 6 15"/>
              </svg>
            </button>
          </div>
        )}
      </div>
      )}

      {!isCollapsed && (
        <>
      {/* SVG Circle */}
      <svg width={circleSize} height={circleSize} viewBox={`0 0 ${circleSize} ${circleSize}`}>
        <defs>
          <style>
            {`
              @keyframes pulse {
                0%, 100% {
                  opacity: 0.3;
                  transform: scale(1);
                }
                50% {
                  opacity: 0.8;
                  transform: scale(1.1);
                }
              }
              @keyframes slowGlow {
                0%, 100% {
                  opacity: 0.2;
                }
                50% {
                  opacity: 0.8;
                }
              }
            `}
          </style>
        </defs>
        {/* Outer circle background */}
        <circle
          cx={centerX}
          cy={centerY}
          r={radius + 10}
          fill="none"
          stroke={theme.border}
          strokeWidth="1"
        />

        {/* Wedges Visual Style: Traditional Circle of 5ths Wedge Outlines */}
        {visualStyle === 'wedges' && (
          <>
            {/* Outer ring wedges for major keys */}
            {CIRCLE_KEYS.map((key, index) => {
              const startAngle = (index * 30 - 90 - 15) * (Math.PI / 180);
              const endAngle = (index * 30 - 90 + 15) * (Math.PI / 180);

              // Create wedge path
              const outerR = radius + 10;
              const innerR = innerRadius + 10;

              const x1 = centerX + outerR * Math.cos(startAngle);
              const y1 = centerY + outerR * Math.sin(startAngle);
              const x2 = centerX + outerR * Math.cos(endAngle);
              const y2 = centerY + outerR * Math.sin(endAngle);
              const x3 = centerX + innerR * Math.cos(endAngle);
              const y3 = centerY + innerR * Math.sin(endAngle);
              const x4 = centerX + innerR * Math.cos(startAngle);
              const y4 = centerY + innerR * Math.sin(startAngle);

              const pathData = `
                M ${x1} ${y1}
                A ${outerR} ${outerR} 0 0 1 ${x2} ${y2}
                L ${x3} ${y3}
                A ${innerR} ${innerR} 0 0 0 ${x4} ${y4}
                Z
              `;

              return (
                <path
                  key={`wedge-major-${key}`}
                  d={pathData}
                  fill="none"
                  stroke={theme.border}
                  strokeWidth="1.5"
                  opacity={0.5}
                />
              );
            })}

            {/* Inner ring wedges for minor keys */}
            {RELATIVE_MINORS.map((key, index) => {
              const startAngle = (index * 30 - 90 - 15) * (Math.PI / 180);
              const endAngle = (index * 30 - 90 + 15) * (Math.PI / 180);

              // Create wedge path
              const outerR = innerRadius + 10;
              const innerR = 30; // Inner radius for center hole

              const x1 = centerX + outerR * Math.cos(startAngle);
              const y1 = centerY + outerR * Math.sin(startAngle);
              const x2 = centerX + outerR * Math.cos(endAngle);
              const y2 = centerY + outerR * Math.sin(endAngle);
              const x3 = centerX + innerR * Math.cos(endAngle);
              const y3 = centerY + innerR * Math.sin(endAngle);
              const x4 = centerX + innerR * Math.cos(startAngle);
              const y4 = centerY + innerR * Math.sin(startAngle);

              const pathData = `
                M ${x1} ${y1}
                A ${outerR} ${outerR} 0 0 1 ${x2} ${y2}
                L ${x3} ${y3}
                A ${innerR} ${innerR} 0 0 0 ${x4} ${y4}
                Z
              `;

              return (
                <path
                  key={`wedge-minor-${key}`}
                  d={pathData}
                  fill="none"
                  stroke={theme.border}
                  strokeWidth="1.5"
                  opacity={0.5}
                />
              );
            })}

            {/* Center circle */}
            <circle
              cx={centerX}
              cy={centerY}
              r={30}
              fill="none"
              stroke={theme.border}
              strokeWidth="1.5"
            />
          </>
        )}

        {/* Major keys (outer circle) */}
        {CIRCLE_KEYS.map((key, index) => {
          const angle = (index * 30 - 90) * (Math.PI / 180);
          const x = Math.round((centerX + radius * Math.cos(angle)) * 100) / 100;
          const y = Math.round((centerY + radius * Math.sin(angle)) * 100) / 100;
          const isActive = key === currentKey;
          const isHovered = key === hoveredKey;
          // Use normalized displayedNote for comparison
          const isDetected = displayedNote && key === displayedNote;
          // Check if this key is adjacent to the previous section key
          const isAdjacentToPrevious = adjacentKeys.includes(key);
          // Check if this key is part of the selected key's chords
          const chordHighlight = getChordHighlight(key, true);
          const isSelected = selectedKey?.note === key && selectedKey?.isMajor;

          return (
            <g key={key}>
              {/* Glow effect for detected note */}
              {isDetected && (
                <>
                  <circle
                    cx={x}
                    cy={y}
                    r={28 * noteCircleScale}
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth={3}
                    opacity={0.6}
                    style={{
                      animation: 'pulse 1.5s ease-in-out infinite',
                    }}
                  />
                  <circle
                    cx={x}
                    cy={y}
                    r={24 * noteCircleScale}
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    opacity={0.8}
                    style={{
                      animation: 'pulse 1.5s ease-in-out infinite 0.3s',
                    }}
                  />
                </>
              )}
              {/* Slow glow effect for adjacent keys to previous section */}
              {isAdjacentToPrevious && !isDetected && (
                <>
                  <circle
                    cx={x}
                    cy={y}
                    r={26 * noteCircleScale}
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    style={{
                      animation: 'slowGlow 3s ease-in-out infinite',
                    }}
                  />
                  <circle
                    cx={x}
                    cy={y}
                    r={22 * noteCircleScale}
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    style={{
                      animation: 'slowGlow 3s ease-in-out infinite 0.5s',
                    }}
                  />
                </>
              )}
              {/* Highlight ring for chords in selected key */}
              {chordHighlight.isHighlighted && !isSelected && (
                <circle
                  cx={x}
                  cy={y}
                  r={24 * noteCircleScale}
                  fill="none"
                  stroke="#22c55e"
                  strokeWidth={3}
                  opacity={0.8}
                />
              )}
              {/* Key circle - only show in Circles visual style */}
              {visualStyle === 'circles' && (
                <circle
                  cx={x}
                  cy={y}
                  r={isActive ? 22 * noteCircleScale : isHovered ? 20 * noteCircleScale : 18 * noteCircleScale}
                  fill={chordHighlight.isHighlighted ? '#22c55e' : getKeyColor(key, index)}
                  stroke={isSelected ? '#ffffff' : isActive ? '#ffffff' : isDetected ? '#f59e0b' : 'none'}
                  strokeWidth={isSelected ? 4 : isActive ? 3 : isDetected ? 2 : 0}
                  style={{
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    filter: isHovered ? 'brightness(1.2)' : isDetected ? 'brightness(1.3) drop-shadow(0 0 8px #f59e0b)' : 'none',
                  }}
                  onMouseEnter={() => setHoveredKey(key)}
                  onMouseLeave={() => setHoveredKey(null)}
                  onClick={() => handleKeyClick(key, true)}
                />
              )}

              {/* Wedges visual style: Clickable area */}
              {visualStyle === 'wedges' && (
                <circle
                  cx={x}
                  cy={y}
                  r={20 * noteCircleScale}
                  fill="transparent"
                  style={{
                    cursor: 'pointer',
                  }}
                  onMouseEnter={() => setHoveredKey(key)}
                  onMouseLeave={() => setHoveredKey(null)}
                  onClick={() => handleKeyClick(key, true)}
                />
              )}

              {/* Key label */}
              <text
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={visualStyle === 'wedges'
                  ? (chordHighlight.isHighlighted ? '#22c55e' : theme.textPrimary)
                  : '#ffffff'
                }
                fontSize={visualStyle === 'wedges' ? 16 * noteCircleScale : 14 * noteCircleScale}
                fontWeight="bold"
                style={{
                  pointerEvents: 'none',
                  userSelect: 'none',
                  textShadow: visualStyle === 'wedges' && chordHighlight.isHighlighted
                    ? '0 0 8px rgba(34, 197, 94, 0.5)'
                    : 'none'
                }}
              >
                {getNoteDisplayName(key)}
              </text>
              {/* Position number for chords in selected key - placed OUTSIDE the major circle */}
              {chordHighlight.isHighlighted && chordHighlight.position && (
                (() => {
                  // Calculate position outside the circle along the same angle
                  const positionRadius = radius + 30; // Place 30 units outside the circle
                  const posX = Math.round((centerX + positionRadius * Math.cos(angle)) * 100) / 100;
                  const posY = Math.round((centerY + positionRadius * Math.sin(angle)) * 100) / 100;

                  return (
                    <text
                      x={posX}
                      y={posY}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="#22c55e"
                      fontSize={14 * noteCircleScale}
                      fontWeight="bold"
                      style={{ pointerEvents: 'none', userSelect: 'none' }}
                    >
                      {chordHighlight.position}
                    </text>
                  );
                })()
              )}
            </g>
          );
        })}

        {/* Inner circle for relative minors */}
        {RELATIVE_MINORS.map((key, index) => {
          const angle = (index * 30 - 90) * (Math.PI / 180);
          const x = Math.round((centerX + innerRadius * Math.cos(angle)) * 100) / 100;
          const y = Math.round((centerY + innerRadius * Math.sin(angle)) * 100) / 100;
          const isHovered = key === hoveredKey;
          // Check if this key is part of the selected key's chords
          const chordHighlight = getChordHighlight(key, false);
          const isSelected = selectedKey?.note === key && !selectedKey?.isMajor;

          return (
            <g key={`minor-${key}`}>
              {/* Highlight ring for chords in selected key */}
              {chordHighlight.isHighlighted && !isSelected && visualStyle === 'circles' && (
                <circle
                  cx={x}
                  cy={y}
                  r={18 * noteCircleScale}
                  fill="none"
                  stroke="#22c55e"
                  strokeWidth={2.5}
                  opacity={0.8}
                />
              )}

              {/* Minor circle - only show in Circles visual style */}
              {visualStyle === 'circles' && (
                <circle
                  cx={x}
                  cy={y}
                  r={isHovered ? 16 * noteCircleScale : 14 * noteCircleScale}
                  fill={chordHighlight.isHighlighted ? '#22c55e' : (colorMode === 'notes' ? NOTE_COLORS[key] : '#6366f1')}
                  stroke={isSelected ? '#ffffff' : 'none'}
                  strokeWidth={isSelected ? 3 : 0}
                  style={{
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    filter: isHovered ? 'brightness(1.2)' : 'none',
                    opacity: 0.9,
                  }}
                  onMouseEnter={() => setHoveredKey(key)}
                  onMouseLeave={() => setHoveredKey(null)}
                  onClick={() => handleKeyClick(key, false)}
                />
              )}

              {/* Wedges visual style: Clickable area */}
              {visualStyle === 'wedges' && (
                <circle
                  cx={x}
                  cy={y}
                  r={16 * noteCircleScale}
                  fill="transparent"
                  style={{
                    cursor: 'pointer',
                  }}
                  onMouseEnter={() => setHoveredKey(key)}
                  onMouseLeave={() => setHoveredKey(null)}
                  onClick={() => handleKeyClick(key, false)}
                />
              )}

              <text
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={visualStyle === 'wedges'
                  ? (chordHighlight.isHighlighted ? '#22c55e' : theme.textPrimary)
                  : '#ffffff'
                }
                fontSize={visualStyle === 'wedges' ? 13 * noteCircleScale : 11 * noteCircleScale}
                fontWeight="600"
                style={{
                  pointerEvents: 'none',
                  userSelect: 'none',
                  textShadow: visualStyle === 'wedges' && chordHighlight.isHighlighted
                    ? '0 0 8px rgba(34, 197, 94, 0.5)'
                    : 'none'
                }}
              >
                {/* In Compact chord mode, show positions 2,3,6 WITHOUT 'm' suffix */}
                {chordDisplayMode === 'compact' && chordHighlight.isHighlighted && chordHighlight.showAsMinor === false
                  ? getNoteDisplayName(key)
                  : `${getNoteDisplayName(key)}m`
                }
              </text>
              {/* Position number for chords in selected key - placed INSIDE the minor circle */}
              {chordHighlight.isHighlighted && chordHighlight.position && (
                (() => {
                  // Calculate position inside the circle along the same angle
                  const positionRadius = innerRadius - 30; // Place 30 units inside the circle
                  const posX = Math.round((centerX + positionRadius * Math.cos(angle)) * 100) / 100;
                  const posY = Math.round((centerY + positionRadius * Math.sin(angle)) * 100) / 100;

                  return (
                    <text
                      x={posX}
                      y={posY}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="#22c55e"
                      fontSize={12 * noteCircleScale}
                      fontWeight="bold"
                      style={{ pointerEvents: 'none', userSelect: 'none' }}
                    >
                      {chordHighlight.position}
                    </text>
                  );
                })()
              )}
            </g>
          );
        })}

      </svg>

      {/* Legend for relationship mode */}
      {colorMode === 'relationships' && (
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
          {Object.entries(RELATIONSHIP_COLORS).map(([name, color]) => (
            <div key={name} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ background: color }}
              />
              <span style={{ color: theme.textSecondary }}>
                {name.charAt(0).toUpperCase() + name.slice(1)}
              </span>
            </div>
          ))}
        </div>
      )}
        </>
      )}
      </div>

      {/* Chord Information Panel - Now on the right side */}
      {selectedKey && keyChords.length > 0 && (
        <div
          className="p-4 rounded-lg flex-shrink-0"
          style={{
            background: theme.bgTertiary,
            border: `2px solid #22c55e`,
            width: '280px',
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-bold" style={{ color: theme.textPrimary }}>
              Chords in {getNoteDisplayName(selectedKey.note)}{selectedKey.isMajor ? ' Major' : ' Minor'}
            </h4>
            <button
              onClick={() => {
                setSelectedKey(null);
                setKeyChords([]);
              }}
              className="text-xs px-2 py-1 rounded hover:opacity-70 transition-opacity"
              style={{
                background: theme.bgSecondary,
                color: theme.textSecondary,
                border: `1px solid ${theme.border}`,
              }}
            >
              Clear
            </button>
          </div>

          {/* Chords in a flexible grid that wraps */}
          <div className="flex flex-wrap gap-2">
            {keyChords.map((chord) => (
              <div
                key={chord.position}
                className="flex flex-col items-center p-2 rounded"
                style={{
                  background: theme.bgSecondary,
                  border: `1px solid ${theme.border}`,
                  width: 'calc(25% - 6px)', // 4 items per row with gap
                }}
              >
                <div
                  className="text-xs font-bold mb-1"
                  style={{ color: '#22c55e' }}
                >
                  {chord.position}
                </div>
                <div
                  className="text-sm font-bold mb-1"
                  style={{ color: theme.textPrimary }}
                >
                  {getChordSymbol(chord.rootNote, chord.quality)}
                </div>
                <div
                  className="text-xs"
                  style={{ color: theme.textSecondary }}
                >
                  {chord.numeral}
                </div>
              </div>
            ))}
          </div>

          <div
            className="mt-3 p-2 rounded text-xs"
            style={{
              background: theme.bgSecondary,
              color: theme.textSecondary,
              border: `1px solid ${theme.border}`,
            }}
          >
            <strong>Circle of 5ths Trick:</strong> Position 1 is the selected key,
            Position 4 (IV) is one step left, and Position 5 (V) is one step right.
          </div>
        </div>
      )}
    </div>
  );
}

